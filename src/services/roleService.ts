import { apiRequest, ApiError } from './apiClient';

// ─── Types khớp với BE DTOs ───────────────────────────────────────────────────

/** Khớp với BE RoleResponse */
export interface RoleResponse {
  id: number;
  roleName: string;
  description: string;
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

/**
 * Enum khớp với BE UserRole enum.
 * BE chỉ chấp nhận các giá trị cố định này cho RoleName khi Create.
 */
export type UserRoleEnum = 'Admin' | 'Teacher' | 'Parent' | 'Child';

/** Khớp với BE CreateRoleRequest */
export interface CreateRolePayload {
  roleName: UserRoleEnum;
  description: string;
}

/** Khớp với BE UpdateRoleRequest (tất cả optional) */
export interface UpdateRolePayload {
  roleName?: UserRoleEnum;
  description?: string;
  isActive?: boolean;
}

// ─── Kết quả trả về chuẩn hóa cho component ──────────────────────────────────

export interface RoleServiceResult<T = void> {
  success: boolean;
  message: string;
  errors: string[];
  data?: T;
}

// ─── Helper xử lý lỗi ────────────────────────────────────────────────────────

function handleError<T>(err: unknown): RoleServiceResult<T> {
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
 * Lấy danh sách role (có phân trang).
 * GET /api/role?pageNumber=1&pageSize=100
 */
export async function getRoles(
  pageNumber = 1,
  pageSize = 100
): Promise<RoleServiceResult<PagedResponse<RoleResponse>>> {
  try {
    const res = await apiRequest<PagedResponse<RoleResponse>>(
      `/api/roles?pageNumber=${pageNumber}&pageSize=${pageSize}`
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
 * Lấy chi tiết 1 role.
 * GET /api/role/{id}
 */
export async function getRoleById(
  id: number
): Promise<RoleServiceResult<RoleResponse>> {
  try {
    const res = await apiRequest<RoleResponse>(`/api/roles/${id}`);
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
 * Tạo role mới.
 * POST /api/role
 * Body: { roleName: UserRoleEnum, description: string }
 */
export async function createRole(
  payload: CreateRolePayload
): Promise<RoleServiceResult<RoleResponse>> {
  try {
    const res = await apiRequest<RoleResponse>('/api/roles', {
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
 * Cập nhật role (tên, mô tả, trạng thái).
 * PUT /api/role/{id}
 * Body: { roleName?, description?, isActive? }
 */
export async function updateRole(
  id: number,
  payload: UpdateRolePayload
): Promise<RoleServiceResult<RoleResponse>> {
  try {
    const res = await apiRequest<RoleResponse>(`/api/roles/${id}`, {
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
 * Xóa role.
 * DELETE /api/role/{id}
 */
export async function deleteRole(
  id: number
): Promise<RoleServiceResult<boolean>> {
  try {
    const res = await apiRequest<boolean>(`/api/roles/${id}`, {
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
