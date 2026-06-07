import { Navigate } from 'react-router-dom';
import FirstLoginChangePasswordView from '../features/auth/FirstLoginChangePasswordView';
import { getCurrentUser } from '../lib/authMock';
import type { UserRole } from './navigation';

export function getRoleHomePath(role: UserRole) {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'TEACHER') return '/teacher/dashboard';
  return '/parent/dashboard';
}

export function getAuthenticatedRedirect(userRole: UserRole | null, allowedRole: UserRole) {
  const currentUser = getCurrentUser();

  if (!userRole || !currentUser) {
    return '/login';
  }

  if (currentUser.MustChangePassword) {
    return '/change-password';
  }

  if (userRole !== allowedRole) {
    return getRoleHomePath(userRole);
  }

  return null;
}

export function RegisterRedirect() {
  return <Navigate to="/login" replace />;
}

export function ChangePasswordRoute({
  onSuccess,
  onLogout,
}: {
  onSuccess: () => void;
  onLogout: () => void;
}) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.MustChangePassword) {
    return <Navigate to={getRoleHomePath(currentUser.Role)} replace />;
  }

  return (
    <FirstLoginChangePasswordView
      onSuccess={onSuccess}
      onLogout={onLogout}
    />
  );
}
