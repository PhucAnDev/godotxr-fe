import type { UserRole } from './auth';
import type { Status } from './common';

export type UserSummary = {
  UserId: string;
  FullName: string;
  Email: string;
  Role: UserRole;
  Status: Status;
};
