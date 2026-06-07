import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Baby, 
  School, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  Compass, 
  Flame, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  Sparkles, 
  Dribbble, 
  Cpu, 
  Award,
  ChevronDown,
  BookMarked,
  Hourglass,
  Gamepad2,
  FileCheck2,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';

// DB Interfaces based on the schemas provided
export interface Child {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Status: 'Active' | 'Inactive';
}

export interface Enrollment {
  EnrollmentId: string;
  ChildId: string;
  ClassId: string;
  EnrollmentDate: string;
  Status: 'Enrolled' | 'Completed' | 'Pending';
}

export interface Classroom {
  ClassId: string;
  TeacherId: string;
  ProgramId: string;
  ClassName: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Status: 'Active' | 'Upcoming' | 'Closed';
}

export interface Teacher {
  TeacherId: string;
  FullName: string;
  Specialty: string;
  Gender: 'Male' | 'Female' | 'Other';
  Status: 'Active' | 'Inactive';
}

export interface Program {
  ProgramId: string;
  ProgramName: string;
  Description: string;
  TargetAgeFrom: number;
  TargetAgeTo: number;
  Language: 'Vietnamese' | 'English' | 'Bilingual';
  Status: 'Active' | 'Deprecated';
}

export interface Lesson {
  LessonId: string;
  ProgramId: string;
  LessonName: string;
  LessonOrder: number;
  Description: string;
  TargetSkill: string;
  EstimatedDuration: number; // in minutes
  Status: 'Active' | 'Draft';
}

export interface Exercise {
  ExerciseId: string;
  LessonId: string;
  ExerciseName: string;
  DifficultyLevel: 'Easy' | 'Medium' | 'Hard';
  TargetSkill: string;
  Language: 'Vietnamese' | 'English' | 'Bilingual';
  DurationLimit: number; // in seconds
  Status: 'Active' | 'Draft';
}

// ----------------------------------------------------
// COMPLETE MOCK DATABASES REFLECTING THE CORRESPONDING DATABASE SCHEMAS
// ----------------------------------------------------

const MOCK_CHILDREN: Child[] = [
  { 
    ChildId: 'CHD-001', 
    ParentUserId: 'USR-P1', 
    FullName: 'Nguyễn Tiến Minh (Leo)', 
    Age: 8, 
    Gender: 'Male', 
    LearningLevel: 'Bậc 1 - Phát âm đơn VR', 
    Status: 'Active'
  },
  { 
    ChildId: 'CHD-002', 
    ParentUserId: 'USR-P1', 
    FullName: 'Nguyễn Minh Thư (Mimi)', 
    Age: 7, 
    Gender: 'Female', 
    LearningLevel: 'Bậc 3 - Diễn đạt lưu loát VR', 
    Status: 'Active'
  }
];

const MOCK_ENROLLMENTS: Enrollment[] = [
  { 
    EnrollmentId: 'ENR-101', 
    ChildId: 'CHD-001', 
    ClassId: 'CLS-801', 
    EnrollmentDate: '2026-03-01', 
    Status: 'Enrolled' 
  },
  { 
    EnrollmentId: 'ENR-102', 
    ChildId: 'CHD-002', 
    ClassId: 'CLS-802', 
    EnrollmentDate: '2026-04-15', 
    Status: 'Enrolled' 
  }
];

const MOCK_CLASSROOMS: Classroom[] = [
  { 
    ClassId: 'CLS-801', 
    TeacherId: 'TCH-301', 
    ProgramId: 'PRG-501', 
    ClassName: 'Lớp Luyện Âm Cơ Bản - Sáng Thứ 2 & 4', 
    Description: 'Lớp học bổ trợ phát âm nguyên âm đơn kết hợp tương tác cử chỉ tay 3D qua kính thực tế ảo độc lập.', 
    StartDate: '2026-03-01', 
    EndDate: '2026-08-31', 
    Status: 'Active' 
  },
  { 
    ClassId: 'CLS-802', 
    TeacherId: 'TCH-302', 
    ProgramId: 'PRG-502', 
    ClassName: 'Lớp Chuyên Đề Chữa Ngọng Gió S-X', 
    Description: 'Tập trung làm chủ cơ lưỡi, áp lực hơi từ họng và điều phối lực môi khi phát dải âm gió S chuẩn cổ kính.', 
    StartDate: '2026-04-10', 
    EndDate: '2026-10-10', 
    Status: 'Active' 
  }
];

const MOCK_TEACHERS: Teacher[] = [
  { 
    TeacherId: 'TCH-301', 
    FullName: 'Trần Thị Thảo Vy', 
    Specialty: 'Luyện âm tương tác Nhi, Âm học 3D VR', 
    Gender: 'Female', 
    Status: 'Active' 
  },
  { 
    TeacherId: 'TCH-302', 
    FullName: 'Ms. Johnson', 
    Specialty: 'Ngôn ngữ học phát triển nhi khoa vòm họng', 
    Gender: 'Female', 
    Status: 'Active' 
  }
];

const MOCK_PROGRAMS: Program[] = [
  { 
    ProgramId: 'PRG-501', 
    ProgramName: 'AeroPhoneme - Phát âm căn bản VR', 
    Description: 'Chương trình rèn luyện uốn âm đơn và bổ trợ thể lực cột hơi cho trẻ từ 7 đến 11 tuổi.', 
    TargetAgeFrom: 7, 
    TargetAgeTo: 11, 
    Language: 'Vietnamese', 
    Status: 'Active' 
  },
  { 
    ProgramId: 'PRG-502', 
    ProgramName: 'Bilingual Phonics Mastery VR - Bậc cao', 
    Description: 'Anh - Việt Song ngữ tối ưu kết hợp bài thơ dải âm đối lưu, tăng cường liên phản xạ mắt-lưỡi cho trẻ từ 7 đến 11 tuổi.', 
    TargetAgeFrom: 7, 
    TargetAgeTo: 11, 
    Language: 'Bilingual', 
    Status: 'Active' 
  }
];

const MOCK_LESSONS: Lesson[] = [
  // Lessons for PRG-501 (AeroPhoneme)
  { 
    LessonId: 'LES-601', 
    ProgramId: 'PRG-501', 
    LessonName: 'Bài ca Đóng Cực & Mở Cực hàm nguyên âm đơn O-A-U', 
    LessonOrder: 1, 
    Description: 'Lấy hơi từ đáy vòm họng mộc, hé môi góc 45 độ phối hợp nhảy rít hơi động 3D.', 
    TargetSkill: 'Nhận diện & Bật tròn nguyên âm đơn O, A, U', 
    EstimatedDuration: 20, 
    Status: 'Active' 
  },
  { 
    LessonId: 'LES-602', 
    ProgramId: 'PRG-501', 
    LessonName: 'Bật hơi bật bật mút vòm phụ âm chặn B-P song hốc', 
    LessonOrder: 2, 
    Description: 'Bé mím môi giữ mộc khí trong 3 giây trước khi nhả dồn lực vang miệng.', 
    TargetSkill: 'Kiểm soát luồng khí hai môi răng khép', 
    EstimatedDuration: 25, 
    Status: 'Active' 
  },
  { 
    LessonId: 'LES-603', 
    ProgramId: 'PRG-501', 
    LessonName: 'Uốn hàm uốn lưỡi chữ C - K mộc họng sau', 
    LessonOrder: 3, 
    Description: 'Hạ sâu gốc lưỡi để luồng hơi phát từ đáy cuống phổi đứng thẳng âm sắc sạch.', 
    TargetSkill: 'Phát âm họng sau (C, K)', 
    EstimatedDuration: 22, 
    Status: 'Active' 
  },

  // Lessons for PRG-502 (Bilingual Phonics)
  { 
    LessonId: 'LES-604', 
    ProgramId: 'PRG-502', 
    LessonName: 'The Magic S-X Whispering Wind Challenge', 
    LessonOrder: 1, 
    Description: 'Clenching teeth properly and letting soft air pass through without lisping on phonemes S and X.', 
    TargetSkill: 'Dental fricatives & Sibilant airflow', 
    EstimatedDuration: 30, 
    Status: 'Active' 
  },
  { 
    LessonId: 'LES-605', 
    ProgramId: 'PRG-502', 
    LessonName: 'Vòng đấu âm kép TR-GI tranh đấu ảo', 
    LessonOrder: 2, 
    Description: 'Phát âm mộc linh động cụm dải phức hợp kết ghép tịnh tiến nhanh gọn.', 
    TargetSkill: 'Complex consonant clusters', 
    EstimatedDuration: 35, 
    Status: 'Active' 
  }
];

const MOCK_EXERCISES: Exercise[] = [
  // Exercises for LES-601
  { 
    ExerciseId: 'EX-A1', 
    LessonId: 'LES-601', 
    ExerciseName: 'Chào các bạn bò sữa nông trại vàng', 
    DifficultyLevel: 'Easy', 
    TargetSkill: 'Tròn nguyên âm O', 
    Language: 'Vietnamese', 
    DurationLimit: 120, 
    Status: 'Active' 
  },
  { 
    ExerciseId: 'EX-A2', 
    LessonId: 'LES-601', 
    ExerciseName: 'Lấy hơi thổi bong bóng cùng Chú Ếch Con', 
    DifficultyLevel: 'Easy', 
    TargetSkill: 'Giữ mộc hơi hít vòm họng', 
    Language: 'Vietnamese', 
    DurationLimit: 180, 
    Status: 'Active' 
  },

  // Exercises for LES-602
  { 
    ExerciseId: 'EX-B1', 
    LessonId: 'LES-602', 
    ExerciseName: 'Bật hơi nổ bóng xà phòng Bông bóng màu', 
    DifficultyLevel: 'Medium', 
    TargetSkill: 'Lực nén khí môi bộc phát', 
    Language: 'Vietnamese', 
    DurationLimit: 150, 
    Status: 'Active' 
  },

  // Exercises for LES-603
  { 
    ExerciseId: 'EX-C1', 
    LessonId: 'LES-603', 
    ExerciseName: 'Vang trống tùng dinh cùng chú chim Ka-Ka', 
    DifficultyLevel: 'Medium', 
    TargetSkill: 'Chuẩn gốc họng C, K', 
    Language: 'Vietnamese', 
    DurationLimit: 160, 
    Status: 'Active' 
  },

  // Exercises for LES-604 (S-X wind)
  { 
    ExerciseId: 'EX-D1', 
    LessonId: 'LES-604', 
    ExerciseName: 'The Whispering Forest Trees (Ssss)', 
    DifficultyLevel: 'Hard', 
    TargetSkill: 'Control S air velocity', 
    Language: 'Bilingual', 
    DurationLimit: 200, 
    Status: 'Active' 
  },
  { 
    ExerciseId: 'EX-D2', 
    LessonId: 'LES-604', 
    ExerciseName: 'Xáo động xào xạc lá rơi vàng ngoài sân', 
    DifficultyLevel: 'Hard', 
    TargetSkill: 'Phổ âm gió X tịnh tiến', 
    Language: 'Vietnamese', 
    DurationLimit: 180, 
    Status: 'Active' 
  }
];

interface ParentChildClassProps {
  onNavigate?: (screen: string) => void;
}

export default function ParentChildClass({ onNavigate }: ParentChildClassProps) {
  // State for child selector
  const [selectedChildId, setSelectedChildId] = useState<string>('CHD-001');

  // Currently selected Child object
  const currentChild = useMemo(() => {
    return MOCK_CHILDREN.find(ch => ch.ChildId === selectedChildId) || MOCK_CHILDREN[0];
  }, [selectedChildId]);

  // Retrieve enrollment entry for child
  const enrollment = useMemo(() => {
    return MOCK_ENROLLMENTS.find(enr => enr.ChildId === currentChild.ChildId);
  }, [currentChild]);

  // Retrieve classroom matching enrollment
  const classroom = useMemo(() => {
    if (!enrollment) return null;
    return MOCK_CLASSROOMS.find(cls => cls.ClassId === enrollment.ClassId) || null;
  }, [enrollment]);

  // Retrieve teacher for classroom
  const teacher = useMemo(() => {
    if (!classroom) return null;
    return MOCK_TEACHERS.find(t => t.TeacherId === classroom.TeacherId) || null;
  }, [classroom]);

  // Retrieve learning program
  const program = useMemo(() => {
    if (!classroom) return null;
    return MOCK_PROGRAMS.find(p => p.ProgramId === classroom.ProgramId) || null;
  }, [classroom]);

  // Filter lessons matching program
  const lessons = useMemo(() => {
    if (!program) return [];
    return MOCK_LESSONS.filter(les => les.ProgramId === program.ProgramId)
      .sort((a, b) => a.LessonOrder - b.LessonOrder);
  }, [program]);

  // Selected lesson to show its exercises details
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Set the first lesson as default selected when lessons change
  React.useEffect(() => {
    if (lessons.length > 0) {
      setSelectedLessonId(lessons[0].LessonId);
    } else {
      setSelectedLessonId(null);
    }
  }, [lessons]);

  // Exercises filtered by selected lesson
  const exercises = useMemo(() => {
    if (!selectedLessonId) return [];
    return MOCK_EXERCISES.filter(ex => ex.LessonId === selectedLessonId);
  }, [selectedLessonId]);

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
        <div className="bg-[#4EACAF]/10 border-2 border-dashed border-[#4EACAF]/25 p-4 rounded-3xl shrink-0 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#4EACAF] rounded-2xl flex items-center justify-center shrink-0 text-white">
            <Baby className="w-5.5 h-5.5" />
          </div>
          <div className="space-y-1.5 flex-1 select-none">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block leading-none">Học sinh thụ hưởng:</span>
            <div className="relative min-w-[200px]">
              <select
                value={selectedChildId}
                onChange={(e) => {
                  setSelectedChildId(e.target.value);
                }}
                className="w-full bg-transparent border-0 font-black text-[#264E50] text-sm pr-8 outline-none cursor-pointer focus:ring-0 leading-tight"
              >
                {MOCK_CHILDREN.map(ch => (
                  <option key={ch.ChildId} value={ch.ChildId}>👦 {ch.FullName} ({ch.Age} tuổi)</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4EACAF] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {classroom ? (
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
                    <h3 className="text-xl font-extrabold text-gray-800 leading-none">{classroom.ClassName}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Lớp học thuộc hệ thống GodotXR</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase border border-emerald-100">
                    {classroom.Status === 'Active' ? 'Đang học mộc' : classroom.Status}
                  </span>
                  <span className="px-3.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] uppercase border border-indigo-100">
                    {enrollment?.Status === 'Enrolled' ? 'Được ghi danh' : enrollment?.Status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 font-bold text-sm leading-relaxed italic bg-slate-50/70 p-5 rounded-2xl border border-slate-100/30">
                  &ldquo;{classroom.Description}&rdquo;
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-500">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Thời hạn vinh học</span>
                    <strong className="text-gray-800 font-black">{classroom.StartDate} &rarr; {classroom.EndDate}</strong>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Mã định danh lớp</span>
                    <strong className="text-gray-800 font-black">{classroom.ClassId}</strong>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Ngày ghi danh vào học</span>
                    <strong className="text-gray-800 font-black">{enrollment?.EnrollmentDate}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* 6. Lesson timeline & 7. Exercises grouped by lessons */}
            <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-none italic">Sơ đồ chủ đề & tiến trình học</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">Danh sách hệ thống bài học và các ải phụ mẫu bật âm</p>
                </div>

                <span className="text-xs bg-[#4EACAF]/10 text-[#4EACAF] px-3.5 py-1 rounded-full font-black">
                  Tổng sổ: {lessons.length} Chương buổi
                </span>
              </div>

              {lessons.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Chưa có bài giảng nào được cấu hình cho chương trình này.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column: Lesson select flow chart */}
                  <div className="space-y-4">
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block">Chương học theo nấc:</span>
                    <div className="space-y-3">
                      {lessons.map((les) => (
                        <button
                          key={les.LessonId}
                          onClick={() => setSelectedLessonId(les.LessonId)}
                          className={cn(
                            "w-full text-left p-5 rounded-3xl border-2 transition-all flex items-start gap-4 cursor-pointer",
                            selectedLessonId === les.LessonId
                              ? "bg-indigo-50/50 border-indigo-400 shadow-sm"
                              : "bg-white border-gray-100 hover:border-indigo-150"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs leading-none",
                            selectedLessonId === les.LessonId
                              ? "bg-indigo-500 text-white"
                              : "bg-slate-100 text-slate-500"
                          )}>
                            {les.LessonOrder}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <h4 className={cn(
                              "font-extrabold text-sm leading-tight truncate",
                              selectedLessonId === les.LessonId ? "text-indigo-850" : "text-gray-850"
                            )}>
                              {les.LessonName}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-semibold line-clamp-1">{les.Description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[8px] uppercase font-black bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded">
                                {les.TargetSkill}
                              </span>
                              <span className="text-[8px] uppercase font-black text-gray-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {les.EstimatedDuration} phút
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
                        Chủ đề bài: {lessons.find(l => l.LessonId === selectedLessonId)?.LessonOrder}. {lessons.find(l => l.LessonId === selectedLessonId)?.LessonName}
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
                          <div key={ex.ExerciseId} className="bg-white p-4.5 rounded-2xl border border-gray-150/70 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <strong className="text-gray-800 font-extrabold text-xs block leading-snug truncate">
                                  🧩 {ex.ExerciseName}
                                </strong>
                                <span className="text-[9px] text-[#4EACAF] font-bold block">{ex.TargetSkill}</span>
                              </div>
                              
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded justify-self-end shrink-0",
                                ex.DifficultyLevel === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                                ex.DifficultyLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'
                              )}>
                                {ex.DifficultyLevel === 'Easy' ? 'Mức Dễ' : ex.DifficultyLevel === 'Medium' ? 'Bình thường' : 'Vượt khó'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold border-t border-slate-50 pt-2 leading-none">
                              <span>Ngôn ngữ: <strong className="text-gray-600">{ex.Language}</strong></span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Hourglass className="w-3 h-3" />
                                {ex.DurationLimit}s giới hạn
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
            {teacher && (
              <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden space-y-6">
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -ml-8 -mt-8 pointer-events-none" />
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Giáo viên đồng hành</h4>
                    <span className="text-base font-extrabold text-gray-850 block mt-1.5 leading-none">
                      {teacher.FullName}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 font-semibold text-xs text-gray-600 border-t border-gray-50 pt-4.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Chuyên môn cao:</span>
                    <strong className="text-gray-800 text-right font-black">{teacher.Specialty}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Giới tính:</span>
                    <strong className="text-gray-800 font-black">{teacher.Gender === 'Female' ? 'Cô giáo 👧' : 'Thầy giáo 👦'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Học vị trạng thái:</span>
                    <span className="bg-emerald-50 text-[#34A853] px-2.5 py-0.5 rounded font-black text-[10px] uppercase">
                      {teacher.Status === 'Active' ? 'Hoạt động tốt' : teacher.Status}
                    </span>
                  </div>
                </div>

                {/* Simulated feedback channel */}
                <div className="bg-[#FFFDF5] p-4.5 rounded-2xl border border-yellow-101/60 text-xs font-bold text-gray-500 leading-relaxed block text-left">
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
                      {program.ProgramId}
                    </span>
                    <h3 className="text-base font-black text-gray-800 leading-snug mt-1.5">{program.ProgramName}</h3>
                  </div>
                </div>

                <p className="text-xs text-gray-405 leading-relaxed font-bold italic bg-white p-4.5 rounded-2xl border border-yellow-50">
                  {program.Description}
                </p>

                <div className="space-y-3.5 pt-1 text-xs font-bold text-gray-650 border-t border-yellow-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Độ tuổi phục vụ:</span>
                    <strong className="text-gray-800 font-extrabold">{program.TargetAgeFrom} &rarr; {program.TargetAgeTo} tuổi</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Ngôn ngữ áp dụng:</span>
                    <strong className="text-indigo-600 font-black">{program.Language}</strong>
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
      ) : (
        <div className="bg-white/45 backdrop-blur-md rounded-[40px] p-12 text-center text-gray-400 italic text-sm space-y-4 max-w-lg mx-auto border border-white">
          <BookOpen className="w-12 h-12 text-[#FF8E8E] mx-auto opacity-70 animate-bounce" />
          <p className="font-extrabold text-slate-650 leading-relaxed">Không tìm chương trình đào tạo cho học sinh này.</p>
          <p className="text-xs text-gray-400">Vui lòng liên hệ Văn phòng Đào tạo để xếp lớp hoặc cấu hình lớp học VR của trẻ.</p>
        </div>
      )}

    </div>
  );
}
