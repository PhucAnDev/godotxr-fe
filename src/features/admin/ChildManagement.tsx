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
  Search,
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

const API_PAGE_SIZE = 100;

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
    CreatedAt: profile.createdAt,
    UpdatedAt: profile.updatedAt ?? profile.createdAt,
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
      return 'Cậu bé (Nam)';
    case 'Female':
      return 'Cô bé (Nữ)';
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
    note.includes('cần') ||
    note.includes('theo dõi') ||
    note.includes('lưu ý')
  );
}

export default function ChildManagement() {
  const { getChildProfiles, getChildProfileById } = useChildManagementApi();

  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAge, setFilterAge] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalType, setModalType] = useState<'detail' | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
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

    setChildrenList(loadedChildren);
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

  const handleUnsupportedAction = useCallback(
    (actionLabel: string) => {
      triggerNotification(
        `${actionLabel} chưa khả dụng vì backend hiện mới hỗ trợ xem danh sách và chi tiết hồ sơ trẻ.`,
        'warning'
      );
    },
    [triggerNotification]
  );

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
            Hồ sơ học tập nhi đồng
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Quản Lý <span className="text-[#4EACAF]">Hồ Sơ Trẻ Em</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Quản lý thông tin chi tiết và tiến trình học tập của trẻ trên hệ thống GodotXR. Hỗ trợ theo dõi kết quả trị liệu và tối ưu hóa sự phối hợp giáo dục giữa nhà trường và gia đình.
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
            onClick={() => handleUnsupportedAction('Thêm hồ sơ trẻ')}
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
          subtitle="Hồ sơ nhi đồng đồng bộ từ API"
          icon={<Baby className="h-5 w-5 text-[#4EACAF]" />}
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Trẻ đang học"
          value={activeChildren}
          subtitle="Hồ sơ còn trạng thái Active"
          icon={<Activity className="h-5 w-5 text-emerald-600" />}
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Bé cần lưu ý thêm"
          value={needSupportChildren}
          subtitle="Suy luận từ note và độ tuổi hiện có"
          icon={<Brain className="h-5 w-5 text-rose-600" />}
          bgColor="bg-rose-50/70"
          borderColor="border-slate-100"
        />
        <StatItem
          title="Độ tuổi trung bình"
          value={averageAge}
          subtitle="Tính từ dữ liệu child profile"
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
              API hiện chưa trả về tên phụ huynh, số điện thoại, lịch sử tiến độ
              hoặc các endpoint tạo/cập nhật hồ sơ. Page đang hiển thị theo đúng
              dữ liệu BE có sẵn để tránh dùng mock state.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên bé, mã hồ sơ hoặc mã tài khoản liên kết..."
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
          <div className="relative">
            <select
              value={filterAge}
              onChange={(event) => setFilterAge(event.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-xs font-bold text-gray-700 outline-none hover:border-[#4EACAF]/45"
            >
              <option value="ALL">Mọi Độ Tuổi</option>
              <option value="UNDER_5">Dưới 5 tuổi</option>
              <option value="S_5_7">Từ 5 - 7 tuổi</option>
              <option value="OVER_7">Trên 7 tuổi</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filterGender}
              onChange={(event) => setFilterGender(event.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-xs font-bold text-gray-700 outline-none hover:border-[#4EACAF]/45"
            >
              <option value="ALL">Mọi giới tính</option>
              <option value="Male">Cậu bé (Nam)</option>
              <option value="Female">Cô bé (Nữ)</option>
              <option value="Other">Khác</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filterLevel}
              onChange={(event) => setFilterLevel(event.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-xs font-bold text-gray-700 outline-none hover:border-[#4EACAF]/45"
            >
              <option value="ALL">Mọi cấp độ học</option>
              <option value="Beginner">Beginner (Nhập môn)</option>
              <option value="Intermediate">Intermediate (Trung cấp)</option>
              <option value="Advanced">Advanced (Nâng cao)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-xs font-bold text-gray-700 outline-none hover:border-[#4EACAF]/45"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="Active">Đang học</option>
              <option value="Inactive">Tạm ngưng</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold leading-none text-slate-800">
              Danh sách trẻ can thiệp âm
            </h3>
            <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Hiển thị {filteredChildren.length} hồ sơ phù hợp bộ lọc
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
                Đang tải hồ sơ trẻ từ API
              </p>
              <p className="text-sm text-slate-500">
                Hệ thống sẽ tự gom toàn bộ các trang dữ liệu từ backend.
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
                : 'API chưa trả về hồ sơ trẻ nào.'}
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
                  <tr className="border-b border-gray-100 bg-[#FDFCF5]/50 text-xs font-bold uppercase tracking-widest text-[#555]">
                    <th className="px-10 py-5">Mã số</th>
                    <th className="px-6 py-5">Hồ sơ trẻ</th>
                    <th className="px-6 py-5">Độ tuổi</th>
                    <th className="px-6 py-5">Giới tính</th>
                    <th className="px-6 py-5">Tài khoản liên kết</th>
                    <th className="px-6 py-5">Cấp độ</th>
                    <th className="px-6 py-5">Trạng thái</th>
                    <th className="px-10 py-5 text-right">Tùy chọn quản trị</th>
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
                              Tạo ngày {formatDateTime(child.CreatedAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-extrabold text-gray-900">
                          {child.Age} tuổi
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-600">
                        {getGenderLabel(child.Gender)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-gray-800">
                            Tài khoản #{child.ParentUserId}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            userId từ child-profile
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
                            title="Thông tin chi tiết"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>

                          <button
                            onClick={() =>
                              handleUnsupportedAction('Lịch sử học tập')
                            }
                            className="rounded-xl p-2 text-orange-500 transition-colors hover:bg-orange-50 hover:scale-105"
                            title="Backend chưa có API tiến độ"
                          >
                            <TrendingUp className="h-4.5 w-4.5" />
                          </button>

                          <button
                            onClick={() =>
                              handleUnsupportedAction('Chỉnh sửa hồ sơ trẻ')
                            }
                            className="rounded-xl p-2 text-sky-500 transition-colors hover:bg-sky-50 hover:scale-105"
                            title="Backend chưa có API cập nhật"
                          >
                            <Edit3 className="h-4.5 w-4.5" />
                          </button>

                          <button
                            onClick={() =>
                              handleUnsupportedAction('Cập nhật trạng thái')
                            }
                            className={cn(
                              'rounded-xl p-2 transition-colors hover:scale-105',
                              child.Status === 'Active'
                                ? 'text-rose-500 hover:bg-rose-50'
                                : 'text-emerald-500 hover:bg-emerald-50'
                            )}
                            title="Backend chưa có API đổi trạng thái"
                          >
                            {child.Status === 'Active' ? (
                              <Lock className="h-4.5 w-4.5" />
                            ) : (
                              <Unlock className="h-4.5 w-4.5" />
                            )}
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
                itemLabel="hồ sơ trẻ"
              />
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {modalType === 'detail' && selectedChild && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex h-full w-full items-center justify-center overflow-y-auto bg-gray-900/10 p-4 backdrop-blur-xl animate-in fade-in duration-300 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="app-modal-panel relative z-30 w-full max-w-2xl overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-purple-100 bg-purple-50 px-8 py-6 text-gray-900">
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-black italic tracking-tight">
                    <Info className="h-6 w-6 text-purple-600" />
                    Chi tiết hồ sơ học viên
                  </h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Đồng bộ từ `GET /api/child-profile/{'{id}'}`
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="rounded-full p-2.5 transition-colors hover:bg-white/70"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="app-modal-body space-y-8 p-8 md:p-10">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#4EACAF]/15 bg-[#4EACAF]/5 px-4 py-3 text-sm text-slate-600">
                  <span>
                    Dữ liệu đang bám theo contract hiện có của backend, không
                    dùng mock detail.
                  </span>
                  {isDetailLoading && (
                    <span className="inline-flex items-center gap-2 font-bold text-[#4EACAF]">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Đang làm mới chi tiết...
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
                        Trình độ: {selectedChild.LearningLevel}
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
                          : 'Tạm dừng bài tập'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                  <DetailRow
                    label="Tên đầy đủ trẻ (fullName)"
                    value={selectedChild.FullName}
                  />
                  <DetailRow
                    label="Tài khoản liên kết (userId)"
                    value={selectedChild.ParentUserId}
                  />
                  <DetailRow
                    label="Độ tuổi"
                    value={`${selectedChild.Age} tuổi`}
                  />
                  <DetailRow
                    label="Giới tính"
                    value={getGenderLabel(selectedChild.Gender)}
                  />
                  <DetailRow
                    label="Thời khắc khởi tạo hồ sơ"
                    value={formatDateTime(selectedChild.CreatedAt)}
                  />
                  <DetailRow
                    label="Sửa đổi sau cùng"
                    value={formatDateTime(selectedChild.UpdatedAt)}
                  />
                  <div className="col-span-1 space-y-1.5 rounded-2xl border border-[#F2ECD8]/40 bg-[#FDFCF5]/60 p-4 md:col-span-2">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Chẩn đoán - Lưu ý lâm sàng (note)
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
                      API chi tiết hiện chưa trả về tên phụ huynh, số điện thoại
                      và lịch sử học tập. Khi BE mở rộng contract, phần modal này
                      có thể nối tiếp mà không cần quay lại mock data.
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-black leading-none text-gray-900">
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
          </p>
          <p className="line-clamp-1 pt-1 text-[11px] font-medium text-gray-500">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 rounded-2xl border border-[#F2ECD8]/40 bg-[#FDFCF5]/60 p-4">
      <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span className="block break-all text-sm font-bold text-gray-800">
        {value}
      </span>
    </div>
  );
}
