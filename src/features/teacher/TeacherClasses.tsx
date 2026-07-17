import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  AlertCircle,
  Baby,
  BookOpen,
  Calendar,
  CheckCircle,
  Eye,
  FileDown,
  FileSpreadsheet,
  Globe,
  GraduationCap,
  Info,
  Search,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCurrentUser } from '../../lib/authMock';
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
type ModalType = 'DETAILS' | 'STUDENTS' | 'PERFORMANCE' | 'REPORT' | null;

type Result = {
  ResultId: string;
  ChildId: string;
  Score: number;
  CompletionStatus: 'Completed' | 'Incomplete' | 'Failed';
  DurationSeconds: number;
  CreatedAt: string;
};

type StudentPerformance = {
  avgScore: number;
  completionRate: number;
  totalAttempts: number;
  keyFocus: string;
};

interface TeacherClassesProps {
  onNavigate?: (screen: string) => void;
}

const API_PAGE_SIZE = 100;

function formatDate(value: string | null | undefined): string {
  if (!value) return '--';
  const parts = value.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
  }
  return value.slice(0, 10);
}

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

function normalizeClassStatus(status: string): ClassroomStatus {
  if (status === 'Inactive') return 'Inactive';
  if (status === 'Completed') return 'Completed';
  if (status === 'Upcoming') return 'Upcoming';
  return 'Active';
}

function normalizeResultStatus(
  result: ResultResponse
): Result['CompletionStatus'] {
  if (result.completionStatus === 'Completed') return 'Completed';
  if (result.score <= 0) return 'Failed';
  return 'Incomplete';
}

function mapResultRecord(result: ResultResponse): Result {
  return {
    ResultId: String(result.id),
    ChildId: String(result.childId),
    Score: Math.round(result.score),
    CompletionStatus: normalizeResultStatus(result),
    DurationSeconds: result.durationSeconds,
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

function buildStudentPerformance(results: Result[]): StudentPerformance {
  const totalAttempts = results.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(results.reduce((sum, result) => sum + result.Score, 0) / totalAttempts)
      : 0;
  const completedCount = results.filter(
    (result) => result.CompletionStatus === 'Completed'
  ).length;
  const completionRate =
    totalAttempts > 0 ? Math.round((completedCount / totalAttempts) * 100) : 0;

  let keyFocus = 'Cần tiếp tục duy trì tiến độ luyện tập đều đặn.';
  if (avgScore >= 85 && completionRate >= 80) {
    keyFocus = 'Sẵn sàng tăng độ khó và mở rộng thêm bài tập phản xạ.';
  } else if (avgScore < 60 || completionRate < 50) {
    keyFocus = 'Cần giáo viên theo sát và chia nhỏ mục tiêu từng bước.';
  } else if (completionRate >= 70) {
    keyFocus = 'Cần củng cố độ chính xác và lặp lại có trọng tâm.';
  }

  return {
    avgScore,
    completionRate,
    totalAttempts,
    keyFocus,
  };
}

export default function TeacherClasses({ onNavigate }: TeacherClassesProps) {
  const currentUser = getCurrentUser();
  const [classrooms, setClassrooms] = useState<ClassroomResponse[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [resultsByChildId, setResultsByChildId] = useState<
    Record<string, Result[]>
  >({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterLanguage, setFilterLanguage] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<ClassroomResponse | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
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

    const loadTeacherData = async () => {
      setIsLoading(true);
      setIsResultsLoading(false);
      setErrorMessage('');

      try {
        const [allClassrooms, allEnrollments] = await Promise.all([
          loadAllPages(getClassrooms),
          loadAllPages(getEnrollments),
        ]);

        if (!isMounted) return;

        const teacherId =
          Number(currentUser?.UserId.replace(/\D/g, '')) || undefined;
        const teacherName = currentUser?.FullName.trim().toLowerCase() ?? '';

        const teacherClassrooms = allClassrooms.filter((classroom) => {
          const matchedById = teacherId ? classroom.userId === teacherId : false;
          const matchedByName = teacherName
            ? classroom.teacherName.trim().toLowerCase() === teacherName
            : false;
          return matchedById || matchedByName;
        });

        const nextClassrooms = teacherClassrooms;
        const classIds = new Set(nextClassrooms.map((classroom) => classroom.id));
        const nextEnrollments = allEnrollments.filter((enrollment) =>
          classIds.has(enrollment.classId)
        );

        setClassrooms(nextClassrooms);
        setEnrollments(nextEnrollments);

        const childIds = Array.from(
          new Set(nextEnrollments.map((enrollment) => String(enrollment.childId)))
        );

        if (childIds.length === 0) {
          setResultsByChildId({});
          return;
        }

        setIsResultsLoading(true);

        const resultEntries = await Promise.all(
          childIds.map(async (childId) => {
            const result = await getResultsByChild(Number(childId));

            if (!result.success || !result.data) {
              // Ignore failure for individual child results to prevent 403 from crashing the page
              return [childId, [] as Result[]] as const;
            }

            return [
              childId,
              result.data
                .map(mapResultRecord)
                .sort((left, right) => right.CreatedAt.localeCompare(left.CreatedAt)),
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
            : 'Không thể tải dữ liệu lớp học của giáo viên.'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsResultsLoading(false);
        }
      }
    };

    void loadTeacherData();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.FullName, currentUser?.UserId, reloadSeed]);

  const getEnrolledStudentsInClass = (classId: number) => {
    return enrollments
      .filter((enrollment) => enrollment.classId === classId)
      .filter((enrollment, index, array) => {
        return (
          array.findIndex((item) => item.childId === enrollment.childId) === index
        );
      });
  };

  const getClassResults = (classId: number) => {
    return getEnrolledStudentsInClass(classId)
      .flatMap((enrollment) => resultsByChildId[String(enrollment.childId)] ?? [])
      .sort((left, right) => right.CreatedAt.localeCompare(left.CreatedAt));
  };

  const teacherClassesList = useMemo(() => {
    return classrooms.filter((classroom) => {
      const status = normalizeClassStatus(classroom.status);

      if (filterStatus !== 'ALL' && status !== filterStatus) return false;
      if (
        filterLanguage !== 'ALL' &&
        classroom.programLanguage !== filterLanguage
      ) {
        return false;
      }

      const keyword = searchQuery.trim().toLowerCase();
      if (!keyword) return true;

      const textToMatch = [
        String(classroom.id),
        classroom.className,
        classroom.programName,
        classroom.description ?? '',
        classroom.teacherName,
        classroom.semesterName,
      ]
        .join(' ')
        .toLowerCase();

      return textToMatch.includes(keyword);
    });
  }, [classrooms, filterLanguage, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const activeClassesOwned = classrooms.filter(
      (classroom) => normalizeClassStatus(classroom.status) === 'Active'
    ).length;
    const uniqueChildrenCount = new Set(
      enrollments.map((enrollment) => enrollment.childId)
    ).size;
    const totalResultsRecorded = Object.values(resultsByChildId).flat().length;

    return {
      totalClassesOwned: classrooms.length,
      activeClassesOwned,
      uniqueChildrenCount,
      totalResultsRecorded,
    };
  }, [classrooms, enrollments, resultsByChildId]);

  const executeSimulatedReportGeneration = () => {
    if (!selectedClass) return;

    setIsGeneratingReport(true);
    setGenerationProgress(10);
    showToast(
      `Đang tổng hợp báo cáo lớp ${selectedClass.className} từ dữ liệu hệ thống.`,
      'info'
    );

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGeneratingReport(false);
            setGenerationProgress(0);
            showToast(
              `Đã tạo xong khung báo cáo cho lớp ${selectedClass.className}.`,
              'success'
            );
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 450);
  };

  const getStatusBadgeStyle = (status: ClassroomStatus) => {
    const mapping: Record<
      ClassroomStatus,
      { bg: string; dot: string; label: string }
    > = {
      Active: {
        bg: 'bg-[#F2FAF4] text-[#34A853] border-emerald-100',
        dot: 'bg-[#34A853]',
        label: 'Đang hoạt động',
      },
      Inactive: {
        bg: 'bg-gray-100 text-gray-500 border-gray-200',
        dot: 'bg-gray-400',
        label: 'Không hoạt động',
      },
      Completed: {
        bg: 'bg-[#F2FAFB] text-[#20D0D4] border-cyan-100',
        dot: 'bg-[#20D0D4]',
        label: 'Đã kết thúc',
      },
      Upcoming: {
        bg: 'bg-[#FFF9EE] text-[#FFA800] border-amber-100',
        dot: 'bg-[#FFA800]',
        label: 'Sắp diễn ra',
      },
    };

    return mapping[status];
  };

  const selectedClassEnrollments = selectedClass
    ? getEnrolledStudentsInClass(selectedClass.id)
    : [];
  const selectedClassResults = selectedClass ? getClassResults(selectedClass.id) : [];

  if (isLoading && classrooms.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <Activity className="h-5 w-5 animate-pulse text-[#4EACAF]" />
          <span className="font-semibold">
            Đang tải danh sách lớp học từ hệ thống...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative space-y-10 pb-24 text-left animate-in fade-in slide-in-from-bottom-4 duration-700"
      id="teacher-classes-view"
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
              <div className="rounded-xl bg-white/20 p-2 shrink-0">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : toastMessage.type === 'warn' ? (
                  <AlertCircle className="h-5 w-5 text-white" />
                ) : (
                  <Activity className="h-5 w-5 animate-pulse text-white" />
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

      <div className="flex flex-col justify-between gap-8 rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur-md lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4EACAF]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest leading-none text-[#4EACAF]">
            <GraduationCap className="h-3.5 w-3.5" />
            Giám sát sư phạm lớp học VR
          </div>
          <h1 className="pt-1 text-4xl font-black leading-none tracking-tight text-gray-900 md:text-5xl">
            Lớp Học <span className="text-[#4EACAF]">Của Tôi</span>
          </h1>
          <p className="max-w-2xl text-sm font-bold leading-relaxed text-gray-500 md:text-base">
            Danh sách này đã được đồng bộ trực tiếp từ hệ thống. Giáo viên có thể xem lớp, sĩ số,
            kết quả luyện tập và điều hướng sang chi tiết lớp học.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start rounded-[24px] border border-[#C5E1E3] bg-[#E2F2F3] p-4 shadow-sm lg:self-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/60 text-[#4EACAF] shadow-sm">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h5 className="text-sm font-black leading-tight text-[#264E50]">
              {currentUser?.FullName || 'Teacher'}
            </h5>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-[#264E50]/60">
              {currentUser?.Specialty || 'Teacher flow API'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium leading-relaxed text-slate-600">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#4EACAF]" />
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
            Trạng thái đồng bộ:
          </p>
          <span>
            Hệ thống đang sử dụng dữ liệu từ 'lớp học + học viên ghi danh + kết quả'. Các chỉ
            số kết quả lớp được tổng hợp từ kết quả của các học sinh đang ghi danh trong
            lớp.
          </span>
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
                {errorMessage || 'Đang đồng bộ thêm kết quả luyện tập của học sinh...'}
              </p>
              {errorMessage && (
                <button
                  onClick={() => setReloadSeed((value) => value + 1)}
                  className="rounded-xl bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-rose-600 transition-colors hover:bg-rose-100"
                >
                  Tải lại dữ liệu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#4EACAF]/10 p-3 text-[#4EACAF]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats.totalClassesOwned}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tổng số lớp
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats.activeClassesOwned}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Lớp đang hoạt động
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-50 p-3 text-[#FF8E8E]">
              <Baby className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats.uniqueChildrenCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Học sinh đang quản lý
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats.totalResultsRecorded}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Lượt kết quả ghi nhận
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm theo tên lớp, chương trình, học kỳ hoặc mã lớp"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm font-semibold text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#4EACAF] focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-colors focus:border-[#4EACAF] focus:bg-white"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Active">Đang hoạt động</option>
            <option value="Upcoming">Sắp diễn ra</option>
            <option value="Completed">Đã kết thúc</option>
            <option value="Inactive">Không hoạt động</option>
          </select>

          <select
            value={filterLanguage}
            onChange={(event) => setFilterLanguage(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-colors focus:border-[#4EACAF] focus:bg-white"
          >
            <option value="ALL">Tất cả ngôn ngữ</option>
            <option value="Tiếng Việt">Tiếng Việt</option>
            <option value="Tiếng Anh">Tiếng Anh</option>
          </select>
        </div>
      </div>

      {teacherClassesList.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-black text-slate-700">
            Không có lớp học nào phù hợp với bộ lọc hiện tại.
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-400">
            Thử thay đổi từ khóa, trạng thái hoặc ngôn ngữ để hiển thị lại danh sách.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2" id="classroom-cards-grid">
          {teacherClassesList.map((classroom) => {
            const status = normalizeClassStatus(classroom.status);
            const statusDetail = getStatusBadgeStyle(status);
            const enrolledStudents = getEnrolledStudentsInClass(classroom.id);
            const classResults = getClassResults(classroom.id);
            const averageScore =
              classResults.length > 0
                ? Math.round(
                    classResults.reduce((sum, result) => sum + result.Score, 0) /
                      classResults.length
                  )
                : 0;

            return (
              <motion.div
                key={classroom.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-sm"
              >
                <div className="space-y-5 p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-3 py-1 text-[10px] font-mono font-black uppercase text-slate-500">
                      Mã lớp: {classroom.id}
                    </span>
                    <span className="rounded-md bg-[#4EACAF]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#4EACAF]">
                      API_DATABASE
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider',
                        statusDetail.bg
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', statusDetail.dot)} />
                      {statusDetail.label}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black leading-tight text-gray-900 transition-colors hover:text-[#4EACAF]">
                      {classroom.className}
                    </h3>
                    <p className="min-h-[40px] text-sm font-semibold text-gray-500 line-clamp-2">
                      {classroom.description || 'Chưa có mô tả cho lớp học này.'}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-yellow-50 bg-[#FDFCF5] p-4">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-600">
                      <Sparkles className="h-4.5 w-4.5 text-[#FFA800]" />
                      Chương trình: "{classroom.programName}"
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-bold text-gray-500">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5 text-gray-400" />
                        Ngôn ngữ: {classroom.programLanguage}
                      </span>
                      <span>
                        Độ tuổi: {classroom.targetAgeFrom} - {classroom.targetAgeTo}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-5">
                    <div className="space-y-1">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                        Bắt đầu
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                        <Calendar className="h-3.5 w-3.5 text-[#4EACAF]" />
                        {formatDate(classroom.startDate)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                        Sĩ số
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-extrabold text-gray-700">
                        <Baby className="h-3.5 w-3.5 text-[#FF8E8E]" />
                        {enrolledStudents.length} học sinh
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                        Học kỳ
                      </span>
                      <span className="text-xs font-bold text-gray-600">
                        {classroom.semesterName}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                        Điểm trung bình
                      </span>
                      <span className="text-xs font-extrabold text-gray-700">
                        {averageScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 border-t border-gray-50 bg-gray-50/50 px-8 py-5 sm:flex sm:flex-wrap sm:justify-end">
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate(`TEACHER_CLASS_DETAIL:${classroom.id}`);
                        return;
                      }
                      setSelectedClass(classroom);
                      setModalType('DETAILS');
                    }}
                    className="flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-black text-gray-600 transition-all hover:bg-gray-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Xem chi tiết
                  </button>

                  <button
                    onClick={() => {
                      setSelectedClass(classroom);
                      setModalType('STUDENTS');
                      showToast(`Đang mở danh sách học sinh lớp ${classroom.className}.`);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#4EACAF]/10 px-3 py-2.5 text-xs font-black text-[#4EACAF] transition-all hover:bg-[#4EACAF] hover:text-white"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Xem học sinh
                  </button>

                  <button
                    onClick={() => {
                      setSelectedClass(classroom);
                      setModalType('PERFORMANCE');
                      showToast(`Đang tổng hợp kết quả cho lớp #${classroom.id}.`, 'info');
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2.5 text-xs font-black text-indigo-500 transition-all hover:bg-indigo-500 hover:text-white"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    Xem kết quả
                  </button>

                  <button
                    onClick={() => {
                      setSelectedClass(classroom);
                      setModalType('REPORT');
                    }}
                    className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-black text-[#FF8E8E] transition-all hover:bg-[#FF8E8E] hover:text-white sm:col-span-1"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Tạo báo cáo
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedClass && modalType && (
          <div className="fixed inset-0 z-[200] flex h-full w-full items-center justify-center overflow-y-auto bg-gray-900/15 p-4 backdrop-blur-xl md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="my-8 flex w-full max-w-2xl flex-col overflow-hidden rounded-[36px] border border-gray-100 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#C5E1E3] bg-[#E2F2F3] px-8 py-6 text-gray-900">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#4EACAF] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    {modalType === 'DETAILS' && 'Thông tin lớp học'}
                    {modalType === 'STUDENTS' && 'Danh sách học sinh'}
                    {modalType === 'PERFORMANCE' && 'Phân tích kết quả'}
                    {modalType === 'REPORT' && 'Xuất báo cáo'}
                  </span>
                  <h2 className="text-xl font-black leading-tight">
                    {selectedClass.className}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedClass(null);
                    setModalType(null);
                    setIsGeneratingReport(false);
                    setGenerationProgress(0);
                  }}
                  className="rounded-full p-2 transition-colors hover:bg-white/50"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {modalType === 'DETAILS' && (
                <div className="space-y-6 p-8 text-left">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                      Mô tả lớp học
                    </h4>
                    <p className="rounded-2xl border bg-slate-50 p-5 text-sm font-bold leading-relaxed text-gray-700">
                      {selectedClass.description || 'Chưa có mô tả chi tiết cho lớp học này.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border bg-[#FDFCF5] p-4.5">
                      <span className="block text-[10px] font-bold uppercase text-gray-400">
                        Chương trình
                      </span>
                      <strong className="text-[#264E50]">
                        {selectedClass.programName}
                      </strong>
                    </div>

                    <div className="rounded-xl border bg-[#FDFCF5] p-4.5">
                      <span className="block text-[10px] font-bold uppercase text-gray-400">
                        Thời gian
                      </span>
                      <span className="mt-1 block text-xs font-black text-gray-600">
                        Từ {formatDate(selectedClass.startDate)} đến{' '}
                        {formatDate(selectedClass.endDate)}
                      </span>
                    </div>

                    <div className="rounded-xl border bg-[#FDFCF5] p-4.5">
                      <span className="block text-[10px] font-bold uppercase text-gray-400">
                        Ngôn ngữ
                      </span>
                      <strong className="text-[#FF8E8E]">
                        {selectedClass.programLanguage}
                      </strong>
                    </div>

                    <div className="rounded-xl border bg-[#FDFCF5] p-4.5">
                      <span className="block text-[10px] font-bold uppercase text-gray-400">
                        Học kỳ
                      </span>
                      <span className="mt-1 block text-xs font-black text-gray-600">
                        {selectedClass.semesterName}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'STUDENTS' && (
                <div className="max-h-[50vh] space-y-4 overflow-y-auto p-8">
                  <div className="flex items-center justify-between border-b pb-3 text-xs font-black uppercase text-gray-400">
                    <span>Học sinh ghi danh</span>
                    <span>Trạng thái và ngày vào lớp</span>
                  </div>

                  {selectedClassEnrollments.length === 0 ? (
                    <p className="py-12 text-center text-sm font-semibold italic text-gray-400">
                      Không có học sinh nào đang ghi danh lớp này.
                    </p>
                  ) : (
                    selectedClassEnrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100/70"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8E8E]/10 text-[#FF8E8E]">
                            <Baby className="h-5.5 w-5.5" />
                          </div>
                          <div>
                            <span className="block text-sm font-extrabold text-gray-800">
                              {enrollment.childFullName}
                            </span>
                            <span className="mt-1 inline-block rounded bg-[#4EACAF]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4EACAF]">
                              Mức tập: {enrollment.childLearningLevel}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="block text-xs font-extrabold text-gray-500">
                            {enrollment.status}
                          </span>
                          <span className="block text-[10px] font-medium text-gray-400">
                            {formatDate(enrollment.enrollmentDate)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {modalType === 'PERFORMANCE' && (
                <div className="max-h-[50vh] space-y-6 overflow-y-auto p-8 text-left">
                  {selectedClassEnrollments.length === 0 ? (
                    <p className="py-12 text-center text-sm font-semibold italic text-gray-400">
                      Chưa có dữ liệu học sinh để tổng hợp kết quả.
                    </p>
                  ) : (
                    selectedClassEnrollments.map((enrollment) => {
                      const performance = buildStudentPerformance(
                        resultsByChildId[String(enrollment.childId)] ?? []
                      );

                      return (
                        <div
                          key={enrollment.id}
                          className="space-y-2 border-b border-gray-50 pb-4"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-gray-800">
                              {enrollment.childFullName}
                            </span>
                            <span className="font-black text-[#4EACAF]">
                              {performance.avgScore}/100 điểm trung bình
                            </span>
                          </div>

                          <div className="relative">
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-500',
                                  performance.avgScore >= 85
                                    ? 'bg-emerald-500'
                                    : performance.avgScore >= 60
                                      ? 'bg-[#FFA800]'
                                      : 'bg-rose-500'
                                )}
                                style={{ width: `${performance.avgScore}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-gray-400">
                            <span>
                              Hoàn thành: {performance.completionRate}% ·{' '}
                              {performance.totalAttempts} lần ghi nhận
                            </span>
                            <span className="max-w-[280px] truncate italic">
                              Trọng tâm: {performance.keyFocus}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {modalType === 'REPORT' && (
                <div className="space-y-6 p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#FF8E8E]/40 bg-[#FFF2F2] text-[#FF8E8E]">
                    <FileSpreadsheet className="h-8 w-8" />
                  </div>

                  <div className="mx-auto max-w-md space-y-2">
                    <h4 className="text-base font-black text-gray-800">
                      Khởi tạo khung báo cáo lớp học
                    </h4>
                    <p className="text-xs text-gray-400">
                      Hệ thống sẽ tổng hợp sĩ số, lượt luyện tập và chất lượng kết
                      quả của học sinh trong lớp từ dữ liệu hệ thống hiện tại.
                    </p>
                  </div>

                  <div className="block rounded-2xl border border-yellow-100 bg-[#FFFDF5] p-4.5 text-left text-xs font-semibold text-gray-600">
                    <strong className="mb-1 block text-[10px] font-extrabold uppercase text-gray-800">
                      Bao gồm:
                    </strong>
                    - Tổng quan lớp và chương trình.<br />
                    - Danh sách học sinh đang ghi danh.<br />
                    - Tổng hợp kết quả luyện tập theo học sinh.
                  </div>

                  <div className="rounded-2xl border bg-slate-50 p-4 text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Tổng quan nhanh
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {selectedClassEnrollments.length} học sinh ·{' '}
                      {selectedClassResults.length} kết quả ghi nhận
                    </p>
                  </div>

                  {isGeneratingReport && (
                    <div className="space-y-2 animate-pulse">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-[#4EACAF]">
                        <span>Đang xử lý báo cáo...</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-[#4EACAF] transition-all duration-300"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!isGeneratingReport && (
                    <button
                      onClick={executeSimulatedReportGeneration}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4EACAF] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#4EACAF]/90"
                    >
                      <FileDown className="h-4 w-4" />
                      Yêu cầu kết xuất
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-8 py-5">
                <button
                  onClick={() => {
                    setSelectedClass(null);
                    setModalType(null);
                    setIsGeneratingReport(false);
                    setGenerationProgress(0);
                  }}
                  className="rounded-2xl bg-[#264E50] px-5 py-2.5 text-xs font-black text-white transition-colors hover:bg-[#1E3B3D]"
                >
                  Đóng lại
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
