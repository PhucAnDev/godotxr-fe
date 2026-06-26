import { useCallback } from 'react';
import {
  createAnalyze as createAnalyzeService,
  deleteAnalyze as deleteAnalyzeService,
  getAnalyzeById as getAnalyzeByIdService,
  getAnalyzes as getAnalyzesService,
  getAnalyzesByChildId as getAnalyzesByChildIdService,
  updateAnalyze as updateAnalyzeService,
} from '../services/analyzeService';

export type { AnalyzeResponse } from '../services/analyzeService';

export function useAnalyzeApi() {
  const getAnalyzes = useCallback(
    (...args: Parameters<typeof getAnalyzesService>) =>
      getAnalyzesService(...args),
    []
  );

  const getAnalyzeById = useCallback(
    (...args: Parameters<typeof getAnalyzeByIdService>) =>
      getAnalyzeByIdService(...args),
    []
  );

  const getAnalyzesByChildId = useCallback(
    (...args: Parameters<typeof getAnalyzesByChildIdService>) =>
      getAnalyzesByChildIdService(...args),
    []
  );

  const createAnalyze = useCallback(
    (...args: Parameters<typeof createAnalyzeService>) =>
      createAnalyzeService(...args),
    []
  );

  const updateAnalyze = useCallback(
    (...args: Parameters<typeof updateAnalyzeService>) =>
      updateAnalyzeService(...args),
    []
  );

  const deleteAnalyze = useCallback(
    (...args: Parameters<typeof deleteAnalyzeService>) =>
      deleteAnalyzeService(...args),
    []
  );

  return {
    getAnalyzes,
    getAnalyzeById,
    getAnalyzesByChildId,
    createAnalyze,
    updateAnalyze,
    deleteAnalyze,
  };
}
