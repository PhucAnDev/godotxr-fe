import { ApiError, type ApiResponse } from './apiClient';

export interface PagedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
}

export interface ServiceResult<T = void> {
  success: boolean;
  message: string;
  errors: string[];
  data?: T;
}

const TRANSLATIONS: Record<string, string> = {
  // Common / API standard responses
  "ok": "Thành công",
  "not found.": "Không tìm thấy dữ liệu.",
  "invalid request.": "Yêu cầu không hợp lệ.",
  "request body is required.": "Nội dung yêu cầu không được để trống.",
  "validation failed.": "Dữ liệu xác thực không hợp lệ.",
  "create failed.": "Tạo mới thất bại.",
  "update failed.": "Cập nhật thất bại.",
  "delete failed.": "Xóa thất bại.",
  "invalid id.": "Mã định danh không hợp lệ.",

  // Programs
  "program created.": "Chương trình học đã được tạo thành công.",
  "program updated.": "Chương trình học đã được cập nhật thành công.",
  "program deleted.": "Chương trình học đã được xóa thành công.",
  "invalid program id.": "Mã chương trình học không hợp lệ.",
  "program not found.": "Không tìm thấy chương trình học.",
  "create program failed.": "Tạo chương trình học thất bại.",
  "update program failed.": "Cập nhật chương trình học thất bại.",
  "delete program failed.": "Xóa chương trình học thất bại.",

  // Lessons
  "lesson created.": "Bài học đã được tạo thành công.",
  "lesson updated.": "Bài học đã được cập nhật thành công.",
  "lesson deleted.": "Bài học đã được xóa thành công.",
  "invalid lesson id.": "Mã bài học không hợp lệ.",
  "lesson not found.": "Không tìm thấy bài học.",
  "create lesson failed.": "Tạo bài học thất bại.",
  "update lesson failed.": "Cập nhật bài học thất bại.",
  "delete lesson failed.": "Xóa bài học thất bại.",

  // Questions
  "question created.": "Câu hỏi đã được tạo thành công.",
  "question updated.": "Câu hỏi đã được cập nhật thành công.",
  "question deleted.": "Câu hỏi đã được xóa thành công.",
  "question not found.": "Không tìm thấy câu hỏi.",

  // Exercises
  "exercise created.": "Bài tập đã được tạo thành công.",
  "exercise updated.": "Bài tập đã được cập nhật thành công.",
  "exercise deleted.": "Bài tập đã được xóa thành công.",
  "exercise not found.": "Không tìm thấy bài tập.",

  // Exercise types
  "exercise type created.": "Loại bài tập đã được tạo thành công.",
  "exercise type updated.": "Loại bài tập đã được cập nhật thành công.",
  "exercise type deleted.": "Loại bài tập đã được xóa thành công.",
  "exercise type not found.": "Không tìm thấy loại bài tập.",

  // Classrooms
  "classroom created.": "Lớp học đã được tạo thành công.",
  "classroom updated.": "Lớp học đã được cập nhật thành công.",
  "classroom deleted.": "Lớp học đã được xóa thành công.",
  "classroom not found.": "Không tìm thấy lớp học.",
  "invalid classroom id.": "Mã lớp học không hợp lệ.",
  "create classroom failed.": "Tạo lớp học thất bại.",
  "update classroom failed.": "Cập nhật lớp học thất bại.",
  "delete classroom failed.": "Xóa lớp học thất bại.",

  // Auth
  "login successful.": "Đăng nhập thành công.",
  "login failed.": "Đăng nhập thất bại.",
  "token refreshed successfully.": "Làm mới mã xác thực thành công.",
  "forgot password failed.": "Yêu cầu khôi phục mật khẩu thất bại.",
  "otp has been sent successfully.": "Mã OTP đã được gửi thành công.",
  "reset password failed.": "Đặt lại mật khẩu thất bại.",
  "password has been reset successfully.": "Mật khẩu đã được đặt lại thành công.",
  "change password failed.": "Đổi mật khẩu thất bại.",
  "password has been changed successfully.": "Mật khẩu đã được đổi thành công.",
  "token is required.": "Yêu cầu cung cấp mã xác thực.",
  "refresh token failed.": "Làm mới mã xác thực thất bại.",

  // Users
  "user created.": "Người dùng đã được tạo thành công.",
  "user updated.": "Người dùng đã được cập nhật thành công.",
  "user deleted.": "Người dùng đã được xóa thành công.",
  "user not found.": "Không tìm thấy người dùng.",
  "invalid user id.": "Mã người dùng không hợp lệ.",
  "create user failed.": "Tạo người dùng thất bại.",
  "update user failed.": "Cập nhật người dùng thất bại.",
  "delete user failed.": "Xóa người dùng thất bại.",

  // Child Profiles
  "child profile created.": "Hồ sơ trẻ đã được tạo thành công.",
  "child profile updated.": "Hồ sơ trẻ đã được cập nhật thành công.",
  "child profile deleted.": "Hồ sơ trẻ đã được xóa thành công.",
  "child profile not found.": "Không tìm thấy hồ sơ trẻ.",
  "invalid child profile id.": "Mã hồ sơ trẻ không hợp lệ.",
  "create child profile failed.": "Tạo hồ sơ trẻ thất bại.",
  "update child profile failed.": "Cập nhật hồ sơ trẻ thất bại.",
  "delete child profile failed.": "Xóa hồ sơ trẻ thất bại.",

  // Enrollments
  "enrollment created.": "Ghi danh đã được tạo thành công.",
  "enrollment updated.": "Ghi danh đã được cập nhật thành công.",
  "enrollment deleted.": "Ghi danh đã được xóa thành công.",
  "enrollment not found.": "Không tìm thấy thông tin ghi danh.",
  "invalid enrollment id.": "Mã ghi danh không hợp lệ.",
  "create enrollment failed.": "Tạo ghi danh thất bại.",
  "update enrollment failed.": "Cập nhật ghi danh thất bại.",
  "delete enrollment failed.": "Xóa ghi danh thất bại.",

  // Roles
  "role created.": "Vai trò đã được tạo thành công.",
  "role updated.": "Vai trò đã được cập nhật thành công.",
  "role deleted.": "Vai trò đã được xóa thành công.",
  "role not found.": "Không tìm thấy vai trò.",
  "invalid role id.": "Mã vai trò không hợp lệ.",
  "create role failed.": "Tạo vai trò thất bại.",
  "update role failed.": "Cập nhật vai trò thất bại.",
  "delete role failed.": "Xóa vai trò thất bại.",

  // Semesters
  "semester created.": "Học kỳ đã được tạo thành công.",
  "semester updated.": "Học kỳ đã được cập nhật thành công.",
  "semester deleted.": "Học kỳ đã được xóa thành công.",
  "semester not found.": "Không tìm thấy học kỳ.",
  "invalid semester id.": "Mã học kỳ không hợp lệ.",
  "create semester failed.": "Tạo học kỳ thất bại.",
  "update semester failed.": "Cập nhật học kỳ thất bại.",
  "delete semester failed.": "Xóa học kỳ thất bại.",

  // SchoolYears
  "school year created.": "Năm học đã được tạo thành công.",
  "school year updated.": "Năm học đã được cập nhật thành công.",
  "school year deleted.": "Năm học đã được xóa thành công.",
  "school year not found.": "Không tìm thấy năm học.",
  "invalid school year id.": "Mã năm học không hợp lệ.",
  "create school year failed.": "Tạo năm học thất bại.",
  "update school year failed.": "Cập nhật năm học thất bại.",
  "delete school year failed.": "Xóa năm học thất bại.",

  // Results
  "result submitted successfully.": "Kết quả đã được nộp thành công.",
  "submit failed.": "Nộp kết quả thất bại.",
  "finalized results cannot be permanently deleted.": "Kết quả đã hoàn tất không thể xóa vĩnh viễn.",
};

const ERROR_TRANSLATIONS: Record<string, string> = {
  // Input fields translations
  "the programname field is required.": "Tên chương trình học là bắt buộc.",
  "the description field is required.": "Mô tả là bắt buộc.",
  "the targetagefrom field is required.": "Độ tuổi bắt đầu là bắt buộc.",
  "the targetageto field is required.": "Độ tuổi tối đa là bắt buộc.",
  "the language field is required.": "Ngôn ngữ đào tạo là bắt buộc.",
  "the status field is required.": "Trạng thái hoạt động là bắt buộc.",
  "the lessonname field is required.": "Tên bài học là bắt buộc.",
  "the durationminutes field is required.": "Thời lượng kính là bắt buộc.",
  "the vrinteractivemode field is required.": "Chế độ tương tác VR là bắt buộc.",
  "email is required.": "Email là bắt buộc.",
  "password is required.": "Mật khẩu là bắt buộc.",
  "username is required.": "Tên đăng nhập là bắt buộc.",
  "fullname is required.": "Họ và tên là bắt buộc.",
  "role is required.": "Vai trò là bắt buộc.",
};

function translateMessage(message: string): string {
  if (!message) return '';
  const trimmed = message.trim();
  const key = trimmed.toLowerCase();
  return TRANSLATIONS[key] || trimmed;
}

function translateError(err: string): string {
  if (!err) return '';
  const trimmed = err.trim();
  const key = trimmed.toLowerCase();
  return ERROR_TRANSLATIONS[key] || trimmed;
}

export function fromResponse<T>(response: ApiResponse<T>): ServiceResult<T> {
  return {
    success: response.success,
    message: translateMessage(response.message),
    errors: (response.errors ?? []).map(translateError),
    data: response.data,
  };
}

export function fromError<T>(error: unknown): ServiceResult<T> {
  if (error instanceof ApiError) {
    return {
      success: false,
      message: translateMessage(error.message),
      errors: (error.errors ?? []).map(translateError),
    };
  }
  return {
    success: false,
    message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    errors: [],
  };
}

