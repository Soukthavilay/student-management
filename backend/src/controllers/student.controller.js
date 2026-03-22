import { prisma } from "../lib/prisma.js";
import { notFound } from "../utils/http-error.js";
import { parsePagination, paginationMeta } from "../utils/pagination.js";
import { createAuditLog } from "../services/audit.service.js";

async function getStudentOrThrow(userId) {
  const student = await prisma.student.findUnique({
    where: { userId },
  });

  if (!student) {
    throw notFound("Student profile not found");
  }

  return student;
}

export async function getProfile(req, res, next) {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        student: {
          select: {
            id: true,
            studentCode: true,
            phone: true,
            address: true,
            currentSemester: true,
            departmentId: true,
            classGroupId: true,
            department: {
              select: { id: true, code: true, name: true },
            },
            classGroup: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
    });

    if (!profile || !profile.student) {
      throw notFound("Student profile not found");
    }

    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);
    const { fullName, phone, address } = req.body;

    const updates = [];

    if (typeof fullName === "string") {
      updates.push(
        prisma.user.update({
          where: { id: req.user.id },
          data: { fullName },
        }),
      );
    }

    updates.push(
      prisma.student.update({
        where: { id: student.id },
        data: {
          ...(phone !== undefined ? { phone } : {}),
          ...(address !== undefined ? { address } : {}),
        },
      }),
    );

    await prisma.$transaction(updates);

    return res.json({ message: "Profile updated" });
  } catch (error) {
    return next(error);
  }
}

export async function listTimetable(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);
    const semesterId = req.query.semesterId ? Number(req.query.semesterId) : undefined;

    const items = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        ...(semesterId ? { section: { semesterId } } : {}),
      },
      select: {
        section: {
          select: {
            id: true,
            code: true,
            semester: {
              select: { id: true, name: true, academicYear: true }
            },
            subject: {
              select: {
                code: true,
                name: true,
                credits: true,
              },
            },
            schedules: {
              select: {
                id: true,
                dayOfWeek: true,
                shift: true,
                room: {
                  select: { id: true, name: true }
                },
              },
              orderBy: {
                dayOfWeek: "asc",
              },
            },
            teachingAssignments: {
              select: {
                lecturer: {
                  select: {
                    user: {
                      select: {
                        fullName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.json({
      timetable: items.map((item) => ({
        ...item.section,
        schedules: item.section.schedules.map(sch => ({
          ...sch,
          room: sch.room?.name || 'N/A',
        })),
        semester: item.section.semester.name,
        academicYear: item.section.semester.academicYear,
        lecturers: item.section.teachingAssignments.map(
          (assignment) => assignment.lecturer.user.fullName,
        ),
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function listExams(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);

    const exams = await prisma.exam.findMany({
      where: {
        section: {
          enrollments: {
            some: {
              studentId: student.id,
            },
          },
        },
      },
      select: {
        id: true,
        examDate: true,
        room: {
          select: { id: true, name: true }
        },
        type: true,
        section: {
          select: {
            code: true,
            subject: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        examDate: "asc",
      },
    });

    return res.json({
      exams: exams.map(exam => ({
        ...exam,
        room: exam.room?.name || null,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function listGrades(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);

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

    const grades = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
      },
      select: {
        id: true,
        section: {
          select: {
            code: true,
            semester: {
              select: { id: true, name: true, academicYear: true }
            },
            subject: {
              select: {
                id: true,
                code: true,
                name: true,
                credits: true,
              },
            },
          },
        },
        grade: {
          select: {
            finalScore: true,
            gpaPoint: true,
            status: true,
            submittedAt: true,
            components: {
              select: {
                id: true,
                name: true,
                weight: true,
                score: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const validGpas = grades
      .map((item) => item.grade?.gpaPoint)
      .filter((value) => typeof value === "number");

    const cumulativeGpa =
      validGpas.length > 0
        ? Number((validGpas.reduce((sum, value) => sum + value, 0) / validGpas.length).toFixed(2))
        : 0;

    return res.json({
      cumulativeGpa,
      grades,
      curriculum,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listNotifications(req, res, next) {
  try {
    const { q } = req.query;
    const { page, pageSize, skip, take } = parsePagination(req.query);

    const where = {
      userId: req.user.id,
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { body: { contains: q } },
            ],
          }
        : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return res.json({
      data: items,
      pagination: paginationMeta({ page, pageSize, total }),
    });
  } catch (error) {
    return next(error);
  }
}

export async function listTuitionFees(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);

    const tuitionFees = await prisma.tuitionFee.findMany({
      where: { studentId: student.id },
      include: {
        semester: true,
        items: {
          include: {
            enrollment: {
              select: {
                section: {
                  select: {
                    code: true,
                    subject: {
                      select: {
                        code: true,
                        name: true,
                        credits: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { semester: { startDate: "desc" } },
    });

    // Get all unique semesterIds
    const semesterIds = [...new Set(tuitionFees.map(tf => tf.semesterId))];

    // Fetch tuition configs for these semesters
    const tuitionConfigs = await prisma.tuitionConfig.findMany({
      where: {
        semesterId: { in: semesterIds },
      },
      include: {
        semester: true
      }
    });

    // Calculate totals
    const totals = {
      amountDue: 0,
      amountPaid: 0,
      discount: 0,
      debt: 0,
    };

    tuitionFees.forEach((tf) => {
      tf.items.forEach((item) => {
        totals.amountDue += item.amountDue;
        totals.amountPaid += item.amountPaid;
        totals.discount += item.discount;
        totals.debt += item.debt;
      });
    });

    // Transform semester to string to avoid rendering object in mobile
    const transformedFees = tuitionFees.map((tf) => ({
      ...tf,
      semester: tf.semester.name,
      academicYear: tf.semester.academicYear,
    }));

    return res.json({ tuitionFees: transformedFees, totals, configs: tuitionConfigs });
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const id = Number(req.params.id);

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      throw notFound("Notification not found");
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({ message: "Marked as read" });
  } catch (error) {
    return next(error);
  }
}

export async function listAttendance(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);
    const { semesterId } = req.query;

    const where = { studentId: student.id };
    if (semesterId) {
      where.section = { semesterId: Number(semesterId) };
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        section: {
          select: {
            code: true,
            subject: { select: { name: true } },
            semester: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return res.json({ data: attendance });
  } catch (error) {
    return next(error);
  }
}

export async function listAvailableSections(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);
    const { subjectId, departmentId } = req.query;

    const enrollmentSemester = await prisma.semester.findFirst({
      where: { status: "ENROLLMENT" },
    });

    if (!enrollmentSemester) {
      return res.json({ data: [], message: "Hiện không phải thời gian đăng ký học phần." });
    }

    const sections = await prisma.section.findMany({
      where: {
        semesterId: enrollmentSemester.id,
        ...(subjectId ? { subjectId: Number(subjectId) } : {}),
        subject: {
          OR: [
            { type: "GENERAL" },
            { departmentId: student.departmentId },
            ...(departmentId ? [{ departmentId: Number(departmentId) }] : []),
          ],
        },
      },
      include: {
        subject: true,
        teachingAssignments: {
          include: { lecturer: { include: { user: { select: { fullName: true } } } } },
        },
        schedules: {
          include: { room: { select: { name: true } } },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { code: "asc" },
    });

    const studentEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        section: { semesterId: enrollmentSemester.id },
      },
      select: { sectionId: true },
    });
    const enrolledIds = new Set(studentEnrollments.map((e) => e.sectionId));

    const result = sections.map((s) => ({
      ...s,
      lecturers: s.teachingAssignments.map(ta => ta.lecturer.user.fullName),
      schedules: s.schedules.map(sch => ({
        ...sch,
        room: sch.room?.name || 'N/A',
      })),
      isEnrolled: enrolledIds.has(s.id),
      availableSlots: Math.max(0, (s.capacity || 0) - s._count.enrollments),
      teachingAssignments: undefined,
    }));

    return res.json({
      data: result,
      semester: {
        id: enrollmentSemester.id,
        name: enrollmentSemester.name,
        academicYear: enrollmentSemester.academicYear,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function registerSection(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);
    const { sectionId } = req.body;

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        semester: true,
        subject: true,
        schedules: true,
        _count: { select: { enrollments: true } },
      },
    });

    if (!section) throw notFound("Lớp học phần không tồn tại");
    if (section.semester.status !== "ENROLLMENT") {
      throw badRequest("Học kỳ này không cho phép đăng ký học phần");
    }

    if (section.subject.type === "DEPARTMENT" && section.subject.departmentId !== student.departmentId) {
      throw badRequest("Bạn không thuộc khoa quản lý môn học chuyên ngành này");
    }

    if (section.capacity && section._count.enrollments >= section.capacity) {
      throw badRequest("Lớp học phần đã đầy sĩ số");
    }

    const existingSubjectEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: student.id,
        section: {
          semesterId: section.semesterId,
          subjectId: section.subjectId,
        },
      },
    });
    if (existingSubjectEnrollment) {
      throw badRequest("Bạn đã đăng ký một lớp học phần khác của môn học này trong kỳ.");
    }

    const studentSchedules = await prisma.schedule.findMany({
      where: {
        section: {
          enrollments: { some: { studentId: student.id } },
          semesterId: section.semesterId,
        },
      },
    });

    for (const newSched of section.schedules) {
      const overlap = studentSchedules.find(
        (os) => os.dayOfWeek === newSched.dayOfWeek && os.shift === newSched.shift
      );
      if (overlap) {
        throw badRequest(`Trùng lịch học vào thứ ${newSched.dayOfWeek}, ca ${newSched.shift}`);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          studentId: student.id,
          sectionId,
        },
      });

      const config = await tx.tuitionConfig.findUnique({
        where: { semesterId: section.semesterId },
      });

      if (config) {
        const creditPrice = config.creditPrice;
        const amountDue = (section.subject.credits || 0) * creditPrice;

        const tuitionFee = await tx.tuitionFee.upsert({
          where: {
            studentId_semesterId: {
              studentId: student.id,
              semesterId: section.semesterId,
            },
          },
          update: {},
          create: {
            studentId: student.id,
            semesterId: section.semesterId,
          },
        });

        await tx.tuitionFeeItem.create({
          data: {
            tuitionFeeId: tuitionFee.id,
            enrollmentId: enrollment.id,
            name: `Học phần ${section.subject.name} (${section.code})`,
            credits: section.subject.credits,
            creditPrice,
            amountDue,
            amountPaid: 0,
            discount: 0,
            debt: amountDue,
          },
        });
      }

      return enrollment;
    });

    await createAuditLog({
      userId: req.user.id,
      action: "REGISTER_SECTION",
      entity: "Enrollment",
      entityId: result.id,
      metadata: { sectionId, semesterId: section.semesterId },
    });

    return res.status(201).json({ data: result, message: "Đăng ký học phần thành công" });
  } catch (error) {
    return next(error);
  }
}

export async function dropSection(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);
    const sectionId = Number(req.params.sectionId);

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        sectionId_studentId: {
          sectionId,
          studentId: student.id,
        },
      },
      include: { section: { include: { semester: true } } },
    });

    if (!enrollment) throw notFound("Bạn chưa đăng ký lớp học phần này");
    if (enrollment.section.semester.status !== "ENROLLMENT") {
      throw badRequest("Học kỳ này hiện không cho phép hủy học phần");
    }

    await prisma.$transaction(async (tx) => {
      await tx.tuitionFeeItem.deleteMany({
        where: { enrollmentId: enrollment.id },
      });

      await tx.enrollment.delete({
        where: { id: enrollment.id },
      });
    });

    await createAuditLog({
      userId: req.user.id,
      action: "DROP_SECTION",
      entity: "Enrollment",
      entityId: enrollment.id,
      metadata: { sectionId, semesterId: enrollment.section.semesterId },
    });

    return res.json({ message: "Đã hủy đăng ký học phần" });
  } catch (error) {
    return next(error);
  }
}
