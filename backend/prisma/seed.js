import bcrypt from "bcryptjs";
import { PrismaClient, AnnouncementScope, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.gradeComponent.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.teachingAssignment.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.deviceToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.student.deleteMany();
  await prisma.lecturer.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.section.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.classGroup.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const [adminHash, lecturerHash, studentHash] = await Promise.all([
    bcrypt.hash("Admin@123", 10),
    bcrypt.hash("Lecturer@123", 10),
    bcrypt.hash("Student@123", 10),
  ]);

  const department = await prisma.department.create({
    data: {
      code: "CNTT",
      name: "Công nghệ thông tin",
    },
  });

  const classGroup = await prisma.classGroup.create({
    data: {
      code: "CNTT01",
      name: "Lớp CNTT01",
      departmentId: department.id,
    },
  });

  const subject = await prisma.subject.create({
    data: {
      code: "CNPM",
      name: "Công nghệ phần mềm",
      credits: 3,
      departmentId: department.id,
    },
  });

  const section = await prisma.section.create({
    data: {
      code: "CNPM-2026-01",
      subjectId: subject.id,
      classGroupId: classGroup.id,
      semester: "HK2",
      academicYear: "2025-2026",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@school.edu.vn",
      fullName: "Quản trị hệ thống",
      role: Role.ADMIN,
      passwordHash: adminHash,
      admin: {
        create: {},
      },
    },
  });

  const lecturerUser = await prisma.user.create({
    data: {
      email: "lecturer@school.edu.vn",
      fullName: "Nguyễn Văn Giảng",
      role: Role.LECTURER,
      passwordHash: lecturerHash,
      lecturer: {
        create: {
          lecturerCode: "GV001",
          departmentId: department.id,
          title: "ThS.",
        },
      },
    },
    include: { lecturer: true },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "student@school.edu.vn",
      fullName: "Trần Thị Sinh Viên",
      role: Role.STUDENT,
      passwordHash: studentHash,
      student: {
        create: {
          studentCode: "SV001",
          departmentId: department.id,
          classGroupId: classGroup.id,
          phone: "0909000001",
          address: "Đà Nẵng",
        },
      },
    },
    include: { student: true },
  });

  await prisma.teachingAssignment.create({
    data: {
      sectionId: section.id,
      lecturerId: lecturerUser.lecturer.id,
    },
  });

  const enrollment = await prisma.enrollment.create({
    data: {
      sectionId: section.id,
      studentId: studentUser.student.id,
    },
  });

  const grade = await prisma.grade.create({
    data: {
      enrollmentId: enrollment.id,
      finalScore: 8.3,
      gpaPoint: 3.5,
      components: {
        create: [
          { name: "Chuyên cần", weight: 0.1, score: 9 },
          { name: "Giữa kỳ", weight: 0.3, score: 8 },
          { name: "Cuối kỳ", weight: 0.6, score: 8.4 },
        ],
      },
    },
  });

  await prisma.schedule.createMany({
    data: [
      {
        sectionId: section.id,
        dayOfWeek: 2,
        startTime: "07:30",
        endTime: "09:30",
        room: "A201",
      },
      {
        sectionId: section.id,
        dayOfWeek: 4,
        startTime: "13:30",
        endTime: "15:30",
        room: "B102",
      },
    ],
  });

  await prisma.exam.create({
    data: {
      sectionId: section.id,
      examDate: new Date("2026-06-10T01:00:00.000Z"),
      room: "H1-101",
      type: "Final",
    },
  });

  const announcement = await prisma.announcement.create({
    data: {
      title: "Lịch học tuần mới",
      content: "Lớp CNPM-2026-01 bắt đầu học từ thứ 2 tuần sau.",
      scope: AnnouncementScope.CLASS,
      classGroupId: classGroup.id,
      createdById: adminUser.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      announcementId: announcement.id,
      title: announcement.title,
      body: announcement.content,
    },
  });

  console.log("Seed complete");
  console.log("Admin:", "admin@school.edu.vn / Admin@123");
  console.log("Lecturer:", "lecturer@school.edu.vn / Lecturer@123");
  console.log("Student:", "student@school.edu.vn / Student@123");
  console.log("Sample grade id:", grade.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
