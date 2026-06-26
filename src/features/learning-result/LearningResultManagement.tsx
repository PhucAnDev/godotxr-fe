import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Eye, 
  SlidersHorizontal, 
  Award, 
  Clock, 
  ThumbsUp, 
  TrendingUp, 
  Volume2, 
  Play, 
  Info, 
  CheckCircle2, 
  HelpCircle, 
  Calendar, 
  ChevronDown, 
  Activity, 
  UserSquare2, 
  FileCheck2, 
  Sparkles, 
  FolderOpen, 
  BrainCircuit, 
  MessageSquareShare, 
  ShieldAlert,
  ArrowRight,
  ListRestart,
  Music,
  Tv
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import CustomSelect from '../../components/common/CustomSelect';
import { useLearningResultApi } from '../../hooks/useLearningResultApi';
import { getSessionUser } from '../../lib/authSession';
import type { ChildProfileResponse } from '../../services/childProfileService';
import type { EventLogResponse } from '../../services/eventLogService';
import type { ExerciseResponse } from '../../services/exerciseService';
import type { ResultResponse } from '../../services/resultService';
import type { PagedResponse, ServiceResult } from '../../services/serviceTypes';

// DB Interfaces according to specification
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

interface LearningResult {
  ResultId: string;
  ChildId: string;
  ExerciseId: string;
  AttemptNumber: number;
  CompletionStatus: 'Completed' | 'InProgress' | 'Failed' | 'NeedReview';
  Score: number;
  StartedAt: string;
  CompletedAt: string;
  DurationSeconds: number;
  AudioRecordUrl: string;
  ReplayDataUrl: string;
  InteractionLog: string; // JSON or text representation of interaction sequence
  FeedbackText: string;
  CreatedAt: string;
}

type RoleView = 'ADMIN' | 'TEACHER' | 'PARENT';

const API_PAGE_SIZE = 100;

function getStoredRoleView(): RoleView {
  const role = localStorage.getItem('user_role');

  if (role === 'TEACHER') return 'TEACHER';
  if (role === 'PARENT') return 'PARENT';
  return 'ADMIN';
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace('T', ' ').slice(0, 19);
}

function mapDifficultyLevel(level: string): Exercise['DifficultyLevel'] {
  const normalized = level.trim().toLowerCase();

  if (normalized === 'hard' || normalized === 'khó') return 'Khó';
  if (normalized === 'medium' || normalized === 'trung bình') {
    return 'Trung bình';
  }

  return 'Dễ';
}

function mapResultStatus(status: string): LearningResult['CompletionStatus'] {
  const normalized = status.trim().toLowerCase();

  if (normalized === 'completed') return 'Completed';
  if (normalized === 'needreview') return 'NeedReview';
  if (normalized === 'failed') return 'Failed';
  return 'InProgress';
}

function mapChildRecord(child: ChildProfileResponse): Child {
  return {
    ChildId: String(child.id),
    FullName: child.fullName,
    Age: child.age,
    LearningLevel: child.learningLevel,
  };
}

function mapExerciseRecord(exercise: ExerciseResponse): Exercise {
  return {
    ExerciseId: String(exercise.id),
    ExerciseName: exercise.exerciseName,
    DifficultyLevel: mapDifficultyLevel(exercise.difficultyLevel),
    TargetSkill: exercise.targetSkill,
    Language: exercise.language,
  };
}

function mapResultRecord(result: ResultResponse): LearningResult {
  const completedAt = formatDateTime(result.completedAt);
  const startedAt = formatDateTime(result.startedAt);

  return {
    ResultId: String(result.id),
    ChildId: String(result.childId),
    ExerciseId: String(result.exerciseId),
    AttemptNumber: result.attemptNumber,
    CompletionStatus: mapResultStatus(result.completionStatus),
    Score: Math.round(result.score),
    StartedAt: startedAt,
    CompletedAt: completedAt,
    DurationSeconds: result.durationSeconds,
    AudioRecordUrl: result.audioRecordUrl ?? '',
    ReplayDataUrl: result.replayDataUrl ?? '',
    InteractionLog: result.interactionLog ?? '',
    FeedbackText: result.feedbackText ?? '',
    CreatedAt: completedAt || startedAt,
  };
}

function formatEventLogs(logs: EventLogResponse[] | undefined): string {
  if (!logs || logs.length === 0) return '';

  return [...logs]
    .sort((left, right) => left.eventTime.localeCompare(right.eventTime))
    .map((log) => {
      const timeText = formatDateTime(log.eventTime);
      if (log.description) {
        return `${timeText} - ${log.eventType}: ${log.description}`;
      }
      return `${timeText} - ${log.eventType}`;
    })
    .join('\n');
}

async function loadAllPages<T>(
  loadPage: (
    pageNumber?: number,
    pageSize?: number
  ) => Promise<ServiceResult<PagedResponse<T>>>
): Promise<T[]> {
  const items: T[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  while (pageNumber <= totalPages) {
    const result = await loadPage(pageNumber, API_PAGE_SIZE);

    if (!result.success || !result.data) {
      throw new Error(result.errors.join(' ') || result.message);
    }

    items.push(...result.data.items);
    totalPages = Math.max(result.data.totalPages, 1);
    pageNumber += 1;
  }

  return items;
}

export default function LearningResultManagement() {
  const {
    getChildProfiles,
    getCurrentUserWithChildrenProfiles,
    getClassrooms,
    getEnrollments,
    getExercises,
    getResultById,
    getResultsByChild,
    getEventLogsByResult,
  } = useLearningResultApi();
  const [results, setResults] = useState<LearningResult[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [eventLogsByResultId, setEventLogsByResultId] = useState<
    Record<string, EventLogResponse[]>
  >({});

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [filterSkill, setFilterSkill] = useState<string>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<string>('ALL');

  const currentRoleView = getStoredRoleView();
  const canEditFeedback =
    currentRoleView === 'ADMIN' || currentRoleView === 'TEACHER';

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterDifficulty, filterSkill, filterDateRange]);

  // Simulation play helpers
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [playingReplayId, setPlayingReplayId] = useState<string | null>(null);

  // Detail Modal view controls
  const [selectedResult, setSelectedResult] = useState<LearningResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modal feedback editing logic (Simulate Admin/Teacher update feedback)
  const [editFeedbackMode, setEditFeedbackMode] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Audio Play simulation sound trigger
  const [isAudioSimulateActive, setIsAudioSimulateActive] = useState(false);

  // Toast feedback triggers
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      setIsApiLoading(true);
      setApiError(null);

      try {
        const roleView = getStoredRoleView();
        const sessionUser = getSessionUser();
        const [exerciseRecords, childRecords] = await Promise.all([
          loadAllPages(getExercises),
          roleView === 'PARENT'
            ? (async () => {
                const parentResult =
                  await getCurrentUserWithChildrenProfiles();

                if (!parentResult.success || !parentResult.data) {
                  throw new Error(
                    parentResult.errors.join(' ') || parentResult.message
                  );
                }

                return parentResult.data.childProfiles;
              })()
            : roleView === 'TEACHER'
              ? (async () => {
                  const [allChildren, classroomRecords, enrollmentRecords] =
                    await Promise.all([
                      loadAllPages(getChildProfiles),
                      loadAllPages(getClassrooms),
                      loadAllPages(getEnrollments),
                    ]);

                  const teacherId = sessionUser?.UserId;
                  const teacherClassIds = new Set(
                    classroomRecords
                      .filter((classroom) => String(classroom.userId) === teacherId)
                      .map((classroom) => classroom.id)
                  );
                  const teacherChildIds = new Set(
                    enrollmentRecords
                      .filter(
                        (enrollment) =>
                          teacherClassIds.has(enrollment.classId) &&
                          enrollment.status !== 'Cancelled'
                      )
                      .map((enrollment) => enrollment.childId)
                  );

                  return allChildren.filter((child) =>
                    teacherChildIds.has(child.id)
                  );
                })()
              : loadAllPages(getChildProfiles),
        ]);

        const resultSettled = await Promise.allSettled(
          childRecords.map((child) => getResultsByChild(child.id))
        );

        const rawResults = resultSettled.flatMap((settled) => {
          if (settled.status !== 'fulfilled') return [];
          if (!settled.value.success || !settled.value.data) return [];
          return settled.value.data;
        });

        const uniqueResults = Array.from(
          new Map(rawResults.map((result) => [result.id, result])).values()
        ).sort((left, right) => {
          const rightTime = right.completedAt ?? right.startedAt ?? '';
          const leftTime = left.completedAt ?? left.startedAt ?? '';
          return rightTime.localeCompare(leftTime);
        });

        if (cancelled) return;

        setChildren(childRecords.map(mapChildRecord));
        setExercises(exerciseRecords.map(mapExerciseRecord));
        setResults(uniqueResults.map(mapResultRecord));
      } catch (error) {
        if (cancelled) return;

        setApiError(
          error instanceof Error
            ? error.message
            : 'Khong the tai du lieu ket qua tu API.'
        );
      } finally {
        if (!cancelled) {
          setIsApiLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [
    getChildProfiles,
    getClassrooms,
    getCurrentUserWithChildrenProfiles,
    getEnrollments,
    getExercises,
    getResultsByChild,
  ]);

  // Helper getters
  const getChildInfo = (id: string): Child => {
    return children.find(c => c.ChildId === id) || { ChildId: id, FullName: 'Học sinh ẩn danh', Age: 8, LearningLevel: 'Bậc 1' };
  };

  const getExerciseInfo = (id: string): Exercise => {
    return exercises.find(e => e.ExerciseId === id) || { ExerciseId: id, ExerciseName: 'Bài tập rèn luyện', DifficultyLevel: 'Dễ', TargetSkill: 'Mặc định', Language: 'Tiếng Việt' };
  };

  // ROLE-BASED FILTERING LOGIC
  // - Admin: Xem tất cả.
  // - Teacher (Giáo viên phụ trách): Xem các bé thuộc lớp phụ trách. Giả lập xem các bé: Bảo Nam, Anh Thư, Minh Khang (CHD-003, CHD-004, CHD-005)
  // - Parent (Phụ huynh bé Leo): Chỉ xem bé của mình (CHD-001 - Leo)
  const getRoleFilteredResults = (dataList: LearningResult[]) => {
    const visibleChildIds = new Set(children.map((child) => child.ChildId));
    return dataList.filter((result) => visibleChildIds.has(result.ChildId));
  };

  // Active results list depending on Role and input Search Query & Dropdowns
  const displayResults = getRoleFilteredResults(results).filter(item => {
    const child = getChildInfo(item.ChildId);
    const exe = getExerciseInfo(item.ExerciseId);

    const matchText = `${child.FullName} ${exe.ExerciseName} ${item.ResultId}`.toLowerCase();
    const queryMatch = matchText.includes(searchQuery.toLowerCase());

    const statusMatch = filterStatus === 'ALL' || item.CompletionStatus === filterStatus;
    const diffMatch = filterDifficulty === 'ALL' || exe.DifficultyLevel === filterDifficulty;
    const skillMatch = filterSkill === 'ALL' || exe.TargetSkill.includes(filterSkill);

    // Date range filter
    let dateMatch = true;
    if (filterDateRange !== 'ALL') {
      const today = new Date('2026-05-31'); // Base current simulation time
      const itemDate = new Date(item.StartedAt.split(' ')[0]);
      const diffTime = Math.abs(today.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterDateRange === 'TODAY' && diffDays > 1) dateMatch = false;
      if (filterDateRange === '3DAYS' && diffDays > 3) dateMatch = false;
      if (filterDateRange === '7DAYS' && diffDays > 7) dateMatch = false;
    }

    return queryMatch && statusMatch && diffMatch && skillMatch && dateMatch;
  });

  const totalPages = Math.max(1, Math.ceil(displayResults.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedResults = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return displayResults.slice(startIndex, startIndex + pageSize);
  }, [displayResults, currentPage, pageSize]);

  // Unique target skills list from API exercises for select dropdown filters
  const allTargetSkills = Array.from(new Set(exercises.map(e => e.TargetSkill)));

  // STATISTICS CALCULATIONS (Based on ROLE-FILTERED subset for accuracy)
  const roleSubset = getRoleFilteredResults(results);
  const totalAttempts = roleSubset.length;
  
  const completedCount = roleSubset.filter(r => r.CompletionStatus === 'Completed').length;
  const completionRate = totalAttempts > 0 ? Math.round((completedCount / totalAttempts) * 100) : 0;

  const resultsWithScore = roleSubset.filter(r => r.Score > 0);
  const averageScore = resultsWithScore.length > 0 
    ? Math.round(resultsWithScore.reduce((acc, curr) => acc + curr.Score, 0) / resultsWithScore.length) 
    : 0;

  const totalDurationSeconds = roleSubset.reduce((acc, curr) => acc + curr.DurationSeconds, 0);
  const formattedTotalMinutes = Math.round(totalDurationSeconds / 60);

  // Helper renderer for completion statuses
  const renderStatusBadge = (status: LearningResult['CompletionStatus']) => {
    const maps: Record<LearningResult['CompletionStatus'], { bg: string; text: string; label: string; dot: string }> = {
      Completed: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', text: 'text-emerald-700', label: 'Thành công', dot: 'bg-emerald-500' },
      InProgress: { bg: 'bg-sky-50 text-sky-600 border-sky-100', text: 'text-sky-700', label: 'Đang làm dở', dot: 'bg-sky-400' },
      Failed: { bg: 'bg-rose-50 text-rose-500 border-rose-100', text: 'text-rose-600', label: 'Chưa đạt', dot: 'bg-rose-500' },
      NeedReview: { bg: 'bg-amber-50 text-amber-600 border-amber-100', text: 'text-amber-700', label: 'Cần cô duyệt', dot: 'bg-amber-500' }
    };
    const style = maps[status];
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5FBFB] rounded-full text-xs font-black uppercase tracking-wider border", style.bg)}>
        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", style.dot)} />
        {style.label}
      </span>
    );
  };

  // Actions simulators
  const handleOpenDetailModal = async (res: LearningResult) => {
    setSelectedResult(res);
    setFeedbackInput(res.FeedbackText);
    setIsDetailModalOpen(true);
    setEditFeedbackMode(false);

    const resultId = Number(res.ResultId);
    if (Number.isNaN(resultId)) return;

    const [resultResponse, eventLogResponse] = await Promise.all([
      getResultById(resultId),
      getEventLogsByResult(resultId),
    ]);

    if (resultResponse.success && resultResponse.data) {
      const latest = mapResultRecord(resultResponse.data);

      setResults((current) =>
        current.map((item) =>
          item.ResultId === latest.ResultId ? latest : item
        )
      );
      setSelectedResult(latest);
      setFeedbackInput(latest.FeedbackText);
    }

    if (eventLogResponse.success && eventLogResponse.data) {
      setEventLogsByResultId((current) => ({
        ...current,
        [res.ResultId]: eventLogResponse.data ?? [],
      }));
    }
  };

  const handleSaveFeedback = () => {
    if (!selectedResult) return;
    const updated = results.map(item => {
      if (item.ResultId === selectedResult.ResultId) {
        return {
          ...item,
          FeedbackText: feedbackInput,
          CompletedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
      }
      return item;
    });
    setResults(updated);
    setSelectedResult({
      ...selectedResult,
      FeedbackText: feedbackInput
    });
    setEditFeedbackMode(false);
    showToast('Đã lưu ý kiến nhận xét can thiệp thành công!', 'success');
  };

  const getResultInteractionLog = (result: LearningResult | null): string => {
    if (!result) return '';

    return (
      result.InteractionLog ||
      formatEventLogs(eventLogsByResultId[result.ResultId]) ||
      ''
    );
  };

  const handleSimulateAudioPlay = (res: LearningResult) => {
    if (!res.AudioRecordUrl) {
      showToast('Đang học dở, chưa có tệp âm thanh ghi từ tai nghe VR!', 'warn');
      return;
    }
    setPlayingAudioId(res.ResultId);
    setIsAudioSimulateActive(true);
    showToast(`Đang mô phỏng phát bản thu phát âm: "${getChildInfo(res.ChildId).FullName}"...`, 'info');
    setTimeout(() => {
      setPlayingAudioId(null);
      setIsAudioSimulateActive(false);
      showToast('Đã phát âm bản thu hoàn tất!', 'success');
    }, 4500);
  };

  const handleSimulate3DReplay = (res: LearningResult) => {
    if (!res.ReplayDataUrl) {
      showToast('Bài học đang diễn ra, chưa kết xuất file đồ thị tương tác!', 'warn');
      return;
    }
    setPlayingReplayId(res.ResultId);
    showToast(`Đang tải tọa độ chuyển động và dải tương tác VR cho "${res.ResultId}"...`, 'info');
    setTimeout(() => {
      // simulate virtual replay completion
      setPlayingReplayId(null);
      showToast('Nạp dữ liệu mô tả trực quan từ ứng dụng kính VR thành công!', 'success');
    }, 4000);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative" id="result-management-view">
      
      {/* Dynamic Toast Feedback Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="result-toast-floating"
          >
            <div className={cn(
              "px-6 py-4.5 rounded-3xl shadow-2xl flex items-center gap-4.5 border-2 border-white backdrop-blur-md font-bold text-white text-sm tracking-wide leading-snug",
              toastMessage.type === 'success' && 'bg-[#4EACAF]/95',
              toastMessage.type === 'info' && 'bg-indigo-600/95',
              toastMessage.type === 'warn' && 'bg-[#FF8E8E]/95'
            )}>
              {toastMessage.type === 'success' ? (
                <div className="bg-white/20 p-2 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              ) : toastMessage.type === 'warn' ? (
                <div className="bg-white/20 p-2 rounded-xl">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="bg-white/10 p-2 rounded-xl">
                  <Activity className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="font-extrabold italic">{toastMessage.text}</span>
              </div>
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

      {/* Hero Header Unit */}
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <TrendingUp className="w-3.5 h-3.5" />
            Bảng kết quả rèn luyện phát âm VR
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1">
            Kết Quả <span className="text-[#FF8E8E]">Luyện Tập</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed">
            Theo dõi điểm số hiệu chỉnh, thời lượng tương tác VR, phát lại tệp âm thanh thu mộc và phản hồi rèn luyện của hệ thống GodotXR.
          </p>
        </div>

        <div className="bg-[#E2F2F3] border border-[#C5E1E3] px-5 py-4 rounded-[24px] flex items-center gap-3 shadow-inner self-start lg:self-center">
          <UserSquare2 className="w-5 h-5 text-[#4EACAF]" />
          <div className="space-y-1">
            <p className="text-[11px] font-black text-[#264E50] uppercase tracking-[0.24em]">
              Current data scope
            </p>
            <p className="text-sm font-extrabold text-[#264E50]">
              {currentRoleView === 'ADMIN' && 'All learning results'}
              {currentRoleView === 'TEACHER' &&
                'Children in assigned classrooms'}
              {currentRoleView === 'PARENT' &&
                'Children linked to this parent account'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Kid-friendly visual Statistics indicators depending on role scope */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total attempts count card */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#4EACAF] shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="w-7 h-7 text-[#4EACAF]" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{totalAttempts}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tổng lượt luyện</p>
          </div>
        </div>

        {/* Average Score rating card */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#FF8E8E] shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
            <Award className="w-7 h-7 text-[#FF8E8E]" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{averageScore}/100</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Điểm số trung bình</p>
          </div>
        </div>

        {/* Total play duration minutes */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-indigo-400 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{formattedTotalMinutes} phút</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tổng giờ tương tác</p>
          </div>
        </div>

        {/* Completion rate metrics card */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-emerald-500 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
            <ThumbsUp className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-600 tracking-tight leading-none">{completionRate}%</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tỷ lệ hoàn thành</p>
          </div>
        </div>

      </div>

      {/* Alert informing details or limits based on roles */}
      <div className="bg-[#FFFDF5] p-5.5 rounded-[28px] border border-amber-200/50 flex gap-4 text-xs font-bold leading-relaxed text-gray-600">
        <Info className="w-6 h-6 text-amber-500 shrink-0" />
        <div className="space-y-1">
          <p className="text-gray-800 font-black uppercase text-[10px] tracking-wider">
            Data scope from current session:
          </p>
          {currentRoleView === 'ADMIN' && (
            <span>
              <strong>Admin</strong>: viewing all learning results in the
              system, with access to feedback editing, audio playback and
              replay detail.
            </span>
          )}
          {currentRoleView === 'TEACHER' && (
            <span>
              <strong>Teacher</strong>: viewing only children enrolled in the
              classrooms assigned to this teacher, with feedback editing
              enabled.
            </span>
          )}
          {currentRoleView === 'PARENT' && (
            <span>
              <strong>Parent</strong>: viewing only the children linked to the
              current parent account. Feedback stays read-only to preserve
              learning history integrity.
            </span>
          )}
        </div>
      </div>

      {/* 3. Multi option Search and advanced filter block */}
      <div className="bg-white rounded-[36px] p-6.5 shadow-sm border border-gray-100 space-y-5" id="results-filter-bar">
        
        {/* Realtime filter row 1 */}
        <div className="flex flex-col md:flex-row gap-4">
          
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm theo tên học sinh, bé cưng hoặc tên bài tập (VD: Nông trại, Leo, sáo...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-4 rounded-2xl bg-[#FDFCF5] border-2 border-transparent font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm" 
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200/50 hover:bg-gray-200 rounded-full transition-colors"
                title="Hủy từ khóa"
              >
                <X className="w-4.5 h-4.5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Completion Status */}
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            variant="form"
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'Completed', label: 'Đã thành công' },
              { value: 'InProgress', label: 'Đang dở dang' },
              { value: 'Failed', label: 'Chưa đạt yêu cầu' },
              { value: 'NeedReview', label: 'Chờ giáo viên duyệt' }
            ]}
            className="w-full md:w-60"
          />

        </div>

        {/* Filters Row 2 - Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1.5">
          
          {/* Filter Difficulty */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Độ khó bài tập:</label>
            <CustomSelect
              value={filterDifficulty}
              onChange={setFilterDifficulty}
              variant="form"
              options={[
                { value: 'ALL', label: 'TẤT CẢ ĐỘ KHÓ' },
                { value: 'Dễ', label: 'DỄ (KID LEVEL 1)' },
                { value: 'Trung bình', label: 'TRUNG BÌNH (LEVEL 2)' },
                { value: 'Khó', label: 'KHÓ (LEVEL 3)' }
              ]}
            />
          </div>

          {/* Filter Target Skill */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Khảo sát dải tần can thiệp:</label>
            <CustomSelect
              value={filterSkill}
              onChange={setFilterSkill}
              variant="form"
              options={[
                { value: 'ALL', label: 'TẤT CẢ KỸ NĂNG' },
                ...allTargetSkills.map((sk) => ({ value: sk, label: sk }))
              ]}
            />
          </div>

          {/* Filter Date range */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Khoảng thời gian nộp bài:</label>
            <CustomSelect
              value={filterDateRange}
              onChange={setFilterDateRange}
              variant="form"
              options={[
                { value: 'ALL', label: 'TẤT CẢ THỜI GIAN' },
                { value: 'TODAY', label: 'HÔM NAY (31/05/2026)' },
                { value: '3DAYS', label: '3 NGÀY GẦN NHẤT' },
                { value: '7DAYS', label: '7 NGÀY GẦN NHẤT' }
              ]}
            />
          </div>

        </div>

        {/* Clear filter helper button if any filter is active */}
        {(searchQuery || filterStatus !== 'ALL' || filterDifficulty !== 'ALL' || filterSkill !== 'ALL' || filterDateRange !== 'ALL') && (
          <div className="flex items-center justify-end pt-1">
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
                setFilterDifficulty('ALL');
                setFilterSkill('ALL');
                setFilterDateRange('ALL');
                showToast('Đã xóa bỏ toàn bộ màng lọc!', 'info');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#FF8E8E] font-black uppercase tracking-wider hover:underline"
            >
              <ListRestart className="w-3.5 h-3.5" />
              Reset toàn bộ màng lọc dữ liệu
            </button>
          </div>
        )}

      </div>

      {/* 4. Elegant Learning Results Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden" id="results-table-container">
        
        <div className="px-10 py-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
          <div>
            <h3 className="text-2xl font-black text-gray-900 leading-none italic">Danh sách kết quả can thiệp chi tiết</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Dòng dữ liệu mộc lưu vết VR headset, nỗ lực sửa ngọng của trẻ nhỏ</p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider border border-indigo-100/30 self-start sm:self-center">
            API_DATABASE: RESULT ({displayResults.length} dòng)
          </span>
        </div>

        {apiError ? (
          <div className="mx-6 mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">
            {apiError}
          </div>
        ) : null}

        {isApiLoading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-teal-100 italic">
              <Activity className="w-8 h-8 text-teal-400 animate-pulse" />
            </div>
            <p className="text-xl font-black text-gray-700">Đang tải kết quả luyện tập từ API...</p>
            <p className="text-xs text-gray-400 max-w-md mx-auto">Hệ thống đang ghép hồ sơ trẻ, bài tập và các lượt luyện để hiển thị đúng theo quyền truy cập hiện tại.</p>
          </div>
        ) : displayResults.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100 italic">
              <Award className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700">Không tìm thấy lượt tập luyện nào tương ứng!</p>
            <p className="text-xs text-gray-400 max-w-md mx-auto">Vui lòng thử điều phối lại dải tìm kiếm hoặc đổi phân quyền người dùng (Admin, Teacher, Parent) ở trên thanh đầu trang.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto text-left">
            <table className="w-full border-collapse" id="results-table-element">
              <thead>
                <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                  <th className="py-5 px-10">Mã kết quả</th>
                  <th className="py-5 px-6">Tên Học Sinh Bé</th>
                  <th className="py-5 px-6">Bài tập VR</th>
                  <th className="py-5 px-6 text-center">Lượt thử</th>
                  <th className="py-5 px-6 text-center">Điểm số thu âm</th>
                  <th className="py-5 px-6">Thời lượng</th>
                  <th className="py-5 px-6">Trạng thái</th>
                  <th className="py-5 px-6">Thời điểm nộp</th>
                  <th className="py-5 px-10 text-right">Tác vụ can thiệp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                {paginatedResults.map((itm) => {
                  const chd = getChildInfo(itm.ChildId);
                  const exe = getExerciseInfo(itm.ExerciseId);
                  return (
                    <tr key={itm.ResultId} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Result ID */}
                      <td className="py-5 px-10 font-mono text-gray-400 font-extrabold text-xs">
                        {itm.ResultId}
                      </td>

                      {/* Child Name & Learning level */}
                      <td className="py-5 px-6">
                        <div className="font-extrabold text-gray-900 text-sm md:text-base mb-0.5 leading-none">
                          {chd.FullName}
                        </div>
                        <span className="text-[10px] text-[#4EACAF] font-bold uppercase tracking-tight">
                          {chd.LearningLevel} ({chd.Age} tuổi)
                        </span>
                      </td>

                      {/* Exercise Name & difficulty */}
                      <td className="py-5 px-6">
                        <div className="font-extrabold text-gray-800 leading-tight mb-1 text-xs md:text-sm">
                          {exe.ExerciseName}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-black uppercase text-white",
                            exe.DifficultyLevel === 'Dễ' && 'bg-emerald-400',
                            exe.DifficultyLevel === 'Trung bình' && 'bg-indigo-400',
                            exe.DifficultyLevel === 'Khó' && 'bg-[#FF8E8E]'
                          )}>
                            {exe.DifficultyLevel}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium truncate max-w-[140px]">
                            {exe.TargetSkill}
                          </span>
                        </div>
                      </td>

                      {/* Attempt number */}
                      <td className="py-5 px-6 text-center font-mono">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-extrabold">
                          Lần {itm.AttemptNumber}
                        </span>
                      </td>

                      {/* Score metric with colorful circle indicator */}
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center justify-center flex-col">
                          <span className={cn(
                            "font-black text-base italic",
                            itm.Score >= 90 ? 'text-emerald-500' : itm.Score >= 70 ? 'text-indigo-500' : 'text-rose-500'
                          )}>
                            {itm.Score > 0 ? `${itm.Score}` : '—'}
                          </span>
                          {itm.Score > 0 && (
                            <div className="w-8 h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  itm.Score >= 90 ? 'bg-emerald-500' : itm.Score >= 70 ? 'bg-indigo-500' : 'bg-rose-500'
                                )} 
                                style={{ width: `${itm.Score}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Duration in seconds */}
                      <td className="py-5 px-6 text-gray-500 font-mono text-xs">
                        {itm.DurationSeconds} giây
                      </td>

                      {/* Completion status */}
                      <td className="py-5 px-6">
                        {renderStatusBadge(itm.CompletionStatus)}
                      </td>

                      {/* Time submitted */}
                      <td className="py-5 px-6 text-xs text-gray-400 font-medium">
                        {itm.CompletedAt ? itm.CompletedAt : 'Đang xử lý...'}
                      </td>

                      {/* Actions toolbox */}
                      <td className="py-5 px-10 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Main view modal button */}
                          <button
                            onClick={() => handleOpenDetailModal(itm)}
                            className="py-1.5 px-3 bg-[#4EACAF]/10 hover:bg-[#4EACAF] text-[#4EACAF] hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1"
                            title="Bấm để xem tương tác chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Chi tiết
                          </button>

                          {/* Quick audio play */}
                          {itm.AudioRecordUrl && (
                            <button
                              onClick={() => handleSimulateAudioPlay(itm)}
                              className={cn(
                                "p-2 rounded-xl transition-all",
                                playingAudioId === itm.ResultId 
                                  ? "bg-emerald-500 text-white animate-bounce" 
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                              )}
                              title="Nghe giọng bé thu từ kính VR"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick 3D replay coordinate simulation */}
                          {itm.ReplayDataUrl && (
                            <button
                              onClick={() => handleSimulate3DReplay(itm)}
                              className={cn(
                                "p-2 rounded-xl transition-all",
                                playingReplayId === itm.ResultId 
                                  ? "bg-indigo-500 text-white animate-pulse" 
                                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white"
                              )}
                              title="Xem replay chuyển động 3D thần sầu"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-10 pb-8 border-t border-slate-50">
            <Pagination
              currentPage={currentPage}
              totalItems={displayResults.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemLabel="kết quả"
            />
          </div>
        </>
        )}

      </div>

      {/* 5. Detailed Learning Result Interactive Modal Overlay */}
      <AnimatePresence>
        {isDetailModalOpen && selectedResult && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/15 animate-in fade-in duration-300 overflow-y-auto w-full h-full" id="result-modal-backdrop">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="app-modal-panel app-modal-panel--wide bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 relative z-30 flex flex-col my-8"
              id="result-modal-box"
            >
              
              {/* Modal Top Header with accent color */}
              <div className="bg-[#E2F2F3] px-8 py-6 flex items-center justify-between border-b border-[#C5E1E3] text-gray-900">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-[#4EACAF] text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    <Activity className="w-3 h-3" />
                    Lưu vết hồ sơ y tế học đường
                  </div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    Báo cáo chi tiết lượt luyện tập #{selectedResult.ResultId}
                  </h2>
                  <p className="text-xs font-bold text-[#264E50]/70">
                    Ứng dụng Kính VR đồng bộ thông suốt với hệ thống Dashboard GodotXR
                  </p>
                </div>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2.5 hover:bg-white/50 rounded-full transition-colors shrink-0"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body Scroll view divided into grid columns */}
              <div className="app-modal-body p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                
                {/* Section A: Child & Exercise Header card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Children specs */}
                  <div className="bg-[#FDFCF5] p-5 rounded-3xl border border-yellow-105 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-black text-[#FF8E8E] uppercase tracking-wider">Thông tin học sinh</span>
                      <span className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded-md font-bold text-mono">
                        ID: {selectedResult.ChildId}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-gray-900 leading-tight">
                        {getChildInfo(selectedResult.ChildId).FullName}
                      </p>
                      <p className="text-xs font-bold text-gray-500">
                        Độ tuổi: <span className="text-black">{getChildInfo(selectedResult.ChildId).Age} tuổi</span> | Trình độ: <span className="text-black">{getChildInfo(selectedResult.ChildId).LearningLevel}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Exercises specs */}
                  <div className="bg-[#FDFCF5] p-5 rounded-3xl border border-yellow-105 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-black text-[#4EACAF] uppercase tracking-wider">Bài tập huấn luyện ngôn từ 3D</span>
                      <span className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded-md font-bold text-mono">
                        ID: {selectedResult.ExerciseId}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-gray-900 leading-tight">
                        {getExerciseInfo(selectedResult.ExerciseId).ExerciseName}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400 mt-1">
                        <span>Độ khó: <strong className="text-[#FF8E8E]">{getExerciseInfo(selectedResult.ExerciseId).DifficultyLevel}</strong></span>
                        <span>|</span>
                        <span>Ngôn ngữ: <strong className="text-black">{getExerciseInfo(selectedResult.ExerciseId).Language}</strong></span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Section B: Playback Simulation Controls (Stunning Interactive Widgets!) */}
                <div className="bg-gradient-to-br from-[#4EACAF]/5 to-[#FF8E8E]/5 p-6 rounded-[32px] border border-[#4EACAF]/10 space-y-4">
                  <h4 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-[#4EACAF]" />
                    Trực quan dải tần âm học & Không gian replay can thiệp
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Audio recording player simulation card */}
                    <div className="bg-white p-4.5 rounded-2xl border border-gray-100 flex flex-col justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                          <Music className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-700">AudioRecordUrl</p>
                          <p className="text-[11px] text-gray-400 font-medium truncate max-w-[250px]">
                            {selectedResult.AudioRecordUrl || "Chưa có tệp nộp bài..."}
                          </p>
                        </div>
                      </div>

                      {selectedResult.AudioRecordUrl ? (
                        <div className="space-y-2 mt-2">
                          {/* Mini simulated audio player dashboard */}
                          <div className="bg-slate-50 p-2.5 rounded-xl flex items-center gap-3">
                            <button 
                              type="button"
                              onClick={() => handleSimulateAudioPlay(selectedResult)}
                              className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                            >
                              {playingAudioId === selectedResult.ResultId ? (
                                <Activity className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              )}
                            </button>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold font-mono">
                                <span>{playingAudioId === selectedResult.ResultId ? '00:03' : '00:00'}</span>
                                <span>00:10 (Mô phỏng)</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full bg-emerald-500 rounded-full", playingAudioId === selectedResult.ResultId && "w-1/3 transition-all duration-[4s]")} 
                                  style={{ width: playingAudioId === selectedResult.ResultId ? '100%' : '0%' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-rose-400 italic">Học sinh chưa hoàn thành nộp bản thu giọng mộc.</span>
                      )}
                    </div>

                    {/* 3D VR simulation dynamic representation replay card */}
                    <div className="bg-white p-4.5 rounded-2xl border border-gray-100 flex flex-col justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                          <Tv className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-700">ReplayDataUrl (Tọa độ môi kính)</p>
                          <p className="text-[11px] text-gray-400 font-medium truncate max-w-[250px]">
                            {selectedResult.ReplayDataUrl || "Không có tệp replay..."}
                          </p>
                        </div>
                      </div>

                      {selectedResult.ReplayDataUrl ? (
                        <div className="space-y-1 mt-2">
                          <button
                            type="button"
                            onClick={() => handleSimulate3DReplay(selectedResult)}
                            className={cn(
                              "w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wide transition-all border flex items-center justify-center gap-2",
                              playingReplayId === selectedResult.ResultId 
                                ? "bg-indigo-600 text-white" 
                                : "bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-500 hover:text-white"
                            )}
                          >
                            {playingReplayId === selectedResult.ResultId ? (
                              <>
                                <Activity className="w-4 h-4 animate-bounce" />
                                Đang mô tả Replay 3D...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Phát replay tương tác VR
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-rose-400 italic">Game chưa có dải xuất thần tọa độ.</span>
                      )}
                    </div>

                  </div>

                </div>

                {/* Section C: Numeric indicators detail */}
                <div className="bg-[#FDFCF5] p-5 rounded-[28px] border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-6 font-bold text-center">
                  
                  <div className="space-y-1 border-r border-gray-100 last:border-0">
                    <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Nỗ lực thứ</p>
                    <p className="text-2xl font-black text-gray-800">Lượt {selectedResult.AttemptNumber}</p>
                  </div>

                  <div className="space-y-1 border-r border-gray-100 last:border-0">
                    <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Thời gian tương tác</p>
                    <p className="text-2xl font-black text-gray-800">{selectedResult.DurationSeconds} giây</p>
                  </div>

                  <div className="space-y-1 border-r border-gray-100 last:border-0">
                    <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Điểm dải sóng âm</p>
                    <p className={cn(
                      "text-2xl font-black italic",
                      selectedResult.Score >= 90 ? 'text-emerald-500' : selectedResult.Score >= 70 ? 'text-[#4EACAF]' : 'text-[#FF8E8E]'
                    )}>
                      {selectedResult.Score} / 100
                    </p>
                  </div>

                  <div className="space-y-1 border-r border-gray-100 last:border-0">
                    <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Hoàn thành lúc</p>
                    <p className="text-sm font-black text-gray-700 font-mono mt-1 leading-snug">
                      {selectedResult.CompletedAt || "Chưa gửi nộp"}
                    </p>
                  </div>

                </div>

                {/* Section D: Detailed Interaction Sequence Log */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#264E50] uppercase tracking-widest ml-1 flex items-center gap-1">
                    <FolderOpen className="w-4 h-4 text-[#4EACAF]" />
                    Interaction Log (Vết logs tương tác vật lý ghi nhận từ ứng dụng VR)
                  </label>
                  <div className="p-4 bg-gray-900 text-slate-100 rounded-2xl font-mono text-xs whitespace-pre-line leading-relaxed shadow-inner border-2 border-slate-800">
                    {getResultInteractionLog(selectedResult) || "Hệ thống chưa ghi nhận vết log bấm hoặc phát âm ở phiên tập này..."}
                  </div>
                </div>

                {/* Section E: Teacher Feedback (Editable by ADMIN/TEACHER, Viewed by PARENT) */}
                <div className="bg-[#FFFDF5] p-6.5 rounded-3xl border-2 border-dashed border-amber-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquareShare className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-black text-[#264E50] uppercase tracking-widest">
                        Nhận xét đánh giá can thiệp ngôn ngữ học đường
                      </span>
                    </div>

                    {/* If Admin or Teacher: Show Quick Edit toggler */}
                    {canEditFeedback && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditFeedbackMode(!editFeedbackMode);
                          setFeedbackInput(selectedResult.FeedbackText);
                        }}
                        className="text-xs text-[#4EACAF] hover:text-[#4EACAF]/85 font-black uppercase tracking-wider flex items-center gap-1 hover:underline"
                      >
                        {editFeedbackMode ? 'Hủy sửa' : 'Chỉnh sửa nhận xét'}
                      </button>
                    )}
                  </div>

                  {editFeedbackMode ? (
                    <div className="space-y-3">
                      <textarea
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="w-full bg-white border-2 border-amber-200 focus:border-[#4EACAF] rounded-2xl p-4 font-bold text-gray-700 outline-none text-sm resize-none"
                        rows={4}
                        placeholder="Hãy bổ sung bài học can thiệp, bài thu sửa ngọng cụ thể để phụ huynh phối hợp ở nhà..."
                      />
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setEditFeedbackMode(false)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveFeedback}
                          className="px-5 py-2.5 bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#4EACAF]/10"
                        >
                          Cập nhật ngay
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm italic font-bold leading-relaxed bg-white/60 p-4.5 rounded-2xl border border-[#C5E1E3]/20">
                      "{selectedResult.FeedbackText || "Chưa có ý kiến đánh giá từ quý nhà trường trong học kỳ này..."}"
                    </p>
                  )}

                  <div className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5 pt-1.5">
                    <Info className="w-4 h-4 text-[#4EACAF]" />
                    <span>Lộ trình rèn luyện hỗ trợ phản xạ phát âm chỉ hiển thị cho phụ huynh khi được giáo viên duyệt kiểm định.</span>
                  </div>
                </div>

              </div>

              {/* Modal Footer actions */}
              <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-slate-50/50">
                <span className="text-xs text-gray-400 font-mono font-medium">
                  Created at: {selectedResult.CreatedAt}
                </span>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-500 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all"
                  >
                    Đóng cửa sổ
                  </button>

                  {/* Simulated Re-exam attempt button if failed */}
                  {selectedResult.CompletionStatus === 'Failed' && (
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`Đã phát lệnh yêu cầu bé tập lại: "${getExerciseInfo(selectedResult.ExerciseId).ExerciseName}"!`, 'success');
                        setIsDetailModalOpen(false);
                      }}
                      className="py-3 px-6 bg-[#FF8E8E] hover:bg-[#FF8E8E]/95 text-white font-black italic text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#FF8E8E]/10"
                    >
                      Yêu cầu luyện tập lại
                    </button>
                  )}
                </div>

              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
