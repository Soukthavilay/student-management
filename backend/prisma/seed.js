import bcrypt from "bcryptjs";
import { PrismaClient, AnnouncementScope, Role, SemesterStatus, RoomType, SubjectType } from "@prisma/client";

const prisma = new PrismaClient();

/* ───────────── DATA ───────────── */

const DEPARTMENTS = [
  {
    code: "CNTT",
    name: "Công nghệ thông tin",
    curriculumName: "CTĐT Công nghệ thông tin",
    classes: [
      { code: "CNTT01", name: "CNTT Khóa 2025 - Lớp 1" },
      { code: "CNTT02", name: "CNTT Khóa 2025 - Lớp 2" },
    ],
    lecturers: [
      { code: "GV001", name: "Nguyễn Văn Hùng",   title: "TS.",  email: "hung.nv@school.edu.vn" },
      { code: "GV002", name: "Trần Thị Mai",       title: "ThS.", email: "mai.tt@school.edu.vn" },
      { code: "GV003", name: "Lê Quốc Bảo",        title: "PGS.TS.", email: "bao.lq@school.edu.vn" },
    ],
    subjects: [
      // Năm 1 - HK1 (semester 1)
      { code: "NMLT",  name: "Nhập môn lập trình",         credits: 3, semester: 1 },
      { code: "TH101", name: "Tin học đại cương",           credits: 3, semester: 1 },
      { code: "TOAN1", name: "Toán cao cấp 1",             credits: 3, semester: 1 },
      { code: "LLCT1", name: "Triết học Mác - Lênin",      credits: 3, semester: 1 },
      { code: "AV1",   name: "Tiếng Anh 1",                credits: 2, semester: 1 },
      // Năm 1 - HK2 (semester 2)
      { code: "CTDL",  name: "Cấu trúc dữ liệu & GT",     credits: 3, semester: 2 },
      { code: "TOAN2", name: "Toán cao cấp 2",             credits: 3, semester: 2 },
      { code: "XSTK",  name: "Xác suất thống kê",          credits: 3, semester: 2 },
      { code: "LLCT2", name: "Kinh tế chính trị ML",       credits: 2, semester: 2 },
      { code: "AV2",   name: "Tiếng Anh 2",                credits: 2, semester: 2 },
      // Năm 2 - HK1 (semester 3)
      { code: "CSDL",  name: "Cơ sở dữ liệu",             credits: 3, semester: 3 },
      { code: "MMT",   name: "Mạng máy tính",              credits: 3, semester: 3 },
      { code: "LTJV",  name: "Lập trình Java",             credits: 3, semester: 3 },
      { code: "TKMM",  name: "Toán rời rạc",               credits: 3, semester: 3 },
      // Năm 2 - HK2 (semester 4)
      { code: "HDH",   name: "Hệ điều hành",               credits: 3, semester: 4 },
      { code: "LTPY",  name: "Lập trình Python",           credits: 3, semester: 4 },
      { code: "PTTKHT", name: "Phân tích thiết kế HT",     credits: 3, semester: 4 },
      { code: "LTHDT", name: "Lập trình hướng đối tượng",  credits: 3, semester: 4 },
      // Năm 3 - HK1 (semester 5)
      { code: "CNPM",  name: "Công nghệ phần mềm",         credits: 3, semester: 5 },
      { code: "PTUD",  name: "Phát triển ứng dụng Web",    credits: 3, semester: 5 },
      { code: "ATTT",  name: "An toàn thông tin",           credits: 3, semester: 5 },
      { code: "LTMB",  name: "Lập trình di động",           credits: 3, semester: 5 },
      // Năm 3 - HK2 (semester 6)
      { code: "TTNT",  name: "Trí tuệ nhân tạo",           credits: 3, semester: 6 },
      { code: "DPT",   name: "Dữ liệu lớn",               credits: 3, semester: 6 },
      { code: "KTPM",  name: "Kiểm thử phần mềm",          credits: 3, semester: 6 },
      { code: "QLDA",  name: "Quản lý dự án CNTT",         credits: 2, semester: 6 },
      // Năm 4 - HK1 (semester 7)
      { code: "HTTT",  name: "Hệ thống thông tin",          credits: 3, semester: 7 },
      { code: "IOT",   name: "Internet vạn vật (IoT)",      credits: 3, semester: 7 },
      { code: "TTDN",  name: "Thực tập doanh nghiệp",      credits: 3, semester: 7 },
      // Năm 4 - HK2 (semester 8)
      { code: "DATN1", name: "Đồ án tốt nghiệp (CNTT)",    credits: 5, semester: 8 },
      { code: "CNTD",  name: "Chuyên đề tốt nghiệp",       credits: 3, semester: 8 },
    ],
    students: [
      { code: "SV001", name: "Trần Văn An",       phone: "0901000001", address: "Đà Nẵng",       classIdx: 0 },
      { code: "SV002", name: "Nguyễn Thị Bình",   phone: "0901000002", address: "Huế",            classIdx: 0 },
      { code: "SV003", name: "Lê Hoàng Cường",    phone: "0901000003", address: "Quảng Nam",      classIdx: 0 },
      { code: "SV004", name: "Phạm Minh Đức",     phone: "0901000004", address: "Đà Nẵng",       classIdx: 1 },
      { code: "SV005", name: "Võ Thị Em",         phone: "0901000005", address: "Quảng Ngãi",     classIdx: 1 },
      { code: "SV006", name: "Hoàng Văn Phú",     phone: "0901000006", address: "Đà Nẵng",       classIdx: 1 },
    ],
  },
  {
    code: "QTKD",
    name: "Quản trị kinh doanh",
    curriculumName: "CTĐT Quản trị kinh doanh",
    classes: [
      { code: "QTKD01", name: "QTKD Khóa 2025 - Lớp 1" },
      { code: "QTKD02", name: "QTKD Khóa 2025 - Lớp 2" },
    ],
    lecturers: [
      { code: "GV004", name: "Phan Thị Lan",       title: "TS.",  email: "lan.pt@school.edu.vn" },
      { code: "GV005", name: "Đặng Quốc Vinh",     title: "ThS.", email: "vinh.dq@school.edu.vn" },
    ],
    subjects: [
      // Năm 1 - HK1 (semester 1)
      { code: "KTVM",  name: "Kinh tế vi mô",              credits: 3, semester: 1 },
      { code: "NLQT",  name: "Nguyên lý quản trị",          credits: 3, semester: 1 },
      { code: "LLCTQ", name: "Triết học Mác - Lênin",       credits: 3, semester: 1 },
      { code: "AVQ1",  name: "Tiếng Anh 1",                 credits: 2, semester: 1 },
      { code: "TOAN1Q", name: "Toán kinh tế",               credits: 3, semester: 1 },
      // Năm 1 - HK2 (semester 2)
      { code: "KTVMO", name: "Kinh tế vĩ mô",              credits: 3, semester: 2 },
      { code: "NLKTQ", name: "Nguyên lý kế toán",           credits: 3, semester: 2 },
      { code: "LLCTQ2", name: "Kinh tế chính trị ML",       credits: 2, semester: 2 },
      { code: "AVQ2",  name: "Tiếng Anh 2",                 credits: 2, semester: 2 },
      { code: "PLDC",  name: "Pháp luật đại cương",         credits: 2, semester: 2 },
      // Năm 2 - HK1 (semester 3)
      { code: "MKTG",  name: "Marketing căn bản",            credits: 3, semester: 3 },
      { code: "QTTC",  name: "Quản trị tài chính",          credits: 3, semester: 3 },
      { code: "LKT",   name: "Luật kinh tế",                credits: 2, semester: 3 },
      { code: "TKUD",  name: "Thống kê ứng dụng",           credits: 3, semester: 3 },
      // Năm 2 - HK2 (semester 4)
      { code: "QTNS",  name: "Quản trị nhân sự",            credits: 3, semester: 4 },
      { code: "TMDT",  name: "Thương mại điện tử",          credits: 3, semester: 4 },
      { code: "QTKHO", name: "Quản trị chuỗi cung ứng",    credits: 3, semester: 4 },
      { code: "KTTCQ", name: "Kế toán tài chính",           credits: 3, semester: 4 },
      // Năm 3 - HK1 (semester 5)
      { code: "QTCL",  name: "Quản trị chiến lược",         credits: 3, semester: 5 },
      { code: "QTSX",  name: "Quản trị sản xuất",           credits: 3, semester: 5 },
      { code: "MKTN",  name: "Marketing nâng cao",           credits: 3, semester: 5 },
      // Năm 3 - HK2 (semester 6)
      { code: "QTRR",  name: "Quản trị rủi ro",             credits: 3, semester: 6 },
      { code: "DVKH",  name: "Quản trị dịch vụ",            credits: 3, semester: 6 },
      { code: "KNKD",  name: "Khởi nghiệp kinh doanh",     credits: 3, semester: 6 },
      // Năm 4 - HK1 (semester 7)
      { code: "TTDNQ", name: "Thực tập doanh nghiệp",      credits: 3, semester: 7 },
      { code: "PTDA",  name: "Phân tích dự án đầu tư",      credits: 3, semester: 7 },
      { code: "KDQT",  name: "Kinh doanh quốc tế",          credits: 3, semester: 7 },
      // Năm 4 - HK2 (semester 8)
      { code: "DATN2", name: "Đồ án tốt nghiệp (QTKD)",    credits: 5, semester: 8 },
      { code: "CDTNQ", name: "Chuyên đề tốt nghiệp",       credits: 3, semester: 8 },
    ],
    students: [
      { code: "SV007", name: "Nguyễn Thị Giang",  phone: "0902000001", address: "Đà Nẵng",  classIdx: 0 },
      { code: "SV008", name: "Trần Văn Hải",      phone: "0902000002", address: "Huế",       classIdx: 0 },
      { code: "SV009", name: "Lê Thị Ích",        phone: "0902000003", address: "Đà Nẵng",  classIdx: 0 },
      { code: "SV010", name: "Phạm Quốc Khánh",   phone: "0902000004", address: "Quảng Nam", classIdx: 1 },
      { code: "SV011", name: "Võ Văn Long",       phone: "0902000005", address: "Đà Nẵng",  classIdx: 1 },
    ],
  },
  {
    code: "KT",
    name: "Kế toán",
    curriculumName: "CTĐT Kế toán",
    classes: [
      { code: "KT01", name: "Kế toán Khóa 2025 - Lớp 1" },
    ],
    lecturers: [
      { code: "GV006", name: "Huỳnh Thị Ngọc",     title: "TS.",  email: "ngoc.ht@school.edu.vn" },
      { code: "GV007", name: "Ngô Đình Phong",      title: "ThS.", email: "phong.nd@school.edu.vn" },
    ],
    subjects: [
      // Năm 1 - HK1 (semester 1)
      { code: "NLKT",  name: "Nguyên lý kế toán",          credits: 3, semester: 1 },
      { code: "KTVM2", name: "Kinh tế vi mô",              credits: 3, semester: 1 },
      { code: "LLCTK", name: "Triết học Mác - Lênin",       credits: 3, semester: 1 },
      { code: "AVK1",  name: "Tiếng Anh 1",                 credits: 2, semester: 1 },
      { code: "TK",    name: "Toán kinh tế",                credits: 3, semester: 1 },
      // Năm 1 - HK2 (semester 2)
      { code: "TCKD",  name: "Tài chính doanh nghiệp",      credits: 3, semester: 2 },
      { code: "KTVMO2", name: "Kinh tế vĩ mô",              credits: 3, semester: 2 },
      { code: "LLCTK2", name: "Kinh tế chính trị ML",        credits: 2, semester: 2 },
      { code: "AVK2",  name: "Tiếng Anh 2",                  credits: 2, semester: 2 },
      { code: "TKUDK",  name: "Thống kê ứng dụng",            credits: 3, semester: 2 },
      // Năm 2 - HK1 (semester 3)
      { code: "KTTC",  name: "Kế toán tài chính 1",         credits: 3, semester: 3 },
      { code: "LKTK",  name: "Luật kế toán",                credits: 2, semester: 3 },
      { code: "THKT",  name: "Tin học kế toán",              credits: 3, semester: 3 },
      { code: "TCTT",  name: "Tài chính - Tiền tệ",         credits: 3, semester: 3 },
      // Năm 2 - HK2 (semester 4)
      { code: "KTTC2", name: "Kế toán tài chính 2",         credits: 3, semester: 4 },
      { code: "KTQT",  name: "Kế toán quản trị",            credits: 3, semester: 4 },
      { code: "THUE",  name: "Thuế",                         credits: 3, semester: 4 },
      { code: "TTCK",  name: "Thị trường chứng khoán",      credits: 2, semester: 4 },
      // Năm 3 - HK1 (semester 5)
      { code: "KTOM",  name: "Kiểm toán",                   credits: 3, semester: 5 },
      { code: "KTCP",  name: "Kế toán chi phí",             credits: 3, semester: 5 },
      { code: "KTNN",  name: "Kế toán ngân hàng",           credits: 3, semester: 5 },
      // Năm 3 - HK2 (semester 6)
      { code: "PTTC",  name: "Phân tích tài chính",         credits: 3, semester: 6 },
      { code: "KTQTC", name: "Kế toán quốc tế",             credits: 3, semester: 6 },
      { code: "HTTTKT", name: "Hệ thống TT kế toán",        credits: 3, semester: 6 },
      // Năm 4 - HK1 (semester 7)
      { code: "TTDNK", name: "Thực tập doanh nghiệp",      credits: 3, semester: 7 },
      { code: "BCTC",  name: "Lập & Phân tích BCTC",        credits: 3, semester: 7 },
      // Năm 4 - HK2 (semester 8)
      { code: "DATN3", name: "Đồ án tốt nghiệp (KT)",      credits: 5, semester: 8 },
      { code: "CDTNK", name: "Chuyên đề tốt nghiệp",       credits: 3, semester: 8 },
    ],
    students: [
      { code: "SV012", name: "Đỗ Thị Mai",        phone: "0903000001", address: "Đà Nẵng",      classIdx: 0 },
      { code: "SV013", name: "Bùi Văn Nam",       phone: "0903000002", address: "Quảng Trị",     classIdx: 0 },
      { code: "SV014", name: "Trương Thị Oanh",   phone: "0903000003", address: "Huế",           classIdx: 0 },
      { code: "SV015", name: "Lý Văn Phước",      phone: "0903000004", address: "Đà Nẵng",      classIdx: 0 },
    ],
  },
  {
    code: "NNA",
    name: "Ngôn ngữ Anh",
    curriculumName: "CTĐT Ngôn ngữ Anh",
    classes: [
      { code: "NNA01", name: "Ngôn ngữ Anh Khóa 2025 - Lớp 1" },
      { code: "NNA02", name: "Ngôn ngữ Anh Khóa 2025 - Lớp 2" },
    ],
    lecturers: [
      { code: "GV008", name: "Nguyễn Thị Quỳnh",   title: "ThS.", email: "quynh.nt@school.edu.vn" },
      { code: "GV009", name: "David Smith",         title: "MA.",  email: "david.s@school.edu.vn" },
    ],
    subjects: [
      // Năm 1 - HK1 (semester 1)
      { code: "NPTA",  name: "Ngữ pháp tiếng Anh",         credits: 3, semester: 1 },
      { code: "NS1",   name: "Nghe - Nói 1",                credits: 2, semester: 1 },
      { code: "DH1",   name: "Đọc hiểu 1",                  credits: 3, semester: 1 },
      { code: "LLCTN", name: "Triết học Mác - Lênin",        credits: 3, semester: 1 },
      { code: "NNH1",  name: "Dẫn nhập ngôn ngữ học",       credits: 2, semester: 1 },
      // Năm 1 - HK2 (semester 2)
      { code: "VHT",   name: "Viết học thuật",               credits: 3, semester: 2 },
      { code: "NS2",   name: "Nghe - Nói 2",                 credits: 2, semester: 2 },
      { code: "DH2",   name: "Đọc hiểu 2",                   credits: 3, semester: 2 },
      { code: "LLCTN2", name: "Kinh tế chính trị ML",         credits: 2, semester: 2 },
      { code: "NV1",   name: "Ngữ âm học",                    credits: 2, semester: 2 },
      // Năm 2 - HK1 (semester 3)
      { code: "NS3",   name: "Nghe - Nói 3",                  credits: 2, semester: 3 },
      { code: "VHT2",  name: "Viết nâng cao",                 credits: 3, semester: 3 },
      { code: "NPDH",  name: "Ngữ pháp nâng cao",            credits: 3, semester: 3 },
      { code: "VHAB",  name: "Văn hóa Anh - Mỹ",            credits: 3, semester: 3 },
      // Năm 2 - HK2 (semester 4)
      { code: "NS4",   name: "Nghe - Nói 4",                  credits: 2, semester: 4 },
      { code: "BPD1",  name: "Biên dịch 1",                   credits: 3, semester: 4 },
      { code: "VHAM",  name: "Văn học Anh - Mỹ",             credits: 3, semester: 4 },
      { code: "NNDH",  name: "Ngôn ngữ học đối chiếu",       credits: 3, semester: 4 },
      // Năm 3 - HK1 (semester 5)
      { code: "BPD2",  name: "Biên dịch 2",                   credits: 3, semester: 5 },
      { code: "PDC",   name: "Phiên dịch cabin",              credits: 3, semester: 5 },
      { code: "TATM",  name: "Tiếng Anh thương mại",         credits: 3, semester: 5 },
      // Năm 3 - HK2 (semester 6)
      { code: "NNH",   name: "Ngôn ngữ học đại cương",       credits: 3, semester: 6 },
      { code: "TADL",  name: "Tiếng Anh du lịch",            credits: 3, semester: 6 },
      { code: "PPGD",  name: "Phương pháp giảng dạy TA",     credits: 3, semester: 6 },
      // Năm 4 - HK1 (semester 7)
      { code: "TTDNN", name: "Thực tập doanh nghiệp",        credits: 3, semester: 7 },
      { code: "NCNN",  name: "Nghiên cứu ngôn ngữ",          credits: 3, semester: 7 },
      // Năm 4 - HK2 (semester 8)
      { code: "DATN4", name: "Đồ án tốt nghiệp (NNA)",      credits: 5, semester: 8 },
      { code: "CDTNN", name: "Chuyên đề tốt nghiệp",        credits: 3, semester: 8 },
    ],
    students: [
      { code: "SV016", name: "Cao Thị Rạng",      phone: "0904000001", address: "Đà Nẵng",  classIdx: 0 },
      { code: "SV017", name: "Đinh Văn Sơn",      phone: "0904000002", address: "Huế",       classIdx: 0 },
      { code: "SV018", name: "Hà Thị Tuyết",      phone: "0904000003", address: "Đà Nẵng",  classIdx: 0 },
      { code: "SV019", name: "Nguyễn Văn Uy",     phone: "0904000004", address: "Quảng Nam", classIdx: 1 },
      { code: "SV020", name: "Trần Thị Vi",       phone: "0904000005", address: "Đà Nẵng",  classIdx: 1 },
    ],
  },
];

const ROOMS = [
  "A101", "A102", "A201", "A202", "A301",
  "B101", "B102", "B201", "B202",
  "C101", "C201", "C301",
];

const TIME_SLOTS = [
  { start: "07:30", end: "09:30" },
  { start: "09:45", end: "11:45" },
  { start: "13:30", end: "15:30" },
  { start: "15:45", end: "17:45" },
];

const ACADEMIC_YEAR = "2025-2026";

/* ───────────── HELPERS ───────────── */

let slotIdx = 0;
function nextSlot() {
  const slot = TIME_SLOTS[slotIdx % TIME_SLOTS.length];
  slotIdx++;
  return slot;
}

let roomIdx = 0;
function nextRoom() {
  const room = ROOMS[roomIdx % ROOMS.length];
  roomIdx++;
  return room;
}

let dayCounter = 2;
function nextDay() {
  const d = dayCounter;
  dayCounter = dayCounter >= 7 ? 2 : dayCounter + 1;
  return d;
}

function toEmail(code) {
  return `${code.toLowerCase()}@school.edu.vn`;
}

/* ───────────── MAIN ───────────── */

async function main() {
  // Clean up
  await prisma.paymentTransaction.deleteMany();
  await prisma.examRegistration.deleteMany();
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
  await prisma.major.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.room.deleteMany();

  // ─── Rooms ───
  const roomRecords = [];
  for (const r of ROOMS) {
    const rm = await prisma.room.create({
      data: { name: r, capacity: 60, type: RoomType.THEORY },
    });
    roomRecords.push(rm);
  }

  // ─── Semesters ───
  const semesterHK1 = await prisma.semester.create({
    data: { name: "HK1", academicYear: ACADEMIC_YEAR, startDate: new Date("2025-08-15"), endDate: new Date("2025-12-30"), status: SemesterStatus.ONGOING },
  });
  const semesterHK2 = await prisma.semester.create({
    data: { name: "HK2", academicYear: ACADEMIC_YEAR, startDate: new Date("2026-01-15"), endDate: new Date("2026-05-30"), status: SemesterStatus.UPCOMING },
  });

  const commonHash = await bcrypt.hash("123456", 10);
  const adminHash = await bcrypt.hash("Admin@123", 10);

  // ─── Admin ───
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@university.edu",
      fullName: "Quản trị hệ thống",
      role: Role.ADMIN,
      passwordHash: adminHash,
      admin: { create: {} },
    },
  });

  // ─── Per-department seed ───
  for (const dept of DEPARTMENTS) {
    const department = await prisma.department.create({
      data: { code: dept.code, name: dept.name },
    });

    // Major (one default major per department)
    const major = await prisma.major.create({
      data: { code: dept.code, name: dept.name, departmentId: department.id },
    });

    // Classes
    const classGroups = [];
    for (const cls of dept.classes) {
      const cg = await prisma.classGroup.create({
        data: { code: cls.code, name: cls.name, departmentId: department.id, majorId: major.id },
      });
      classGroups.push(cg);
    }

    // Subjects
    const subjectRecords = [];
    for (const subj of dept.subjects) {
      const s = await prisma.subject.create({
        data: {
          code: subj.code,
          name: subj.name,
          credits: subj.credits,
          departmentId: department.id,
          type: (subj.code.startsWith("LLCT") || subj.code.startsWith("TH1") || subj.code.startsWith("AV")) ? SubjectType.GENERAL : SubjectType.SPECIALIZED,
        },
      });
      subjectRecords.push({ ...s, semester: subj.semester });
    }

    // Curriculum
    await prisma.curriculum.create({
      data: {
        departmentId: department.id,
        name: dept.curriculumName,
        totalSemesters: 8,
        subjects: {
          create: subjectRecords.map((s) => ({
            subjectId: s.id,
            semester: s.semester,
          })),
        },
      },
    });

    // Lecturers
    const lecturerRecords = [];
    for (const lec of dept.lecturers) {
      const u = await prisma.user.create({
        data: {
          email: lec.email,
          fullName: lec.name,
          role: Role.LECTURER,
          passwordHash: commonHash,
          lecturer: {
            create: {
              lecturerCode: lec.code,
              departmentId: department.id,
              title: lec.title,
            },
          },
        },
        include: { lecturer: true },
      });
      lecturerRecords.push(u.lecturer);
    }

    // Sections: semester 1 = HK1 Year1, semester 2 = HK2 Year1
    // Students are year 1 (2025-2026), so create sections for semester 1 & 2
    const sectionRecords = [];
    for (const cg of classGroups) {
      for (const subj of subjectRecords) {
        if (subj.semester > 2) continue; // Only open sections for year 1
        // semester 1 (odd) = HK1, semester 2 (even) = HK2
        const hk = subj.semester % 2 === 1 ? semesterHK1.id : semesterHK2.id;
        const sec = await prisma.section.create({
          data: {
            code: `${subj.code}-${cg.code}-2526`,
            subjectId: subj.id,
            classGroupId: cg.id,
            semesterId: hk,
            capacity: 40,
          },
        });
        sectionRecords.push({ ...sec, _subj: subj, _cg: cg });
      }
    }

    // Teaching assignments: round-robin lecturers
    for (let i = 0; i < sectionRecords.length; i++) {
      const lec = lecturerRecords[i % lecturerRecords.length];
      await prisma.teachingAssignment.create({
        data: {
          sectionId: sectionRecords[i].id,
          lecturerId: lec.id,
        },
      });
    }

    // Schedules: 2 sessions per section
    for (const sec of sectionRecords) {
      const day1 = nextDay();
      let day2 = nextDay();
      if (day2 === day1) day2 = day2 >= 7 ? 2 : day2 + 1;

      await prisma.schedule.createMany({
        data: [
          { sectionId: sec.id, dayOfWeek: day1, shift: 1, roomId: roomRecords[Math.floor(Math.random() * roomRecords.length)].id },
          { sectionId: sec.id, dayOfWeek: day2, shift: 2, roomId: roomRecords[Math.floor(Math.random() * roomRecords.length)].id },
        ],
      });
    }

    // Exams: for HK1 sections only
    const hk1Sections = sectionRecords.filter((s) => s._subj.semester === 1);
    let examDay = 15;
    for (const sec of hk1Sections) {
      await prisma.exam.create({
        data: {
          sectionId: sec.id,
          examDate: new Date(`2026-01-${String(examDay).padStart(2, "0")}T08:00:00Z`),
          roomId: roomRecords[Math.floor(Math.random() * roomRecords.length)].id,
          type: "Cuối kỳ",
        },
      });
      examDay++;
      if (examDay > 28) examDay = 15;
    }

    // Students
    const studentRecords = [];
    for (const stu of dept.students) {
      const cg = classGroups[stu.classIdx];
      const u = await prisma.user.create({
        data: {
          email: toEmail(stu.code),
          fullName: stu.name,
          role: Role.STUDENT,
          passwordHash: commonHash,
          student: {
            create: {
              studentCode: stu.code,
              departmentId: department.id,
              majorId: major.id,
              classGroupId: cg.id,
              phone: stu.phone,
              address: stu.address,
              currentSemester: 1,
            },
          },
        },
        include: { student: true },
      });
      studentRecords.push({ ...u.student, _classGroupId: cg.id });
    }

    // Enrollments: enroll all students into HK1 sections matching their class
    const enrollmentRecords = [];
    for (const stu of studentRecords) {
      const mySections = sectionRecords.filter(
        (s) => s._subj.semester === 1 && s._cg.id === stu._classGroupId
      );
      for (const sec of mySections) {
        const enr = await prisma.enrollment.create({
          data: { sectionId: sec.id, studentId: stu.id },
        });
        enrollmentRecords.push({ ...enr, _subj: sec._subj, _stuCode: stu.studentCode });
      }
    }

    // Grades: give grades to the first 2 students of each department
    const gradedStudentCodes = dept.students.slice(0, 2).map((s) => s.code);
    for (const enr of enrollmentRecords) {
      if (!gradedStudentCodes.includes(enr._stuCode)) continue;
      const finalScore = +(7 + Math.random() * 3).toFixed(1);
      const gpaPoint = finalScore >= 9 ? 4.0 : finalScore >= 8 ? 3.5 : finalScore >= 7 ? 3.0 : 2.5;
      await prisma.grade.create({
        data: {
          enrollmentId: enr.id,
          finalScore,
          gpaPoint,
          status: "SUBMITTED",
          submittedAt: new Date(),
          components: {
            create: [
              { name: "Chuyên cần",  weight: 0.1, score: +(7 + Math.random() * 3).toFixed(1) },
              { name: "Giữa kỳ",    weight: 0.3, score: +(6 + Math.random() * 4).toFixed(1) },
              { name: "Cuối kỳ",     weight: 0.6, score: +(6 + Math.random() * 4).toFixed(1) },
            ],
          },
        },
      });
    }

    // Announcement per department
    await prisma.announcement.create({
      data: {
        title: `Thông báo lịch học kỳ 1 - Khoa ${dept.name}`,
        content: `Sinh viên Khoa ${dept.name} xem lịch học kỳ 1 năm học ${ACADEMIC_YEAR} trên hệ thống.`,
        scope: AnnouncementScope.DEPARTMENT,
        departmentId: department.id,
        createdById: adminUser.id,
      },
    });

    console.log(`  ✓ ${dept.code}: ${dept.subjects.length} môn, ${dept.lecturers.length} GV, ${dept.students.length} SV, ${sectionRecords.length} HP, ${enrollmentRecords.length} đăng ký`);
  }

  // Global announcement
  const globalAnn = await prisma.announcement.create({
    data: {
      title: "Chào mừng năm học mới 2025-2026",
      content: "Nhà trường chúc toàn thể sinh viên một năm học mới thành công. Vui lòng kiểm tra lịch học trên hệ thống.",
      scope: AnnouncementScope.ALL,
      createdById: adminUser.id,
    },
  });

  // Tuition Config: credit price for 2025-2026
  await prisma.tuitionConfig.createMany({
    data: [
      { semesterId: semesterHK1.id, creditPrice: 500000, isActive: true },
      { semesterId: semesterHK2.id, creditPrice: 500000, isActive: true },
    ],
  });
  console.log("  ✓ Cấu hình giá tín chỉ: 500.000đ/TC cho 2025-2026 HK1 & HK2");

  // Notifications for first student of each dept
  const firstStudents = await prisma.student.findMany({
    where: { studentCode: { in: ["SV001", "SV007", "SV012", "SV016"] } },
    include: { user: true },
  });
  for (const stu of firstStudents) {
    await prisma.notification.create({
      data: {
        userId: stu.userId,
        announcementId: globalAnn.id,
        title: globalAnn.title,
        body: globalAnn.content,
      },
    });
  }

  console.log("\n═══════════════════════════════════════");
  console.log("  Seed hoàn tất!");
  console.log("═══════════════════════════════════════");
  console.log("  Admin:       admin@university.edu / Admin@123");
  console.log("  Giảng viên:  hung.nv@school.edu.vn  / 123456");
  console.log("  Sinh viên:   sv001@school.edu.vn     / 123456");
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
