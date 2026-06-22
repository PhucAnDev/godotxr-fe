import { useState } from 'react';
import type { FormEvent } from 'react';
import { login } from '../services/authService';
import type { UserAuthInfo } from '../services/authService';

export type LoginUserRole = 'PARENT' | 'TEACHER' | 'ADMIN';

export interface UseLoginReturn {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  clearError: () => void;
  handleSubmit: (
    e: FormEvent,
    onSuccess: (role: LoginUserRole) => void
  ) => Promise<void>;
}

function mapRoleName(roleName: string): LoginUserRole {
  const normalized = roleName.trim().toLowerCase();

  if (normalized === 'admin') return 'ADMIN';
  if (normalized === 'teacher') return 'TEACHER';
  return 'PARENT';
}

function persistSession(
  userInfo: UserAuthInfo,
  accessToken: string,
  refreshTokenValue: string
): LoginUserRole {
  const role = mapRoleName(userInfo.roleName);

  localStorage.setItem('auth_token', accessToken);
  localStorage.setItem('refresh_token', refreshTokenValue);

  const compatibleUser = {
    UserId: String(userInfo.id),
    RoleId:
      role === 'ADMIN'
        ? 'ROL-001'
        : role === 'TEACHER'
          ? 'ROL-002'
          : 'ROL-003',
    Role: role,
    FullName: userInfo.fullName || userInfo.username || userInfo.email,
    Email: userInfo.email,
    PhoneNumber: userInfo.phone || '',
    Status: userInfo.isActive ? 'Active' : 'Inactive',
    MustChangePassword: userInfo.mustChangePassword,
    Password: '',
    CreatedAt: '',
    UpdatedAt: '',
  };

  localStorage.setItem('current_user', JSON.stringify(compatibleUser));
  localStorage.setItem('user_role', role);

  return role;
}

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

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Vui lòng nhập email đăng nhập.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Vui lòng nhập đúng địa chỉ email đã đăng ký.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);
    const result = await login(trimmedEmail, password);
    setIsLoading(false);

    if (!result.success || !result.data) {
      const errorMsg =
        result.errors.length > 0
          ? result.errors.join(' ')
          : result.message || 'Đăng nhập không thành công. Vui lòng thử lại.';
      setError(errorMsg);
      return;
    }

    const { accessToken, refreshToken, user } = result.data;

    if (!user) {
      setError('Không lấy được thông tin tài khoản từ hệ thống.');
      return;
    }

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
