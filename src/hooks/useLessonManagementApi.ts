import { useCallback } from 'react';
import {
  createLesson as createLessonService,
  getLessons as getLessonsService,
  updateLesson as updateLessonService,
} from '../services/lessonService';
import { getPrograms as getProgramsService } from '../services/programService';

export type { LessonResponse } from '../services/lessonService';

export function useLessonManagementApi() {
  const getLessons = useCallback((pageNumber = 1, pageSize = 100) =>
    getLessonsService(pageNumber, pageSize), []);
  const getPrograms = useCallback((pageNumber = 1, pageSize = 100) =>
    getProgramsService(pageNumber, pageSize), []);
  const createLesson = useCallback((...args: Parameters<typeof createLessonService>) =>
    createLessonService(...args), []);
  const updateLesson = useCallback((...args: Parameters<typeof updateLessonService>) =>
    updateLessonService(...args), []);

  return { getLessons, getPrograms, createLesson, updateLesson };
}
