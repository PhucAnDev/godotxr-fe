import type { UserAuthInfo } from '../services/authService';

export type SessionRole = 'ADMIN' | 'TEACHER' | 'PARENT';

export interface SessionUser {
  UserId: string;
  RoleId: 'ROL-001' | 'ROL-002' | 'ROL-003';
  Role: SessionRole;
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Gender?: 'Male' | 'Female' | 'Other';
  Specialty?: string;
  Status: 'Active' | 'Inactive' | 'Locked';
  MustChangePassword: boolean;
  Password: string;
  Avatar: string | null;
  CreatedAt: string;
  UpdatedAt: string;
}

function mapRoleName(roleName: string): SessionRole {
  const normalized = roleName.trim().toLowerCase();

  if (normalized === 'admin') return 'ADMIN';
  if (normalized === 'teacher') return 'TEACHER';
  return 'PARENT';
}

function mapRoleId(role: SessionRole): SessionUser['RoleId'] {
  if (role === 'ADMIN') return 'ROL-001';
  if (role === 'TEACHER') return 'ROL-002';
  return 'ROL-003';
}

export function buildSessionUser(userInfo: UserAuthInfo): SessionUser {
  const role = mapRoleName(userInfo.roleName);

  return {
    UserId: String(userInfo.id),
    RoleId: mapRoleId(role),
    Role: role,
    FullName: userInfo.fullName || userInfo.username || userInfo.email,
    Email: userInfo.email,
    PhoneNumber: userInfo.phone || '',
    Status: userInfo.isActive ? 'Active' : 'Inactive',
    MustChangePassword: userInfo.mustChangePassword,
    Password: '',
    Avatar: userInfo.avatar || null,
    CreatedAt: '',
    UpdatedAt: '',
  };
}

export function getSessionUser(): SessionUser | null {
  const raw = localStorage.getItem('current_user');

  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function getSessionRole(): SessionRole | null {
  const role = localStorage.getItem('user_role');

  if (role === 'ADMIN' || role === 'TEACHER' || role === 'PARENT') {
    return role;
  }

  return null;
}

export function setSessionUser(user: SessionUser | null) {
  if (!user) {
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_role');
    return;
  }

  localStorage.setItem('current_user', JSON.stringify(user));
  localStorage.setItem('user_role', user.Role);
}

export function persistAuthSession(
  userInfo: UserAuthInfo,
  accessToken: string,
  refreshToken: string
): SessionRole {
  const sessionUser = buildSessionUser(userInfo);

  localStorage.setItem('auth_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  setSessionUser(sessionUser);

  return sessionUser.Role;
}

export function clearSession() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('current_user');
  localStorage.removeItem('user_role');
}
