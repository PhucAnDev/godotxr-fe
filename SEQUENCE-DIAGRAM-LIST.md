# Danh sách Sequence Diagram cần vẽ — Hệ thống GodotXR

Tài liệu này tổng hợp danh sách các **Sequence Diagram (Luồng tuần tự)** cần thiết để mô tả đầy đủ các chức năng nghiệp vụ của hệ thống GodotXR (bao gồm Web Dashboard, Godot VR Client và Backend API). 

Quy ước vẽ sơ đồ tuần tự tuân theo [PROJECT-PROFILE.md](file:///d:/do%20an/BE/godotxr-be/docs/PROJECT-PROFILE.md):
- **Đối tác đầu tiên (Actor/Client):** `<UseCase>UI` đại diện cho Web Dashboard (React) hoặc VR Client (Godot).
- **Các lớp Backend:** Tuân thủ mô hình **Controller-Service-Repository Clean Architecture** (ví dụ: `UsersController` -> `UserService` -> `UnitOfWork` -> `AppDbContext`).
- **Database:** Điểm kết thúc luôn là `Database` đại diện cho PostgreSQL/SQL Server qua Entity Framework Core (`AppDbContext`).

---

## 01. Module: Authentication & Session Management (Xác thực & Phiên làm việc)
Quản lý đăng nhập, cấp JWT, cấp lại token và các luồng khôi phục/đổi mật khẩu an toàn.

| Luồng nghiệp vụ | Endpoint API | Actor / Client | Thành phần tham gia chính |
| :--- | :--- | :--- | :--- |
| **1. Login (Đăng nhập)** | `POST /api/auth/login` | Admin, Teacher, Parent (React), Child (Godot VR) | `AuthController`, `AuthService`, `TokenService`, `UserService`, `UnitOfWork`, `Database` |
| **2. Refresh Token (Cấp lại Token)** | `POST /api/auth/refresh-token` | Mọi client (React / Godot VR) | `AuthController`, `AuthService`, `TokenService`, `UnitOfWork`, `Database` |
| **3. Forgot Password (Quên mật khẩu)** | `POST /api/auth/forgot-password` | Admin, Teacher, Parent | `AuthController`, `AuthService`, `MailService`, `Redis Cache` (để lưu OTP) |
| **4. Verify OTP (Xác nhận mã OTP)** | `POST /api/auth/verify-otp` | Admin, Teacher, Parent | `AuthController`, `AuthService`, `Redis Cache` (kiểm tra OTP khớp) |
| **5. Reset Password (Đặt lại mật khẩu)** | `POST /api/auth/reset-password` | Admin, Teacher, Parent | `AuthController`, `AuthService`, `PasswordHasherService`, `UnitOfWork`, `Database` |
| **6. Change Password (Đổi mật khẩu)** | `POST /api/auth/change-password` | Admin, Teacher, Parent | `AuthController`, `AuthService`, `PasswordHasherService`, `UnitOfWork`, `Database` |
| **7. Verify Email (Xác minh tài khoản)** | `GET /api/auth/verify-email` | Parent | `AuthController`, `AuthService`, `UnitOfWork`, `Database` |

---

## 02. Module: User Management (Quản lý Người dùng)
Quản lý danh sách người dùng hệ thống dành cho Admin và Teacher.

| Luồng nghiệp vụ | Endpoint API | Actor / Client | Thành phần tham gia chính |
| :--- | :--- | :--- | :--- |
| **1. Get List Users (Lấy danh sách người dùng)** | `GET /api/users` | Admin | `UsersController`, `UserService`, `UnitOfWork`, `Database` |
| **2. Get User By ID (Chi tiết người dùng)** | `GET /api/users/{id}` | Admin, Teacher, Parent | `UsersController`, `UserService`, `UnitOfWork`, `Database` |
| **3. Create Account (Tạo tài khoản Giáo viên/Phụ huynh)** | `POST /api/users/create-account` | Admin, Teacher | `UsersController`, `UserService`, `MailService` (gửi mật khẩu tạm), `Database` |
| **4. Update User Profile (Cập nhật thông tin cá nhân)** | `PUT /api/users/{id}` | Admin, Teacher, Parent | `UsersController`, `UserService`, `UnitOfWork`, `Database` |
| **5. Delete User (Xóa/Khóa tài khoản)** | `DELETE /api/users/{id}` | Admin | `UsersController`, `UserService`, `UnitOfWork`, `Database` (đánh dấu `IsDeleted = true`) |
| **6. Get Current User Children Profiles** | `GET /api/users/children-profiles` | Parent | `UsersController`, `UserService`, `UnitOfWork`, `Database` |

---

## 03. Module: Classroom Management (Quản lý Lớp học)
Dành cho Admin lập lớp và phân công Giáo viên phụ trách.

| Luồng nghiệp vụ | Endpoint API | Actor / Client | Thành phần tham gia chính |
| :--- | :--- | :--- | :--- |
| **1. Get List Classrooms (Lấy danh sách lớp học)** | `GET /api/classrooms` | Admin, Teacher, Parent | `ClassroomsController`, `ClassroomService`, `UnitOfWork`, `Database` |
| **2. Get Classroom By ID (Chi tiết lớp học)** | `GET /api/classrooms/{id}` | Admin, Teacher, Parent | `ClassroomsController`, `ClassroomService`, `UnitOfWork`, `Database` |
| **3. Create Classroom (Tạo lớp học mới)** | `POST /api/classrooms` | Admin | `ClassroomsController`, `ClassroomService`, `UnitOfWork`, `Database` |
| **4. Update Classroom (Sửa thông tin/đổi giáo viên)** | `PUT /api/classrooms/{id}` | Admin | `ClassroomsController`, `ClassroomService`, `UnitOfWork`, `Database` |
| **5. Delete Classroom (Xóa lớp học)** | `DELETE /api/classrooms/{id}` | Admin | `ClassroomsController`, `ClassroomService`, `UnitOfWork`, `Database` |
| **6. Get Classrooms By Teacher ID** | `GET /api/classrooms/{teacherId}/classrooms` | Admin, Teacher | `ClassroomsController`, `ClassroomService`, `UnitOfWork`, `Database` |

---

## 04. Module: Lesson & Program Management (Quản lý Bài học & Chương trình học)
Lập trình nội dung dạy cho trẻ em.

| Luồng nghiệp vụ | Endpoint API | Actor / Client | Thành phần tham gia chính |
| :--- | :--- | :--- | :--- |
| **1. Get List Lessons (Lấy danh sách bài học)** | `GET /api/lessons` | Admin, Teacher | `LessonsController`, `LessonService`, `UnitOfWork`, `Database` |
| **2. Get Lessons By Program ID** | `GET /api/lessons/program/{programId}` | Admin, Teacher, Parent | `LessonsController`, `LessonService`, `UnitOfWork`, `Database` |
| **3. Create Lesson (Tạo bài học)** | `POST /api/lessons` | Admin, Teacher | `LessonsController`, `LessonService`, `UnitOfWork`, `Database` |
| **4. Update Lesson (Cập nhật bài học)** | `PUT /api/lessons/{id}` | Admin, Teacher | `LessonsController`, `LessonService`, `UnitOfWork`, `Database` |
| **5. Delete Lesson (Xóa bài học)** | `DELETE /api/lessons/{id}` | Admin, Teacher | `LessonsController`, `LessonService`, `UnitOfWork`, `Database` |

---

## 05. Module: Exercise & Question Management (Quản lý Bài tập & Câu hỏi)
Quản lý câu hỏi để luyện phát âm, nhận diện sự vật trong môi trường VR.

| Luồng nghiệp vụ | Endpoint API | Actor / Client | Thành phần tham gia chính |
| :--- | :--- | :--- | :--- |
| **1. Get List Exercises (Lấy danh sách bài tập)** | `GET /api/exercises` | Admin, Teacher, Parent | `ExercisesController`, `ExerciseService`, `UnitOfWork`, `Database` |
| **2. Get Exercise By ID (Chi tiết bài tập)** | `GET /api/exercises/{id}` | Admin, Teacher, Parent | `ExercisesController`, `ExerciseService`, `UnitOfWork`, `Database` |
| **3. Create Exercise (Tạo bài tập kèm câu hỏi)** | `POST /api/exercises` | Admin, Teacher | `ExercisesController`, `ExerciseService`, `UnitOfWork`, `Database` |
| **4. Update Exercise (Cập nhật bài tập)** | `PUT /api/exercises/{id}` | Admin, Teacher | `ExercisesController`, `ExerciseService`, `UnitOfWork`, `Database` |
| **5. Delete Exercise (Xóa bài tập)** | `DELETE /api/exercises/{id}` | Admin | `ExercisesController`, `ExerciseService`, `UnitOfWork`, `Database` |

---

## 06. Module: Child Profile & Enrollment (Hồ sơ Trẻ em & Ghi danh)
Quản lý hồ sơ học tập của trẻ và quy trình duyệt ghi danh học tập vào các lớp.

| Luồng nghiệp vụ | Endpoint API / Hoạt động | Actor / Client | Thành phần tham gia chính |
| :--- | :--- | :--- | :--- |
| **1. Create Child Profile (Tạo hồ sơ cho bé)** | `POST /api/child-profiles` | Parent | `ChildProfilesController`, `ChildProfileService`, `UnitOfWork`, `Database` |
| **2. Update Child Profile (Sửa hồ sơ bé)** | `PUT /api/child-profiles/{id}` | Parent | `ChildProfilesController`, `ChildProfileService`, `UnitOfWork`, `Database` |
| **3. Get My Child Profiles (Danh sách bé của tôi)** | `GET /api/child-profiles/my-children` | Parent | `ChildProfilesController`, `ChildProfileService`, `UnitOfWork`, `Database` |
| **4. Create Enrollment (Ghi danh bé vào lớp học)** | `POST /api/enrollments` | Teacher, Admin | `EnrollmentsController`, `EnrollmentService`, `UnitOfWork`, `Database` |
| **5. Approve Enrollment (Duyệt hồ sơ ghi danh)** | `PUT /api/enrollments/{id}/approve` | Teacher, Admin | `EnrollmentsController`, `EnrollmentService`, `UnitOfWork`, `Database` (Cập nhật `Status = Approved`) |
| **6. Transfer Class (Chuyển bé sang lớp học khác)** | `PUT /api/enrollments/{id}/transfer` | Teacher, Admin | `EnrollmentsController`, `EnrollmentService`, `UnitOfWork`, `Database` |

---

## 07. Module: Results & Performance Analysis (Kết quả Học tập & Phân tích Đánh giá)
*Đây là cốt lõi của hệ thống GodotXR, tích hợp giữa VR client, hệ thống lưu trữ MinIO/AWS S3, Azure Speech Service và phân tích dữ liệu học tập.*

| Luồng nghiệp vụ | Endpoint API / Hoạt động | Actor / Client | Thành phần tham gia chính |
| :--- | :--- | :--- | :--- |
| **1. Submit VR Exercise Result (Nộp kết quả bài tập VR)** | `POST /api/results/submit` | Child (Godot VR client) | `ResultsController`, `ResultService`, `UnitOfWork`, `Database` |
| **2. Upload Audio Chunk (Tải luồng âm thanh luyện nói)** | `POST /api/files/chunks` | Child (Godot VR client) | `FilesController`, `StorageService` (lưu trữ file âm thanh .wav vào MinIO/S3) |
| **3. Assess Speech Chunk (Đánh giá giọng đọc phát âm)** | `POST /api/files/chunks/assess` | Child (Godot VR client) | `FilesController`, `StorageService` (lấy file âm thanh), **Azure Speech API** (phân tích ngữ âm phát âm tiếng Việt/tiếng Anh), trả về kết quả độ chính xác (Accuracy), trôi chảy (Fluency), hoàn thành (Completeness). |
| **4. Update Teacher Feedback (Giáo viên nhận xét bài)** | `PUT /api/results/{id}/feedback` | Teacher | `ResultsController`, `ResultService`, `UnitOfWork`, `Database` |
| **5. Create AI Analysis (Tạo báo cáo AI phân tích tiến trình của bé)** | `POST /api/analyze` | Admin, Teacher | `AnalyzeController`, `AnalyzeService`, `UnitOfWork`, `Database` |
| **6. Get Child AI Analysis (Xem phân tích AI của bé)** | `GET /api/analyze/child/{childId}` | Parent, Teacher, Admin | `AnalyzeController`, `AnalyzeService`, `UnitOfWork`, `Database` |

---

## 08. Module: Reports & System Settings (Báo cáo & Thiết lập Hệ thống)
Các luồng quản lý chung của hệ thống.

| Luồng nghiệp vụ | Endpoint API | Actor / Client | Thành phần tham gia chính |
| :--- | :--- | :--- | :--- |
| **1. Create Report (Tạo báo cáo thống kê kết quả lớp học)** | `POST /api/report` | Teacher, Admin | `ReportController`, `ReportService`, `UnitOfWork`, `Database` |
| **2. Get List Reports (Danh sách báo cáo)** | `GET /api/report` | Teacher, Admin, Parent | `ReportController`, `ReportService`, `UnitOfWork`, `Database` |
| **3. Manage School Year (Quản lý năm học)** | `GET /api/schoolyears` | Admin | `SchoolYearsController`, `SchoolYearService`, `UnitOfWork`, `Database` |
| **4. Manage Semesters (Quản lý học kỳ)** | `GET /api/semesters` | Admin | `SemestersController`, `SemesterService`, `UnitOfWork`, `Database` |

---

## 💡 Đề xuất các luồng trọng tâm cần vẽ trước (High Priority)
Nếu bạn cần vẽ trước để kiểm chứng hệ thống và nộp báo cáo sớm, hãy tập trung vào **5 luồng phức tạp và đặc trưng nhất của GodotXR**:
1. **01-1. Đăng nhập hệ thống (Login)**: Minh họa cách phân quyền AccessToken giữa Dashboard Web (React) và VR Client (Godot).
2. **06-4. Ghi danh & Duyệt học sinh vào lớp (Create & Approve Enrollment)**: Thể hiện quy trình phối hợp phê duyệt giữa Giáo viên/Admin.
3. **07-1. Nộp kết quả bài luyện tập từ môi trường VR (Submit Result)**: Luồng gửi dữ liệu từ Godot VR Client lên REST API backend của C# .NET.
4. **07-3. Đánh giá phát âm giọng nói (Assess Speech Chunk)**: Luồng tương tác thời gian thực giữa Godot VR Client -> Backend Storage (MinIO) -> Azure Speech Cognitive Service để lấy đánh giá từ AI.
5. **07-5. Tạo đánh giá phân tích AI (Create AI Analysis)**: Luồng phân tích sâu hiệu suất học tập của trẻ dựa trên dữ liệu lịch sử bài tập.
