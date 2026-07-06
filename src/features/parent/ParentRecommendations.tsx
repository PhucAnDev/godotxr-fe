import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import CustomSelect from '../../components/common/CustomSelect';
import { useChildManagementApi } from '../../hooks/useChildManagementApi';
import { getAnalyzesByChildId, type AnalyzeResponse } from '../../services/analyzeService';
import { getResultsByChild, type ResultResponse } from '../../services/resultService';
import { getExercises, type ExerciseResponse } from '../../services/exerciseService';
import type { ChildProfileResponse } from '../../services/childProfileService';

export interface SuggestedExercise {
  id: number;
  exerciseName: string;
  difficultyLevel: string;
  targetSkill: string;
  language: string;
  recommendationReason: string;
}

export default function ParentRecommendations() {
  const { getMyChildProfiles } = useChildManagementApi();
  const [children, setChildren] = useState<ChildProfileResponse[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [results, setResults] = useState<ResultResponse[]>([]);
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch children profiles on mount
  useEffect(() => {
    const fetchChildren = async () => {
      setIsLoading(true);
      const res = await getMyChildProfiles();
      if (res.success && res.data && res.data.length > 0) {
        setChildren(res.data);
        setSelectedChildId(res.data[0].id);
      } else {
        setChildren([]);
      }
      setIsLoading(false);
    };
    void fetchChildren();
  }, [getMyChildProfiles]);

  // 2. Fetch analysis, results, and exercises when selectedChildId changes
  useEffect(() => {
    const fetchChildData = async (childId: number) => {
      setIsDataLoading(true);
      setErrorMessage('');
      try {
        // Fetch analyses for the child
        const analysisRes = await getAnalyzesByChildId(childId);
        if (analysisRes.success && analysisRes.data && analysisRes.data.length > 0) {
          // Get the latest assessment
          setAnalysis(analysisRes.data[0]);
        } else {
          setAnalysis(null);
        }

        // Fetch results for the child
        const resultsRes = await getResultsByChild(childId);
        if (resultsRes.success && resultsRes.data) {
          setResults(resultsRes.data);
        } else {
          setResults([]);
        }

        // Fetch all exercises to map names
        const exercisesRes = await getExercises(1, 150);
        if (exercisesRes.success && exercisesRes.data) {
          setExercises(exercisesRes.data.items);
        } else {
          setExercises([]);
        }
      } catch (err) {
        setErrorMessage('Không thể kết nối dữ liệu từ máy chủ.');
      } finally {
        setIsDataLoading(false);
      }
    };

    if (selectedChildId) {
      void fetchChildData(selectedChildId);
    }
  }, [selectedChildId]);

  // Selected child object helper
  const currentChild = useMemo(() => {
    return children.find(ch => ch.id === selectedChildId) || null;
  }, [children, selectedChildId]);

  // Options for custom select child dropdown
  const childOptions = useMemo(() =>
    children.map(ch => ({
      value: String(ch.id),
      label: `👦 ${ch.fullName} (${ch.age} tuổi)`
    })),
    [children]);

  // Average Score
  const averageScore = useMemo(() => {
    if (results.length === 0) return 0;
    const total = results.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((total / results.length) * 10) / 10;
  }, [results]);

  // Xếp hạng tiến độ
  const progressStyle = useMemo(() => {
    const level = averageScore >= 85 ? 'Improving' : averageScore >= 70 ? 'Stable' : 'Need Support';
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
    return configs[level];
  }, [averageScore]);

  // Completed Exercises count
  const completedExercisesCount = useMemo(() => {
    const completedIds = new Set(
      results
        .filter(r => r.completionStatus === 'Completed')
        .map(r => r.exerciseId)
    );
    return completedIds.size;
  }, [results]);

  // Total exercises
  const totalExercisesCount = useMemo(() => {
    return exercises.length || 6;
  }, [exercises]);

  // Total practice time in minutes
  const totalPracticeTime = useMemo(() => {
    const totalSeconds = results.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    return Math.round(totalSeconds / 60);
  }, [results]);

  // Strengths parsing
  const strengths = useMemo(() => {
    if (!analysis?.strengths) {
      return [
        'Con rất tích cực tương tác và tham gia rèn luyện các bài học trong kính VR',
        'Khả năng làm quen và thao tác với thiết bị GodotXR rất nhanh nhẹn'
      ];
    }
    return analysis.strengths.split(/[\n;•]+/).map(s => s.trim()).filter(Boolean);
  }, [analysis]);

  // Weaknesses parsing
  const weaknesses = useMemo(() => {
    if (!analysis?.weaknesses) {
      return [
        'Cần tiếp tục duy trì luyện tập đều đặn hàng ngày để uốn nắn chuẩn các nguyên âm ghép',
        'Nhắc nhở con nghỉ ngơi thư giãn mắt sau mỗi phiên rèn luyện 15 phút'
      ];
    }
    return analysis.weaknesses.split(/[\n;•]+/).map(s => s.trim()).filter(Boolean);
  }, [analysis]);

  // Recommendation text
  const recommendationText = useMemo(() => {
    return analysis?.recommendation || 'Không có chẩn đoán hoặc khuyến nghị y tế nào đặc biệt. Ba mẹ hãy khuyến khích con luyện tập đều đặn các bài tập VR được giao để củng cố phản xạ âm ngữ tốt nhất.';
  }, [analysis]);

  // Last analyzed date string
  const lastAnalyzedDate = useMemo(() => {
    if (analysis?.createdAt) {
      return new Date(analysis.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' } as any);
    }
    return 'Chưa có đánh giá';
  }, [analysis]);

  // Dynamic suggested exercises
  const suggestedExercises = useMemo((): SuggestedExercise[] => {
    const matched: SuggestedExercise[] = [];
    
    for (const ex of exercises) {
      if (matched.length >= 2) break;
      
      const res = results.find(r => r.exerciseId === ex.id);
      if (!res) {
        matched.push({
          id: ex.id,
          exerciseName: ex.exerciseName,
          difficultyLevel: ex.difficultyLevel,
          targetSkill: ex.targetSkill,
          language: ex.language,
          recommendationReason: 'Bài tập rèn luyện mới dành cho bé. Ba mẹ khích lệ con tham gia trải nghiệm và vượt ải trên thiết bị VR.'
        });
      } else if (res.score < 80 || res.completionStatus !== 'Completed') {
        matched.push({
          id: ex.id,
          exerciseName: ex.exerciseName,
          difficultyLevel: ex.difficultyLevel,
          targetSkill: ex.targetSkill,
          language: ex.language,
          recommendationReason: `Bé đã thực hành bài tập này nhưng chưa đạt kết quả tối ưu (Điểm số gần nhất: ${res.score}đ). Ba mẹ khích lệ bé luyện thêm nhé.`
        });
      }
    }
    
    if (matched.length === 0 && exercises.length > 0) {
      matched.push({
        id: exercises[0].id,
        exerciseName: exercises[0].exerciseName,
        difficultyLevel: exercises[0].difficultyLevel,
        targetSkill: exercises[0].targetSkill,
        language: exercises[0].language,
        recommendationReason: 'Bé đã hoàn thành tốt bài này. Ba mẹ khuyên con ôn luyện lại định kỳ để củng cố phản xạ âm ngữ lâu dài.'
      });
      if (exercises.length > 1) {
        matched.push({
          id: exercises[1].id,
          exerciseName: exercises[1].exerciseName,
          difficultyLevel: exercises[1].difficultyLevel,
          targetSkill: exercises[1].targetSkill,
          language: exercises[1].language,
          recommendationReason: 'Bài tập ôn tập củng cố định hình cơ miệng và cột hơi.'
        });
      }
    }
    
    return matched;
  }, [exercises, results]);

  // Recent direct feedbacks
  const relevantResults = useMemo(() => {
    const filtered = results.filter(r => r.feedbackText && r.feedbackText.trim() !== '');
    const sorted = [...filtered].sort((a, b) => b.id - a.id);
    const top3 = sorted.slice(0, 3);
    
    return top3.map(res => {
      const matchedEx = exercises.find(ex => ex.id === res.exerciseId);
      return {
        ResultId: String(res.id),
        Score: res.score,
        FeedbackText: res.feedbackText || 'Con hoàn thành tốt phần rèn luyện của mình.',
        CreatedAt: res.completedAt ? new Date(res.completedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' } as any) : 'Vừa xong',
        ExerciseName: matchedEx ? matchedEx.exerciseName : 'Bài chơi ảo tương tác'
      };
    });
  }, [results, exercises]);

  // Loading indicator for entire screen during initial fetch
  if (isLoading && children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
        <RefreshCw className="w-10 h-10 text-[#4EACAF] animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Đang tải dữ liệu hồ sơ trẻ em...</p>
      </div>
    );
  }

  // Placeholder if no children registered
  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
        <Baby className="w-16 h-16 text-slate-300" />
        <h3 className="text-xl font-bold text-slate-700">Chưa có thông tin hồ sơ bé</h3>
        <p className="text-sm text-slate-500 max-w-sm">Hồ sơ trẻ em chưa được đăng ký dưới tài khoản này. Ba mẹ vui lòng liên hệ nhà trường hoặc quản trị viên.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 text-left" id="parent-recommendations-view">
      
      {/* 1. Header Card */}
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

        {/* 2. Child selector */}
        {children.length > 1 && (
          <div className="bg-[#4EACAF]/10 border-2 border-dashed border-[#4EACAF]/25 p-4 rounded-3xl shrink-0 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#4EACAF] rounded-2xl flex items-center justify-center shrink-0 text-white">
              <Baby className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1.5 flex-1 select-none">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block leading-none">Học sinh được chấm điểm:</span>
              <CustomSelect
                value={String(selectedChildId || '')}
                onChange={(val) => setSelectedChildId(Number(val))}
                options={childOptions}
                className="w-56 font-black uppercase text-xs"
                variant="filter"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Summary metrics cards */}
      {isDataLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-white/20 rounded-[32px] p-10 border border-slate-100/50">
          <RefreshCw className="w-8 h-8 text-[#4EACAF] animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Đang tính toán các chỉ số rèn luyện của bé...</p>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="recommendations-summary-cards">
            
            {/* Metric 1: Average Score */}
            <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#FFA800] shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 text-[#FFA800]">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{averageScore}đ</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Điểm bình quân nói</p>
              </div>
            </div>

            {/* Metric 2: Progress level */}
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

            {/* Metric 3: Tasks completed */}
            <div className="bg-white rounded-[32px] p-6 border-b-4 border-teal-400 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0 text-[#4EACAF]">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                  {completedExercisesCount}/{totalExercisesCount}
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Nhiệm vụ vượt ải</p>
              </div>
            </div>

            {/* Metric 4: Total practice time */}
            <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#FF8E8E] shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0 text-[#FF8E8E]">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{totalPracticeTime} Phút</p>
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
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Phân tích chuyên môn cụ thể về dải phát âm của trẻ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Strengths list */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <ThumbsUp className="w-4.5 h-4.5 text-emerald-500" />
                      Điểm mạnh phát âm tốt
                    </h4>
                    <div className="space-y-3">
                      {strengths.map((str, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/20 text-xs font-semibold text-emerald-800 leading-relaxed">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{str}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses list */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-[#FF8E8E] uppercase tracking-widest flex items-center gap-2">
                      <ThumbsDown className="w-4.5 h-4.5" />
                      Góc can thiệp (Cần uốn lại)
                    </h4>
                    <div className="space-y-3">
                      {weaknesses.map((weak, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-rose-50/40 rounded-2xl border border-rose-100/20 text-xs font-semibold text-rose-800 leading-relaxed">
                          <span className="w-2 h-2 rounded-full bg-[#FF8E8E] mt-1.5 shrink-0" />
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
                  &ldquo;{recommendationText}&rdquo;
                </p>

                <div className="text-[11px] text-gray-400 font-semibold border-t border-yellow-105 pt-4 flex justify-between items-center bg-transparent">
                  <span>Hệ thống phân tích lần cuối: <strong className="text-gray-600">{lastAnalyzedDate}</strong></span>
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
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Huấn tự chuyên biệt cho con</p>
                </div>

                <div className="space-y-5">
                  {suggestedExercises.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Chưa có bài tập nào được giao.</p>
                  ) : (
                    suggestedExercises.map((ex) => (
                      <div key={ex.id} className="bg-slate-50/60 p-5 rounded-3xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="text-[8px] uppercase font-black bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded">
                              {ex.targetSkill}
                            </span>
                            <h4 className="text-sm font-extrabold text-gray-850 leading-tight">
                              {ex.exerciseName}
                            </h4>
                          </div>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0",
                            ex.difficultyLevel === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                            ex.difficultyLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'
                          )}>
                            {ex.difficultyLevel === 'Easy' ? 'Mức Dễ' : ex.difficultyLevel === 'Medium' ? 'Trung bình' : 'Vượt khó'}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-500 font-semibold leading-relaxed p-4 bg-white rounded-2xl border border-slate-100/50">
                          <strong className="text-slate-700 font-black block mb-1">💡 Lý do khuyên luyện:</strong>
                          {ex.recommendationReason}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 6. Recent direct feedback list */}
              <div className="bg-[#4EACAF]/5 rounded-[40px] p-8 border border-[#4EACAF]/20 shadow-sm space-y-6">
                <div className="border-b border-[#4EACAF]/10 pb-4">
                  <h3 className="text-xl font-black text-[#264E50] leading-none italic flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#4EACAF]" />
                    Nhận xét gần đây
                  </h3>
                  <p className="text-xs text-[#4EACAF]/70 font-bold uppercase tracking-wider mt-1.5">Nhận xét từ giáo viên đồng hành</p>
                </div>

                <div className="space-y-4">
                  {relevantResults.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Chưa có nhận xét nào được lưu lại.</p>
                  ) : (
                    relevantResults.map((res) => (
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
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </>
      )}

      {/* General advisory disclaimer banner */}
      <div className="bg-[#FFF8F8] p-5.5 rounded-2xl border border-rose-100 flex gap-3 text-xs font-semibold leading-relaxed text-rose-700 text-left">
        <AlertCircle className="w-5 h-5 text-[#FF8E8E] shrink-0" />
        <span>Hệ thống phân tích dựa trên kết quả thu mẫu giọng của trẻ qua thiết bị thực tế ảo GodotXR nhằm khích lệ rèn luyện ngôn ngữ tại gia đình. Chỉ dẫn này mang tính bồi dưỡng, bổ trợ học tập, không có chức năng chẩn đoán sức khỏe y khoa hoặc thay thế tư vấn chuyên gia y sinh học chuyên sâu.</span>
      </div>

    </div>
  );
}
