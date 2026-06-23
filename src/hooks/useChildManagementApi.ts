import { useCallback } from 'react';
import {
  createChildProfile as createChildProfileService,
  deleteChildProfile as deleteChildProfileService,
  getChildProfileById as getChildProfileByIdService,
  getChildProfiles as getChildProfilesService,
  updateChildProfile as updateChildProfileService,
} from '../services/childProfileService';

export type { ChildProfileResponse } from '../services/childProfileService';

export function useChildManagementApi() {
  const getChildProfiles = useCallback(
    (...args: Parameters<typeof getChildProfilesService>) =>
      getChildProfilesService(...args),
    []
  );

  const getChildProfileById = useCallback(
    (...args: Parameters<typeof getChildProfileByIdService>) =>
      getChildProfileByIdService(...args),
    []
  );

  const createChildProfile = useCallback(
    (...args: Parameters<typeof createChildProfileService>) =>
      createChildProfileService(...args),
    []
  );

  const updateChildProfile = useCallback(
    (...args: Parameters<typeof updateChildProfileService>) =>
      updateChildProfileService(...args),
    []
  );

  const deleteChildProfile = useCallback(
    (...args: Parameters<typeof deleteChildProfileService>) =>
      deleteChildProfileService(...args),
    []
  );

  return {
    getChildProfiles,
    getChildProfileById,
    createChildProfile,
    updateChildProfile,
    deleteChildProfile,
  };
}
