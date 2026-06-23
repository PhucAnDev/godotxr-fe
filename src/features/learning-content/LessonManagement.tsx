import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
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
  Award,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import { useLessonManagementApi, type LessonResponse } from '../../hooks/useLessonManagementApi';

// DB Interfaces
interface Program {
  ProgramId: string;
  ProgramName: string;
  Language: 'Vietnamese' | 'English';
}

interface Lesson {
  LessonId: string;
  ProgramId: string;
  LessonName: string;
  LessonOrder: number;
  Description: string;
  TargetSkill: 'Pronunciation' | 'Vocabulary' | 'Oral Motor' | 'Communication';
  EstimatedDuration: number; // minutes
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
}

interface Exercise {
  ExerciseId: string;
  ExerciseName: string;
  ExerciseType: 'Speech Recognition' | 'Interactive Card' | 'Pronunciation Guide' | 'Bouncing Match';
  ScoreToPass: number;
}

const mapLesson = (lesson: LessonResponse): Lesson => ({
  LessonId: String(lesson.id), ProgramId: String(lesson.programId),
  LessonName: lesson.lessonName, LessonOrder: lesson.lessonOrder,
  Description: lesson.description ?? '', TargetSkill: (lesson.targetSkill ?? 'Pronunciation') as Lesson['TargetSkill'],
  EstimatedDuration: lesson.estimatedDuration, Status: lesson.status,
  CreatedAt: lesson.createdAt, UpdatedAt: lesson.updatedAt ?? lesson.createdAt,
});

// Predefined Mock Programs
const MOCK_PROGRAMS: Program[] = [
  { ProgramId: 'PRG-001', ProgramName: 'Thám hiểm Đảo Khủng Long VR - Luyện Âm Tròn Vành', Language: 'Vietnamese' },
  { ProgramId: 'PRG-002', ProgramName: 'Space Language Explorer - Anh Ngữ Vũ Trụ', Language: 'English' },
  { ProgramId: 'PRG-003', ProgramName: 'Vương Quốc Âm Thanh Tranh 3D - Kể Chuyện Cổ Tích', Language: 'Vietnamese' },
  { ProgramId: 'PRG-005', ProgramName: 'Smart Phonetics Adventure - Đồ Vật & Con Vật 3D', Language: 'English' }
];

// Predefined Mock Lessons
const INITIAL_LESSONS: Lesson[] = [
  {
    LessonId: 'LSN-001',
    ProgramId: 'PRG-001',
    LessonName: 'Nhận Diện Ký Tự Nguyên Âm Đơn Sơ Khởi',
    LessonOrder: 1,
    Description: 'Lấy cảm hứng từ chú khủng long cổ dài để hướng dẫn trẻ cách mở khẩu hình tròn trịa phát âm các nguyên âm tiếng Việt A, O, E.',
    TargetSkill: 'Pronunciation',
    EstimatedDuration: 15,
    Status: 'Active',
    CreatedAt: '2026-05-10 09:00',
    UpdatedAt: '2026-05-11 11:30'
  },
  {
    LessonId: 'LSN-002',
    ProgramId: 'PRG-001',
    LessonName: 'Chinh Phục Phụ Âm Phản Xạ Lạc Lối',
    LessonOrder: 2,
    Description: 'Sửa lỗi ngọng âm N và L phổ biến thông qua việc hái các quả đào thần kỳ rải rác trên đảo trong không gian ảo 3D.',
    TargetSkill: 'Oral Motor',
    EstimatedDuration: 20,
    Status: 'Active',
    CreatedAt: '2026-05-11 10:00',
    UpdatedAt: '2026-05-11 15:40'
  },
  {
    LessonId: 'LSN-003',
    ProgramId: 'PRG-002',
    LessonName: 'Giao Tiếp Không Gian cùng Phi Hành Gia',
    LessonOrder: 1,
    Description: 'Bé đối thoại trực tiếp bằng tiếng Anh với Robot vũ trụ để rèn kỹ năng phản xạ câu ngắn và phát âm phụ âm gió S, X.',
    TargetSkill: 'Communication',
    EstimatedDuration: 25,
    Status: 'Active',
    CreatedAt: '2026-05-12 14:00',
    UpdatedAt: '2026-05-15 08:20'
  },
  {
    LessonId: 'LSN-004',
    ProgramId: 'PRG-003',
    LessonName: 'Từ Vựng Sắc Màu Cổ Tích Thần Kỳ',
    LessonOrder: 1,
    Description: 'Học hệ thống từ vựng về màu sắc thông qua lăng kính phép thuật 3D phóng lớn vật thể của mụ phù thủy tốt bụng.',
    TargetSkill: 'Vocabulary',
    EstimatedDuration: 18,
    Status: 'Active',
    CreatedAt: '2026-05-14 16:00',
    UpdatedAt: '2026-05-14 16:00'
  },
  {
    LessonId: 'LSN-005',
    ProgramId: 'PRG-001',
    LessonName: 'Uốn Lưỡi Tránh Ngọng Chữ R Nâng Cao',
    LessonOrder: 3,
    Description: 'Các bài tập thổi bong bóng nước kỹ thuật số để tạo lực đẩy hơi lưỡi thích ứng điều trị tật líu lưỡi hoặc mất hơi chữ R.',
    TargetSkill: 'Oral Motor',
    EstimatedDuration: 30,
    Status: 'Inactive',
    CreatedAt: '2026-05-15 11:15',
    UpdatedAt: '2026-05-20 17:00'
  },
  {
    LessonId: 'LSN-006',
    ProgramId: 'PRG-005',
    LessonName: 'Tên Gọi Các Bạn Động Vật Nông Trại Vui Vẻ',
    LessonOrder: 2,
    Description: 'Trò chơi kéo bóng bay ghép chữ cái tiếng Anh đầu tiên về thế giới động vật. Bé gắp thả đồ vật bằng tay cầm VR.',
    TargetSkill: 'Vocabulary',
    EstimatedDuration: 15,
    Status: 'Active',
    CreatedAt: '2026-05-20 10:00',
    UpdatedAt: '2026-05-21 09:12'
  }
];

// Mock Exercises list associated with each Lesson
const MOCK_EXERCISES_BY_LESSON: Record<string, Exercise[]> = {
  'LSN-001': [
    { ExerciseId: 'EXE-101', ExerciseName: 'Thổi gió dập lửa cùng Bé Rồng đỏ', ExerciseType: 'Pronunciation Guide', ScoreToPass: 80 },
    { ExerciseId: 'EXE-102', ExerciseName: 'Nhận diện phát âm nguyên âm đơn chuẩn xác', ExerciseType: 'Speech Recognition', ScoreToPass: 85 }
  ],
  'LSN-002': [
    { ExerciseId: 'EXE-201', ExerciseName: 'Hái táo âm L - hái sung âm N', ExerciseType: 'Interactive Card', ScoreToPass: 75 },
    { ExerciseId: 'EXE-202', ExerciseName: 'Phát âm lặp lại cụm từ "lên núi - lấy nước"', ExerciseType: 'Speech Recognition', ScoreToPass: 90 }
  ],
  'LSN-003': [
    { ExerciseId: 'EXE-301', ExerciseName: 'Chào hỏi đại sứ ngôi sao tinh vân', ExerciseType: 'Speech Recognition', ScoreToPass: 80 },
    { ExerciseId: 'EXE-302', ExerciseName: 'Tìm mảnh vỡ vũ trụ chứa âm gió /s/', ExerciseType: 'Bouncing Match', ScoreToPass: 85 }
  ],
  'LSN-004': [
    { ExerciseId: 'EXE-401', ExerciseName: 'Bầu trời bảy sắc cầu vồng của tiên nữ', ExerciseType: 'Interactive Card', ScoreToPass: 70 }
  ],
  'LSN-005': [
    { ExerciseId: 'EXE-501', ExerciseName: 'Luyện thở hơi kéo bọt xà phòng', ExerciseType: 'Pronunciation Guide', ScoreToPass: 75 }
  ],
  'LSN-006': [
    { ExerciseId: 'EXE-601', ExerciseName: 'Chăn bò sữa chuẩn giọng Mỹ', ExerciseType: 'Speech Recognition', ScoreToPass: 85 },
    { ExerciseId: 'EXE-602', ExerciseName: 'Đố vui tên động vật nông trại VR', ExerciseType: 'Bouncing Match', ScoreToPass: 80 }
  ]
};

export default function LessonManagement() {
  const { getLessons, getPrograms, createLesson, updateLesson } = useLessonManagementApi();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page of lessons on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterProgram, filterStatus]);

  // Modal systems
  const [modalType, setModalType] = useState<'add' | 'edit' | 'exercises' | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form input field state
  const [formProgramId, setFormProgramId] = useState('');
  const [formLessonName, setFormLessonName] = useState('');
  const [formLessonOrder, setFormLessonOrder] = useState<number>(1);
  const [formDesc, setFormDesc] = useState('');
  const [formTargetSkill, setFormTargetSkill] = useState<Lesson['TargetSkill']>('Pronunciation');
  const [formDuration, setFormDuration] = useState<number>(15);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  // Sparkle alert trigger helper
  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => setAlertConfig(null), 3500);
  };

  useEffect(() => {
    void Promise.all([getLessons(), getPrograms()]).then(([lessonResult, programResult]) => {
      if (lessonResult.success && lessonResult.data) setLessons(lessonResult.data.items.map(mapLesson));
      else triggerToast(lessonResult.errors.join(' ') || lessonResult.message, 'warning');
      if (programResult.success && programResult.data) {
        setPrograms(programResult.data.items.map(p => ({
          ProgramId: String(p.id),
          ProgramName: p.programName,
          Language: p.language,
        })));
      }
    });
  }, []);

  // Statistic Computations
  const totalLessons = lessons.length;
  const activeLessons = lessons.filter(l => l.Status === 'Active').length;
  
  // Calculate average duration
  const avgDuration = totalLessons > 0 
    ? Math.round(lessons.reduce((sum, l) => sum + l.EstimatedDuration, 0) / totalLessons)
    : 0;
  
  // Clean target skills count
  const targetSkillsCount = new Set(lessons.map(l => l.TargetSkill)).size;

  // Actions
  const handleToggleStatus = async (lessonId: string) => {
    const lesson = lessons.find(l => l.LessonId === lessonId);
    if (!lesson) return;
    const result = await updateLesson(Number(lessonId), { lessonName: lesson.LessonName, lessonOrder: lesson.LessonOrder, description: lesson.Description, targetSkill: lesson.TargetSkill, estimatedDuration: lesson.EstimatedDuration, status: lesson.Status === 'Active' ? 'Inactive' : 'Active' });
    if (result.success && result.data) setLessons(current => current.map(l => l.LessonId === lessonId ? mapLesson(result.data!) : l));
    else triggerToast(result.errors.join(' ') || result.message, 'warning');
  };

  const handleOpenAdd = () => {
    setFormProgramId(programs[0]?.ProgramId || '');
    setFormLessonName('');
    setFormLessonOrder(lessons.length + 1);
    setFormDesc('');
    setFormTargetSkill('Pronunciation');
    setFormDuration(15);
    setFormStatus('Active');
    setSelectedLesson(null);
    setModalType('add');
  };

  const handleOpenEdit = (les: Lesson) => {
    setSelectedLesson(les);
    setFormProgramId(les.ProgramId);
    setFormLessonName(les.LessonName);
    setFormLessonOrder(les.LessonOrder);
    setFormDesc(les.Description);
    setFormTargetSkill(les.TargetSkill);
    setFormDuration(les.EstimatedDuration);
    setFormStatus(les.Status);
    setModalType('edit');
  };

  const handleOpenExercises = (les: Lesson) => {
    setSelectedLesson(les);
    setModalType('exercises');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedLesson(null);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formProgramId) {
      triggerToast('Vui lòng chọn một chương trình học trực thuộc!', 'warning');
      return;
    }
    if (!formLessonName.trim()) {
      triggerToast('Vui lòng điền tên tiêu đề bài học!', 'warning');
      return;
    }
    if (formLessonOrder <= 0) {
      triggerToast('Thứ tự bài học phải lớn hơn 0!', 'warning');
      return;
    }
    if (!formDesc.trim()) {
      triggerToast('Hãy mô tả một vài nét cơ bản cho giáo viên biết!', 'warning');
      return;
    }
    if (formDuration < 5 || formDuration > 120) {
      triggerToast('Thời lượng ước tính lý tưởng từ 5 đến 120 phút!', 'warning');
      return;
    }

    const common = { lessonName: formLessonName.trim(), lessonOrder: formLessonOrder, description: formDesc.trim(), targetSkill: formTargetSkill, estimatedDuration: formDuration, status: formStatus };
    const result = modalType === 'add'
      ? await createLesson({ ...common, programId: Number(formProgramId) })
      : selectedLesson ? await updateLesson(Number(selectedLesson.LessonId), common) : null;
    if (result?.success && result.data) {
      const mapped = mapLesson(result.data);
      setLessons(current => modalType === 'add' ? [mapped, ...current] : current.map(l => l.LessonId === mapped.LessonId ? mapped : l));
      triggerToast(result.message);
      handleCloseModal();
    } else if (result) triggerToast(result.errors.join(' ') || result.message, 'warning');
  };

  // Filtering Search computation logic
  const filteredLessons = lessons.filter(item => {
    const program = programs.find(p => p.ProgramId === item.ProgramId);
    const searchString = `${item.LessonName} ${item.TargetSkill} ${item.LessonId}`.toLowerCase();
    
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesProgram = filterProgram === 'ALL' || item.ProgramId === filterProgram;
    const matchesStatus = filterStatus === 'ALL' || item.Status === filterStatus;

    return matchesSearch && matchesProgram && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLessons.slice(startIndex, startIndex + pageSize);
  }, [filteredLessons, currentPage, pageSize]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative" id="lesson-view-root">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="lesson-toast-box"
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

      {/* 1. Header (GodotXR Premium Kid-friendly Aesthetics) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-md text-[11px] font-bold uppercase tracking-wider leading-none">
            <BookOpen className="w-3.5 h-3.5" />
            Học phần tương tác 3D
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight font-sans">
            Quản Lý Bài Học
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Sắp xếp bài học theo kế hoạch chương trình can thiệp và gán các kỹ năng mục tiêu như Phát âm, Vốn từ vựng, Vận động môi miệng nhằm cấu hình giáo trình trực quan nhất.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-bold py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 shadow-md shadow-[#4EACAF]/10 transition-all active:scale-95 shrink-0 text-xs uppercase cursor-pointer"
          id="add-lesson-btn"
        >
          <Plus className="w-4 h-4" />
          Thêm bài học mới
        </button>
      </div>

      {/* 2. Soft pastel rounded statistic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Bài Học" 
          value={totalLessons} 
          subtitle="Giáo án lưu hành" 
          icon={<BookOpen className="w-6 h-6 text-[#4EACAF]" />} 
          bgColor="bg-teal-50"
          borderColor="border-teal-100"
        />
        <StatCard 
          title="Đang Hoạt Động" 
          value={activeLessons} 
          subtitle="Đang liên kết ở các lớp" 
          icon={<Smile className="w-6 h-6 text-emerald-500" />} 
          bgColor="bg-emerald-50"
          borderColor="border-emerald-100"
        />
        <StatCard 
          title="Thời Lượng Trung Bình" 
          value={`${avgDuration} phút`} 
          subtitle="Học giả lý thuyết & VR" 
          icon={<Clock className="w-6 h-6 text-indigo-500" />} 
          bgColor="bg-indigo-50"
          borderColor="border-indigo-100"
        />
        <StatCard 
          title="Kỹ Năng Mục Tiêu" 
          value={targetSkillsCount} 
          subtitle="Các nhóm bổ trợ khẩu hình" 
          icon={<Award className="w-6 h-6 text-[#FF8E8E]" />} 
          bgColor="bg-rose-50"
          borderColor="border-rose-100"
        />
      </div>

      {/* 3. Filter and search group */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 space-y-3">
        {/* Search Input bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm theo tên bài học, kỹ năng điều trị (Pronunciation, Vocab, Oral, Communication)..." 
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

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <select 
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/20 px-3 py-2 rounded-lg font-bold text-xs text-slate-600 outline-none cursor-pointer pr-10 uppercase focus:bg-white focus:border-[#4EACAF] transition-colors"
            >
              <option value="ALL">Mọi chương trình học</option>
              {programs.map(prog => (
                <option key={prog.ProgramId} value={prog.ProgramId}>
                  {prog.ProgramName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/20 px-3 py-2 rounded-lg font-bold text-xs text-slate-600 outline-none cursor-pointer pr-10 uppercase focus:bg-white focus:border-[#4EACAF] transition-colors"
            >
              <option value="ALL">Mọi trạng thái giáo án</option>
              <option value="Active">Đang thông qua (Active)</option>
              <option value="Inactive">Bảo lưu / Đóng (Inactive)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Interactive table list cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="lesson-table-box">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-sans tracking-tight leading-none">Chi tiết cấu trúc bài can thiệp</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Tổng hiển thị {filteredLessons.length} bài học</p>
          </div>
          <div className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
            Chào mừng: Giáo viên & Quản trị viên
          </div>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100 italic">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700 text-center font-extrabold pb-1">Không tìm thấy bài học nào cho bộ lọc hiện hành</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterProgram('ALL');
                setFilterStatus('ALL');
              }}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-[#4EACAF] font-black text-xs uppercase rounded-xl transition-all"
            >
              Hoàn tác chọn bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="lessons-table-body">
                <thead>
                  <tr className="bg-[#FDFCF5]/50 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                    <th className="py-5 px-10">Mã Số</th>
                    <th className="py-5 px-6">Thứ tự</th>
                    <th className="py-5 px-6">Tiêu đề bài học</th>
                    <th className="py-5 px-6">Chương trình liên đới</th>
                    <th className="py-5 px-6">Mục Tiêu Kỹ Năng</th>
                    <th className="py-5 px-6">Thời Lượng Quy Định</th>
                    <th className="py-5 px-6">Trạng Thái</th>
                    <th className="py-5 px-10 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {paginatedLessons.map((lesson) => {
                    const program = programs.find(p => p.ProgramId === lesson.ProgramId);

                    return (
                      <tr key={lesson.LessonId} className="hover:bg-gray-50/40 transition-colors">
                        <td className="py-5 px-10 font-mono text-gray-400 font-extrabold text-xs">
                          {lesson.LessonId}
                        </td>
                        <td className="py-5 px-6 font-black italic text-[#4EACAF] text-lg">
                          #{lesson.LessonOrder}
                        </td>
                        <td className="py-5 px-6">
                          <div className="max-w-xs font-bold space-y-1">
                            <p className="text-gray-900 font-extrabold leading-snug line-clamp-1">{lesson.LessonName}</p>
                            <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">{lesson.Description}</p>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          {program ? (
                            <div className="font-bold space-y-0.5">
                              <p className="text-gray-800 font-extrabold max-w-xs line-clamp-1">{program.ProgramName}</p>
                              <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                                {program.Language}
                              </span>
                            </div>
                          ) : (
                            <span className="text-red-500 font-bold italic text-xs">Chương trình bị xóa</span>
                          )}
                        </td>
                        <td className="py-5 px-6">
                          <SkillBadge skill={lesson.TargetSkill} />
                        </td>
                        <td className="py-5 px-6 font-extrabold text-gray-800">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{lesson.EstimatedDuration} phút</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            lesson.Status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-400 border border-transparent'
                          )}>
                            {lesson.Status === 'Active' ? '● Hoạt động' : '○ Tạm ngưng'}
                          </span>
                        </td>
                        <td className="py-5 px-10 text-right">
                          <div className="flex items-center justify-end gap-1 px-1">
                            <button 
                              onClick={() => handleToggleStatus(lesson.LessonId)}
                              className="p-2.5 hover:bg-teal-50 text-teal-600 rounded-xl transition-colors shrink-0"
                              title="Bật tắt trạng thái hoạt động nhanh"
                            >
                              {lesson.Status === 'Active' ? (
                                <ToggleRight className="w-5 h-5 text-[#4EACAF]" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-gray-300" />
                              )}
                            </button>

                            <button 
                              onClick={() => handleOpenExercises(lesson)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 text-indigo-600 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 shrink-0"
                              title="Xem chi tiết các bài thực hành"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Bài tập
                            </button>

                            <button 
                              onClick={() => handleOpenEdit(lesson)}
                              className="p-2.5 hover:bg-sky-50 text-sky-500 rounded-xl transition-all duration-150 hover:scale-105 shrink-0"
                              title="Cập nhật thông số bài học"
                            >
                              <Edit3 className="w-4.5 h-4.5" />
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
                totalItems={filteredLessons.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="bài học"
              />
            </div>
          </>
        )}
      </div>

      {/* Decorative cute quote card */}
      <div className="bg-orange-50/40 p-6 rounded-[32px] border-2 border-orange-100 max-w-xl mx-auto flex items-center gap-4">
        <Smile className="w-12 h-12 text-orange-400 fill-current shrink-0 animate-bounce" />
        <div className="space-y-1 font-bold">
          <h4 className="font-extrabold text-gray-800 text-sm">Gợi ý thiết kế lộ trình</h4>
          <p className="text-gray-500 text-xs leading-relaxed font-semibold">
            Các bài tập uốn vòm và sửa ngọng hiệu quả nhất khi được đan xen trong thời lượng từ <strong className="text-emerald-600">15 - 20 phút</strong>. Việc rèn luyện lâu trong môi trường VR có thể gây mỏi cơ của các bé nhi đồng.
          </p>
        </div>
      </div>

      {/* 5. Modal Systems */}
      <AnimatePresence>
        {modalType && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto w-full h-full" id="lesson-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30 my-8"
              id="lesson-modal-box"
            >
              {/* Modal Header banner */}
              <div className={cn(
                "px-8 py-6 flex items-center justify-between border-b",
                modalType === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' :
                modalType === 'edit' ? 'bg-sky-50 border-sky-100 text-gray-900' : 'bg-indigo-50 border-indigo-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'exercises' && <BookOpen className="w-6 h-6 text-indigo-500" />}
                    
                    {modalType === 'add' && 'Tạo phân cảnh bài học mới'}
                    {modalType === 'edit' && `Sửa thông số bài học: ${selectedLesson?.LessonId}`}
                    {modalType === 'exercises' && 'Thực nghiệm game tương tác'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Thiết lập nội dung và gán lớp kỹ năng rèn nói cho bài học'}
                    {modalType === 'edit' && 'Cập nhật lại thông tin thứ tự và thời lượng can thiệp của bài giảng'}
                    {modalType === 'exercises' && 'Chi tiết các trò chơi tương tác ảo đi kèm bài giảng'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                  id="lesson-modal-close"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal: EXERCISES sub list rendering */}
              {modalType === 'exercises' && selectedLesson ? (
                <div className="app-modal-body p-8 md:p-10 space-y-6" id="modal-exercises-view">
                  <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 flex items-center gap-4 text-indigo-700">
                    <GraduationCap className="w-10 h-10 shrink-0 text-indigo-600" />
                    <div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wider text-indigo-900">Chi tiết lộ trình bài tập bổ trợ</h4>
                      <p className="text-xs font-bold text-indigo-600/90 mt-1 leading-relaxed">
                        Danh sách bài tập tương tác ảo VR đi kèm trong giáo án <strong className="text-indigo-900">#{selectedLesson.LessonOrder}</strong> nhằm thúc đẩy sự rèn luyện tự nhiên nhất.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {(() => {
                      const exercises = MOCK_EXERCISES_BY_LESSON[selectedLesson.LessonId] || [];
                      if (exercises.length === 0) {
                        return (
                          <div className="text-center py-10 text-gray-400 italic font-bold">
                            Chưa cập nhật dữ liệu game tương tác VR cho học phần này!
                          </div>
                        );
                      }
                      return exercises.map((exe) => (
                        <div key={exe.ExerciseId} className="bg-[#FDFCF5] p-5 rounded-3xl border border-gray-100 flex items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <p className="font-extrabold text-sm text-gray-900 leading-snug">{exe.ExerciseName}</p>
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                Loại game: {exe.ExerciseType}
                              </span>
                              <span className="text-[10px] text-gray-400 font-extrabold uppercase">
                                Mã: {exe.ExerciseId}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Điểm qua môn</p>
                            <p className="text-lg font-black text-[#4EACAF]">{exe.ScoreToPass}%</p>
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
                /* Modal Body: ADD OR EDIT FORM rendering */
                <form onSubmit={handleSaveLesson} className="app-modal-body p-8 md:p-10 space-y-6" id="lesson-add-edit-form">
                  <div className="space-y-4">
                    
                    {/* Program Selection drop-down */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Chương trình học trực thuộc <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formProgramId}
                          onChange={(e) => setFormProgramId(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] text-sm"
                        >
                          {programs.map(p => (
                            <option key={p.ProgramId} value={p.ProgramId}>
                              {p.ProgramName} ({p.ProgramId})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="app-modal-form-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Lesson Name */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Tiêu đề bài học <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ví dụ: Đọc trơn tru thanh ngã, lisp sọc..." 
                          value={formLessonName}
                          onChange={(e) => setFormLessonName(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 placeholder-gray-300 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                      {/* Lesson Order */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Thứ tự bài học <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input 
                          type="number" 
                          required
                          min={1}
                          max={50}
                          value={formLessonOrder}
                          onChange={(e) => setFormLessonOrder(parseInt(e.target.value) || 1)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                    </div>

                    {/* Lesson Description */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Mô tả chi tiết bài học <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <textarea 
                        required
                        rows={3}
                        placeholder="Tóm tắt kịch bản tương tác game và phân bổ kỹ năng để phụ huynh tiện theo dõi..." 
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 placeholder-gray-300 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                      />
                    </div>

                    <div className="app-modal-form-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Target Skill badge category */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Kỹ năng bổ trợ <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={formTargetSkill}
                            onChange={(e) => setFormTargetSkill(e.target.value as Lesson['TargetSkill'])}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] text-sm"
                          >
                            <option value="Pronunciation">Pronunciation (Phát âm)</option>
                            <option value="Vocabulary">Vocabulary (Từ vựng)</option>
                            <option value="Oral Motor">Oral Motor (Hàm miệng)</option>
                            <option value="Communication">Communication (Giao tiếp)</option>
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Estimated Duration */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Thời lượng ước tính (Phút) <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input 
                          type="number" 
                          required
                          min={5}
                          max={120}
                          value={formDuration}
                          onChange={(e) => setFormDuration(parseInt(e.target.value) || 15)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                      {/* Status select */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Trạng thái giáo trình <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={formStatus}
                            onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] text-sm"
                          >
                            <option value="Active">Hoạt động (Active)</option>
                            <option value="Inactive">Tạm khóa (Inactive)</option>
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Submit and Cancel block button bar */}
                  <div className="app-modal-actions pt-6 border-t border-gray-150 flex gap-4">
                    <button 
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                    >
                      Hủy cấu hình
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/15 transition-all text-sm uppercase tracking-wider"
                      id="lesson-submit-button"
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

// Subcomponents helper
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

function StatCard({ title, value, subtitle, icon, bgColor, borderColor }: StatCardProps) {
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

// Skill Badge category selector
function SkillBadge({ skill }: { skill: Lesson['TargetSkill'] }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider",
      skill === 'Pronunciation' ? 'bg-[#4EACAF]/10 text-[#4EACAF] border border-[#4EACAF]/15' :
      skill === 'Vocabulary' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
      skill === 'Oral Motor' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
      'bg-purple-50 text-purple-600 border border-purple-100'
    )}>
      <Award className="w-3.5 h-3.5" />
      {skill === 'Pronunciation' && 'Phát âm'}
      {skill === 'Vocabulary' && 'Từ vựng'}
      {skill === 'Oral Motor' && 'Cơ môi miệng'}
      {skill === 'Communication' && 'Giao tiếp'}
    </span>
  );
}
