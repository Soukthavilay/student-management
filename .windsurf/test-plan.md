# Test Plan: Toàn bộ Hệ thống Quản lý Sinh viên

## I. ADMIN ROLE - Quản lý Hệ thống

### 1. Quản lý Cơ sở dữ liệu
- [ ] **Khoa/Bộ môn**
  - Tạo khoa mới (VD: Khoa CNTT)
  - Sửa tên khoa
  - Xóa khoa (nếu không có sinh viên)
  
- [ ] **Học kỳ/Năm học**
  - Tạo học kỳ mới (VD: HK1 2024-2025)
  - Cập nhật trạng thái học kỳ (PLANNING → ACTIVE → CLOSED)
  
- [ ] **Phòng học**
  - Tạo phòng học (VD: A101, A102)
  - Cập nhật sức chứa phòng
  
- [ ] **Lớp học (Class Group)**
  - Tạo lớp (VD: CNTT-K20)
  - Gán sinh viên vào lớp
  - Xóa lớp

### 2. Quản lý Môn học & Chương trình đào tạo
- [ ] **Môn học**
  - Tạo môn học (VD: Lập trình Java - 3 TC)
  - Sửa thông tin môn học
  - Xóa môn học (nếu không có lớp học)
  
- [ ] **Chương trình đào tạo (Curriculum)**
  - Tạo chương trình (VD: CNTT - 8 học kỳ)
  - Thêm môn học vào chương trình (gán semester)
  - Xóa môn khỏi chương trình
  
- [ ] **Lớp học phần (Section)**
  - Tạo lớp học phần (VD: Lập trình Java - Lớp 01)
  - Đặt sức chứa (VD: 30 sinh viên)
  - Cập nhật giảng viên dạy
  - Xóa lớp học phần

### 3. Quản lý Lịch học & Lịch thi
- [ ] **Lịch học (Schedule)**
  - Tạo lịch học (VD: Thứ 2, Ca 1, 7:00-9:00, Phòng A101)
  - Kiểm tra tránh trùng lịch
  - Sửa lịch học
  - Xóa lịch học
  
- [ ] **Lịch thi (Exam)**
  - Tạo lịch thi (VD: 15/05/2025, 9:00)
  - Gán phòng thi
  - Sửa thời gian thi
  - Xóa lịch thi

### 4. Quản lý Sinh viên
- [ ] **Danh sách sinh viên**
  - Xem danh sách sinh viên
  - Tìm kiếm sinh viên
  - Lọc theo khoa/lớp
  
- [ ] **Tạo sinh viên**
  - Nhập thông tin (MSSV, Họ tên, Email, Khoa, Lớp)
  - Tạo mật khẩu mặc định
  - Kích hoạt/Vô hiệu hóa sinh viên
  
- [ ] **Chi tiết sinh viên**
  - Xem thông tin cá nhân
  - Xem lịch học
  - Xem điểm
  - Xem học phí
  - Sửa thông tin cá nhân

### 5. Quản lý Giảng viên
- [ ] **Danh sách giảng viên**
  - Xem danh sách giảng viên
  - Tìm kiếm giảng viên
  
- [ ] **Tạo giảng viên**
  - Nhập thông tin (Họ tên, Email, Khoa)
  - Tạo mật khẩu mặc định
  
- [ ] **Phân công giảng viên**
  - Gán giảng viên vào lớp học phần
  - Xem danh sách phân công
  - Xóa phân công

### 6. Quản lý Đăng ký học phần
- [ ] **Đăng ký thủ công**
  - Admin đăng ký sinh viên vào lớp học phần
  - Kiểm tra tránh trùng lịch
  - Kiểm tra sức chứa lớp
  
- [ ] **Xem danh sách đăng ký**
  - Xem sinh viên đã đăng ký lớp
  - Xem số chỗ còn trống

### 7. Quản lý Học phí
- [ ] **Cấu hình giá tín chỉ**
  - Đặt giá tín chỉ (VD: 500,000đ/TC)
  - Cập nhật giá tín chỉ
  
- [ ] **Tạo học phí**
  - Tạo học phí cho sinh viên (tính dựa trên đăng ký)
  - Kiểm tra tính toán đúng
  
- [ ] **Quản lý học phí**
  - Xem danh sách học phí
  - Cập nhật số tiền đã đóng
  - Cập nhật miễn giảm
  - Tính nợ

### 8. Quản lý Thông báo
- [ ] **Tạo thông báo**
  - Tạo thông báo cho tất cả sinh viên
  - Tạo thông báo cho khoa cụ thể
  - Tạo thông báo cho lớp cụ thể
  - Tạo thông báo cho lớp học phần cụ thể
  
- [ ] **Xem thông báo**
  - Xem danh sách thông báo đã tạo

---

## II. LECTURER ROLE - Giảng viên

### 1. Xem thông tin cá nhân
- [ ] **Hồ sơ giảng viên**
  - Xem thông tin cá nhân
  - Đổi mật khẩu
  - Cập nhật số điện thoại/địa chỉ (nếu có)

### 2. Quản lý Lớp học phần
- [ ] **Danh sách lớp được phân công**
  - Xem danh sách lớp học phần được dạy
  - Xem thông tin chi tiết lớp (môn, sức chứa, lịch học)
  
- [ ] **Xem sinh viên trong lớp**
  - Xem danh sách sinh viên đã đăng ký
  - Tìm kiếm sinh viên
  - Xem thông tin chi tiết sinh viên

### 3. Quản lý Điểm
- [ ] **Nhập điểm**
  - Chọn lớp học phần
  - Nhập điểm quá trình (nếu có)
  - Nhập điểm giữa kỳ
  - Nhập điểm cuối kỳ
  - Tính điểm tổng kết tự động
  
- [ ] **Sửa điểm**
  - Sửa điểm đã nhập
  - Kiểm tra điểm được cập nhật
  
- [ ] **Gửi điểm**
  - Gửi/Khóa điểm (không sửa được sau khi gửi)
  - Kiểm tra trạng thái điểm

### 4. Quản lý Lịch học & Thi
- [ ] **Xem lịch học**
  - Xem lịch dạy của giảng viên
  - Xem phòng học, thời gian
  
- [ ] **Xem lịch thi**
  - Xem lịch thi của các lớp dạy

### 5. Quản lý Điểm danh (nếu có)
- [ ] **Điểm danh**
  - Chọn lớp, buổi học
  - Đánh dấu sinh viên có mặt/vắng
  - Lưu điểm danh

### 6. Tạo Thông báo
- [ ] **Thông báo cho lớp**
  - Tạo thông báo cho lớp học phần
  - Xem danh sách thông báo đã tạo

---

## III. STUDENT ROLE - Sinh viên (Mobile App)

### 1. Xác thực & Hồ sơ
- [ ] **Đăng nhập**
  - Đăng nhập với MSSV và mật khẩu
  - Kiểm tra token được lưu
  - Đăng xuất
  
- [ ] **Hồ sơ cá nhân**
  - Xem thông tin cá nhân (MSSV, Họ tên, Khoa, Lớp)
  - Cập nhật số điện thoại
  - Cập nhật địa chỉ
  - Đổi mật khẩu
  - Bật/Tắt chế độ tối

### 2. Đăng ký Học phần
- [ ] **Xem lớp học phần mở**
  - Xem danh sách lớp có sẵn
  - Xem thông tin lớp (môn, giảng viên, sức chứa, lịch học)
  - Tìm kiếm môn học
  
- [ ] **Đăng ký lớp**
  - Đăng ký lớp học phần
  - Kiểm tra tránh trùng lịch
  - Kiểm tra sức chứa lớp
  - Xem thông báo thành công
  
- [ ] **Hủy đăng ký**
  - Hủy đăng ký lớp đã chọn
  - Xem thông báo thành công

### 3. Lịch học (Timetable)
- [ ] **Xem lịch học**
  - Xem lịch học theo tuần
  - Nhóm lịch theo ngày
  - Xem thông tin chi tiết (môn, giảng viên, phòng, thời gian)
  
- [ ] **Nút đăng ký HP**
  - Bấm nút "Đăng ký HP" từ header
  - Điều hướng sang màn Enrollment

### 4. Lịch thi (Exams)
- [ ] **Xem lịch thi**
  - Xem danh sách lịch thi
  - Xem thông tin chi tiết (môn, thời gian, phòng)
  - Xem countdown ngày thi
  
- [ ] **Phân loại thi**
  - Thi đã qua (xám)
  - Thi sắp tới (xanh)
  - Thi khẩn cấp (đỏ, ≤3 ngày)

### 5. Điểm (Grades)
- [ ] **Xem bảng điểm**
  - Xem GPA tích lũy
  - Xem điểm theo học kỳ
  - Xem điểm từng môn (nếu có)
  
- [ ] **Chương trình đào tạo**
  - Xem chương trình của khoa
  - Xem môn học theo semester
  - Xem tín chỉ từng môn

### 6. Thông báo (Notifications)
- [ ] **Xem thông báo**
  - Xem danh sách thông báo
  - Xem thông báo chưa đọc
  - Đánh dấu đã đọc
  
- [ ] **Phân loại thông báo**
  - Thông báo chưa đọc (highlight)
  - Thông báo đã đọc (mờ)
  - Xem thời gian thông báo

### 7. Học phí (Tuition)
- [ ] **Xem chi tiết học phí**
  - Xem tổng học phí
  - Xem phải đóng/đã đóng/còn nợ
  - Xem chi tiết theo học kỳ
  
- [ ] **Chi tiết từng môn**
  - Xem tín chỉ × giá tín chỉ
  - Xem ngày đóng (nếu đã đóng)
  - Xem miễn giảm

---

## IV. Test Cases Chi tiết

### Test Case 1: Admin tạo dữ liệu cơ bản
```
1. Tạo khoa CNTT
2. Tạo lớp CNTT-K20
3. Tạo 3 sinh viên (SV1, SV2, SV3)
4. Tạo 2 giảng viên (GV1, GV2)
5. Tạo 3 môn học (Lập trình Java, Cơ sở dữ liệu, Mạng máy tính)
6. Tạo chương trình đào tạo (8 học kỳ)
7. Thêm 3 môn vào chương trình (HK1)
8. Tạo 3 lớp học phần (mỗi môn 1 lớp)
9. Gán giảng viên vào lớp
10. Tạo lịch học (3 buổi/tuần)
11. Tạo lịch thi (3 lịch thi)
12. Đặt giá tín chỉ (500,000đ/TC)
```

### Test Case 2: Sinh viên đăng ký học phần
```
1. SV1 đăng nhập mobile
2. Xem lớp học phần mở (3 lớp)
3. Đăng ký lớp 1 (Lập trình Java)
4. Kiểm tra tránh trùng lịch ✓
5. Kiểm tra sức chứa ✓
6. Xem lịch học (lớp vừa đăng ký hiển thị)
7. Đăng ký lớp 2 (Cơ sở dữ liệu)
8. Hủy đăng ký lớp 1
9. Đăng ký lại lớp 1
```

### Test Case 3: Giảng viên nhập điểm
```
1. GV1 đăng nhập web-admin
2. Xem danh sách lớp được dạy (1 lớp)
3. Xem sinh viên trong lớp (2 sinh viên)
4. Nhập điểm quá trình (0-10)
5. Nhập điểm giữa kỳ (0-10)
6. Nhập điểm cuối kỳ (0-10)
7. Kiểm tra điểm tổng kết tự động
8. Gửi/Khóa điểm
9. Kiểm tra sinh viên thấy điểm trên mobile
```

### Test Case 4: Admin tạo học phí
```
1. Admin xem danh sách sinh viên
2. Chọn SV1
3. Xem đăng ký của SV1 (2 lớp × 3 TC = 6 TC)
4. Tạo học phí cho SV1
5. Kiểm tra tính toán: 6 TC × 500,000đ = 3,000,000đ
6. Sinh viên xem chi tiết học phí trên mobile
```

### Test Case 5: Thông báo
```
1. Admin tạo thông báo "Lịch thi sắp tới"
2. Gửi cho tất cả sinh viên
3. SV1 nhận thông báo trên mobile
4. SV1 đánh dấu đã đọc
5. Admin tạo thông báo cho khoa CNTT
6. SV1 nhận thông báo
```

---

## V. Checklist Kết quả

### Backend API
- [ ] Tất cả endpoint hoạt động
- [ ] Validation đúng
- [ ] Error handling đúng
- [ ] Tính toán đúng (học phí, điểm, v.v.)

### Web-Admin
- [ ] Admin có thể CRUD tất cả dữ liệu
- [ ] Giảng viên có thể nhập điểm
- [ ] Giao diện responsive
- [ ] Không có lỗi console

### Mobile App
- [ ] Sinh viên có thể đăng nhập
- [ ] Xem lịch học/thi
- [ ] Đăng ký/hủy học phần
- [ ] Xem điểm/học phí
- [ ] Xem thông báo
- [ ] Không có lỗi render
- [ ] Offline caching hoạt động

---

## VI. Lệnh Test

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Web-Admin
cd web-admin
npm run dev

# Terminal 3: Mobile
cd mobile
npm run dev:mobile
```

---

## VII. Tài khoản Test

### Admin
- Email: admin@university.edu
- Password: Admin@123

### Giảng viên
- Email: lecturer@university.edu
- Password: Lecturer@123

### Sinh viên
- MSSV: SV001
- Password: Student@123

