import { useCallback } from 'react';
import {
  createSemester as createSemesterService,
  deleteSemester as deleteSemesterService,
  getSemesters as getSemestersService,
  updateSemester as updateSemesterService,
} from '../services/semesterService';
import { getSchoolYears as getSchoolYearsService } from '../services/schoolYearService';
import { getUsers as getUsersService } from '../services/userService';

export type { SemesterResponse } from '../services/semesterService';

export function useSemesterManagementApi() {
  const getSemesters = useCallback((...args: Parameters<typeof getSemestersService>) => getSemestersService(...args), []);
  const getSchoolYears = useCallback((...args: Parameters<typeof getSchoolYearsService>) => getSchoolYearsService(...args), []);
  const getUsers = useCallback((...args: Parameters<typeof getUsersService>) => getUsersService(...args), []);
  const createSemester = useCallback((...args: Parameters<typeof createSemesterService>) => createSemesterService(...args), []);
  const updateSemester = useCallback((...args: Parameters<typeof updateSemesterService>) => updateSemesterService(...args), []);
  const deleteSemester = useCallback((...args: Parameters<typeof deleteSemesterService>) => deleteSemesterService(...args), []);

  return { getSemesters, getSchoolYears, getUsers, createSemester, updateSemester, deleteSemester };
}
