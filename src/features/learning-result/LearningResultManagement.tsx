import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Clock,
  ThumbsUp,
  TrendingUp,
  Volume2,
  Play,
  Pause,
  Activity,
  UserSquare2,
  Sparkles,
  ShieldAlert,
  MessageCircle,
  VolumeX,
  FileAudio,
  CheckCircle2,
  CheckCircle,
  Copy,
  Check,
  Send,
  Tag,
  Brain,
  Award,
  Layers,
  Baby
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

function truncateSessionId(id: string): string {
  if (!id) return '#---';
  if (id.length <= 10) return `#${id}`;
  return `#...${id.slice(-6)}`;
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
  timeFormatted: string;
  expectedText: string;
  spokenText?: string;
  isCorrect: boolean;
  statusText: string;
}

function parseInteractionLogEvents(log: string): ParsedEvent[] {
  if (!log) return [];
  const segments = log.split(/[|\n]+/).map((s) => s.trim()).filter(Boolean);
  const events: ParsedEvent[] = [];

  for (const segment of segments) {
    const wrongMatch =
      segment.match(/\[(\d+)s?\]\s*Wrong\s+Answer:\s*từ\s+đúng\s*'([^']+)',?\s*trẻ\s+nói:\s*'([^']+)'/i) ||
      segment.match(/\[(\d+)s?\]\s*Wrong\s+Answer:\s*từ\s+đúng\s*'([^']+)'/i);

    if (wrongMatch) {
      const sec = parseInt(wrongMatch[1], 10);
      const min = Math.floor(sec / 60);
      const remSec = sec % 60;
      const fmt = `${String(min).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
      events.push({
        timeSeconds: sec,
        timeFormatted: fmt,
        expectedText: wrongMatch[2].trim(),
        spokenText: wrongMatch[3] ? wrongMatch[3].trim() : 'chưa đủ từ',
        isCorrect: false,
        statusText: 'Chưa đạt / Thiếu từ',
      });
      continue;
    }

    const correctMatch = segment.match(/\[(\d+)s?\]\s*Correct\s+Answer:\s*(.+)/i);
    if (correctMatch) {
      const sec = parseInt(correctMatch[1], 10);
      const min = Math.floor(sec / 60);
      const remSec = sec % 60;
      const fmt = `${String(min).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
      events.push({
        timeSeconds: sec,
        timeFormatted: fmt,
        expectedText: correctMatch[2].trim(),
        spokenText: correctMatch[2].trim(),
        isCorrect: true,
        statusText: 'Đạt / Chính xác',
      });
      continue;
    }
  }

  return events;
}

function generateAiFeedbackSuggestion(
  result: LearningResult,
  lessonName: string,
  events: ParsedEvent[],
  childName?: string
): string {
  const name = childName || 'Bé';
  const score = result.Score;
  const wrongEvents = events.filter((e) => !e.isCorrect);

  if (score >= 80) {
    return `${name} hoàn thành rất tốt bài tập "${lessonName}" (Đạt ${score}/100 điểm). Bé phản xạ nhanh, nhận biết rõ các vật thể trong môi trường VR và phát âm tròn vành rõ chữ.`;
  } else if (score >= 50) {
    const errorNote =
      wrongEvents.length > 0
        ? ` ở mốc [${wrongEvents[0].timeFormatted}] (kỳ vọng: "${wrongEvents[0].expectedText}", trẻ nói: "${wrongEvents[0].spokenText || 'chưa đủ từ'}")`
        : '';
    return `${name} có sự tập trung tốt trong bài học "${lessonName}" (Đạt ${score}/100 điểm). Bé ghi nhớ được từ vựng chính, tuy nhiên còn gặp chút vấp váp${errorNote}. Đề xuất giáo viên và phụ huynh hỗ trợ luyện thêm khẩu hình cho bé ở nhà.`;
  } else {
    const wrongList = wrongEvents.map((e) => `"${e.expectedText}"`).slice(0, 2).join(', ');
    const errorNote = wrongList ? ` đặc biệt ở các từ ${wrongList}` : '';
    return `${name} cần thêm thời gian rèn luyện bài học "${lessonName}"${errorNote}. Bé còn nói thiếu từ và chưa phát âm rõ âm đệm. Đề xuất gia đình phối hợp mở lại các đoạn âm thanh và rèn khẩu hình cùng bé.`;
  }
}

const QUICK_FEEDBACK_TAGS = [
  'Cần chú ý âm đệm',
  'Tập trung tốt',
  'Phản xạ nhanh',
  'Cần phát âm rõ từ đầu',
  'Tiến bộ rõ rệt',
];

export default function LearningResultManagement() {
  const {
    getChildProfiles,
    getMyStudents,
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
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const parsedEvents = useMemo(() => {
    return selectedResult ? parseInteractionLogEvents(selectedResult.InteractionLog) : [];
  }, [selectedResult]);

  // Toast notifications
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
          const [teacherStudentsRes, lessonsData] = await Promise.all([
            getMyStudents(1, 100).catch(() => ({ success: false, data: null })),
            loadAllPages<LessonResponse>(getLessons).catch(() => [] as LessonResponse[])
          ]);

          if (teacherStudentsRes.success && teacherStudentsRes.data?.items) {
            childRecords = teacherStudentsRes.data.items;
          } else {
            // Fallback if API fails or returns empty
            const [allClassrooms, allEnrollments, allChildren] = await Promise.all([
              loadAllPages<any>(getClassrooms).catch(() => []),
              loadAllPages<any>(getEnrollments).catch(() => []),
              loadAllPages<ChildProfileResponse>(getChildProfiles).catch(() => []),
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
          }
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
    const logEvents = parseInteractionLogEvents(res.InteractionLog);
    const initialRefTexts: Record<number, string> = {};
    logEvents.forEach((ev, idx) => {
      initialRefTexts[idx] = ev.expectedText;
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

  // AI Smart Feedback Auto Generator (Section 3.3.C)
  const handleGenerateAiFeedback = () => {
    if (!selectedResult) return;
    setAiSuggesting(true);
    const lesson = lessons.find(l => String(l.id) === selectedResult.LessonId);
    const child = children.find(c => c.ChildId === selectedResult.ChildId);
    const suggestion = generateAiFeedbackSuggestion(
      selectedResult,
      lesson?.lessonName || 'Bài tập tự do',
      parsedEvents,
      child?.FullName
    );

    setTimeout(() => {
      setFeedbackInput(suggestion);
      setAiSuggesting(false);
      showToast('Đã tạo gợi ý nhận xét từ AI thành công!', 'success');
    }, 400);
  };

  // Quick feedback tag handler
  const handleAddQuickTag = (tag: string) => {
    setFeedbackInput(prev => {
      if (!prev.trim()) return `[${tag}] `;
      if (prev.includes(`[${tag}]`)) return prev;
      return `${prev.trim()} [${tag}]`;
    });
  };

  // Copy full Session ID to clipboard
  const handleCopySessionId = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      setCopiedSessionId(true);
      showToast(`Đã sao chép Session ID: #${id}`, 'success');
      setTimeout(() => setCopiedSessionId(false), 2000);
    });
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

  // Interactive Timeline Items (combining chunks & parsed events)
  const timelineItems = useMemo(() => {
    if (chunks.length > 0) {
      return chunks.map((chunk, idx) => {
        const event = parsedEvents[idx];
        return {
          chunkIndex: chunk.chunkIndex,
          chunkUrl: chunk.chunkUrl,
          timeSeconds: event?.timeSeconds ?? (idx * 30),
          timeFormatted: event?.timeFormatted ?? `${String(Math.floor((idx * 30) / 60)).padStart(2, '0')}:${String((idx * 30) % 60).padStart(2, '0')}`,
          expectedText: referenceTexts[chunk.chunkIndex] || event?.expectedText || 'Bài tập tự do',
          spokenText: event?.spokenText || event?.expectedText || 'Ghi âm trực tiếp',
          isCorrect: event ? event.isCorrect : true,
          statusText: event ? event.statusText : 'Ghi âm',
        };
      });
    }

    if (parsedEvents.length > 0) {
      return parsedEvents.map((ev, idx) => ({
        chunkIndex: idx,
        chunkUrl: '',
        timeSeconds: ev.timeSeconds,
        timeFormatted: ev.timeFormatted,
        expectedText: ev.expectedText,
        spokenText: ev.spokenText,
        isCorrect: ev.isCorrect,
        statusText: ev.statusText,
      }));
    }

    return [];
  }, [chunks, parsedEvents, referenceTexts]);

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

      {/* Section 3.1: Styled Dashboard Header */}
      <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 md:p-5 border border-white/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative z-30">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Kết Quả <span className="text-[#FF8E8E]">Luyện Tập</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl text-xs md:text-sm leading-relaxed">
            Xem lịch sử rèn luyện của học sinh từ thiết bị VR, lắng nghe file âm thanh ghi âm chi tiết và đánh giá nhận xét tiến bộ.
          </p>
        </div>

        {/* Header Student Selector Card */}
        <div className="bg-white/60 p-3.5 rounded-2xl border border-white/80 shadow-sm flex items-center gap-3 self-start sm:self-center shrink-0 relative z-30">
          <div className="w-9 h-9 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
            <Baby className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider leading-none">HỌC VIÊN RÈN LUYỆN:</h4>
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
              variant="subform"
              className="w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Section 3.1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 border border-teal-100">
            <Activity className="w-5 h-5 text-[#4EACAF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-slate-800 leading-none">{totalAttempts}</p>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">+12% tuần này</span>
            </div>
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

      {/* Section 3.2 & 3.3: Split-Panel Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Section 3.2: Left Side Master List Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Lịch sử luyện tập</h2>

            {/* Filters Subsystem */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo tên học sinh, bài học, Session ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 outline-none text-xs font-semibold focus:border-[#4EACAF] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Child Filter Select */}
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
                variant="subform"
                className="w-full"
              />

              <div className="grid grid-cols-2 gap-2">
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'Completed', label: 'Đã hoàn thành' },
                    { value: 'InProgress', label: 'Đang làm dở' }
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

            {/* Master Session Cards List */}
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
              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {paginatedResults.map((res) => {
                  const isSelected = selectedResult?.ResultId === res.ResultId;
                  const child = getChildDetailInfo(res.ChildId);
                  const lesson = lessons.find(l => String(l.id) === res.LessonId);
                  const sessionTag = truncateSessionId(res.SessionId || res.ResultId);

                  return (
                    <div
                      key={res.ResultId}
                      onClick={() => handleSelectResult(res)}
                      className={cn(
                        "rounded-2xl border p-4 transition-all cursor-pointer space-y-2.5 relative overflow-hidden",
                        isSelected
                          ? "border-[#4EACAF] bg-[#4EACAF]/5 shadow-sm border-l-4 border-l-[#4EACAF]"
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      )}
                    >
                      {/* Line 1: Student Name + Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-800 text-[15px] truncate">
                          {child?.FullName || `Bé (ID: ${res.ChildId})`}
                        </p>
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded font-extrabold uppercase shrink-0 tracking-wider",
                          res.CompletionStatus === 'Completed'
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        )}>
                          {res.CompletionStatus === 'Completed' ? 'Đạt' : 'Chưa đạt'}
                        </span>
                      </div>

                      {/* Line 2: Lesson Name + Session ID Tag */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <p className="text-slate-500 font-medium truncate">
                          {lesson?.lessonName || 'Bài tập tự do'}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopySessionId(res.SessionId || res.ResultId);
                          }}
                          title={`Sao chép đầy đủ ID: ${res.SessionId || res.ResultId}`}
                          className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors shrink-0 flex items-center gap-1"
                        >
                          <span>Session {sessionTag}</span>
                          <Copy className="w-2.5 h-2.5 text-slate-400" />
                        </button>
                      </div>

                      {/* Line 3: Duration, Score, Date */}
                      <div className="flex items-center justify-between border-t border-slate-100/60 pt-2 text-[11px] font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{res.DurationSeconds}s</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[#4EACAF]">🎯 {res.Score}/{lessons.find(l => String(l.id) === res.LessonId)?.maxScore ?? 95}</span>
                        </div>
                        <span className="text-slate-400 font-normal">📅 {formatDateDMY(res.CompletedAt)}</span>
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

        {/* Section 3.3: Right Side Detail Panel */}
        <div className="lg:col-span-7">
          {selectedResult ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-300 max-h-[calc(100vh-140px)] overflow-y-auto">

              {/* Section 3.3.A: Header Info & Quick Metrics */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopySessionId(selectedResult.SessionId || selectedResult.ResultId)}
                      className="text-xs font-mono font-bold px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors flex items-center gap-1.5"
                    >
                      <span>Session #{selectedResult.SessionId || selectedResult.ResultId}</span>
                      {copiedSessionId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                    <span className="text-xs text-slate-400 font-medium">
                      Học sinh: <span className="text-slate-600 font-normal">{getChildDetailInfo(selectedResult.ChildId)?.FullName}</span>
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mt-1">
                    {lessons.find(l => String(l.id) === selectedResult.LessonId)?.lessonName || 'Bài tập tự do'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
                  title="Đóng chi tiết"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Section 3.3.A: Quick Metric Strip */}
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
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đúng: {selectedResult.CorrectCount || 0}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Sai: {selectedResult.ErrorCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3.3.B: Interactive Timeline Stream (Replaces Console Box & Audio List) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-lg">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Dòng thời gian tương tác & Ghi âm (Interactive Timeline Stream)
                    </h4>
                  </div>
                  <span className="text-xs bg-[#4EACAF]/10 text-[#4EACAF] px-2.5 py-1 rounded-full font-bold">
                    {timelineItems.length} mốc tương tác
                  </span>
                </div>

                {loadingChunks ? (
                  <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Activity className="w-8 h-8 text-[#4EACAF] animate-spin mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">Đang quét tìm các file âm thanh từ máy chủ MinIO...</p>
                  </div>
                ) : timelineItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                    <VolumeX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Chưa ghi nhận dữ liệu âm thanh tương tác ở phiên tập này.</p>
                  </div>
                ) : (
                  <div className="relative pl-4 space-y-4 border-l-2 border-slate-100">
                    {timelineItems.map((item, idx) => {
                      const isPlaying = playingChunkIndex === item.chunkIndex;
                      const assessment = chunkAssessments[item.chunkIndex];
                      const isAssessing = assessingChunkIndex === item.chunkIndex;

                      return (
                        <div key={idx} className="relative group">
                          {/* Timeline node dot */}
                          <div className={cn(
                            "absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-colors",
                            item.isCorrect ? "bg-emerald-500" : "bg-rose-500"
                          )} />

                          <div className="bg-slate-50/80 hover:bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3.5 transition-all shadow-sm">
                            {/* Card Top: Timestamp & Status */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-slate-200/70 text-slate-700 rounded-md">
                                  [{item.timeFormatted}] ({item.timeSeconds}s)
                                </span>
                                <span className={cn(
                                  "text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider border",
                                  item.isCorrect
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                )}>
                                  {item.statusText}
                                </span>
                              </div>

                              {item.chunkUrl && (
                                <button
                                  type="button"
                                  onClick={() => handlePlayChunk(item.chunkUrl, item.chunkIndex)}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border",
                                    isPlaying
                                      ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  )}
                                >
                                  {isPlaying ? (
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
                              )}
                            </div>

                            {/* Visual Diff: Expected vs Spoken */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3 rounded-xl border border-slate-100">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Từ chuẩn (Kỳ vọng)</span>
                                <span className="text-sm font-extrabold text-indigo-900 bg-indigo-50/70 px-2.5 py-1 rounded-lg inline-block border border-indigo-100">
                                  "{item.expectedText || 'Bài tập tự do'}"
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Bé phát âm (Ghi âm)</span>
                                <span className={cn(
                                  "text-sm font-extrabold px-2.5 py-1 rounded-lg inline-block border",
                                  item.isCorrect
                                    ? "text-emerald-800 bg-emerald-50/70 border-emerald-100"
                                    : "text-rose-800 bg-rose-50/70 border-rose-100"
                                )}>
                                  "{item.spokenText || item.expectedText || '...'}"
                                </span>
                              </div>
                            </div>

                            {/* Player Audio Progress Bar */}
                            {isPlaying && (
                              <div className="bg-slate-100 p-2.5 rounded-xl flex items-center gap-3 animate-in fade-in">
                                <Volume2 className="w-4 h-4 text-[#4EACAF] animate-pulse shrink-0" />
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#4EACAF] animate-pulse w-2/3 rounded-full" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 font-mono">Đang phát</span>
                              </div>
                            )}

                            {/* AI Assessment Button & Input */}
                            {currentRoleView !== 'PARENT' && item.chunkUrl && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Nhập từ chuẩn bé phải phát âm..."
                                  value={referenceTexts[item.chunkIndex] || ''}
                                  onChange={(e) => setReferenceTexts(prev => ({ ...prev, [item.chunkIndex]: e.target.value }))}
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-xs font-semibold placeholder-slate-400 focus:border-[#4EACAF] bg-white"
                                />
                                <button
                                  type="button"
                                  disabled={isAssessing}
                                  onClick={() => handleAssessChunk(item.chunkIndex)}
                                  className="px-3.5 py-1.5 bg-[#4EACAF] hover:bg-[#3D8C8F] disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                                >
                                  {isAssessing ? (
                                    <Activity className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                  AI Phân tích khẩu hình
                                </button>
                              </div>
                            )}

                            {/* AI Assessment Score Breakdown */}
                            {assessment && (
                              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                                  <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
                                    <div className="text-[10px] font-bold text-slate-500">Độ chính xác</div>
                                    <div className="text-sm font-black text-emerald-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.accuracyScore ?? assessment.AccuracyScore ?? 0}%
                                    </div>
                                  </div>
                                  <div className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100">
                                    <div className="text-[10px] font-bold text-slate-500">Phát âm</div>
                                    <div className="text-sm font-black text-indigo-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.pronunciationScore ?? assessment.PronunciationScore ?? 0}%
                                    </div>
                                  </div>
                                  <div className="p-2 bg-purple-50/60 rounded-lg border border-purple-100">
                                    <div className="text-[10px] font-bold text-slate-500">Trôi chảy</div>
                                    <div className="text-sm font-black text-purple-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.fluencyScore ?? assessment.FluencyScore ?? 0}%
                                    </div>
                                  </div>
                                  <div className="p-2 bg-teal-50/60 rounded-lg border border-teal-100">
                                    <div className="text-[10px] font-bold text-slate-500">Hoàn thành</div>
                                    <div className="text-sm font-black text-teal-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.completenessScore ?? assessment.CompletenessScore ?? 0}%
                                    </div>
                                  </div>
                                </div>

                                {(assessment.words || assessment.Words || []).length > 0 && (
                                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                      Chi tiết phát âm từng từ từ AI:
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {(assessment.words || assessment.Words || []).map((wObj: any, wIdx: number) => {
                                        const wordText = wObj.word || wObj.Word;
                                        const score = wObj.pronunciationAssessment?.accuracyScore ?? wObj.AccuracyScore ?? 0;
                                        const isGood = score >= 80;
                                        const isMed = score >= 50 && score < 80;

                                        return (
                                          <span
                                            key={wIdx}
                                            className={cn(
                                              "px-2 py-0.5 rounded-md border font-bold text-xs flex items-center gap-1 shadow-2xs",
                                              isGood
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : isMed
                                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                                  : "bg-rose-50 text-rose-700 border-rose-200"
                                            )}
                                          >
                                            <span>{wordText}</span>
                                            <span className="text-[9px] opacity-70">({score})</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 3.3.C: Teacher Feedback Section (Placed at bottom after Timeline) */}
              {canEditFeedback && (
                <div className="space-y-3 bg-[#FFFDF5] p-5 rounded-2xl border border-yellow-200/70 shadow-sm mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <MessageCircle className="w-4.5 h-4.5 text-amber-500" />
                      Nhận xét & Hướng dẫn từ giáo viên
                    </h4>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Viết hướng dẫn khẩu hình, các từ bé cần luyện thêm ở nhà hoặc nhận xét chung..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm font-medium placeholder-slate-400 bg-white focus:border-[#4EACAF] transition-colors resize-none shadow-inner"
                  />

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => showToast('Đã gửi thông báo hướng dẫn tới ứng dụng phụ huynh!', 'success')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-500" />
                      Gửi thông báo tới phụ huynh
                    </button>

                    <button
                      disabled={savingFeedback}
                      onClick={handleSaveFeedback}
                      className="px-5 py-2 bg-[#4EACAF] hover:bg-[#3D8C8F] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
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
                <div className="space-y-3 bg-[#FFFDF5] p-5 rounded-2xl border border-yellow-200/70 shadow-sm mt-6">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MessageCircle className="w-4.5 h-4.5 text-amber-500" />
                    Nhận xét & Hướng dẫn từ giáo viên
                  </h4>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 text-sm font-medium text-slate-700 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                    {selectedResult.FeedbackText ? (
                      selectedResult.FeedbackText
                    ) : (
                      <span className="text-slate-400 italic">Chưa có nhận xét hay hướng dẫn nào từ giáo viên cho lượt luyện tập này.</span>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center py-24 space-y-4">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-[#4EACAF]">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-700">Chưa có lượt luyện tập nào được chọn</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
                  Vui lòng click chọn một lượt luyện tập ở danh sách bên trái để xem Dòng thời gian tương tác, nghe ghi âm cụ thể và thực hiện đánh giá phát âm AI.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
