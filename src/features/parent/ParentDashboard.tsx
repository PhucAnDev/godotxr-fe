import { useCallback, useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Play, RefreshCw, AlertTriangle } from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';
import { cn } from '../../lib/utils';
import { useChildManagementApi } from '../../hooks/useChildManagementApi';
import { getResultsByChild } from '../../services/resultService';
import type { ChildProfileResponse } from '../../services/childProfileService';
import type { ResultResponse } from '../../services/resultService';

interface ChartDataPoint {
  day: string;
  mins: number;
}

export default function ParentDashboard() {
  const { getMyChildProfiles } = useChildManagementApi();

  const [children, setChildren] = useState<ChildProfileResponse[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [results, setResults] = useState<ResultResponse[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    const exId = latestResult.exerciseId;
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      
      {/* Title & Children switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Chào mừng trở lại, Phụ huynh</h1>
        
        {children.length > 1 && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Đổi xem bé:</span>
            <CustomSelect
              value={String(selectedChildId || '')}
              onChange={(val) => handleChildChange(Number(val))}
              options={childOptions}
              className="w-48 font-black uppercase text-xs"
              variant="filter"
            />
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white/40 rounded-3xl border border-white/60">
          <RefreshCw className="h-10 w-10 text-[#4EACAF] animate-spin" />
          <p className="text-gray-500 font-bold">Đang tải dữ liệu hồ sơ trẻ...</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-6 flex gap-4 text-rose-800 text-sm font-bold items-center max-w-2xl mx-auto">
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
        <div className="bg-white rounded-[32px] p-12 text-center max-w-xl mx-auto border border-gray-150 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Chưa có hồ sơ bé nào</h3>
          <p className="text-slate-500 text-sm font-bold leading-relaxed">
            Hệ thống không tìm thấy hồ sơ trẻ em nào liên kết với tài khoản phụ huynh này. 
            Vui lòng chuyển qua tab <strong>Hồ sơ của bé</strong> để tạo hồ sơ cho bé.
          </p>
        </div>
      )}

      {!isLoading && selectedChild && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Child Profile Card */}
            <div className="lg:col-span-2 bg-[#4EACAF] rounded-[32px] p-1 shadow-lg h-full">
              <div className="bg-white rounded-[31px] p-8 h-full flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
                {isResultsLoading && (
                  <div className="absolute top-4 right-4 animate-spin text-[#4EACAF]">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                )}
                <div className="w-24 h-24 bg-orange-100 rounded-[28px] border-4 border-[#FDFCF5] shadow-md flex-shrink-0 overflow-hidden relative">
                  <img 
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedChild.fullName}`} 
                    alt={selectedChild.fullName} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="flex-1 space-y-4 text-center sm:text-left min-w-0">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 truncate">
                      {selectedChild.fullName}{' '}
                      <span className="text-xl font-medium text-gray-400 whitespace-nowrap">{selectedChild.age} tuổi</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-sm text-gray-600 font-bold">
                    <p className="truncate"><span className="text-gray-400">Mô-đun hiện tại:</span> {currentModule}</p>
                    <p><span className="text-gray-400">Cấp độ VR:</span> {vrLevel}</p>
                    <p><span className="text-gray-400">Tổng số phiên học VR:</span> {results.length}</p>
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
            <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-lg font-bold">Chuỗi hàng tuần</h4>
              <div className="flex items-center justify-between gap-2 px-2">
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
                      <span className="text-xs font-bold text-gray-400 uppercase">{day}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm font-medium text-[#4EACAF] text-center pt-2">
                {streakAndChartInfo.streakCount > 0 
                  ? `Chuỗi ${streakAndChartInfo.streakCount} ngày! Tiếp tục cố gắng!` 
                  : 'Hãy bắt đầu buổi luyện tập đầu tiên nhé!'}
              </p>
            </div>

            {/* Start Button Area */}
            <div className="lg:col-span-3 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xl font-bold flex items-center gap-3 text-slate-800">Thông tin bài luyện VR hôm nay</h4>
                <p className="text-sm text-gray-500 font-bold">Giám sát và xem nhiệm vụ được thiết lập sẵn trên kính VR.</p>
                <p className="text-xs text-[#4EACAF] font-semibold italic">Dữ liệu đồng bộ trực tiếp từ thiết bị kính VR của trẻ</p>
              </div>
              <button 
                type="button" 
                onClick={() => void fetchResults(selectedChildId!)}
                className="bg-[#4EACAF] hover:bg-[#3d8a8c] text-white px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 shadow-lg shadow-[#4EACAF]/20 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                Làm mới hôm nay
              </button>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h4 className="text-lg font-bold mb-8">Hoạt động luyện tập hàng tuần</h4>
            <div className="h-[300px] w-full">
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
                    tick={{ fill: '#999', fontSize: 12, fontWeight: 600 }} 
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
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, subtext, color, textColor }: { label: string; value: string; subtext: string; color: string; textColor: string }) {
  return (
    <div className={cn("rounded-[32px] p-6 flex flex-col justify-center items-center text-center shadow-sm border border-transparent", color, textColor)}>
      <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black">{value}</p>
      {subtext && <p className="text-xs font-bold opacity-75 mt-1">{subtext}</p>}
    </div>
  );
}
