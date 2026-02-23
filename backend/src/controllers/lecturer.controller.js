import { prisma } from "../lib/prisma.js";
import { badRequest, forbidden, notFound } from "../utils/http-error.js";
import {
  calculateWeightedFinalScore,
  toGpaPoint,
} from "../utils/grade.js";
import { createAuditLog } from "../services/audit.service.js";

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
            semester: true,
            academicYear: true,
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
      sections: sections.map((item) => item.section),
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
