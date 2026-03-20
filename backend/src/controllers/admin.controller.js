import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { badRequest, notFound } from "../utils/http-error.js";
import { parsePagination, paginationMeta } from "../utils/pagination.js";
import { createAuditLog } from "../services/audit.service.js";
import { resolveAnnouncementTargetUserIds } from "../services/announcement-target.service.js";
import {
  createInAppNotifications,
  sendPushToUsers,
} from "../services/notification.service.js";

export async function dashboard(_req, res, next) {
  try {
    const [students, lecturers, sections, announcements] = await prisma.$transaction([
      prisma.student.count(),
      prisma.lecturer.count(),
      prisma.section.count(),
      prisma.announcement.count(),
    ]);

    return res.json({
      students,
      lecturers,
      sections,
      announcements,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listDepartments(_req, res, next) {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return res.json({ data: departments });
  } catch (error) {
    return next(error);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const { code, name } = req.body;

    const existingCode = await prisma.department.findUnique({
      where: { code },
    });
    if (existingCode) {
      throw badRequest("Mã khoa đã tồn tại");
    }

    const department = await prisma.department.create({
      data: { code, name },
    });

    return res.status(201).json({ data: department });
  } catch (error) {
    return next(error);
  }
}

export async function updateDepartment(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    const department = await prisma.department.findUnique({
      where: { id: Number(id) },
    });
    if (!department) throw badRequest("Khoa không tồn tại");

    if (code && code !== department.code) {
      const existingCode = await prisma.department.findUnique({
        where: { code },
      });
      if (existingCode) throw badRequest("Mã khoa đã tồn tại");
    }

    const updated = await prisma.department.update({
      where: { id: Number(id) },
      data: { code, name },
    });

    return res.json({ data: updated });
  } catch (error) {
    return next(error);
  }
}

export async function deleteDepartment(req, res, next) {
  try {
    const { id } = req.params;

    // Constraints check
    const classCount = await prisma.classGroup.count({ where: { departmentId: Number(id) } });
    const lecturerCount = await prisma.lecturer.count({ where: { departmentId: Number(id) } });
    const studentCount = await prisma.student.count({ where: { departmentId: Number(id) } });

    if (classCount > 0 || lecturerCount > 0 || studentCount > 0) {
      throw badRequest("Không thể xóa Khoa đang có dữ liệu (Lớp sinh hoạt, Giảng viên, Sinh viên)");
    }

    await prisma.department.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Xóa khoa thành công" });
  } catch (error) {
    return next(error);
  }
}

export async function listClassGroups(req, res, next) {
  try {
    const parsedDepartmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
    const departmentId =
      typeof parsedDepartmentId === "number" && Number.isFinite(parsedDepartmentId)
        ? parsedDepartmentId
        : undefined;

    const classGroups = await prisma.classGroup.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
      },
      include: {
        department: true,
      },
      orderBy: {
        code: "asc",
      },
    });

    return res.json({ data: classGroups });
  } catch (error) {
    return next(error);
  }
}

export async function listSections(req, res, next) {
  try {
    const semester = req.query.semester;

    const sections = await prisma.section.findMany({
      where: {
        ...(semester ? { semester } : {}),
      },
      select: {
        id: true,
        code: true,
        semester: true,
        academicYear: true,
        classGroup: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            exams: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.json({ data: sections });
  } catch (error) {
    return next(error);
  }
}

export async function listSubjects(req, res, next) {
  try {
    const parsedDepartmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
    const departmentId =
      typeof parsedDepartmentId === "number" && Number.isFinite(parsedDepartmentId)
        ? parsedDepartmentId
        : undefined;

    const subjects = await prisma.subject.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
      },
      include: {
        department: true,
      },
      orderBy: {
        code: "asc",
      },
    });

    return res.json({ data: subjects });
  } catch (error) {
    return next(error);
  }
}

export async function createClassGroup(req, res, next) {
  try {
    const created = await prisma.classGroup.create({
      data: {
        code: req.body.code,
        name: req.body.name,
        departmentId: req.body.departmentId,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_CLASS_GROUP",
      entity: "ClassGroup",
      entityId: created.id,
    });

    return res.status(201).json({ data: created });
  } catch (error) {
    return next(error);
  }
}

export async function updateClassGroup(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, departmentId } = req.body;

    const classGroup = await prisma.classGroup.findUnique({
      where: { id: Number(id) },
    });
    if (!classGroup) throw badRequest("Lớp sinh hoạt không tồn tại");

    if (code && code !== classGroup.code) {
      const existingCode = await prisma.classGroup.findUnique({
        where: { code },
      });
      if (existingCode) throw badRequest("Mã lớp sinh hoạt đã tồn tại");
    }

    const updated = await prisma.classGroup.update({
      where: { id: Number(id) },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(departmentId && { departmentId }),
      },
    });

    return res.json({ data: updated });
  } catch (error) {
    return next(error);
  }
}

export async function deleteClassGroup(req, res, next) {
  try {
    const { id } = req.params;

    // Constraints check
    const studentCount = await prisma.student.count({ where: { classGroupId: Number(id) } });
    const sectionCount = await prisma.section.count({ where: { classGroupId: Number(id) } });

    if (studentCount > 0 || sectionCount > 0) {
      throw badRequest("Không thể xóa Lớp sinh hoạt đang có Sinh viên hoặc Học phần");
    }

    await prisma.classGroup.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Xóa lớp sinh hoạt thành công" });
  } catch (error) {
    return next(error);
  }
}

export async function createSubject(req, res, next) {
  try {
    const created = await prisma.subject.create({
      data: {
        code: req.body.code,
        name: req.body.name,
        credits: req.body.credits,
        departmentId: req.body.departmentId,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_SUBJECT",
      entity: "Subject",
      entityId: created.id,
    });

    return res.status(201).json({ data: created });
  } catch (error) {
    return next(error);
  }
}

export async function updateSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, credits, departmentId } = req.body;

    const subject = await prisma.subject.findUnique({
      where: { id: Number(id) },
    });
    if (!subject) throw badRequest("Môn học không tồn tại");

    if (code && code !== subject.code) {
      const existingCode = await prisma.subject.findUnique({
        where: { code },
      });
      if (existingCode) throw badRequest("Mã môn học đã tồn tại");
    }

    const updated = await prisma.subject.update({
      where: { id: Number(id) },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(credits && { credits }),
        ...(departmentId && { departmentId }),
      },
    });

    return res.json({ data: updated });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSubject(req, res, next) {
  try {
    const { id } = req.params;

    // Constraints check
    const sectionCount = await prisma.section.count({ where: { subjectId: Number(id) } });

    if (sectionCount > 0) {
      throw badRequest("Không thể xóa Môn học đang có Học phần");
    }

    await prisma.subject.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Xóa môn học thành công" });
  } catch (error) {
    return next(error);
  }
}

export async function createSection(req, res, next) {
  try {
    const created = await prisma.section.create({
      data: {
        code: req.body.code,
        subjectId: req.body.subjectId,
        classGroupId: req.body.classGroupId ?? null,
        semester: req.body.semester,
        academicYear: req.body.academicYear,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_SECTION",
      entity: "Section",
      entityId: created.id,
    });

    return res.status(201).json({ data: created });
  } catch (error) {
    return next(error);
  }
}

export async function updateSection(req, res, next) {
  try {
    const { id } = req.params;
    const { code, subjectId, classGroupId, semester, academicYear } = req.body;

    const section = await prisma.section.findUnique({
      where: { id: Number(id) },
    });
    if (!section) throw badRequest("Học phần không tồn tại");

    if (code && code !== section.code) {
      const existingCode = await prisma.section.findUnique({
        where: { code },
      });
      if (existingCode) throw badRequest("Mã học phần đã tồn tại");
    }

    const updated = await prisma.section.update({
      where: { id: Number(id) },
      data: {
        ...(code && { code }),
        ...(subjectId && { subjectId }),
        ...(classGroupId !== undefined && { classGroupId }), // allow null
        ...(semester && { semester }),
        ...(academicYear && { academicYear }),
      },
    });

    return res.json({ data: updated });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSection(req, res, next) {
  try {
    const { id } = req.params;

    // Constraints check
    const enrollmentCount = await prisma.enrollment.count({ where: { sectionId: Number(id) } });
    const assignmentCount = await prisma.teachingAssignment.count({ where: { sectionId: Number(id) } });
    const scheduleCount = await prisma.schedule.count({ where: { sectionId: Number(id) } });
    const examCount = await prisma.exam.count({ where: { sectionId: Number(id) } });

    if (enrollmentCount > 0 || assignmentCount > 0 || scheduleCount > 0 || examCount > 0) {
      throw badRequest("Không thể xóa Học phần đã có Sinh viên, Giảng viên phân công, Lịch học, hoặc Lịch thi");
    }

    await prisma.section.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Xóa học phần thành công" });
  } catch (error) {
    return next(error);
  }
}

async function checkScheduleOverlap(sectionId, dayOfWeek, startTime, endTime, room, excludeScheduleId = null) {
  if (startTime >= endTime) {
    throw badRequest("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
  }

  const sectionOverlap = await prisma.schedule.findFirst({
    where: {
      sectionId,
      dayOfWeek,
      ...(excludeScheduleId && { id: { not: excludeScheduleId } }),
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (sectionOverlap) {
    throw badRequest("Học phần này đã có lịch học trùng thời gian.");
  }

  if (room) {
    const roomOverlap = await prisma.schedule.findFirst({
      where: {
        room,
        dayOfWeek,
        ...(excludeScheduleId && { id: { not: excludeScheduleId } }),
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      include: {
        section: {
          include: { subject: true },
        },
      },
    });

    if (roomOverlap) {
      const subjectName = roomOverlap.section.subject?.name || roomOverlap.section.code;
      throw badRequest(`Phòng ${room} đang bị trùng lịch (Đã xếp cho ${subjectName}, thứ ${dayOfWeek}, ${roomOverlap.startTime}-${roomOverlap.endTime}).`);
    }
  }
}

export async function createSchedule(req, res, next) {
  try {
    const { sectionId, dayOfWeek, startTime, endTime, room } = req.body;

    await checkScheduleOverlap(sectionId, dayOfWeek, startTime, endTime, room);

    const created = await prisma.schedule.create({
      data: {
        sectionId,
        dayOfWeek,
        startTime,
        endTime,
        room: room ?? null,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_SCHEDULE",
      entity: "Schedule",
      entityId: created.id,
      metadata: {
        sectionId: created.sectionId,
      },
    });

    return res.status(201).json({ data: created });
  } catch (error) {
    return next(error);
  }
}

export async function updateSchedule(req, res, next) {
  try {
    const { id } = req.params;
    const { sectionId, dayOfWeek, startTime, endTime, room } = req.body;

    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(id) },
    });
    if (!schedule) throw badRequest("Lịch học không tồn tại");

    const newSectionId = sectionId || schedule.sectionId;
    const newDayOfWeek = dayOfWeek || schedule.dayOfWeek;
    const newStartTime = startTime || schedule.startTime;
    const newEndTime = endTime || schedule.endTime;
    const newRoom = room !== undefined ? room : schedule.room;

    await checkScheduleOverlap(newSectionId, newDayOfWeek, newStartTime, newEndTime, newRoom, Number(id));

    const updated = await prisma.schedule.update({
      where: { id: Number(id) },
      data: {
        ...(sectionId && { sectionId }),
        ...(dayOfWeek && { dayOfWeek }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(room !== undefined && { room }),
      },
    });

    return res.json({ data: updated });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSchedule(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.schedule.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Xóa lịch học thành công" });
  } catch (error) {
    return next(error);
  }
}

export async function createExam(req, res, next) {
  try {
    const created = await prisma.exam.create({
      data: {
        sectionId: req.body.sectionId,
        examDate: req.body.examDate,
        room: req.body.room ?? null,
        type: req.body.type,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_EXAM",
      entity: "Exam",
      entityId: created.id,
      metadata: {
        sectionId: created.sectionId,
      },
    });

    return res.status(201).json({ data: created });
  } catch (error) {
    return next(error);
  }
}

export async function updateExam(req, res, next) {
  try {
    const { id } = req.params;
    const { sectionId, examDate, room, type } = req.body;

    const exam = await prisma.exam.findUnique({
      where: { id: Number(id) },
    });
    if (!exam) throw badRequest("Lịch thi không tồn tại");

    const updated = await prisma.exam.update({
      where: { id: Number(id) },
      data: {
        ...(sectionId && { sectionId }),
        ...(examDate && { examDate }),
        ...(room !== undefined && { room }),
        ...(type && { type }),
      },
    });

    return res.json({ data: updated });
  } catch (error) {
    return next(error);
  }
}

export async function deleteExam(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.exam.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Xóa lịch thi thành công" });
  } catch (error) {
    return next(error);
  }
}

export async function listSchedules(req, res, next) {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        section: {
          include: {
            subject: true,
            classGroup: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });
    return res.json({ data: schedules });
  } catch (error) {
    return next(error);
  }
}

export async function listExams(req, res, next) {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        section: {
          include: {
            subject: true,
            classGroup: true,
          },
        },
      },
      orderBy: {
        examDate: "asc",
      },
    });
    return res.json({ data: exams });
  } catch (error) {
    return next(error);
  }
}

export async function listStudents(req, res, next) {
  try {
    const { q } = req.query;
    const { page, pageSize, skip, take } = parsePagination(req.query);

    const where = q
      ? {
          OR: [
            { studentCode: { contains: q } },
            { user: { fullName: { contains: q } } },
            { user: { email: { contains: q } } },
          ],
        }
      : {};

    const [total, students] = await prisma.$transaction([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, isActive: true },
          },
          department: {
            select: { id: true, name: true },
          },
          classGroup: {
            select: { id: true, code: true, name: true },
          },
        },
        orderBy: {
          id: "desc",
        },
      }),
    ]);

    return res.json({
      data: students,
      pagination: paginationMeta({ page, pageSize, total }),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getStudentDetail(req, res, next) {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
        department: {
          select: { id: true, name: true },
        },
        classGroup: {
          select: { id: true, code: true, name: true },
        },
        enrollments: {
          include: {
            section: {
              include: {
                subject: {
                  select: { id: true, code: true, name: true, credits: true },
                },
                schedules: true,
              },
            },
            grade: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      throw notFound("Sinh viên không tồn tại");
    }

    // Fetch curriculum for the student's department
    const curriculum = await prisma.curriculum.findUnique({
      where: { departmentId: student.departmentId },
      include: {
        subjects: {
          include: {
            subject: {
              select: { id: true, code: true, name: true, credits: true },
            },
          },
          orderBy: [{ semester: "asc" }, { id: "asc" }],
        },
      },
    });

    return res.json({ data: { ...student, curriculum } });
  } catch (error) {
    return next(error);
  }
}

export async function createStudent(req, res, next) {
  try {
    const {
      email,
      password,
      fullName,
      studentCode,
      departmentId,
      classGroupId,
      phone,
      address,
    } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: "STUDENT",
        student: {
          create: {
            studentCode,
            departmentId,
            classGroupId,
            phone: phone ?? null,
            address: address ?? null,
          },
        },
      },
      include: {
        student: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_STUDENT",
      entity: "Student",
      entityId: created.student.id,
      metadata: { studentCode },
    });

    return res.status(201).json({
      id: created.student.id,
      studentCode: created.student.studentCode,
      userId: created.id,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const id = Number(req.params.id);

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      throw notFound("Student not found");
    }

    const { fullName, departmentId, classGroupId, phone, address, isActive } = req.body;

    await prisma.$transaction([
      prisma.student.update({
        where: { id },
        data: {
          ...(departmentId ? { departmentId } : {}),
          ...(classGroupId ? { classGroupId } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(address !== undefined ? { address } : {}),
        },
      }),
      prisma.user.update({
        where: { id: student.userId },
        data: {
          ...(fullName ? { fullName } : {}),
          ...(typeof isActive === "boolean" ? { isActive } : {}),
        },
      }),
    ]);

    await createAuditLog({
      userId: req.user.id,
      action: "UPDATE_STUDENT",
      entity: "Student",
      entityId: id,
    });

    return res.json({ message: "Student updated" });
  } catch (error) {
    return next(error);
  }
}

export async function listLecturers(req, res, next) {
  try {
    const { q } = req.query;
    const { page, pageSize, skip, take } = parsePagination(req.query);

    const where = q
      ? {
          OR: [
            { lecturerCode: { contains: q } },
            { user: { fullName: { contains: q } } },
            { user: { email: { contains: q } } },
          ],
        }
      : {};

    const [total, lecturers] = await prisma.$transaction([
      prisma.lecturer.count({ where }),
      prisma.lecturer.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, isActive: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
        orderBy: {
          id: "desc",
        },
      }),
    ]);

    return res.json({
      data: lecturers,
      pagination: paginationMeta({ page, pageSize, total }),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getLecturerDetail(req, res, next) {
  try {
    const { id } = req.params;

    const lecturer = await prisma.lecturer.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
        department: {
          select: { id: true, name: true },
        },
        teachingAssignments: {
          include: {
            section: {
              include: {
                subject: {
                  select: { id: true, code: true, name: true, credits: true },
                },
                classGroup: {
                  select: { id: true, code: true },
                },
                schedules: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lecturer) {
      throw notFound("Giảng viên không tồn tại");
    }

    return res.json({ data: lecturer });
  } catch (error) {
    return next(error);
  }
}

export async function createLecturer(req, res, next) {
  try {
    const { email, password, fullName, lecturerCode, departmentId, title } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: "LECTURER",
        lecturer: {
          create: {
            lecturerCode,
            departmentId,
            title: title ?? null,
          },
        },
      },
      include: { lecturer: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_LECTURER",
      entity: "Lecturer",
      entityId: created.lecturer.id,
      metadata: { lecturerCode },
    });

    return res.status(201).json({
      id: created.lecturer.id,
      lecturerCode: created.lecturer.lecturerCode,
      userId: created.id,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateLecturer(req, res, next) {
  try {
    const id = Number(req.params.id);
    const lecturer = await prisma.lecturer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!lecturer) {
      throw notFound("Lecturer not found");
    }

    const { fullName, departmentId, title, isActive } = req.body;

    await prisma.$transaction([
      prisma.lecturer.update({
        where: { id },
        data: {
          ...(departmentId ? { departmentId } : {}),
          ...(title !== undefined ? { title } : {}),
        },
      }),
      prisma.user.update({
        where: { id: lecturer.userId },
        data: {
          ...(fullName ? { fullName } : {}),
          ...(typeof isActive === "boolean" ? { isActive } : {}),
        },
      }),
    ]);

    await createAuditLog({
      userId: req.user.id,
      action: "UPDATE_LECTURER",
      entity: "Lecturer",
      entityId: id,
    });

    return res.json({ message: "Lecturer updated" });
  } catch (error) {
    return next(error);
  }
}

export async function assignLecturer(req, res, next) {
  try {
    const { sectionId, lecturerId } = req.body;

    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) {
      throw notFound("Section not found");
    }

    const lecturer = await prisma.lecturer.findUnique({ where: { id: lecturerId } });
    if (!lecturer) {
      throw notFound("Lecturer not found");
    }

    const assignment = await prisma.teachingAssignment.upsert({
      where: {
        sectionId_lecturerId: {
          sectionId,
          lecturerId,
        },
      },
      update: {},
      create: {
        sectionId,
        lecturerId,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "ASSIGN_LECTURER",
      entity: "TeachingAssignment",
      entityId: assignment.id,
      metadata: { sectionId, lecturerId },
    });

    return res.status(201).json({ assignment });
  } catch (error) {
    return next(error);
  }
}

export async function createAnnouncement(req, res, next) {
  try {
    const { title, content, scope, departmentId, classGroupId, sectionId } = req.body;

    if (scope === "DEPARTMENT" && !departmentId) {
      throw badRequest("departmentId is required for DEPARTMENT scope");
    }

    if (scope === "CLASS" && !classGroupId) {
      throw badRequest("classGroupId is required for CLASS scope");
    }

    if (scope === "SECTION" && !sectionId) {
      throw badRequest("sectionId is required for SECTION scope");
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        scope,
        departmentId: departmentId ?? null,
        classGroupId: classGroupId ?? null,
        sectionId: sectionId ?? null,
        createdById: req.user.id,
      },
    });

    const userIds = await resolveAnnouncementTargetUserIds({
      scope,
      departmentId,
      classGroupId,
      sectionId,
    });

    await createInAppNotifications({
      userIds,
      title,
      body: content,
      announcementId: announcement.id,
    });

    const pushResult = await sendPushToUsers({
      userIds,
      title,
      body: content,
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_ANNOUNCEMENT",
      entity: "Announcement",
      entityId: announcement.id,
      metadata: {
        scope,
        targetUsers: userIds.length,
        pushResult,
      },
    });

    return res.status(201).json({
      announcement,
      targetUsers: userIds.length,
      pushResult,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createEnrollment(req, res, next) {
  try {
    const { studentId, sectionId } = req.body;

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw notFound("Student not found");
    }

    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) {
      throw notFound("Section not found");
    }

    const existing = await prisma.enrollment.findUnique({
      where: { sectionId_studentId: { sectionId, studentId } },
    });

    if (existing) {
      throw badRequest("Student is already enrolled in this section");
    }

    const enrollment = await prisma.enrollment.create({
      data: { sectionId, studentId },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_ENROLLMENT",
      entity: "Enrollment",
      entityId: enrollment.id,
      metadata: { studentId, sectionId },
    });

    return res.status(201).json({ data: enrollment });
  } catch (error) {
    return next(error);
  }
}

export async function getCurriculum(req, res, next) {
  try {
    const departmentId = Number(req.query.departmentId);
    if (!departmentId) {
      throw badRequest("departmentId is required");
    }

    const curriculum = await prisma.curriculum.findUnique({
      where: { departmentId },
      include: {
        subjects: {
          include: {
            subject: {
              select: { id: true, code: true, name: true, credits: true },
            },
          },
          orderBy: [{ semester: "asc" }, { id: "asc" }],
        },
        department: { select: { id: true, code: true, name: true } },
      },
    });

    return res.json({ data: curriculum });
  } catch (error) {
    return next(error);
  }
}

export async function upsertCurriculum(req, res, next) {
  try {
    const { departmentId, name, totalSemesters } = req.body;

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      throw notFound("Khoa không tồn tại");
    }

    const curriculum = await prisma.curriculum.upsert({
      where: { departmentId },
      update: { name, totalSemesters },
      create: { departmentId, name, totalSemesters },
      include: {
        subjects: {
          include: {
            subject: {
              select: { id: true, code: true, name: true, credits: true },
            },
          },
          orderBy: [{ semester: "asc" }, { id: "asc" }],
        },
        department: { select: { id: true, code: true, name: true } },
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "UPSERT_CURRICULUM",
      entity: "Curriculum",
      entityId: curriculum.id,
      metadata: { departmentId, name, totalSemesters },
    });

    return res.json({ data: curriculum });
  } catch (error) {
    return next(error);
  }
}

export async function addCurriculumSubject(req, res, next) {
  try {
    const { curriculumId, subjectId, semester } = req.body;

    const curriculum = await prisma.curriculum.findUnique({ where: { id: curriculumId } });
    if (!curriculum) {
      throw notFound("Chương trình đào tạo không tồn tại");
    }

    if (semester < 1 || semester > curriculum.totalSemesters) {
      throw badRequest(`Học kỳ phải từ 1 đến ${curriculum.totalSemesters}`);
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw notFound("Môn học không tồn tại");
    }

    const existing = await prisma.curriculumSubject.findUnique({
      where: { curriculumId_subjectId: { curriculumId, subjectId } },
    });
    if (existing) {
      throw badRequest("Môn học đã có trong chương trình đào tạo");
    }

    const created = await prisma.curriculumSubject.create({
      data: { curriculumId, subjectId, semester },
      include: {
        subject: {
          select: { id: true, code: true, name: true, credits: true },
        },
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "ADD_CURRICULUM_SUBJECT",
      entity: "CurriculumSubject",
      entityId: created.id,
      metadata: { curriculumId, subjectId, semester },
    });

    return res.status(201).json({ data: created });
  } catch (error) {
    return next(error);
  }
}

export async function removeCurriculumSubject(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.curriculumSubject.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Xóa môn học khỏi chương trình đào tạo thành công" });
  } catch (error) {
    return next(error);
  }
}

export async function enrollStudentBySemester(req, res, next) {
  try {
    const { studentId, semester, academicYear } = req.body;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { department: true },
    });
    if (!student) {
      throw notFound("Sinh viên không tồn tại");
    }

    const curriculum = await prisma.curriculum.findUnique({
      where: { departmentId: student.departmentId },
      include: {
        subjects: {
          where: { semester },
          include: { subject: true },
        },
      },
    });

    if (!curriculum) {
      throw badRequest("Khoa chưa có chương trình đào tạo");
    }

    if (curriculum.subjects.length === 0) {
      throw badRequest(`Chương trình đào tạo chưa có môn học cho kỳ ${semester}`);
    }

    const sections = await prisma.section.findMany({
      where: {
        subjectId: { in: curriculum.subjects.map((cs) => cs.subjectId) },
        classGroupId: student.classGroupId,
        semester: `HK${semester}`,
        academicYear,
      },
    });

    if (sections.length === 0) {
      throw badRequest(`Chưa có học phần nào mở cho kỳ ${semester}, năm học ${academicYear}, lớp của sinh viên`);
    }

    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        sectionId: { in: sections.map((s) => s.id) },
      },
    });
    const enrolledSectionIds = new Set(existingEnrollments.map((e) => e.sectionId));

    const newSections = sections.filter((s) => !enrolledSectionIds.has(s.id));

    if (newSections.length === 0) {
      throw badRequest("Sinh viên đã đăng ký tất cả học phần của kỳ này");
    }

    const enrollments = await prisma.$transaction(
      newSections.map((s) =>
        prisma.enrollment.create({
          data: { sectionId: s.id, studentId },
        })
      )
    );

    await prisma.student.update({
      where: { id: studentId },
      data: { currentSemester: semester },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "ENROLL_BY_SEMESTER",
      entity: "Enrollment",
      entityId: studentId,
      metadata: { semester, academicYear, enrolledCount: enrollments.length },
    });

    return res.status(201).json({
      data: {
        enrolledCount: enrollments.length,
        enrollments,
      },
    });
  } catch (error) {
    return next(error);
  }
}
