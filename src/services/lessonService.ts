import { apiRequest } from './apiClient';
import { fromError, fromResponse, type PagedResponse, type ServiceResult } from './serviceTypes';

export interface LessonResponse {
  id: number;
  programId: number;
  lessonName: string;
  lessonOrder: number;
  description: string | null;
  targetSkill: string | null;
  estimatedDuration: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string | null;
}
export type CreateLessonPayload = Omit<LessonResponse, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLessonPayload = Omit<CreateLessonPayload, 'programId'>;

async function request<T>(endpoint: string, options?: RequestInit): Promise<ServiceResult<T>> {
  try { return fromResponse(await apiRequest<T>(endpoint, options)); }
  catch (error) { return fromError(error); }
}
export const getLessons = (pageNumber = 1, pageSize = 100) =>
  request<PagedResponse<LessonResponse>>(`/api/lessons?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getLessonsByProgram = (programId: number) => request<LessonResponse[]>(`/api/lessons/program/${programId}`);
export const createLesson = (payload: CreateLessonPayload) => request<LessonResponse>('/api/lessons', { method: 'POST', body: JSON.stringify(payload) });
export const updateLesson = (id: number, payload: UpdateLessonPayload) => request<LessonResponse>(`/api/lessons/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteLesson = (id: number) => request<boolean>(`/api/lessons/${id}`, { method: 'DELETE' });
