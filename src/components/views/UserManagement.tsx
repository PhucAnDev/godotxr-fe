import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Search, 
  Filter, 
  ChevronDown, 
  X, 
  Check, 
  Eye, 
  Edit3, 
  Lock, 
  Unlock, 
  RefreshCw, 
  MoreVertical, 
  Calendar, 
  Shield, 
  Smile, 
  Sparkles,
  Mail,
  Phone,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getStoredUsers, saveStoredUsers } from '../../lib/authMock';
import Pagination from '../common/Pagination';

// Roles Interface
interface Role {
  RoleId: string;
  RoleName: string;
  Description: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

// Users Interface
interface User {
  UserId: string;
  RoleId: string;
  FullName: string;
  Email: string;
  PasswordHash: string;
  PhoneNumber: string;
  Status: 'Active' | 'Inactive' | 'Locked';
  CreatedAt: string;
  UpdatedAt: string;
}

const ROLES: Role[] = [
  {
    RoleId: 'ROL-001',
    RoleName: 'Admin',
    Description: 'Quản trị viên hệ thống có toàn quyền cấu hình và quản trị tài nguyên',
    IsActive: true,
    CreatedAt: '2026-01-01',
    UpdatedAt: '2026-01-01'
  },
  {
    RoleId: 'ROL-002',
    RoleName: 'Teacher',
    Description: 'Giáo viên tham gia tạo lớp học, bài tập phát âm và xem báo cáo trẻ em',
    IsActive: true,
    CreatedAt: '2026-01-01',
    UpdatedAt: '2026-01-01'
  },
  {
    RoleId: 'ROL-003',
    RoleName: 'Parent',
    Description: 'Phụ huynh tạo hồ sơ cho trẻ, theo dõi tiến trình và tương tác với trẻ',
    IsActive: true,
    CreatedAt: '2026-01-01',
    UpdatedAt: '2026-01-01'
  }
];

const INITIAL_USERS: User[] = [
  {
    UserId: 'USR-001',
    RoleId: 'ROL-001',
    FullName: 'Nguyễn Văn Minh',
    Email: 'minh.nguyen@godotxr.com',
    PasswordHash: 'pbkdf2_sha256$2026$hash_minh',
    PhoneNumber: '0912345678',
    Status: 'Active',
    CreatedAt: '2026-01-10 08:30',
    UpdatedAt: '2026-05-15 14:20'
  },
  {
    UserId: 'USR-002',
    RoleId: 'ROL-002',
    FullName: 'Trần Thị Hồng (Ms. Johnson)',
    Email: 'hong.johnson@godotxr.edu',
    PasswordHash: 'pbkdf2_sha256$2026$hash_hong',
    PhoneNumber: '0987654321',
    Status: 'Active',
    CreatedAt: '2026-02-15 09:15',
    UpdatedAt: '2026-05-20 10:30'
  },
  {
    UserId: 'USR-003',
    RoleId: 'ROL-003',
    FullName: 'Phạm Minh Anh (Phụ Huynh)',
    Email: 'anvvpse172634@fpt.edu.vn',
    PasswordHash: 'pbkdf2_sha256$2026$hash_anh',
    PhoneNumber: '0901234567',
    Status: 'Active',
    CreatedAt: '2026-05-18 10:25',
    UpdatedAt: '2026-05-28 11:15'
  },
  {
    UserId: 'USR-004',
    RoleId: 'ROL-002',
    FullName: 'Lê Hoàng Long',
    Email: 'long.le@godotxr.edu',
    PasswordHash: 'pbkdf2_sha256$2026$hash_long',
    PhoneNumber: '0934567890',
    Status: 'Inactive',
    CreatedAt: '2026-03-22 13:40',
    UpdatedAt: '2026-03-24 16:00'
  },
  {
    UserId: 'USR-005',
    RoleId: 'ROL-003',
    FullName: 'Bùi Thị Lan',
    Email: 'lan.bui@gmail.com',
    PasswordHash: 'pbkdf2_sha256$2026$hash_lan',
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
    PasswordHash: 'pbkdf2_sha256$2026$hash_viet',
    PhoneNumber: '0945678901',
    Status: 'Active',
    CreatedAt: '2026-05-19 11:10',
    UpdatedAt: '2026-05-19 11:10'
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = getStoredUsers();
    return stored.map(u => ({
      UserId: u.UserId,
      RoleId: u.Role === 'ADMIN' ? 'ROL-001' : u.Role === 'TEACHER' ? 'ROL-002' : 'ROL-003',
      FullName: u.FullName,
      Email: u.Email,
      PasswordHash: `pbkdf2_sha256$2026$hash_${u.Password}`,
      PhoneNumber: u.PhoneNumber || 'Chưa cung cấp',
      Status: u.Status || 'Active',
      CreatedAt: u.CreatedAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
      UpdatedAt: u.UpdatedAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
    }));
  });

  const syncToMockAuth = (updatedUsersList: User[]) => {
    const currentMockUsers = getStoredUsers();
    const newMockUsersList = updatedUsersList.map(u => {
      const existing = currentMockUsers.find(x => x.UserId === u.UserId);
      const roleStr = u.RoleId === 'ROL-001' ? 'ADMIN' : u.RoleId === 'ROL-002' ? 'TEACHER' : 'PARENT';
      
      // Default passwords for newly created teachers/parents
      const defaultPass = roleStr === 'ADMIN' ? 'admin12345' : roleStr === 'TEACHER' ? 'teacher123' : 'parent123';
      
      return {
        UserId: u.UserId,
        RoleId: u.RoleId as 'ROL-001' | 'ROL-002' | 'ROL-003',
        Email: u.Email,
        Password: existing ? existing.Password : defaultPass,
        Role: roleStr as 'ADMIN' | 'TEACHER' | 'PARENT',
        FullName: u.FullName,
        PhoneNumber: u.PhoneNumber === 'Chưa cung cấp' ? '' : u.PhoneNumber,
        Status: u.Status,
        MustChangePassword: existing ? existing.MustChangePassword : true, // Newly created marks true by default!
        CreatedAt: u.CreatedAt,
        UpdatedAt: u.UpdatedAt
      };
    });
    saveStoredUsers(newMockUsersList);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoleId, setFilterRoleId] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRoleId, filterStatus]);

  // Modal control states
  const [modalType, setModalType] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Custom alerts or temporary notification triggers
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form states
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');
  const [formRoleId, setFormRoleId] = useState('ROL-003'); // default to Parent
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Locked'>('Active');

  // Trigger transient notices helper
  const triggerNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => {
      setAlertConfig(null);
    }, 4000);
  };

  // Calculations for stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.Status === 'Active').length;
  const lockedUsers = users.filter(u => u.Status === 'Locked').length;
  const thisMonthUsers = users.filter(u => {
    // Basic date parsing just for Month calculation mock
    return u.CreatedAt.includes('2026-05');
  }).length;

  // Open Add User Modal
  const handleOpenAdd = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhoneNumber('');
    setFormRoleId('ROL-003');
    setFormStatus('Active');
    setSelectedUser(null);
    setModalType('add');
  };

  // Open Edit User Modal
  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormFullName(user.FullName);
    setFormEmail(user.Email);
    setFormPhoneNumber(user.PhoneNumber);
    setFormRoleId(user.RoleId);
    setFormStatus(user.Status);
    setModalType('edit');
  };

  // Open Detail Modal
  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setModalType('detail');
  };

  // Close Modals
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  // Add or Edit Submission logic
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formFullName || !formEmail) {
      triggerNotification('Vui lòng điền đầy đủ Tên và Email!', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      triggerNotification('Email không đúng định dạng!', 'warning');
      return;
    }

    if (modalType === 'add') {
      const newUser: User = {
        UserId: `USR-${String(users.length + 1).padStart(3, '0')}`,
        RoleId: formRoleId,
        FullName: formFullName,
        Email: formEmail,
        PasswordHash: `pbkdf2_sha256$2026$temp_hash`,
        PhoneNumber: formPhoneNumber || 'Chưa cung cấp',
        Status: formStatus,
        CreatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      const updated = [newUser, ...users];
      setUsers(updated);
      syncToMockAuth(updated);
      triggerNotification(`Đã tạo thành công tài khoản "${formFullName}"!`);
    } else if (modalType === 'edit' && selectedUser) {
      const updated = users.map(u => u.UserId === selectedUser.UserId ? {
        ...u,
        FullName: formFullName,
        Email: formEmail,
        PhoneNumber: formPhoneNumber || 'Chưa cung cấp',
        RoleId: formRoleId,
        Status: formStatus,
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      } : u);
      setUsers(updated);
      syncToMockAuth(updated);
      triggerNotification(`Cập nhật thông tin tài khoản "${formFullName}" thành công!`);
    }

    handleCloseModal();
  };

  // Toggle locked/active status with dynamic messages
  const handleToggleLockStatus = (user: User) => {
    const updatedStatus = user.Status === 'Locked' ? 'Active' : 'Locked';
    const message = updatedStatus === 'Locked' 
      ? `Đã khóa tài khoản "${user.FullName}" thành công!` 
      : `Đã mở khóa tài khoản "${user.FullName}" thành công!`;
    
    const updated = users.map(u => u.UserId === user.UserId ? {
      ...u,
      Status: updatedStatus,
      UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    } : u);
    setUsers(updated);
    syncToMockAuth(updated);

    triggerNotification(message, updatedStatus === 'Locked' ? 'warning' : 'success');
  };

  // Reset password simulation
  const handleResetPassword = (user: User) => {
    const updated = users.map(u => u.UserId === user.UserId ? {
      ...u,
      UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    } : u);
    setUsers(updated);

    // Persist concrete reset update
    const currentMockUsers = getStoredUsers();
    const newMockUsersList = currentMockUsers.map(u => {
      if (u.UserId === user.UserId) {
        return {
          ...u,
          Password: 'GodotXR@2026',
          MustChangePassword: true, // Mark them as requiring first-time password reset
          UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
      }
      return u;
    });
    saveStoredUsers(newMockUsersList);

    triggerNotification(`Đã gửi yêu cầu cấp lại mật khẩu cho "${user.FullName}". Mật khẩu mặc định mới được hỏa tốc đặt là "GodotXR@2026" (Được yêu cầu đổi lại sau đăng nhập)!`);
  };

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.FullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.PhoneNumber.includes(searchQuery);

    const matchesRole = filterRoleId === 'ALL' || user.RoleId === filterRoleId;
    const matchesStatus = filterStatus === 'ALL' || user.Status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative">
      
      {/* Dynamic Pop-up Notification Banner */}
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

      {/* 2. Statistic Row */}
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
          subtitle={`${Math.round((activeUsers / (totalUsers || 1)) * 100)}% tổng số tài khoản`} 
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

      {/* 3. Search and Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
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
          <div className="relative">
            <select 
              value={filterRoleId}
              onChange={(e) => setFilterRoleId(e.target.value)}
              className="lg:w-48 w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-700 outline-none cursor-pointer pr-10 text-xs uppercase"
            >
              <option value="ALL">Tất cả Vai trò</option>
              {ROLES.map(role => (
                <option key={role.RoleId} value={role.RoleId}>{role.RoleName}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="lg:w-48 w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-700 outline-none cursor-pointer pr-10 text-xs uppercase"
            >
              <option value="ALL">Tất cả Trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Chưa kích hoạt</option>
              <option value="Locked">Đã khóa</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Display Users Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-none">Danh sách người dùng</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Đang hiển thị {filteredUsers.length} trong {totalUsers} người dùng</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4EACAF] rounded-full animate-pulse" />
            <span className="text-xs text-[#4EACAF] font-bold uppercase tracking-wider">Hệ thống đồng bộ</span>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
               <Users className="w-6 h-6 text-slate-350" />
             </div>
             <div className="space-y-1">
                <p className="text-base font-bold text-slate-700">Không tìm thấy người dùng phù hợp!</p>
                <p className="text-slate-400 text-xs">Vui lòng điều chỉnh lại bộ lọc hoặc nhập từ khóa tìm kiếm khác.</p>
             </div>
             <button 
               onClick={() => {
                 setSearchQuery('');
                 setFilterRoleId('ALL');
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
                  {paginatedUsers.map((user) => {
                    const roleObj = ROLES.find(r => r.RoleId === user.RoleId);
                    
                    return (
                      <tr 
                        key={user.UserId} 
                        className="hover:bg-slate-50/40 transition-colors"
                      >
                        <td className="py-4 px-6 font-mono text-slate-400 font-bold text-xs">
                          {user.UserId}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${user.FullName}`} 
                              alt={user.FullName} 
                              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{user.FullName}</p>
                              <p className="text-xs text-slate-400 font-medium">{user.Email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 space-y-0.5 text-xs">
                          <p className="text-slate-700 font-semibold">{user.PhoneNumber}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                            user.RoleId === 'ROL-001' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            user.RoleId === 'ROL-002' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          )}>
                            {roleObj?.RoleName || 'Không xác định'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide",
                            user.Status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250/20' :
                            user.Status === 'Inactive' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-rose-50 text-rose-600 border border-rose-100'
                          )}>
                            {user.Status === 'Active' ? 'Hoạt động' :
                             user.Status === 'Inactive' ? 'Chưa kích hoạt' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-350" />
                            {user.CreatedAt.slice(0, 10)}
                          </div>
                        </td>
                        <td className="py-5 px-10 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenDetail(user)}
                              className="p-2 hover:bg-teal-50 text-teal-600 rounded-xl transition-colors hover:scale-105"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleOpenEdit(user)}
                              className="p-2 hover:bg-sky-50 text-sky-500 rounded-xl transition-colors hover:scale-105"
                              title="Sửa"
                            >
                              <Edit3 className="w-4.5 h-4.5" />
                            </button>

                            <button 
                              onClick={() => handleToggleLockStatus(user)}
                              className={cn(
                                "p-2 rounded-xl transition-colors hover:scale-105",
                                user.Status === 'Locked' 
                                  ? 'hover:bg-emerald-50 text-emerald-500' 
                                  : 'hover:bg-rose-50 text-rose-500'
                              )}
                              title={user.Status === 'Locked' ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                            >
                              {user.Status === 'Locked' ? (
                                <Unlock className="w-4.5 h-4.5" />
                              ) : (
                                <Lock className="w-4.5 h-4.5" />
                              )}
                            </button>

                            <button 
                              onClick={() => handleResetPassword(user)}
                              className="p-2 hover:bg-yellow-50 text-yellow-500 rounded-xl transition-colors hover:scale-105"
                              title="Khởi tạo lại mật khẩu"
                            >
                              <RefreshCw className="w-4.5 h-4.5" />
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
                totalItems={filteredUsers.length}
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

      {/* Decorative Happy illustration (keeping with child-friendly GodotXR vibe) */}
      <div className="flex items-center justify-center gap-4 bg-orange-50/40 p-6 rounded-[32px] border-2 border-orange-100 max-w-lg mx-auto">
        <Smile className="w-10 h-10 text-orange-400 fill-current shrink-0 animate-pulse" />
        <p className="text-gray-500 font-bold text-xs md:text-sm italic leading-snug">
          "Trẻ em nhận được sự hỗ trợ ngôn ngữ can thiệp sớm tốt nhất nhờ quy trình phối hợp khép kín giữa giáo viên đặc biệt và cha mẹ yêu thương."
        </p>
      </div>

      {/* 5. Add / Edit / Detail Simulation Modal Overlay */}
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
                    {modalType === 'add' && <UserPlus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'detail' && <Info className="w-6 h-6 text-purple-600" />}
                    {modalType === 'add' && 'Thêm tài khoản người dùng'}
                    {modalType === 'edit' && `Chỉnh sửa: ${selectedUser?.FullName}`}
                    {modalType === 'detail' && 'Chi tiết tài khoản'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Khởi tạo tài khoản quản trị, giáo viên hoặc cha mẹ'}
                    {modalType === 'edit' && 'Cập nhật lại thông tin cá nhân và cài đặt trạng thái'}
                    {modalType === 'detail' && 'Toàn bộ dữ liệu trường thuộc cơ sở dữ liệu USERS'}
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
              {modalType === 'detail' && selectedUser ? (
                <div className="p-8 md:p-10 space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start pb-6 border-b border-gray-50">
                     <div className="w-24 h-24 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center p-3 shrink-0 mx-auto md:mx-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedUser.FullName}`} 
                          alt="Detail Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                     </div>
                     <div className="space-y-3 flex-1 text-center md:text-left">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                             <span className="text-2xl font-black text-gray-900">{selectedUser.FullName}</span>
                             <span className="px-3 py-0.5 bg-gray-100 text-gray-400 font-black tracking-widest text-[9px] rounded-full uppercase">
                               ID: {selectedUser.UserId}
                             </span>
                          </div>
                          <p className="text-gray-400 font-bold">{selectedUser.Email}</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold pt-1">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full italic tracking-tight uppercase text-[10px]",
                            selectedUser.RoleId === 'ROL-001' ? 'bg-orange-50 text-orange-600' :
                            selectedUser.RoleId === 'ROL-002' ? 'bg-sky-50 text-sky-600' : 'bg-purple-50 text-purple-600'
                          )}>
                            {ROLES.find(r => r.RoleId === selectedUser.RoleId)?.RoleName}
                          </span>

                          <span className={cn(
                            "inline-flex items-center px-3 py-0.5 rounded-full uppercase text-[10px]",
                            selectedUser.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                            selectedUser.Status === 'Inactive' ? 'bg-gray-100 text-gray-500' : 'bg-rose-50 text-rose-600'
                          )}>
                            {selectedUser.Status === 'Active' ? 'Hoạt động' :
                             selectedUser.Status === 'Inactive' ? 'Nháp/Chờ duyệt' : 'Bị khóa'}
                          </span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                     <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 flex flex-col justify-between">
                       <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Mật khẩu</span>
                       <div className="flex items-center justify-between mt-1">
                         <span className="font-mono text-xs text-gray-400">••••••••••••••••</span>
                         <button 
                           type="button"
                           onClick={() => handleResetPassword(selectedUser)}
                           className="px-3 py-1.5 bg-[#4EACAF]/15 hover:bg-[#4EACAF]/25 text-[#4EACAF] hover:text-[#3d8c8e] text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                         >
                           <RefreshCw className="w-3.5 h-3.5" />
                           Reset mật khẩu
                         </button>
                       </div>
                     </div>
                     <DetailRow 
                       label="Số điện thoại" 
                       value={selectedUser.PhoneNumber} 
                     />
                     <DetailRow 
                       label="Thời điểm khởi tạo (CreatedAt)" 
                       value={selectedUser.CreatedAt} 
                     />
                     <DetailRow 
                       label="Cập nhật lần cuối (UpdatedAt)" 
                       value={selectedUser.UpdatedAt} 
                     />
                  </div>

                  <div className="bg-purple-50/50 p-5 rounded-3xl border border-purple-100/50 text-[#555] font-bold text-xs leading-relaxed space-y-1">
                     <p className="font-extrabold text-purple-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                       <Shield className="w-4.5 h-4.5 shrink-0" />
                       Chính sách Bảo mật Cơ sở Dữ liệu (Rules)
                     </p>
                     <p className="opacity-85 text-gray-500">Mật khẩu được bảo vệ an toàn bằng cấu hình băm một chiều SHA256 kết hợp mã muối ngẫu nhiên của GoDotXR. Mọi phiên hoạt động và thay đổi cấu hình đều được ghi nhận trực tiếp vào Nhật ký Kiểm toán hệ thống.</p>
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
                <form onSubmit={handleSaveUser} className="p-8 md:p-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Số điện thoại liên hệ
                      </label>
                      <input 
                        type="text" 
                        placeholder="Số di động hoặc bàn"
                        value={formPhoneNumber}
                        onChange={(e) => setFormPhoneNumber(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Vai trò thành viên (RoleName) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formRoleId}
                          onChange={(e) => setFormRoleId(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none outline-none focus:border-[#4EACAF]"
                        >
                          {ROLES.map(role => (
                            <option key={role.RoleId} value={role.RoleId}>{role.RoleName} - {role.Description.slice(0,40)}...</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Trạng thái hoạt động <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="flex flex-wrap gap-4 pt-1">
                        {[
                          { status: 'Active', label: 'Hoạt động bình thường', class: 'border-emerald-100 text-emerald-600 bg-emerald-50/50' },
                          { status: 'Inactive', label: 'Chưa kích hoạt (Nháp)', class: 'border-gray-200 text-gray-500 bg-gray-50/50' },
                          { status: 'Locked', label: 'Khóa tài khoản khẩn cấp', class: 'border-rose-100 text-rose-600 bg-rose-50/50' }
                        ].map((item) => (
                          <label 
                            key={item.status} 
                            className={cn(
                              "flex-1 min-w-[150px] border-2 rounded-2xl p-4 flex items-center gap-3 cursor-pointer select-none transition-all",
                              formStatus === item.status 
                                ? 'border-[#4EACAF] ring-4 ring-[#4EACAF]/10 bg-white' 
                                : 'hover:bg-gray-50 border-gray-100'
                            )}
                          >
                            <input 
                              type="radio" 
                              name="formStatus"
                              checked={formStatus === item.status}
                              onChange={() => setFormStatus(item.status as any)}
                              className="w-4 h-4 text-[#4EACAF] border-gray-300 focus:ring-[#4EACAF]"
                            />
                            <div className="text-left font-bold">
                              <p className="text-sm text-gray-900">{item.status === 'Active' ? 'Hoạt động' : item.status === 'Inactive' ? 'Chưa kích hoạt' : 'Bị Khóa'}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{item.status === 'Active' ? 'Được phép đăng nhập' : item.status === 'Inactive' ? 'Bản nháp lưu tạm' : 'Bị chặn hoàn toàn'}</p>
                            </div>
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
                       Lưu thông tin
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

// Stats Card Utility Component
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
      {/* Background color accent corner */}
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

// Detail Modal Field Indicator Row
function DetailRow({ label, value, isMono = false }: { label: string; value: string; isMono?: boolean }) {
  return (
    <div className="space-y-1.5 p-4 rounded-2xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40">
       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</span>
       <span className={cn(
         "font-bold text-gray-800 break-all block",
         isMono ? "font-mono font-medium text-xs text-orange-600 bg-orange-50/50 p-2 rounded-lg border border-orange-100" : "text-sm"
       )}>
         {value}
       </span>
    </div>
  );
}
