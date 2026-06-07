import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Eye, 
  Volume2, 
  SlidersHorizontal, 
  Award, 
  Activity, 
  ChevronDown, 
  Info, 
  MessageCircle, 
  CheckCircle, 
  Play, 
  Zap, 
  Smile, 
  ShieldAlert, 
  TrendingUp, 
  User, 
  Sparkles,
  HelpCircle,
  FileAudio,
  Glasses,
  RotateCcw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../common/Pagination';

// DB Interfaces according to specification
interface PronunciationDetail {
  DetailId: string;
  ResultId: string;
  ExpectedPhoneme: string;
  ActualPhoneme: string;
  AccuracyScore: number;
  IssueType: 'Chính xác' | 'Ngọng giọng gió' | 'Bẹt khẩu hình' | 'Nuốt âm cuối' | 'Biến âm phụ âm' | 'Hụt hơi';
  ReplayDataUrl: string;
}

interface Result {
  ResultId: string;
  ChildId: string;
  ExerciseId: string;
  Score: number;
  AudioRecordUrl: string;
  ReplayDataUrl: string;
  FeedbackText: string;
  CreatedAt: string;
}

interface Child {
  ChildId: string;
  FullName: string;
  Age: number;
  LearningLevel: string;
}

interface Exercise {
  ExerciseId: string;
  ExerciseName: string;
  DifficultyLevel: 'Dễ' | 'Trung bình' | 'Khó';
  TargetSkill: string;
  Language: string;
}

// Mock Database Tables mapping out schema exactly
const MOCK_CHILDREN: Child[] = [
  { ChildId: 'CHD-001', FullName: 'Nguyễn Tiến Minh (Leo)', Age: 8, LearningLevel: 'Bậc 1 - Phát âm đơn VR' },
  { ChildId: 'CHD-002', FullName: 'Trần Thảo Linh (Sophia)', Age: 7, LearningLevel: 'Bậc 2 - Âm đôi ghép từ VR' },
  { ChildId: 'CHD-003', FullName: 'Phạm Minh Khang', Age: 9, LearningLevel: 'Bậc 1 - Sửa ngọng S VR' },
  { ChildId: 'CHD-004', FullName: 'Hoàng Anh Thư', Age: 11, LearningLevel: 'Bậc 2 - Ghép vần VR' },
  { ChildId: 'CHD-005', FullName: 'Lê Bảo Nam', Age: 10, LearningLevel: 'Bậc 3 - Phản xạ nhanh VR' }
];

const MOCK_EXERCISES: Exercise[] = [
  { ExerciseId: 'EX-101', ExerciseName: 'Phiêu lưu nông trại vui vẻ', DifficultyLevel: 'Dễ', TargetSkill: 'Phát âm phụ âm đầu b, c, d', Language: 'Tiếng Việt' },
  { ExerciseId: 'EX-102', ExerciseName: 'Thử thách phát âm S & X', DifficultyLevel: 'Trung bình', TargetSkill: 'Sửa ngọng phụ âm gió', Language: 'Tiếng Việt' },
  { ExerciseId: 'EX-103', ExerciseName: 'Giải đố vần nguyên âm đôi', DifficultyLevel: 'Dễ', TargetSkill: 'Ghép vần ay, uô, iê', Language: 'Tiếng Việt' },
  { ExerciseId: 'EX-104', ExerciseName: 'Truy tìm thần thú rừng sâu', DifficultyLevel: 'Khó', TargetSkill: 'Phóng đại khẩu hình qua Avatar 3D', Language: 'Tiếng Việt' },
  { ExerciseId: 'EX-105', ExerciseName: 'Đường đua âm thanh sôi động', DifficultyLevel: 'Trung bình', TargetSkill: 'Phản xạ trường từ vựng', Language: 'Tiếng Việt' }
];

const MOCK_RESULTS: Result[] = [
  {
    ResultId: 'RES-8821',
    ChildId: 'CHD-001', // Leo
    ExerciseId: 'EX-101',
    Score: 95,
    AudioRecordUrl: 'https://storage.googleapis.com/godotxr-records/leo_farm_adventure_att1.mp3',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-replays/leo_farm_adventure_att1.json',
    FeedbackText: 'Bé phát âm rất rõ ràng, tròn trịa âm gió đầu và giữ nhịp game cực kỳ thông thạo. Tiếp tục phát huy nhé con!',
    CreatedAt: '2026-05-30 08:32:15'
  },
  {
    ResultId: 'RES-8822',
    ChildId: 'CHD-001', // Leo
    ExerciseId: 'EX-102',
    Score: 78,
    AudioRecordUrl: 'https://storage.googleapis.com/godotxr-records/leo_s_x_challenge_att1.mp3',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-replays/leo_s_x_challenge_att1.json',
    FeedbackText: 'Bé còn một chút lẫn lộn giữa âm S và X khi kết hợp từ ghép "sung sướng". Cô giáo cần giúp bé chỉnh khẩu hình lưỡi cụp nhẹ.',
    CreatedAt: '2026-05-30 09:03:40'
  },
  {
    ResultId: 'RES-8823',
    ChildId: 'CHD-002', // Sophia
    ExerciseId: 'EX-102',
    Score: 100,
    AudioRecordUrl: 'https://storage.googleapis.com/godotxr-records/sophia_s_x_att2.mp3',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-replays/sophia_s_x_att2.json',
    FeedbackText: 'Lần thử thứ hai vô cùng ngoạn mục! Bé Sophia đã sửa được dứt điểm nhược điểm bẹt môi từ tuần trước. Điểm tuyệt đối xuất sắc!',
    CreatedAt: '2026-05-30 14:17:50'
  },
  {
    ResultId: 'RES-8824',
    ChildId: 'CHD-003', // Minh Khang
    ExerciseId: 'EX-103',
    Score: 45,
    AudioRecordUrl: 'https://storage.googleapis.com/godotxr-records/khang_ay_uo_att1.mp3',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-replays/khang_ay_uo_att1.json',
    FeedbackText: 'Khang hôm nay có vẻ hơi mệt hoặc buồn ngủ, phát âm khá nhỏ và chưa phối hợp tốt với kính GodotXR. Đề xuất đổi bài tập dễ hơn.',
    CreatedAt: '2026-05-29 10:04:10'
  },
  {
    ResultId: 'RES-8826',
    ChildId: 'CHD-005', // Bảo Nam
    ExerciseId: 'EX-105',
    Score: 92,
    AudioRecordUrl: 'https://storage.googleapis.com/godotxr-records/nam_race_att3.mp3',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-replays/nam_race_att3.json',
    FeedbackText: 'Bảo Nam là một học sinh có phản xạ 3D rất tốt. Bé hoàn thành vượt mục tiêu của tuần trước đề ra.',
    CreatedAt: '2026-05-31 10:12:45'
  }
];

const MOCK_PRONUNCIATION_DETAILS: PronunciationDetail[] = [
  {
    DetailId: 'PD-1001',
    ResultId: 'RES-8821', // Leo
    ExpectedPhoneme: 'bờ (b)',
    ActualPhoneme: 'bờ (b)',
    AccuracyScore: 98,
    IssueType: 'Chính xác',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-tracking/pd1001_replay.json'
  },
  {
    DetailId: 'PD-1002',
    ResultId: 'RES-8821', // Leo
    ExpectedPhoneme: 'cờ (c)',
    ActualPhoneme: 'tờ (t)',
    AccuracyScore: 82,
    IssueType: 'Biến âm phụ âm',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-tracking/pd1002_replay.json'
  },
  {
    DetailId: 'PD-1003',
    ResultId: 'RES-8822', // Leo (Lần thử S/X)
    ExpectedPhoneme: 'sờ (s)',
    ActualPhoneme: 'xờ (x)',
    AccuracyScore: 54,
    IssueType: 'Ngọng giọng gió',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-tracking/pd1003_replay.json'
  },
  {
    DetailId: 'PD-1004',
    ResultId: 'RES-8822', // Leo (Lần thử S/X)
    ExpectedPhoneme: 'sung sướng',
    ActualPhoneme: 'xung xướng',
    AccuracyScore: 61,
    IssueType: 'Bẹt khẩu hình',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-tracking/pd1004_replay.json'
  },
  {
    DetailId: 'PD-1005',
    ResultId: 'RES-8823', // Sophia
    ExpectedPhoneme: 'sờ (s)',
    ActualPhoneme: 'sờ (s)',
    AccuracyScore: 100,
    IssueType: 'Chính xác',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-tracking/pd1005_replay.json'
  },
  {
    DetailId: 'PD-1006',
    ResultId: 'RES-8823', // Sophia
    ExpectedPhoneme: 'súc sắc',
    ActualPhoneme: 'súc sắc',
    AccuracyScore: 99,
    IssueType: 'Chính xác',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-tracking/pd1006_replay.json'
  },
  {
    DetailId: 'PD-1007',
    ResultId: 'RES-8824', // Minh Khang (Failed)
    ExpectedPhoneme: 'vần uô (cuội)',
    ActualPhoneme: 'uộ...',
    AccuracyScore: 35,
    IssueType: 'Nuốt âm cuối',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-tracking/pd1007_replay.json'
  },
  {
    DetailId: 'PD-1008',
    ResultId: 'RES-8824', // Minh Khang
    ExpectedPhoneme: 'vần ay (tay)',
    ActualPhoneme: 'a...',
    AccuracyScore: 40,
    IssueType: 'Hụt hơi',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-tracking/pd1008_replay.json'
  },
  {
    DetailId: 'PD-1009',
    ResultId: 'RES-8826', // Bảo Nam
    ExpectedPhoneme: 'mèo mướp',
    ActualPhoneme: 'mèo mướp',
    AccuracyScore: 92,
    IssueType: 'Chính xác',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-tracking/pd1009_replay.json'
  },
  {
    DetailId: 'PD-1010',
    ResultId: 'RES-8826', // Bảo Nam
    ExpectedPhoneme: 'bánh chưng',
    ActualPhoneme: 'bánh chưn',
    AccuracyScore: 78,
    IssueType: 'Nuốt âm cuối',
    ReplayDataUrl: 'https://storage.googleapis.com/godotxr-tracking/pd1010_replay.json'
  }
];

export default function PronunciationDetailPage() {
  // Main Data States
  const [details] = useState<PronunciationDetail[]>(MOCK_PRONUNCIATION_DETAILS);
  const [results] = useState<Result[]>(MOCK_RESULTS);
  const [children] = useState<Child[]>(MOCK_CHILDREN);
  const [exercises] = useState<Exercise[]>(MOCK_EXERCISES);

  // Search, criteria and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIssueType, setFilterIssueType] = useState<string>('ALL');
  const [filterAccuracyRange, setFilterAccuracyRange] = useState<string>('ALL');

  // Role Simulator state (Admin, Teacher, Parent) to align with platform design
  const [currentRoleView, setCurrentRoleView] = useState<'ADMIN' | 'TEACHER' | 'PARENT'>('ADMIN');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterIssueType, filterAccuracyRange, currentRoleView]);

  // View Interactive Details / Simulation actions state
  const [activeReplay, setActiveReplay] = useState<PronunciationDetail | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<Result | null>(null);

  // Sound play states
  const [playingResultId, setPlayingResultId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Resolve references mapping helpers
  const getResultInfo = (resId: string): Result => {
    return results.find(r => r.ResultId === resId) || {
      ResultId: resId,
      ChildId: 'CHD-001',
      ExerciseId: 'EX-101',
      Score: 80,
      AudioRecordUrl: '',
      ReplayDataUrl: '',
      FeedbackText: 'Không tìm thấy thông tin phản hồi gốc.',
      CreatedAt: '2026-05-30'
    };
  };

  const getChildInfoForResult = (resId: string): Child => {
    const result = getResultInfo(resId);
    return children.find(c => c.ChildId === result.ChildId) || {
      ChildId: 'UNKNOWN',
      FullName: 'Học sinh',
      Age: 8,
      LearningLevel: 'Bậc 1 VR'
    };
  };

  const getExerciseInfoForResult = (resId: string): Exercise => {
    const result = getResultInfo(resId);
    return exercises.find(e => e.ExerciseId === result.ExerciseId) || {
      ExerciseId: 'UNKNOWN',
      ExerciseName: 'Bài học 3D',
      DifficultyLevel: 'Dễ',
      TargetSkill: 'Phát âm cơ bản',
      Language: 'Tiếng Việt'
    };
  };

  // ROLE-BASED FILTERING LOGIC
  // - Admin: See everything
  // - Teacher: See details of classroom children (Minh Khang, Anh Thư, Bảo Nam: CHD-003, CHD-004, CHD-005)
  // - Parent: See details of only Leo (CHD-001)
  const getRoleFilteredDetails = (detailsList: PronunciationDetail[]) => {
    return detailsList.filter(d => {
      const result = getResultInfo(d.ResultId);
      if (currentRoleView === 'ADMIN') {
        return true;
      } else if (currentRoleView === 'TEACHER') {
        // Simulated assignment list for Teacher view
        return ['CHD-003', 'CHD-004', 'CHD-005'].includes(result.ChildId);
      } else {
        // Parent view
        return result.ChildId === 'CHD-001';
      }
    });
  };

  // Filter application matching search queries & select criteria
  const filteredDetails = getRoleFilteredDetails(details).filter(item => {
    const child = getChildInfoForResult(item.ResultId);
    const exercise = getExerciseInfoForResult(item.ResultId);
    const textToMatch = `${item.DetailId} ${item.ExpectedPhoneme} ${item.ActualPhoneme} ${item.IssueType} ${child.FullName} ${exercise.ExerciseName}`.toLowerCase();
    
    const matchesSearch = textToMatch.includes(searchQuery.toLowerCase());
    const matchesIssue = filterIssueType === 'ALL' || item.IssueType === filterIssueType;
    
    let matchesAccuracy = true;
    if (filterAccuracyRange === 'LOW') {
      matchesAccuracy = item.AccuracyScore < 60;
    } else if (filterAccuracyRange === 'MID') {
      matchesAccuracy = item.AccuracyScore >= 60 && item.AccuracyScore < 85;
    } else if (filterAccuracyRange === 'HIGH') {
      matchesAccuracy = item.AccuracyScore >= 85;
    }

    return matchesSearch && matchesIssue && matchesAccuracy;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDetails.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedDetails = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDetails.slice(startIndex, startIndex + pageSize);
  }, [filteredDetails, currentPage, pageSize]);

  // STATS CALCULATIONS (Based on ROLE-FILTERED dataset)
  const activeRoleDetails = getRoleFilteredDetails(details);
  const totalIssueCount = activeRoleDetails.filter(d => d.IssueType !== 'Chính xác').length;

  const averageAccuracy = activeRoleDetails.length > 0
    ? Math.round(activeRoleDetails.reduce((sum, d) => sum + d.AccuracyScore, 0) / activeRoleDetails.length)
    : 0;

  // Calculation of most common error
  const errorFrequency: Record<string, number> = {};
  activeRoleDetails.forEach(d => {
    if (d.IssueType !== 'Chính xác') {
      errorFrequency[d.IssueType] = (errorFrequency[d.IssueType] || 0) + 1;
    }
  });
  let mostCommonError = 'Không có lỗi';
  let maxCount = 0;
  Object.entries(errorFrequency).forEach(([error, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonError = error;
    }
  });

  // Calculate simulated reviews needed (where accuracy < 75)
  const repeatRequiredCount = activeRoleDetails.filter(d => d.AccuracyScore < 75).length;

  // Sound and Replay simulator controls
  const triggerAudioPlay = (resId: string) => {
    const result = getResultInfo(resId);
    if (!result.AudioRecordUrl) {
      showToast('Không có tệp âm thanh thu mộc cho bản ghi này.', 'warn');
      return;
    }
    setPlayingResultId(resId);
    showToast(`Đang giả lập phát nghe âm phổ can thiệp âm mộc của bé...`, 'info');
    setTimeout(() => {
      setPlayingResultId(null);
      showToast('Đã mô phỏng phát bản thu thành công!', 'success');
    }, 3000);
  };

  const getIssueBadgeStyle = (issue: PronunciationDetail['IssueType']) => {
    const mappings: Record<PronunciationDetail['IssueType'], { bg: string, text: string, border: string }> = {
      'Chính xác': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
      'Ngọng giọng gió': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
      'Bẹt khẩu hình': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
      'Nuốt âm cuối': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100' },
      'Biến âm phụ âm': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
      'Hụt hơi': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
    };
    return mappings[issue] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100' };
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative" id="pronunciation-details-view">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="pronunciation-toast-floating"
          >
            <div className={cn(
              "px-6 py-4.5 rounded-3xl shadow-xl flex items-center gap-4.5 border-2 border-white backdrop-blur-md font-bold text-white text-sm tracking-wide leading-snug",
              toastMessage.type === 'success' ? 'bg-[#4EACAF]/95' : toastMessage.type === 'info' ? 'bg-indigo-600/95' : 'bg-[#FF8E8E]/95'
            )}>
              <div className="bg-white/20 p-2 rounded-xl">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : toastMessage.type === 'warn' ? (
                  <ShieldAlert className="w-5 h-5 text-white" />
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

      {/* Styled Dashboard Header with Role Switching Capability */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-md text-[11px] font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            Giao diện theo dõi phát âm trẻ (7-11 tuổi)
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-2 pb-0.5 font-sans">
            Phân tích Chi tiết Phát âm
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Giám sát âm kỳ vọng, âm thực tế trẻ phát ra và phân tích các nhược điểm khẩu hình được ghi nhận từ thiết bị kính đeo GodotXR.
          </p>
        </div>

        {/* Mini Role switcher matching current codebase style */}
        <div className="bg-slate-100/80 border border-slate-200 p-1 rounded-xl flex items-center gap-1 shadow-inner shrink-0 self-start md:self-auto">
          <div className="px-3 py-1.5 font-bold text-[11px] text-slate-500 uppercase tracking-wider hidden sm:block">
            Tư cách xem:
          </div>
          <div className="flex gap-1">
            {[
              { role: 'ADMIN', label: 'Admin' },
              { role: 'TEACHER', label: 'Cô giáo' },
              { role: 'PARENT', label: 'Phụ huynh' }
            ].map((vRole) => (
              <button
                key={vRole.role}
                onClick={() => {
                  setCurrentRoleView(vRole.role as any);
                  showToast(`Đã điều chỉnh sang phân quyền: ${vRole.label}`, 'success');
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer",
                  currentRoleView === vRole.role 
                    ? "bg-[#4EACAF] text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                )}
              >
                {vRole.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kid-friendly and modern Statistic indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total pronunciation issues */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
            <ShieldAlert className="w-5 h-5 text-[#FF8E8E]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{totalIssueCount}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Số từ phát âm lỗi</p>
          </div>
        </div>

        {/* Average Accuracy indicators */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 border border-teal-100">
            <Award className="w-5 h-5 text-[#4EACAF]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{averageAccuracy}%</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Accuracy trung bình</p>
          </div>
        </div>

        {/* Most common issue found in records */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
            <Smile className="w-5 h-5 text-indigo-550 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 tracking-tight leading-none truncate max-w-[140px]">{mostCommonError}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Lỗi hay gặp nhất</p>
          </div>
        </div>

        {/* Number of times recommendation practice required */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 border border-purple-100">
            <RotateCcw className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{repeatRequiredCount}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Lượt phát âm kém</p>
          </div>
        </div>

      </div>

      {/* Helpful alert block highlighting safety claims guidelines */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex gap-3 text-xs leading-relaxed text-slate-500">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-slate-700 font-bold uppercase text-[10px] tracking-wider">Tính chất y tế học đường:</p>
          <span>Trang này hiển thị dữ liệu nhận xét phân tích giọng mộc của trẻ được ghi lại bởi giáo viên có chuyên môn cùng hệ thống kính GodotXR. Dữ liệu này không mang tính chất chẩn đoán hay kết luận y khoa bệnh lý.</span>
        </div>
      </div>

      {/* Search and Filters Segment */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4" id="pronon-filter-block">
        
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Main textual search box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo âm tiết, từ kỳ vọng, lỗi phát âm hoặc tên bé..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white" 
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-200/60 rounded-full hover:bg-gray-200"
                title="Hủy từ tìm kiếm"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Issue Type Filter Selector */}
          <div className="relative w-full md:w-64">
            <select
              value={filterIssueType}
              onChange={(e) => setFilterIssueType(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 pl-4 pr-10 py-2.5 rounded-xl font-bold text-gray-750 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Tất cả lỗi / Trạng thái</option>
              <option value="Chính xác">Chính xác (Đạt yêu cầu)</option>
              <option value="Ngọng giọng gió">Ngọng giọng gió (S & X)</option>
              <option value="Bẹt khẩu hình">Bẹt khẩu hình môi</option>
              <option value="Nuốt âm cuối">Nuốt âm cuối</option>
              <option value="Biến âm phụ âm">Biến âm đầu</option>
              <option value="Hụt hơi">Có dải hụt hơi</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

        </div>

        {/* Secondary filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap shrink-0">Độ chính xác tương quan phổ:</label>
            <div className="relative w-full">
              <select
                value={filterAccuracyRange}
                onChange={(e) => setFilterAccuracyRange(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 pl-4 pr-10 py-2.5 rounded-xl font-bold text-gray-750 outline-none cursor-pointer text-xs uppercase"
              >
                <option value="ALL">MỨC ĐỘ KHỚP AM TẦN (TẤT CẢ)</option>
                <option value="HIGH">CAO (TỪ 85% ĐẾN 100%) - TỐT</option>
                <option value="MID">TRUNG BÌNH (TỪ 60% ĐẾN 84%) - CẦN LƯU Ý</option>
                <option value="LOW">THẤP (DƯỚI 60%) - CẦN HƯỚNG DẪN LẠI</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-end">
            {(searchQuery || filterIssueType !== 'ALL' || filterAccuracyRange !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterIssueType('ALL');
                  setFilterAccuracyRange('ALL');
                  showToast('Đã đặt lại tất cả bộ lọc phát âm', 'info');
                }}
                className="inline-flex items-center gap-1 text-xs text-[#FF8E8E] font-bold uppercase tracking-wider hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Dọn sạch mọi bộ lọc chọn lựa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Pronunciation Details Datatable Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="p-details-table">
        
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-none">Chi tiết ghi nhận phát âm</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Đối chiếu âm kỳ vọng và âm trẻ phát ra thực tế từ kính GodotXR</p>
          </div>
          <span className="text-[10px] bg-teal-50 text-[#4EACAF] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider border border-teal-100/30 self-start sm:self-auto">
            DATABASE: PRONUNCIATION_DETAIL ({filteredDetails.length} dòng)
          </span>
        </div>

        {filteredDetails.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100">
              <Smile className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700">Không tìm thấy âm tiết phát âm lỗi nào phù hợp!</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">Vui lòng điều chỉnh lại bộ lọc tìm kiếm hoặc thay đổi phân vai góc nhìn của bạn ở góc phải màn hình.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto text-left">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                    <th className="py-5 px-10">Mã chi tiết ID</th>
                    <th className="py-5 px-6">Học sinh</th>
                    <th className="py-5 px-6">Lượt làm VR</th>
                    <th className="py-5 px-6 text-center">Âm mong đợi</th>
                    <th className="py-5 px-6 text-center">Trẻ phát ra thực tế</th>
                    <th className="py-5 px-6">Độ chính xác</th>
                    <th className="py-5 px-6">Lỗi nhận diện</th>
                    <th className="py-5 px-10 text-right">Tác vụ theo dõi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {paginatedDetails.map((item) => {
                    const child = getChildInfoForResult(item.ResultId);
                    const result_ref = getResultInfo(item.ResultId);
                    
                    return (
                      <tr key={item.DetailId} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Detail ID */}
                        <td className="py-5 px-10 font-mono text-gray-400 text-xs font-black">
                          {item.DetailId}
                        </td>

                        {/* Child Name & level */}
                        <td className="py-5 px-6">
                          <div className="text-gray-900 font-extrabold text-sm md:text-base leading-none">
                            {child.FullName}
                          </div>
                          <span className="text-[10px] text-gray-400 tracking-tight font-medium">
                            {child.LearningLevel}
                          </span>
                        </td>

                        {/* Result ID Link */}
                        <td className="py-5 px-6 font-mono text-xs text-indigo-500">
                          {item.ResultId}
                        </td>

                        {/* Expected phoneme */}
                        <td className="py-5 px-6 text-center">
                          <span className="px-3 py-1 bg-teal-50 text-teal-700 italic border border-teal-100/50 rounded-xl font-extrabold">
                            {item.ExpectedPhoneme}
                          </span>
                        </td>

                        {/* Actual Phoneme kids pronounced */}
                        <td className="py-5 px-6 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-xl italic font-extrabold",
                            item.IssueType === 'Chính xác' 
                              ? "bg-emerald-50 text-emerald-700" 
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          )}>
                            {item.ActualPhoneme}
                          </span>
                        </td>

                        {/* Accuracy Score with custom mini layout */}
                        <td className="py-5 px-6">
                          <div className="space-y-1 w-28">
                            <div className="flex justify-between text-xs font-black">
                              <span className={cn(
                                item.AccuracyScore >= 85 ? 'text-emerald-500' : item.AccuracyScore >= 60 ? 'text-indigo-500' : 'text-rose-500'
                              )}>
                                {item.AccuracyScore}%
                              </span>
                            </div>
                            
                            {/* Visual custom Progress bar */}
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  item.AccuracyScore >= 85 ? 'bg-emerald-500' : item.AccuracyScore >= 60 ? 'bg-indigo-500' : 'bg-rose-500'
                                )}
                                style={{ width: `${item.AccuracyScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Issue status badge */}
                        <td className="py-5 px-6">
                          <span className={cn(
                            "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider",
                            getIssueBadgeStyle(item.IssueType).bg,
                            getIssueBadgeStyle(item.IssueType).text,
                            getIssueBadgeStyle(item.IssueType).border
                          )}>
                            {item.IssueType}
                          </span>
                        </td>

                        {/* Action trigger tools */}
                        <td className="py-5 px-10 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Replay tracking map action */}
                            <button
                              onClick={() => {
                                setActiveReplay(item);
                                showToast('Nạp tọa độ cử động góc môi, khớp lưỡi từ tệp replay...', 'info');
                              }}
                              className="py-1.5 px-3 bg-[#4EACAF]/10 hover:bg-[#4EACAF] text-[#4EACAF] hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                              title="Xem mô phỏng vị trí lưỡi và môi 3D"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem Replay
                            </button>

                            {/* Quick listen raw record mock */}
                            {result_ref.AudioRecordUrl && (
                              <button
                                onClick={() => triggerAudioPlay(item.ResultId)}
                                className={cn(
                                  "p-2 rounded-xl transition-all",
                                  playingResultId === item.ResultId
                                    ? "bg-indigo-500 text-white animate-bounce"
                                    : "bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white"
                                )}
                                title="Nghe tệp mộc bé ghi"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Detail feedback view panel switch */}
                            <button
                              onClick={() => setActiveFeedback(result_ref)}
                              className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                              title="Xem nhận xét từ giáo viên đồng hành"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
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
                totalItems={filteredDetails.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="ghi nhận"
              />
            </div>
          </>
        )}

      </div>

      {/* Interactive Overlay Replay Simulation modal */}
      <AnimatePresence>
        {activeReplay && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-gray-900/15 animate-in fade-in duration-300 overflow-y-auto w-full h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="bg-[#E2F2F3] px-8 py-6 flex items-center justify-between border-b border-[#C5E1E3] text-gray-900">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 px-3 py-0.5 bg-[#4EACAF] text-white rounded-md text-[10px] font-black uppercase tracking-wider">
                    <Glasses className="w-3.5 h-3.5" /> VR Visual Replay
                  </div>
                  <h2 className="text-xl font-black italic tracking-tight">
                    Mô phỏng 3D cử động miệng #{activeReplay.DetailId}
                  </h2>
                </div>
                <button 
                  onClick={() => setActiveReplay(null)} 
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                
                {/* Simulated Mouth 3D positioning mesh frame */}
                <div className="h-56 bg-slate-900 rounded-[28px] relative overflow-hidden border-2 border-[#4EACAF]/20 shadow-inner flex flex-col justify-between p-5">
                  
                  {/* Grid system representing virtual mesh layout */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />
                  
                  {/* Glowing 3D dynamic visualizer */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">MODE: 3D_HEADSET_MESH</span>
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-mono font-bold animate-pulse">SÓNG KHỚP: {activeReplay.AccuracyScore}%</span>
                  </div>

                  {/* Playful mouth vector simulated path */}
                  <div className="relative z-10 flex items-center justify-center my-auto">
                    <svg className="w-48 h-20 text-[#FF8E8E]" viewBox="0 0 100 40">
                      <path 
                        d={activeReplay.IssueType === 'Bẹt khẩu hình' 
                          ? "M 10 20 Q 50 25 90 20 Q 50 20 10 20" // flat smile representation
                          : activeReplay.IssueType === 'Chính xác'
                          ? "M 15 20 Q 50 35 85 20 Q 50 10 15 20" // perfect circle open
                          : "M 10 20 Q 50 5 90 20 Q 50 30 10 20" // default curvy
                        } 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                        className="animate-pulse"
                      />
                      {/* Tongue vector */}
                      <path 
                        d={activeReplay.IssueType === 'Ngọng giọng gió'
                          ? "M 30 20 Q 50 15 70 20" // crooked tongue representation
                          : "M 35 22 Q 50 28 65 22" 
                        }
                        fill="none" 
                        stroke="#4EACAF" 
                        strokeWidth="2.5" 
                        strokeDasharray="2 1" 
                      />
                    </svg>
                  </div>

                  <div className="relative z-10 flex justify-between text-[10px] font-mono text-[#4EACAF] font-bold">
                    <span>X: 1.054 | Y: -0.842 | Z: 0.124</span>
                    <span>Tải dữ liệu từ: tracker_mouth_map.json</span>
                  </div>

                </div>

                {/* Tracking variables table */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Thông số can thiệp ghi nhận:</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FDFCF5] p-3 rounded-xl border">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Âm tiết mong đợi</span>
                      <strong className="text-[#264E50]">{activeReplay.ExpectedPhoneme}</strong>
                    </div>

                    <div className="bg-[#FDFCF5] p-3 rounded-xl border">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Tần phổ thực tế</span>
                      <strong className="text-[#FF8E8E]">{activeReplay.ActualPhoneme}</strong>
                    </div>

                    <div className="bg-[#FDFCF5] p-3 rounded-xl border">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Dạng lỗi cấu âm</span>
                      <strong className="text-slate-700">{activeReplay.IssueType}</strong>
                    </div>

                    <div className="bg-[#FDFCF5] p-3 rounded-xl border">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Gợi ý can thiệp khẩu hình</span>
                      <span className="text-xs font-bold text-gray-600">
                        {activeReplay.IssueType === 'Chính xác' && 'Cố gắng giữ vững khẩu hình miệng tròn như cũ nhé!'}
                        {activeReplay.IssueType === 'Bẹt khẩu hình' && 'Nhắc bé há to miệng rộng theo trục dọc, tránh nhoẻn cười ngang dẹt dải sóng.'}
                        {activeReplay.IssueType === 'Ngọng giọng gió' && 'Để lưỡi thẳng ở đáy dưới, không uốn cong lưỡi chạm chân răng cửa trên.'}
                        {activeReplay.IssueType === 'Nuốt âm cuối' && 'Hướng dẫn trẻ phát bật mạnh dải hơi kết thúc từ.'}
                        {activeReplay.IssueType === 'Biến âm phụ âm' && 'Thực hành lặp lại phụ âm đầu rền hơn.'}
                        {activeReplay.IssueType === 'Hụt hơi' && 'Hành tinh âm nhạc rèn thêm các bài hơi dài ngày nghỉ.'}
                      </span>
                    </div>

                  </div>

                </div>

              </div>
              
              <div className="bg-gray-50 px-8 py-5 flex items-center justify-end border-t border-gray-100 gap-3">
                <button
                  onClick={() => {
                    showToast('Đang tải tệp Replay 3D về ổ nhớ đĩa...', 'info');
                  }}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-black transition-colors"
                >
                  Tải Replay (.json)
                </button>
                <button
                  onClick={() => setActiveReplay(null)}
                  className="px-5 py-2.5 bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white rounded-2xl text-xs font-black transition-colors"
                >
                  Đóng cửa sổ
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Feedback dialog modal */}
      <AnimatePresence>
        {activeFeedback && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-gray-900/15 animate-in fade-in duration-300 overflow-y-auto w-full h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="bg-[#FFFDF5] px-8 py-6 flex items-center justify-between border-b border-yellow-105 text-gray-900">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-[#FF8E8E] text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    <MessageCircle className="w-3.5 h-3.5" /> Nhật ký nhận xét
                  </div>
                  <h2 className="text-xl font-black italic tracking-tight">
                    Ý kiến chuyên môn #{activeFeedback.ResultId}
                  </h2>
                </div>
                <button 
                  onClick={() => setActiveFeedback(null)} 
                  className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-8 space-y-4">
                
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 rounded-2xl text-[#FF8E8E]">
                    <Smile className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-gray-800">
                      Trẻ nhận thông số rèn luyện:
                    </h5>
                    <p className="text-xs text-gray-400 font-bold">
                      Bài nộp ngày: {activeFeedback.CreatedAt}
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-[#FDFCF5] rounded-3xl border border-yellow-105 space-y-2 text-sm text-gray-700 leading-relaxed font-bold italic">
                  &ldquo;{activeFeedback.FeedbackText}&rdquo;
                </div>

                <div className="text-xs text-gray-400 font-bold border-t pt-4">
                  * Nhận xét hiển thị nhằm giúp nhà trường và phụ huynh nắm tiến trình rèn luyện để đồng hành cùng trẻ tốt nhất.
                </div>

              </div>

              <div className="bg-gray-50 px-8 py-5 flex items-center justify-end border-t border-gray-100">
                <button
                  onClick={() => setActiveFeedback(null)}
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition-colors"
                >
                  Báo cáo hoàn tất
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
