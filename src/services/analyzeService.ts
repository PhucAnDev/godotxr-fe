import { apiRequest } from './apiClient';
import {
  fromError,
  fromResponse,
  type PagedResponse,
  type ServiceResult,
} from './serviceTypes';

export interface AnalyzeResponse {
  id: number;
  childId: number;
  speechLevel: 'Mild' | 'Moderate' | 'Severe' | string;
  diagnosis: string | null;
  difficulties: string | null;
  strengths: string | null;
  weaknesses: string | null;
  communicationAbility: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  pronunciationAbility: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  languageComprehension: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  languageExpression: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  attentionLevel: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  socialInteraction: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  interventionGoals: string | null;
  recommendation: string | null;
  notes: string | null;
  assessmentDate: string;
  nextAssessmentDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AnalyzePayload {
  childId: number;
  speechLevel: 'Mild' | 'Moderate' | 'Severe' | string;
  diagnosis?: string | null;
  difficulties?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
  communicationAbility: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  pronunciationAbility: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  languageComprehension: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  languageExpression: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  attentionLevel: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  socialInteraction: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  interventionGoals?: string | null;
  recommendation?: string | null;
  notes?: string | null;
  assessmentDate: string;
  nextAssessmentDate?: string | null;
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

export const getAnalyzes = (pageNumber = 1, pageSize = 100) =>
  request<PagedResponse<AnalyzeResponse>>(
    `/api/analyze?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

export const getAnalyzeById = (id: number) =>
  request<AnalyzeResponse>(`/api/analyze/${id}`);

export const getAnalyzesByChildId = (childId: number) =>
  request<AnalyzeResponse[]>(`/api/analyze/child/${childId}`);

export const createAnalyze = (payload: AnalyzePayload) =>
  request<AnalyzeResponse>('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateAnalyze = (id: number, payload: Partial<AnalyzePayload>) =>
  request<AnalyzeResponse>(`/api/analyze/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteAnalyze = (id: number) =>
  request<boolean>(`/api/analyze/${id}`, {
    method: 'DELETE',
  });
