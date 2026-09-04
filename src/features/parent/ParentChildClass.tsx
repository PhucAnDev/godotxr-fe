import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Baby,
  School,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  Flame,
  User,
  Info,
  ChevronDown,
  BookMarked,
  Hourglass,
  RefreshCw,
  AlertTriangle,
  Eye,
  X,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';
import CustomSelect from '../../components/common/CustomSelect';
import { useChildManagementApi } from '../../hooks/useChildManagementApi';
import { getLessonsByProgram, type LessonResponse } from '../../services/lessonService';
import { getProgramById, type ProgramResponse } from '../../services/programService';
import type { ChildProfileResponse } from '../../services/childProfileService';
import { getEnrollmentsByChild, type EnrollmentResponse } from '../../services/enrollmentService';
import { getClassroomById, type ClassroomResponse } from '../../services/classroomService';
import { getUserById, type UserResponse } from '../../services/userService';

const formatDateDMY = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
  }
  return dateStr;
};

export default function ParentChildClass() {
  const { getMyChildProfiles } = useChildManagementApi();

  const [children, setChildren] = useState<ChildProfileResponse[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  // Real API data
  const [enrollment, setEnrollment] = useState<EnrollmentResponse | null>(null);
  const [classroomDetail, setClassroomDetail] = useState<ClassroomResponse | null>(null);
  const [programDetail, setProgramDetail] = useState<ProgramResponse | null>(null);
  const [lessons, setLessons] = useState<LessonResponse[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isClassLoading, setIsClassLoading] = useState(false);
  const [isLessonsLoading, setIsLessonsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noEnrollment, setNoEnrollment] = useState(false);

  const [activeLessonDetail, setActiveLessonDetail] = useState<LessonResponse | null>(null);
  const [activeExerciseDetail, setActiveExerciseDetail] = useState<any | null>(null);

  const [exerciseQuestions, setExerciseQuestions] = useState<any[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);

  const [teacherDetail, setTeacherDetail] = useState<UserResponse | null>(null);
  const [isTeacherLoading, setIsTeacherLoading] = useState(false);

  // 1. Fetch children
  const fetchChildren = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    const childrenRes = await getMyChildProfiles();

    if (childrenRes.success && childrenRes.data) {
      setChildren(childrenRes.data);
      if (childrenRes.data.length > 0) {
        setSelectedChildId(childrenRes.data[0].id);
      }
    } else {
      setErrorMessage(childrenRes.message || 'Không thể tải danh sách hồ sơ của bé.');
    }

    setIsLoading(false);
  }, [getMyChildProfiles]);

  useEffect(() => {
    void fetchChildren();
  }, [fetchChildren]);

  // 2. Fetch enrollment + classroom when child changes
  const fetchClassForChild = useCallback(async (childId: number) => {
    setIsClassLoading(true);
    setEnrollment(null);
    setClassroomDetail(null);
    setProgramDetail(null);
    setLessons([]);
    setNoEnrollment(false);

    // Get enrollments for this child (new endpoint, Parent-accessible)
    const enrollRes = await getEnrollmentsByChild(childId);
    if (!enrollRes.success || !enrollRes.data || enrollRes.data.length === 0) {
      setNoEnrollment(true);
      setIsClassLoading(false);
      return;
    }

    // Pick the most recent Active enrollment, fallback to first
    const activeEnroll = enrollRes.data.find(e => e.status === 'Active') ?? enrollRes.data[0];
    setEnrollment(activeEnroll);

    // Fetch classroom detail (Admin/Teacher endpoint — if 403 we still have classId/className from enrollment)
    const clsRes = await getClassroomById(activeEnroll.classId);
    if (clsRes.success && clsRes.data) {
      setClassroomDetail(clsRes.data);
      // Fetch lessons and program detail for this program
      if (clsRes.data.programId) {
        setIsLessonsLoading(true);
        const [lessonsRes, progRes] = await Promise.all([
          getLessonsByProgram(clsRes.data.programId),
          getProgramById(clsRes.data.programId)
        ]);
        if (lessonsRes.success && lessonsRes.data) {
          const sorted = [...lessonsRes.data].sort((a, b) => a.lessonOrder - b.lessonOrder);
          setLessons(sorted);
        }
        if (progRes.success && progRes.data) {
          setProgramDetail(progRes.data);
        }
        setIsLessonsLoading(false);
      }
    }

    setIsClassLoading(false);
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      void fetchClassForChild(selectedChildId);
    }
  }, [selectedChildId, fetchClassForChild]);

  // 3. Resolve selected child
  const selectedChild = useMemo(() =>
    children.find(ch => ch.id === selectedChildId) || null,
    [children, selectedChildId]);

  const childOptions = useMemo(() =>
    children.map(ch => ({
      value: String(ch.id),
      label: `👦 ${ch.fullName} (${ch.age} tuổi)`
    })),
    [children]);

  // Fetch teacher details when classroomDetail changes
  useEffect(() => {
    const fetchTeacher = async (userId: number) => {
      setIsTeacherLoading(true);
      const res = await getUserById(userId);
      if (res.success && res.data) {
        setTeacherDetail(res.data);
      } else {
        setTeacherDetail(null);
      }
      setIsTeacherLoading(false);
    };

    if (classroomDetail?.userId) {
      void fetchTeacher(classroomDetail.userId);
    } else {
      setTeacherDetail(null);
    }
  }, [classroomDetail]);

  const handleChildChange = (childId: number) => {
    setSelectedChildId(childId);
  };

  const isPageLoading = isLoading || isClassLoading;

  // Determine classroom display values (use classroomDetail if available, fall back to enrollment data)
  const displayClassName = classroomDetail?.className ?? enrollment?.className ?? '';
  const displayDescription = classroomDetail?.description ?? `Lớp học VR dành cho ${selectedChild?.fullName ?? 'bé'}.`;
  const displayStartDate = classroomDetail?.startDate ? formatDateDMY(classroomDetail.startDate) : '—';
  const displayEndDate = classroomDetail?.endDate ? formatDateDMY(classroomDetail.endDate) : '—';
  const displayClassId = classroomDetail ? `CLS-${classroomDetail.id}` : `CLS-${enrollment?.classId ?? '—'}`;
  const displayStatus = classroomDetail?.status ?? 'Active';
  const displayTeacherName = classroomDetail?.teacherName ?? '—';
  const displayTeacherSpecialty = classroomDetail?.teacherSpecialty ?? '—';
  const displayProgramName = classroomDetail?.programName ?? '—';
  const displayEnrollmentDate = enrollment?.enrollmentDate ? formatDateDMY(enrollment.enrollmentDate) : '—';
  const displayEnrollmentStatus = enrollment?.status ?? '—';

  return (
    <div className="space-y-4 pb-20 text-left" id="parent-child-classroom-container">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Lớp Học <span className="text-[#4EACAF]">Của Con</span>
          </h1>
        </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="bg-[#4EACAF]/10 border-2 border-dashed border-[#4EACAF]/25 p-4 rounded-3xl shrink-0 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#4EACAF] rounded-2xl flex items-center justify-center shrink-0 text-white">
              <Baby className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1 select-none">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block leading-none">Hồ sơ của bé:</span>
              <CustomSelect
                value={String(selectedChildId || '')}
                onChange={(val) => handleChildChange(Number(val))}
                options={childOptions}
                className="w-56 font-black uppercase text-xs"
                variant="filter"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {isPageLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white/40 rounded-3xl border border-white/60">
          <RefreshCw className="h-10 w-10 text-[#4EACAF] animate-spin" />
          <p className="text-gray-500 font-bold">Đang tải thông tin lớp học...</p>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 flex gap-4 text-rose-800 text-sm font-bold items-center max-w-2xl mx-auto">
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

      {/* No children */}
      {!isPageLoading && children.length === 0 && !errorMessage && (
        <div className="bg-white rounded-xl p-12 text-center max-w-xl mx-auto border border-gray-150 shadow-sm space-y-4">
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

      {/* Not enrolled */}
      {!isPageLoading && selectedChild && noEnrollment && (
        <div className="bg-white rounded-xl p-12 text-center max-w-xl mx-auto border border-gray-150 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <School className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Bé chưa tham gia lớp học</h3>
          <p className="text-slate-500 text-sm font-bold leading-relaxed">
            Bé <strong>{selectedChild.fullName}</strong> chưa tham gia lớp học nào trên hệ thống GodotXR.
            Vui lòng liên hệ với nhà trường hoặc giáo viên phụ trách để ghi danh bé vào lớp học.
          </p>
        </div>
      )}

      {/* Main content: has enrollment */}
      {!isPageLoading && selectedChild && enrollment && !noEnrollment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left/Middle - Classroom & Lesson timeline */}
          <div className="lg:col-span-2 space-y-4">

            {/* Class info card */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full -mr-10 -mt-10 pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#4EACAF]/10 text-[#4EACAF] rounded-2xl flex items-center justify-center shrink-0">
                    <School className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-800 leading-none">{displayClassName}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                      {displayProgramName !== '—' ? `Chương trình: ${displayProgramName}` : 'Lớp học thuộc hệ thống GodotXR'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase border border-emerald-100">
                    {displayStatus === 'Active' ? 'Đang hoạt động' : displayStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 font-bold text-sm leading-relaxed italic bg-slate-50/70 p-5 rounded-2xl border border-slate-100/30 whitespace-pre-line">
                  &ldquo;{displayDescription}&rdquo;
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-gray-500">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block mb-1">Thời hạn học</span>
                    <span className="text-gray-700 font-medium">{displayStartDate} &rarr; {displayEndDate}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block mb-1">Mã định danh lớp</span>
                    <span className="text-gray-700 font-medium">{displayClassId}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block mb-1">Ngày ghi danh</span>
                    <span className="text-gray-700 font-medium">{displayEnrollmentDate}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block mb-1">Trạng thái</span>
                    <span className="text-emerald-600 font-bold">{displayEnrollmentStatus === 'Active' ? 'Đã ghi danh' : displayEnrollmentStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson timeline & exercises */}
            <div className="bg-white rounded-xl p-8 md:p-10 border border-gray-100 shadow-sm space-y-4 relative">
              {isLessonsLoading && (
                <div className="absolute top-4 right-4 animate-spin text-[#4EACAF]">
                  <RefreshCw className="w-4 h-4" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-none italic">Danh sách bài học</h3>
                </div>
                <span className="text-xs bg-[#4EACAF]/10 text-[#4EACAF] px-3.5 py-1 rounded-full font-black">
                  Tổng số: {lessons.length} Chương buổi
                </span>
              </div>

              {lessons.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-bold italic text-sm">
                  {isLessonsLoading ? 'Đang tải bài học...' : 'Chưa có bài giảng nào được cấu hình cho chương trình này.'}
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-[10px] text-[#4EACAF] font-black uppercase tracking-wider block">Bài học của trẻ:</span>
                  <div className="space-y-3">
                    {lessons.map((les) => (
                      <div
                        key={les.id}
                        className="w-full p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#4EACAF]/40 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#4EACAF]/10 text-[#4EACAF] flex items-center justify-center shrink-0 font-black text-sm">
                            {les.lessonOrder}
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-base text-gray-800 leading-tight">
                                {les.lessonName}
                              </h4>
                              {les.targetSkill && (
                                <span className="text-[10px] uppercase font-black bg-[#4EACAF]/10 text-[#4EACAF] px-2 py-0.5 rounded-md">
                                  {les.targetSkill}
                                </span>
                              )}
                            </div>
                            {les.description && (
                              <p className="text-xs text-gray-500 font-medium line-clamp-2">{les.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 pt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#4EACAF]" />
                                {les.estimatedDuration} phút
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                Thang điểm: {les.maxScore ?? 100}đ
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveLessonDetail(les)}
                          className="self-end sm:self-center shrink-0 px-4 py-2 bg-slate-50 hover:bg-[#4EACAF] hover:text-white text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-100 hover:border-[#4EACAF] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem chi tiết</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar - Teacher & Program */}
          <div className="space-y-4">

            {/* Teacher card */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#4EACAF]/5 rounded-full -ml-8 -mt-8 pointer-events-none" />

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4EACAF]/10 text-[#4EACAF] rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                  {teacherDetail?.avatar ? (
                    <img src={teacherDetail.avatar} alt={displayTeacherName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Giáo viên: </h4>
                  <span className="text-base font-extrabold text-gray-800 block mt-1.5 leading-none">
                    {displayTeacherName}
                  </span>
                </div>
              </div>

              <div className="space-y-3 font-semibold text-xs text-gray-600 border-t border-gray-50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Chuyên môn:</span>
                  <span className="text-gray-700 text-right font-medium max-w-[160px]">{displayTeacherSpecialty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Mã lớp:</span>
                  <span className="text-gray-700 font-medium">{displayClassId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Trạng thái lớp:</span>
                  <span className="bg-emerald-100/80 text-emerald-800 px-3 py-1 rounded-md font-black text-[11px] uppercase tracking-wider border border-emerald-200 shadow-2xs">
                    {displayStatus === 'Active' ? 'Hoạt động tốt' : displayStatus}
                  </span>
                </div>

                {isTeacherLoading ? (
                  <div className="py-2 text-center text-gray-400 text-[10px] flex items-center justify-center gap-1">
                    <RefreshCw className="h-3 w-3 text-indigo-500 animate-spin" />
                    <span>Đang tải thông tin liên hệ...</span>
                  </div>
                ) : teacherDetail ? (
                  <>
                    <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-gray-700 font-medium truncate max-w-[170px]" title={teacherDetail.email}>{teacherDetail.email}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Giới tính:</span>
                      <span className="text-gray-700 font-medium">
                        {teacherDetail.gender === 'Male' ? 'Nam' : teacherDetail.gender === 'Female' ? 'Nữ' : 'Khác'}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Program card */}
            {classroomDetail && (
              <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#4EACAF]/10 text-[#4EACAF] rounded-2xl flex items-center justify-center shrink-0">
                    <BookMarked className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs bg-[#FF8E8E]/10 text-[#FF8E8E] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider block w-fit">
                      Chương Trình học
                    </span>
                    <h3 className="text-base font-black text-gray-800 leading-snug mt-1.5">
                      {programDetail?.programName || classroomDetail.programName}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-bold italic bg-slate-50/70 p-4 rounded-2xl border border-slate-100/50 whitespace-pre-line">
                  {programDetail?.description || 'Chương trình rèn luyện uốn âm đơn kết hợp cột hơi cho trẻ nhỏ.'}
                </p>

                <div className="space-y-3 pt-1 text-xs font-bold text-gray-600 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Độ tuổi phục vụ:</span>
                    <strong className="text-gray-800 font-extrabold">
                      {programDetail ? `${programDetail.targetAgeFrom} → ${programDetail.targetAgeTo} tuổi` : `${classroomDetail.targetAgeFrom} → ${classroomDetail.targetAgeTo} tuổi`}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Ngôn ngữ áp dụng:</span>
                    <strong className="text-gray-800 font-extrabold">
                      {(programDetail?.language ?? classroomDetail.programLanguage) === 'Vietnamese' ? 'Tiếng Việt' : (programDetail?.language ?? classroomDetail.programLanguage)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Số bài giảng:</span>
                    <strong className="text-gray-800 font-extrabold">{lessons.length} bài học</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Học kỳ:</span>
                    <strong className="text-gray-700 font-extrabold">{classroomDetail.semesterName}</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}
      {/* Lesson Detail Modal */}
      {activeLessonDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="bg-white w-full max-w-2xl rounded-xl border border-slate-100 shadow-2xl p-8 relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveLessonDetail(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 shrink-0 mb-4">
              <div className="w-12 h-12 bg-[#4EACAF]/10 text-[#4EACAF] rounded-2xl flex items-center justify-center font-black text-lg">
                {activeLessonDetail.lessonOrder}
              </div>
              <div className="text-left">
                <span className="text-[10px] text-[#4EACAF] font-black uppercase tracking-wider block">Chi tiết bài học</span>
                <h3 className="text-xl font-black text-slate-800 leading-snug">{activeLessonDetail.lessonName}</h3>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-50 pt-5 text-left overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Mục tiêu rèn luyện (Kỹ năng đích):</span>
                  <span className="text-xs font-black text-[#4EACAF] bg-[#4EACAF]/5 px-2.5 py-1.5 rounded-lg block truncate" title={activeLessonDetail.targetSkill}>
                    🎯 {activeLessonDetail.targetSkill || 'Phát âm chuẩn'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Trạng thái buổi học:</span>
                  <span className={cn(
                    'text-xs font-black uppercase px-2.5 py-1.5 rounded-lg block w-fit',
                    activeLessonDetail.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  )}>
                    {activeLessonDetail.status === 'Active' ? 'Hoạt động tốt' : activeLessonDetail.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Thời lượng buổi học dự kiến:</span>
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {activeLessonDetail.estimatedDuration} phút
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Thang điểm tối đa:</span>
                  <span className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    {activeLessonDetail.maxScore ?? 100}đ
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Ngày cấu hình bài học:</span>
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {activeLessonDetail.createdAt ? new Date(activeLessonDetail.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Nội dung chi tiết chương trình học:</span>
                <p className="text-slate-600 text-sm font-semibold leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100/50 whitespace-pre-line">
                  {activeLessonDetail.description || 'Chưa có thông tin mô tả chi tiết cho bài học này.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-50 mt-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveLessonDetail(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-black rounded-2xl transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {activeExerciseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="bg-white w-full max-w-3xl rounded-[36px] border border-slate-100 shadow-2xl p-8 relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveExerciseDetail(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 shrink-0 mb-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-xl">
                🧩
              </div>
              <div className="text-left">
                <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider block">Chi tiết bài tập rèn luyện</span>
                <h3 className="text-xl font-black text-slate-800 leading-snug">{activeExerciseDetail.exerciseName}</h3>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-50 pt-5 text-left overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Kỹ năng mục tiêu:</span>
                  <span className="text-xs font-black text-[#4EACAF] bg-[#4EACAF]/5 px-2.5 py-1.5 rounded-lg block truncate" title={activeExerciseDetail.targetSkill}>
                    {activeExerciseDetail.targetSkill}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Phân loại bài:</span>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg block truncate" title={activeExerciseDetail.typeName || 'Chưa phân loại'}>
                    {activeExerciseDetail.typeName || 'Mặc định'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Độ khó:</span>
                  <span className={cn(
                    'text-xs font-black uppercase px-2.5 py-1.5 rounded-lg block w-fit',
                    activeExerciseDetail.difficultyLevel === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                      activeExerciseDetail.difficultyLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'
                  )}>
                    {activeExerciseDetail.difficultyLevel === 'Easy' ? 'Mức Dễ' : activeExerciseDetail.difficultyLevel === 'Medium' ? 'Bình thường' : 'Vượt khó'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Giới hạn thời gian (VR):</span>
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                    <Hourglass className="w-4 h-4 text-slate-400" />
                    {activeExerciseDetail.durationLimit} giây
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Ngôn ngữ:</span>
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    {activeExerciseDetail.language === 'Vietnamese' ? 'Tiếng Việt' : activeExerciseDetail.language}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Giáo viên biên soạn:</span>
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    {activeExerciseDetail.teacherName || 'Hệ thống'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Hướng dẫn luyện tập cho trẻ:</span>
                <p className="text-slate-600 text-xs font-semibold leading-relaxed bg-[#FFFDF5]/60 p-4 rounded-xl border border-yellow-100/50 whitespace-pre-line">
                  {activeExerciseDetail.instruction || 'Chưa có thông tin hướng dẫn cụ thể.'}
                </p>
              </div>

              {/* VR Questions List section */}
              <div className="space-y-2 border-t border-slate-50 pt-4">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                  Nội dung các câu hỏi thực tế trong bài tập ({activeExerciseDetail.questionCount || exerciseQuestions.length} câu):
                </span>
                {isQuestionsLoading ? (
                  <div className="py-6 text-center text-gray-400 font-semibold text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 text-[#4EACAF] animate-spin" />
                    <span>Đang tải nội dung câu hỏi...</span>
                  </div>
                ) : exerciseQuestions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Bài tập này chưa được cấu hình câu hỏi rèn luyện cụ thể.</p>
                ) : (
                  <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/30">
                    {exerciseQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-white p-3 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-extrabold text-[#4EACAF]">
                          <span>Câu {idx + 1}</span>
                          <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-slate-500 font-black">
                            {q.inputType === 'Speech' ? '🗣️ Phát âm/Nói' : '✍️ Nhập liệu'}
                          </span>
                        </div>
                        {q.instruction && (
                          <p className="text-[10px] text-slate-400 italic font-semibold">Gợi ý phát âm: {q.instruction}</p>
                        )}
                        <div className="space-y-1 font-bold">
                          <p className="text-slate-700">
                            <span className="text-slate-400 font-semibold">Từ/Câu đọc:</span> "{q.questionSentence}"
                          </p>
                          {q.answerSentence && (
                            <p className="text-emerald-700">
                              <span className="text-slate-400 font-semibold">Đáp án nhận diện:</span> "{q.answerSentence}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-50 mt-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveExerciseDetail(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-black rounded-2xl transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
