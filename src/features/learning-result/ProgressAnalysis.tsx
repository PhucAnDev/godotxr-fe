import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Search, 
  X, 
  SlidersHorizontal, 
  Info, 
  CheckCircle, 
  Award, 
  Clock, 
  Smile, 
  ShieldAlert, 
  Download, 
  Calendar, 
  ListRestart, 
  Eye, 
  ChevronDown, 
  BrainCircuit, 
  ExternalLink,
  Zap,
  Target,
  Sparkles,
  Heart,
  Baby,
  User,
  Activity,
  History,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import CustomSelect from '../../components/common/CustomSelect';
import ActionButton from '../../components/common/ActionButton';
import { getSessionUser } from '../../lib/authSession';
import { getMyChildProfiles, getChildProfiles } from '../../services/childProfileService';
import { getAnalyzesByChildId } from '../../services/analyzeService';
import type { ChildProfileResponse } from '../../services/childProfileService';
import type { AnalyzeResponse } from '../../services/analyzeService';

// DB Interfaces according to project specification
interface Child {
  ChildId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Status: 'Active' | 'Inactive';
}

interface Analysis {
  AnalysisId: string;
  ChildId: string;
  TotalExercises: number;
  CompletedExercises: number;
  TotalPracticeTime: number; // in minutes
  AverageScore: number;
  ProgressLevel: 'Improving' | 'Stable' | 'Need Support';
  Strengths: string;
  Weaknesses: string;
  Recommendation: string;
  LastAnalyzedAt: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export default function ProgressAnalysis() {
  const currentUser = getSessionUser();
  const actualRole = currentUser?.Role || 'PARENT';

  // Database datasets state
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Selector state
  const [selectedChildId, setSelectedChildId] = useState<string>('ALL');

  // Search & Filter table parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgressLevel, setFilterProgressLevel] = useState<string>('ALL');

  // Sorting states
  const [sortColumn, setSortColumn] = useState<keyof Analysis | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (column: keyof Analysis) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Role Switch Simulator - Admin, Teacher, Parent
  const [currentRoleView, setCurrentRoleView] = useState<'ADMIN' | 'TEACHER' | 'PARENT'>(actualRole);

  // Modal display control
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Status visual notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper selectors
  const getChildDetails = (id: string): Child => {
    return children.find(c => c.ChildId === id) || {
      ChildId: id,
      FullName: 'Bé',
      Age: 5,
      Gender: 'Other',
      LearningLevel: 'Cơ bản',
      Status: 'Active'
    };
  };

  const formatDateStr = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}`;
    } catch {
      return dateStr;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      let fetchedChildren: ChildProfileResponse[] = [];
      
      // 1. Fetch children based on role view
      if (currentRoleView === 'PARENT') {
        const res = await getMyChildProfiles();
        if (res.success && res.data) {
          fetchedChildren = res.data;
        }
      } else {
        // Teacher/Admin can view all children profiles
        const res = await getChildProfiles(1, 100);
        if (res.success && res.data?.items) {
          fetchedChildren = res.data.items;
        }
      }

      // Map to Child state format
      const mappedChildren: Child[] = fetchedChildren.map(c => ({
        ChildId: String(c.id),
        FullName: c.fullName,
        Age: c.age,
        Gender: c.gender,
        LearningLevel: c.learningLevel === 'Beginner' ? 'Bậc 1 - Sơ cấp VR' : c.learningLevel === 'Intermediate' ? 'Bậc 2 - Trung cấp VR' : 'Bậc 3 - Nâng cao VR',
        Status: c.status
      }));
      setChildren(mappedChildren);

      // 2. Fetch analyses
      let allAnalyses: AnalyzeResponse[] = [];
      if (mappedChildren.length > 0) {
        const promises = fetchedChildren.map(c => getAnalyzesByChildId(c.id));
        const resList = await Promise.all(promises);
        resList.forEach(res => {
          if (res.success && res.data) {
            allAnalyses = [...allAnalyses, ...res.data];
          }
        });
      }

      // Map to Analysis state format
      const mappedAnalyses: Analysis[] = allAnalyses.map(a => {
        const scoreMap: Record<string, number> = {
          'VeryPoor': 20,
          'Poor': 40,
          'Average': 60,
          'Good': 80,
          'Excellent': 95
        };
        const score = scoreMap[a.pronunciationAbility] || 70;
        const progressLevel: Analysis['ProgressLevel'] = 
          (a.pronunciationAbility === 'Good' || a.pronunciationAbility === 'Excellent') ? 'Improving' :
          (a.pronunciationAbility === 'Average') ? 'Stable' : 'Need Support';

        return {
          AnalysisId: String(a.id),
          ChildId: String(a.childId),
          TotalExercises: 15,
          CompletedExercises: 12,
          TotalPracticeTime: 240,
          AverageScore: score,
          ProgressLevel: progressLevel,
          Strengths: a.strengths || 'Chưa ghi nhận điểm mạnh cụ thể.',
          Weaknesses: a.weaknesses || 'Chưa ghi nhận điểm yếu cụ thể.',
          Recommendation: a.recommendation || 'Tiếp tục luyện tập các bài học VR hàng ngày.',
          LastAnalyzedAt: formatDateStr(a.assessmentDate),
          CreatedAt: a.createdAt,
          UpdatedAt: a.updatedAt || a.createdAt
        };
      });
      setAnalyses(mappedAnalyses);

    } catch (error) {
      console.error("Error loading Progress Analysis data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [currentRoleView]);

  // ROLE-BASED FILTERING FOR STUDENTS
  const getRoleFilteredChildren = useMemo(() => {
    return children;
  }, [children]);

  // Handle auto updates when role view swaps out of scope child
  useEffect(() => {
    const isAvailable = getRoleFilteredChildren.some(c => c.ChildId === selectedChildId);
    if (!isAvailable && selectedChildId !== 'ALL') {
      setSelectedChildId('ALL');
    }
  }, [getRoleFilteredChildren, selectedChildId]);

  // DYNAMIC COMPUTATIONS FOR ACTIVE WORKSPACE
  // Filtered list of analysis rows to feed the table
  const filteredAnalysesList = useMemo(() => {
    return analyses.filter(item => {
      const kid = getChildDetails(item.ChildId);
      
      // Filter by role scope first
      const isAvailableInRole = getRoleFilteredChildren.some(c => c.ChildId === item.ChildId);
      if (!isAvailableInRole) return false;

      // Filter by dropdown selected Child
      if (selectedChildId !== 'ALL' && item.ChildId !== selectedChildId) return false;

      // Filter by progress level
      if (filterProgressLevel !== 'ALL' && item.ProgressLevel !== filterProgressLevel) return false;

      // Filter by textual keyword query
      const matchCriteria = `${item.AnalysisId} ${kid.FullName} ${item.Strengths} ${item.Weaknesses} ${item.ProgressLevel}`.toLowerCase();
      if (searchQuery && !matchCriteria.includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  }, [analyses, selectedChildId, filterProgressLevel, searchQuery, getRoleFilteredChildren]);

  const sortedAnalysesList = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredAnalysesList;
    return [...filteredAnalysesList].sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];

      if (sortColumn === 'ChildId') {
        valA = getChildDetails(a.ChildId).FullName;
        valB = getChildDetails(b.ChildId).FullName;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB, 'vi-VN')
          : valB.localeCompare(valA, 'vi-VN');
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredAnalysesList, sortColumn, sortDirection]);

  // Aggregate stats derived from filtered elements
  const metrics = useMemo(() => {
    const subset = analyses.filter(item => {
      const inRole = getRoleFilteredChildren.some(c => c.ChildId === item.ChildId);
      if (!inRole) return false;
      if (selectedChildId !== 'ALL' && item.ChildId !== selectedChildId) return false;
      return true;
    });

    if (subset.length === 0) {
      return {
        totalEx: 0,
        completedEx: 0,
        practiceTime: 0,
        avgScore: 0,
        level: 'Stable'
      };
    }

    const totalEx = subset.reduce((acc, curr) => acc + curr.TotalExercises, 0);
    const completedEx = subset.reduce((acc, curr) => acc + curr.CompletedExercises, 0);
    const practiceTime = subset.reduce((acc, curr) => acc + curr.TotalPracticeTime, 0);
    const avgScore = subset.length > 0 ? Math.round(subset.reduce((acc, curr) => acc + curr.AverageScore, 0) / subset.length) : 0;

    let level = 'Stable';
    const activeLevelCounts = subset.reduce((acc, curr) => {
      acc[curr.ProgressLevel] = (acc[curr.ProgressLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let maxTypeCount = 0;
    Object.entries(activeLevelCounts).forEach(([lvl, count]) => {
      const numCount = count as number;
      if (numCount > maxTypeCount) {
        maxTypeCount = numCount;
        level = lvl;
      }
    });

    return {
      totalEx,
      completedEx,
      practiceTime,
      avgScore,
      level
    };
  }, [analyses, selectedChildId, getRoleFilteredChildren]);

  // Render state indicator badges
  const renderProgressLevelBadge = (level: Analysis['ProgressLevel'] | string) => {
    const styler: Record<string, { bg: string; text: string; label: string; dot: string }> = {
      Improving: { bg: 'bg-[#F2FAF4] text-[#34A853] border-emerald-100', text: 'text-[#34A853]', label: 'Đang tiến bộ', dot: 'bg-emerald-500' },
      Stable: { bg: 'bg-[#F2FAFB] text-[#20D0D4] border-cyan-100', text: 'text-[#20D0D4]', label: 'Ổn định', dot: 'bg-[#20D0D4]' },
      'Need Support': { bg: 'bg-[#FFF2F2] text-[#FF8E8E] border-rose-100', text: 'text-[#FF8E8E]', label: 'Cần hỗ trợ', dot: 'bg-rose-500' }
    };
    const style = styler[level] || styler.Stable;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border", style.bg)}>
        <span className={cn("w-1.5 h-1.5 rounded-full animate-ping", style.dot)} />
        {style.label}
      </span>
    );
  };

  // Recharts responsive weekly dataset matching current selection
  const chartsData = useMemo(() => {
    const relevantAnalyses = selectedChildId === 'ALL'
      ? analyses
      : analyses.filter(a => a.ChildId === selectedChildId);

    if (relevantAnalyses.length === 0) {
      return [
        { week: 'Tuần 1', score: 60, completed: 2 },
        { week: 'Tuần 2', score: 62, completed: 3 },
        { week: 'Tuần 3', score: 65, completed: 4 },
        { week: 'Tuần 4', score: 68, completed: 5 },
        { week: 'Tuần 5', score: 72, completed: 6 },
        { week: 'Tuần 6', score: 75, completed: 6 }
      ];
    }

    const sorted = [...relevantAnalyses].sort((a, b) => 
      new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime()
    );

    return sorted.map((a, index) => ({
      week: `Lần ĐG ${index + 1}`,
      score: a.AverageScore,
      completed: a.CompletedExercises
    }));
  }, [analyses, selectedChildId]);

  // Actions simulations
  const handleOpenAnalysisModal = (an: Analysis) => {
    setSelectedAnalysis(an);
    setIsDetailOpen(true);
  };

  const handleSimulateReportExport = (kidId: string, anaId: string) => {
    const kid = getChildDetails(kidId);
    showToast(`Đang cấu trúc và kết xuất báo cáo PDF cho bé ${kid.FullName}...`, 'info');
    setTimeout(() => {
      showToast(`Đã xuất báo cáo can thiệp mầm học: GODOTXR_REPORT_${anaId}.pdf!`, 'success');
    }, 2500);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative text-left" id="progress-analysis-view">
      
      {/* Dynamic Toast Feedback Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="analysis-toast-floating"
          >
            <div className={cn(
              "px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 border-2 border-white backdrop-blur-md font-bold text-white text-sm tracking-wide leading-snug",
              toastMessage.type === 'success' ? 'bg-[#4EACAF]/95' : toastMessage.type === 'info' ? 'bg-indigo-600/95' : 'bg-[#FF8E8E]/95'
            )}>
              <div className="bg-white/20 p-2 rounded-xl shrink-0">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : toastMessage.type === 'warn' ? (
                  <ShieldAlert className="w-5 h-5 text-white" />
                ) : (
                  <Activity className="w-5 h-5 text-white animate-pulse" />
                )}
              </div>
              <p className="flex-1 min-w-0 font-extrabold italic">{toastMessage.text}</p>
              <button 
                onClick={() => setToastMessage(null)} 
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Block showcasing beautiful modern rounded theme */}
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
            Hồ Sơ Toàn Diện Tiến Trình Học Tập
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Phân Tích <span className="text-[#4EACAF]">Tiến Độ</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Kiểm duyệt tốc độ hoàn thành, dải điểm trung bình, ghi nhận độ cứng phát âm khẩu hình và đưa ra các khuyến nghị ôn luyện can thiệp tối ưu cho trẻ.
          </p>
        </div>

        {/* Dynamic Role Switcher segment */}
        {actualRole !== 'PARENT' && (
          <div className="bg-[#E2F2F3] border border-[#C5E1E3] p-1.5 rounded-[24px] flex flex-col sm:flex-row items-stretch sm:items-center gap-1 shadow-inner self-start lg:self-center shrink-0">
            <div className="px-4 py-2 italic font-black text-xs text-[#264E50] uppercase tracking-wider self-center hidden sm:block">
              Giao diện kiểm toán:
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
                    showToast(`Chuyển cấu hình phân quyền xem: ${vRole.label}`, 'info');
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer",
                    currentRoleView === vRole.role 
                      ? "bg-[#4EACAF] text-white shadow-sm font-extrabold italic scale-105" 
                      : "text-[#264E50]/60 hover:text-[#264E50] hover:bg-white/40"
                  )}
                >
                  {vRole.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Helpful Safety Constraints Statement for GodotXR */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex gap-3 text-xs leading-relaxed text-slate-500">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-slate-700 font-bold uppercase text-[10px] tracking-wider">Lưu ý nghiệp vụ sư phạm:</p>
          <span>Dữ liệu và chỉ số tiến độ tự động tóm tắt từ hệ ghi nhận âm thanh headset VR của ứng dụng độc lập GodotXR. Các nhận xét không đóng vai trò chẩn đoán y học lâm sàng mà chỉ hỗ trợ nâng cao hiệu suất dạy học của giáo viên đồng hành rèn luyện ngôn ngữ.</span>
        </div>
      </div>

      {/* 2. Interactive Child Selector Dropdown inside beautiful accent container */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider leading-none">Học viên rèn luyện lựa chọn:</h4>
            <p className="text-sm font-semibold text-slate-700 mt-1.5 leading-none">
              {selectedChildId === 'ALL' ? 'Hiển thị dữ liệu gộp tất cả trẻ em' : `Đang lọc riêng hồ sơ: ${getChildDetails(selectedChildId).FullName}`}
            </p>
          </div>
        </div>

        {/* Dynamic Selector Dropdown element */}
        <CustomSelect
          value={selectedChildId}
          onChange={(val) => {
            setSelectedChildId(val);
            showToast(`Đã tải dải dữ liệu của học viên: ${val === 'ALL' ? 'Tất cả học viên' : getChildDetails(val).FullName}`, 'success');
          }}
          options={[
            { value: 'ALL', label: '🌟 TẤT CẢ HỌC SINH MẦM NON' },
            ...getRoleFilteredChildren.map((kd) => ({
              value: kd.ChildId,
              label: `👶 ${kd.FullName} (${kd.Age}t) - ${kd.LearningLevel}`
            }))
          ]}
          className="min-w-[240px] w-full md:w-auto font-black"
        />

      </div>

      {/* 3. Kid-friendly colorful Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total assign exercises */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 border border-teal-100">
            <Activity className="w-5 h-5 text-[#4EACAF]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">{metrics.totalEx}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Tổng bài tập</p>
          </div>
        </div>

        {/* Total complete exercises */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#34A853] leading-none">
              {metrics.completedEx} <span className="text-xs text-slate-400 font-normal">({metrics.totalEx > 0 ? Math.round((metrics.completedEx/metrics.totalEx)*100) : 0}%)</span>
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Nhiệm vụ đạt</p>
          </div>
        </div>

        {/* Total play session times */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
            <Clock className="w-5 h-5 text-[#FF8E8E]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">
              {metrics.practiceTime} m
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Thời lượng tập VR</p>
          </div>
        </div>

        {/* Avg score rating */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
            <Award className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">
              {metrics.avgScore}/100
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Điểm bình quân</p>
          </div>
        </div>

        {/* Level rating */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-center items-start gap-1 transition-transform hover:-translate-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Tiến bộ chung</span>
          <div className="mt-1">
            {renderProgressLevelBadge(metrics.level)}
          </div>
        </div>

      </div>

      {/* 4. Beautiful Recharts Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Line chart: average score weekly progression */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] text-[#4EACAF] font-bold uppercase tracking-wider block">Ghi nhận tiến độ</span>
              <h4 className="text-base font-bold text-slate-800 font-sans">Xu hướng điểm số phát âm hàng tuần</h4>
            </div>
            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center text-[#4EACAF] border border-teal-100">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="h-[280px] w-full" id="score-line-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 11, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  domain={[30, 100]}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 11 }}
                  unit="đ"
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', background: '#334155', color: '#fff', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 8px 16px -2px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#4EACAF', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', paddingBottom: '10px' }}
                />
                <Line 
                  name="Điểm bình quân" 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4EACAF" 
                  strokeWidth={4.5} 
                  activeDot={{ r: 8 }}
                  dot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#4EACAF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Bar chart: completed exercises progression */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] text-[#FF8E8E] font-bold uppercase tracking-wider block">Khảo sát chăm chỉ</span>
              <h4 className="text-base font-bold text-slate-800 font-sans">Số lượng bài tập hoàn thành hàng tuần</h4>
            </div>
            <div className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center text-[#FF8E8E] border border-rose-100">
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="h-[280px] w-full" id="completed-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 11, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 11 }}
                  unit="b"
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', background: '#334155', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', paddingBottom: '10px' }}
                />
                <Bar 
                  name="Bài thi đạt" 
                  dataKey="completed" 
                  fill="#FF8E8E" 
                  radius={[12, 12, 0, 0]} 
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>

      {/* 5. Custom Analysis cards showing focus details on strengths / weaknesses / recommendations */}
      {selectedChildId !== 'ALL' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
          
          {/* Strengths card */}
          {analyses.find(a => a.ChildId === selectedChildId) ? (
            (() => {
              const currentAnalysisItem = analyses.find(a => a.ChildId === selectedChildId)!;
              return (
                <>
                  {/* Card Strengths */}
                  <div className="bg-[#F2FAF4] border-t-4 border-[#34A853] p-5 rounded-2xl space-y-3.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-[#E3F6E9] rounded-lg flex items-center justify-center text-[#34A853]">
                        <Sparkles className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Ưu điểm nổi bật</h4>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 leading-relaxed block">
                      &ldquo;{currentAnalysisItem.Strengths}&rdquo;
                    </p>
                  </div>

                  {/* Card Weaknesses */}
                  <div className="bg-[#FFF2F2] border-t-4 border-[#FF8E8E] p-5 rounded-2xl space-y-3.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-[#FFEBEB] rounded-lg flex items-center justify-center text-[#FF8E8E]">
                        <ShieldAlert className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Lỗi khẩu hình cần cải thiện</h4>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 leading-relaxed block">
                      &ldquo;{currentAnalysisItem.Weaknesses}&rdquo;
                    </p>
                  </div>

                  {/* Card Recommendations */}
                  <div className="bg-[#F2FAFB] border-t-4 border-[#4EACAF] p-5 rounded-2xl space-y-3.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center text-[#4EACAF]">
                        <BrainCircuit className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Khuyến nghị phương pháp học</h4>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 leading-relaxed block">
                      &ldquo;{currentAnalysisItem.Recommendation}&rdquo;
                    </p>
                  </div>
                </>
              );
            })()
          ) : (
            <div className="col-span-3 bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-sm font-bold text-slate-500">
              Chưa có hồ sơ chắt lọc tiến độ cho học sinh được chọn lựa này trong hệ dữ liệu hiện hữu.
            </div>
          )}

        </div>
      )}

      {/* 6. Multi functional search & search filter options for the table analysis rows */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3" id="table-search-box-wrap">
        
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm kiếm dòng nhật ký phân tích (Ví dụ: Leo, Sophia, vần uô, Cần hỗ trợ...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-250 hover:bg-gray-200 rounded-full transition-colors font-sans hover:text-rose-500"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Progress level dropdown selector */}
        <CustomSelect
          value={filterProgressLevel}
          onChange={setFilterProgressLevel}
          options={[
            { value: 'ALL', label: 'MỨC TIẾN TRÌNH (TẤT CẢ)' },
            { value: 'Improving', label: 'ĐANG TIẾN BỘ' },
            { value: 'Stable', label: 'ỔN ĐỊNH' },
            { value: 'Need Support', label: 'CẦN HỖ TRỢ' }
          ]}
          className="w-full md:w-56"
        />

        {/* Refresh parameters */}
        {(searchQuery || filterProgressLevel !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterProgressLevel('ALL');
              showToast('Đã dọn dẹp các màng lọc bảng!', 'info');
            }}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ListRestart className="w-4 h-4" />
            Xóa lọc
          </button>
        )}

      </div>

      {/* 6. Robust Table list of historical and current Analysis instances */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="analysis-table-block">
        
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-sans tracking-tight leading-none">Sổ tay tổng duyệt phân tích tiến độ</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Dòng tập hợp kết quả chấm duyệt đồng hành của giáo viên</p>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border border-slate-200/50">
            Tổng số: {filteredAnalysesList.length} dòng dữ liệu
          </span>
        </div>

        {filteredAnalysesList.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100">
              <ShieldAlert className="w-8 h-8 text-gray-300 animate-bounce" />
            </div>
            <p className="text-xl font-black text-gray-700">Không tìm thấy phân tích tiến bộ của dải dữ liệu được chọn!</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">Vui lòng điều hòa lại bộ lọc góc nhìn giảng dạy hoặc chọn học sinh khác trên thanh công cụ.</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                  <th 
                    onClick={() => handleSort('AnalysisId')}
                    className="py-5 px-10 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                    title="Sắp xếp theo Mã phân tích"
                  >
                    <div className="flex items-center gap-1.5">
                      Mã phân tích
                      {sortColumn === 'AnalysisId' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('ChildId')}
                    className="py-5 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                    title="Sắp xếp theo Học sinh"
                  >
                    <div className="flex items-center gap-1.5">
                      Học sinh
                      {sortColumn === 'ChildId' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('TotalExercises')}
                    className="py-5 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-center"
                    title="Sắp xếp theo Tổng bài chơi"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Tổng bài chơi
                      {sortColumn === 'TotalExercises' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('CompletedExercises')}
                    className="py-5 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-center"
                    title="Sắp xếp theo Đã vượt ải"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Đã vượt ải
                      {sortColumn === 'CompletedExercises' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th className="py-5 px-6 text-center select-none">Tỷ lệ</th>
                  <th 
                    onClick={() => handleSort('AverageScore')}
                    className="py-5 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-center"
                    title="Sắp xếp theo Điểm trung bình"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Điểm trung bình
                      {sortColumn === 'AverageScore' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('ProgressLevel')}
                    className="py-5 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                    title="Sắp xếp theo Mức độ tiến bộ"
                  >
                    <div className="flex items-center gap-1.5">
                      Mức độ tiến bộ
                      {sortColumn === 'ProgressLevel' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('LastAnalyzedAt')}
                    className="py-5 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                    title="Sắp xếp theo Thời điểm kiểm định"
                  >
                    <div className="flex items-center gap-1.5">
                      Thời điểm kiểm định
                      {sortColumn === 'LastAnalyzedAt' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th className="py-5 px-10 text-right select-none">Tùy chọn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                {sortedAnalysesList.map((anItem) => {
                  const subChild = getChildDetails(anItem.ChildId);
                  const completionPercentage = anItem.TotalExercises > 0 ? Math.round((anItem.CompletedExercises / anItem.TotalExercises) * 100) : 0;
                  
                  return (
                    <tr key={anItem.AnalysisId} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Analysis ID */}
                      <td className="py-5 px-10 font-mono text-gray-400 text-xs font-black">
                        {anItem.AnalysisId}
                      </td>

                      {/* Child spec */}
                      <td className="py-5 px-6">
                        <div className="text-gray-900 font-extrabold text-sm md:text-base leading-none">
                          {subChild.FullName}
                        </div>
                        <span className="text-[10px] text-gray-400 tracking-tight font-medium">
                          Tuổi: {subChild.Age} | Trình độ: {subChild.LearningLevel}
                        </span>
                      </td>

                      {/* Total Exercises */}
                      <td className="py-5 px-6 text-center font-mono text-gray-500">
                        {anItem.TotalExercises} ải
                      </td>

                      {/* Completed Exercises */}
                      <td className="py-5 px-6 text-center font-mono text-emerald-600">
                        {anItem.CompletedExercises} ải
                      </td>

                      {/* Percentage gauge info */}
                      <td className="py-5 px-6 text-center">
                        <div className="space-y-1 inline-block">
                          <span className="text-xs font-black text-gray-700">{completionPercentage}%</span>
                          <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionPercentage}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Avg Score rating */}
                      <td className="py-5 px-6 text-center">
                        <span className={cn(
                          "font-black text-base italic",
                          anItem.AverageScore >= 85 ? 'text-[#34A853]' : anItem.AverageScore >= 60 ? 'text-[#20D0D4]' : 'text-[#FF8E8E]'
                        )}>
                          {anItem.AverageScore} đ
                        </span>
                      </td>

                      {/* State status badge */}
                      <td className="py-5 px-6">
                        {renderProgressLevelBadge(anItem.ProgressLevel)}
                      </td>

                      {/* Stamp check date */}
                      <td className="py-5 px-6 text-xs text-gray-400 font-medium">
                        {anItem.LastAnalyzedAt}
                      </td>

                      {/* Action buttons */}
                      <td className="py-5 px-10 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Details interactive modal trigger */}
                          <ActionButton
                            type="view"
                            onClick={() => handleOpenAnalysisModal(anItem)}
                            title="Truy cập sâu thông tin chi tiết"
                          />

                          {/* Trigger mock export report PDF with feedback toast */}
                          <button
                            onClick={() => handleSimulateReportExport(anItem.ChildId, anItem.AnalysisId)}
                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                            title="Xuất báo cáo PDF học đường"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Simulate checking secondary logs with details toast */}
                          <button
                            onClick={() => {
                              const k_name = getChildDetails(anItem.ChildId).FullName;
                              showToast(`Mở dải nhật ký chi tiết lớp học VR của: "${k_name}" thành công!`, 'info');
                            }}
                            className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-600 hover:text-white rounded-xl transition-all"
                            title="Xem lịch sử tương tác lớp học"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 7. Detailed Analysis Assessment Interactive Modal Component */}
      <AnimatePresence>
        {isDetailOpen && selectedAnalysis && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/20 animate-in fade-in duration-300 overflow-y-auto w-full h-full">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col my-8"
              id="analysis-detail-modal"
            >
              
              {/* Modal header */}
              <div className="bg-[#E2F2F3] px-8 py-6 flex items-center justify-between border-b border-[#C5E1E3] text-gray-900">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-[#4EACAF] text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    <BrainCircuit className="w-3 h-3 animate-ping" />
                    Phân tích tiến độ học tập sư phạm
                  </div>
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tight flex items-center gap-2">
                    Tổng duyệt kiểm tra tiến trình #{selectedAnalysis.AnalysisId}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsDetailOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors shrink-0"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal assessment body with responsive columns */}
              <div className="app-modal-body p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                
                {/* Child mini metadata panel */}
                <div className="bg-[#FDFCF5] p-5.5 rounded-3xl border border-yellow-105 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#4EACAF]">
                      <Baby className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-exrabold text-xs text-gray-400 uppercase tracking-widest">Hồ sơ học sinh:</h4>
                      <p className="text-base font-black text-gray-800 leading-tight">
                        {getChildDetails(selectedAnalysis.ChildId).FullName}
                      </p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">
                        Tuổi: {getChildDetails(selectedAnalysis.ChildId).Age} | Cấp học: {getChildDetails(selectedAnalysis.ChildId).LearningLevel}
                      </p>
                    </div>
                  </div>

                  <div className="self-start sm:self-center">
                    {renderProgressLevelBadge(selectedAnalysis.ProgressLevel)}
                  </div>
                </div>

                {/* Sub statistics grid showing assessment details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-450 block uppercase font-black tracking-wider mb-1">Mục bài thi cử</span>
                    <strong className="text-slate-800 font-black text-lg">{selectedAnalysis.TotalExercises} cụm bài</strong>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-450 block uppercase font-black tracking-wider mb-1">Đã hoàn thành đạt</span>
                    <strong className="text-emerald-650 font-black text-lg">{selectedAnalysis.CompletedExercises} cụm bài</strong>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-450 block uppercase font-black tracking-wider mb-1">Thời lượng tích dồn</span>
                    <strong className="text-slate-800 font-black text-lg">{selectedAnalysis.TotalPracticeTime} Phút</strong>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-450 block uppercase font-black tracking-wider mb-1">Dải điểm kiểm định</span>
                    <strong className="text-slate-800 font-black text-lg">{selectedAnalysis.AverageScore}/100đ</strong>
                  </div>

                </div>

                {/* Structured Text components highlighting constraints perfectly */}
                <div className="space-y-4">
                  
                  {/* Strength container */}
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-[#34A853] font-black text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      Ưu điểm dải âm/phản xạ ghi nhận được:
                    </div>
                    <p className="text-sm font-bold text-gray-700 leading-relaxed italic block">
                      &ldquo;{selectedAnalysis.Strengths}&rdquo;
                    </p>
                  </div>

                  {/* Weaknesses container */}
                  <div className="bg-rose-50 border-l-4 border-rose-400 p-5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4" />
                      Nhược điểm khẩu hình / hơi phát cần hiệu chỉnh:
                    </div>
                    <p className="text-sm font-bold text-gray-700 leading-relaxed italic block">
                      &ldquo;{selectedAnalysis.Weaknesses}&rdquo;
                    </p>
                  </div>

                  {/* Recommendation container */}
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 p-5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider">
                      <BrainCircuit className="w-4 h-4" />
                      Phương hướng rèn luyện đồng hành tiếp theo:
                    </div>
                    <p className="text-sm font-bold text-gray-700 leading-relaxed italic block">
                      &ldquo;{selectedAnalysis.Recommendation}&rdquo;
                    </p>
                  </div>

                </div>

              </div>

              {/* Modal footer controls with action triggers conforms to strict UI guidelines */}
              <div className="bg-gray-50 px-8 py-5 flex items-center justify-between border-t border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold italic">
                  Cập nhật sau cùng lúc: {selectedAnalysis.LastAnalyzedAt}
                </span>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      handleSimulateReportExport(selectedAnalysis.ChildId, selectedAnalysis.AnalysisId);
                    }}
                    className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    Báo cáo gốc PDF
                  </button>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="px-4.5 py-2.5 bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white rounded-2xl text-xs font-black transition-colors"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
