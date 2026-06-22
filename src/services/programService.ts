import { apiRequest } from './apiClient';
import { fromError, fromResponse, type PagedResponse, type ServiceResult } from './serviceTypes';

export interface ProgramResponse {
  id: number;
  programName: string;
  description: string | null;
  targetAgeFrom: number;
  targetAgeTo: number;
  language: 'Vietnamese' | 'English';
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string | null;
  lessons: Array<{ id: number; lessonName: string; lessonOrder: number }>;
}

export type ProgramPayload = Pick<ProgramResponse, 'programName' | 'description' | 'targetAgeFrom' | 'targetAgeTo' | 'language' | 'status'>;

async function request<T>(endpoint: string, options?: RequestInit): Promise<ServiceResult<T>> {
  try { return fromResponse(await apiRequest<T>(endpoint, options)); }
  catch (error) { return fromError(error); }
}

export const getPrograms = (pageNumber = 1, pageSize = 100) =>
  request<PagedResponse<ProgramResponse>>(`/api/programs?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const createProgram = (payload: ProgramPayload) =>
  request<ProgramResponse>('/api/programs', { method: 'POST', body: JSON.stringify(payload) });
export const updateProgram = (id: number, payload: ProgramPayload) =>
  request<ProgramResponse>(`/api/programs/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteProgram = (id: number) =>
  request<boolean>(`/api/programs/${id}`, { method: 'DELETE' });
