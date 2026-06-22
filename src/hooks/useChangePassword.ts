import { useCallback, useState } from 'react';
import { changePassword as changePasswordService } from '../services/authService';

export function useChangePassword() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const changePassword = useCallback(async (...args: Parameters<typeof changePasswordService>) => {
    setIsChangingPassword(true);
    try {
      return await changePasswordService(...args);
    } finally {
      setIsChangingPassword(false);
    }
  }, []);

  return { changePassword, isChangingPassword };
}
