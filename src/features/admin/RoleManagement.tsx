import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  KeyRound, 
  ShieldAlert, 
  Plus, 
  Search, 
  Edit3, 
  Eye, 
  Check, 
  X, 
  Calendar, 
  ChevronDown,
  Info,
  Power,
  ToggleLeft,
  ToggleRight,
  Smile,
  AlertTriangle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import CustomSelect from '../../components/common/CustomSelect';
import { useRoleManagement, type RoleResponse, type UserRoleEnum } from '../../hooks/useRoleManagement';

// Các giá trị enum được phép gửi lên BE
const ROLE_NAME_OPTIONS: { value: UserRoleEnum; label: string }[] = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Teacher', label: 'Teacher' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Child', label: 'Child' },
];

const formatDateDMY = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
  }
  return dateStr;
};

export default function RoleManagement() {
  const {
    filteredRoles,
    isLoading,
    totalRoles,
    activeRoles,
    inactiveRoles,
    searchQuery, setSearchQuery,
    filterActive, setFilterActive,
    modalType,
    selectedRole,
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleCloseModal,
    formRoleName, setFormRoleName,
    formDescription, setFormDescription,
    formIsActive, setFormIsActive,
    isSaving,
    handleSaveRole,
    handleToggleActive,
    handleDelete,
    alertConfig, setAlertConfig,
  } = useRoleManagement();

  const [sortBy, setSortBy] = React.useState<string>('id_asc');

  const sortedRoles = React.useMemo(() => {
    return [...filteredRoles].sort((a, b) => {
      if (sortBy === 'id_asc') return a.id - b.id;
      if (sortBy === 'id_desc') return b.id - a.id;
      if (sortBy === 'name_asc') return a.roleName.localeCompare(b.roleName, 'vi-VN', { numeric: true });
      if (sortBy === 'name_desc') return b.roleName.localeCompare(a.roleName, 'vi-VN', { numeric: true });
      return 0;
    });
  }, [filteredRoles, sortBy]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
          >
            <div className={cn(
              "p-5 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-white backdrop-blur-md",
              alertConfig.type === 'success' ? 'bg-[#4EACAF]/95 text-white' : 'bg-[#FF8E8E]/95 text-white'
            )}>
              <div className="bg-white/20 p-2 rounded-xl">
                {alertConfig.type === 'success'
                  ? <Check className="w-5 h-5 text-white" />
                  : <AlertTriangle className="w-5 h-5 text-white" />
                }
              </div>
              <p className="flex-1 font-black italic text-sm tracking-tight text-white">{alertConfig.message}</p>
              <button onClick={() => setAlertConfig(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header */}
      <div className="bg-white/45 backdrop-blur-md rounded-xl p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <KeyRound className="w-3.5 h-3.5" />
            Bảng điều khiển Bảo mật
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Phân Quyền <span className="text-[#4EACAF]">Thành Viên</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Phân định quyền hạn, cấu hình giới hạn tính năng và quản lý danh sách vai trò cho học tập, can thiệp hoặc quản lý vận hành GodotXR.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Thêm vai trò mới
        </button>
      </div>

      {/* 2. Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem title="Tổng vai trò" value={totalRoles} subtitle="Số vai trò trong hệ thống"
          icon={<Shield className="w-5 h-5 text-[#4EACAF]" />} bgColor="bg-[#4EACAF]/5" borderColor="border-slate-100" />
        <StatItem title="Vai trò hoạt động" value={activeRoles} subtitle="Đang khả dụng để phân chia người dùng"
          icon={<Check className="w-5 h-5 text-emerald-600" />} bgColor="bg-emerald-50/70" borderColor="border-slate-100" />
        <StatItem title="Vai trò bị tắt" value={inactiveRoles} subtitle="Trong trạng thái nháp"
          icon={<ToggleLeft className="w-5 h-5 text-slate-500" />} bgColor="bg-slate-50" borderColor="border-slate-100" />
      </div>

      {/* 3. Tìm kiếm & lọc */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">

          <input
            type="text"
            placeholder="Tìm theo vai trò, mô tả chi tiết, mã ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-normal text-slate-600 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-200/60 rounded-full hover:bg-gray-200">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>
        <CustomSelect
          value={filterActive}
          onChange={setFilterActive}
          variant="filter"
          className="w-full sm:w-56"
          options={[
            { value: 'ALL', label: 'Tất cả Trạng thái' },
            { value: 'ACTIVE', label: 'Hoạt động' },
            { value: 'INACTIVE', label: 'Trạng thái tắt' }
          ]}
        />
        <CustomSelect
          value={sortBy}
          onChange={setSortBy}
          variant="filter"
          className="w-full sm:w-56"
          options={[
            { value: 'id_asc', label: 'ID tăng dần' },
            { value: 'id_desc', label: 'ID giảm dần' },
            { value: 'name_asc', label: 'Tên vai trò A-Z' },
            { value: 'name_desc', label: 'Tên vai trò Z-A' }
          ]}
        />
      </div>

      {/* 4. Danh sách role */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-[#4EACAF] animate-spin" />
          <span className="ml-3 text-gray-500 font-bold">Đang tải dữ liệu...</span>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-white rounded-[40px] py-24 text-center space-y-4 shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-200">
            <ShieldAlert className="w-8 h-8 text-gray-300" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-black text-gray-700">Không tìm thấy vai trò phù hợp!</p>
            <p className="text-gray-400 font-medium text-sm">Vui lòng thử lại với từ khóa hoặc bộ lọc trạng thái khác.</p>
          </div>
          <button
            onClick={() => { setSearchQuery(''); setFilterActive('ALL'); setSortBy('id_asc'); }}
            className="px-5 py-2 hover:bg-gray-100 rounded-xl font-black text-xs text-[#4EACAF] border border-gray-200 uppercase transition-all"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Mã ID</th>
                  <th className="py-4 px-4">Tên vai trò</th>
                  <th className="py-4 px-4">Mô tả đặc quyền</th>
                  <th className="py-4 px-4 text-center">Trạng thái</th>
                  <th className="py-4 px-4">Ngày khởi tạo</th>
                  <th className="py-4 px-6 text-right">Tùy chọn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-sm text-slate-650">
                {sortedRoles.map((role) => (
                  <tr key={role.id} className={cn("hover:bg-slate-50/40 transition-colors", !role.isActive && "bg-rose-50/5")}>
                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-slate-400 text-xs font-bold">
                      ROL-{String(role.id).padStart(3, '0')}
                    </td>
                    
                    {/* Role Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "p-2 rounded-xl shrink-0 shadow-inner",
                          role.id === 1 ? 'bg-orange-50 text-orange-500' :
                          role.id === 2 ? 'bg-sky-50 text-sky-500' :
                          role.id === 3 ? 'bg-purple-50 text-purple-500' : 'bg-gray-50 text-gray-500'
                        )}>
                          <Shield className="w-4.5 h-4.5" />
                        </div>
                        <span className="font-extrabold text-slate-900 text-sm">{role.roleName}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 max-w-xs md:max-w-md truncate font-medium text-slate-500 text-xs">
                      {role.description}
                    </td>

                    {/* Active Status */}
                    <td className="py-4 px-4 text-center">
                      <span className={cn(
                        "inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                        role.isActive
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-rose-50 text-rose-500 border border-rose-100'
                      )}>
                        {role.isActive ? 'Kích hoạt' : 'Đã tắt'}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="py-4 px-4 text-slate-400 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-350" />
                        {formatDateDMY(role.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(role)}
                          className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-650 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer border border-teal-100"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(role)}
                          className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-500 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer border border-sky-100"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(role)}
                          className={cn(
                            "p-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer border",
                            role.isActive 
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-500 border-rose-100' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-500 border-emerald-100'
                          )}
                          title={role.isActive ? "Tắt hoạt động" : "Bật hoạt động"}
                        >
                          <Power className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer border border-slate-200"
                          title="Xóa vai trò"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
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
                "px-8 py-6 flex items-center justify-between border-b",
                modalType === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10' :
                modalType === 'edit' ? 'bg-sky-50 border-sky-100' : 'bg-purple-50 border-purple-100'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2 text-gray-900">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'detail' && <Info className="w-6 h-6 text-purple-600" />}
                    {modalType === 'add' && 'Thêm vai trò bảo mật'}
                    {modalType === 'edit' && `Chỉnh sửa: ${selectedRole?.roleName}`}
                    {modalType === 'detail' && 'Chi tiết vai trò bảo mật'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Khai báo các đặc quyền cùng mô tả phân cấp mới'}
                    {modalType === 'edit' && 'Cập nhật lại quyền hạn hoặc tắt mở trạng thái hoạt động'}
                    {modalType === 'detail' && 'Toàn bộ dữ liệu của Role thuộc cơ sở dữ liệu ROLES'}
                  </p>
                </div>
                <button onClick={handleCloseModal} className="p-2.5 hover:bg-white/70 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              {modalType === 'detail' && selectedRole ? (
                <DetailView role={selectedRole} onClose={handleCloseModal} />
              ) : (
                <form onSubmit={handleSaveRole} className="app-modal-body p-8 md:p-10 space-y-6">
                  <div className="space-y-6">
                    {/* RoleName — dropdown enum */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Tên vai trò <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <CustomSelect
                        value={formRoleName}
                        onChange={(val) => setFormRoleName(val as UserRoleEnum)}
                        variant="form"
                        options={ROLE_NAME_OPTIONS}
                      />
                      <p className="text-[10px] text-gray-400 font-bold ml-1">
                        BE chỉ chấp nhận các giá trị enum cố định: Admin, Teacher, Parent, Child.
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Mô tả chi tiết đặc quyền <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Mô tả cụ thể phạm vi tiếp cận dữ liệu và quyền truy cập chức năng của vai trò..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700 resize-y"
                      />
                    </div>

                    {/* IsActive — chỉ hiện khi Edit */}
                    {modalType === 'edit' && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Trạng thái hoạt động
                        </label>
                        <div className="flex gap-4 pt-1">
                          {[
                            { value: true, label: 'Kích hoạt', sub: 'Nhóm tài khoản thuộc vai trò sẽ được cấp quyền' },
                            { value: false, label: 'Bản nháp', sub: 'Kênh vai trò tạm thời vô hiệu' },
                          ].map((item) => (
                            <label
                              key={String(item.value)}
                              className={cn(
                                "flex-1 border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer select-none transition-all",
                                formIsActive === item.value
                                  ? 'border-[#4EACAF] ring-4 ring-[#4EACAF]/10 bg-white'
                                  : 'hover:bg-gray-50 border-gray-100'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="formIsActive"
                                  checked={formIsActive === item.value}
                                  onChange={() => setFormIsActive(item.value)}
                                  className="w-4 h-4 text-[#4EACAF] focus:ring-[#4EACAF]"
                                />
                                <div className="text-left font-bold">
                                  <p className="text-sm text-gray-900">{item.label}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                                </div>
                              </div>
                              {item.value
                                ? <ToggleRight className={cn("w-8 h-8", formIsActive ? "text-[#4EACAF]" : "text-gray-300")} />
                                : <ToggleLeft className={cn("w-8 h-8", !formIsActive ? "text-rose-400" : "text-gray-300")} />
                              }
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="app-modal-actions pt-6 border-t border-gray-100 flex gap-4">
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
                      className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/10 transition-all active:scale-98 uppercase text-sm tracking-widest disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
                        : 'Lưu cấu hình'
                      }
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

function RoleCard({
  role,
  onDetail,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  role: RoleResponse;
  onDetail: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  // Màu icon theo id (giữ nguyên visual cũ)
  const iconColor =
    role.id === 1 ? 'bg-orange-50 text-orange-500' :
    role.id === 2 ? 'bg-sky-50 text-sky-500' :
    role.id === 3 ? 'bg-purple-50 text-purple-500' : 'bg-gray-50 text-gray-500';

  return (
    <motion.div
      layout
      className={cn(
        "bg-white rounded-[40px] p-8 md:p-10 border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        role.isActive ? "border-gray-100/70" : "border-rose-100/50 bg-rose-50/5"
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-2xl shrink-0 shadow-inner", iconColor)}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded-md text-gray-400 font-extrabold uppercase">
                ID: {role.id}
              </span>
              <h3 className="text-2xl font-black tracking-tight text-gray-900 mt-1">{role.roleName}</h3>
            </div>
          </div>
          <span className={cn(
            "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest",
            role.isActive
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              : 'bg-rose-50/70 text-rose-500 border border-rose-100'
          )}>
            {role.isActive ? 'Kích hoạt' : 'Đã tắt'}
          </span>
        </div>
        <p className="text-gray-500 font-bold text-sm md:text-base leading-relaxed mb-8 min-h-[60px]">
          {role.description}
        </p>
      </div>

      <div className="pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
          <Calendar className="w-3.5 h-3.5 text-gray-300" />
          <span>Lập: {formatDateDMY(role.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onDetail} className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-2xl transition-all" title="Xem chi tiết">
            <Eye className="w-4.5 h-4.5" />
          </button>
          <button onClick={onEdit} className="p-3 bg-sky-50 hover:bg-sky-100 text-sky-500 rounded-2xl transition-all" title="Chỉnh sửa">
            <Edit3 className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={onToggleActive}
            className={cn("p-3 rounded-2xl transition-all",
              role.isActive ? 'bg-rose-50 hover:bg-rose-100 text-rose-500' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-500'
            )}
            title={role.isActive ? "Tắt hoạt động" : "Bật hoạt động"}
          >
            <Power className="w-4.5 h-4.5" />
          </button>
          <button onClick={onDelete} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all" title="Xóa vai trò">
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DetailView({ role, onClose }: { role: RoleResponse; onClose: () => void }) {
  return (
    <div className="app-modal-body p-8 md:p-10 space-y-4">
      <div className="flex flex-col md:flex-row gap-8 items-start pb-6 border-b border-gray-50">
        <div className="w-24 h-24 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mx-auto md:mx-0">
          <Shield className="w-12 h-12 text-purple-500" />
        </div>
        <div className="space-y-3 flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="text-2xl font-medium text-slate-800">{role.roleName}</span>
            <span className="px-3 py-0.5 bg-gray-100 text-gray-400 font-mono font-black tracking-widest text-[9px] rounded-full uppercase">
              ID: {role.id}
            </span>
          </div>
          <p className="text-gray-400 font-bold">Quản lý bảo mật truy cập</p>
          <span className={cn(
            "inline-flex items-center px-3 py-0.5 rounded-full uppercase text-[10px] font-bold",
            role.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
          )}>
            {role.isActive ? 'Hoạt động bình thường' : 'Đã dừng hoạt động'}
          </span>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#FDFCF5] border border-[#F2ECD8]/50 space-y-2">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Mô tả đặc tính vai trò</p>
        <p className="text-sm text-gray-700 font-bold leading-relaxed">{role.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailRowItem label="Thời điểm khởi tạo" value={formatDateDMY(role.createdAt)} />
        <DetailRowItem label="Cập nhật lần cuối" value={role.updatedAt ? formatDateDMY(role.updatedAt) : 'Chưa cập nhật'} />
      </div>

      <div className="bg-purple-50/50 p-5 rounded-3xl border border-purple-100/50 space-y-1">
        <p className="font-extrabold text-purple-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
          <KeyRound className="w-4.5 h-4.5 shrink-0" />
          Chính sách Bảo mật & RBAC
        </p>
        <p className="text-gray-500 font-bold text-xs leading-relaxed">
          Mã định danh bảo mật và quyền hạn vai trò (Id) được cấu hình theo cơ chế Phân Quyền Theo Vai Trò (Role-Based Access Control). Hãy cân nhắc kỹ lưỡng trước khi thay đổi.
        </p>
      </div>

      <div className="flex justify-end">
        <button onClick={onClose} className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl transition-all">
          Đóng lại
        </button>
      </div>
    </div>
  );
}

function StatItem({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  borderColor = 'border-slate-100',
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border', bgColor, borderColor)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">{title}</p>
        {subtitle && <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">{subtitle}</p>}
      </div>
    </div>
  );
}

function DetailRowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 p-4 rounded-2xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</span>
      <span className="font-bold text-gray-800 break-all text-sm block">{value}</span>
    </div>
  );
}
