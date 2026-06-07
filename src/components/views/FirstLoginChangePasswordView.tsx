/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Shield, KeyRound, LogOut, CheckCircle2, Cloud, Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from './HomeView';
import { getCurrentUser, updateCurrentUserPassword, mockLogout } from '../../lib/authMock';

interface FirstLoginChangePasswordViewProps {
  onSuccess: () => void;
  onLogout: () => void;
}

export default function FirstLoginChangePasswordView({ onSuccess, onLogout }: FirstLoginChangePasswordViewProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentUser = getCurrentUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError('Phiên làm việc không hợp lệ, vui lòng đăng nhập lại.');
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ các trường thông tin.');
      return;
    }

    if (currentPassword !== currentUser.Password) {
      setError('Mật khẩu tạm thời hiện tại không chính xác.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có độ dài tối thiểu 8 ký tự.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Mật khẩu mới không được trùng với mật khẩu tạm thời hiện tại.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp với mật khẩu mới.');
      return;
    }

    // Attempt update
    const result = updateCurrentUserPassword(newPassword);
    if (result) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setError('Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại.');
    }
  };

  const handleLogoutAction = () => {
    mockLogout();
    onLogout();
  };

  return (
    <div className="flex min-h-screen bg-[#FFFDF5] selection:bg-[#FF8E8E]/30 overflow-hidden text-left">
      {/* Background soft pastel bubble decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4EACAF]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF8E8E]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full font-sans">
        {/* Left Side Illustration */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-20 relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl relative"
          >
            <div className="relative group">
              <motion.div 
                animate={{ rotate: [2, -2, 2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 rounded-[64px] overflow-hidden border-[16px] border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] bg-white"
              >
                <img 
                  src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop" 
                  alt="Kid in virtual reality headset"
                  className="w-full aspect-square object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-lg">
                      <Logo className="scale-75 origin-left" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating elements */}
              <motion.div 
                animate={{ y: [-15, 0, -15], rotate: [5, -5, 5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-white p-6 rounded-[32px] shadow-2xl z-25 border-4 border-yellow-100"
              >
                <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
              </motion.div>

              <motion.div 
                animate={{ scale: [1.2, 1, 1.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-10 left-1/4 bg-[#4EACAF] p-6 rounded-full shadow-2xl z-25 border-[8px] border-white"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div 
                animate={{ x: [-15, 0, -15] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -left-12 bg-white p-5 rounded-3xl shadow-xl z-25 border-2 border-pink-100"
              >
                <Cloud className="w-10 h-10 text-pink-300 fill-current opacity-30" />
              </motion.div>
            </div>

            <div className="mt-16 space-y-4 text-left">
              <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 leading-tight">
                An toàn tuyệt đối <br />
                Đồng hành <span className="text-[#4EACAF]">tin cậy</span> cùng trẻ
              </h2>
              <p className="text-lg text-gray-400 font-bold max-w-sm">
                Hãy đổi mật khẩu tạm thời để lưu giữ tiến trình rèn luyện an vị cho các bé.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:bg-white/50 lg:backdrop-blur-3xl min-h-screen">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl"
          >
            {/* Mobile View Top Logo */}
            <div className="lg:hidden flex justify-center mb-10">
              <Logo />
            </div>

            <div className="bg-white rounded-[56px] p-8 sm:p-14 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] border-b-8 border-gray-100 relative overflow-hidden">
              {/* Form Title & Description */}
              <div className="text-center mb-10 relative z-10">
                <div className="w-16 h-16 bg-[#4EACAF]/10 rounded-[28px] border-2 border-dashed border-[#4EACAF]/30 flex items-center justify-center text-[#4EACAF] mx-auto mb-6">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-gray-900 mb-3">
                  Đổi Mật Khẩu Lần Đầu
                </h1>
                <p className="text-gray-400 font-bold text-xs max-w-sm mx-auto leading-relaxed uppercase tracking-wider mb-4">
                  Để tăng tính bảo mật, vui lòng thiết lập mật mã mới trước khi bắt đầu hành trình.
                </p>
                {currentUser && (
                  <div className="inline-block px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-left max-w-md mx-auto shadow-xs">
                    <p className="text-slate-600 font-bold mb-1">
                      👤 Tài khoản: <span className="text-[#4EACAF]">{currentUser.Email}</span> ({currentUser.Role === 'ADMIN' ? 'Quản trị viên' : currentUser.Role === 'TEACHER' ? 'Giáo viên' : 'Phụ huynh'})
                    </p>
                    <p className="text-slate-500 font-semibold">
                      🔑 Mật khẩu tạm thời: <span className="text-rose-500 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 select-all">{currentUser.Password}</span>
                    </p>
                  </div>
                )}
              </div>

              {isSuccess ? (
                <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col items-center gap-4 text-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                  <div>
                    <h3 className="text-lg font-black text-emerald-800 mb-1">Cập nhật thành công!</h3>
                    <p className="text-sm text-emerald-600 font-bold">Mật mã mới đã được cập nhật thành công. Đang kết nối vào bảng điều khiển...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-black flex items-start gap-2.5 leading-snug">
                      <span className="shrink-0 w-2 h-2 rounded-full bg-rose-500 mt-1.5 animate-bounce" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Current Password / Mật khẩu tạm thời */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                      Mật khẩu tạm thời hiện tại
                    </label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                        <Shield className="w-5 h-5" />
                      </div>
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setError(null);
                        }}
                        className="w-full pl-15 pr-14 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-50 focus:border-[#4EACAF] focus:bg-white transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4EACAF]"
                      >
                        {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password / Mật khẩu mới */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                      Mật khẩu mới (Tối thiểu 8 ký tự)
                    </label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <input
                        type={showNew ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError(null);
                        }}
                        className="w-full pl-15 pr-14 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-50 focus:border-[#4EACAF] focus:bg-white transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4EACAF]"
                      >
                        {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password / Xác nhận mật khẩu mới */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError(null);
                        }}
                        className="w-full pl-15 pr-14 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-50 focus:border-[#4EACAF] focus:bg-white transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4EACAF]"
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Action Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={handleLogoutAction}
                      className="flex-1 py-4.5 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-[24px] uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4.5 bg-[#4EACAF] hover:bg-[#3e8e90] text-white font-black rounded-[24px] shadow-lg shadow-[#4EACAF]/20 uppercase text-xs tracking-wider border-b-[8px] border-[#347678] hover:border-b-[4px] hover:translate-y-1 transition-all active:scale-95 cursor-pointer text-center"
                    >
                      Lưu & Đăng nhập
                    </button>
                  </div>
                </form>
              )}

              {/* Decorative design marker */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8E8E]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
            </div>

            <p className="mt-8 text-[11px] text-center text-gray-400 font-bold uppercase tracking-tighter">
              Quy trình bảo mật an toàn nghiêm ngặt từ đội ngũ kỹ sư GodotXR.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
