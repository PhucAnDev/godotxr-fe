/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserCheck, Shield, KeyRound, Check, RefreshCw, AlertTriangle, Mail, Phone, Smile, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCurrentUser, getStoredUsers, saveStoredUsers, setCurrentUser } from '../../lib/authMock';

export default function AccountSettings() {
  const currentUser = getCurrentUser();
  const allUsers = getStoredUsers();

  const [formFullName, setFormFullName] = useState(currentUser?.FullName || '');
  const [formPhoneNumber, setFormPhoneNumber] = useState(currentUser?.PhoneNumber || '');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>(currentUser?.Gender || 'Other');
  const [formSpecialty, setFormSpecialty] = useState(currentUser?.Specialty || '');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Alerts
  const [uError, setUError] = useState<string | null>(null);
  const [uSuccess, setUSuccess] = useState<string | null>(null);
  
  const [pError, setPError] = useState<string | null>(null);
  const [pSuccess, setPSuccess] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-red-100 max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy thông tin tài khoản</h2>
        <p className="text-gray-500 text-sm mt-2">Vui lòng đăng nhập lại hệ thống.</p>
      </div>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUError(null);
    setUSuccess(null);

    if (!formFullName.trim()) {
      setUError('Họ và tên không được để trống.');
      return;
    }

    const updatedUsers = allUsers.map(u => {
      if (u.UserId === currentUser.UserId) {
        return {
          ...u,
          FullName: formFullName,
          PhoneNumber: formPhoneNumber,
          Gender: formGender,
          Specialty: currentUser.Role === 'TEACHER' ? formSpecialty : u.Specialty,
          UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
      }
      return u;
    });

    saveStoredUsers(updatedUsers);
    
    const updatedMe = updatedUsers.find(u => u.UserId === currentUser.UserId);
    if (updatedMe) {
      setCurrentUser(updatedMe);
    }

    setUSuccess('Cập nhật thông tin cá nhân thành công!');
    setTimeout(() => setUSuccess(null), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPError(null);
    setPSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPError('Vui lòng điền đủ tất cả các trường mật mã.');
      return;
    }

    if (currentPassword !== currentUser.Password) {
      setPError('Mật khẩu hiện tại không chính xác.');
      return;
    }

    if (newPassword.length < 8) {
      setPError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    if (newPassword === currentPassword) {
      setPError('Mật khẩu mới không được giống mật khẩu cũ.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPError('Mật khẩu xác nhận không chính xác.');
      return;
    }

    const updatedUsers = allUsers.map(u => {
      if (u.UserId === currentUser.UserId) {
        return {
          ...u,
          Password: newPassword,
          MustChangePassword: false,
          UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
      }
      return u;
    });

    saveStoredUsers(updatedUsers);

    const updatedMe = updatedUsers.find(u => u.UserId === currentUser.UserId);
    if (updatedMe) {
      setCurrentUser(updatedMe);
    }

    // Reset password inputs
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setPSuccess('Thay đổi mật khẩu thành công!');
    setTimeout(() => setPSuccess(null), 3000);
  };

  const roleLabel = 
    currentUser.Role === 'ADMIN' ? 'Quản trị viên' :
    currentUser.Role === 'TEACHER' ? 'Giáo viên đặc biệt' : 'Phụ huynh đồng hành';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 text-left">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-md text-[11px] font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Cá nhân hóa
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-2 pb-0.5 animate-pulse">
            Tài khoản Cá nhân
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Cập nhật chi tiết liên lạc cá nhân, định hướng chuyên môn hoặc thiết lập lại mật mã bảo vệ của bạn trên mạng lưới GodotXR.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shrink-0">
          <img 
            src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${currentUser.FullName}`} 
            alt="My Avatar"
            className="w-12 h-12 bg-white rounded-full border shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="font-bold text-slate-800 text-sm leading-none">{currentUser.FullName}</p>
            <p className="text-xs text-[#4EACAF] font-bold uppercase mt-1 tracking-wide">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* 2. Main Two-column Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Info Column */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
            <div className="p-2.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-xl">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Thông tin cá nhân</h3>
              <p className="text-xs text-slate-400 font-semibold uppercase">Thay đổi định danh tài khoản</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {uError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold leading-normal">
                {uError}
              </div>
            )}
            {uSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {uSuccess}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest ml-1">Hòm thư đăng nhập (Không thể sửa)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300" />
                <input 
                  type="email" 
                  disabled
                  value={currentUser.Email}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-gray-400 cursor-not-allowed text-sm"
                />
              </div>
              <span className="text-[10px] text-slate-400 block font-semibold px-1">Email được cung cấp ban đầu dùng để xác minh quyền hạn đăng nhập.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest ml-1">Họ và Tên đầy đủ</label>
              <input 
                type="text" 
                required
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Minh"
                className="w-full px-4 py-3 bg-[#FDFCF5] border-2 border-transparent uppercase focus:border-[#4EACAF] focus:bg-white rounded-xl font-bold text-gray-700 outline-none text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest ml-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300" />
                  <input 
                    type="text" 
                    value={formPhoneNumber}
                    onChange={(e) => setFormPhoneNumber(e.target.value)}
                    placeholder="Liên hệ di động"
                    className="w-full pl-11 pr-4 py-3 bg-[#FDFCF5] border-2 border-transparent focus:border-[#4EACAF] focus:bg-white rounded-xl font-bold text-gray-700 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest ml-1">Giới tính</label>
                <select 
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value as any)}
                  className="w-full px-3.5 py-3 bg-[#FDFCF5] border-2 border-transparent focus:border-[#4EACAF] focus:bg-white rounded-xl font-bold text-gray-700 outline-none text-sm cursor-pointer"
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
            </div>

            {currentUser.Role === 'TEACHER' && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest ml-1">Định hướng Chuyên môn giáo viên</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300" />
                  <input 
                    type="text" 
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    placeholder="Ví dụ: Chuyên gia âm học chậm nói"
                    className="w-full pl-11 pr-4 py-3 bg-[#FDFCF5] border-2 border-transparent focus:border-[#4EACAF] focus:bg-white rounded-xl font-bold text-gray-700 outline-none text-sm transition-all"
                  />
                </div>
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-[#4EACAF] hover:bg-[#3d8c8e] text-white font-bold py-3.5 px-6 rounded-xl text-center text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Cập nhật thông tin cá nhân
              </button>
            </div>
          </form>
        </div>

        {/* Password Column */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
            <div className="p-2.5 bg-[#FF8E8E]/10 text-[#FF8E8E] rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Đặt lại mật khẩu</h3>
              <p className="text-xs text-slate-400 font-semibold uppercase">Đảm bảo bảo mật tài khoản</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            {pError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold leading-normal">
                {pError}
              </div>
            )}
            {pSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {pSuccess}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#FDFCF5] border-2 border-transparent focus:border-[#FF8E8E] focus:bg-white rounded-xl font-bold text-gray-700 outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest ml-1">Mật khẩu mới (Tối thiểu 8 ký tự)</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#FDFCF5] border-2 border-transparent focus:border-[#FF8E8E] focus:bg-white rounded-xl font-bold text-gray-700 outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest ml-1">Xác nhận mật khẩu mới chính xác</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#FDFCF5] border-2 border-transparent focus:border-[#FF8E8E] focus:bg-white rounded-xl font-bold text-gray-700 outline-none text-sm transition-all"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-[#FF8E8E] hover:bg-[#e87f7f] text-white font-bold py-3.5 px-6 rounded-xl text-center text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Cập nhật mật khẩu mới
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
