import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Edit3,
  Eye,
  Heart,
  Loader2,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserX,
  Users,
  X,
  ArrowDown,
  ArrowUp,
  ArrowUpDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/common/Pagination';
import { cn } from '../../lib/utils';
import CustomSelect from '../../components/common/CustomSelect';
import {
  getUsers,
  updateUser,
  createAccount,
  type UserGender,
  type UserResponse,
} from '../../services/userService';
import { getCurrentUser } from '../../lib/authMock';
import ActionButton from '../../components/common/ActionButton';

type PageVariant = 'teacher' | 'parent';
type ModalMode = 'detail' | 'edit' | 'add' | null;

interface ToastConfig {
  message: string;
  type: 'success' | 'warning';
}

interface PageConfig {
  roleName: 'Teacher' | 'Parent';
  badgeLabel: string;
  title: string;
  description: string;
  note: string;
  searchPlaceholder: string;
  specialtyLabel: string;
  specialtyPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  listTitle: string;
  listSignalLabel: string;
  itemLabel: string;
  buttonLabel: string;
  defaultSpecialty: string;
  badgeIcon: ReactNode;
}

const PAGE_CONFIG: Record<PageVariant, PageConfig> = {
  teacher: {
    roleName: 'Teacher',
    badgeLabel: 'Nhân sự chuyên môn',
    title: 'Quản lý giáo viên',
    description:
      'Theo dõi đầy đủ danh sách giáo viên đã được tạo tài khoản, kiểm tra thông tin liên hệ và tình trạng hoạt động ngay trên một màn hình.',
    note:
      'Tài khoản giáo viên được tạo trong mục Quản lý người dùng. Trang này chỉ hiển thị riêng nhóm giáo viên để tiện theo dõi và cập nhật.',
    searchPlaceholder: 'Tìm theo tên giáo viên, email, số điện thoại...',
    specialtyLabel: 'Chuyên môn',
    specialtyPlaceholder: 'Ví dụ: Trị liệu ngôn ngữ',
    emptyTitle: 'Chưa có giáo viên phù hợp',
    emptyDescription:
      'Hãy thử đổi bộ lọc hoặc tạo thêm tài khoản giáo viên trong mục Quản lý người dùng.',
    listTitle: 'Danh sách giáo viên',
    listSignalLabel: 'Đồng bộ nhóm giáo viên',
    itemLabel: 'giáo viên',
    buttonLabel: 'Mở trang tạo giáo viên',
    defaultSpecialty: '',
    badgeIcon: <ShieldCheck className="w-3.5 h-3.5" />,
  },
  parent: {
    roleName: 'Parent',
    badgeLabel: 'Liên kết gia đình',
    title: 'Quản lý phụ huynh',
    description:
      'Xem nhanh các tài khoản phụ huynh đang có trên hệ thống, kiểm tra thông tin liên hệ và cập nhật ghi chú hỗ trợ khi cần.',
    note:
      'Tài khoản phụ huynh cũng được tạo trong mục Quản lý người dùng. Trang này tách riêng để quản trị viên thao tác nhanh hơn.',
    searchPlaceholder: 'Tìm theo tên phụ huynh, email, số điện thoại...',
    specialtyLabel: 'Thông tin bổ sung',
    specialtyPlaceholder: 'Ví dụ: Phụ huynh chính',
    emptyTitle: 'Chưa có phụ huynh phù hợp',
    emptyDescription:
      'Hãy thử đổi bộ lọc hoặc tạo thêm tài khoản phụ huynh trong mục Quản lý người dùng.',
    listTitle: 'Danh sách phụ huynh',
    listSignalLabel: 'Đồng bộ nhóm phụ huynh',
    itemLabel: 'phụ huynh',
    buttonLabel: 'Mở trang tạo phụ huynh',
    defaultSpecialty: 'Phụ huynh hỗ trợ',
    badgeIcon: <Heart className="w-3.5 h-3.5 fill-current" />,
  },
};

function formatUserCode(id: number) {
  return `USR-${String(id).padStart(3, '0')}`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getGenderLabel(gender: string) {
  switch (gender.toLowerCase()) {
    case 'male':
      return 'Nam';
    case 'female':
      return 'Nữ';
    default:
      return 'Khác';
  }
}

function getStatusLabel(isActive: boolean) {
  return isActive ? 'Hoạt động' : 'Đã khóa';
}

function getStatusBadgeClass(isActive: boolean) {
  return isActive
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    : 'bg-rose-50 text-rose-600 border border-rose-100';
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'ND';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentClass,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  accentClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-slate-400 font-black uppercase text-xs tracking-wider">
            {title}
          </p>
          <p className="mt-3 text-3xl font-black text-slate-800 tracking-tight">
            {value}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
        </div>
        <div className={cn('p-3 rounded-2xl border', accentClass)}>{icon}</div>
      </div>
    </div>
  );
}

function ToastBanner({
  alertConfig,
  onClose,
}: {
  alertConfig: ToastConfig | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {alertConfig && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.96 }}
          className="fixed top-10 left-1/2 z-[300] w-[90%] max-w-lg -translate-x-1/2"
        >
          <div
            className={cn(
              'flex items-center gap-4 rounded-3xl border-2 border-white p-5 text-white shadow-2xl backdrop-blur-md',
              alertConfig.type === 'success'
                ? 'bg-[#4EACAF]/95'
                : 'bg-[#FF8E8E]/95'
            )}
          >
            <div className="rounded-xl bg-white/20 p-2">
              {alertConfig.type === 'success' ? (
                <Check className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <p className="flex-1 text-sm font-black italic tracking-tight">
              {alertConfig.message}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function RoleUserManagementPage({
  variant,
}: {
  variant: PageVariant;
}) {
  const navigate = useNavigate();
  const config = PAGE_CONFIG[variant];
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'Male' | 'Female' | 'Other'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Locked'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof UserResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

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

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [alertConfig, setAlertConfig] = useState<ToastConfig | null>(null);

  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGender, setFormGender] = useState<UserGender>('Female');
  const [formSpecialty, setFormSpecialty] = useState(config.defaultSpecialty);
  const [formIsActive, setFormIsActive] = useState(true);

  const triggerNotification = useCallback(
    (message: string, type: 'success' | 'warning' = 'success') => {
      setAlertConfig({ message, type });
      window.setTimeout(() => {
        setAlertConfig(null);
      }, 4000);
    },
    []
  );

  const fetchUsersByRole = useCallback(async () => {
    setIsLoading(true);

    try {
      const allUsers: UserResponse[] = [];
      let pageNumber = 1;
      let totalPages = 1;

      do {
        const result = await getUsers(pageNumber, 100);

        if (!result.success || !result.data) {
          triggerNotification(
            result.message || `Không thể tải danh sách ${config.itemLabel}.`,
            'warning'
          );
          setUsers([]);
          return;
        }

        allUsers.push(...result.data.items);
        totalPages = Math.max(result.data.totalPages, 1);
        pageNumber += 1;
      } while (pageNumber <= totalPages);

      const normalizedRole = config.roleName.toLowerCase();
      const scopedUsers = allUsers
        .filter((user) => user.roleName.toLowerCase() === normalizedRole)
        .sort((first, second) => second.id - first.id);

      setUsers(scopedUsers);
    } finally {
      setIsLoading(false);
    }
  }, [config.itemLabel, config.roleName, triggerNotification]);

  useEffect(() => {
    void fetchUsersByRole();
  }, [fetchUsersByRole]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, genderFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = users.filter((user) => {
      const matchesSearch =
        query.length === 0 ||
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query) ||
        user.specialty.toLowerCase().includes(query);

      const matchesGender =
        genderFilter === 'ALL' ||
        user.gender.toLowerCase() === genderFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'Active' && user.isActive) ||
        (statusFilter === 'Locked' && !user.isActive);

      return matchesSearch && matchesGender && matchesStatus;
    });

    if (!sortColumn || !sortDirection) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        const orderA = valA ? 1 : 0;
        const orderB = valB ? 1 : 0;
        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB, 'vi-VN') : valB.localeCompare(valA, 'vi-VN');
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [genderFilter, searchQuery, statusFilter, users, sortColumn, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredUsers, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredUsers.length, pageSize]);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const lockedUsers = users.filter((user) => !user.isActive).length;
  const usersWithPhone = users.filter((user) => user.phone.trim().length > 0).length;
  const usersWithSpecialty = users.filter(
    (user) => user.specialty.trim().length > 0
  ).length;

  const handleOpenDetail = (user: UserResponse) => {
    setSelectedUser(user);
    setModalMode('detail');
  };

  const handleOpenEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormGender((user.gender as UserGender) || 'Other');
    setFormSpecialty(user.specialty || config.defaultSpecialty);
    setFormIsActive(user.isActive);
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleOpenAdd = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormGender('Female');
    setFormSpecialty(config.defaultSpecialty);
    setFormIsActive(true);
    setSelectedUser(null);
    setModalMode('add');
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!formFullName.trim() || !formEmail.trim()) {
      triggerNotification('Vui lòng nhập đầy đủ họ tên và email.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail.trim())) {
      triggerNotification('Email không đúng định dạng.', 'warning');
      return;
    }

    const resolvedSpecialty =
      formSpecialty.trim() || config.defaultSpecialty || '';

    if (config.roleName === 'Teacher' && !resolvedSpecialty) {
      triggerNotification('Vui lòng nhập chuyên môn cho giáo viên.', 'warning');
      return;
    }

    setIsSaving(true);

    if (modalMode === 'add') {
      const result = await createAccount({
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        gender: formGender,
        specialty: resolvedSpecialty,
        roleName: config.roleName,
      });
      setIsSaving(false);

      if (!result.success || !result.data) {
        const message =
          result.errors.length > 0 ? result.errors.join(' ') : result.message;
        triggerNotification(message || 'Tạo tài khoản thất bại.', 'warning');
        return;
      }

      triggerNotification(`Đã tạo tài khoản ${config.itemLabel} mới thành công.`);
      handleCloseModal();
      void fetchUsersByRole();
    } else {
      if (!selectedUser) {
        setIsSaving(false);
        return;
      }
      const result = await updateUser(selectedUser.id, {
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        gender: formGender,
        specialty: resolvedSpecialty,
        roleName: config.roleName,
        isActive: formIsActive,
      });
      setIsSaving(false);

      if (!result.success || !result.data) {
        const message =
          result.errors.length > 0 ? result.errors.join(' ') : result.message;
        triggerNotification(message || 'Cập nhật thông tin thất bại.', 'warning');
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === result.data!.id ? result.data! : user))
      );
      triggerNotification(`Đã cập nhật thông tin ${config.itemLabel} thành công.`);
      handleCloseModal();
    }
  };

  const handleToggleLock = async (user: UserResponse) => {
    const nextActive = !user.isActive;

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.id === user.id ? { ...item, isActive: nextActive } : item
      )
    );

    const result = await updateUser(user.id, {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || undefined,
      gender: (user.gender as UserGender) || 'Other',
      specialty: user.specialty || config.defaultSpecialty,
      roleName: config.roleName,
      isActive: nextActive,
    });

    if (!result.success || !result.data) {
      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id ? { ...item, isActive: user.isActive } : item
        )
      );

      const message =
        result.errors.length > 0 ? result.errors.join(' ') : result.message;
      triggerNotification(message || 'Không thể cập nhật trạng thái.', 'warning');
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((item) => (item.id === result.data!.id ? result.data! : item))
    );
    triggerNotification(
      nextActive
        ? `Đã mở khóa tài khoản ${config.itemLabel}.`
        : `Đã khóa tài khoản ${config.itemLabel}.`
    );
  };

  return (
    <div className="relative space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-24 duration-700">
      <ToastBanner
        alertConfig={alertConfig}
        onClose={() => setAlertConfig(null)}
      />

      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            {config.badgeIcon}
            {config.badgeLabel}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            {config.title.includes('giáo viên') || config.title.includes('Giáo viên') ? (
              <>
                Quản lý <span className="text-[#4EACAF]">Giáo viên</span>
              </>
            ) : (
              <>
                Quản lý <span className="text-[#4EACAF]">Phụ huynh</span>
              </>
            )}
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            {config.description}
          </p>
          <div className="inline-flex items-start gap-2 rounded-xl border border-amber-100/60 bg-amber-50/70 p-3 text-xs font-bold text-amber-850 max-w-2xl mt-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>{config.note}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void fetchUsersByRole()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold text-slate-650 transition-all hover:bg-white/40 cursor-pointer active:scale-95 shrink-0"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Tải lại
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentUser?.Role === 'TEACHER') {
                handleOpenAdd();
              } else {
                navigate('/admin/users');
              }
            }}
            className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            <Users className="h-5 w-5" strokeWidth={2.5} />
            {currentUser?.Role === 'TEACHER' ? 'Thêm phụ huynh mới' : config.buttonLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={`Tổng ${config.itemLabel}`}
          value={totalUsers}
          subtitle="Đồng bộ từ danh sách người dùng"
          icon={<Users className="h-5 w-5 text-[#4EACAF]" />}
          accentClass="border-[#4EACAF]/20 bg-[#4EACAF]/5"
        />
        <StatCard
          title="Đang hoạt động"
          value={activeUsers}
          subtitle={`${activeUsers} tài khoản đang dùng được`}
          icon={<UserCheck className="h-5 w-5 text-emerald-600" />}
          accentClass="border-emerald-100 bg-emerald-50/70"
        />
        <StatCard
          title="Đã khóa"
          value={lockedUsers}
          subtitle="Cần mở lại khi muốn sử dụng"
          icon={<UserX className="h-5 w-5 text-rose-600" />}
          accentClass="border-rose-100 bg-rose-50/70"
        />
        <StatCard
          title={variant === 'teacher' ? 'Có chuyên môn' : 'Có số điện thoại'}
          value={variant === 'teacher' ? usersWithSpecialty : usersWithPhone}
          subtitle={
            variant === 'teacher'
              ? 'Đã khai báo đủ thông tin chuyên môn'
              : 'Đã có thông tin liên hệ để kết nối'
          }
          icon={
            variant === 'teacher' ? (
              <Sparkles className="h-5 w-5 text-amber-600" />
            ) : (
              <Phone className="h-5 w-5 text-amber-600" />
            )
          }
          accentClass="border-amber-100 bg-amber-50/70"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={config.searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-10 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#4EACAF] focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 rounded-full bg-gray-200/60 p-1 -translate-y-1/2 transition-colors hover:bg-gray-200"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row items-center">
          <CustomSelect
            value={genderFilter}
            onChange={(val) => setGenderFilter(val as 'ALL' | 'Male' | 'Female' | 'Other')}
            variant="filter"
            className="w-full sm:w-44"
            options={[
              { value: 'ALL', label: 'Tất cả giới tính' },
              { value: 'Male', label: 'Nam' },
              { value: 'Female', label: 'Nữ' },
              { value: 'Other', label: 'Khác' }
            ]}
          />

          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as 'ALL' | 'Active' | 'Locked')}
            variant="filter"
            className="w-full sm:w-44"
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'Active', label: 'Hoạt động' },
              { value: 'Locked', label: 'Đã khóa' }
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold leading-none text-slate-800">
              {config.listTitle}
            </h3>
            <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Đang hiển thị {filteredUsers.length} trong tổng số {totalUsers}{' '}
              {config.itemLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              {config.listSignalLabel}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#4EACAF]" />
            <span className="font-semibold">Đang tải dữ liệu từ hệ thống...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="space-y-4 py-24 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-dashed border-gray-200 bg-gray-50">
              <Users className="h-8 w-8 text-gray-300" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black text-gray-700">{config.emptyTitle}</p>
              <p className="text-sm font-medium text-gray-400">
                {config.emptyDescription}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setGenderFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="rounded-xl border border-gray-200 px-5 py-2 text-xs font-black uppercase text-[#4EACAF] transition-all hover:bg-gray-100"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#FDFCF5]/50 text-xs font-bold uppercase tracking-widest text-[#555]">
                    <th
                      onClick={() => handleSort('id')}
                      className="w-[10%] min-w-[110px] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Mã người dùng"
                    >
                      <div className="flex items-center gap-1.5">
                        Mã người dùng
                        {sortColumn === 'id' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('fullName')}
                      className="w-[23%] min-w-[200px] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title={variant === 'teacher' ? 'Sắp xếp theo Giáo viên' : 'Sắp xếp theo Phụ huynh'}
                    >
                      <div className="flex items-center gap-1.5">
                        {variant === 'teacher' ? 'Giáo viên' : 'Phụ huynh'}
                        {sortColumn === 'fullName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('email')}
                      className="w-[27%] min-w-[240px] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Email"
                    >
                      <div className="flex items-center gap-1.5">
                        Email
                        {sortColumn === 'email' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort(variant === 'teacher' ? 'specialty' : 'phone')}
                      className="w-[18%] min-w-[160px] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title={variant === 'teacher' ? 'Sắp xếp theo Chuyên môn' : 'Sắp xếp theo Số điện thoại'}
                    >
                      <div className="flex items-center gap-1.5">
                        {variant === 'teacher' ? config.specialtyLabel : 'Số điện thoại'}
                        {sortColumn === (variant === 'teacher' ? 'specialty' : 'phone') ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('gender')}
                      className="w-[8%] min-w-[80px] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Giới tính"
                    >
                      <div className="flex items-center gap-1.5">
                        Giới tính
                        {sortColumn === 'gender' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('isActive')}
                      className="w-[9%] min-w-[100px] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Trạng thái"
                    >
                      <div className="flex items-center gap-1.5">
                        Trạng thái
                        {sortColumn === 'isActive' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th className="w-[5%] min-w-[110px] px-[5px] py-5 text-right select-none">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-700">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-gray-50/40">
                      <td className="px-[5px] py-5 font-mono text-xs font-black text-gray-400">
                        {formatUserCode(user.id)}
                      </td>
                      <td className="px-[5px] py-5">
                        <div className="space-y-1">
                          <p className="text-base font-black text-[#111]">
                            {user.fullName}
                          </p>
                          <p className="text-xs font-semibold text-slate-400">
                            {variant === 'teacher' ? 'Giáo viên' : 'Phụ huynh'}
                          </p>
                        </div>
                      </td>
                      <td className="px-[5px] py-5">
                        <div className="flex items-center gap-2 font-semibold text-slate-700">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-[5px] py-5">
                        {variant === 'teacher' ? (
                          <span className="font-semibold text-slate-700">
                            {user.specialty || 'Chưa cập nhật'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 font-semibold text-slate-700">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span>{user.phone || 'Chưa cập nhật'}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-[5px] py-5 font-semibold text-slate-700">
                        {getGenderLabel(user.gender)}
                      </td>
                      <td className="px-[5px] py-5">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide',
                            getStatusBadgeClass(user.isActive)
                          )}
                        >
                          {getStatusLabel(user.isActive)}
                        </span>
                      </td>
                      <td className="px-[5px] py-5">
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton
                            type="view"
                            onClick={() => handleOpenDetail(user)}
                            title="Xem chi tiết"
                          />
                          <ActionButton
                            type="edit"
                            onClick={() => handleOpenEdit(user)}
                            title="Chỉnh sửa"
                          />
                          <ActionButton
                            type={user.isActive ? 'lock' : 'unlock'}
                            onClick={() => void handleToggleLock(user)}
                            title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-6">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredUsers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel={config.itemLabel}
              />
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {modalMode && (modalMode === 'add' || selectedUser) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              className="app-modal-panel w-full max-w-2xl overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl"
            >
              <div className={cn(
                'px-8 py-6 flex items-center justify-between border-b',
                modalMode === 'edit'
                  ? 'bg-sky-50 border-sky-100'
                  : modalMode === 'add'
                    ? 'bg-[#E2F2F3] border-[#C5E1E3]'
                    : 'bg-purple-50 border-purple-100'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2 text-gray-900">
                    {modalMode === 'edit' ? (
                      <Edit3 className="w-6 h-6 text-sky-500" />
                    ) : modalMode === 'add' ? (
                      <Users className="w-6 h-6 text-[#4EACAF]" />
                    ) : (
                      <Eye className="w-6 h-6 text-purple-600" />
                    )}
                    {modalMode === 'edit'
                      ? `Chỉnh sửa ${config.itemLabel}`
                      : modalMode === 'add'
                        ? `Thêm ${config.itemLabel} mới`
                        : `Chi tiết ${config.itemLabel}`}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalMode === 'add' ? 'Khởi tạo tài khoản mới' : selectedUser?.fullName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {modalMode === 'detail' ? (
                <div className="app-modal-body grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                  <DetailField label="Mã người dùng" value={formatUserCode(selectedUser.id)} />
                  <DetailField label="Họ và tên" value={selectedUser.fullName} />
                  <DetailField label="Email" value={selectedUser.email} className="sm:col-span-2" />
                  <DetailField
                    label="Số điện thoại"
                    value={selectedUser.phone || 'Chưa cập nhật'}
                  />
                  <DetailField
                    label="Giới tính"
                    value={getGenderLabel(selectedUser.gender)}
                  />
                  <DetailField
                    label={config.specialtyLabel}
                    value={selectedUser.specialty || config.defaultSpecialty || 'Chưa cập nhật'}
                  />
                  <DetailField
                    label="Trạng thái"
                    value={getStatusLabel(selectedUser.isActive)}
                  />
                  <DetailField
                    label="Ngày tạo"
                    value={formatDateTime(selectedUser.createdAt)}
                  />
                  <DetailField
                    label="Cập nhật lần cuối"
                    value={formatDateTime(selectedUser.updatedAt)}
                  />
                </div>
              ) : (
                <form onSubmit={handleSave} className="app-modal-body space-y-5 p-6">
                  <div className="app-modal-form-grid grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Họ và tên">
                      <input
                        type="text"
                        value={formFullName}
                        onChange={(event) => setFormFullName(event.target.value)}
                        className="w-full rounded-2xl border-2 border-transparent bg-[#FDFCF5] px-5 py-4 text-sm font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white"
                      />
                    </FormField>

                    <FormField label="Email">
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(event) => setFormEmail(event.target.value)}
                        className="w-full rounded-2xl border-2 border-transparent bg-[#FDFCF5] px-5 py-4 text-sm font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white"
                      />
                    </FormField>

                    <FormField label="Số điện thoại">
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(event) => setFormPhone(event.target.value)}
                        className="w-full rounded-2xl border-2 border-transparent bg-[#FDFCF5] px-5 py-4 text-sm font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white"
                      />
                    </FormField>

                    <FormField label="Giới tính">
                      <CustomSelect
                        value={formGender}
                        onChange={(val) => setFormGender(val as UserGender)}
                        variant="form"
                        options={[
                          { value: 'Male', label: 'Nam' },
                          { value: 'Female', label: 'Nữ' },
                          { value: 'Other', label: 'Khác' }
                        ]}
                      />
                    </FormField>

                    {modalMode === 'edit' && (
                      <>
                        <FormField label={config.specialtyLabel}>
                          <input
                            type="text"
                            value={formSpecialty}
                            onChange={(event) => setFormSpecialty(event.target.value)}
                            placeholder={config.specialtyPlaceholder}
                            className="w-full rounded-2xl border-2 border-transparent bg-[#FDFCF5] px-5 py-4 text-sm font-bold text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#4EACAF] focus:bg-white"
                          />
                        </FormField>

                        <FormField label="Trạng thái">
                          <CustomSelect
                            value={formIsActive ? 'Active' : 'Locked'}
                            onChange={(val) => setFormIsActive(val === 'Active')}
                            variant="form"
                            options={[
                              { value: 'Active', label: 'Hoạt động' },
                              { value: 'Locked', label: 'Đã khóa' }
                            ]}
                          />
                        </FormField>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-2xl bg-slate-100 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-500 transition-all hover:bg-slate-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-2xl bg-[#4EACAF] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#3d8c8e] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-slate-50/70 p-4", className)}>
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}
