import { apiRequest, ApiError } from './apiClient';

// ─── Types khớp với BE DTOs ───────────────────────────────────────────────────

/** Khớp với BE UserResponse */
export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string; // "Admin" | "Teacher" | "Parent" | "Child"
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

/** Khớp với BE PagedResponse<T> */
export interface PagedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
}

/** Enum khớp với BE UserRole enum */
export type UserRoleEnum = 'Admin' | 'Teacher' | 'Parent' | 'Child';

/** Khớp với BE CreateUserRequest */
export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
  roleName: UserRoleEnum;
}

/** Khớp với BE UpdateUserRequest (tất cả optional) */
export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  roleName?: UserRoleEnum;
  isActive?: boolean;
}

// ─── Kết quả trả về chuẩn hóa cho component ──────────────────────────────────

export interface UserServiceResult<T = void> {
  success: boolean;
  message: string;
  errors: string[];
  data?: T;
}

// ─── Helper xử lý lỗi ────────────────────────────────────────────────────────

function handleError<T>(err: unknown): UserServiceResult<T> {
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

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Lấy danh sách user (có phân trang).
 * GET /api/user?pageNumber=1&pageSize=10
 */
export async function getUsers(
  pageNumber = 1,
  pageSize = 10
): Promise<UserServiceResult<PagedResponse<UserResponse>>> {
  try {
    const res = await apiRequest<PagedResponse<UserResponse>>(
      `/api/user?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return {
      success: res.success,
      message: res.message,
      errors: res.errors ?? [],
      data: res.data,
    };
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Lấy chi tiết 1 user.
 * GET /api/user/{id}
 */
export async function getUserById(
  id: number
): Promise<UserServiceResult<UserResponse>> {
  try {
    const res = await apiRequest<UserResponse>(`/api/user/${id}`);
    return {
      success: res.success,
      message: res.message,
      errors: res.errors ?? [],
      data: res.data,
    };
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Tạo user mới.
 * POST /api/user
 * Body: { username, password, fullName, email, phone?, roleName }
 */
export async function createUser(
  payload: CreateUserPayload
): Promise<UserServiceResult<UserResponse>> {
  try {
    const res = await apiRequest<UserResponse>('/api/user', {
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
    return handleError(err);
  }
}

/**
 * Cập nhật user.
 * PUT /api/user/{id}
 * Body: { fullName?, email?, phone?, roleName?, isActive? }
 */
export async function updateUser(
  id: number,
  payload: UpdateUserPayload
): Promise<UserServiceResult<UserResponse>> {
  try {
    const res = await apiRequest<UserResponse>(`/api/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return {
      success: res.success,
      message: res.message,
      errors: res.errors ?? [],
      data: res.data,
    };
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Xóa user.
 * DELETE /api/user/{id}
 */
export async function deleteUser(
  id: number
): Promise<UserServiceResult<boolean>> {
  try {
    const res = await apiRequest<boolean>(`/api/user/${id}`, {
      method: 'DELETE',
    });
    return {
      success: res.success,
      message: res.message,
      errors: res.errors ?? [],
      data: res.data,
    };
  } catch (err) {
    return handleError(err);
  }
}
