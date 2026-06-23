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
  Sparkle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import { useProgramManagementApi, type ProgramResponse } from '../../hooks/useProgramManagementApi';

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

const mapProgram = (program: ProgramResponse): Program => ({
  ProgramId: String(program.id),
  ProgramName: program.programName,
  Description: program.description ?? '',
  TargetAgeFrom: program.targetAgeFrom,
  TargetAgeTo: program.targetAgeTo,
  Language: program.language,
  Status: program.status,
  CreatedAt: program.createdAt,
  UpdatedAt: program.updatedAt ?? program.createdAt,
});

// Mock Programs
const INITIAL_PROGRAMS: Program[] = [
  {
    ProgramId: 'PRG-001',
    ProgramName: 'Thám hiểm Đảo Khủng Long VR - Luyện Âm Tròn Vành',
    Description: 'Hành trình thám hiểm thế giới ảo phong phú giúp trẻ sửa các lỗi phát âm phụ âm bẹt, n, l, d thông qua phản hồi giọng nói trực quan thời gian thực.',
    TargetAgeFrom: 4,
    TargetAgeTo: 6,
    Language: 'Vietnamese',
    Status: 'Active',
    CreatedAt: '2026-01-10 08:30',
    UpdatedAt: '2026-05-20 14:00'
  },
  {
    ProgramId: 'PRG-002',
    ProgramName: 'Space Language Explorer - Kích Hoạt Phản Xạ Anh Ngữ',
    Description: 'Phiêu lưu hệ mặt trời trên phi thuyền để hoàn thành các đối thoại sinh động cùng mô phỏng phi hành gia ảo 3D. Rèn luyện âm gió s, sh, x.',
    TargetAgeFrom: 7,
    TargetAgeTo: 11,
    Language: 'English',
    Status: 'Active',
    CreatedAt: '2026-02-15 09:15',
    UpdatedAt: '2026-05-25 10:30'
  },
  {
    ProgramId: 'PRG-003',
    ProgramName: 'Vương Quốc Âm Thanh Tranh 3D - Kể Chuyện Nhập Vai',
    Description: 'Luyện ngữ điệu cảm xúc nói và tư thế biểu cảm tự tin trước đám đông thông qua việc hóa thân vào các nhân vật cổ tích giàu tương tác VR.',
    TargetAgeFrom: 5,
    TargetAgeTo: 8,
    Language: 'Vietnamese',
    Status: 'Active',
    CreatedAt: '2026-03-01 11:00',
    UpdatedAt: '2026-05-18 16:20'
  },
  {
    ProgramId: 'PRG-004',
    ProgramName: 'Lớp Sửa Ngọng Chữ R Siêu Tốc cùng Robot XR',
    Description: 'Khắc phục dứt điểm phát âm rung lưỡi chữ R thông qua các bài tập thở hơi và rung lưỡi phối hợp cảm biến phản xúc giác tay cầm VR.',
    TargetAgeFrom: 6,
    TargetAgeTo: 10,
    Language: 'Vietnamese',
    Status: 'Inactive',
    CreatedAt: '2026-04-12 15:45',
    UpdatedAt: '2026-04-30 17:00'
  },
  {
    ProgramId: 'PRG-005',
    ProgramName: 'Smart Phonetics Adventure - Đồ Vật & Con Vật 3D',
    Description: 'Chương trình song ngữ kích thích tích lũy vốn từ vựng cơ bản thông qua cơ chế chạm gắp vật thể 3DR nổi trên không gian lớp học ảo.',
    TargetAgeFrom: 3,
    TargetAgeTo: 5,
    Language: 'English',
    Status: 'Active',
    CreatedAt: '2026-05-01 10:00',
    UpdatedAt: '2026-05-28 09:30'
  }
];

// Mock lessons associated with programs for "Xem bài học" action
const MOCK_LESSONS_BY_PROGRAM: Record<string, Lesson[]> = {
  'PRG-001': [
    { LessonId: 'LSN-101', LessonName: 'Làm quen khủng long ngộ nghĩnh & phát âm âm đơn', Description: 'Trẻ gọi tên 5 chú khủng long để rèn việc mở rộng khung miệng.', DurationMinutes: 15, VrInteractiveMode: 'Sách nói 3D nổi' },
    { LessonId: 'LSN-102', LessonName: 'Chinh phục Đầm lầy Phụ âm N - L', Description: 'Hái các quả bóng phát âm đúng âm L hoặc N để nhảy qua đầm lầy.', DurationMinutes: 20, VrInteractiveMode: 'Quẹt kéo phản xạ VR' },
    { LessonId: 'LSN-103', LessonName: 'Thử thách lồng tiếng chú T-Rex tự tin', Description: 'Bé nhập vai lồng tiếng một đoạn hội thoại ngắn tròn trịa.', DurationMinutes: 18, VrInteractiveMode: 'Micro thu âm VR trực tiếp' }
  ],
  'PRG-002': [
    { LessonId: 'LSN-201', LessonName: 'Chào hỏi phi hành gia ngoài vũ trụ', Description: 'Giao lưu kết bạn bằng tiếng Anh chuẩn chỉnh s, z.', DurationMinutes: 15, VrInteractiveMode: 'Trò chuyện NPC AI' },
    { LessonId: 'LSN-202', LessonName: 'Lắp ráp tàu Apollo bằng khẩu lệnh', Description: 'Bé phát âm chuẩn tên các chi tiết để các bộ phận tự ráp vào nhau.', DurationMinutes: 22, VrInteractiveMode: 'Cử chỉ tương tác tay cầm' },
    { LessonId: 'LSN-203', LessonName: 'Tìm kiếm Kim cương âm gió trên sao Hỏa', Description: 'Hút kim cương phát ra âm sọc S và X thích hợp.', DurationMinutes: 20, VrInteractiveMode: 'Nhắm bắn phản xạ' }
  ],
  'PRG-003': [
    { LessonId: 'LSN-301', LessonName: 'Hóa thân sói xám thổi bay nhà rơm', Description: 'Luyện lấy hơi bụng sâu và biểu cảm kịch nghệ.', DurationMinutes: 15, VrInteractiveMode: 'Thổi hơi đo lường cảm biến' },
    { LessonId: 'LSN-302', LessonName: 'Kịch bản Cô Bé Bán Diêm ấm áp', Description: 'Luyện cấu trúc nói thỏ thẻ trầm ấm cảm thông sâu sắc.', DurationMinutes: 20, VrInteractiveMode: 'Hộp kể chuyện 360 độ' }
  ],
  'PRG-004': [
    { LessonId: 'LSN-401', LessonName: 'Học cách rung lưỡi cùng Ong Vàng VR', Description: 'Luyện khẩu hình chữ R chu môi rung phát ra âm thanh Rrrr.', DurationMinutes: 15, VrInteractiveMode: 'Hiển thị chuyển động lưỡi 3D' }
  ],
  'PRG-005': [
    { LessonId: 'LSN-501', LessonName: 'Chạm đũa thần đếm động vật nông trại', Description: 'Học từ vựng con lợn (Pig), con gà (Chicken) cực đơn giản.', DurationMinutes: 15, VrInteractiveMode: 'Chạm tay nổi 3D' },
    { LessonId: 'LSN-502', LessonName: 'Nông trại thu hoạch trái chín mọng', Description: 'Gọi tên trái cây tiếng Anh để ném vào giỏ thu hoạch thông minh.', DurationMinutes: 18, VrInteractiveMode: 'Ném vật lý VR' }
  ]
};

export default function ProgramManagement() {
  const { getPrograms, createProgram, updateProgram } = useProgramManagementApi();
  const [programs, setPrograms] = useState<Program[]>([]);
  
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
  const [modalType, setModalType] = useState<'add' | 'edit' | 'lessons' | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAgeFrom, setFormAgeFrom] = useState<number>(4);
  const [formAgeTo, setFormAgeTo] = useState<number>(8);
  const [formLang, setFormLang] = useState<'Vietnamese' | 'English'>('Vietnamese');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  // Toast Helper
  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => setAlertConfig(null), 3500);
  };

  useEffect(() => {
    void getPrograms().then((result) => {
      if (result.success && result.data) setPrograms(result.data.items.map(mapProgram));
      else triggerToast(result.errors.join(' ') || result.message, 'warning');
    });
  }, []);

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
    setFormAgeFrom(4);
    setFormAgeTo(8);
    setFormLang('Vietnamese');
    setFormStatus('Active');
    setSelectedProgram(null);
    setModalType('add');
  };

  const handleOpenEdit = (prog: Program) => {
    setSelectedProgram(prog);
    setFormName(prog.ProgramName);
    setFormDesc(prog.Description);
    setFormAgeFrom(prog.TargetAgeFrom);
    setFormAgeTo(prog.TargetAgeTo);
    setFormLang(prog.Language);
    setFormStatus(prog.Status);
    setModalType('edit');
  };

  const handleOpenLessons = (prog: Program) => {
    setSelectedProgram(prog);
    setModalType('lessons');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedProgram(null);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      triggerToast('Vui lòng điền tên chương trình học!', 'warning');
      return;
    }
    if (!formDesc.trim()) {
      triggerToast('Vui lòng nhập mô tả tóm tắt cho trẻ!', 'warning');
      return;
    }
    if (formAgeFrom <= 0 || formAgeTo <= 0) {
      triggerToast('Độ tuổi mục tiêu phải là số dương lớn hơn 0!', 'warning');
      return;
    }
    if (formAgeFrom > formAgeTo) {
      triggerToast('Độ tuổi bắt đầu không được lớn hơn độ tuổi kết thúc!', 'warning');
      return;
    }

    const payload = { programName: formName.trim(), description: formDesc.trim(), targetAgeFrom: formAgeFrom, targetAgeTo: formAgeTo, language: formLang, status: formStatus };
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
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-md text-[11px] font-bold uppercase tracking-wider leading-none">
            <BookOpen className="w-3.5 h-3.5" />
            Giáo học pháp VR tương tác
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight font-sans">
            Quản Lý Chương Trình Học
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Xây dựng chương trình luyện nói phù hợp với trẻ từ 7 đến 11 tuổi, đồng thời tinh chỉnh các học liệu 3D, phòng phát âm tương tác độc quyền cho nền tảng kính VR.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-bold py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 shadow-md shadow-[#4EACAF]/10 transition-all active:scale-95 shrink-0 text-xs uppercase cursor-pointer"
          id="add-program-btn"
        >
          <Plus className="w-4 h-4" />
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
          <div className="relative">
            <select 
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/20 px-3 py-2 rounded-lg font-bold text-xs text-slate-600 outline-none cursor-pointer pr-10 uppercase focus:bg-white focus:border-[#4EACAF] transition-colors"
            >
              <option value="ALL">Mọi ngôn ngữ</option>
              <option value="Vietnamese">Vietnamese (Tiếng Việt)</option>
              <option value="English">English (Tiếng Anh)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterAge}
              onChange={(e) => setFilterAge(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/20 px-3 py-2 rounded-lg font-bold text-xs text-slate-600 outline-none cursor-pointer pr-10 uppercase focus:bg-white focus:border-[#4EACAF] transition-colors"
            >
              <option value="ALL">Mọi lứa tuổi</option>
              <option value="3-5">Tầm tuổi: 3 - 5 tuổi</option>
              <option value="5-7">Tầm tuổi: 5 - 7 tuổi</option>
              <option value="7-11">Tầm tuổi: 7 - 11 tuổi</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/20 px-3 py-2 rounded-lg font-bold text-xs text-slate-600 outline-none cursor-pointer pr-10 uppercase focus:bg-white focus:border-[#4EACAF] transition-colors"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="Active">Hoạt động (Active)</option>
              <option value="Inactive">Tạm ngưng (Inactive)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
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
              Xóa cài dặt lọc
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPrograms.map((prog) => {
                const lessonCount = MOCK_LESSONS_BY_PROGRAM[prog.ProgramId]?.length || 0;
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
                modalType === 'edit' ? 'bg-sky-50 border-sky-100 text-gray-900' : 'bg-indigo-50 border-indigo-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'lessons' && <BookOpen className="w-6 h-6 text-indigo-500" />}
                    
                    {modalType === 'add' && 'Thêm chương trình học chuẩn'}
                    {modalType === 'edit' && `Cấu hình thông số: ${selectedProgram?.ProgramId}`}
                    {modalType === 'lessons' && `Bài học trong: ${selectedProgram?.ProgramName}`}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Cung cấp tài nguyên can thiệp mới vào hệ sinh thái VR'}
                    {modalType === 'edit' && 'Cập nhật điều chỉnh thang mức độ tuổi, ngôn ngữ giảng dạy'}
                    {modalType === 'lessons' && 'Danh sách định hình các phân cảnh VR tương tác phụ huynh & trẻ'}
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
                        Chương trình có <strong className="text-indigo-900">{(MOCK_LESSONS_BY_PROGRAM[selectedProgram.ProgramId] || []).length}</strong> phòng thực chiến VR. Các bài tập được xây dựng tuần tự để trẻ sửa các khuyết điểm về phát âm tự nhiên.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {(() => {
                      const lessons = MOCK_LESSONS_BY_PROGRAM[selectedProgram.ProgramId] || [];
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
                          type="number" 
                          required
                          min={1}
                          max={18}
                          value={formAgeFrom}
                          onChange={(e) => setFormAgeFrom(parseInt(e.target.value) || 0)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                      {/* Age range To */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Độ tuổi tối đa (TargetAgeTo) <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input 
                          type="number" 
                          required
                          min={1}
                          max={18}
                          value={formAgeTo}
                          onChange={(e) => setFormAgeTo(parseInt(e.target.value) || 0)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                      {/* Language Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Ngôn ngữ đào tạo <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={formLang}
                            onChange={(e) => setFormLang(e.target.value as 'Vietnamese' | 'English')}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] text-sm"
                          >
                            <option value="Vietnamese">Vietnamese (Tiếng Việt)</option>
                            <option value="English">English (Tiếng Anh)</option>
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Status select only when edit */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Trạng thái hoạt động <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={formStatus}
                            onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] text-sm"
                          >
                            <option value="Active">Hoạt động (Active)</option>
                            <option value="Inactive">Tạm ngưng (Inactive)</option>
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
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
