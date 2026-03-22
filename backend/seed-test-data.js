import bcrypt from "bcryptjs";
import { PrismaClient, Role, SemesterStatus, RoomType, SubjectType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding test data for Test Case 1...\n");

  try {
    // Clean up existing data
    console.log("🗑️  Cleaning up existing data...");
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

    // 1. Create Rooms
    console.log("📍 Creating rooms...");
    const rooms = await Promise.all([
      prisma.room.create({ data: { name: "A101", capacity: 50, type: RoomType.THEORY } }),
      prisma.room.create({ data: { name: "A102", capacity: 50, type: RoomType.THEORY } }),
      prisma.room.create({ data: { name: "A103", capacity: 50, type: RoomType.THEORY } }),
    ]);
    console.log(`   ✓ Created ${rooms.length} rooms`);

    // 2. Create Semester (ENROLLMENT status for registration)
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

    // 7. Create Students
    console.log("🎓 Creating students...");
    const studentUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: "sv001@university.edu",
          fullName: "Nguyễn Văn A",
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
      }),
      prisma.user.create({
        data: {
          email: "sv002@university.edu",
          fullName: "Trần Thị B",
          role: Role.STUDENT,
          passwordHash: await bcrypt.hash("Student@123", 10),
          student: {
            create: {
              studentCode: "SV002",
              departmentId: dept.id,
              classGroupId: classGroup.id,
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          email: "sv003@university.edu",
          fullName: "Lê Văn C",
          role: Role.STUDENT,
          passwordHash: await bcrypt.hash("Student@123", 10),
          student: {
            create: {
              studentCode: "SV003",
              departmentId: dept.id,
              classGroupId: classGroup.id,
            },
          },
        },
      }),
    ]);
    console.log(`   ✓ Created ${studentUsers.length} students`);

    // 8. Create Lecturers
    console.log("👨‍🏫 Creating lecturers...");
    const lecturerUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: "gv001@university.edu",
          fullName: "Phạm Văn X",
          role: Role.LECTURER,
          passwordHash: await bcrypt.hash("Lecturer@123", 10),
          lecturer: {
            create: {
              lecturerCode: "GV001",
              departmentId: dept.id,
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          email: "gv002@university.edu",
          fullName: "Hoàng Thị Y",
          role: Role.LECTURER,
          passwordHash: await bcrypt.hash("Lecturer@123", 10),
          lecturer: {
            create: {
              lecturerCode: "GV002",
              departmentId: dept.id,
            },
          },
        },
      }),
    ]);
    console.log(`   ✓ Created ${lecturerUsers.length} lecturers`);

    // Get lecturer IDs
    const lecturers = await prisma.lecturer.findMany();

    // 9. Create Sections (Classes)
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

    // 10. Assign Lecturers to Sections
    console.log("📋 Assigning lecturers...");
    await Promise.all([
      prisma.teachingAssignment.create({
        data: {
          sectionId: sections[0].id,
          lecturerId: lecturers[0].id,
        },
      }),
      prisma.teachingAssignment.create({
        data: {
          sectionId: sections[1].id,
          lecturerId: lecturers[1].id,
        },
      }),
      prisma.teachingAssignment.create({
        data: {
          sectionId: sections[2].id,
          lecturerId: lecturers[0].id,
        },
      }),
    ]);
    console.log(`   ✓ Assigned lecturers to sections`);

    // 11. Create Schedules
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

    // 12. Create Exams
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

    // 13. Create Tuition Config
    console.log("💰 Creating tuition config...");
    const tuitionConfig = await prisma.tuitionConfig.create({
      data: {
        semesterId: semester.id,
        creditPrice: 500000,
        isActive: true,
      },
    });
    console.log(`   ✓ Created tuition config: ${tuitionConfig.creditPrice.toLocaleString()}đ/TC`);

    console.log("\n✅ Test data created successfully!\n");
    console.log("📋 Summary:");
    console.log(`   - Rooms: ${rooms.length}`);
    console.log(`   - Semester: ${semester.name} ${semester.academicYear} (${semester.status})`);
    console.log(`   - Department: ${dept.name}`);
    console.log(`   - Class: ${classGroup.name}`);
    console.log(`   - Subjects: ${subjects.length}`);
    console.log(`   - Students: ${studentUsers.length}`);
    console.log(`   - Lecturers: ${lecturerUsers.length}`);
    console.log(`   - Sections: ${sections.length}`);
    console.log(`   - Schedules: ${schedules.length}`);
    console.log(`   - Exams: ${exams.length}`);
    console.log(`\n🔐 Test Accounts:`);
    console.log(`   Admin: admin@university.edu / Admin@123`);
    console.log(`   Student 1: sv001@university.edu / Student@123`);
    console.log(`   Student 2: sv002@university.edu / Student@123`);
    console.log(`   Student 3: sv003@university.edu / Student@123`);
    console.log(`   Lecturer 1: gv001@university.edu / Lecturer@123`);
    console.log(`   Lecturer 2: gv002@university.edu / Lecturer@123`);
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
