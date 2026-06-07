import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Users, 
  KeyRound, 
  ShieldAlert, 
  Plus, 
  Search, 
  Edit3, 
  Eye, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  ChevronDown,
  Info,
  Power,
  ToggleLeft,
  ToggleRight,
  Smile,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Roles Interface matching database schema
interface Role {
  RoleId: string;
  RoleName: string;
  Description: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

const INITIAL_ROLES: Role[] = [
  {
    RoleId: 'ROL-001',
    RoleName: 'Admin',
    Description: 'Quản trị viên hệ thống có toàn quyền cấu hình, quản trị tài nguyên, quản lý người dùng và cấu hình thiết lập bảo mật cấp cao.',
    IsActive: true,
    CreatedAt: '2026-01-01 08:00',
    UpdatedAt: '2026-01-01 08:00'
  },
  {
    RoleId: 'ROL-002',
    RoleName: 'Teacher',
    Description: 'Giáo viên tham gia tạo lớp học, biên soạn các bài tập phát âm thông qua VR/XR, theo dõi lịch sử và đề xuất hỗ trợ ngôn ngữ kịp thời.',
    IsActive: true,
    CreatedAt: '2026-01-01 08:00',
    UpdatedAt: '2026-02-10 14:30'
  },
  {
    RoleId: 'ROL-003',
    RoleName: 'Parent',
    Description: 'Phụ huynh kết nối hồ sơ cho trẻ em, lựa chọn bài luyện tập, xem video phát âm trực quan và cộng tác cùng giáo viên hỗ trợ trẻ.',
    IsActive: true,
    CreatedAt: '2026-01-01 08:00',
    UpdatedAt: '2026-03-15 09:12'
  }
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('ALL');

  // Modal control states
  const [modalType, setModalType] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Notification Toast state
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form states
  const [formRoleName, setFormRoleName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Trigger transient notices helper
  const triggerNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => {
      setAlertConfig(null);
    }, 4000);
  };

  // Calculations for statistics
  const totalRoles = roles.length;
  const activeRoles = roles.filter(r => r.IsActive).length;
  const inactiveRoles = roles.filter(r => !r.IsActive).length;

  // Open Add Role Modal
  const handleOpenAdd = () => {
    setFormRoleName('');
    setFormDescription('');
    setFormIsActive(true);
    setSelectedRole(null);
    setModalType('add');
  };

  // Open Edit Role Modal
  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setFormRoleName(role.RoleName);
    setFormDescription(role.Description);
    setFormIsActive(role.IsActive);
    setModalType('edit');
  };

  // Open Detail Modal
  const handleOpenDetail = (role: Role) => {
    setSelectedRole(role);
    setModalType('detail');
  };

  // Close Modals
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedRole(null);
  };

  // Add or Edit Submission logic
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRoleName || !formDescription) {
      triggerNotification('Vui lòng điền đủ Tên vai trò và Mô tả!', 'warning');
      return;
    }

    if (modalType === 'add') {
      const newRole: Role = {
        RoleId: `ROL-${String(roles.length + 1).padStart(3, '0')}`,
        RoleName: formRoleName,
        Description: formDescription,
        IsActive: formIsActive,
        CreatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      setRoles([newRole, ...roles]);
      triggerNotification(`Đã tạo thành công vai trò "${formRoleName}"!`);
    } else if (modalType === 'edit' && selectedRole) {
      setRoles(roles.map(r => r.RoleId === selectedRole.RoleId ? {
        ...r,
        RoleName: formRoleName,
        Description: formDescription,
        IsActive: formIsActive,
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      } : r));
      triggerNotification(`Cập nhật thông tin vai trò "${formRoleName}" thành công!`);
    }

    handleCloseModal();
  };

  // Toggle role active/inactive state
  const handleToggleActive = (role: Role) => {
    const nextActive = !role.IsActive;
    const message = nextActive 
      ? `Đã kích hoạt hoạt động của vai trò "${role.RoleName}"!` 
      : `Đã tắt/vô hiệu hóa vai trò "${role.RoleName}"!`;
    
    setRoles(roles.map(r => r.RoleId === role.RoleId ? {
      ...r,
      IsActive: nextActive,
      UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    } : r));

    triggerNotification(message, nextActive ? 'success' : 'warning');
  };

  // Filtering Logic
  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.RoleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.Description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.RoleId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      filterActive === 'ALL' || 
      (filterActive === 'ACTIVE' && role.IsActive) ||
      (filterActive === 'INACTIVE' && !role.IsActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative">
      
      {/* Dynamic Toast Alert */}
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
              {alertConfig.type === 'success' ? (
                <div className="bg-white/20 p-2 rounded-xl">
                  <Check className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="bg-white/20 p-2 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-black italic text-sm tracking-tight text-white">{alertConfig.message}</p>
              </div>
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

      {/* 1. Header Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-md text-[11px] font-bold uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5" />
            Bảng điều khiển Bảo mật
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-2 pb-0.5">
            Quản lý Vai trò
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Phân định quyền hạn, cấu hình giới hạn tính năng và quản lý danh sách vai trò cho học tập, can thiệp hoặc quản lý vận hành GodotXR.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#3d8c8e] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm vai trò mới
        </button>
      </div>

      {/* 2. Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Tổng vai trò" 
          value={totalRoles} 
          subtitle="Số vai trò hoạt động" 
          icon={<Shield className="w-5 h-5 text-[#4EACAF]" />} 
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatCard 
          title="Vai trò hoạt động" 
          value={activeRoles} 
          subtitle="Đang khả dụng để phân chia người dùng" 
          icon={<Check className="w-5 h-5 text-emerald-600" />} 
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatCard 
          title="Vai trò bị tắt" 
          value={inactiveRoles} 
          subtitle="Trong trạng thái nháp" 
          icon={<ToggleLeft className="w-5 h-5 text-slate-500" />} 
          bgColor="bg-slate-50"
          borderColor="border-slate-100"
        />
      </div>

      {/* 3. Filtering and controls */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
          <input 
            type="text" 
            placeholder="Tìm theo vai trò, mô tả chi tiết, mã ID..." 
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

        <div className="relative shrink-0">
          <select 
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="w-full sm:w-56 appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-700 outline-none cursor-pointer pr-10 text-xs"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Trạng thái tắt</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 4. Display list area */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredRoles.length === 0 ? (
          <div className="col-span-full bg-white rounded-[40px] py-24 text-center space-y-4 shadow-sm border border-gray-100">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-200">
               <ShieldAlert className="w-8 h-8 text-gray-300" />
             </div>
             <div className="space-y-1">
                <p className="text-xl font-black text-gray-700">Không tìm thấy vai trò phù hợp!</p>
                <p className="text-gray-400 font-medium text-sm">Vui lòng thử lại với từ khóa hoặc bộ lọc trạng thái khác.</p>
             </div>
             <button 
               onClick={() => {
                 setSearchQuery('');
                 setFilterActive('ALL');
               }}
               className="px-5 py-2 hover:bg-gray-100 rounded-xl font-black text-xs text-[#4EACAF] border border-gray-200 uppercase transition-all"
             >
               Đặt lại bộ lọc
             </button>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <motion.div
              layout
              key={role.RoleId}
              className={cn(
                "bg-white rounded-[40px] p-8 md:p-10 border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group relative overflow-hidden",
                role.IsActive ? "border-gray-100/70" : "border-rose-100/50 bg-rose-50/5"
              )}
            >
              <div>
                {/* Header indicators */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-3 rounded-2xl shrink-0 shadow-inner",
                      role.RoleId === 'ROL-001' ? 'bg-orange-50 text-orange-500' :
                      role.RoleId === 'ROL-002' ? 'bg-sky-50 text-sky-500' : 
                      role.RoleId === 'ROL-003' ? 'bg-purple-50 text-purple-500' : 'bg-gray-50 text-gray-500'
                    )}>
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded-md text-gray-400 font-extrabold uppercase">
                        {role.RoleId}
                      </span>
                      <h3 className="text-2xl font-black tracking-tight text-gray-900 mt-1">
                        {role.RoleName}
                      </h3>
                    </div>
                  </div>

                  <span className={cn(
                    "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider",
                    role.IsActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50/70 text-rose-500 border border-rose-100'
                  )}>
                    {role.IsActive ? 'Kích hoạt' : 'Đã tắt'}
                  </span>
                </div>

                <p className="text-gray-500 font-bold text-sm md:text-base leading-relaxed mb-8 min-h-[60px]">
                  {role.Description}
                </p>
              </div>

              {/* Footer row with actions */}
              <div className="pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-6 text-xs font-bold text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-300" />
                    <span>Lập: {role.CreatedAt.slice(0, 10)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDetail(role)}
                    className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-2xl transition-all"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(role)}
                    className="p-3 bg-sky-50 hover:bg-sky-100 text-sky-500 rounded-2xl transition-all"
                    title="Chỉnh sửa cấu hình"
                  >
                    <Edit3 className="w-4.5 h-4.5" />
                  </button>

                  <button
                    onClick={() => handleToggleActive(role)}
                    className={cn(
                      "p-3 rounded-2xl transition-all",
                      role.IsActive 
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-500' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-500'
                    )}
                    title={role.IsActive ? "Tắt hoạt động" : "Bật hoạt động"}
                  >
                    <Power className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Decorative prompt box keeping child friendly GodotXR elements */}
      <div className="flex items-center justify-center gap-4 bg-orange-50/40 p-6 rounded-[32px] border-2 border-orange-100 max-w-lg mx-auto">
        <Smile className="w-10 h-10 text-orange-400 fill-current shrink-0 animate-pulse" />
        <p className="text-gray-500 font-bold text-xs md:text-sm italic leading-snug">
          "Cấu hình vai trò và quyền hạn an toàn là nền tảng cốt lõi giúp phụ huynh tin tưởng, thầy cô yên tâm đồng hành cùng các bé phát âm mỗi ngày."
        </p>
      </div>

      {/* Modal overlays */}
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
                "px-8 py-6 flex items-center justify-between border-b",
                modalType === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' :
                modalType === 'edit' ? 'bg-sky-50 border-sky-100 text-gray-900' : 'bg-purple-50 border-purple-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'detail' && <Info className="w-6 h-6 text-purple-600" />}
                    {modalType === 'add' && 'Thêm vai trò bảo mật'}
                    {modalType === 'edit' && `Chỉnh sửa: ${selectedRole?.RoleName}`}
                    {modalType === 'detail' && 'Chi tiết vai trò bảo mật'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Khai báo các đặc quyền cùng mô tả phân cấp mới'}
                    {modalType === 'edit' && 'Cập nhật lại quyền hạn hoặc tắt mở trạng thái hoạt động'}
                    {modalType === 'detail' && 'Toàn bộ dữ liệu của Role thuộc cơ sở dữ liệu ROLES'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              {modalType === 'detail' && selectedRole ? (
                <div className="p-8 md:p-10 space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start pb-6 border-b border-gray-50">
                     <div className="w-24 h-24 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                        <Shield className="w-12 h-12 text-purple-500" />
                     </div>
                     <div className="space-y-3 flex-1 text-center md:text-left">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                             <span className="text-2xl font-black text-gray-900">{selectedRole.RoleName}</span>
                             <span className="px-3 py-0.5 bg-gray-100 text-gray-400 font-mono font-black tracking-widest text-[9px] rounded-full uppercase">
                               ID: {selectedRole.RoleId}
                             </span>
                          </div>
                          <p className="text-gray-400 font-bold">Quản lý bảo mật truy cập</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold pt-1">
                          <span className={cn(
                            "inline-flex items-center px-3 py-0.5 rounded-full uppercase text-[10px]",
                            selectedRole.IsActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                          )}>
                            {selectedRole.IsActive ? 'Hoạt động bình thường' : 'Đã dừng hoạt động'}
                          </span>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FDFCF5] border border-[#F2ECD8]/50 space-y-2">
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Mô tả đặc tính vai trò (Description)</p>
                     <p className="text-sm text-gray-700 font-bold leading-relaxed">{selectedRole.Description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                     <DetailRowItem 
                       label="Thời điểm khởi tạo (CreatedAt)" 
                       value={selectedRole.CreatedAt} 
                     />
                     <DetailRowItem 
                       label="Cập nhật lần cuối (UpdatedAt)" 
                       value={selectedRole.UpdatedAt} 
                     />
                  </div>

                  <div className="bg-purple-50/50 p-5 rounded-3xl border border-purple-100/50 text-[#555] font-bold text-xs leading-relaxed space-y-1">
                     <p className="font-extrabold text-purple-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                       <KeyRound className="w-4.5 h-4.5 shrink-0" />
                       Chính sách Bảo mật & RBAC
                     </p>
                     <p className="opacity-85 text-gray-500">Mã định danh bảo mật và quyền hạn vai trò (RoleId) được cấu hình theo cơ chế Phân Quyền Theo Vai Trò (Role-Based Access Control). Hãy cân nhắc kỹ lưỡng trước khi thay đổi để tránh ảnh hưởng đến người dùng hiện nhiệm.</p>
                  </div>

                  <div className="flex justify-end">
                     <button 
                       onClick={handleCloseModal}
                       className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl transition-all"
                     >
                       Đóng lại
                     </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveRole} className="p-8 md:p-10 space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Tên vai trò người dùng (RoleName) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ví dụ: Special_Admin"
                        value={formRoleName}
                        onChange={(e) => setFormRoleName(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700" 
                      />
                    </div>

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
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700 resize-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Trạng thái hoạt động khởi tạo
                      </label>
                      <div className="flex gap-4 pt-1">
                        {[
                          { value: true, label: 'Kích hoạt hoạt động', class: 'border-emerald-100 text-emerald-600' },
                          { value: false, label: 'Tạm khóa / Dự thảo', class: 'border-rose-100 text-rose-600' }
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
                                <p className="text-sm text-gray-900">{item.value ? 'Kích hoạt' : 'Bản nháp'}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{item.value ? 'Nhóm tài khoản thuộc vai trò sẽ được cấp quyền' : 'Kênh vai trò tạm thời vô hiệu'}</p>
                              </div>
                            </div>

                            {item.value ? (
                              <ToggleRight className={cn("w-8 h-8", formIsActive ? "text-[#4EACAF]" : "text-gray-300")} />
                            ) : (
                              <ToggleLeft className={cn("w-8 h-8", !formIsActive ? "text-rose-400" : "text-gray-300")} />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

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
                       className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/10 transition-all active:scale-98 uppercase text-sm tracking-widest"
                     >
                       Lưu cấu hình
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

// Stats Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  bgColor, 
  borderColor 
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
      "bg-white rounded-[32px] p-6 shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-300",
      borderColor
    )}>
      <div className={cn("absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150", bgColor)} />
      
      <div className="flex items-center gap-5 relative z-10">
         <div className={cn("p-4 rounded-2xl shadow-inner shrink-0", bgColor)}>
            {icon}
         </div>
         <div className="space-y-0.5">
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">{title}</p>
            <p className="text-3xl font-black text-gray-900 leading-none">{value.toLocaleString()}</p>
            <p className="text-[11px] text-[#888] font-medium pt-1 line-clamp-1">{subtitle}</p>
         </div>
      </div>
    </div>
  );
}

// Detail Row Item
function DetailRowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 p-4 rounded-2xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40">
       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</span>
       <span className="font-bold text-gray-800 break-all text-sm block">
         {value}
       </span>
    </div>
  );
}
