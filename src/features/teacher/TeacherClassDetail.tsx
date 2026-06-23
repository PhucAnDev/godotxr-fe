import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Award,
  Baby,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  History,
  Info,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCurrentUser } from '../../lib/authMock';
import {
  getChildProfiles,
  type ChildProfileResponse,
} from '../../services/childProfileService';
import {
  getClassrooms,
  type ClassroomResponse,
} from '../../services/classroomService';
import {
  getEnrollments,
  type EnrollmentResponse,
} from '../../services/enrollmentService';
import {
  getResultsByChild,
  type ResultResponse,
} from '../../services/resultService';
import type { PagedResponse, ServiceResult } from '../../services/serviceTypes';

type ClassroomStatus = 'Active' | 'Inactive' | 'Completed' | 'Upcoming';
type ProgressLevel = 'Improving' | 'Stable' | 'Need Support';

type Child = {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Note: string;
  Status: 'Active' | 'Inactive';
};

type Result = {
  ResultId: string;
  ChildId: string;
  ExerciseId: string;
  CompletionStatus: 'Completed' | 'Incomplete' | 'Failed';
  Score: number;
  DurationSeconds: number;
  AttemptNumber: number;
  CreatedAt: string;
};

type Analysis = {
  ChildId: string;
  AverageScore: number;
  CompletionRate: number;
  TotalPracticeMinutes: number;
  ProgressLevel: ProgressLevel;
  Recommendation: string;
};

interface TeacherClassDetailProps {
  classId?: string;
  onNavigate?: (screen: string) => void;
}

const API_PAGE_SIZE = 100;

function formatDate(value: string | null | undefined): string {
  if (!value) return '--';
  return value.slice(0, 10);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace('T', ' ').slice(0, 19);
}

function normalizeClassStatus(status: string): ClassroomStatus {
  if (status === 'Inactive') return 'Inactive';
  if (status === 'Completed') return 'Completed';
  if (status === 'Upcoming') return 'Upcoming';
  return 'Active';
}

function normalizeCompletionStatus(
  result: ResultResponse
): Result['CompletionStatus'] {
  if (result.completionStatus === 'Completed') return 'Completed';
  if (result.score <= 0) return 'Failed';
  return 'Incomplete';
}

function mapChildRecord(child: ChildProfileResponse): Child {
  return {
    ChildId: String(child.id),
    ParentUserId: String(child.userId),
    FullName: child.fullName,
    Age: child.age,
    Gender:
      child.gender === 'Female' || child.gender === 'Other'
        ? child.gender
        : 'Male',
    LearningLevel: child.learningLevel,
    Note: child.note ?? '',
    Status: child.status === 'Inactive' ? 'Inactive' : 'Active',
  };
}

function mapResultRecord(result: ResultResponse): Result {
  return {
    ResultId: String(result.id),
    ChildId: String(result.childId),
    ExerciseId: `Exercise #${result.exerciseId}`,
    CompletionStatus: normalizeCompletionStatus(result),
    Score: Math.round(result.score),
    DurationSeconds: result.durationSeconds,
    AttemptNumber: result.attemptNumber,
    CreatedAt:
      formatDateTime(result.completedAt) || formatDateTime(result.startedAt),
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

function resolveRequestedClassId(
  requestedClassId: string | undefined,
  classrooms: ClassroomResponse[]
): string {
  if (classrooms.length === 0) return '';
  if (!requestedClassId) return String(classrooms[0].id);

  const exactMatch = classrooms.find(
    (classroom) => String(classroom.id) === requestedClassId
  );
  if (exactMatch) return String(exactMatch.id);

  const numericPart = requestedClassId.match(/\d+/)?.[0];
  if (numericPart) {
    const normalizedId = String(Number(numericPart));
    const numericMatch = classrooms.find(
      (classroom) => String(classroom.id) === normalizedId
    );
    if (numericMatch) return String(numericMatch.id);
  }

  return String(classrooms[0].id);
}

function buildAnalysis(child: Child, results: Result[]): Analysis {
  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, result) => sum + result.Score, 0) / results.length
        )
      : 0;
  const completedResults = results.filter(
    (result) => result.CompletionStatus === 'Completed'
  ).length;
  const completionRate =
    results.length > 0
      ? Math.round((completedResults / results.length) * 100)
      : 0;
  const totalPracticeMinutes = Math.round(
    results.reduce((sum, result) => sum + result.DurationSeconds, 0) / 60
  );

  let progressLevel: ProgressLevel = 'Stable';
  let recommendation = `Duy tri nhip luyen deu cho ${child.FullName}.`;

  if (averageScore >= 85 && completionRate >= 80) {
    progressLevel = 'Improving';
    recommendation =
      'Co the day sang bai tap nang hon va tang tan suat luyen phan xa.';
  } else if (averageScore < 60 || completionRate < 50) {
    progressLevel = 'Need Support';
    recommendation =
      'Nen giam do kho, theo sat tung phien va uu tien bai tap co huong dan ro.';
  } else {
    recommendation =
      'Can giu nhip luyen on dinh va bo sung them bai tap nhac lai co trong tam.';
  }

  return {
    ChildId: child.ChildId,
    AverageScore: averageScore,
    CompletionRate: completionRate,
    TotalPracticeMinutes: totalPracticeMinutes,
    ProgressLevel: progressLevel,
    Recommendation: recommendation,
  };
}

export default function TeacherClassDetail({
  classId,
  onNavigate,
}: TeacherClassDetailProps) {
  const currentUser = getCurrentUser();
  const [classrooms, setClassrooms] = useState<ClassroomResponse[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [childrenById, setChildrenById] = useState<Record<string, Child>>({});
  const [resultsByChildId, setResultsByChildId] = useState<
    Record<string, Result[]>
  >({});
  const [currentClassroomId, setCurrentClassroomId] = useState(classId ?? '');
  const [activeTab, setActiveTab] = useState<
    'STUDENTS' | 'RESULTS' | 'ANALYSES' | 'PROGRAM'
  >('STUDENTS');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedProgressFilter, setSelectedProgressFilter] =
    useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warn';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadSeed, setReloadSeed] = useState(0);

  const showToast = (
    text: string,
    type: 'success' | 'info' | 'warn' = 'success'
  ) => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;

    const loadBaseData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [allClassrooms, allEnrollments, allChildren] = await Promise.all([
          loadAllPages(getClassrooms),
          loadAllPages(getEnrollments),
          loadAllPages(getChildProfiles),
        ]);

        if (!isMounted) return;

        const teacherId =
          Number(currentUser?.UserId.replace(/\D/g, '')) || undefined;
        const teacherName = currentUser?.FullName.trim().toLowerCase() ?? '';

        const teacherClassrooms = allClassrooms.filter((classroom) => {
          const matchedById = teacherId
            ? classroom.userId === teacherId
            : false;
          const matchedByName = teacherName
            ? classroom.teacherName.trim().toLowerCase() === teacherName
            : false;
          return matchedById || matchedByName;
        });

        const nextClassrooms =
          teacherClassrooms.length > 0 ? teacherClassrooms : allClassrooms;

        const childLookup = Object.fromEntries(
          allChildren.map((child) => {
            const mapped = mapChildRecord(child);
            return [mapped.ChildId, mapped];
          })
        );

        setClassrooms(nextClassrooms);
        setEnrollments(allEnrollments);
        setChildrenById(childLookup);
        setCurrentClassroomId(resolveRequestedClassId(classId, nextClassrooms));
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Khong the tai thong tin lop hoc.'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadBaseData();

    return () => {
      isMounted = false;
    };
  }, [classId, currentUser?.FullName, currentUser?.UserId, reloadSeed]);

  const activeClass = useMemo(
    () =>
      classrooms.find(
        (classroom) => String(classroom.id) === currentClassroomId
      ) ?? classrooms[0],
    [classrooms, currentClassroomId]
  );

  const classEnrollments = useMemo(() => {
    if (!activeClass) return [];
    return enrollments.filter(
      (enrollment) => enrollment.classId === activeClass.id
    );
  }, [activeClass, enrollments]);

  const childrenInClass = useMemo(() => {
    return classEnrollments
      .map((enrollment) => {
        const childId = String(enrollment.childId);
        return (
          childrenById[childId] ?? {
            ChildId: childId,
            ParentUserId: '',
            FullName: enrollment.childFullName,
            Age: 0,
            Gender: 'Other' as const,
            LearningLevel: enrollment.childLearningLevel || 'Unknown',
            Note: '',
            Status: 'Active' as const,
          }
        );
      })
      .filter((child, index, array) => {
        return array.findIndex((item) => item.ChildId === child.ChildId) === index;
      });
  }, [childrenById, classEnrollments]);

  useEffect(() => {
    let isMounted = true;

    const loadResults = async () => {
      if (!activeClass) {
        setResultsByChildId({});
        return;
      }

      if (childrenInClass.length === 0) {
        setResultsByChildId({});
        return;
      }

      setIsResultsLoading(true);

      try {
        const resultEntries = await Promise.all(
          childrenInClass.map(async (child) => {
            const result = await getResultsByChild(Number(child.ChildId));

            if (!result.success || !result.data) {
              throw new Error(result.errors.join(' ') || result.message);
            }

            return [
              child.ChildId,
              result.data
                .map(mapResultRecord)
                .sort((left, right) =>
                  right.CreatedAt.localeCompare(left.CreatedAt)
                ),
            ] as const;
          })
        );

        if (!isMounted) return;

        setResultsByChildId(Object.fromEntries(resultEntries));
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Khong the tai ket qua hoc tap cua lop.'
        );
      } finally {
        if (isMounted) {
          setIsResultsLoading(false);
        }
      }
    };

    void loadResults();

    return () => {
      isMounted = false;
    };
  }, [activeClass, childrenInClass]);

  const classResults = useMemo(() => {
    return Object.values(resultsByChildId)
      .flat()
      .sort((left, right) => right.CreatedAt.localeCompare(left.CreatedAt));
  }, [resultsByChildId]);

  const analysisByChildId = useMemo(() => {
    return Object.fromEntries(
      childrenInClass.map((child) => [
        child.ChildId,
        buildAnalysis(child, resultsByChildId[child.ChildId] ?? []),
      ])
    );
  }, [childrenInClass, resultsByChildId]);

  const summaryMetrics = useMemo(() => {
    const totalKids = childrenInClass.length;
    const avgClassScore =
      classResults.length > 0
        ? Math.round(
            classResults.reduce((sum, result) => sum + result.Score, 0) /
              classResults.length
          )
        : 0;
    const totalPracticeMinutes = Math.round(
      classResults.reduce((sum, result) => sum + result.DurationSeconds, 0) / 60
    );
    const completedCount = classResults.filter(
      (result) => result.CompletionStatus === 'Completed'
    ).length;
    const completionRate =
      classResults.length > 0
        ? Math.round((completedCount / classResults.length) * 100)
        : 0;

    return {
      totalKids,
      avgClassScore,
      totalPracticeMinutes,
      completionRate,
    };
  }, [childrenInClass.length, classResults]);

  const filteredChildren = useMemo(() => {
    return childrenInClass.filter((child) => {
      const analysis = analysisByChildId[child.ChildId] ?? buildAnalysis(child, []);
      const matchesSearch =
        child.FullName.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        child.ChildId.includes(studentSearchQuery);
      const matchesProgress =
        selectedProgressFilter === 'ALL' ||
        analysis.ProgressLevel === selectedProgressFilter;

      return matchesSearch && matchesProgress;
    });
  }, [
    analysisByChildId,
    childrenInClass,
    selectedProgressFilter,
    studentSearchQuery,
  ]);

  const renderStatusBadge = (status: ClassroomStatus) => {
    const mappings = {
      Active: {
        bg: 'bg-[#F2FAF4] text-[#34A853] border-emerald-100',
        dot: 'bg-emerald-500',
        label: 'Dang mo',
      },
      Inactive: {
        bg: 'bg-gray-100 text-gray-500 border-gray-200',
        dot: 'bg-gray-400',
        label: 'Tam khoa',
      },
      Completed: {
        bg: 'bg-[#F2FAFB] text-[#20D0D4] border-cyan-100',
        dot: 'bg-[#20D0D4]',
        label: 'Da ket thuc',
      },
      Upcoming: {
        bg: 'bg-[#FFF9EE] text-[#FFA800] border-amber-100',
        dot: 'bg-[#FFA800]',
        label: 'Sap toi',
      },
    };

    const style = mappings[status];

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border',
          style.bg
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
        {style.label}
      </span>
    );
  };

  const getProgressLevelBadge = (level: ProgressLevel) => {
    const mapper = {
      Improving: {
        bg: 'bg-[#F2FAF4] text-[#34A853] border-emerald-50',
        label: 'Tien bo tot',
      },
      Stable: {
        bg: 'bg-[#F2FAFB] text-[#20D0D4] border-cyan-50',
        label: 'On dinh',
      },
      'Need Support': {
        bg: 'bg-[#FFF2F2] text-[#FF8E8E] border-rose-50',
        label: 'Can ho tro',
      },
    };

    return mapper[level];
  };

  const triggerSimulation = (action: string, name: string) => {
    if (action === 'REPORT') {
      showToast(
        `Dang tong hop bao cao lop ${activeClass?.className ?? ''} tu du lieu API.`,
        'info'
      );
    } else if (action === 'PROFILE') {
      showToast(`Dang mo ho so hoc sinh ${name}.`, 'info');
    } else if (action === 'HISTORY') {
      showToast(`Dang tai lich su luyen tap cua ${name}.`, 'success');
    } else if (action === 'REPLAY') {
      showToast(`Replay 3D cua ${name} se map tiep o nhom sau.`, 'info');
    } else if (action === 'ANALYZE') {
      showToast(`Dang tong hop phan tich tien do cua ${name}.`, 'success');
    }
  };

  const tabs = [
    { tab: 'STUDENTS', label: 'Hoc sinh', icon: Users },
    { tab: 'RESULTS', label: 'Ket qua', icon: ClipboardList },
    { tab: 'ANALYSES', label: 'Phan tich', icon: TrendingUp },
    { tab: 'PROGRAM', label: 'Chuong trinh', icon: BookOpen },
  ] as const;

  if (isLoading && classrooms.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <Activity className="h-5 w-5 animate-pulse text-[#4EACAF]" />
          <span className="font-semibold">
            Dang tai teacher class detail tu classrooms, enrollments, child-profile
            va results...
          </span>
        </div>
      </div>
    );
  }

  if (!activeClass) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-3 text-rose-600">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-3">
            <p className="font-semibold">
              Khong tim thay lop hoc de hien thi.
            </p>
            <button
              onClick={() => setReloadSeed((value) => value + 1)}
              className="rounded-xl bg-[#264E50] px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-[#1E3B3D]"
            >
              Thu tai lai
            </button>
          </div>
        </div>
      </div>
    );
  }

  const classStatus = normalizeClassStatus(activeClass.status);

  return (
    <div
      className="relative space-y-10 pb-24 text-left animate-in fade-in slide-in-from-bottom-4 duration-700"
      id="class-detail-page"
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed left-1/2 top-12 z-[300] w-[90%] max-w-lg -translate-x-1/2 pointer-events-auto"
          >
            <div
              className={cn(
                'flex items-center gap-4 rounded-3xl border-2 border-white px-6 py-4 text-sm font-bold leading-snug text-white shadow-xl backdrop-blur-md',
                toastMessage.type === 'success'
                  ? 'bg-[#4EACAF]/95'
                  : toastMessage.type === 'info'
                    ? 'bg-indigo-600/95'
                    : 'bg-[#FF8E8E]/95'
              )}
            >
              <div className="rounded-xl bg-white/20 p-2 text-white shrink-0">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : toastMessage.type === 'warn' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <Activity className="h-5 w-5 animate-pulse" />
                )}
              </div>
              <p className="min-w-0 flex-1">{toastMessage.text}</p>
              <button
                onClick={() => setToastMessage(null)}
                className="rounded-full p-1 text-white transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-3">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('TEACHER_CLASSES');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4EACAF] transition-colors hover:text-[#3e8c8f]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Tro lai danh sach lop hoc
            </button>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#4EACAF]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider leading-none text-[#4EACAF]">
                  Lop hoc: {activeClass.id}
                </span>
                {renderStatusBadge(classStatus)}
                <span className="rounded bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  API_DATABASE
                </span>
              </div>

              <h1 className="text-xl font-black tracking-tight text-slate-800 md:text-2xl">
                {activeClass.className}
              </h1>

              <p className="flex flex-wrap items-center gap-2 text-xs leading-relaxed text-slate-500 md:text-sm">
                <BookOpen className="h-4 w-4 text-[#FF8E8E]" />
                Chuong trinh:{' '}
                <strong className="font-bold text-slate-700">
                  {activeClass.programName}
                </strong>
                <span>({activeClass.programLanguage})</span>
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Giao vien phu trach: {activeClass.teacherName}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 self-stretch sm:flex-row sm:items-center md:self-center">
            <div className="relative min-w-[220px]">
              <select
                value={String(activeClass.id)}
                onChange={(event) => {
                  setCurrentClassroomId(event.target.value);
                  showToast(`Dang chuyen sang lop #${event.target.value}.`, 'info');
                }}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-xs font-bold uppercase text-slate-700 outline-none transition-colors hover:border-[#4EACAF]/20"
              >
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={String(classroom.id)}>
                    {classroom.className}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => triggerSimulation('REPORT', '')}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#4EACAF] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#3E8C8F]"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Tao bao cao lop
            </button>
          </div>
        </div>
      </div>

      {(errorMessage || isResultsLoading) && (
        <div
          className={cn(
            'rounded-2xl border p-4 text-sm shadow-sm',
            errorMessage
              ? 'border-rose-100 bg-rose-50 text-rose-700'
              : 'border-sky-100 bg-sky-50 text-sky-700'
          )}
        >
          <div className="flex items-start gap-3">
            {errorMessage ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <Activity className="mt-0.5 h-5 w-5 shrink-0 animate-pulse" />
            )}
            <div className="space-y-2">
              <p className="font-semibold">
                {errorMessage || 'Dang dong bo ket qua hoc tap cua lop...'}
              </p>
              {errorMessage && (
                <button
                  onClick={() => setReloadSeed((value) => value + 1)}
                  className="rounded-xl bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-rose-600 transition-colors hover:bg-rose-100"
                >
                  Tai lai du lieu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-[#4EACAF]">
            <Baby className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none text-slate-800">
              {summaryMetrics.totalKids} hoc sinh
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Si so lop hoc
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-100 bg-[#FF8E8E]/10 text-[#FF8E8E]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none text-slate-800">
              {summaryMetrics.avgClassScore}/100
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Diem trung binh lop
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-[#FFF9EE] text-[#FFA800]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none text-slate-800">
              {summaryMetrics.totalPracticeMinutes} phut
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Tong thoi gian luyen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-100 bg-[#F2FAFB] text-[#20D0D4]">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none text-slate-800">
              {summaryMetrics.completionRate}%
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Ty le hoan thanh
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        {tabs.map(({ tab, label, icon: IconComponent }) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              showToast(`Dang xem tab ${label.toLowerCase()}.`, 'info');
            }}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
              activeTab === tab
                ? 'bg-[#4EACAF] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#4EACAF]'
            )}
          >
            <IconComponent className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'STUDENTS' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tim hoc sinh theo ten hoac id"
                value={studentSearchQuery}
                onChange={(event) => setStudentSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#4EACAF] focus:bg-white"
              />
              {studentSearchQuery && (
                <button
                  onClick={() => setStudentSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                >
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>
              )}
            </div>

            <div className="relative min-w-[200px]">
              <select
                value={selectedProgressFilter}
                onChange={(event) => setSelectedProgressFilter(event.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-xs font-bold uppercase text-slate-700"
              >
                <option value="ALL">Tien do (tat ca)</option>
                <option value="Improving">Dang tien bo</option>
                <option value="Stable">On dinh</option>
                <option value="Need Support">Can ho tro</option>
              </select>
              <Filter className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-50 px-6 py-4">
              <h3 className="text-base font-bold text-slate-800">
                Danh sach hoc sinh cua lop
              </h3>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Du lieu ghep tu enrollments va child-profile
              </p>
            </div>

            <div className="overflow-x-auto text-left">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Ma be</th>
                    <th className="px-4 py-3">Ho ten</th>
                    <th className="px-4 py-3 text-center">Tuoi</th>
                    <th className="px-4 py-3 text-center">Gioi tinh</th>
                    <th className="px-4 py-3">Trinh do</th>
                    <th className="px-4 py-3 text-center">Diem TB</th>
                    <th className="px-4 py-3">Tien do</th>
                    <th className="px-4 py-3 text-right">Tac vu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-700">
                  {filteredChildren.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-10 text-center text-sm font-semibold text-slate-400"
                      >
                        Khong co hoc sinh nao phu hop bo loc hien tai.
                      </td>
                    </tr>
                  ) : (
                    filteredChildren.map((child) => {
                      const analysis =
                        analysisByChildId[child.ChildId] ?? buildAnalysis(child, []);
                      const progressStyle = getProgressLevelBadge(
                        analysis.ProgressLevel
                      );

                      return (
                        <tr
                          key={child.ChildId}
                          className="transition-colors hover:bg-slate-50/50"
                        >
                          <td className="px-6 py-5 font-mono text-xs font-black text-gray-400">
                            {child.ChildId}
                          </td>
                          <td className="px-6 py-5">
                            <span className="block text-sm font-extrabold text-gray-900 md:text-base">
                              {child.FullName}
                            </span>
                            <span className="text-[10px] font-medium tracking-tight text-gray-400">
                              Lop: {activeClass.id}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center font-mono font-black text-gray-500">
                            {child.Age > 0 ? `${child.Age}t` : '--'}
                          </td>
                          <td className="px-6 py-5 text-center text-xs font-extrabold">
                            {child.Gender}
                          </td>
                          <td className="px-6 py-5 text-xs font-black italic text-[#264E50]">
                            {child.LearningLevel}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span
                              className={cn(
                                'text-base font-black italic',
                                analysis.AverageScore >= 85
                                  ? 'text-[#34A853]'
                                  : analysis.AverageScore >= 60
                                    ? 'text-[#20D0D4]'
                                    : 'text-[#FF8E8E]'
                              )}
                            >
                              {analysis.AverageScore}d
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={cn(
                                'rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider',
                                progressStyle.bg
                              )}
                            >
                              {progressStyle.label}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  if (onNavigate) {
                                    onNavigate(
                                      `TEACHER_STUDENT_DETAIL:${child.ChildId}`
                                    );
                                    return;
                                  }
                                  triggerSimulation('PROFILE', child.FullName);
                                }}
                                className="rounded-xl bg-[#4EACAF]/10 px-3 py-1.5 text-xs font-black text-[#4EACAF] transition-all hover:bg-[#4EACAF] hover:text-white"
                              >
                                Xem ho so
                              </button>
                              <button
                                onClick={() =>
                                  triggerSimulation('HISTORY', child.FullName)
                                }
                                className="rounded-xl bg-indigo-50 p-2 text-indigo-500 transition-all hover:bg-indigo-500 hover:text-white"
                              >
                                <History className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  triggerSimulation('REPLAY', child.FullName)
                                }
                                className="rounded-xl bg-rose-50 p-2 text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  triggerSimulation('ANALYZE', child.FullName)
                                }
                                className="rounded-xl bg-yellow-50 p-2 text-[#FFA800] transition-all hover:bg-[#FFA800] hover:text-white"
                              >
                                <TrendingUp className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'RESULTS' && (
        <div className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-50 bg-white/50 px-8 py-6">
            <h3 className="text-2xl font-black italic leading-none text-gray-900">
              Ket qua luyen tap gan day
            </h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              Du lieu tong hop tu results/by-child cua tung hoc sinh trong lop
            </p>
          </div>

          <div className="overflow-x-auto text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-[#FDFCF5]/60 text-xs font-extrabold uppercase tracking-widest text-[#555]">
                  <th className="px-8 py-5">Ma ket qua</th>
                  <th className="px-6 py-5">Hoc sinh</th>
                  <th className="px-6 py-5">Bai tap</th>
                  <th className="px-6 py-5 text-center">Trang thai</th>
                  <th className="px-6 py-5 text-center">Lan thu</th>
                  <th className="px-6 py-5 text-center">Thoi luong</th>
                  <th className="px-6 py-5 text-center">Diem</th>
                  <th className="px-6 py-5">Ngay ghi nhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-700">
                {classResults.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10 text-center text-sm font-semibold text-slate-400"
                    >
                      Chua co ket qua nao cho lop nay.
                    </td>
                  </tr>
                ) : (
                  classResults.map((result) => {
                    const child =
                      childrenById[result.ChildId] ??
                      childrenInClass.find((item) => item.ChildId === result.ChildId);

                    return (
                      <tr
                        key={result.ResultId}
                        className="transition-colors hover:bg-slate-50/50"
                      >
                        <td className="px-8 py-5 font-mono text-xs font-black text-gray-400">
                          {result.ResultId}
                        </td>
                        <td className="px-6 py-5 font-extrabold text-gray-900">
                          {child?.FullName ?? `Child #${result.ChildId}`}
                        </td>
                        <td className="px-6 py-5 font-mono text-xs text-gray-500">
                          {result.ExerciseId}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider',
                              result.CompletionStatus === 'Completed'
                                ? 'bg-[#F2FAF4] text-[#34A853]'
                                : 'bg-rose-50 text-rose-500'
                            )}
                          >
                            {result.CompletionStatus}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center font-mono text-gray-500">
                          {result.AttemptNumber}
                        </td>
                        <td className="px-6 py-5 text-center font-mono text-gray-500">
                          {result.DurationSeconds}s
                        </td>
                        <td className="px-6 py-5 text-center">
                          <strong
                            className={cn(
                              'text-base italic',
                              result.Score >= 85
                                ? 'text-[#4EACAF]'
                                : 'text-rose-500'
                            )}
                          >
                            {result.Score}d
                          </strong>
                        </td>
                        <td className="px-6 py-5 text-xs font-medium text-gray-400">
                          {result.CreatedAt || '--'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ANALYSES' && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {childrenInClass.length === 0 ? (
            <div className="rounded-[32px] border border-slate-100 bg-white p-8 text-sm font-semibold text-slate-400 shadow-sm">
              Chua co hoc sinh nao trong lop de phan tich.
            </div>
          ) : (
            childrenInClass.map((child) => {
              const analysis =
                analysisByChildId[child.ChildId] ?? buildAnalysis(child, []);
              const statusStyle = getProgressLevelBadge(analysis.ProgressLevel);

              return (
                <div
                  key={child.ChildId}
                  className="space-y-4 rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 border-b pb-4">
                    <div>
                      <h4 className="text-lg font-black leading-none text-gray-800">
                        {child.FullName}
                      </h4>
                      <span className="mt-2 block text-[10px] font-extrabold tracking-wider text-gray-400">
                        Trinh do: {child.LearningLevel}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-xs font-black uppercase tracking-wide',
                        statusStyle.bg
                      )}
                    >
                      {statusStyle.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-[#FDFCF5] p-3.5">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-[#4EACAF]">
                        Diem trung binh
                      </span>
                      <strong className="mt-1 block text-xl font-black text-gray-900">
                        {analysis.AverageScore} diem
                      </strong>
                    </div>
                    <div className="rounded-2xl bg-[#FFFDF5] p-3.5">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-[#FF8E8E]">
                        Hoan thanh
                      </span>
                      <strong className="mt-1 block text-xl font-black text-gray-900">
                        {analysis.CompletionRate}%
                      </strong>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3.5">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500">
                        Tong luyen tap
                      </span>
                      <strong className="mt-1 block text-sm font-black text-gray-700">
                        {analysis.TotalPracticeMinutes} phut
                      </strong>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3.5">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500">
                        So ket qua
                      </span>
                      <strong className="mt-1 block text-sm font-black text-gray-700">
                        {(resultsByChildId[child.ChildId] ?? []).length} lan luyen
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                      De xuat ho tro:
                    </span>
                    <p className="rounded-2xl border border-emerald-100/30 bg-emerald-50/50 p-3.5 text-xs font-bold leading-relaxed text-[#264E50]/90">
                      "{analysis.Recommendation}"
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'PROGRAM' && (
        <div className="space-y-8 rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm md:p-10">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4EACAF]/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest leading-none text-[#4EACAF]">
              <Sparkles className="h-3.5 w-3.5" />
              Chuong trinh #{activeClass.programId}
            </span>
            <h3 className="text-3xl font-black leading-none tracking-tight text-gray-900">
              {activeClass.programName}
            </h3>
            <p className="text-sm font-semibold leading-relaxed text-gray-500">
              {activeClass.description || 'Chua co mo ta chi tiet cho lop hoc nay.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-3">
            <div className="space-y-1 rounded-2xl border bg-[#FDFCF5] p-5">
              <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                Do tuoi muc tieu
              </span>
              <strong className="text-base font-black text-gray-800">
                {activeClass.targetAgeFrom} - {activeClass.targetAgeTo} tuoi
              </strong>
            </div>

            <div className="space-y-1 rounded-2xl border bg-[#FDFCF5] p-5">
              <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                Ngon ngu
              </span>
              <strong className="text-base font-black text-[#4EACAF]">
                {activeClass.programLanguage}
              </strong>
            </div>

            <div className="space-y-1 rounded-2xl border bg-[#FDFCF5] p-5">
              <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                Hoc ky
              </span>
              <strong className="text-base font-black text-indigo-500">
                {activeClass.semesterName}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-gray-50 pt-6 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#4EACAF]" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Thoi gian lop hoc
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  Tu {formatDate(activeClass.startDate)} den{' '}
                  {formatDate(activeClass.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#FF8E8E]" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Tong quan lop
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {activeClass.enrollmentCount} hoc sinh, giao vien{' '}
                  {activeClass.teacherName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Trang thai dong bo
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  Class detail dang dung classrooms + enrollments + child-profile +
                  results.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Luu y flow
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  Neu route vao bang mock id cu, trang se tu fallback sang lop API
                  hop le dau tien.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
