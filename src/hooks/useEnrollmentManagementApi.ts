import { useCallback } from 'react';
import { getChildProfiles as getChildProfilesService } from '../services/childProfileService';
import { getClassrooms as getClassroomsService } from '../services/classroomService';
import {
  approveEnrollment as approveEnrollmentService,
  createEnrollment as createEnrollmentService,
  deleteEnrollment as deleteEnrollmentService,
  getEnrollmentById as getEnrollmentByIdService,
  getEnrollments as getEnrollmentsService,
  transferEnrollment as transferEnrollmentService,
  updateEnrollment as updateEnrollmentService,
} from '../services/enrollmentService';

export type { EnrollmentResponse } from '../services/enrollmentService';

export function useEnrollmentManagementApi() {
  const getEnrollments = useCallback((...args: Parameters<typeof getEnrollmentsService>) => getEnrollmentsService(...args), []);
  const getEnrollmentById = useCallback((...args: Parameters<typeof getEnrollmentByIdService>) => getEnrollmentByIdService(...args), []);
  const getChildProfiles = useCallback((...args: Parameters<typeof getChildProfilesService>) => getChildProfilesService(...args), []);
  const getClassrooms = useCallback((...args: Parameters<typeof getClassroomsService>) => getClassroomsService(...args), []);
  const createEnrollment = useCallback((...args: Parameters<typeof createEnrollmentService>) => createEnrollmentService(...args), []);
  const updateEnrollment = useCallback((...args: Parameters<typeof updateEnrollmentService>) => updateEnrollmentService(...args), []);
  const deleteEnrollment = useCallback((...args: Parameters<typeof deleteEnrollmentService>) => deleteEnrollmentService(...args), []);
  const transferEnrollment = useCallback((...args: Parameters<typeof transferEnrollmentService>) => transferEnrollmentService(...args), []);
  const approveEnrollment = useCallback((...args: Parameters<typeof approveEnrollmentService>) => approveEnrollmentService(...args), []);

  return { getEnrollments, getEnrollmentById, getChildProfiles, getClassrooms, createEnrollment, updateEnrollment, deleteEnrollment, transferEnrollment, approveEnrollment };
}
