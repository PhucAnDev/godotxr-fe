import { apiRequest } from './apiClient';
import { fromError, fromResponse, type PagedResponse, type ServiceResult } from './serviceTypes';
export interface ClassroomResponse { id: number; userId: number; teacherName: string; teacherSpecialty: string; programId: number; programName: string; programLanguage: string; targetAgeFrom: number; targetAgeTo: number; semesterId: number; semesterName: string; className: string; description: string | null; startDate: string; endDate: string; status: string; enrollmentCount: number; createdAt: string; updatedAt: string | null; }
export interface ClassroomPayload { userId: number; programId: number; semesterId: number; className: string; description: string | null; startDate: string; endDate: string; status: string; }
async function request<T>(endpoint: string, options?: RequestInit): Promise<ServiceResult<T>> { try { return fromResponse(await apiRequest<T>(endpoint, options)); } catch (error) { return fromError(error); } }
export const getClassrooms = (pageNumber = 1, pageSize = 100) => request<PagedResponse<ClassroomResponse>>(`/api/classrooms?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getClassroomById = (id: number) => request<ClassroomResponse>(`/api/classrooms/${id}`);
export const createClassroom = (payload: ClassroomPayload) => request<ClassroomResponse>('/api/classrooms', { method: 'POST', body: JSON.stringify(payload) });
export const updateClassroom = (id: number, payload: ClassroomPayload) => request<ClassroomResponse>(`/api/classrooms/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteClassroom = (id: number) => request<boolean>(`/api/classrooms/${id}`, { method: 'DELETE' });
