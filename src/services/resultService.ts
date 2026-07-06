import { apiRequest } from './apiClient';
import { fromError, fromResponse, type ServiceResult } from './serviceTypes';

export interface ResultPronunciationDetailResponse {
  id: number;
  resultId: number;
  expectedPhoneme: string;
  actualPhoneme: string;
  accuracyScore: number;
  issueType: string | null;
  replayDataUrl: string | null;
}

export interface ResultEventLogResponse {
  id: number;
  resultId: number;
  childId: number;
  eventType: string;
  eventTime: string;
  description: string | null;
}

export interface ResultResponse {
  id: number;
  sessionId: string;
  childId: number;
  exerciseId: number | null;
  lessonId: number | null;
  attemptNumber: number;
  completionStatus: string;
  score: number;
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number;
  audioRecordUrl: string | null;
  replayDataUrl: string | null;
  interactionLog: string | null;
  feedbackText: string | null;
  isFinalized: boolean;
  audioStatus: string;
  replayStatus: string;
  hasReplayData: boolean;
  hasAudioData: boolean;
  pronunciationDetails: ResultPronunciationDetailResponse[];
  eventLogs: ResultEventLogResponse[];
}

export interface SubmitPronunciationDetailPayload {
  expectedPhoneme: string;
  actualPhoneme: string;
  accuracyScore: number;
  issueType?: string | null;
  replayDataUrl?: string | null;
}

export interface SubmitEventLogPayload {
  eventType: string;
  eventTime: string;
  description?: string | null;
}

export interface SubmitResultPayload {
  sessionId: string;
  childId: number;
  exerciseId: number;
  completionStatus: 'Completed' | 'Incomplete';
  score: number;
  startedAt: string;
  completedAt?: string | null;
  durationSeconds: number;
  audioRecordUrl?: string | null;
  replayDataUrl?: string | null;
  interactionLog?: string | null;
  feedbackText?: string | null;
  pronunciationDetails?: SubmitPronunciationDetailPayload[];
  eventLogs?: SubmitEventLogPayload[];
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

export const submitResult = (payload: SubmitResultPayload) =>
  request<ResultResponse>('/api/results/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getResultById = (id: number) =>
  request<ResultResponse>(`/api/results/${id}`);

export const getResultsByChild = (childId: number) =>
  request<ResultResponse[]>(`/api/results/by-child/${childId}`);

export const getResultsByExercise = (exerciseId: number) =>
  request<ResultResponse[]>(`/api/results/by-exercise/${exerciseId}`);
