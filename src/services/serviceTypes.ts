import { ApiError, type ApiResponse } from './apiClient';

export interface PagedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
}

export interface ServiceResult<T = void> {
  success: boolean;
  message: string;
  errors: string[];
  data?: T;
}

export function fromResponse<T>(response: ApiResponse<T>): ServiceResult<T> {
  return {
    success: response.success,
    message: response.message,
    errors: response.errors ?? [],
    data: response.data,
  };
}

export function fromError<T>(error: unknown): ServiceResult<T> {
  if (error instanceof ApiError) {
    return { success: false, message: error.message, errors: error.errors };
  }
  return {
    success: false,
    message: 'Da xay ra loi khong xac dinh. Vui long thu lai.',
    errors: [],
  };
}
