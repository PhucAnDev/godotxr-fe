import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Baby, 
  Award, 
  TrendingUp, 
  Clock, 
  Smile, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  ChevronRight, 
  X, 
  Activity, 
  Sparkles, 
  BookOpen, 
  FileSpreadsheet, 
  PlayCircle, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Volume2, 
  FileDown,
  Info,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
  UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';

// DB Interfaces according to project specifications
export interface Child {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Note: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ParentUser {
  UserId: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
}

export interface Result {
  ResultId: string;
  ChildId: string;
  ExerciseId: string;
  ExerciseName: string; // Helpful mapping
  AttemptNumber: number;
  CompletionStatus: 'Completed' | 'Incomplete' | 'Failed';
  Score: number;
  StartedAt: string;
  CompletedAt: string;
  DurationSeconds: number;
  FeedbackText: string;
  CreatedAt: string;
}

export interface Analysis {
  AnalysisId: string;
  ChildId: string;
  TotalExercises: number;
  CompletedExercises: number;
  TotalPracticeTime: number; // in minutes
  AverageScore: number;
  ProgressLevel: 'Improving' | 'Stable' | 'Need Support';
  Strengths: string[];
  Weaknesses: string[];
  Recommendation: string;
  LastAnalyzedAt: string;
}

export interface PronunciationDetail {
  DetailId: string;
  ResultId: string;
  ExpectedPhoneme: string;
  ActualPhoneme: string;
  AccuracyScore: number;
  IssueType: string;
  ReplayDataUrl: string;
}

// ----------------------------------------------------
// FULL COMPLETE MOCK DATABASES FOR CHILDREN WORKSPACE
// ----------------------------------------------------

const MOCK_PARENT_USERS: ParentUser[] = [
  { UserId: 'USR-P1', FullName: 'Nguyễn Tiến Dũng', Email: 'dung.nguyen@email.com', PhoneNumber: '0912345678' },
  { UserId: 'USR-P2', FullName: 'Trần Thị Thu Hương', Email: 'huong.tran@email.com', PhoneNumber: '0987654321' },
  { UserId: 'USR-P3', FullName: 'Phạm Minh Hải', Email: 'hai.pham@email.com', PhoneNumber: '0901122334' },
  { UserId: 'USR-P4', FullName: 'Hoàng Ngọc Ánh', Email: 'anh.hoang@email.com', PhoneNumber: '0933445566' }
];

const MOCK_CHILDREN: Child[] = [
  { 
    ChildId: 'CHD-001', 
    ParentUserId: 'USR-P1', 
    FullName: 'Nguyễn Tiến Minh (Leo)', 
    Age: 8, 
    Gender: 'Male', 
    LearningLevel: 'Bậc 1 - Phát âm đơn VR', 
    Note: 'Học sinh thông minh nhưng thỉnh thoảng mất tập trung giữa buổi chơi. Thích trò chơi Nông trại 3D. Cần hỗ trợ uốn âm họng.',
    Status: 'Active',
    CreatedAt: '2026-01-10 09:00',
    UpdatedAt: '2026-05-30 11:30'
  },
  { 
    ChildId: 'CHD-002', 
    ParentUserId: 'USR-P2', 
    FullName: 'Trần Thảo Linh (Sophia)', 
    Age: 7, 
    Gender: 'Female', 
    LearningLevel: 'Bậc 2 - Âm đôi ghép từ VR', 
    Note: 'Phản xạ phát âm nhạy bén, lực hơi khá dồi dào. Thỉnh thoảng bị mỏi hàm khi uốn cụm âm kép ngắn qua VR.',
    Status: 'Active',
    CreatedAt: '2026-01-12 10:00',
    UpdatedAt: '2026-05-29 16:00'
  },
  { 
    ChildId: 'CHD-003', 
    ParentUserId: 'USR-P3', 
    FullName: 'Phạm Minh Khang', 
    Age: 9, 
    Gender: 'Male', 
    LearningLevel: 'Bậc 1 - Sửa ngọng S VR', 
    Note: 'Học sinh còn rụt rè trước micro. Phát hơi còn lệch, đặc biệt là dải âm gió S và X. Khuyến khích rèn luyện sâu hơn.',
    Status: 'Active',
    CreatedAt: '2026-02-15 14:00',
    UpdatedAt: '2026-05-28 10:20'
  },
  { 
    ChildId: 'CHD-004', 
    ParentUserId: 'USR-P4', 
    FullName: 'Hoàng Anh Thư', 
    Age: 11, 
    Gender: 'Female', 
    LearningLevel: 'Bậc 2 - Ghép vần VR', 
    Note: 'Phát âm tròn chữ nhưng âm lượng tương đối nhỏ. Họng khỏe nhưng lưỡi hơi thụ động khi điều hướng trong kịch bản VR.',
    Status: 'Active',
    CreatedAt: '2026-02-20 08:30',
    UpdatedAt: '2026-05-31 10:30'
  }
];

const MOCK_RESULTS: Result[] = [
  // Results for CHD-001 (Leo)
  { 
    ResultId: 'RES-201', 
    ChildId: 'CHD-001', 
    ExerciseId: 'EX-农-01', 
    ExerciseName: 'Chào các bạn bò sữa nông trại', 
    AttemptNumber: 1, 
    CompletionStatus: 'Completed', 
    Score: 92, 
    StartedAt: '2026-05-29 08:30', 
    CompletedAt: '2026-05-29 08:32', 
    DurationSeconds: 120, 
    FeedbackText: 'Phát âm tốt nguyên âm đơn "o", "a". Khớp hình miệng 3D cực chuẩn.',
    CreatedAt: '2026-05-29 08:32' 
  },
  { 
    ResultId: 'RES-202', 
    ChildId: 'CHD-001', 
    ExerciseId: 'EX-农-02', 
    ExerciseName: 'Bật hơi phụ âm "B" vui nhộn', 
    AttemptNumber: 2, 
    CompletionStatus: 'Completed', 
    Score: 88, 
    StartedAt: '2026-05-30 09:10', 
    CompletedAt: '2026-05-30 09:12', 
    DurationSeconds: 150, 
    FeedbackText: 'Tốt ở phụ âm B. Lực hơi đẩy dồn lực hàm ổn định.',
    CreatedAt: '2026-05-30 09:12' 
  },
  { 
    ResultId: 'RES-203', 
    ChildId: 'CHD-001', 
    ExerciseId: 'EX-星-03', 
    ExerciseName: 'Khám phá chòm sao Trăng Tròn', 
    AttemptNumber: 1, 
    CompletionStatus: 'Incomplete', 
    Score: 54, 
    StartedAt: '2026-05-31 14:00', 
    CompletedAt: '2026-05-31 14:02', 
    DurationSeconds: 120, 
    FeedbackText: 'Bé mệt cơ hàm, thoát ra sớm giữa chừng.',
    CreatedAt: '2026-05-31 14:02' 
  },

  // Results for CHD-002 (Sophia)
  { 
    ResultId: 'RES-204', 
    ChildId: 'CHD-002', 
    ExerciseId: 'EX-农-01', 
    ExerciseName: 'Chào các bạn bò sữa nông trại', 
    AttemptNumber: 1, 
    CompletionStatus: 'Completed', 
    Score: 100, 
    StartedAt: '2026-05-29 14:13', 
    CompletedAt: '2026-05-29 14:15', 
    DurationSeconds: 110, 
    FeedbackText: 'Kì diệu! Phát âm tròn mộc dải âm, nhịp thở hoàn hảo.',
    CreatedAt: '2026-05-29 14:15' 
  },
  { 
    ResultId: 'RES-205', 
    ChildId: 'CHD-002', 
    ExerciseId: 'EX-森-05', 
    ExerciseName: 'Bài ca tiếng suối rừng muôn loa', 
    AttemptNumber: 1, 
    CompletionStatus: 'Completed', 
    Score: 94, 
    StartedAt: '2026-05-30 15:20', 
    CompletedAt: '2026-05-30 15:23', 
    DurationSeconds: 180, 
    FeedbackText: 'Các cụm âm đôi "tr", "s" ghép mộc tinh xảo.',
    CreatedAt: '2026-05-30 15:23' 
  },

  // Results CHD-003 (Khang)
  { 
    ResultId: 'RES-206', 
    ChildId: 'CHD-003', 
    ExerciseId: 'EX-风-01', 
    ExerciseName: 'Gặp gỡ thần gió S-X răng cửa', 
    AttemptNumber: 1, 
    CompletionStatus: 'Incomplete', 
    Score: 45, 
    StartedAt: '2026-05-28 10:02', 
    CompletedAt: '2026-05-28 10:04', 
    DurationSeconds: 90, 
    FeedbackText: 'Bé vẫn lẫn phụ âm gió răng cửa thành âm l, n nông hơi.',
    CreatedAt: '2026-05-28 10:04' 
  },
  { 
    ResultId: 'RES-207', 
    ChildId: 'CHD-003', 
    ExerciseId: 'EX-风-01', 
    ExerciseName: 'Gặp gỡ thần gió S-X răng cửa', 
    AttemptNumber: 2, 
    CompletionStatus: 'Completed', 
    Score: 68, 
    StartedAt: '2026-05-30 11:00', 
    CompletedAt: '2026-05-30 11:03', 
    DurationSeconds: 180, 
    FeedbackText: 'Có tiến triển, kiểm soát được 6/10 âm gió tiêu chuẩn.',
    CreatedAt: '2026-05-30 11:03' 
  },

  // Results CHD-004 (Thư)
  { 
    ResultId: 'RES-208', 
    ChildId: 'CHD-004', 
    ExerciseId: 'EX-农-01', 
    ExerciseName: 'Chào các bạn bò sữa nông trại', 
    AttemptNumber: 1, 
    CompletionStatus: 'Completed', 
    Score: 85, 
    StartedAt: '2026-05-31 10:17', 
    CompletedAt: '2026-05-31 10:20', 
    DurationSeconds: 135, 
    FeedbackText: 'Phát âm sạch nhưng hơi rụt rè. Khuyến nghị tập nói to trước tivi.',
    CreatedAt: '2026-05-31 10:20' 
  }
];

const MOCK_ANALYSES: Analysis[] = [
  {
    AnalysisId: 'ANA-901',
    ChildId: 'CHD-001',
    TotalExercises: 18,
    CompletedExercises: 14,
    TotalPracticeTime: 240, // minutes
    AverageScore: 91.5,
    ProgressLevel: 'Improving',
    Strengths: ['Phát âm nguyên âm đơn (o, a, u)', 'Bật hơi phụ âm dải trước B, P tốt', 'Khớp răng dọc vững'],
    Weaknesses: ['Ngọng nhẹ âm gió sau s, x', 'Mất tập trung sau phút thứ 10 trong kính VR'],
    Recommendation: 'Khuyến nghị tăng tương tác các game nguyên âm đôi phối hợp. Hướng dẫn bé nghỉ mắt 5 phút giữa buổi chơi.',
    LastAnalyzedAt: '2026-05-31 08:00'
  },
  {
    AnalysisId: 'ANA-902',
    ChildId: 'CHD-002',
    TotalExercises: 25,
    CompletedExercises: 25,
    TotalPracticeTime: 360,
    AverageScore: 97.0,
    ProgressLevel: 'Improving',
    Strengths: ['Tất cả dải âm đôi phức tạp tr, gi, s', 'Thể tích hơi mộc đỉnh đạt', 'Mô hình khớp lưỡi động tối ưu'],
    Weaknesses: ['Đôi khi kịch hơi nhanh ở âm họng sau c, k'],
    Recommendation: 'Học sinh hoàn thành chương trình rèn luyện xuất sắc. Đề xuất cho chuyển tiếp học dải bài đố chữ ghép hình tương phản nâng cao.',
    LastAnalyzedAt: '2026-05-30 16:00'
  },
  {
    AnalysisId: 'ANA-903',
    ChildId: 'CHD-003',
    TotalExercises: 10,
    CompletedExercises: 5,
    TotalPracticeTime: 120,
    AverageScore: 56.5,
    ProgressLevel: 'Need Support',
    Strengths: ['Nguyên âm mọc mở đầu o, e tốt'],
    Weaknesses: ['Tật dẹt hơi dải âm s, x rụt lưỡi sau', 'Thoát khí dốc họng nông hơi'],
    Recommendation: 'Ngoại phục dãn bài tập dài tầm 5 phút. Phụ huynh cùng bé tập thổi bóng xà phòng ngoài đời để tăng thể lực cơ vòm họng.',
    LastAnalyzedAt: '2026-05-29 10:00'
  },
  {
    AnalysisId: 'ANA-904',
    ChildId: 'CHD-004',
    TotalExercises: 15,
    CompletedExercises: 12,
    TotalPracticeTime: 185,
    AverageScore: 85.0,
    ProgressLevel: 'Stable',
    Strengths: ['Giọng thanh ngọt', 'Khớp từ ghép sạch sẽ', 'Nguyên âm chính xướng tròn'],
    Weaknesses: ['Cường độ mộc phát ra quá yếu dưới 40dB', 'Rụt đầu lưỡi khi đẩy hơi đứng phụ âm t, th'],
    Recommendation: 'Cho bé tập các câu thơ vè ngắn phối hợp micro áp sát. Chăm sóc bé khen thưởng bằng quà sticker 3D trong game VR để kích thích động lực.',
    LastAnalyzedAt: '2026-05-31 11:00'
  }
];

const MOCK_PRONUNCIATION_DETAILS: PronunciationDetail[] = [
  // Details for Leo (CHD-001)
  { DetailId: 'PRN-001', ResultId: 'RES-201', ExpectedPhoneme: 'o', ActualPhoneme: 'o', AccuracyScore: 96, IssueType: 'Tốt', ReplayDataUrl: '/audio/chd01_o.mp3' },
  { DetailId: 'PRN-002', ResultId: 'RES-201', ExpectedPhoneme: 'a', ActualPhoneme: 'ă', AccuracyScore: 82, IssueType: 'Nuốt nguyên âm', ReplayDataUrl: '/audio/chd01_a.mp3' },
  { DetailId: 'PRN-003', ResultId: 'RES-202', ExpectedPhoneme: 'b', ActualPhoneme: 'b', AccuracyScore: 90, IssueType: 'Tốt', ReplayDataUrl: '/audio/chd01_b.mp3' },
  { DetailId: 'PRN-004', ResultId: 'RES-203', ExpectedPhoneme: 's', ActualPhoneme: 'th', AccuracyScore: 50, IssueType: 'Ngọng phát âm gió', ReplayDataUrl: '/audio/chd01_s.mp3' },

  // Details for Khang (CHD-003)
  { DetailId: 'PRN-005', ResultId: 'RES-206', ExpectedPhoneme: 's', ActualPhoneme: 'l', AccuracyScore: 40, IssueType: 'Tật ngọng rụt lưỡi nặng', ReplayDataUrl: '/audio/chd03_s1.mp3' },
  { DetailId: 'PRN-006', ResultId: 'RES-207', ExpectedPhoneme: 's', ActualPhoneme: 'x', AccuracyScore: 72, IssueType: 'Hơi lệch dải dẹt răng', ReplayDataUrl: '/audio/chd03_s2.mp3' }
];

interface TeacherStudentDetailProps {
  childId?: string;
  onNavigate?: (screen: string) => void;
}

export default function TeacherStudentDetail({ childId = 'CHD-001', onNavigate }: TeacherStudentDetailProps) {
  // State to support looking up details of different students
  const [currentChildId, setCurrentChildId] = useState<string>(childId);

  // Retrieve child from DB
  const child = useMemo(() => {
    return MOCK_CHILDREN.find(c => c.ChildId === currentChildId) || MOCK_CHILDREN[0];
  }, [currentChildId]);

  // Retrieve parent details
  const parent = useMemo(() => {
    return MOCK_PARENT_USERS.find(p => p.UserId === child.ParentUserId) || MOCK_PARENT_USERS[0];
  }, [child]);

  // Retrieve analytical summary metrics
  const analysis = useMemo(() => {
    return MOCK_ANALYSES.find(a => a.ChildId === child.ChildId) || MOCK_ANALYSES[0];
  }, [child]);

  // Retrieve child results
  const results = useMemo(() => {
    return MOCK_RESULTS.filter(r => r.ChildId === child.ChildId);
  }, [child]);

  // Retrieve corresponding pronunciation details
  const ridsForChild = useMemo(() => results.map(r => r.ResultId), [results]);
  const pronunciationDetails = useMemo(() => {
    return MOCK_PRONUNCIATION_DETAILS.filter(pd => ridsForChild.includes(pd.ResultId));
  }, [ridsForChild]);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY' | 'ERRORS' | 'PROGRESS' | 'RECOMMENDATIONS'>('OVERVIEW');

  // Simulated report download states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Floating feedback Toast alerts
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getProgressLevelStyle = (level: Analysis['ProgressLevel']) => {
    const choices = {
      Improving: { bg: 'bg-[#F2FAF4] text-[#34A853] border-emerald-100', dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'Tiến bộ vượt bậc' },
      Stable: { bg: 'bg-[#F2FAFB] text-[#20D0D4] border-cyan-100', dot: 'bg-[#20D0D4]', text: 'text-cyan-600', label: 'Tiến độ bình ổn' },
      'Need Support': { bg: 'bg-[#FFF2F2] text-[#FF8E8E] border-rose-100', dot: 'bg-rose-500', text: 'text-rose-600', label: 'Cần tiếp sức' }
    };
    return choices[level] || choices.Stable;
  };

  const triggerDownloadSimulation = () => {
    setIsDownloading(true);
    setDownloadProgress(20);
    showToast(`Đang trích ghép biểu mẫu, cấu trúc âm phổ bé ${child.FullName}...`, 'info');

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            setDownloadProgress(0);
            showToast(`Hồ sơ học thuật bé ${child.FullName} đã được lưu thành công (.PDF)!`, 'success');
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const simulatePlayReplay = (expect: string, actual: string, score: number) => {
    showToast(`Đang tái dựng dạng sóng âm phổ chuẩn [${expect}] so với âm thực tế mộc [${actual}] (${score}đ) qua tai nghe...`, 'success');
  };

  const currentProgressStyle = getProgressLevelStyle(analysis.ProgressLevel);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 text-left relative" id="student-detail-workspace">
      
      {/* Toast Alert Indicator Panel */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="student-toast-floating"
          >
            <div className={cn(
              "px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 border-2 border-white backdrop-blur-md font-bold text-white text-sm tracking-wide leading-snug",
              toastMessage.type === 'success' ? 'bg-[#4EACAF]/95' : toastMessage.type === 'info' ? 'bg-indigo-600/95' : 'bg-[#FF8E8E]/95'
            )}>
              <div className="bg-white/20 p-2 rounded-xl text-white shrink-0">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : toastMessage.type === 'warn' ? (
                  <AlertCircle className="w-5 h-5" />
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

      {/* Styled Kid-themed Dashboard Header */}
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        
        <div className="space-y-4">
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('TEACHER_CLASSES');
              } else {
                showToast('Hành vi chuyển phản hướng về lớp học tổng nhiệm...', 'info');
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-black text-[#4EACAF] uppercase tracking-wider hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang quản quản lớp học
          </button>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs bg-[#FF8E8E]/10 text-[#FF8E8E] px-3.5 py-1 rounded-full font-black uppercase tracking-widest leading-none">
                Học mầm: {child.ChildId}
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border",
                currentProgressStyle.bg
              )}>
                {currentProgressStyle.label}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic">
              {child.FullName}
            </h1>

            <p className="text-gray-500 font-bold text-sm leading-relaxed flex items-center gap-1.5">
              <Baby className="w-4.5 h-4.5 text-[#4EACAF]" />
              Giám sát dải âm họng rèn luyện VR &bull; Trình độ hiện hoạt: <span className="text-[#264E50] font-black">{child.LearningLevel}</span>
            </p>
          </div>
        </div>

        {/* Change Student Dropdown selection & Export Report Action Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 self-start lg:self-center shrink-0">
          
          <div className="relative min-w-[210px]">
            <select
              value={currentChildId}
              onChange={(e) => {
                setCurrentChildId(e.target.value);
                showToast(`Nạp chi tiết hồ sơ bé ${getChildName(e.target.value)}`, 'success');
              }}
              className="w-full appearance-none bg-indigo-50 border-2 border-transparent hover:border-indigo-100 pl-4 pr-10 py-3 rounded-2xl font-black text-xs text-indigo-700 uppercase outline-none cursor-pointer"
            >
              {MOCK_CHILDREN.map(ch => (
                <option key={ch.ChildId} value={ch.ChildId}>👦 {ch.FullName}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 rotate-90 pointer-events-none" />
          </div>

          <button
            onClick={triggerDownloadSimulation}
            disabled={isDownloading}
            className="px-6 py-3.5 bg-[#4EACAF] hover:bg-[#3B8487] text-white font-black uppercase text-xs tracking-wider rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4.5 h-4.5" />
            Tạo báo cáo bé
          </button>
        </div>

      </div>

      {/* Progress download overlay */}
      {isDownloading && (
        <div className="bg-[#FFFDF5] p-5.5 rounded-3xl border border-yellow-200 mt-2 space-y-2 animate-pulse text-left">
          <div className="flex justify-between items-center text-xs font-black text-amber-700 uppercase tracking-wider">
            <span>Đang thu thập mộc âm cổ...</span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#4EACAF] transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Profile Section Box: Detailed information from USERS & CHILD */}
      <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8 text-left" id="student-identity-profile-box">
        
        <div className="flex items-center gap-4 border-b border-gray-50 pb-5">
          <div className="w-12 h-12 bg-[#FF8E8E]/10 text-[#FF8E8E] rounded-2xl flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-800 leading-none">Thông Tin Học Viên & Phụ Huynh Trung Quy</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Kết lập cơ sở đồng bộ dữ liệu gia đình & trường học</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Mầm non details col */}
          <div className="bg-[#FDFCF5] p-6.5 rounded-3xl border border-yellow-101/50 space-y-4">
            <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
              <Baby className="w-4 h-4 text-[#FFA800]" />
              Học mầm măng non
            </h4>
            
            <div className="space-y-3 font-semibold text-xs text-gray-600">
              <p><span className="text-gray-400">Giới tính:</span> <strong className="text-gray-800 font-black">{child.Gender === 'Male' ? 'Nam 👦' : 'Nữ 👧'}</strong></p>
              <p><span className="text-gray-400">Độ tuổi âm học:</span> <strong className="text-gray-800 font-black">{child.Age} Tuổi tròn</strong></p>
              <p><span className="text-gray-400">Mức luyện:</span> <strong className="text-[#264E50] font-black italic">{child.LearningLevel}</strong></p>
              <p>
                <span className="text-gray-400">Học bạ trạng thái:</span>{' '}
                <span className="bg-[#F2FAF4] text-[#34A853] px-2.5 py-0.5 rounded font-black text-[10px] uppercase">
                  {child.Status}
                </span>
              </p>
            </div>
          </div>

          {/* Phụ huynh USERS details col */}
          <div className="bg-[#FDFCF5] p-6.5 rounded-3xl border border-yellow-101/50 space-y-4">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              Đại diện phụ huynh
            </h4>
            
            <div className="space-y-3 font-semibold text-xs text-gray-600">
              <p><span className="text-gray-400">Họ tên:</span> <strong className="text-gray-800 font-black">{parent.FullName}</strong></p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-800 font-black">{parent.PhoneNumber}</span>
              </p>
              <p className="flex items-center gap-2 overflow-hidden truncate">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-gray-800 font-black truncate">{parent.Email}</span>
              </p>
              <p><span className="text-gray-400">Kênh hỗ trợ:</span> <strong className="text-emerald-500 font-black">Tin nhắn app</strong></p>
            </div>
          </div>

          {/* Sư đồ ghi chú note col */}
          <div className="bg-[#FFF8F8] p-6.5 rounded-3xl border border-rose-100 space-y-4">
            <h4 className="text-xs font-black text-[#FF8E8E] uppercase tracking-widest flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Bàn giao sư lý lâm sàng
            </h4>
            <p className="text-xs font-bold text-gray-600 leading-relaxed italic bg-white p-4.5 rounded-2xl border border-rose-50">
              &ldquo;{child.Note}&rdquo;
            </p>
          </div>

        </div>

      </div>

      {/* 3. Interactive Statistic cards detailing progress indicator elements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="student-statistics-cards">
        
        {/* Total practice lessons */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-teal-400 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0 text-[#4EACAF]">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{analysis.TotalExercises}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tác vụ được giao</p>
          </div>
        </div>

        {/* Lesson completed with a nice layout tracking bar */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-emerald-400 shadow-sm flex flex-col justify-between min-h-[110px] transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 text-emerald-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">{analysis.CompletedExercises}/{analysis.TotalExercises}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Bài đã nộp</p>
            </div>
          </div>
          
          {/* Progress bar representing completed exercises */}
          <div className="w-full space-y-1 mt-2">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((analysis.CompletedExercises / (analysis.TotalExercises || 1)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase">
              <span>Đạt tiêu chuẩn</span>
              <span>{Math.round((analysis.CompletedExercises / (analysis.TotalExercises || 1)) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Total practice elapsed hours */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-indigo-400 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 text-indigo-500">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{analysis.TotalPracticeTime} Phút</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tổng hành động kính VR</p>
          </div>
        </div>

        {/* Average Score with cute progressive pill tracking level */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#FF8E8E] shadow-sm flex flex-col justify-between min-h-[110px] transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0 text-[#FF8E8E]">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">{analysis.AverageScore}đ</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Điểm bình quân hồ học</p>
            </div>
          </div>

          <div className="w-full space-y-1 mt-2">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  analysis.AverageScore >= 90 ? 'bg-emerald-500' : 'bg-amber-400'
                )}
                style={{ width: `${analysis.AverageScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase">
              <span>Độ tinh chuẩn</span>
              <span>{analysis.AverageScore}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Pedagogical statement bar */}
      <div className="bg-[#FFFDF5] p-5 rounded-2xl border border-yellow-102 flex gap-3 text-xs font-semibold leading-relaxed text-slate-600 text-left">
        <Info className="w-5 h-5 text-amber-500 shrink-0" />
        <span>Hồ sơ chấm phổ được cập nhật lần cuối vào lúc {analysis.LastAnalyzedAt}. Các thuật toán lọc khí chuẩn và loại bỏ nhiễu tai mộc đã được đồng bộ tối ưu hóa tự động.</span>
      </div>

      {/* 4. Tabs navigation with simple react states */}
      <div className="bg-white rounded-[32px] p-2 border border-gray-100 hover:shadow-inner flex flex-col sm:flex-row gap-1">
        {[
          { tab: 'OVERVIEW', label: 'Tổng quan mầm học', icon: Smile },
          { tab: 'HISTORY', label: 'Nhật trình luyện tập', icon: Activity },
          { tab: 'ERRORS', label: 'Báo lỗi phát âm', icon: Volume2 },
          { tab: 'PROGRESS', label: 'Phân tích tiến tiến', icon: TrendingUp },
          { tab: 'RECOMMENDATIONS', label: 'Đề phẩm đề xuất', icon: Sparkles }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              onClick={() => {
                setActiveTab(item.tab as any);
                showToast(`Đã chuyển sang tab: ${item.label}`, 'info');
              }}
              className={cn(
                "px-5 py-4.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 flex-1 cursor-pointer border border-transparent",
                activeTab === item.tab
                  ? "bg-[#4EACAF] text-white italic shadow-sm"
                  : "text-slate-500 hover:text-[#4EACAF] hover:bg-slate-50"
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* 5. Dynamic Tab spaces rendered accurately */}
      <div className="space-y-8 text-left">
        
        {/* TAB 1: OVERVIEW COMPONENT WITH KEY INSIGHTS */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Strengths card */}
            <div className="bg-white p-8 rounded-[36px] border border-gray-150 relative space-y-4">
              <h3 className="text-xl font-black text-emerald-600 uppercase tracking-tight flex items-center gap-2">
                <ThumbsUp className="w-5.5 h-5.5 text-emerald-500" />
                Dải thế mạnh phát âm của bé
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Những phụ mẫu âm mộc đạt cao lượng tỉ âm trên sóng vòm họng</p>
              
              <div className="space-y-3 pt-2">
                {analysis.Strengths.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Chưa đủ dữ liệu chấm điểm thế mạnh.</p>
                ) : (
                  analysis.Strengths.map((str, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/30 text-xs font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {str}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weaknesses card */}
            <div className="bg-white p-8 rounded-[36px] border border-gray-150 relative space-y-4">
              <h3 className="text-xl font-black text-rose-500 uppercase tracking-tight flex items-center gap-2">
                <ThumbsDown className="w-5.5 h-5.5 text-rose-400" />
                Vùng can thiệp cần điều chỉnh
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Các tật bẹt hơi, rụt lưỡi dọc, cơ thụ động thụt họng</p>

              <div className="space-y-3 pt-2">
                {analysis.Weaknesses.length === 0 ? (
                  <p className="text-xs text-emerald-500 font-bold">Thật tuyệt! Không phát hiện dải yếu hay lỗi nào đáng ngại.</p>
                ) : (
                  analysis.Weaknesses.map((weak, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100/30 text-xs font-bold text-rose-700">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      {weak}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: LEARNING HISTORY RECENT RESULTS TABLE */}
        {activeTab === 'HISTORY' && (
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-white/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-none italic">Sử học huấn tự mầm</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Dải điểm, nhịp chơi, dải hơi và các cố gắng tương sinh</p>
              </div>

              <span className="text-xs font-black text-gray-400 uppercase">Mã số: {child.ChildId}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                    <th className="py-5 px-10">Mã phiên</th>
                    <th className="py-5 px-6">Tên ải chơi</th>
                    <th className="py-5 px-6 text-center">Phiên chơi</th>
                    <th className="py-5 px-6 text-center">Hiện dạng bài</th>
                    <th className="py-5 px-6 text-center">Khối giây luyện</th>
                    <th className="py-5 px-6 text-center">Thể phổ chấm</th>
                    <th className="py-5 px-10 text-right">Xem replay lưỡi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 italic font-semibold">Bé chưa nộp bài chơi nào trong chu kỳ này.</td>
                    </tr>
                  ) : (
                    results.map((res) => (
                      <tr key={res.ResultId} className="hover:bg-slate-50/50 transition-colors">
                        
                        <td className="py-5 px-10 font-mono text-gray-400 text-xs font-black">{res.ResultId}</td>

                        <td className="py-5 px-6 font-extrabold text-gray-800">{res.ExerciseName}</td>

                        <td className="py-5 px-6 text-center font-mono text-gray-500">Lần {res.AttemptNumber}</td>

                        <td className="py-5 px-6 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                            res.CompletionStatus === 'Completed' ? 'bg-[#F2FAF4] text-[#34A853]' : 'bg-rose-50 text-rose-500'
                          )}>
                            {res.CompletionStatus === 'Completed' ? 'Đã vượt ải' : 'Đứt khúc'}
                          </span>
                        </td>

                        <td className="py-5 px-6 text-center font-mono text-gray-500">{res.DurationSeconds} giây</td>

                        <td className="py-5 px-6 text-center">
                          <strong className={cn(
                            "text-base italic",
                            res.Score >= 85 ? 'text-[#4EACAF]' : 'text-rose-500'
                          )}>{res.Score}đ</strong>
                        </td>

                        <td className="py-5 px-10 text-right">
                          <button
                            onClick={() => simulatePlayReplay('Nguyên âm', 'Mộc', res.Score)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-xl transition-all cursor-pointer"
                            title="Phát chuyển động 3D lưỡi họng"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: PRONUNCIATION DETAILS / ERROR LIST */}
        {activeTab === 'ERRORS' && (
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50 bg-white/50">
              <h3 className="text-2xl font-black text-gray-900 leading-none italic">Sổ tay lỗi dải bật âm mộc</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Bảng đối soát ngữ tố kỳ vọng so với âm thực đạt của riêng trẻ</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                    <th className="py-5 px-10">Mã lỗi</th>
                    <th className="py-5 px-6 text-center">Chữ âm chuẩn kỳ vọng</th>
                    <th className="py-5 px-6 text-center">Bé bật âm thực tế</th>
                    <th className="py-5 px-6 text-center">Dải điểm chuẩn</th>
                    <th className="py-5 px-6">Phản dạng tật phát phát</th>
                    <th className="py-5 px-10 text-right">Mô mô mô chuẩn vọng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {pronunciationDetails.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 italic">Thật tuyệt! Không phát hiện sai hỏng dải chuẩn nào trong các phiên vừa nạp.</td>
                    </tr>
                  ) : (
                    pronunciationDetails.map((pd) => (
                      <tr key={pd.DetailId} className="hover:bg-slate-50/50 transition-colors">
                        
                        <td className="py-5 px-10 font-mono text-gray-400 text-xs font-black">{pd.DetailId}</td>

                        <td className="py-5 px-6 text-center font-mono font-black text-gray-800 text-lg uppercase bg-indigo-50/30">
                          {pd.ExpectedPhoneme}
                        </td>

                        <td className="py-5 px-6 text-center font-mono font-black text-[#FF8E8E] text-lg uppercase bg-rose-50/30">
                          {pd.ActualPhoneme}
                        </td>

                        <td className="py-5 px-6 text-center">
                          <strong className={cn(
                            "text-base italic",
                            pd.AccuracyScore >= 80 ? 'text-[#4EACAF]' : 'text-rose-500'
                          )}>{pd.AccuracyScore}%</strong>
                        </td>

                        <td className="py-5 px-6 text-xs text-gray-650">
                          <span className={cn(
                            "px-2.5 py-1 rounded inline-block font-black text-[10px] uppercase tracking-wide",
                            pd.IssueType === 'Tốt' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                          )}>
                            {pd.IssueType}
                          </span>
                        </td>

                        <td className="py-5 px-10 text-right">
                          <button
                            onClick={() => simulatePlayReplay(pd.ExpectedPhoneme, pd.ActualPhoneme, pd.AccuracyScore)}
                            className="px-3.5 py-1.5 bg-[#4EACAF]/10 hover:bg-[#4EACAF] text-[#4EACAF] hover:text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer"
                          >
                            Phổ âm
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 4: PROGRESS TREND REPORT */}
        {activeTab === 'PROGRESS' && (
          <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100 space-y-8">
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#4EACAF] italic">Biểu đồ xu hướng tiến bộ mọc âm</h3>
              <p className="text-xs text-gray-405 font-bold uppercase tracking-wider">Hành trình 30 ngày cải thiện dải hơi và uốn mềm lưỡi</p>
            </div>

            <div className="bg-[#FFFDF5] p-6.5 rounded-3xl border border-yellow-105 flex items-start gap-4">
              <Sparkles className="w-7 h-7 text-amber-500 shrink-0" />
              <div className="space-y-1">
                <strong className="text-sm font-black text-gray-800 block">Sư học can thiệp thông minh:</strong>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">
                  Bé {child.FullName} đang chứng minh mức cải thiện đáng tự hào. Các thông số đo lưỡi khớp dọc tịnh tiến lên 12% so với tuần đầu tham gia rèn luyện. Họng uốn hơi dốc đạt cường độ chuẩn từ 55dB đến 68dB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
              <div className="bg-slate-50 p-5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold block mb-1">Mức uốn mềm hàm dọc</span>
                <strong className="text-[#264E50]">Tốt bậc tiểu học (Mở cơ môi 3D góc 45 độ)</strong>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold block mb-1">Dải thể lực áp hơi đẩy</span>
                <strong className="text-[#FF8E8E]">Khá ổn (Trung bình 8 giây giữ hơi rít nhẹ)</strong>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: DETAILED RECOMMENDATIONS */}
        {activeTab === 'RECOMMENDATIONS' && (
          <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100 space-y-6">
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#FF8E8E] italic">Cẩm nang khuyên khuyên phục âm măng non</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Khuyến nghị chắp sư lý thực tế ảo phục vụ giáo dục gia đình tích cực</p>
            </div>

            <p className="text-sm font-bold text-gray-700 leading-relaxed bg-[#FFFDF5] p-8 rounded-[28px] border-2 border-dashed border-yellow-200">
              &ldquo;{analysis.Recommendation}&rdquo;
            </p>

            <div className="bg-slate-50 p-5 rounded-2xl text-xs font-bold text-gray-500 leading-relaxed block text-left">
              <strong className="text-gray-800 uppercase text-[10px] block mb-2 font-black">Các bước phụ huynh cần cùng bé làm tối nay tại nhà:</strong>
              1. Cho bé xem tập game &ldquo;Nông trại vui vẻ&rdquo; trong kính VR dưới 10 phút hướng mắt.<br />
              2. Khích lệ bé đọc to dải phụ âm kép từ trong sách tranh mộc răng cửa góc tịnh tiến.<br />
              3. Tôn vinh bé mỗi lần bé bật được phụ âm sạch, ghi hình dán sticker phần thưởng.
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

// Helper code to safety find children for lookup elements
function getChildName(id: string): string {
  return MOCK_CHILDREN.find(c => c.ChildId === id)?.FullName || 'Học sinh mầm';
}
