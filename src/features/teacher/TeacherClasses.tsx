import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Search, 
  SlidersHorizontal, 
  X, 
  CheckCircle, 
  Info, 
  Eye, 
  User, 
  Clock, 
  FileSpreadsheet, 
  TrendingUp, 
  BookOpen, 
  Activity, 
  Globe, 
  Sparkles, 
  Baby, 
  ChevronRight, 
  Smile, 
  AlertCircle,
  FolderMinus,
  Briefcase,
  PlayCircle,
  FileDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

// DB Interfaces according to project specifications
export interface Teacher {
  TeacherId: string;
  UserId: string;
  FullName: string;
  Specialty: string;
  Gender: 'Male' | 'Female' | 'Other';
  Status: 'Active' | 'Inactive';
}

export interface Classroom {
  ClassId: string;
  TeacherId: string;
  ProgramId: string;
  ClassName: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Status: 'Active' | 'Inactive' | 'Completed' | 'Upcoming';
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Program {
  ProgramId: string;
  ProgramName: string;
  Language: 'Tiếng Việt' | 'Tiếng Anh';
  TargetAgeFrom: number;
  TargetAgeTo: number;
}

export interface Enrollment {
  EnrollmentId: string;
  ChildId: string;
  ClassId: string;
  EnrollmentDate: string;
  Status: 'Enrolled' | 'Graduated' | 'Dropped';
}

export interface Child {
  ChildId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Status: 'Active' | 'Inactive';
}

// Mock Database Tables mapping out schema exactly
const MOCK_TEACHERS: Teacher[] = [
  {
    TeacherId: 'TCH-001',
    UserId: 'USR-T1',
    FullName: 'Trần Thị Hồng (Ms. Johnson)',
    Specialty: 'Phát âm cơ bản & Đồng hành rèn luyện VR',
    Gender: 'Female',
    Status: 'Active'
  },
  {
    TeacherId: 'TCH-002',
    UserId: 'USR-T2',
    FullName: 'Lê Hoàng Long',
    Specialty: 'Chậm phát âm & Ghép vần phản xạ qua VR',
    Gender: 'Male',
    Status: 'Active'
  }
];

const MOCK_PROGRAMS: Program[] = [
  { ProgramId: 'PROG-101', ProgramName: 'Phiêu lưu nông trại vui vẻ', Language: 'Tiếng Việt', TargetAgeFrom: 7, TargetAgeTo: 8 },
  { ProgramId: 'PROG-102', ProgramName: 'Sửa lỗi ngọng âm gió nâng cao', Language: 'Tiếng Việt', TargetAgeFrom: 8, TargetAgeTo: 9 },
  { ProgramId: 'PROG-103', ProgramName: 'Phản phản xạ nhanh & Ghép vần kì ảo', Language: 'Tiếng Việt', TargetAgeFrom: 7, TargetAgeTo: 10 },
  { ProgramId: 'PROG-104', ProgramName: 'VR Interactive Phonics Adventure', Language: 'Tiếng Anh', TargetAgeFrom: 7, TargetAgeTo: 11 }
];

const MOCK_CLASSROOMS: Classroom[] = [
  {
    ClassId: 'CLS-801',
    TeacherId: 'TCH-001', // Ms. Johnson
    ProgramId: 'PROG-101',
    ClassName: 'Lớp VR Phát Âm 1 - Sáng Thứ 2 & 4',
    Description: 'Lớp học rèn luyện về phát âm nguyên âm đơn phối hợp cử chỉ qua kính VR sinh động.',
    StartDate: '2026-03-01',
    EndDate: '2026-08-31',
    Status: 'Active',
    CreatedAt: '2026-02-15 08:30',
    UpdatedAt: '2026-03-01 09:00'
  },
  {
    ClassId: 'CLS-802',
    TeacherId: 'TCH-001', // Ms. Johnson
    ProgramId: 'PROG-102',
    ClassName: 'Lớp Chuyên Đề Chữa Ngọng Gió S-X',
    Description: 'Tập trung làm chủ cơ lưỡi, áp lực hơi từ họng và điều phối lực môi khi phát dải âm gió S.',
    StartDate: '2026-04-10',
    EndDate: '2026-07-10',
    Status: 'Active',
    CreatedAt: '2026-04-01 10:00',
    UpdatedAt: '2026-04-10 14:00'
  },
  {
    ClassId: 'CLS-803',
    TeacherId: 'TCH-001', // Ms. Johnson
    ProgramId: 'PROG-104',
    ClassName: 'English Phonics Explorer VR - Level 1',
    Description: 'Interactive immersion using GodotXR headsets, introducing vocabulary and basic phonemes.',
    StartDate: '2025-10-01',
    EndDate: '2026-02-15',
    Status: 'Completed',
    CreatedAt: '2025-09-15 09:00',
    UpdatedAt: '2026-02-15 16:00'
  },
  {
    ClassId: 'CLS-804',
    TeacherId: 'TCH-001', // Ms. Johnson
    ProgramId: 'PROG-103',
    ClassName: 'Khóa Tăng Tốc Phản Xạ Âm Thần Tốc',
    Description: 'Huấn luyện tăng tốc độ phát âm từ ghép thông minh qua các chặng đua 3D sống động.',
    StartDate: '2026-06-15',
    EndDate: '2026-09-15',
    Status: 'Upcoming',
    CreatedAt: '2026-05-15 11:00',
    UpdatedAt: '2026-05-15 11:00'
  },
  {
    ClassId: 'CLS-805',
    TeacherId: 'TCH-002', // Co-operating but assigned other
    ProgramId: 'PROG-103',
    ClassName: 'Vương Quốc Âm Thanh Kì Diệu',
    Description: 'Giáo án ghép vần rèn luyện tốc độ qua thực tế ảo.',
    StartDate: '2026-02-01',
    EndDate: '2026-08-01',
    Status: 'Active',
    CreatedAt: '2026-01-20 14:00',
    UpdatedAt: '2026-02-01 08:00'
  }
];

const MOCK_CHILDREN: Child[] = [
  { ChildId: 'CHD-001', FullName: 'Nguyễn Tiến Minh (Leo)', Age: 8, Gender: 'Male', LearningLevel: 'Bậc 1 - Phát âm đơn VR', Status: 'Active' },
  { ChildId: 'CHD-002', FullName: 'Trần Thảo Linh (Sophia)', Age: 7, Gender: 'Female', LearningLevel: 'Bậc 2 - Âm đôi ghép từ VR', Status: 'Active' },
  { ChildId: 'CHD-003', FullName: 'Phạm Minh Khang', Age: 9, Gender: 'Male', LearningLevel: 'Bậc 1 - Sửa ngọng S VR', Status: 'Active' },
  { ChildId: 'CHD-004', FullName: 'Hoàng Anh Thư', Age: 11, Gender: 'Female', LearningLevel: 'Bậc 2 - Ghép vần VR', Status: 'Active' },
  { ChildId: 'CHD-005', FullName: 'Lê Bảo Nam', Age: 10, Gender: 'Male', LearningLevel: 'Bậc 3 - Phản xạ nhanh VR', Status: 'Active' },
  { ChildId: 'CHD-006', FullName: 'Vũ Hải Đăng', Age: 8, Gender: 'Male', LearningLevel: 'Bậc 1 - Phát âm b, p VR', Status: 'Active' },
  { ChildId: 'CHD-007', FullName: 'Phan Khánh Ngọc', Age: 9, Gender: 'Female', LearningLevel: 'Bậc 2 - Ghép vần âm gió VR', Status: 'Active' }
];

const MOCK_ENROLLMENTS: Enrollment[] = [
  // Class 801 (Leo, Sophia, Minh Khang, Anh Thư)
  { EnrollmentId: 'ENR-001', ChildId: 'CHD-001', ClassId: 'CLS-801', EnrollmentDate: '2026-02-20', Status: 'Enrolled' },
  { EnrollmentId: 'ENR-002', ChildId: 'CHD-002', ClassId: 'CLS-801', EnrollmentDate: '2026-02-21', Status: 'Enrolled' },
  { EnrollmentId: 'ENR-003', ChildId: 'CHD-003', ClassId: 'CLS-801', EnrollmentDate: '2026-02-22', Status: 'Enrolled' },
  { EnrollmentId: 'ENR-004', ChildId: 'CHD-004', ClassId: 'CLS-801', EnrollmentDate: '2026-02-25', Status: 'Enrolled' },

  // Class 802 (Leo, Sophia, Khánh Ngọc)
  { EnrollmentId: 'ENR-005', ChildId: 'CHD-001', ClassId: 'CLS-802', EnrollmentDate: '2026-04-05', Status: 'Enrolled' },
  { EnrollmentId: 'ENR-006', ChildId: 'CHD-002', ClassId: 'CLS-802', EnrollmentDate: '2026-04-06', Status: 'Enrolled' },
  { EnrollmentId: 'ENR-007', ChildId: 'CHD-007', ClassId: 'CLS-802', EnrollmentDate: '2026-04-08', Status: 'Enrolled' },

  // Class 803 (Bảo Nam, Hải Đăng)
  { EnrollmentId: 'ENR-008', ChildId: 'CHD-005', ClassId: 'CLS-803', EnrollmentDate: '2025-09-20', Status: 'Graduated' },
  { EnrollmentId: 'ENR-009', ChildId: 'CHD-006', ClassId: 'CLS-803', EnrollmentDate: '2025-09-22', Status: 'Graduated' },

  // Class 804 (Anh Thư, Khánh Ngọc)
  { EnrollmentId: 'ENR-010', ChildId: 'CHD-004', ClassId: 'CLS-804', EnrollmentDate: '2026-05-20', Status: 'Enrolled' },
  { EnrollmentId: 'ENR-011', ChildId: 'CHD-007', ClassId: 'CLS-804', EnrollmentDate: '2026-05-22', Status: 'Enrolled' }
];

// Custom simulated learning scores for students inside classrooms
const MOCK_STUDENT_PERFORMANCE_SCORES: Record<string, { childId: string; avgScore: number; completionRate: number; keyFocus: string }> = {
  'CHD-001': { childId: 'CHD-001', avgScore: 92, completionRate: 95, keyFocus: 'Bộ vần nguyên âm kép và phản xạ VR ổn định' },
  'CHD-002': { childId: 'CHD-002', avgScore: 94, completionRate: 100, keyFocus: 'Vượt trích âm dốc họng, khẩu hình mở đứng tốt' },
  'CHD-003': { childId: 'CHD-003', avgScore: 68, completionRate: 75, keyFocus: 'Vẫn lẫn phụ âm gió S & L nhịp trung bình' },
  'CHD-004': { childId: 'CHD-004', avgScore: 85, completionRate: 90, keyFocus: 'Khá nhỏ giọng mộc nhưng phát tròn âm' },
  'CHD-005': { childId: 'CHD-005', avgScore: 55, completionRate: 50, keyFocus: 'Mỏi cơ hàm sớm, cần can thiệp dãn bài' },
  'CHD-006': { childId: 'CHD-006', avgScore: 88, completionRate: 92, keyFocus: 'Bật được âm b mạnh, phụ âm p còn nông hơi' },
  'CHD-007': { childId: 'CHD-007', avgScore: 90, completionRate: 95, keyFocus: 'Ghép vần tốc độ tốt, nhạy thính giác' }
};

interface TeacherClassesProps {
  onNavigate?: (screen: string) => void;
}

export default function TeacherClasses({ onNavigate }: TeacherClassesProps) {
  // Use active Teacher - TCH-001 (Ms. Johnson) as the current logged-in role
  const activeTeacher = MOCK_TEACHERS[0];

  // Dynamic state selectors and searches
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterLanguage, setFilterLanguage] = useState<string>('ALL');

  // Interactive UI modals state
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [modalType, setModalType] = useState<'DETAILS' | 'STUDENTS' | 'PERFORMANCE' | 'REPORT' | null>(null);

  // Simulated state for report generation progress bar
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Floating feedback notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper mappings
  const getProgramInfo = (id: string): Program => {
    return MOCK_PROGRAMS.find(p => p.ProgramId === id) || {
      ProgramId: id,
      ProgramName: 'Chương trình rèn luyện phát âm VR',
      Language: 'Tiếng Việt',
      TargetAgeFrom: 7,
      TargetAgeTo: 11
    };
  };

  const getEnrolledChildrenInClass = (classId: string): Child[] => {
    const kidIds = MOCK_ENROLLMENTS
      .filter(e => e.ClassId === classId)
      .map(e => e.ChildId);
    return MOCK_CHILDREN.filter(c => kidIds.includes(c.ChildId));
  };

  // 2. FILTERED CLASSROOM LIST FOR TEACHER
  // Shows classes assigned to the specific teacher (TCH-001)
  const teacherClassesList = useMemo(() => {
    return MOCK_CLASSROOMS.filter(c => {
      // Must be assigned to this teacher
      if (c.TeacherId !== activeTeacher.TeacherId) return false;

      // Filter by status active-inactive-completed
      if (filterStatus !== 'ALL' && c.Status !== filterStatus) return false;

      // Filter by language type
      const prog = getProgramInfo(c.ProgramId);
      if (filterLanguage !== 'ALL' && prog.Language !== filterLanguage) return false;

      // Filter by textbox search
      const keyword = searchQuery.toLowerCase();
      const textToMatch = `${c.ClassName} ${prog.ProgramName} ${c.ClassId} ${c.Description}`.toLowerCase();
      if (searchQuery && !textToMatch.includes(keyword)) return false;

      return true;
    });
  }, [filterStatus, filterLanguage, searchQuery, activeTeacher.TeacherId]);

  // STATISTICAL QUANTIFIERS CALCULATOR (Deriving from entire assigned portfolio of this teacher)
  const stats = useMemo(() => {
    const totalClassesOwned = MOCK_CLASSROOMS.filter(c => c.TeacherId === activeTeacher.TeacherId).length;
    const activeClassesOwned = MOCK_CLASSROOMS.filter(c => c.TeacherId === activeTeacher.TeacherId && c.Status === 'Active').length;
    
    // Get distinct students enrolled across all of this teacher's classes
    const classIdsOwned = MOCK_CLASSROOMS.filter(c => c.TeacherId === activeTeacher.TeacherId).map(c => c.ClassId);
    const childrenIdsEnrolled = MOCK_ENROLLMENTS
      .filter(e => classIdsOwned.includes(e.ClassId))
      .map(e => e.ChildId);
    const uniqueChildrenCount = Array.from(new Set(childrenIdsEnrolled)).length;

    // Simulated homework assignments completed during current educational cycle
    const mockCompletedExercisesThisWeek = uniqueChildrenCount * 6 + 14;

    return {
      totalClassesOwned,
      activeClassesOwned,
      uniqueChildrenCount,
      mockCompletedExercisesThisWeek
    };
  }, [activeTeacher.TeacherId]);

  // Handle mock class report generation sequence
  const executeSimulatedReportGeneration = () => {
    if (!selectedClass) return;
    setIsGeneratingReport(true);
    setGenerationProgress(10);
    showToast(`Đang quét dải âm phổ, tổng hợp học hiệu cho lớp ${selectedClass.ClassName}...`, 'info');

    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGeneratingReport(false);
            setGenerationProgress(0);
            showToast(`Tuyệt vời! Kết xút báo cáo lớp học ${selectedClass.ClassName} hoàn tất!`, 'success');
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 455);
  };

  const getStatusBadgeStyle = (status: Classroom['Status']) => {
    const mapping: Record<Classroom['Status'], { bg: string; text: string; dot: string; label: string }> = {
      Active: { bg: 'bg-[#F2FAF4] text-[#34A853] border-emerald-100', text: 'text-[#34A853]', dot: 'bg-[#34A853]', label: 'Đang mở' },
      Inactive: { bg: 'bg-gray-100 text-gray-500 border-gray-200', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Không hoạt động' },
      Completed: { bg: 'bg-[#F2FAFB] text-[#20D0D4] border-cyan-100', text: 'text-[#20D0D4]', dot: 'bg-[#20D0D4]', label: 'Đã bế mạc' },
      Upcoming: { bg: 'bg-[#FFF9EE] text-[#FFA800] border-amber-100', text: 'text-[#FFA800]', dot: 'bg-[#FFA800]', label: 'Sắp diễn ra' },
    };
    return mapping[status] || { bg: 'bg-gray-50 text-gray-500 border-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: status };
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative text-left" id="teacher-classes-view">
      
      {/* Toast Overlay notification alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="classes-toast-floating"
          >
            <div className={cn(
              "px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 border-2 border-white backdrop-blur-md font-bold text-white text-sm tracking-wide leading-snug",
              toastMessage.type === 'success' ? 'bg-[#4EACAF]/95' : toastMessage.type === 'info' ? 'bg-indigo-600/95' : 'bg-[#FF8E8E]/95'
            )}>
              <div className="bg-white/20 p-2 rounded-xl shrink-0">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : toastMessage.type === 'warn' ? (
                  <AlertCircle className="w-5 h-5 text-white" />
                ) : (
                  <Activity className="w-5 h-5 text-white animate-pulse" />
                )}
              </div>
              <p className="flex-1 min-w-0 font-extrabold italic">{toastMessage.text}</p>
              <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled Dashboard Header emphasizing specialized Early Intervention classes */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-md text-[11px] font-bold uppercase tracking-wider leading-none">
            <GraduationCap className="w-3.5 h-3.5" />
            Giám sát sư phạm lớp học VR
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight font-sans">
            Lớp Học Của Tôi
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Quản lý kế hoạch bài học, điều phối hoạt động rèn luyện và theo dõi sát kết quả luyện tập của từng lớp học do bạn trực tiếp phụ trách.
          </p>
        </div>

        {/* Teacher profile snapshot */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm self-start md:self-center shrink-0">
          <div className="w-10 h-10 bg-[#FF8E8E]/10 text-[#FF8E8E] rounded-lg flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-slate-705 leading-tight">{activeTeacher.FullName}</h5>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{activeTeacher.Specialty}</p>
          </div>
        </div>
      </div>

      {/* Children-friendly informative statement panel */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-3 text-xs font-medium leading-relaxed text-slate-550">
        <Info className="w-5 h-5 text-[#4EACAF] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-slate-700 font-bold uppercase text-[10px] tracking-wider">Lưu ý chuyên môn của giáo viên:</p>
          <span>Dữ liệu phục vụ mục đích tham khảo cho học viên và cha mẹ trong quá trình rèn luyện trên phòng phát âm 3D GodotXR. Hệ thống không thay thế các chẩn đoán điều trị y khoa.</span>
        </div>
      </div>

      {/* 2. Statistic indicators block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total assigned classes */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center shrink-0 text-[#4EACAF]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 tracking-tight leading-none">{stats.totalClassesOwned}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Lớp phụ trách</p>
          </div>
        </div>

        {/* Unique kids counts */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center shrink-0 text-[#FF8E8E]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 tracking-tight leading-none">{stats.uniqueChildrenCount} học sinh</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Học sinh lớp tôi</p>
          </div>
        </div>

        {/* Currently actively run classes */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0 text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600 tracking-tight leading-none">{stats.activeClassesOwned}/{stats.totalClassesOwned}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Đang hoạt động</p>
          </div>
        </div>

        {/* Weekly completed lesson cycles */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center shrink-0 text-indigo-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 tracking-tight leading-none">{stats.mockCompletedExercisesThisWeek}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Hoàn thành tuần này</p>
          </div>
        </div>

      </div>

      {/* 3. Search and Multi-filter segment for Classes */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3" id="classes-search-block">
        
        {/* Search Input box */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm lớp học của bạn theo tên lớp hoặc giáo án VR (Ví dụ: Phát Âm 1, Chữa Ngọng...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-250 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
              title="Hủy từ tìm kiếm"
            >
              <X className="w-3.5 h-3.5 text-slate-400 text-gray-500 hover:text-rose-500" />
            </button>
          )}
        </div>

        {/* Classroom status dropdown filter */}
        <div className="relative w-full md:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/20 pl-4 pr-10 py-2.5 rounded-lg font-bold text-xs text-slate-600 outline-none cursor-pointer uppercase focus:bg-white focus:border-[#4EACAF]"
          >
            <option value="ALL">MỌI TRẠNG THÁI</option>
            <option value="Active">ĐANG HOẠT ĐỘNG</option>
            <option value="Upcoming">SẮP DIỄN RA</option>
            <option value="Completed">ĐÃ HOÀN THÀNH</option>
          </select>
          <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Program language dropdown filter */}
        <div className="relative w-full md:w-48">
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/20 pl-4 pr-10 py-2.5 rounded-lg font-bold text-xs text-slate-600 outline-none cursor-pointer uppercase focus:bg-white focus:border-[#4EACAF]"
          >
            <option value="ALL">MỌI NGÔN NGỮ</option>
            <option value="Tiếng Việt">TIẾNG VIỆT 🇻🇳</option>
            <option value="Tiếng Anh">TIẾNG ANH 🇺🇸</option>
          </select>
          <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Clear query parameters click */}
        {(searchQuery || filterStatus !== 'ALL' || filterLanguage !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('ALL');
              setFilterLanguage('ALL');
              showToast('Đặt lại tất cả màng lọc!', 'info');
            }}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            Xóa lọc
          </button>
        )}

      </div>

      {/* 4. Beautiful Interactive Class Card Grid */}
      {teacherClassesList.length === 0 ? (
        <div className="bg-white rounded-[40px] p-24 text-center space-y-4 shadow-sm border border-gray-150">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100/90">
            <FolderMinus className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-xl font-black text-gray-700">Không tìm thấy lớp học rèn luyện VR nào!</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">Vui lòng rà soát lại các bộ lọc tìm kiếm hoặc dãn dải từ tìm kiếm để kiểm duyệt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="classroom-cards-grid">
          {teacherClassesList.map((classroom) => {
            const program = getProgramInfo(classroom.ProgramId);
            const enrolledKids = getEnrolledChildrenInClass(classroom.ClassId);
            const statusDetail = getStatusBadgeStyle(classroom.Status);

            return (
              <motion.div
                key={classroom.ClassId}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[36px] overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                {/* Visual Accent Top Bar matched by language */}
                <div className={cn(
                  "h-2.5 w-full",
                  program.Language === 'Tiếng Anh' ? 'bg-indigo-400' : 'bg-[#4EACAF]'
                )} />

                {/* Card Body */}
                <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                  
                  {/* Class Identity & Language badge */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-md font-mono font-black uppercase">
                        Mã lớp: {classroom.ClassId}
                      </span>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border",
                        statusDetail.bg
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", statusDetail.dot)} />
                        {statusDetail.label}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight italic hover:text-[#4EACAF] transition-colors">
                      {classroom.ClassName}
                    </h3>

                    <p className="text-xs text-gray-400/95 font-semibold line-clamp-2 min-h-[32px]">
                      {classroom.Description}
                    </p>
                  </div>

                  {/* Program Reference Block */}
                  <div className="bg-[#FDFCF5] p-4.5 rounded-2xl border border-yellow-50 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-600">
                      <Sparkles className="w-4.5 h-4.5 text-[#FFA800]" />
                      Trình giáo án: &ldquo;{program.ProgramName}&rdquo;
                    </div>
                    <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-[11px] font-bold text-gray-500">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        Ngôn ngữ: {program.Language}
                      </span>
                      <span>•</span>
                      <span>Độ tuổi can thiệp: {program.TargetAgeFrom} - {program.TargetAgeTo} tuổi</span>
                    </div>
                  </div>

                  {/* Students and timeline details metrics row */}
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-5">
                    
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Thời điểm niên khóa:</span>
                      <span className="text-xs text-gray-600 font-bold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#4EACAF]" />
                        {classroom.StartDate}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Sĩ số lớp:</span>
                      <span className="text-xs text-gray-700 font-extrabold flex items-center gap-1.5">
                        <Baby className="w-3.5 h-3.5 text-[#FF8E8E]" />
                        {enrolledKids.length} Học sinh
                      </span>
                    </div>

                  </div>

                </div>

                {/* Actions Bottom Bar inside nice soft wrapper */}
                <div className="bg-gray-50/50 border-t border-gray-50 px-8 py-5.5 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5">
                  
                  {/* View info details modal trigger */}
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate(`TEACHER_CLASS_DETAIL:${classroom.ClassId}`);
                      } else {
                        setSelectedClass(classroom);
                        setModalType('DETAILS');
                        showToast(`Đã mở mô tả biên chế lớp ${classroom.ClassName}`, 'info');
                      }
                    }}
                    className="py-2.5 px-3 bg-white hover:bg-gray-100 text-gray-600 border border-gray-150 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Mô tả thông số chi tiết"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Mô tả thông số chi tiết
                  </button>

                  {/* View direct student enrollment modal trigger */}
                  <button
                    onClick={() => {
                      setSelectedClass(classroom);
                      setModalType('STUDENTS');
                      showToast(`Khởi tạo danh sách học viên lớp ${classroom.ClassName}`, 'success');
                    }}
                    className="py-2.5 px-3 bg-[#4EACAF]/10 hover:bg-[#4EACAF] text-[#4EACAF] hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Xem học sinh
                  </button>

                  {/* View learning results scores performance simulator */}
                  <button
                    onClick={() => {
                      setSelectedClass(classroom);
                      setModalType('PERFORMANCE');
                      showToast(`Trực quan dải điểm trung bình cho lớp ${classroom.ClassId}`, 'info');
                    }}
                    className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Xem kết quả
                  </button>

                  {/* Simulate detailed custom teacher progress class analysis assessment report */}
                  <button
                    onClick={() => {
                      setSelectedClass(classroom);
                      setModalType('REPORT');
                    }}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-[#FF8E8E] text-[#FF8E8E] hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Tạo báo cáo
                  </button>

                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* 5. PORTFOLIO OF ACTION INTERACTIVE OVERLAY MODALS */}
      <AnimatePresence>
        {selectedClass && modalType && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/15 animate-in fade-in duration-300 overflow-y-auto w-full h-full">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col my-8"
              id="classes-action-modal"
            >
              
              {/* Header mapped dynamically */}
              <div className="bg-[#E2F2F3] px-8 py-6 flex items-center justify-between border-b border-[#C5E1E3] text-gray-900">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 bg-[#4EACAF] text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {modalType === 'DETAILS' && 'Thông tin lớp học'}
                    {modalType === 'STUDENTS' && 'Danh sách mầm học'}
                    {modalType === 'PERFORMANCE' && 'Dải phân tích điểm số'}
                    {modalType === 'REPORT' && 'Kết xuất báo cáo can thiệp'}
                  </span>
                  <h2 className="text-xl font-black italic tracking-tight leading-tight">
                    {selectedClass.ClassName}
                  </h2>
                </div>
                <button 
                  onClick={() => {
                    setSelectedClass(null);
                    setModalType(null);
                  }} 
                  className="p-2 hover:bg-white/50 rounded-full transition-colors shrink-0"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* MODAL BODY CASES */}
              
              {/* Case 1: Broad details description */}
              {modalType === 'DETAILS' && (
                <div className="app-modal-body p-8 space-y-6 text-left">
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Mô tả mục tiêu trị âm:</h4>
                    <p className="text-sm font-bold text-gray-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border">
                      {selectedClass.Description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#FDFCF5] p-4.5 rounded-xl border">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Mã kịch bản giáo trình</span>
                      <strong className="text-[#264E50]">{getProgramInfo(selectedClass.ProgramId).ProgramName}</strong>
                    </div>

                    <div className="bg-[#FDFCF5] p-4.5 rounded-xl border">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Thời hạn hoàn khóa</span>
                      <span className="text-xs font-black text-gray-600 block mt-1">
                        Từ ngày {selectedClass.StartDate} đến {selectedClass.EndDate}
                      </span>
                    </div>

                    <div className="bg-[#FDFCF5] p-4.5 rounded-xl border">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Môi trường ngôn ngữ</span>
                      <strong className="text-[#FF8E8E]">{getProgramInfo(selectedClass.ProgramId).Language}</strong>
                    </div>

                    <div className="bg-[#FDFCF5] p-4.5 rounded-xl border">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Tổng thời lượng niên khóa</span>
                      <span className="text-xs font-black text-gray-600 block mt-1">
                        180 ngày học tương thích thực tế ảo
                      </span>
                    </div>

                  </div>

                </div>
              )}

              {/* Case 2: List of Students */}
              {modalType === 'STUDENTS' && (
                <div className="app-modal-body p-8 space-y-4 max-h-[50vh] overflow-y-auto">
                  
                  <div className="flex items-center justify-between border-b pb-3 text-xs font-black text-gray-400 uppercase">
                    <span>Học viên rèn luyện</span>
                    <span>Tuổi & Trình độ</span>
                  </div>

                  {getEnrolledChildrenInClass(selectedClass.ClassId).length === 0 ? (
                    <p className="text-center py-12 text-sm text-gray-400 font-semibold italic">Không ghi nhận học sinh nào đang tham gia lớp này.</p>
                  ) : (
                    getEnrolledChildrenInClass(selectedClass.ClassId).map((kid) => (
                      <div key={kid.ChildId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#FF8E8E]/10 text-[#FF8E8E] rounded-xl flex items-center justify-center shrink-0">
                            <Baby className="w-5.5 h-5.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-gray-800 block">{kid.FullName}</span>
                            <span className="text-[10px] bg-[#4EACAF]/10 text-[#4EACAF] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1 inline-block">
                              Mức tập: {kid.LearningLevel}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-gray-500 font-extrabold block">Tuổi: {kid.Age}t</span>
                          <span className="text-[10px] text-gray-400 font-medium block">ID: {kid.ChildId}</span>
                        </div>
                      </div>
                    ))
                  )}

                </div>
              )}

              {/* Case 3: Performance Results */}
              {modalType === 'PERFORMANCE' && (
                <div className="app-modal-body p-8 space-y-6 text-left max-h-[50vh] overflow-y-auto">
                  
                  <div className="space-y-4">
                    {getEnrolledChildrenInClass(selectedClass.ClassId).map((kid) => {
                      const perf = MOCK_STUDENT_PERFORMANCE_SCORES[kid.ChildId] || { avgScore: 80, completionRate: 85, keyFocus: 'Tiến triển lành mạnh' };
                      
                      return (
                        <div key={kid.ChildId} className="space-y-2 border-b border-gray-50 pb-4">
                          
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-black text-gray-800">{kid.FullName}</span>
                            <span className="font-black text-[#4EACAF]">{perf.avgScore}/100 Điểm cơ bản</span>
                          </div>

                          {/* Interactive score progress row */}
                          <div className="relative">
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  perf.avgScore >= 85 ? 'bg-emerald-500' : perf.avgScore >= 60 ? 'bg-[#ffa800]' : 'bg-rose-500'
                                )}
                                style={{ width: `${perf.avgScore}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                            <span>Tất vụ hoàn thành: {perf.completionRate}%</span>
                            <span className="truncate max-w-[280px] italic">Can thiệp chính: {perf.keyFocus}</span>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Case 4: Class Analysis Report download simulator */}
              {modalType === 'REPORT' && (
                <div className="app-modal-body p-8 space-y-6 text-center">
                  
                  <div className="w-16 h-16 bg-[#FFF2F2] rounded-full flex items-center justify-center mx-auto text-[#FF8E8E] border-2 border-dashed border-[#FF8E8E]/40">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h4 className="text-base font-black text-gray-800">Khởi chế dải hồ sơ hiệu suất học tập VR!</h4>
                    <p className="text-xs text-gray-400">
                      Hệ thống tự động biên soạn và chắp bút dải nhận xét, so mẫu giọng mộc học sinh với phổ chuẩn và lưu trữ dưới dạng bảng danh mục PDF.
                    </p>
                  </div>

                  <div className="bg-[#FFFDF5] p-4.5 rounded-2xl border border-yellow-105 text-left text-xs font-semibold text-gray-600 block">
                    <strong className="text-gray-800 font-extrabold uppercase text-[10px] block mb-1">Cấu kiện bao gồm:</strong>
                    - Biểu đồ điểm bình quân 6 học đường gần nhất.<br />
                    - Thư nhận xét gợi ý chỉnh âm cho từng phụ huynh.<br />
                    - Thẻ hỗ trợ rèn uốn phụ âm phát âm trực quan.
                  </div>

                  {/* Simulator progress bar if active */}
                  {isGeneratingReport && (
                    <div className="space-y-2 animate-pulse">
                      <div className="flex justify-between text-[11px] font-black text-[#4EACAF] uppercase tracking-wider">
                        <span>Đang xử lý biểu mộc...</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#4EACAF] transition-all duration-300" style={{ width: `${generationProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Download simulated action */}
                  {!isGeneratingReport && (
                    <button
                      onClick={executeSimulatedReportGeneration}
                      className="w-full py-3.5 bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      Yêu cầu kết xuất (.PDF)
                    </button>
                  )}

                </div>
              )}

              {/* Modal footer footer */}
              <div className="bg-gray-50 px-8 py-5 flex items-center justify-end border-t border-gray-100 gap-3">
                <button
                  onClick={() => {
                    setSelectedClass(null);
                    setModalType(null);
                  }}
                  className="px-5 py-2.5 bg-[#264E50] hover:bg-[#1E3B3D] text-white rounded-2xl text-xs font-black transition-colors"
                >
                  Đóng lại
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
