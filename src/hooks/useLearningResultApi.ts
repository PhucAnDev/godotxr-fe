import { useCallback } from 'react';
import { getChildProfiles as getChildProfilesService } from '../services/childProfileService';
import { getClassrooms as getClassroomsService } from '../services/classroomService';
import { getEnrollments as getEnrollmentsService } from '../services/enrollmentService';
import {
  getEventLogsByChild as getEventLogsByChildService,
  getEventLogsByResult as getEventLogsByResultService,
} from '../services/eventLogService';
import { getExercises as getExercisesService } from '../services/exerciseService';
import {
  getPronunciationDetailById as getPronunciationDetailByIdService,
  getPronunciationDetailsByResult as getPronunciationDetailsByResultService,
} from '../services/pronunciationDetailService';
import {
  getResultById as getResultByIdService,
  getResultsByChild as getResultsByChildService,
  getResultsByExercise as getResultsByExerciseService,
  submitResult as submitResultService,
  updateResultFeedback as updateResultFeedbackService,
} from '../services/resultService';
import { getCurrentUserWithChildrenProfiles as getCurrentUserWithChildrenProfilesService } from '../services/userService';
import {
  getChunksBySession as getChunksBySessionService,
  assessChunk as assessChunkService,
} from '../services/fileService';

export function useLearningResultApi() {
  const getChildProfiles = useCallback(
    (...args: Parameters<typeof getChildProfilesService>) =>
      getChildProfilesService(...args),
    []
  );
  const getCurrentUserWithChildrenProfiles = useCallback(
    (...args: Parameters<typeof getCurrentUserWithChildrenProfilesService>) =>
      getCurrentUserWithChildrenProfilesService(...args),
    []
  );
  const getClassrooms = useCallback(
    (...args: Parameters<typeof getClassroomsService>) =>
      getClassroomsService(...args),
    []
  );
  const getEnrollments = useCallback(
    (...args: Parameters<typeof getEnrollmentsService>) =>
      getEnrollmentsService(...args),
    []
  );
  const getExercises = useCallback(
    (...args: Parameters<typeof getExercisesService>) =>
      getExercisesService(...args),
    []
  );
  const submitResult = useCallback(
    (...args: Parameters<typeof submitResultService>) => submitResultService(...args),
    []
  );
  const getResultById = useCallback(
    (...args: Parameters<typeof getResultByIdService>) => getResultByIdService(...args),
    []
  );
  const getResultsByChild = useCallback(
    (...args: Parameters<typeof getResultsByChildService>) =>
      getResultsByChildService(...args),
    []
  );
  const getResultsByExercise = useCallback(
    (...args: Parameters<typeof getResultsByExerciseService>) =>
      getResultsByExerciseService(...args),
    []
  );
  const getPronunciationDetailsByResult = useCallback(
    (...args: Parameters<typeof getPronunciationDetailsByResultService>) =>
      getPronunciationDetailsByResultService(...args),
    []
  );
  const getPronunciationDetailById = useCallback(
    (...args: Parameters<typeof getPronunciationDetailByIdService>) =>
      getPronunciationDetailByIdService(...args),
    []
  );
  const getEventLogsByResult = useCallback(
    (...args: Parameters<typeof getEventLogsByResultService>) =>
      getEventLogsByResultService(...args),
    []
  );
  const getEventLogsByChild = useCallback(
    (...args: Parameters<typeof getEventLogsByChildService>) =>
      getEventLogsByChildService(...args),
    []
  );
  const updateResultFeedback = useCallback(
    (...args: Parameters<typeof updateResultFeedbackService>) =>
      updateResultFeedbackService(...args),
    []
  );
  const getChunksBySession = useCallback(
    (...args: Parameters<typeof getChunksBySessionService>) =>
      getChunksBySessionService(...args),
    []
  );
  const assessChunk = useCallback(
    (...args: Parameters<typeof assessChunkService>) =>
      assessChunkService(...args),
    []
  );

  return {
    getChildProfiles,
    getCurrentUserWithChildrenProfiles,
    getClassrooms,
    getEnrollments,
    getExercises,
    submitResult,
    getResultById,
    getResultsByChild,
    getResultsByExercise,
    getPronunciationDetailsByResult,
    getPronunciationDetailById,
    getEventLogsByResult,
    getEventLogsByChild,
    updateResultFeedback,
    getChunksBySession,
    assessChunk,
  };
}
