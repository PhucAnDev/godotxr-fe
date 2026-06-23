import { useCallback } from 'react';
import {
  createExercise as createExerciseService,
  deleteExercise as deleteExerciseService,
  getExerciseById as getExerciseByIdService,
  getExercises as getExercisesService,
  updateExercise as updateExerciseService,
} from '../services/exerciseService';
import {
  createExerciseQuestion as createExerciseQuestionService,
  deleteExerciseQuestion as deleteExerciseQuestionService,
  getExerciseQuestionById as getExerciseQuestionByIdService,
  getExerciseQuestions as getExerciseQuestionsService,
  updateExerciseQuestion as updateExerciseQuestionService,
} from '../services/exerciseQuestionService';
import {
  createExerciseType as createExerciseTypeService,
  deleteExerciseType as deleteExerciseTypeService,
  getExerciseTypeById as getExerciseTypeByIdService,
  getExerciseTypes as getExerciseTypesService,
  updateExerciseType as updateExerciseTypeService,
} from '../services/exerciseTypeService';
import { getLessons as getLessonsService } from '../services/lessonService';

export type { ExerciseResponse } from '../services/exerciseService';
export type { ExerciseQuestionResponse } from '../services/exerciseQuestionService';
export type { ExerciseTypeResponse } from '../services/exerciseTypeService';

export function useExerciseManagementApi() {
  const getLessons = useCallback(
    (...args: Parameters<typeof getLessonsService>) => getLessonsService(...args),
    []
  );
  const getExerciseTypes = useCallback(
    (...args: Parameters<typeof getExerciseTypesService>) =>
      getExerciseTypesService(...args),
    []
  );
  const getExerciseTypeById = useCallback(
    (...args: Parameters<typeof getExerciseTypeByIdService>) =>
      getExerciseTypeByIdService(...args),
    []
  );
  const createExerciseType = useCallback(
    (...args: Parameters<typeof createExerciseTypeService>) =>
      createExerciseTypeService(...args),
    []
  );
  const updateExerciseType = useCallback(
    (...args: Parameters<typeof updateExerciseTypeService>) =>
      updateExerciseTypeService(...args),
    []
  );
  const deleteExerciseType = useCallback(
    (...args: Parameters<typeof deleteExerciseTypeService>) =>
      deleteExerciseTypeService(...args),
    []
  );

  const getExercises = useCallback(
    (...args: Parameters<typeof getExercisesService>) => getExercisesService(...args),
    []
  );
  const getExerciseById = useCallback(
    (...args: Parameters<typeof getExerciseByIdService>) =>
      getExerciseByIdService(...args),
    []
  );
  const createExercise = useCallback(
    (...args: Parameters<typeof createExerciseService>) =>
      createExerciseService(...args),
    []
  );
  const updateExercise = useCallback(
    (...args: Parameters<typeof updateExerciseService>) =>
      updateExerciseService(...args),
    []
  );
  const deleteExercise = useCallback(
    (...args: Parameters<typeof deleteExerciseService>) =>
      deleteExerciseService(...args),
    []
  );

  const getExerciseQuestions = useCallback(
    (...args: Parameters<typeof getExerciseQuestionsService>) =>
      getExerciseQuestionsService(...args),
    []
  );
  const getExerciseQuestionById = useCallback(
    (...args: Parameters<typeof getExerciseQuestionByIdService>) =>
      getExerciseQuestionByIdService(...args),
    []
  );
  const createExerciseQuestion = useCallback(
    (...args: Parameters<typeof createExerciseQuestionService>) =>
      createExerciseQuestionService(...args),
    []
  );
  const updateExerciseQuestion = useCallback(
    (...args: Parameters<typeof updateExerciseQuestionService>) =>
      updateExerciseQuestionService(...args),
    []
  );
  const deleteExerciseQuestion = useCallback(
    (...args: Parameters<typeof deleteExerciseQuestionService>) =>
      deleteExerciseQuestionService(...args),
    []
  );

  return {
    getLessons,
    getExerciseTypes,
    getExerciseTypeById,
    createExerciseType,
    updateExerciseType,
    deleteExerciseType,
    getExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise,
    getExerciseQuestions,
    getExerciseQuestionById,
    createExerciseQuestion,
    updateExerciseQuestion,
    deleteExerciseQuestion,
  };
}
