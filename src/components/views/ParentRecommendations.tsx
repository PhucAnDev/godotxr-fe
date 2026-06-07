import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Baby, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown, 
  Lightbulb, 
  Flame, 
  BookOpen, 
  Heart,
  Volume2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// DB Interfaces
export interface Child {
  ChildId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Status: 'Active' | 'Inactive';
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
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Exercise {
  ExerciseId: string;
  ExerciseName: string;
  DifficultyLevel: 'Easy' | 'Medium' | 'Hard';
  TargetSkill: string;
  Language: 'Vietnamese' | 'English' | 'Bilingual';
}

export interface Result {
  ResultId: string;
  ChildId: string;
  ExerciseId: string;
  CompletionStatus: 'Completed' | 'Incomplete' | 'Failed';
  Score: number;
  FeedbackText: string;
  CreatedAt: string;
}

// Custom structure to couple suggested exercise with "Lý do đề xuất"
export interface SuggestedExercise extends Exercise {
  RecommendationReason: string;
}

// ----------------------------------------------------
// COMPLETE MOCK DATABASES
// ----------------------------------------------------

const MOCK_CHILDREN: Child[] = [
  { 
    ChildId: 'CHD-001', 
    FullName: 'Nguyễn Tiến Minh (Leo)', 
    Age: 8, 
    Gender: 'Male', 
    LearningLevel: 'Bậc 1 - Phát âm đơn', 
    Status: 'Active'
  },
  { 
    ChildId: 'CHD-002', 
    FullName: 'Nguyễn Minh Thư (Mimi)', 
    Age: 7, 
    Gender: 'Female', 
    LearningLevel: 'Bậc 3 - Diễn đạt lưu loát VR', 
    Status: 'Active'
  }
];

const MOCK_ANALYSES: Analysis[] = [
  {
    AnalysisId: 'ANA-851',
    ChildId: 'CHD-001',
    TotalExercises: 18,
    CompletedExercises: 14,
    TotalPracticeTime: 240, // minutes
    AverageScore: 91.5,
    ProgressLevel: 'Improving',
    Strengths: [
      'Phát âm tròn trịa các nguyên âm đơn khẩu hình dọc (O, A, U)',
      'Tương tác cử chỉ tay 3D cực nhạy biến với kính GodotXR',
      'Đại lượng hơi thở đẩy dồi dào, giữ hơi tối đa lên tới 7 giây'
    ],
    Weaknesses: [
      'Tật bẹt hơi dẹp lưỡi nhẹ khi uốn phát âm gió S, X răng khít',
      'Độ mỏi mệt hàm nhẹ xuất hiện sau phút chơi thứ 10'
    ],
    Recommendation: 'Bố mẹ đồng hành khích lệ con chơi các trò vận hơi tự nhiên ngoài đời như thổi nến thổi bong bóng để mở rộng vòm miệng rộng hơn. Khi bé chơi trong kính VR, hãy nhắc con nghỉ mắt 5 phút sau mỗi 10 phút luyện tập.',
    LastAnalyzedAt: '2026-05-31 08:30',
    CreatedAt: '2026-05-31 08:00',
    UpdatedAt: '2026-05-31 08:30'
  },
  {
    AnalysisId: 'ANA-852',
    ChildId: 'CHD-002',
    TotalExercises: 25,
    CompletedExercises: 22,
    TotalPracticeTime: 310,
    AverageScore: 95.0,
    ProgressLevel: 'Stable',
    Strengths: [
      'Kỹ năng phát âm cụm âm đôi phức tạp (TR, GI, CH) chuẩn vòm họng',
      'Phát âm tự tin, giọng đọc mạch lạc rõ ràng biểu cảm tốt',
      'Sử dụng tốt chế độ Song ngữ (Bilingual) thông minh'
    ],
    Weaknesses: [
      'Còn hơi rụt đuôi lưỡi sâu ở cuối câu có âm gió kép',
      'Khoảng rít hơi ngắt nghỉ thỉnh thoảng chưa đúng câu văn dài'
    ],
    Recommendation: 'Bố mẹ cho con tập nói với tốc độ chậm hơn một chút tại nhà. Chú trọng tập trung rèn các bài thơ uốn dải âm đối lưu song hành và khen thưởng bằng bộ thẻ hình 3D dán.',
    LastAnalyzedAt: '2026-05-30 16:15',
    CreatedAt: '2026-05-30 15:30',
    UpdatedAt: '2026-05-30 16:15'
  }
];

const MOCK_EXERCISES: Exercise[] = [
  {
    ExerciseId: 'EX-01',
    ExerciseName: 'Chào các bạn bò sữa nông trại vàng',
    DifficultyLevel: 'Easy',
    TargetSkill: 'Tròn nguyên âm O, A khẩu hình dọc',
    Language: 'Vietnamese'
  },
  {
    ExerciseId: 'EX-02',
    ExerciseName: 'Lấy hơi thổi bong bóng cùng Chú Ếch Con',
    DifficultyLevel: 'Easy',
    TargetSkill: 'Cột hơi hít dài từ đáy phổi',
    Language: 'Vietnamese'
  },
  {
    ExerciseId: 'EX-03',
    ExerciseName: 'Bật hơi nổ bóng xà phòng Bông bóng màu',
    DifficultyLevel: 'Medium',
    TargetSkill: 'Lực nén khí hai môi khép kín',
    Language: 'Vietnamese'
  },
  {
    ExerciseId: 'EX-04',
    ExerciseName: 'Gặp gỡ thần gió S-X răng cửa xinh',
    DifficultyLevel: 'Medium',
    TargetSkill: 'Định hình dải âm gió S chuẩn lưỡi',
    Language: 'Vietnamese'
  },
  {
    ExerciseId: 'EX-05',
    ExerciseName: 'The Magic S-X Whispering Wind Challenge',
    DifficultyLevel: 'Hard',
    TargetSkill: 'Làm chủ luồng hơi răng khí ngoại ngữ',
    Language: 'English'
  },
  {
    ExerciseId: 'EX-06',
    ExerciseName: 'Vòng đấu âm kép TR-GI thế giới muông thú',
    DifficultyLevel: 'Hard',
    TargetSkill: 'Uốn cong dải âm kép nối tiếp vòm hàm',
    Language: 'Vietnamese'
  }
];

const MOCK_RESULTS: Result[] = [
  // For Leo CHD-001
  {
    ResultId: 'RES-101',
    ChildId: 'CHD-001',
    ExerciseId: 'EX-01',
    CompletionStatus: 'Completed',
    Score: 94,
    FeedbackText: 'Bé mấp môi khẩu hình cực tròn chuẩn mẫu 3D giáo viên. Hãy duy trì tốc độ đọc thư thả này nhé con!',
    CreatedAt: '2026-05-29 09:12'
  },
  {
    ResultId: 'RES-102',
    ChildId: 'CHD-001',
    ExerciseId: 'EX-02',
    CompletionStatus: 'Completed',
    Score: 89,
    FeedbackText: 'Lực giữ hơi của con tăng lên rõ rệt đạt 6 giây mộc. Chỉ cần lưu ý thêm cách đặt lưỡi thư giãn vòm dưới họng nhé ba mẹ.',
    CreatedAt: '2026-05-30 10:45'
  },
  {
    ResultId: 'RES-103',
    ChildId: 'CHD-001',
    ExerciseId: 'EX-04',
    CompletionStatus: 'Incomplete',
    Score: 60,
    FeedbackText: 'Con bị mệt cơ quanh vòm họng ở phút thứ 11 nên dải âm gió s bị lẫn dẹt nhẹ hơi. Ba mẹ cho con nghỉ uống ngụm nước ấm rồi chơi lại nha.',
    CreatedAt: '2026-05-31 14:20'
  },

  // For Mimi CHD-002
  {
    ResultId: 'RES-201',
    ChildId: 'CHD-002',
    ExerciseId: 'EX-06',
    CompletionStatus: 'Completed',
    Score: 97,
    FeedbackText: 'Các phụ từ tr, gi uốn lưỡi rất gọn gàng và tròn trịa. Giọng mộc ngân vang sảng khoái!',
    CreatedAt: '2026-05-30 15:10'
  },
  {
    ResultId: 'RES-202',
    ChildId: 'CHD-002',
    ExerciseId: 'EX-05',
    CompletionStatus: 'Completed',
    Score: 93,
    FeedbackText: 'Trải nghiệm Anh - Việt lồng vần mượt mà. Đề bồi thêm các từ cụm gió ghép rộng hơn con nhé.',
    CreatedAt: '2026-05-31 11:30'
  }
];

// Mapping suggestions with reasons tailored for each child
const SUGGESTIONS_MAP: Record<string, SuggestedExercise[]> = {
  'CHD-001': [
    {
      ...MOCK_EXERCISES[1], // EX-02 Lấy hơi thổi bong bóng
      RecommendationReason: 'Rèn luyện thêm thể lực đàn hồi cho cột hơi của Leo, giúp khắc phục nhược điểm nhanh mệt cơ vòm họng.'
    },
    {
      ...MOCK_EXERCISES[3], // EX-04 Gặp gỡ thần gió S-X
      RecommendationReason: 'Hỗ trợ nắn chỉnh vị trí đặt lưỡi răng khít, sửa lỗi bẹt âm gió S và X nhẹ khi con phát âm lâu.'
    }
  ],
  'CHD-002': [
    {
      ...MOCK_EXERCISES[4], // EX-05 The Magic S-X
      RecommendationReason: 'Nâng cao thể tích phổi và điều hòa lực rít hơi răng khép với chu kỳ thử thách ngoại ngữ thú vị hơn.'
    },
    {
      ...MOCK_EXERCISES[5], // EX-06 Vòng đấu âm kép TR-GI
      RecommendationReason: 'Rèn luyện giữ nhịp thơ uốn hố lưỡi kép trong câu cú dài, bổ trợ lỗi hơi ngắt giữa câu.'
    }
  ]
};

export default function ParentRecommendations() {
  const [selectedChildId, setSelectedChildId] = useState<string>('CHD-001');

  // Currently selected Child details
  const currentChild = useMemo(() => {
    return MOCK_CHILDREN.find(ch => ch.ChildId === selectedChildId) || MOCK_CHILDREN[0];
  }, [selectedChildId]);

  // Child's analysis
  const childAnalysis = useMemo(() => {
    return MOCK_ANALYSES.find(an => an.ChildId === currentChild.ChildId) || MOCK_ANALYSES[0];
  }, [currentChild]);

  // Suggested exercises
  const suggestedExercises = useMemo(() => {
    return SUGGESTIONS_MAP[currentChild.ChildId] || [];
  }, [currentChild]);

  // Feedbacks with exercise names populated
  const relevantResults = useMemo(() => {
    const results = MOCK_RESULTS.filter(res => res.ChildId === currentChild.ChildId);
    return results.map(res => {
      const matchedEx = MOCK_EXERCISES.find(ex => ex.ExerciseId === res.ExerciseId);
      return {
        ...res,
        ExerciseName: matchedEx ? matchedEx.ExerciseName : 'Bài chơi ảo tương tác'
      };
    });
  }, [currentChild]);

  const getProgressStyles = (level: Analysis['ProgressLevel']) => {
    const configs = {
      Improving: {
        bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        dot: 'bg-emerald-500',
        label: 'Tiến bộ vượt trội'
      },
      Stable: {
        bg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
        dot: 'bg-cyan-500',
        label: 'Ổn định vững vàng'
      },
      'Need Support': {
        bg: 'bg-rose-50 text-rose-500 border-rose-100',
        dot: 'bg-rose-500',
        label: 'Cần đồng hành thêm'
      }
    };
    return configs[level] || configs.Stable;
  };

  const progressStyle = getProgressStyles(childAnalysis.ProgressLevel);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 text-left" id="parent-recommendations-view">
      
      {/* 1. Header: Friendly Kids-centric design card */}
      <div className="bg-white/45 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs bg-[#FF8E8E]/10 text-[#FF8E8E] px-3.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-[#FF8E8E]" />
              Nhà thông thái đồng hành
            </span>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">
              Lời khuyên tại nhà
            </span>
          </div>

          <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">
            Khuyến Nghị Luyện Tập
          </h1>
          <p className="text-gray-500 font-bold text-sm">
            Gợi ý các hoạt động hỗ trợ thiết thực giúp con nâng cao giọng nói tự nhiên hàng ngày
          </p>
        </div>

        {/* 2. Child selector inside header style context */}
        <div className="bg-[#4EACAF]/10 border-2 border-dashed border-[#4EACAF]/25 p-4 rounded-3xl shrink-0 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#4EACAF] rounded-2xl flex items-center justify-center shrink-0 text-white">
            <Baby className="w-5.5 h-5.5" />
          </div>
          <div className="space-y-1 flex-1 select-none">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block leading-none">Học sinh được chấm điểm:</span>
            <div className="relative min-w-[200px]">
              <select
                value={selectedChildId}
                onChange={(e) => {
                  setSelectedChildId(e.target.value);
                }}
                className="w-full bg-transparent border-0 font-black text-[#264E50] text-sm pr-8 outline-none cursor-pointer focus:ring-0 leading-tight"
              >
                {MOCK_CHILDREN.map(ch => (
                  <option key={ch.ChildId} value={ch.ChildId}>👦 {ch.FullName} ({ch.Age} tuổi)</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4EACAF] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Summary metrics statistic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="recommendations-summary-cards">
        
        {/* Metric 1: Average Score */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#FFA800] shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 text-[#FFA800]">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{childAnalysis.AverageScore}đ</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Điểm bình quân nói</p>
          </div>
        </div>

        {/* Metric 2: Progress level indicator badge */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-indigo-400 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 text-indigo-500">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
              progressStyle.bg
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", progressStyle.dot)} />
              {progressStyle.label}
            </span>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Xếp hạng tiến độ</p>
          </div>
        </div>

        {/* Metric 3: Exercises completed */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-teal-400 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0 text-[#4EACAF]">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              {childAnalysis.CompletedExercises}/{childAnalysis.TotalExercises}
            </p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Nhiệm vụ vượt ải</p>
          </div>
        </div>

        {/* Metric 4: Total practice hours */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#FF8E8E] shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0 text-[#FF8E8E]">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{childAnalysis.TotalPracticeTime} Phút</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tích lũy âm ngữ tương tác</p>
          </div>
        </div>

      </div>

      {/* 4. Recommendation sections & 5. Suggested Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section (2/3 width) - Detailed Strengths, Weaknesses, Pedagogical advice */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Analysis box for Strengths vs Areas to improve */}
          <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8">
            <div className="border-b border-gray-50 pb-5">
              <h3 className="text-2xl font-black text-gray-950 italic">Dấu mộc ngôn từ của con</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Phân tích chuyên môn cụ thể về dải phát âm của trẻ từ 7-11 tuổi</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Strengths lists */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <ThumbsUp className="w-4.5 h-4.5 text-emerald-500" />
                  Điểm mạnh phát âm tốt
                </h4>
                <div className="space-y-3">
                  {childAnalysis.Strengths.map((str, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/20 text-xs font-semibold text-emerald-800 leading-relaxed">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses lists */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-[#FF8E8E] uppercase tracking-widest flex items-center gap-2">
                  <ThumbsDown className="w-4.5 h-4.5" />
                  Góc can thiệp (Cần uốn lại)
                </h4>
                <div className="space-y-3">
                  {childAnalysis.Weaknesses.map((weak, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-rose-50/40 rounded-2xl border border-rose-100/20 text-xs font-semibold text-rose-800 leading-relaxed">
                      <span className="w-2 h-2 rounded-full bg-[#FF8E8E] mt-1.5 shrink-0 animate-pulse" />
                      <span>{weak}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Core Recommendation statement advice from master educator */}
          <div className="bg-[#FFFDF5] rounded-[40px] p-8 md:p-10 border-2 border-[#F2ECD8] space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-600">
                <Lightbulb className="w-6 h-6 fill-amber-100" />
              </div>
              <div>
                <h4 className="text-xs text-amber-600 font-black uppercase tracking-widest leading-none">Chỉ dẫn định bài tại nhà cho cha mẹ</h4>
                <h3 className="text-lg font-black text-gray-850 italic mt-1.5 leading-none">Trích lược khuyến nghị sư phạm vàng</h3>
              </div>
            </div>

            <p className="text-gray-700 font-bold text-sm leading-relaxed p-6 bg-white/70 rounded-3xl border border-yellow-101/40">
              &ldquo;{childAnalysis.Recommendation}&rdquo;
            </p>

            <div className="text-[11px] text-gray-400 font-semibold border-t border-yellow-105 pt-4 flex justify-between items-center bg-transparent">
              <span>Hệ thống phân tích lần cuối: <strong className="text-gray-600">{childAnalysis.LastAnalyzedAt}</strong></span>
              <span className="text-amber-600 font-black uppercase tracking-wider">Hạ nhiễu lọc âm mộc</span>
            </div>
          </div>

        </div>

        {/* Right Section (1/3 width) - Suggested exercises and reason */}
        <div className="space-y-8">
          
          {/* Suggested Exercises List */}
          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="border-b border-gray-50 pb-4">
              <h3 className="text-xl font-black text-gray-900 leading-none italic">Bài tập nên luyện tiếp</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Huấn tự chuyên biệt cho vùng lưỡi của con</p>
            </div>

            <div className="space-y-5">
              {suggestedExercises.map((ex, idx) => (
                <div key={ex.ExerciseId} className="bg-slate-50/60 p-5 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase font-black bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded">
                        {ex.TargetSkill}
                      </span>
                      <h4 className="text-sm font-extrabold text-gray-850 leading-tight">
                        {ex.ExerciseName}
                      </h4>
                    </div>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0",
                      ex.DifficultyLevel === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                      ex.DifficultyLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'
                    )}>
                      {ex.DifficultyLevel === 'Easy' ? 'Mức Dễ' : ex.DifficultyLevel === 'Medium' ? 'Trung bình' : 'Vượt khó'}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed p-4 bg-white rounded-2xl border border-slate-100/50">
                    <strong className="text-slate-700 font-black block mb-1">💡 Lý do khuyên luyện:</strong>
                    {ex.RecommendationReason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Recent direct feedback list */}
          <div className="bg-[#4EACAF]/5 rounded-[40px] p-8 border border-[#4EACAF]/20 shadow-sm space-y-6">
            <div className="border-b border-[#4EACAF]/10 pb-4">
              <h3 className="text-xl font-black text-[#264E50] leading-none italic flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#4EACAF]" />
                Nhận xét gần đây
              </h3>
              <p className="text-xs text-[#4EACAF]/70 font-bold uppercase tracking-wider mt-1.5">Nhận xét thực tế ảo từ giáo viên đồng hành</p>
            </div>

            <div className="space-y-4">
              {relevantResults.map((res) => (
                <div key={res.ResultId} className="bg-white p-5 rounded-3xl space-y-3.5 border border-[#4EACAF]/10">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <div className="space-y-0.5">
                      <strong className="text-gray-800 font-extrabold text-xs block leading-tight truncate max-w-[150px]">
                        🎯 {res.ExerciseName}
                      </strong>
                      <span className="text-[8px] text-gray-400 font-bold">{res.CreatedAt}</span>
                    </div>
                    
                    <span className="font-mono text-[#4EACAF] text-sm font-black italic">{res.Score}đ</span>
                  </div>

                  <p className="text-xs text-gray-600 font-bold italic leading-relaxed">
                    &ldquo;{res.FeedbackText}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* General advisory disclaimer banner adhering to strict guidelines: parent only, not medical device */}
      <div className="bg-[#FFF8F8] p-5.5 rounded-2xl border border-rose-100 flex gap-3 text-xs font-semibold leading-relaxed text-rose-700 text-left">
        <AlertCircle className="w-5 h-5 text-[#FF8E8E] shrink-0" />
        <span>Hệ thống phân tích dựa trên kết quả thu mẫu giọng của trẻ qua thiết bị thực tế ảo GodotXR nhằm khích lệ rèn luyện ngôn ngữ tại gia đình. Chỉ dẫn này mang tính bồi dưỡng, bổ trợ học tập, không có chức năng chẩn đoán sức khỏe y khoa hoặc thay thế tư vấn chuyên gia y sinh học chuyên sâu.</span>
      </div>

    </div>
  );
}
