import { useCallback } from 'react';
import {
  getChildProfileById as getChildProfileByIdService,
  getChildProfiles as getChildProfilesService,
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

  return { getChildProfiles, getChildProfileById };
}
