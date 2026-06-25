/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  Check,
  KeyRound,
  Mail,
  Phone,
  Shield,
  Smile,
} from 'lucide-react';
import {
  getSessionUser,
  setSessionUser,
  type SessionUser,
} from '../../lib/authSession';
import { useAccountSettingsApi } from '../../hooks/useAccountSettingsApi';

type UserGender = 'Male' | 'Female' | 'Other';

function normalizeGender(value?: string): UserGender {
  return value === 'Male' || value === 'Female' || value === 'Other' ? value : 'Other';
}

function formatNow() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

export default function AccountSettings() {
  const {
    getUserById,
    updateUser,
    changePassword,
    isLoadingProfile,
    isSavingProfile,
    isChangingPassword,
  } = useAccountSettingsApi();
  const currentUser = getSessionUser();

  const [formFullName, setFormFullName] = useState(currentUser?.FullName || '');
  const [formPhoneNumber, setFormPhoneNumber] = useState(currentUser?.PhoneNumber || '');
  const [formGender, setFormGender] = useState<UserGender>(normalizeGender(currentUser?.Gender));
  const [formSpecialty, setFormSpecialty] = useState(currentUser?.Specialty || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [uError, setUError] = useState<string | null>(null);
  const [uSuccess, setUSuccess] = useState<string | null>(null);
  const [pError, setPError] = useState<string | null>(null);
  const [pSuccess, setPSuccess] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto rounded-3xl border border-red-100 bg-white p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold text-gray-800">Khong tim thay thong tin tai khoan</h2>
        <p className="mt-2 text-sm text-gray-500">Vui long dang nhap lai he thong.</p>
      </div>
    );
  }

  const canEditProfile = currentUser.Role === 'ADMIN';
  const userId = Number(currentUser.UserId.replace(/\D/g, ''));
  const roleLabel =
    currentUser.Role === 'ADMIN'
      ? 'Quan tri vien'
      : currentUser.Role === 'TEACHER'
        ? 'Giao vien dac biet'
        : 'Phu huynh dong hanh';

  const syncCurrentUserProfile = (
    user: SessionUser,
    profile: {
      fullName: string;
      phone: string;
      gender: UserGender;
      specialty?: string;
    }
  ) => {
    const nextUser: SessionUser = {
      ...user,
      FullName: profile.fullName,
      PhoneNumber: profile.phone,
      Gender: profile.gender,
      Specialty: user.Role === 'TEACHER' ? (profile.specialty || '') : user.Specialty,
      UpdatedAt: formatNow(),
    };

    setSessionUser(nextUser);
  };

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const loadProfile = async () => {
      const result = await getUserById(userId);
      if (cancelled || !result.success || !result.data) return;

      const nextGender = normalizeGender(result.data.gender);
      const nextProfile = {
        fullName: result.data.fullName || currentUser.FullName,
        phone: result.data.phone || '',
        gender: nextGender,
        specialty: result.data.specialty || '',
      };

      setFormFullName(nextProfile.fullName);
      setFormPhoneNumber(nextProfile.phone);
      setFormGender(nextProfile.gender);
      setFormSpecialty(nextProfile.specialty);
      syncCurrentUserProfile(currentUser, nextProfile);
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [currentUser.FullName, currentUser.Role, currentUser.Specialty, currentUser.UserId, getUserById, userId]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUError(null);
    setUSuccess(null);

    if (!canEditProfile) {
      setUError('Backend hien chi cho phep Admin cap nhat ho so qua API nay. Giao vien va phu huynh dang o che do chi doc cho phan thong tin ca nhan.');
      return;
    }

    if (!formFullName.trim()) {
      setUError('Ho va ten khong duoc de trong.');
      return;
    }

    if (!userId) {
      setUError('Khong xac dinh duoc ma nguoi dung de cap nhat.');
      return;
    }

    const result = await updateUser(userId, {
      fullName: formFullName.trim(),
      phone: formPhoneNumber.trim(),
      gender: formGender,
      specialty: currentUser.Role === 'TEACHER' ? formSpecialty.trim() : undefined,
    });

    if (!result.success || !result.data) {
      setUError(result.errors.join(' ') || result.message);
      return;
    }

    syncCurrentUserProfile(currentUser, {
      fullName: result.data.fullName,
      phone: result.data.phone,
      gender: normalizeGender(result.data.gender || formGender),
      specialty: result.data.specialty,
    });

    setUSuccess('Cap nhat thong tin ca nhan thanh cong!');
    setTimeout(() => setUSuccess(null), 3000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPError(null);
    setPSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPError('Vui long dien day du tat ca cac truong mat khau.');
      return;
    }

    if (newPassword.length < 8) {
      setPError('Mat khau moi phai co toi thieu 8 ky tu.');
      return;
    }

    if (newPassword === currentPassword) {
      setPError('Mat khau moi khong duoc giong mat khau cu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPError('Mat khau xac nhan khong chinh xac.');
      return;
    }

    const result = await changePassword(currentUser.Email, currentPassword, newPassword, confirmPassword);
    if (!result.success) {
      setPError(result.errors.join(' ') || result.message);
      return;
    }

    setSessionUser({
      ...currentUser,
      MustChangePassword: false,
      UpdatedAt: formatNow(),
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPSuccess('Thay doi mat khau thanh cong!');
    setTimeout(() => setPSuccess(null), 3000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 pb-24 text-left duration-500">
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <Shield className="h-3.5 w-3.5" />
            Cá nhân hóa
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Thiết Lập <span className="text-[#4EACAF]">Tài Khoản</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Đồng bộ thông tin tài khoản theo dữ liệu hệ thống và cập nhật các thiết lập bảo mật của bạn.
          </p>
        </div>

        <div className="bg-[#E2F2F3] border border-[#C5E1E3] p-4 rounded-[24px] flex items-center gap-4 shadow-sm self-start lg:self-center shrink-0">
          <img
            src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${currentUser.FullName}`}
            alt="My Avatar"
            className="h-12 w-12 rounded-full border bg-white shadow-xs shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <h5 className="font-black text-sm text-[#264E50] leading-none italic">{currentUser.FullName}</h5>
            <p className="mt-1 text-[10px] text-[#264E50]/60 font-black uppercase tracking-wider">{roleLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-xl bg-[#4EACAF]/10 p-2.5 text-[#4EACAF]">
              <Smile className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Thong tin ca nhan</h3>
              <p className="text-xs font-semibold uppercase text-slate-400">Dong bo va cap nhat ho so</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {!canEditProfile && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs font-bold leading-normal text-amber-800">
                Ho so dang duoc doc tu BE, nhung API hien tai chi cho phep <code>Admin</code> cap nhat thong tin ca nhan.
                Giao vien va phu huynh van co the doi mat khau o khung ben phai.
              </div>
            )}

            {uError && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold leading-normal text-rose-700">
                {uError}
              </div>
            )}

            {uSuccess && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-700">
                <Check className="h-4 w-4 text-emerald-600" />
                {uSuccess}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                Email dang nhap
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  disabled
                  value={currentUser.Email}
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold text-gray-400"
                />
              </div>
              <span className="block px-1 text-[10px] font-semibold text-slate-400">
                Email duoc giu co dinh theo tai khoan da xac thuc.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                Ho va ten day du
              </label>
              <input
                type="text"
                required
                disabled={!canEditProfile}
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="Vi du: Nguyen Van Minh"
                className="w-full rounded-xl border-2 border-transparent bg-[#FDFCF5] px-4 py-3 text-sm font-bold uppercase text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                  So dien thoai
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    disabled={!canEditProfile}
                    value={formPhoneNumber}
                    onChange={(e) => setFormPhoneNumber(e.target.value)}
                    placeholder="Lien he di dong"
                    className="w-full rounded-xl border-2 border-transparent bg-[#FDFCF5] py-3 pl-11 pr-4 text-sm font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                  Gioi tinh
                </label>
                <select
                  disabled={!canEditProfile}
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value as UserGender)}
                  className="w-full cursor-pointer rounded-xl border-2 border-transparent bg-[#FDFCF5] px-3.5 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nu</option>
                  <option value="Other">Khac</option>
                </select>
              </div>
            </div>

            {currentUser.Role === 'TEACHER' && (
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                  Chuyen mon giao vien
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    disabled={!canEditProfile}
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    placeholder="Vi du: Am hoc cham noi"
                    className="w-full rounded-xl border-2 border-transparent bg-[#FDFCF5] py-3 pl-11 pr-4 text-sm font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={!canEditProfile || isSavingProfile || isLoadingProfile}
                className="w-full cursor-pointer rounded-xl bg-[#4EACAF] px-6 py-3.5 text-center text-sm font-bold text-white shadow-md transition-all active:scale-95 hover:bg-[#3d8c8e] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {isLoadingProfile ? 'Dang dong bo ho so...' : isSavingProfile ? 'Dang cap nhat...' : 'Cap nhat thong tin ca nhan'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-xl bg-[#FF8E8E]/10 p-2.5 text-[#FF8E8E]">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Dat lai mat khau</h3>
              <p className="text-xs font-semibold uppercase text-slate-400">Dam bao bao mat tai khoan</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            {pError && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold leading-normal text-rose-700">
                {pError}
              </div>
            )}

            {pSuccess && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-700">
                <Check className="h-4 w-4 text-emerald-600" />
                {pSuccess}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                Mat khau hien tai
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border-2 border-transparent bg-[#FDFCF5] px-4 py-3 text-sm font-bold text-gray-700 outline-none transition-all focus:border-[#FF8E8E] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                Mat khau moi
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border-2 border-transparent bg-[#FDFCF5] px-4 py-3 text-sm font-bold text-gray-700 outline-none transition-all focus:border-[#FF8E8E] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                Xac nhan mat khau moi
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border-2 border-transparent bg-[#FDFCF5] px-4 py-3 text-sm font-bold text-gray-700 outline-none transition-all focus:border-[#FF8E8E] focus:bg-white"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full cursor-pointer rounded-xl bg-[#FF8E8E] px-6 py-3.5 text-center text-sm font-bold text-white shadow-md transition-all active:scale-95 hover:bg-[#e87f7f] disabled:cursor-not-allowed disabled:bg-rose-300 disabled:shadow-none"
              >
                {isChangingPassword ? 'Dang cap nhat mat khau...' : 'Cap nhat mat khau moi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
