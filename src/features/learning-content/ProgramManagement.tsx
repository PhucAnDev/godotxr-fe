import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, 
  Languages, 
  Baby, 
  Plus, 
  Search, 
  ChevronDown, 
  X, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  AlertTriangle, 
  Eye, 
  Calendar,
  Sparkles,
  Smile,
  GraduationCap,
  Play,
  Volume2,
  Bookmark,
  TrendingUp,
  Workflow,
  Sparkle,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import CustomSelect from '../../components/common/CustomSelect';
import { parseNumberInput, toNumberInputValue } from '../../lib/numberInput';
import {
  useProgramManagementApi,
  type LessonResponse,
  type ProgramResponse,
} from '../../hooks/useProgramManagementApi';

// DB Interfaces
interface Program {
  ProgramId: string;
  ProgramName: string;
  Description: string;
  TargetAgeFrom: number;
  TargetAgeTo: number;
  Language: 'Vietnamese' | 'English';
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
}

interface Lesson {
  LessonId: string;
  LessonName: string;
  Description: string;
  DurationMinutes: number;
  VrInteractiveMode: string;
}

const mapProgram = (program: ProgramResponse): Program => {
  const rawLang = (program.language || '').trim().toLowerCase();
  const normalizedLanguage = (rawLang === 'english' || rawLang === 'en') ? 'English' : 'Vietnamese';
  return {
    ProgramId: String(program.id),
    ProgramName: program.programName,
    Description: program.description ?? '',
    TargetAgeFrom: program.targetAgeFrom,
    TargetAgeTo: program.targetAgeTo,
    Language: normalizedLanguage,
    Status: program.status,
    CreatedAt: program.createdAt,
    UpdatedAt: program.updatedAt ?? program.createdAt,
  };
};

const mapLesson = (lesson: LessonResponse): Lesson => ({
  LessonId: String(lesson.id),
  LessonName: lesson.lessonName,
  Description: lesson.description ?? 'Chưa có mô tả bài học.',
  DurationMinutes: lesson.estimatedDuration,
  VrInteractiveMode: lesson.targetSkill?.trim() || 'Tương tác VR',
});

// Mock Programs
export default function ProgramManagement() {
  const { getPrograms, getLessons, getLessonsByProgram, createProgram, updateProgram, deleteProgram } =
    useProgramManagementApi();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [lessonsByProgramId, setLessonsByProgramId] = useState<
    Record<string, Lesson[]>
  >({});
  const [isLessonsLoading, setIsLessonsLoading] = useState(false);
  
  // Filtering and searching states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('ALL');
  const [filterAge, setFilterAge] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Auto-reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterLanguage, filterAge, filterStatus]);

  // Modal forms
  const [modalType, setModalType] = useState<'add' | 'edit' | 'lessons' | 'delete' | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAgeFrom, setFormAgeFrom] = useState('4');
  const [formAgeTo, setFormAgeTo] = useState('8');
  const [formLang, setFormLang] = useState<'Vietnamese' | 'English'>('Vietnamese');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  // Toast Helper
  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => setAlertConfig(null), 3500);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadProgramsAndLessons() {
      const [programResult, lessonResult] = await Promise.all([
        getPrograms(),
        getLessons(1, 500),
      ]);

      if (cancelled) return;

      if (programResult.success && programResult.data) {
        setPrograms(programResult.data.items.map(mapProgram));
      } else {
        triggerToast(
          programResult.errors.join(' ') || programResult.message,
          'warning'
        );
      }

      if (lessonResult.success && lessonResult.data) {
        const groupedLessons = lessonResult.data.items.reduce<
          Record<string, Lesson[]>
        >((accumulator, lesson) => {
          const programId = String(lesson.programId);
          const mappedLesson = mapLesson(lesson);
          const current = accumulator[programId] ?? [];

          accumulator[programId] = [...current, mappedLesson];
          return accumulator;
        }, {});

        setLessonsByProgramId(groupedLessons);
      } else {
        triggerToast(
          lessonResult.errors.join(' ') || lessonResult.message,
          'warning'
        );
      }
    }

    void loadProgramsAndLessons();

    return () => {
      cancelled = true;
    };
  }, [getLessons, getPrograms]);

  // Quick stats
  const totalCount = programs.length;
  const activeCount = programs.filter(p => p.Status === 'Active').length;
  const vnCount = programs.filter(p => p.Language === 'Vietnamese').length;
  const enCount = programs.filter(p => p.Language === 'English').length;

  // Actions
  const handleToggleStatus = async (programId: string) => {
    const program = programs.find(p => p.ProgramId === programId);
    if (!program) return;
    const result = await updateProgram(Number(programId), {
      programName: program.ProgramName, description: program.Description,
      targetAgeFrom: program.TargetAgeFrom, targetAgeTo: program.TargetAgeTo,
      language: program.Language,
      status: program.Status === 'Active' ? 'Inactive' : 'Active',
    });
    if (result.success && result.data) {
      setPrograms(current => current.map(p => p.ProgramId === programId ? mapProgram(result.data!) : p));
      triggerToast(result.message);
    } else triggerToast(result.errors.join(' ') || result.message, 'warning');
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormDesc('');
    setFormAgeFrom('4');
    setFormAgeTo('8');
    setFormLang('Vietnamese');
    setFormStatus('Active');
    setSelectedProgram(null);
    setModalType('add');
  };

  const handleOpenEdit = (prog: Program) => {
    setSelectedProgram(prog);
    setFormName(prog.ProgramName);
    setFormDesc(prog.Description);
    setFormAgeFrom(toNumberInputValue(prog.TargetAgeFrom));
    setFormAgeTo(toNumberInputValue(prog.TargetAgeTo));
    setFormLang(prog.Language);
    setFormStatus(prog.Status);
    setModalType('edit');
  };

  const handleOpenLessons = async (prog: Program) => {
    setSelectedProgram(prog);
    setModalType('lessons');

    setIsLessonsLoading(true);
    const lessonResult = await getLessonsByProgram(Number(prog.ProgramId));
    setIsLessonsLoading(false);

    if (lessonResult.success && lessonResult.data) {
      setLessonsByProgramId((current) => ({
        ...current,
        [prog.ProgramId]: lessonResult.data!.map(mapLesson),
      }));
      return;
    }

    triggerToast(
      lessonResult.errors.join(' ') || lessonResult.message,
      'warning'
    );
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedProgram(null);
  };

  const handleOpenDelete = (prog: Program) => {
    setSelectedProgram(prog);
    setModalType('delete');
  };

  const handleDeleteProgram = async () => {
    if (!selectedProgram) return;
    const result = await deleteProgram(Number(selectedProgram.ProgramId));
    if (result.success) {
      setPrograms(current => current.filter(p => p.ProgramId !== selectedProgram.ProgramId));
      triggerToast(result.message || 'Xóa chương trình học thành công.');
      handleCloseModal();
    } else {
      triggerToast(result.errors.join(' ') || result.message || 'Xóa chương trình học thất bại.', 'warning');
    }
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAgeFrom = parseNumberInput(formAgeFrom);
    const targetAgeTo = parseNumberInput(formAgeTo);

    if (!formName.trim()) {
      triggerToast('Vui lòng điền tên chương trình học!', 'warning');
      return;
    }
    if (!formDesc.trim()) {
      triggerToast('Vui lòng nhập mô tả tóm tắt cho trẻ!', 'warning');
      return;
    }
    if (targetAgeFrom === null || targetAgeTo === null) {
      triggerToast('Vui lòng nhập đầy đủ độ tuổi bắt đầu và độ tuổi tối đa!', 'warning');
      return;
    }
    if (targetAgeFrom <= 0 || targetAgeTo <= 0) {
      triggerToast('Độ tuổi mục tiêu phải là số dương lớn hơn 0!', 'warning');
      return;
    }
    if (targetAgeFrom > targetAgeTo) {
      triggerToast('Độ tuổi bắt đầu không được lớn hơn độ tuổi kết thúc!', 'warning');
      return;
    }

    const payload = {
      programName: formName.trim(),
      description: formDesc.trim(),
      targetAgeFrom,
      targetAgeTo,
      language: formLang,
      status: formStatus,
    };
    const result = modalType === 'add'
      ? await createProgram(payload)
      : selectedProgram ? await updateProgram(Number(selectedProgram.ProgramId), payload) : null;
    if (result?.success && result.data) {
      const mapped = mapProgram(result.data);
      setPrograms(current => modalType === 'add' ? [mapped, ...current] : current.map(p => p.ProgramId === mapped.ProgramId ? mapped : p));
      triggerToast(result.message);
      handleCloseModal();
    } else if (result) triggerToast(result.errors.join(' ') || result.message, 'warning');
  };

  // Filter chain logic
  const filteredPrograms = programs.filter(item => {
    // Search by ProgramName
    const matchesSearch = item.ProgramName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.ProgramId.toLowerCase().includes(searchQuery.toLowerCase());

    // Language filter
    const matchesLanguage = filterLanguage === 'ALL' || item.Language === filterLanguage;

    // Status filter
    const matchesStatus = filterStatus === 'ALL' || item.Status === filterStatus;

    // Age Group filters (conceptual bins or overlaps)
    let matchesAge = true;
    if (filterAge !== 'ALL') {
      const [minStr, maxStr] = filterAge.split('-');
      const minVal = parseInt(minStr);
      const maxVal = parseInt(maxStr);
      // check if overlaps target range
      matchesAge = item.TargetAgeTo >= minVal && item.TargetAgeFrom <= maxVal;
    }

    return matchesSearch && matchesLanguage && matchesStatus && matchesAge;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPrograms = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPrograms.slice(startIndex, startIndex + pageSize);
  }, [filteredPrograms, currentPage, pageSize]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative" id="program-view-root">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="program-toast-box"
          >
            <div className={cn(
              "p-5 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-white backdrop-blur-md",
              alertConfig.type === 'success' ? 'bg-[#4EACAF]/95 text-white' : 'bg-[#FF8E8E]/95 text-white'
            )}>
              {alertConfig.type === 'success' ? (
                <div className="bg-white/20 p-2 rounded-xl shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="bg-white/20 p-2 rounded-xl shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0 font-bold">
                <p className="italic text-sm tracking-tight text-white leading-snug">{alertConfig.message}</p>
              </div>
              <button 
                onClick={() => setAlertConfig(null)} 
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Page Header (GodotXR Design Theme) */}
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <BookOpen className="w-3.5 h-3.5" />
            Giáo học pháp VR tương tác
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Quản Lý <span className="text-[#4EACAF]">Chương Trình Học</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Xây dựng chương trình luyện nói phù hợp với trẻ từ 7 đến 11 tuổi, đồng thời tinh chỉnh các học liệu 3D, phòng phát âm tương tác độc quyền cho nền tảng kính VR.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          id="add-program-btn"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Thêm chương trình
        </button>
      </div>

      {/* 2. Kid-friendly stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem 
          title="Tổng Chương Trình" 
          value={totalCount} 
          subtitle="Hệ đào tạo hiện có hệ thống" 
          icon={<BookOpen className="w-6 h-6 text-[#4EACAF]" />} 
          bgColor="bg-teal-50"
          borderColor="border-teal-100"
        />
        <StatItem 
          title="Đang Hoạt Động" 
          value={activeCount} 
          subtitle="Sẵn sàng gán lớp VR mới" 
          icon={<Smile className="w-6 h-6 text-emerald-500" />} 
          bgColor="bg-emerald-50"
          borderColor="border-emerald-100"
        />
        <StatItem 
          title="Tiếng Việt" 
          value={vnCount} 
          subtitle="Ngôn ngữ mẹ đẻ bản xứ" 
          icon={<Languages className="w-6 h-6 text-indigo-500" />} 
          bgColor="bg-indigo-50"
          borderColor="border-indigo-100"
        />
        <StatItem 
          title="Tiếng Anh" 
          value={enCount} 
          subtitle="Kích hoạt phản xạ ngoại ngữ" 
          icon={<Sparkles className="w-6 h-6 text-rose-400" />} 
          bgColor="bg-rose-50"
          borderColor="border-rose-100"
        />
      </div>

      {/* 3. Search and filter panel */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm kiếm chương trình theo tên hoặc mã định danh..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-250 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CustomSelect
            value={filterLanguage}
            onChange={setFilterLanguage}
            options={[
              { value: 'ALL', label: 'Mọi ngôn ngữ' },
              { value: 'Vietnamese', label: 'Vietnamese (Tiếng Việt)' },
              { value: 'English', label: 'English (Tiếng Anh)' }
            ]}
          />
          <CustomSelect
            value={filterAge}
            onChange={setFilterAge}
            options={[
              { value: 'ALL', label: 'Mọi lứa tuổi' },
              { value: '3-5', label: 'Tầm tuổi: 3 - 5 tuổi' },
              { value: '5-7', label: 'Tầm tuổi: 5 - 7 tuổi' },
              { value: '7-11', label: 'Tầm tuổi: 7 - 11 tuổi' }
            ]}
          />
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'ALL', label: 'Mọi trạng thái' },
              { value: 'Active', label: 'Hoạt động (Active)' },
              { value: 'Inactive', label: 'Tạm ngưng (Inactive)' }
            ]}
          />
        </div>
      </div>

      {/* 4. Grid card view of program lists */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-gray-950 italic">Học liệu can thiệp ({filteredPrograms.length})</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Cấu trúc hóa bento thân thiện với trẻ nhỏ</p>
          </div>
          <div className="text-xs bg-[#4EACAF]/10 px-4 py-1.5 rounded-full text-[#4EACAF] font-bold">
            Trách nhiệm: Quản trị viên
          </div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-[40px] py-24 text-center space-y-4 border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100 animate-pulse">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700 text-center">Không tìm thấy giáo án đào tạo nào trùng khớp!</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterLanguage('ALL');
                setFilterAge('ALL');
                setFilterStatus('ALL');
              }}
              className="px-6 py-2.5 bg-[#4EACAF]/10 hover:bg-[#4EACAF]/20 duration-200 text-xs font-black uppercase text-[#4EACAF] rounded-xl border border-transparent"
            >
              Xóa cài đặt lọc
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPrograms.map((prog) => {
                const lessonCount = lessonsByProgramId[prog.ProgramId]?.length || 0;
                return (
                  <motion.div
                    key={prog.ProgramId}
                    whileHover={{ y: -8, scale: 1.01 }}
                    className={cn(
                      "bg-white rounded-[40px] border p-8 flex flex-col justify-between gap-6 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 relative overflow-hidden",
                      prog.Status === 'Inactive' ? 'border-gray-200/60 opacity-85 bg-gray-50/20' : 'border-gray-100'
                    )}
                  >
                    {/* Decorative background circle */}
                    <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-[#4EACAF]/5 pointer-events-none" />

                    {/* Header info (Age from-to, Lang) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="p-2 bg-[#4EACAF]/10 rounded-xl text-[#4EACAF]">
                            <Baby className="w-4 h-4" />
                          </span>
                          <span className="text-gray-900 font-extrabold text-xs">
                            {prog.TargetAgeFrom} - {prog.TargetAgeTo} tuổi
                          </span>
                        </div>

                        <span className={cn(
                          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          prog.Language === 'Vietnamese' ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'bg-[#FF8E8E]/10 text-[#FF8E8E] border border-[#FF8E8E]/20'
                        )}>
                          <Languages className="w-3 h-3" />
                          {prog.Language === 'Vietnamese' ? 'VN-Tiếng Việt' : 'EN-English'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-lg font-black text-gray-900 leading-snug line-clamp-2 hover:text-[#4EACAF] transition-colors">
                            {prog.ProgramName}
                          </h4>
                        </div>
                        <p className="text-gray-500 font-bold text-xs leading-relaxed line-clamp-4">
                          {prog.Description}
                        </p>
                      </div>
                    </div>

                    {/* Program stats & togglers */}
                    <div className="space-y-5 pt-4 border-t border-gray-50">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                        <div className="flex items-center gap-1">
                          <Bookmark className="w-3.5 h-3.5 text-gray-400" />
                          <span>{lessonCount} phòng 3D thực hành</span>
                        </div>
                        <span className="font-mono text-[10px]">{prog.ProgramId}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleStatus(prog.ProgramId)}
                            className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                            title="Bật tắt trạng thái nhanh"
                          >
                            {prog.Status === 'Active' ? (
                              <ToggleRight className="w-8 h-8 text-[#4EACAF]" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-gray-300" />
                            )}
                          </button>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            prog.Status === 'Active' ? 'text-emerald-500' : 'text-gray-400'
                          )}>
                            {prog.Status === 'Active' ? 'Hoạt động' : 'Tạm khóa'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleOpenLessons(prog)}
                            className="px-3.5 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                            title="Xem bài học"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Xem bài học
                          </button>

                          <button 
                            onClick={() => handleOpenEdit(prog)}
                            className="p-3 bg-gray-50 hover:bg-[#4EACAF]/10 hover:text-[#4EACAF] text-gray-500 rounded-xl transition-colors"
                            title="Chỉnh sửa thông số"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button 
                            onClick={() => handleOpenDelete(prog)}
                            className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-colors"
                            title="Xóa chương trình học"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Created At footer ribbon */}
                    <div className="text-[9px] text-gray-300 font-extrabold uppercase tracking-wide self-end">
                      Tạo lập: {prog.CreatedAt}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="bg-white rounded-[40px] p-6 border border-slate-100 mt-6 overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredPrograms.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="chương trình"
              />
            </div>
          </>
        )}
      </div>

      {/* 5. Modals Overlays */}
      <AnimatePresence>
        {modalType && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto w-full h-full" id="program-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30 my-8"
              id="program-modal-box"
            >
              {/* Modal Header */}
              <div className={cn(
                "px-8 py-6 flex items-center justify-between border-b",
                modalType === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' :
                modalType === 'edit' ? 'bg-sky-50 border-sky-100 text-gray-900' :
                modalType === 'delete' ? 'bg-rose-50 border-rose-100 text-gray-900' : 'bg-indigo-50 border-indigo-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'lessons' && <BookOpen className="w-6 h-6 text-indigo-500" />}
                    {modalType === 'delete' && <Trash2 className="w-6 h-6 text-rose-500" />}
                    
                    {modalType === 'add' && 'Thêm chương trình học chuẩn'}
                    {modalType === 'edit' && `Cấu hình thông số: ${selectedProgram?.ProgramId}`}
                    {modalType === 'lessons' && `Bài học trong: ${selectedProgram?.ProgramName}`}
                    {modalType === 'delete' && 'Xác nhận xóa chương trình'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Cung cấp tài nguyên can thiệp mới vào hệ sinh thái VR'}
                    {modalType === 'edit' && 'Cập nhật điều chỉnh thang mức độ tuổi, ngôn ngữ giảng dạy'}
                    {modalType === 'lessons' && 'Danh sách định hình các phân cảnh VR tương tác phụ huynh & trẻ'}
                    {modalType === 'delete' && 'Hành động này không thể khôi phục và có thể ảnh hưởng liên kết'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                  id="program-modal-close"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body: LESSONS Viewer */}
              {modalType === 'lessons' && selectedProgram ? (
                <div className="app-modal-body p-8 md:p-10 space-y-6" id="modal-lessons-view">
                  <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 flex items-center gap-4 text-indigo-700">
                    <GraduationCap className="w-10 h-10 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wider text-indigo-900">Chi tiết lộ trình huấn luyện</h4>
                      <p className="text-xs font-bold text-indigo-600/95 mt-1 leading-relaxed">
                        Chương trình có <strong className="text-indigo-900">{(lessonsByProgramId[selectedProgram.ProgramId] || []).length}</strong> phòng thực chiến VR. Các bài tập được xây dựng tuần tự để trẻ sửa các khuyết điểm về phát âm tự nhiên.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {(() => {
                      const lessons = lessonsByProgramId[selectedProgram.ProgramId] || [];
                      if (isLessonsLoading) {
                        return (
                          <div className="text-center py-10 font-bold text-gray-400 italic">
                            Đang tải danh sách bài học...
                          </div>
                        );
                      }
                      if (lessons.length === 0) {
                        return (
                          <div className="text-center py-10 font-bold text-gray-400 italic">
                            Chưa cập nhật bài học thực hành cho chương trình này.
                          </div>
                        );
                      }
                      return lessons.map((les, index) => (
                        <div key={les.LessonId} className="bg-[#FDFCF5] p-5 rounded-3xl border border-gray-100 flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-black text-sm flex items-center justify-center shrink-0">
                            {index + 1}
                          </div>
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <p className="font-extrabold text-gray-900 text-sm leading-tight">{les.LessonName}</p>
                              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto">
                                {les.VrInteractiveMode}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-gray-400 leading-relaxed line-clamp-2">{les.Description}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-extrabold uppercase">
                              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                              Thời lượng kính: {les.DurationMinutes} phút • Mã số: {les.LessonId}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-50">
                    <button 
                      onClick={handleCloseModal}
                      className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                    >
                      Đóng Học Phần
                    </button>
                  </div>
                </div>
              ) : modalType === 'delete' && selectedProgram ? (
                <div className="app-modal-body p-8 md:p-10 space-y-6" id="modal-delete-confirm">
                  <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100 flex items-center gap-4 text-rose-700 animate-in fade-in duration-300">
                    <AlertTriangle className="w-10 h-10 shrink-0 text-rose-500" />
                    <div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wider text-rose-900">Xác nhận xóa chương trình</h4>
                      <p className="text-xs font-bold text-rose-600/95 mt-1 leading-relaxed">
                        Bạn có chắc chắn muốn xóa chương trình học <strong className="text-rose-900">"{selectedProgram.ProgramName}"</strong>? Hành động này không thể hoàn tác và có thể ảnh hưởng đến bài học và lớp học liên kết.
                      </p>
                    </div>
                  </div>

                  <div className="app-modal-actions pt-6 border-t border-gray-150 flex gap-4">
                    <button 
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="button"
                      onClick={handleDeleteProgram}
                      className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl shadow-xl shadow-rose-500/15 transition-all text-sm uppercase tracking-wider cursor-pointer"
                    >
                      Xác nhận xóa
                    </button>
                  </div>
                </div>
              ) : (
                /* Modal Body: ADD OR EDIT FORM */
                <form onSubmit={handleSaveProgram} className="app-modal-body p-8 md:p-10 space-y-6" id="program-add-edit-form">
                  <div className="space-y-4">
                    
                    {/* Program Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Tên chương trình học <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ví dụ: Luyện âm đôi, thám hiểm Đảo Khủng Long VR..." 
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 placeholder-gray-300 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Mô tả chương trình can thiệp ngôn ngữ <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="Hãy tóm tắt kịch bản tương tác và lỗi phát âm trẻ sẽ sửa tại chương trình..." 
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 placeholder-gray-300 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                      />
                    </div>

                    <div className="app-modal-form-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Age range From */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Độ tuổi bắt đầu (TargetAgeFrom) <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formAgeFrom}
                          onChange={(e) => setFormAgeFrom(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                      {/* Age range To */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Độ tuổi tối đa (TargetAgeTo) <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formAgeTo}
                          onChange={(e) => setFormAgeTo(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                      {/* Language Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Ngôn ngữ đào tạo <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <CustomSelect
                          value={formLang}
                          onChange={(val) => setFormLang(val as 'Vietnamese' | 'English')}
                          variant="form"
                          options={[
                            { value: 'Vietnamese', label: 'Vietnamese (Tiếng Việt)' },
                            { value: 'English', label: 'English (Tiếng Anh)' }
                          ]}
                        />
                      </div>

                      {/* Status select only when edit */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Trạng thái hoạt động <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <CustomSelect
                          value={formStatus}
                          onChange={(val) => setFormStatus(val as 'Active' | 'Inactive')}
                          variant="form"
                          options={[
                            { value: 'Active', label: 'Hoạt động (Active)' },
                            { value: 'Inactive', label: 'Tạm ngưng (Inactive)' }
                          ]}
                        />
                      </div>

                    </div>
                  </div>

                  <div className="app-modal-actions pt-6 border-t border-gray-150 flex gap-4">
                    <button 
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                    >
                      Hủy thao tác
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/15 transition-all text-sm uppercase tracking-wider"
                      id="program-submit-save"
                    >
                      Xác nhận lưu trữ
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

// Child subcomponents 
interface StatItemProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

function StatItem({ title, value, subtitle, icon, bgColor, borderColor }: StatItemProps) {
  return (
    <div className={cn(
      "p-4 rounded-xl border flex items-center gap-3.5 shadow-sm transition-transform hover:-translate-y-0.5",
      bgColor,
      borderColor
    )}>
      <div className="bg-white p-2 border border-slate-100 rounded-lg shadow-sm shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-slate-800 tracking-tight leading-none">{value}</p>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{title}</p>
      </div>
    </div>
  );
}
