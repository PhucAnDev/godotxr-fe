import { apiRequest } from './apiClient';
import { fromError, fromResponse, type ServiceResult } from './serviceTypes';

export interface ChunkResponse {
  chunkIndex: number;
  chunkUrl: string;
}

export interface AssessChunkPayload {
  childProfileId: number;
  sessionId: string;
  chunkIndex: number;
  referenceText: string;
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

export const getChunksBySession = (childProfileId: number, sessionId: string) =>
  request<ChunkResponse[]>(`/api/files/chunks/${childProfileId}/${sessionId}`);

export const assessChunk = (payload: AssessChunkPayload) =>
  request<any>('/api/files/chunks/assess', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
