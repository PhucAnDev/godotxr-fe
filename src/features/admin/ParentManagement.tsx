import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Plus, 
  Search, 
  ChevronDown, 
  X, 
  Check, 
  Eye, 
  Edit3, 
  Lock, 
  Unlock, 
  Calendar, 
  ShieldCheck, 
  Smile, 
  Sparkles,
  Mail,
  Phone,
  AlertTriangle,
  Info,
  Baby,
  Heart,
  Award,
  BookOpen
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';

// DB-related interfaces
interface ParentUser {
  UserId: string;
  RoleId: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Status: 'Active' | 'Inactive' | 'Locked';
  CreatedAt: string;
  UpdatedAt: string;
}

interface Child {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Note: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
}

// Initial mock data matching database requirements
const INITIAL_PARENTS: ParentUser[] = [
  {
    UserId: 'USR-003',
    RoleId: 'ROL-003',
    FullName: 'Phạm Minh Anh',
    Email: 'anvvpse172634@fpt.edu.vn',
    PhoneNumber: '0901234567',
    Status: 'Active',
    CreatedAt: '2026-05-18 10:25',
    UpdatedAt: '2026-05-28 11:15'
  },
  {
    UserId: 'USR-005',
    RoleId: 'ROL-003',
    FullName: 'Bùi Thị Lan',
    Email: 'lan.bui@gmail.com',
    PhoneNumber: '0978123456',
    Status: 'Locked',
    CreatedAt: '2026-04-05 15:45',
    UpdatedAt: '2026-05-25 09:00'
  },
  {
    UserId: 'USR-006',
    RoleId: 'ROL-003',
    FullName: 'Hoàng Quốc Việt',
    Email: 'viet.hoang@yahoo.com',
    PhoneNumber: '0945678901',
    Status: 'Active',
    CreatedAt: '2026-05-19 11:10',
    UpdatedAt: '2026-05-19 11:10'
  },
  {
    UserId: 'USR-007',
    RoleId: 'ROL-003',
    FullName: 'Nguyễn Thanh Sơn',
    Email: 'son.nguyen@outlook.com',
    PhoneNumber: '0933221100',
    Status: 'Active',
    CreatedAt: '2026-03-12 14:20',
    UpdatedAt: '2026-05-01 16:30'
  },
  {
    UserId: 'USR-008',
    RoleId: 'ROL-003',
    FullName: 'Vũ Thị Hương',
    Email: 'huong.vu@hotmail.com',
    PhoneNumber: '0966778899',
    Status: 'Inactive',
    CreatedAt: '2026-05-27 08:00',
    UpdatedAt: '2026-05-27 08:00'
  }
];

const INITIAL_CHILDREN: Child[] = [
  {
    ChildId: 'CHD-001',
    ParentUserId: 'USR-003',
    FullName: 'Leo (Phạm Minh Đức)',
    Age: 6,
    Gender: 'Male',
    LearningLevel: 'Cấp độ 4 - Phát âm nâng cao',
    Note: 'Bé cần chú trọng nhiều hơn các phụ âm kép tr, ch, s.',
    Status: 'Active',
    CreatedAt: '2026-05-18 10:30',
    UpdatedAt: '2026-05-28 11:00'
  },
  {
    ChildId: 'CHD-002',
    ParentUserId: 'USR-003',
    FullName: 'Mimi (Phạm Ngọc Linh)',
    Age: 4,
    Gender: 'Female',
    LearningLevel: 'Cấp độ 1 - Nhận diện âm cơ bản',
    Note: 'Mới bắt đầu làm quen với AR/VR, hứng thú với các thẻ chữ động vật.',
    Status: 'Active',
    CreatedAt: '2026-05-20 09:00',
    UpdatedAt: '2026-05-20 09:00'
  },
  {
    ChildId: 'CHD-003',
    ParentUserId: 'USR-005',
    FullName: 'Bi (Nguyễn Đức Huy)',
    Age: 5,
    Gender: 'Male',
    LearningLevel: 'Cấp độ 3 - Từ kép & Câu đơn',
    Note: 'Hay mất tập trung khi đeo kính VR lâu, nên cho bé giải lao sau mỗi 10 phút.',
    Status: 'Active',
    CreatedAt: '2026-04-05 16:00',
    UpdatedAt: '2026-05-25 09:00'
  },
  {
    ChildId: 'CHD-004',
    ParentUserId: 'USR-007',
    FullName: 'Sơn con (Nguyễn Thanh Lâm)',
    Age: 7,
    Gender: 'Male',
    LearningLevel: 'Cấp độ 5 - Hội thoại giao tiếp tự do',
    Note: 'Sử dụng kính VR rất thành thạo, phát âm đều đặn tốt.',
    Status: 'Active',
    CreatedAt: '2026-03-12 15:00',
    UpdatedAt: '2026-05-01 16:30'
  },
  {
    ChildId: 'CHD-005',
    ParentUserId: 'USR-007',
    FullName: 'Tép (Nguyễn Hải Yến)',
    Age: 3,
    Gender: 'Female',
    LearningLevel: 'Cấp độ 1 - Bắt chước âm thanh con vật',
    Note: 'Cần cha mẹ ngồi kèm để hỗ trợ thao tác.',
    Status: 'Active',
    CreatedAt: '2026-03-12 15:10',
    UpdatedAt: '2026-05-01 16:30'
  }
];

export default function ParentManagement() {
  const [parents, setParents] = useState<ParentUser[]>(INITIAL_PARENTS);
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Modal systems
  const [modalType, setModalType] = useState<'add' | 'edit' | 'detail' | 'children' | null>(null);
  const [selectedParent, setSelectedParent] = useState<ParentUser | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form systems
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Locked'>('Active');

  // Trigger transient notices helper
  const triggerNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => {
      setAlertConfig(null);
    }, 4000);
  };

  // Basic KPI computations
  const totalParents = parents.length;
  const activeParents = parents.filter(p => p.Status === 'Active').length;
  const totalChildrenCount = children.filter(c => c.Status === 'Active').length;
  const thisMonthParents = parents.filter(p => p.CreatedAt.includes('2026-05')).length;

  // Handlers for modal dispatching
  const handleOpenAdd = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhoneNumber('');
    setFormStatus('Active');
    setSelectedParent(null);
    setModalType('add');
  };

  const handleOpenEdit = (parent: ParentUser) => {
    setSelectedParent(parent);
    setFormFullName(parent.FullName);
    setFormEmail(parent.Email);
    setFormPhoneNumber(parent.PhoneNumber);
    setFormStatus(parent.Status);
    setModalType('edit');
  };

  const handleOpenDetail = (parent: ParentUser) => {
    setSelectedParent(parent);
    setModalType('detail');
  };

  const handleOpenChildren = (parent: ParentUser) => {
    setSelectedParent(parent);
    setModalType('children');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedParent(null);
  };

  // Submit Handler
  const handleSaveParent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formFullName || !formEmail) {
      triggerNotification('Vui lòng điền đủ Họ tên và Email liên hệ!', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      triggerNotification('Email không đúng định dạng thông dụng!', 'warning');
      return;
    }

    if (modalType === 'add') {
      const newParent: ParentUser = {
        UserId: `USR-${String(100 + parents.length + 1)}`, // simulate high id
        RoleId: 'ROL-003',
        FullName: formFullName,
        Email: formEmail,
        PhoneNumber: formPhoneNumber || 'Chưa cung cấp',
        Status: formStatus,
        CreatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setParents([newParent, ...parents]);
      triggerNotification(`Đã tạo thành công tài khoản phụ huynh "${formFullName}"!`);
    } else if (modalType === 'edit' && selectedParent) {
      setParents(parents.map(p => p.UserId === selectedParent.UserId ? {
        ...p,
        FullName: formFullName,
        Email: formEmail,
        PhoneNumber: formPhoneNumber || 'Chưa cung cấp',
        Status: formStatus,
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      } : p));

      triggerNotification(`Cập nhật thông tin phụ huynh "${formFullName}" thành công!`);
    }

    handleCloseModal();
  };

  // Lock status swap directly
  const handleToggleLockStatus = (parent: ParentUser) => {
    const isCurrentlyLocked = parent.Status === 'Locked';
    const nextStatus = isCurrentlyLocked ? 'Active' : 'Locked';

    setParents(parents.map(p => p.UserId === parent.UserId ? {
      ...p,
      Status: nextStatus,
      UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    } : p));

    triggerNotification(
      nextStatus === 'Locked' 
        ? `Đã đình chỉ hoạt động của phụ huynh "${parent.FullName}"`
        : `Đã khôi phục hoạt động của phụ huynh "${parent.FullName}"`,
      nextStatus === 'Locked' ? 'warning' : 'success'
    );
  };

  // Filtering calculation
  const filteredParents = parents.filter(p => {
    const searchString = `${p.FullName} ${p.Email} ${p.PhoneNumber}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || p.Status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredParents.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedParents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredParents.slice(startIndex, startIndex + pageSize);
  }, [filteredParents, currentPage, pageSize]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative">
      
      {/* Toast alert banner */}
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
            <Heart className="w-3.5 h-3.5 fill-current" />
            Vận hành hệ thống
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-2 pb-0.5 font-sans">
            Quản lý Phụ huynh
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kiểm soát tài khoản phụ huynh, ghi nhận thông tin trẻ em đang tham gia các chương trình can thiệp phát âm, phục hồi ngôn ngữ thực tế ảo GodotXR.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#3d8c8e] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm phụ huynh mới
        </button>
      </div>

      {/* 2. Statistic Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem 
          title="Tổng phụ huynh" 
          value={totalParents} 
          subtitle="Tài khoản vai trò Parent" 
          icon={<Users className="w-5 h-5 text-[#4EACAF]" />} 
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Đang hoạt động" 
          value={activeParents} 
          subtitle={`${activeParents} cha mẹ kết nối`} 
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />} 
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Bé được quản lý" 
          value={totalChildrenCount} 
          subtitle="Hồ sơ trẻ liên kết thành công" 
          icon={<Baby className="w-5 h-5 text-amber-600" />} 
          bgColor="bg-amber-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Phụ huynh mới" 
          value={thisMonthParents} 
          subtitle="Tham gia trong tháng 5/2026" 
          icon={<Sparkles className="w-5 h-5 text-[#FF8E8E]" />} 
          bgColor="bg-rose-50/70"
          borderColor="border-slate-100"
        />
      </div>

      {/* 3. Search and Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
          <input 
            type="text" 
            placeholder="Tìm theo tên cha mẹ, địa chỉ email, số điện thoại..." 
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-56 appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-700 outline-none cursor-pointer pr-10 text-xs"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Chưa kích hoạt</option>
            <option value="Locked">Đã khóa</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 4. Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-none">Danh sách phụ huynh</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Đang hiển thị {filteredParents.length} trong tổng số {totalParents} phụ huynh</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hạ tầng liên kết gia đình</span>
          </div>
        </div>

        {filteredParents.length === 0 ? (
          <div className="py-24 text-center space-y-4">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-200">
               <Users className="w-8 h-8 text-gray-300" />
             </div>
             <div className="space-y-1">
                <p className="text-xl font-black text-gray-700">Không tìm thấy phụ huynh phù hợp!</p>
                <p className="text-gray-400 font-medium text-sm">Vui lòng điều chỉnh lại bộ lọc hoặc nhập từ khóa tìm kiếm mới.</p>
             </div>
             <button 
               onClick={() => {
                 setSearchQuery('');
                 setFilterStatus('ALL');
               }}
               className="px-5 py-2 hover:bg-gray-100 rounded-xl font-black text-xs text-[#4EACAF] border border-gray-200 uppercase transition-all"
             >
               Đặt lại bộ lọc
             </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDFCF5]/50 border-b border-gray-100 text-[#555] font-bold text-xs uppercase tracking-widest">
                    <th className="py-5 px-10">Mã Người dùng</th>
                    <th className="py-5 px-6">Phụ huynh</th>
                    <th className="py-5 px-6">Email hệ thống</th>
                    <th className="py-5 px-6">Số điện thoại</th>
                    <th className="py-5 px-6">Số trẻ liên kết</th>
                    <th className="py-5 px-6">Trạng thái</th>
                    <th className="py-5 px-6">Thành viên từ</th>
                    <th className="py-5 px-10 text-right">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {paginatedParents.map((parent) => {
                    const correlatedChildren = children.filter(c => c.ParentUserId === parent.UserId);
                    return (
                      <tr 
                        key={parent.UserId} 
                        className="hover:bg-gray-50/40 transition-colors"
                      >
                        <td className="py-5 px-10 font-mono text-gray-400 font-black text-xs">
                          {parent.UserId}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <img 
                              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${parent.FullName}`} 
                              alt={parent.FullName} 
                              className="w-10 h-10 rounded-2xl bg-rose-50/50 border border-rose-100/30"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-extrabold text-gray-900 text-base">{parent.FullName}</p>
                              <p className="text-xs text-gray-400 font-medium pt-0.5">Vai trò: Phụ huynh</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-1.5 text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{parent.Email}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-1.5 text-gray-900">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{parent.PhoneNumber}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <button 
                            onClick={() => handleOpenChildren(parent)}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-100 rounded-full text-xs font-black transition-all hover:scale-105"
                          >
                            <Baby className="w-3.5 h-3.5" />
                            {correlatedChildren.length} Trẻ nhỏ
                          </button>
                        </td>
                        <td className="py-5 px-6">
                          <span className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                            parent.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                            parent.Status === 'Inactive' ? 'bg-gray-100 text-gray-500' : 'bg-rose-50 text-rose-600'
                          )}>
                            {parent.Status === 'Active' ? 'Hoạt động' :
                             parent.Status === 'Inactive' ? 'Chưa kích hoạt' : 'Bị khóa'}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-gray-400 font-medium text-xs">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-gray-300" />
                            {parent.CreatedAt}
                          </div>
                        </td>
                        <td className="py-5 px-10 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenDetail(parent)}
                              className="p-2 hover:bg-teal-50 text-teal-600 rounded-xl transition-colors hover:scale-105"
                              title="Thông tin chi tiết"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleOpenEdit(parent)}
                              className="p-2 hover:bg-sky-50 text-sky-500 rounded-xl transition-colors hover:scale-105"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit3 className="w-4.5 h-4.5" />
                            </button>

                            <button 
                              onClick={() => handleToggleLockStatus(parent)}
                              className={cn(
                                "p-2 rounded-xl transition-colors hover:scale-105",
                                parent.Status === 'Locked' 
                                  ? 'hover:bg-emerald-50 text-emerald-500' 
                                  : 'hover:bg-rose-50 text-rose-500'
                              )}
                              title={parent.Status === 'Locked' ? "Mở khóa tài khoản" : "Khóa tài khoản phụ huynh"}
                            >
                              {parent.Status === 'Locked' ? (
                                <Unlock className="w-4.5 h-4.5" />
                              ) : (
                                <Lock className="w-4.5 h-4.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-6 border-t border-slate-50">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredParents.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="phụ huynh"
              />
            </div>
          </>
        )}
      </div>

      {/* Aesthetic pairing decoration bar for children-like applet vibe */}
      <div className="flex items-center justify-center gap-4 bg-orange-50/40 p-6 rounded-[32px] border-2 border-orange-100 max-w-lg mx-auto">
        <Smile className="w-10 h-10 text-orange-400 fill-current shrink-0 animate-pulse" />
        <p className="text-gray-500 font-bold text-xs md:text-sm italic leading-snug text-center">
          "Cha mẹ tham gia tích cực vào quá trình luyện âm là chìa khóa vàng giúp các con tự tin giao tiếp, thắp sáng tương lai."
        </p>
      </div>

      {/* 5. Modals Overlays */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto w-full h-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30 animate-out duration-200"
            >
              {/* Modal Header */}
              <div className={cn(
                "px-8 py-6 flex items-center justify-between border-b",
                modalType === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' :
                modalType === 'edit' ? 'bg-sky-50 border-sky-100 text-gray-900' :
                modalType === 'children' ? 'bg-purple-50 border-purple-100 text-gray-900' : 'bg-purple-50 border-purple-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'detail' && <Info className="w-6 h-6 text-purple-600" />}
                    {modalType === 'children' && <Baby className="w-6 h-6 text-purple-600" />}
                    {modalType === 'add' && 'Tạo tài khoản phụ huynh'}
                    {modalType === 'edit' && `Chỉnh sửa: Phụ huynh ${selectedParent?.FullName}`}
                    {modalType === 'detail' && 'Chi tiết thông tin phụ huynh'}
                    {modalType === 'children' && `Danh sách trẻ: Phụ huynh ${selectedParent?.FullName}`}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Liên kết tài khoản người dùng và thông tin chăm sóc'}
                    {modalType === 'edit' && 'Cập nhật lại quyền hoạt động hoặc thông tin phục vụ liên lạc'}
                    {modalType === 'detail' && 'Toàn bộ thông tin đăng ký cơ sở dữ liệu USERS'}
                    {modalType === 'children' && 'Hồ sơ trẻ em liên đới trực thuộc quản lý gia đình'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body: Detail area */}
              {modalType === 'detail' && selectedParent ? (
                <div className="p-8 md:p-10 space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start pb-6 border-b border-gray-50">
                     <div className="w-24 h-24 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center p-3 shrink-0 mx-auto md:mx-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedParent.FullName}`} 
                          alt="Detail Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                     </div>
                     <div className="space-y-3 flex-1 text-center md:text-left">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                             <span className="text-2xl font-black text-gray-900">{selectedParent.FullName}</span>
                             <span className="px-3 py-0.5 bg-gray-100 text-gray-400 font-black tracking-widest text-[9px] rounded-full uppercase">
                               ID: {selectedParent.UserId}
                             </span>
                          </div>
                          <p className="text-gray-400 font-bold">Email đăng nhập: {selectedParent.Email}</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold pt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full italic bg-purple-50 text-purple-600 tracking-tight uppercase text-[10px]">
                            Vai trò: Parent (Phụ huynh)
                          </span>

                          <span className={cn(
                            "inline-flex items-center px-3 py-0.5 rounded-full uppercase text-[10px]",
                            selectedParent.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                            selectedParent.Status === 'Inactive' ? 'bg-gray-100 text-gray-500' : 'bg-rose-50 text-rose-600'
                          )}>
                            {selectedParent.Status === 'Active' ? 'Đang hoạt động' :
                             selectedParent.Status === 'Inactive' ? 'Nháp/Chờ duyệt' : 'Mất an toàn/Đã khóa'}
                          </span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                     <DetailRow 
                       label="Họ và Tên đầy đủ (FullName)" 
                       value={selectedParent.FullName} 
                     />
                     <DetailRow 
                       label="Địa chỉ Email" 
                       value={selectedParent.Email} 
                     />
                     <DetailRow 
                       label="Số điện thoại liên lạc" 
                       value={selectedParent.PhoneNumber} 
                     />
                     <DetailRow 
                       label="Quản lý bởi Vai trò (RoleId)" 
                       value="ROL-003 - Parent" 
                     />
                     <DetailRow 
                       label="Thời điểm khởi tạo (CreatedAt)" 
                       value={selectedParent.CreatedAt} 
                     />
                     <DetailRow 
                       label="Cập nhật lần cuối (UpdatedAt)" 
                       value={selectedParent.UpdatedAt} 
                     />
                  </div>

                  <div className="bg-purple-50/50 p-5 rounded-3xl border border-purple-100/50 text-[#555] font-bold text-xs leading-relaxed space-y-1">
                     <p className="font-extrabold text-purple-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                       <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                       Chính sách liên kết bảo mật cơ sở dữ liệu (Schema USERS + CHILD)
                     </p>
                     <p className="opacity-85 text-gray-500">Mọi hồ sơ của trẻ nhỏ (CHILD) liên kết với Phụ huynh (ParentUserId) luôn được cam kết bảo vệ an toàn theo thông lệ bảo mật dữ liệu giáo dục chuẩn y khoa.</p>
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
              ) : modalType === 'children' && selectedParent ? (
                /* Modal Body: Children linked to Parent */
                <div className="p-8 md:p-10 space-y-6">
                   <div className="flex items-center gap-4 bg-purple-50 p-5 rounded-3xl border border-purple-100">
                      <Baby className="w-10 h-10 text-purple-500 shrink-0" />
                      <div>
                         <p className="font-black text-gray-800">Trẻ em được gia đình bảo lãnh</p>
                         <p className="text-xs text-gray-500 font-bold">Quản lý các thông số về độ tuổi, giới tính và cấp độ luyện tập hiện tại của bé.</p>
                      </div>
                   </div>

                   {children.filter(c => c.ParentUserId === selectedParent.UserId).length === 0 ? (
                      <div className="py-12 text-center space-y-2 border-2 border-dashed border-gray-150 rounded-[32px]">
                         <p className="font-bold text-gray-600 text-base">Chưa tạo hồ sơ cho bé nào!</p>
                         <p className="text-xs text-gray-400">Phụ huynh có thể tự thêm hồ sơ bé hoặc liên lạc quản trị viên để cập nhật dữ liệu trẻ nhỏ.</p>
                      </div>
                   ) : (
                      <div className="space-y-4">
                         {children.filter(c => c.ParentUserId === selectedParent.UserId).map((child) => (
                            <div key={child.ChildId} className="p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-purple-200 transition-colors space-y-3">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <img 
                                       src={`https://api.dicebear.com/7.x/bottts/svg?seed=${child.FullName}`} 
                                       alt={child.FullName} 
                                       className="w-10 h-10 rounded-xl bg-[#FDFCF5] border border-orange-100"
                                       referrerPolicy="no-referrer"
                                     />
                                     <div>
                                        <p className="font-black text-gray-800 text-base">{child.FullName}</p>
                                        <p className="text-xs text-gray-400 font-bold">{child.Age} Tuổi • Giới tính: {child.Gender === 'Male' ? 'Nam' : child.Gender === 'Female' ? 'Nữ' : 'Khác'}</p>
                                     </div>
                                  </div>
                                  <span className="text-[10px] bg-purple-50 text-purple-600 font-black px-2.5 py-0.5 rounded-full uppercase">{child.ChildId}</span>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                                  <div className="flex items-center gap-1.5 text-gray-500 font-bold">
                                     <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
                                     <span>Trình độ: <span className="text-purple-600">{child.LearningLevel}</span></span>
                                  </div>
                                  <div className="flex items-start gap-1.5 text-gray-400 font-medium">
                                     <Smile className="w-4 h-4 text-[#FFD93D] shrink-0 mt-0.5" />
                                     <span className="line-clamp-2">Lưu ý: {child.Note}</span>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}

                   <div className="flex justify-end pt-4 border-t border-gray-100">
                     <button 
                       onClick={handleCloseModal}
                       className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl transition-all"
                     >
                       Quay lại
                     </button>
                   </div>
                </div>
              ) : (
                /* Modal Body: Add/Edit Form */
                <form onSubmit={handleSaveParent} className="p-8 md:p-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Họ và Tên phụ huynh đầy đủ <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ví dụ: Phạm Minh Anh"
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Quy kết hòm thư liên hệ (Email) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="vi-du@gmail.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Số điện thoại di động
                      </label>
                      <input 
                        type="text" 
                        placeholder="Di động liên lạc khẩn"
                        value={formPhoneNumber}
                        onChange={(e) => setFormPhoneNumber(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700" 
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Trạng thái hoạt động tài khoản
                      </label>
                      <div className="relative">
                        <select 
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF]"
                        >
                          <option value="Active">🟢 Hoạt động bình thường</option>
                          <option value="Inactive">🟡 Đăng ký mới bản nháp (Nháp)</option>
                          <option value="Locked">🔴 Tạm ngắt kết nối khóa tài khoản</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex gap-4">
                     <button 
                       type="button"
                       onClick={handleCloseModal}
                       className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-sm tracking-widest"
                     >
                       Quay lại
                     </button>
                     <button 
                       type="submit"
                       className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/10 transition-all active:scale-98 uppercase text-sm tracking-widest"
                     >
                       Lưu hồ sơ
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

// Stats Card Item Component
function StatItem({ 
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
            <p className="text-[11px] text-gray-500 font-medium pt-1 line-clamp-1">{subtitle}</p>
         </div>
      </div>
    </div>
  );
}

// Detail Column Row Item
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 p-4 rounded-2xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40">
       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</span>
       <span className="font-bold text-gray-800 break-all text-sm block">
         {value}
       </span>
    </div>
  );
}
