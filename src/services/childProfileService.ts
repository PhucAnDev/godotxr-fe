import { apiRequest } from './apiClient';
import {
  fromError,
  fromResponse,
  type PagedResponse,
  type ServiceResult,
} from './serviceTypes';

export interface ChildProfileResponse {
  id: number;
  userId: number;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  learningLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  note: string | null;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string | null;
}

export interface ChildProfilePayload {
  userId: number;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  learningLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  note?: string | null;
  status: 'Active' | 'Inactive';
}

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

export const getChildProfiles = (pageNumber = 1, pageSize = 100) =>
  request<PagedResponse<ChildProfileResponse>>(
    `/api/child-profiles?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

export const getChildProfileById = (id: number) =>
  request<ChildProfileResponse>(`/api/child-profiles/${id}`);

export const createChildProfile = (payload: ChildProfilePayload) =>
  request<ChildProfileResponse>('/api/child-profiles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateChildProfile = (id: number, payload: ChildProfilePayload) =>
  request<ChildProfileResponse>(`/api/child-profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteChildProfile = (id: number) =>
  request<boolean>(`/api/child-profiles/${id}`, {
    method: 'DELETE',
  });

export const getMyChildProfiles = () =>
  request<ChildProfileResponse[]>('/api/child-profiles/my-children');
