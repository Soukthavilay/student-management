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

    // 3. Create Departments
    console.log("🏢 Creating departments...");
    const depts = await Promise.all([
      prisma.department.create({
        data: {
          code: "CNTT",
          name: "Khoa Công nghệ Thông tin",
        },
      }),
      prisma.department.create({
        data: {
          code: "KTDT",
          name: "Khoa Kỹ thuật Điện",
        },
      }),
    ]);
    const dept = depts[0];
    const deptElectrical = depts[1];
    console.log(`   ✓ Created ${depts.length} departments`);

    // 4. Create Majors
    console.log("🎓 Creating majors...");
    const majors = await Promise.all([
      prisma.major.create({
        data: {
          code: "CNTT-SE",
          name: "Ngành Kỹ sư Phần mềm",
          departmentId: dept.id,
        },
      }),
      prisma.major.create({
        data: {
          code: "KTDT-AC",
          name: "Kỹ thuật điện AC",
          departmentId: deptElectrical.id,
        },
      }),
    ]);
    const major = majors[0];
    const majorElectrical = majors[1];
    console.log(`   ✓ Created ${majors.length} majors`);

    // 5. Create Class Groups
    console.log("👥 Creating class groups...");
    const classGroups = await Promise.all([
      prisma.classGroup.create({
        data: {
          code: "CNTT-K20",
          name: "Lớp CNTT K20",
          departmentId: dept.id,
          majorId: major.id,
        },
      }),
      prisma.classGroup.create({
        data: {
          code: "KTDT-AC-1",
          name: "Kỹ thuật điện AC 1",
          departmentId: deptElectrical.id,
          majorId: majorElectrical.id,
        },
      }),
    ]);
    const classGroup = classGroups[0];
    const classGroupElectrical = classGroups[1];
    console.log(`   ✓ Created ${classGroups.length} class groups`);

    // 6. Create Subjects (6 department + 3 general)
    console.log("📚 Creating subjects...");
    const subjects = await Promise.all([
      // CNTT department subjects
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
      // KTDT department subjects
      prisma.subject.create({
        data: {
          code: "DIEN-AC",
          name: "Điện AC",
          credits: 3,
          type: "DEPARTMENT",
          departmentId: deptElectrical.id,
        },
      }),
      prisma.subject.create({
        data: {
          code: "DIEN-DC",
          name: "Điện DC",
          credits: 3,
          type: "DEPARTMENT",
          departmentId: deptElectrical.id,
        },
      }),
      prisma.subject.create({
        data: {
          code: "DIEN-NANG",
          name: "Điện năng",
          credits: 3,
          type: "DEPARTMENT",
          departmentId: deptElectrical.id,
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
    console.log(`   ✓ Created ${subjects.length} subjects (6 department + 3 general)`);

    // 7. Create Curriculums
    console.log("🎓 Creating curriculums...");
    const curriculums = await Promise.all([
      prisma.curriculum.create({
        data: {
          name: "Chương trình CNTT",
          departmentId: dept.id,
          totalSemesters: 8,
          subjects: {
            create: subjects.slice(0, 3).map((s) => ({
              subjectId: s.id,
              semester: 1,
            })),
          },
        },
      }),
      prisma.curriculum.create({
        data: {
          name: "Chương trình KTDT",
          departmentId: deptElectrical.id,
          totalSemesters: 8,
          subjects: {
            create: subjects.slice(3, 6).map((s) => ({
              subjectId: s.id,
              semester: 1,
            })),
          },
        },
      }),
    ]);
    const curriculum = curriculums[0];
    const curriculumElectrical = curriculums[1];
    console.log(`   ✓ Created ${curriculums.length} curriculums`);

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

    // 8. Create Lecturer Users
    console.log("👨‍🏫 Creating lecturer users...");
    const lecturerUsers = await Promise.all([
      prisma.user.create({
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
      }),
      prisma.user.create({
        data: {
          email: "lecturer2@university.edu",
          fullName: "Lecturer 2",
          role: Role.LECTURER,
          passwordHash: await bcrypt.hash("Lecturer@123", 10),
          lecturer: {
            create: {
              lecturerCode: "GV002",
              departmentId: deptElectrical.id,
            },
          },
        },
      }),
    ]);
    const lecturerUser = lecturerUsers[0];
    const lecturerUser2 = lecturerUsers[1];
    console.log(`   ✓ Created ${lecturerUsers.length} lecturers`);

    // 9. Create Student Users
    console.log("🎓 Creating student users...");
    const studentUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: "student@university.edu",
          fullName: "Student User",
          role: Role.STUDENT,
          passwordHash: await bcrypt.hash("Student@123", 10),
          student: {
            create: {
              studentCode: "SV001",
              departmentId: dept.id,
              majorId: major.id,
              classGroupId: classGroup.id,
              curriculumId: curriculums[0].id,
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          email: "soukthavilay@university.edu",
          fullName: "Bouphaphan Soukthavilay",
          role: Role.STUDENT,
          passwordHash: await bcrypt.hash("Student@123", 10),
          student: {
            create: {
              studentCode: "SV002",
              departmentId: deptElectrical.id,
              majorId: majorElectrical.id,
              classGroupId: classGroupElectrical.id,
              curriculumId: curriculumElectrical.id,
            },
          },
        },
      }),
    ]);
    const studentUser = studentUsers[0];
    const studentUser2 = studentUsers[1];
    console.log(`   ✓ Created ${studentUsers.length} students`);

    // Get lecturer IDs
    const lecturer = await prisma.lecturer.findUnique({
      where: { userId: lecturerUser.id },
    });
    const lecturer2 = await prisma.lecturer.findUnique({
      where: { userId: lecturerUser2.id },
    });

    // 10. Create Sections (9 sections: 6 department + 3 general)
    console.log("📖 Creating sections...");
    const sections = await Promise.all([
      // CNTT department subjects - 2 sections each
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
      // KTDT department subjects - 1 section each
      prisma.section.create({
        data: {
          code: "DIEN-AC-01",
          subjectId: subjects[3].id,
          semesterId: semester.id,
          classGroupId: classGroupElectrical.id,
          capacity: 30,
        },
      }),
      prisma.section.create({
        data: {
          code: "DIEN-DC-01",
          subjectId: subjects[4].id,
          semesterId: semester.id,
          classGroupId: classGroupElectrical.id,
          capacity: 30,
        },
      }),
      prisma.section.create({
        data: {
          code: "DIEN-NANG-01",
          subjectId: subjects[5].id,
          semesterId: semester.id,
          classGroupId: classGroupElectrical.id,
          capacity: 30,
        },
      }),
      // General subjects - 1 section each
      prisma.section.create({
        data: {
          code: "PHIL101-01",
          subjectId: subjects[6].id,
          semesterId: semester.id,
          classGroupId: null,
          capacity: 50,
        },
      }),
      prisma.section.create({
        data: {
          code: "LAW101-01",
          subjectId: subjects[7].id,
          semesterId: semester.id,
          classGroupId: null,
          capacity: 50,
        },
      }),
      prisma.section.create({
        data: {
          code: "HIST101-01",
          subjectId: subjects[8].id,
          semesterId: semester.id,
          classGroupId: null,
          capacity: 50,
        },
      }),
    ]);
    console.log(`   ✓ Created ${sections.length} sections (9 department + 3 general)`);

    // 11. Assign Lecturers to Sections
    console.log("📋 Assigning lecturers...");
    await Promise.all([
      // CNTT sections -> lecturer 1
      ...sections.slice(0, 6).map((section) =>
        prisma.teachingAssignment.create({
          data: {
            sectionId: section.id,
            lecturerId: lecturer.id,
          },
        })
      ),
      // KTDT sections -> lecturer 2
      ...sections.slice(6, 9).map((section) =>
        prisma.teachingAssignment.create({
          data: {
            sectionId: section.id,
            lecturerId: lecturer2.id,
          },
        })
      ),
      // General sections -> lecturer 1
      ...sections.slice(9).map((section) =>
        prisma.teachingAssignment.create({
          data: {
            sectionId: section.id,
            lecturerId: lecturer.id,
          },
        })
      ),
    ]);
    console.log(`   ✓ Assigned lecturers to ${sections.length} sections`);

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
    console.log(`   - Semesters: 1 (HK1 2024-2025 - ENROLLMENT)`);
    console.log(`   - Departments: 2 (CNTT, KTDT)`);
    console.log(`   - Majors: 2 (CNTT-SE, KTDT-AC)`);
    console.log(`   - Class Groups: 2 (CNTT-K20, KTDT-AC-1)`);
    console.log(`   - Subjects: 9 (6 department + 3 general)`);
    console.log(`   - Sections: 12 (9 department + 3 general)`);
    console.log(`   - Schedules: ${schedules.length}`);
    console.log(`   - Exams: ${exams.length}`);
    console.log(`\n📚 Subject Details:`);
    console.log(`   CNTT: JAVA101, DB101, NET101 (each has 2 sections)`);
    console.log(`   KTDT: DIEN-AC, DIEN-DC, DIEN-NANG (each has 1 section)`);
    console.log(`   General: PHIL101, LAW101, HIST101 (each has 1 section)`);
    console.log(`\n🔐 Test Accounts:`);
    console.log(`   Admin: admin@university.edu / Admin@123`);
    console.log(`   Lecturer 1 (CNTT): lecturer@university.edu / Lecturer@123`);
    console.log(`   Lecturer 2 (KTDT): lecturer2@university.edu / Lecturer@123`);
    console.log(`   Student 1 (CNTT): student@university.edu / Student@123`);
    console.log(`   Student 2 (KTDT): soukthavilay@university.edu / Student@123`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
