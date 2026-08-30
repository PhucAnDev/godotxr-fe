import { apiRequest, apiBlobRequest } from './apiClient';
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
  spokenText?: string;
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

async function rawRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ServiceResult<T>> {
  try {
    const rawData = await apiRequest<any>(endpoint, options);
    return {
      success: true,
      message: 'Success',
      errors: [],
      data: rawData as T,
    };
  } catch (error) {
    return fromError(error);
  }
}

export const getChunksBySession = (childProfileId: number, sessionId: string) =>
  rawRequest<ChunkResponse[]>(`/api/files/chunks/${childProfileId}/${sessionId}`);

export const assessChunk = (payload: AssessChunkPayload) =>
  rawRequest<any>('/api/files/chunks/assess', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const downloadAudioChunk = async (childProfileId: number, sessionId: string, chunkIndex: number): Promise<ServiceResult<Blob>> => {
  try {
    const blob = await apiBlobRequest(`/api/files/chunks/${childProfileId}/${sessionId}/${chunkIndex}/DownloadChunk`);
    return { success: true, message: 'Success', errors: [], data: blob };
  } catch (error) {
    return fromError(error);
  }
};
