import { apiRequest } from './apiClient';
import {
  fromError,
  fromResponse,
  type PagedResponse,
  type ServiceResult,
} from './serviceTypes';

export interface ExerciseResponse {
  id: number;
  teacherId: number;
  lessonId: number;
  typeId: number;
  exerciseName: string;
  instruction: string | null;
  difficultyLevel: string;
  targetSkill: string;
  language: string;
  durationLimit: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string | null;
}

export type ExercisePayload = Pick<
  ExerciseResponse,
  | 'teacherId'
  | 'lessonId'
  | 'typeId'
  | 'exerciseName'
  | 'instruction'
  | 'difficultyLevel'
  | 'targetSkill'
  | 'language'
  | 'durationLimit'
  | 'status'
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

export const getExercises = (pageNumber = 1, pageSize = 100) =>
  request<PagedResponse<ExerciseResponse>>(
    `/api/exercises?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

export const getExerciseById = (id: number) =>
  request<ExerciseResponse>(`/api/exercises/${id}`);

export const createExercise = (payload: ExercisePayload) =>
  request<ExerciseResponse>('/api/exercises', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateExercise = (id: number, payload: ExercisePayload) =>
  request<ExerciseResponse>(`/api/exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteExercise = (id: number) =>
  request<boolean>(`/api/exercises/${id}`, { method: 'DELETE' });
