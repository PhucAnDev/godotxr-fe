import { ApiError, apiRequest } from './apiClient';

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string;
  isActive: boolean;
  gender: string;
  specialty: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PagedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
}

export type UserRoleEnum = 'Admin' | 'Teacher' | 'Parent' | 'Child';
export type UserGender = 'Male' | 'Female' | 'Other';

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
  gender: UserGender;
  specialty: string;
  roleName: UserRoleEnum;
}

export interface CreateAccountPayload {
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  gender: UserGender;
  specialty: string;
  roleName: UserRoleEnum;
}

export interface CreateAccountResponse {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  roleName: string;
  message: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  roleName?: UserRoleEnum;
  isActive?: boolean;
  gender?: UserGender;
  specialty?: string;
}

export interface UserServiceResult<T = void> {
  success: boolean;
  message: string;
  errors: string[];
  data?: T;
}

function handleError<T>(error: unknown): UserServiceResult<T> {
  if (error instanceof ApiError) {
    return {
      success: false,
      message: error.message,
      errors: error.errors,
    };
  }

  return {
    success: false,
    message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    errors: [],
  };
}

export async function getUsers(
  pageNumber = 1,
  pageSize = 10
): Promise<UserServiceResult<PagedResponse<UserResponse>>> {
  try {
    const response = await apiRequest<PagedResponse<UserResponse>>(
      `/api/users?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );

    return {
      success: response.success,
      message: response.message,
      errors: response.errors ?? [],
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getUserById(
  id: number
): Promise<UserServiceResult<UserResponse>> {
  try {
    const response = await apiRequest<UserResponse>(`/api/users/${id}`);

    return {
      success: response.success,
      message: response.message,
      errors: response.errors ?? [],
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function createUser(
  payload: CreateUserPayload
): Promise<UserServiceResult<UserResponse>> {
  try {
    const response = await apiRequest<UserResponse>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      success: response.success,
      message: response.message,
      errors: response.errors ?? [],
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function createAccount(
  payload: CreateAccountPayload
): Promise<UserServiceResult<CreateAccountResponse>> {
  try {
    const response = await apiRequest<CreateAccountResponse>(
      '/api/users/create-account',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    return {
      success: response.success,
      message: response.message,
      errors: response.errors ?? [],
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateUser(
  id: number,
  payload: UpdateUserPayload
): Promise<UserServiceResult<UserResponse>> {
  try {
    const response = await apiRequest<UserResponse>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return {
      success: response.success,
      message: response.message,
      errors: response.errors ?? [],
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteUser(
  id: number
): Promise<UserServiceResult<boolean>> {
  try {
    const response = await apiRequest<boolean>(`/api/users/${id}`, {
      method: 'DELETE',
    });

    return {
      success: response.success,
      message: response.message,
      errors: response.errors ?? [],
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
}
