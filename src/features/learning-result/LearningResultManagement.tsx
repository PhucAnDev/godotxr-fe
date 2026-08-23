import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Eye,
  Clock,
  ThumbsUp,
  TrendingUp,
  Volume2,
  Play,
  Pause,
  Info,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Activity,
  UserSquare2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  User,
  MessageCircle,
  VolumeX,
  FileAudio,
  CheckCircle,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import CustomSelect from '../../components/common/CustomSelect';
import { useLearningResultApi } from '../../hooks/useLearningResultApi';
import { getSessionUser } from '../../lib/authSession';
import { getLessons } from '../../services/lessonService';
import type { ChildProfileResponse } from '../../services/childProfileService';
import type { ResultResponse } from '../../services/resultService';
import type { LessonResponse } from '../../services/lessonService';

// DB Interfaces
interface Child {
  ChildId: string;
  FullName: string;
  Age: number;
  LearningLevel: string;
}

interface LearningResult {
  ResultId: string;
  ChildId: string;
  LessonId: string | null;
  AttemptNumber: number;
  CompletionStatus: 'Completed' | 'InProgress' | 'Failed' | 'NeedReview';
  Score: number;
  StartedAt: string;
  CompletedAt: string;
  DurationSeconds: number;
  AudioRecordUrl: string;
  ReplayDataUrl: string;
  InteractionLog: string;
  FeedbackText: string;
  CreatedAt: string;
  SessionId: string;
  ErrorCount?: number;
  CorrectCount?: number;
}

type RoleView = 'ADMIN' | 'TEACHER' | 'PARENT';

const API_PAGE_SIZE = 100;

function getStoredRoleView(): RoleView {
  const role = localStorage.getItem('user_role');
  if (role === 'TEACHER') return 'TEACHER';
  if (role === 'PARENT') return 'PARENT';
  return 'ADMIN';
}

function formatDateDMY(value: string | null | undefined): string {
  if (!value) return '';
  const dateTimeMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s|T)(\d{2}):(\d{2}):(\d{2})/);
  if (dateTimeMatch) {
    const [_, y, m, d, hr, min, sec] = dateTimeMatch;
    return `${d}/${m}/${y} ${hr}:${min}:${sec}`;
  }
  const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const [_, y, m, d] = dateMatch;
    return `${d}/${m}/${y}`;
  }
  return value;
}

const mapChildRecord = (c: any): Child => ({
  ChildId: String(c.id),
  FullName: c.fullName,
  Age: c.age,
  LearningLevel: c.learningLevel || 'Chưa phân cấp',
});

const mapResultRecord = (r: ResultResponse): LearningResult => ({
  ResultId: String(r.id),
  ChildId: String(r.childId),
  SessionId: r.sessionId || '',
  LessonId: r.lessonId ? String(r.lessonId) : null,
  AttemptNumber: r.attemptNumber || 1,
  CompletionStatus: (r.completionStatus as LearningResult['CompletionStatus']) || 'InProgress',
  Score: r.score || 0,
  StartedAt: r.startedAt || '',
  CompletedAt: r.completedAt || '',
  DurationSeconds: r.durationSeconds || 0,
  AudioRecordUrl: r.audioRecordUrl || '',
  ReplayDataUrl: r.replayDataUrl || '',
  InteractionLog: r.interactionLog || '',
  FeedbackText: r.feedbackText || '',
  CreatedAt: r.completedAt || r.startedAt || '',
  ErrorCount: r.errorCount || 0,
  CorrectCount: r.correctCount || 0,
});

async function loadAllPages<T>(
  apiMethod: (page: number, size: number) => Promise<any>
): Promise<T[]> {
  let page = 1;
  let allItems: T[] = [];
  let hasMore = true;

  while (hasMore) {
    const res = await apiMethod(page, API_PAGE_SIZE);
    if (res.success && res.data) {
      const items = res.data.items || [];
      allItems = [...allItems, ...items];
      hasMore = items.length === API_PAGE_SIZE && page < 10;
      page++;
    } else {
      hasMore = false;
    }
  }
  return allItems;
}

interface ParsedEvent {
  timeSeconds: number;
  text: string;
}

function parseInteractionLog(log: string): ParsedEvent[] {
  if (!log) return [];
  const segments = log.split(/[|\n]+/);
  const events: ParsedEvent[] = [];

  for (const segment of segments) {
    const correctMatch = segment.match(/\[(\d+)s?\]\s*Correct\s+Answer:\s*(.+)/i);
    if (correctMatch) {
      events.push({
        timeSeconds: parseInt(correctMatch[1], 10),
        text: correctMatch[2].trim()
      });
      continue;
    }

    const wrongMatch = segment.match(/\[(\d+)s?\]\s*Wrong\s+Answer:\s*từ\s+đúng\s*'([^']+)'/i);
    if (wrongMatch) {
      events.push({
        timeSeconds: parseInt(wrongMatch[1], 10),
        text: wrongMatch[2].trim()
      });
      continue;
    }
  }
  return events;
}

export default function LearningResultManagement() {
  const {
    getChildProfiles,
    getCurrentUserWithChildrenProfiles,
    getResultsByChild,
    updateResultFeedback,
    getChunksBySession,
    assessChunk,
    downloadAudioChunk,
    getClassrooms,
    getEnrollments
  } = useLearningResultApi();

  const [results, setResults] = useState<LearningResult[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<string>('ALL');
  const [filterChildId, setFilterChildId] = useState<string>('ALL');

  const currentRoleView = getStoredRoleView();
  const canEditFeedback = currentRoleView === 'ADMIN' || currentRoleView === 'TEACHER';

  // Left Panel Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Detail Right Panel States
  const [selectedResult, setSelectedResult] = useState<LearningResult | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loadingChunks, setLoadingChunks] = useState<boolean>(false);
  const [playingChunkIndex, setPlayingChunkIndex] = useState<number | null>(null);
  const [assessingChunkIndex, setAssessingChunkIndex] = useState<number | null>(null);
  const [chunkAssessments, setChunkAssessments] = useState<Record<number, any>>({});
  const [referenceTexts, setReferenceTexts] = useState<Record<number, string>>({});
  const [feedbackInput, setFeedbackInput] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const parsedEvents = useMemo(() => {
    return selectedResult ? parseInteractionLog(selectedResult.InteractionLog) : [];
  }, [selectedResult]);

  // Toast feedback triggers
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterDateRange, filterChildId]);

  // Load results list
  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      setIsApiLoading(true);
      setApiError(null);

      try {
        const roleView = getStoredRoleView();
        const sessionUser = getSessionUser();

        let childRecords: any[] = [];
        let lessonRecords: LessonResponse[] = [];

        if (roleView === 'PARENT') {
          const [parentResult, lessonsData] = await Promise.all([
            getCurrentUserWithChildrenProfiles(),
            loadAllPages<LessonResponse>(getLessons).catch(() => [] as LessonResponse[])
          ]);
          if (parentResult.success && parentResult.data) {
            childRecords = parentResult.data.childProfiles;
          }
          lessonRecords = lessonsData;
        } else if (roleView === 'TEACHER') {
          const [allClassrooms, allEnrollments, allChildren, lessonsData] = await Promise.all([
            loadAllPages<any>(getClassrooms).catch(() => []),
            loadAllPages<any>(getEnrollments).catch(() => []),
            loadAllPages<ChildProfileResponse>(getChildProfiles).catch(() => []),
            loadAllPages<LessonResponse>(getLessons).catch(() => [] as LessonResponse[])
          ]);

          const teacherId = Number(sessionUser?.UserId.replace(/\D/g, '')) || undefined;
          const teacherName = sessionUser?.FullName.trim().toLowerCase() ?? '';

          const teacherClassIds = new Set(
            allClassrooms
              .filter((classroom: any) => {
                const matchedById = teacherId ? classroom.userId === teacherId : false;
                const matchedByName = teacherName ? classroom.teacherName.trim().toLowerCase() === teacherName : false;
                return matchedById || matchedByName;
              })
              .map((classroom) => classroom.id)
          );

          const teacherEnrollments = allEnrollments.filter((enrollment: any) =>
            teacherClassIds.has(enrollment.classId)
          );

          const childIds = Array.from(
            new Set(teacherEnrollments.map((enrollment: any) => enrollment.childId))
          );

          childRecords = allChildren.filter((child) => childIds.includes(child.id));
          lessonRecords = lessonsData;
        } else {
          // ADMIN view: load all children and lessons
          const [allChildren, lessonsData] = await Promise.all([
            loadAllPages<ChildProfileResponse>(getChildProfiles).catch(() => []),
            loadAllPages<LessonResponse>(getLessons).catch(() => [] as LessonResponse[])
          ]);
          childRecords = allChildren;
          lessonRecords = lessonsData;
        }

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
        setLessons(lessonRecords);
        setResults(uniqueResults.map(mapResultRecord));
      } catch (error) {
        if (cancelled) return;
        setApiError(error instanceof Error ? error.message : 'Không thể tải dữ liệu kết quả từ API.');
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
  }, [getChildProfiles, getCurrentUserWithChildrenProfiles, getResultsByChild, getClassrooms, getEnrollments]);

  // Statistics computations
  const filteredResultsForStats = useMemo(() => {
    return results.filter((res) => {
      if (filterChildId !== 'ALL' && res.ChildId !== filterChildId) return false;
      return true;
    });
  }, [results, filterChildId]);

  const totalAttempts = filteredResultsForStats.length;
  const totalMinutes = filteredResultsForStats.reduce((sum, res) => sum + res.DurationSeconds, 0) / 60;
  const formattedTotalMinutes = totalMinutes > 0 ? Math.round(totalMinutes * 10) / 10 : 0;

  const completionRate = useMemo(() => {
    if (totalAttempts === 0) return 0;
    const completedCount = filteredResultsForStats.filter((r) => r.CompletionStatus === 'Completed').length;
    return Math.round((completedCount / totalAttempts) * 100);
  }, [filteredResultsForStats, totalAttempts]);

  // Expanded Right Panel selection handler
  const handleSelectResult = async (res: LearningResult) => {
    if (selectedResult?.ResultId === res.ResultId) {
      return;
    }

    // Stop currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingChunkIndex(null);
    }

    setSelectedResult(res);
    setChunks([]);
    setChunkAssessments({});
    setFeedbackInput(res.FeedbackText || '');

    // Parse InteractionLog to pre-populate expected reference text for each chunk
    const logEvents = parseInteractionLog(res.InteractionLog);
    const initialRefTexts: Record<number, string> = {};
    logEvents.forEach((ev, idx) => {
      initialRefTexts[idx] = ev.text;
    });
    setReferenceTexts(initialRefTexts);

    setLoadingChunks(true);

    try {
      const child = children.find(c => c.ChildId === res.ChildId);
      const childIdVal = child ? Number(child.ChildId) : Number(res.ChildId);

      const chunkRes = await getChunksBySession(childIdVal, res.SessionId);
      if (chunkRes.success && chunkRes.data) {
        const formattedChunks = await Promise.all(
          chunkRes.data.map(async (chunk: any) => {
            const blobRes = await downloadAudioChunk(childIdVal, res.SessionId, chunk.chunkIndex);
            if (blobRes.success && blobRes.data) {
              const blobUrl = URL.createObjectURL(blobRes.data);
              return { ...chunk, chunkUrl: blobUrl };
            }
            return {
              ...chunk,
              chunkUrl: chunk.chunkUrl?.replace('http://minio:9000', 'https://minio.103-162-30-111.sslip.io')
            };
          })
        );
        setChunks(formattedChunks);

        // Automatically trigger AI assessment for each chunk in parent view
        if (getStoredRoleView() === 'PARENT') {
          formattedChunks.forEach(async (chunk) => {
            const cIndex = chunk.chunkIndex;
            const text = initialRefTexts[cIndex]?.trim();
            if (text) {
              try {
                const assessRes = await assessChunk({
                  childProfileId: childIdVal,
                  sessionId: res.SessionId,
                  chunkIndex: cIndex,
                  referenceText: text
                });
                if (assessRes.success && assessRes.data) {
                  setChunkAssessments(prev => ({ ...prev, [cIndex]: assessRes.data }));
                }
              } catch (err) {
                console.error(`Auto assessment failed for chunk ${cIndex}:`, err);
              }
            }
          });
        }
      } else {
        setChunks([]);
      }
    } catch (err) {
      showToast('Không quét thấy file audio chunk tương ứng.', 'warn');
    } finally {
      setLoadingChunks(false);
    }
  };

  // Revoke object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      chunks.forEach(chunk => {
        if (chunk.chunkUrl && chunk.chunkUrl.startsWith('blob:')) {
          URL.revokeObjectURL(chunk.chunkUrl);
        }
      });
    };
  }, [chunks]);

  // Audio Play handler
  const handlePlayChunk = (url: string, index: number) => {
    if (playingChunkIndex === index) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingChunkIndex(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingChunkIndex(index);

    audio.play().catch(err => {
      console.error("Audio playback failed:", err);
      showToast("Không thể phát âm thanh này.", "warn");
      setPlayingChunkIndex(null);
    });

    audio.onended = () => {
      setPlayingChunkIndex(null);
    };
  };

  // Cleanup audio play on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [selectedResult]);

  // Save feedback remarks
  const handleSaveFeedback = async () => {
    if (!selectedResult) return;
    if (!feedbackInput.trim()) {
      showToast('Vui lòng điền nội dung nhận xét!', 'warn');
      return;
    }

    setSavingFeedback(true);
    try {
      const res = await updateResultFeedback(Number(selectedResult.ResultId), feedbackInput);
      if (res.success) {
        showToast('Lưu nhận xét và hướng dẫn rèn luyện thành công!', 'success');
        setResults(prev => prev.map(r => r.ResultId === selectedResult.ResultId ? { ...r, FeedbackText: feedbackInput } : r));
        setSelectedResult(prev => prev ? { ...prev, FeedbackText: feedbackInput } : null);
      } else {
        showToast('Lưu phản hồi thất bại.', 'warn');
      }
    } catch (err) {
      showToast('Lỗi hệ thống khi cập nhật phản hồi.', 'warn');
    } finally {
      setSavingFeedback(false);
    }
  };

  // Run AI Speech Pronunciation Assessment
  const handleAssessChunk = async (chunkIndex: number) => {
    if (!selectedResult) return;
    const text = referenceTexts[chunkIndex]?.trim();
    if (!text) {
      showToast('Vui lòng điền từ chuẩn để AI đánh giá!', 'warn');
      return;
    }

    setAssessingChunkIndex(chunkIndex);
    showToast(`AI đang tiến hành thẩm âm đoạn #${chunkIndex + 1}...`, 'info');

    try {
      const child = children.find(c => c.ChildId === selectedResult.ChildId);
      const childIdVal = child ? Number(child.ChildId) : Number(selectedResult.ChildId);

      const res = await assessChunk({
        childProfileId: childIdVal,
        sessionId: selectedResult.SessionId,
        chunkIndex,
        referenceText: text
      });

      if (res.success && res.data) {
        setChunkAssessments(prev => ({ ...prev, [chunkIndex]: res.data }));
        showToast('AI đã hoàn tất đánh giá phát âm thành công!', 'success');
      } else {
        showToast('Đánh giá AI thất bại.', 'warn');
      }
    } catch (err) {
      showToast('Lỗi kết nối dịch vụ đánh giá phát âm AI.', 'warn');
    } finally {
      setAssessingChunkIndex(null);
    }
  };

  // Filters logic
  const filteredResults = useMemo(() => {
    return results.filter((res) => {
      const child = children.find((c) => c.ChildId === res.ChildId);
      const lesson = lessons.find((l) => String(l.id) === res.LessonId);

      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchChild = child?.FullName.toLowerCase().includes(query);
        const matchLesson = lesson?.lessonName.toLowerCase().includes(query);
        const matchSession = (res.SessionId || res.ResultId).toLowerCase().includes(query);
        if (!matchChild && !matchLesson && !matchSession) return false;
      }

      // Status Filter
      if (filterStatus !== 'ALL') {
        if (filterStatus === 'Completed' && res.CompletionStatus !== 'Completed') return false;
        if (filterStatus === 'Failed' && res.CompletionStatus !== 'Failed') return false;
        if (filterStatus === 'InProgress' && res.CompletionStatus !== 'InProgress') return false;
      }

      // Child Profile Filter
      if (filterChildId !== 'ALL' && res.ChildId !== filterChildId) return false;

      // Date Range Filter
      if (filterDateRange !== 'ALL') {
        const now = new Date();
        const completedDate = res.CompletedAt ? new Date(res.CompletedAt) : new Date(res.StartedAt);
        const diffTime = Math.abs(now.getTime() - completedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterDateRange === 'TODAY' && diffDays > 1) return false;
        if (filterDateRange === 'WEEK' && diffDays > 7) return false;
        if (filterDateRange === 'MONTH' && diffDays > 30) return false;
      }

      return true;
    });
  }, [results, children, lessons, searchQuery, filterStatus, filterChildId, filterDateRange]);

  // Paginated list
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredResults.slice(startIndex, startIndex + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  const getChildDetailInfo = (childId: string) => {
    return children.find((c) => c.ChildId === childId);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700 pb-2 relative" id="results-split-page-wrapper">
      {/* Toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
          >
            <div className={cn(
              "px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white bg-slate-900/90 backdrop-blur-md text-white text-sm font-semibold",
              toastMessage.type === 'success' ? 'border-emerald-500/30' : toastMessage.type === 'info' ? 'border-indigo-500/30' : 'border-rose-500/30'
            )}>
              <div className="p-2 rounded-lg bg-white/10">
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : toastMessage.type === 'warn' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                ) : (
                  <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                )}
              </div>
              <p className="flex-1 min-w-0">{toastMessage.text}</p>
              <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/10 rounded-full text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled Dashboard Header */}
      <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 md:p-5 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Kết Quả <span className="text-[#FF8E8E]">Luyện Tập</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl text-xs md:text-sm leading-relaxed">
            Xem lịch sử rèn luyện của học sinh từ thiết bị VR, lắng nghe file âm thanh ghi âm chi tiết và đánh giá nhận xét tiến bộ.
          </p>
        </div>

        <div className="bg-white/60 p-4 rounded-3xl border border-white/85 shadow-sm flex items-center gap-3 self-start lg:self-center shrink-0">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
            <UserSquare2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider leading-none">Học viên rèn luyện:</h4>
            <CustomSelect
              value={filterChildId}
              onChange={(val) => setFilterChildId(val)}
              options={[
                { value: 'ALL', label: '🌟 TẤT CẢ HỌC SINH MẦM NON' },
                ...children.map((kd) => ({
                  value: kd.ChildId,
                  label: `👶 ${kd.FullName} (${kd.Age}t) - ${kd.LearningLevel}`
                }))
              ]}
              className="min-w-[240px] font-black"
            />
          </div>
        </div>
      </div>

      {/* Statistics indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 border border-teal-100">
            <Activity className="w-5 h-5 text-[#4EACAF]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">{totalAttempts}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Tổng lượt luyện</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
            <Clock className="w-5 h-5 text-[#FF8E8E]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">{formattedTotalMinutes} phút</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Tổng giờ tương tác</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
            <ThumbsUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 leading-none">{completionRate}%</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">Tỷ lệ hoàn thành</p>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-sm font-semibold text-rose-700">
          {apiError}
        </div>
      )}

      {/* Split-Panel Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Side: Results List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Lịch sử luyện tập</h2>

            {/* Filters Subsystem */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo học sinh, bài tập, Session ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs font-semibold focus:border-[#4EACAF] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'Completed', label: 'Đã hoàn thành' },
                    { value: 'InComplete', label: 'Chưa hoàn thành' }
                  ]}
                  className="w-full"
                />

                <CustomSelect
                  value={filterDateRange}
                  onChange={setFilterDateRange}
                  options={[
                    { value: 'ALL', label: 'Tất cả thời gian' },
                    { value: 'TODAY', label: 'Hôm nay' },
                    { value: 'WEEK', label: '7 ngày qua' },
                    { value: 'MONTH', label: '30 ngày qua' }
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            {/* Results Items List */}
            {isApiLoading ? (
              <div className="py-12 text-center">
                <Activity className="w-8 h-8 text-[#4EACAF] animate-spin mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">Đang tải danh sách kết quả...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <VolumeX className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-semibold text-sm">Không tìm thấy lượt luyện tập phù hợp.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedResults.map((res) => {
                  const isSelected = selectedResult?.ResultId === res.ResultId;
                  const child = getChildDetailInfo(res.ChildId);
                  const lesson = lessons.find(l => String(l.id) === res.LessonId);

                  return (
                    <div
                      key={res.ResultId}
                      onClick={() => handleSelectResult(res)}
                      className={cn(
                        "rounded-2xl border p-4.5 transition-all cursor-pointer space-y-3",
                        isSelected
                          ? "border-[#4EACAF] bg-[#4EACAF]/5 shadow-sm"
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 text-sm">{child?.FullName || `Bé (ID: ${res.ChildId})`}</p>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              Session #{res.SessionId || res.ResultId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                            {lesson?.lessonName || 'Bài tập tự do'}
                          </p>
                        </div>
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded font-extrabold uppercase shrink-0 tracking-wider",
                          res.CompletionStatus === 'Completed'
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        )}>
                          {res.CompletionStatus === 'Completed' ? 'Đạt' : 'Chưa hoàn thành'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100/60 pt-3 text-[11px] font-bold text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{res.DurationSeconds}s</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-[#4EACAF]">Điểm: {res.Score}/{lessons.find(l => String(l.id) === res.LessonId)?.maxScore ?? 95}</span>
                        </div>
                        <span className="text-slate-400">{formatDateDMY(res.CompletedAt)}</span>
                      </div>
                    </div>
                  );
                })}

                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredResults.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  itemLabel="lượt luyện"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed session assessment & Chunks */}
        <div className="lg:col-span-7">
          {selectedResult ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-300">

              {/* Header Info */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-slate-100 text-slate-650 rounded">
                      Session #{selectedResult.SessionId || selectedResult.ResultId}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Học sinh: <span className="text-slate-600 font-normal">{getChildDetailInfo(selectedResult.ChildId)?.FullName}</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mt-2">
                    {lessons.find(l => String(l.id) === selectedResult.LessonId)?.lessonName || 'Bài tập tự do'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Statistics Quick Info */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thời lượng</span>
                  <span className="text-base font-extrabold text-slate-800 mt-1 block">{selectedResult.DurationSeconds} giây</span>
                </div>
                <div className="text-center border-x border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Điểm số</span>
                  <span className="text-base font-extrabold text-indigo-600 mt-1 block">
                    {selectedResult.Score}/{lessons.find(l => String(l.id) === selectedResult.LessonId)?.maxScore ?? 95}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tương tác</span>
                  <span className="text-xs font-bold text-emerald-600 mt-1.5 block">Đúng: {selectedResult.CorrectCount} lần| Sai: {selectedResult.ErrorCount} lần</span>
                </div>
              </div>

              {/* Comments feedback text section */}
              {canEditFeedback && (
                <div className="space-y-3 bg-[#FFFDF5] p-4.5 rounded-2xl border border-yellow-100">
                  <h4 className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-amber-500" />
                    Nhận xét & Hướng dẫn từ giáo viên
                  </h4>
                  <textarea
                    rows={3}
                    placeholder="Viết hướng dẫn khẩu hình, các từ bé cần luyện thêm ở nhà hoặc nhận xét chung..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm font-medium placeholder-slate-400 bg-white focus:border-[#4EACAF] transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      disabled={savingFeedback}
                      onClick={handleSaveFeedback}
                      className="px-5 py-2.5 bg-[#4EACAF] hover:bg-[#3D8C8F] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      {savingFeedback ? (
                        <Activity className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Lưu nhận xét
                    </button>
                  </div>
                </div>
              )}

              {/* Display feedback text to parent */}
              {currentRoleView === 'PARENT' && (
                <div className="space-y-3 bg-[#FFFDF5] p-4.5 rounded-2xl border border-yellow-100">
                  <h4 className="text-sm font-bold text-slate-855 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-amber-500" />
                    Nhận xét & Hướng dẫn từ giáo viên
                  </h4>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 text-sm font-medium text-slate-700 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                    {selectedResult.FeedbackText ? (
                      selectedResult.FeedbackText
                    ) : (
                      <span className="text-slate-400 italic">Chưa có nhận xét hay hướng dẫn nào từ giáo viên cho lượt luyện tập này.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Interaction Log Section */}
              {currentRoleView !== 'PARENT' && (
                <div className="space-y-2.5">
                  <h4 className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#4EACAF]" />
                    Nhật ký tương tác (Interaction Log)
                  </h4>
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs whitespace-pre-line leading-relaxed shadow-inner border border-slate-850 max-h-48 overflow-y-auto">
                    {selectedResult.InteractionLog || "Hệ thống chưa ghi nhận vết log tương tác ở phiên tập này..."}
                  </div>
                </div>
              )}

              {/* Chunk audio listing section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Danh sách các file âm thanh ghi âm:</h4>
                  <span className="text-xs bg-[#4EACAF]/10 text-[#4EACAF] px-2 py-0.5 rounded font-bold">
                    {chunks.length} đoạn âm thanh
                  </span>
                </div>

                {loadingChunks ? (
                  <div className="py-12 text-center">
                    <Activity className="w-8 h-8 text-[#4EACAF] animate-spin mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">Đang quét tìm các file âm thanh từ máy chủ MinIO...</p>
                  </div>
                ) : chunks.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                    <VolumeX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Không quét thấy file audio chunk tương ứng trong session này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chunks.map((chunk) => {
                      const cIndex = chunk.chunkIndex;
                      const assessment = chunkAssessments[cIndex];
                      const isAssessing = assessingChunkIndex === cIndex;

                      return (
                        <div
                          key={cIndex}
                          className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-4 transition-all hover:bg-slate-50/80"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-[#4EACAF]/10 text-[#4EACAF] rounded-lg">
                                <FileAudio className="w-4 h-4" />
                              </div>
                              <div className="text-sm font-bold text-slate-800">
                                {parsedEvents[cIndex]
                                  ? `Đoạn âm thanh giây: [${parsedEvents[cIndex].timeSeconds}s]`
                                  : `Đoạn âm thanh #${cIndex + 1}`
                                }
                              </div>
                            </div>

                            {/* Player control button */}
                            <button
                              onClick={() => handlePlayChunk(chunk.chunkUrl, cIndex)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border self-start sm:self-auto",
                                playingChunkIndex === cIndex
                                  ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/80"
                                  : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/80"
                              )}
                            >
                              {playingChunkIndex === cIndex ? (
                                <>
                                  <Pause className="w-3.5 h-3.5 animate-pulse" />
                                  <span>Đang phát...</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Nghe ghi âm</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Expectation text input & AI assessment trigger */}
                          <div className="space-y-3">
                            {currentRoleView !== 'PARENT' ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">Từ/Câu kỳ vọng:</span>
                                <input
                                  type="text"
                                  placeholder="Nhập từ chuẩn bé phải phát âm..."
                                  value={referenceTexts[cIndex] || ''}
                                  onChange={(e) => setReferenceTexts(prev => ({ ...prev, [cIndex]: e.target.value }))}
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-xs font-semibold placeholder-slate-400 focus:border-[#4EACAF]"
                                />
                                <button
                                  type="button"
                                  disabled={isAssessing}
                                  onClick={() => handleAssessChunk(cIndex)}
                                  className="px-4 py-1.5 bg-[#4EACAF] hover:bg-[#3D8C8F] disabled:bg-slate-350 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                                >
                                  {isAssessing ? (
                                    <Activity className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                  AI Đánh giá
                                </button>
                              </div>
                            ) : (
                              referenceTexts[cIndex] && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-500">Từ/Câu kỳ vọng:</span>
                                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
                                    "{referenceTexts[cIndex]}"
                                  </span>
                                </div>
                              )
                            )}

                            {/* Assessment scores presentation layout */}
                            {assessment && (
                              <div className="p-4 bg-white border border-slate-200/85 rounded-xl space-y-3 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                  <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                                    <div className="text-xs font-bold text-slate-450">Độ chính xác</div>
                                    <div className="text-sm font-black text-emerald-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.accuracyScore ??
                                        assessment.PronunciationAssessment?.AccuracyScore ??
                                        assessment.AccuracyScore ?? 0}%
                                    </div>
                                  </div>
                                  <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                                    <div className="text-xs font-bold text-slate-450">Phát âm</div>
                                    <div className="text-sm font-black text-indigo-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.pronunciationScore ??
                                        assessment.PronunciationAssessment?.PronunciationScore ??
                                        assessment.PronScore ??
                                        assessment.PronunciationScore ?? 0}%
                                    </div>
                                  </div>
                                  <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100/50">
                                    <div className="text-xs font-bold text-slate-450">Trôi chảy</div>
                                    <div className="text-sm font-black text-purple-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.fluencyScore ??
                                        assessment.PronunciationAssessment?.FluencyScore ??
                                        assessment.FluencyScore ?? 0}%
                                    </div>
                                  </div>
                                  <div className="p-2 bg-teal-50/50 rounded-lg border border-teal-100/50">
                                    <div className="text-xs font-bold text-slate-450">Hoàn thành</div>
                                    <div className="text-sm font-black text-teal-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.completenessScore ??
                                        assessment.PronunciationAssessment?.CompletenessScore ??
                                        assessment.CompletenessScore ?? 0}%
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                  <div className="text-xs font-bold text-slate-400">Chi tiết phát âm từ của AI:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {(assessment.words || assessment.Words || []).map((wObj: any, wIdx: number) => {
                                      const wordText = wObj.word || wObj.Word;
                                      const score = wObj.pronunciationAssessment?.accuracyScore ??
                                        wObj.PronunciationAssessment?.AccuracyScore ??
                                        wObj.AccuracyScore ?? 0;
                                      const isCorrect = score >= 80;
                                      const isMedium = score >= 50 && score < 80;

                                      return (
                                        <div
                                          key={wIdx}
                                          className={cn(
                                            "px-2.5 py-1 rounded-lg border font-bold text-xs flex items-center gap-1.5 shadow-sm",
                                            isCorrect
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                              : isMedium
                                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                                : "bg-rose-50 text-rose-700 border-rose-100"
                                          )}
                                        >
                                          <span>{wordText}</span>
                                          <span className="text-[10px] opacity-70">({score})</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center py-24 space-y-4">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-[#4EACAF]">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-700">Chưa có lượt luyện tập nào được chọn</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
                  Vui lòng click chọn một lượt luyện tập ở danh sách bên trái để xem các file âm thanh ghi âm cụ thể của bé và thực hiện đánh giá phát âm AI.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
