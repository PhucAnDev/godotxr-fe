import { apiRequest } from './apiClient';
import { fromError, fromResponse, type PagedResponse, type ServiceResult } from './serviceTypes';
export interface EnrollmentResponse { id: number; childId: number; childFullName: string; childLearningLevel: string; classId: number; className: string; enrollmentDate: string; status: string; createdAt: string; updatedAt: string; }
export interface EnrollmentPayload { childId: number; classId: number; enrollmentDate: string; status: string; }
async function request<T>(endpoint: string, options?: RequestInit): Promise<ServiceResult<T>> { try { return fromResponse(await apiRequest<T>(endpoint, options)); } catch (error) { return fromError(error); } }
export const getEnrollments = (pageNumber = 1, pageSize = 100) => request<PagedResponse<EnrollmentResponse>>(`/api/enrollments?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getEnrollmentById = (id: number) => request<EnrollmentResponse>(`/api/enrollments/${id}`);
export const getEnrollmentsByChild = (childId: number) => request<EnrollmentResponse[]>(`/api/enrollments/child/${childId}`);
export const createEnrollment = (payload: EnrollmentPayload) => request<EnrollmentResponse>('/api/enrollments', { method: 'POST', body: JSON.stringify(payload) });
export const updateEnrollment = (id: number, payload: EnrollmentPayload) => request<EnrollmentResponse>(`/api/enrollments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteEnrollment = (id: number) => request<boolean>(`/api/enrollments/${id}`, { method: 'DELETE' });
export const transferEnrollment = (id: number, newClassId: number) => request<EnrollmentResponse>(`/api/enrollments/${id}/transfer`, { method: 'PUT', body: JSON.stringify({ newClassId }) });
export const approveEnrollment = (id: number) => request<EnrollmentResponse>(`/api/enrollments/${id}/approve`, { method: 'PUT' });
