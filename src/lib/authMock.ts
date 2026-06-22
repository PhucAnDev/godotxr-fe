/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MockUser {
  UserId: string;
  RoleId: 'ROL-001' | 'ROL-002' | 'ROL-003';
  Role: 'ADMIN' | 'TEACHER' | 'PARENT';
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Gender?: 'Male' | 'Female' | 'Other';
  Specialty?: string;
  Status: 'Active' | 'Inactive' | 'Locked';
  MustChangePassword: boolean;
  Password: string;
  CreatedAt: string;
  UpdatedAt: string;
}

const DEFAULT_USERS: MockUser[] = [
  {
    UserId: 'USR-001',
    RoleId: 'ROL-001',
    Role: 'ADMIN',
    FullName: 'Nguyễn Văn Minh (Admin)',
    Email: 'admin@godotxr.com',
    PhoneNumber: '0912345678',
    Gender: 'Male',
    Status: 'Active',
    MustChangePassword: false,
    Password: 'admin12345',
    CreatedAt: '2026-01-10 08:30',
    UpdatedAt: '2026-05-15 14:20'
  },
  {
    UserId: 'USR-002',
    RoleId: 'ROL-002',
    Role: 'TEACHER',
    FullName: 'Trần Thị Hồng (Ms. Johnson)',
    Email: 'teacher@godotxr.com',
    PhoneNumber: '0987654321',
    Gender: 'Female',
    Specialty: 'Âm học & Ngữ âm mầm non',
    Status: 'Active',
    MustChangePassword: true,
    Password: 'teacher123',
    CreatedAt: '2026-02-15 09:15',
    UpdatedAt: '2026-05-20 10:30'
  },
  {
    UserId: 'USR-003',
    RoleId: 'ROL-003',
    Role: 'PARENT',
    FullName: 'Phạm Minh Anh (Phụ Huynh)',
    Email: 'parent@godotxr.com',
    PhoneNumber: '0901234567',
    Gender: 'Male',
    Status: 'Active',
    MustChangePassword: true,
    Password: 'parent123',
    CreatedAt: '2026-05-18 10:25',
    UpdatedAt: '2026-05-28 11:15'
  }
];

// Helper functions for storage
export function getStoredUsers(): MockUser[] {
  const usersStr = localStorage.getItem('godot_users');
  if (!usersStr) {
    localStorage.setItem('godot_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(usersStr);
  } catch (error) {
    console.error('Error loading users', error);
    localStorage.setItem('godot_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: MockUser[]): void {
  localStorage.setItem('godot_users', JSON.stringify(users));
}

export function getCurrentUser(): MockUser | null {
  const userStr = localStorage.getItem('current_user');
  if (!userStr) return null;
  try {
    const parsed = JSON.parse(userStr);
    // Dynamic look up to get latest data
    const allUsers = getStoredUsers();
    const updated = allUsers.find(u => u.UserId === parsed.UserId);
    return updated || parsed;
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user: MockUser | null): void {
  if (user) {
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('user_role', user.Role);
  } else {
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_role');
  }
}

export function updateCurrentUserPassword(newPassword: string): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  const users = getStoredUsers();
  const updatedUsers = users.map(u => {
    if (u.UserId === currentUser.UserId) {
      return {
        ...u,
        Password: newPassword,
        MustChangePassword: false,
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
    }
    return u;
  });

  saveStoredUsers(updatedUsers);

  // Update current user cached copy
  const updatedMe = updatedUsers.find(u => u.UserId === currentUser.UserId);
  if (updatedMe) {
    setCurrentUser(updatedMe);
  }
  return true;
}

export function mockLogin(email: string, password: string, fallbackRole?: 'PARENT' | 'TEACHER' | 'ADMIN'): { success: boolean; user?: MockUser; message?: string } {
  const users = getStoredUsers();
  const trimmedEmail = email.trim();
  let user = users.find(u => u.Email.toLowerCase() === trimmedEmail.toLowerCase());

  if (!user) {
    // Dynamically create a user on-the-fly to allow anyone to log in
    const role = fallbackRole || 'PARENT';
    const roleId = role === 'ADMIN' ? 'ROL-001' : (role === 'TEACHER' ? 'ROL-002' : 'ROL-003');

    // Create a beautiful name
    const emailName = trimmedEmail.split('@')[0];
    const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    const roleLabel = role === 'ADMIN' ? 'Admin' : (role === 'TEACHER' ? 'Giáo viên' : 'Phụ huynh');
    const fullName = `${capitalizedName} (${roleLabel})`;

    user = {
      UserId: `USR-${Date.now()}`,
      RoleId: roleId,
      Role: role,
      FullName: fullName,
      Email: trimmedEmail.toLowerCase(),
      PhoneNumber: '0901234567',
      Gender: 'Male',
      Status: 'Active',
      MustChangePassword: true, // Keep first login change password flow active for representation
      Password: password,
      CreatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    const updatedUsers = [...users, user];
    saveStoredUsers(updatedUsers);
  } else {
    // If the user already exists, update their password on storage to match what they typed 
    // to guarantee they can log in successfully with ANY password and proceed with change-password flow
    // if MustChangePassword is still true.
    user.Password = password;
    user.Status = 'Active'; // Keep status always active for login flexibility

    const updatedUsers = users.map(u => {
      if (u.UserId === user!.UserId) {
        return { ...user! };
      }
      return u;
    });
    saveStoredUsers(updatedUsers);
  }

  setCurrentUser(user);
  return { success: true, user };
}

export function mockLogout(): void {
  setCurrentUser(null);
}
