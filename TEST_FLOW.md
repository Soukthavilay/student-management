# Test Flow Hệ Thống Quản Lý Sinh Viên (A-Z)

> **Tài khoản mặc định** (mật khẩu: `123456`)
> - Admin: `admin@school.edu.vn`
> - Giảng viên: `hung.nv@school.edu.vn`
> - Sinh viên: `sv001@school.edu.vn`

---

## PHẦN 1: ADMIN (Web Admin - http://localhost:5173)

### 1.1 Đăng nhập
1. Mở `http://localhost:5173`
2. Nhập email: `admin@school.edu.vn`, mật khẩu: `123456`
3. ✅ Đăng nhập thành công → vào Dashboard

### 1.2 Dashboard
1. Kiểm tra thống kê: Số khoa, sinh viên, giảng viên, lớp học phần
2. ✅ Hiển thị đúng dữ liệu

### 1.3 Quản lý Khoa
1. Vào menu **Khoa**
2. Xem danh sách khoa (CNTT, QTKD, KT, NNA)
3. Thêm khoa mới: code `TEST`, tên `Khoa Test`
4. Sửa tên khoa vừa tạo
5. Xóa khoa vừa tạo
6. ✅ CRUD khoa hoạt động đúng

### 1.4 Quản lý Lớp
1. Vào menu **Lớp**
2. Xem danh sách lớp (CNTT01, CNTT02, QTKD01...)
3. Thêm lớp mới cho khoa CNTT
4. Sửa tên lớp
5. Xóa lớp (nếu chưa có SV)
6. ✅ CRUD lớp hoạt động đúng

### 1.5 Quản lý Môn học
1. Vào menu **Môn học**
2. Xem danh sách môn theo khoa
3. Thêm môn mới: code, tên, số tín chỉ, thuộc khoa
4. Sửa thông tin môn học
5. Xóa môn học (nếu chưa có section)
6. ✅ CRUD môn học hoạt động đúng

### 1.6 Quản lý Giảng viên
1. Vào menu **Giảng viên**
2. Xem danh sách giảng viên
3. Thêm giảng viên mới: mã GV, email, họ tên, học vị, khoa
4. Sửa thông tin giảng viên
5. Xem chi tiết giảng viên (lịch dạy, lớp phụ trách)
6. ✅ CRUD giảng viên hoạt động đúng

### 1.7 Quản lý Sinh viên
1. Vào menu **Sinh viên**
2. Xem danh sách sinh viên (phân trang, tìm kiếm)
3. Thêm sinh viên mới: mã SV, email, họ tên, SĐT, khoa, lớp
4. Sửa thông tin sinh viên
5. Xem chi tiết sinh viên (môn đăng ký, điểm, lớp)
6. ✅ CRUD sinh viên hoạt động đúng

### 1.8 Quản lý Lớp học phần (Section)
1. Vào menu **Lớp học phần**
2. Xem danh sách section
3. Thêm section mới:
   - Chọn môn, lớp, học kỳ (HK1/HK2), năm học (2025-2026)
   - Mã section: VD `NMLT-CNTT01-2526`
4. Sửa thông tin section
5. Xóa section
6. ✅ CRUD section hoạt động đúng

### 1.9 Quản lý Lịch học
1. Vào menu **Lịch học**
2. Xem danh sách lịch
3. Thêm lịch mới cho section: thứ, giờ bắt đầu, giờ kết thúc, phòng
4. Sửa lịch
5. Xóa lịch
6. ✅ CRUD lịch học hoạt động đúng

### 1.10 Quản lý Lịch thi
1. Vào menu **Lịch thi**
2. Xem danh sách lịch thi
3. Thêm lịch thi mới: section, ngày thi, phòng, loại thi
4. Sửa, xóa lịch thi
5. ✅ CRUD lịch thi hoạt động đúng

### 1.11 Phân công giảng viên
1. Vào menu **Phân công**
2. Chọn section → chọn giảng viên → phân công
3. ✅ Phân công thành công

### 1.12 Chương trình đào tạo (CTĐT)
1. Vào menu **Chương trình đào tạo**
2. Chọn khoa CNTT
3. **Xem CTĐT**: Hiển thị 8 kỳ, mỗi kỳ có danh sách môn + tín chỉ
   - Kỳ 1: NMLT(3), TH101(3), TOAN1(3), LLCT1(3), AV1(2) = 14 TC
   - Kỳ 2: CTDL(3), TOAN2(3), XSTK(3), LLCT2(2), AV2(2) = 13 TC
   - ...đến kỳ 8
4. **Tạo/Sửa CTĐT**: Bấm "Tạo CTĐT" hoặc "Chỉnh sửa CTĐT"
   - Nhập tên, số kỳ (mặc định 8)
   - Lưu
5. **Thêm môn vào kỳ**: Bấm "+ Thêm môn học vào kỳ X"
   - Chọn môn từ danh sách → Thêm
6. **Xóa môn khỏi kỳ**: Bấm "Xóa" bên cạnh môn
7. ✅ CTĐT hiển thị đúng 8 kỳ, 4 năm × 2 kỳ/năm

### 1.13 Đăng ký học theo kỳ
1. Trong trang CTĐT, bấm **"Đăng ký học"**
2. Chọn sinh viên (SV001 - Trần Văn An)
3. Chọn kỳ: **Kỳ 1**
4. Năm học: **2025-2026**
5. Bấm "Đăng ký học"
6. ✅ Hệ thống tự động đăng ký SV vào tất cả section HK1 2025-2026 của lớp SV

### 1.14 Cấu hình học phí (Giá tín chỉ)
1. Vào menu **Học phí**
2. Xem danh sách cấu hình giá tín chỉ
   - Mặc định: 2025-2026 HK1 = 500.000đ/TC, HK2 = 500.000đ/TC
3. **Thêm/sửa cấu hình**: Bấm "Cấu hình giá tín chỉ"
   - Chọn năm học, học kỳ (HK01/HK02), giá/TC
   - Lưu
4. **Xóa cấu hình**: Bấm xóa
5. ✅ Chỉ có HK01 và HK02 (đại học 2 kỳ/năm)

### 1.15 Tạo học phí cho sinh viên
1. Trong trang **Học phí**, bấm **"Tạo học phí"**
2. Chọn sinh viên (SV001 - Trần Văn An)
3. Bấm "Tạo học phí"
4. ✅ Hệ thống tự động:
   - Detect SV có đăng ký ở HK1 2025-2026
   - Tìm config: HK1 2025-2026 → 500.000đ/TC
   - Tạo học phí: mỗi môn = số TC × 500.000đ
   - VD: NMLT(3TC) → 1.500.000đ, TH101(3TC) → 1.500.000đ, AV1(2TC) → 1.000.000đ...
5. Xem bảng học phí sinh viên: cột Tín chỉ, Giá TC, Phải đóng, Đã đóng, Còn nợ
6. ✅ Tổng học phí = Tổng TC × 500.000đ

### 1.16 Thông báo
1. Tạo thông báo mới: tiêu đề, nội dung, phạm vi (toàn trường/khoa/lớp)
2. ✅ Thông báo được tạo thành công

---

## PHẦN 2: GIẢNG VIÊN (Web Admin - http://localhost:5173)

### 2.1 Đăng nhập
1. Đăng xuất tài khoản admin
2. Đăng nhập: `hung.nv@school.edu.vn` / `123456`
3. ✅ Vào giao diện giảng viên

### 2.2 Xem lớp học phần
1. Xem danh sách lớp phụ trách
2. Mỗi lớp hiển thị: mã section, môn, số SV, kỳ, năm
3. ✅ Hiển thị đúng các lớp được phân công

### 2.3 Xem danh sách sinh viên trong lớp
1. Chọn một section → xem danh sách SV
2. ✅ Hiển thị đúng SV đã đăng ký section đó

### 2.4 Nhập điểm
1. Chọn section → chọn sinh viên → nhập điểm
2. Nhập thành phần: Chuyên cần (10%), Giữa kỳ (30%), Cuối kỳ (60%)
3. Nhập điểm cuối → Submit
4. ✅ Điểm được lưu, tính GPA tự động

### 2.5 Xem lịch dạy
1. Xem lịch dạy (timetable)
2. ✅ Hiển thị lịch tuần theo thứ/giờ/phòng

### 2.6 Thông báo
1. Xem thông báo
2. Tạo thông báo cho lớp phụ trách
3. ✅ Thông báo gửi thành công

---

## PHẦN 3: SINH VIÊN (Mobile App - Expo Go)

### 3.1 Đăng nhập
1. Mở Expo Go → quét QR code
2. Đăng nhập: `sv001@school.edu.vn` / `123456`
3. ✅ Vào màn hình chính

### 3.2 Trang chủ
1. Xem thông tin: họ tên, mã SV, khoa, lớp
2. Xem thông báo mới nhất
3. ✅ Hiển thị đúng

### 3.3 Xem lịch học
1. Vào **Lịch học**
2. Xem lịch theo tuần: thứ, giờ, phòng, giảng viên
3. ✅ Hiển thị đúng lịch HK1 2025-2026

### 3.4 Xem lịch thi
1. Vào **Lịch thi**
2. Xem danh sách các môn thi: ngày, giờ, phòng
3. ✅ Hiển thị đúng

### 3.5 Xem điểm
1. Vào **Điểm số**
2. Xem điểm theo kỳ
3. Mỗi môn: điểm thành phần, điểm cuối kỳ, GPA
4. Xem GPA tích lũy
5. ✅ Hiển thị đúng (SV001, SV002 đã có điểm từ seed)

### 3.6 Xem học phí (tính theo tín chỉ)
1. Vào **Hồ sơ** → **Chi tiết học phí**
2. Xem bảng học phí theo kỳ:
   - Header: Học kỳ, năm học, giá tín chỉ (500.000đ/TC)
   - Cột: Tên môn, TC, Phải đóng (= TC × giá TC), Đã đóng, Còn nợ
   - VD: NMLT (3TC) → 3 × 500.000 = 1.500.000đ
3. Tổng: Tổng tín chỉ, Tổng phải đóng, Tổng đã đóng, Tổng còn nợ
4. ✅ Công thức: Phải đóng = Số tín chỉ × Giá tín chỉ (config)

### 3.7 Xem thông báo
1. Vào **Thông báo**
2. Xem danh sách thông báo (toàn trường + khoa)
3. ✅ Hiển thị đúng

### 3.8 Hồ sơ cá nhân
1. Vào **Hồ sơ**
2. Xem: Mã SV, họ tên, email, SĐT, khoa, lớp
3. ✅ Hiển thị đúng

---

## PHẦN 4: LUỒNG TÍCH HỢP (End-to-End)

### 4.1 Luồng tạo lớp → phân công → đăng ký → nhập điểm
```
Admin tạo khoa → tạo môn → tạo lớp → tạo section → tạo lịch
                         → tạo CTĐT → thêm môn vào kỳ
                         → tạo GV → phân công GV vào section
                         → tạo SV → đăng ký SV theo kỳ
                         → cấu hình giá TC → tạo học phí

GV đăng nhập → xem lớp → xem DS sinh viên → nhập điểm → submit

SV đăng nhập → xem lịch học → xem lịch thi → xem điểm → xem học phí
```

### 4.2 Luồng học phí tín chỉ (chi tiết)
```
1. Admin: Cấu hình giá tín chỉ (500.000đ/TC cho 2025-2026)
2. Admin: Đăng ký SV vào HK1 (5 môn: 3+3+3+3+2 = 14 TC)
3. Admin: Tạo học phí cho SV
4. Hệ thống auto:
   - Detect SV đăng ký ở 2025-2026 HK1
   - Tìm config HK1 → 500.000đ/TC
   - Tạo: NMLT = 3×500k = 1.5M, TH101 = 3×500k = 1.5M...
   - Tổng = 14 × 500k = 7.000.000đ
5. SV xem học phí trên mobile: thấy 7M phải đóng
```

### 4.3 Kiểm tra dữ liệu mẫu (seed data)
| Khoa | Môn | GV | SV | Section | Đăng ký |
|------|-----|----|----|---------|---------|
| CNTT | 31  | 3  | 6  | 20      | 30      |
| QTKD | 29  | 2  | 5  | 20      | 25      |
| KT   | 28  | 2  | 4  | 10      | 20      |
| NNA  | 28  | 2  | 5  | 20      | 25      |

- Tổng: **116 môn**, **9 GV**, **20 SV**, **70 section**, **100 đăng ký**
- Giá tín chỉ: 500.000đ cho HK1 & HK2 năm 2025-2026
- CTĐT: 8 kỳ (4 năm × 2 kỳ/năm)
- SV đang ở năm 1, đã đăng ký HK1

---

## CHECKLIST NHANH

| # | Chức năng | Admin | GV | SV |
|---|-----------|-------|----|----|
| 1 | Đăng nhập/xuất | ✅ | ✅ | ✅ |
| 2 | Dashboard | ✅ | - | - |
| 3 | CRUD Khoa | ✅ | - | - |
| 4 | CRUD Lớp | ✅ | - | - |
| 5 | CRUD Môn học | ✅ | - | - |
| 6 | CRUD Giảng viên | ✅ | - | - |
| 7 | CRUD Sinh viên | ✅ | - | - |
| 8 | CRUD Section | ✅ | - | - |
| 9 | CRUD Lịch học | ✅ | - | - |
| 10 | CRUD Lịch thi | ✅ | - | - |
| 11 | Phân công GV | ✅ | - | - |
| 12 | CTĐT (8 kỳ) | ✅ | - | - |
| 13 | Đăng ký học | ✅ | - | - |
| 14 | Cấu hình giá TC | ✅ | - | - |
| 15 | Tạo học phí | ✅ | - | - |
| 16 | Xem lớp phụ trách | - | ✅ | - |
| 17 | DS SV trong lớp | - | ✅ | - |
| 18 | Nhập/submit điểm | - | ✅ | - |
| 19 | Xem lịch dạy | - | ✅ | - |
| 20 | Thông báo | ✅ | ✅ | ✅ |
| 21 | Xem lịch học | - | - | ✅ |
| 22 | Xem lịch thi | - | - | ✅ |
| 23 | Xem điểm + GPA | - | - | ✅ |
| 24 | Xem học phí (TC) | - | - | ✅ |
| 25 | Hồ sơ cá nhân | - | - | ✅ |
