import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, KeyRound, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../public/HomeView';
import { getSessionUser, setSessionUser } from '../../lib/authSession';
import { useChangePassword } from '../../hooks/useChangePassword';

interface FirstLoginChangePasswordViewProps {
  onSuccess: () => void;
  onLogout: () => void;
}

export default function FirstLoginChangePasswordView({
  onSuccess,
  onLogout,
}: FirstLoginChangePasswordViewProps) {
  const currentUser = getSessionUser();
  const { changePassword, isChangingPassword } = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogout = () => {
    onLogout();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!currentUser) {
      setError('Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.');
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ các trường thông tin.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Mật khẩu mới không được trùng với mật khẩu tạm thời.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    const result = await changePassword(
      currentUser.Email,
      currentPassword,
      newPassword,
      confirmPassword
    );

    if (!result.success) {
      setError(result.errors.join(' ') || result.message);
      return;
    }

    setSessionUser({
      ...currentUser,
      MustChangePassword: false,
    });
    setIsSuccess(true);
    setTimeout(() => onSuccess(), 1200);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[40px] border border-slate-100 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)] overflow-hidden"
      >
        <div className="px-8 py-7 bg-[#4EACAF]/10 border-b border-[#4EACAF]/10 text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white items-center justify-center text-[#4EACAF] shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-800">
            Đổi mật khẩu lần đầu
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Tài khoản của bạn đã xác minh email thành công. Vui lòng đổi mật
            khẩu trước khi tiếp tục sử dụng hệ thống.
          </p>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
            <p className="text-sm font-bold text-slate-700">
              {currentUser.FullName}
            </p>
            <p className="text-xs text-slate-500 mt-1">{currentUser.Email}</p>
          </div>

          {isSuccess ? (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-6 py-8 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <p className="text-lg font-black text-emerald-800">
                Đổi mật khẩu thành công
              </p>
              <p className="mt-2 text-sm text-emerald-700">
                Hệ thống đang chuyển bạn về trang chính.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <PasswordField
                label="Mật khẩu tạm thời"
                value={currentPassword}
                onChange={setCurrentPassword}
                showValue={showCurrentPassword}
                onToggleShow={() => setShowCurrentPassword((value) => !value)}
                icon={<Shield className="w-5 h-5" />}
              />

              <PasswordField
                label="Mật khẩu mới"
                value={newPassword}
                onChange={setNewPassword}
                showValue={showNewPassword}
                onToggleShow={() => setShowNewPassword((value) => !value)}
                icon={<KeyRound className="w-5 h-5" />}
              />

              <PasswordField
                label="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={setConfirmPassword}
                showValue={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword((value) => !value)}
                icon={<KeyRound className="w-5 h-5" />}
              />

              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                Sau khi đổi mật khẩu, bạn sẽ dùng mật khẩu mới cho các lần đăng
                nhập tiếp theo.
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-black hover:bg-slate-50 transition-colors"
                >
                  Đăng xuất
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 py-4 rounded-2xl bg-[#4EACAF] text-white font-black hover:bg-[#3f9799] transition-colors disabled:opacity-70"
                >
                  {isChangingPassword ? 'Đang cập nhật...' : 'Lưu mật khẩu mới'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  showValue,
  onToggleShow,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showValue: boolean;
  onToggleShow: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
          {icon}
        </div>
        <input
          type={showValue ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Nhập thông tin tại đây"
          className="w-full pl-13 pr-14 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#4EACAF] focus:bg-white outline-none font-bold text-slate-800"
          required
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4EACAF]"
        >
          {showValue ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
