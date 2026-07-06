import { apiRequest } from './apiClient';
import {
  fromError,
  fromResponse,
  type PagedResponse,
  type ServiceResult,
} from './serviceTypes';

export interface ExerciseQuestionResponse {
  id: number;
  exerciseId: number;
  teacherId: number;
  instruction: string | null;
  questionSentence: string;
  answerSentence: string;
  inputType: string;
  audioURL: string | null;
  imageURL: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export type ExerciseQuestionPayload = Pick<
  ExerciseQuestionResponse,
  | 'exerciseId'
  | 'teacherId'
  | 'instruction'
  | 'questionSentence'
  | 'answerSentence'
  | 'inputType'
  | 'audioURL'
  | 'imageURL'
>;

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

export const getExerciseQuestions = (pageNumber = 1, pageSize = 100, exerciseId?: number) =>
  request<PagedResponse<ExerciseQuestionResponse>>(
    `/api/exercise-questions?pageNumber=${pageNumber}&pageSize=${pageSize}${exerciseId ? `&exerciseId=${exerciseId}` : ''}`
  );

export const getExerciseQuestionById = (id: number) =>
  request<ExerciseQuestionResponse>(`/api/exercise-questions/${id}`);

export const createExerciseQuestion = (payload: ExerciseQuestionPayload) =>
  request<ExerciseQuestionResponse>('/api/exercise-questions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateExerciseQuestion = (
  id: number,
  payload: ExerciseQuestionPayload
) =>
  request<ExerciseQuestionResponse>(`/api/exercise-questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteExerciseQuestion = (id: number) =>
  request<boolean>(`/api/exercise-questions/${id}`, { method: 'DELETE' });
