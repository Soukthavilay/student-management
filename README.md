# Student Management App (Thực tập tốt nghiệp)

Hệ thống quản lý sinh viên theo yêu cầu đồ án gồm 3 phần:

1. **Mobile Sinh viên (iOS ưu tiên)**: React Native + Expo + NativeWind (Tailwind)
2. **Web Admin/Giảng viên (đơn giản)**: React + Vite + Tailwind
3. **Backend API**: Node.js + Express + MySQL + Prisma

Các yêu cầu đã triển khai:

- Admin có API + web để quản lý sinh viên, giảng viên, môn/lớp/học phần, phân công giảng dạy, gửi thông báo.
- Admin có thể tạo lịch học và lịch thi theo học phần.
- Giảng viên có web để nhập điểm và nộp điểm.
- Sinh viên dùng mobile để xem profile, lịch học, lịch thi, điểm, thông báo.
- Push notification thật qua `expo-notifications` + backend gửi qua `expo-server-sdk`.
- Hỗ trợ cache offline cơ bản cho lịch học/lịch thi/điểm ở mobile.

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

## 3) Backend setup

```bash
cp backend/.env.example backend/.env
```

Cập nhật `backend/.env`:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ORIGIN` (mặc định `http://localhost:5173`)
- `EXPO_ACCESS_TOKEN` (nếu dùng EAS push token)

Cài dependency và migrate:

```bash
npm install --prefix backend
npm run prisma:generate --prefix backend
npm run prisma:push --prefix backend
npm run prisma:seed --prefix backend
npm run dev --prefix backend
```

Backend chạy tại: `http://localhost:4000`

- Health: `GET /health`
- Swagger: `GET /api-docs`

### Tài khoản mẫu sau seed

- Admin: `admin@school.edu.vn / Admin@123`
- Giảng viên: `lecturer@school.edu.vn / Lecturer@123`
- Sinh viên: `student@school.edu.vn / Student@123`

---

## 4) Web Admin/Giảng viên setup

```bash
npm install --prefix web-admin
npm run dev --prefix web-admin
```

Web chạy tại: `http://localhost:5173`

Nếu cần đổi API URL:

```bash
# web-admin/.env
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## 5) Mobile setup (Expo)

```bash
npm install --prefix mobile
npm run ios --prefix mobile
```

Mặc định mobile gọi API:

- `mobile/app.json -> expo.extra.apiBaseUrl`

Nếu chạy simulator iOS và backend local, bạn có thể cần đổi:

- `http://127.0.0.1:4000/api` (trong simulator)
- hoặc IP LAN máy dev, ví dụ `http://192.168.x.x:4000/api`

---

## 6) Push Notification (FCM/APNs)

### Mobile

- App yêu cầu quyền thông báo và đăng ký token tại màn hình **Thông báo**.
- Token được gửi lên backend qua `POST /api/notifications/register-device`.

### Backend

- Khi Admin tạo thông báo (`POST /api/admin/announcements`), backend:
  - tạo thông báo in-app cho user mục tiêu,
  - gửi push qua `expo-server-sdk` tới token hợp lệ.

> Để push hoạt động ngoài môi trường dev, cần cấu hình đầy đủ credentials APNs/FCM theo tài liệu Expo/EAS.

---

## 7) Test

Hiện có test unit cho tính điểm:

```bash
npm test --prefix backend
```

---

## 8) API chính

### Auth

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Student (mobile)

- `GET /api/student/profile`
- `PUT /api/student/profile`
- `GET /api/student/timetable`
- `GET /api/student/exams`
- `GET /api/student/grades`
- `GET /api/student/notifications`
- `PATCH /api/student/notifications/:id/read`

### Admin (web)

- `GET /api/admin/dashboard`
- Quản lý sinh viên: `GET/POST/PUT /api/admin/students`
- Quản lý giảng viên: `GET/POST/PUT /api/admin/lecturers`
- Quản lý danh mục đào tạo:
  - `GET/POST /api/admin/class-groups`
  - `GET/POST /api/admin/subjects`
  - `GET/POST /api/admin/sections`
  - `POST /api/admin/schedules`
  - `POST /api/admin/exams`
- Phân công giảng viên: `POST /api/admin/assignments`
- Thông báo: `POST /api/admin/announcements`

### Lecturer (web)

- `GET /api/lecturer/sections`
- `GET /api/lecturer/sections/:sectionId/students`
- `PUT /api/lecturer/grades`
- `POST /api/lecturer/grades/submit`

---

## 9) Ghi chú

- Các cảnh báo IDE về `@tailwind` trong CSS là do extension CSS không hiểu directive Tailwind; runtime/build Vite vẫn xử lý bình thường.
- Mã nguồn ưu tiên tính hoàn chỉnh chức năng nghiệp vụ cho đồ án, UI giữ đơn giản.
