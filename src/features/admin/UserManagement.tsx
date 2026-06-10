import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  ChevronDown,
  X,
  Check,
  Eye,
  Edit3,
  Lock,
  Unlock,
  RefreshCw,
  Calendar,
  Shield,
  Smile,
  Sparkles,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import { useUserManagement } from '../../hooks/useUserManagement';
import type { UserResponse } from '../../services/userService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Chuyển roleName từ BE sang màu badge */
function getRoleBadgeClass(roleName: string) {
  switch (roleName.toLowerCase()) {
    case 'admin':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'teacher':
      return 'bg-teal-50 text-teal-700 border border-teal-200';
    case 'parent':
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    default:
      return 'bg-slate-100 text-slate-500 border border-slate-200';
  }
}

/** Chuyển isActive sang label tiếng Việt */
function getStatusLabel(isActive: boolean) {
  return isActive ? 'Hoạt động' : 'Đã khóa';
}

/** Chuyển isActive sang màu badge */
function getStatusBadgeClass(isActive: boolean) {
  return isActive
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    : 'bg-rose-50 text-rose-600 border border-rose-100';
}

// ─── Component chính ──────────────────────────────────────────────────────────

export default function UserManagement() {
  const {
    users,
    roles,
    isLoading,
    totalUsers,
    activeUsers,
    lockedUsers,
    thisMonthUsers,
    currentPage,
    pageSize,
    totalCount,
    setCurrentPage,
    setPageSize,
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    modalType,
    selectedUser,
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleCloseModal,
    formFullName,
    setFormFullName,
    formEmail,
    setFormEmail,
    formPhone,
    setFormPhone,
    formUsername,
    setFormUsername,
    formPassword,
    setFormPassword,
    formRoleName,
    setFormRoleName,
    formIsActive,
    setFormIsActive,
    isSaving,
    handleSaveUser,
    handleToggleLock,
    handleResetPassword,
    handleRefresh,
    alertConfig,
    setAlertConfig,
  } = useUserManagement();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative">

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
          >
            <div className={cn(
              'p-5 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-white backdrop-blur-md',
              alertConfig.type === 'success' ? 'bg-[#4EACAF]/95 text-white' : 'bg-[#FF8E8E]/95 text-white'
            )}>
              <div className="bg-white/20 p-2 rounded-xl">
                {alertConfig.type === 'success'
                  ? <Check className="w-5 h-5 text-white" />
                  : <AlertTriangle className="w-5 h-5 text-white" />}
              </div>
              <p className="flex-1 font-black italic text-sm tracking-tight text-white">
                {alertConfig.message}
              </p>
              <button
                onClick={() => setAlertConfig(null)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-md text-[11px] font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Hệ thống Quản trị
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-2 pb-0.5">
            Quản lý Người dùng
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Xem xét, khởi tạo, hoặc chỉnh sửa quyền truy cập của phụ huynh, giáo viên và đội ngũ quản trị viên trong mạng lưới can thiệp sớm GodotXR.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#3d8c8e] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm shrink-0 active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Thêm người dùng mới
        </button>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem
          title="Tổng người dùng"
          value={totalUsers}
          subtitle="Tài khoản trên hệ thống"
          icon={<Users className="w-5 h-5 text-[#4EACAF]" />}
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Đang hoạt động"
          value={activeUsers}
          subtitle={`${Math.round((activeUsers / (users.length || 1)) * 100)}% trong trang này`}
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Đã bị khóa"
          value={lockedUsers}
          subtitle="Tài khoản bị tạm ngưng"
          icon={<UserX className="w-5 h-5 text-rose-600" />}
          bgColor="bg-rose-50/70"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Mới trong tháng"
          value={thisMonthUsers}
          subtitle="Gia nhập tháng này"
          icon={<Sparkles className="w-5 h-5 text-amber-600" />}
          bgColor="bg-amber-50/70"
          borderColor="border-slate-100"
        />
      </div>

      {/* 3. Search & Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm theo tên người dùng, email, sđt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-200/60 rounded-full hover:bg-gray-200"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter theo role */}
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="lg:w-48 w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-700 outline-none cursor-pointer pr-10 text-xs uppercase"
            >
              <option value="ALL">Tất cả Vai trò</option>
              {roles.map((role) => (
                <option key={role.id} value={role.roleName}>
                  {role.roleName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter theo trạng thái */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="lg:w-48 w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-700 outline-none cursor-pointer pr-10 text-xs uppercase"
            >
              <option value="ALL">Tất cả Trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Locked">Đã khóa</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-none">Danh sách người dùng</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              Đang hiển thị {filteredUsers.length} trong {totalCount} người dùng
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-[#4EACAF]"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
            <span className="w-2 h-2 bg-[#4EACAF] rounded-full animate-pulse" />
            <span className="text-xs text-[#4EACAF] font-bold uppercase tracking-wider">Hệ thống đồng bộ</span>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#4EACAF]" />
            <p className="text-sm font-bold">Đang tải dữ liệu từ hệ thống...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-700">Không tìm thấy người dùng phù hợp!</p>
              <p className="text-slate-400 text-xs">Vui lòng điều chỉnh lại bộ lọc hoặc nhập từ khóa tìm kiếm khác.</p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterRole('ALL');
                setFilterStatus('ALL');
              }}
              className="px-4 py-2 hover:bg-slate-50 rounded-lg font-bold text-xs text-[#4EACAF] border border-slate-200 uppercase transition-all"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="py-4 px-6">Mã ID</th>
                    <th className="py-4 px-6">Tên đầy đủ</th>
                    <th className="py-4 px-6">Liên hệ</th>
                    <th className="py-4 px-6">Vai trò</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6">Ngày tham gia</th>
                    <th className="py-4 px-6 text-right">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-6 font-mono text-slate-400 font-bold text-xs">
                        USR-{String(user.id).padStart(3, '0')}
                      </td>

                      {/* Tên & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${user.fullName}`}
                            alt={user.fullName}
                            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{user.fullName}</p>
                            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Số điện thoại */}
                      <td className="py-4 px-6 text-xs">
                        <p className="text-slate-700 font-semibold">{user.phone || '—'}</p>
                      </td>

                      {/* Role badge */}
                      <td className="py-4 px-6">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase',
                          getRoleBadgeClass(user.roleName)
                        )}>
                          {user.roleName}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-6">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide',
                          getStatusBadgeClass(user.isActive)
                        )}>
                          {getStatusLabel(user.isActive)}
                        </span>
                      </td>

                      {/* Ngày tham gia */}
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-350" />
                          {user.createdAt.slice(0, 10)}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetail(user)}
                            className="p-2 hover:bg-teal-50 text-teal-600 rounded-xl transition-colors hover:scale-105"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 hover:bg-sky-50 text-sky-500 rounded-xl transition-colors hover:scale-105"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleLock(user)}
                            className={cn(
                              'p-2 rounded-xl transition-colors hover:scale-105',
                              user.isActive
                                ? 'hover:bg-rose-50 text-rose-500'
                                : 'hover:bg-emerald-50 text-emerald-500'
                            )}
                            title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {user.isActive
                              ? <Lock className="w-4 h-4" />
                              : <Unlock className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-2 hover:bg-yellow-50 text-yellow-500 rounded-xl transition-colors hover:scale-105"
                            title="Khởi tạo lại mật khẩu"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 pb-6 border-t border-slate-50">
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="tài khoản"
              />
            </div>
          </>
        )}
      </div>

      {/* Decorative Quote */}
      <div className="flex items-center justify-center gap-4 bg-orange-50/40 p-6 rounded-[32px] border-2 border-orange-100 max-w-lg mx-auto">
        <Smile className="w-10 h-10 text-orange-400 fill-current shrink-0 animate-pulse" />
        <p className="text-gray-500 font-bold text-xs md:text-sm italic leading-snug">
          "Trẻ em nhận được sự hỗ trợ ngôn ngữ can thiệp sớm tốt nhất nhờ quy trình phối hợp khép kín giữa giáo viên đặc biệt và cha mẹ yêu thương."
        </p>
      </div>

      {/* 5. Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30"
            >
              {/* Modal Header */}
              <div className={cn(
                'px-8 py-6 flex items-center justify-between border-b',
                modalType === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10' :
                modalType === 'edit' ? 'bg-sky-50 border-sky-100' : 'bg-purple-50 border-purple-100'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2 text-gray-900">
                    {modalType === 'add' && <UserPlus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'detail' && <Info className="w-6 h-6 text-purple-600" />}
                    {modalType === 'add' && 'Thêm tài khoản người dùng'}
                    {modalType === 'edit' && `Chỉnh sửa: ${selectedUser?.fullName}`}
                    {modalType === 'detail' && 'Chi tiết tài khoản'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Khởi tạo tài khoản quản trị, giáo viên hoặc cha mẹ'}
                    {modalType === 'edit' && 'Cập nhật lại thông tin cá nhân và cài đặt trạng thái'}
                    {modalType === 'detail' && 'Toàn bộ dữ liệu người dùng từ hệ thống BE'}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body — Detail */}
              {modalType === 'detail' && selectedUser ? (
                <DetailModalBody
                  user={selectedUser}
                  onClose={handleCloseModal}
                  onResetPassword={handleResetPassword}
                />
              ) : (
                /* Modal Body — Add / Edit Form */
                <form onSubmit={handleSaveUser} className="p-8 md:p-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Họ và tên */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Họ và Tên đầy đủ <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Thị Hồng"
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Địa chỉ Email <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="vi-du@fpt.edu.vn"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700"
                      />
                    </div>

                    {/* Số điện thoại */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Số điện thoại liên hệ
                      </label>
                      <input
                        type="text"
                        placeholder="Số di động hoặc bàn"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700"
                      />
                    </div>

                    {/* Vai trò */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Vai trò thành viên <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formRoleName}
                          onChange={(e) => setFormRoleName(e.target.value as any)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF]"
                        >
                          {roles.length > 0 ? (
                            roles.map((role) => (
                              <option key={role.id} value={role.roleName}>
                                {role.roleName} — {role.description.slice(0, 40)}...
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Admin">Admin</option>
                              <option value="Teacher">Teacher</option>
                              <option value="Parent">Parent</option>
                            </>
                          )}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Username — chỉ hiện khi Add */}
                    {modalType === 'add' && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Username <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Tên đăng nhập hệ thống"
                          value={formUsername}
                          onChange={(e) => setFormUsername(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700"
                        />
                      </div>
                    )}

                    {/* Password — chỉ hiện khi Add */}
                    {modalType === 'add' && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Mật khẩu <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          placeholder="Tối thiểu 6 ký tự"
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700"
                        />
                      </div>
                    )}

                    {/* Trạng thái — chỉ hiện khi Edit */}
                    {modalType === 'edit' && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Trạng thái tài khoản <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <div className="flex flex-wrap gap-4 pt-1">
                          {[
                            { value: true, label: 'Hoạt động', sub: 'Được phép đăng nhập', cls: 'text-emerald-600' },
                            { value: false, label: 'Đã khóa', sub: 'Bị chặn hoàn toàn', cls: 'text-rose-600' },
                          ].map((item) => (
                            <label
                              key={String(item.value)}
                              className={cn(
                                'flex-1 min-w-[150px] border-2 rounded-2xl p-4 flex items-center gap-3 cursor-pointer select-none transition-all',
                                formIsActive === item.value
                                  ? 'border-[#4EACAF] ring-4 ring-[#4EACAF]/10 bg-white'
                                  : 'hover:bg-gray-50 border-gray-100'
                              )}
                            >
                              <input
                                type="radio"
                                name="formIsActive"
                                checked={formIsActive === item.value}
                                onChange={() => setFormIsActive(item.value)}
                                className="w-4 h-4 text-[#4EACAF] border-gray-300 focus:ring-[#4EACAF]"
                              />
                              <div className="text-left font-bold">
                                <p className={cn('text-sm', item.cls)}>{item.label}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="pt-6 border-t border-gray-100 flex gap-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-sm tracking-widest"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/10 transition-all active:scale-98 uppercase text-sm tracking-widest disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Detail modal body — tách ra để tránh component chính quá dài */
function DetailModalBody({
  user,
  onClose,
  onResetPassword,
}: {
  user: UserResponse;
  onClose: () => void;
  onResetPassword: (user: UserResponse) => Promise<void>;
}) {
  return (
    <div className="p-8 md:p-10 space-y-8">
      {/* Avatar + tên */}
      <div className="flex flex-col md:flex-row gap-8 items-start pb-6 border-b border-gray-50">
        <div className="w-24 h-24 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center p-3 shrink-0 mx-auto md:mx-0">
          <img
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.fullName}`}
            alt="Detail Avatar"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-3 flex-1 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-2xl font-black text-gray-900">{user.fullName}</span>
              <span className="px-3 py-0.5 bg-gray-100 text-gray-400 font-black tracking-widest text-[9px] rounded-full uppercase">
                ID: USR-{String(user.id).padStart(3, '0')}
              </span>
            </div>
            <p className="text-gray-400 font-bold">@{user.username}</p>
            <p className="text-gray-400 font-bold text-sm">{user.email}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold pt-1">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full uppercase text-[10px]',
              getRoleBadgeClass(user.roleName)
            )}>
              {user.roleName}
            </span>
            <span className={cn(
              'inline-flex items-center px-3 py-0.5 rounded-full uppercase text-[10px]',
              getStatusBadgeClass(user.isActive)
            )}>
              {getStatusLabel(user.isActive)}
            </span>
          </div>
        </div>
      </div>

      {/* Chi tiết fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {/* Reset password */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Mật khẩu</span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-xs text-gray-400">••••••••••••••••</span>
            <button
              type="button"
              onClick={() => onResetPassword(user)}
              className="px-3 py-1.5 bg-[#4EACAF]/15 hover:bg-[#4EACAF]/25 text-[#4EACAF] text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset mật khẩu
            </button>
          </div>
        </div>

        <DetailRow label="Số điện thoại" value={user.phone || '—'} />
        <DetailRow label="Thời điểm khởi tạo (CreatedAt)" value={user.createdAt.slice(0, 19).replace('T', ' ')} />
        <DetailRow label="Cập nhật lần cuối (UpdatedAt)" value={user.updatedAt?.slice(0, 19).replace('T', ' ') ?? '—'} />
      </div>

      {/* Security note */}
      <div className="bg-purple-50/50 p-5 rounded-3xl border border-purple-100/50 text-[#555] font-bold text-xs leading-relaxed space-y-1">
        <p className="font-extrabold text-purple-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
          <Shield className="w-4 h-4 shrink-0" />
          Chính sách Bảo mật Cơ sở Dữ liệu
        </p>
        <p className="opacity-85 text-gray-500">
          Mật khẩu được bảo vệ an toàn bằng cấu hình băm một chiều SHA256 kết hợp mã muối ngẫu nhiên của GodotXR. Mọi phiên hoạt động và thay đổi cấu hình đều được ghi nhận trực tiếp vào Nhật ký Kiểm toán hệ thống.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl transition-all"
        >
          Đóng lại
        </button>
      </div>
    </div>
  );
}

// ─── Reusable UI helpers ──────────────────────────────────────────────────────

function StatItem({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  borderColor,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={cn(
      'bg-white rounded-[32px] p-6 shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-300',
      borderColor
    )}>
      <div className={cn('absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150', bgColor)} />
      <div className="flex items-center gap-5 relative z-10">
        <div className={cn('p-4 rounded-2xl shadow-inner shrink-0', bgColor)}>
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">{title}</p>
          <p className="text-3xl font-black text-gray-900 leading-none">{value.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 font-medium pt-1 line-clamp-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isMono = false }: { label: string; value: string; isMono?: boolean }) {
  return (
    <div className="space-y-1.5 p-4 rounded-2xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</span>
      <span className={cn(
        'font-bold text-gray-800 break-all block',
        isMono ? 'font-mono font-medium text-xs text-orange-600 bg-orange-50/50 p-2 rounded-lg border border-orange-100' : 'text-sm'
      )}>
        {value}
      </span>
    </div>
  );
}
