import { useState } from 'react';
import type { FormEvent } from 'react';
import { forgotPassword, resetPassword, verifyOtp } from '../services/authService';

export type ForgotStep = 'EMAIL' | 'OTP' | 'RESET_PASSWORD' | 'SUCCESS';

interface UseForgotPasswordReturn {
  // ─── State ────────────────────────────────────────────────────────────────
  step: ForgotStep;
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  validationError: string | null;
  infoMessage: string | null;

  // ─── Setters (để component bind vào input) ────────────────────────────────
  setEmail: (v: string) => void;
  setOtp: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  clearValidationError: () => void;

  // ─── Actions ──────────────────────────────────────────────────────────────
  /** Bước 1: Gửi OTP về email */
  handleSendOtp: (e: FormEvent) => Promise<void>;
  /** Bước 2: Xác nhận format OTP phía client → chuyển sang bước đặt mật khẩu */
  handleVerifyOtp: (e: FormEvent) => void;
  /** Bước 3: Gửi OTP + mật khẩu mới lên BE để xác thực và đặt lại */
  handleResetPassword: (e: FormEvent) => Promise<void>;
  /** Gửi lại OTP mới */
  handleResendOtp: () => Promise<void>;
  /** Quay lại bước nhập email */
  handleChangeEmail: () => void;
  /** Quay lại bước trước */
  handleBack: (onBackToLogin: () => void) => void;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [step, setStep] = useState<ForgotStep>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function clearMessages() {
    setValidationError(null);
    setInfoMessage(null);
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValidationError('Vui lòng nhập email tài khoản.');
      return;
    }
    if (!trimmedEmail.includes('@')) {
      setValidationError('Email không hợp lệ.');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(trimmedEmail);
    setIsLoading(false);

    if (!result.success) {
      setValidationError(result.message);
      return;
    }

    setStep('OTP');
    setInfoMessage('Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setValidationError('Vui lòng nhập mã OTP.');
      return;
    }
    if (trimmedOtp.length !== 6) {
      setValidationError('Mã OTP phải gồm 6 chữ số.');
      return;
    }

    setIsLoading(true);
    const result = await verifyOtp(email.trim(), trimmedOtp);
    setIsLoading(false);

    if (!result.success) {
      setValidationError(result.errors.join(' ') || result.message);
      return;
    }

    setStep('RESET_PASSWORD');
  };

  const handleResendOtp = async () => {
    clearMessages();
    setOtp('');

    setIsLoading(true);
    const result = await forgotPassword(email.trim());
    setIsLoading(false);

    if (!result.success) {
      setValidationError(result.message);
      return;
    }

    setInfoMessage('Mã OTP mới đã được gửi lại. Vui lòng kiểm tra hộp thư.');
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!newPassword || !confirmPassword) {
      setValidationError('Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu.');
      return;
    }
    if (newPassword.length < 8) {
      setValidationError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email.trim(), otp.trim(), newPassword, confirmPassword);
    setIsLoading(false);

    if (!result.success) {
      // Nếu OTP sai/hết hạn → quay về bước OTP để nhập lại
      if (result.message.toLowerCase().includes('otp')) {
        setStep('OTP');
        setOtp('');
      }
      setValidationError(result.message);
      return;
    }

    setStep('SUCCESS');
  };

  const handleChangeEmail = () => {
    clearMessages();
    setOtp('');
    setStep('EMAIL');
  };

  const handleBack = (onBackToLogin: () => void) => {
    clearMessages();

    if (step === 'EMAIL') {
      onBackToLogin();
      return;
    }
    if (step === 'OTP') {
      setStep('EMAIL');
      return;
    }
    if (step === 'RESET_PASSWORD') {
      setStep('OTP');
      return;
    }

    onBackToLogin();
  };

  return {
    step,
    email,
    otp,
    newPassword,
    confirmPassword,
    isLoading,
    validationError,
    infoMessage,
    setEmail,
    setOtp,
    setNewPassword,
    setConfirmPassword,
    clearValidationError: () => setValidationError(null),
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleResendOtp,
    handleChangeEmail,
    handleBack,
  };
}
