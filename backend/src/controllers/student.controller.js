import { prisma } from "../lib/prisma.js";
import { notFound } from "../utils/http-error.js";
import { parsePagination, paginationMeta } from "../utils/pagination.js";

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
    const semester = req.query.semester;

    const items = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        ...(semester ? { section: { semester } } : {}),
      },
      select: {
        section: {
          select: {
            id: true,
            code: true,
            semester: true,
            academicYear: true,
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
                startTime: true,
                endTime: true,
                room: true,
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
        room: true,
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

    return res.json({ exams });
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
            semester: true,
            academicYear: true,
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
