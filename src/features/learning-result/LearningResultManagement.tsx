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
  DifficultyLevel: 'Dá»…' | 'Trung bĂ¬nh' | 'KhĂ³';
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

  if (normalized === 'hard' || normalized === 'khĂ³') return 'KhĂ³';
  if (normalized === 'medium' || normalized === 'trung bĂ¬nh') {
    return 'Trung bĂ¬nh';
  }

  return 'Dá»…';
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
    return children.find(c => c.ChildId === id) || { ChildId: id, FullName: 'Há»c sinh áº©n danh', Age: 8, LearningLevel: 'Báº­c 1' };
  };

  const getExerciseInfo = (id: string): Exercise => {
    return exercises.find(e => e.ExerciseId === id) || { ExerciseId: id, ExerciseName: 'BĂ i táº­p rĂ¨n luyá»‡n', DifficultyLevel: 'Dá»…', TargetSkill: 'Máº·c Ä‘á»‹nh', Language: 'Tiáº¿ng Viá»‡t' };
  };

  // ROLE-BASED FILTERING LOGIC
  // - Admin: Xem táº¥t cáº£.
  // - Teacher (GiĂ¡o viĂªn phá»¥ trĂ¡ch): Xem cĂ¡c bĂ© thuá»™c lá»›p phá»¥ trĂ¡ch. Giáº£ láº­p xem cĂ¡c bĂ©: Báº£o Nam, Anh ThÆ°, Minh Khang (CHD-003, CHD-004, CHD-005)
  // - Parent (Phá»¥ huynh bĂ© Leo): Chá»‰ xem bĂ© cá»§a mĂ¬nh (CHD-001 - Leo)
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
      Completed: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', text: 'text-emerald-700', label: 'ThĂ nh cĂ´ng', dot: 'bg-emerald-500' },
      InProgress: { bg: 'bg-sky-50 text-sky-600 border-sky-100', text: 'text-sky-700', label: 'Äang lĂ m dá»Ÿ', dot: 'bg-sky-400' },
      Failed: { bg: 'bg-rose-50 text-rose-500 border-rose-100', text: 'text-rose-600', label: 'ChÆ°a Ä‘áº¡t', dot: 'bg-rose-500' },
      NeedReview: { bg: 'bg-amber-50 text-amber-600 border-amber-100', text: 'text-amber-700', label: 'Cáº§n cĂ´ duyá»‡t', dot: 'bg-amber-500' }
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
    showToast('ÄĂ£ lÆ°u Ă½ kiáº¿n nháº­n xĂ©t can thiá»‡p thĂ nh cĂ´ng!', 'success');
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
      showToast('Äang há»c dá»Ÿ, chÆ°a cĂ³ tá»‡p Ă¢m thanh ghi tá»« tai nghe VR!', 'warn');
      return;
    }
    setPlayingAudioId(res.ResultId);
    setIsAudioSimulateActive(true);
    showToast(`Äang mĂ´ phá»ng phĂ¡t báº£n thu phĂ¡t Ă¢m: "${getChildInfo(res.ChildId).FullName}"...`, 'info');
    setTimeout(() => {
      setPlayingAudioId(null);
      setIsAudioSimulateActive(false);
      showToast('ÄĂ£ phĂ¡t Ă¢m báº£n thu hoĂ n táº¥t!', 'success');
    }, 4500);
  };

  const handleSimulate3DReplay = (res: LearningResult) => {
    if (!res.ReplayDataUrl) {
      showToast('BĂ i há»c Ä‘ang diá»…n ra, chÆ°a káº¿t xuáº¥t file Ä‘á»“ thá»‹ tÆ°Æ¡ng tĂ¡c!', 'warn');
      return;
    }
    setPlayingReplayId(res.ResultId);
    showToast(`Äang táº£i tá»a Ä‘á»™ chuyá»ƒn Ä‘á»™ng vĂ  dáº£i tÆ°Æ¡ng tĂ¡c VR cho "${res.ResultId}"...`, 'info');
    setTimeout(() => {
      // simulate virtual replay completion
      setPlayingReplayId(null);
      showToast('Náº¡p dá»¯ liá»‡u mĂ´ táº£ trá»±c quan tá»« á»©ng dá»¥ng kĂ­nh VR thĂ nh cĂ´ng!', 'success');
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
            Báº£ng káº¿t quáº£ rĂ¨n luyá»‡n phĂ¡t Ă¢m VR
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1">
            Káº¿t Quáº£ <span className="text-[#FF8E8E]">Luyá»‡n Táº­p</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed">
            Theo dĂµi Ä‘iá»ƒm sá»‘ hiá»‡u chá»‰nh, thá»i lÆ°á»£ng tÆ°Æ¡ng tĂ¡c VR, phĂ¡t láº¡i tá»‡p Ă¢m thanh thu má»™c vĂ  pháº£n há»“i rĂ¨n luyá»‡n cá»§a há»‡ thá»‘ng GodotXR.
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
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tá»•ng lÆ°á»£t luyá»‡n</p>
          </div>
        </div>

        {/* Average Score rating card */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#FF8E8E] shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
            <Award className="w-7 h-7 text-[#FF8E8E]" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{averageScore}/100</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Äiá»ƒm sá»‘ trung bĂ¬nh</p>
          </div>
        </div>

        {/* Total play duration minutes */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-indigo-400 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{formattedTotalMinutes} phĂºt</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tá»•ng giá» tÆ°Æ¡ng tĂ¡c</p>
          </div>
        </div>

        {/* Completion rate metrics card */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-emerald-500 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
            <ThumbsUp className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-600 tracking-tight leading-none">{completionRate}%</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tá»· lá»‡ hoĂ n thĂ nh</p>
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
              placeholder="TĂ¬m theo tĂªn há»c sinh, bĂ© cÆ°ng hoáº·c tĂªn bĂ i táº­p (VD: NĂ´ng tráº¡i, Leo, sĂ¡o...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-4 rounded-2xl bg-[#FDFCF5] border-2 border-transparent font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm" 
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200/50 hover:bg-gray-200 rounded-full transition-colors"
                title="Há»§y tá»« khĂ³a"
              >
                <X className="w-4.5 h-4.5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Completion Status */}
          <div className="relative w-full md:w-60">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent hover:border-[#4EACAF]/20 pl-5 pr-10 py-4 rounded-2xl font-black italic text-xs tracking-wide text-gray-700 outline-none cursor-pointer uppercase focus:bg-white focus:border-[#4EACAF]"
            >
              <option value="ALL">Táº¥t cáº£ tráº¡ng thĂ¡i</option>
              <option value="Completed">ÄĂ£ thĂ nh cĂ´ng</option>
              <option value="InProgress">Äang dá»Ÿ dang</option>
              <option value="Failed">ChÆ°a Ä‘áº¡t yĂªu cáº§u</option>
              <option value="NeedReview">Chá» giĂ¡o viĂªn duyá»‡t</option>
            </select>
            <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

        </div>

        {/* Filters Row 2 - Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1.5">
          
          {/* Filter Difficulty */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Äá»™ khĂ³ bĂ i táº­p:</label>
            <div className="relative">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent hover:border-[#4EACAF]/20 pl-4 pr-10 py-3.5 rounded-2xl font-bold text-xs tracking-wide text-gray-700 outline-none cursor-pointer focus:bg-white focus:border-[#4EACAF]"
              >
                <option value="ALL">Táº¤T Cáº¢ Äá»˜ KHĂ“</option>
                <option value="Dá»…">Dá»„ (KID LEVEL 1)</option>
                <option value="Trung bĂ¬nh">TRUNG BĂŒNH (LEVEL 2)</option>
                <option value="KhĂ³">KHĂ“ (LEVEL 3)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filter Target Skill */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Kháº©u ngá»¯ dáº£i táº§n can thiá»‡p:</label>
            <div className="relative">
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent hover:border-[#4EACAF]/20 pl-4 pr-10 py-3.5 rounded-2xl font-bold text-xs tracking-wide text-gray-700 outline-none cursor-pointer focus:bg-white focus:border-[#4EACAF]"
              >
                <option value="ALL">Táº¤T Cáº¢ Ká»¸ NÄ‚NG</option>
                {allTargetSkills.map((sk, index) => (
                  <option key={index} value={sk}>{sk}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filter Date range */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Khoáº£ng thá»i gian ná»™p bĂ i:</label>
            <div className="relative">
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent hover:border-[#4EACAF]/20 pl-4 pr-10 py-3.5 rounded-2xl font-bold text-xs tracking-wide text-gray-700 outline-none cursor-pointer focus:bg-white focus:border-[#4EACAF]"
              >
                <option value="ALL">Táº¤T Cáº¢ THá»œI GIAN</option>
                <option value="TODAY">HĂ”M NAY (31/05/2026)</option>
                <option value="3DAYS">3 NGĂ€Y Gáº¦N NHáº¤T</option>
                <option value="7DAYS">7 NGĂ€Y Gáº¦N NHáº¤T</option>
              </select>
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
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
                showToast('ÄĂ£ xĂ³a bá» toĂ n bá»™ mĂ ng lá»c!', 'info');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#FF8E8E] font-black uppercase tracking-wider hover:underline"
            >
              <ListRestart className="w-3.5 h-3.5" />
              Reset toĂ n bá»™ mĂ ng lá»c dá»¯ liá»‡u
            </button>
          </div>
        )}

      </div>

      {/* 4. Elegant Learning Results Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden" id="results-table-container">
        
        <div className="px-10 py-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
          <div>
            <h3 className="text-2xl font-black text-gray-900 leading-none italic">Danh sĂ¡ch káº¿t quáº£ can thiá»‡p chi tiáº¿t</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">DĂ²ng dá»¯ liá»‡u má»™c lÆ°u váº¿t VR headset, ná»— lá»±c sá»­a ngá»ng cá»§a tráº» nhá»</p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider border border-indigo-100/30 self-start sm:self-center">
            API_DATABASE: RESULT ({displayResults.length} dĂ²ng)
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
            <p className="text-xl font-black text-gray-700">Äang táº£i káº¿t quáº£ luyá»‡n táº­p tá»« API...</p>
            <p className="text-xs text-gray-400 max-w-md mx-auto">Há»‡ thá»‘ng Ä‘ang ghĂ©p há»“ sÆ¡ tráº», bĂ i táº­p vĂ  cĂ¡c lÆ°á»£t luyá»‡n Ä‘á»ƒ hiá»ƒn thá»‹ Ä‘Ăºng theo quyá»n truy cáº­p hiá»‡n táº¡i.</p>
          </div>
        ) : displayResults.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100 italic">
              <Award className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700">KhĂ´ng tĂ¬m tháº¥y lÆ°á»£t táº­p luyá»‡n nĂ o tÆ°Æ¡ng á»©ng!</p>
            <p className="text-xs text-gray-400 max-w-md mx-auto">Vui lĂ²ng thá»­ Ä‘iá»u phá»‘i láº¡i dáº£i tĂ¬m kiáº¿m hoáº·c Ä‘á»•i phĂ¢n quyá»n ngÆ°á»i dĂ¹ng (Admin, Teacher, Parent) á»Ÿ trĂªn thanh Ä‘áº§u trang.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto text-left">
            <table className="w-full border-collapse" id="results-table-element">
              <thead>
                <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                  <th className="py-5 px-10">MĂ£ káº¿t quáº£</th>
                  <th className="py-5 px-6">TĂªn Há»c Sinh BĂ©</th>
                  <th className="py-5 px-6">BĂ i táº­p VR</th>
                  <th className="py-5 px-6 text-center">LÆ°á»£t thá»­</th>
                  <th className="py-5 px-6 text-center">Äiá»ƒm sá»‘ thu Ă¢m</th>
                  <th className="py-5 px-6">Thá»i lÆ°á»£ng</th>
                  <th className="py-5 px-6">Tráº¡ng thĂ¡i</th>
                  <th className="py-5 px-6">Thá»i Ä‘iá»ƒm ná»™p</th>
                  <th className="py-5 px-10 text-right">TĂ¡c vá»¥ can thiá»‡p</th>
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
                          {chd.LearningLevel} ({chd.Age} tuá»•i)
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
                            exe.DifficultyLevel === 'Dá»…' && 'bg-emerald-400',
                            exe.DifficultyLevel === 'Trung bĂ¬nh' && 'bg-indigo-400',
                            exe.DifficultyLevel === 'KhĂ³' && 'bg-[#FF8E8E]'
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
                          Láº§n {itm.AttemptNumber}
                        </span>
                      </td>

                      {/* Score metric with colorful circle indicator */}
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center justify-center flex-col">
                          <span className={cn(
                            "font-black text-base italic",
                            itm.Score >= 90 ? 'text-emerald-500' : itm.Score >= 70 ? 'text-indigo-500' : 'text-rose-500'
                          )}>
                            {itm.Score > 0 ? `${itm.Score}` : 'â€”'}
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
                        {itm.DurationSeconds} giĂ¢y
                      </td>

                      {/* Completion status */}
                      <td className="py-5 px-6">
                        {renderStatusBadge(itm.CompletionStatus)}
                      </td>

                      {/* Time submitted */}
                      <td className="py-5 px-6 text-xs text-gray-400 font-medium">
                        {itm.CompletedAt ? itm.CompletedAt : 'Äang xá»­ lĂ½...'}
                      </td>

                      {/* Actions toolbox */}
                      <td className="py-5 px-10 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Main view modal button */}
                          <button
                            onClick={() => handleOpenDetailModal(itm)}
                            className="py-1.5 px-3 bg-[#4EACAF]/10 hover:bg-[#4EACAF] text-[#4EACAF] hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1"
                            title="Báº¥m Ä‘á»ƒ xem tÆ°Æ¡ng tĂ¡c chi tiáº¿t"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Chi tiáº¿t
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
                              title="Nghe giá»ng bĂ© thu tá»« kĂ­nh VR"
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
                              title="Xem replay chuyá»ƒn Ä‘á»™ng 3D tháº§n sáº§u"
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
              itemLabel="káº¿t quáº£"
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
                    LÆ°u váº¿t há»“ sÆ¡ y táº¿ há»c Ä‘Æ°á»ng
                  </div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    BĂ¡o cĂ¡o chi tiáº¿t lÆ°á»£t luyá»‡n táº­p #{selectedResult.ResultId}
                  </h2>
                  <p className="text-xs font-bold text-[#264E50]/70">
                    á»¨ng dá»¥ng KĂ­nh VR Ä‘á»“ng bá»™ thĂ´ng suá»‘t vá»›i há»‡ thá»‘ng Dashboard GodotXR
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
                      <span className="text-xs font-black text-[#FF8E8E] uppercase tracking-wider">ThĂ´ng tin há»c sinh</span>
                      <span className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded-md font-bold text-mono">
                        ID: {selectedResult.ChildId}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-gray-900 leading-tight">
                        {getChildInfo(selectedResult.ChildId).FullName}
                      </p>
                      <p className="text-xs font-bold text-gray-500">
                        Äá»™ tuá»•i: <span className="text-black">{getChildInfo(selectedResult.ChildId).Age} tuá»•i</span> | TrĂ¬nh Ä‘á»™: <span className="text-black">{getChildInfo(selectedResult.ChildId).LearningLevel}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Exercises specs */}
                  <div className="bg-[#FDFCF5] p-5 rounded-3xl border border-yellow-105 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-black text-[#4EACAF] uppercase tracking-wider">BĂ i táº­p huáº¥n luyá»‡n ngĂ´n tá»« 3D</span>
                      <span className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded-md font-bold text-mono">
                        ID: {selectedResult.ExerciseId}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-gray-900 leading-tight">
                        {getExerciseInfo(selectedResult.ExerciseId).ExerciseName}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400 mt-1">
                        <span>Äá»™ khĂ³: <strong className="text-[#FF8E8E]">{getExerciseInfo(selectedResult.ExerciseId).DifficultyLevel}</strong></span>
                        <span>|</span>
                        <span>NgĂ´n ngá»¯: <strong className="text-black">{getExerciseInfo(selectedResult.ExerciseId).Language}</strong></span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Section B: Playback Simulation Controls (Stunning Interactive Widgets!) */}
                <div className="bg-gradient-to-br from-[#4EACAF]/5 to-[#FF8E8E]/5 p-6 rounded-[32px] border border-[#4EACAF]/10 space-y-4">
                  <h4 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-[#4EACAF]" />
                    Trá»±c quan dáº£i táº§n Ă¢m há»c & KhĂ´ng gian replay can thiá»‡p
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
                            {selectedResult.AudioRecordUrl || "ChÆ°a cĂ³ tá»‡p ná»™p bĂ i..."}
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
                                <span>00:10 (MĂ´ phá»ng)</span>
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
                        <span className="text-xs text-rose-400 italic">Há»c sinh chÆ°a hoĂ n thĂ nh ná»™p báº£n thu giá»ng má»™c.</span>
                      )}
                    </div>

                    {/* 3D VR simulation dynamic representation replay card */}
                    <div className="bg-white p-4.5 rounded-2xl border border-gray-100 flex flex-col justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                          <Tv className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-700">ReplayDataUrl (Tá»a Ä‘á»™ mĂ´i kĂ­nh)</p>
                          <p className="text-[11px] text-gray-400 font-medium truncate max-w-[250px]">
                            {selectedResult.ReplayDataUrl || "KhĂ´ng cĂ³ tá»‡p replay..."}
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
                                Äang mĂ´ táº£ Replay 3D...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                PhĂ¡t replay tÆ°Æ¡ng tĂ¡c VR
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-rose-400 italic">Game chÆ°a cĂ³ dáº£i xuáº¥t tháº§n tá»a Ä‘á»™.</span>
                      )}
                    </div>

                  </div>

                </div>

                {/* Section C: Numeric indicators detail */}
                <div className="bg-[#FDFCF5] p-5 rounded-[28px] border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-6 font-bold text-center">
                  
                  <div className="space-y-1 border-r border-gray-100 last:border-0">
                    <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Ná»— lá»±c thá»©</p>
                    <p className="text-2xl font-black text-gray-800">LÆ°á»£t {selectedResult.AttemptNumber}</p>
                  </div>

                  <div className="space-y-1 border-r border-gray-100 last:border-0">
                    <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Thá»i gian tÆ°Æ¡ng tĂ¡c</p>
                    <p className="text-2xl font-black text-gray-800">{selectedResult.DurationSeconds} giĂ¢y</p>
                  </div>

                  <div className="space-y-1 border-r border-gray-100 last:border-0">
                    <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Äiá»ƒm dáº£i sĂ³ng Ă¢m</p>
                    <p className={cn(
                      "text-2xl font-black italic",
                      selectedResult.Score >= 90 ? 'text-emerald-500' : selectedResult.Score >= 70 ? 'text-[#4EACAF]' : 'text-[#FF8E8E]'
                    )}>
                      {selectedResult.Score} / 100
                    </p>
                  </div>

                  <div className="space-y-1 border-r border-gray-100 last:border-0">
                    <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">HoĂ n thĂ nh lĂºc</p>
                    <p className="text-sm font-black text-gray-700 font-mono mt-1 leading-snug">
                      {selectedResult.CompletedAt || "ChÆ°a gá»­i ná»™p"}
                    </p>
                  </div>

                </div>

                {/* Section D: Detailed Interaction Sequence Log */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#264E50] uppercase tracking-widest ml-1 flex items-center gap-1">
                    <FolderOpen className="w-4 h-4 text-[#4EACAF]" />
                    Interaction Log (Váº¿t logs tÆ°Æ¡ng tĂ¡c váº­t lĂ½ ghi nháº­n tá»« á»©ng dá»¥ng VR)
                  </label>
                  <div className="p-4 bg-gray-900 text-slate-100 rounded-2xl font-mono text-xs whitespace-pre-line leading-relaxed shadow-inner border-2 border-slate-800">
                    {getResultInteractionLog(selectedResult) || "Há»‡ thá»‘ng chÆ°a ghi nháº­n váº¿t log báº¥m hoáº·c phĂ¡t Ă¢m á»Ÿ phiĂªn táº­p nĂ y..."}
                  </div>
                </div>

                {/* Section E: Teacher Feedback (Editable by ADMIN/TEACHER, Viewed by PARENT) */}
                <div className="bg-[#FFFDF5] p-6.5 rounded-3xl border-2 border-dashed border-amber-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquareShare className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-black text-[#264E50] uppercase tracking-widest">
                        Nháº­n xĂ©t Ä‘Ă¡nh giĂ¡ can thiá»‡p ngĂ´n ngá»¯ há»c Ä‘Æ°á»ng
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
                        {editFeedbackMode ? 'Há»§y sá»­a' : 'Chá»‰nh sá»­a nháº­n xĂ©t'}
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
                        placeholder="HĂ£y bá»• sung bĂ i há»c can thiá»‡p, bĂ i thu sá»­a ngá»ng cá»¥ thá»ƒ Ä‘á»ƒ phá»¥ huynh phá»‘i há»£p á»Ÿ nhĂ ..."
                      />
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setEditFeedbackMode(false)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                        >
                          Há»§y
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveFeedback}
                          className="px-5 py-2.5 bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#4EACAF]/10"
                        >
                          Cáº­p nháº­t ngay
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm italic font-bold leading-relaxed bg-white/60 p-4.5 rounded-2xl border border-[#C5E1E3]/20">
                      "{selectedResult.FeedbackText || "ChÆ°a cĂ³ Ă½ kiáº¿n Ä‘Ă¡nh giĂ¡ tá»« quĂ½ nhĂ  trÆ°á»ng trong há»c ká»³ nĂ y..."}"
                    </p>
                  )}

                  <div className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5 pt-1.5">
                    <Info className="w-4 h-4 text-[#4EACAF]" />
                    <span>Lá»™ trĂ¬nh rĂ¨n luyá»‡n há»— trá»£ pháº£n xáº¡ phĂ¡t Ă¢m chá»‰ hiá»ƒn thá»‹ cho phá»¥ huynh khi Ä‘Æ°á»£c giĂ¡o viĂªn duyá»‡t kiá»ƒm Ä‘á»‹nh.</span>
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
                    ÄĂ³ng cá»­a sá»•
                  </button>

                  {/* Simulated Re-exam attempt button if failed */}
                  {selectedResult.CompletionStatus === 'Failed' && (
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`ÄĂ£ phĂ¡t lá»‡nh yĂªu cáº§u bĂ© táº­p láº¡i: "${getExerciseInfo(selectedResult.ExerciseId).ExerciseName}"!`, 'success');
                        setIsDetailModalOpen(false);
                      }}
                      className="py-3 px-6 bg-[#FF8E8E] hover:bg-[#FF8E8E]/95 text-white font-black italic text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#FF8E8E]/10"
                    >
                      YĂªu cáº§u luyá»‡n táº­p láº¡i
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
