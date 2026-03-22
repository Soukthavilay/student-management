import { prisma } from "../lib/prisma.js";

export async function resolveAnnouncementTargetUserIds({ scope, departmentId, classGroupId, sectionId, semesterId }) {
  if (scope === "ALL") {
    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        isActive: true,
      },
      select: { id: true },
    });
    return users.map((user) => user.id);
  }

  if (scope === "DEPARTMENT") {
    const students = await prisma.student.findMany({
      where: { departmentId },
      select: { userId: true },
    });
    return students.map((student) => student.userId);
  }

  if (scope === "CLASS") {
    const students = await prisma.student.findMany({
      where: { classGroupId },
      select: { userId: true },
    });
    return students.map((student) => student.userId);
  }

  if (scope === "SECTION") {
    const enrollments = await prisma.enrollment.findMany({
      where: { sectionId },
      include: {
        student: {
          select: {
            userId: true,
          },
        },
      },
    });

    return enrollments.map((enrollment) => enrollment.student.userId);
  }

  if (scope === "SEMESTER") {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        section: { semesterId },
      },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });
    return [...new Set(enrollments.map((e) => e.student.userId))];
  }

  return [];
}
