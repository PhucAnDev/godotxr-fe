import { apiRequest, ApiError } from './apiClient';

// ─── Request types (khớp với BE DTOs) ────────────────────────────────────────

interface LoginPayload {
  email: string;
  password: string;
}

interface RefreshTokenPayload {
  refreshToken: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordPayload {
  email: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Response types (khớp với BE TokenModel) ─────────────────────────────────

export interface UserAuthInfo {
  id: number;
  email: string;
  fullName: string;
  username: string;
  phone: string;
  roleName: string;
  isActive: boolean;
}

export interface TokenModel {
  accessToken: string;
  refreshToken: string;
  user?: UserAuthInfo;
}

// ─── Response shape ───────────────────────────────────────────────────────────

export interface AuthServiceResult {
  success: boolean;
  /** Message hiển thị cho user */
  message: string;
  /** Danh sách lỗi chi tiết (nếu có) */
  errors: string[];
}

// ─── Helper: chuẩn hóa lỗi bất kỳ thành AuthServiceResult ───────────────────

function handleError(err: unknown): AuthServiceResult {
  if (err instanceof ApiError) {
    return {
      success: false,
      message: err.message,
      errors: err.errors,
    };
  }
  return {
    success: false,
    message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    errors: [],
  };
}

// ─── Auth API functions ───────────────────────────────────────────────────────

/**
 * Đăng nhập – POST /api/auth/login
 * Trả về token + thông tin user nếu thành công.
 */
export interface LoginResult {
  success: boolean;
  message: string;
  errors: string[];
  data?: TokenModel;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const payload: LoginPayload = { email, password };
    const res = await apiRequest<TokenModel>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      success: res.success,
      message: res.message,
      errors: res.errors ?? [],
      data: res.data,
    };
  } catch (err) {
    return { ...handleError(err), data: undefined };
  }
}

/**
 * Làm mới access token – POST /api/auth/refresh-token
 */
export async function refreshToken(token: string): Promise<LoginResult> {
  try {
    const payload: RefreshTokenPayload = { refreshToken: token };
    const res = await apiRequest<TokenModel>('/api/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      success: res.success,
      message: res.message,
      errors: res.errors ?? [],
      data: res.data,
    };
  } catch (err) {
    return { ...handleError(err), data: undefined };
  }
}

/**
 * Bước 1 – Gửi OTP về email
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(email: string): Promise<AuthServiceResult> {
  try {
    const payload: ForgotPasswordPayload = { email };
    const res = await apiRequest<void>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      success: res.success,
      message: res.message,
      errors: res.errors ?? [],
    };
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Bước 3 – Xác thực OTP + đặt mật khẩu mới cùng một lúc
 * POST /api/auth/reset-password
 */
export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string
): Promise<AuthServiceResult> {
  try {
    const payload: ResetPasswordPayload = { email, otp, newPassword, confirmPassword };
    const res = await apiRequest<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      success: res.success,
      message: res.message,
      errors: res.errors ?? [],
    };
  } catch (err) {
    return handleError(err);
  }
}

export async function changePassword(
  email: string,
  password: string,
  newPassword: string,
  confirmPassword: string
): Promise<AuthServiceResult> {
  try {
    const payload: ChangePasswordPayload = { email, password, newPassword, confirmPassword };
    const res = await apiRequest<void>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: res.success, message: res.message, errors: res.errors ?? [] };
  } catch (err) {
    return handleError(err);
  }
}
