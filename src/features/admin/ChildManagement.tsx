import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  Baby,
  Brain,
  Check,
  ChevronDown,
  Clock,
  Edit3,
  Eye,
  Info,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import { cn, resolveAvatarUrl } from '../../lib/utils';
import CustomSelect from '../../components/common/CustomSelect';
import ActionButton from '../../components/common/ActionButton';
import {
  useChildManagementApi,
  type ChildProfileResponse,
} from '../../hooks/useChildManagementApi';
import type { ChildProfilePayload } from '../../services/childProfileService';
import { getUsers } from '../../services/userService';
import { getSessionRole } from '../../lib/authSession';

interface Child {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  Note: string;
  Status: 'Active' | 'Inactive';
  Avatar: string | null;
  CreatedAt: string;
  UpdatedAt: string;
}

interface ChildFormState {
  userId: string;
  fullName: string;
  age: string;
  gender: Child['Gender'];
  learningLevel: Child['LearningLevel'];
  note: string;
  status: Child['Status'];
  avatar: string | null;
}

const API_PAGE_SIZE = 100;

const EMPTY_FORM: ChildFormState = {
  userId: '',
  fullName: '',
  age: '',
  gender: 'Male',
  learningLevel: 'Beginner',
  note: '',
  status: 'Active',
  avatar: null,
};

function mapChildProfile(profile: ChildProfileResponse): Child {
  return {
    ChildId: String(profile.id),
    ParentUserId: String(profile.userId),
    FullName: profile.fullName,
    Age: profile.age,
    Gender: profile.gender,
    LearningLevel: profile.learningLevel,
    Note: profile.note?.trim() || 'Chưa có ghi chú bổ sung từ hệ thống.',
    Status: profile.status,
    Avatar: profile.avatar || null,
    CreatedAt: profile.createdAt,
    UpdatedAt: profile.updatedAt ?? profile.createdAt,
  };
}

function mapChildToForm(child: Child): ChildFormState {
  return {
    userId: child.ParentUserId,
    fullName: child.FullName,
    age: String(child.Age),
    gender: child.Gender,
    learningLevel: child.LearningLevel,
    note:
      child.Note === 'Chưa có ghi chú bổ sung từ hệ thống.' ? '' : child.Note,
    status: child.Status,
    avatar: child.Avatar || null,
  };
}

function mapFormToPayload(form: ChildFormState): ChildProfilePayload {
  return {
    userId: Number(form.userId),
    fullName: form.fullName.trim(),
    age: Number(form.age),
    gender: form.gender,
    learningLevel: form.learningLevel,
    note: form.note.trim() || null,
    status: form.status,
    avatar: form.avatar || 'default',
  };
}

function formatDateTime(value: string) {
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

function getGenderLabel(gender: Child['Gender']) {
  switch (gender) {
    case 'Male':
      return 'Nam';
    case 'Female':
      return 'Nữ';
    default:
      return 'Khác';
  }
}

function getStatusLabel(status: Child['Status']) {
  return status === 'Active' ? 'Đang học' : 'Tạm ngưng';
}

function hasSupportFlag(child: Child) {
  const note = child.Note.toLocaleLowerCase('vi-VN');
  return (
    child.Age < 5 ||
    note.includes('can') ||
    note.includes('theo doi') ||
    note.includes('luu y')
  );
}

export default function ChildManagement() {
  const {
    getChildProfiles,
    getChildProfileById,
    createChildProfile,
    updateChildProfile,
    deleteChildProfile,
  } = useChildManagementApi();

  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [parentsMap, setParentsMap] = useState<Record<string, string>>({});
  const [parentOptions, setParentOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAge, setFilterAge] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof Child | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const [modalType, setModalType] = useState<
    'detail' | 'form' | 'delete' | null
  >(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [formState, setFormState] = useState<ChildFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [alertConfig, setAlertConfig] = useState<{
    message: string;
    type: 'success' | 'warning';
  } | null>(null);

  const triggerNotification = useCallback(
    (message: string, type: 'success' | 'warning' = 'success') => {
      setAlertConfig({ message, type });
      window.setTimeout(() => setAlertConfig(null), 4000);
    },
    []
  );

  const fetchChildren = useCallback(async () => {
    setIsLoading(true);

    const loadedChildren: Child[] = [];
    let pageNumber = 1;
    let totalPages = 1;

    while (pageNumber <= totalPages) {
      const result = await getChildProfiles(pageNumber, API_PAGE_SIZE);

      if (!result.success || !result.data) {
        setIsLoading(false);
        triggerNotification(
          result.errors.join(' ') ||
            result.message ||
            'Không thể tải danh sách hồ sơ trẻ.',
          'warning'
        );
        return;
      }

      loadedChildren.push(...result.data.items.map(mapChildProfile));
      totalPages = result.data.totalPages || 1;
      pageNumber += 1;
    }

    setChildrenList(
      loadedChildren.sort((left, right) =>
        left.FullName.localeCompare(right.FullName)
      )
    );
    setIsLoading(false);
  }, [getChildProfiles, triggerNotification]);

  useEffect(() => {
    void fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    const fetchParents = async () => {
      const role = getSessionRole();
      if (role !== 'ADMIN') {
        return;
      }
      const result = await getUsers(1, 1000);
      if (result.success && result.data) {
        const mapping: Record<string, string> = {};
        const options: Array<{ value: string; label: string }> = [];
        result.data.items.forEach((user) => {
          mapping[String(user.id)] = user.fullName;
          if (user.roleName === 'Parent') {
            options.push({
              value: String(user.id),
              label: `${user.fullName} (ID: ${user.id})`,
            });
          }
        });
        setParentsMap(mapping);
        setParentOptions(options.sort((a, b) => a.label.localeCompare(b.label)));
      }
    };
    void fetchParents();
  }, []);

  const activeParentOptions = useMemo(() => {
    const options = [...parentOptions];
    if (formState.userId && !options.some((opt) => opt.value === formState.userId)) {
      const parentName = parentsMap[formState.userId] || `Tài khoản #${formState.userId}`;
      options.push({
        value: formState.userId,
        label: `${parentName} (ID: ${formState.userId})`,
      });
    }
    if (!formState.userId) {
      options.unshift({
        value: '',
        label: 'Chọn phụ huynh liên kết...',
      });
    }
    return options;
  }, [parentOptions, formState.userId, parentsMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterAge, filterGender, filterLevel, filterStatus]);

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedChild(null);
    setIsDetailLoading(false);
    setIsSaving(false);
    setIsDeleting(false);
    setFormError('');
    setFormState(EMPTY_FORM);
  };

  const handleOpenDetail = useCallback(
    async (child: Child) => {
      setSelectedChild(child);
      setModalType('detail');
      setIsDetailLoading(true);

      const result = await getChildProfileById(Number(child.ChildId));

      if (result.success && result.data) {
        setSelectedChild(mapChildProfile(result.data));
      } else {
        triggerNotification(
          result.errors.join(' ') ||
            result.message ||
            'Không thể tải chi tiết hồ sơ trẻ.',
          'warning'
        );
      }

      setIsDetailLoading(false);
    },
    [getChildProfileById, triggerNotification]
  );

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedChild(null);
    setFormState(EMPTY_FORM);
    setFormError('');
    setModalType('form');
  };

  const openEditModal = useCallback(
    async (child: Child) => {
      setFormMode('edit');
      setSelectedChild(child);
      setFormState(mapChildToForm(child));
      setFormError('');
      setModalType('form');

      const result = await getChildProfileById(Number(child.ChildId));

      if (result.success && result.data) {
        const nextChild = mapChildProfile(result.data);
        setSelectedChild(nextChild);
        setFormState(mapChildToForm(nextChild));
      }
    },
    [getChildProfileById]
  );

  const openDeleteModal = (child: Child) => {
    setSelectedChild(child);
    setModalType('delete');
  };

  const handleFormChange = <K extends keyof ChildFormState>(
    key: K,
    value: ChildFormState[K]
  ) => {
    setFormState((current) => ({ ...current, [key]: value }));
    setFormError('');
  };

  const handleSort = (column: keyof Child) => {
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

  const validateForm = () => {
    if (!formState.userId.trim()) return 'Vui lòng chọn phụ huynh liên kết.';
    if (Number.isNaN(Number(formState.userId)) || Number(formState.userId) <= 0) {
      return 'Mã tài khoản phụ huynh liên kết phải là số dương hợp lệ.';
    }
    if (!formState.fullName.trim()) return 'Vui lòng nhập họ tên trẻ.';
    if (!formState.age.trim()) return 'Vui lòng nhập độ tuổi của trẻ.';
    if (Number.isNaN(Number(formState.age)) || Number(formState.age) <= 0) {
      return 'Độ tuổi phải là số dương hợp lệ.';
    }

    return '';
  };

  const handleSubmitForm = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError('');
    setIsSaving(true);

    const payload = mapFormToPayload(formState);

    const result =
      formMode === 'create'
        ? await createChildProfile(payload)
        : await updateChildProfile(Number(selectedChild?.ChildId), payload);

    if (!result.success || !result.data) {
      setIsSaving(false);
      setFormError(result.errors.join(' ') || result.message);
      return;
    }

    await fetchChildren();
    setIsSaving(false);
    handleCloseModal();
    triggerNotification(
      formMode === 'create'
        ? 'Đã đăng ký hồ sơ trẻ mới thành công.'
        : 'Đã cập nhật hồ sơ trẻ thành công.',
      'success'
    );
  };


  const handleConfirmDelete = async () => {
    if (!selectedChild) return;

    setIsDeleting(true);
    const result = await deleteChildProfile(Number(selectedChild.ChildId));

    if (!result.success) {
      setIsDeleting(false);
      triggerNotification(
        result.errors.join(' ') ||
          result.message ||
          'Không thể xóa hồ sơ trẻ.',
        'warning'
      );
      return;
    }

    await fetchChildren();
    setIsDeleting(false);
    const deletedName = selectedChild.FullName;
    handleCloseModal();
    triggerNotification(`Đã xóa hồ sơ trẻ ${deletedName} thành công.`, 'success');
  };

  const totalChildren = childrenList.length;
  const activeChildren = childrenList.filter(
    (child) => child.Status === 'Active'
  ).length;
  const needSupportChildren = childrenList.filter(hasSupportFlag).length;
  const averageAge =
    totalChildren > 0
      ? parseFloat(
          (
            childrenList.reduce((sum, child) => sum + child.Age, 0) /
            totalChildren
          ).toFixed(1)
        )
      : 0;

  const filteredChildren = useMemo(() => {
    const filtered = childrenList.filter((child) => {
      const searchString =
        `${child.FullName} ${child.ChildId} ${child.ParentUserId}`.toLowerCase();

      const matchesSearch = searchString.includes(searchQuery.toLowerCase());
      const matchesAge =
        filterAge === 'ALL'
          ? true
          : filterAge === 'UNDER_5'
            ? child.Age < 5
            : filterAge === 'S_5_7'
              ? child.Age >= 5 && child.Age <= 7
              : child.Age > 7;

      const matchesGender =
        filterGender === 'ALL' || child.Gender === filterGender;
      const matchesLevel =
        filterLevel === 'ALL' || child.LearningLevel === filterLevel;
      const matchesStatus =
        filterStatus === 'ALL' || child.Status === filterStatus;

      return (
        matchesSearch &&
        matchesAge &&
        matchesGender &&
        matchesLevel &&
        matchesStatus
      );
    });

    if (!sortColumn || !sortDirection) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (sortColumn === 'ChildId') {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      if (sortColumn === 'ParentUserId') {
        const nameA = parentsMap[valA as string] || `Tài khoản #${valA}`;
        const nameB = parentsMap[valB as string] || `Tài khoản #${valB}`;
        return sortDirection === 'asc'
          ? nameA.localeCompare(nameB, 'vi-VN', { numeric: true })
          : nameB.localeCompare(nameA, 'vi-VN', { numeric: true });
      }

      if (sortColumn === 'LearningLevel') {
        const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
        const orderA = levelOrder[valA as 'Beginner' | 'Intermediate' | 'Advanced'] || 0;
        const orderB = levelOrder[valB as 'Beginner' | 'Intermediate' | 'Advanced'] || 0;
        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      }

      if (sortColumn === 'Status') {
        const statusOrder = { Active: 1, Inactive: 2 };
        const orderA = statusOrder[valA as 'Active' | 'Inactive'] || 0;
        const orderB = statusOrder[valB as 'Active' | 'Inactive'] || 0;
        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB, 'vi-VN', { numeric: true })
          : valB.localeCompare(valA, 'vi-VN', { numeric: true });
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [childrenList, searchQuery, filterAge, filterGender, filterLevel, filterStatus, sortColumn, sortDirection, parentsMap]);

  const totalPages = Math.max(1, Math.ceil(filteredChildren.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedChildren = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredChildren.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredChildren, pageSize]);

  const isFiltering =
    searchQuery.trim().length > 0 ||
    filterAge !== 'ALL' ||
    filterGender !== 'ALL' ||
    filterLevel !== 'ALL' ||
    filterStatus !== 'ALL';

  return (
    <div className="relative space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="pointer-events-auto fixed left-1/2 top-10 z-[300] w-[90%] max-w-lg -translate-x-1/2"
          >
            <div
              className={cn(
                'flex items-center gap-4 rounded-3xl border-2 border-white p-5 shadow-2xl backdrop-blur-md',
                alertConfig.type === 'success'
                  ? 'bg-[#4EACAF]/95 text-white'
                  : 'bg-[#FF8E8E]/95 text-white'
              )}
            >
              <div className="rounded-xl bg-white/20 p-2">
                {alertConfig.type === 'success' ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black italic tracking-tight text-white">
                  {alertConfig.message}
                </p>
              </div>
              <button
                onClick={() => setAlertConfig(null)}
                className="rounded-full p-1 text-white transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <Baby className="h-3.5 w-3.5" />
            Hồ sơ học tập nhi đồng
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Quản Lý <span className="text-[#4EACAF]">Hồ Sơ Trẻ Em</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Quản lý thông tin chi tiết, hồ sơ cá nhân và theo dõi tiến trình học tập, can thiệp phát triển ngôn ngữ của trẻ em trên hệ thống GodotXR.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void fetchChildren()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-6 py-4 text-sm font-bold text-slate-655 transition-all hover:bg-white/80 cursor-pointer active:scale-95 shrink-0"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Tải lại
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Đăng ký hồ sơ trẻ em mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatItem
          title="Tổng số trẻ"
          value={totalChildren}
          subtitle="Hồ sơ trẻ em trên hệ thống"
          icon={<Baby className="h-5 w-5 text-[#4EACAF]" />}
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Trẻ đang học"
          value={activeChildren}
          subtitle="Hồ sơ trẻ đang hoạt động học tập"
          icon={<Activity className="h-5 w-5 text-emerald-600" />}
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Bé cần lưu ý thêm"
          value={needSupportChildren}
          subtitle="Trẻ cần theo dõi đặc biệt hoặc dưới 5 tuổi"
          icon={<Brain className="h-5 w-5 text-rose-600" />}
          bgColor="bg-rose-50/70"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Độ tuổi trung bình"
          value={averageAge}
          subtitle="Tính trên tổng số hồ sơ trẻ"
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          bgColor="bg-amber-50/70"
          borderColor="border-slate-100"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-600" />
            <p>
              Danh sách hiển thị thông tin cơ bản của học viên nhi đồng. Bạn có thể xem chi tiết tiến độ, quản lý thông tin hồ sơ học tập và cập nhật tình trạng học của bé tại đây.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên bé, mã hồ sơ hoặc ID tài khoản phụ huynh..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-10 text-sm font-normal text-slate-600 outline-none transition-all placeholder:text-gray-400 focus:border-[#4EACAF] focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 rounded-full bg-gray-200/60 p-1 -translate-y-1/2 hover:bg-gray-200"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SelectField
            value={filterAge}
            onChange={setFilterAge}
            options={[
              { value: 'ALL', label: 'Mọi độ tuổi' },
              { value: 'UNDER_5', label: 'Dưới 5 tuổi' },
              { value: 'S_5_7', label: 'Từ 5 - 7 tuổi' },
              { value: 'OVER_7', label: 'Trên 7 tuổi' },
            ]}
          />
          <SelectField
            value={filterGender}
            onChange={setFilterGender}
            options={[
              { value: 'ALL', label: 'Mọi giới tính' },
              { value: 'Male', label: 'Nam' },
              { value: 'Female', label: 'Nữ' },
              { value: 'Other', label: 'Khác' },
            ]}
          />
          <SelectField
            value={filterLevel}
            onChange={setFilterLevel}
            options={[
              { value: 'ALL', label: 'Mọi cấp độ học' },
              { value: 'Beginner', label: 'Sơ cấp (Beginner)' },
              { value: 'Intermediate', label: 'Trung cấp (Intermediate)' },
              { value: 'Advanced', label: 'Nâng cao (Advanced)' },
            ]}
          />
          <SelectField
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'ALL', label: 'Mọi trạng thái' },
              { value: 'Active', label: 'Đang học' },
              { value: 'Inactive', label: 'Tạm ngưng' },
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold leading-none text-slate-800">
              Danh sách trẻ cần can thiệp âm
            </h3>
            <p className="mt-1.5 text-xs font-normal uppercase tracking-wider text-slate-400">
              Hiển thị {filteredChildren.length} hồ sơ phù hợp bộ lọc
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#4EACAF]" />
            <span className="text-xs font-normal uppercase tracking-wider text-[#4EACAF]">
              Hệ thống đồng bộ
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4EACAF]/10">
              <RefreshCw className="h-7 w-7 animate-spin text-[#4EACAF]" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black text-slate-800">
                Đang tải hồ sơ trẻ từ hệ thống...
              </p>
              <p className="text-sm text-slate-500">
                Hệ thống đang truy xuất danh sách thông tin người dùng.
              </p>
            </div>
          </div>
        ) : filteredChildren.length === 0 ? (
          <div className="space-y-4 py-24 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-dashed border-gray-200 bg-gray-50">
              <Baby className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700">
              {isFiltering
                ? 'Không tìm thấy hồ sơ trẻ em phù hợp bộ lọc.'
                : 'Chưa có hồ sơ trẻ em nào trên hệ thống.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterAge('ALL');
                setFilterGender('ALL');
                setFilterLevel('ALL');
                setFilterStatus('ALL');
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
                  <tr className="border-b border-gray-100 bg-[#FDFCF5]/50 text-xs font-semibold uppercase tracking-wider text-slate-550">
                    <th
                      onClick={() => handleSort('ChildId')}
                      className="w-[5%] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Mã số"
                    >
                      <div className="flex items-center gap-1.5">
                        Mã số
                        {sortColumn === 'ChildId' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('FullName')}
                      className="w-[25%] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Họ tên"
                    >
                      <div className="flex items-center gap-1.5">
                        Hồ sơ trẻ
                        {sortColumn === 'FullName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('Age')}
                      className="w-[10%] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Độ tuổi"
                    >
                      <div className="flex items-center gap-1.5">
                        Độ tuổi
                        {sortColumn === 'Age' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('Gender')}
                      className="w-[8%] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Giới tính"
                    >
                      <div className="flex items-center gap-1.5">
                        Giới tính
                        {sortColumn === 'Gender' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('ParentUserId')}
                      className="w-[24%] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Phụ huynh"
                    >
                      <div className="flex items-center gap-1.5">
                        Phụ huynh
                        {sortColumn === 'ParentUserId' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('LearningLevel')}
                      className="w-[10%] px-[5px] py-5 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Cấp độ học"
                    >
                      <div className="flex items-center gap-1.5">
                        Cấp độ
                        {sortColumn === 'LearningLevel' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th className="w-[8%] px-[5px] py-5 select-none">
                      Trạng thái
                    </th>
                    <th className="w-[10%] px-[5px] py-5 text-right select-none">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-normal text-sm text-slate-650">
                  {paginatedChildren.map((child) => (
                    <tr
                      key={child.ChildId}
                      className="transition-colors hover:bg-gray-50/40"
                    >
                      <td className="px-[5px] py-5 font-mono text-xs font-black text-gray-400">
                        {child.ChildId}
                      </td>
                      <td className="px-[5px] py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={resolveAvatarUrl(child.Avatar, child.FullName, 'bottts')}
                            alt={child.FullName}
                            className="h-10 w-10 rounded-2xl border border-orange-100/30 bg-orange-50/50 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="text-base font-extrabold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                              {child.FullName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-[5px] py-5">
                        <span className="font-extrabold text-gray-900 whitespace-nowrap">
                          {child.Age} tuổi
                        </span>
                      </td>
                      <td className="px-[5px] py-5 text-gray-600">
                        {getGenderLabel(child.Gender)}
                      </td>
                      <td className="px-[5px] py-5">
                        <p className="font-normal text-slate-650 whitespace-nowrap overflow-hidden text-ellipsis">
                          {parentsMap[child.ParentUserId] || `Tài khoản #${child.ParentUserId}`}
                        </p>
                      </td>
                      <td className="px-[5px] py-5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest',
                            child.LearningLevel === 'Beginner'
                              ? 'border-sky-100 bg-sky-50 text-sky-600'
                              : child.LearningLevel === 'Intermediate'
                                ? 'border-amber-100 bg-amber-50 text-amber-600'
                                : 'border-purple-100 bg-purple-50 text-purple-600'
                          )}
                        >
                          <Award className="h-3.5 w-3.5" />
                          {child.LearningLevel === 'Beginner'
                            ? 'Sơ cấp'
                            : child.LearningLevel === 'Intermediate'
                              ? 'Trung cấp'
                              : 'Nâng cao'}
                        </span>
                      </td>
                      <td className="px-[5px] py-5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider',
                            child.Status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-gray-100 text-gray-500'
                          )}
                        >
                          {getStatusLabel(child.Status)}
                        </span>
                      </td>
                      <td className="px-[5px] py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton
                            type="view"
                            onClick={() => void handleOpenDetail(child)}
                            title="Thông tin chi tiết"
                          />

                          <ActionButton
                            type="edit"
                            onClick={() => openEditModal(child)}
                            title="Chỉnh sửa hồ sơ"
                          />

                          <ActionButton
                            type="delete"
                            onClick={() => openDeleteModal(child)}
                            title="Xóa hồ sơ"
                          />

                          <ActionButton
                            type="trend"
                            onClick={() =>
                              triggerNotification(
                                'Lịch sử học tập chi tiết sẽ được cập nhật trong phiên bản tiếp theo.',
                                'warning'
                              )
                            }
                            title="Tiến độ học tập"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-50 px-6 pb-6">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredChildren.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="hồ sơ trẻ"
              />
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {modalType === 'detail' && selectedChild && (
          <ModalFrame
            title="Chi tiết hồ sơ trẻ em"
            subtitle="Thông tin lưu trữ trên hệ thống GodotXR"
            onClose={handleCloseModal}
            accent="purple"
          >
            <div className="space-y-8 p-8 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#4EACAF]/15 bg-[#4EACAF]/5 px-4 py-3 text-sm text-slate-600">
                <span>
                  Hồ sơ học tập được cập nhật trực tuyến theo thời gian thực.
                </span>
                {isDetailLoading && (
                  <span className="inline-flex items-center gap-2 font-bold text-[#4EACAF]">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Đang làm mới thông tin...
                  </span>
                )}
              </div>

              <div className="flex flex-col items-start gap-8 border-b border-gray-50 pb-6 font-bold md:flex-row">
                <div className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-purple-100 bg-purple-50 p-3 md:mx-0">
                  <img
                    src={resolveAvatarUrl(selectedChild.Avatar, selectedChild.FullName, 'bottts')}
                    alt="Detail Avatar"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                      <span className="text-2xl font-medium text-slate-800">
                        {selectedChild.FullName}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gray-400">
                        ID: {selectedChild.ChildId}
                      </span>
                    </div>
                    <p className="text-gray-400">
                      Độ tuổi: {selectedChild.Age} tuổi | Giới tính:{' '}
                      {getGenderLabel(selectedChild.Gender)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs md:justify-start">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase italic',
                        selectedChild.LearningLevel === 'Beginner'
                          ? 'bg-sky-50 text-sky-600'
                          : selectedChild.LearningLevel === 'Intermediate'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-purple-50 text-purple-600'
                      )}
                    >
                      Trình độ:{' '}
                      {selectedChild.LearningLevel === 'Beginner'
                        ? 'Sơ cấp'
                        : selectedChild.LearningLevel === 'Intermediate'
                          ? 'Trung cấp'
                          : 'Nâng cao'}
                    </span>

                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-4 py-0.5 text-[10px] font-black uppercase',
                        selectedChild.Status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {selectedChild.Status === 'Active'
                        ? 'Đang học tập'
                        : 'Tạm dừng học'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                <DetailRow
                  label="Họ và tên đầy đủ của trẻ"
                  value={selectedChild.FullName}
                />
                 <DetailRow
                  label="Phụ huynh liên kết"
                  value={parentsMap[selectedChild.ParentUserId] || `Tài khoản #${selectedChild.ParentUserId}`}
                />
                <DetailRow label="Độ tuổi" value={`${selectedChild.Age} tuổi`} />
                <DetailRow
                  label="Giới tính"
                  value={getGenderLabel(selectedChild.Gender)}
                />
                <DetailRow
                  label="Thời gian đăng ký hồ sơ"
                  value={formatDateTime(selectedChild.CreatedAt)}
                />
                <DetailRow
                  label="Cập nhật lần cuối"
                  value={formatDateTime(selectedChild.UpdatedAt)}
                />
                <div className="col-span-1 space-y-1.5 rounded-2xl border border-[#F2ECD8]/40 bg-[#FDFCF5]/60 p-4 md:col-span-2">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Chẩn đoán & Lưu ý đặc biệt (Ghi chú)
                  </span>
                  <span className="block text-sm font-bold italic leading-relaxed text-gray-800">
                    "{selectedChild.Note}"
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-800">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-600" />
                  <p>
                    Để bảo mật và tối ưu dữ liệu, thông tin liên lạc chi tiết của phụ huynh sẽ được truy cập thông qua mục Quản lý phụ huynh.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="rounded-2xl bg-gray-100 px-8 py-4 font-black text-gray-600 transition-all hover:bg-gray-200"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </ModalFrame>
        )}

        {modalType === 'form' && (
          <ModalFrame
            title={
              formMode === 'create' ? 'Đăng ký hồ sơ trẻ mới' : 'Chỉnh sửa hồ sơ trẻ'
            }
            subtitle={
              formMode === 'create'
                ? 'Vui lòng điền đầy đủ các thông tin dưới đây để đăng ký'
                : 'Cập nhật lại các thông tin của trẻ'
            }
            onClose={handleCloseModal}
            accent="teal"
          >
            <div className="space-y-6 p-8 md:p-10">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {getSessionRole() === 'ADMIN' ? (
                  <SelectInputField
                    label="Phụ huynh liên kết"
                    value={formState.userId}
                    onChange={(value) => handleFormChange('userId', value)}
                    options={activeParentOptions}
                  />
                ) : (
                  <InputField
                    label="ID Phụ huynh liên kết"
                    value={formState.userId}
                    onChange={(value) => handleFormChange('userId', value)}
                    placeholder="Nhập ID tài khoản phụ huynh (ví dụ: 3)"
                    inputMode="numeric"
                  />
                )}
                <InputField
                  label="Họ tên trẻ"
                  value={formState.fullName}
                  onChange={(value) => handleFormChange('fullName', value)}
                  placeholder="Nhập họ tên đầy đủ của bé"
                />
                <InputField
                  label="Độ tuổi"
                  value={formState.age}
                  onChange={(value) => handleFormChange('age', value)}
                  placeholder="Ví dụ: 7"
                  inputMode="numeric"
                />
                <SelectInputField
                  label="Giới tính"
                  value={formState.gender}
                  onChange={(value) =>
                    handleFormChange('gender', value as Child['Gender'])
                  }
                  options={[
                    { value: 'Male', label: 'Nam' },
                    { value: 'Female', label: 'Nữ' },
                    { value: 'Other', label: 'Khác' },
                  ]}
                />
                <SelectInputField
                  label="Cấp độ học"
                  value={formState.learningLevel}
                  onChange={(value) =>
                    handleFormChange(
                      'learningLevel',
                      value as Child['LearningLevel']
                    )
                  }
                  options={[
                    { value: 'Beginner', label: 'Sơ cấp (Beginner)' },
                    { value: 'Intermediate', label: 'Trung cấp (Intermediate)' },
                    { value: 'Advanced', label: 'Nâng cao (Advanced)' },
                  ]}
                />
                <SelectInputField
                  label="Trạng thái"
                  value={formState.status}
                  onChange={(value) =>
                    handleFormChange('status', value as Child['Status'])
                  }
                  options={[
                    { value: 'Active', label: 'Đang học (Active)' },
                    { value: 'Inactive', label: 'Tạm ngưng (Inactive)' },
                  ]}
                />
              </div>

              {/* Avatar Preview & Selection */}
              <div className="flex flex-col md:flex-row gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 items-center">
                <div className="text-center space-y-2 shrink-0">
                  <div className="w-24 h-24 bg-orange-100 rounded-full border-4 border-white shadow-inner overflow-hidden mx-auto relative group">
                    <img 
                      src={resolveAvatarUrl(formState.avatar, formState.fullName || 'default', 'bottts')} 
                      alt="profile preview" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Ảnh đại diện</span>
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider block text-left">Chọn ảnh đại diện cho bé</span>
                  <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 bg-white p-2.5 rounded-xl border border-slate-150">
                    {/* Default dynamic option */}
                    <button
                      type="button"
                      onClick={() => handleFormChange('avatar', null)}
                      className={cn(
                        "w-8 h-8 rounded-lg bg-slate-50 border flex items-center justify-center text-[8px] font-black text-slate-500 hover:border-[#4EACAF] transition-all cursor-pointer",
                        formState.avatar === null ? "border-[#4EACAF] bg-[#4EACAF]/10 ring-2 ring-[#4EACAF]/10" : "border-slate-100"
                      )}
                      title="Mặc định"
                    >
                      MĐ
                    </button>
                    {/* 10 downloaded avatars */}
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const avPath = `/avatars/avatar-${idx + 1}.svg`;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleFormChange('avatar', avPath)}
                          className={cn(
                            "w-8 h-8 rounded-lg overflow-hidden border hover:border-[#4EACAF] transition-all bg-white p-0.5 cursor-pointer",
                            formState.avatar === avPath ? "border-[#4EACAF] ring-2 ring-[#4EACAF]/10" : "border-slate-100"
                          )}
                        >
                          <img src={avPath} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Ghi chú / Lưu ý lâm sàng
                </label>
                <textarea
                  value={formState.note}
                  onChange={(event) =>
                    handleFormChange('note', event.target.value)
                  }
                  rows={4}
                  placeholder="Nhập chẩn đoán hoặc ghi chú hỗ trợ cho bé..."
                  className="resize-y w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-600 outline-none transition-colors placeholder:text-slate-400 focus:border-[#4EACAF] focus:bg-white"
                />
              </div>

              {formError && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="rounded-2xl bg-gray-100 px-6 py-3 text-sm font-black text-gray-600 transition-all hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={() => void handleSubmitForm()}
                  disabled={isSaving}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl bg-[#4EACAF] px-6 py-3 text-sm font-black text-white transition-all',
                    isSaving ? 'cursor-not-allowed opacity-70' : 'hover:bg-[#4EACAF]/90'
                  )}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {formMode === 'create' ? 'Tạo hồ sơ' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </ModalFrame>
        )}

        {modalType === 'delete' && selectedChild && (
          <ModalFrame
            title="Xóa hồ sơ trẻ"
            subtitle="Hành động này sẽ xóa vĩnh viễn hồ sơ khỏi hệ thống"
            onClose={handleCloseModal}
            accent="rose"
          >
            <div className="space-y-6 p-8 md:p-10">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-700">
                <p className="font-semibold">
                  Bạn sắp xóa hồ sơ trẻ <strong>{selectedChild.FullName}</strong> (ID:{' '}
                  {selectedChild.ChildId}).
                </p>
                <p className="mt-2">
                  Hành động này không thể hoàn tác. Vui lòng xác nhận nếu đây là hồ
                  sơ bạn thực sự muốn xóa.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="rounded-2xl bg-gray-100 px-6 py-3 text-sm font-black text-gray-600 transition-all hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={() => void handleConfirmDelete()}
                  disabled={isDeleting}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-6 py-3 text-sm font-black text-white transition-all',
                    isDeleting ? 'cursor-not-allowed opacity-70' : 'hover:bg-rose-600'
                  )}
                >
                  {isDeleting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </ModalFrame>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
      variant="filter"
    />
  );
}

function ModalFrame({
  title,
  subtitle,
  onClose,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  accent: 'purple' | 'teal' | 'rose';
  children: React.ReactNode;
}) {
  const accentStyles = {
    purple: 'border-purple-100 bg-purple-50',
    teal: 'border-[#C5E1E3] bg-[#E2F2F3]',
    rose: 'border-rose-100 bg-rose-50',
  };

  return (
    <div className="app-modal-overlay fixed inset-0 z-[200] flex h-full w-full items-center justify-center overflow-y-auto bg-gray-900/10 p-4 backdrop-blur-xl animate-in fade-in duration-300 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="app-modal-panel relative z-30 w-full max-w-2xl overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-2xl"
      >
        <div
          className={cn(
            'flex items-center justify-between px-8 py-6 text-gray-900 border-b',
            accentStyles[accent]
          )}
        >
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black italic tracking-tight">
              <Info className="h-6 w-6" />
              {title}
            </h2>
            <p className="mt-1 text-xs font-normal uppercase tracking-wider text-gray-400">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2.5 transition-colors hover:bg-white/70"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-600 outline-none transition-colors placeholder:text-slate-400 focus:border-[#4EACAF] focus:bg-white"
      />
    </div>
  );
}

function SelectInputField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <CustomSelect
        value={value}
        onChange={onChange}
        options={options}
        variant="form"
      />
    </div>
  );
}

function StatItem({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  borderColor,
}: {
  title: string;
  value: number | string;
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
          <p className="text-3xl font-black text-gray-900 leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-[11px] text-gray-500 font-medium pt-1 line-clamp-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className="block text-sm font-bold text-gray-800">{value}</span>
    </div>
  );
}
