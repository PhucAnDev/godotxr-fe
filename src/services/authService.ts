import { apiRequest, ApiError } from './apiClient';

interface LoginPayload {
  email: string;
  password: string;
}

interface RefreshTokenPayload {
  accessToken: string;
  refreshToken: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
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

export interface UserAuthInfo {
  id: number;
  email: string;
  fullName: string;
  username?: string;
  phone: string;
  roleName: string;
  isActive: boolean;
  mustChangePassword: boolean;
  avatar: string | null;
}

export interface TokenModel {
  accessToken: string;
  refreshToken: string;
  user?: UserAuthInfo;
}

export interface AuthServiceResult {
  success: boolean;
  message: string;
  errors: string[];
}

export interface LoginResult extends AuthServiceResult {
  data?: TokenModel;
}

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

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
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

export async function refreshToken(
  accessToken: string,
  refreshTokenValue: string
): Promise<LoginResult> {
  try {
    const payload: RefreshTokenPayload = {
      accessToken,
      refreshToken: refreshTokenValue,
    };
    const res = await apiRequest<TokenModel>(
      '/api/auth/refresh-token',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false
    );

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

export async function forgotPassword(
  email: string
): Promise<AuthServiceResult> {
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

export async function verifyOtp(
  email: string,
  otp: string
): Promise<AuthServiceResult> {
  try {
    const payload: VerifyOtpPayload = { email, otp };
    const res = await apiRequest<void>('/api/auth/verify-otp', {
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

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string
): Promise<AuthServiceResult> {
  try {
    const payload: ResetPasswordPayload = {
      email,
      otp,
      newPassword,
      confirmPassword,
    };
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
    const payload: ChangePasswordPayload = {
      email,
      password,
      newPassword,
      confirmPassword,
    };
    const res = await apiRequest<void>('/api/auth/change-password', {
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

export async function verifyEmail(token: string): Promise<AuthServiceResult> {
  try {
    const res = await apiRequest<void>(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
      },
      false
    );

    return {
      success: res.success,
      message: res.message,
      errors: res.errors ?? [],
    };
  } catch (err) {
    return handleError(err);
  }
}
