import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  FileSpreadsheet, 
  Baby, 
  ChevronRight, 
  Search, 
  X, 
  Award, 
  Info, 
  Calendar, 
  Smile, 
  ShieldAlert, 
  BookOpen, 
  Activity, 
  ArrowLeft,
  Filter,
  Eye,
  History,
  FileDown,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { cn } from '../../lib/utils';

// DB Interfaces according to specifications
export interface Classroom {
  ClassId: string;
  TeacherId: string;
  ProgramId: string;
  ClassName: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Status: 'Active' | 'Inactive' | 'Completed' | 'Upcoming';
}

export interface Program {
  ProgramId: string;
  ProgramName: string;
  Description: string;
  Language: 'Tiếng Việt' | 'Tiếng Anh';
}

export interface Child {
  ChildId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Status: 'Active' | 'Inactive';
}

export interface Enrollment {
  EnrollmentId: string;
  ChildId: string;
  ClassId: string;
  EnrollmentDate: string;
  Status: 'Enrolled' | 'Graduated' | 'Dropped';
}

export interface Result {
  ResultId: string;
  ChildId: string;
  ExerciseId: string;
  CompletionStatus: 'Completed' | 'Incomplete' | 'Failed';
  Score: number;
  DurationSeconds: number;
  CreatedAt: string;
}

export interface Analysis {
  AnalysisId: string;
  ChildId: string;
  AverageScore: number;
  ProgressLevel: 'Improving' | 'Stable' | 'Need Support';
  Recommendation: string;
}

// Mock Database Tables mapping out schema exactly
const MOCK_CLASSROOMS: Classroom[] = [
  {
    ClassId: 'CLS-801',
    TeacherId: 'TCH-001',
    ProgramId: 'PROG-101',
    ClassName: 'Lớp VR Phát Âm 1 - Sáng Thứ 2 & 4',
    Description: 'Lớp học rèn luyện về phát âm nguyên âm đơn phối hợp cử chỉ qua kính VR sinh động.',
    StartDate: '2026-03-01',
    EndDate: '2026-08-31',
    Status: 'Active'
  },
  {
    ClassId: 'CLS-802',
    TeacherId: 'TCH-001',
    ProgramId: 'PROG-102',
    ClassName: 'Lớp Chuyên Đề Chữa Ngọng Gió S-X',
    Description: 'Tập trung làm chủ cơ lưỡi, áp lực hơi từ họng và điều phối lực môi khi phát dải âm gió S.',
    StartDate: '2026-04-10',
    EndDate: '2026-07-10',
    Status: 'Active'
  }
];

const MOCK_PROGRAMS: Program[] = [
  {
    ProgramId: 'PROG-101',
    ProgramName: 'Phiêu lưu nông trại vui vẻ',
    Description: 'Giáo án tương tác nhập vai thực tế ảo 3D giúp học sinh nhận diện và tập bật hơi tự nhiên các phụ âm b, m, n, p phối hợp các nguyên âm đơn giản. Tối ưu nhịp thở và điều phối cơ mặt.',
    Language: 'Tiếng Việt'
  },
  {
    ProgramId: 'PROG-102',
    ProgramName: 'Sửa lỗi ngọng âm gió nâng cao',
    Description: 'Chương trình huấn luyện đặc hiệu rèn khẩu hình lưỡi, ép hơi và tránh nói rít dẹt dải âm. Thích hợp cho trẻ từ 7-11 tuổi để cải thiện phát âm hiệu quả.',
    Language: 'Tiếng Việt'
  }
];

const MOCK_CHILDREN: Child[] = [
  { ChildId: 'CHD-001', FullName: 'Nguyễn Tiến Minh (Leo)', Age: 8, Gender: 'Male', LearningLevel: 'Bậc 1 - Phát âm đơn VR', Status: 'Active' },
  { ChildId: 'CHD-002', FullName: 'Trần Thảo Linh (Sophia)', Age: 7, Gender: 'Female', LearningLevel: 'Bậc 2 - Âm đôi ghép từ VR', Status: 'Active' },
  { ChildId: 'CHD-003', FullName: 'Phạm Minh Khang', Age: 9, Gender: 'Male', LearningLevel: 'Bậc 1 - Sửa ngọng S VR', Status: 'Active' },
  { ChildId: 'CHD-004', FullName: 'Hoàng Anh Thư', Age: 11, Gender: 'Female', LearningLevel: 'Bậc 2 - Ghép vần VR', Status: 'Active' }
];

const MOCK_ENROLLMENT: Enrollment[] = [
  { EnrollmentId: 'ENR-001', ChildId: 'CHD-001', ClassId: 'CLS-801', EnrollmentDate: '2026-02-20', Status: 'Enrolled' },
  { EnrollmentId: 'ENR-002', ChildId: 'CHD-002', ClassId: 'CLS-801', EnrollmentDate: '2026-02-21', Status: 'Enrolled' },
  { EnrollmentId: 'ENR-003', ChildId: 'CHD-003', ClassId: 'CLS-801', EnrollmentDate: '2026-02-22', Status: 'Enrolled' },
  { EnrollmentId: 'ENR-004', ChildId: 'CHD-004', ClassId: 'CLS-801', EnrollmentDate: '2026-02-25', Status: 'Enrolled' }
];

const MOCK_RESULTS: Result[] = [
  { ResultId: 'RES-101', ChildId: 'CHD-001', ExerciseId: 'EX-农-01', CompletionStatus: 'Completed', Score: 95, DurationSeconds: 120, CreatedAt: '2026-05-29 08:32' },
  { ResultId: 'RES-102', ChildId: 'CHD-001', ExerciseId: 'EX-农-02', CompletionStatus: 'Completed', Score: 88, DurationSeconds: 150, CreatedAt: '2026-05-30 09:12' },
  { ResultId: 'RES-103', ChildId: 'CHD-002', ExerciseId: 'EX-农-01', CompletionStatus: 'Completed', Score: 100, DurationSeconds: 110, CreatedAt: '2026-05-29 14:15' },
  { ResultId: 'RES-104', ChildId: 'CHD-003', ExerciseId: 'EX-风-01', CompletionStatus: 'Incomplete', Score: 45, DurationSeconds: 90, CreatedAt: '2026-05-28 10:04' },
  { ResultId: 'RES-105', ChildId: 'CHD-004', ExerciseId: 'EX-农-01', CompletionStatus: 'Completed', Score: 85, DurationSeconds: 135, CreatedAt: '2026-05-31 10:20' }
];

const MOCK_ANALYSES: Analysis[] = [
  { AnalysisId: 'ANA-001', ChildId: 'CHD-001', AverageScore: 91.5, ProgressLevel: 'Improving', Recommendation: 'Khuyến nghị tăng tương tác các cụm âm đôi để duy trì phản xạ.' },
  { AnalysisId: 'ANA-002', ChildId: 'CHD-002', AverageScore: 97.0, ProgressLevel: 'Improving', Recommendation: 'Chúc mừng thành tích tuyệt đối! Sẵn sàng cho dải giáo án bậc 3.' },
  { AnalysisId: 'ANA-003', ChildId: 'CHD-003', AverageScore: 56.5, ProgressLevel: 'Need Support', Recommendation: 'Cần hạ độ khó dòng game, hỗ trợ cơ hàm uốn chậm lại.' },
  { AnalysisId: 'ANA-004', ChildId: 'CHD-004', AverageScore: 85.0, ProgressLevel: 'Stable', Recommendation: 'Tập nói lớn hơn trước micro mộc để bù dải sóng yếu hơi.' }
];

interface TeacherClassDetailProps {
  classId?: string;
  onNavigate?: (screen: string) => void;
}

export default function TeacherClassDetail({ classId = 'CLS-801', onNavigate }: TeacherClassDetailProps) {
  // Find current active classroom
  const [currentClassroomId, setCurrentClassroomId] = useState<string>(classId);
  const activeClass = useMemo(() => {
    return MOCK_CLASSROOMS.find(c => c.ClassId === currentClassroomId) || MOCK_CLASSROOMS[0];
  }, [currentClassroomId]);

  // Find associated program info
  const programInfo = useMemo(() => {
    return MOCK_PROGRAMS.find(p => p.ProgramId === activeClass.ProgramId) || MOCK_PROGRAMS[0];
  }, [activeClass]);

  // Find enrolled children for the active classes
  const childrenInClass = useMemo(() => {
    const childIds = MOCK_ENROLLMENT
      .filter(e => e.ClassId === activeClass.ClassId)
      .map(e => e.ChildId);
    return MOCK_CHILDREN.filter(c => childIds.includes(c.ChildId));
  }, [activeClass]);

  // Recent results filtered inside child workspace
  const classResults = useMemo(() => {
    const childIds = childrenInClass.map(c => c.ChildId);
    return MOCK_RESULTS.filter(r => childIds.includes(r.ChildId));
  }, [childrenInClass]);

  // Performance computations for overview cards
  const summaryMetrics = useMemo(() => {
    const totalKids = childrenInClass.length;
    
    // Average score
    const scores = classResults.map(r => r.Score);
    const avgClassScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) 
      : 85;

    // Total practice time in minutes
    const totalPracticeSeconds = classResults.reduce((sum, r) => sum + r.DurationSeconds, 0);
    const totalPracticeMinutes = Math.round(totalPracticeSeconds / 60);

    // Completion rate of homework lessons
    const completedCount = classResults.filter(r => r.CompletionStatus === 'Completed').length;
    const completionRate = classResults.length > 0 
      ? Math.round((completedCount / classResults.length) * 100) 
      : 90;

    return {
      totalKids,
      avgClassScore,
      totalPracticeMinutes,
      completionRate
    };
  }, [childrenInClass, classResults]);

  // Dynamic Tabs control state
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'RESULTS' | 'ANALYSES' | 'PROGRAM'>('STUDENTS');

  // Interactive filtering variables
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedProgressFilter, setSelectedProgressFilter] = useState<string>('ALL');

  // Floating notifications state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Safe fetch analysis data based on child
  const getAnalysisForChild = (childId: string): Analysis => {
    return MOCK_ANALYSES.find(a => a.ChildId === childId) || {
      AnalysisId: 'ANA-NEW',
      ChildId: childId,
      AverageScore: 80,
      ProgressLevel: 'Stable',
      Recommendation: 'Khuyến nghị giữ tốc độ học đều đặn hàng tuần.'
    };
  };

  // Helper mappings child details in list queries
  const getChildInfo = (id: string): Child => {
    return MOCK_CHILDREN.find(c => c.ChildId === id) || {
      ChildId: id,
      FullName: 'Học sinh mầm',
      Age: 5,
      Gender: 'Other',
      LearningLevel: 'Cơ bản',
      Status: 'Active'
    };
  };

  // Class status badge renderer styling
  const renderStatusBadge = (status: Classroom['Status']) => {
    const mappings = {
      Active: { bg: 'bg-[#F2FAF4] text-[#34A853] border-emerald-100', dot: 'bg-emerald-500', label: 'Đang mở' },
      Inactive: { bg: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400', label: 'Tạm khóa' },
      Completed: { bg: 'bg-[#F2FAFB] text-[#20D0D4] border-cyan-100', dot: 'bg-[#20D0D4]', label: 'Đã bế mạc' },
      Upcoming: { bg: 'bg-[#FFF9EE] text-[#FFA800] border-amber-100', dot: 'bg-[#FFA800]', label: 'Sắp tới' },
    };
    const style = mappings[status] || mappings.Active;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border", style.bg)}>
        <span className={cn("w-1.5 h-1.5 rounded-full animate-ping", style.dot)} />
        {style.label}
      </span>
    );
  };

  const getProgressLevelBadge = (level: Analysis['ProgressLevel']) => {
    const mapper = {
      Improving: { bg: 'bg-[#F2FAF4] text-[#34A853] border-emerald-50', label: 'Tiến bộ tốt' },
      Stable: { bg: 'bg-[#F2FAFB] text-[#20D0D4] border-cyan-50', label: 'Khá ổn định' },
      'Need Support': { bg: 'bg-[#FFF2F2] text-[#FF8E8E] border-rose-50', label: 'Cần lưu tâm' }
    };
    return mapper[level] || mapper.Stable;
  };

  // Handle mock actions with beautiful educational status toasts
  const triggerSimulation = (action: string, name: string) => {
    if (action === 'REPORT') {
      showToast(`Đang quét dải âm phổ mộc, kết xuất báo cáo lớp học ${activeClass.ClassName} về máy tính (.PDF)...`, 'info');
      setTimeout(() => {
        showToast('Kết xuất báo cáo kiểm định học tập thành công!', 'success');
      }, 2505);
    } else if (action === 'PROFILE') {
      showToast(`Đang truy xuất thông số dải đo hơi thở của học sinh ${name}...`, 'info');
    } else if (action === 'HISTORY') {
      showToast(`Mở dải nhật ký 14 phiên học VR gần đây của học viên ${name}...`, 'success');
    } else if (action === 'REPLAY') {
      showToast(`Tải mô hình chuyển động khớp lưỡi, tọa độ môi bé ${name} từ kính GodotXR...`, 'info');
    } else if (action === 'ANALYZE') {
      showToast(`Đang chạy thuật toán AI so sánh âm phổ bé ${name} với mẫu chuẩn...`, 'success');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative text-left" id="class-detail-page">
      
      {/* Dynamic Feedback Floating Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="detail-toast-floating"
          >
            <div className={cn(
              "px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4.5 border-2 border-white backdrop-blur-md font-bold text-white text-sm tracking-wide leading-snug",
              toastMessage.type === 'success' ? 'bg-[#4EACAF]/95' : toastMessage.type === 'info' ? 'bg-indigo-600/95' : 'bg-[#FF8E8E]/95'
            )}>
              <div className="bg-white/20 p-2 rounded-xl text-white shrink-0">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : toastMessage.type === 'warn' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <Activity className="w-5 h-5 animate-pulse" />
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

      {/* Header Block with Back button and Quick Export Report action */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        
        <div className="space-y-3">
          {/* Interactivity back handler wrapper */}
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('TEACHER_CLASSES');
              } else {
                showToast('Chuyển hưởng trang chủ lớp học mầm học của bạn...', 'info');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4EACAF] uppercase tracking-wider hover:text-[#3e8c8f] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Trở lại danh sách lớp học
          </button>
 
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] bg-[#4EACAF]/10 text-[#4EACAF] px-2.5 py-1 rounded font-bold uppercase tracking-wider leading-none">
                Lớp học: {activeClass.ClassId}
              </span>
              {renderStatusBadge(activeClass.Status)}
            </div>
            
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight font-sans">
              {activeClass.ClassName}
            </h1>
 
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FF8E8E]" />
              Giáo trình lớp: <strong className="text-slate-700 font-bold">{programInfo.ProgramName}</strong> ({programInfo.Language})
            </p>
          </div>
        </div>
 
        {/* Dynamic selector class switch action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-stretch md:self-center">
          
          <div className="relative min-w-[200px]">
            <select
              value={currentClassroomId}
              onChange={(e) => {
                setCurrentClassroomId(e.target.value);
                showToast(`Nạp mô tả giáo trình lớp ${e.target.value}`, 'success');
              }}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/20 pl-4 pr-10 py-2.5 rounded-lg font-bold text-xs text-slate-700 uppercase outline-none cursor-pointer transition-colors"
            >
              {MOCK_CLASSROOMS.map(cl => (
                <option key={cl.ClassId} value={cl.ClassId}>🏫 {cl.ClassName}</option>
              ))}
            </select>
          </div>
 
          <button
            onClick={() => triggerSimulation('REPORT', '')}
            className="px-4 py-2.5 bg-[#4EACAF] hover:bg-[#3E8C8F] text-white font-extrabold uppercase text-xs tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Tạo báo cáo lớp
          </button>
        </div>
 
      </div>

      {/* 2. Kid-friendly styled Class overview metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Enrolled kids sum */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center shrink-0 text-[#4EACAF]">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">{summaryMetrics.totalKids} Học sinh</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Sĩ số lớp học</p>
          </div>
        </div>

        {/* Class average basic score */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-[#FF8E8E]/10 border border-rose-100 rounded-lg flex items-center justify-center shrink-0 text-[#FF8E8E]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">{summaryMetrics.avgClassScore}/100</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Điểm trung bình</p>
          </div>
        </div>

        {/* Total practice elapsed minutes */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center shrink-0 text-indigo-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">{summaryMetrics.totalPracticeMinutes} phút</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Tương tác VR</p>
          </div>
        </div>

        {/* Homework completed percentage */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0 text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-600 tracking-tight leading-none">{summaryMetrics.completionRate}%</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Nộp bài tập</p>
          </div>
        </div>

      </div>

      {/* 3. Styled tab buttons selector card */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-start gap-1">
        {[
          { tab: 'STUDENTS', label: 'Danh Sách Học Sinh', icon: Users },
          { tab: 'RESULTS', label: 'Kết Quả Gần Đây', icon: ClipboardList },
          { tab: 'ANALYSES', label: 'Phân Tích Tiến Độ', icon: TrendingUp },
          { tab: 'PROGRAM', label: 'Thông Tin Chương Trình', icon: BookOpen }
        ].map((t) => {
          const IconComponent = t.icon;
          return (
            <button
              key={t.tab}
              onClick={() => {
                setActiveTab(t.tab as any);
                showToast(`Chuyển sang xem cấu kiện: ${t.label}`, 'info');
              }}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded-lg",
                activeTab === t.tab 
                  ? "bg-[#4EACAF] text-white shadow-sm"
                  : "text-slate-600 hover:text-[#4EACAF] hover:bg-slate-50"
              )}
            >
              <IconComponent className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* 4. Tab contents mapping dynamic spaces */}
      <div className="space-y-6">
        
        {/* Tab 1: Student List & Detailed Database Schema table integration */}
        {activeTab === 'STUDENTS' && (
          <div className="space-y-6">
            
            {/* Table layout filter/search tool */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Tìm học sinh trong danh sách (Ví dụ: Minh, Sophia...)" 
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-705 placeholder-slate-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs" 
                />
                {studentSearchQuery && (
                  <button onClick={() => setStudentSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 cursor-pointer">
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Progress level state selector */}
              <div className="relative min-w-[200px]">
                <select
                  value={selectedProgressFilter}
                  onChange={(e) => setSelectedProgressFilter(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 pl-4 pr-10 py-2.5 rounded-lg font-bold text-xs text-slate-655 uppercase cursor-pointer"
                >
                  <option value="ALL">TIẾN TRÌNH (TẤT CẢ)</option>
                  <option value="Improving">ĐANG TIẾN BỘ</option>
                  <option value="Stable">ỔN ĐỊNH</option>
                  <option value="Need Support">CẦN HỖ TRỢ</option>
                </select>
                <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Main robust Student Database table layout */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4.5 border-b border-slate-50 bg-white">
                <h3 className="text-base font-bold text-slate-800 leading-none">Danh sách học sinh của lớp</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Danh sách các em được chỉ định tham gia rèn luyện dải âm mộc</p>
              </div>

              <div className="overflow-x-auto text-left">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Mã bé</th>
                      <th className="py-3 px-4">Họ tên bé</th>
                      <th className="py-3 px-4 text-center">Tuổi</th>
                      <th className="py-3 px-4 text-center">Giới tính</th>
                      <th className="py-3 px-4">Trình độ luyện</th>
                      <th className="py-3 px-4 text-center">Điểm số trung bình</th>
                      <th className="py-3 px-4">Mức độ tiến tiến</th>
                      <th className="py-3 px-4 text-right">Tác vụ can thiệp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                    {childrenInClass
                      .filter(child => {
                        const scoreAnalysis = getAnalysisForChild(child.ChildId);
                        
                        // Search text matching
                        const matchesSearch = child.FullName.toLowerCase().includes(studentSearchQuery.toLowerCase()) || child.ChildId.includes(studentSearchQuery);
                        // Filter matching
                        const matchesProgress = selectedProgressFilter === 'ALL' || scoreAnalysis.ProgressLevel === selectedProgressFilter;

                        return matchesSearch && matchesProgress;
                      })
                      .map((kid) => {
                        const ana = getAnalysisForChild(kid.ChildId);
                        const progressStyle = getProgressLevelBadge(ana.ProgressLevel);
                        
                        return (
                          <tr key={kid.ChildId} className="hover:bg-slate-50/50 transition-colors">
                            
                            {/* Kid ID */}
                            <td className="py-5 px-10 font-mono text-gray-400 text-xs font-black">
                              {kid.ChildId}
                            </td>

                            {/* FullName */}
                            <td className="py-5 px-6">
                              <span className="text-gray-900 font-extrabold text-sm md:text-base block">{kid.FullName}</span>
                              <span className="text-[10px] text-gray-400 tracking-tight font-medium">Lớp: {activeClass.ClassId}</span>
                            </td>

                            {/* Age */}
                            <td className="py-5 px-6 text-center font-mono font-black text-gray-500">
                              {kid.Age}t
                            </td>

                            {/* Gender */}
                            <td className="py-5 px-6 text-center text-xs font-extrabold">
                              {kid.Gender === 'Male' ? 'Nam 👦' : 'Nữ 👧'}
                            </td>

                            {/* Practice Level */}
                            <td className="py-5 px-6 text-xs text-[#264E50] font-black italic">
                              {kid.LearningLevel}
                            </td>

                            {/* Average Score */}
                            <td className="py-5 px-6 text-center">
                              <span className={cn(
                                "font-black text-base italic",
                                ana.AverageScore >= 85 ? 'text-[#34A853]' : ana.AverageScore >= 60 ? 'text-[#20D0D4]' : 'text-[#FF8E8E]'
                              )}>
                                {ana.AverageScore}đ
                              </span>
                            </td>

                            {/* Progress level status badge */}
                            <td className="py-5 px-6">
                              <span className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border",
                                progressStyle.bg
                              )}>
                                {progressStyle.label}
                              </span>
                            </td>

                            {/* Large portfolio of action control buttons */}
                            <td className="py-5 px-10 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                <button
                                  onClick={() => {
                                    if (onNavigate) {
                                      onNavigate(`TEACHER_STUDENT_DETAIL:${kid.ChildId}`);
                                    } else {
                                      triggerSimulation('PROFILE', kid.FullName);
                                    }
                                  }}
                                  className="py-1.5 px-3 bg-[#4EACAF]/10 hover:bg-[#4EACAF] text-[#4EACAF] hover:text-white rounded-xl text-xs font-black transition-all"
                                  title="Xem hồ sơ học sinh"
                                >
                                  Xem hồ sơ học sinh
                                </button>

                                <button
                                  onClick={() => triggerSimulation('HISTORY', kid.FullName)}
                                  className="p-2 bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl transition-all"
                                  title="Lịch sử các phiên luyện tập"
                                >
                                  <History className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => triggerSimulation('REPLAY', kid.FullName)}
                                  className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                                  title="Trọc quan vị trí miệng 3D"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => triggerSimulation('ANALYZE', kid.FullName)}
                                  className="p-2 bg-yellow-50 text-[#FFA800] hover:bg-[#FFA800] hover:text-white rounded-xl transition-all"
                                  title="Phân tích chi tiết âm mộc"
                                >
                                  <TrendingUp className="w-3.5 h-3.5" />
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Recent results table */}
        {activeTab === 'RESULTS' && (
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50 bg-white/50">
              <h3 className="text-2xl font-black text-gray-900 leading-none italic">Dải điểm phiên chơi gần đây</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Dòng tập ghi âm mộc của trẻ được phân tích tự động từ hệ thống VR</p>
            </div>

            <div className="overflow-x-auto text-left">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                    <th className="py-5 px-10">Mã kết quả</th>
                    <th className="py-5 px-6">Học sinh bé</th>
                    <th className="py-5 px-6">Mã bài chơi</th>
                    <th className="py-5 px-6 text-center">Trạng thái bài tập</th>
                    <th className="py-5 px-6 text-center">Thời lượng</th>
                    <th className="py-5 px-6 text-center">Điểm phiên</th>
                    <th className="py-5 px-6">Ngày ghi nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {classResults.map((result) => {
                    const child = getChildInfo(result.ChildId);
                    
                    return (
                      <tr key={result.ResultId} className="hover:bg-slate-50/50 transition-colors">
                        
                        <td className="py-5 px-10 font-mono text-gray-400 text-xs font-black">{result.ResultId}</td>
                        
                        <td className="py-5 px-6 text-gray-900 font-extrabold">{child.FullName}</td>
                        
                        <td className="py-5 px-6 font-mono text-gray-500 text-xs">{result.ExerciseId}</td>
                        
                        <td className="py-5 px-6 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                            result.CompletionStatus === 'Completed' ? 'bg-[#F2FAF4] text-[#34A853]' : 'bg-rose-50 text-rose-500'
                          )}>
                            {result.CompletionStatus === 'Completed' ? 'Vượt ải' : 'Nửa chừng'}
                          </span>
                        </td>

                        <td className="py-5 px-6 text-center font-mono text-gray-500">{result.DurationSeconds}s</td>

                        <td className="py-5 px-6 text-center">
                          <strong className={cn(
                            "text-base italic",
                            result.Score >= 85 ? 'text-[#4EACAF]' : 'text-rose-500'
                          )}>{result.Score}đ</strong>
                        </td>

                        <td className="py-5 px-6 text-xs text-gray-400 font-medium">{result.CreatedAt}</td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Detailed progress analyses */}
        {activeTab === 'ANALYSES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {childrenInClass.map((kd) => {
              const scoreAnalysis = getAnalysisForChild(kd.ChildId);
              const statusStyle = getProgressLevelBadge(scoreAnalysis.ProgressLevel);
              
              return (
                <div key={kd.ChildId} className="bg-white rounded-[36px] p-8 border border-gray-100 shadow-sm space-y-4">
                  
                  <div className="flex justify-between items-start gap-4 border-b pb-4">
                    <div>
                      <h4 className="text-lg font-black text-gray-800 tracking-tight leading-none">{kd.FullName}</h4>
                      <span className="text-[10px] text-gray-400 tracking-wider font-extrabold block mt-2">Trình: {kd.LearningLevel}</span>
                    </div>

                    <span className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border",
                      statusStyle.bg
                    )}>
                      {statusStyle.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FDFCF5] p-3.5 rounded-2xl">
                      <span className="text-[9px] text-[#4EACAF] font-black uppercase tracking-wider block">Điểm trung bình khóa</span>
                      <strong className="text-xl font-black text-gray-900 italic block mt-1">{scoreAnalysis.AverageScore} Điểm</strong>
                    </div>

                    <div className="bg-[#FFFDF5] p-3.5 rounded-2xl">
                      <span className="text-[9px] text-[#FF8E8E] font-black uppercase tracking-wider block">Nhập vai kịch bản VR</span>
                      <strong className="text-xs font-black text-gray-700 block mt-1">10 Phút/Ngày đề xuất</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Ý kiến đề xuất can thiệp:</span>
                    <p className="text-xs font-bold text-[#264E50]/90 leading-relaxed italic bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/30">
                      &ldquo;{scoreAnalysis.Recommendation}&rdquo;
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Program informational parameters layout */}
        {activeTab === 'PROGRAM' && (
          <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100 space-y-8">
            
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs bg-[#4EACAF]/10 text-[#4EACAF] px-3.5 py-1 rounded-full font-black uppercase tracking-widest leading-none">
                Chuyên đề: {programInfo.ProgramId}
              </span>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none italic">{programInfo.ProgramName}</h3>
              <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                {programInfo.Description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
              
              <div className="space-y-1 bg-[#FDFCF5] p-5 rounded-2xl border">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Độ tuổi phổ biến:</span>
                <strong className="text-base text-gray-800 font-black">Từ 7 đến 11 tuổi học đường</strong>
              </div>

              <div className="space-y-1 bg-[#FDFCF5] p-5 rounded-2xl border">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Phương màng ngôn ngữ:</span>
                <strong className="text-base text-[#4EACAF] font-black">{programInfo.Language} (Phát âm tiếng bản ngữ)</strong>
              </div>

              <div className="space-y-1 bg-[#FDFCF5] p-5 rounded-2xl border">
                <span className="text-[9px] text-gray-405 font-black uppercase tracking-wider block">Thiết bị mầm học đề xuất:</span>
                <strong className="text-base text-indigo-500 font-black">Kính GodotXR Headset v2</strong>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
