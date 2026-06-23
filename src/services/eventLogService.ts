import { apiRequest } from './apiClient';
import { fromError, fromResponse, type ServiceResult } from './serviceTypes';

export interface EventLogResponse {
  id: number;
  resultId: number;
  childId: number;
  eventType: string;
  eventTime: string;
  description: string | null;
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

export const getEventLogsByResult = (resultId: number) =>
  request<EventLogResponse[]>(`/api/eventlogs/by-result/${resultId}`);

export const getEventLogsByChild = (childId: number) =>
  request<EventLogResponse[]>(`/api/eventlogs/by-child/${childId}`);
