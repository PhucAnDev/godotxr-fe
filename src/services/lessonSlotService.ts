import { apiRequest } from './apiClient';
import {
  fromError,
  fromResponse,
  type ServiceResult,
} from './serviceTypes';
import { type ItemAssetResponse } from './itemAssetService';

export interface LessonImageResponse {
  id: number;
  lessonId: number;
  imageUrl: string;
  angleName: string;
}

export interface LessonSlotResponse {
  id: number;
  lessonId: number;
  lessonImageId: number | null;
  slotIdentifier: string;
  slotName: string;
  itemAssetId: number | null;
  itemAsset: ItemAssetResponse | null;
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

export const getLessonImages = (lessonId: number) =>
  request<LessonImageResponse[]>(`/api/lessons/${lessonId}/images`);

export const uploadLessonImage = (lessonId: number, formData: FormData) =>
  request<LessonImageResponse>(`/api/lessons/${lessonId}/images`, {
    method: 'POST',
    body: formData,
  });

export const deleteLessonImage = (lessonId: number, imageId: number) =>
  request<boolean>(`/api/lessons/${lessonId}/images/${imageId}`, {
    method: 'DELETE',
  });

export const getLessonSlots = (lessonId: number) =>
  request<LessonSlotResponse[]>(`/api/lessons/${lessonId}/slots`);

export const configureLessonSlot = (
  lessonId: number,
  payload: { slotIdentifier: string; slotName: string; lessonImageId?: number | null }
) =>
  request<LessonSlotResponse>(`/api/lessons/${lessonId}/slots`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const assignItemToSlot = (
  lessonId: number,
  slotId: number,
  itemAssetId: number | null
) =>
  request<LessonSlotResponse>(`/api/lessons/${lessonId}/slots/${slotId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ itemAssetId }),
  });

export const getLessonClientConfig = (lessonId: number) =>
  request<LessonSlotResponse[]>(`/api/lessons/${lessonId}/client-config`);
