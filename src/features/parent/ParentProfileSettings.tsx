import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  RefreshCw,
  Heart
} from 'lucide-react';
import { cn } from '../../lib/utils';

// DB Interfaces based on the schemas provided
export interface UserProfile {
  UserId: string;
  RoleId: string;
  FullName: string;
  Email: string;
  PasswordHash: string; // Will NOT be shown directly in the UI
  PhoneNumber: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
}

// Mock initial data based on DB Schema USERS
const INITIAL_USER_PROFILE: UserProfile = {
  UserId: 'USR-P1',
  RoleId: 'ROLE-PARENT',
  FullName: 'Trần Minh Hải',
  Email: 'haiminh.tran@gmail.com',
  PasswordHash: '$2b$12$K89asd78haisdhas89dh23jshdyuioashd78ha9sd7123j', // Mock hash
  PhoneNumber: '0901234567',
  Status: 'Active',
  CreatedAt: '2025-10-15',
  UpdatedAt: '2026-05-20'
};

interface ParentProfileSettingsProps {
  onNavigate?: (screen: string) => void;
}

export default function ParentProfileSettings({ onNavigate }: ParentProfileSettingsProps) {
  // State for original user data
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  // States for Info Form Edit
  const [editFullName, setEditFullName] = useState<string>(profile.FullName);
  const [editEmail, setEditEmail] = useState<string>(profile.Email);
  const [editPhoneNumber, setEditPhoneNumber] = useState<string>(profile.PhoneNumber);

  // States for Change Password Form
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Notifications or alert boxes simple states
  const [infoSuccessMsg, setInfoSuccessMsg] = useState<string | null>(null);
  const [infoErrorMsg, setInfoErrorMsg] = useState<string | null>(null);
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState<string | null>(null);
  const [pwdErrorMsg, setPwdErrorMsg] = useState<string | null>(null);

  // Loading states triggers to simulate real operations
  const [infoUpdating, setInfoUpdating] = useState<boolean>(false);
  const [pwdUpdating, setPwdUpdating] = useState<boolean>(false);

  // Simple Info Form validation & submission Handler
  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccessMsg(null);
    setInfoErrorMsg(null);

    // Basic fields validation
    if (!editFullName.trim()) {
      setInfoErrorMsg('Họ và tên của phụ huynh không được để trống.');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      setInfoErrorMsg('Email không hợp lệ. Vui lòng nhập đúng địa chỉ email.');
      return;
    }
    if (!editPhoneNumber.trim() || editPhoneNumber.length < 8) {
      setInfoErrorMsg('Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    setInfoUpdating(true);

    // Simulate saving settings after 600ms
    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        FullName: editFullName,
        Email: editEmail,
        PhoneNumber: editPhoneNumber,
        UpdatedAt: new Date().toISOString().split('T')[0]
      }));
      setInfoUpdating(false);
      setInfoSuccessMsg('Đã cập nhật thông tin cá nhân của phụ huynh thành công.');
    }, 600);
  };

  // Simple Password change handler
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccessMsg(null);
    setPwdErrorMsg(null);

    // Form validation checks
    if (!currentPassword) {
      setPwdErrorMsg('Vui lòng nhập mật khẩu cũ hiện tại.');
      return;
    }
    if (!newPassword) {
      setPwdErrorMsg('Vui lòng điền mật khẩu mới muốn đặt.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdErrorMsg('Mật khẩu mới phải bao gồm ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdErrorMsg('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    setPwdUpdating(true);

    // Simulate database update logic
    setTimeout(() => {
      setPwdUpdating(false);
      setPwdSuccessMsg('Đã thay đổi mật khẩu tài khoản thành công!');
      // Clear forms
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 700);
  };

  // Reset/Cancel action logic
  const handleCancelChanges = () => {
    setEditFullName(profile.FullName);
    setEditEmail(profile.Email);
    setEditPhoneNumber(profile.PhoneNumber);
    setInfoSuccessMsg(null);
    setInfoErrorMsg(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 text-left" id="parent-profile-settings-container">
      
      {/* 1. Header: Cozy styling in harmony with GodotXR */}
      <div className="bg-white/45 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs bg-teal-50 text-[#4EACAF] px-3.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Tài khoản cha mẹ
            </span>
            <span className="text-xs bg-pink-50 text-[#FF8E8E] px-3 py-1 rounded-full font-bold">
              Bảo mật an toàn
            </span>
          </div>

          <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">
            Cài Đặt Tài Khoản
          </h1>
          <p className="text-gray-500 font-bold text-sm">
            Quản lý thông tin cá nhân liên hệ nhận thông báo và tăng cường bảo mật mật mã
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (1/3) - Profile Summary View Card */}
        <div className="space-y-8">
          
          {/* 2. Profile card */}
          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden space-y-6">
            
            {/* Soft decorative background circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4EACAF]/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/5 rounded-full -ml-8 -mb-8 pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#4EACAF]/20 to-pink-100 rounded-[30px] flex items-center justify-center text-[#264E50] border-4 border-white shadow-md relative">
                <User className="w-12 h-12" />
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-gray-800 leading-snug">{profile.FullName}</h3>
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-wider mt-1.5 inline-block">
                  Vai trò: Phụ huynh
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-50 pt-6">
              
              <div className="flex items-center gap-3.5 text-xs">
                <div className="w-9 h-9 bg-slate-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Hộp thư Email</span>
                  <strong className="text-gray-700 font-extrabold truncate block">{profile.Email}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-xs">
                <div className="w-9 h-9 bg-slate-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Đường dây kết nối</span>
                  <strong className="text-gray-700 font-extrabold">{profile.PhoneNumber}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-xs">
                <div className="w-9 h-9 bg-slate-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Ngày khởi lập tài khoản</span>
                  <strong className="text-gray-700 font-extrabold">{profile.CreatedAt}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-xs">
                <div className="w-9 h-9 bg-slate-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mr-1">Trạng thái:</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-black text-[9px] uppercase tracking-wide border border-emerald-100">
                    {profile.Status === 'Active' ? 'Đang hoạt động' : 'Tạm khóa'}
                  </span>
                </div>
              </div>

            </div>

            <div className="bg-[#FFFDF5] p-5 rounded-2xl border border-yellow-101/60 text-[11px] font-bold text-gray-500 leading-relaxed block text-left">
              <span className="text-amber-500 font-black block mb-1">💡 Chú ý bảo mặt:</span>
              Mã bảo mật Password của phụ huynh được mã hóa an toàn đỉnh cao bên trong cơ sở dữ liệu và hoàn toàn không thể tái đọc dạng thô trực tiếp.
            </div>

          </div>

        </div>

        {/* Right columns (2/3) - Forms tabs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3. Form cập nhật thông tin */}
          <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-7">
            <div className="border-b border-gray-50 pb-5">
              <h3 className="text-2xl font-black text-gray-900 leading-none italic">Chi tiết Hồ sơ Phụ Huynh</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">Cập nhật thông tin thực tế nhận kết quả đánh giá 3D mộc của con</p>
            </div>

            <form onSubmit={handleUpdateInfo} className="space-y-5">
              
              {infoSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-start gap-3 text-xs font-bold leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                  <span>{infoSuccessMsg}</span>
                </div>
              )}

              {infoErrorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start gap-3 text-xs font-bold leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{infoErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                
                {/* FullName field */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-black uppercase tracking-wider block">Họ và tên của bạn</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="Nhập tên đầy đủ của phụ huynh"
                      className="w-full bg-slate-50/70 border-2 border-slate-100 focus:border-[#4EACAF] hover:border-slate-200 p-3.5 pl-11 rounded-2xl text-xs font-black text-gray-800 outline-none transition-all focus:bg-white"
                    />
                  </div>
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-black uppercase tracking-wider block">Thư điện tử (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="emailphuhuynh@gmail.com"
                      className="w-full bg-slate-50/70 border-2 border-slate-100 focus:border-[#4EACAF] hover:border-slate-200 p-3.5 pl-11 rounded-2xl text-xs font-black text-gray-800 outline-none transition-all focus:bg-white"
                    />
                  </div>
                </div>

                {/* PhoneNumber field */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs text-gray-500 font-black uppercase tracking-wider block">Số điện thoại liên hệ thông báo</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={editPhoneNumber}
                      onChange={(e) => setEditPhoneNumber(e.target.value)}
                      placeholder="Nhập sđt 10 chữ số"
                      className="w-full bg-slate-50/70 border-2 border-slate-100 focus:border-[#4EACAF] hover:border-slate-200 p-3.5 pl-11 rounded-2xl text-xs font-black text-gray-800 outline-none transition-all focus:bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold block italic mt-1">Đảm bảo đúng số có kết nối Zalo/SĐT thường để thầy cô gửi liên lạc báo mộc trực tiếp từ vòm ứng dụng GodotXR.</span>
                </div>

              </div>

              {/* Action buttons list */}
              <div className="flex flex-wrap items-center justify-end gap-3.5 border-t border-gray-50 pt-5">
                <button
                  type="button"
                  onClick={handleCancelChanges}
                  className="px-6 py-3 border-2 border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-2xl text-xs font-black transition-all cursor-pointer"
                >
                  Hủy thay đổi
                </button>
                <button
                  type="submit"
                  disabled={infoUpdating}
                  className="px-6 py-3 bg-[#4EACAF] hover:bg-[#3d8c8f] disabled:opacity-50 text-white rounded-2xl text-xs font-black transition-all hover:shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {infoUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>

            </form>
          </div>

          {/* 4. Form đổi mật khẩu */}
          <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-7">
            <div className="border-b border-gray-50 pb-5">
              <h3 className="text-2xl font-black text-gray-900 leading-none italic">Bảo mật & Đổi mật khẩu</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">Định kỳ thiết lạp tăng độ bảo mật chống xâm nhập tài khoản từ xa</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-5">

              {pwdSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-start gap-3 text-xs font-bold leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                  <span>{pwdSuccessMsg}</span>
                </div>
              )}

              {pwdErrorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start gap-3 text-xs font-bold leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{pwdErrorMsg}</span>
                </div>
              )}

              <div className="space-y-4 text-left">
                
                {/* CurrentPassword field */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-black uppercase tracking-wider block">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50/70 border-2 border-slate-100 focus:border-indigo-400 hover:border-slate-200 p-3.5 pl-11 rounded-2xl text-xs font-black text-gray-800 outline-none transition-all focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* NewPassword field */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-black uppercase tracking-wider block">Mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50/70 border-2 border-slate-100 focus:border-indigo-400 hover:border-slate-200 p-3.5 pl-11 rounded-2xl text-xs font-black text-gray-800 outline-none transition-all focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* ConfirmPassword field */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-black uppercase tracking-wider block">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50/70 border-2 border-slate-100 focus:border-indigo-400 hover:border-slate-200 p-3.5 pl-11 rounded-2xl text-xs font-black text-gray-800 outline-none transition-all focus:bg-white"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Action buttons list */}
              <div className="flex flex-wrap items-center justify-end gap-3.5 border-t border-gray-50 pt-5">
                <button
                  type="submit"
                  disabled={pwdUpdating}
                  className="px-6 py-3 bg-[#FF8E8E] hover:bg-[#eb7474] disabled:opacity-50 text-white rounded-2xl text-xs font-black transition-all hover:shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {pwdUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Đổi mật khẩu
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
