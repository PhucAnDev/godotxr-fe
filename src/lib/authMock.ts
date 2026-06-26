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
  let foundCurrentUser = false;
  const updatedUsers = users.map(u => {
    if (u.UserId === currentUser.UserId) {
      foundCurrentUser = true;
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

  const updatedCurrentUser = foundCurrentUser
    ? updatedUsers.find(u => u.UserId === currentUser.UserId) || null
    : {
        ...currentUser,
        Password: newPassword,
        MustChangePassword: false,
      };

  if (updatedCurrentUser) {
    setCurrentUser(updatedCurrentUser);
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

export interface Child {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Note: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
  ProgressLevel: 'Improving' | 'Stable' | 'Need Support';
  ClassId?: string;
}

const DEFAULT_CHILDREN: Child[] = [
  { 
    ChildId: 'CHD-001', 
    ParentUserId: 'USR-P1', 
    FullName: 'Nguyễn Tiến Minh (Leo)', 
    Age: 8, 
    Gender: 'Male', 
    LearningLevel: 'Bậc 1 - Phát âm đơn', 
    Note: 'Bé thông minh nhưng thỉnh thoảng mất tập trung giữa buổi chơi. Thích trò chơi Nông trại 3D. Cần hỗ trợ phụ âm trượt sóng.',
    Status: 'Active',
    ProgressLevel: 'Improving',
    CreatedAt: '2026-01-10',
    UpdatedAt: '2026-05-30',
    ClassId: 'CLS-801'
  },
  { 
    ChildId: 'CHD-002', 
    ParentUserId: 'USR-P2', 
    FullName: 'Trần Thảo Linh (Sophia)', 
    Age: 9, 
    Gender: 'Female', 
    LearningLevel: 'Bậc 2 - Âm đôi ghép từ', 
    Note: 'Phản xạ phát âm nhạy bén, lực hơi khá tốt. Thỉnh thoảng bị mỏi hàm khi uốn cụm âm kép ngắn.',
    Status: 'Active',
    ProgressLevel: 'Stable',
    CreatedAt: '2026-01-12',
    UpdatedAt: '2026-05-29',
    ClassId: 'CLS-802'
  },
  { 
    ChildId: 'CHD-003', 
    ParentUserId: 'USR-P3', 
    FullName: 'Phạm Minh Khang', 
    Age: 7, 
    Gender: 'Male', 
    LearningLevel: 'Bậc 1 - Sửa ngọng S', 
    Note: 'Bé rụt rè trước micro mộc. Phát hơi dẹt lưỡi, đặc biệt là dải âm gió S và X. Điểm luyện tập gần đây thấp, cần giáo viên hỗ trợ thêm.',
    Status: 'Active',
    ProgressLevel: 'Need Support',
    CreatedAt: '2026-02-15',
    UpdatedAt: '2026-05-28',
    ClassId: 'CLS-801'
  },
  { 
    ChildId: 'CHD-004', 
    ParentUserId: 'USR-P4', 
    FullName: 'Hoàng Anh Thư', 
    Age: 10, 
    Gender: 'Female', 
    LearningLevel: 'Bậc 2 - Ghép vần', 
    Note: 'Phát âm tròn chữ nhưng âm lượng tương đối nhỏ. Họng khỏe nhưng lưỡi hơi thụ động về sau.',
    Status: 'Active',
    ProgressLevel: 'Stable',
    CreatedAt: '2026-02-20',
    UpdatedAt: '2026-05-31',
    ClassId: 'CLS-803'
  }
];

export function getStoredChildren(): Child[] {
  const data = localStorage.getItem('godot_children');
  if (!data) {
    localStorage.setItem('godot_children', JSON.stringify(DEFAULT_CHILDREN));
    return DEFAULT_CHILDREN;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_CHILDREN;
  }
}

export function saveStoredChildren(children: Child[]) {
  localStorage.setItem('godot_children', JSON.stringify(children));
}
