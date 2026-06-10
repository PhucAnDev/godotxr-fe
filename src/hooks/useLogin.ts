import { useState } from 'react';
import type { FormEvent } from 'react';
import { login } from '../services/authService';
import type { UserAuthInfo } from '../services/authService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoginUserRole = 'PARENT' | 'TEACHER' | 'ADMIN';

/** Shape trả về từ hook để component sử dụng */
export interface UseLoginReturn {
  // ─── State ────────────────────────────────────────────────────────────────
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;

  // ─── Setters ──────────────────────────────────────────────────────────────
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  clearError: () => void;

  // ─── Actions ──────────────────────────────────────────────────────────────
  /** Submit form đăng nhập, gọi BE API */
  handleSubmit: (
    e: FormEvent,
    onSuccess: (role: LoginUserRole) => void
  ) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map roleName từ BE (chuỗi tự do) sang UserRole của FE.
 * BE trả về "Admin" | "Teacher" | "Parent" (không phân biệt hoa thường).
 */
function mapRoleName(roleName: string): LoginUserRole {
  const normalized = roleName.trim().toLowerCase();
  if (normalized === 'admin') return 'ADMIN';
  if (normalized === 'teacher') return 'TEACHER';
  return 'PARENT';
}

/**
 * Lưu session vào localStorage theo đúng format mà hệ thống hiện tại đang đọc.
 * - 'user_role'    : được đọc bởi AppRoutes để khởi tạo userRole state
 * - 'current_user' : được đọc bởi getCurrentUser() trong authMock + routeGuards
 * - 'auth_token'   : access token dùng cho các API call cần xác thực
 * - 'refresh_token': dùng để làm mới access token
 */
function persistSession(userInfo: UserAuthInfo, accessToken: string, refreshTokenValue: string): LoginUserRole {
  const role = mapRoleName(userInfo.roleName);

  // Lưu token
  localStorage.setItem('auth_token', accessToken);
  localStorage.setItem('refresh_token', refreshTokenValue);

  // Lưu thông tin user theo format tương thích với MockUser mà hệ thống đang dùng.
  // Các field bắt buộc: UserId, Role, FullName, Email, Status, MustChangePassword
  const compatibleUser = {
    UserId: String(userInfo.id),
    RoleId: role === 'ADMIN' ? 'ROL-001' : role === 'TEACHER' ? 'ROL-002' : 'ROL-003',
    Role: role,
    FullName: userInfo.fullName || userInfo.username || userInfo.email,
    Email: userInfo.email,
    PhoneNumber: userInfo.phone || '',
    Status: userInfo.isActive ? 'Active' : 'Inactive',
    MustChangePassword: false, // BE không trả field này; mặc định false sau khi login thật
    CreatedAt: '',
    UpdatedAt: '',
  };

  localStorage.setItem('current_user', JSON.stringify(compatibleUser));
  localStorage.setItem('user_role', role);

  return role;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLogin(): UseLoginReturn {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleSubmit = async (
    e: FormEvent,
    onSuccess: (role: LoginUserRole) => void
  ) => {
    e.preventDefault();
    setError(null);

    // ─── Validation phía client ──────────────────────────────────────────────
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Vui lòng nhập Email hoặc tên tài khoản của bạn.');
      return;
    }

    // Tự động append domain nếu user nhập tên tài khoản ngắn (không có @)
    const finalEmail = trimmedEmail.includes('@')
      ? trimmedEmail
      : `${trimmedEmail.toLowerCase()}@godotxr.com`;

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    // ─── Gọi API ─────────────────────────────────────────────────────────────
    setIsLoading(true);
    const result = await login(finalEmail, password);
    setIsLoading(false);

    if (!result.success || !result.data) {
      // Hiển thị message từ BE (đã được chuẩn hóa qua handleError trong authService)
      const errorMsg =
        result.errors.length > 0
          ? result.errors.join(' ')
          : result.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      setError(errorMsg);
      return;
    }

    const { accessToken, refreshToken, user } = result.data;

    if (!user) {
      setError('Không lấy được thông tin người dùng từ server. Vui lòng thử lại.');
      return;
    }

    // ─── Lưu session & chuyển hướng ──────────────────────────────────────────
    const role = persistSession(user, accessToken, refreshToken);
    onSuccess(role);
  };

  return {
    email,
    password,
    isLoading,
    error,
    setEmail,
    setPassword,
    clearError,
    handleSubmit,
  };
}
