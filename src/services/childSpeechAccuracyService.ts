import { apiRequest } from './apiClient';
import { fromError, fromResponse, type ServiceResult } from './serviceTypes';

export interface ChildSpeechAccuracyResponse {
  id: number;
  childProfileId: number;
  lessonId?: number | null;
  lessonSlotId?: number | null;
  resultId?: number | null;
  sessionId?: string | null;
  word: string;
  accuracyScore: number;
  fluencyScore?: number | null;
  pronunciationScore?: number | null;
  completenessScore?: number | null;
  errorType?: string | null;
  audioChunkIndex?: number | null;
  createdAt: string;
}

export interface CreateChildSpeechAccuracyPayload {
  childProfileId: number;
  lessonId?: number | null;
  lessonSlotId?: number | null;
  resultId?: number | null;
  sessionId?: string | null;
  word: string;
  accuracyScore: number;
  fluencyScore?: number | null;
  pronunciationScore?: number | null;
  completenessScore?: number | null;
  errorType?: string | null;
  audioChunkIndex?: number | null;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<ServiceResult<T>> {
  try {
    return fromResponse(await apiRequest<T>(endpoint, options));
  } catch (error) {
    return fromError(error);
  }
}

export const getSpeechAccuracyByChild = (childId: number) =>
  request<ChildSpeechAccuracyResponse[]>(`/api/ChildSpeechAccuracies/child/${childId}`);

export const getSpeechAccuracyBySession = (sessionId: string) =>
  request<ChildSpeechAccuracyResponse[]>(`/api/ChildSpeechAccuracies/session/${sessionId}`);

export const getSpeechAccuracyByLesson = (lessonId: number) =>
  request<ChildSpeechAccuracyResponse[]>(`/api/ChildSpeechAccuracies/lesson/${lessonId}`);

export const createSpeechAccuracy = (payload: CreateChildSpeechAccuracyPayload) =>
  request<ChildSpeechAccuracyResponse>('/api/ChildSpeechAccuracies', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const createBatchSpeechAccuracy = (payloads: CreateChildSpeechAccuracyPayload[]) =>
  request<number>('/api/ChildSpeechAccuracies/batch', {
    method: 'POST',
    body: JSON.stringify(payloads)
  });
