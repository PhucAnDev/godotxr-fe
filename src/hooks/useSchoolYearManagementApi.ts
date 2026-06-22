import { useCallback } from 'react';
import {
  createSchoolYear as createSchoolYearService,
  deleteSchoolYear as deleteSchoolYearService,
  getSchoolYears as getSchoolYearsService,
  setActiveSchoolYear as setActiveSchoolYearService,
  updateSchoolYear as updateSchoolYearService,
} from '../services/schoolYearService';

export type { SchoolYearResponse } from '../services/schoolYearService';

export function useSchoolYearManagementApi() {
  const getSchoolYears = useCallback((...args: Parameters<typeof getSchoolYearsService>) => getSchoolYearsService(...args), []);
  const createSchoolYear = useCallback((...args: Parameters<typeof createSchoolYearService>) => createSchoolYearService(...args), []);
  const updateSchoolYear = useCallback((...args: Parameters<typeof updateSchoolYearService>) => updateSchoolYearService(...args), []);
  const deleteSchoolYear = useCallback((...args: Parameters<typeof deleteSchoolYearService>) => deleteSchoolYearService(...args), []);
  const setActiveSchoolYear = useCallback((...args: Parameters<typeof setActiveSchoolYearService>) => setActiveSchoolYearService(...args), []);

  return { getSchoolYears, createSchoolYear, updateSchoolYear, deleteSchoolYear, setActiveSchoolYear };
}
