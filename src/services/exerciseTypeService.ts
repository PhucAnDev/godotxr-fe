import { apiRequest } from './apiClient';
import {
  fromError,
  fromResponse,
  type PagedResponse,
  type ServiceResult,
} from './serviceTypes';

export interface ExerciseTypeResponse {
  id: number;
  typeName: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export type ExerciseTypePayload = Pick<
  ExerciseTypeResponse,
  'typeName' | 'description' | 'isActive'
>;

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ServiceResult<T>> {
  try {
    return fromResponse(await apiRequest<T>(endpoint, options));
  } catch (error) {
    return fromError(error);
  }
}

export const getExerciseTypes = (pageNumber = 1, pageSize = 100) =>
  request<PagedResponse<ExerciseTypeResponse>>(
    `/api/exercise-types?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

export const getExerciseTypeById = (id: number) =>
  request<ExerciseTypeResponse>(`/api/exercise-types/${id}`);

export const createExerciseType = (payload: ExerciseTypePayload) =>
  request<ExerciseTypeResponse>('/api/exercise-types', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateExerciseType = (id: number, payload: ExerciseTypePayload) =>
  request<ExerciseTypeResponse>(`/api/exercise-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteExerciseType = (id: number) =>
  request<boolean>(`/api/exercise-types/${id}`, { method: 'DELETE' });
