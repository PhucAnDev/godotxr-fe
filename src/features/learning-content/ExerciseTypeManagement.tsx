import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  Brain,
  Calendar,
  Check,
  Edit3,
  FolderHeart,
  Layers,
  MessageSquare,
  Mic,
  Plus,
  Power,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tags,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import ActionButton from '../../components/common/ActionButton';
import {
  useExerciseManagementApi,
  type ExerciseTypeResponse,
} from '../../hooks/useExerciseManagementApi';

interface ExerciseType {
  TypeId: string;
  TypeName: string;
  Description: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

const INITIAL_EXERCISE_TYPES: ExerciseType[] = [
  {
    TypeId: 'TYP-001',
    TypeName: 'Pronunciation Practice',
    Description:
      'Luyện tập phát âm chuẩn từng âm tiết, từ vựng và câu ngắn thông qua bộ nhận dạng giọng nói tự động (ASR).',
    IsActive: true,
    CreatedAt: '2026-05-10 10:15',
    UpdatedAt: '2026-05-12 11:30',
  },
  {
    TypeId: 'TYP-002',
    TypeName: 'Vocabulary Practice',
    Description:
      'Học hiểu từ vựng qua tương tác trực quan 3D, flashcards thông minh lật mở và các trò chơi ghép đồ vật.',
    IsActive: true,
    CreatedAt: '2026-05-11 09:20',
    UpdatedAt: '2026-05-11 09:20',
  },
  {
    TypeId: 'TYP-003',
    TypeName: 'Oral Motor Exercise',
    Description:
      'Chuỗi bài tập rèn luyện cơ hàm, khum môi, uốn lưỡi và điều phối hơi thở giúp tăng độ linh hoạt bộ phận tạo âm.',
    IsActive: true,
    CreatedAt: '2026-05-12 14:00',
    UpdatedAt: '2026-05-13 15:45',
  },
];

const getTypeIcon = (typeName: string) => {
  const norm = typeName.toLowerCase();
  if (norm.includes('pronunciation') || norm.includes('phát âm')) {
    return <Mic className="w-8 h-8 text-[#4EACAF]" />;
  }
  if (norm.includes('vocabulary') || norm.includes('từ vựng')) {
    return <Tags className="w-8 h-8 text-orange-400" strokeWidth={2.2} />;
  }
  if (norm.includes('motor') || norm.includes('cơ miệng')) {
    return <Brain className="w-8 h-8 text-[#FF8E8E]" />;
  }
  if (norm.includes('listening') || norm.includes('nghe')) {
    return <FolderHeart className="w-8 h-8 text-indigo-500" />;
  }
  return <MessageSquare className="w-8 h-8 text-sky-500" />;
};

const getCardGradient = (typeId: string) => {
  const colors = [
    'from-teal-500/10 via-emerald-500/5 to-transparent',
    'from-orange-400/10 via-yellow-500/5 to-transparent',
    'from-pink-500/10 via-rose-500/5 to-transparent',
    'from-indigo-500/10 via-purple-500/5 to-transparent',
    'from-sky-500/10 via-cyan-500/5 to-transparent',
  ];
  const charCodeSum = typeId
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charCodeSum % colors.length];
};

const mapExerciseType = (item: ExerciseTypeResponse): ExerciseType => ({
  TypeId: String(item.id),
  TypeName: item.typeName,
  Description: item.description ?? '',
  IsActive: item.isActive,
  CreatedAt: item.createdAt,
  UpdatedAt: item.updatedAt ?? item.createdAt,
});

export default function ExerciseTypeManagement() {
  const {
    getExerciseTypes,
    getExerciseTypeById,
    createExerciseType,
    updateExerciseType,
    deleteExerciseType,
  } = useExerciseManagementApi();

  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>(
    INITIAL_EXERCISE_TYPES
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    message: string;
    type: 'success' | 'warning';
  } | null>(null);

  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<ExerciseType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formTypeName, setFormTypeName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const triggerToast = useCallback(
    (message: string, type: 'success' | 'warning' = 'success') => {
      setAlertConfig({ message, type });
      window.setTimeout(() => setAlertConfig(null), 3500);
    },
    []
  );

  const loadExerciseTypes = useCallback(async () => {
    setIsLoading(true);

    const loaded: ExerciseType[] = [];
    let pageNumber = 1;
    let totalPages = 1;

    while (pageNumber <= totalPages) {
      const result = await getExerciseTypes(pageNumber, 100);

      if (!result.success || !result.data) {
        setIsLoading(false);
        triggerToast(
          result.errors.join(' ') ||
            result.message ||
            'Không thể tải loại bài tập từ API. Đang giữ dữ liệu mẫu hiện tại.',
          'warning'
        );
        return;
      }

      loaded.push(...result.data.items.map(mapExerciseType));
      totalPages = result.data.totalPages || 1;
      pageNumber += 1;
    }

    setExerciseTypes(loaded);
    setIsLoading(false);
  }, [getExerciseTypes, triggerToast]);

  useEffect(() => {
    void loadExerciseTypes();
  }, [loadExerciseTypes]);

  const totalTypes = exerciseTypes.length;
  const activeCount = exerciseTypes.filter((item) => item.IsActive).length;
  const inactiveCount = exerciseTypes.filter((item) => !item.IsActive).length;

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedType(null);
    setFormTypeName('');
    setFormDescription('');
    setFormIsActive(true);
    setIsOpenFormModal(true);
  };

  const handleOpenEdit = async (item: ExerciseType) => {
    setModalMode('edit');
    setSelectedType(item);
    setFormTypeName(item.TypeName);
    setFormDescription(item.Description);
    setFormIsActive(item.IsActive);
    setIsOpenFormModal(true);

    const result = await getExerciseTypeById(Number(item.TypeId));
    if (result.success && result.data) {
      const latest = mapExerciseType(result.data);
      setSelectedType(latest);
      setFormTypeName(latest.TypeName);
      setFormDescription(latest.Description);
      setFormIsActive(latest.IsActive);
    }
  };

  const handleToggleState = async (typeId: string) => {
    const currentItem = exerciseTypes.find((item) => item.TypeId === typeId);
    if (!currentItem) return;

    const nextState = !currentItem.IsActive;
    const result = await updateExerciseType(Number(typeId), {
      typeName: currentItem.TypeName,
      description: currentItem.Description,
      isActive: nextState,
    });

    if (result.success && result.data) {
      const mapped = mapExerciseType(result.data);
      setExerciseTypes((current) =>
        current.map((item) => (item.TypeId === typeId ? mapped : item))
      );
      triggerToast(
        `Đã chuyển trạng thái hoạt động sang ${
          nextState ? 'BẬT (Hoạt động)' : 'TẮT (Tạm ngưng)'
        }.`
      );
      return;
    }

    triggerToast(
      result.errors.join(' ') ||
        result.message ||
        'Không thể cập nhật trạng thái loại bài tập.',
      'warning'
    );
  };

  const handleDeleteClick = (type: ExerciseType) => {
    setTypeToDelete(type);
    setIsOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!typeToDelete) return;
    setIsDeleting(true);
    const result = await deleteExerciseType(Number(typeToDelete.TypeId));
    if (result.success) {
      setExerciseTypes((current) =>
        current.filter((item) => item.TypeId !== typeToDelete.TypeId)
      );
      triggerToast(`Đã xóa loại bài tập "${typeToDelete.TypeName}".`, 'success');
      setIsOpenDeleteModal(false);
      setTypeToDelete(null);
    } else {
      triggerToast(
        result.errors.join(' ') ||
          result.message ||
          'Không thể xóa loại bài tập.',
        'warning'
      );
    }
    setIsDeleting(false);
  };

  const handleSaveSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formTypeName.trim()) {
      triggerToast('Tên phân loại bài tập bắt buộc phải nhập!', 'warning');
      return;
    }

    if (!formDescription.trim()) {
      triggerToast('Vui lòng nhập mô tả cho phân loại này!', 'warning');
      return;
    }

    setIsSaving(true);

    if (modalMode === 'add') {
      const result = await createExerciseType({
        typeName: formTypeName.trim(),
        description: formDescription.trim(),
        isActive: formIsActive,
      });

      if (result.success && result.data) {
        setExerciseTypes((current) => [mapExerciseType(result.data!), ...current]);
        triggerToast(`Thêm phân loại bài tập "${formTypeName}" thành công!`);
        setIsOpenFormModal(false);
      } else {
        triggerToast(
          result.errors.join(' ') ||
            result.message ||
            'Không thể tạo loại bài tập.',
          'warning'
        );
      }
    } else if (selectedType) {
      const result = await updateExerciseType(Number(selectedType.TypeId), {
        typeName: formTypeName.trim(),
        description: formDescription.trim(),
        isActive: formIsActive,
      });

      if (result.success && result.data) {
        const mapped = mapExerciseType(result.data);
        setExerciseTypes((current) =>
          current.map((item) =>
            item.TypeId === selectedType.TypeId ? mapped : item
          )
        );
        triggerToast(
          `Đã cập nhật loại bài tập "${selectedType.TypeId}" thành công!`
        );
        setIsOpenFormModal(false);
      } else {
        triggerToast(
          result.errors.join(' ') ||
            result.message ||
            'Không thể cập nhật loại bài tập.',
          'warning'
        );
      }
    }

    setIsSaving(false);
  };

  const filteredTypes = exerciseTypes.filter((item) => {
    const searchString =
      `${item.TypeName} ${item.Description} ${item.TypeId}`.toLowerCase();
    const queryMatch = searchString.includes(searchQuery.toLowerCase());

    const statusMatch =
      filterActive === 'ALL' ||
      (filterActive === 'ACTIVE' && item.IsActive) ||
      (filterActive === 'INACTIVE' && !item.IsActive);

    return queryMatch && statusMatch;
  });

  return (
    <div
      className="relative space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700"
      id="exercise-type-root"
    >
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="pointer-events-auto fixed left-1/2 top-12 z-[300] w-[90%] max-w-lg -translate-x-1/2"
          >
            <div
              className={cn(
                'flex items-center gap-4 rounded-3xl border-2 border-white p-5 shadow-2xl backdrop-blur-md',
                alertConfig.type === 'success'
                  ? 'bg-[#4EACAF]/95 text-white'
                  : 'bg-[#FF8E8E]/95 text-white'
              )}
            >
              <div className="shrink-0 rounded-xl bg-white/20 p-2">
                {alertConfig.type === 'success' ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1 font-bold">
                <p className="text-sm italic leading-snug tracking-tight text-white">
                  {alertConfig.message}
                </p>
              </div>
              <button
                onClick={() => setAlertConfig(null)}
                className="shrink-0 rounded-full p-1 text-white transition-colors hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col justify-between gap-6 rounded-[40px] border border-white/60 bg-white/40 p-8 shadow-sm backdrop-blur-md lg:flex-row lg:items-center md:p-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4EACAF]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest leading-none text-[#4EACAF]">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Cơ sở phân cấp dữ liệu GodotXR
          </div>
          <h1 className="pb-1 text-4xl font-black italic leading-none tracking-tight text-gray-900 md:text-5xl">
            Quản Lý <span className="text-[#4EACAF]">Dạng Bài Tập</span>
          </h1>
          <p className="max-w-2xl text-sm font-bold leading-relaxed text-gray-500 md:text-base">
            Phân loại các hình thức luyện âm tương tác trong môi trường thực tế ảo (Nhận diện giọng nói, Thẻ tương tác 3D, Tập cơ môi miệng). Tạo cơ sở lựa chọn phương pháp can thiệp ngôn ngữ hiệu quả.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => void loadExerciseTypes()}
            className="flex shrink-0 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-600 transition-all hover:border-[#4EACAF]/30 hover:text-[#4EACAF]"
          >
            <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
            Tải lại
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-[#4EACAF] px-8 py-4 font-black italic tracking-tight text-white shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 hover:bg-[#4EACAF]/90 active:scale-95"
            id="add-type-btn"
          >
            <Plus className="w-5 h-5" />
            Thêm loại bài tập
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCardItem
          title="Tổng Loại Bài Tập"
          value={totalTypes}
          subtitle="Tất cả loại đang có"
          icon={<Layers className="w-7 h-7 text-[#4EACAF]" />}
          bgColor="bg-white"
          borderColor="border-[#4EACAF]/20"
        />
        <StatCardItem
          title="Đang Hoạt Động"
          value={activeCount}
          subtitle="Được phép sử dụng"
          icon={<Sparkles className="w-7 h-7 text-emerald-500" />}
          bgColor="bg-white"
          borderColor="border-emerald-200"
        />
        <StatCardItem
          title="Đã Tắt / Tạm Ngưng"
          value={inactiveCount}
          subtitle="Đang khóa hoặc bảo trì"
          icon={<Power className="w-7 h-7 text-gray-400" />}
          bgColor="bg-white"
          borderColor="border-gray-200"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-[36px] border border-gray-100 bg-white p-6 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phân loại theo tên hoặc nội dung hướng dẫn..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border-2 border-transparent bg-[#FDFCF5] py-4 pl-14 pr-6 text-sm font-bold text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#4EACAF] focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 rounded-full bg-gray-200/60 p-1 -translate-y-1/2 hover:bg-gray-200"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="relative w-full md:w-64">
          <select
            value={filterActive}
            onChange={(event) => setFilterActive(event.target.value)}
            className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-transparent bg-[#FDFCF5] py-4 pl-5 pr-10 text-xs font-black italic uppercase tracking-wide text-gray-700 outline-none transition-all hover:border-[#4EACAF]/20 focus:border-[#4EACAF] focus:bg-white"
          >
            <option value="ALL">Mọi trạng thái</option>
            <option value="ACTIVE">Kích hoạt (Hoạt động)</option>
            <option value="INACTIVE">Khóa / Bảo trì</option>
          </select>
          <SlidersHorizontal className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {isLoading && filteredTypes.length === 0 ? (
        <div className="space-y-4 rounded-[40px] border border-gray-100 bg-white py-24 text-center shadow-sm">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-[#4EACAF]" />
          <p className="text-xl font-black text-gray-700">
            Đang tải loại bài tập từ API...
          </p>
        </div>
      ) : filteredTypes.length === 0 ? (
        <div className="space-y-4 rounded-[40px] border border-gray-100 bg-white py-24 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-dashed border-gray-100 bg-gray-50 italic">
            <Layers className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-xl font-black text-gray-700">
            Không khớp loại bài tập nào trong cơ sở học!
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterActive('ALL');
            }}
            className="rounded-xl bg-[#4EACAF]/10 px-6 py-2.5 text-xs font-black uppercase text-[#4EACAF] transition-all hover:bg-[#4EACAF]/20"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" id="types-card-list">
          {filteredTypes.map((type) => (
            <div
              key={type.TypeId}
              className={cn(
                'relative flex flex-col justify-between overflow-hidden rounded-[40px] border border-slate-100/60 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                !type.IsActive && 'bg-slate-50/20 opacity-75'
              )}
            >
              <div
                className={cn(
                  'pointer-events-none absolute right-0 top-0 -z-0 h-32 w-32 rounded-bl-full bg-gradient-to-br opacity-80',
                  getCardGradient(type.TypeId)
                )}
              />

              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center rounded-[20px] border border-gray-100 bg-white p-3 shadow-md">
                    {getTypeIcon(type.TypeName)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-gray-50 px-2.5 py-1 font-mono text-[10px] font-black tracking-widest text-gray-400">
                      {type.TypeId}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest leading-none',
                        type.IsActive
                          ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                          : 'border border-rose-100/40 bg-rose-50 text-[#FF8E8E]'
                      )}
                    >
                      {type.IsActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="line-clamp-1 text-xl font-black italic leading-snug text-gray-900 md:text-2xl">
                    {type.TypeName}
                  </h3>
                  <p className="line-clamp-3 text-sm font-bold leading-relaxed text-gray-500">
                    {type.Description}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 flex items-center justify-between border-t border-gray-50 pt-5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                  <Calendar className="h-3.5 w-3.5 text-gray-300" />
                  <span>{type.CreatedAt}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => void handleToggleState(type.TypeId)}
                    className="rounded-2xl p-2.5 text-[#4EACAF] transition-colors hover:bg-teal-50"
                    title={type.IsActive ? 'Tắt kích hoạt' : 'Bật kích hoạt'}
                  >
                    {type.IsActive ? (
                      <ToggleRight className="h-7 w-7 text-[#4EACAF]" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-gray-300" />
                    )}
                  </button>

                  <ActionButton
                    type="edit"
                    onClick={() => void handleOpenEdit(type)}
                    title="Chỉnh sửa loại"
                  />

                  <ActionButton
                    type="delete"
                    onClick={() => handleDeleteClick(type)}
                    title="Xóa loại"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isOpenFormModal && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex h-full w-full items-center justify-center overflow-y-auto bg-gray-900/10 p-4 backdrop-blur-xl animate-in fade-in duration-300 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="app-modal-panel app-modal-panel--compact relative z-30 w-full max-w-xl overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-2xl"
            >
              <div
                className={cn(
                  'flex items-center justify-between border-b px-8 py-6',
                  modalMode === 'add'
                    ? 'border-[#4EACAF]/10 bg-[#4EACAF]/10 text-gray-900'
                    : 'border-sky-100 bg-sky-50 text-gray-900'
                )}
              >
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-black italic tracking-tight">
                    {modalMode === 'add' ? (
                      <Plus className="h-6 w-6 text-[#4EACAF]" />
                    ) : (
                      <Edit3 className="h-6 w-6 text-sky-500" />
                    )}
                    {modalMode === 'add'
                      ? 'Thêm Loại Bài Tập'
                      : `Chỉnh Sửa Loại: ${selectedType?.TypeId}`}
                  </h2>
                  <p className="mt-1 text-xs font-normal uppercase tracking-wider text-gray-400">
                    {modalMode === 'add'
                      ? 'Tạo mới dữ liệu cho nhóm bài tập'
                      : 'Cập nhật thông số loại bài tập hiện có'}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpenFormModal(false)}
                  className="rounded-full p-2.5 transition-colors hover:bg-white/70"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSaveSubmit} className="app-modal-body space-y-6 p-8" id="type-info-form">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="ml-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                      Tên loại bài tập <span className="text-[#FF8E8E]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Pronunciation Practice..."
                      value={formTypeName}
                      onChange={(event) => setFormTypeName(event.target.value)}
                      className="w-full rounded-2xl border-2 border-transparent bg-[#FDFCF5] px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                      Giải thích mô tả cốt lõi <span className="text-[#FF8E8E]">*</span>
                    </label>
                    <textarea
                      placeholder="Mô tả cụ thể kịch bản hoạt động của loại học phần này..."
                      value={formDescription}
                      onChange={(event) =>
                        setFormDescription(event.target.value)
                      }
                      rows={4}
                      className="w-full resize-y rounded-2xl border-2 border-transparent bg-[#FDFCF5] p-5 text-sm font-bold leading-relaxed text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-[#FDFCF5] p-5">
                    <div>
                      <p className="mb-1.5 text-sm font-black leading-none text-gray-800">
                        Kích hoạt phân loại bài tập
                      </p>
                      <p className="text-xs font-bold uppercase leading-none text-gray-400">
                        Cho phép giáo viên áp dụng rộng rãi
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormIsActive(!formIsActive)}
                      className="px-2.5 text-xs transition-all"
                    >
                      {formIsActive ? (
                        <ToggleRight className="h-10 w-10 text-[#4EACAF]" />
                      ) : (
                        <ToggleLeft className="h-10 w-10 text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-50 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpenFormModal(false)}
                    className="rounded-2xl bg-gray-100 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-gray-500 transition-all hover:bg-gray-200"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-2xl bg-[#4EACAF] px-8 py-3.5 text-xs font-black italic uppercase tracking-widest text-white shadow-lg shadow-[#4EACAF]/10 transition-all hover:bg-[#4EACAF]/90"
                    id="save-type-submit"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isOpenDeleteModal && typeToDelete && (
          <ConfirmDeleteModal
            title="Xóa loại bài tập"
            subtitle="HÀNH ĐỘNG NÀY SẼ XÓA VĨNH VIỄN LOẠI BÀI TẬP KHỎI HỆ THỐNG"
            onClose={() => {
              setIsOpenDeleteModal(false);
              setTypeToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
            accent="rose"
          >
            <p className="font-semibold">
              Bạn sắp xóa loại bài tập <strong>{typeToDelete.TypeName}</strong> (ID: {typeToDelete.TypeId}).
            </p>
            <p className="mt-2 text-xs">
              Hành động này không thể hoàn tác. Vui lòng xác nhận nếu đây là loại bài tập bạn thực sự muốn xóa.
            </p>
          </ConfirmDeleteModal>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StatCard {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

function StatCardItem({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  borderColor,
}: StatCard) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-[32px] border p-6 shadow-sm',
        bgColor,
        borderColor
      )}
    >
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
          {title}
        </p>
        <p className="text-3xl font-black leading-none tracking-tight text-gray-900">
          {value}
        </p>
        <p className="max-w-[170px] truncate text-[10px] font-bold italic text-neutral-400">
          {subtitle}
        </p>
      </div>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-white/70 shadow-sm">
        {icon}
      </div>
    </div>
  );
}
