import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Baby,
  Award,
  TrendingUp,
  Clock,
  Smile,
  Phone,
  Mail,
  User,
  ChevronRight,
  X,
  Activity,
  Sparkles,
  BookOpen,
  FileSpreadsheet,
  PlayCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Volume2,
  FileDown,
  Info,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLearningResultApi } from '../../hooks/useLearningResultApi';
import { getUserById } from '../../services/userService';
import type { ChildProfileResponse } from '../../services/childProfileService';
import type { ExerciseResponse } from '../../services/exerciseService';
import type { PronunciationDetailResponse } from '../../services/pronunciationDetailService';
import type { ResultResponse } from '../../services/resultService';
import type { PagedResponse, ServiceResult } from '../../services/serviceTypes';

type Child = {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Note: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
};

type ParentUser = {
  UserId: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
};

type Result = {
  ResultId: string;
  ChildId: string;
  ExerciseId: string;
  ExerciseName: string;
  AttemptNumber: number;
  CompletionStatus: 'Completed' | 'Incomplete' | 'Failed';
  Score: number;
  StartedAt: string;
  CompletedAt: string;
  DurationSeconds: number;
  FeedbackText: string;
  CreatedAt: string;
};

type Analysis = {
  AnalysisId: string;
  ChildId: string;
  TotalExercises: number;
  CompletedExercises: number;
  TotalPracticeTime: number;
  AverageScore: number;
  ProgressLevel: 'Improving' | 'Stable' | 'Need Support';
  Strengths: string[];
  Weaknesses: string[];
  Recommendation: string;
  LastAnalyzedAt: string;
};

type PronunciationDetail = {
  DetailId: string;
  ResultId: string;
  ExpectedPhoneme: string;
  ActualPhoneme: string;
  AccuracyScore: number;
  IssueType: string;
  ReplayDataUrl: string;
};

interface TeacherStudentDetailProps {
  childId?: string;
  onNavigate?: (screen: string) => void;
}

const API_PAGE_SIZE = 100;

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  const datePart = value.slice(0, 10);
  const timePart = value.slice(11, 19);
  const parts = datePart.split('-');
  if (parts.length === 3) {
    return `${parts[2]} - ${parts[1]} - ${parts[0]} ${timePart}`;
  }
  return value.replace('T', ' ').slice(0, 19);
}

function mapDifficultyLevel(level: string): string {
  const normalized = level.trim().toLowerCase();

  if (normalized === 'hard' || normalized === 'khó') return 'Khó';
  if (normalized === 'medium' || normalized === 'trung bình') {
    return 'Trung bình';
  }

  return 'Dễ';
}

function mapChildRecord(child: ChildProfileResponse): Child {
  const normalizedGender = child.gender === 'Female' || child.gender === 'Other'
    ? child.gender
    : 'Male';

  return {
    ChildId: String(child.id),
    ParentUserId: String(child.userId),
    FullName: child.fullName,
    Age: child.age,
    Gender: normalizedGender,
    LearningLevel: child.learningLevel,
    Note: child.note ?? '',
    Status: child.status === 'Inactive' ? 'Inactive' : 'Active',
    CreatedAt: formatDateTime(child.createdAt),
    UpdatedAt: formatDateTime(child.updatedAt),
  };
}

function mapExerciseLookup(exercises: ExerciseResponse[]): Record<string, string> {
  return Object.fromEntries(
    exercises.map((exercise) => [
      String(exercise.id),
      exercise.exerciseName,
    ])
  );
}

function mapResultRecord(
  result: ResultResponse,
  exerciseNameLookup: Record<string, string>
): Result {
  const normalizedStatus =
    result.completionStatus === 'Completed'
      ? 'Completed'
      : result.score <= 0
        ? 'Failed'
        : 'Incomplete';

  return {
    ResultId: String(result.id),
    ChildId: String(result.childId),
    ExerciseId: String(result.exerciseId),
    ExerciseName:
      exerciseNameLookup[String(result.exerciseId)] ||
      `Bài tập #${result.exerciseId}`,
    AttemptNumber: result.attemptNumber,
    CompletionStatus: normalizedStatus,
    Score: Math.round(result.score),
    StartedAt: formatDateTime(result.startedAt),
    CompletedAt: formatDateTime(result.completedAt),
    DurationSeconds: result.durationSeconds,
    FeedbackText: result.feedbackText ?? '',
    CreatedAt:
      formatDateTime(result.completedAt) ||
      formatDateTime(result.startedAt) ||
      '',
  };
}

function mapPronunciationDetailRecord(
  detail: PronunciationDetailResponse
): PronunciationDetail {
  return {
    DetailId: String(detail.id),
    ResultId: String(detail.resultId),
    ExpectedPhoneme: detail.expectedPhoneme,
    ActualPhoneme: detail.actualPhoneme,
    AccuracyScore: detail.accuracyScore,
    IssueType: detail.issueType ?? 'Chưa phân loại',
    ReplayDataUrl: detail.replayDataUrl ?? '',
  };
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

function buildAnalysis(
  child: Child | undefined,
  results: Result[],
  pronunciationDetails: PronunciationDetail[]
): Analysis {
  const totalExercises = results.length;
  const completedExercises = results.filter(
    (result) => result.CompletionStatus === 'Completed'
  ).length;
  const totalPracticeTime = Math.round(
    results.reduce((sum, result) => sum + result.DurationSeconds, 0) / 60
  );
  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, result) => sum + result.Score, 0) / results.length
        )
      : 0;
  const averageAccuracy =
    pronunciationDetails.length > 0
      ? Math.round(
          pronunciationDetails.reduce(
            (sum, detail) => sum + detail.AccuracyScore,
            0
          ) / pronunciationDetails.length
        )
      : averageScore;
  const progressLevel: Analysis['ProgressLevel'] =
    averageScore >= 85 && averageAccuracy >= 85
      ? 'Improving'
      : averageScore >= 60
        ? 'Stable'
        : 'Need Support';
  const strengths = [
    averageAccuracy >= 85
      ? 'Độ chính xác âm tiết ổn định ở mức tốt.'
      : null,
    completedExercises >= Math.max(1, Math.ceil(totalExercises * 0.7))
      ? 'Duy trì nhịp hoàn thành bài tập đều.'
      : null,
    child?.LearningLevel
      ? `Phù hợp với lộ trình hiện tại: ${child.LearningLevel}.`
      : null,
  ].filter(Boolean) as string[];
  const issueFrequency = pronunciationDetails.reduce<Record<string, number>>(
    (acc, detail) => {
      if (detail.IssueType && detail.IssueType.toLowerCase() !== 'tốt') {
        acc[detail.IssueType] = (acc[detail.IssueType] ?? 0) + 1;
      }
      return acc;
    },
    {}
  );
  const commonIssue = Object.entries(issueFrequency).sort(
    (left, right) => right[1] - left[1]
  )[0]?.[0];
  const weaknesses = [
    commonIssue ? `Lỗi xuất hiện nhiều nhất: ${commonIssue}.` : null,
    averageAccuracy < 75
      ? 'Cần tăng thêm bài tập giữ hơi và kiểm soát khẩu hình.'
      : null,
    completedExercises < totalExercises
      ? 'Vẫn còn các phiên luyện chưa hoàn tất.'
      : null,
  ].filter(Boolean) as string[];
  const recommendation =
    progressLevel === 'Improving'
      ? 'Tiếp tục giữ nhịp luyện hiện tại và tăng dần bài ghép âm khó hơn.'
      : progressLevel === 'Stable'
        ? 'Bổ sung thêm lượt luyện ngắn nhưng đều để kéo độ chính xác phát âm lên cao hơn.'
        : 'Nên giảm độ khó, chia bài luyện thành các chặng ngắn và tập trung vào nhóm lỗi thường gặp.';
  const lastAnalyzedAt =
    results[0]?.CreatedAt || formatDateTime(new Date().toISOString());

  return {
    AnalysisId: `ANA-${child?.ChildId ?? '0'}`,
    ChildId: child?.ChildId ?? '0',
    TotalExercises: totalExercises,
    CompletedExercises: completedExercises,
    TotalPracticeTime: totalPracticeTime,
    AverageScore: averageScore,
    ProgressLevel: progressLevel,
    Strengths:
      strengths.length > 0 ? strengths : ['Cần thêm dữ liệu để kết luận điểm mạnh rõ hơn.'],
    Weaknesses:
      weaknesses.length > 0 ? weaknesses : ['Chưa phát hiện lỗi nổi bật cần lưu ý ngay.'],
    Recommendation: recommendation,
    LastAnalyzedAt: lastAnalyzedAt,
  };
}

export default function TeacherStudentDetail({
  childId,
  onNavigate,
}: TeacherStudentDetailProps) {
  const {
    getChildProfiles,
    getExercises,
    getResultsByChild,
    getPronunciationDetailsByResult,
  } = useLearningResultApi();

  const [children, setChildren] = useState<Child[]>([]);
  const [exerciseNameLookup, setExerciseNameLookup] = useState<
    Record<string, string>
  >({});
  const [resultsByChildId, setResultsByChildId] = useState<
    Record<string, Result[]>
  >({});
  const [pronunciationByChildId, setPronunciationByChildId] = useState<
    Record<string, PronunciationDetail[]>
  >({});
  const [parentByChildId, setParentByChildId] = useState<
    Record<string, ParentUser>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentChildId, setCurrentChildId] = useState<string>(childId ?? '');
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'HISTORY' | 'ERRORS' | 'PROGRESS' | 'RECOMMENDATIONS'
  >('OVERVIEW');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warn';
  } | null>(null);

  const showToast = (
    text: string,
    type: 'success' | 'info' | 'warn' = 'success'
  ) => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadTeacherStudentData() {
      setIsLoading(true);
      setApiError(null);

      try {
        const [childRecords, exerciseRecords] = await Promise.all([
          loadAllPages(getChildProfiles),
          loadAllPages(getExercises),
        ]);

        const nextChildren = childRecords.map(mapChildRecord);
        const nextExerciseLookup = mapExerciseLookup(exerciseRecords);
        const parentEntries = await Promise.all(
          nextChildren.map(async (child) => {
            const parentResult = await getUserById(Number(child.ParentUserId));

            return [
              child.ChildId,
              parentResult.success && parentResult.data
                ? {
                    UserId: String(parentResult.data.id),
                    FullName: parentResult.data.fullName,
                    Email: parentResult.data.email,
                    PhoneNumber: parentResult.data.phone || '',
                  }
                : {
                    UserId: child.ParentUserId,
                    FullName: 'Chưa có thông tin phụ huynh',
                    Email: '',
                    PhoneNumber: '',
                  },
            ] as const;
          })
        );

        const resultEntries = await Promise.all(
          nextChildren.map(async (child) => {
            const resultResponse = await getResultsByChild(Number(child.ChildId));
            const mappedResults =
              resultResponse.success && resultResponse.data
                ? resultResponse.data
                    .map((result) =>
                      mapResultRecord(result, nextExerciseLookup)
                    )
                    .sort((left, right) =>
                      right.CreatedAt.localeCompare(left.CreatedAt)
                    )
                : [];

            const detailResponses = await Promise.allSettled(
              mappedResults.map((result) =>
                getPronunciationDetailsByResult(Number(result.ResultId))
              )
            );
            const mappedDetails = detailResponses.flatMap((response) => {
              if (response.status !== 'fulfilled') return [];
              if (!response.value.success || !response.value.data) return [];
              return response.value.data.map(mapPronunciationDetailRecord);
            });

            return [child.ChildId, mappedResults, mappedDetails] as const;
          })
        );

        if (cancelled) return;

        setChildren(nextChildren);
        setExerciseNameLookup(nextExerciseLookup);
        setParentByChildId(Object.fromEntries(parentEntries));
        setResultsByChildId(
          Object.fromEntries(
            resultEntries.map(([childKey, childResults]) => [childKey, childResults])
          )
        );
        setPronunciationByChildId(
          Object.fromEntries(
            resultEntries.map(([childKey, , details]) => [childKey, details])
          )
        );

        const resolvedChildId =
          nextChildren.find((child) => child.ChildId === (childId ?? ''))?.ChildId ??
          nextChildren[0]?.ChildId ??
          '';
        setCurrentChildId(resolvedChildId);
      } catch (error) {
        if (cancelled) return;

        setApiError(
          error instanceof Error
            ? error.message
            : 'Không thể tải dữ liệu học sinh từ API.'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTeacherStudentData();

    return () => {
      cancelled = true;
    };
  }, [childId, getChildProfiles, getExercises, getPronunciationDetailsByResult, getResultsByChild]);

  const child = useMemo(
    () => children.find((item) => item.ChildId === currentChildId) ?? children[0],
    [children, currentChildId]
  );
  const parent = child
    ? parentByChildId[child.ChildId] ?? {
        UserId: child.ParentUserId,
        FullName: 'Chưa có thông tin phụ huynh',
        Email: '',
        PhoneNumber: '',
      }
    : {
        UserId: '0',
        FullName: 'Chưa có dữ liệu',
        Email: '',
        PhoneNumber: '',
      };
  const results = child ? resultsByChildId[child.ChildId] ?? [] : [];
  const pronunciationDetails = child
    ? pronunciationByChildId[child.ChildId] ?? []
    : [];
  const analysis = useMemo(
    () => buildAnalysis(child, results, pronunciationDetails),
    [child, results, pronunciationDetails]
  );

  const getProgressLevelStyle = (level: Analysis['ProgressLevel']) => {
    const choices = {
      Improving: {
        bg: 'bg-[#F2FAF4] text-[#34A853] border-emerald-100',
        dot: 'bg-emerald-500',
        text: 'text-emerald-600',
        label: 'Tiến bộ vượt bậc',
      },
      Stable: {
        bg: 'bg-[#F2FAFB] text-[#20D0D4] border-cyan-100',
        dot: 'bg-[#20D0D4]',
        text: 'text-cyan-600',
        label: 'Tiến độ ổn định',
      },
      'Need Support': {
        bg: 'bg-[#FFF2F2] text-[#FF8E8E] border-rose-100',
        dot: 'bg-rose-500',
        text: 'text-rose-600',
        label: 'Cần tiếp sức',
      },
    };
    return choices[level] || choices.Stable;
  };

  const triggerDownloadSimulation = () => {
    if (!child) return;

    setIsDownloading(true);
    setDownloadProgress(20);
    showToast(
      `Đang trích ghép báo cáo tiến trình của bé ${child.FullName}...`,
      'info'
    );

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            setDownloadProgress(0);
            showToast('Đã tạo báo cáo tiến trình thành công!', 'success');
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const simulatePlayReplay = (expect: string, actual: string, score: number) => {
    showToast(
      `Đang tải so sánh âm [${expect}] và âm thực tế [${actual}] (${score} điểm)...`,
      'success'
    );
  };

  const currentProgressStyle = getProgressLevelStyle(analysis.ProgressLevel);

  return (
    <div
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 text-left relative"
      id="student-detail-workspace"
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="student-toast-floating"
          >
            <div
              className={cn(
                'px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 border-2 border-white backdrop-blur-md font-bold text-white text-sm tracking-wide leading-snug',
                toastMessage.type === 'success'
                  ? 'bg-[#4EACAF]/95'
                  : toastMessage.type === 'info'
                    ? 'bg-indigo-600/95'
                    : 'bg-[#FF8E8E]/95'
              )}
            >
              <div className="bg-white/20 p-2 rounded-xl text-white shrink-0">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : toastMessage.type === 'warn' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Activity className="w-5 h-5 animate-pulse" />
                )}
              </div>
              <p className="flex-1 min-w-0 font-extrabold italic">
                {toastMessage.text}
              </p>
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

      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-4">
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('TEACHER_CLASSES');
              } else {
                showToast('Đang chuyển về khu vực lớp học...', 'info');
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-black text-[#4EACAF] uppercase tracking-wider hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại lớp học
          </button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
              <Baby className="w-3.5 h-3.5" />
              Teacher workspace
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
              Hồ sơ học sinh <span className="text-[#4EACAF]">chi tiết</span>
            </h1>
            <p className="text-gray-500 font-bold max-w-2xl text-sm">
              Theo dõi kết quả luyện tập, lỗi phát âm và gợi ý can thiệp dựa trên
              dữ liệu thực từ backend.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-[280px]">
          <select
            value={child?.ChildId ?? ''}
            onChange={(event) => {
              setCurrentChildId(event.target.value);
              showToast('Đã chuyển học sinh đang theo dõi.', 'info');
            }}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none"
          >
            {children.map((item) => (
              <option key={item.ChildId} value={item.ChildId}>
                {item.FullName}
              </option>
            ))}
          </select>

          <button
            onClick={triggerDownloadSimulation}
            disabled={!child || isDownloading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#4EACAF] px-4 py-3 text-xs font-black uppercase tracking-wider text-white disabled:opacity-60"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang tạo báo cáo {downloadProgress}%
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                Xuất báo cáo
              </>
            )}
          </button>
        </div>
      </div>

      {apiError ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">
          {apiError}
        </div>
      ) : null}

      {isLoading || !child ? (
        <div className="bg-white rounded-[36px] border border-gray-100 p-12 text-center text-gray-500 font-bold">
          Đang tải hồ sơ học sinh và kết quả luyện tập từ API...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#4EACAF] shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
                <BookOpen className="w-7 h-7 text-[#4EACAF]" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                  {analysis.TotalExercises}
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                  Tổng lượt luyện
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#FF8E8E] shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
                <Award className="w-7 h-7 text-[#FF8E8E]" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                  {analysis.AverageScore}đ
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                  Điểm trung bình
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#F4B740] shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                <Clock className="w-7 h-7 text-[#F4B740]" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                  {analysis.TotalPracticeTime}p
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                  Tổng thời gian luyện
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#20D0D4] shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-7 h-7 text-[#20D0D4]" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                  {analysis.CompletedExercises}/{analysis.TotalExercises}
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                  Bài hoàn tất
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[36px] p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              <div className="flex items-center gap-5 min-w-[280px]">
                <div className="w-20 h-20 rounded-[28px] bg-[#E2F2F3] flex items-center justify-center text-[#4EACAF]">
                  <User className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 leading-none">
                    {child.FullName}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Học mầm: {child.ChildId}
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider text-[#4EACAF] border-[#4EACAF]/20 bg-[#4EACAF]/5">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        currentProgressStyle.dot
                      )}
                    />
                    {currentProgressStyle.label}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div className="rounded-[28px] border border-gray-100 bg-[#FDFCF5] p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[#4EACAF]">
                    <UserCheck className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Hồ sơ học sinh
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-700">
                    {child.Age} tuổi, {child.Gender === 'Female' ? 'Nữ' : child.Gender === 'Other' ? 'Khác' : 'Nam'}
                  </p>
                  <p className="text-sm font-bold text-gray-700">
                    Trình độ: {child.LearningLevel}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {child.Note || 'Chưa có ghi chú bổ sung cho học sinh này.'}
                  </p>
                </div>

                <div className="rounded-[28px] border border-gray-100 bg-[#FFFDF5] p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[#FF8E8E]">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Thông tin phụ huynh
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-700">{parent.FullName}</p>
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {parent.PhoneNumber || 'Chưa có số điện thoại'}
                  </p>
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {parent.Email || 'Chưa có email'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-2 border border-gray-100 hover:shadow-inner flex flex-col sm:flex-row gap-1">
            {[
              { tab: 'OVERVIEW', label: 'Tổng quan', icon: Smile },
              { tab: 'HISTORY', label: 'Lịch sử', icon: Activity },
              { tab: 'ERRORS', label: 'Lỗi phát âm', icon: Volume2 },
              { tab: 'PROGRESS', label: 'Tiến trình', icon: TrendingUp },
              { tab: 'RECOMMENDATIONS', label: 'Đề xuất', icon: Sparkles },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab as typeof activeTab);
                    showToast(`Đã chuyển sang tab ${item.label}.`, 'info');
                  }}
                  className={cn(
                    'px-5 py-4.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 flex-1 cursor-pointer border border-transparent',
                    activeTab === item.tab
                      ? 'bg-[#4EACAF] text-white italic shadow-sm'
                      : 'text-slate-500 hover:text-[#4EACAF] hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-8 text-left">
            {activeTab === 'OVERVIEW' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[36px] border border-gray-150 relative space-y-4">
                  <h3 className="text-xl font-black text-emerald-600 uppercase tracking-tight flex items-center gap-2">
                    <ThumbsUp className="w-5.5 h-5.5 text-emerald-500" />
                    Điểm mạnh nổi bật
                  </h3>
                  <div className="space-y-3 pt-2">
                    {analysis.Strengths.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex items-center gap-2.5 p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/30 text-xs font-bold text-emerald-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[36px] border border-gray-150 relative space-y-4">
                  <h3 className="text-xl font-black text-rose-500 uppercase tracking-tight flex items-center gap-2">
                    <ThumbsDown className="w-5.5 h-5.5 text-rose-400" />
                    Điểm cần lưu ý
                  </h3>
                  <div className="space-y-3 pt-2">
                    {analysis.Weaknesses.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex items-center gap-2.5 p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100/30 text-xs font-bold text-rose-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'HISTORY' && (
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-white/50">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-none italic">
                      Nhật trình luyện tập
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
                      Kết quả từng lượt luyện tập của học sinh
                    </p>
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase">
                    Mã số: {child.ChildId}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                        <th className="py-5 px-10">Mã phiên</th>
                        <th className="py-5 px-6">Bài tập</th>
                        <th className="py-5 px-6 text-center">Lần thứ</th>
                        <th className="py-5 px-6 text-center">Trạng thái</th>
                        <th className="py-5 px-6 text-center">Thời lượng</th>
                        <th className="py-5 px-6 text-center">Điểm</th>
                        <th className="py-5 px-10 text-right">Replay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                      {results.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-gray-400 italic font-semibold"
                          >
                            Chưa có kết quả luyện tập cho học sinh này.
                          </td>
                        </tr>
                      ) : (
                        results.map((result) => (
                          <tr
                            key={result.ResultId}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-5 px-10 font-mono text-gray-400 text-xs font-black">
                              {result.ResultId}
                            </td>
                            <td className="py-5 px-6 font-extrabold text-gray-800">
                              {result.ExerciseName}
                            </td>
                            <td className="py-5 px-6 text-center font-mono text-gray-500">
                              Lần {result.AttemptNumber}
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider',
                                  result.CompletionStatus === 'Completed'
                                    ? 'bg-[#F2FAF4] text-[#34A853]'
                                    : 'bg-rose-50 text-rose-500'
                                )}
                              >
                                {result.CompletionStatus === 'Completed'
                                  ? 'Hoàn tất'
                                  : 'Chưa xong'}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-center font-mono text-gray-500">
                              {result.DurationSeconds} giây
                            </td>
                            <td className="py-5 px-6 text-center">
                              <strong
                                className={cn(
                                  'text-base italic',
                                  result.Score >= 85
                                    ? 'text-[#4EACAF]'
                                    : 'text-rose-500'
                                )}
                              >
                                {result.Score}đ
                              </strong>
                            </td>
                            <td className="py-5 px-10 text-right">
                              <button
                                onClick={() =>
                                  simulatePlayReplay(
                                    result.ExerciseName,
                                    result.ExerciseName,
                                    result.Score
                                  )
                                }
                                className="p-2 bg-indigo-50 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-xl transition-all cursor-pointer"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'ERRORS' && (
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-10 py-8 border-b border-gray-50 bg-white/50">
                  <h3 className="text-2xl font-black text-gray-900 leading-none italic">
                    Chi tiết lỗi phát âm
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
                    Từng âm tiết backend ghi nhận cho học sinh
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                        <th className="py-5 px-10">Mã lỗi</th>
                        <th className="py-5 px-6 text-center">Âm chuẩn</th>
                        <th className="py-5 px-6 text-center">Âm thực tế</th>
                        <th className="py-5 px-6 text-center">Độ chính xác</th>
                        <th className="py-5 px-6">Loại lỗi</th>
                        <th className="py-5 px-10 text-right">Phát lại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                      {pronunciationDetails.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-12 text-center text-gray-400 italic"
                          >
                            Chưa có chi tiết phát âm cho học sinh này.
                          </td>
                        </tr>
                      ) : (
                        pronunciationDetails.map((detail) => (
                          <tr
                            key={detail.DetailId}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-5 px-10 font-mono text-gray-400 text-xs font-black">
                              {detail.DetailId}
                            </td>
                            <td className="py-5 px-6 text-center font-mono font-black text-gray-800 text-lg uppercase bg-indigo-50/30">
                              {detail.ExpectedPhoneme}
                            </td>
                            <td className="py-5 px-6 text-center font-mono font-black text-[#FF8E8E] text-lg uppercase bg-rose-50/30">
                              {detail.ActualPhoneme}
                            </td>
                            <td className="py-5 px-6 text-center">
                              <strong
                                className={cn(
                                  'text-base italic',
                                  detail.AccuracyScore >= 80
                                    ? 'text-[#4EACAF]'
                                    : 'text-rose-500'
                                )}
                              >
                                {detail.AccuracyScore}%
                              </strong>
                            </td>
                            <td className="py-5 px-6 text-xs text-gray-650">
                              <span
                                className={cn(
                                  'px-2.5 py-1 rounded inline-block font-black text-[10px] uppercase tracking-wide',
                                  detail.IssueType.toLowerCase() === 'tốt'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-rose-50 text-rose-500'
                                )}
                              >
                                {detail.IssueType}
                              </span>
                            </td>
                            <td className="py-5 px-10 text-right">
                              <button
                                onClick={() =>
                                  simulatePlayReplay(
                                    detail.ExpectedPhoneme,
                                    detail.ActualPhoneme,
                                    detail.AccuracyScore
                                  )
                                }
                                className="px-3.5 py-1.5 bg-[#4EACAF]/10 hover:bg-[#4EACAF] text-[#4EACAF] hover:text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer"
                              >
                                Phát phổ âm
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'PROGRESS' && (
              <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#4EACAF] italic">
                    Tổng hợp tiến trình
                  </h3>
                  <p className="text-xs text-gray-405 font-bold uppercase tracking-wider">
                    Chỉ số được tính từ kết quả và chi tiết phát âm của học sinh
                  </p>
                </div>

                <div className="bg-[#FFFDF5] p-6.5 rounded-3xl border border-yellow-105 flex items-start gap-4">
                  <Sparkles className="w-7 h-7 text-amber-500 shrink-0" />
                  <div className="space-y-1">
                    <strong className="text-sm font-black text-gray-800 block">
                      Tổng kết nhanh cho giáo viên:
                    </strong>
                    <p className="text-xs font-bold text-gray-500 leading-relaxed">
                      Học sinh đã hoàn thành {analysis.CompletedExercises}/
                      {analysis.TotalExercises} bài, điểm trung bình hiện tại là{' '}
                      {analysis.AverageScore}đ. Nhóm lỗi nổi bật sẽ được ưu tiên
                      trong các buổi luyện tiếp theo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                  <div className="bg-slate-50 p-5 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-bold block mb-1">
                      Mức độ tiếp thu hiện tại
                    </span>
                    <strong className="text-[#264E50]">
                      {analysis.ProgressLevel === 'Improving'
                        ? 'Ổn định và đang tiến bộ'
                        : analysis.ProgressLevel === 'Stable'
                          ? 'Cần thêm nhịp luyện đều'
                          : 'Cần bổ sung can thiệp sát hơn'}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-bold block mb-1">
                      Đánh giá từ dữ liệu API
                    </span>
                    <strong className="text-[#FF8E8E]">
                      Cập nhật lúc {analysis.LastAnalyzedAt}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'RECOMMENDATIONS' && (
              <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#FF8E8E] italic">
                    Đề xuất can thiệp
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Gợi ý tổng hợp từ kết quả luyện và lỗi phát âm hiện tại
                  </p>
                </div>

                <p className="text-sm font-bold text-gray-700 leading-relaxed bg-[#FFFDF5] p-8 rounded-[28px] border-2 border-dashed border-yellow-200">
                  &ldquo;{analysis.Recommendation}&rdquo;
                </p>

                <div className="bg-slate-50 p-5 rounded-2xl text-xs font-bold text-gray-500 leading-relaxed block text-left">
                  <strong className="text-gray-800 uppercase text-[10px] block mb-2 font-black">
                    Gợi ý phối hợp giáo viên và phụ huynh:
                  </strong>
                  1. Chọn lại các bài có điểm thấp để luyện ngắn nhưng đều.<br />
                  2. Ưu tiên nhóm lỗi xuất hiện nhiều trong bảng chi tiết phát âm.<br />
                  3. Theo dõi thêm phản hồi và mức hoàn thành ở các buổi tiếp theo.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
