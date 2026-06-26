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
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import CustomSelect from '../../components/common/CustomSelect';
import { useChildManagementApi } from '../../hooks/useChildManagementApi';
import { getLessonsByProgram, type LessonResponse } from '../../services/lessonService';
import type { ChildProfileResponse } from '../../services/childProfileService';
import { getEnrollmentsByChild, type EnrollmentResponse } from '../../services/enrollmentService';
import { getClassroomById, type ClassroomResponse } from '../../services/classroomService';

export default function ParentChildClass() {
  const { getMyChildProfiles } = useChildManagementApi();

  const [children, setChildren] = useState<ChildProfileResponse[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  
  // Real API data
  const [enrollment, setEnrollment] = useState<EnrollmentResponse | null>(null);
  const [classroomDetail, setClassroomDetail] = useState<ClassroomResponse | null>(null);
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isClassLoading, setIsClassLoading] = useState(false);
  const [isLessonsLoading, setIsLessonsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noEnrollment, setNoEnrollment] = useState(false);

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
    setLessons([]);
    setSelectedLessonId(null);
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
      // Fetch lessons for this program
      if (clsRes.data.programId) {
        setIsLessonsLoading(true);
        const lessonsRes = await getLessonsByProgram(clsRes.data.programId);
        if (lessonsRes.success && lessonsRes.data) {
          const sorted = [...lessonsRes.data].sort((a, b) => a.lessonOrder - b.lessonOrder);
          setLessons(sorted);
          if (sorted.length > 0) setSelectedLessonId(sorted[0].id);
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

  // 4. Simulated exercises from real lesson data
  const exercises = useMemo(() => {
    if (!selectedLessonId) return [];
    const currentLesson = lessons.find(l => l.id === selectedLessonId);
    if (!currentLesson) return [];
    const skill = currentLesson.targetSkill || 'Phát âm chuẩn';
    return [
      {
        exerciseId: `EX-${currentLesson.id}A`,
        exerciseName: `Luyện tập: ${currentLesson.lessonName} (Bài tập 1)`,
        difficultyLevel: currentLesson.lessonOrder % 3 === 0 ? 'Easy' : currentLesson.lessonOrder % 3 === 1 ? 'Medium' : 'Hard',
        targetSkill: `Nhận diện & Bật âm: ${skill}`,
        language: 'Vietnamese',
        durationLimit: 120,
        status: 'Active'
      },
      {
        exerciseId: `EX-${currentLesson.id}B`,
        exerciseName: `Thử thách phản xạ mắt-lưỡi: ${skill}`,
        difficultyLevel: 'Medium',
        targetSkill: `Bật hơi nâng cao: ${skill}`,
        language: 'Vietnamese',
        durationLimit: 180,
        status: 'Active'
      }
    ];
  }, [selectedLessonId, lessons]);

  const handleChildChange = (childId: number) => {
    setSelectedChildId(childId);
  };

  const isPageLoading = isLoading || isClassLoading;

  // Determine classroom display values (use classroomDetail if available, fall back to enrollment data)
  const displayClassName = classroomDetail?.className ?? enrollment?.className ?? '';
  const displayDescription = classroomDetail?.description ?? `Lớp học VR dành cho ${selectedChild?.fullName ?? 'bé'}.`;
  const displayStartDate = classroomDetail?.startDate ? classroomDetail.startDate.slice(0, 10) : '—';
  const displayEndDate = classroomDetail?.endDate ? classroomDetail.endDate.slice(0, 10) : '—';
  const displayClassId = classroomDetail ? `CLS-${classroomDetail.id}` : `CLS-${enrollment?.classId ?? '—'}`;
  const displayStatus = classroomDetail?.status ?? 'Active';
  const displayTeacherName = classroomDetail?.teacherName ?? '—';
  const displayTeacherSpecialty = classroomDetail?.teacherSpecialty ?? '—';
  const displayProgramName = classroomDetail?.programName ?? '—';
  const displayEnrollmentDate = enrollment?.enrollmentDate ? enrollment.enrollmentDate.slice(0, 10) : '—';
  const displayEnrollmentStatus = enrollment?.status ?? '—';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 text-left" id="parent-child-classroom-container">
      
      {/* Header */}
      <div className="bg-white/45 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs bg-[#4EACAF]/10 text-[#4EACAF] px-3.5 py-1 rounded-full font-black uppercase tracking-wider">
              Khóa rèn luyện VR
            </span>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">
              Phụ huynh giám sát
            </span>
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">
            Lớp Học Của Con
          </h1>
          <p className="text-gray-500 font-bold text-sm">
            Theo dõi lớp học hoạt động, giáo viên đảm trách và hành trình bài bản bài học
          </p>
        </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="bg-[#4EACAF]/10 border-2 border-dashed border-[#4EACAF]/25 p-4 rounded-3xl shrink-0 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#4EACAF] rounded-2xl flex items-center justify-center shrink-0 text-white">
              <Baby className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1 select-none">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block leading-none">Học sinh thụ hưởng:</span>
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
        <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-6 flex gap-4 text-rose-800 text-sm font-bold items-center max-w-2xl mx-auto">
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
        <div className="bg-white rounded-[32px] p-12 text-center max-w-xl mx-auto border border-gray-150 shadow-sm space-y-4">
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
        <div className="bg-white rounded-[32px] p-12 text-center max-w-xl mx-auto border border-gray-150 shadow-sm space-y-4">
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
          <div className="lg:col-span-2 space-y-8">
            
            {/* Class info card */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
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
                  <span className="px-3.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] uppercase border border-indigo-100">
                    {displayEnrollmentStatus === 'Active' ? 'Đã ghi danh' : displayEnrollmentStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 font-bold text-sm leading-relaxed italic bg-slate-50/70 p-5 rounded-2xl border border-slate-100/30">
                  &ldquo;{displayDescription}&rdquo;
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-500">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Thời hạn học</span>
                    <strong className="text-gray-800 font-black">{displayStartDate} &rarr; {displayEndDate}</strong>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Mã định danh lớp</span>
                    <strong className="text-gray-800 font-black">{displayClassId}</strong>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Ngày ghi danh vào học</span>
                    <strong className="text-gray-800 font-black">{displayEnrollmentDate}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson timeline & exercises */}
            <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8 relative">
              {isLessonsLoading && (
                <div className="absolute top-4 right-4 animate-spin text-[#4EACAF]">
                  <RefreshCw className="w-4 h-4" />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-none italic">Sơ đồ chủ đề & tiến trình học</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">Danh sách hệ thống bài học và các ải phụ mẫu bật âm</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left: Lesson list */}
                  <div className="space-y-4">
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block">Chương học theo nấc:</span>
                    <div className="space-y-3">
                      {lessons.map((les) => (
                        <button
                          key={les.id}
                          type="button"
                          onClick={() => setSelectedLessonId(les.id)}
                          className={cn(
                            'w-full text-left p-5 rounded-3xl border-2 transition-all flex items-start gap-4 cursor-pointer',
                            selectedLessonId === les.id
                              ? 'bg-indigo-50/50 border-indigo-400 shadow-sm'
                              : 'bg-white border-gray-100 hover:border-indigo-150'
                          )}
                        >
                          <div className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs leading-none',
                            selectedLessonId === les.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                          )}>
                            {les.lessonOrder}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <h4 className={cn(
                              'font-extrabold text-sm leading-tight truncate',
                              selectedLessonId === les.id ? 'text-indigo-700' : 'text-gray-800'
                            )}>
                              {les.lessonName}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-semibold line-clamp-1">{les.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {les.targetSkill && (
                                <span className="text-[8px] uppercase font-black bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                  {les.targetSkill}
                                </span>
                              )}
                              <span className="text-[8px] uppercase font-black text-gray-400 flex items-center gap-1 shrink-0">
                                <Clock className="w-2.5 h-2.5" />
                                {les.estimatedDuration} phút
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Exercises for selected lesson */}
                  <div className="bg-[#FDFCF6]/50 rounded-[32px] p-6 border-2 border-dashed border-[#F2ECD8] space-y-5">
                    <div className="border-b border-[#F2ECD8] pb-4">
                      <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider block">Chi tiết ải tập luyện (Exercises) trong bài:</span>
                      <h4 className="text-base font-black text-gray-800 leading-tight italic mt-1">
                        Chủ đề bài: {lessons.find(l => l.id === selectedLessonId)?.lessonOrder}. {lessons.find(l => l.id === selectedLessonId)?.lessonName}
                      </h4>
                    </div>

                    <div className="space-y-3.5">
                      {exercises.length === 0 ? (
                        <div className="py-6 text-center text-gray-400 italic font-semibold text-xs leading-relaxed space-y-2">
                          <Compass className="w-8 h-8 text-[#FFA800] mx-auto opacity-40 animate-spin" />
                          <p>Bé không có bài tập 3D nào đặc biệt trong chương này.</p>
                        </div>
                      ) : (
                        exercises.map((ex) => (
                          <div key={ex.exerciseId} className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <strong className="text-gray-800 font-extrabold text-xs block leading-snug truncate">
                                  🧩 {ex.exerciseName}
                                </strong>
                                <span className="text-[9px] text-[#4EACAF] font-bold block">{ex.targetSkill}</span>
                              </div>
                              
                              <span className={cn(
                                'text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0',
                                ex.difficultyLevel === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                                ex.difficultyLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'
                              )}>
                                {ex.difficultyLevel === 'Easy' ? 'Mức Dễ' : ex.difficultyLevel === 'Medium' ? 'Bình thường' : 'Vượt khó'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold border-t border-slate-50 pt-2 leading-none">
                              <span>Ngôn ngữ: <strong className="text-gray-600">{ex.language}</strong></span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Hourglass className="w-3 h-3" />
                                {ex.durationLimit}s giới hạn
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Right sidebar - Teacher & Program */}
          <div className="space-y-8">
            
            {/* Teacher card */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -ml-8 -mt-8 pointer-events-none" />
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Giáo viên đồng hành</h4>
                  <span className="text-base font-extrabold text-gray-800 block mt-1.5 leading-none">
                    {displayTeacherName}
                  </span>
                </div>
              </div>

              <div className="space-y-3 font-semibold text-xs text-gray-600 border-t border-gray-50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Chuyên môn:</span>
                  <strong className="text-gray-800 text-right font-black max-w-[160px] text-right">{displayTeacherSpecialty}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Mã lớp:</span>
                  <strong className="text-gray-800 font-black">{displayClassId}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Trạng thái lớp:</span>
                  <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded font-black text-[10px] uppercase">
                    {displayStatus === 'Active' ? 'Hoạt động tốt' : displayStatus}
                  </span>
                </div>
              </div>

              <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-yellow-100 text-xs font-bold text-gray-500 leading-relaxed">
                <Info className="w-4 h-4 text-amber-500 inline mr-2 align-middle" />
                <span>Phụ huynh có thể trao đổi trực tiếp với cô qua ô chat giáo hạt Báo cáo định kì tại Trang chủ.</span>
              </div>
            </div>

            {/* Program card */}
            {classroomDetail && (
              <div className="bg-[#FFFDF5]/40 rounded-[40px] p-8 border border-yellow-100 shadow-sm relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                    <BookMarked className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs bg-[#FF8E8E]/10 text-[#FF8E8E] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider block w-fit">
                      PRG-{classroomDetail.programId}
                    </span>
                    <h3 className="text-base font-black text-gray-800 leading-snug mt-1.5">{classroomDetail.programName}</h3>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-bold italic bg-white p-4 rounded-2xl border border-yellow-50">
                  {classroomDetail.description || 'Chương trình rèn luyện uốn âm đơn kết hợp cột hơi cho trẻ nhỏ.'}
                </p>

                <div className="space-y-3 pt-1 text-xs font-bold text-gray-600 border-t border-yellow-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Độ tuổi phục vụ:</span>
                    <strong className="text-gray-800 font-extrabold">{classroomDetail.targetAgeFrom} &rarr; {classroomDetail.targetAgeTo} tuổi</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Ngôn ngữ áp dụng:</span>
                    <strong className="text-indigo-600 font-black">{classroomDetail.programLanguage === 'Vietnamese' ? 'Tiếng Việt' : classroomDetail.programLanguage}</strong>
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
    </div>
  );
}
