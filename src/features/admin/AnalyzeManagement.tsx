import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Award,
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
  Calendar,
  ArrowDown,
  ArrowUp,
  ArrowUpDown
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import { cn, resolveAvatarUrl } from '../../lib/utils';
import CustomSelect from '../../components/common/CustomSelect';
import { useAnalyzeApi, type AnalyzeResponse } from '../../hooks/useAnalyzeApi';
import { useChildManagementApi } from '../../hooks/useChildManagementApi';
import type { AnalyzePayload } from '../../services/analyzeService';
import ActionButton from '../../components/common/ActionButton';

interface AnalyzeItem {
  Id: number;
  ChildId: number;
  ChildFullName: string;
  ChildAvatar?: string | null;
  SpeechLevel: 'Mild' | 'Moderate' | 'Severe' | string;
  Diagnosis: string;
  Difficulties: string;
  Strengths: string;
  Weaknesses: string;
  CommunicationAbility: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  PronunciationAbility: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  LanguageComprehension: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  LanguageExpression: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  AttentionLevel: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  SocialInteraction: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  InterventionGoals: string;
  Recommendation: string;
  Notes: string;
  AssessmentDate: string;
  NextAssessmentDate: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface AnalyzeFormState {
  childId: string;
  speechLevel: 'Mild' | 'Moderate' | 'Severe' | string;
  diagnosis: string;
  difficulties: string;
  strengths: string;
  weaknesses: string;
  communicationAbility: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  pronunciationAbility: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  languageComprehension: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  languageExpression: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  attentionLevel: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  socialInteraction: 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent' | string;
  interventionGoals: string;
  recommendation: string;
  notes: string;
  assessmentDate: string;
  nextAssessmentDate: string;
}

const API_PAGE_SIZE = 100;

export const SpeechLevelMap: Record<string, { label: string; color: string; bg: string }> = {
  Mild: { label: 'Nhẹ', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', bg: 'bg-emerald-500' },
  Moderate: { label: 'Trung bình', color: 'bg-amber-50 text-amber-700 border-amber-100', bg: 'bg-amber-500' },
  Severe: { label: 'Nặng', color: 'bg-rose-50 text-rose-700 border-rose-100', bg: 'bg-rose-500' },
};

export const AssessmentLevelMap: Record<string, { label: string; color: string; bg: string }> = {
  VeryPoor: { label: 'Rất kém', color: 'bg-rose-50 border-rose-100 text-rose-600', bg: 'bg-rose-550' },
  Poor: { label: 'Kém', color: 'bg-orange-50 border-orange-100 text-orange-600', bg: 'bg-orange-500' },
  Average: { label: 'Trung bình', color: 'bg-amber-50 border-amber-100 text-amber-600', bg: 'bg-amber-500' },
  Good: { label: 'Tốt', color: 'bg-emerald-50 border-emerald-100 text-emerald-600', bg: 'bg-emerald-500' },
  Excellent: { label: 'Xuất sắc', color: 'bg-purple-50 border-purple-100 text-purple-600', bg: 'bg-purple-500' },
};

const EMPTY_FORM: AnalyzeFormState = {
  childId: '',
  speechLevel: 'Mild',
  diagnosis: '',
  difficulties: '',
  strengths: '',
  weaknesses: '',
  communicationAbility: 'Average',
  pronunciationAbility: 'Average',
  languageComprehension: 'Average',
  languageExpression: 'Average',
  attentionLevel: 'Average',
  socialInteraction: 'Average',
  interventionGoals: '',
  recommendation: '',
  notes: '',
  assessmentDate: new Date().toISOString().substring(0, 10),
  nextAssessmentDate: '',
};

function mapAnalyzeResponse(item: AnalyzeResponse, childName?: string): AnalyzeItem {
  return {
    Id: item.id,
    ChildId: item.childId,
    ChildFullName: childName || `Trẻ em #${item.childId}`,
    ChildAvatar: null,
    SpeechLevel: item.speechLevel || 'Mild',
    Diagnosis: item.diagnosis || '',
    Difficulties: item.difficulties || '',
    Strengths: item.strengths || '',
    Weaknesses: item.weaknesses || '',
    CommunicationAbility: item.communicationAbility || 'Average',
    PronunciationAbility: item.pronunciationAbility || 'Average',
    LanguageComprehension: item.languageComprehension || 'Average',
    LanguageExpression: item.languageExpression || 'Average',
    AttentionLevel: item.attentionLevel || 'Average',
    SocialInteraction: item.socialInteraction || 'Average',
    InterventionGoals: item.interventionGoals || '',
    Recommendation: item.recommendation || '',
    Notes: item.notes || '',
    AssessmentDate: item.assessmentDate ? item.assessmentDate.substring(0, 10) : '',
    NextAssessmentDate: item.nextAssessmentDate ? item.nextAssessmentDate.substring(0, 10) : '',
    CreatedAt: item.createdAt,
    UpdatedAt: item.updatedAt || item.createdAt,
  };
}

function mapAnalyzeToForm(item: AnalyzeItem): AnalyzeFormState {
  return {
    childId: String(item.ChildId),
    speechLevel: item.SpeechLevel,
    diagnosis: item.Diagnosis,
    difficulties: item.Difficulties,
    strengths: item.Strengths,
    weaknesses: item.Weaknesses,
    communicationAbility: item.CommunicationAbility,
    pronunciationAbility: item.PronunciationAbility,
    languageComprehension: item.LanguageComprehension,
    languageExpression: item.LanguageExpression,
    attentionLevel: item.AttentionLevel,
    socialInteraction: item.SocialInteraction,
    interventionGoals: item.InterventionGoals,
    recommendation: item.Recommendation,
    notes: item.Notes,
    assessmentDate: item.AssessmentDate,
    nextAssessmentDate: item.NextAssessmentDate,
  };
}

function mapFormToPayload(form: AnalyzeFormState): AnalyzePayload {
  return {
    childId: Number(form.childId),
    speechLevel: form.speechLevel,
    diagnosis: form.diagnosis.trim() || null,
    difficulties: form.difficulties.trim() || null,
    strengths: form.strengths.trim() || null,
    weaknesses: form.weaknesses.trim() || null,
    communicationAbility: form.communicationAbility,
    pronunciationAbility: form.pronunciationAbility,
    languageComprehension: form.languageComprehension,
    languageExpression: form.languageExpression,
    attentionLevel: form.attentionLevel,
    socialInteraction: form.socialInteraction,
    interventionGoals: form.interventionGoals.trim() || null,
    recommendation: form.recommendation.trim() || null,
    notes: form.notes.trim() || null,
    assessmentDate: form.assessmentDate ? new Date(form.assessmentDate).toISOString() : new Date().toISOString(),
    nextAssessmentDate: form.nextAssessmentDate ? new Date(form.nextAssessmentDate).toISOString() : null,
  };
}

function formatDateTime(value: string) {
  if (!value) return 'Chưa xác định';
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

function formatDateOnly(value: string) {
  if (!value) return 'Chưa xác định';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default function AnalyzeManagement() {
  const {
    getAnalyzes,
    getAnalyzeById,
    createAnalyze,
    updateAnalyze,
    deleteAnalyze,
  } = useAnalyzeApi();

  const { getChildProfiles } = useChildManagementApi();

  const [analyzeList, setAnalyzeList] = useState<AnalyzeItem[]>([]);
  const [childrenOptions, setChildrenOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgress, setFilterProgress] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof AnalyzeItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (column: keyof AnalyzeItem) => {
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

  const [modalType, setModalType] = useState<'detail' | 'form' | 'delete' | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedAnalyze, setSelectedAnalyze] = useState<AnalyzeItem | null>(null);
  const [formState, setFormState] = useState<AnalyzeFormState>(EMPTY_FORM);
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
    const result = await getChildProfiles(1, 1000);
    if (result.success && result.data) {
      const options = result.data.items.map((child) => ({
        value: String(child.id),
        label: `${child.fullName} (ID: ${child.id})`,
      }));
      setChildrenOptions(options.sort((a, b) => a.label.localeCompare(b.label)));
      return result.data.items;
    }
    return [];
  }, [getChildProfiles]);

  const fetchAnalyzes = useCallback(async (childrenList?: any[]) => {
    setIsLoading(true);
    const loadedList: AnalyzeItem[] = [];
    let pageNumber = 1;
    let totalPages = 1;

    while (pageNumber <= totalPages) {
      const result = await getAnalyzes(pageNumber, API_PAGE_SIZE);

      if (!result.success || !result.data) {
        setIsLoading(false);
        triggerNotification(
          result.errors.join(' ') || result.message || 'Không thể tải danh sách đánh giá trẻ.',
          'warning'
        );
        return;
      }

      loadedList.push(...result.data.items.map(item => mapAnalyzeResponse(item)));
      totalPages = result.data.totalPages || 1;
      pageNumber += 1;
    }

    let list = childrenList;
    if (!list) {
      const childResult = await getChildProfiles(1, 1000);
      if (childResult.success && childResult.data) {
        list = childResult.data.items;
      }
    }
    const childMap = new Map<number, string>((list || []).map((c: any) => [c.id, c.fullName]));
    const avatarMap = new Map<number, string | null>((list || []).map((c: any) => [c.id, c.avatar || null]));
    const mapped = loadedList.map(item => ({
      ...item,
      ChildFullName: childMap.get(item.ChildId) || `Trẻ em #${item.ChildId}`,
      ChildAvatar: avatarMap.get(item.ChildId) || null
    }));

    setAnalyzeList(mapped);
    setIsLoading(false);
  }, [getAnalyzes, getChildProfiles, triggerNotification]);

  useEffect(() => {
    const init = async () => {
      const list = await fetchChildren();
      await fetchAnalyzes(list);
    };
    void init();
  }, [fetchAnalyzes, fetchChildren]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterProgress]);

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedAnalyze(null);
    setIsDetailLoading(false);
    setIsSaving(false);
    setIsDeleting(false);
    setFormError('');
    setFormState(EMPTY_FORM);
  };

  const handleOpenDetail = useCallback(
    async (item: AnalyzeItem) => {
      setSelectedAnalyze(item);
      setModalType('detail');
      setIsDetailLoading(true);

      const childName = childrenOptions.find(opt => opt.value === String(item.ChildId))?.label.split(' (ID:')[0] || item.ChildFullName;
      const result = await getAnalyzeById(item.Id);
      if (result.success && result.data) {
        setSelectedAnalyze(mapAnalyzeResponse(result.data, childName));
      } else {
        triggerNotification(
          result.errors.join(' ') || result.message || 'Không thể tải chi tiết bản đánh giá.',
          'warning'
        );
      }
      setIsDetailLoading(false);
    },
    [getAnalyzeById, childrenOptions, triggerNotification]
  );

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedAnalyze(null);
    setFormState({
      ...EMPTY_FORM,
      childId: childrenOptions.length > 0 ? childrenOptions[0].value : '',
    });
    setFormError('');
    setModalType('form');
  };

  const openEditModal = useCallback(
    async (item: AnalyzeItem) => {
      setFormMode('edit');
      setSelectedAnalyze(item);
      setFormState(mapAnalyzeToForm(item));
      setFormError('');
      setModalType('form');

      const childName = childrenOptions.find(opt => opt.value === String(item.ChildId))?.label.split(' (ID:')[0] || item.ChildFullName;
      const result = await getAnalyzeById(item.Id);
      if (result.success && result.data) {
        const nextItem = mapAnalyzeResponse(result.data, childName);
        setSelectedAnalyze(nextItem);
        setFormState(mapAnalyzeToForm(nextItem));
      }
    },
    [getAnalyzeById, childrenOptions]
  );

  const openDeleteModal = (item: AnalyzeItem) => {
    setSelectedAnalyze(item);
    setModalType('delete');
  };

  const handleFormChange = <K extends keyof AnalyzeFormState>(
    key: K,
    value: AnalyzeFormState[K]
  ) => {
    setFormState((current) => ({ ...current, [key]: value }));
    setFormError('');
  };

  const validateForm = () => {
    if (!formState.childId) return 'Vui lòng chọn trẻ em cần đánh giá.';
    if (!formState.assessmentDate) {
      return 'Vui lòng chọn ngày đánh giá.';
    }
    return '';
  };

  const handleSubmitForm = async () => {
    const valError = validateForm();
    if (valError) {
      setFormError(valError);
      return;
    }

    if (formMode === 'edit' && (!selectedAnalyze || !selectedAnalyze.Id)) {
      setFormError('LỖI: Không tìm thấy ID của bản ghi đánh giá. Vui lòng cập nhật và khởi động lại Backend.');
      return;
    }

    setFormError('');
    setIsSaving(true);
    const payload = mapFormToPayload(formState);

    const result =
      formMode === 'create'
        ? await createAnalyze(payload)
        : await updateAnalyze(Number(selectedAnalyze?.Id), payload);

    if (!result.success || !result.data) {
      setIsSaving(false);
      setFormError(result.errors.join(' ') || result.message);
      return;
    }

    const childrenList = await fetchChildren();
    await fetchAnalyzes(childrenList);
    setIsSaving(false);
    handleCloseModal();
    triggerNotification(
      formMode === 'create' ? 'Đã tạo bản đánh giá mới thành công.' : 'Đã cập nhật bản đánh giá thành công.',
      'success'
    );
  };

  const handleConfirmDelete = async () => {
    if (!selectedAnalyze || !selectedAnalyze.Id) {
      triggerNotification('LỖI: Không tìm thấy ID của bản ghi đánh giá. Không thể xóa.', 'warning');
      return;
    }

    setIsDeleting(true);
    const result = await deleteAnalyze(selectedAnalyze.Id);

    if (!result.success) {
      setIsDeleting(false);
      triggerNotification(
        result.errors.join(' ') || result.message || 'Không thể xóa bản đánh giá.',
        'warning'
      );
      return;
    }

    const childrenList = await fetchChildren();
    await fetchAnalyzes(childrenList);
    setIsDeleting(false);
    handleCloseModal();
    triggerNotification(`Đã xóa bản đánh giá học tập thành công.`, 'success');
  };

  // Compute Stats
  const totalEvaluations = analyzeList.length;
  const severeDelayCount = analyzeList.filter(
    (item) => item.SpeechLevel === 'Severe'
  ).length;
  const excellentCount = analyzeList.filter(
    (item) => 
      item.CommunicationAbility === 'Excellent' || 
      item.PronunciationAbility === 'Excellent' ||
      item.SocialInteraction === 'Excellent'
  ).length;

  const filteredList = useMemo(() => {
    const filtered = analyzeList.filter((item) => {
      const matchesSearch = item.ChildFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgress =
        filterProgress === 'ALL'
          ? true
          : item.SpeechLevel.toLowerCase() === filterProgress.toLowerCase();

      return matchesSearch && matchesProgress;
    });

    if (!sortColumn || !sortDirection) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (sortColumn === 'SpeechLevel') {
        const order = { Mild: 1, Moderate: 2, Severe: 3 };
        const orderA = order[valA as 'Mild' | 'Moderate' | 'Severe'] || 0;
        const orderB = order[valB as 'Mild' | 'Moderate' | 'Severe'] || 0;
        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      }

      if (sortColumn === 'PronunciationAbility') {
        const order = { VeryPoor: 1, Poor: 2, Average: 3, Good: 4, Excellent: 5 };
        const orderA = order[valA as 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent'] || 0;
        const orderB = order[valB as 'VeryPoor' | 'Poor' | 'Average' | 'Good' | 'Excellent'] || 0;
        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      }

      if (sortColumn === 'AssessmentDate' || sortColumn === 'NextAssessmentDate') {
        const dateA = new Date(valA as string).getTime();
        const dateB = new Date(valB as string).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB, 'vi-VN', { numeric: true }) : valB.localeCompare(valA, 'vi-VN', { numeric: true });
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [analyzeList, searchQuery, filterProgress, sortColumn, sortDirection]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  return (
    <div className="space-y-8 py-2">
      {/* Alert toast */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={cn(
              'fixed top-6 left-1/2 z-[300] -translate-x-1/2 flex items-center gap-3 rounded-2xl px-6 py-4 shadow-xl font-bold text-sm border',
              alertConfig.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-amber-50 border-amber-100 text-amber-700'
            )}
          >
            <Info className="h-5 w-5" />
            <span>{alertConfig.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black italic tracking-tight text-slate-900 flex items-center gap-3">
            <Brain className="h-10 w-10 text-[#4EACAF]" />
            Quản lý Đánh giá trẻ
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Xem nhanh, cập nhật chẩn đoán học tập và đánh giá tiến trình phát triển ngôn ngữ định kỳ của học sinh
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Tạo bản đánh giá mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatItem
          title="Tổng số bản đánh giá"
          value={totalEvaluations}
          subtitle="Ghi nhận trên hệ thống"
          icon={<Brain className="h-6 w-6 text-white" />}
          bgColor="bg-purple-500"
          borderColor="border-purple-100 hover:border-purple-200"
        />
        <StatItem
          title="Trẻ chậm nói mức độ nặng"
          value={severeDelayCount}
          subtitle="Cần can thiệp tích cực"
          icon={<Clock className="h-6 w-6 text-white" />}
          bgColor="bg-rose-500"
          borderColor="border-rose-100 hover:border-rose-200"
        />
        <StatItem
          title="Học viên xuất sắc"
          value={excellentCount}
          subtitle="Sở hữu ít nhất 1 kỹ năng xuất sắc"
          icon={<Award className="h-6 w-6 text-white" />}
          bgColor="bg-emerald-500"
          borderColor="border-emerald-100 hover:border-emerald-200"
        />
      </div>

      {/* Filter and Table Container */}
      <div className="rounded-[36px] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo họ tên bé hoặc chẩn đoán..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-11 text-sm font-normal text-slate-600 outline-none transition-colors placeholder:text-slate-400 focus:border-[#4EACAF] focus:bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-56">
              <CustomSelect
                value={filterProgress}
                onChange={setFilterProgress}
                options={[
                  { value: 'ALL', label: 'TẤT CẢ MỨC ĐỘ CHẬM NÓI' },
                  { value: 'Mild', label: 'CHẬM NÓI NHẸ' },
                  { value: 'Moderate', label: 'CHẬM NÓI TRUNG BÌNH' },
                  { value: 'Severe', label: 'CHẬM NÓI NẶNG' },
                ]}
                variant="filter"
              />
            </div>

            {isLoading && (
              <RefreshCw className="h-5 w-5 animate-spin text-[#4EACAF]" />
            )}
          </div>
        </div>

        {/* Table representation */}
        {isLoading && analyzeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RefreshCw className="h-10 w-10 animate-spin text-[#4EACAF]" />
            <p className="mt-4 text-sm font-bold text-slate-400">
              Đang tải danh sách đánh giá...
            </p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl py-20 text-center">
            <Brain className="h-12 w-12 text-slate-200" />
            <h3 className="mt-4 text-base font-black text-slate-800">
              Không tìm thấy kết quả phù hợp
            </h3>
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Vui lòng điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th
                      onClick={() => handleSort('ChildFullName')}
                      className="px-[5px] py-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Họ tên bé"
                    >
                      <div className="flex items-center gap-1">
                        Bé học
                        {sortColumn === 'ChildFullName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('SpeechLevel')}
                      className="px-[5px] py-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Mức độ chậm nói"
                    >
                      <div className="flex items-center gap-1">
                        Mức độ chậm nói
                        {sortColumn === 'SpeechLevel' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('Diagnosis')}
                      className="px-[5px] py-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Chẩn đoán"
                    >
                      <div className="flex items-center gap-1">
                        Chẩn đoán sơ bộ
                        {sortColumn === 'Diagnosis' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('PronunciationAbility')}
                      className="px-[5px] py-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Khả năng phát âm"
                    >
                      <div className="flex items-center gap-1">
                        Khả năng phát âm
                        {sortColumn === 'PronunciationAbility' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('AssessmentDate')}
                      className="px-[5px] py-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Ngày đánh giá"
                    >
                      <div className="flex items-center gap-1">
                        Ngày đánh giá
                        {sortColumn === 'AssessmentDate' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('NextAssessmentDate')}
                      className="px-[5px] py-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Ngày đánh giá tiếp theo"
                    >
                      <div className="flex items-center gap-1">
                        Đánh giá tiếp theo
                        {sortColumn === 'NextAssessmentDate' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th className="px-[5px] py-4 text-right select-none">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-normal text-sm text-slate-650">
                  {paginatedList.map((item) => (
                    <tr key={item.Id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-[5px] py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            <img
                              src={resolveAvatarUrl(item.ChildAvatar, item.ChildFullName, 'bottts')}
                              alt="Child Avatar"
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <span className="block font-black text-slate-900">{item.ChildFullName}</span>
                            <span className="block text-[10px] font-bold text-gray-400">ID Bé: {item.ChildId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-[5px] py-5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider',
                            SpeechLevelMap[item.SpeechLevel]?.color || 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {SpeechLevelMap[item.SpeechLevel]?.label || item.SpeechLevel}
                        </span>
                      </td>
                      <td className="px-[5px] py-5">
                        <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={item.Diagnosis}>
                          {item.Diagnosis || 'Chưa chẩn đoán'}
                        </span>
                      </td>
                      <td className="px-[5px] py-5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border',
                            AssessmentLevelMap[item.PronunciationAbility]?.color || 'text-slate-600'
                          )}
                        >
                          {AssessmentLevelMap[item.PronunciationAbility]?.label || item.PronunciationAbility}
                        </span>
                      </td>
                      <td className="px-[5px] py-5 font-medium text-slate-500">
                        {formatDateOnly(item.AssessmentDate)}
                      </td>
                      <td className="px-[5px] py-5 font-medium text-slate-500">
                        {item.NextAssessmentDate ? formatDateOnly(item.NextAssessmentDate) : 'Chưa hẹn lại'}
                      </td>
                      <td className="px-[5px] py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton
                            type="view"
                            onClick={() => void handleOpenDetail(item)}
                            title="Thông tin chi tiết"
                          />

                          <ActionButton
                            type="edit"
                            onClick={() => void openEditModal(item)}
                            title="Chỉnh sửa bản đánh giá"
                          />

                          <ActionButton
                            type="delete"
                            onClick={() => openDeleteModal(item)}
                            title="Xóa đánh giá"
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
                totalItems={filteredList.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="bản đánh giá"
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Detail Modal */}
        {modalType === 'detail' && selectedAnalyze && (
          <ModalFrame
            title="Chi tiết Đánh giá trẻ học tập"
            subtitle="Thông tin chuyên sâu về năng lực phát triển của bé"
            onClose={handleCloseModal}
            accent="purple"
          >
            <div className="space-y-8 p-8 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-purple-50/40 px-4 py-3 text-sm text-slate-600">
                <span>Dữ liệu chẩn đoán và năng lực lâm sàng của trẻ.</span>
                {isDetailLoading && (
                  <span className="inline-flex items-center gap-2 font-bold text-purple-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Đang tải dữ liệu mới...
                  </span>
                )}
              </div>

              <div className="flex flex-col items-start gap-8 border-b border-gray-50 pb-6 font-bold md:flex-row">
                <div className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-purple-100 bg-purple-50 p-3 md:mx-0">
                  <img
                    src={resolveAvatarUrl(selectedAnalyze.ChildAvatar, selectedAnalyze.ChildFullName, 'bottts')}
                    alt="Detail Avatar"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-medium text-slate-800">{selectedAnalyze.ChildFullName}</h3>
                    <p className="text-gray-400">ID trẻ liên kết: {selectedAnalyze.ChildId}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs md:justify-start">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-black uppercase italic border', SpeechLevelMap[selectedAnalyze.SpeechLevel]?.color)}>
                      Mức độ chậm nói: {SpeechLevelMap[selectedAnalyze.SpeechLevel]?.label || selectedAnalyze.SpeechLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                <DetailRow label="Ngày đánh giá" value={formatDateOnly(selectedAnalyze.AssessmentDate)} />
                <DetailRow label="Ngày đánh giá kế tiếp" value={selectedAnalyze.NextAssessmentDate ? formatDateOnly(selectedAnalyze.NextAssessmentDate) : 'Chưa hẹn lại'} />
                <DetailRow label="Thời gian phân tích cuối" value={formatDateTime(selectedAnalyze.UpdatedAt)} />
                <DetailRow label="Ngày tạo bản ghi" value={formatDateTime(selectedAnalyze.CreatedAt)} />

                <div className="col-span-1 md:col-span-2 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                  <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 border-b pb-1.5">Kết quả đánh giá 6 khía cạnh năng lực</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                      <span>Khả năng giao tiếp:</span>
                      <span className={cn('px-2 py-0.5 rounded-md border font-black uppercase', AssessmentLevelMap[selectedAnalyze.CommunicationAbility]?.color)}>
                        {AssessmentLevelMap[selectedAnalyze.CommunicationAbility]?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                      <span>Khả năng phát âm:</span>
                      <span className={cn('px-2 py-0.5 rounded-md border font-black uppercase', AssessmentLevelMap[selectedAnalyze.PronunciationAbility]?.color)}>
                        {AssessmentLevelMap[selectedAnalyze.PronunciationAbility]?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                      <span>Hiểu ngôn ngữ:</span>
                      <span className={cn('px-2 py-0.5 rounded-md border font-black uppercase', AssessmentLevelMap[selectedAnalyze.LanguageComprehension]?.color)}>
                        {AssessmentLevelMap[selectedAnalyze.LanguageComprehension]?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                      <span>Biểu đạt ngôn ngữ:</span>
                      <span className={cn('px-2 py-0.5 rounded-md border font-black uppercase', AssessmentLevelMap[selectedAnalyze.LanguageExpression]?.color)}>
                        {AssessmentLevelMap[selectedAnalyze.LanguageExpression]?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                      <span>Chú ý tập trung:</span>
                      <span className={cn('px-2 py-0.5 rounded-md border font-black uppercase', AssessmentLevelMap[selectedAnalyze.AttentionLevel]?.color)}>
                        {AssessmentLevelMap[selectedAnalyze.AttentionLevel]?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                      <span>Tương tác xã hội:</span>
                      <span className={cn('px-2 py-0.5 rounded-md border font-black uppercase', AssessmentLevelMap[selectedAnalyze.SocialInteraction]?.color)}>
                        {AssessmentLevelMap[selectedAnalyze.SocialInteraction]?.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5 rounded-2xl border border-blue-100 bg-blue-50/20 p-4">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-blue-600">Chẩn đoán lâm sàng</span>
                  <span className="block text-sm font-medium text-slate-800 leading-relaxed">{selectedAnalyze.Diagnosis || 'Không có ghi nhận.'}</span>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5 rounded-2xl border border-indigo-100 bg-indigo-50/20 p-4">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-indigo-600">Khó khăn hiện tại</span>
                  <span className="block text-sm font-medium text-slate-800 leading-relaxed">{selectedAnalyze.Difficulties || 'Không có ghi nhận.'}</span>
                </div>

                <div className="space-y-1.5 rounded-2xl border border-[#F2ECD8]/40 bg-[#FDFCF5]/60 p-4">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-[#4EACAF]">Điểm mạnh của bé</span>
                  <span className="block text-sm font-bold text-gray-800 leading-relaxed">{selectedAnalyze.Strengths || 'Chưa cập nhật.'}</span>
                </div>

                <div className="space-y-1.5 rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-rose-500">Điểm yếu cần lưu ý</span>
                  <span className="block text-sm font-bold text-gray-800 leading-relaxed">{selectedAnalyze.Weaknesses || 'Chưa cập nhật.'}</span>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5 rounded-2xl border border-purple-100 bg-purple-50/20 p-4">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-purple-600 font-black">Mục tiêu can thiệp</span>
                  <span className="block text-sm font-medium text-slate-800 leading-relaxed">{selectedAnalyze.InterventionGoals || 'Không có ghi nhận.'}</span>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5 rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-amber-600">Khuyến nghị chuyên môn</span>
                  <span className="block text-sm font-bold italic text-gray-800 leading-relaxed">"{selectedAnalyze.Recommendation || 'Không có khuyến nghị.'}"</span>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">Ghi chú bổ sung</span>
                  <span className="block text-sm font-normal text-slate-600 leading-relaxed">{selectedAnalyze.Notes || 'Không có ghi chú.'}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="rounded-2xl bg-gray-100 px-8 py-4 font-black text-gray-600 transition-all hover:bg-gray-200 cursor-pointer"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </ModalFrame>
        )}

        {/* Form Modal */}
        {modalType === 'form' && (
          <ModalFrame
            title={formMode === 'create' ? 'Tạo bản đánh giá trẻ mới' : 'Chỉnh sửa bản đánh giá'}
            subtitle={formMode === 'create' ? 'Nhập thông tin kết quả đánh giá trẻ để lưu trữ' : 'Cập nhật lại thông tin đánh giá'}
            onClose={handleCloseModal}
            accent="teal"
          >
            <div className="space-y-6 p-8 md:p-10">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectInputField
                  label="Chọn trẻ em liên kết"
                  value={formState.childId}
                  onChange={(value) => handleFormChange('childId', value)}
                  options={childrenOptions}
                />

                <SelectInputField
                  label="Mức độ chậm nói"
                  value={formState.speechLevel}
                  onChange={(value) => handleFormChange('speechLevel', value)}
                  options={[
                    { value: 'Mild', label: 'Nhẹ (Mild)' },
                    { value: 'Moderate', label: 'Trung bình (Moderate)' },
                    { value: 'Severe', label: 'Nặng (Severe)' },
                  ]}
                />

                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Ngày đánh giá
                  </label>
                  <input
                    type="date"
                    value={formState.assessmentDate}
                    onChange={(e) => handleFormChange('assessmentDate', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-normal text-slate-600 outline-none focus:border-[#4EACAF] focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Ngày đánh giá tiếp theo (Hẹn lại)
                  </label>
                  <input
                    type="date"
                    value={formState.nextAssessmentDate}
                    onChange={(e) => handleFormChange('nextAssessmentDate', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-normal text-slate-600 outline-none focus:border-[#4EACAF] focus:bg-white"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">Đánh giá 6 khía cạnh phát triển</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectInputField
                      label="Khả năng giao tiếp"
                      value={formState.communicationAbility}
                      onChange={(value) => handleFormChange('communicationAbility', value)}
                      options={[
                        { value: 'VeryPoor', label: 'Rất kém' },
                        { value: 'Poor', label: 'Kém' },
                        { value: 'Average', label: 'Trung bình' },
                        { value: 'Good', label: 'Tốt' },
                        { value: 'Excellent', label: 'Xuất sắc' },
                      ]}
                    />

                    <SelectInputField
                      label="Khả năng phát âm"
                      value={formState.pronunciationAbility}
                      onChange={(value) => handleFormChange('pronunciationAbility', value)}
                      options={[
                        { value: 'VeryPoor', label: 'Rất kém' },
                        { value: 'Poor', label: 'Kém' },
                        { value: 'Average', label: 'Trung bình' },
                        { value: 'Good', label: 'Tốt' },
                        { value: 'Excellent', label: 'Xuất sắc' },
                      ]}
                    />

                    <SelectInputField
                      label="Khả năng hiểu ngôn ngữ"
                      value={formState.languageComprehension}
                      onChange={(value) => handleFormChange('languageComprehension', value)}
                      options={[
                        { value: 'VeryPoor', label: 'Rất kém' },
                        { value: 'Poor', label: 'Kém' },
                        { value: 'Average', label: 'Trung bình' },
                        { value: 'Good', label: 'Tốt' },
                        { value: 'Excellent', label: 'Xuất sắc' },
                      ]}
                    />

                    <SelectInputField
                      label="Khả năng biểu đạt ngôn ngữ"
                      value={formState.languageExpression}
                      onChange={(value) => handleFormChange('languageExpression', value)}
                      options={[
                        { value: 'VeryPoor', label: 'Rất kém' },
                        { value: 'Poor', label: 'Kém' },
                        { value: 'Average', label: 'Trung bình' },
                        { value: 'Good', label: 'Tốt' },
                        { value: 'Excellent', label: 'Xuất sắc' },
                      ]}
                    />

                    <SelectInputField
                      label="Khả năng chú ý tập trung"
                      value={formState.attentionLevel}
                      onChange={(value) => handleFormChange('attentionLevel', value)}
                      options={[
                        { value: 'VeryPoor', label: 'Rất kém' },
                        { value: 'Poor', label: 'Kém' },
                        { value: 'Average', label: 'Trung bình' },
                        { value: 'Good', label: 'Tốt' },
                        { value: 'Excellent', label: 'Xuất sắc' },
                      ]}
                    />

                    <SelectInputField
                      label="Khả năng tương tác xã hội"
                      value={formState.socialInteraction}
                      onChange={(value) => handleFormChange('socialInteraction', value)}
                      options={[
                        { value: 'VeryPoor', label: 'Rất kém' },
                        { value: 'Poor', label: 'Kém' },
                        { value: 'Average', label: 'Trung bình' },
                        { value: 'Good', label: 'Tốt' },
                        { value: 'Excellent', label: 'Xuất sắc' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Chẩn đoán lâm sàng</label>
                <textarea
                  value={formState.diagnosis}
                  onChange={(e) => handleFormChange('diagnosis', e.target.value)}
                  rows={2}
                  placeholder="Chẩn đoán ban đầu về tình trạng ngôn ngữ của bé..."
                  className="resize-y w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-600 outline-none transition-colors focus:border-[#4EACAF] focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Khó khăn của trẻ</label>
                <textarea
                  value={formState.difficulties}
                  onChange={(e) => handleFormChange('difficulties', e.target.value)}
                  rows={2}
                  placeholder="Các rào cản phát âm hoặc chú ý tập trung của trẻ..."
                  className="resize-y w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-600 outline-none transition-colors focus:border-[#4EACAF] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Điểm mạnh của trẻ</label>
                  <textarea
                    value={formState.strengths}
                    onChange={(e) => handleFormChange('strengths', e.target.value)}
                    rows={2}
                    placeholder="Bé phản xạ tốt với trò chơi VR..."
                    className="resize-y w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-600 outline-none transition-colors focus:border-[#4EACAF] focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Điểm yếu của trẻ</label>
                  <textarea
                    value={formState.weaknesses}
                    onChange={(e) => handleFormChange('weaknesses', e.target.value)}
                    rows={2}
                    placeholder="Ngọng âm S, L..."
                    className="resize-y w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-600 outline-none transition-colors focus:border-[#4EACAF] focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Mục tiêu can thiệp</label>
                <textarea
                  value={formState.interventionGoals}
                  onChange={(e) => handleFormChange('interventionGoals', e.target.value)}
                  rows={2}
                  placeholder="Phát âm chuẩn âm S trong 1 tuần..."
                  className="resize-y w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-600 outline-none transition-colors focus:border-[#4EACAF] focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Khuyến nghị chuyên môn</label>
                <textarea
                  value={formState.recommendation}
                  onChange={(e) => handleFormChange('recommendation', e.target.value)}
                  rows={2}
                  placeholder="Phụ huynh đồng hành chơi game VR 15 phút mỗi ngày..."
                  className="resize-y w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-600 outline-none transition-colors focus:border-[#4EACAF] focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Ghi chú bổ sung</label>
                <textarea
                  value={formState.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  rows={2}
                  placeholder="Bố mẹ hỗ trợ nhiệt tình..."
                  className="resize-y w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-600 outline-none transition-colors focus:border-[#4EACAF] focus:bg-white"
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
                  className="rounded-2xl bg-gray-100 px-6 py-3 text-sm font-black text-gray-600 transition-all hover:bg-gray-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={() => void handleSubmitForm()}
                  disabled={isSaving}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl bg-[#4EACAF] px-6 py-3 text-sm font-black text-white transition-all cursor-pointer',
                    isSaving ? 'cursor-not-allowed opacity-70' : 'hover:bg-[#4EACAF]/90'
                  )}
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {formMode === 'create' ? 'Tạo đánh giá' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </ModalFrame>
        )}

        {/* Delete Modal */}
        {modalType === 'delete' && selectedAnalyze && (
          <ModalFrame
            title="Xóa đánh giá học tập"
            subtitle="Hành động này sẽ xóa vĩnh viễn kết quả phân tích này"
            onClose={handleCloseModal}
            accent="rose"
          >
            <div className="space-y-6 p-8 md:p-10">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-700">
                <p className="font-semibold">
                  Bạn sắp xóa bản đánh giá học lực của bé <strong>{selectedAnalyze.ChildFullName}</strong> (Ngày đánh giá:{' '}
                  {formatDateOnly(selectedAnalyze.AssessmentDate)}).
                </p>
                <p className="mt-2">Hành động này không thể hoàn tác. Vui lòng xác nhận nếu bạn thực sự muốn xóa bản ghi này.</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="rounded-2xl bg-gray-100 px-6 py-3 text-sm font-black text-gray-600 transition-all hover:bg-gray-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={() => void handleConfirmDelete()}
                  disabled={isDeleting}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-6 py-3 text-sm font-black text-white transition-all cursor-pointer',
                    isDeleting ? 'cursor-not-allowed opacity-70' : 'hover:bg-rose-600'
                  )}
                >
                  {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
      <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">{label}</label>
      <CustomSelect value={value} onChange={onChange} options={options} variant="form" />
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
      <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">{label}</label>
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
        <div className={cn('flex items-center justify-between px-8 py-6 text-gray-900 border-b', accentStyles[accent])}>
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black italic tracking-tight">
              <Info className="h-6 w-6" />
              {title}
            </h2>
            <p className="mt-1 text-xs font-normal uppercase tracking-wider text-gray-400">{subtitle}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2.5 transition-colors hover:bg-white/70">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-160px)] overflow-y-auto">{children}</div>
      </motion.div>
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
      <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</span>
      <span className="block text-sm font-bold text-gray-800">{value}</span>
    </div>
  );
}
