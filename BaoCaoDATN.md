# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP

---

**ĐỀ TÀI:**

# HỆ THỐNG QUẢN LÝ SINH VIÊN

---

**Sinh viên thực hiện:**

**MSSV:**

**Lớp:**

**Khoa:**

**Giảng viên hướng dẫn:**

---

**Thành phố, Năm 2026**

---

# LỜI CÁM ƠN

_[Viết lời cảm ơn tới giảng viên hướng dẫn, thầy cô, gia đình, bạn bè...]_

---

# LỜI CAM ĐOAN

Tôi xin cam đoan đây là công trình nghiên cứu của riêng tôi. Các số liệu, kết quả nêu trong đồ án là trung thực và chưa từng được ai công bố trong bất kỳ công trình nào khác.

**Sinh viên thực hiện**

_(Ký và ghi rõ họ tên)_

---

# MỤC LỤC

- [DANH MỤC HÌNH ẢNH](#danh-mục-hình-ảnh)
- [DANH MỤC BẢNG BIỂU](#danh-mục-bảng-biểu)
- [DANH MỤC TỪ VIẾT TẮT](#danh-mục-từ-viết-tắt)
- [LỜI MỞ ĐẦU](#lời-mở-đầu)
- [CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI](#chương-1-tổng-quan-về-đề-tài)
- [CHƯƠNG 2: CƠ SỞ LÝ THUYẾT](#chương-2-cơ-sở-lý-thuyết)
- [CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG](#chương-3-phân-tích-và-thiết-kế-hệ-thống)
- [CHƯƠNG 4: CÀI ĐẶT VÀ TRIỂN KHAI](#chương-4-cài-đặt-và-triển-khai)
- [CHƯƠNG 5: KẾT QUẢ VÀ ĐÁNH GIÁ](#chương-5-kết-quả-và-đánh-giá)
- [CHƯƠNG 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#chương-6-kết-luận-và-hướng-phát-triển)
- [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)
- [PHỤ LỤC](#phụ-lục)

---

# DANH MỤC HÌNH ẢNH

- Hình 1.1: ...
- Hình 2.1: ...
- Hình 3.1: ...

---

# DANH MỤC BẢNG BIỂU

- Bảng 1.1: ...
- Bảng 2.1: ...
- Bảng 3.1: ...

---

# DANH MỤC TỪ VIẾT TẮT

| Từ viết tắt | Nghĩa đầy đủ                      |
| ----------- | --------------------------------- |
| CSDL        | Cơ sở dữ liệu                     |
| ĐATN        | Đồ án tốt nghiệp                  |
| HTTT        | Hệ thống thông tin                |
| API         | Application Programming Interface |
| UI          | User Interface                    |
| UML         | Unified Modeling Language         |
| CRUD        | Create, Read, Update, Delete      |

---

# LỜI MỞ ĐẦU

## 1. Lý do chọn đề tài

Trong bối cảnh giáo dục hiện đại, việc quản lý thông tin sinh viên, điểm số, lịch học và các hoạt động học tập ngày càng trở nên phức tạp. Các phương pháp quản lý truyền thống bằng sổ sách hoặc các hệ thống đơn lẻ không đồng bộ gây ra nhiều khó khăn:

- Sinh viên khó khăn trong việc tra cứu thông tin học tập, lịch thi, điểm số
- Giảng viên mất nhiều thời gian cho việc nhập điểm và quản lý lớp học
- Quản lý thiếu công cụ tổng hợp để theo dõi toàn bộ hoạt động đào tạo
- Thiếu khả năng thông báo kịp thời đến sinh viên về các sự kiện quan trọng

Vì vậy, việc xây dựng một hệ thống quản lý sinh viên tích hợp, hỗ trợ đa nền tảng (web và mobile) là cần thiết để nâng cao hiệu quả quản lý và trải nghiệm người dùng.

## 2. Mục tiêu đề tài

### 2.1. Mục tiêu chung

Xây dựng hệ thống quản lý sinh viên toàn diện, hỗ trợ quản lý thông tin sinh viên, giảng viên, lịch học, lịch thi, điểm số và thông báo.

### 2.2. Mục tiêu cụ thể

- Xây dựng ứng dụng mobile (iOS/Android) cho sinh viên tra cứu thông tin
- Xây dựng web admin cho quản trị viên quản lý toàn bộ hệ thống
- Xây dựng web cho giảng viên nhập và quản lý điểm
- Thiết kế và triển khai RESTful API backend
- Thiết kế cơ sở dữ liệu quan hệ tối ưu
- Tích hợp push notification thời gian thực
- Hỗ trợ offline cache cho mobile app

## 3. Đối tượng và phạm vi nghiên cứu

### 3.1. Đối tượng nghiên cứu

Hệ thống quản lý sinh viên bao gồm:

- Backend API: Node.js + Express + MySQL + Prisma ORM
- Web Admin: React + Vite + Tailwind CSS
- Mobile App: React Native + Expo + NativeWind

### 3.2. Phạm vi nghiên cứu

Hệ thống tập trung vào các chức năng chính:

**Dành cho Admin:**

- Quản lý sinh viên, giảng viên (CRUD)
- Quản lý khoa, lớp, môn học, học phần
- Tạo lịch học và lịch thi
- Phân công giảng viên giảng dạy
- Gửi thông báo đến sinh viên

**Dành cho Giảng viên:**

- Xem danh sách lớp được phân công
- Nhập điểm theo thành phần (giữa kỳ, cuối kỳ, bài tập...)
- Nộp điểm chính thức

**Dành cho Sinh viên:**

- Xem thông tin cá nhân
- Xem lịch học, lịch thi
- Xem điểm các môn học
- Nhận thông báo push notification
- Sử dụng offline (cache cơ bản)

## 4. Phương pháp nghiên cứu

### 4.1. Nghiên cứu lý thuyết

- Nghiên cứu các công nghệ: React, React Native, Node.js, Express, MySQL, Prisma
- Nghiên cứu kiến trúc RESTful API
- Nghiên cứu JWT authentication và authorization
- Nghiên cứu push notification với Expo

### 4.2. Phương pháp phát triển

- Áp dụng mô hình Agile trong phát triển phần mềm
- Sử dụng Git cho version control
- Thiết kế database schema với Prisma
- Viết API documentation với Swagger

### 4.3. Phương pháp kiểm thử

- Unit testing cho business logic
- Integration testing cho API endpoints
- Manual testing cho UI/UX

## 5. Bố cục đồ án

**Chương 1: Tổng quan về đề tài** - Giới thiệu bài toán, phân tích hiện trạng và đề xuất giải pháp

**Chương 2: Cơ sở lý thuyết** - Trình bày các công nghệ sử dụng: React, React Native, Node.js, Express, MySQL, Prisma, JWT, Push Notification

**Chương 3: Phân tích và thiết kế hệ thống** - Use case, database schema, API design, UI/UX design

**Chương 4: Cài đặt và triển khai** - Chi tiết cài đặt các module, code thực tế, deployment

**Chương 5: Kết quả và đánh giá** - Screenshots, testing results, đánh giá hiệu năng

**Chương 6: Kết luận và hướng phát triển** - Tổng kết và đề xuất cải tiến

---

# CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI

## 1.1. Giới thiệu

Trong thời đại công nghệ số, việc ứng dụng công nghệ thông tin vào quản lý giáo dục đã trở thành xu hướng tất yếu. Hệ thống quản lý sinh viên (Student Management System) là một phần quan trọng trong hệ thống thông tin quản lý giáo dục, giúp tự động hóa các quy trình quản lý thông tin sinh viên, điểm số, lịch học, lịch thi và các hoạt động học tập khác.

Việc số hóa quy trình quản lý không chỉ giúp tiết kiệm thời gian, công sức mà còn nâng cao độ chính xác, minh bạch trong quản lý. Đặc biệt, với sự phát triển của thiết bị di động, việc xây dựng ứng dụng mobile giúp sinh viên có thể tra cứu thông tin mọi lúc, mọi nơi, tạo trải nghiệm người dùng tốt hơn.

## 1.2. Tình hình nghiên cứu

### 1.2.1. Tình hình nghiên cứu trong nước

Tại Việt Nam, nhiều trường đại học đã triển khai các hệ thống quản lý sinh viên:

- **Portal sinh viên các trường đại học**: Hầu hết các trường đại học lớn đều có hệ thống portal riêng cho sinh viên tra cứu điểm, lịch học. Tuy nhiên, nhiều hệ thống chỉ hỗ trợ web, chưa có ứng dụng mobile chính thức.

- **Hệ thống QLDT (Quản lý đào tạo)**: Được sử dụng phổ biến tại các trường, nhưng giao diện thường phức tạp, khó sử dụng trên thiết bị di động.

- **Các giải pháp thương mại**: Một số công ty cung cấp giải pháp quản lý giáo dục tích hợp, nhưng chi phí cao và không linh hoạt trong tùy chỉnh.

**Hạn chế chung:**

- Thiếu ứng dụng mobile thân thiện
- Giao diện người dùng chưa hiện đại
- Thiếu tính năng thông báo real-time
- Không hỗ trợ offline

### 1.2.2. Tình hình nghiên cứu ngoài nước

Trên thế giới, các hệ thống quản lý sinh viên đã phát triển rất hoàn thiện:

- **Canvas LMS**: Hệ thống quản lý học tập toàn diện, hỗ trợ cả web và mobile, tích hợp nhiều tính năng như quản lý bài tập, thi online, diễn đàn thảo luận.

- **Blackboard**: Một trong những nền tảng LMS lâu đời nhất, được sử dụng rộng rãi tại các trường đại học Mỹ và châu Âu.

- **Moodle**: Nền tảng mã nguồn mở, linh hoạt trong tùy chỉnh, có cộng đồng phát triển lớn.

**Ưu điểm:**

- Giao diện hiện đại, responsive
- Hỗ trợ đa nền tảng (web, iOS, Android)
- Tích hợp nhiều tính năng nâng cao
- Push notification và offline support

## 1.3. Phát biểu bài toán

### 1.3.1. Hiện trạng

Hiện nay, nhiều trường học vẫn gặp các vấn đề sau:

**Về phía sinh viên:**

- Khó khăn trong việc tra cứu lịch học, lịch thi khi không có máy tính
- Không nhận được thông báo kịp thời về các sự kiện quan trọng
- Phải đăng nhập vào nhiều hệ thống khác nhau để lấy thông tin
- Không thể xem thông tin khi mất kết nối internet

**Về phía giảng viên:**

- Mất nhiều thời gian cho việc nhập điểm thủ công
- Khó khăn trong việc quản lý danh sách sinh viên nhiều lớp
- Thiếu công cụ hỗ trợ tính toán điểm tự động

**Về phía quản lý:**

- Thiếu dashboard tổng quan về tình hình đào tạo
- Khó khăn trong việc phân công giảng viên giảng dạy
- Không có công cụ gửi thông báo hàng loạt đến sinh viên
- Dữ liệu phân tán, khó tổng hợp báo cáo

### 1.3.2. Yêu cầu bài toán

Để giải quyết các vấn đề trên, hệ thống cần đáp ứng các yêu cầu sau:

**Yêu cầu chức năng:**

1. **Quản lý người dùng và phân quyền**
   - Hỗ trợ 3 vai trò: Admin, Giảng viên, Sinh viên
   - Xác thực bằng JWT
   - Quản lý session và refresh token

2. **Quản lý danh mục đào tạo**
   - Quản lý khoa, lớp, môn học, học phần
   - Quản lý sinh viên và giảng viên
   - Phân công giảng viên giảng dạy

3. **Quản lý lịch học và lịch thi**
   - Tạo lịch học theo tuần
   - Tạo lịch thi theo học phần
   - Sinh viên xem lịch trên mobile

4. **Quản lý điểm**
   - Giảng viên nhập điểm theo thành phần
   - Tự động tính điểm trung bình có trọng số
   - Chuyển đổi sang thang điểm 4
   - Sinh viên xem điểm trên mobile

5. **Hệ thống thông báo**
   - Admin gửi thông báo đến nhóm đối tượng
   - Push notification real-time
   - Lưu lịch sử thông báo

6. **Hỗ trợ offline**
   - Cache lịch học, lịch thi, điểm trên mobile
   - Đồng bộ khi có kết nối

**Yêu cầu phi chức năng:**

- **Hiệu năng**: API response time < 500ms
- **Bảo mật**: Mã hóa password, JWT authentication, HTTPS
- **Khả năng mở rộng**: Hỗ trợ hàng nghìn người dùng đồng thời
- **Tương thích**: Web hỗ trợ các trình duyệt hiện đại, mobile hỗ trợ iOS 13+ và Android 8+
- **Giao diện**: Responsive, thân thiện, dễ sử dụng

## 1.4. Giải pháp đề xuất

Để đáp ứng các yêu cầu trên, đề tài đề xuất xây dựng hệ thống quản lý sinh viên với kiến trúc 3 tầng:

### 1.4.1. Kiến trúc tổng thể

**Backend API (Node.js + Express + MySQL + Prisma)**

- RESTful API chuẩn
- JWT authentication
- Prisma ORM cho database access
- Swagger documentation
- Push notification với Expo Server SDK

**Web Admin (React + Vite + Tailwind CSS)**

- Giao diện quản trị cho Admin và Giảng viên
- React Query cho data fetching
- React Hook Form cho form validation
- Responsive design với Tailwind CSS

**Mobile App (React Native + Expo + NativeWind)**

- Ứng dụng cho sinh viên (iOS/Android)
- Expo cho cross-platform development
- Push notification với expo-notifications
- Offline cache với AsyncStorage
- NativeWind (Tailwind for React Native)

### 1.4.2. Công nghệ sử dụng

| Thành phần        | Công nghệ                                   |
| ----------------- | ------------------------------------------- |
| Backend Runtime   | Node.js 20+                                 |
| Backend Framework | Express.js 4.x                              |
| Database          | MySQL 8+                                    |
| ORM               | Prisma 6.x                                  |
| Authentication    | JWT (jsonwebtoken)                          |
| Frontend Web      | React 19, Vite 6                            |
| Frontend Mobile   | React Native 0.81, Expo 54                  |
| Styling           | Tailwind CSS, NativeWind                    |
| Push Notification | expo-notifications, expo-server-sdk         |
| API Documentation | Swagger (swagger-jsdoc, swagger-ui-express) |

### 1.4.3. Ưu điểm của giải pháp

- **Hiện đại**: Sử dụng các công nghệ mới nhất, cộng đồng hỗ trợ lớn
- **Cross-platform**: Một codebase React Native cho cả iOS và Android
- **Hiệu năng cao**: Node.js non-blocking I/O, Prisma query optimization
- **Dễ bảo trì**: Code structure rõ ràng, TypeScript-ready
- **Chi phí thấp**: Sử dụng công nghệ mã nguồn mở
- **Mở rộng dễ dàng**: Kiến trúc module hóa, dễ thêm tính năng mới

## 1.5. Kết luận chương 1

Chương 1 đã trình bày tổng quan về đề tài, phân tích hiện trạng quản lý sinh viên hiện nay và các vấn đề cần giải quyết. Qua đó, đề tài đề xuất xây dựng hệ thống quản lý sinh viên toàn diện với kiến trúc 3 tầng, sử dụng các công nghệ hiện đại như Node.js, React, React Native, MySQL và Prisma. Giải pháp này hứa hẹn mang lại hiệu quả cao trong quản lý và trải nghiệm người dùng tốt hơn.

---

# CHƯƠNG 2: CƠ SỞ LÝ THUYẾT

## 2.1. Tổng quan về hệ thống quản lý sinh viên

### 2.1.1. Khái niệm

_[Định nghĩa hệ thống quản lý sinh viên]_

### 2.1.2. Vai trò và ý nghĩa

_[Vai trò của hệ thống trong giáo dục]_

## 2.2. Công nghệ sử dụng

### 2.2.1. Frontend

#### 2.2.1.1. React.js

_[Giới thiệu về React.js, ưu nhược điểm]_

#### 2.2.1.2. Các thư viện hỗ trợ

_[Material-UI, Tailwind CSS, Redux, React Router...]_

### 2.2.2. Backend

#### 2.2.2.1. Node.js và Express.js

_[Giới thiệu về Node.js và Express framework]_

#### 2.2.2.2. RESTful API

_[Khái niệm và nguyên tắc thiết kế RESTful API]_

### 2.2.3. Cơ sở dữ liệu

#### 2.2.3.1. MongoDB/MySQL/PostgreSQL

_[Lựa chọn CSDL và lý do]_

#### 2.2.3.2. Thiết kế cơ sở dữ liệu

_[Các nguyên tắc chuẩn hóa CSDL]_

### 2.2.4. Các công nghệ bổ sung

- Authentication & Authorization (JWT, OAuth)
- File Upload & Storage
- Email Service
- Reporting & Analytics

## 2.3. Phương pháp phát triển phần mềm

### 2.3.1. Mô hình Agile/Scrum

_[Giới thiệu mô hình phát triển được sử dụng]_

### 2.3.2. Quy trình phát triển

_[Các giai đoạn: Thu thập yêu cầu, Phân tích, Thiết kế, Cài đặt, Kiểm thử]_

## 2.4. UML và các biểu đồ

### 2.4.1. Use Case Diagram

_[Biểu đồ ca sử dụng]_

### 2.4.2. Activity Diagram

_[Biểu đồ hoạt động]_

### 2.4.3. Sequence Diagram

_[Biểu đồ tuần tự]_

### 2.4.4. Class Diagram

_[Biểu đồ lớp]_

### 2.4.5. Entity Relationship Diagram (ERD)

_[Biểu đồ thực thể liên kết]_

## 2.5. Kết luận chương 2

_[Tóm tắt nội dung chương 2]_

---

# CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Phân tích yêu cầu

### 3.1.1. Yêu cầu chức năng

#### 3.1.1.1. Quản lý người dùng

- Đăng ký, đăng nhập, đăng xuất
- Phân quyền (Admin, Giảng viên, Sinh viên)
- Quản lý thông tin cá nhân

#### 3.1.1.2. Quản lý sinh viên

- Thêm, sửa, xóa thông tin sinh viên
- Tìm kiếm, lọc sinh viên
- Import/Export danh sách sinh viên

#### 3.1.1.3. Quản lý lớp học

- Tạo, cập nhật lớp học
- Phân công giảng viên
- Danh sách sinh viên theo lớp

#### 3.1.1.4. Quản lý môn học

- Thêm, sửa, xóa môn học
- Quản lý chương trình đào tạo

#### 3.1.1.5. Quản lý điểm

- Nhập điểm
- Xem điểm
- Thống kê điểm

#### 3.1.1.6. Báo cáo và thống kê

- Báo cáo kết quả học tập
- Thống kê sinh viên theo nhiều tiêu chí
- Xuất báo cáo

### 3.1.2. Yêu cầu phi chức năng

- **Hiệu năng**: Thời gian phản hồi < 2s
- **Bảo mật**: Mã hóa dữ liệu, xác thực người dùng
- **Khả năng mở rộng**: Hỗ trợ hàng nghìn người dùng đồng thời
- **Giao diện**: Thân thiện, dễ sử dụng
- **Tương thích**: Hoạt động trên các trình duyệt phổ biến

## 3.2. Phân tích hệ thống

### 3.2.1. Xác định Actor

- **Admin**: Quản trị hệ thống
- **Giảng viên**: Quản lý lớp học, nhập điểm
- **Sinh viên**: Xem thông tin, xem điểm

### 3.2.2. Use Case Diagram

_[Chèn biểu đồ Use Case tổng thể]_

**Hình 3.1**: Use Case Diagram tổng thể

### 3.2.3. Mô tả Use Case chi tiết

#### Use Case 01: Đăng nhập hệ thống

| Thông tin       | Mô tả                                                                                  |
| --------------- | -------------------------------------------------------------------------------------- |
| **Tên UC**      | Đăng nhập                                                                              |
| **Actor**       | Admin, Giảng viên, Sinh viên                                                           |
| **Mô tả**       | Người dùng đăng nhập vào hệ thống                                                      |
| **Luồng chính** | 1. Nhập tên đăng nhập và mật khẩu<br>2. Hệ thống xác thực<br>3. Chuyển đến trang chính |
| **Luồng phụ**   | Sai thông tin đăng nhập → Hiển thị lỗi                                                 |

#### Use Case 02: Quản lý thông tin sinh viên

_[Mô tả chi tiết tương tự]_

_[Tiếp tục với các Use Case khác...]_

### 3.2.4. Activity Diagram

_[Chèn biểu đồ hoạt động cho các chức năng chính]_

**Hình 3.2**: Activity Diagram - Quy trình đăng nhập

### 3.2.5. Sequence Diagram

_[Chèn biểu đồ tuần tự]_

**Hình 3.3**: Sequence Diagram - Đăng nhập

## 3.3. Thiết kế hệ thống

### 3.3.1. Kiến trúc hệ thống

_[Mô tả kiến trúc 3-tier hoặc Microservices]_

**Hình 3.4**: Kiến trúc tổng thể hệ thống

- **Presentation Layer**: React.js
- **Business Logic Layer**: Node.js + Express
- **Data Access Layer**: MongoDB/MySQL

### 3.3.2. Thiết kế cơ sở dữ liệu

#### 3.3.2.1. Sơ đồ ERD

_[Chèn biểu đồ ERD]_

**Hình 3.5**: Sơ đồ ERD

#### 3.3.2.2. Mô tả các bảng

**Bảng 3.1**: Bảng Users (Người dùng)

| Tên trường | Kiểu dữ liệu | Mô tả                | Ràng buộc        |
| ---------- | ------------ | -------------------- | ---------------- |
| id         | String       | Mã người dùng        | PRIMARY KEY      |
| username   | String       | Tên đăng nhập        | UNIQUE, NOT NULL |
| password   | String       | Mật khẩu (đã mã hóa) | NOT NULL         |
| email      | String       | Email                | UNIQUE, NOT NULL |
| role       | String       | Vai trò              | NOT NULL         |
| createdAt  | DateTime     | Ngày tạo             | NOT NULL         |

**Bảng 3.2**: Bảng Students (Sinh viên)

| Tên trường  | Kiểu dữ liệu | Mô tả         | Ràng buộc   |
| ----------- | ------------ | ------------- | ----------- |
| id          | String       | Mã sinh viên  | PRIMARY KEY |
| userId      | String       | Mã người dùng | FOREIGN KEY |
| fullName    | String       | Họ tên        | NOT NULL    |
| dateOfBirth | Date         | Ngày sinh     | NOT NULL    |
| gender      | String       | Giới tính     | NOT NULL    |
| address     | String       | Địa chỉ       |             |
| phone       | String       | Số điện thoại |             |
| className   | String       | Lớp           |             |

**Bảng 3.3**: Bảng Classes (Lớp học)

| Tên trường | Kiểu dữ liệu | Mô tả         | Ràng buộc   |
| ---------- | ------------ | ------------- | ----------- |
| id         | String       | Mã lớp        | PRIMARY KEY |
| className  | String       | Tên lớp       | NOT NULL    |
| subjectId  | String       | Mã môn học    | FOREIGN KEY |
| teacherId  | String       | Mã giảng viên | FOREIGN KEY |
| semester   | String       | Học kỳ        | NOT NULL    |
| year       | Number       | Năm học       | NOT NULL    |

**Bảng 3.4**: Bảng Subjects (Môn học)

| Tên trường  | Kiểu dữ liệu | Mô tả       | Ràng buộc   |
| ----------- | ------------ | ----------- | ----------- |
| id          | String       | Mã môn học  | PRIMARY KEY |
| subjectName | String       | Tên môn học | NOT NULL    |
| credits     | Number       | Số tín chỉ  | NOT NULL    |
| description | String       | Mô tả       |             |

**Bảng 3.5**: Bảng Grades (Điểm)

| Tên trường   | Kiểu dữ liệu | Mô tả           | Ràng buộc   |
| ------------ | ------------ | --------------- | ----------- |
| id           | String       | Mã điểm         | PRIMARY KEY |
| studentId    | String       | Mã sinh viên    | FOREIGN KEY |
| subjectId    | String       | Mã môn học      | FOREIGN KEY |
| midtermGrade | Number       | Điểm giữa kỳ    |             |
| finalGrade   | Number       | Điểm cuối kỳ    |             |
| averageGrade | Number       | Điểm trung bình |             |
| semester     | String       | Học kỳ          | NOT NULL    |

_[Tiếp tục với các bảng khác...]_

### 3.3.3. Thiết kế giao diện

#### 3.3.3.1. Sơ đồ điều hướng

_[Chèn sơ đồ sitemap]_

**Hình 3.6**: Sơ đồ điều hướng

#### 3.3.3.2. Wireframe các màn hình chính

**Hình 3.7**: Màn hình đăng nhập

**Hình 3.8**: Màn hình Dashboard

**Hình 3.9**: Màn hình quản lý sinh viên

**Hình 3.10**: Màn hình quản lý điểm

### 3.3.4. Thiết kế API

#### 3.3.4.1. API Authentication

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh-token
```

#### 3.3.4.2. API Users

```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

#### 3.3.4.3. API Students

```
GET    /api/students
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
GET    /api/students/search?q=...
```

#### 3.3.4.4. API Classes

```
GET    /api/classes
GET    /api/classes/:id
POST   /api/classes
PUT    /api/classes/:id
DELETE /api/classes/:id
GET    /api/classes/:id/students
```

#### 3.3.4.5. API Grades

```
GET    /api/grades/student/:studentId
POST   /api/grades
PUT    /api/grades/:id
GET    /api/grades/class/:classId
```

_[Mô tả chi tiết request/response của từng API]_

## 3.4. Thiết kế bảo mật

### 3.4.1. Xác thực và phân quyền

- JWT (JSON Web Token) cho xác thực
- Role-based Access Control (RBAC)
- Password hashing với bcrypt

### 3.4.2. Bảo mật dữ liệu

- HTTPS
- Validation input
- SQL Injection prevention
- XSS protection

## 3.5. Kết luận chương 3

_[Tóm tắt nội dung chương 3]_

---

# CHƯƠNG 4: CÀI ĐẶT VÀ TRIỂN KHAI

## 4.1. Môi trường phát triển

### 4.1.1. Phần cứng

- CPU: ...
- RAM: ...
- Ổ cứng: ...

### 4.1.2. Phần mềm

- Hệ điều hành: Windows/macOS/Linux
- IDE: Visual Studio Code
- Database: MongoDB/MySQL
- Browser: Chrome, Firefox
- Version Control: Git

### 4.1.3. Công nghệ và thư viện

**Frontend:**

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "tailwindcss": "^3.x"
}
```

**Backend:**

```json
{
  "express": "^4.x",
  "mongoose": "^7.x",
  "jsonwebtoken": "^9.x",
  "bcryptjs": "^2.x"
}
```

## 4.2. Cài đặt các chức năng chính

### 4.2.1. Module Authentication

#### 4.2.1.1. Đăng nhập

```javascript
// Backend: controllers/authController.js
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    // Tìm user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    // Tạo token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

```javascript
// Frontend: services/authService.js
export const login = async (username, password) => {
  const response = await axios.post("/api/auth/login", {
    username,
    password,
  });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};
```

### 4.2.2. Module Quản lý sinh viên

#### 4.2.2.1. Thêm sinh viên

_[Code và giải thích]_

#### 4.2.2.2. Cập nhật thông tin sinh viên

_[Code và giải thích]_

#### 4.2.2.3. Xóa sinh viên

_[Code và giải thích]_

#### 4.2.2.4. Tìm kiếm sinh viên

_[Code và giải thích]_

### 4.2.3. Module Quản lý lớp học

_[Cài đặt chi tiết các chức năng]_

### 4.2.4. Module Quản lý điểm

_[Cài đặt chi tiết các chức năng]_

### 4.2.5. Module Báo cáo

_[Cài đặt chi tiết các chức năng]_

## 4.3. Xử lý một số vấn đề kỹ thuật

### 4.3.1. Upload file

_[Giải pháp upload avatar, import Excel]_

### 4.3.2. Export Excel

_[Code xuất dữ liệu ra Excel]_

### 4.3.3. Pagination

_[Phân trang dữ liệu]_

### 4.3.4. Real-time notification

_[Thông báo thời gian thực với WebSocket]_

## 4.4. Triển khai hệ thống

### 4.4.1. Cấu hình production

_[Environment variables, build optimization]_

### 4.4.2. Deploy Backend

_[Deploy lên Heroku/AWS/VPS]_

### 4.4.3. Deploy Frontend

_[Deploy lên Vercel/Netlify]_

### 4.4.4. Database hosting

_[MongoDB Atlas/Cloud SQL]_

## 4.5. Kết luận chương 4

_[Tóm tắt nội dung chương 4]_

---

# CHƯƠNG 5: KẾT QUẢ VÀ ĐÁNH GIÁ

## 5.1. Kết quả đạt được

### 5.1.1. Chức năng đã hoàn thành

- ✅ Đăng nhập/Đăng ký
- ✅ Quản lý người dùng
- ✅ Quản lý sinh viên
- ✅ Quản lý lớp học
- ✅ Quản lý môn học
- ✅ Quản lý điểm
- ✅ Báo cáo và thống kê
- ✅ Import/Export dữ liệu

### 5.1.2. Giao diện hệ thống

**Hình 5.1**: Màn hình đăng nhập

_[Chèn ảnh chụp màn hình thực tế]_

**Hình 5.2**: Dashboard Admin

_[Chèn ảnh]_

**Hình 5.3**: Trang quản lý sinh viên

_[Chèn ảnh]_

**Hình 5.4**: Trang nhập điểm

_[Chèn ảnh]_

**Hình 5.5**: Báo cáo kết quả học tập

_[Chèn ảnh]_

## 5.2. Kiểm thử hệ thống

### 5.2.1. Kiểm thử chức năng (Functional Testing)

**Bảng 5.1**: Kết quả kiểm thử chức năng

| STT | Chức năng      | Test Case                        | Kết quả | Ghi chú      |
| --- | -------------- | -------------------------------- | ------- | ------------ |
| 1   | Đăng nhập      | Đăng nhập với tài khoản hợp lệ   | ✅ Pass |              |
| 2   | Đăng nhập      | Đăng nhập với mật khẩu sai       | ✅ Pass | Hiển thị lỗi |
| 3   | Thêm sinh viên | Thêm SV với đầy đủ thông tin     | ✅ Pass |              |
| 4   | Thêm sinh viên | Thêm SV thiếu thông tin bắt buộc | ✅ Pass | Validation   |
| 5   | Cập nhật điểm  | Nhập điểm hợp lệ                 | ✅ Pass |              |
| ... | ...            | ...                              | ...     | ...          |

### 5.2.2. Kiểm thử hiệu năng (Performance Testing)

**Bảng 5.2**: Kết quả kiểm thử hiệu năng

| Chức năng        | Số lượng user | Thời gian phản hồi | Kết quả |
| ---------------- | ------------- | ------------------ | ------- |
| Đăng nhập        | 100           | 0.8s               | ✅ Pass |
| Tải danh sách SV | 50            | 1.2s               | ✅ Pass |
| Tìm kiếm         | 100           | 0.5s               | ✅ Pass |

### 5.2.3. Kiểm thử bảo mật (Security Testing)

- ✅ SQL Injection: Đã được bảo vệ
- ✅ XSS: Đã sanitize input
- ✅ CSRF: Sử dụng token
- ✅ Authentication: JWT secure

### 5.2.4. Kiểm thử tương thích (Compatibility Testing)

**Bảng 5.3**: Kết quả kiểm thử trên các trình duyệt

| Trình duyệt | Phiên bản | Kết quả |
| ----------- | --------- | ------- |
| Chrome      | 120+      | ✅ Pass |
| Firefox     | 115+      | ✅ Pass |
| Safari      | 16+       | ✅ Pass |
| Edge        | 120+      | ✅ Pass |

## 5.3. Đánh giá hệ thống

### 5.3.1. Ưu điểm

- Giao diện thân thiện, dễ sử dụng
- Đầy đủ các chức năng quản lý cơ bản
- Hiệu năng tốt
- Bảo mật cao
- Dễ dàng bảo trì và mở rộng

### 5.3.2. Hạn chế

- Chưa có tính năng chat/messaging
- Chưa có mobile app
- Báo cáo chưa đa dạng
- Chưa tích hợp thanh toán học phí

### 5.3.3. So sánh với hệ thống tương tự

**Bảng 5.4**: So sánh tính năng

| Tính năng    | Hệ thống này | Hệ thống A | Hệ thống B |
| ------------ | ------------ | ---------- | ---------- |
| Quản lý SV   | ✅           | ✅         | ✅         |
| Quản lý điểm | ✅           | ✅         | ✅         |
| Báo cáo      | ✅           | ✅         | ⚠️         |
| Mobile App   | ❌           | ✅         | ✅         |
| Giá thành    | Miễn phí     | Trả phí    | Trả phí    |

## 5.4. Đánh giá của người dùng

### 5.4.1. Khảo sát

_[Kết quả khảo sát từ sinh viên, giảng viên]_

**Bảng 5.5**: Mức độ hài lòng

| Tiêu chí   | Điểm TB (1-5) |
| ---------- | ------------- |
| Giao diện  | 4.2           |
| Dễ sử dụng | 4.5           |
| Hiệu năng  | 4.0           |
| Chức năng  | 4.3           |

## 5.5. Kết luận chương 5

_[Tóm tắt kết quả và đánh giá]_

---

# CHƯƠNG 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 6.1. Kết luận

### 6.1.1. Kết quả đạt được

_[Tổng kết những gì đã hoàn thành]_

Đồ án đã hoàn thành được các mục tiêu đề ra:

- Xây dựng được hệ thống quản lý sinh viên hoàn chỉnh
- Đáp ứng các yêu cầu chức năng và phi chức năng
- Giao diện thân thiện, dễ sử dụng
- Hiệu năng và bảo mật tốt

### 6.1.2. Ý nghĩa của đề tài

_[Đóng góp của đề tài vào thực tiễn]_

### 6.1.3. Bài học kinh nghiệm

_[Những kinh nghiệm rút ra trong quá trình thực hiện]_

## 6.2. Hạn chế

- Chưa có ứng dụng mobile
- Tính năng báo cáo chưa phong phú
- Chưa tích hợp với các hệ thống khác
- Chưa hỗ trợ đa ngôn ngữ

## 6.3. Hướng phát triển

### 6.3.1. Ngắn hạn (3-6 tháng)

- Phát triển mobile app (React Native/Flutter)
- Bổ sung thêm các loại báo cáo
- Tích hợp email notification
- Thêm tính năng chat giữa giảng viên và sinh viên

### 6.3.2. Trung hạn (6-12 tháng)

- Tích hợp AI/ML để dự đoán kết quả học tập
- Hệ thống đề xuất môn học
- Dashboard analytics nâng cao
- Tích hợp thanh toán học phí online

### 6.3.3. Dài hạn (1-2 năm)

- Phát triển thành platform đa trường
- Hỗ trợ learning management system (LMS)
- Tích hợp video conference
- Blockchain cho chứng chỉ điện tử

## 6.4. Tổng kết

_[Lời kết đồ án]_

---

# TÀI LIỆU THAM KHẢO

## Tiếng Việt

[1] Nguyễn Văn A, "Giáo trình Công nghệ phần mềm", NXB Giáo dục, 2022

[2] Trần Thị B, "Phân tích và thiết kế hệ thống thông tin", NXB Thống Kê, 2021

## Tiếng Anh

[3] Robert C. Martin, "Clean Code: A Handbook of Agile Software Craftsmanship", Prentice Hall, 2008

[4] Eric Evans, "Domain-Driven Design", Addison-Wesley, 2003

## Tài liệu web

[5] React Documentation, https://react.dev/, truy cập ngày 10/01/2026

[6] Node.js Documentation, https://nodejs.org/, truy cập ngày 10/01/2026

[7] MongoDB Documentation, https://www.mongodb.com/docs/, truy cập ngày 10/01/2026

[8] Express.js Guide, https://expressjs.com/, truy cập ngày 10/01/2026

---

# PHỤ LỤC

## Phụ lục A: Source code

_[Link Github repository hoặc CD đính kèm]_

Repository: https://github.com/username/student-management-app

## Phụ lục B: Hướng dẫn cài đặt

### B.1. Cài đặt Backend

```bash
cd backend
npm install
cp .env.example .env
# Cấu hình .env
npm run dev
```

### B.2. Cài đặt Frontend

```bash
cd frontend
npm install
npm start
```

### B.3. Cài đặt Database

_[Hướng dẫn setup MongoDB/MySQL]_

## Phụ lục C: Hướng dẫn sử dụng

### C.1. Dành cho Admin

_[Các bước sử dụng cho admin]_

### C.2. Dành cho Giảng viên

_[Các bước sử dụng cho giảng viên]_

### C.3. Dành cho Sinh viên

_[Các bước sử dụng cho sinh viên]_

## Phụ lục D: Database Schema

_[Chi tiết đầy đủ cấu trúc database]_

## Phụ lục E: API Documentation

_[Chi tiết đầy đủ các API endpoints]_

---

**HẾT**
