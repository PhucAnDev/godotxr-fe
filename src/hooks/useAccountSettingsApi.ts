import { useCallback, useState } from 'react';
import { changePassword as changePasswordService } from '../services/authService';
import { getUserById as getUserByIdService, updateUser as updateUserService } from '../services/userService';

export function useAccountSettingsApi() {
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const getUserById = useCallback(async (...args: Parameters<typeof getUserByIdService>) => {
    setIsLoadingProfile(true);
    try { return await getUserByIdService(...args); }
    finally { setIsLoadingProfile(false); }
  }, []);

  const updateUser = useCallback(async (...args: Parameters<typeof updateUserService>) => {
    setIsSavingProfile(true);
    try { return await updateUserService(...args); }
    finally { setIsSavingProfile(false); }
  }, []);

  const changePassword = useCallback(async (...args: Parameters<typeof changePasswordService>) => {
    setIsChangingPassword(true);
    try { return await changePasswordService(...args); }
    finally { setIsChangingPassword(false); }
  }, []);

  return { getUserById, updateUser, changePassword, isLoadingProfile, isSavingProfile, isChangingPassword };
}
