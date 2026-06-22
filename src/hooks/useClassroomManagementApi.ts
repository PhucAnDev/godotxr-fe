import { useCallback } from 'react';
import {
  createClassroom as createClassroomService,
  getClassrooms as getClassroomsService,
  updateClassroom as updateClassroomService,
} from '../services/classroomService';
import { getPrograms as getProgramsService } from '../services/programService';
import { getSemesters as getSemestersService } from '../services/semesterService';
import { getUsers as getUsersService } from '../services/userService';

export type { ClassroomResponse } from '../services/classroomService';

export function useClassroomManagementApi() {
  const getClassrooms = useCallback((...args: Parameters<typeof getClassroomsService>) => getClassroomsService(...args), []);
  const getPrograms = useCallback((...args: Parameters<typeof getProgramsService>) => getProgramsService(...args), []);
  const getSemesters = useCallback((...args: Parameters<typeof getSemestersService>) => getSemestersService(...args), []);
  const getUsers = useCallback((...args: Parameters<typeof getUsersService>) => getUsersService(...args), []);
  const createClassroom = useCallback((...args: Parameters<typeof createClassroomService>) => createClassroomService(...args), []);
  const updateClassroom = useCallback((...args: Parameters<typeof updateClassroomService>) => updateClassroomService(...args), []);

  return { getClassrooms, getPrograms, getSemesters, getUsers, createClassroom, updateClassroom };
}
