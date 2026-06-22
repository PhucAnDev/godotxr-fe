import { apiRequest } from './apiClient';
import { fromError, fromResponse, type PagedResponse, type ServiceResult } from './serviceTypes';
export interface SemesterResponse { id: number; semesterName: string; schoolYearId: number; schoolYearName: string; teacherId: number; teacherName: string; classCount: number; description: string | null; startDate: string; endDate: string; status: 'Active' | 'Upcoming' | 'Completed'; classroomCount: number; createdAt: string; updatedAt: string | null; }
export type SemesterPayload = Pick<SemesterResponse, 'semesterName' | 'schoolYearId' | 'teacherId' | 'classCount' | 'description' | 'startDate' | 'endDate' | 'status'>;
async function request<T>(endpoint: string, options?: RequestInit): Promise<ServiceResult<T>> { try { return fromResponse(await apiRequest<T>(endpoint, options)); } catch (error) { return fromError(error); } }
export const getSemesters = (pageNumber = 1, pageSize = 100) => request<PagedResponse<SemesterResponse>>(`/api/semesters?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const createSemester = (payload: SemesterPayload) => request<SemesterResponse>('/api/semesters', { method: 'POST', body: JSON.stringify(payload) });
export const updateSemester = (id: number, payload: SemesterPayload) => request<SemesterResponse>(`/api/semesters/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteSemester = (id: number) => request<boolean>(`/api/semesters/${id}`, { method: 'DELETE' });
