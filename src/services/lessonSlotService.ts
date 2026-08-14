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
  request<LessonImageResponse[]>(`/api/lesson-images/${lessonId}`);

export const uploadLessonImage = (lessonId: number, formData: FormData) =>
  request<LessonImageResponse>(`/api/lesson-images/${lessonId}`, {
    method: 'POST',
    body: formData,
  });

export const deleteLessonImage = (lessonId: number, imageId: number) =>
  request<boolean>(`/api/lesson-images/${lessonId}/${imageId}`, {
    method: 'DELETE',
  });

export const getLessonSlots = (lessonId: number) =>
  request<LessonSlotResponse[]>(`/api/lesson-slots/${lessonId}`);

export const configureLessonSlot = (
  lessonId: number,
  payload: { slotName: string; lessonImageId?: number | null }
) =>
  request<LessonSlotResponse>(`/api/lesson-slots/${lessonId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const assignItemToSlot = (
  lessonId: number,
  slotId: number,
  itemAssetId: number | null
) =>
  request<LessonSlotResponse>(`/api/lesson-slots/${lessonId}/${slotId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ itemAssetId }),
  });

export const updateLessonSlot = (
  lessonId: number,
  slotId: number,
  payload: { slotName: string; lessonImageId?: number | null }
) =>
  request<LessonSlotResponse>(`/api/lesson-slots/${lessonId}/${slotId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteLessonSlot = (
  lessonId: number,
  slotId: number
) =>
  request<void>(`/api/lesson-slots/${lessonId}/${slotId}`, {
    method: 'DELETE',
  });

export const getLessonClientConfig = (lessonId: number) =>
  request<LessonSlotResponse[]>(`/api/lessons/${lessonId}/client-config`);
