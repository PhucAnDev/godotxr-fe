import { useCallback } from 'react';
import {
  getLessons as getLessonsService,
  getLessonsByProgram as getLessonsByProgramService,
} from '../services/lessonService';
import {
  createProgram as createProgramService,
  getPrograms as getProgramsService,
  updateProgram as updateProgramService,
} from '../services/programService';

export type { ProgramResponse } from '../services/programService';
export type { LessonResponse } from '../services/lessonService';

export function useProgramManagementApi() {
  const getPrograms = useCallback((pageNumber = 1, pageSize = 100) =>
    getProgramsService(pageNumber, pageSize), []);
  const getLessons = useCallback(
    (...args: Parameters<typeof getLessonsService>) => getLessonsService(...args),
    []
  );
  const getLessonsByProgram = useCallback(
    (...args: Parameters<typeof getLessonsByProgramService>) =>
      getLessonsByProgramService(...args),
    []
  );
  const createProgram = useCallback((...args: Parameters<typeof createProgramService>) =>
    createProgramService(...args), []);
  const updateProgram = useCallback((...args: Parameters<typeof updateProgramService>) =>
    updateProgramService(...args), []);

  return {
    getPrograms,
    getLessons,
    getLessonsByProgram,
    createProgram,
    updateProgram,
  };
}
