import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  Baby,
  CheckCircle2,
  ChevronRight,
  Filter,
  GraduationCap,
  Heart,
  Mail,
  Phone,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn, resolveAvatarUrl } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
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
import { getUserById } from '../../services/userService';

export interface Child {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Note: string;
  Status: 'Active' | 'Inactive';
  Avatar: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  ProgressLevel: 'Improving' | 'Stable' | 'Need Support';
}

export interface ParentUser {
  UserId: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
}

interface TeacherStudentsProps {
  onNavigate: (screen: string) => void;
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

function mapChildRecord(child: ChildProfileResponse): Omit<Child, 'ProgressLevel'> {
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
    Avatar: child.avatar || null,
    CreatedAt: formatDateTime(child.createdAt),
    UpdatedAt: formatDateTime(child.updatedAt),
  };
}

function normalizeResultStatus(result: ResultResponse) {
  if (result.completionStatus === 'Completed') return 'Completed';
  if (result.score <= 0) return 'Failed';
  return 'Incomplete';
}

function buildProgressLevel(
  results: ResultResponse[]
): Child['ProgressLevel'] {
  if (results.length === 0) return 'Stable';

  const averageScore = Math.round(
    results.reduce((sum, result) => sum + result.score, 0) / results.length
  );
  const completedCount = results.filter(
    (result) => normalizeResultStatus(result) === 'Completed'
  ).length;
  const completionRate = Math.round((completedCount / results.length) * 100);

  if (averageScore >= 85 && completionRate >= 80) return 'Improving';
  if (averageScore < 60 || completionRate < 50) return 'Need Support';
  return 'Stable';
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

function getAvatarUrl(child: Child) {
  return resolveAvatarUrl(child.Avatar, child.FullName, 'avataaars');
}

export default function TeacherStudents({ onNavigate }: TeacherStudentsProps) {
  const currentUser = getCurrentUser();
  const [children, setChildren] = useState<Child[]>([]);
  const [parentById, setParentById] = useState<Record<string, ParentUser>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadSeed, setReloadSeed] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGender, selectedLevel]);

  useEffect(() => {
    let isMounted = true;

    const loadTeacherStudents = async () => {
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

        const teacherClassIds = new Set(
          allClassrooms
            .filter((classroom: ClassroomResponse) => {
              const matchedById = teacherId
                ? classroom.userId === teacherId
                : false;
              const matchedByName = teacherName
                ? classroom.teacherName.trim().toLowerCase() === teacherName
                : false;
              return matchedById || matchedByName;
            })
            .map((classroom) => classroom.id)
        );

        const teacherEnrollments = allEnrollments.filter((enrollment) =>
          teacherClassIds.has(enrollment.classId)
        );

        const childIds = Array.from(
          new Set(teacherEnrollments.map((enrollment) => enrollment.childId))
        );

        const childLookup = new Map(
          allChildren.map((child) => [child.id, child] as const)
        );

        const resultEntries = await Promise.all(
          childIds.map(async (childId) => {
            const result = await getResultsByChild(childId);

            if (!result.success || !result.data) {
              // Ignore failure for individual child results to prevent 403 from crashing the page
              return [childId, [] as ResultResponse[]] as const;
            }

            return [childId, result.data] as const;
          })
        );

        const parentIds = Array.from(
          new Set(
            childIds
              .map((childId) => childLookup.get(childId)?.userId)
              .filter((value): value is number => typeof value === 'number')
          )
        );

        const parentEntries = await Promise.all(
          parentIds.map(async (parentId) => {
            const result = await getUserById(parentId);

            if (!result.success || !result.data) {
              return null;
            }

            return [
              String(parentId),
              {
                UserId: String(result.data.id),
                FullName: result.data.fullName,
                Email: result.data.email,
                PhoneNumber: result.data.phone,
              },
            ] as const;
          })
        );

        if (!isMounted) return;

        const resultsByChildId = Object.fromEntries(
          resultEntries.map(([childId, results]) => [String(childId), results])
        );

        const nextChildren = childIds
          .map((childId) => childLookup.get(childId))
          .filter((child): child is ChildProfileResponse => Boolean(child))
          .map((child) => ({
            ...mapChildRecord(child),
            ProgressLevel: buildProgressLevel(
              resultsByChildId[String(child.id)] ?? []
            ),
          }))
          .sort((left, right) => left.FullName.localeCompare(right.FullName));

        setChildren(nextChildren);
        setParentById(
          Object.fromEntries(parentEntries.filter(Boolean) as Array<
            readonly [string, ParentUser]
          >)
        );
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Không thể tải danh sách học sinh.'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTeacherStudents();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.FullName, currentUser?.UserId, reloadSeed]);

  const levelOptions = useMemo(
    () => ['All', ...Array.from(new Set(children.map((child) => child.LearningLevel)))],
    [children]
  );

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const parent = parentById[child.ParentUserId];
      const keyword = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        child.FullName.toLowerCase().includes(keyword) ||
        child.ChildId.toLowerCase().includes(keyword) ||
        child.LearningLevel.toLowerCase().includes(keyword) ||
        parent?.FullName.toLowerCase().includes(keyword);

      const matchesGender =
        selectedGender === 'All' || child.Gender === selectedGender;
      const matchesLevel =
        selectedLevel === 'All' || child.LearningLevel === selectedLevel;

      return matchesSearch && matchesGender && matchesLevel;
    });
  }, [children, parentById, searchTerm, selectedGender, selectedLevel]);

  const totalPages = Math.max(1, Math.ceil(filteredChildren.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedChildren = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredChildren.slice(startIndex, startIndex + pageSize);
  }, [filteredChildren, currentPage, pageSize]);

  const stats = useMemo(() => {
    const total = children.length;
    const averageAge =
      total > 0
        ? (children.reduce((sum, child) => sum + child.Age, 0) / total).toFixed(1)
        : '0.0';
    const boys = children.filter((child) => child.Gender === 'Male').length;
    const girls = children.filter((child) => child.Gender === 'Female').length;

    return {
      total,
      averageAge,
      boys,
      girls,
    };
  }, [children]);

  if (isLoading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <TrendingUp className="h-5 w-5 animate-pulse text-[#4EACAF]" />
          <span className="font-semibold">
            Đang tải danh sách học sinh từ hệ thống...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="teacher-students-container">
      <div className="relative overflow-hidden rounded-[40px] border-2 border-white/80 bg-gradient-to-r from-[#4EACAF]/10 to-[#FF8E8E]/10 p-8 shadow-sm">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-teal-100/30 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4EACAF]/20 bg-[#4EACAF]/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#4EACAF]">
              <Baby className="h-4 w-4" /> Danh sách học sinh của tôi
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900">
              Quản Lý <span className="text-[#4EACAF]">Học Viên</span>
            </h1>
            <p className="max-w-xl text-sm font-bold text-gray-500">
              Màn hình này đã được đồng bộ dữ liệu theo các lớp học mà giáo viên đang
              phụ trách, giúp quy trình chuyển tiếp từ danh sách sang chi tiết học sinh được đồng bộ hoàn toàn.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF8E8E]/10 text-[#FF8E8E]">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900">
                  {stats.total}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Tổng học viên
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-2">
              <p className="font-semibold">{errorMessage}</p>
              <button
                onClick={() => setReloadSeed((value) => value + 1)}
                className="rounded-xl bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-rose-600 transition-colors hover:bg-rose-100"
              >
                Tải lại dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          whileHover={{ y: -4 }}
          className="flex items-center gap-5 rounded-[32px] border-2 border-slate-50 bg-white p-6 shadow-sm"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4EACAF]/10 text-[#4EACAF]">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-gray-900">
              {stats.total} Học sinh
            </h4>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Lớp tôi phụ trách
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="flex items-center gap-5 rounded-[32px] border-2 border-slate-50 bg-white p-6 shadow-sm"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-gray-900">
              {stats.averageAge} Tuổi
            </h4>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Độ tuổi trung bình
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="flex items-center gap-5 rounded-[32px] border-2 border-slate-50 bg-white p-6 shadow-sm"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-gray-900">{stats.boys} Bé trai</h4>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Giới tính nam
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="flex items-center gap-5 rounded-[32px] border-2 border-slate-50 bg-white p-6 shadow-sm"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
            <Heart className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-gray-900">{stats.girls} Bé gái</h4>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Giới tính nữ
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-[32px] border-b-4 border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, ID, trình độ hoặc tên phụ huynh..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-[20px] border-2 border-slate-50 bg-slate-50 py-4 pl-14 pr-5 text-sm font-bold text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#4EACAF] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-[18px] bg-slate-50 p-1.5">
            {['All', 'Male', 'Female', 'Other'].map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={cn(
                  'cursor-pointer rounded-xl px-4 py-2 text-xs font-black transition-all',
                  selectedGender === gender
                    ? 'bg-[#4EACAF] text-white shadow-md shadow-[#4EACAF]/20'
                    : 'text-gray-500 hover:bg-slate-100/60 hover:text-gray-800'
                )}
              >
                {gender === 'All'
                  ? 'Tất cả giới tính'
                  : gender === 'Male'
                    ? 'Nam'
                    : gender === 'Female'
                      ? 'Nữ'
                      : 'Khác'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-[18px] bg-slate-50 p-1.5 pr-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
              className="rounded-xl bg-transparent px-2 py-2 text-xs font-black text-slate-700 outline-none"
            >
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level === 'All' ? 'Tất cả trình độ' : level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredChildren.length === 0 ? (
        <div className="rounded-[40px] border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 animate-pulse text-orange-400" />
          <h3 className="mb-2 text-xl font-bold text-slate-800">
            Không tìm thấy thông tin phù hợp
          </h3>
          <p className="mx-auto max-w-sm text-sm font-bold text-slate-400">
            Hệ thống không tìm thấy học viên nào khớp với bộ lọc hoặc từ khóa tìm
            kiếm của bạn.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {paginatedChildren.map((child) => {
              const parent = parentById[child.ParentUserId];

              return (
                <motion.div
                  key={child.ChildId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  className="flex flex-col justify-between rounded-[40px] border-b-8 border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-b-8 hover:border-[#4EACAF]/40"
                >
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <span className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase italic tracking-wider text-gray-400">
                        {child.ChildId}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-[#4EACAF]/10 bg-[#4EACAF]/10 px-2.5 py-1 text-[10px] font-bold text-[#4EACAF]">
                          {child.LearningLevel}
                        </span>
                        {child.ProgressLevel === 'Improving' && (
                          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                            Đang tiến bộ
                          </span>
                        )}
                        {child.ProgressLevel === 'Stable' && (
                          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
                            Ổn định
                          </span>
                        )}
                        {child.ProgressLevel === 'Need Support' && (
                          <span className="flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600">
                            <AlertCircle className="h-3.5 w-3.5" /> Cần hỗ trợ
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-5">
                      <div className="relative shrink-0">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-sky-100 shadow-xl">
                          <img
                            src={getAvatarUrl(child)}
                            alt={child.FullName}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div
                          className={cn(
                            'absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-xs shadow-md',
                            child.Gender === 'Male'
                              ? 'bg-sky-500 text-white'
                              : child.Gender === 'Female'
                                ? 'bg-pink-500 text-white'
                                : 'bg-violet-500 text-white'
                          )}
                        >
                          {child.Gender === 'Male'
                            ? 'N'
                            : child.Gender === 'Female'
                              ? 'Nữ'
                              : 'K'}
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <h3 className="text-2xl font-black tracking-tight text-gray-900 transition-colors hover:text-[#4EACAF]">
                          {child.FullName}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                          <span>
                            Tuổi: <strong className="text-slate-800">{child.Age}</strong>
                          </span>
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1">
                            Trạng thái:
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-extrabold text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" />
                              {child.Status === 'Active' ? 'Tích cực' : 'Tạm dừng'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {parent && (
                      <div className="space-y-2 rounded-2xl border border-orange-100/50 bg-orange-50/50 p-4 text-xs">
                        <div className="flex items-center gap-2 font-black text-slate-700">
                          <Heart className="h-4 w-4 fill-orange-400 text-orange-400" />
                          <span>Phụ huynh: {parent.FullName}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 font-bold text-[#777] sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{parent.PhoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate">{parent.Email}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {child.Note && (
                      <p className="border-l-4 border-slate-100 pl-3 text-xs font-bold italic leading-relaxed text-slate-400">
                        "{child.Note}"
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-6">
                    <span className="text-[11px] font-bold uppercase text-gray-400">
                      Cập nhật: {child.UpdatedAt || child.CreatedAt}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        onNavigate(`TEACHER_STUDENT_DETAIL:${child.ChildId}`)
                      }
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[#4EACAF] px-5 py-3 text-xs font-black text-white shadow-md shadow-[#4EACAF]/10 transition-all hover:bg-[#5ec4c7] hover:shadow-lg"
                    >
                      Xem chi tiết học bạ
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="rounded-[40px] border border-slate-100 bg-white p-6">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredChildren.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemLabel="học sinh"
            />
          </div>
        </div>
      )}
    </div>
  );
}
