import { useCallback, useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Flame,
  Play,
  RefreshCw,
  AlertTriangle,
  Award,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Info,
  ChevronRight
} from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';
import { cn, resolveAvatarUrl } from '../../lib/utils';
import { useChildManagementApi } from '../../hooks/useChildManagementApi';
import { getResultsByChild } from '../../services/resultService';
import { getLessons, type LessonResponse } from '../../services/lessonService';
import { parseInteractionLog } from '../learning-result/LearningResultManagement';
import type { ChildProfileResponse } from '../../services/childProfileService';
import type { ResultResponse } from '../../services/resultService';

interface ChartDataPoint {
  day: string;
  mins: number;
}

export interface LessonProgress {
  lessonId: string;
  lessonName: string;
  totalAttempts: number;
  firstAttempt: {
    score: number;
    maxScore: number;
    durationSeconds: number;
    correctCount: number;
    errorCount: number;
    date: string;
  };
  latestAttempt: {
    score: number;
    maxScore: number;
    durationSeconds: number;
    correctCount: number;
    errorCount: number;
    date: string;
  };
  metrics: {
    scoreDiff: number;
    durationDiff: number;
    correctDiff: number;
    errorDiff: number;
  };
  status: 'improving' | 'speed_up' | 'accuracy_up' | 'stable' | 'needs_practice';
  description: string;
}

function computeLessonProgress(results: ResultResponse[], lessons: LessonResponse[]): LessonProgress[] {
  const grouped: Record<string, ResultResponse[]> = {};
  results.forEach(res => {
    if (!res.lessonId) return;
    const lId = String(res.lessonId);
    if (!grouped[lId]) grouped[lId] = [];
    grouped[lId].push(res);
  });

  const progressList: LessonProgress[] = [];

  Object.entries(grouped).forEach(([lId, attempts]) => {
    const sorted = [...attempts].sort((a, b) => {
      const aTime = a.startedAt || a.completedAt || '';
      const bTime = b.startedAt || b.completedAt || '';
      return aTime.localeCompare(bTime);
    });

    if (sorted.length < 2) return;

    const first = sorted[0];
    const latest = sorted[sorted.length - 1];

    const lessonObj = lessons.find(l => String(l.id) === lId);
    const lessonName = lessonObj?.lessonName || first.lessonName || latest.lessonName || 'Bài tập tự do';
    const maxScore = lessonObj?.maxScore || 95;

    const firstScore = first.score ?? 0;
    const latestScore = latest.score ?? 0;
    const firstDuration = first.durationSeconds ?? 0;
    const latestDuration = latest.durationSeconds ?? 0;

    const firstEvents = first.interactionLog ? parseInteractionLog(first.interactionLog) : [];
    const latestEvents = latest.interactionLog ? parseInteractionLog(latest.interactionLog) : [];
    const firstCorrect = Math.max(first.correctCount ?? 0, firstEvents.filter(e => e.isCorrect === true).length);
    const latestCorrect = Math.max(latest.correctCount ?? 0, latestEvents.filter(e => e.isCorrect === true).length);
    const firstError = Math.max(first.errorCount ?? 0, firstEvents.filter(e => e.isCorrect === false).length);
    const latestError = Math.max(latest.errorCount ?? 0, latestEvents.filter(e => e.isCorrect === false).length);

    const scoreDiff = Math.round(latestScore - firstScore);
    const durationDiff = firstDuration - latestDuration; // positive = faster
    const correctDiff = latestCorrect - firstCorrect;
    const errorDiff = firstError - latestError; // positive = fewer errors

    let status: LessonProgress['status'] = 'stable';
    let description = '';

    const scorePctDiff = maxScore > 0 ? (scoreDiff / maxScore) * 100 : 0;
    const durationPctDiff = firstDuration > 0 ? (durationDiff / firstDuration) * 100 : 0;

    if (scorePctDiff >= 15 && durationPctDiff >= 10) {
      status = 'improving';
      description = `Bé tiến bộ vượt bậc! Vừa tăng chính xác phát âm (+${scoreDiff} điểm), vừa phản xạ nhanh hơn (+${durationDiff} giây).`;
    } else if (scoreDiff > 0 || errorDiff > 0) {
      status = 'accuracy_up';
      const scorePart = scoreDiff > 0
        ? `Điểm số tăng (+${scoreDiff} điểm)`
        : scoreDiff < 0
          ? `Điểm số giảm (${scoreDiff} điểm)`
          : 'Điểm số duy trì ổn định';
      const errorPart = errorDiff > 0
        ? `giảm ${errorDiff} lỗi phát âm sai`
        : errorDiff < 0
          ? `tăng ${Math.abs(errorDiff)} lỗi phát âm`
          : 'giữ vững độ chính xác';
      description = `Bé cải thiện rõ rệt về độ chính xác phát âm. ${scorePart} và ${errorPart}.`;
    } else if (durationPctDiff >= 15 && scoreDiff >= 0) {
      status = 'speed_up';
      description = `Bé phản xạ nhanh nhạy hơn hẳn! Rút ngắn thời gian làm bài đến ${durationDiff} giây mà vẫn giữ vững độ chính xác.`;
    } else if (scoreDiff < -10 || errorDiff < -3) {
      status = 'needs_practice';
      description = `Bé có dấu hiệu phát âm sai nhiều hơn hoặc giảm điểm số so với lần đầu. Cần ôn tập và hướng dẫn kỹ lưỡng hơn.`;
    } else {
      status = 'stable';
      description = `Bé duy trì năng lực ổn định ở bài học này qua các lần thực hành.`;
    }

    progressList.push({
      lessonId: lId,
      lessonName,
      totalAttempts: sorted.length,
      firstAttempt: {
        score: firstScore,
        maxScore,
        durationSeconds: firstDuration,
        correctCount: firstCorrect,
        errorCount: firstError,
        date: first.completedAt || first.startedAt || '',
      },
      latestAttempt: {
        score: latestScore,
        maxScore,
        durationSeconds: latestDuration,
        correctCount: latestCorrect,
        errorCount: latestError,
        date: latest.completedAt || latest.startedAt || '',
      },
      metrics: {
        scoreDiff,
        durationDiff,
        correctDiff,
        errorDiff,
      },
      status,
      description,
    });
  });

  return progressList;
}

export default function ParentDashboard() {
  const { getMyChildProfiles } = useChildManagementApi();

  const [children, setChildren] = useState<ChildProfileResponse[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [results, setResults] = useState<ResultResponse[]>([]);
  const [allLessons, setAllLessons] = useState<LessonResponse[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadLessons() {
      try {
        const res = await getLessons(1, 100);
        if (res.success && res.data?.items) {
          setAllLessons(res.data.items);
        }
      } catch (err) {
        console.error('Failed to load lessons for dashboard:', err);
      }
    }
    void loadLessons();
  }, []);

  const lessonProgressList = useMemo(() => {
    return computeLessonProgress(results, allLessons);
  }, [results, allLessons]);

  const fetchChildren = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    const result = await getMyChildProfiles();
    
    if (result.success && result.data) {
      setChildren(result.data);
      if (result.data.length > 0) {
        setSelectedChildId(result.data[0].id);
      }
    } else {
      setErrorMessage(result.errors?.join(' ') || result.message || 'Không thể tải danh sách hồ sơ của bé.');
    }
    setIsLoading(false);
  }, [getMyChildProfiles]);

  useEffect(() => {
    void fetchChildren();
  }, [fetchChildren]);

  const selectedChild = useMemo(() => {
    return children.find(ch => ch.id === selectedChildId) || null;
  }, [children, selectedChildId]);

  const childOptions = useMemo(() => {
    return children.map(ch => ({
      value: String(ch.id),
      label: `👦 ${ch.fullName}`
    }));
  }, [children]);

  const fetchResults = useCallback(async (childId: number) => {
    setIsResultsLoading(true);
    const result = await getResultsByChild(childId);
    if (result.success && result.data) {
      setResults(result.data);
    } else {
      setResults([]);
    }
    setIsResultsLoading(false);
  }, []);

  useEffect(() => {
    if (selectedChildId !== null) {
      void fetchResults(selectedChildId);
    } else {
      setResults([]);
    }
  }, [selectedChildId, fetchResults]);

  const handleChildChange = (childId: number) => {
    setSelectedChildId(childId);
  };

  // 1. Calculate VR Level from learning level
  const vrLevel = useMemo(() => {
    if (!selectedChild) return 0;
    const lvl = selectedChild.learningLevel?.toLowerCase() || '';
    if (lvl.includes('beginner') || lvl.includes('sơ')) return 1;
    if (lvl.includes('intermediate') || lvl.includes('trung')) return 3;
    if (lvl.includes('advanced') || lvl.includes('nâng')) return 5;
    return 2;
  }, [selectedChild]);

  // 2. Parse latest exercise/module from results
  const latestResult = useMemo(() => {
    if (results.length === 0) return null;
    const sorted = [...results].sort((a, b) => {
      const da = a.completedAt ? new Date(a.completedAt) : a.startedAt ? new Date(a.startedAt) : new Date(0);
      const db = b.completedAt ? new Date(b.completedAt) : b.startedAt ? new Date(b.startedAt) : new Date(0);
      return db.getTime() - da.getTime(); // newest first
    });
    return sorted[0];
  }, [results]);

  const currentModule = useMemo(() => {
    if (!latestResult) return 'Chưa bắt đầu';
    
    // Check if feedbackText can give clues or map based on exerciseId
    const exId = latestResult.exerciseId || 0;
    if (latestResult.feedbackText && latestResult.feedbackText.includes('Luyện tập:')) {
      return latestResult.feedbackText.split('Luyện tập:')[1]?.trim() || latestResult.feedbackText;
    }
    
    // Fallback lookup mapping
    if (exId % 3 === 0) return 'Phát âm nguyên âm đơn O-A-U';
    if (exId % 3 === 1) return 'Phân biệt âm vị khó';
    return 'Luyện hơi hít vòm họng';
  }, [latestResult]);

  // 3. Calculate streak and minutes per day for current week (Monday -> Sunday)
  const streakAndChartInfo = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, ...
    
    // Monday of current week
    const mondayDiff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(mondayDiff);
    monday.setHours(0, 0, 0, 0);

    const daysMins = [0, 0, 0, 0, 0, 0, 0];
    const daysWithData = [false, false, false, false, false, false, false];

    // Filter results of current week
    results.forEach(r => {
      const dStr = r.completedAt || r.startedAt;
      if (!dStr) return;
      const rDate = new Date(dStr);
      
      const sundayEnd = new Date(monday);
      sundayEnd.setDate(monday.getDate() + 7);
      
      if (rDate >= monday && rDate < sundayEnd) {
        const dayOfWeek = rDate.getDay(); // 0 Sunday, 1 Mon, ...
        const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon -> index 0, ..., Sun -> index 6
        daysMins[index] += r.durationSeconds / 60;
        daysWithData[index] = true;
      }
    });

    const chartData: ChartDataPoint[] = [
      { day: 'T2', mins: Math.round(daysMins[0] * 10) / 10 },
      { day: 'T3', mins: Math.round(daysMins[1] * 10) / 10 },
      { day: 'T4', mins: Math.round(daysMins[2] * 10) / 10 },
      { day: 'T5', mins: Math.round(daysMins[3] * 10) / 10 },
      { day: 'T6', mins: Math.round(daysMins[4] * 10) / 10 },
      { day: 'T7', mins: Math.round(daysMins[5] * 10) / 10 },
      { day: 'CN', mins: Math.round(daysMins[6] * 10) / 10 },
    ];

    const completedThisWeekCount = results.filter(r => {
      const dStr = r.completedAt || r.startedAt;
      if (!dStr) return false;
      const d = new Date(dStr);
      return d >= monday && d <= now;
    }).length;

    const lastSessionMins = latestResult ? Math.round(latestResult.durationSeconds / 60) : 0;
    
    // Relative time label
    let lastSessionSub = '';
    if (latestResult) {
      const dStr = latestResult.completedAt || latestResult.startedAt;
      if (dStr) {
        const date = new Date(dStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        
        if (d.getTime() === today.getTime()) {
          lastSessionSub = '(Hôm nay)';
        } else if (d.getTime() === yesterday.getTime()) {
          lastSessionSub = '(Hôm qua)';
        } else {
          lastSessionSub = `(${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})`;
        }
      }
    }

    const streakCount = daysWithData.filter(Boolean).length;

    return {
      chartData,
      daysWithData,
      completedThisWeekCount,
      lastSessionMins,
      lastSessionSub,
      streakCount,
    };
  }, [results, latestResult]);

  const getHasDataForDay = (dayName: string) => {
    const { daysWithData } = streakAndChartInfo;
    if (dayName === 'CN') return daysWithData[6];
    if (dayName === 'T2') return daysWithData[0];
    if (dayName === 'T3') return daysWithData[1];
    if (dayName === 'T4') return daysWithData[2];
    if (dayName === 'T5') return daysWithData[3];
    if (dayName === 'T6') return daysWithData[4];
    if (dayName === 'T7') return daysWithData[5];
    return false;
  };

  return (
    <div className="space-y-4 text-left">
      
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight leading-tight">
            Chào mừng trở lại, <span className="text-[#FF8E8E]">Phụ huynh</span>
          </h1>
        </div>
        
        {children.length > 1 && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-none">Đổi xem bé:</span>
            <CustomSelect
              value={String(selectedChildId || '')}
              onChange={(val) => handleChildChange(Number(val))}
              options={childOptions}
              className="w-48 font-medium uppercase text-xs"
              variant="filter"
            />
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white/40 rounded-3xl border border-white/60">
          <RefreshCw className="h-10 w-10 text-[#4EACAF] animate-spin" />
          <p className="text-gray-500 font-normal">Đang tải dữ liệu hồ sơ trẻ...</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 flex gap-4 text-rose-800 text-sm font-medium items-center max-w-2xl mx-auto">
          <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
          <button 
            type="button" 
            onClick={fetchChildren} 
            className="ml-auto bg-white border border-rose-200 px-4 py-2 rounded-xl hover:bg-rose-100/50"
          >
            Tải lại
          </button>
        </div>
      )}

      {!isLoading && children.length === 0 && !errorMessage && (
        <div className="bg-white rounded-xl p-12 text-center max-w-xl mx-auto border border-gray-150 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Chưa có hồ sơ bé nào</h3>
          <p className="text-slate-500 text-sm font-normal leading-relaxed">
            Hệ thống không tìm thấy hồ sơ trẻ em nào liên kết với tài khoản phụ huynh này. 
            Vui lòng chuyển qua tab <span className="font-semibold text-slate-700">Hồ sơ của bé</span> để tạo hồ sơ cho bé.
          </p>
        </div>
      )}

      {!isLoading && selectedChild && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Child Profile Card */}
            <div className="lg:col-span-2 bg-[#4EACAF] rounded-xl p-1 shadow-lg h-full">
              <div className="bg-white rounded-[28px] p-8 h-full flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
                {isResultsLoading && (
                  <div className="absolute top-4 right-4 animate-spin text-[#4EACAF]">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                )}
                <div className="w-24 h-24 bg-orange-100 rounded-[28px] border-4 border-[#FDFCF5] shadow-md flex-shrink-0 overflow-hidden relative">
                  <img 
                    src={resolveAvatarUrl(selectedChild.avatar, selectedChild.fullName, 'adventurer')} 
                    alt={selectedChild.fullName} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="flex-1 space-y-4 text-center sm:text-left min-w-0">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 truncate">
                      {selectedChild.fullName}{' '}
                      <span className="text-lg font-normal text-gray-400 whitespace-nowrap">{selectedChild.age} tuổi</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-sm text-gray-600 font-normal">
                    <p className="truncate"><span className="text-gray-400">Mô-đun hiện tại:</span> <span className="font-medium text-gray-800">{currentModule}</span></p>
                    <p><span className="text-gray-400">Cấp độ VR:</span> <span className="font-medium text-gray-800">{vrLevel}</span></p>
                    <p><span className="text-gray-400">Tổng số phiên học VR:</span> <span className="font-medium text-gray-800">{results.length}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Column */}
            <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                label="Số buổi hoàn thành" 
                value={String(streakAndChartInfo.completedThisWeekCount)} 
                subtext="(Tuần này)" 
                color="bg-[#A4E0E2]" 
                textColor="text-cyan-900" 
              />
              <StatCard 
                label="Tần suất luyện tập" 
                value={`${streakAndChartInfo.completedThisWeekCount} lần/tuần`} 
                subtext="" 
                color="bg-[#FFB783]" 
                textColor="text-orange-900" 
              />
              <StatCard 
                label="Thời lượng gần nhất" 
                value={latestResult ? `${streakAndChartInfo.lastSessionMins} phút` : 'Chưa học'} 
                subtext={streakAndChartInfo.lastSessionSub} 
                color="bg-[#CFB6F2]" 
                textColor="text-purple-900" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Streak View */}
            <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold mb-6">Chuỗi hàng tuần</h4>
                <div className="flex items-center justify-between gap-2 px-2 py-4">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => {
                    const hasData = getHasDataForDay(day);
                    return (
                      <div key={day} className="flex flex-col items-center gap-2">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm",
                          hasData ? "bg-[#20D0D4] text-white" : "bg-gray-100 text-gray-400"
                        )}>
                          {hasData && <Flame className="w-5 h-5 fill-current animate-pulse" />}
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-sm font-medium text-[#4EACAF] text-center pt-2">
                {streakAndChartInfo.streakCount > 0 
                  ? `Chuỗi ${streakAndChartInfo.streakCount} ngày! Tiếp tục cố gắng!` 
                  : 'Hãy bắt đầu buổi luyện tập đầu tiên nhé!'}
              </p>
            </div>

            {/* Activity Chart */}
            <div className="lg:col-span-3 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold mb-6">Hoạt động luyện tập hàng tuần</h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={streakAndChartInfo.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#20D0D4" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#20D0D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#999', fontSize: 12, fontWeight: 500 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#999', fontSize: 12 }} 
                      unit="m"
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#20D0D4', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mins" 
                      name="Thời lượng"
                      stroke="#20D0D4" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorMins)" 
                      dot={{ fill: '#20D0D4', strokeWidth: 4, stroke: '#fff', r: 6 }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section: Phân tích tiến bộ chi tiết theo bài học */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4EACAF]/10 text-[#4EACAF] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 leading-snug">
                    Phân tích tiến bộ chi tiết theo bài học
                  </h3>
                  <p className="text-xs text-gray-400 font-normal mt-0.5">
                    So sánh kết quả giữa lần đầu tiên và lần thực hành gần nhất của bé qua từng bài học VR
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                {lessonProgressList.length > 0 && (
                  <span className="text-xs bg-[#4EACAF]/10 text-[#4EACAF] px-3.5 py-1 rounded-full font-semibold">
                    {lessonProgressList.length} bài học có dữ liệu tiến bộ
                  </span>
                )}
                <a
                  href="#/parent/progress"
                  className="text-xs font-semibold text-[#4EACAF] hover:text-[#3d8c8e] transition-colors flex items-center gap-1 hover:underline"
                >
                  Xem phân tích đầy đủ <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {isResultsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin text-[#4EACAF]" />
                <span className="text-xs font-normal">Đang phân tích tiến bộ bài học của bé...</span>
              </div>
            ) : lessonProgressList.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2 bg-slate-50/50 rounded-2xl border border-slate-100/80 p-8">
                <Award className="w-10 h-10 text-gray-300 mx-auto stroke-1" />
                <p className="text-sm font-semibold text-gray-700">Chưa có bài học nào được luyện tập từ 2 lần trở lên</p>
                <p className="text-xs font-normal text-gray-400 max-w-md mx-auto leading-relaxed">
                  Hệ thống cần ít nhất 2 lượt thực hành của cùng một bài học để tiến hành đánh giá và đo lường sự tiến bộ của bé. Hãy tiếp tục khuyến khích bé rèn luyện nhé!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessonProgressList.map((progress, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 space-y-4 text-left animate-in fade-in duration-350"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 pb-3">
                      <div className="space-y-1">
                        <h5 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-[#4EACAF]" />
                          {progress.lessonName}
                        </h5>
                        <span className="text-[11px] font-normal text-slate-400 block">
                          Tổng số: {progress.totalAttempts} lượt thực hành
                        </span>
                      </div>

                      {/* Progress status tag */}
                      <div className="self-start sm:self-auto">
                        {progress.status === 'improving' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold uppercase tracking-wider">
                            🚀 Tiến bộ vượt bậc
                          </span>
                        )}
                        {progress.status === 'accuracy_up' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-semibold uppercase tracking-wider">
                            📈 Tăng chính xác
                          </span>
                        )}
                        {progress.status === 'speed_up' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-semibold uppercase tracking-wider">
                            ⚡ Tăng tốc độ
                          </span>
                        )}
                        {progress.status === 'needs_practice' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-xs font-semibold uppercase tracking-wider">
                            ⚠️ Cần ôn tập thêm
                          </span>
                        )}
                        {progress.status === 'stable' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold uppercase tracking-wider">
                            🟢 Duy trì ổn định
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Comparison Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Score Comparison */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Điểm số</span>
                          <div className="text-xs font-bold text-slate-800">
                            {progress.firstAttempt.score}đ → {progress.latestAttempt.score}đ
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-medium flex items-center gap-0.5 px-2 py-0.5 rounded-lg",
                          progress.metrics.scoreDiff > 0
                            ? "bg-emerald-50 text-emerald-600"
                            : progress.metrics.scoreDiff < 0
                              ? "bg-rose-50 text-rose-600"
                              : "bg-slate-50 text-slate-500"
                        )}>
                          {progress.metrics.scoreDiff > 0 && <ArrowUp className="w-3 h-3" />}
                          {progress.metrics.scoreDiff < 0 && <ArrowDown className="w-3 h-3" />}
                          {progress.metrics.scoreDiff === 0 ? '0' : `${progress.metrics.scoreDiff > 0 ? '+' : ''}${progress.metrics.scoreDiff}`}
                        </span>
                      </div>

                      {/* Duration Comparison */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Thời lượng</span>
                          <div className="text-xs font-bold text-slate-800">
                            {progress.firstAttempt.durationSeconds}s → {progress.latestAttempt.durationSeconds}s
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-medium flex items-center gap-0.5 px-2 py-0.5 rounded-lg",
                          progress.metrics.durationDiff > 0
                            ? "bg-emerald-50 text-emerald-600"
                            : progress.metrics.durationDiff < 0
                              ? "bg-rose-50 text-rose-600"
                              : "bg-slate-50 text-slate-500"
                        )}>
                          {progress.metrics.durationDiff > 0 && <ArrowDown className="w-3 h-3 text-emerald-600" />}
                          {progress.metrics.durationDiff < 0 && <ArrowUp className="w-3 h-3 text-rose-600" />}
                          {progress.metrics.durationDiff === 0 ? '0s' : `${progress.metrics.durationDiff > 0 ? '-' : '+'}${Math.abs(progress.metrics.durationDiff)}s`}
                        </span>
                      </div>

                      {/* Errors Comparison */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Lỗi phát âm</span>
                          <div className="text-xs font-bold text-slate-800">
                            {progress.firstAttempt.errorCount} lỗi → {progress.latestAttempt.errorCount} lỗi
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-medium flex items-center gap-0.5 px-2 py-0.5 rounded-lg",
                          progress.metrics.errorDiff > 0
                            ? "bg-emerald-50 text-emerald-600"
                            : progress.metrics.errorDiff < 0
                              ? "bg-rose-50 text-rose-600"
                              : "bg-slate-50 text-slate-500"
                        )}>
                          {progress.metrics.errorDiff > 0 && <ArrowDown className="w-3 h-3 text-emerald-600" />}
                          {progress.metrics.errorDiff < 0 && <ArrowUp className="w-3 h-3 text-rose-600" />}
                          {progress.metrics.errorDiff === 0 ? '0' : `${progress.metrics.errorDiff > 0 ? '-' : '+'}${Math.abs(progress.metrics.errorDiff)}`}
                        </span>
                      </div>
                    </div>

                    {/* Educational Explanation Box */}
                    <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200/50 text-xs text-slate-600 leading-relaxed font-normal flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-[#4EACAF] shrink-0 mt-0.5" />
                      <span>{progress.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, subtext, color, textColor }: { label: string; value: string; subtext: string; color: string; textColor: string }) {
  return (
    <div className={cn("rounded-xl p-6 flex flex-col justify-center items-center text-center shadow-sm border border-transparent", color, textColor)}>
      <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subtext && <p className="text-xs font-normal opacity-75 mt-1">{subtext}</p>}
    </div>
  );
}
