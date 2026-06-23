import { apiRequest } from './apiClient';
import { fromError, fromResponse, type PagedResponse, type ServiceResult } from './serviceTypes';

export interface SchoolYearResponse { id: number; yearName: string; startDate: string; endDate: string; status: 'Active' | 'Upcoming' | 'Completed'; classCount: number; semesterCount: number; createdAt: string; updatedAt: string | null; }
export type SchoolYearPayload = Pick<SchoolYearResponse, 'yearName' | 'startDate' | 'endDate' | 'status'>;
async function request<T>(endpoint: string, options?: RequestInit): Promise<ServiceResult<T>> { try { return fromResponse(await apiRequest<T>(endpoint, options)); } catch (error) { return fromError(error); } }
export const getSchoolYears = (pageNumber = 1, pageSize = 100, status = '', search = '') => request<PagedResponse<SchoolYearResponse>>(`/api/school-years?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`);
export const createSchoolYear = (payload: SchoolYearPayload) => request<SchoolYearResponse>('/api/school-years', { method: 'POST', body: JSON.stringify(payload) });
export const updateSchoolYear = (id: number, payload: SchoolYearPayload) => request<SchoolYearResponse>(`/api/school-years/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteSchoolYear = (id: number) => request<boolean>(`/api/school-years/${id}`, { method: 'DELETE' });
export const setActiveSchoolYear = (id: number) => request<SchoolYearResponse>(`/api/school-years/${id}/set-active`, { method: 'PATCH' });
