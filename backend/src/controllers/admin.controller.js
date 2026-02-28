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

export async function createSchedule(req, res, next) {
  try {
    const created = await prisma.schedule.create({
      data: {
        sectionId: req.body.sectionId,
        dayOfWeek: req.body.dayOfWeek,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        room: req.body.room ?? null,
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

    return res.json({ data: student });
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
