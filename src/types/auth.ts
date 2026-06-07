export type UserRole = 'ADMIN' | 'TEACHER' | 'PARENT';

export type MockUser = {
  UserId: string;
  RoleId: string;
  Role: UserRole;
  FullName: string;
  Email: string;
  Password: string;
  PhoneNumber?: string;
  Gender?: string;
  Status: string;
  MustChangePassword: boolean;
  Specialty?: string;
};
