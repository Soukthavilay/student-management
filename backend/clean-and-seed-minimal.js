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

    // 5. Create Subjects (3 department + 3 general)
    console.log("📚 Creating subjects...");
    const subjects = await Promise.all([
      // Department subjects (CNTT khoa)
      prisma.subject.create({
        data: {
          code: "JAVA101",
          name: "Lập trình Java",
          credits: 3,
          type: "DEPARTMENT",
          departmentId: dept.id,
        },
      }),
      prisma.subject.create({
        data: {
          code: "DB101",
          name: "Cơ sở dữ liệu",
          credits: 3,
          type: "DEPARTMENT",
          departmentId: dept.id,
        },
      }),
      prisma.subject.create({
        data: {
          code: "NET101",
          name: "Mạng máy tính",
          credits: 3,
          type: "DEPARTMENT",
          departmentId: dept.id,
        },
      }),
      // General subjects (all students)
      prisma.subject.create({
        data: {
          code: "PHIL101",
          name: "Triết học",
          credits: 2,
          type: "GENERAL",
          departmentId: null,
        },
      }),
      prisma.subject.create({
        data: {
          code: "LAW101",
          name: "Pháp luật đại cương",
          credits: 2,
          type: "GENERAL",
          departmentId: null,
        },
      }),
      prisma.subject.create({
        data: {
          code: "HIST101",
          name: "Lịch sử Đảng Cộng sản Việt Nam",
          credits: 2,
          type: "GENERAL",
          departmentId: null,
        },
      }),
    ]);
    console.log(`   ✓ Created ${subjects.length} subjects (3 department + 3 general)`);

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

    // 10. Create Sections (6 sections: 3 department × 2 lecturers, 3 general × 1 lecturer)
    console.log("📖 Creating sections...");
    const sections = await Promise.all([
      // Department subjects - 2 sections each
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
          code: "JAVA101-02",
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
          code: "DB101-02",
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
      prisma.section.create({
        data: {
          code: "NET101-02",
          subjectId: subjects[2].id,
          semesterId: semester.id,
          classGroupId: classGroup.id,
          capacity: 30,
        },
      }),
      // General subjects - 1 section each
      prisma.section.create({
        data: {
          code: "PHIL101-01",
          subjectId: subjects[3].id,
          semesterId: semester.id,
          classGroupId: null,
          capacity: 50,
        },
      }),
      prisma.section.create({
        data: {
          code: "LAW101-01",
          subjectId: subjects[4].id,
          semesterId: semester.id,
          classGroupId: null,
          capacity: 50,
        },
      }),
      prisma.section.create({
        data: {
          code: "HIST101-01",
          subjectId: subjects[5].id,
          semesterId: semester.id,
          classGroupId: null,
          capacity: 50,
        },
      }),
    ]);
    console.log(`   ✓ Created ${sections.length} sections (6 department + 3 general)`);

    // 11. Assign Lecturer to Sections (all 9 sections)
    console.log("📋 Assigning lecturer...");
    await Promise.all(
      sections.map((section) =>
        prisma.teachingAssignment.create({
          data: {
            sectionId: section.id,
            lecturerId: lecturer.id,
          },
        })
      )
    );
    console.log(`   ✓ Assigned lecturer to ${sections.length} sections`);

    // 12. Create Schedules (3 per section)
    console.log("⏰ Creating schedules...");
    const schedules = await Promise.all([
      // JAVA101-01: Mon, Tue, Thu
      prisma.schedule.create({ data: { sectionId: sections[0].id, dayOfWeek: 2, shift: 1, roomId: rooms[0].id } }),
      prisma.schedule.create({ data: { sectionId: sections[0].id, dayOfWeek: 3, shift: 1, roomId: rooms[0].id } }),
      prisma.schedule.create({ data: { sectionId: sections[0].id, dayOfWeek: 5, shift: 1, roomId: rooms[0].id } }),
      // JAVA101-02: Mon, Tue, Thu (shift 2)
      prisma.schedule.create({ data: { sectionId: sections[1].id, dayOfWeek: 2, shift: 2, roomId: rooms[0].id } }),
      prisma.schedule.create({ data: { sectionId: sections[1].id, dayOfWeek: 3, shift: 2, roomId: rooms[0].id } }),
      prisma.schedule.create({ data: { sectionId: sections[1].id, dayOfWeek: 5, shift: 2, roomId: rooms[0].id } }),
      // DB101-01: Mon, Wed, Fri
      prisma.schedule.create({ data: { sectionId: sections[2].id, dayOfWeek: 2, shift: 1, roomId: rooms[1].id } }),
      prisma.schedule.create({ data: { sectionId: sections[2].id, dayOfWeek: 4, shift: 1, roomId: rooms[1].id } }),
      prisma.schedule.create({ data: { sectionId: sections[2].id, dayOfWeek: 6, shift: 1, roomId: rooms[1].id } }),
      // DB101-02: Mon, Wed, Fri (shift 2)
      prisma.schedule.create({ data: { sectionId: sections[3].id, dayOfWeek: 2, shift: 2, roomId: rooms[1].id } }),
      prisma.schedule.create({ data: { sectionId: sections[3].id, dayOfWeek: 4, shift: 2, roomId: rooms[1].id } }),
      prisma.schedule.create({ data: { sectionId: sections[3].id, dayOfWeek: 6, shift: 2, roomId: rooms[1].id } }),
      // NET101-01: Tue, Thu, Sat
      prisma.schedule.create({ data: { sectionId: sections[4].id, dayOfWeek: 3, shift: 1, roomId: rooms[2].id } }),
      prisma.schedule.create({ data: { sectionId: sections[4].id, dayOfWeek: 5, shift: 1, roomId: rooms[2].id } }),
      prisma.schedule.create({ data: { sectionId: sections[4].id, dayOfWeek: 7, shift: 1, roomId: rooms[2].id } }),
      // NET101-02: Tue, Thu, Sat (shift 2)
      prisma.schedule.create({ data: { sectionId: sections[5].id, dayOfWeek: 3, shift: 2, roomId: rooms[2].id } }),
      prisma.schedule.create({ data: { sectionId: sections[5].id, dayOfWeek: 5, shift: 2, roomId: rooms[2].id } }),
      prisma.schedule.create({ data: { sectionId: sections[5].id, dayOfWeek: 7, shift: 2, roomId: rooms[2].id } }),
      // General subjects - 1 per week
      prisma.schedule.create({ data: { sectionId: sections[6].id, dayOfWeek: 2, shift: 1, roomId: rooms[0].id } }),
      prisma.schedule.create({ data: { sectionId: sections[7].id, dayOfWeek: 4, shift: 1, roomId: rooms[1].id } }),
      prisma.schedule.create({ data: { sectionId: sections[8].id, dayOfWeek: 6, shift: 1, roomId: rooms[2].id } }),
    ]);
    console.log(`   ✓ Created ${schedules.length} schedules`);

    // 13. Create Exams (1 per section)
    console.log("🧪 Creating exams...");
    const exams = await Promise.all([
      prisma.exam.create({ data: { sectionId: sections[0].id, examDate: new Date("2024-12-15T09:00:00"), roomId: rooms[0].id, type: "FINAL" } }),
      prisma.exam.create({ data: { sectionId: sections[1].id, examDate: new Date("2024-12-15T14:00:00"), roomId: rooms[0].id, type: "FINAL" } }),
      prisma.exam.create({ data: { sectionId: sections[2].id, examDate: new Date("2024-12-16T09:00:00"), roomId: rooms[1].id, type: "FINAL" } }),
      prisma.exam.create({ data: { sectionId: sections[3].id, examDate: new Date("2024-12-16T14:00:00"), roomId: rooms[1].id, type: "FINAL" } }),
      prisma.exam.create({ data: { sectionId: sections[4].id, examDate: new Date("2024-12-17T09:00:00"), roomId: rooms[2].id, type: "FINAL" } }),
      prisma.exam.create({ data: { sectionId: sections[5].id, examDate: new Date("2024-12-17T14:00:00"), roomId: rooms[2].id, type: "FINAL" } }),
      prisma.exam.create({ data: { sectionId: sections[6].id, examDate: new Date("2024-12-18T09:00:00"), roomId: rooms[0].id, type: "FINAL" } }),
      prisma.exam.create({ data: { sectionId: sections[7].id, examDate: new Date("2024-12-18T14:00:00"), roomId: rooms[1].id, type: "FINAL" } }),
      prisma.exam.create({ data: { sectionId: sections[8].id, examDate: new Date("2024-12-19T09:00:00"), roomId: rooms[2].id, type: "FINAL" } }),
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
    console.log(`   - Subjects: ${subjects.length} (3 department + 3 general)`);
    console.log(`   - Sections: ${sections.length} (6 department + 3 general)`);
    console.log(`   - Schedules: ${schedules.length} (3 per section)`);
    console.log(`   - Exams: ${exams.length} (1 per section)`);
    console.log(`\n📚 Subject Details:`);
    console.log(`   Department: JAVA101, DB101, NET101 (each has 2 sections)`);
    console.log(`   General: PHIL101, LAW101, HIST101 (each has 1 section)`);
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
