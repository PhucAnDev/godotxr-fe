import { apiRequest } from './apiClient';
import { fromError, fromResponse, type ServiceResult } from './serviceTypes';

export interface PronunciationDetailResponse {
  id: number;
  resultId: number;
  expectedPhoneme: string;
  actualPhoneme: string;
  accuracyScore: number;
  issueType: string | null;
  replayDataUrl: string | null;
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

export const getPronunciationDetailsByResult = (resultId: number) =>
  request<PronunciationDetailResponse[]>(
    `/api/pronunciationdetails/by-result/${resultId}`
  );

export const getPronunciationDetailById = (id: number) =>
  request<PronunciationDetailResponse>(`/api/pronunciationdetails/${id}`);
