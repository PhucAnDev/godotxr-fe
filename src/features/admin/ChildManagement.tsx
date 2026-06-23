import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  Award,
  Baby,
  Brain,
  Check,
  ChevronDown,
  Clock,
  Edit3,
  Eye,
  Info,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  TrendingUp,
  Unlock,
  X,
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import { cn } from '../../lib/utils';
import {
  useChildManagementApi,
  type ChildProfileResponse,
} from '../../hooks/useChildManagementApi';
import type { ChildProfilePayload } from '../../services/childProfileService';

interface Child {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  Note: string;
  Status: 'Active' | 'Inactive';
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
};

function mapChildProfile(profile: ChildProfileResponse): Child {
  return {
    ChildId: String(profile.id),
    ParentUserId: String(profile.userId),
    FullName: profile.fullName,
    Age: profile.age,
    Gender: profile.gender,
    LearningLevel: profile.learningLevel,
    Note: profile.note?.trim() || 'Chua co ghi chu bo sung tu he thong.',
    Status: profile.status,
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
      child.Note === 'Chua co ghi chu bo sung tu he thong.' ? '' : child.Note,
    status: child.Status,
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
      return 'Cau be (Nam)';
    case 'Female':
      return 'Co be (Nu)';
    default:
      return 'Khac';
  }
}

function getStatusLabel(status: Child['Status']) {
  return status === 'Active' ? 'Dang hoc' : 'Tam ngung';
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
            'Khong the tai danh sach ho so tre.',
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
            'Khong the tai chi tiet ho so tre.',
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
  };

  const validateForm = () => {
    if (!formState.userId.trim()) return 'Vui long nhap userId lien ket.';
    if (Number.isNaN(Number(formState.userId)) || Number(formState.userId) <= 0) {
      return 'userId phai la so duong hop le.';
    }
    if (!formState.fullName.trim()) return 'Vui long nhap ho ten tre.';
    if (!formState.age.trim()) return 'Vui long nhap do tuoi.';
    if (Number.isNaN(Number(formState.age)) || Number(formState.age) <= 0) {
      return 'Do tuoi phai la so duong hop le.';
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
        ? 'Da tao ho so tre moi tu ChildProfile API.'
        : 'Da cap nhat ho so tre thanh cong.',
      'success'
    );
  };

  const handleToggleStatus = async (child: Child) => {
    const nextStatus = child.Status === 'Active' ? 'Inactive' : 'Active';
    const payload: ChildProfilePayload = {
      userId: Number(child.ParentUserId),
      fullName: child.FullName,
      age: child.Age,
      gender: child.Gender,
      learningLevel: child.LearningLevel,
      note:
        child.Note === 'Chua co ghi chu bo sung tu he thong.' ? null : child.Note,
      status: nextStatus,
    };

    const result = await updateChildProfile(Number(child.ChildId), payload);

    if (!result.success || !result.data) {
      triggerNotification(
        result.errors.join(' ') ||
          result.message ||
          'Khong the cap nhat trang thai ho so tre.',
        'warning'
      );
      return;
    }

    await fetchChildren();
    triggerNotification(
      nextStatus === 'Active'
        ? 'Da mo lai ho so tre.'
        : 'Da tam khoa ho so tre.',
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
          'Khong the xoa ho so tre.',
        'warning'
      );
      return;
    }

    await fetchChildren();
    setIsDeleting(false);
    const deletedName = selectedChild.FullName;
    handleCloseModal();
    triggerNotification(`Da xoa ho so tre ${deletedName}.`, 'success');
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

  const filteredChildren = childrenList.filter((child) => {
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
            Ho so hoc tap nhi dong
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Quan Ly <span className="text-[#4EACAF]">Ho So Tre Em</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Quan ly thong tin chi tiet va tien trinh hoc tap cua tre tren he thong
            GodotXR. FE da map truc tiep CRUD vao ChildProfile API de them, sua,
            cap nhat trang thai va xoa ho so.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void fetchChildren()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-6 py-4 text-sm font-bold text-slate-655 transition-all hover:bg-white/80 cursor-pointer active:scale-95 shrink-0"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Tai lai
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Dang ky ho so tre em moi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatItem
          title="Tong so tre"
          value={totalChildren}
          subtitle="Ho so nhi dong dong bo tu API"
          icon={<Baby className="h-5 w-5 text-[#4EACAF]" />}
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Tre dang hoc"
          value={activeChildren}
          subtitle="Ho so con trang thai Active"
          icon={<Activity className="h-5 w-5 text-emerald-600" />}
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Be can luu y them"
          value={needSupportChildren}
          subtitle="Suy luan tu note va do tuoi hien co"
          icon={<Brain className="h-5 w-5 text-rose-600" />}
          bgColor="bg-rose-50/70"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Do tuoi trung binh"
          value={averageAge}
          subtitle="Tinh tu du lieu child profile"
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          bgColor="bg-amber-50/70"
          borderColor="border-slate-100"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            <p>
              API hien chua tra ve ten phu huynh, so dien thoai va lich su tien do.
              Tuy vay FE da dung ChildProfile API that cho danh sach, chi tiet,
              tao, cap nhat va xoa ho so.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tim theo ten be, ma ho so hoac ma tai khoan lien ket..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-10 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#4EACAF] focus:bg-white"
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
              { value: 'ALL', label: 'Moi Do Tuoi' },
              { value: 'UNDER_5', label: 'Duoi 5 tuoi' },
              { value: 'S_5_7', label: 'Tu 5 - 7 tuoi' },
              { value: 'OVER_7', label: 'Tren 7 tuoi' },
            ]}
          />
          <SelectField
            value={filterGender}
            onChange={setFilterGender}
            options={[
              { value: 'ALL', label: 'Moi gioi tinh' },
              { value: 'Male', label: 'Cau be (Nam)' },
              { value: 'Female', label: 'Co be (Nu)' },
              { value: 'Other', label: 'Khac' },
            ]}
          />
          <SelectField
            value={filterLevel}
            onChange={setFilterLevel}
            options={[
              { value: 'ALL', label: 'Moi cap do hoc' },
              { value: 'Beginner', label: 'Beginner (Nhap mon)' },
              { value: 'Intermediate', label: 'Intermediate (Trung cap)' },
              { value: 'Advanced', label: 'Advanced (Nang cao)' },
            ]}
          />
          <SelectField
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'ALL', label: 'Moi trang thai' },
              { value: 'Active', label: 'Dang hoc' },
              { value: 'Inactive', label: 'Tam ngung' },
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold leading-none text-slate-800">
              Danh sach tre can thiep am
            </h3>
            <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Hien thi {filteredChildren.length} ho so phu hop bo loc
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#4EACAF]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4EACAF]">
              ChildProfile API
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
                Dang tai ho so tre tu API
              </p>
              <p className="text-sm text-slate-500">
                He thong se tu gom toan bo cac trang du lieu tu backend.
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
                ? 'Khong tim thay ho so tre em phu hop bo loc.'
                : 'API chua tra ve ho so tre nao.'}
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
              Dat lai bo loc
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#FDFCF5]/50 text-xs font-bold uppercase tracking-widest text-[#555]">
                    <th className="px-10 py-5">Ma so</th>
                    <th className="px-6 py-5">Ho so tre</th>
                    <th className="px-6 py-5">Do tuoi</th>
                    <th className="px-6 py-5">Gioi tinh</th>
                    <th className="px-6 py-5">Tai khoan lien ket</th>
                    <th className="px-6 py-5">Cap do</th>
                    <th className="px-6 py-5">Trang thai</th>
                    <th className="px-10 py-5 text-right">Tuy chon quan tri</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-700">
                  {paginatedChildren.map((child) => (
                    <tr
                      key={child.ChildId}
                      className="transition-colors hover:bg-gray-50/40"
                    >
                      <td className="px-10 py-5 font-mono text-xs font-black text-gray-400">
                        {child.ChildId}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${child.FullName}`}
                            alt={child.FullName}
                            className="h-10 w-10 rounded-2xl border border-orange-100/30 bg-orange-50/50"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-base font-extrabold text-gray-900">
                              {child.FullName}
                            </p>
                            <p className="pt-0.5 text-xs font-medium text-gray-400">
                              Tao ngay {formatDateTime(child.CreatedAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-extrabold text-gray-900">
                          {child.Age} tuoi
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-600">
                        {getGenderLabel(child.Gender)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-gray-800">
                            Tai khoan #{child.ParentUserId}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            userId tu child-profile
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider',
                            child.LearningLevel === 'Beginner'
                              ? 'border-sky-100 bg-sky-50 text-sky-600'
                              : child.LearningLevel === 'Intermediate'
                                ? 'border-amber-100 bg-amber-50 text-amber-600'
                                : 'border-purple-100 bg-purple-50 text-purple-600'
                          )}
                        >
                          <Award className="h-3.5 w-3.5" />
                          {child.LearningLevel}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider',
                            child.Status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-gray-100 text-gray-500'
                          )}
                        >
                          {getStatusLabel(child.Status)}
                        </span>
                      </td>
                      <td className="px-10 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => void handleOpenDetail(child)}
                            className="rounded-xl p-2 text-teal-600 transition-colors hover:bg-teal-50 hover:scale-105"
                            title="Thong tin chi tiet"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(child)}
                            className="rounded-xl p-2 text-sky-500 transition-colors hover:bg-sky-50 hover:scale-105"
                            title="Chinh sua ho so"
                          >
                            <Edit3 className="h-4.5 w-4.5" />
                          </button>

                          <button
                            onClick={() => void handleToggleStatus(child)}
                            className={cn(
                              'rounded-xl p-2 transition-colors hover:scale-105',
                              child.Status === 'Active'
                                ? 'text-rose-500 hover:bg-rose-50'
                                : 'text-emerald-500 hover:bg-emerald-50'
                            )}
                            title="Cap nhat trang thai"
                          >
                            {child.Status === 'Active' ? (
                              <Lock className="h-4.5 w-4.5" />
                            ) : (
                              <Unlock className="h-4.5 w-4.5" />
                            )}
                          </button>

                          <button
                            onClick={() => openDeleteModal(child)}
                            className="rounded-xl p-2 text-rose-500 transition-colors hover:bg-rose-50 hover:scale-105"
                            title="Xoa ho so"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>

                          <button
                            onClick={() =>
                              triggerNotification(
                                'Lich su hoc tap se map tiep khi co nhom analytics/detail phu hop.',
                                'warning'
                              )
                            }
                            className="rounded-xl p-2 text-orange-500 transition-colors hover:bg-orange-50 hover:scale-105"
                            title="Tien do hoc tap"
                          >
                            <TrendingUp className="h-4.5 w-4.5" />
                          </button>
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
                itemLabel="ho so tre"
              />
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {modalType === 'detail' && selectedChild && (
          <ModalFrame
            title="Chi tiet ho so hoc vien"
            subtitle="Dong bo tu `GET /api/child-profile/{id}`"
            onClose={handleCloseModal}
            accent="purple"
          >
            <div className="space-y-8 p-8 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#4EACAF]/15 bg-[#4EACAF]/5 px-4 py-3 text-sm text-slate-600">
                <span>
                  Du lieu dang bam theo contract hien co cua backend, khong dung
                  mock detail.
                </span>
                {isDetailLoading && (
                  <span className="inline-flex items-center gap-2 font-bold text-[#4EACAF]">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Dang lam moi chi tiet...
                  </span>
                )}
              </div>

              <div className="flex flex-col items-start gap-8 border-b border-gray-50 pb-6 font-bold md:flex-row">
                <div className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-purple-100 bg-purple-50 p-3 md:mx-0">
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedChild.FullName}`}
                    alt="Detail Avatar"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                      <span className="text-2xl font-black text-gray-900">
                        {selectedChild.FullName}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                        ID: {selectedChild.ChildId}
                      </span>
                    </div>
                    <p className="text-gray-400">
                      Do tuoi: {selectedChild.Age} tuoi | Gioi tinh:{' '}
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
                      Trinh do: {selectedChild.LearningLevel}
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
                        ? 'Dang hoc tap'
                        : 'Tam dung bai tap'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                <DetailRow
                  label="Ten day du tre (fullName)"
                  value={selectedChild.FullName}
                />
                <DetailRow
                  label="Tai khoan lien ket (userId)"
                  value={selectedChild.ParentUserId}
                />
                <DetailRow label="Do tuoi" value={`${selectedChild.Age} tuoi`} />
                <DetailRow
                  label="Gioi tinh"
                  value={getGenderLabel(selectedChild.Gender)}
                />
                <DetailRow
                  label="Thoi khac khoi tao ho so"
                  value={formatDateTime(selectedChild.CreatedAt)}
                />
                <DetailRow
                  label="Sua doi sau cung"
                  value={formatDateTime(selectedChild.UpdatedAt)}
                />
                <div className="col-span-1 space-y-1.5 rounded-2xl border border-[#F2ECD8]/40 bg-[#FDFCF5]/60 p-4 md:col-span-2">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Chan doan - Luu y lam sang (note)
                  </span>
                  <span className="block text-sm font-bold italic leading-relaxed text-gray-800">
                    "{selectedChild.Note}"
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                  <p>
                    API chi tiet hien chua tra ve ten phu huynh, so dien thoai va
                    lich su hoc tap. Khi BE mo rong contract, phan modal nay co the
                    noi tiep ma khong can quay lai mock data.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="rounded-2xl bg-gray-100 px-8 py-4 font-black text-gray-600 transition-all hover:bg-gray-200"
                >
                  Quay lai
                </button>
              </div>
            </div>
          </ModalFrame>
        )}

        {modalType === 'form' && (
          <ModalFrame
            title={
              formMode === 'create' ? 'Dang ky ho so tre moi' : 'Chinh sua ho so tre'
            }
            subtitle={
              formMode === 'create'
                ? 'Dong bo tu `POST /api/child-profile`'
                : 'Dong bo tu `PUT /api/child-profile/{id}`'
            }
            onClose={handleCloseModal}
            accent="teal"
          >
            <div className="space-y-6 p-8 md:p-10">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="User ID lien ket"
                  value={formState.userId}
                  onChange={(value) => handleFormChange('userId', value)}
                  placeholder="Vi du: 3"
                />
                <InputField
                  label="Ho ten tre"
                  value={formState.fullName}
                  onChange={(value) => handleFormChange('fullName', value)}
                  placeholder="Nhap ho ten day du"
                />
                <InputField
                  label="Do tuoi"
                  value={formState.age}
                  onChange={(value) => handleFormChange('age', value)}
                  placeholder="Vi du: 7"
                  inputMode="numeric"
                />
                <SelectInputField
                  label="Gioi tinh"
                  value={formState.gender}
                  onChange={(value) =>
                    handleFormChange('gender', value as Child['Gender'])
                  }
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                <SelectInputField
                  label="Cap do hoc"
                  value={formState.learningLevel}
                  onChange={(value) =>
                    handleFormChange(
                      'learningLevel',
                      value as Child['LearningLevel']
                    )
                  }
                  options={[
                    { value: 'Beginner', label: 'Beginner' },
                    { value: 'Intermediate', label: 'Intermediate' },
                    { value: 'Advanced', label: 'Advanced' },
                  ]}
                />
                <SelectInputField
                  label="Trang thai"
                  value={formState.status}
                  onChange={(value) =>
                    handleFormChange('status', value as Child['Status'])
                  }
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                  Ghi chu
                </label>
                <textarea
                  value={formState.note}
                  onChange={(event) =>
                    handleFormChange('note', event.target.value)
                  }
                  rows={4}
                  placeholder="Nhap ghi chu neu co..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#4EACAF] focus:bg-white"
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
                  Huy
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
                  {formMode === 'create' ? 'Tao ho so' : 'Luu thay doi'}
                </button>
              </div>
            </div>
          </ModalFrame>
        )}

        {modalType === 'delete' && selectedChild && (
          <ModalFrame
            title="Xoa ho so tre"
            subtitle="Dong bo tu `DELETE /api/child-profile/{id}`"
            onClose={handleCloseModal}
            accent="rose"
          >
            <div className="space-y-6 p-8 md:p-10">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-700">
                <p className="font-semibold">
                  Ban sap xoa ho so <strong>{selectedChild.FullName}</strong> (ID:{' '}
                  {selectedChild.ChildId}).
                </p>
                <p className="mt-2">
                  Hanh dong nay khong the hoan tac. Vui long xac nhan neu day la ho
                  so can xoa khoi he thong.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="rounded-2xl bg-gray-100 px-6 py-3 text-sm font-black text-gray-600 transition-all hover:bg-gray-200"
                >
                  Huy
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
                  Xac nhan xoa
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
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-xs font-bold text-gray-700 outline-none hover:border-[#4EACAF]/45"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
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
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
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
        {children}
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
      <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#4EACAF] focus:bg-white"
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
      <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-[#4EACAF] focus:bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[32px] border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md',
        borderColor
      )}
    >
      <div
        className={cn(
          'absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150',
          bgColor
        )}
      />

      <div className="relative z-10 flex items-center gap-5">
        <div className={cn('shrink-0 rounded-2xl p-4 shadow-inner', bgColor)}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            {title}
          </p>
          <h3 className="mt-1 text-4xl font-black leading-none tracking-tight text-slate-900">
            {value}
          </h3>
          <p className="mt-2 text-xs font-semibold text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span className="block text-sm font-bold text-gray-800">{value}</span>
    </div>
  );
}
