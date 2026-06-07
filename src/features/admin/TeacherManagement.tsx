import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
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
  BookOpen,
  Briefcase,
  Users,
  Compass
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';

// Teacher & User Interface matching the requested DB schemas
interface User {
  UserId: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Status: 'Active' | 'Inactive' | 'Locked';
}

interface Teacher {
  TeacherId: string;
  UserId: string;
  FullName: string;
  Specialty: string;
  Gender: 'Male' | 'Female' | 'Other';
  Status: 'Active' | 'Inactive' | 'Suspended';
  CreatedAt: string;
  UpdatedAt: string;
  ClassesManaged: string[]; // Mock list of classes managed
}

// Mock users accounts of role Teacher
const MOCK_TEACHER_USERS: User[] = [
  {
    UserId: 'USR-002',
    FullName: 'Trần Thị Hồng (Ms. Johnson)',
    Email: 'hong.johnson@godotxr.edu',
    PhoneNumber: '0987654321',
    Status: 'Active'
  },
  {
    UserId: 'USR-004',
    FullName: 'Lê Hoàng Long',
    Email: 'long.le@godotxr.edu',
    PhoneNumber: '0934567890',
    Status: 'Inactive'
  },
  {
    UserId: 'USR-010',
    FullName: 'Nguyễn Thị Mai',
    Email: 'mai.nguyen@godotxr.edu',
    PhoneNumber: '0911223344',
    Status: 'Active'
  },
  {
    UserId: 'USR-011',
    FullName: 'Phạm Tuấn Anh',
    Email: 'tuananh.pham@godotxr.edu',
    PhoneNumber: '0944556677',
    Status: 'Active'
  },
  {
    UserId: 'USR-012',
    FullName: 'Vũ Khánh Linh',
    Email: 'linh.vu@godotxr.edu',
    PhoneNumber: '0922334455',
    Status: 'Locked'
  },
  {
    // A teacher user not assigned a teacher record yet
    UserId: 'USR-015',
    FullName: 'Bùi Minh Đức',
    Email: 'duc.bui@godotxr.edu',
    PhoneNumber: '0955667788',
    Status: 'Active'
  }
];

const INITIAL_TEACHERS: Teacher[] = [
  {
    TeacherId: 'TCH-001',
    UserId: 'USR-002',
    FullName: 'Trần Thị Hồng (Ms. Johnson)',
    Specialty: 'Phát âm cơ bản & Đồng hành rèn luyện VR',
    Gender: 'Female',
    Status: 'Active',
    CreatedAt: '2026-02-15 09:15',
    UpdatedAt: '2026-05-20 10:30',
    ClassesManaged: ['Lớp rèn luyện VR - Phát âm âm đôi', 'Lớp 1A - Luyện thanh cơ bản VR']
  },
  {
    TeacherId: 'TCH-002',
    UserId: 'USR-004',
    FullName: 'Lê Hoàng Long',
    Specialty: 'Chậm phát âm & Hỗ trợ rèn luyện tập trung',
    Gender: 'Male',
    Status: 'Inactive',
    CreatedAt: '2026-03-22 13:40',
    UpdatedAt: '2026-03-24 16:00',
    ClassesManaged: ['Lớp 3C - Nhận biết âm tiết khó VR']
  },
  {
    TeacherId: 'TCH-003',
    UserId: 'USR-010',
    FullName: 'Nguyễn Thị Mai',
    Specialty: 'Phát triển giao tiếp xã hội & Phát âm từ vựng',
    Gender: 'Female',
    Status: 'Active',
    CreatedAt: '2026-05-10 11:00',
    UpdatedAt: '2026-05-28 15:40',
    ClassesManaged: ['Lớp rèn luyện VR - Phản xạ nhanh', 'Lớp 2B - Ghép vần nhanh VR']
  },
  {
    TeacherId: 'TCH-004',
    UserId: 'USR-011',
    FullName: 'Phạm Tuấn Anh',
    Specialty: 'Ngôn ngữ cơ thể & Chữa giọng đọc ngọng',
    Gender: 'Male',
    Status: 'Active',
    CreatedAt: '2026-05-12 14:00',
    UpdatedAt: '2026-05-12 14:00',
    ClassesManaged: ['Lớp Luyện phát âm gió S, X, Z']
  },
  {
    TeacherId: 'TCH-005',
    UserId: 'USR-012',
    FullName: 'Vũ Khánh Linh',
    Specialty: 'Âm ngữ liệu pháp & Trị liệu tâm lý hành vi',
    Gender: 'Female',
    Status: 'Suspended',
    CreatedAt: '2026-01-20 10:00',
    UpdatedAt: '2026-05-25 09:00',
    ClassesManaged: []
  }
];

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [userAccounts, setUserAccounts] = useState<User[]>(MOCK_TEACHER_USERS);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterGender, filterStatus]);

  // Modal controls
  const [modalType, setModalType] = useState<'add' | 'edit' | 'detail' | 'classes' | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form states
  const [formUserId, setFormUserId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');

  const triggerNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => {
      setAlertConfig(null);
    }, 4000);
  };

  // Statistic calculations
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.Status === 'Active').length;
  const suspendedTeachers = teachers.filter(t => t.Status === 'Suspended').length;
  const totalClassesCount = teachers.reduce((acc, t) => acc + t.ClassesManaged.length, 0);

  // Handlers for modal dispatching
  const handleOpenAdd = () => {
    // Find first userAccount that doesn't have a teacher record yet, or default to any
    const nonAssigned = userAccounts.find(ua => !teachers.some(t => t.UserId === ua.UserId));
    setFormUserId(nonAssigned?.UserId || '');
    setFormFullName(nonAssigned?.FullName || '');
    setFormSpecialty('');
    setFormGender('Female');
    setFormStatus('Active');
    setSelectedTeacher(null);
    setModalType('add');
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormUserId(teacher.UserId);
    setFormFullName(teacher.FullName);
    setFormSpecialty(teacher.Specialty);
    setFormGender(teacher.Gender);
    setFormStatus(teacher.Status);
    setModalType('edit');
  };

  const handleOpenDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setModalType('detail');
  };

  const handleOpenClasses = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setModalType('classes');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedTeacher(null);
  };

  // On selecting a pre-existing User account in Select dropdown
  const handleUserSelectionChange = (userId: string) => {
    setFormUserId(userId);
    const user = userAccounts.find(u => u.UserId === userId);
    if (user) {
      setFormFullName(user.FullName);
    }
  };

  // Submit Handler
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formFullName || !formSpecialty) {
      triggerNotification('Vui lòng điền đủ Họ tên và Chuyên môn giáo dục!', 'warning');
      return;
    }

    if (modalType === 'add') {
      // Avoid duplicated user assignment
      const alreadyAssigned = teachers.some(t => t.UserId === formUserId);
      if (alreadyAssigned) {
        triggerNotification('Tài khoản người dùng này đã được cấp quyền giáo viên rồi!', 'warning');
        return;
      }

      const newTeacher: Teacher = {
        TeacherId: `TCH-${String(teachers.length + 1).padStart(3, '0')}`,
        UserId: formUserId || `USR-${String(userAccounts.length + 1).padStart(3, '0')}`,
        FullName: formFullName,
        Specialty: formSpecialty,
        Gender: formGender,
        Status: formStatus,
        CreatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        ClassesManaged: []
      };

      // Add to mock lists
      setTeachers([newTeacher, ...teachers]);
      
      // If the User is manually typed (no assigned Id), add a new simulation User
      if (!userAccounts.some(u => u.UserId === formUserId)) {
        const newUser: User = {
          UserId: newTeacher.UserId,
          FullName: formFullName,
          Email: `${formFullName.toLowerCase().replace(/\s+/g, '.')}@godotxr.edu`,
          PhoneNumber: 'Chưa cập nhật',
          Status: formStatus === 'Active' ? 'Active' : 'Inactive'
        };
        setUserAccounts([...userAccounts, newUser]);
      }

      triggerNotification(`Đã khai báo hồ sơ cho giáo viên "${formFullName}"!`);
    } else if (modalType === 'edit' && selectedTeacher) {
      setTeachers(teachers.map(t => t.TeacherId === selectedTeacher.TeacherId ? {
        ...t,
        FullName: formFullName,
        Specialty: formSpecialty,
        Gender: formGender,
        Status: formStatus,
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      } : t));

      triggerNotification(`Cập nhật thông tin giảng dạy của giáo viên "${formFullName}" thành công!`);
    }

    handleCloseModal();
  };

  // Change teacher status directly
  const handleToggleLockStatus = (teacher: Teacher) => {
    const isCurrentlySuspended = teacher.Status === 'Suspended';
    const nextStatus = isCurrentlySuspended ? 'Active' : 'Suspended';
    
    setTeachers(teachers.map(t => t.TeacherId === teacher.TeacherId ? {
      ...t,
      Status: nextStatus,
      UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    } : t));

    triggerNotification(
      nextStatus === 'Suspended' 
        ? `Đã tạm đình chỉ hoạt động của giáo viên "${teacher.FullName}"`
        : `Đã khôi phục trạng thái giảng dạy của giáo viên "${teacher.FullName}"`,
      nextStatus === 'Suspended' ? 'warning' : 'success'
    );
  };

  // Advanced filters calculation
  const filteredTeachers = teachers.filter(t => {
    const associatedUser = userAccounts.find(u => u.UserId === t.UserId);
    const searchString = `${t.FullName} ${t.Specialty} ${associatedUser?.Email || ''}`.toLowerCase();
    
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesGender = filterGender === 'ALL' || t.Gender === filterGender;
    const matchesStatus = filterStatus === 'ALL' || t.Status === filterStatus;

    return matchesSearch && matchesGender && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(startIndex, startIndex + pageSize);
  }, [filteredTeachers, currentPage, pageSize]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative">
      
      {/* Toast Alert message banner */}
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

      {/* 1. Header Area styling */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-md text-[11px] font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            Nhân sự chuyên môn
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-2 pb-0.5 font-sans">
            Quản lý Giáo viên
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Giám sát hồ sơ thầy cô, phân công lớp học hỗ trợ phát âm bằng kính thực tế ảo VR/XR, và kiểm soát tình trạng tài khoản giáo viên đặc biệt.
          </p>
          <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-100/60 inline-flex">
            <Info className="w-4 h-4 shrink-0" />
            <span>Trang này dùng để quản lý thông tin hồ sơ giáo viên. Tài khoản đăng nhập của giáo viên được tạo trong User Management.</span>
          </div>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#3d8c8e] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm giáo viên mới
        </button>
      </div>

      {/* 2. Stat row matching GodotXR dashboard cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem 
          title="Tổng giáo viên" 
          value={totalTeachers} 
          subtitle="Thầy cô can thiệp đặc biệt" 
          icon={<GraduationCap className="w-5 h-5 text-[#4EACAF]" />} 
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Đang làm việc" 
          value={activeTeachers} 
          subtitle={`${activeTeachers} thầy cô hoạt động`} 
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />} 
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Đang tạm ngưng" 
          value={suspendedTeachers} 
          subtitle="Tài khoản tạm ngắt kết nối" 
          icon={<UserX className="w-5 h-5 text-rose-600" />} 
          bgColor="bg-rose-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Lớp đang phụ trách" 
          value={totalClassesCount} 
          subtitle="Lớp can thiệp chuyên biệt" 
          icon={<BookOpen className="w-5 h-5 text-amber-600" />} 
          bgColor="bg-amber-50/70"
          borderColor="border-slate-100"
        />
      </div>

      {/* 3. Filter section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-slate-stretch lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
          <input 
            type="text" 
            placeholder="Tìm theo tên giáo viên, chuyên môn, email..." 
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
          <div className="relative">
            <select 
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="lg:w-48 w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-700 outline-none cursor-pointer pr-10 text-xs"
            >
              <option value="ALL">Tất cả giới tính</option>
              <option value="Male">Nam giới</option>
              <option value="Female">Nữ giới</option>
              <option value="Other">Khác</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="lg:w-48 w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-700 outline-none cursor-pointer pr-10 text-xs"
            >
              <option value="ALL">Tất cả Trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Chưa kích hoạt</option>
              <option value="Suspended">Tạm ngừng</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Table area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-none">Danh sách giáo viên</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Đang hiển thị {filteredTeachers.length} trong tổng số {totalTeachers} giáo viên</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <span className="text-xs text-teal-600 font-bold uppercase tracking-wider">Hạ tầng can thiệp sớm</span>
          </div>
        </div>

        {filteredTeachers.length === 0 ? (
          <div className="py-24 text-center space-y-4">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-200">
               <GraduationCap className="w-8 h-8 text-gray-300" />
             </div>
             <div className="space-y-1">
                <p className="text-xl font-black text-gray-700">Không tìm thấy giáo viên phù hợp!</p>
                <p className="text-gray-400 font-medium text-sm">Vui lòng tinh chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
             </div>
             <button 
               onClick={() => {
                 setSearchQuery('');
                 setFilterGender('ALL');
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
                    <th className="py-5 px-10">Mã Số</th>
                    <th className="py-5 px-6">Họ tên giáo viên</th>
                    <th className="py-5 px-6">Chuyên môn can thiệp</th>
                    <th className="py-5 px-6">Giới tính</th>
                    <th className="py-5 px-6">Lớp phụ trách</th>
                    <th className="py-5 px-6">Trạng thái</th>
                    <th className="py-5 px-10 text-right">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {paginatedTeachers.map((teacher) => {
                    const associatedUser = userAccounts.find(u => u.UserId === teacher.UserId);
                    return (
                      <tr 
                        key={teacher.TeacherId} 
                        className="hover:bg-gray-50/40 transition-colors"
                      >
                        <td className="py-5 px-10 font-mono text-gray-400 font-black text-xs">
                          {teacher.TeacherId}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <img 
                              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${teacher.FullName}`} 
                              alt={teacher.FullName} 
                              className="w-10 h-10 rounded-2xl bg-teal-50/50 border border-teal-100/30"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-extrabold text-gray-900 text-base">{teacher.FullName}</p>
                              <p className="text-xs text-gray-400 font-medium pt-0.5">{associatedUser?.Email || 'Chưa liên kết email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 max-w-xs truncate">
                          <div className="flex items-center gap-1.5 text-gray-900">
                             <Briefcase className="w-4 h-4 text-[#4EACAF]" />
                             <span>{teacher.Specialty}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="font-semibold text-gray-600">
                            {teacher.Gender === 'Male' ? 'Nam giới' : teacher.Gender === 'Female' ? 'Nữ giới' : 'Mọi giới tính'}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <button 
                            onClick={() => handleOpenClasses(teacher)}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 rounded-full text-xs font-black transition-all hover:scale-105"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {teacher.ClassesManaged.length} Lớp học
                          </button>
                        </td>
                        <td className="py-5 px-6">
                          <span className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                            teacher.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                            teacher.Status === 'Inactive' ? 'bg-gray-100 text-gray-500' : 'bg-rose-50 text-rose-600'
                          )}>
                            {teacher.Status === 'Active' ? 'Hoạt động' :
                             teacher.Status === 'Inactive' ? 'Chưa kích hoạt' : 'Tạm ngừng'}
                          </span>
                        </td>
                        <td className="py-5 px-10 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenDetail(teacher)}
                              className="p-2 hover:bg-teal-50 text-teal-600 rounded-xl transition-colors hover:scale-105"
                              title="Thông tin chi tiết"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleOpenEdit(teacher)}
                              className="p-2 hover:bg-sky-50 text-sky-500 rounded-xl transition-colors hover:scale-105"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit3 className="w-4.5 h-4.5" />
                            </button>

                            <button 
                              onClick={() => handleToggleLockStatus(teacher)}
                              className={cn(
                                "p-2 rounded-xl transition-colors hover:scale-105",
                                teacher.Status === 'Suspended' 
                                  ? 'hover:bg-emerald-50 text-emerald-500' 
                                  : 'hover:bg-rose-50 text-rose-500'
                              )}
                              title={teacher.Status === 'Suspended' ? "Kích hoạt giảng dạy" : "Tạm đình chỉ tài khoản"}
                            >
                              {teacher.Status === 'Suspended' ? (
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
                totalItems={filteredTeachers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="giáo viên"
              />
            </div>
          </>
        )}
      </div>

      {/* Decorative Happy illustration to represent beautiful UI style */}
      <div className="flex items-center justify-center gap-4 bg-orange-50/40 p-6 rounded-[32px] border-2 border-orange-100 max-w-lg mx-auto">
        <Smile className="w-10 h-10 text-orange-400 fill-current shrink-0 animate-pulse" />
        <p className="text-gray-500 font-bold text-xs md:text-sm italic leading-snug text-center">
          "GodotXR vinh hạnh quy tụ các chuyên gia trẻ em tài năng, tận tụy hỗ trợ nâng tầm âm giọng & kỹ năng can thiệp ngôn ngữ toàn diện."
        </p>
      </div>

      {/* 5. Modals Overlay Area */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto w-full h-full">
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
                modalType === 'edit' ? 'bg-sky-50 border-sky-100 text-gray-900' :
                modalType === 'classes' ? 'bg-amber-50 border-amber-100 text-gray-900' : 'bg-purple-50 border-purple-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'detail' && <Info className="w-6 h-6 text-purple-600" />}
                    {modalType === 'classes' && <BookOpen className="w-6 h-6 text-amber-600" />}
                    {modalType === 'add' && 'Khai báo giáo viên mới'}
                    {modalType === 'edit' && `Chỉnh sửa: Ms/Mr. ${selectedTeacher?.FullName}`}
                    {modalType === 'detail' && 'Toàn bộ hồ sơ giáo viên'}
                    {modalType === 'classes' && `Lớp giảng dạy: ${selectedTeacher?.FullName}`}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Liên kết tài khoản người dùng và nhập lĩnh vực giáo dục chuyên sâu'}
                    {modalType === 'edit' && 'Cập nhật lại chuyên môn đặc thù hoặc tình trạng công tác'}
                    {modalType === 'detail' && 'Chi tiết thông tin giáo viên tích hợp các bảng DB'}
                    {modalType === 'classes' && 'Các lớp can thiệp phát âm được quản trị hỗ trợ'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body: Detail Area */}
              {modalType === 'detail' && selectedTeacher ? (
                <div className="p-8 md:p-10 space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start pb-6 border-b border-gray-50">
                     <div className="w-24 h-24 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center p-3 shrink-0 mx-auto md:mx-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedTeacher.FullName}`} 
                          alt="Detail Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                     </div>
                     <div className="space-y-3 flex-1 text-center md:text-left">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                             <span className="text-2xl font-black text-gray-900">{selectedTeacher.FullName}</span>
                             <span className="px-3 py-0.5 bg-gray-100 text-gray-400 font-black tracking-widest text-[9px] rounded-full uppercase">
                               ID: {selectedTeacher.TeacherId}
                             </span>
                          </div>
                          <p className="text-gray-400 font-bold">Tài khoản liên kết: {selectedTeacher.UserId}</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold pt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full italic bg-purple-50 text-purple-600 tracking-tight uppercase text-[10px]">
                            {selectedTeacher.Specialty}
                          </span>

                          <span className={cn(
                            "inline-flex items-center px-3 py-0.5 rounded-full uppercase text-[10px]",
                            selectedTeacher.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                            selectedTeacher.Status === 'Inactive' ? 'bg-gray-100 text-gray-500' : 'bg-rose-50 text-rose-600'
                          )}>
                            {selectedTeacher.Status === 'Active' ? 'Đang hoạt động' :
                             selectedTeacher.Status === 'Inactive' ? 'Nháp/Chưa duyệt' : 'Mất an toàn/Đã khóa'}
                          </span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                     <DetailRow 
                       label="Họ và Tên (FullName)" 
                       value={selectedTeacher.FullName} 
                     />
                     <DetailRow 
                       label="Chuyên môn (Specialty)" 
                       value={selectedTeacher.Specialty} 
                     />
                     <DetailRow 
                       label="Giới tính (Gender)" 
                       value={selectedTeacher.Gender === 'Male' ? 'Nam' : selectedTeacher.Gender === 'Female' ? 'Nữ' : 'Khác'} 
                     />
                     <DetailRow 
                       label="Email giảng dạy" 
                       value={userAccounts.find(u => u.UserId === selectedTeacher.UserId)?.Email || 'Chưa cung cấp'} 
                     />
                     <DetailRow 
                       label="Số điện thoại liên lạc" 
                       value={userAccounts.find(u => u.UserId === selectedTeacher.UserId)?.PhoneNumber || 'Chưa cung cấp'} 
                     />
                     <DetailRow 
                       label="Thời điểm khởi tạo (CreatedAt)" 
                       value={selectedTeacher.CreatedAt} 
                     />
                     <DetailRow 
                       label="Cập nhật lần cuối (UpdatedAt)" 
                       value={selectedTeacher.UpdatedAt} 
                     />
                  </div>

                  <div className="bg-purple-50/50 p-5 rounded-3xl border border-purple-100/50 text-[#555] font-bold text-xs leading-relaxed space-y-1">
                     <p className="font-extrabold text-purple-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                       <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                       Chính sách bảo trợ danh tính giảng viên
                     </p>
                     <p className="opacity-85 text-gray-500">Mọi hồ sơ lớp học, quá trình chấm điểm và phản hồi bài nghiên cứu phát âm của trẻ nhỏ do thầy cô biên soạn luôn được mã hóa hai chiều và tuân định nghiêm ngặt Quy định bảo vệ quyền riêng tư.</p>
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
              ) : modalType === 'classes' && selectedTeacher ? (
                /* Modal Body: Classes Managed list */
                <div className="p-8 md:p-10 space-y-6">
                   <div className="flex items-center gap-4 bg-amber-50/40 p-5 rounded-3xl border border-amber-100/60">
                      <Compass className="w-10 h-10 text-amber-500 shrink-0" />
                      <div>
                         <p className="font-black text-gray-800">Lớp can thiệp hỗ trợ bằng VR/XR</p>
                         <p className="text-xs text-gray-500 font-bold">Danh sách các lớp do {selectedTeacher.FullName} điều hành giảng dạy.</p>
                      </div>
                   </div>

                   {selectedTeacher.ClassesManaged.length === 0 ? (
                      <div className="py-12 text-center space-y-2 border-2 border-dashed border-gray-150 rounded-[32px]">
                         <p className="font-bold text-gray-600 text-base">Chưa phân công lớp can thiệp nào!</p>
                         <p className="text-xs text-gray-400">Ấn nút "Chỉnh sửa" để phân quyền hoặc quản trị viên sẽ phân bổ lớp sau.</p>
                      </div>
                   ) : (
                      <div className="space-y-3">
                         {selectedTeacher.ClassesManaged.map((cls, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-amber-200 transition-colors">
                               <div className="flex items-center gap-3">
                                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                                  <span className="font-black text-gray-800">{cls}</span>
                               </div>
                               <span className="text-[10px] bg-amber-50 text-amber-600 font-black px-2.5 py-0.5 rounded-full uppercase">ĐANG HỌC</span>
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
                /* Modaly Body: Add/Edit Form */
                <form onSubmit={handleSaveTeacher} className="p-8 md:p-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Select UserId from existing list or custom input for edit block */}
                    {modalType === 'add' ? (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Liên kết tài khoản người dùng (USERS) <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={formUserId}
                            onChange={(e) => handleUserSelectionChange(e.target.value)}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF]"
                          >
                            <option value="">-- Chọn tài khoản giáo viên chưa liên kết --</option>
                            {userAccounts.map(user => {
                              const isLinked = teachers.some(t => t.UserId === user.UserId);
                              return (
                                <option 
                                  key={user.UserId} 
                                  value={user.UserId}
                                  disabled={isLinked}
                                >
                                  {user.UserId} - {user.FullName} ({user.Email}) {isLinked ? '[ĐÃ LIÊN KẾT]' : ''}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold italic ml-1">Bảng USERS nắm dữ liệu đăng nhập, Email & SĐT, TEACHER nắm kỹ năng chuyên môn.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Mã người dùng USERS
                        </label>
                        <input 
                          type="text" 
                          disabled
                          value={formUserId}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none text-gray-400 cursor-not-allowed" 
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Họ và Tên giáo viên <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ví dụ: Trần Thị Hồng"
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Chuyên môn đồng hành (Specialty) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ví dụ: Đồng hành phát âm & hỗ trợ rèn luyện VR"
                        value={formSpecialty}
                        onChange={(e) => setFormSpecialty(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Giới tính (Gender) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formGender}
                          onChange={(e) => setFormGender(e.target.value as any)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF]"
                        >
                          <option value="Female">Nữ giới</option>
                          <option value="Male">Nam giới</option>
                          <option value="Other">Khác</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Trạng thái công tác
                      </label>
                      <div className="relative">
                        <select 
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF]"
                        >
                          <option value="Active">🟢 Đang hoạt động / Sẵn sàng</option>
                          <option value="Inactive">🟡 Chưa sẵn sàng / Chờ duyệt</option>
                          <option value="Suspended">🔴 Tạm ngưng hoạt động</option>
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
                       Bỏ qua
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

// Stats Card Item helper component
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

// Detail info slot row
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
