import { apiRequest } from './apiClient';
import { fromError, fromResponse, type PagedResponse, type ServiceResult } from './serviceTypes';
export interface ChildProfileResponse { id: number; userId: number; fullName: string; age: number; gender: 'Male' | 'Female' | 'Other'; learningLevel: 'Beginner' | 'Intermediate' | 'Advanced'; note: string | null; status: 'Active' | 'Inactive'; createdAt: string; updatedAt: string | null; }
async function request<T>(endpoint: string): Promise<ServiceResult<T>> { try { return fromResponse(await apiRequest<T>(endpoint)); } catch (error) { return fromError(error); } }
export const getChildProfiles = (pageNumber = 1, pageSize = 100) => request<PagedResponse<ChildProfileResponse>>(`/api/child-profile?pageNumber=${pageNumber}&pageSize=${pageSize}`);
