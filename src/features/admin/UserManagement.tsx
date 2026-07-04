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
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from 'lucide-react';
import { cn, resolveAvatarUrl } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import CustomSelect from '../../components/common/CustomSelect';
import { useUserManagement, type UserResponse } from '../../hooks/useUserManagement';

type CreateAccountRole = 'Teacher' | 'Parent';

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

function getRoleDisplayName(roleName: string) {
  switch (roleName.toLowerCase()) {
    case 'admin':
      return 'Quản trị viên';
    case 'teacher':
      return 'Giáo viên';
    case 'parent':
      return 'Phụ huynh';
    default:
      return roleName;
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
    formGender,
    setFormGender,
    formSpecialty,
    setFormSpecialty,
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

  const [selectedCreateRole, setSelectedCreateRole] =
    React.useState<CreateAccountRole | null>(null);

  const [sortColumn, setSortColumn] = React.useState<keyof UserResponse | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc' | null>(null);

  const handleSort = (column: keyof UserResponse) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedUsers = React.useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return filteredUsers;
    }
    return [...filteredUsers].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (sortColumn === 'id') {
        return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB, 'vi-VN')
          : valB.localeCompare(valA, 'vi-VN');
      }

      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        return sortDirection === 'asc'
          ? (valA ? 1 : 0) - (valB ? 1 : 0)
          : (valB ? 1 : 0) - (valA ? 1 : 0);
      }

      return 0;
    });
  }, [filteredUsers, sortColumn, sortDirection]);

  const isCreateMode = modalType === 'add';
  const isChoosingCreateRole = isCreateMode && selectedCreateRole === null;
  const isTeacherCreateMode = isCreateMode && selectedCreateRole === 'Teacher';
  const isAccountInviteFlow = isCreateMode && !isChoosingCreateRole;
  const roleOptions =
    roles.length > 0
      ? roles.filter((role) =>
          ['Admin', 'Teacher', 'Parent'].includes(role.roleName)
        )
      : [];
  const specialtyLabel =
    formRoleName === 'Teacher'
      ? 'Chuyên môn'
      : formRoleName === 'Parent'
        ? 'Thông tin bổ sung'
        : 'Bộ phận / ghi chú';
  const specialtyPlaceholder =
    formRoleName === 'Teacher'
      ? 'Ví dụ: Trị liệu ngôn ngữ'
      : formRoleName === 'Parent'
        ? 'Ví dụ: Phụ huynh chính'
        : 'Ví dụ: Quản trị hệ thống';

  const handleOpenCreateAccount = () => {
    handleOpenAdd();
    setSelectedCreateRole(null);
  };

  const handleCloseUserModal = () => {
    setSelectedCreateRole(null);
    handleCloseModal();
  };

  const handleChooseCreateRole = (role: CreateAccountRole) => {
    setSelectedCreateRole(role);
    setFormRoleName(role);
    setFormSpecialty(role === 'Teacher' ? '' : 'Phụ huynh hỗ trợ');
  };

  React.useEffect(() => {
    if (modalType !== 'add') {
      setSelectedCreateRole(null);
    }
  }, [modalType]);

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
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <Shield className="w-3.5 h-3.5" />
            Hệ thống Quản trị
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Quản lý <span className="text-[#4EACAF]">Người dùng</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Xem xét, khởi tạo, hoặc chỉnh sửa quyền truy cập của phụ huynh, giáo viên và đội ngũ quản trị viên trong mạng lưới can thiệp sớm GodotXR.
          </p>
        </div>

        <button
          onClick={handleOpenCreateAccount}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-5 h-5" strokeWidth={2.5} />
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
          <CustomSelect
            value={filterRole}
            onChange={setFilterRole}
            variant="filter"
            className="lg:w-48 w-full"
            options={[
              { value: 'ALL', label: 'Tất cả Vai trò' },
              ...roles.map((role) => ({
                value: role.roleName,
                label: getRoleDisplayName(role.roleName),
              })),
            ]}
          />

          {/* Filter theo trạng thái */}
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            variant="filter"
            className="lg:w-48 w-full"
            options={[
              { value: 'ALL', label: 'Tất cả Trạng thái' },
              { value: 'Active', label: 'Hoạt động' },
              { value: 'Locked', label: 'Đã khóa' },
            ]}
          />
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
                    <th
                      onClick={() => handleSort('id')}
                      className="py-4 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Mã ID"
                    >
                      <div className="flex items-center gap-1">
                        Mã ID
                        {sortColumn === 'id' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#4EACAF]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('fullName')}
                      className="py-4 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Họ tên"
                    >
                      <div className="flex items-center gap-1">
                        Tên đầy đủ
                        {sortColumn === 'fullName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#4EACAF]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('email')}
                      className="py-4 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Email liên hệ"
                    >
                      <div className="flex items-center gap-1">
                        Liên hệ
                        {sortColumn === 'email' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#4EACAF]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('roleName')}
                      className="py-4 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Vai trò"
                    >
                      <div className="flex items-center gap-1">
                        Vai trò
                        {sortColumn === 'roleName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#4EACAF]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('isActive')}
                      className="py-4 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Trạng thái"
                    >
                      <div className="flex items-center gap-1">
                        Trạng thái
                        {sortColumn === 'isActive' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#4EACAF]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('createdAt')}
                      className="py-4 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Ngày tham gia"
                    >
                      <div className="flex items-center gap-1">
                        Ngày tham gia
                        {sortColumn === 'createdAt' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#4EACAF]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-6 text-right select-none">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                  {sortedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-[5px] font-mono text-slate-400 font-bold text-xs">
                        USR-{String(user.id).padStart(3, '0')}
                      </td>

                      {/* Tên & Email */}
                      <td className="py-4 px-[5px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveAvatarUrl(user.avatar, user.fullName, 'open-peeps')}
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
                      <td className="py-4 px-[5px] text-xs">
                        <p className="text-slate-700 font-semibold">{user.phone || '—'}</p>
                      </td>

                      {/* Role badge */}
                      <td className="py-4 px-[5px]">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase',
                          getRoleBadgeClass(user.roleName)
                        )}>
                          {getRoleDisplayName(user.roleName)}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-[5px]">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide',
                          getStatusBadgeClass(user.isActive)
                        )}>
                          {getStatusLabel(user.isActive)}
                        </span>
                      </td>

                      {/* Ngày tham gia */}
                      <td className="py-4 px-[5px] text-slate-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-350" />
                          {user.createdAt.slice(0, 10)}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-5 px-[5px] text-right">
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
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30"
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
                    {modalType === 'add' &&
                      (isChoosingCreateRole
                        ? 'Chọn loại tài khoản cần tạo'
                        : `Tạo tài khoản ${getRoleDisplayName(selectedCreateRole || '')}`)}
                    {modalType === 'edit' && `Chỉnh sửa: ${selectedUser?.fullName}`}
                    {modalType === 'detail' && 'Chi tiết tài khoản'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' &&
                      (isChoosingCreateRole
                        ? 'Chọn loại tài khoản trước khi nhập thông tin'
                        : 'Nhập thông tin để hệ thống gửi email xác minh')}
                    {modalType === 'edit' && 'Cập nhật lại thông tin cá nhân và cài đặt trạng thái'}
                    {modalType === 'detail' && 'Toàn bộ dữ liệu người dùng từ hệ thống BE'}
                  </p>
                </div>
                <button
                  onClick={handleCloseUserModal}
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body — Detail */}
              {modalType === 'detail' && selectedUser ? (
                <DetailModalBody
                  user={selectedUser}
                  onClose={handleCloseUserModal}
                  onResetPassword={handleResetPassword}
                />
              ) : isChoosingCreateRole ? (
                <div className="app-modal-body p-8 md:p-10 space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700">
                      Admin hãy chọn đối tượng cần tạo tài khoản.
                    </p>
                    <p className="text-xs text-slate-500">
                      Sau khi chọn, hệ thống sẽ hiển thị biểu mẫu phù hợp với
                      từng loại tài khoản.
                    </p>
                  </div>

                  <div className="app-modal-choice-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        role: 'Parent' as CreateAccountRole,
                        title: 'Tài khoản phụ huynh',
                        description:
                          'Dùng form tạo phụ huynh với các thông tin cơ bản và thông tin bổ sung.',
                      },
                      {
                        role: 'Teacher' as CreateAccountRole,
                        title: 'Tài khoản giáo viên',
                        description:
                          'Dùng form tạo giáo viên và bổ sung thêm thông tin chuyên môn.',
                      },
                    ].map((option) => (
                      <button
                        key={option.role}
                        type="button"
                        onClick={() => handleChooseCreateRole(option.role)}
                        className="app-modal-choice-card text-left rounded-3xl border border-slate-200 p-6 hover:border-[#4EACAF] hover:bg-[#4EACAF]/5 transition-all"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#4EACAF]/10 flex items-center justify-center mb-4">
                          <UserPlus className="w-5 h-5 text-[#4EACAF]" />
                        </div>
                        <p className="text-lg font-black text-slate-800">
                          {option.title}
                        </p>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="app-modal-actions pt-4 border-t border-gray-100 flex gap-4">
                    <button
                      type="button"
                      onClick={handleCloseUserModal}
                      className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-sm tracking-widest"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              ) : (
                /* Modal Body — Add / Edit Form */
                <form onSubmit={handleSaveUser} className="app-modal-body p-8 md:p-10 space-y-6">
                  <div className="app-modal-form-grid grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {modalType === 'add' ? (
                        <div className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-black italic tracking-wide text-gray-700">
                              {getRoleDisplayName(selectedCreateRole || '')}
                            </p>
            
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedCreateRole(null)}
                            className="shrink-0 px-3 py-2 rounded-xl text-xs font-black text-[#4EACAF] bg-[#4EACAF]/10 hover:bg-[#4EACAF]/15 transition-colors"
                          >
                            Chọn lại
                          </button>
                        </div>
                      ) : (
                        <CustomSelect
                          value={formRoleName}
                          onChange={(val) => setFormRoleName(val as any)}
                          variant="form"
                          options={
                            roleOptions.length > 0
                              ? roleOptions.map((role) => ({
                                  value: role.roleName,
                                  label: `${getRoleDisplayName(role.roleName)} — ${role.description.slice(0, 40)}...`,
                                }))
                              : [
                                  { value: 'Admin', label: 'Quản trị viên' },
                                  { value: 'Teacher', label: 'Giáo viên' },
                                  { value: 'Parent', label: 'Phụ huynh' },
                                ]
                          }
                        />
                      )}
                    </div>

                    {/* Giới tính */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Giới tính <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <CustomSelect
                        value={formGender}
                        onChange={(val) => setFormGender(val as 'Male' | 'Female' | 'Other')}
                        variant="form"
                        options={[
                          { value: 'Female', label: 'Nữ' },
                          { value: 'Male', label: 'Nam' },
                          { value: 'Other', label: 'Khác' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        {specialtyLabel} <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={specialtyPlaceholder}
                        value={formSpecialty}
                        onChange={(e) => setFormSpecialty(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700"
                      />
                      {isTeacherCreateMode && (
                        <p className="text-[11px] text-slate-400 font-medium">
                          Hãy nhập chuyên môn hoặc lĩnh vực phụ trách của giáo
                          viên.
                        </p>
                      )}
                    </div>


                    {/* Trạng thái — chỉ hiện khi Edit */}
                    {isAccountInviteFlow && (
                      <div className="md:col-span-2 rounded-2xl border border-[#4EACAF]/15 bg-[#4EACAF]/5 px-5 py-4 text-sm text-slate-600">
                        <p className="font-bold text-[#356f70]">
                          Tài khoản giáo viên và phụ huynh sẽ được tạo kèm email
                          xác minh.
                        </p>
                        <p className="mt-1 text-xs font-medium">
                          Hệ thống sẽ tự tạo mật khẩu tạm, gửi email xác minh,
                          và yêu cầu người dùng đổi mật khẩu ở lần đăng nhập đầu
                          tiên.
                        </p>
                      </div>
                    )}

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
                  <div className="app-modal-actions pt-6 border-t border-gray-100 flex gap-4">
                    <button
                      type="button"
                      onClick={handleCloseUserModal}
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
    <div className="app-modal-body p-8 md:p-10 space-y-8">
      {/* Avatar + tên */}
      <div className="flex flex-col md:flex-row gap-8 items-start pb-6 border-b border-gray-50">
        <div className="w-24 h-24 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center p-3 shrink-0 mx-auto md:mx-0">
          <img
            src={resolveAvatarUrl(user.avatar, user.fullName, 'adventurer')}
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
            <p className="text-gray-400 font-bold text-sm">{user.email}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold pt-1">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full uppercase text-[10px]',
              getRoleBadgeClass(user.roleName)
            )}>
              {getRoleDisplayName(user.roleName)}
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
