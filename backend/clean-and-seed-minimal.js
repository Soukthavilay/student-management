import bcrypt from "bcryptjs";
import { PrismaClient, Role, SemesterStatus, RoomType, SubjectType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning all data...\n");

  try {
    // Clean up all data
    await prisma.gradeComponent.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.tuitionFeeItem.deleteMany();
    await prisma.tuitionFee.deleteMany();
    await prisma.tuitionConfig.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.teachingAssignment.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.deviceToken.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.curriculumSubject.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.student.deleteMany();
    await prisma.lecturer.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.section.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.classGroup.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();
    await prisma.semester.deleteMany();
    await prisma.room.deleteMany();

    console.log("✓ All data cleaned\n");

    // 1. Create Rooms
    console.log("📍 Creating rooms...");
    const rooms = await Promise.all([
      prisma.room.create({ data: { name: "A101", capacity: 50, type: RoomType.THEORY } }),
      prisma.room.create({ data: { name: "A102", capacity: 50, type: RoomType.THEORY } }),
      prisma.room.create({ data: { name: "A103", capacity: 50, type: RoomType.THEORY } }),
    ]);
    console.log(`   ✓ Created ${rooms.length} rooms`);

    // 2. Create Semester
    console.log("📅 Creating semester...");
    const semester = await prisma.semester.create({
      data: {
        name: "HK1",
        academicYear: "2024-2025",
        startDate: new Date("2024-09-01"),
        endDate: new Date("2024-12-31"),
        status: SemesterStatus.ENROLLMENT,
      },
    });
    console.log(`   ✓ Created semester: ${semester.name} ${semester.academicYear}`);

    // 3. Create Department
    console.log("🏢 Creating department...");
    const dept = await prisma.department.create({
      data: {
        code: "CNTT",
        name: "Khoa Công nghệ Thông tin",
      },
    });
    console.log(`   ✓ Created department: ${dept.name}`);

    // 4. Create Class Group
    console.log("👥 Creating class group...");
    const classGroup = await prisma.classGroup.create({
      data: {
        code: "CNTT-K20",
        name: "Lớp CNTT K20",
        departmentId: dept.id,
      },
    });
    console.log(`   ✓ Created class: ${classGroup.name}`);

    // 5. Create Subjects
    console.log("📚 Creating subjects...");
    const subjects = await Promise.all([
      prisma.subject.create({
        data: {
          code: "JAVA101",
          name: "Lập trình Java",
          credits: 3,
          type: SubjectType.GENERAL,
          departmentId: dept.id,
        },
      }),
      prisma.subject.create({
        data: {
          code: "DB101",
          name: "Cơ sở dữ liệu",
          credits: 3,
          type: SubjectType.GENERAL,
          departmentId: dept.id,
        },
      }),
      prisma.subject.create({
        data: {
          code: "NET101",
          name: "Mạng máy tính",
          credits: 3,
          type: SubjectType.GENERAL,
          departmentId: dept.id,
        },
      }),
    ]);
    console.log(`   ✓ Created ${subjects.length} subjects`);

    // 6. Create Curriculum
    console.log("🎓 Creating curriculum...");
    const curriculum = await prisma.curriculum.create({
      data: {
        name: "Chương trình CNTT",
        departmentId: dept.id,
        totalSemesters: 8,
        subjects: {
          create: subjects.map((s) => ({
            subjectId: s.id,
            semester: 1,
          })),
        },
      },
    });
    console.log(`   ✓ Created curriculum: ${curriculum.name}`);

    // 7. Create Admin User
    console.log("👨‍💼 Creating admin user...");
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@university.edu",
        fullName: "Admin User",
        role: Role.ADMIN,
        passwordHash: await bcrypt.hash("Admin@123", 10),
        admin: { create: {} },
      },
    });
    console.log(`   ✓ Created admin: ${adminUser.email}`);

    // 8. Create Lecturer User
    console.log("👨‍🏫 Creating lecturer user...");
    const lecturerUser = await prisma.user.create({
      data: {
        email: "lecturer@university.edu",
        fullName: "Lecturer User",
        role: Role.LECTURER,
        passwordHash: await bcrypt.hash("Lecturer@123", 10),
        lecturer: {
          create: {
            lecturerCode: "GV001",
            departmentId: dept.id,
          },
        },
      },
    });
    console.log(`   ✓ Created lecturer: ${lecturerUser.email}`);

    // 9. Create Student User
    console.log("🎓 Creating student user...");
    const studentUser = await prisma.user.create({
      data: {
        email: "student@university.edu",
        fullName: "Student User",
        role: Role.STUDENT,
        passwordHash: await bcrypt.hash("Student@123", 10),
        student: {
          create: {
            studentCode: "SV001",
            departmentId: dept.id,
            classGroupId: classGroup.id,
          },
        },
      },
    });
    console.log(`   ✓ Created student: ${studentUser.email}`);

    // Get lecturer ID
    const lecturer = await prisma.lecturer.findUnique({
      where: { userId: lecturerUser.id },
    });

    // 10. Create Sections
    console.log("📖 Creating sections...");
    const sections = await Promise.all([
      prisma.section.create({
        data: {
          code: "JAVA101-01",
          subjectId: subjects[0].id,
          semesterId: semester.id,
          classGroupId: classGroup.id,
          capacity: 30,
        },
      }),
      prisma.section.create({
        data: {
          code: "DB101-01",
          subjectId: subjects[1].id,
          semesterId: semester.id,
          classGroupId: classGroup.id,
          capacity: 30,
        },
      }),
      prisma.section.create({
        data: {
          code: "NET101-01",
          subjectId: subjects[2].id,
          semesterId: semester.id,
          classGroupId: classGroup.id,
          capacity: 30,
        },
      }),
    ]);
    console.log(`   ✓ Created ${sections.length} sections`);

    // 11. Assign Lecturer to Sections
    console.log("📋 Assigning lecturer...");
    await Promise.all([
      prisma.teachingAssignment.create({
        data: {
          sectionId: sections[0].id,
          lecturerId: lecturer.id,
        },
      }),
      prisma.teachingAssignment.create({
        data: {
          sectionId: sections[1].id,
          lecturerId: lecturer.id,
        },
      }),
      prisma.teachingAssignment.create({
        data: {
          sectionId: sections[2].id,
          lecturerId: lecturer.id,
        },
      }),
    ]);
    console.log(`   ✓ Assigned lecturer to sections`);

    // 12. Create Schedules
    console.log("⏰ Creating schedules...");
    const schedules = await Promise.all([
      // JAVA101-01: Mon, Tue, Thu
      prisma.schedule.create({
        data: {
          sectionId: sections[0].id,
          dayOfWeek: 2,
          shift: 1,
          roomId: rooms[0].id,
        },
      }),
      prisma.schedule.create({
        data: {
          sectionId: sections[0].id,
          dayOfWeek: 3,
          shift: 1,
          roomId: rooms[0].id,
        },
      }),
      prisma.schedule.create({
        data: {
          sectionId: sections[0].id,
          dayOfWeek: 5,
          shift: 1,
          roomId: rooms[0].id,
        },
      }),
      // DB101-01: Mon, Wed, Fri
      prisma.schedule.create({
        data: {
          sectionId: sections[1].id,
          dayOfWeek: 2,
          shift: 2,
          roomId: rooms[1].id,
        },
      }),
      prisma.schedule.create({
        data: {
          sectionId: sections[1].id,
          dayOfWeek: 4,
          shift: 2,
          roomId: rooms[1].id,
        },
      }),
      prisma.schedule.create({
        data: {
          sectionId: sections[1].id,
          dayOfWeek: 6,
          shift: 2,
          roomId: rooms[1].id,
        },
      }),
      // NET101-01: Tue, Thu, Sat
      prisma.schedule.create({
        data: {
          sectionId: sections[2].id,
          dayOfWeek: 3,
          shift: 2,
          roomId: rooms[2].id,
        },
      }),
      prisma.schedule.create({
        data: {
          sectionId: sections[2].id,
          dayOfWeek: 5,
          shift: 2,
          roomId: rooms[2].id,
        },
      }),
      prisma.schedule.create({
        data: {
          sectionId: sections[2].id,
          dayOfWeek: 7,
          shift: 2,
          roomId: rooms[2].id,
        },
      }),
    ]);
    console.log(`   ✓ Created ${schedules.length} schedules`);

    // 13. Create Exams
    console.log("🧪 Creating exams...");
    const exams = await Promise.all([
      prisma.exam.create({
        data: {
          sectionId: sections[0].id,
          examDate: new Date("2024-12-15T09:00:00"),
          roomId: rooms[0].id,
          type: "FINAL",
        },
      }),
      prisma.exam.create({
        data: {
          sectionId: sections[1].id,
          examDate: new Date("2024-12-16T09:00:00"),
          roomId: rooms[1].id,
          type: "FINAL",
        },
      }),
      prisma.exam.create({
        data: {
          sectionId: sections[2].id,
          examDate: new Date("2024-12-17T09:00:00"),
          roomId: rooms[2].id,
          type: "FINAL",
        },
      }),
    ]);
    console.log(`   ✓ Created ${exams.length} exams`);

    // 14. Create Tuition Config
    console.log("💰 Creating tuition config...");
    const tuitionConfig = await prisma.tuitionConfig.create({
      data: {
        semesterId: semester.id,
        creditPrice: 500000,
        isActive: true,
      },
    });
    console.log(`   ✓ Created tuition config: ${tuitionConfig.creditPrice.toLocaleString()}đ/TC`);

    console.log("\n✅ Minimal data created successfully!\n");
    console.log("📋 Summary:");
    console.log(`   - Rooms: ${rooms.length}`);
    console.log(`   - Semester: ${semester.name} ${semester.academicYear}`);
    console.log(`   - Department: ${dept.name}`);
    console.log(`   - Class: ${classGroup.name}`);
    console.log(`   - Subjects: ${subjects.length}`);
    console.log(`   - Sections: ${sections.length}`);
    console.log(`   - Schedules: ${schedules.length}`);
    console.log(`   - Exams: ${exams.length}`);
    console.log(`\n🔐 Test Accounts:`);
    console.log(`   Admin: admin@university.edu / Admin@123`);
    console.log(`   Lecturer: lecturer@university.edu / Lecturer@123`);
    console.log(`   Student: student@university.edu / Student@123`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
