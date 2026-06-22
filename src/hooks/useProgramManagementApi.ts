import { useCallback } from 'react';
import {
  createProgram as createProgramService,
  getPrograms as getProgramsService,
  updateProgram as updateProgramService,
} from '../services/programService';

export type { ProgramResponse } from '../services/programService';

export function useProgramManagementApi() {
  const getPrograms = useCallback((pageNumber = 1, pageSize = 100) =>
    getProgramsService(pageNumber, pageSize), []);
  const createProgram = useCallback((...args: Parameters<typeof createProgramService>) =>
    createProgramService(...args), []);
  const updateProgram = useCallback((...args: Parameters<typeof updateProgramService>) =>
    updateProgramService(...args), []);

  return { getPrograms, createProgram, updateProgram };
}
