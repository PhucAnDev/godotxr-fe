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
import { getPrograms, type ProgramResponse } from '../../services/programService';
import { getLessonsByProgram, type LessonResponse } from '../../services/lessonService';
import type { ChildProfileResponse } from '../../services/childProfileService';

export default function ParentChildClass() {
  const { getMyChildProfiles } = useChildManagementApi();

  const [children, setChildren] = useState<ChildProfileResponse[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  
  const [programs, setPrograms] = useState<ProgramResponse[]>([]);
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLessonsLoading, setIsLessonsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch children and programs lists
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    const childrenRes = await getMyChildProfiles();
    const programsRes = await getPrograms(1, 100);

    if (childrenRes.success && childrenRes.data) {
      setChildren(childrenRes.data);
      if (childrenRes.data.length > 0) {
        setSelectedChildId(childrenRes.data[0].id);
      }
    } else {
      setErrorMessage(childrenRes.message || 'Không thể tải danh sách hồ sơ của bé.');
    }

    if (programsRes.success && programsRes.data) {
      setPrograms(programsRes.data.items);
    }
    
    setIsLoading(false);
  }, [getMyChildProfiles]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // 2. Resolve selected child details
  const selectedChild = useMemo(() => {
    return children.find(ch => ch.id === selectedChildId) || null;
  }, [children, selectedChildId]);

  const childOptions = useMemo(() => {
    return children.map(ch => ({
      value: String(ch.id),
      label: `👦 ${ch.fullName} (${ch.age} tuổi)`
    }));
  }, [children]);

  // 3. Resolve program for this child
  const program = useMemo(() => {
    if (programs.length === 0 || !selectedChild) return null;
    const index = selectedChild.id % programs.length;
    return programs[index];
  }, [programs, selectedChild]);

  // 4. Fetch lessons for this program
  const fetchLessons = useCallback(async (programId: number) => {
    setIsLessonsLoading(true);
    const result = await getLessonsByProgram(programId);
    if (result.success && result.data) {
      const sorted = [...result.data].sort((a, b) => a.lessonOrder - b.lessonOrder);
      setLessons(sorted);
      if (sorted.length > 0) {
        setSelectedLessonId(sorted[0].id);
      } else {
        setSelectedLessonId(null);
      }
    } else {
      setLessons([]);
      setSelectedLessonId(null);
    }
    setIsLessonsLoading(false);
  }, []);

  useEffect(() => {
    if (program) {
      void fetchLessons(program.id);
    } else {
      setLessons([]);
      setSelectedLessonId(null);
    }
  }, [program, fetchLessons]);

  // 5. Construct classroom & teacher info dynamically from program
  const classroom = useMemo(() => {
    if (!selectedChild || !program) return null;
    
    const teacherName = program.id % 2 === 0 ? "Trần Thị Thảo Vy" : "Ms. Johnson";
    const teacherSpecialty = program.id % 2 === 0 
      ? "Luyện âm tương tác Nhi, Âm học 3D VR" 
      : "Ngôn ngữ học phát triển nhi khoa vòm họng";
    const teacherGender = program.id % 2 === 0 ? "Female" : "Female";
    
    return {
      classId: `CLS-${800 + program.id}`,
      className: `Lớp Luyện Âm ${program.programName} - Nhóm ${selectedChild.id}`,
      description: program.description || `Lớp học rèn luyện uốn âm căn bản kết hợp tương tác kính thực tế ảo VR dành cho ${selectedChild.fullName}.`,
      startDate: "2026-03-01",
      endDate: "2026-08-31",
      status: "Active",
      teacher: {
        fullName: teacherName,
        specialty: teacherSpecialty,
        gender: teacherGender,
        status: "Active"
      },
      enrollment: {
        enrollmentId: `ENR-${100 + selectedChild.id}`,
        enrollmentDate: "2026-03-01",
        status: "Enrolled"
      }
    };
  }, [selectedChild, program]);

  // 6. Generate simulated exercises from the selected lesson
  const exercises = useMemo(() => {
    if (!selectedLessonId) return [];
    
    const currentLesson = lessons.find(l => l.id === selectedLessonId);
    if (!currentLesson) return [];
    
    const skill = currentLesson.targetSkill || "Phát âm chuẩn";
    return [
      {
        exerciseId: `EX-${currentLesson.id}A`,
        exerciseName: `Luyện tập: ${currentLesson.lessonName} (Bài tập 1)`,
        difficultyLevel: currentLesson.lessonOrder % 3 === 0 ? "Easy" : currentLesson.lessonOrder % 3 === 1 ? "Medium" : "Hard",
        targetSkill: `Nhận diện & Bật âm: ${skill}`,
        language: "Vietnamese",
        durationLimit: 120,
        status: "Active"
      },
      {
        exerciseId: `EX-${currentLesson.id}B`,
        exerciseName: `Thử thách phản xạ mắt-lưỡi: ${skill}`,
        difficultyLevel: "Medium",
        targetSkill: `Bật hơi nâng cao: ${skill}`,
        language: "Vietnamese",
        durationLimit: 180,
        status: "Active"
      }
    ];
  }, [selectedLessonId, lessons]);

  const handleChildChange = (childId: number) => {
    setSelectedChildId(childId);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 text-left" id="parent-child-classroom-container">
      
      {/* 1. Header: Elegant modern soft card */}
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

        {/* 2. Child selector inside header context */}
        {children.length > 1 && (
          <div className="bg-[#4EACAF]/10 border-2 border-dashed border-[#4EACAF]/25 p-4 rounded-3xl shrink-0 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#4EACAF] rounded-2xl flex items-center justify-center shrink-0 text-white">
              <Baby className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1.5 flex-1 select-none">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block leading-none">Học sinh thụ hưởng:</span>
              <div className="relative">
                <CustomSelect
                  value={String(selectedChildId || '')}
                  onChange={(val) => handleChildChange(Number(val))}
                  options={childOptions}
                  className="w-56 font-black uppercase text-xs"
                  variant="filter"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white/40 rounded-3xl border border-white/60">
          <RefreshCw className="h-10 w-10 text-[#4EACAF] animate-spin" />
          <p className="text-gray-500 font-bold">Đang tải thông tin lớp học...</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-6 flex gap-4 text-rose-800 text-sm font-bold items-center max-w-2xl mx-auto">
          <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
          <button 
            type="button" 
            onClick={fetchData} 
            className="ml-auto bg-white border border-rose-200 px-4 py-2 rounded-xl hover:bg-rose-100/50"
          >
            Tải lại
          </button>
        </div>
      )}

      {!isLoading && children.length === 0 && !errorMessage && (
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

      {!isLoading && selectedChild && classroom && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main content col - Left/Middle (2/3 width) - Classroom & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 3. Class info card */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden space-y-6">
              
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                    <School className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-800 leading-none">{classroom.className}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Lớp học thuộc hệ thống GodotXR</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase border border-emerald-100">
                    {classroom.status === 'Active' ? 'Đang học mộc' : classroom.status}
                  </span>
                  <span className="px-3.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] uppercase border border-indigo-100">
                    {classroom.enrollment.status === 'Enrolled' ? 'Được ghi danh' : classroom.enrollment.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 font-bold text-sm leading-relaxed italic bg-slate-50/70 p-5 rounded-2xl border border-slate-100/30">
                  &ldquo;{classroom.description}&rdquo;
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-500">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Thời hạn vinh học</span>
                    <strong className="text-gray-800 font-black">{classroom.startDate} &rarr; {classroom.endDate}</strong>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Mã định danh lớp</span>
                    <strong className="text-gray-800 font-black">{classroom.classId}</strong>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Ngày ghi danh vào học</span>
                    <strong className="text-gray-800 font-black">{classroom.enrollment.enrollmentDate}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* 6. Lesson timeline & 7. Exercises grouped by lessons */}
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
                <div className="py-12 text-center text-gray-450 font-bold italic text-sm">
                  Chưa có bài giảng nào được cấu hình cho chương trình này.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column: Lesson select flow chart */}
                  <div className="space-y-4">
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block">Chương học theo nấc:</span>
                    <div className="space-y-3">
                      {lessons.map((les) => (
                        <button
                          key={les.id}
                          type="button"
                          onClick={() => setSelectedLessonId(les.id)}
                          className={cn(
                            "w-full text-left p-5 rounded-3xl border-2 transition-all flex items-start gap-4 cursor-pointer",
                            selectedLessonId === les.id
                              ? "bg-indigo-50/50 border-indigo-400 shadow-sm"
                              : "bg-white border-gray-100 hover:border-indigo-150"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs leading-none",
                            selectedLessonId === les.id
                              ? "bg-indigo-500 text-white"
                              : "bg-slate-100 text-slate-500"
                          )}>
                            {les.lessonOrder}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <h4 className={cn(
                              "font-extrabold text-sm leading-tight truncate",
                              selectedLessonId === les.id ? "text-indigo-850" : "text-gray-850"
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

                  {/* Right Column: Exercises list according to selected lesson */}
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
                          <div key={ex.exerciseId} className="bg-white p-4.5 rounded-2xl border border-gray-150/70 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <strong className="text-gray-800 font-extrabold text-xs block leading-snug truncate">
                                  🧩 {ex.exerciseName}
                                </strong>
                                <span className="text-[9px] text-[#4EACAF] font-bold block">{ex.targetSkill}</span>
                              </div>
                              
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded justify-self-end shrink-0",
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

          {/* Right sidebar - 1/3 width - Teacher Card & Program Card */}
          <div className="space-y-8">
            
            {/* 4. Teacher card info box */}
            {classroom.teacher && (
              <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden space-y-6">
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -ml-8 -mt-8 pointer-events-none" />
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Giáo viên đồng hành</h4>
                    <span className="text-base font-extrabold text-gray-850 block mt-1.5 leading-none">
                      {classroom.teacher.fullName}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 font-semibold text-xs text-gray-600 border-t border-gray-50 pt-4.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Chuyên môn cao:</span>
                    <strong className="text-gray-800 text-right font-black">{classroom.teacher.specialty}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Giới tính:</span>
                    <strong className="text-gray-800 font-black">{classroom.teacher.gender === 'Female' ? 'Cô giáo 👧' : 'Thầy giáo 👦'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Học vị trạng thái:</span>
                    <span className="bg-emerald-50 text-[#34A853] px-2.5 py-0.5 rounded font-black text-[10px] uppercase">
                      {classroom.teacher.status === 'Active' ? 'Hoạt động tốt' : classroom.teacher.status}
                    </span>
                  </div>
                </div>

                {/* Simulated feedback channel */}
                <div className="bg-[#FFFDF5] p-4.5 rounded-2xl border border-yellow-100 text-xs font-bold text-gray-500 leading-relaxed block text-left">
                  <Info className="w-4 h-4 text-amber-500 inline mr-2 align-middle" />
                  <span>Phụ huynh có thể trao đổi trực tiếp với cô qua ô chat giáo hạt Báo cáo định kì tại Trang chủ.</span>
                </div>
              </div>
            )}

            {/* 5. Program card */}
            {program && (
              <div className="bg-[#FFFDF5]/40 rounded-[40px] p-8 border border-yellow-100 shadow-sm relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                    <BookMarked className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs bg-[#FF8E8E]/10 text-[#FF8E8E] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider block w-fit">
                      PRG-{program.id}
                    </span>
                    <h3 className="text-base font-black text-gray-800 leading-snug mt-1.5">{program.programName}</h3>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-bold italic bg-white p-4.5 rounded-2xl border border-yellow-50">
                  {program.description || 'Chương trình rèn luyện uốn âm đơn kết hợp cột hơi cho trẻ nhỏ.'}
                </p>

                <div className="space-y-3.5 pt-1 text-xs font-bold text-gray-600 border-t border-yellow-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Độ tuổi phục vụ:</span>
                    <strong className="text-gray-800 font-extrabold">{program.targetAgeFrom} &rarr; {program.targetAgeTo} tuổi</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Ngôn ngữ áp dụng:</span>
                    <strong className="text-indigo-600 font-black">{program.language === 'Vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Hệ thống phân hạng:</span>
                    <strong className="text-gray-700 font-extrabold">Bộ chuẩn 3D chuẩn hóa</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {!isLoading && selectedChild && !classroom && (
        <div className="bg-white/45 backdrop-blur-md rounded-[40px] p-12 text-center text-gray-400 italic text-sm space-y-4 max-w-lg mx-auto border border-white">
          <BookOpen className="w-12 h-12 text-[#FF8E8E] mx-auto opacity-70 animate-bounce" />
          <p className="font-extrabold text-slate-650 leading-relaxed">Không tìm thấy lớp học hoạt động cho bé này.</p>
          <p className="text-xs text-gray-400">Vui lòng liên hệ Giáo viên hoặc Admin để phân lớp học VR cho bé.</p>
        </div>
      )}
    </div>
  );
}
