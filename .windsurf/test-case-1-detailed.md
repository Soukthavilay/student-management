# Test Case 1: Tạo Dữ liệu Cơ bản - Hướng dẫn Chi tiết

## Chuẩn bị
- Mở web-admin: http://localhost:5173/
- Đăng nhập với tài khoản admin (admin@university.edu / Admin@123)
- Backend đang chạy: http://localhost:3000

---

## Bước 1: Tạo Khoa (Department)

**Đường dẫn:** Academics → Departments

1. Bấm tab "Departments"
2. Nhập thông tin:
   - **Code:** CNTT
   - **Name:** Khoa Công nghệ Thông tin
3. Bấm "Create"
✓ Kiểm tra: Khoa CNTT xuất hiện trong danh sách

---

## Bước 2: Tạo Lớp (Class Group)

**Đường dẫn:** Academics → Class Groups

1. Bấm tab "Class Groups"
2. Nhập thông tin:
   - **Code:** CNTT-K20
   - **Name:** Lớp CNTT K20
   - **Department:** Khoa Công nghệ Thông tin
3. Bấm "Create"
✓ Kiểm tra: Lớp CNTT-K20 xuất hiện trong danh sách

---

## Bước 3: Tạo Phòng học (Rooms)

**Đường dẫn:** Academics → Rooms

1. Bấm tab "Rooms"
2. Tạo 3 phòng:
   - **Room 1:** Code: A101, Name: Phòng A101, Capacity: 50
   - **Room 2:** Code: A102, Name: Phòng A102, Capacity: 50
   - **Room 3:** Code: A103, Name: Phòng A103, Capacity: 50
3. Bấm "Create" cho mỗi phòng
✓ Kiểm tra: 3 phòng xuất hiện trong danh sách

---

## Bước 4: Tạo Học kỳ (Semesters)

**Đường dẫn:** Academics → Semesters

1. Bấm tab "Semesters"
2. Tạo 1 học kỳ:
   - **Name:** HK1
   - **Academic Year:** 2024-2025
   - **Status:** ENROLLMENT (để sinh viên có thể đăng ký)
   - **Start Date:** 01/09/2024
   - **End Date:** 31/12/2024
3. Bấm "Create"
✓ Kiểm tra: Học kỳ HK1 2024-2025 xuất hiện, Status = ENROLLMENT

---

## Bước 5: Tạo Môn học (Subjects)

**Đường dẫn:** Academics → Subjects

1. Bấm tab "Subjects"
2. Tạo 3 môn học:

**Môn 1:**
- Code: JAVA101
- Name: Lập trình Java
- Credits: 3
- Type: GENERAL
- Department: (để trống vì GENERAL)

**Môn 2:**
- Code: DB101
- Name: Cơ sở dữ liệu
- Credits: 3
- Type: GENERAL
- Department: (để trống)

**Môn 3:**
- Code: NET101
- Name: Mạng máy tính
- Credits: 3
- Type: GENERAL
- Department: (để trống)

3. Bấm "Create" cho mỗi môn
✓ Kiểm tra: 3 môn xuất hiện trong danh sách

---

## Bước 6: Tạo Chương trình đào tạo (Curriculum)

**Đường dẫn:** Academics → Curriculum

1. Bấm tab "Curriculum"
2. Nhập thông tin:
   - **Name:** Chương trình CNTT
   - **Department:** Khoa Công nghệ Thông tin
   - **Total Semesters:** 8
3. Bấm "Create"
✓ Kiểm tra: Chương trình CNTT xuất hiện

---

## Bước 7: Thêm Môn vào Chương trình

**Đường dẫn:** Academics → Curriculum (mở chương trình vừa tạo)

1. Bấm vào chương trình "Chương trình CNTT"
2. Bấm "Add Subject"
3. Thêm 3 môn vào HK1:

**Môn 1:**
- Subject: Lập trình Java
- Semester: 1

**Môn 2:**
- Subject: Cơ sở dữ liệu
- Semester: 1

**Môn 3:**
- Subject: Mạng máy tính
- Semester: 1

4. Bấm "Add" cho mỗi môn
✓ Kiểm tra: 3 môn xuất hiện trong chương trình, Semester = 1

---

## Bước 8: Tạo Sinh viên (Students)

**Đường dẫn:** Students

1. Bấm "Create Student"
2. Tạo 3 sinh viên:

**Sinh viên 1:**
- Student Code: SV001
- Full Name: Nguyễn Văn A
- Email: sv001@university.edu
- Department: Khoa Công nghệ Thông tin
- Class Group: Lớp CNTT K20
- Password: Student@123

**Sinh viên 2:**
- Student Code: SV002
- Full Name: Trần Thị B
- Email: sv002@university.edu
- Department: Khoa Công nghệ Thông tin
- Class Group: Lớp CNTT K20
- Password: Student@123

**Sinh viên 3:**
- Student Code: SV003
- Full Name: Lê Văn C
- Email: sv003@university.edu
- Department: Khoa Công nghệ Thông tin
- Class Group: Lớp CNTT K20
- Password: Student@123

3. Bấm "Create" cho mỗi sinh viên
✓ Kiểm tra: 3 sinh viên xuất hiện trong danh sách Students

---

## Bước 9: Tạo Giảng viên (Lecturers)

**Đường dẫn:** Lecturers

1. Bấm "Create Lecturer"
2. Tạo 2 giảng viên:

**Giảng viên 1:**
- Full Name: Phạm Văn X
- Email: gv001@university.edu
- Department: Khoa Công nghệ Thông tin
- Password: Lecturer@123

**Giảng viên 2:**
- Full Name: Hoàng Thị Y
- Email: gv002@university.edu
- Department: Khoa Công nghệ Thông tin
- Password: Lecturer@123

3. Bấm "Create" cho mỗi giảng viên
✓ Kiểm tra: 2 giảng viên xuất hiện trong danh sách Lecturers

---

## Bước 10: Tạo Lớp học phần (Sections)

**Đường dẫn:** Academics → Sections

1. Bấm tab "Sections"
2. Tạo 3 lớp học phần:

**Lớp 1:**
- Code: JAVA101-01
- Subject: Lập trình Java
- Semester: HK1 2024-2025
- Class Group: Lớp CNTT K20
- Capacity: 30

**Lớp 2:**
- Code: DB101-01
- Subject: Cơ sở dữ liệu
- Semester: HK1 2024-2025
- Class Group: Lớp CNTT K20
- Capacity: 30

**Lớp 3:**
- Code: NET101-01
- Subject: Mạng máy tính
- Semester: HK1 2024-2025
- Class Group: Lớp CNTT K20
- Capacity: 30

3. Bấm "Create" cho mỗi lớp
✓ Kiểm tra: 3 lớp học phần xuất hiện trong danh sách

---

## Bước 11: Gán Giảng viên vào Lớp (Assignments)

**Đường dẫn:** Assignments

1. Bấm "Assign Lecturer"
2. Gán giảng viên:

**Gán 1:**
- Section: JAVA101-01 (Lập trình Java)
- Lecturer: Phạm Văn X

**Gán 2:**
- Section: DB101-01 (Cơ sở dữ liệu)
- Lecturer: Hoàng Thị Y

**Gán 3:**
- Section: NET101-01 (Mạng máy tính)
- Lecturer: Phạm Văn X

3. Bấm "Assign" cho mỗi gán
✓ Kiểm tra: Danh sách phân công hiển thị 3 gán

---

## Bước 12: Tạo Lịch học (Schedules)

**Đường dẫn:** Academics → Schedules

1. Bấm tab "Schedules"
2. Tạo lịch cho mỗi lớp (3 buổi/tuần):

**Lớp JAVA101-01 (3 buổi):**
- Buổi 1: Day: 2 (Thứ 2), Shift: 1, Start: 07:00, End: 09:00, Room: A101
- Buổi 2: Day: 3 (Thứ 3), Shift: 1, Start: 07:00, End: 09:00, Room: A101
- Buổi 3: Day: 5 (Thứ 5), Shift: 1, Start: 07:00, End: 09:00, Room: A101

**Lớp DB101-01 (3 buổi):**
- Buổi 1: Day: 2 (Thứ 2), Shift: 2, Start: 09:00, End: 11:00, Room: A102
- Buổi 2: Day: 4 (Thứ 4), Shift: 2, Start: 09:00, End: 11:00, Room: A102
- Buổi 3: Day: 6 (Thứ 6), Shift: 2, Start: 09:00, End: 11:00, Room: A102

**Lớp NET101-01 (3 buổi):**
- Buổi 1: Day: 3 (Thứ 3), Shift: 2, Start: 09:00, End: 11:00, Room: A103
- Buổi 2: Day: 5 (Thứ 5), Shift: 2, Start: 09:00, End: 11:00, Room: A103
- Buổi 3: Day: 7 (Thứ 7), Shift: 2, Start: 09:00, End: 11:00, Room: A103

3. Bấm "Create" cho mỗi buổi
✓ Kiểm tra: 9 buổi học xuất hiện, không có trùng lịch

---

## Bước 13: Tạo Lịch thi (Exams)

**Đường dẫn:** Academics → Exams

1. Bấm tab "Exams"
2. Tạo 3 lịch thi:

**Thi 1:**
- Section: JAVA101-01
- Type: FINAL
- Exam Date: 15/12/2024 09:00
- Room: A101

**Thi 2:**
- Section: DB101-01
- Type: FINAL
- Exam Date: 16/12/2024 09:00
- Room: A102

**Thi 3:**
- Section: NET101-01
- Type: FINAL
- Exam Date: 17/12/2024 09:00
- Room: A103

3. Bấm "Create" cho mỗi thi
✓ Kiểm tra: 3 lịch thi xuất hiện

---

## Bước 14: Cấu hình Giá tín chỉ (Tuition Config)

**Đường dẫn:** Tuition

1. Bấm "Configure Tuition"
2. Nhập thông tin:
   - **Semester:** HK1 2024-2025
   - **Credit Price:** 500000 (500,000đ/TC)
   - **Is Active:** ✓ (checked)
3. Bấm "Save"
✓ Kiểm tra: Cấu hình giá tín chỉ xuất hiện

---

## Bước 15: Kiểm tra dữ liệu

1. **Sinh viên:** 3 sinh viên (SV001, SV002, SV003)
2. **Giảng viên:** 2 giảng viên (GV1, GV2)
3. **Lớp học phần:** 3 lớp (JAVA101-01, DB101-01, NET101-01)
4. **Lịch học:** 9 buổi (3 buổi/lớp)
5. **Lịch thi:** 3 lịch thi
6. **Giá tín chỉ:** 500,000đ/TC

✓ Test Case 1 hoàn thành!

---

## Bước tiếp theo

Sau khi hoàn thành Test Case 1, bạn có thể:
- Đăng nhập mobile với SV001 / Student@123
- Xem 3 lớp học phần mở
- Đăng ký/hủy lớp
- Xem lịch học, lịch thi, bảng điểm, học phí

→ Chuyển sang **Test Case 2: Sinh viên đăng ký học phần**

