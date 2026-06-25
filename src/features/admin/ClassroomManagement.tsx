import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, 
  GraduationCap, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Search, 
  ChevronDown, 
  X, 
  Check, 
  Eye, 
  Edit3, 
  Lock, 
  Unlock, 
  Smile, 
  Sparkles,
  AlertTriangle,
  Info,
  BookOpen,
  Briefcase,
  Clock,
  TrendingUp,
  User,
  CheckCircle2,
  CalendarRange,
  XCircle,
  Award,
  Baby,
  Activity,
  Heart
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import { useClassroomManagementApi, type ClassroomResponse } from '../../hooks/useClassroomManagementApi';

// DB Interfaces
interface Classroom {
  ClassId: string;
  TeacherId: string;
  ProgramId: string;
  SemesterId?: string;
  EnrollmentCount: number;
  ClassName: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Status: 'Active' | 'Inactive' | 'Upcoming' | 'Closed';
  CreatedAt: string;
  UpdatedAt: string;
}

const mapClassroom = (classroom: ClassroomResponse): Classroom => ({
  ClassId: String(classroom.id), TeacherId: String(classroom.userId), ProgramId: String(classroom.programId), SemesterId: String(classroom.semesterId),
  EnrollmentCount: classroom.enrollmentCount,
  ClassName: classroom.className, Description: classroom.description ?? '',
  StartDate: classroom.startDate.slice(0, 10), EndDate: classroom.endDate.slice(0, 10),
  Status: classroom.status as Classroom['Status'], CreatedAt: classroom.createdAt, UpdatedAt: classroom.updatedAt ?? classroom.createdAt,
});

interface Teacher {
  TeacherId: string;
  FullName: string;
  Specialty: string;
  Email?: string;
  AvatarSeed?: string;
}

interface Program {
  ProgramId: string;
  ProgramName: string;
  Language: string;
  TargetAgeFrom: number;
  TargetAgeTo: number;
}

interface EnrolledStudent {
  ChildId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  ParentName: string;
  Phone: string;
}

// Mock Data
export default function ClassroomManagement() {
  const {
    getClassrooms,
    getPrograms,
    getSemesters,
    getUsers,
    getEnrollments,
    getChildProfiles,
    createClassroom,
    updateClassroom,
  } = useClassroomManagementApi();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [studentsByClassId, setStudentsByClassId] = useState<
    Record<string, EnrolledStudent[]>
  >({});
  const [defaultSemesterId, setDefaultSemesterId] = useState('');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterProgram, setFilterProgram] = useState('ALL');
  const [filterTeacher, setFilterTeacher] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page of Classroom list on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterProgram, filterTeacher]);

  // Modals state
  const [modalType, setModalType] = useState<'add' | 'edit' | 'detail' | 'students' | null>(null);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form states
  const [formClassName, setFormClassName] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formProgramId, setFormProgramId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<Classroom['Status']>('Upcoming');

  const triggerNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => {
      setAlertConfig(null);
    }, 4000);
  };

  useEffect(() => {
    void Promise.all([
      getClassrooms(),
      getUsers(1, 100),
      getPrograms(),
      getSemesters(),
      getEnrollments(),
      getChildProfiles(),
    ]).then(([
      classResult,
      userResult,
      programResult,
      semesterResult,
      enrollmentResult,
      childResult,
    ]) => {
      if (classResult.success && classResult.data) setClassrooms(classResult.data.items.map(mapClassroom));
      else triggerNotification(classResult.errors.join(' ') || classResult.message, 'warning');
      if (userResult.data) {
        const users = userResult.data.items;
        setTeachers(users.filter(u => u.roleName === 'Teacher').map(u => ({ TeacherId: String(u.id), FullName: u.fullName, Specialty: u.specialty, Email: u.email, AvatarSeed: u.username })));

        if (enrollmentResult.data && childResult.data) {
          const parentById = new Map(
            users.map((user) => [
              String(user.id),
              { fullName: user.fullName, phone: user.phone || 'Chua co so dien thoai' },
            ])
          );
          const childById = new Map(
            childResult.data.items.map((child) => [String(child.id), child])
          );

          const groupedStudents = enrollmentResult.data.items.reduce<
            Record<string, EnrolledStudent[]>
          >((accumulator, enrollment) => {
            if (enrollment.status === 'Cancelled') {
              return accumulator;
            }

            const child = childById.get(String(enrollment.childId));
            if (!child) {
              return accumulator;
            }

            const parent = parentById.get(String(child.userId));
            const classId = String(enrollment.classId);
            const current = accumulator[classId] ?? [];

            accumulator[classId] = [
              ...current,
              {
                ChildId: String(child.id),
                FullName: child.fullName,
                Age: child.age,
                Gender: child.gender,
                ParentName: parent?.fullName || `Parent #${child.userId}`,
                Phone: parent?.phone || 'Chua co so dien thoai',
              },
            ].sort((left, right) => left.FullName.localeCompare(right.FullName));

            return accumulator;
          }, {});

          setStudentsByClassId(groupedStudents);
        }
      }
      if (programResult.data) setPrograms(programResult.data.items.map(p => ({ ProgramId: String(p.id), ProgramName: p.programName, Language: p.language, TargetAgeFrom: p.targetAgeFrom, TargetAgeTo: p.targetAgeTo })));
      if (semesterResult.data) setDefaultSemesterId(String(semesterResult.data.items[0]?.id ?? ''));
    });
  }, [getChildProfiles, getClassrooms, getEnrollments, getPrograms, getSemesters, getUsers]);

  // KPI calculations
  const totalClasses = classrooms.length;
  const activeClasses = classrooms.filter(c => c.Status === 'Active').length;
  
  // Classes ending soon (e.g., end date before 2026-07-01, or status === 'Active' with end date approaching)
  const endingSoonClasses = classrooms.filter(c => {
    if (c.Status !== 'Active') return false;
    const endDateObj = new Date(c.EndDate);
    const triggerDateObj = new Date('2026-07-01'); // Relative to current system year 2026
    return endDateObj <= triggerDateObj;
  }).length;

  const totalTeachersAllocated = teachers.length;

  // Actions
  const handleOpenAdd = () => {
    setFormClassName('');
    setFormTeacherId(teachers[0]?.TeacherId || '');
    setFormProgramId(programs[0]?.ProgramId || '');
    setFormDescription('');
    setFormStartDate('2026-06-01');
    setFormEndDate('2026-09-01');
    setFormStatus('Upcoming');
    setSelectedClass(null);
    setModalType('add');
  };

  const handleOpenEdit = (cls: Classroom) => {
    setSelectedClass(cls);
    setFormClassName(cls.ClassName);
    setFormTeacherId(cls.TeacherId);
    setFormProgramId(cls.ProgramId);
    setFormDescription(cls.Description);
    setFormStartDate(cls.StartDate);
    setFormEndDate(cls.EndDate);
    setFormStatus(cls.Status);
    setModalType('edit');
  };

  const handleOpenDetail = (cls: Classroom) => {
    setSelectedClass(cls);
    setModalType('detail');
  };

  const handleOpenStudents = (cls: Classroom) => {
    setSelectedClass(cls);
    setModalType('students');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedClass(null);
  };

  // Save classroom changes
  const handleSaveClassroom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formClassName.trim()) {
      triggerNotification('Vui lĂ²ng nháº­p tĂªn lá»›p há»c!', 'warning');
      return;
    }

    if (!formStartDate || !formEndDate) {
      triggerNotification('Vui lĂ²ng chá»n Ä‘áº§y Ä‘á»§ thá»i gian báº¯t Ä‘áº§u vĂ  káº¿t thĂºc!', 'warning');
      return;
    }

    if (new Date(formStartDate) >= new Date(formEndDate)) {
      triggerNotification('NgĂ y báº¯t Ä‘áº§u pháº£i trÆ°á»›c ngĂ y káº¿t thĂºc há»c pháº§n!', 'warning');
      return;
    }

    const payload = { userId: Number(formTeacherId), programId: Number(formProgramId), semesterId: Number(selectedClass?.SemesterId || defaultSemesterId), className: formClassName.trim(), description: formDescription.trim(), startDate: formStartDate, endDate: formEndDate, status: formStatus };
    const apiResult = modalType === 'add' ? await createClassroom(payload) : selectedClass ? await updateClassroom(Number(selectedClass.ClassId), payload) : null;
    if (apiResult?.success && apiResult.data) {
      const mapped = mapClassroom(apiResult.data);
      setClassrooms(current => modalType === 'add' ? [mapped, ...current] : current.map(c => c.ClassId === mapped.ClassId ? mapped : c));
      triggerNotification(apiResult.message);
      handleCloseModal();
    } else if (apiResult) triggerNotification(apiResult.errors.join(' ') || apiResult.message, 'warning');
    return;

    if (modalType === 'add') {
      const newClass: Classroom = {
        ClassId: `CLS-${String(classrooms.length + 1).padStart(3, '0')}`,
        TeacherId: formTeacherId,
        ProgramId: formProgramId,
        EnrollmentCount: 0,
        ClassName: formClassName,
        Description: formDescription || 'ChÆ°a cáº­p nháº­t mĂ´ táº£ chi tiáº¿t lá»›p há»c.',
        StartDate: formStartDate,
        EndDate: formEndDate,
        Status: formStatus,
        CreatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setClassrooms([newClass, ...classrooms]);
      triggerNotification(`ÄĂ£ kiáº¿n táº¡o thĂ nh cĂ´ng lá»›p há»c "${formClassName}"!`);
    } else if (modalType === 'edit' && selectedClass) {
      setClassrooms(classrooms.map(c => c.ClassId === selectedClass.ClassId ? {
        ...c,
        TeacherId: formTeacherId,
        ProgramId: formProgramId,
        ClassName: formClassName,
        Description: formDescription,
        StartDate: formStartDate,
        EndDate: formEndDate,
        Status: formStatus,
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      } : c));

      triggerNotification(`Cáº­p nháº­t thĂ´ng tin lá»›p há»c "${formClassName}" thĂ nh cĂ´ng!`);
    }

    handleCloseModal();
  };

  // Close or Reopen classroom quick toggle
  const handleToggleClassState = async (cls: Classroom) => {
    const nextStatus: Classroom['Status'] = cls.Status === 'Closed' ? 'Active' : 'Closed';
    const result = await updateClassroom(Number(cls.ClassId), { userId: Number(cls.TeacherId), programId: Number(cls.ProgramId), semesterId: Number(cls.SemesterId || defaultSemesterId), className: cls.ClassName, description: cls.Description, startDate: cls.StartDate, endDate: cls.EndDate, status: nextStatus });
    if (!result.success || !result.data) { triggerNotification(result.errors.join(' ') || result.message, 'warning'); return; }
    setClassrooms(current => current.map(c => c.ClassId === cls.ClassId ? mapClassroom(result.data!) : c));

    triggerNotification(
      nextStatus === 'Active' 
        ? `ÄĂ£ kĂ­ch hoáº¡t váº­n hĂ nh hoáº¡t Ä‘á»™ng lá»›p "${cls.ClassName}"!`
        : `ÄĂ£ káº¿t thĂºc vĂ  khĂ³a há»“ sÆ¡ lá»›p há»c "${cls.ClassName}"!`,
      nextStatus === 'Active' ? 'success' : 'warning'
    );
  };

  // Filters logic
  const filteredClassrooms = classrooms.filter(item => {
    const teacher = teachers.find(t => t.TeacherId === item.TeacherId);
    const program = programs.find(p => p.ProgramId === item.ProgramId);
    
    const matchesSearch = 
      item.ClassName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (teacher?.FullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (program?.ProgramName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || item.Status === filterStatus;
    const matchesProgram = filterProgram === 'ALL' || item.ProgramId === filterProgram;
    const matchesTeacher = filterTeacher === 'ALL' || item.TeacherId === filterTeacher;

    return matchesSearch && matchesStatus && matchesProgram && matchesTeacher;
  });

  const totalPages = Math.max(1, Math.ceil(filteredClassrooms.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedClassrooms = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredClassrooms.slice(startIndex, startIndex + pageSize);
  }, [filteredClassrooms, currentPage, pageSize]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative" id="classroom-panel-root">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="toast-notification"
          >
            <div className={cn(
              "p-5 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-white backdrop-blur-md",
              alertConfig.type === 'success' ? 'bg-[#4EACAF]/95 text-white' : 'bg-[#FF8E8E]/95 text-white'
            )}>
              {alertConfig.type === 'success' ? (
                <div className="bg-white/20 p-2 rounded-xl">
                  <Check className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="bg-white/20 p-2 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-extrabold italic text-sm tracking-tight text-white">{alertConfig.message}</p>
              </div>
              <button 
                onClick={() => setAlertConfig(null)} 
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header component */}
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm" id="classroom-header">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <School className="w-3.5 h-3.5" />
            Há»‡ thá»‘ng quáº£n lĂ½ lá»›p há»c XR
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Thiáº¿t Láº­p <span className="text-[#4EACAF]">Lá»›p Há»c VR</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Kiáº¿n táº¡o Ä‘iá»u phá»‘i lá»›p há»c, liĂªn káº¿t giĂ¡o viĂªn chuyĂªn mĂ´n cao vĂ  chÆ°Æ¡ng trĂ¬nh giáº£ng dáº¡y rĂ¨n luyá»‡n phĂ¡t Ă¢m thĂ´ng minh cá»§a ná»n táº£ng GodotXR.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          id="btn-add-classroom"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Khai giáº£ng lá»›p há»c má»›i
        </button>
      </div>

      {/* 2. Statistical Dashboard block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="classroom-statistics">
        <StatItem 
          title="Tá»•ng lá»›p há»c" 
          value={totalClasses} 
          subtitle="NhĂ³m can thiá»‡p Ă¢m há»c" 
          icon={<School className="w-5 h-5 text-[#4EACAF]" />} 
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Lá»›p Ä‘ang hoáº¡t Ä‘á»™ng" 
          value={activeClasses} 
          subtitle="Thá»±c hĂ nh VR trá»±c tuyáº¿n" 
          icon={<Activity className="w-5 h-5 text-emerald-600" />} 
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Lá»›p sáº¯p káº¿t thĂºc" 
          value={endingSoonClasses} 
          subtitle="HoĂ n thĂ nh giĂ¡o Ă¡n Ä‘á»£t 1" 
          icon={<Clock className="w-5 h-5 text-rose-600" />} 
          bgColor="bg-rose-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="GiĂ¡o viĂªn phá»¥ trĂ¡ch" 
          value={totalTeachersAllocated} 
          subtitle="Äiá»u há»£p viĂªn tĂ¢m lĂ½ há»c" 
          icon={<GraduationCap className="w-5 h-5 text-amber-600" />} 
          bgColor="bg-amber-50/70"
          borderColor="border-slate-100"
        />
      </div>

      {/* 3. Search and filtering system */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4" id="classroom-filters">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
          <input 
            type="text" 
            placeholder="TĂ¬m theo tĂªn lá»›p, tĂªn giĂ¡o viĂªn, chÆ°Æ¡ng trĂ¬nh..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-200/60 rounded-full hover:bg-gray-200"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Filter controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-750 outline-none cursor-pointer pr-10 text-xs"
            >
              <option value="ALL">Má»i tráº¡ng thĂ¡i lá»›p</option>
              <option value="Active">Äang há»c</option>
              <option value="Upcoming">Sáº¯p má»Ÿ</option>
              <option value="Inactive">Táº¡m ngÆ°ng</option>
              <option value="Closed">ÄĂ£ káº¿t thĂºc</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-750 outline-none cursor-pointer pr-10 text-xs"
            >
              <option value="ALL">Má»i chÆ°Æ¡ng trĂ¬nh há»c</option>
              {programs.map(prog => (
                <option key={prog.ProgramId} value={prog.ProgramId}>
                  {prog.ProgramName.slice(0, 32)}...
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-750 outline-none cursor-pointer pr-10 text-xs"
            >
              <option value="ALL">Má»i GiĂ¡o viĂªn phá»¥ trĂ¡ch</option>
              {teachers.map(tch => (
                <option key={tch.TeacherId} value={tch.TeacherId}>
                  {tch.FullName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Classroom Records Table & grid card component */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="classroom-records-panel">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-none">Danh sĂ¡ch lá»›p giáº£ng dáº¡y</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">TĂ¬m tháº¥y {filteredClassrooms.length} phĂ²ng há»c luyá»‡n táº­p VR</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-[#4EACAF]/10 px-4 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 bg-[#4EACAF] rounded-full animate-pulse" />
            <span className="text-xs text-[#4EACAF] font-bold uppercase tracking-wider">Háº¡ táº§ng Ä‘iá»u phá»‘i khĂ³a há»c</span>
          </div>
        </div>

        {filteredClassrooms.length === 0 ? (
          <div className="py-24 text-center space-y-4" id="classroom-empty-state">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-200">
               <School className="w-8 h-8 text-gray-300" />
             </div>
             <p className="text-xl font-black text-gray-700">KhĂ´ng cĂ³ lá»›p há»c nĂ o Ä‘Ă¡p á»©ng bá»™ lá»c tĂ¬m kiáº¿m!</p>
             <button 
               onClick={() => {
                 setSearchQuery('');
                 setFilterStatus('ALL');
                 setFilterProgram('ALL');
                 setFilterTeacher('ALL');
               }}
               className="px-5 py-2 hover:bg-gray-100 rounded-xl font-black text-xs text-[#4EACAF] border border-gray-200 uppercase transition-all"
             >
               Äáº·t láº¡i bá»™ lá»c
             </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="classroom-table">
                <thead>
                  <tr className="bg-[#FDFCF5]/50 border-b border-gray-100 text-[#555] font-bold text-xs uppercase tracking-widest">
                    <th className="py-5 px-10">MĂ£ Lá»›p</th>
                    <th className="py-5 px-6">PhĂ²ng & ChÆ°Æ¡ng trĂ¬nh</th>
                    <th className="py-5 px-6">GiĂ¡o viĂªn hÆ°á»›ng dáº«n</th>
                    <th className="py-5 px-6">Thá»i gian biá»ƒu</th>
                    <th className="py-5 px-6">Há»c sinh</th>
                    <th className="py-5 px-6">Tráº¡ng thĂ¡i</th>
                    <th className="py-5 px-10 text-right">TĂ¹y chá»n hĂ nh Ä‘á»™ng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {paginatedClassrooms.map((cls) => {
                    const teacher = teachers.find(t => t.TeacherId === cls.TeacherId);
                    const program = programs.find(p => p.ProgramId === cls.ProgramId);
                    const studentCount = cls.EnrollmentCount;
                    return (
                      <tr 
                        key={cls.ClassId} 
                        className="hover:bg-gray-50/40 transition-colors"
                        id={`row-${cls.ClassId}`}
                      >
                        <td className="py-5 px-10 font-mono text-gray-400 font-black text-xs">
                          {cls.ClassId}
                        </td>
                        <td className="py-5 px-6 max-w-xs">
                          <div className="space-y-1">
                            <p className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                              <span className="p-1.5 bg-orange-50 text-orange-500 rounded-lg">
                                <School className="w-4 h-4" />
                              </span>
                              {cls.ClassName}
                            </p>
                            <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              {program ? program.ProgramName : 'ChÆ°a Ä‘á»‹nh cáº¥u hĂ¬nh ChÆ°Æ¡ng trĂ¬nh'}
                            </p>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          {teacher ? (
                            <div className="flex items-center gap-3">
                               <img 
                                 src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${teacher.AvatarSeed}`} 
                                 alt="Teacher Avatar" 
                                 className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100/40"
                                 referrerPolicy="no-referrer"
                               />
                               <div>
                                 <p className="text-gray-900 font-extrabold">{teacher.FullName}</p>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{teacher.Specialty.slice(0, 30)}...</p>
                               </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic font-medium">ChÆ°a liĂªn káº¿t</span>
                          )}
                        </td>
                        <td className="py-5 px-6">
                          <div className="space-y-1 text-xs">
                            <p className="font-medium text-gray-500 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              Tá»«: <span className="font-extrabold text-gray-800">{cls.StartDate}</span>
                            </p>
                            <p className="font-medium text-gray-500 flex items-center gap-1.5">
                              <CalendarRange className="w-3.5 h-3.5 text-gray-400" />
                              Äáº¿n: <span className="font-extrabold text-gray-800">{cls.EndDate}</span>
                            </p>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <button 
                            onClick={() => handleOpenStudents(cls)}
                            className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 px-3 py-1.5 rounded-xl text-xs transition-colors hover:scale-102 active:scale-98"
                            id={`btn-view-students-${cls.ClassId}`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-black">{studentCount} tráº»</span>
                          </button>
                        </td>
                        <td className="py-5 px-6">
                          <span className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                            cls.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                            cls.Status === 'Upcoming' ? 'bg-amber-50 text-amber-600' :
                            cls.Status === 'Inactive' ? 'bg-rose-50 text-[#FF8E8E]' :
                            'bg-gray-100 text-gray-500' // Closed
                          )}>
                            {cls.Status === 'Active' && 'Äang dáº¡y (Active)'}
                            {cls.Status === 'Upcoming' && 'Sáº¯p má»Ÿ (Upcoming)'}
                            {cls.Status === 'Inactive' && 'Táº¡m dá»«ng (Inactive)'}
                            {cls.Status === 'Closed' && 'ÄĂ£ káº¿t thĂºc (Closed)'}
                          </span>
                        </td>
                        <td className="py-5 px-10 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleOpenDetail(cls)}
                              className="p-2.5 hover:bg-teal-50 text-teal-600 rounded-xl transition-colors hover:scale-105"
                              title="Xem chi tiáº¿t lá»›p"
                              id={`action-detail-${cls.ClassId}`}
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleOpenEdit(cls)}
                              className="p-2.5 hover:bg-sky-50 text-sky-500 rounded-xl transition-colors hover:scale-105"
                              title="Sá»­a cáº¥u hĂ¬nh lá»›p"
                              id={`action-edit-${cls.ClassId}`}
                            >
                              <Edit3 className="w-4.5 h-4.5" />
                            </button>

                            <button 
                              onClick={() => handleToggleClassState(cls)}
                              className={cn(
                                "p-2.5 rounded-xl transition-colors hover:scale-105",
                                cls.Status === 'Closed' 
                                  ? 'hover:bg-emerald-50 text-emerald-500' 
                                  : 'hover:bg-rose-50 text-[#FF8E8E]'
                              )}
                              title={cls.Status === 'Closed' ? "Khá»Ÿi Ä‘á»™ng láº¡i khĂ³a há»c" : "ÄĂ³ng & cháº¥m dá»©t lá»›p"}
                              id={`action-toggle-${cls.ClassId}`}
                            >
                              {cls.Status === 'Closed' ? (
                                <Unlock className="w-4.5 h-4.5" />
                              ) : (
                                <Lock className="w-4.5 h-4.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-6 border-t border-slate-50">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredClassrooms.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="lá»›p há»c"
              />
            </div>
          </>
        )}
      </div>

      {/* Dynamic graphic info card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto" id="design-philosophy">
        <div className="flex items-center gap-4 bg-orange-50/40 p-6 rounded-[32px] border-2 border-orange-100">
          <Smile className="w-10 h-10 text-orange-400 fill-current shrink-0 animate-bounce" />
          <div>
            <h4 className="font-black text-[#555] text-sm">Giao diá»‡n Ä‘iá»u phá»‘i tráº» nhá»</h4>
            <p className="text-gray-500 text-xs font-bold leading-relaxed">
              Tráº£i nghiá»‡m lá»›p há»c Ä‘Æ°á»£c phĂ¢n chia theo Ä‘á»™ tuá»•i tá»‘i Æ°u tá»« 3 Ä‘áº¿n 10 tuá»•i Ä‘á»ƒ Ä‘áº£m báº£o sá»± phĂ¡t triá»ƒn thá»ƒ tráº¡ng nĂ£o bá»™ vĂ  ngá»¯ Ă¢m chĂ­nh xĂ¡c nháº¥t.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-teal-50/40 p-6 rounded-[32px] border-2 border-teal-100">
          <Sparkles className="w-10 h-10 text-teal-400 shrink-0" />
          <div>
            <h4 className="font-black text-[#555] text-sm">ChÆ°Æ¡ng trĂ¬nh can thiá»‡p XR</h4>
            <p className="text-gray-500 text-xs font-bold leading-relaxed">
              Sáº¯p xáº¿p giĂ¡o Ă¡n thĂ´ng minh giĂºp cĂ¡c chuyĂªn gia can thiá»‡p nhanh chĂ³ng thiáº¿t láº­p khá»‘i lÆ°á»£ng bĂ i táº­p tÆ°Æ¡ng tĂ¡c 3D phĂ¹ há»£p cho tá»«ng há»c viĂªn.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Modals System Overlays */}
      <AnimatePresence>
        {modalType && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto w-full h-full" id="classroom-modal-backdrop">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30 my-8"
              id="classroom-modal-content"
            >
              {/* Modal Header */}
              <div className={cn(
                "px-8 py-6 flex items-center justify-between border-b",
                modalType === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' :
                modalType === 'edit' ? 'bg-sky-50 border-sky-100 text-gray-900' :
                modalType === 'students' ? 'bg-orange-50 border-orange-100 text-gray-900' : 'bg-purple-50 border-purple-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'students' && <Users className="w-6 h-6 text-orange-500" />}
                    {modalType === 'detail' && <Info className="w-6 h-6 text-purple-600" />}
                    
                    {modalType === 'add' && 'Kiáº¿n táº¡o lá»›p há»c má»›i'}
                    {modalType === 'edit' && `Chá»‰nh sá»­a: Lá»›p ${selectedClass?.ClassName}`}
                    {modalType === 'students' && `Há»c viĂªn lá»›p ${selectedClass?.ClassName}`}
                    {modalType === 'detail' && 'ThĂ´ng tin lá»›p há»c rĂ¨n luyá»‡n'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Thiáº¿t láº­p Ä‘áº§y Ä‘á»§ lá»‹ch giáº£ng, giĂ¡o viĂªn Ä‘á»“ng hĂ nh vĂ  ná»™i dung bĂ i chÆ¡i tÆ°Æ¡ng tĂ¡c'}
                    {modalType === 'edit' && 'Cáº­p nháº­t láº¡i thá»i gian biá»ƒu, tĂ¬nh tráº¡ng giáº£ng dáº¡y phá»‘i há»£p'}
                    {modalType === 'students' && 'Danh sĂ¡ch há»c sinh Ä‘ang theo há»c lá»›p rĂ¨n luyá»‡n VR trá»±c thuá»™c'}
                    {modalType === 'detail' && 'LÆ°á»£c Ä‘á»“ chi tiáº¿t vá» dá»¯ liá»‡u khĂ³a há»c rĂ¨n luyá»‡n trá»±c thuá»™c há»‡ thá»‘ng'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                  id="modal-close-btn"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body: DETAIL info */}
              {modalType === 'detail' && selectedClass ? (
                <div className="app-modal-body p-8 md:p-10 space-y-8" id="modal-detail-body">
                  <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-gray-50 font-bold">
                     <div className="w-20 h-20 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                        <School className="w-10 h-10 text-purple-600" />
                     </div>
                     <div className="space-y-2 flex-1 text-center md:text-left">
                        <div>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                             <span className="text-2xl font-black text-gray-900">{selectedClass.ClassName}</span>
                             <span className="px-3 py-0.5 bg-gray-100 text-gray-400 font-black tracking-widest text-[9px] rounded-full uppercase">
                               ID: {selectedClass.ClassId}
                             </span>
                          </div>
                          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1 font-black">
                            ChÆ°Æ¡ng trĂ¬nh: {programs.find(p => p.ProgramId === selectedClass.ProgramId)?.ProgramName || 'ChÆ°a Ä‘á»‹nh nghÄ©a'}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                          <span className={cn(
                            "inline-flex items-center px-4 py-1.5 rounded-full uppercase text-[10px] font-black tracking-wider",
                            selectedClass.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                            selectedClass.Status === 'Upcoming' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                          )}>
                            {selectedClass.Status}
                          </span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                     <DetailRow 
                       label="TĂªn Lá»›p (ClassName)" 
                       value={selectedClass.ClassName} 
                     />
                     <DetailRow 
                       label="MĂ£ Ä‘á»‹nh danh chÆ°Æ¡ng trĂ¬nh (ProgramId)" 
                       value={`${programs.find(p => p.ProgramId === selectedClass.ProgramId)?.ProgramName || 'KhĂ´ng rĂµ'} (${selectedClass.ProgramId})`}
                     />
                     <DetailRow 
                       label="NhĂ³m tuá»•i tÆ°Æ¡ng thĂ­ch há»c pháº§n" 
                       value={`Tá»« ${programs.find(p => p.ProgramId === selectedClass.ProgramId)?.TargetAgeFrom || 3} tuá»•i tá»›i ${programs.find(p => p.ProgramId === selectedClass.ProgramId)?.TargetAgeTo || 10} tuá»•i`}
                     />
                     <DetailRow 
                       label="NgĂ´n ngá»¯ chĂ­nh luyá»‡n táº­p" 
                       value={programs.find(p => p.ProgramId === selectedClass.ProgramId)?.Language || 'Tiáº¿ng Viá»‡t'}
                     />
                     <DetailRow 
                       label="ChuyĂªn viĂªn phá»¥ trĂ¡ch (Teacher)" 
                       value={`${teachers.find(t => t.TeacherId === selectedClass.TeacherId)?.FullName || 'KhĂ´ng rá»'} (${selectedClass.TeacherId})`}
                     />
                     <DetailRow 
                       label="ChuyĂªn mĂ´n giĂ¡o dá»¥c Ä‘á»“ng hĂ nh" 
                       value={teachers.find(t => t.TeacherId === selectedClass.TeacherId)?.Specialty || 'ChÆ°a thiáº¿t láº­p'}
                     />
                     <DetailRow 
                       label="Thá»i biá»ƒu ná»™p há»“ sÆ¡ khĂ³a há»c" 
                       value={`Tá»« ${selectedClass.StartDate} tá»›i ${selectedClass.EndDate}`} 
                     />
                     <DetailRow 
                       label="Thá»i gian cáº¥u táº¡o lá»›p há»c" 
                       value={selectedClass.CreatedAt} 
                     />
                     
                     <div className="space-y-1.5 p-4 rounded-2xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40 col-span-1 md:col-span-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-bold">MĂ´ táº£ giĂ¡o trĂ¬nh & PhÆ°Æ¡ng tiá»‡n VR (Description)</span>
                       <span className="font-bold text-gray-800 text-sm block leading-relaxed italic">
                         "{selectedClass.Description}"
                       </span>
                     </div>
                  </div>

                  <div className="flex justify-end">
                     <button 
                       onClick={handleCloseModal}
                       className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                     >
                       Quay láº¡i
                     </button>
                  </div>
                </div>
              ) : modalType === 'students' && selectedClass ? (
                /* Modal Body: LIST enrolled students inside class */
                <div className="app-modal-body p-8 md:p-10 space-y-6" id="modal-students-body">
                   <div className="flex items-center gap-4 bg-orange-50 p-5 rounded-3xl border border-orange-100">
                      <Users className="w-10 h-10 text-orange-500 shrink-0" />
                      <div>
                         <p className="font-black text-gray-800 text-base">Danh sĂ¡ch há»c sinh lá»›p can thiá»‡p</p>
                         <p className="text-xs text-gray-500 font-bold">Há»“ sÆ¡ tráº» Ä‘ang kĂ­ch hoáº¡t há»c trĂ¬nh trong lá»›p nĂ y.</p>
                      </div>
                   </div>

                   <div className="space-y-3 max-h-[350px] overflow-y-auto">
                     {(studentsByClassId[selectedClass.ClassId] || []).map((student) => (
                        <div 
                          key={student.ChildId} 
                          className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50/50 transition-colors font-bold text-sm text-gray-700"
                        >
                          <div className="flex items-center gap-3">
                             <img 
                               src={`https://api.dicebear.com/7.x/bottts/svg?seed=${student.FullName}`} 
                               alt="Child avatar" 
                               className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100/35"
                               referrerPolicy="no-referrer"
                             />
                             <div>
                               <p className="text-gray-900 font-extrabold">{student.FullName}</p>
                               <p className="text-xs text-gray-400">
                                 {student.Age} tuá»•i â€¢ Giá»›i tĂ­nh: {student.Gender === 'Male' ? 'Nam' : 'Ná»¯'}
                               </p>
                             </div>
                          </div>
                          
                          <div className="text-right text-xs">
                             <p className="text-gray-700 font-extrabold">PH: {student.ParentName}</p>
                             <p className="text-gray-400">{student.Phone}</p>
                          </div>
                        </div>
                     ))}

                     {(!studentsByClassId[selectedClass.ClassId] || studentsByClassId[selectedClass.ClassId].length === 0) && (
                        <div className="py-12 text-center text-gray-400 font-bold space-y-2">
                           <Baby className="w-10 h-10 mx-auto text-gray-300" />
                           <p>ChÆ°a cĂ³ tráº» nĂ o Ä‘Æ°á»£c gĂ¡n há»c táº­p vĂ o lá»›p nĂ y.</p>
                        </div>
                     )}
                   </div>

                   <div className="flex justify-end pt-4 border-t border-gray-100">
                     <button 
                       onClick={handleCloseModal}
                       className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                     >
                       Quay láº¡i
                     </button>
                   </div>
                </div>
              ) : (
                /* Modal Body: ADD/EDIT Form submission */
                <form onSubmit={handleSaveClassroom} className="app-modal-body p-8 md:p-10 space-y-6" id="classroom-form">
                  <div className="app-modal-form-grid grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        TĂªn lá»›p há»c can thiá»‡p (ClassName) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="VĂ­ dá»¥: Lá»›p Chá»“i 1 - GhĂ©p váº§n thĂ´ng minh"
                        value={formClassName}
                        onChange={(e) => setFormClassName(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700 text-sm" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        ChuyĂªn viĂªn Ä‘iá»u trá»‹ (TeacherId) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formTeacherId}
                          onChange={(e) => setFormTeacherId(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] text-sm"
                        >
                          {teachers.map(t => (
                             <option key={t.TeacherId} value={t.TeacherId}>
                               {t.FullName} ({t.Specialty.slice(0, 30)}...)
                             </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Há»c trĂ¬nh / ChÆ°Æ¡ng trĂ¬nh há»c (ProgramId) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formProgramId}
                          onChange={(e) => setFormProgramId(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] text-sm"
                        >
                          {programs.map(p => (
                             <option key={p.ProgramId} value={p.ProgramId}>
                               {p.ProgramName}
                             </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        NgĂ y báº¯t Ä‘áº§u há»c pháº§n <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="date" 
                        required
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700 text-sm" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        NgĂ y káº¿t thĂºc dá»± kiáº¿n <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="date" 
                        required
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700 text-sm" 
                      />
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Kháº£o cá»©u chuyĂªn mĂ´n / MĂ´ táº£ lá»›p há»c (Description)
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="MĂ´ táº£ cáº¥u trĂºc Ä‘á»“ chÆ¡i can thiá»‡p hoáº·c ghi chĂº tiáº¿n trĂ¬nh Ä‘áº·c thĂ¹ cá»§a lá»›p há»c..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700 text-sm" 
                      />
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Tráº¡ng thĂ¡i hoáº¡t Ä‘á»™ng
                      </label>
                      <div className="relative">
                        <select 
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] text-sm"
                        >
                          <option value="Upcoming">đŸŸ¡ Sáº¯p má»Ÿ khĂ³a há»c (Upcoming)</option>
                          <option value="Active">đŸŸ¢ Äang hoáº¡t Ä‘á»™ng tĂ­ch cá»±c (Active)</option>
                          <option value="Inactive">đŸ”´ Táº¡m ngÆ°ng hoáº¡t Ä‘á»™ng (Inactive)</option>
                          <option value="Closed">âª ÄĂ£ káº¿t thĂºc & lÆ°u trá»¯ (Closed)</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="app-modal-actions pt-6 border-t border-gray-100 flex gap-4">
                     <button 
                       type="button"
                       onClick={handleCloseModal}
                       className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-black rounded-2xl transition-all uppercase text-xs tracking-widest"
                     >
                       Quay láº¡i
                     </button>
                     <button 
                       type="submit"
                       className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/10 transition-all active:scale-98 uppercase text-xs tracking-widest"
                     >
                       LÆ°u cáº¥u hĂ¬nh lá»›p
                     </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper stat item component
function StatItem({ 
  title, 
  value, 
  subtitle, 
  icon, 
  bgColor, 
  borderColor 
}: { 
  title: string; 
  value: number; 
  subtitle: string; 
  icon: React.ReactNode; 
  bgColor: string; 
  borderColor: string; 
}) {
  return (
    <div className={cn(
      "p-6 rounded-3xl border-2 flex items-center gap-5 bg-white shadow-sm hover:shadow-md transition-all duration-300",
      bgColor,
      borderColor
    )}>
       <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center shrink-0">
         {icon}
       </div>
       <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{value}</p>
          <p className="text-[10px] font-extrabold text-gray-400 leading-none">{subtitle}</p>
       </div>
    </div>
  );
}

// Single structured read-only display metadata row
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 bg-[#FDFCF5]/40 p-4 border border-gray-100/50 rounded-2xl">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block font-bold">{label}</span>
      <span className="font-extrabold text-gray-900 leading-snug">{value}</span>
    </div>
  );
}
