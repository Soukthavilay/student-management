import { prisma } from "../lib/prisma.js";
import { badRequest, forbidden, notFound } from "../utils/http-error.js";
import {
  calculateWeightedFinalScore,
  toGpaPoint,
} from "../utils/grade.js";
import { createAuditLog } from "../services/audit.service.js";
import { resolveAnnouncementTargetUserIds } from "../services/announcement-target.service.js";
import { createInAppNotifications, sendPushToUsers } from "../services/notification.service.js";

async function getLecturerOrThrow(userId) {
  const lecturer = await prisma.lecturer.findUnique({
    where: { userId },
  });

  if (!lecturer) {
    throw notFound("Lecturer profile not found");
  }

  return lecturer;
}

async function ensureLecturerSectionOwnership({ lecturerId, sectionId }) {
  const assignment = await prisma.teachingAssignment.findFirst({
    where: {
      lecturerId,
      sectionId,
    },
  });

  if (!assignment) {
    throw forbidden("You are not assigned to this section");
  }
}

export async function listAssignedSections(req, res, next) {
  try {
    const lecturer = await getLecturerOrThrow(req.user.id);

    const sections = await prisma.teachingAssignment.findMany({
      where: { lecturerId: lecturer.id },
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
            classGroup: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.json({
      sections: sections.map((item) => ({
        ...item.section,
        semester: item.section.semester.name,
        academicYear: item.section.semester.academicYear,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function listSectionStudents(req, res, next) {
  try {
    const lecturer = await getLecturerOrThrow(req.user.id);
    const sectionId = Number(req.params.sectionId);

    await ensureLecturerSectionOwnership({ lecturerId: lecturer.id, sectionId });

    const students = await prisma.enrollment.findMany({
      where: { sectionId },
      select: {
        id: true,
        student: {
          select: {
            id: true,
            studentCode: true,
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        grade: {
          select: {
            id: true,
            finalScore: true,
            gpaPoint: true,
            status: true,
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
    });

    return res.json({ students });
  } catch (error) {
    return next(error);
  }
}

export async function listTimetable(req, res, next) {
  try {
    const lecturer = await getLecturerOrThrow(req.user.id);

    const assignments = await prisma.teachingAssignment.findMany({
      where: { lecturerId: lecturer.id },
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
                id: true,
                code: true,
                name: true,
                credits: true,
              },
            },
            classGroup: {
              select: {
                id: true,
                code: true,
                name: true,
                department: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
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
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const timetable = assignments.map((item) => ({
      ...item.section,
      semester: item.section.semester.name,
      academicYear: item.section.semester.academicYear,
      department: item.section.classGroup?.department,
    }));

    return res.json({ timetable });
  } catch (error) {
    return next(error);
  }
}

export async function upsertGrade(req, res, next) {
  try {
    const lecturer = await getLecturerOrThrow(req.user.id);
    const { enrollmentId, components, finalScore } = req.body;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        section: {
          select: { id: true },
        },
        grade: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw notFound("Enrollment not found");
    }

    await ensureLecturerSectionOwnership({
      lecturerId: lecturer.id,
      sectionId: enrollment.section.id,
    });

    const calculated = calculateWeightedFinalScore(components);
    if (Math.abs(calculated - finalScore) > 0.15) {
      throw badRequest("finalScore does not match weighted components");
    }

    const gpaPoint = toGpaPoint(finalScore);

    const grade = await prisma.$transaction(async (tx) => {
      let gradeRecord = enrollment.grade;

      if (!gradeRecord) {
        gradeRecord = await tx.grade.create({
          data: {
            enrollmentId,
            finalScore,
            gpaPoint,
            status: "DRAFT",
          },
        });
      } else {
        await tx.grade.update({
          where: { id: gradeRecord.id },
          data: {
            finalScore,
            gpaPoint,
            status: "DRAFT",
          },
        });

        await tx.gradeComponent.deleteMany({
          where: {
            gradeId: gradeRecord.id,
          },
        });
      }

      await tx.gradeComponent.createMany({
        data: components.map((component) => ({
          gradeId: gradeRecord.id,
          name: component.name,
          weight: component.weight,
          score: component.score,
        })),
      });

      return tx.grade.findUnique({
        where: { id: gradeRecord.id },
        include: {
          components: true,
        },
      });
    });

    await createAuditLog({
      userId: req.user.id,
      action: "UPSERT_GRADE",
      entity: "Grade",
      entityId: grade.id,
      metadata: {
        enrollmentId,
        finalScore,
      },
    });

    return res.json({ grade });
  } catch (error) {
    return next(error);
  }
}

export async function submitGrade(req, res, next) {
  try {
    const lecturer = await getLecturerOrThrow(req.user.id);
    const { enrollmentId } = req.body;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        section: {
          select: { id: true },
        },
        grade: {
          select: { id: true },
        },
      },
    });

    if (!enrollment || !enrollment.grade) {
      throw notFound("Grade not found for this enrollment");
    }

    await ensureLecturerSectionOwnership({
      lecturerId: lecturer.id,
      sectionId: enrollment.section.id,
    });

    const updated = await prisma.grade.update({
      where: { id: enrollment.grade.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "SUBMIT_GRADE",
      entity: "Grade",
      entityId: updated.id,
      metadata: {
        enrollmentId,
      },
    });

    return res.json({ grade: updated });
  } catch (error) {
    return next(error);
  }
}

export async function createLecturerAnnouncement(req, res, next) {
  try {
    const lecturer = await getLecturerOrThrow(req.user.id);
    const { title, content, scope, classGroupId, sectionId } = req.body;

    // Validate scope and ownership
    if (scope === "CLASS" && classGroupId) {
      // Verify lecturer teaches in this class group
      const teachesClass = await prisma.teachingAssignment.findFirst({
        where: {
          lecturerId: lecturer.id,
          section: { classGroupId },
        },
      });
      if (!teachesClass) {
        throw forbidden("Bạn không dạy lớp này");
      }
    } else if (scope === "SECTION" && sectionId) {
      // Verify lecturer teaches this section
      const teachesSection = await prisma.teachingAssignment.findFirst({
        where: {
          lecturerId: lecturer.id,
          sectionId,
        },
      });
      if (!teachesSection) {
        throw forbidden("Bạn không dạy học phần này");
      }
    } else {
      throw badRequest("Phạm vi thông báo không hợp lệ (chỉ hỗ trợ CLASS hoặc SECTION)");
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        scope,
        classGroupId: classGroupId ?? null,
        sectionId: sectionId ?? null,
        createdById: req.user.id,
      },
    });

    const userIds = await resolveAnnouncementTargetUserIds({
      scope,
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
      action: "CREATE_LECTURER_ANNOUNCEMENT",
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

export async function listLecturerAnnouncements(req, res, next) {
  try {
    const lecturer = await getLecturerOrThrow(req.user.id);

    const announcements = await prisma.announcement.findMany({
      where: {
        createdById: req.user.id,
      },
      include: {
        classGroup: {
          select: { id: true, code: true, name: true },
        },
        section: {
          select: { id: true, code: true, subject: { select: { name: true } } },
        },
        _count: {
          select: { notifications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ data: announcements });
  } catch (error) {
    return next(error);
  }
}

// ── Attendance Management ──
export async function listAttendance(req, res, next) {
  try {
    const { sectionId, date } = req.query;
    if (!sectionId || !date) {
      throw badRequest("sectionId and date are required");
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        sectionId: Number(sectionId),
        date: new Date(date),
      },
      include: {
        student: {
          select: {
            id: true,
            studentCode: true,
            user: { select: { fullName: true } },
          },
        },
      },
    });

    return res.json({ data: attendance });
  } catch (error) {
    return next(error);
  }
}

export async function markAttendance(req, res, next) {
  try {
    const { sectionId, date, attendanceData } = req.body;
    
    if (!sectionId || !date || !attendanceData) {
      throw badRequest("sectionId, date, and attendanceData are required");
    }

    const results = await prisma.$transaction(
      attendanceData.map((ad) =>
        prisma.attendance.upsert({
          where: {
            sectionId_studentId_date: {
              sectionId: Number(sectionId),
              studentId: ad.studentId,
              date: new Date(date),
            },
          },
          update: {
            status: ad.status,
            note: ad.remark,
          },
          create: {
            studentId: ad.studentId,
            sectionId: Number(sectionId),
            date: new Date(date),
            status: ad.status,
            note: ad.remark,
          },
        })
      )
    );

    await createAuditLog({
      userId: req.user.id,
      action: "MARK_ATTENDANCE",
      entity: "Attendance",
      entityId: Number(sectionId),
      metadata: { sectionId, date, count: results.length },
    });

    return res.json({ data: results });
  } catch (error) {
    return next(error);
  }
}

export async function overrideExamEligibility(req, res, next) {
  try {
    const lecturer = await getLecturerOrThrow(req.user.id);
    const { studentId, sectionId, isEligible } = req.body;

    if (!studentId || !sectionId || isEligible === undefined) {
      throw badRequest("studentId, sectionId, and isEligible are required");
    }

    // Verify lecturer teaches this section
    const section = await prisma.section.findUnique({
      where: { id: Number(sectionId) },
      include: {
        teachingAssignments: {
          where: { lecturerId: lecturer.id },
        },
      },
    });

    if (!section || section.teachingAssignments.length === 0) {
      throw forbidden("Bạn không dạy lớp học phần này");
    }

    const enrollment = await prisma.enrollment.update({
      where: {
        sectionId_studentId: {
          sectionId: Number(sectionId),
          studentId: Number(studentId),
        },
      },
      data: {
        isEligibleForExam: isEligible,
      },
      include: {
        section: { include: { subject: true } },
        student: { include: { user: { select: { fullName: true } } } },
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "OVERRIDE_EXAM_ELIGIBILITY",
      entity: "Enrollment",
      entityId: enrollment.id,
      metadata: {
        studentId,
        sectionId,
        isEligible,
        studentName: enrollment.student.user.fullName,
        subjectName: enrollment.section.subject.name,
      },
    });

    return res.json({
      data: enrollment,
      message: `Cập nhật điều kiện dự thi cho sinh viên ${enrollment.student.user.fullName}`,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listAttendanceSchedule(req, res, next) {
  try {
    const lecturer = await getLecturerOrThrow(req.user.id);
    const { sectionId } = req.query;

    if (!sectionId) {
      throw badRequest("sectionId is required");
    }

    // Verify lecturer teaches this section
    const section = await prisma.section.findUnique({
      where: { id: Number(sectionId) },
      include: {
        teachingAssignments: {
          where: { lecturerId: lecturer.id },
        },
        schedules: {
          orderBy: { dayOfWeek: "asc" },
          include: { room: { select: { name: true } } },
        },
        semester: true,
        subject: true,
      },
    });

    if (!section || section.teachingAssignments.length === 0) {
      throw forbidden("Bạn không dạy lớp học phần này");
    }

    // Get all attendance records for this section
    const attendances = await prisma.attendance.findMany({
      where: {
        sectionId: Number(sectionId),
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Group attendance by date
    const attendanceByDate = {};
    attendances.forEach((att) => {
      const dateStr = att.date.toISOString().split("T")[0];
      if (!attendanceByDate[dateStr]) {
        attendanceByDate[dateStr] = [];
      }
      attendanceByDate[dateStr].push({
        studentId: att.studentId,
        studentName: att.student.user.fullName,
        status: att.status,
        note: att.note,
      });
    });

    // Get all students enrolled in this section
    const enrollments = await prisma.enrollment.findMany({
      where: {
        sectionId: Number(sectionId),
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
      orderBy: {
        student: {
          user: { fullName: "asc" },
        },
      },
    });

    return res.json({
      data: {
        section: {
          id: section.id,
          code: section.code,
          subjectName: section.subject.name,
          semesterName: section.semester.name,
          schedules: section.schedules.map((sch) => ({
            dayOfWeek: sch.dayOfWeek,
            shift: sch.shift,
            room: sch.room?.name || "N/A",
          })),
        },
        attendanceByDate: Object.entries(attendanceByDate).map(([date, records]) => ({
          date,
          records,
        })),
        students: enrollments.map((e) => ({
          studentId: e.studentId,
          studentName: e.student.user.fullName,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function listExamRegistrations(req, res, next) {
  try {
    const lecturer = await getLecturerOrThrow(req.user.id);
    const { sectionId } = req.query;

    // Get all sections taught by this lecturer
    const teachingAssignments = await prisma.teachingAssignment.findMany({
      where: { lecturerId: lecturer.id },
      select: { sectionId: true },
    });
    const sectionIds = teachingAssignments.map((ta) => ta.sectionId);

    if (sectionIds.length === 0) {
      return res.json({ exams: [] });
    }

    // Filter by specific section if provided
    const whereClause = sectionId
      ? { sectionId: Number(sectionId), id: { in: sectionIds } }
      : { sectionId: { in: sectionIds } };

    // Get all exams for these sections
    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: {
        section: {
          select: {
            id: true,
            code: true,
            subject: { select: { code: true, name: true } },
            classGroup: { select: { code: true, name: true } },
            semester: { select: { name: true, academicYear: true } },
          },
        },
        room: { select: { name: true } },
        examRegistrations: {
          include: {
            student: {
              select: {
                id: true,
                studentCode: true,
                user: { select: { fullName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { examDate: "desc" },
    });

    // For each exam registration, check eligibility conditions
    const enrichedExams = await Promise.all(
      exams.map(async (exam) => {
        const enrichedRegistrations = await Promise.all(
          exam.examRegistrations.map(async (reg) => {
            // Get enrollment info for eligibility check
            const enrollment = await prisma.enrollment.findFirst({
              where: {
                sectionId: exam.sectionId,
                studentId: reg.studentId,
              },
              select: {
                id: true,
                isEligibleForExam: true,
              },
            });

            // Get attendance stats
            const attendanceRecords = await prisma.attendance.findMany({
              where: {
                sectionId: exam.sectionId,
                studentId: reg.studentId,
              },
            });
            const totalClasses = attendanceRecords.length;
            const presentClasses = attendanceRecords.filter(
              (a) => a.status === "PRESENT"
            ).length;
            const attendanceRate = totalClasses > 0 ? presentClasses / totalClasses : 0;
            const minAttendanceRate = 0.8; // 80% required

            // Check tuition fee status
            const tuitionFee = await prisma.tuitionFee.findFirst({
              where: {
                studentId: reg.studentId,
                semesterId: exam.section.semester?.id,
              },
              include: { items: true },
            });
            const totalDebt = tuitionFee?.items.reduce((sum, item) => sum + item.debt, 0) || 0;
            const hasNoDebt = totalDebt === 0;

            // Determine eligibility
            let isEligible;
            if (enrollment?.isEligibleForExam !== null && enrollment?.isEligibleForExam !== undefined) {
              // Manual override takes precedence
              isEligible = enrollment.isEligibleForExam;
            } else {
              // Auto-calculate based on attendance and debt
              isEligible = attendanceRate >= minAttendanceRate && hasNoDebt;
            }

            return {
              ...reg,
              enrollmentId: enrollment?.id,
              eligibility: {
                isEligible,
                isOverridden: enrollment?.isEligibleForExam !== null && enrollment?.isEligibleForExam !== undefined,
                attendanceRate,
                minAttendanceRate,
                hasNoDebt,
                totalDebt,
              },
            };
          })
        );

        return {
          ...exam,
          examRegistrations: enrichedRegistrations,
        };
      })
    );

    return res.json({ exams: enrichedExams });
  } catch (error) {
    return next(error);
  }
}
