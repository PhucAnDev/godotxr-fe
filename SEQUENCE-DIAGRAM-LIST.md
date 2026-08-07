# Danh sách Sequence & Class Diagram cần vẽ — Hệ thống GodotXR

Tài liệu này tổng hợp toàn bộ danh sách các **Sequence Diagram (Luồng tuần tự)** và **Class Diagram (Sơ đồ lớp)** cần thiết để mô tả đầy đủ tất cả các chức năng nghiệp vụ của hệ thống GodotXR (bao gồm Web Dashboard, Godot VR Client và Backend API).

Quy ước vẽ sơ đồ tuần tự và sơ đồ lớp tuân theo kiến trúc thực tế của 3 dự án:
1. **Frontend Web Dashboard (React / TypeScript):** Gửi HTTP Request thông qua các file Service (`authService.ts`, `resultService.ts`, v.v.) và hiển thị giao diện UI tương ứng.
2. **Godot VR Client (GDScript & C#):** Sử dụng các script API (`AuthController.gd`, `result-api.gd`, v.v.), `MicController.gd`, `SessionUploader.cs`, `AzureSpeechManager.cs` để ghi âm, upload file và gửi kết quả bài tập.
3. **Backend API (.NET Core Clean Architecture):**
   - **Entry point:** `[Name]Controller`
   - **Service:** `I[Name]Service` -> `[Name]Service` (Một số controller như `EventLogsController` và `PronunciationDetailsController` sẽ gọi trực tiếp `UnitOfWork` / Repository mà không qua tầng Service để giảm thiểu lớp trung gian không cần thiết).
   - **Data-access:** `IUnitOfWork` -> `UnitOfWork` quản lý các repository như `IUserRepository`, `IResultRepository`, v.v. Các repository này kế thừa từ `GenericRepository<T>`.
   - **Database:** `AppDbContext` (Entity Framework Core) thao tác với cơ sở dữ liệu.

---

## 01. Module: Authentication & Session Management (Xác thực & Phiên làm việc)
Quản lý đăng nhập, cấp JWT, refresh token, xác thực tài khoản và đổi/khôi phục mật khẩu.

### Danh sách các luồng nghiệp vụ & Sơ đồ lớp tương ứng

| STT | Luồng nghiệp vụ / Use Case | Endpoint API | Actor / Client UI | Thành phần tham gia chính (Sequence & Class) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Login (Đăng nhập)** | `POST /api/auth/login` | Admin, Teacher, Parent (React), Child (Godot VR) | - Sequence: `UI` → `AuthController` → `IAuthService/AuthService` → `ITokenService/TokenService` → `IPasswordHasherService` → `UnitOfWork` → `Database`<br/>- Class: `LoginRequest`, `TokenModel`, `User`, `Role` |
| **2** | **Refresh Token (Cấp lại Token)** | `POST /api/auth/refresh-token` | Mọi client (React / Godot VR) | - Sequence: `UI` → `AuthController` → `IAuthService/AuthService` → `ITokenService/TokenService` → `UnitOfWork` → `Database`<br/>- Class: `RefreshTokenRequest`, `TokenModel`, `User` |
| **3** | **Forgot Password (Quên mật khẩu)** | `POST /api/auth/forgot-password` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `AuthController` → `IAuthService/AuthService` → `IMailService` (Brevo/Smtp) → `IDistributedCache` (Redis để lưu trữ mã OTP)<br/>- Class: `ForgotPasswordRequest`, `User` |
| **4** | **Verify OTP (Xác nhận OTP)** | `POST /api/auth/verify-otp` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `AuthController` → `IAuthService/AuthService` → `IDistributedCache` (Redis kiểm tra OTP khớp)<br/>- Class: `VerifyOtpRequest`, `User` |
| **5** | **Reset Password (Đặt lại mật khẩu)** | `POST /api/auth/reset-password` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `AuthController` → `IAuthService/AuthService` → `IPasswordHasherService` → `UnitOfWork` → `Database`<br/>- Class: `ResetPasswordRequest`, `User` |
| **6** | **Change Password (Đổi mật khẩu)** | `POST /api/auth/change-password` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `AuthController` → `IAuthService/AuthService` → `IPasswordHasherService` → `UnitOfWork` → `Database`<br/>- Class: `ChangePasswordRequest`, `User` |
| **7** | **Verify Email (Xác minh Email)** | `GET /api/auth/verify-email` | Parent (Email Link → React → API) | - Sequence: `UI` → `AuthController` → `IAuthService/AuthService` → `UnitOfWork` → `Database`<br/>- Class: `User` |

---

## 02. Module: User & Role Management (Quản lý Người dùng & Vai trò)
Quản lý danh sách người dùng hệ thống dành cho Admin và Teacher; quản lý phân quyền và kiểm soát vai trò.

### Danh sách các luồng nghiệp vụ & Sơ đồ lớp tương ứng

| STT | Luồng nghiệp vụ / Use Case | Endpoint API | Actor / Client UI | Thành phần tham gia chính (Sequence & Class) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Get List Users (Lấy danh sách người dùng)** | `GET /api/users` | Admin (React) | - Sequence: `UI` → `UsersController` → `IUserService/UserService` → `UnitOfWork` → `Database`<br/>- Class: `PaginationQuery`, `UserResponse`, `User`, `Role` |
| **2** | **Get User By ID (Chi tiết người dùng)** | `GET /api/users/{id}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `UsersController` → `IUserService/UserService` → `UnitOfWork` → `Database`<br/>- Class: `UserResponse`, `User`, `Role` |
| **3** | **Create Account (Tạo tài khoản mới)** | `POST /api/users/create-account` | Admin, Teacher (React) | - Sequence: `UI` → `UsersController` → `IUserService/UserService` → `IMailService` (gửi mật khẩu tạm) → `UnitOfWork` → `Database`<br/>- Class: `CreateUserRequest`, `UserResponse`, `User`, `Role` |
| **4** | **Update User Profile (Sửa hồ sơ cá nhân)** | `PUT /api/users/{id}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `UsersController` → `IUserService/UserService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateUserRequest`, `UserResponse`, `User` |
| **5** | **Delete User (Khóa tài khoản)** | `DELETE /api/users/{id}` | Admin (React) | - Sequence: `UI` → `UsersController` → `IUserService/UserService` → `UnitOfWork` → `Database` (đánh dấu `IsDeleted = true` / `IsActive = false`)<br/>- Class: `User` |
| **6** | **Get Current User Children Profiles** | `GET /api/users/children-profiles` | Parent (React) | - Sequence: `UI` → `UsersController` → `IUserService/UserService` → `UnitOfWork` → `Database`<br/>- Class: `ChildProfileResponse`, `ChildProfile` |
| **7** | **Get List Roles (Lấy danh sách vai trò)** | `GET /api/Roles` | Admin (React) | - Sequence: `UI` → `RolesController` → `IRoleService/RoleService` → `UnitOfWork` → `Database`<br/>- Class: `RoleResponse`, `Role` |
| **8** | **Get Role By ID (Chi tiết vai trò)** | `GET /api/Roles/{id}` | Admin (React) | - Sequence: `UI` → `RolesController` → `IRoleService/RoleService` → `UnitOfWork` → `Database`<br/>- Class: `RoleResponse`, `Role` |
| **9** | **Create Role (Tạo vai trò mới)** | `POST /api/Roles` | Admin (React) | - Sequence: `UI` → `RolesController` → `IRoleService/RoleService` → `UnitOfWork` → `Database`<br/>- Class: `CreateRoleRequest`, `RoleResponse`, `Role` |
| **10** | **Update Role (Cập nhật vai trò)** | `PUT /api/Roles/{id}` | Admin (React) | - Sequence: `UI` → `RolesController` → `IRoleService/RoleService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateRoleRequest`, `RoleResponse`, `Role` |
| **11** | **Delete Role (Xóa vai trò)** | `DELETE /api/Roles/{id}` | Admin (React) | - Sequence: `UI` → `RolesController` → `IRoleService/RoleService` → `UnitOfWork` → `Database`<br/>- Class: `Role` |

---

## 03. Module: Classroom Management (Quản lý Lớp học)
Thiết lập lớp học, phân công Giáo viên phụ trách và áp dụng chương trình đào tạo.

### Danh sách các luồng nghiệp vụ & Sơ đồ lớp tương ứng

| STT | Luồng nghiệp vụ / Use Case | Endpoint API | Actor / Client UI | Thành phần tham gia chính (Sequence & Class) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Get List Classrooms (Lấy danh sách lớp)** | `GET /api/classrooms` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `ClassroomsController` → `IClassroomService/ClassroomService` → `UnitOfWork` → `Database`<br/>- Class: `ClassroomResponse`, `Classroom` |
| **2** | **Get Classroom By ID (Chi tiết lớp)** | `GET /api/classrooms/{id}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `ClassroomsController` → `IClassroomService/ClassroomService` → `UnitOfWork` → `Database`<br/>- Class: `ClassroomResponse`, `Classroom` |
| **3** | **Create Classroom (Tạo lớp học mới)** | `POST /api/classrooms` | Admin (React) | - Sequence: `UI` → `ClassroomsController` → `IClassroomService/ClassroomService` → `UnitOfWork` → `Database`<br/>- Class: `CreateClassroomRequest`, `ClassroomResponse`, `Classroom` |
| **4** | **Update Classroom (Cập nhật thông tin lớp)** | `PUT /api/classrooms/{id}` | Admin (React) | - Sequence: `UI` → `ClassroomsController` → `IClassroomService/ClassroomService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateClassroomRequest`, `ClassroomResponse`, `Classroom` |
| **5** | **Delete Classroom (Xóa lớp học)** | `DELETE /api/classrooms/{id}` | Admin (React) | - Sequence: `UI` → `ClassroomsController` → `IClassroomService/ClassroomService` → `UnitOfWork` → `Database`<br/>- Class: `Classroom` |
| **6** | **Get Classrooms By Teacher ID** | `GET /api/classrooms/{teacherId}/classrooms` | Teacher, Admin (React) | - Sequence: `UI` → `ClassroomsController` → `IClassroomService/ClassroomService` → `UnitOfWork` → `Database`<br/>- Class: `ClassroomResponse`, `Classroom` |

---

## 04. Module: Lesson & Program Management (Quản lý Bài học & Chương trình học)
Lập trình khung chương trình học và các bài học chi tiết theo độ tuổi.

### Danh sách các luồng nghiệp vụ & Sơ đồ lớp tương ứng

| STT | Luồng nghiệp vụ / Use Case | Endpoint API | Actor / Client UI | Thành phần tham gia chính (Sequence & Class) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Get List Programs (Lấy danh sách chương trình)** | `GET /api/programs` | Admin, Teacher (React) | - Sequence: `UI` → `ProgramsController` → `IProgramService/ProgramService` → `UnitOfWork` → `Database`<br/>- Class: `ProgramResponse`, `Program` |
| **2** | **Get Program By ID (Chi tiết chương trình)** | `GET /api/programs/{id}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `ProgramsController` → `IProgramService/ProgramService` → `UnitOfWork` → `Database`<br/>- Class: `ProgramResponse`, `Program` |
| **3** | **Create Program (Tạo chương trình học)** | `POST /api/programs` | Admin (React) | - Sequence: `UI` → `ProgramsController` → `IProgramService/ProgramService` → `UnitOfWork` → `Database`<br/>- Class: `CreateProgramRequest`, `ProgramResponse`, `Program` |
| **4** | **Update Program (Cập nhật chương trình)** | `PUT /api/programs/{id}` | Admin (React) | - Sequence: `UI` → `ProgramsController` → `IProgramService/ProgramService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateProgramRequest`, `ProgramResponse`, `Program` |
| **5** | **Delete Program (Xóa chương trình)** | `DELETE /api/programs/{id}` | Admin (React) | - Sequence: `UI` → `ProgramsController` → `IProgramService/ProgramService` → `UnitOfWork` → `Database`<br/>- Class: `Program` |
| **6** | **Get List Lessons (Lấy danh sách bài học)** | `GET /api/lessons` | Admin, Teacher (React) | - Sequence: `UI` → `LessonsController` → `ILessonService/LessonService` → `UnitOfWork` → `Database`<br/>- Class: `LessonResponse`, `Lesson` |
| **7** | **Get Lesson By ID (Chi tiết bài học)** | `GET /api/lessons/{id}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `LessonsController` → `ILessonService/LessonService` → `UnitOfWork` → `Database`<br/>- Class: `LessonResponse`, `Lesson` |
| **8** | **Create Lesson (Tạo bài học mới)** | `POST /api/lessons` | Admin, Teacher (React) | - Sequence: `UI` → `LessonsController` → `ILessonService/LessonService` → `UnitOfWork` → `Database`<br/>- Class: `CreateLessonRequest`, `LessonResponse`, `Lesson` |
| **9** | **Update Lesson (Cập nhật bài học)** | `PUT /api/lessons/{id}` | Admin, Teacher (React) | - Sequence: `UI` → `LessonsController` → `ILessonService/LessonService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateLessonRequest`, `LessonResponse`, `Lesson` |
| **10** | **Delete Lesson (Xóa bài học)** | `DELETE /api/lessons/{id}` | Admin, Teacher (React) | - Sequence: `UI` → `LessonsController` → `ILessonService/LessonService` → `UnitOfWork` → `Database`<br/>- Class: `Lesson` |

---

## 05. Module: Exercise & Question Management (Quản lý Bài tập & Câu hỏi)
Quản lý các loại hình luyện tập (phát âm, cơ miệng, thẻ hình), các bài tập và danh sách câu hỏi cụ thể kèm tài nguyên đa phương tiện (âm thanh mẫu, hình ảnh).

### Danh sách các luồng nghiệp vụ & Sơ đồ lớp tương ứng

| STT | Luồng nghiệp vụ / Use Case | Endpoint API | Actor / Client UI | Thành phần tham gia chính (Sequence & Class) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Get List Exercises (Lấy danh sách bài tập)** | `GET /api/exercises` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `ExercisesController` → `IExerciseService/ExerciseService` → `UnitOfWork` → `Database`<br/>- Class: `ExerciseResponse`, `Exercise` |
| **2** | **Get Exercise By ID (Chi tiết bài tập)** | `GET /api/exercises/{id}` | Admin, Teacher, Parent (React), Child (Godot VR) | - Sequence: `UI` → `ExercisesController` → `IExerciseService/ExerciseService` → `UnitOfWork` → `Database`<br/>- Class: `ExerciseResponse`, `Exercise` |
| **3** | **Create Exercise (Tạo bài tập)** | `POST /api/exercises` | Admin, Teacher (React) | - Sequence: `UI` → `ExercisesController` → `IExerciseService/ExerciseService` → `UnitOfWork` → `Database`<br/>- Class: `CreateExerciseRequest`, `ExerciseResponse`, `Exercise` |
| **4** | **Update Exercise (Cập nhật bài tập)** | `PUT /api/exercises/{id}` | Admin, Teacher (React) | - Sequence: `UI` → `ExercisesController` → `IExerciseService/ExerciseService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateExerciseRequest`, `ExerciseResponse`, `Exercise` |
| **5** | **Delete Exercise (Xóa bài tập)** | `DELETE /api/exercises/{id}` | Admin (React) | - Sequence: `UI` → `ExercisesController` → `IExerciseService/ExerciseService` → `UnitOfWork` → `Database`<br/>- Class: `Exercise` |
| **6** | **Get List Questions (Danh sách câu hỏi)** | `GET /api/exercise-questions` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `ExerciseQuestionsController` → `IExerciseQuestionService/ExerciseQuestionService` → `UnitOfWork` → `Database`<br/>- Class: `ExerciseQuestionResponse`, `ExerciseQuestion` |
| **7** | **Get Question By ID (Chi tiết câu hỏi)** | `GET /api/exercise-questions/{id}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `ExerciseQuestionsController` → `IExerciseQuestionService/ExerciseQuestionService` → `UnitOfWork` → `Database`<br/>- Class: `ExerciseQuestionResponse`, `ExerciseQuestion` |
| **8** | **Create Question (Tạo câu hỏi kèm tài nguyên)** | `POST /api/exercise-questions` | Admin, Teacher (React) | - Sequence: `UI` → `ExerciseQuestionsController` → `IExerciseQuestionService/ExerciseQuestionService` → `UnitOfWork` → `Database`<br/>- Class: `CreateExerciseQuestionRequest`, `ExerciseQuestionResponse`, `ExerciseQuestion` |
| **9** | **Update Question (Cập nhật câu hỏi)** | `PUT /api/exercise-questions/{id}` | Admin, Teacher (React) | - Sequence: `UI` → `ExerciseQuestionsController` → `IExerciseQuestionService/ExerciseQuestionService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateExerciseQuestionRequest`, `ExerciseQuestionResponse`, `ExerciseQuestion` |
| **10** | **Delete Question (Xóa câu hỏi)** | `DELETE /api/exercise-questions/{id}` | Admin (React) | - Sequence: `UI` → `ExerciseQuestionsController` → `IExerciseQuestionService/ExerciseQuestionService` → `UnitOfWork` → `Database`<br/>- Class: `ExerciseQuestion` |
| **11** | **Get List Exercise Types (Danh sách loại bài tập)** | `GET /api/exercise-types` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `ExerciseTypesController` → `IExerciseTypeService/ExerciseTypeService` → `UnitOfWork` → `Database`<br/>- Class: `ExerciseTypeResponse`, `ExerciseType` |
| **12** | **Get Exercise Type By ID (Chi tiết loại bài tập)** | `GET /api/exercise-types/{id}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `ExerciseTypesController` → `IExerciseTypeService/ExerciseTypeService` → `UnitOfWork` → `Database`<br/>- Class: `ExerciseTypeResponse`, `ExerciseType` |
| **13** | **Create Exercise Type (Tạo loại bài tập)** | `POST /api/exercise-types` | Admin (React) | - Sequence: `UI` → `ExerciseTypesController` → `IExerciseTypeService/ExerciseTypeService` → `UnitOfWork` → `Database`<br/>- Class: `CreateExerciseTypeRequest`, `ExerciseTypeResponse`, `ExerciseType` |
| **14** | **Update Exercise Type (Sửa loại bài tập)** | `PUT /api/exercise-types/{id}` | Admin (React) | - Sequence: `UI` → `ExerciseTypesController` → `IExerciseTypeService/ExerciseTypeService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateExerciseTypeRequest`, `ExerciseTypeResponse`, `ExerciseType` |
| **15** | **Delete Exercise Type (Xóa loại bài tập)** | `DELETE /api/exercise-types/{id}` | Admin (React) | - Sequence: `UI` → `ExerciseTypesController` → `IExerciseTypeService/ExerciseTypeService` → `UnitOfWork` → `Database`<br/>- Class: `ExerciseType` |

---

## 06. Module: Child Profile & Enrollment (Hồ sơ Trẻ em & Ghi danh)
Quản lý lý lịch cá nhân của trẻ em học tập, liên kết hồ sơ phụ huynh và quy trình ghi danh, duyệt ghi danh, chuyển lớp cho học sinh.

### Danh sách các luồng nghiệp vụ & Sơ đồ lớp tương ứng

| STT | Luồng nghiệp vụ / Use Case | Endpoint API | Actor / Client UI | Thành phần tham gia chính (Sequence & Class) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Get List Child Profiles (Danh sách trẻ)** | `GET /api/child-profiles` | Admin, Teacher (React) | - Sequence: `UI` → `ChildProfilesController` → `IChildProfileService/ChildProfileService` → `UnitOfWork` → `Database`<br/>- Class: `ChildProfileResponse`, `ChildProfile` |
| **2** | **Get Child Profile By ID (Chi tiết hồ sơ trẻ)** | `GET /api/child-profiles/{id}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `ChildProfilesController` → `IChildProfileService/ChildProfileService` → `UnitOfWork` → `Database`<br/>- Class: `ChildProfileResponse`, `ChildProfile` |
| **3** | **Get My Children Profiles (Danh sách con tôi)** | `GET /api/child-profiles/my-children` | Parent (React), Child (Godot VR) | - Sequence: `UI` → `ChildProfilesController` → `IChildProfileService/ChildProfileService` → `UnitOfWork` → `Database`<br/>- Class: `ChildProfileResponse`, `ChildProfile` |
| **4** | **Create Child Profile (Tạo hồ sơ trẻ)** | `POST /api/child-profiles` | Parent, Teacher, Admin (React) | - Sequence: `UI` → `ChildProfilesController` → `IChildProfileService/ChildProfileService` → `UnitOfWork` → `Database`<br/>- Class: `CreateChildProfileRequest`, `ChildProfileResponse`, `ChildProfile` |
| **5** | **Update Child Profile (Cập nhật hồ sơ trẻ)** | `PUT /api/child-profiles/{id}` | Parent, Teacher, Admin (React) | - Sequence: `UI` → `ChildProfilesController` → `IChildProfileService/ChildProfileService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateChildProfileRequest`, `ChildProfileResponse`, `ChildProfile` |
| **6** | **Delete Child Profile (Xóa hồ sơ)** | `DELETE /api/child-profiles/{id}` | Admin (React) | - Sequence: `UI` → `ChildProfilesController` → `IChildProfileService/ChildProfileService` → `UnitOfWork` → `Database` (đánh dấu `IsDeleted = true`)<br/>- Class: `ChildProfile` |
| **7** | **Get List Enrollments (Danh sách ghi danh)** | `GET /api/enrollments` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `EnrollmentsController` → `IEnrollmentService/EnrollmentService` → `UnitOfWork` → `Database`<br/>- Class: `EnrollmentResponse`, `Enrollment` |
| **8** | **Get Enrollment By ID (Chi tiết ghi danh)** | `GET /api/enrollments/{id}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `EnrollmentsController` → `IEnrollmentService/EnrollmentService` → `UnitOfWork` → `Database`<br/>- Class: `EnrollmentResponse`, `Enrollment` |
| **9** | **Get Enrollments By Child ID** | `GET /api/enrollments/child/{childId}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `EnrollmentsController` → `IEnrollmentService/EnrollmentService` → `UnitOfWork` → `Database`<br/>- Class: `EnrollmentResponse`, `Enrollment` |
| **10**| **Create Enrollment (Đăng ký xếp lớp)** | `POST /api/enrollments` | Admin, Teacher (React) | - Sequence: `UI` → `EnrollmentsController` → `IEnrollmentService/EnrollmentService` → `UnitOfWork` → `Database`<br/>- Class: `CreateEnrollmentRequest`, `EnrollmentResponse`, `Enrollment` |
| **11**| **Update Enrollment (Sửa đổi ghi danh)** | `PUT /api/enrollments/{id}` | Admin, Teacher (React) | - Sequence: `UI` → `EnrollmentsController` → `IEnrollmentService/EnrollmentService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateEnrollmentRequest`, `EnrollmentResponse`, `Enrollment` |
| **12**| **Delete Enrollment (Hủy ghi danh)** | `DELETE /api/enrollments/{id}` | Admin (React) | - Sequence: `UI` → `EnrollmentsController` → `IEnrollmentService/EnrollmentService` → `UnitOfWork` → `Database`<br/>- Class: `Enrollment` |
| **13**| **Transfer Class (Chuyển lớp học)** | `PUT /api/enrollments/{id}/transfer` | Admin, Teacher (React) | - Sequence: `UI` → `EnrollmentsController` → `IEnrollmentService/EnrollmentService` → `UnitOfWork` → `Database`<br/>- Class: `TransferEnrollmentRequest`, `EnrollmentResponse`, `Enrollment` |
| **14**| **Approve Enrollment (Duyệt xếp lớp)** | `PUT /api/enrollments/{id}/approve` | Admin, Teacher (React) | - Sequence: `UI` → `EnrollmentsController` → `IEnrollmentService/EnrollmentService` → `UnitOfWork` → `Database`<br/>- Class: `EnrollmentResponse`, `Enrollment` |

---

## 07. Module: Results, Speech Performance & AI Analysis (Kết quả, Đánh giá giọng nói & Phân tích AI)
*Cốt lõi tích hợp của GodotXR: Ghi nhận kết quả làm bài tập từ kính VR, lưu trữ file ghi âm và phân tích chi tiết phát âm ở cấp độ âm vị (Phoneme) qua Azure Speech Cognitive Service, cùng việc tự động tính toán các chỉ số lâm sàng PCC & MLU.*

### Danh sách các luồng nghiệp vụ & Sơ đồ lớp tương ứng

| STT | Luồng nghiệp vụ / Use Case | Endpoint API | Actor / Client UI | Thành phần tham gia chính (Sequence & Class) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Submit VR Exercise Result (Nộp kết quả bài tập VR)** | `POST /api/results/submit` | Child (Godot VR) | - Sequence: `Godot UI` → `result-api.gd` → `ResultsController` → `IResultService/ResultService` → `UnitOfWork` → `Database`<br/>- Class: `CreateResultRequest`, `ResultResponse`, `Result` |
| **2** | **Upload Session Audio & Replay (Nộp file âm thanh & telemetry)** | `POST /api/files` | Child (Godot VR) | - Sequence: `Godot (MicController/SessionUploader)` → `FilesController` → `IStorageService/MinIOService` (Tải file metadata.json & voice.wav lên MinIO)<br/>- Class: `UploadFilesRequest`, `UploadFilesResponse` |
| **3** | **Upload Audio Chunk (Tải luồng âm thanh luyện nói)** | `POST /api/files/chunks` | Child (Godot VR) | - Sequence: `Godot (MicController)` → `FilesController` → `IStorageService/MinIOService` (Tải chunk wav lên MinIO)<br/>- Class: `UploadAudioChunkRequest`, `UploadAudioChunkResponse` |
| **4** | **Assess Speech Chunk (Đánh giá phát âm)** | `POST /api/files/chunks/assess` | Child (Godot VR) | - Sequence: `Godot` → `FilesController` → `IStorageService/MinIOService` (Lấy file) → **Azure Speech Cognitive Service** (HTTP POST REST API gửi âm thanh phân tích) → trả về điểm Accuracy/Fluency/Completeness<br/>- Class: `AssessChunkRequest`, `Azure Speech API Response` |
| **5** | **Get Pronunciation Details (Xem chi tiết lỗi phát âm)** | `GET /api/pronunciation-details/by-result/{resultId}` | Teacher, Parent (React) | - Sequence: `UI` → `PronunciationDetailsController` → `UnitOfWork` → `Database` (Không qua Service để tối ưu)<br/>- Class: `PronunciationDetailResponse`, `PronunciationDetail`, `Result` |
| **6** | **Update Teacher Feedback (Giáo viên nhận xét)** | `PUT /api/results/{id}/feedback` | Teacher (React) | - Sequence: `UI` → `ResultsController` → `IResultService/ResultService` → `UnitOfWork` → `Database`<br/>- Class: `UpdateResultFeedbackRequest`, `ResultResponse`, `Result` |
| **7** | **Create AI Analysis (Tạo phân tích tiến trình PCC/MLU)** | `POST /api/analyze` | Admin, Teacher (React) | - Sequence: `UI` → `AnalyzeController` → `IAnalyzeService/AnalyzeService` (Tính toán tự động $PCC = \frac{\text{Phụ âm đúng}}{\text{Phụ âm cơ hội}} \times 100\%$ và $MLU = \frac{\text{Tổng từ}}{\text{Tổng phát ngôn}}$) → `UnitOfWork` → `Database`<br/>- Class: `CreateAnalyzeRequest`, `AnalyzeResponse`, `Analyze` |
| **8** | **Get Child AI Analysis (Xem phân tích AI của trẻ)** | `GET /api/analyze/child/{childId}` | Parent, Teacher, Admin (React) | - Sequence: `UI` → `AnalyzeController` → `IAnalyzeService/AnalyzeService` → `UnitOfWork` → `Database`<br/>- Class: `AnalyzeResponse`, `Analyze`, `ChildProfile` |

---

## 08. Module: Reports, System Settings & Event Logs (Báo cáo, Cấu hình & Lịch sử sự kiện)
Quản lý báo cáo tổng hợp, thiết lập năm học/học kỳ và truy xuất nhật ký hoạt động (Event Logs) để phục vụ giám sát lâm sàng.

### Danh sách các luồng nghiệp vụ & Sơ đồ lớp tương ứng

| STT | Luồng nghiệp vụ / Use Case | Endpoint API | Actor / Client UI | Thành phần tham gia chính (Sequence & Class) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Create Report (Tạo báo cáo học tập)** | `POST /api/report` | Teacher, Admin (React) | - Sequence: `UI` → `ReportController` → `IReportService/ReportService` → `UnitOfWork` → `Database`<br/>- Class: `CreateReportRequest`, `ReportResponse`, `Report` |
| **2** | **Get List Reports (Danh sách báo cáo)** | `GET /api/report` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `ReportController` → `IReportService/ReportService` → `UnitOfWork` → `Database`<br/>- Class: `ReportResponse`, `Report` |
| **3** | **Manage School Years (Năm học hiện tại & Lịch sử)** | `POST /api/schoolyears` & `PUT /api/schoolyears/{id}` | Admin (React) | - Sequence: `UI` → `SchoolYearsController` → `ISchoolYearService/SchoolYearService` → `UnitOfWork` → `Database`<br/>- Class: `CreateSchoolYearRequest`, `SchoolYearResponse`, `SchoolYear` |
| **4** | **Manage Semesters (Phân chia học kỳ trong năm)** | `POST /api/semesters` & `PUT /api/semesters/{id}` | Admin (React) | - Sequence: `UI` → `SemestersController` → `ISemesterService/SemesterService` → `UnitOfWork` → `Database`<br/>- Class: `CreateSemesterRequest`, `SemesterResponse`, `Semester`, `SchoolYear` |
| **5** | **Get Event Logs By Result (Nhật ký hành động bài tập)** | `GET /api/event-logs/by-result/{resultId}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `EventLogsController` → `UnitOfWork` → `Database` (Không qua Service)<br/>- Class: `EventLogResponse`, `EventLog` |
| **6** | **Get Event Logs By Child (Toàn bộ tiến trình sự kiện của trẻ)** | `GET /api/event-logs/by-child/{childId}` | Admin, Teacher, Parent (React) | - Sequence: `UI` → `EventLogsController` → `UnitOfWork` → `Database` (Không qua Service)<br/>- Class: `EventLogResponse`, `EventLog` |

---

## 💡 Đề xuất các cặp Diagram trọng tâm cần triển khai trước (High Priority)

Bám sát quy tắc nghiệp vụ đặc thù của GodotXR, dưới đây là **5 luồng phức tạp nhất** cần được ưu tiên thiết lập sơ đồ:

1. **01-1. Đăng nhập hệ thống (Login):**
   - *Mô tả:* Minh họa luồng cấp phát AccessToken/RefreshToken từ Web Dashboard (React) và đồng bộ sang thiết bị VR Client (Godot).
   - *Sequence:* `Parent/Child` → `LoginUI` → `AuthController` → `AuthService` → `TokenService` → `Database`.
   - *Class:* `AuthController` + `IAuthService/AuthService` + `ITokenService/TokenService` + `User`.
2. **06-10. Đăng ký & Duyệt ghi danh lớp học (Create & Approve Enrollment):**
   - *Mô tả:* Quy trình đăng ký học, kiểm tra điều kiện độ tuổi (`BR-65`) và sự phối hợp phê duyệt giữa Giáo viên/Quản trị viên để trẻ nhận bài học.
   - *Sequence:* `Teacher` → `EnrollmentsUI` → `EnrollmentsController` → `EnrollmentService` → `UnitOfWork` → `Database`.
   - *Class:* `EnrollmentsController` + `IEnrollmentService/EnrollmentService` + `Enrollment` + `Classroom`.
3. **07-1. Nộp kết quả làm bài từ kính VR (Submit VR Result):**
   - *Mô tả:* Sơ đồ kết nối từ ứng dụng VR Godot Client (thông qua `result-api.gd`) gửi kết quả nộp bài về REST API backend .NET Core để lưu trữ.
   - *Sequence:* `Child` → `GodotVRUI` → `result-api.gd` → `ResultsController` → `ResultService` → `UnitOfWork` → `Database`.
   - *Class:* `ResultsController` + `IResultService/ResultService` + `Result` + `ChildProfile`.
4. **07-4. Đánh giá giọng đọc trực tiếp (Assess Speech Chunk):**
   - *Mô tả:* Tương tác thời gian thực: Godot ghi âm giọng nói -> Upload chunk lên backend -> Backend chuyển tiếp file qua Azure Cognitive Speech Service để lấy đánh giá âm ngữ chi tiết.
   - *Sequence:* `Child` → `GodotVRUI` → `FilesController` → `MinIOService` → `Azure Speech Cognitive Service` → `GodotVRUI`.
   - *Class:* `FilesController` + `IStorageService/MinIOService` + `AssessChunkRequest`.
5. **07-7. Tính toán & Tạo báo cáo AI lâm sàng (Create AI Analysis):**
   - *Mô tả:* Tác vụ tính toán tự động các chỉ số Percentage of Consonants Correct (PCC) và Mean Length of Utterance (MLU) dựa trên lịch sử dữ liệu phát âm của trẻ để đưa ra khuyến nghị.
   - *Sequence:* `Teacher` → `AnalyzeUI` → `AnalyzeController` → `AnalyzeService` → `UnitOfWork` → `Database`.
   - *Class:* `AnalyzeController` + `IAnalyzeService/AnalyzeService` + `Analyze` + `Result` + `PronunciationDetail`.
