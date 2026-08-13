import { apiRequest } from './apiClient';
import {
  fromError,
  fromResponse,
  type PagedResponse,
  type ServiceResult,
} from './serviceTypes';

export interface ItemAssetResponse {
  id: number;
  name: string;
  answerSentence: string;
  modelUrl: string;
  imageUrl: string | null;
  audioUrl: string | null;
  createdAt: string;
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

export const getItemAssets = (pageNumber = 1, pageSize = 100) => {
  return request<PagedResponse<ItemAssetResponse>>(`/api/item-assets?pageNumber=${pageNumber}&pageSize=${pageSize}`);
};

export const getItemAssetById = (id: number) =>
  request<ItemAssetResponse>(`/api/item-assets/${id}`);

export const createItemAsset = (formData: FormData) =>
  request<ItemAssetResponse>('/api/item-assets', {
    method: 'POST',
    body: formData,
  });

export const updateItemAsset = (id: number, formData: FormData) =>
  request<ItemAssetResponse>(`/api/item-assets/${id}`, {
    method: 'PUT',
    body: formData,
  });

export const deleteItemAsset = (id: number) =>
  request<boolean>(`/api/item-assets/${id}`, { method: 'DELETE' });
