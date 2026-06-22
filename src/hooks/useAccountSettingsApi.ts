import { useCallback, useState } from 'react';
import { changePassword as changePasswordService } from '../services/authService';
import { updateUser as updateUserService } from '../services/userService';

export function useAccountSettingsApi() {
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  return { updateUser, changePassword, isSavingProfile, isChangingPassword };
}
