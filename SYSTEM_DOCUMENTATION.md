# ĐẶC TẢ CHỨC NĂNG HỆ THỐNG - HỆ THỐNG GODOTXR (BUSINESS RULES COMPLIANT)

Tài liệu này cung cấp mô tả chi tiết cho từng chức năng chính của hệ thống GodotXR (bao gồm Web Dashboard và VR Application), bám sát 18 nhóm Quy tắc Nghiệp vụ (Business Rules - BR) và cấu trúc mã nguồn thực tế ở Frontend và Backend.

---

## 3.2 Web Application & VR Application Details

### 3.2.1 Xác thực & Quản lý Tài khoản (Authentication & Account Management)
Phần này mô tả các chức năng liên quan đến việc xác thực người dùng, cấp quyền truy cập, thiết lập bảo mật mật khẩu và cơ chế OTP trên toàn hệ thống GodotXR.

---

#### 3.2.1.1 Đăng nhập (Login)
*   **Function trigger:** Người dùng mở Web Dashboard và bấm nút **"Đăng nhập"** trên form đăng nhập sau khi điền thông tin.
*   **Function description:**
    *   **Actors/Roles:** Admin, Teacher, Parent. (Lưu ý: Vai trò *Child* chỉ truy cập thông qua ứng dụng VR, không được vào Web Dashboard).
    *   **Purpose:** Cho phép người dùng đã đăng ký xác thực danh tính để truy cập vào bảng điều khiển tương ứng với vai trò và phạm vi được giao.
    *   **Interface:** 
        1. Trường nhập liệu: **Email** (dạng text), **Mật khẩu** (dạng password, có nút ẩn/hiện).
        2. Nút bấm: **"Đăng nhập"** (Login).
        3. Liên kết: **"Quên mật khẩu?"** (Forgot password).
    *   **Data processing:**
        1. Người dùng nhập Email và Mật khẩu.
        2. Nhấn nút "Đăng nhập", client gửi yêu cầu POST đến `/api/Auth/login`.
        3. Backend băm mật khẩu, truy vấn DB tìm user. Nếu tìm thấy và khớp mật khẩu, tạo Token JWT (AccessToken và RefreshToken) và trả về Client.
        4. Client lưu trữ token và chuyển hướng user đến Dashboard tương ứng với vai trò của họ.
*   **Screen layout:** 
    Giao diện trang Đăng nhập gồm logo GodotXR ở trên cùng, phía dưới là hộp thoại đăng nhập bo góc với nền trắng, các trường Email, Mật khẩu có biểu tượng minh họa (Mail, Lock). Nút bấm đăng nhập màu đỏ san hô ấm áp (#FF8E8E) có viền dưới đậm tạo hiệu ứng 3D hoạt họa. Phía dưới cùng có liên kết quay lại trang chủ hoặc chuyển qua khôi phục tài khoản.
*   **Function Details:**
    *   **Validation:** 
        1. Email không được để trống và phải đúng định dạng (có ký tự `@` và domain).
        2. Mật khẩu không được để trống và phải đạt độ dài tối thiểu từ 6 ký tự.
    *   **Business Rules:** `BR-01`, `BR-02`, `BR-03`, `BR-04`, `BR-07`, `BR-08`, `BR-09`, `BR-140`, `BR-141`, `BR-147`.
    *   **Normal Case:** Người dùng nhập email và mật khẩu chính xác và hoạt động. Hệ thống trả về trạng thái đăng nhập thành công và chuyển hướng đến trang Dashboard tương ứng (Admin, Giáo viên hoặc Phụ huynh).
    *   **Abnormal Case:**
        1. *Email/mật khẩu sai:* Hệ thống hiển thị cảnh báo lỗi "Email hoặc mật khẩu không chính xác."
        2. *Tài khoản bị khóa hoặc tạm dừng (Inactive/Locked):* Từ chối đăng nhập và hiển thị "Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt. Vui lòng liên hệ quản trị viên." (`BR-07`)
        3. *Dịch vụ Backend không khả dụng:* Hiển thị thông báo "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."

---

#### 3.2.1.2 Đăng ký Tài khoản Phụ huynh (Parent Registration)
*   **Function trigger:** Người dùng truy cập đường dẫn đăng ký dành cho phụ huynh hoặc từ lời mời của Giáo viên.
*   **Function description:**
    *   **Actors/Roles:** Phụ huynh (Parent).
    *   **Purpose:** Đăng ký tài khoản phụ huynh mới và tùy chọn liên kết hồ sơ trẻ em ban đầu để giáo viên phê duyệt.
    *   **Interface:**
        *   **Bước 1: Thông tin phụ huynh** gồm Họ và tên phụ huynh, Email, Số điện thoại, Mật khẩu, Xác nhận mật khẩu.
        *   **Bước 2: Thông tin trẻ em (Tùy chọn)** gồm Họ tên trẻ, Tuổi, Giới tính, Ghi chú đặc điểm.
        *   Nút bấm: **"Tiếp theo"** (Next), **"Đăng ký tài khoản"** (Submit).
    *   **Data processing:** 
        1. Người dùng điền thông tin phụ huynh và thông tin trẻ em.
        2. Bấm đăng ký, hệ thống gửi POST đến API tạo tài khoản.
        3. Backend kiểm tra trùng lặp email, gửi email xác minh tài khoản chứa token.
*   **Screen layout:** Giao diện gồm 2 bước thiết kế dạng thẻ trượt (slide transition), hiển thị thanh tiến trình ở phía trên để người dùng dễ theo dõi các bước đăng ký.
*   **Function Details:**
    *   **Validation:** 
        1. Email phải là duy nhất trong hệ thống (`BR-06`).
        2. Số điện thoại tối thiểu 8 chữ số.
        3. Mật khẩu phải khớp với xác nhận mật khẩu.
    *   **Business Rules:** `BR-05`, `BR-06`, `BR-25`, `BR-35`, `BR-142`.
    *   **Normal Case:** Đăng ký thành công, hệ thống gửi email xác minh và hiển thị thông báo yêu cầu kiểm tra hòm thư.
    *   **Abnormal Case:**
        1. *Trùng email:* Thông báo "Email này đã được sử dụng cho một tài khoản khác."
        2. *Gửi email xác minh thất bại:* Hệ thống sẽ hoàn tác quá trình tạo tài khoản và báo lỗi để tránh lưu dữ liệu rác (`BR-138`, `BR-150`).

---

#### 3.2.1.3 Xác thực Email (Verify Email)
*   **Function trigger:** Người dùng nhấn vào liên kết xác nhận gửi về hộp thư điện tử cá nhân.
*   **Function description:**
    *   **Actors/Roles:** Người dùng mới đăng ký.
    *   **Purpose:** Kích hoạt tài khoản người dùng sau khi đăng ký bằng cách xác minh địa chỉ email là có thật.
    *   **Interface:** Trang thông báo kết quả xác minh có nút bấm chuyển hướng về trang Đăng nhập.
    *   **Data processing:** 
        1. Client nhận token từ query parameter của URL (`/verify-email?token=...`).
        2. Gửi request GET đến `/api/Auth/verify-email?token=...`.
        3. Backend kiểm tra tính hợp lệ của token, cập nhật trạng thái user thành `Active` và lưu lại thông tin.
*   **Screen layout:** Thiết kế tối giản với hoạt ảnh trạng thái: biểu tượng dấu tích xanh lục tròn xoay nhẹ nếu thành công, hoặc dấu gạch chéo đỏ nếu token hết hạn.
*   **Function Details:**
    *   **Validation:** Token trong link xác minh không được rỗng và chưa hết hạn.
    *   **Business Rules:** `BR-05`, `BR-06`, `BR-07`, `BR-142`.
    *   **Normal Case:** Xác thực thành công, tài khoản được kích hoạt, chuyển hướng về trang Đăng nhập.
    *   **Abnormal Case:** Token không hợp lệ hoặc đã hết hạn, hệ thống hiển thị thông báo lỗi "Mã xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại link kích hoạt."

---

#### 3.2.1.4 Quên mật khẩu & Đặt lại bằng OTP (Forgot Password & Reset OTP)
*   **Function trigger:** Bấm chọn liên kết **"Quên mật khẩu?"** tại màn hình đăng nhập.
*   **Function description:**
    *   **Actors/Roles:** Tất cả người dùng (Admin, Giáo viên, Phụ huynh).
    *   **Purpose:** Cho phép người dùng tự khôi phục mật khẩu thông qua mã OTP gửi về Email.
    *   **Interface:**
        *   **Bước 1 (Nhập Email):** Hộp nhập Email, nút "Gửi mã OTP".
        *   **Bước 2 (Nhập OTP):** 6 ô nhập mã số OTP (tự động chuyển ô), nút "Xác nhận OTP".
        *   **Bước 3 (Nhập Mật khẩu mới):** Mật khẩu mới, Xác nhận mật khẩu mới, nút "Đặt lại mật khẩu".
    *   **Data processing:**
        1. Người dùng nhập email và bấm gửi mã. Backend gửi yêu cầu tạo OTP ngẫu nhiên 6 chữ số, lưu tạm vào Redis Cache với thời gian hết hạn (`BR-18`).
        2. Gửi email chứa OTP cho người dùng qua dịch vụ email.
        3. Khi người dùng nhập OTP và mật khẩu mới, backend kiểm tra tính hợp lệ của OTP trong cache. Nếu khớp, cập nhật mật khẩu mới băm bằng Bcrypt/Argon2 và xóa OTP khỏi cache (`BR-21`).
*   **Screen layout:** Thiết kế 3 thẻ trượt tương ứng với 3 bước khôi phục mật khẩu. Ở bước nhập OTP, hiển thị bộ đếm ngược thời gian hiệu lực (ví dụ: 03:00 phút) và liên kết "Gửi lại mã".
*   **Function Details:**
    *   **Validation:** 
        1. Email nhập vào phải đúng định dạng.
        2. Mã OTP phải đủ 6 chữ số.
        3. Mật khẩu mới phải đáp ứng chính sách bảo mật tối thiểu 6 ký tự.
    *   **Business Rules:** `BR-15`, `BR-16`, `BR-17`, `BR-18`, `BR-19`, `BR-20`, `BR-21`, `BR-22`, `BR-147`, `BR-149`, `BR-150`.
    *   **Normal Case:** Người dùng nhận mã OTP qua email, nhập chính xác mã OTP còn hạn, tiến hành đổi mật khẩu mới thành công.
    *   **Abnormal Case:**
        1. *Email không tồn tại:* Trả về giao diện chung thông báo gửi thành công (không xác nhận email có tồn tại hay không nhằm bảo mật thông tin người dùng - `BR-16`).
        2. *Nhập sai OTP, OTP hết hạn hoặc đã sử dụng:* Báo lỗi "Mã OTP không chính xác, đã hết hạn hoặc đã được sử dụng." (`BR-20`)
        3. *Redis bị lỗi:* OTP không được lưu trữ thành công, hệ thống từ chối xác thực và báo lỗi (`BR-149`).

---

#### 3.2.1.5 Đổi mật khẩu lần đầu (First Login Change Password)
*   **Function trigger:** Người dùng đăng nhập thành công lần đầu tiên bằng mật khẩu tạm do hệ thống cấp.
*   **Function description:**
    *   **Actors/Roles:** Giáo viên, Phụ huynh (tài khoản do Admin hoặc Giáo viên tạo chủ động).
    *   **Purpose:** Bắt buộc người dùng thay đổi mật khẩu tạm thời để đảm bảo an toàn thông tin tài khoản cá nhân.
    *   **Interface:** Form đổi mật khẩu tự động bật lên che toàn bộ màn hình, khóa các chức năng khác. Gồm: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới, Nút "Cập nhật mật khẩu".
    *   **Data processing:** 
        1. Khi đăng nhập, backend kiểm tra cờ `MustChangePassword` trong DB. Nếu là `true`, trả về mã xác thực kèm cờ này.
        2. Giao diện Frontend khóa toàn bộ thanh điều hướng, buộc hiển thị màn hình đổi mật khẩu (`BR-13`).
        3. Gửi yêu cầu cập nhật mật khẩu mới đến `/api/Auth/change-password`. Sau khi đổi thành công, cập nhật cờ `MustChangePassword = false` trong DB.
*   **Screen layout:** Giao diện dạng modal overlay màu xám mờ phủ lên màn hình làm việc chính, ở giữa là hộp thoại đổi mật khẩu yêu cầu thao tác khẩn cấp.
*   **Function Details:**
    *   **Validation:** Mật khẩu mới không được trùng mật khẩu cũ, đạt chuẩn bảo mật và trùng khớp với xác nhận mật khẩu mới.
    *   **Business Rules:** `BR-11`, `BR-12`, `BR-13`, `BR-14`, `BR-22`.
    *   **Normal Case:** Người dùng đổi mật khẩu thành công, cờ `MustChangePassword` chuyển thành `false`, hệ thống tự mở khóa giao diện làm việc chính.
    *   **Abnormal Case:** Người dùng cố tình tắt modal đổi mật khẩu bằng các công cụ devtools hoặc truy cập trang khác, hệ thống sẽ tự động đăng xuất (logout) session hiện tại để bảo đảm quy tắc nghiệp vụ (`BR-13`).

---

#### 3.2.1.6 Thiết lập tài khoản cá nhân (Account Settings / Profile)
*   **Function trigger:** Người dùng bấm vào ảnh đại diện (avatar) ở góc phải màn hình chọn **"Cấu hình tài khoản"**.
*   **Function description:**
    *   **Actors/Roles:** Tất cả người dùng đăng nhập.
    *   **Purpose:** Cập nhật thông tin liên hệ cá nhân, thay đổi mật khẩu và đổi avatar đại diện.
    *   **Interface:** Form chứa Họ và tên, Số điện thoại, Email (chỉ đọc), Lựa chọn thay đổi mật khẩu (Mật khẩu cũ, Mật khẩu mới), Nút "Lưu cập nhật".
    *   **Data processing:** Gửi yêu cầu PUT chỉnh sửa profile đến `/api/Users/{id}`. Backend lưu lại thông tin cập nhật cùng ID người thực hiện vào nhật ký hệ thống (Audit Log).
*   **Screen layout:** Bố cục chia hai phần: Bên trái chứa ảnh đại diện lớn kèm nút tải ảnh mới lên. Bên phải chứa các trường nhập liệu thông tin cá nhân.
*   **Function Details:**
    *   **Validation:** Số điện thoại phải đúng định dạng số, tên không được trống.
    *   **Business Rules:** `BR-29`, `BR-33`, `BR-144`.
    *   **Normal Case:** Lưu thông tin thành công, giao diện cập nhật ngay thông tin hiển thị mới của người dùng.
    *   **Abnormal Case:** Người dùng sửa ID trên đường dẫn URL để chỉnh sửa tài khoản người khác, backend trả về lỗi `403 Forbidden` do vi phạm phạm vi phân quyền cá nhân (`BR-33`).

---

### 3.2.2 Quản lý Người dùng & Vai trò (User & Role Management)
Phần này mô tả các chức năng quản trị hệ thống dành cho vai trò Quản trị viên (Admin), bao gồm cấp tài khoản mới, phân vai trò, và tạm khóa/mở khóa tài khoản.

---

#### 3.2.2.1 Quản lý Người dùng (User Management)
*   **Function trigger:** Admin chọn mục **"Quản lý người dùng"** trên thanh menu điều hướng bên trái.
*   **Function description:**
    *   **Actors/Roles:** Admin.
    *   **Purpose:** Xem danh sách, tạo tài khoản Giáo viên, cập nhật trạng thái và đổi mật khẩu cho người dùng trong hệ thống.
    *   **Interface:** 
        1. Bảng danh sách người dùng gồm các cột: Tên, Email, Số điện thoại, Vai trò, Trạng thái hoạt động, Ngày tạo, Hành động (Xem chi tiết, Sửa, Khóa/Mở khóa).
        2. Ô tìm kiếm theo Tên/Email và Bộ lọc theo Vai trò, Trạng thái.
        3. Nút **"Thêm Giáo viên"** (hoặc gửi link mời).
    *   **Data processing:**
        *   Tải danh sách: GET đến `/api/Users` kèm tham số phân trang (`page`, `pageSize`), tìm kiếm (`query`), bộ lọc (`role`, `status`).
        *   Tạo người dùng: POST đến `/api/Users` tạo tài khoản giáo viên mới với mật khẩu tạm thời.
        *   Khóa/Mở khóa: POST đến `/api/Users/{id}/toggle-lock` để cập nhật cờ `IsActive`.
*   **Screen layout:** Thiết kế bảng dữ liệu (Data Table) hiện đại có hỗ trợ phân trang ở dưới cùng. Các vai trò được phân biệt bằng nhãn màu sắc (Admin: vàng, Giáo viên: lục nhạt, Phụ huynh: lam nhạt). Trạng thái hoạt động có tích xanh hoặc chấm đỏ.
*   **Function Details:**
    *   **Validation:** 
        1. Khi tạo tài khoản, email không được trùng lặp.
        2. Tên tài khoản không được để trống.
    *   **Business Rules:** `BR-24`, `BR-26`, `BR-29`, `BR-30`, `BR-31`, `BR-32`, `BR-144`, `BR-153`, `BR-154`, `BR-126` -> `BR-131`.
    *   **Normal Case:** Admin tạo thành công tài khoản Giáo viên mới, hệ thống tự động sinh mật khẩu ngẫu nhiên và đặt cờ `MustChangePassword = true`.
    *   **Abnormal Case:** 
        1. *Admin tự khóa chính mình:* Hệ thống ngăn chặn nút Khóa trên chính dòng tài khoản đang đăng nhập, báo lỗi "Bạn không được phép khóa tài khoản Admin đang sử dụng." (`BR-30`)
        2. *Xóa tài khoản có ràng buộc lịch sử:* Hệ thống từ chối xóa vĩnh viễn tài khoản đã từng có kết quả học tập hoặc lớp học liên quan, chỉ cho phép chuyển trạng thái sang `Đã khóa` (`BR-31`, `BR-32`).

---

#### 3.2.2.2 Quản lý Vai trò (Role Management)
*   **Function trigger:** Admin chọn mục **"Quản lý vai trò"** trên thanh menu điều hướng.
*   **Function description:**
    *   **Actors/Roles:** Admin.
    *   **Purpose:** Xem các vai trò trong hệ thống (Admin, Teacher, Parent, Child) và phân bổ quyền hạn hoặc theo dõi số lượng tài khoản thuộc mỗi vai trò.
    *   **Interface:** Danh sách 4 vai trò cố định của hệ thống kèm bảng phân quyền cụ thể của từng vai trò và số lượng người dùng đang liên kết.
    *   **Data processing:** Gửi GET đến `/api/Roles` để lấy danh sách vai trò và phân quyền tương ứng.
*   **Screen layout:** Thiết kế dạng danh sách các khối thẻ (card list), mỗi thẻ đại diện cho một vai trò cùng với mô tả ngắn và biểu tượng đặc trưng (ví dụ: Shield cho Admin, GraduationCap cho Giáo viên).
*   **Function Details:**
    *   **Validation:** Các vai trò cốt lõi (Admin, Teacher, Parent, Child) là cố định và không thể xóa hay đổi tên.
    *   **Business Rules:** `BR-03`, `BR-23`, `BR-28`, `BR-154`.
    *   **Normal Case:** Hệ thống hiển thị đúng 4 nhóm vai trò và chỉ cho phép người dùng thuộc một nhóm vai trò hoạt động tại một thời điểm (`BR-23`).

---

### 3.2.3 Quản lý Năm học, Học kỳ, Lớp học & Ghi danh (School Year, Semester & Classroom)
Module này xử lý việc thiết lập thời gian học tập, quản lý các lớp học của giáo viên và ghi danh học sinh vào lớp học để giao nội dung.

---

#### 3.2.3.1 Quản lý Năm học (School Year Management)
*   **Function trigger:** Admin truy cập vào menu **"Quản lý năm học"**.
*   **Function description:**
    *   **Actors/Roles:** Admin.
    *   **Purpose:** Thiết lập khoảng thời gian hoạt động của các năm học trong hệ thống làm cơ sở để phân chia học kỳ và kết quả báo cáo.
    *   **Interface:** Form nhập Tên năm học (ví dụ: 2025-2026), Ngày bắt đầu, Ngày kết thúc, cờ chọn "Năm học hiện tại", nút "Lưu".
    *   **Data processing:** POST/PUT gửi thông tin năm học đến `/api/SchoolYears`.
*   **Screen layout:** Bảng danh sách các năm học, năm học hiện tại được bôi viền xanh lục đậm kèm nhãn "Hiện tại" nổi bật.
*   **Function Details:**
    *   **Validation:** Ngày bắt đầu năm học phải trước ngày kết thúc (`BR-43`).
    *   **Business Rules:** `BR-43`, `BR-44`.
    *   **Normal Case:** Lưu năm học thành công. Khi chọn năm học mới làm năm học hiện tại, hệ thống tự động tắt cờ hiện tại của năm học cũ (`BR-44`).
    *   **Abnormal Case:** Người dùng nhập ngày kết thúc trước ngày bắt đầu, hệ thống báo lỗi: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu."

---

#### 3.2.3.2 Quản lý Học kỳ (Semester Management)
*   **Function trigger:** Admin truy cập menu **"Quản lý học kỳ"**.
*   **Function description:**
    *   **Actors/Roles:** Admin.
    *   **Purpose:** Tạo và chia nhỏ các học kỳ thuộc về một năm học xác định.
    *   **Interface:** Dropdown chọn Năm học, nhập Tên học kỳ (Học kỳ 1, Học kỳ 2), Ngày bắt đầu, Ngày kết thúc, nút "Tạo".
    *   **Data processing:** Gửi POST thông tin học kỳ đến `/api/Semesters`. Backend xác thực khoảng thời gian học kỳ xem có nằm trong khoảng thời gian năm học hay không.
*   **Screen layout:** Danh sách học kỳ hiển thị nhóm theo từng năm học dạng cây thư mục (tree view).
*   **Function Details:**
    *   **Validation:** Thời gian học kỳ phải nằm trọn trong thời gian của năm học tương ứng (`BR-46`). Các học kỳ trong cùng năm học không được chồng lấn thời gian trừ khi có cấu hình đặc biệt (`BR-47`).
    *   **Business Rules:** `BR-43`, `BR-45`, `BR-46`, `BR-47`.
    *   **Normal Case:** Tạo học kỳ thành công và liên kết trực tiếp với năm học được chọn.
    *   **Abnormal Case:** Nhập ngày học kỳ nằm ngoài khoảng ngày của năm học đã liên kết, hệ thống báo lỗi: "Thời gian học kỳ phải nằm trong giới hạn của năm học liên kết." (`BR-46`)

---

#### 3.2.3.3 Quản lý Lớp học (Classroom Management)
*   **Function trigger:** Admin (hoặc Giáo viên quản lý lớp) bấm chọn menu **"Quản lý lớp học"**.
*   **Function description:**
    *   **Actors/Roles:** Admin (quản lý toàn bộ), Giáo viên (chỉ được quản lý và xem các lớp học được phân công - `BR-49`).
    *   **Purpose:** Tạo lớp học mới, phân công giáo viên giảng dạy và gán chương trình học phù hợp.
    *   **Interface:** 
        1. Tên lớp học, mô tả.
        2. Dropdown chọn Giáo viên phụ trách (chỉ hiện tài khoản active).
        3. Dropdown chọn Chương trình học (Program) active.
        4. Dropdown chọn Học kỳ (Semester).
        5. Ngày bắt đầu, Ngày kết thúc.
    *   **Data processing:** Gửi POST/PUT đến `/api/Classrooms` để tạo hoặc cập nhật thông tin lớp học.
*   **Screen layout:** Danh sách lớp học hiển thị dưới dạng các thẻ lớp học trực quan (Card Layout), hiển thị sĩ số học sinh hiện tại, tên giáo viên phụ trách, và tên chương trình học đang áp dụng.
*   **Function Details:**
    *   **Validation:** 
        1. Tên lớp học không được trống.
        2. Phải chọn chính xác 1 giáo viên hoạt động và 1 chương trình học hoạt động (`BR-48`).
    *   **Business Rules:** `BR-48`, `BR-49`, `BR-142`, `BR-143`.
    *   **Normal Case:** Tạo thành công lớp học và phân quyền cho giáo viên phụ trách lớp đó có quyền xem dữ liệu học sinh của lớp.
    *   **Abnormal Case:** Cố tình chọn giáo viên đang ở trạng thái khóa (Inactive), hệ thống báo lỗi: "Không thể gán giáo viên không hoạt động cho lớp học." (`BR-48`)

---

#### 3.2.3.4 Quản lý Ghi danh / Xếp lớp (Enrollment Management)
*   **Function trigger:** Giáo viên hoặc Admin chọn nút **"Ghi danh học sinh"** (Enroll student) trong chi tiết lớp học.
*   **Function description:**
    *   **Actors/Roles:** Admin, Giáo viên (chỉ được ghi danh cho lớp mình quản lý - `BR-55`).
    *   **Purpose:** Thêm trẻ em vào lớp học để trẻ bắt đầu nhận các bài học và bài tập của lớp đó trên kính VR.
    *   **Interface:** Dropdown chọn danh sách Trẻ em chưa xếp lớp (hoặc tìm kiếm học sinh), cờ chọn trạng thái ghi danh (Active, Completed), nút "Xác nhận ghi danh".
    *   **Data processing:** POST gửi bản ghi gồm `ChildId` và `ClassroomId` đến `/api/Enrollments`. Backend kiểm tra trùng lặp bản ghi trước khi lưu.
*   **Screen layout:** Danh sách học sinh trong lớp học hiện tại có nút "Xóa khỏi lớp" (chuyển trạng thái ghi danh thành Cancelled/Inactive) và nút "Ghi danh mới".
*   **Function Details:**
    *   **Validation:** Trẻ em và lớp học liên kết phải tồn tại trong hệ thống.
    *   **Business Rules:** `BR-50`, `BR-51`, `BR-52`, `BR-53`, `BR-54`, `BR-55`.
    *   **Normal Case:** Trẻ được thêm vào lớp học thành công. Ứng dụng VR của trẻ sẽ lập tức đồng bộ hiển thị các bài tập của lớp này (`BR-52`).
    *   **Abnormal Case:** 
        1. *Ghi danh trùng lặp:* Cố tình xếp trẻ vào lớp mà trẻ đã có lịch sử ghi danh đang hoạt động, hệ thống từ chối và báo lỗi "Học sinh này đã được ghi danh vào lớp học từ trước." (`BR-51`)
        2. *Giáo viên xếp trẻ vào lớp của người khác:* Backend chặn quyền ghi danh và trả về `403 Forbidden` (`BR-55`).

---

### 3.2.4 Quản lý Nội dung Học tập (Learning Content Management)
Hệ thống quản lý nội dung học tập đa cấp bao gồm: Chương trình học -> Bài học -> Bài tập -> Câu hỏi. Phân quyền chỉ cho phép Admin hoặc người có thẩm quyền tạo/sửa đổi.

---

#### 3.2.4.1 Quản lý Chương trình học (Program Management)
*   **Function trigger:** Bấm chọn mục **"Quản lý chương trình học"** trên menu chính.
*   **Function description:**
    *   **Actors/Roles:** Admin, Giáo viên (được phân quyền).
    *   **Purpose:** Tạo và quản lý các khung chương trình giảng dạy, thiết lập độ tuổi phù hợp cho trẻ tham gia.
    *   **Interface:** Tên chương trình, Mô tả, Độ tuổi tối thiểu (Min Age), Độ tuổi tối đa (Max Age), Ngôn ngữ, Trạng thái (Active/Inactive), nút "Lưu".
    *   **Data processing:** Gửi POST/PUT đến `/api/Programs` để tạo hoặc cập nhật chương trình.
*   **Screen layout:** Danh sách chương trình hiển thị dạng bảng thông tin, cột độ tuổi ghi rõ ví dụ: "4 - 6 tuổi". Có nhãn màu sắc thể hiện trạng thái hoạt động.
*   **Function Details:**
    *   **Validation:** Độ tuổi tối thiểu không được lớn hơn độ tuổi tối đa (`BR-64`). Độ tuổi phải là số nguyên dương.
    *   **Business Rules:** `BR-56`, `BR-64`, `BR-65`, `BR-72`, `BR-73`, `BR-155`, `BR-156`.
    *   **Normal Case:** Chương trình được lưu thành công. Hệ thống đối chiếu tuổi của trẻ khi xếp chương trình để cảnh báo nếu không tương thích độ tuổi (`BR-65`).
    *   **Abnormal Case:** Nhập tuổi tối thiểu là 8, tuổi tối đa là 6, hệ thống báo lỗi: "Độ tuổi tối thiểu không thể lớn hơn độ tuổi tối đa." (`BR-64`)

---

#### 3.2.4.2 Quản lý Bài học (Lesson Management)
*   **Function trigger:** Bấm vào liên kết **"Xem bài học"** trong chi tiết một Chương trình học.
*   **Function description:**
    *   **Actors/Roles:** Admin, Giáo viên (được phân quyền).
    *   **Purpose:** Tạo các bài học cụ thể nằm trong một chương trình học lớn, sắp xếp thứ tự học tập của trẻ.
    *   **Interface:** Chọn chương trình học chi tiết, nhập Tên bài học, Thứ tự bài học (Lesson Order - số nguyên), Trạng thái (Active/Inactive), nút "Lưu".
    *   **Data processing:** POST/PUT đến `/api/Lessons`. Backend kiểm tra tính duy nhất của thứ tự bài học trong cùng một chương trình (`BR-61`).
*   **Screen layout:** Danh sách bài học được sắp xếp theo thứ tự từ nhỏ đến lớn (ví dụ: Bài 1, Bài 2, Bài 3) kèm tính năng kéo thả để thay đổi thứ tự bài học (Drag and Drop reorder).
*   **Function Details:**
    *   **Validation:** Thứ tự bài học phải là số duy nhất trong cùng chương trình.
    *   **Business Rules:** `BR-56`, `BR-57`, `BR-61`, `BR-62`, `BR-63`, `BR-72`.
    *   **Normal Case:** Bài học được tạo thành công và xuất hiện đúng thứ tự trong chương trình học của trẻ trên VR.
    *   **Abnormal Case:** 
        1. *Trùng thứ tự:* Nhập thứ tự bài học là `2` khi trong chương trình đã có bài học mang thứ tự `2`, hệ thống báo lỗi: "Thứ tự bài học đã tồn tại trong chương trình này." (`BR-61`)
        2. *Kích hoạt bài học khi chương trình cha đang bị khóa:* Hệ thống báo lỗi không cho phép kích hoạt (`BR-62`).

---

#### 3.2.4.3 Quản lý Thể loại bài tập (Exercise Type Management)
*   **Function trigger:** Chọn mục **"Thể loại bài tập"** trong quản lý nội dung học tập.
*   **Function description:**
    *   **Actors/Roles:** Admin.
    *   **Purpose:** Định nghĩa các loại bài tập đặc thù được hệ thống hỗ trợ (ví dụ: Tập phát âm, Luyện cơ miệng, Nhận diện thẻ hình).
    *   **Interface:** Tên loại bài tập, Mô tả chi tiết, Trạng thái (Hoạt động/Khóa).
    *   **Data processing:** POST/PUT dữ liệu loại bài tập đến `/api/ExerciseTypes`.
*   **Screen layout:** Danh sách bảng tối giản hiển thị tên các loại bài tập và công dụng mô tả ngắn.
*   **Function Details:**
    *   **Business Rules:** `BR-56`, `BR-59`, `BR-62`, `BR-63`, `BR-66`.
    *   **Normal Case:** Tạo loại bài tập thành công. Khi giáo viên tạo bài tập mới sẽ chọn từ danh sách này.
    *   **Abnormal Case:** Khóa một loại bài tập đang được gán cho các bài tập khác, hệ thống sẽ cảnh báo các bài tập liên kết sẽ không thể giao mới cho trẻ (`BR-63`).

---

#### 3.2.4.4 Quản lý Bài tập (Exercise Management)
*   **Function trigger:** Bấm nút **"Xem bài tập"** từ chi tiết một Bài học.
*   **Function description:**
    *   **Actors/Roles:** Admin, Giáo viên (được phân quyền).
    *   **Purpose:** Tạo các bài tập luyện tập cụ thể, cấu hình thời gian làm bài, độ khó và phương pháp gợi ý âm ngữ trị liệu.
    *   **Interface:** Tên bài tập, Hướng dẫn làm bài, Chọn Thể loại bài tập, Chọn Độ khó (Dễ, Trung bình, Khó), Chọn Kỹ năng đích (Phát âm, Từ vựng, Cơ miệng, Giao tiếp), Giới hạn thời gian (giây), Phương pháp gợi ý (Modeling, Imitation, Evoked Production - `BR-157`), Trạng thái (Hoạt động/Khóa).
    *   **Data processing:** Gửi POST/PUT đến `/api/Exercises`.
*   **Screen layout:** Danh sách bài tập hiển thị dạng thẻ, có biểu tượng kỹ năng và mức độ khó (3 sao cho Khó, 2 sao cho Trung bình, 1 sao cho Dễ).
*   **Function Details:**
    *   **Validation:** 
        1. Giới hạn thời gian làm bài phải lớn hơn 0 (`BR-67`).
        2. Mức độ khó phải nằm trong danh mục định sẵn (`BR-68`).
    *   **Business Rules:** `BR-56`, `BR-58`, `BR-62`, `BR-63`, `BR-65`, `BR-67`, `BR-68`, `BR-70`, `BR-72`, `BR-157`, `BR-158`.
    *   **Normal Case:** Bài tập được lưu thành công. Bài tập ở trạng thái Active sẽ được đồng bộ lên kính VR của học sinh liên kết.
    *   **Abnormal Case:** Nhập thời lượng giới hạn bài tập là `-10` giây hoặc `0` giây, hệ thống báo lỗi: "Giới hạn thời gian làm bài tập phải lớn hơn 0 giây." (`BR-67`)

---

#### 3.2.4.5 Quản lý Câu hỏi trong bài tập (Exercise Question Management)
*   **Function trigger:** Chọn nút **"Chi tiết câu hỏi"** (Manage Questions) trên dòng thông tin của Bài tập.
*   **Function description:**
    *   **Actors/Roles:** Admin, Giáo viên.
    *   **Purpose:** Xây dựng danh sách các câu hỏi/nhiệm vụ cụ thể bên trong một bài tập lớn.
    *   **Interface:** 
        1. Câu hỏi mẫu (tiếng Việt/tiếng Anh).
        2. Đáp án mong đợi (từ/câu trẻ cần phát âm chính xác).
        3. Kiểu nhập liệu (Phát âm giọng nói - Speech, Trắc nghiệm hình ảnh, Nhắc lại - Repeat, Luyện cơ miệng).
        4. Tải file âm thanh mẫu (.wav, .mp3 - `BR-71`).
        5. Tải ảnh minh họa (.png, .jpg - `BR-71`).
    *   **Data processing:** POST/PUT câu hỏi kèm file đính kèm đến `/api/ExerciseQuestions`. Backend lưu trữ file vào thư mục tài nguyên và ghi nhận đường dẫn tương đối vào database.
*   **Screen layout:** Giao diện chia thành danh sách câu hỏi ở bên trái và khung chi tiết chỉnh sửa/tải file phương tiện ở bên phải. Có nút nghe thử file âm thanh trực tiếp.
*   **Function Details:**
    *   **Validation:** 
        1. Câu hỏi, câu đáp án và kiểu nhập liệu không được để trống (`BR-69`).
        2. File tải lên phải đúng định dạng âm thanh/hình ảnh được hỗ trợ và không vượt quá kích thước tối đa cho phép (`BR-132`, `BR-133`).
    *   **Business Rules:** `BR-56`, `BR-60`, `BR-62`, `BR-63`, `BR-69`, `BR-70`, `BR-71`, `BR-72`, `BR-132`, `BR-133`.
    *   **Normal Case:** Tạo câu hỏi thành công. Bài tập sau khi được thêm câu hỏi hợp lệ (tối thiểu 1 câu hỏi hoạt động) sẽ đủ điều kiện xuất hiện trên kính VR (`BR-70`).
    *   **Abnormal Case:** Tải lên file âm thanh định dạng `.exe` hoặc dung lượng vượt cấu hình (ví dụ: > 10MB), hệ thống chặn và báo lỗi "Định dạng file không được hỗ trợ hoặc dung lượng vượt quá giới hạn." (`BR-132`, `BR-133`)

---

### 3.2.5 Quản lý Hồ sơ Trẻ em & Phụ huynh (Parent & Child Profile)
Module này quản lý hồ sơ thông tin của trẻ em (Child), mối liên kết giữa trẻ em và tài khoản phụ huynh, và bảo đảm an toàn dữ liệu học tập của trẻ.

---

#### 3.2.5.1 Quản lý Hồ sơ Trẻ em (Child Profile Management)
*   **Function trigger:** Giáo viên hoặc Admin truy cập menu **"Quản lý hồ sơ trẻ em"** (Child Profiles).
*   **Function description:**
    *   **Actors/Roles:** Admin, Giáo viên (chỉ được tạo/sửa trong phạm vi lớp học được phân công - `BR-27`).
    *   **Purpose:** Quản lý lý lịch cá nhân học tập của trẻ, liên kết trẻ với tài khoản phụ huynh quản lý.
    *   **Interface:** 
        1. Họ và tên trẻ.
        2. Tuổi, Giới tính (Nam, Nữ, Khác).
        3. Mức độ nhận thức/học tập (Beginner, Intermediate, Advanced).
        4. Ghi chú trị liệu/đặc điểm của trẻ.
        5. Dropdown chọn tài khoản Phụ huynh liên kết (Parent).
        6. Trạng thái hồ sơ (Active - Đang học / Inactive - Tạm ngưng).
    *   **Data processing:** POST/PUT đến `/api/ChildProfiles`. Backend thực hiện cập nhật thông tin trẻ và liên kết khóa ngoại với tài khoản phụ huynh trong DB.
*   **Screen layout:** Danh sách trẻ hiển thị kèm thông tin phụ huynh liên kết (Họ tên, SĐT). Có nhãn cảnh báo đặc biệt nếu trẻ thuộc diện cần lưu ý trị liệu riêng dựa trên độ tuổi hoặc ghi chú (`hasSupportFlag`).
*   **Function Details:**
    *   **Validation:** 
        1. Mỗi hồ sơ trẻ em bắt buộc phải chọn tối thiểu 1 tài khoản phụ huynh liên kết (`BR-35`).
        2. Tuổi của trẻ phải nằm trong khoảng hỗ trợ của hệ thống (`BR-38`).
    *   **Business Rules:** `BR-25`, `BR-27`, `BR-34`, `BR-35`, `BR-36`, `BR-37`, `BR-38`, `BR-40`, `BR-41`, `BR-42`, `BR-142`, `BR-143`.
    *   **Normal Case:** Lưu hồ sơ trẻ thành công. Phụ huynh liên kết sẽ thấy thông tin của trẻ xuất hiện trên Parent Dashboard (`BR-39`).
    *   **Abnormal Case:** 
        1. *Không gán phụ huynh:* Cố tình lưu hồ sơ mà để trống trường phụ huynh liên kết, hệ thống báo lỗi: "Hồ sơ trẻ em bắt buộc phải được liên kết với ít nhất một tài khoản phụ huynh." (`BR-35`)
        2. *Xóa hồ sơ trẻ đã có kết quả luyện tập:* Hệ thống chặn xóa vĩnh viễn để bảo toàn dữ liệu báo cáo lâm sàng, chỉ cho phép khóa hồ sơ (`BR-42`).

---

#### 3.2.5.2 Phân quyền & Giới hạn phạm vi xem thông tin trẻ em (Child Scope Access)
*   **Function trigger:** Chức năng tự động kiểm tra quyền (Security Interceptor) mỗi khi người dùng xem thông tin, kết quả hoặc báo cáo của một trẻ.
*   **Function description:**
    *   **Actors/Roles:** Phụ huynh, Giáo viên.
    *   **Purpose:** Bảo mật thông tin riêng tư của trẻ em, ngăn chặn việc rò rỉ dữ liệu giữa các gia đình và lớp học khác nhau.
    *   **Interface:** Không có giao diện riêng biệt, là lớp bảo mật trung gian. Nếu vi phạm, trả về trang thông báo lỗi truy cập.
    *   **Data processing:** 
        1. Khi nhận yêu cầu lấy dữ liệu trẻ, backend lấy `UserId` từ token và so sánh với mối quan hệ liên kết.
        2. Nếu user là Phụ huynh: Kiểm tra trong bảng liên kết xem `ParentUserId` có liên kết với `ChildId` hay không.
        3. Nếu user là Giáo viên: Kiểm tra xem trẻ có thuộc lớp học (Classroom) nào mà giáo viên này đang giảng dạy hay không.
        4. Nếu không thỏa mãn, backend trả về lỗi `403 Forbidden` (`BR-141`).
*   **Business Rules:** `BR-39`, `BR-40`, `BR-135`, `BR-136`, `BR-137`.
*   **Normal Case:** Phụ huynh xem được toàn bộ lịch sử học tập, ghi âm phát âm của con mình. Giáo viên xem được danh sách học sinh của lớp mình phụ trách.
*   **Abnormal Case:** Phụ huynh cố tình thay đổi tham số `childId` trên API thành ID của trẻ khác, backend trả về mã lỗi `403` kèm thông báo "Bạn không có quyền truy cập hồ sơ của trẻ em này." (`BR-136`)

---

### 3.2.6 Quản lý Kết quả học tập & Đánh giá Lâm sàng (Results, Analysis & Recommendations)
Phần này mô tả các chức năng lưu trữ kết quả thực hiện bài tập, phân tích phát âm âm vị và tính toán các chỉ số kiểm định lâm sàng phục vụ điều trị âm ngữ trị liệu.

---

#### 3.2.6.1 Xem & Quản lý Kết quả Luyện tập (Learning Result Management)
*   **Function trigger:** Người dùng chọn mục **"Kết quả luyện tập"** (Learning Results) trên menu chính.
*   **Function description:**
    *   **Actors/Roles:** Admin (xem toàn hệ thống), Giáo viên (chỉ xem kết quả học sinh lớp mình), Phụ huynh (chỉ xem kết quả của con mình).
    *   **Purpose:** Theo dõi chi tiết điểm số, thời gian làm bài, số lần thử và kết quả hoàn thành bài tập của trẻ.
    *   **Interface:** 
        1. Bảng kết quả gồm: Tên học sinh, Bài tập, Lần thử số (Attempt number), Điểm số, Thời gian thực hiện, Trạng thái (Hoàn thành/Chưa hoàn thành), Ngày làm bài.
        2. Bộ lọc theo tên trẻ, bài học, lớp học.
    *   **Data processing:** GET đến `/api/Results`.
*   **Screen layout:** Danh sách kết quả hiển thị dạng dòng thời gian (timeline) hoặc bảng dữ liệu, có nút "Xem chi tiết phát âm" và "Nghe file ghi âm" đối với bài tập nói.
*   **Function Details:**
    *   **Validation:** 
        1. Điểm số của kết quả phải nằm trong khoảng quy định (ví dụ: từ 0 đến 100) (`BR-86`).
        2. Thời gian thực hiện không được phép âm (`BR-87`).
    *   **Business Rules:** `BR-84`, `BR-85`, `BR-86`, `BR-87`, `BR-88`, `BR-89`, `BR-90`, `BR-91`, `BR-92`, `BR-93`, `BR-94`.
    *   **Normal Case:** Dữ liệu luyện tập của trẻ được hiển thị đầy đủ, chính xác. Kết quả đã ghi nhận sẽ ở chế độ chỉ đọc (Read-only) để đảm bảo tính khách quan (`BR-89`).
    *   **Abnormal Case:** File âm thanh ghi âm bài làm của trẻ bị lỗi hoặc mất trên server, hệ thống vẫn hiển thị bản ghi kết quả kèm nhãn trạng thái "Tệp ghi âm không khả dụng" thay vì làm lỗi cả trang (`BR-93`).

---

#### 3.2.6.2 Xem Chi tiết Phát âm (Pronunciation Detail Page)
*   **Function trigger:** Người dùng bấm vào nút **"Xem chi tiết phát âm"** trên một dòng Kết quả luyện tập nói.
*   **Function description:**
    *   **Actors/Roles:** Giáo viên, Phụ huynh.
    *   **Purpose:** Phân tích sâu lỗi phát âm của trẻ theo từng âm vị (phoneme), giúp tìm ra các âm trẻ hay nói ngọng, nói sai.
    *   **Interface:**
        *   Hiển thị câu mẫu và câu nói thực tế của trẻ.
        *   Sơ đồ các âm vị: tô màu Xanh lục nếu phát âm đúng, màu Đỏ nếu phát âm sai, kèm nhãn loại lỗi (ví dụ: Thay thế âm, Nuốt âm, Thêm âm).
        *   Điểm số độ chính xác phát âm của từng từ.
    *   **Data processing:** GET đến `/api/PronunciationDetails?resultId={id}` để lấy danh sách các âm vị được phân tích tự động từ AI Speech Recognition ở backend.
*   **Screen layout:** Trực quan hóa câu nói của trẻ dạng các thẻ từ ngữ có thể nhấn vào để nghe đoạn âm thanh nhỏ tương ứng với từ đó. Âm vị sai được tô màu đỏ và gạch chân. Phía dưới cùng có dòng khuyến cáo miễn trừ trách nhiệm y khoa (`BR-100`).
*   **Function Details:**
    *   **Validation:** Điểm số chính xác âm vị phải nằm trong khoảng cho phép (`BR-97`).
    *   **Business Rules:** `BR-95`, `BR-96`, `BR-97`, `BR-98`, `BR-99`, `BR-100`, `BR-106`.
    *   **Normal Case:** Trang hiển thị chi tiết điểm phát âm từng từ, ví dụ từ "quả táo" bị trẻ phát âm thành "quá táo" (sai âm vị dấu thanh).
    *   **Abnormal Case:** Bản ghi chi tiết phát âm mồ côi (không có kết quả cha hợp lệ), backend từ chối lưu và báo lỗi (`BR-98`).

---

#### 3.2.6.3 Xem & Tự động Tính toán Chỉ số Tiến độ (Progress Analysis - PCC & MLU)
*   **Function trigger:** Người dùng bấm chọn tab **"Phân tích tiến độ học tập"** trong hồ sơ của Trẻ.
*   **Function description:**
    *   **Actors/Roles:** Giáo viên, Phụ huynh.
    *   **Purpose:** Phân tích xu hướng phát triển ngôn ngữ của trẻ qua hai chỉ số lâm sàng chuẩn: **PCC** (Percentage of Consonants Correct - Tỷ lệ phụ âm chính xác) và **MLU** (Mean Length of Utterance - Độ dài trung bình của phát ngôn).
    *   **Interface:** 
        1. Biểu đồ đường (Line chart) thể hiện biến động PCC (%) theo thời gian.
        2. Biểu đồ cột thể hiện biến động MLU (số từ/phát ngôn) qua các tuần học.
        3. Khung cấu hình lựa chọn giai đoạn phân tích (Ví dụ: 1 tháng qua, 3 tháng qua).
    *   **Data processing:** 
        1. Khi mở trang, client gửi yêu cầu đến `/api/Analyze/progress?childId={id}&period=30`.
        2. Backend quét toàn bộ các kết quả luyện tập hợp lệ của trẻ trong 30 ngày.
        3. Thực hiện công thức tính toán:
           *   $PCC = \frac{\text{Số phụ âm phát âm đúng}}{\text{Tổng số phụ âm cơ hội}} \times 100\%$ (`BR-159`).
           *   $MLU = \frac{\text{Tổng số từ phát âm trong các mẫu}}{\text{Tổng số phát ngôn hợp lệ}}$ (`BR-160`).
        4. Trả về mảng dữ liệu tính toán để vẽ biểu đồ.
*   **Screen layout:** Giao diện gồm hai bảng biểu đồ lớn màu sắc dịu nhẹ chống mỏi mắt. Phía dưới mỗi biểu đồ có chú thích chi tiết định nghĩa lâm sàng và nhấn mạnh đây là các chỉ số giáo dục, không tự động thay thế chẩn đoán y khoa (`BR-161`).
*   **Function Details:**
    *   **Validation:** 
        1. PCC chỉ được tính từ các bài tập phát âm có đủ số lượng phụ âm cơ hội tối thiểu (`BR-159`).
        2. MLU chỉ tính từ các mẫu ngôn ngữ đạt tiêu chuẩn chất lượng (không bị nhiễu âm thanh, đạt độ dài tối thiểu) (`BR-160`).
    *   **Business Rules:** `BR-101`, `BR-102`, `BR-103`, `BR-159`, `BR-160`, `BR-161`, `BR-162`.
    *   **Normal Case:** Trẻ hoàn thành thêm bài tập nói mới, hệ thống tự động chạy ngầm tác vụ tính toán lại (Recalculate) và cập nhật điểm biểu đồ PCC, MLU mới nhất (`BR-103`).
    *   **Abnormal Case:** Mẫu âm thanh của trẻ quá ngắn hoặc không nhận diện được từ nào, backend bỏ qua bản ghi đó khỏi công thức tính toán MLU để tránh làm sai lệch chỉ số báo cáo (`BR-160`).

---

#### 3.2.6.4 Soạn thảo & Xem Gợi ý / Khuyến nghị (Recommendations & Professional Notes)
*   **Function trigger:** Giáo viên mở hồ sơ học sinh và bấm nút **"Thêm Khuyến nghị"** (Add Recommendation).
*   **Function description:**
    *   **Actors/Roles:** Giáo viên (tạo/sửa), Phụ huynh (chỉ xem).
    *   **Purpose:** Giáo viên đưa ra các lời khuyên chuyên môn, bài tập bổ sung hoặc nhận xét tiến độ để phụ huynh phối hợp rèn luyện cho trẻ tại nhà.
    *   **Interface:** 
        *   Ô nhập nội dung văn bản nhận xét.
        *   Dropdown chọn mức độ ưu tiên (Cần lưu ý, Bình thường, Tốt).
        *   Nút "Gửi khuyến nghị".
    *   **Data processing:** Gửi POST/PUT đến `/api/Recommendations` để lưu nhận xét gắn liền với `ChildId` và lưu ID giáo viên làm tác giả.
*   **Screen layout:** Khung nhập liệu có định dạng văn bản giàu (Rich Text Editor). Phía dưới hiển thị lịch sử các khuyến nghị trước đó sắp xếp theo thời gian mới nhất lên trên, hiển thị rõ tên giáo viên viết khuyến nghị.
*   **Function Details:**
    *   **Validation:** Nội dung nhận xét khuyến nghị không được bỏ trống và không quá 2000 ký tự.
    *   **Business Rules:** `BR-104`, `BR-105`, `BR-106`, `BR-169`, `BR-170`, `BR-171`, `BR-172`.
    *   **Normal Case:** Giáo viên viết và gửi khuyến nghị, phụ huynh đăng nhập vào sẽ nhận được thông báo đỏ và đọc được khuyến nghị trên màn hình Dashboard của họ.
    *   **Abnormal Case:** Giáo viên cố tình sửa đổi khuyến nghị của một trẻ không nằm trong lớp mình quản lý, API trả về lỗi từ chối quyền truy cập `403 Forbidden` (`BR-105`).

---

### 3.2.7 Lịch sử học tập & Xem lại Bài học (Learning History & Lesson Replay)
Module này cung cấp công cụ cho phép theo dõi toàn bộ quá trình luyện tập của trẻ theo thời gian và phát lại trực quan quá trình làm bài của trẻ trong môi trường VR 3D.

---

#### 3.2.7.1 Lịch sử Học tập (Learning History)
*   **Function trigger:** Người dùng chọn tab **"Lịch sử luyện tập"** (Learning History) trong trang thông tin của Trẻ.
*   **Function description:**
    *   **Actors/Roles:** Giáo viên, Phụ huynh.
    *   **Purpose:** Hiển thị danh sách các bài làm của trẻ theo trình tự thời gian đảo ngược (mới nhất lên đầu) để dễ dàng theo dõi mức độ chăm chỉ và tiến bộ của trẻ qua từng lần thử.
    *   **Interface:** Danh sách dòng thời gian (Timeline) hiển thị: Thời gian bắt đầu, Tên bài tập, Điểm số, Số lần thử của bài tập này, Nút "Xem phát lại" (Replay).
    *   **Data processing:** GET đến `/api/Results/history?childId={id}`.
*   **Screen layout:** Giao diện thiết kế dạng các mốc thời gian nối tiếp nhau bằng đường chỉ mờ (timeline view). Điểm số cao được đánh dấu sao vàng lấp lánh để động viên phụ huynh.
*   **Function Details:**
    *   **Validation:** Lịch sử phải bảo toàn chính xác trật tự làm bài, không được gộp các lần thử khác nhau làm một (`BR-107`).
    *   **Business Rules:** `BR-107`, `BR-109`, `BR-110`, `BR-111`.
    *   **Normal Case:** Hiển thị đúng danh sách các lần thử, ví dụ lần thử 1 được 50 điểm lúc 8:00, lần thử 2 được 80 điểm lúc 8:15 của cùng một bài tập.

---

#### 3.2.7.2 Trình xem lại Bài học (Lesson Replay - Replay Player)
*   **Function trigger:** Nhấn nút **"Xem phát lại"** (Lesson Replay) trên một dòng kết quả trong Lịch sử học tập.
*   **Function description:**
    *   **Actors/Roles:** Giáo viên, Phụ huynh (chỉ xem của con mình).
    *   **Purpose:** Tái hiện lại không gian luyện tập VR của trẻ (bao gồm hướng nhìn của trẻ, các cử chỉ tương tác bằng tay/controller, file âm thanh giọng nói của trẻ phát ra) để giáo viên phân tích hành vi của trẻ trong môi trường ảo.
    *   **Interface:** 
        *   Trình phát video ảo (Replay Player) có các nút bấm: Play, Pause, Tua nhanh (1.5x, 2x), Thanh trượt thời gian (Timeline slider).
        *   Khung hiển thị thông số tương tác trực tiếp (Interaction logs) bên cạnh.
    *   **Data processing:** 
        1. Giao diện gửi request GET đến `/api/Results/{id}/replay-data`.
        2. Backend trả về tệp dữ liệu mô phỏng tương tác (dạng JSON chứa tọa độ tay, đầu theo thời gian) và đường dẫn file âm thanh ghi âm tương ứng (`BR-108`).
        3. Frontend sử dụng thư viện mô phỏng (hoặc WebGL/Three.js) để dựng lại chuyển động góc nhìn của trẻ dựa trên tọa độ nhận được.
*   **Screen layout:** Khung phát rộng chiếm 70% màn hình, thanh điều khiển phát ở dưới cùng giống như trình phát video thông thường. Phía bên phải là danh sách các sự kiện tương tác của trẻ (ví dụ: "00:05 - Chạm vào quả bóng", "00:12 - Bắt đầu nói").
*   **Function Details:**
    *   **Validation:** Chỉ khả dụng khi tệp dữ liệu replay và tệp âm thanh tương ứng tồn tại trên máy chủ lưu trữ (`BR-108`).
    *   **Business Rules:** `BR-108`, `BR-109`, `BR-110`, `BR-112`, `BR-132`, `BR-135`.
    *   **Normal Case:** Trình mô phỏng phát mượt mà chuyển động đầu và tay của trẻ trong quá trình học tập trên VR kèm âm thanh nói khớp thời gian.
    *   **Abnormal Case:** Tệp dữ liệu chuyển động bị lỗi không tải được, hệ thống vẫn hiển thị giao diện phát nhưng thông báo lỗi thân thiện: "Không thể tải dữ liệu chuyển động của bài học này. Bạn vẫn có thể nghe tệp ghi âm giọng nói của trẻ ở dưới." chứ không làm treo toàn bộ ứng dụng Web (`BR-112`).

---

### 3.2.8 Báo cáo & Thống kê (Reporting & Dashboard)
Hệ thống hiển thị các số liệu thống kê tổng hợp và hỗ trợ xuất bản báo cáo học tập định kỳ phục vụ mục đích kiểm định lâm sàng hoặc báo cáo phụ huynh.

---

#### 3.2.8.1 Dashboard phân quyền (Role-based Dashboards)
*   **Function trigger:** Người dùng đăng nhập thành công vào hệ thống.
*   **Function description:**
    *   **Actors/Roles:** Admin, Giáo viên, Phụ huynh.
    *   **Purpose:** Cung cấp cái nhìn tổng quan về tình hình học tập và hoạt động hệ thống tương ứng với vai trò của người đăng nhập.
    *   **Interface:**
        *   **Admin Dashboard:** Số lượng tài khoản mới trong tháng, số lớp học đang mở, biểu đồ phân bổ vai trò, danh sách hoạt động hệ thống gần đây.
        *   **Teacher Dashboard:** Số lượng học sinh đang quản lý, tỷ lệ hoàn thành bài tập trung bình của các lớp, danh sách bài tập cần chấm điểm/nhận xét, biểu đồ tiến độ chung của lớp.
        *   **Parent Dashboard:** Thông tin tóm tắt của con, biểu đồ số bài tập con đã làm trong tuần, khuyến nghị mới nhất từ giáo viên, nút chuyển đổi nhanh giữa các con (nếu có nhiều con - `BR-36`).
    *   **Data processing:** Gọi GET đến `/api/Dashboard/metrics` kèm vai trò của user. Backend lọc dữ liệu trong DB theo phạm vi quản lý của người dùng.
*   **Screen layout:** Sử dụng giao diện thiết kế dạng thẻ (Widget-based Dashboard) hiện đại. Tích hợp các biểu đồ tròn (Pie chart), biểu đồ cột (Bar chart) trực quan sinh động từ thư viện Chart.js hoặc Recharts.
*   **Function Details:**
    *   **Validation:** Chỉ tổng hợp từ các bản ghi dữ liệu hợp lệ và đã hoàn thành trong hệ thống.
    *   **Business Rules:** `BR-08`, `BR-113`, `BR-114`, `BR-115`, `BR-116`, `BR-117`, `BR-118`, `BR-119`.
    *   **Normal Case:** Giao diện hiển thị các chỉ số thống kê chính xác và cập nhật theo thời gian thực.
    *   **Abnormal Case:** 
        1. *Không có dữ liệu:* Đối với giáo viên mới nhận lớp chưa có học sinh làm bài, hệ thống hiển thị hình vẽ minh họa trống trải kèm dòng chữ "Chưa có dữ liệu thống kê nào. Hãy ghi danh học sinh và bắt đầu luyện tập." để tránh hiển thị các số liệu lỗi hoặc ngụy tạo (`BR-119`).
        2. *Lỗi kết nối cơ sở dữ liệu:* Dashboard hiển thị trạng thái đang tải lỗi thay vì hiển thị các ô số liệu bằng 0 gây hiểu lầm (`BR-118`).

---

#### 3.2.8.2 Trình tạo & Xuất báo cáo (Report Generator)
*   **Function trigger:** Người dùng chọn menu **"Báo cáo & Thống kê"** -> bấm nút **"Tạo báo cáo"** (Generate Report).
*   **Function description:**
    *   **Actors/Roles:** Admin, Giáo viên (chỉ tạo báo cáo học sinh của mình - `BR-122`), Phụ huynh (chỉ xuất báo cáo của con mình - `BR-123`).
    *   **Purpose:** Tổng hợp kết quả học tập của trẻ thành tệp tài liệu PDF/Excel có dấu mốc thời gian để lưu trữ hoặc chia sẻ.
    *   **Interface:** 
        *   Dropdown chọn Trẻ em / Lớp học cần báo cáo.
        *   Bộ lọc Khoảng thời gian (Ngày bắt đầu, Ngày kết thúc).
        *   Chọn Loại báo cáo (Báo cáo tiến độ học tập, Báo cáo lâm sàng chi tiết).
        *   Nút **"Xuất báo cáo PDF"** hoặc **"Xuất báo cáo Excel"**.
    *   **Data processing:** 
        1. Gửi request POST đến `/api/Reports/generate` chứa thông số lọc.
        2. Backend truy vấn dữ liệu kết quả, chạy thuật toán kết xuất file PDF/Excel sử dụng thư viện kết xuất tài liệu (ví dụ: QuestPDF hoặc EPPlus).
        3. Lưu file báo cáo vào thư mục lưu trữ tạm thời và trả về link tải file cho Client.
*   **Screen layout:** Khung xem trước báo cáo (Print Preview) hiển thị định dạng trang giấy A4 trực quan trước khi người dùng thực hiện tải xuống.
*   **Function Details:**
    *   **Validation:** Ngày bắt đầu báo cáo không được lớn hơn ngày kết thúc (`BR-120`).
    *   **Business Rules:** `BR-120`, `BR-121`, `BR-122`, `BR-123`, `BR-124`, `BR-125`, `BR-132`.
    *   **Normal Case:** Tải xuống tệp báo cáo PDF đẹp mắt chứa logo hệ thống, biểu đồ tiến trình học tập của trẻ và chữ ký điện tử xác nhận của giáo viên phụ trách.
    *   **Abnormal Case:** Nhập ngày bắt đầu sau ngày kết thúc (ví dụ bắt đầu từ 30/06/2026 đến kết thúc 01/06/2026), hệ thống chặn và báo lỗi "Khoảng thời gian báo cáo không hợp lệ." (`BR-120`)

---

### 3.2.9 Ứng dụng Học tập VR (VR Learning Application - Device Side)
Phần này mô tả các hoạt động nghiệp vụ diễn ra trên thiết bị kính thực tế ảo (VR Headset), kết nối đồng bộ dữ liệu với Backend qua các API bảo mật.

---

#### 3.2.9.1 Tải nội dung & Khởi chạy luyện tập trên VR (VR Content Load & Session Start)
*   **Function trigger:** Trẻ em đeo kính VR khởi động ứng dụng GodotXR và đăng nhập/chọn hồ sơ của mình.
*   **Function description:**
    *   **Actors/Roles:** Trẻ em (Child - trực tiếp trải nghiệm qua kính VR).
    *   **Purpose:** Tải danh sách bài học và bài tập được giáo viên giao trong lớp học mà trẻ ghi danh để bắt đầu luyện tập trong môi trường thực tế ảo.
    *   **Interface:** Giao diện không gian 3D (3D VR Environment) hiển thị danh sách các bài học dạng các hòn đảo tri thức hoặc bảng lựa chọn nổi 3D (floating UI panel).
    *   **Data processing:** 
        1. Ứng dụng VR gửi yêu cầu GET đến `/api/VR/assigned-content?childId={id}` kèm theo AccessToken của kính VR.
        2. Backend xác thực trạng thái hoạt động của hồ sơ trẻ (`BR-75`) và trạng thái ghi danh lớp học (`BR-76`), sau đó trả về danh sách các bài tập đang hoạt động (Active) tương thích với trẻ (`BR-74`).
        3. Kính VR tải tài nguyên đồ họa 3D tương ứng và tạo một Session ID duy nhất cho lượt luyện tập này (`BR-79`).
*   **Screen layout:** Không gian 3D được thiết kế sinh động, thân thiện với trẻ em. Các nút bấm bài tập dạng hình bong bóng hoặc con vật dễ thương có âm thanh phản hồi vui nhộn khi trẻ dùng controller chỉ vào hoặc chạm vào.
*   **Function Details:**
    *   **Validation:** Trẻ em phải có hồ sơ trạng thái hoạt động (Active) và có ghi danh hợp lệ mới có thể lấy được nội dung học tập.
    *   **Business Rules:** `BR-04`, `BR-74`, `BR-75`, `BR-76`, `BR-77`, `BR-78`, `BR-79`.
    *   **Normal Case:** Trẻ chọn bài tập nói "Quả táo", hệ thống VR sinh Session ID và hiển thị hướng dẫn cùng mô hình 3D quả táo bắt mắt để trẻ chuẩn bị phát âm.
    *   **Abnormal Case:** Hồ sơ của trẻ bị giáo viên khóa (chuyển sang Inactive) khi trẻ đang mở kính, ứng dụng VR sẽ nhận được mã lỗi từ API và hiển thị màn hình thông báo: "Hồ sơ của bạn tạm thời ngưng hoạt động. Hãy nhờ thầy cô hoặc bố mẹ kiểm tra lại." (`BR-75`)

---

#### 3.2.9.2 Thu thập minh chứng & Gửi kết quả từ kính VR (Evidence Recording & API Sync)
*   **Function trigger:** Trẻ em hoàn thành một bài tập hoặc bấm nút kết thúc/thoát bài tập trên kính VR.
*   **Function description:**
    *   **Actors/Roles:** Trẻ em.
    *   **Purpose:** Ghi lại toàn bộ quá trình luyện tập của trẻ bao gồm điểm số, thời gian làm bài, file ghi âm giọng nói phát âm của trẻ, và file nhật ký chuyển động (replay data) để đồng bộ về máy chủ.
    *   **Interface:** Trực quan 3D hiển thị điểm số trẻ đạt được sau bài làm (ví dụ: "Chúc mừng bé đã đạt 90/100 điểm!") kèm theo các hiệu ứng pháo hoa chúc mừng.
    *   **Data processing:**
        1. Trong quá trình học, kính VR ghi âm giọng nói của trẻ thành tệp âm thanh (.wav) và ghi lại tọa độ chuyển động của đầu/tay vào bộ nhớ đệm.
        2. Khi hoàn thành, ứng dụng VR gọi API POST gửi kết quả học tập kèm tệp ghi âm và tệp dữ liệu chuyển động đến `/api/Results/sync`.
        3. Backend lưu trữ tệp tin vào Cloud Storage / File Server, chạy bộ phân tích âm vị giọng nói và lưu bản ghi kết quả học tập vào database.
*   **Function Details:**
    *   **Validation:** Tệp gửi lên phải khớp với Session ID đã tạo và không được gửi trùng lặp dữ liệu của cùng một Session ID (`BR-80`).
    *   **Business Rules:** `BR-80`, `BR-81`, `BR-82`, `BR-83`, `BR-88`, `BR-132`, `BR-134`, `BR-138`, `BR-151`.
    *   **Normal Case:** Kết quả đồng bộ thành công, điểm số và âm thanh ghi âm lập tức hiển thị trên Web Dashboard của giáo viên và phụ huynh.
    *   **Abnormal Case:** Mạng Internet bị ngắt đột ngột khi trẻ đang làm bài hoặc lúc gửi kết quả, ứng dụng VR lưu tạm kết quả vào bộ nhớ trong của thiết bị kính. Khi có mạng trở lại, kính sẽ tự động thực hiện gửi lại (Retry) kết quả mà không tạo ra bản ghi trùng lặp nhờ cơ chế kiểm tra Session ID trên Backend (`BR-80`, `BR-151`).

---

#### 3.2.9.3 Quản lý Đồng thuận từ Phụ huynh & Lưu trữ dữ liệu từ xa (Parental Consent & Telepractice)
*   **Function trigger:** Phụ huynh đăng nhập vào ứng dụng Web Dashboard lần đầu hoặc truy cập phần cài đặt quyền riêng tư của con.
*   **Function description:**
    *   **Actors/Roles:** Phụ huynh (Parent).
    *   **Purpose:** Phụ huynh cấp quyền hoặc rút quyền cho phép hệ thống thu thập, ghi âm giọng nói và lưu trữ dữ liệu hình ảnh chuyển động của con mình khi luyện tập từ xa tại nhà (Telepractice).
    *   **Interface:** Form xác nhận điều khoản dịch vụ (Consent Form) gồm văn bản pháp lý về quyền riêng tư và hộp kiểm chọn **"Tôi đồng ý cho phép ứng dụng ghi âm giọng nói và theo dõi quá trình luyện tập VR của con tôi"**, nút "Xác nhận đồng ý".
    *   **Data processing:** Lưu trạng thái đồng ý (`ParentalConsent = true/false`) kèm theo mốc thời gian và ID phụ huynh vào DB. Khi kính VR gửi yêu cầu đồng bộ kết quả, backend sẽ đối chiếu cờ đồng thuận này trước khi chấp nhận ghi nhận file ghi âm giọng nói.
*   **Screen layout:** Hộp thoại thông tin quyền riêng tư được thiết kế trang trọng, dễ hiểu, trình bày rõ mục đích sử dụng các tệp ghi âm giọng nói của trẻ chỉ phục vụ cho việc chấm điểm âm ngữ trị liệu lâm sàng và giáo dục.
*   **Function Details:**
    *   **Validation:** Không được phép tải lên hoặc lưu trữ tệp ghi âm của trẻ nếu phụ huynh chưa tích chọn xác nhận đồng ý (`BR-174`).
    *   **Business Rules:** `BR-173`, `BR-174`, `BR-175`, `BR-176`, `BR-177`, `BR-178`, `BR-179`, `BR-180`.
    *   **Normal Case:** Phụ huynh đồng ý, trẻ thực hiện bài tập ở nhà, kết quả được ghi nhận đầy đủ kèm file âm thanh phát âm gửi về cho giáo viên xem xét đánh giá từ xa (Asynchronous Telepractice - `BR-173`).
    *   **Abnormal Case:** Phụ huynh chọn rút quyền đồng thuận (Withdraw consent), hệ thống lập tức cập nhật trạng thái. Các bài làm tiếp theo của trẻ trên kính VR sẽ vẫn chấm điểm cục bộ nhưng không tải tệp ghi âm giọng nói và dữ liệu chuyển động 3D lên server nữa để bảo mật (`BR-177`, `BR-178`).
