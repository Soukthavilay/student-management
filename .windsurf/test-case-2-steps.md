# Test Case 2: Sinh viên đăng ký học phần

## Điều kiện tiên quyết (Test Case 1 phải hoàn thành)
- [ ] Admin đã tạo khoa CNTT
- [ ] Admin đã tạo lớp CNTT-K20
- [ ] Admin đã tạo 3 sinh viên (SV1, SV2, SV3)
- [ ] Admin đã tạo 2 giảng viên (GV1, GV2)
- [ ] Admin đã tạo 3 môn học (Lập trình Java, Cơ sở dữ liệu, Mạng máy tính)
- [ ] Admin đã tạo chương trình đào tạo (8 học kỳ)
- [ ] Admin đã thêm 3 môn vào chương trình (HK1)
- [ ] Admin đã tạo 3 lớp học phần (mỗi môn 1 lớp)
- [ ] Admin đã gán giảng viên vào lớp
- [ ] Admin đã tạo lịch học (3 buổi/tuần)
- [ ] Admin đã tạo lịch thi (3 lịch thi)
- [ ] Admin đã đặt giá tín chỉ (500,000đ/TC)
- [ ] Admin đã tạo học kỳ với trạng thái ENROLLMENT

## Test Case 2 Steps: Sinh viên đăng ký học phần

### Bước 1: Sinh viên đăng nhập mobile
```
1. Mở app mobile
2. Nhập MSSV: SV001
3. Nhập mật khẩu: Student@123
4. Bấm "Đăng nhập"
✓ Kiểm tra: Đăng nhập thành công, hiển thị trang chủ
```

### Bước 2: Xem lớp học phần mở
```
1. Bấm tab "Đăng ký HP" (hoặc từ Profile → "Đăng ký học phần")
2. Xem danh sách lớp học phần mở
✓ Kiểm tra:
  - Hiển thị 3 lớp học phần
  - Mỗi lớp hiển thị: Tên môn, Mã môn, Lớp, Tín chỉ, Giảng viên, Sức chứa, Lịch học
  - Nút "Đăng ký ngay" hoặc "Đã hết chỗ" (tùy sức chứa)
```

### Bước 3: Đăng ký lớp 1 (Lập trình Java)
```
1. Bấm "Đăng ký ngay" trên lớp Lập trình Java
✓ Kiểm tra:
  - Thông báo "Đăng ký học phần thành công"
  - Nút thay đổi thành "Hủy đăng ký"
  - Danh sách cập nhật
```

### Bước 4: Kiểm tra tránh trùng lịch
```
1. Xem lịch học của lớp vừa đăng ký (VD: Thứ 2, Ca 1)
2. Tìm lớp khác có cùng thời gian
3. Cố gắng đăng ký lớp đó
✓ Kiểm tra:
  - Nếu trùng lịch: Thông báo lỗi "Trùng lịch học"
  - Nếu không trùng: Đăng ký thành công
```

### Bước 5: Kiểm tra sức chứa
```
1. Tạo 30 sinh viên khác (hoặc dùng sinh viên hiện có)
2. Đăng ký tất cả vào 1 lớp (sức chứa 30)
3. Sinh viên thứ 31 cố gắng đăng ký
✓ Kiểm tra:
  - Nút "Đã hết chỗ" (disabled)
  - Thông báo lỗi "Lớp học phần đã đầy sĩ số"
```

### Bước 6: Xem lịch học (Timetable)
```
1. Bấm tab "Lịch học"
✓ Kiểm tra:
  - Hiển thị lớp vừa đăng ký
  - Nhóm lịch theo ngày (Thứ 2, Thứ 3, ...)
  - Hiển thị: Thời gian, Môn, Giảng viên, Phòng
  - Nút "Đăng ký HP" ở header
```

### Bước 7: Đăng ký lớp 2 (Cơ sở dữ liệu)
```
1. Bấm nút "Đăng ký HP" ở header TKB
2. Quay lại màn Enrollment
3. Đăng ký lớp Cơ sở dữ liệu
✓ Kiểm tra:
  - Đăng ký thành công
  - Lịch học cập nhật (thêm lớp mới)
```

### Bước 8: Hủy đăng ký lớp 1
```
1. Quay lại màn Enrollment
2. Bấm "Hủy đăng ký" trên lớp Lập trình Java
3. Xác nhận hủy
✓ Kiểm tra:
  - Thông báo "Đã hủy đăng ký học phần"
  - Nút thay đổi thành "Đăng ký ngay"
  - Lịch học cập nhật (xóa lớp)
```

### Bước 9: Đăng ký lại lớp 1
```
1. Bấm "Đăng ký ngay" trên lớp Lập trình Java
✓ Kiểm tra:
  - Đăng ký thành công
  - Lịch học cập nhật (thêm lại lớp)
```

### Bước 10: Xem lịch thi (Exams)
```
1. Bấm tab "Lịch thi"
✓ Kiểm tra:
  - Hiển thị lịch thi của các lớp đã đăng ký
  - Hiển thị: Môn, Thời gian, Phòng, Countdown
  - Phân loại: Thi sắp tới (xanh), Thi khẩn cấp (đỏ), Thi đã qua (xám)
```

### Bước 11: Xem bảng điểm (Grades)
```
1. Bấm tab "Bảng điểm"
✓ Kiểm tra:
  - Hiển thị GPA tích lũy
  - Hiển thị điểm theo học kỳ (nếu có)
  - Hiển thị môn học đã đăng ký
  - Trạng thái: "Đang học" (chưa có điểm)
```

### Bước 12: Xem thông báo (Notifications)
```
1. Bấm tab "Thông báo"
✓ Kiểm tra:
  - Hiển thị danh sách thông báo
  - Thông báo chưa đọc (highlight)
  - Bấm thông báo để đánh dấu đã đọc
```

### Bước 13: Xem học phí (Tuition)
```
1. Bấm "Chi tiết học phí" từ Profile
✓ Kiểm tra:
  - Hiển thị tổng học phí
  - Phải đóng: 2 lớp × 3 TC × 500,000đ = 3,000,000đ
  - Chi tiết từng môn
  - Trạng thái: "Chưa đóng"
```

### Bước 14: Xem chương trình đào tạo (Curriculum)
```
1. Bấm "Chương trình đào tạo" từ Profile
✓ Kiểm tra:
  - Hiển thị tên chương trình
  - Hiển thị số học kỳ (8)
  - Hiển thị môn học theo học kỳ
  - Mỗi môn hiển thị: Tên, Mã, Tín chỉ
```

---

## Kết quả mong đợi

✓ Sinh viên có thể đăng ký/hủy học phần
✓ Hệ thống kiểm tra tránh trùng lịch
✓ Hệ thống kiểm tra sức chứa lớp
✓ Lịch học cập nhật theo đăng ký
✓ Lịch thi hiển thị đúng
✓ Bảng điểm hiển thị đúng
✓ Thông báo hoạt động
✓ Học phí tính toán đúng
✓ Chương trình đào tạo hiển thị đúng

---

## Lệnh test nhanh

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Web-Admin (tạo dữ liệu)
cd web-admin && npm run dev

# Terminal 3: Mobile (test sinh viên)
cd mobile && npm run dev:mobile
```

