# Student Management App (Thực tập tốt nghiệp)

Hệ thống quản lý sinh viên gồm 3 phần:

1. **Mobile Sinh viên**: React Native + Expo + NativeWind (Tailwind)
2. **Web Admin/Giảng viên**: React + Vite + Tailwind
3. **Backend API**: Node.js + Express + MySQL + Prisma

## Tính năng chính

### Admin (Web)

- Quản lý khoa, lớp, môn học, lớp học phần
- Quản lý sinh viên, giảng viên
- Tạo lịch học, lịch thi
- Phân công giảng viên
- Gửi thông báo
- Quản lý học phí

### Giảng viên (Web)

- Xem lớp dạy
- Xem danh sách sinh viên
- Nhập và nộp điểm
- Gửi thông báo cho sinh viên

### Sinh viên (Mobile)

- Xem hồ sơ cá nhân
- Đăng ký/hủy đăng ký học phần
- Xem lịch học, lịch thi
- Xem bảng điểm
- Xem học phí
- Nhận thông báo
- Cache offline cho dữ liệu chính

---

## 1) Cấu trúc thư mục

```bash
student-management-app/
  backend/
  web-admin/
  mobile/
```

---

## 2) Chuẩn bị môi trường

- Node.js >= 20
- MySQL 8+
- (iOS ưu tiên) Xcode + Simulator
- Expo CLI (qua `npx expo`)

### Khởi tạo MySQL nhanh bằng Docker (tùy chọn)

```bash
docker compose up -d
```

Mặc định database được tạo theo `docker-compose.yml`:

- host: `localhost:3306`
- db: `student_management`
- user: `student_app`
- password: `student_app_password`

---

## 3) Quick Start

### 3.1 Khởi động Backend

```bash
# Cài dependency
npm install --prefix backend

# Setup database (nếu chưa có)
docker compose up -d  # hoặc setup MySQL thủ công

# Migrate schema đầy đủ
npm run prisma:generate --prefix backend
npm run prisma:push --prefix backend

# Seed dữ liệu đầy đủ (tất cả dữ liệu test)
node backend/clean-and-seed-minimal.js

# Chạy backend
npm run dev:backend
```

Backend chạy tại: `http://localhost:4000`

**Lưu ý**: Nếu cần reset dữ liệu, chạy lại lệnh seed:

```bash
node backend/clean-and-seed-minimal.js
```

### 3.2 Khởi động Web Admin

```bash
npm install --prefix web-admin
npm run dev:web
```

Web chạy tại: `http://localhost:5173`

### 3.3 Khởi động Mobile

```bash
npm install --prefix mobile
npm run dev:mobile
```

Expo chạy tại: `http://localhost:8081`

---

## 4) Tài khoản Test & Dữ liệu Seed

Sau khi chạy `clean-and-seed-minimal.js`, hệ thống được khởi tạo đầy đủ với:

### Tài khoản Test (3 tài khoản)

| Role     | Email                     | Password       | Ghi chú          |
| -------- | ------------------------- | -------------- | ---------------- |
| Admin    | `admin@university.edu`    | `Admin@123`    | Quản lý web      |
| Lecturer | `lecturer@university.edu` | `Lecturer@123` | Giảng viên web   |
| Student  | `student@university.edu`  | `Student@123`  | Sinh viên mobile |

### Dữ liệu Seed Đầy Đủ

**Cơ cấu tổ chức:**

- **1 Khoa**: CNTT (Công Nghệ Thông Tin)
- **1 Ngành**: CNTT-2024
- **1 Lớp sinh hoạt**: CNTT-K20

**Môn học & Lớp học phần:**

- **3 Môn học**:
  - Java Programming (6 tín chỉ)
  - Database Systems (4 tín chỉ)
  - Network Fundamentals (3 tín chỉ)
- **3 Lớp học phần**:
  - JAVA101-01 (Java Programming)
  - DB101-01 (Database Systems)
  - NET101-01 (Network Fundamentals)

**Lịch học:**

- **3 Phòng học**: A101, A102, A103
- **9 Buổi học**: 3 buổi/lớp, không trùng lịch
  - Thứ 2-4, ca 1-3 (không trùng)

**Lịch thi:**

- **3 Lịch thi**: 15/12, 16/12, 17/12/2024
- Mỗi lớp học phần có 1 lịch thi

**Cấu hình học phí:**

- **Giá tín chỉ**: 500,000đ/TC
- Tự động tính toán khi sinh viên đăng ký

**Học kỳ:**

- **Học kỳ hiện tại**: HK1 2024-2025 (trạng thái: ENROLLMENT)
- Cho phép đăng ký/hủy đăng ký học phần

**Sinh viên:**

- **1 Sinh viên test**: student@university.edu
  - Mã sinh viên: SV001
  - Lớp: CNTT-K20
  - Khoa: CNTT

**Giảng viên:**

- **1 Giảng viên test**: lecturer@university.edu
  - Mã giảng viên: GV001
  - Khoa: CNTT
  - Được phân công dạy 3 lớp học phần

---

## 5) Cấu hình API URL

### Web Admin

Mặc định gọi `http://localhost:4000/api`. Nếu cần đổi:

```bash
# web-admin/.env
VITE_API_BASE_URL=http://localhost:4000/api
```

### Mobile

Mặc định gọi `http://192.168.1.109:4000/api` (cấu hình trong `mobile/app.json`).

Nếu chạy trên simulator hoặc máy khác, sửa:

```json
// mobile/app.json
"extra": {
  "apiBaseUrl": "http://localhost:4000/api"  // hoặc IP LAN
}
```

---

## 6) Push Notification

- Mobile yêu cầu quyền thông báo tại màn hình **Thông báo**
- Token được đăng ký tự động với backend
- Admin gửi thông báo → backend gửi push qua Expo

---

## 7) API chính

### Auth

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Student (Mobile)

**Enrollment**

- `GET /api/student/enrollments/available` - Xem lớp học phần mở
- `POST /api/student/enrollments` - Đăng ký lớp
- `DELETE /api/student/enrollments/:sectionId` - Hủy đăng ký

**Timetable & Exams**

- `GET /api/student/timetable` - Xem lịch học
- `GET /api/student/exams` - Xem lịch thi

**Grades & Tuition**

- `GET /api/student/grades` - Xem bảng điểm
- `GET /api/student/tuition-fees` - Xem học phí

**Profile & Notifications**

- `GET /api/student/profile` - Xem hồ sơ
- `PUT /api/student/profile` - Cập nhật hồ sơ
- `GET /api/student/notifications` - Xem thông báo
- `PATCH /api/student/notifications/:id/read` - Đánh dấu đã đọc

### Admin (Web)

**Dashboard & Quản lý**

- `GET /api/admin/dashboard` - Dashboard
- `GET/POST/PUT/DELETE /api/admin/students` - Quản lý sinh viên
- `GET/POST/PUT/DELETE /api/admin/lecturers` - Quản lý giảng viên
- `GET/POST/PUT/DELETE /api/admin/departments` - Quản lý khoa
- `GET/POST/PUT/DELETE /api/admin/class-groups` - Quản lý lớp
- `GET/POST/PUT/DELETE /api/admin/subjects` - Quản lý môn học
- `GET/POST/PUT/DELETE /api/admin/semesters` - Quản lý học kỳ
- `GET/POST/PUT/DELETE /api/admin/rooms` - Quản lý phòng học

**Lớp học phần & Lịch**

- `GET/POST/PUT/DELETE /api/admin/sections` - Quản lý lớp học phần
- `POST /api/admin/schedules` - Tạo lịch học
- `POST /api/admin/exams` - Tạo lịch thi
- `POST /api/admin/assignments` - Phân công giảng viên

**Học phí & Thông báo**

- `GET/POST /api/admin/tuition-configs` - Cấu hình giá tín chỉ
- `GET/POST /api/admin/tuition-fees` - Quản lý học phí
- `POST /api/admin/announcements` - Gửi thông báo

### Lecturer (Web)

**Lớp & Sinh viên**

- `GET /api/lecturer/sections` - Xem lớp dạy
- `GET /api/lecturer/sections/:sectionId/students` - Xem danh sách sinh viên

**Điểm & Thông báo**

- `PUT /api/lecturer/grades` - Nhập điểm
- `POST /api/lecturer/grades/submit` - Nộp điểm
- `POST /api/lecturer/announcements` - Gửi thông báo

---

## 8) Hướng dẫn Test

### Test Sinh viên (Mobile)

1. Đăng nhập: `student@university.edu` / `Student@123`
2. Xem 3 lớp học phần mở
3. Đăng ký/hủy đăng ký lớp
4. Xem lịch học, lịch thi, bảng điểm, học phí

### Test Giảng viên (Web)

1. Đăng nhập: `lecturer@university.edu` / `Lecturer@123`
2. Xem 3 lớp dạy
3. Xem danh sách sinh viên
4. Nhập và nộp điểm
5. Gửi thông báo

### Test Admin (Web)

1. Đăng nhập: `admin@university.edu` / `Admin@123`
2. Quản lý khoa, lớp, môn học
3. Quản lý sinh viên, giảng viên
4. Tạo lớp học phần, lịch học, lịch thi
5. Quản lý học phí
6. Gửi thông báo

---

## 9) Ghi chú

- Các cảnh báo IDE về `@tailwind` là do extension CSS không hiểu directive Tailwind
- Mã nguồn ưu tiên tính hoàn chỉnh chức năng cho đồ án
- Database tự động tạo khi chạy `prisma:push`
- Để reset dữ liệu: chạy `node backend/clean-and-seed-minimal.js`
