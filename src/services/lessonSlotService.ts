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
  correctPoints: number;
  wrongPoints: number;
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
  request<LessonImageResponse[]>(`/api/lessons/${lessonId}/scenes`);

export const uploadLessonImage = (lessonId: number, formData: FormData) =>
  request<LessonImageResponse>(`/api/lessons/${lessonId}/scenes`, {
    method: 'POST',
    body: formData,
  });

export const deleteLessonImage = (lessonId: number, imageId: number) =>
  request<boolean>(`/api/lessons/${lessonId}/scenes/${imageId}`, {
    method: 'DELETE',
  });

export const getLessonSlots = (lessonId: number) =>
  request<LessonSlotResponse[]>(`/api/lessons/${lessonId}/exercises`);

export const configureLessonSlot = (
  lessonId: number,
  payload: { slotName: string; lessonImageId?: number | null; correctPoints?: number; wrongPoints?: number }
) =>
  request<LessonSlotResponse>(`/api/lessons/${lessonId}/exercises`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const assignItemToSlot = (
  lessonId: number,
  slotId: number,
  itemAssetId: number | null
) =>
  request<LessonSlotResponse>(`/api/lessons/${lessonId}/exercises/${slotId}/assign-asset`, {
    method: 'PUT',
    body: JSON.stringify({ itemAssetId }),
  });

export const updateLessonSlot = (
  lessonId: number,
  slotId: number,
  payload: { slotName: string; lessonImageId?: number | null; correctPoints?: number; wrongPoints?: number }
) =>
  request<LessonSlotResponse>(`/api/lessons/${lessonId}/exercises/${slotId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteLessonSlot = (
  lessonId: number,
  slotId: number
) =>
  request<void>(`/api/lessons/${lessonId}/exercises/${slotId}`, {
    method: 'DELETE',
  });

// Export aliases matching the new educational naming conventions
export const getLessonScenes = getLessonImages;
export const uploadLessonScene = uploadLessonImage;
export const deleteLessonScene = deleteLessonImage;
export const getLessonExercises = getLessonSlots;
export const configureLessonExercise = configureLessonSlot;
export const updateLessonExercise = updateLessonSlot;
export const deleteLessonExercise = deleteLessonSlot;
export const assignAssetToExercise = assignItemToSlot;


