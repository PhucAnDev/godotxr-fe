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
  RefreshCw,
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
  Heart,
  ArrowDown,
  ArrowUp,
  ArrowUpDown
} from 'lucide-react';
import { cn, resolveAvatarUrl } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import CustomSelect from '../../components/common/CustomSelect';
import { useClassroomManagementApi, type ClassroomResponse } from '../../hooks/useClassroomManagementApi';
import ActionButton from '../../components/common/ActionButton';

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

const formatDateDMY = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
  }
  return dateStr;
};

interface Teacher {
  TeacherId: string;
  FullName: string;
  Specialty: string;
  Email?: string;
  AvatarSeed?: string;
  Avatar?: string | null;
}

interface Program {
  ProgramId: string;
  ProgramName: string;
  Language: string;
  TargetAgeFrom: number;
  TargetAgeTo: number;
}

interface Semester {
  SemesterId: string;
  SemesterName: string;
  StartDate: string;
  EndDate: string;
}

interface EnrolledStudent {
  ChildId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  ParentName: string;
  Phone: string;
  Avatar?: string | null;
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
    getClassroomById,
  } = useClassroomManagementApi();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [studentsByClassId, setStudentsByClassId] = useState<
    Record<string, EnrolledStudent[]>
  >({});
  const [defaultSemesterId, setDefaultSemesterId] = useState('');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [formSemesterId, setFormSemesterId] = useState('');
  
  // Classroom detail fetched state
  const [selectedClassroomDetail, setSelectedClassroomDetail] = useState<ClassroomResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterProgram, setFilterProgram] = useState('ALL');
  const [filterTeacher, setFilterTeacher] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof Classroom | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (column: keyof Classroom) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

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
        setTeachers(users.filter(u => u.roleName === 'Teacher').map(u => ({ TeacherId: String(u.id), FullName: u.fullName, Specialty: u.specialty, Email: u.email, AvatarSeed: u.fullName, Avatar: u.avatar || null })));

        if (enrollmentResult.data && childResult.data) {
          const parentById = new Map(
            users.map((user) => [
              String(user.id),
              { fullName: user.fullName, phone: user.phone || 'Chưa có số điện thoại' },
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
                Phone: parent?.phone || 'Chưa có số điện thoại',
                Avatar: child.avatar || null,
              },
            ].sort((left, right) => left.FullName.localeCompare(right.FullName));

            return accumulator;
          }, {});

          setStudentsByClassId(groupedStudents);
        }
      }
      if (programResult.data) setPrograms(programResult.data.items.map(p => ({ ProgramId: String(p.id), ProgramName: p.programName, Language: p.language, TargetAgeFrom: p.targetAgeFrom, TargetAgeTo: p.targetAgeTo })));
      if (semesterResult.data) {
        const mappedSemesters = semesterResult.data.items.map(s => ({
          SemesterId: String(s.id),
          SemesterName: s.semesterName,
          StartDate: s.startDate.slice(0, 10),
          EndDate: s.endDate.slice(0, 10)
        }));
        setSemesters(mappedSemesters);
        setDefaultSemesterId(String(semesterResult.data.items[0]?.id ?? ''));
      }
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
    setFormSemesterId(semesters[0]?.SemesterId || defaultSemesterId || '');
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
    setFormSemesterId(cls.SemesterId || defaultSemesterId || '');
    setFormDescription(cls.Description);
    setFormStartDate(cls.StartDate);
    setFormEndDate(cls.EndDate);
    setFormStatus(cls.Status);
    setModalType('edit');
  };

  const handleOpenDetail = async (cls: Classroom) => {
    setSelectedClass(cls);
    setModalType('detail');
    setIsDetailLoading(true);
    setSelectedClassroomDetail(null);
    try {
      const result = await getClassroomById(Number(cls.ClassId));
      if (result.success && result.data) {
        setSelectedClassroomDetail(result.data);
      } else {
        triggerNotification(result.errors.join(' ') || result.message, 'warning');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleOpenStudents = (cls: Classroom) => {
    setSelectedClass(cls);
    setModalType('students');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedClass(null);
    setSelectedClassroomDetail(null);
  };

  // Save classroom changes
  const handleSaveClassroom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formClassName.trim()) {
      triggerNotification('Vui lòng nhập tên lớp học!', 'warning');
      return;
    }

    if (!formStartDate || !formEndDate) {
      triggerNotification('Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc!', 'warning');
      return;
    }

    if (new Date(formStartDate) >= new Date(formEndDate)) {
      triggerNotification('Ngày bắt đầu phải trước ngày kết thúc học phần!', 'warning');
      return;
    }

    const payload = { userId: Number(formTeacherId), programId: Number(formProgramId), semesterId: Number(formSemesterId), className: formClassName.trim(), description: formDescription.trim(), startDate: formStartDate, endDate: formEndDate, status: formStatus };
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
        Description: formDescription || 'Chưa cập nhật mô tả chi tiết lớp học.',
        StartDate: formStartDate,
        EndDate: formEndDate,
        Status: formStatus,
        CreatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setClassrooms([newClass, ...classrooms]);
      triggerNotification(`Đã kiến tạo thành công lớp học "${formClassName}"!`);
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

      triggerNotification(`Cập nhật thông tin lớp học "${formClassName}" thành công!`);
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
        ? `Đã kích hoạt vận hành hoạt động lớp "${cls.ClassName}"!`
        : `Đã kết thúc và khóa hồ sơ lớp học "${cls.ClassName}"!`,
      nextStatus === 'Active' ? 'success' : 'warning'
    );
  };

  // Filters logic
  const filteredClassrooms = useMemo(() => {
    const filtered = classrooms.filter(item => {
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

    if (!sortColumn || !sortDirection) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (sortColumn === 'ClassId') {
        return sortDirection === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }

      if (sortColumn === 'TeacherId') {
        const teacherA = teachers.find(t => t.TeacherId === valA)?.FullName || '';
        const teacherB = teachers.find(t => t.TeacherId === valB)?.FullName || '';
        return sortDirection === 'asc' ? teacherA.localeCompare(teacherB, 'vi-VN', { numeric: true }) : teacherB.localeCompare(teacherA, 'vi-VN', { numeric: true });
      }

      if (sortColumn === 'ProgramId') {
        const programA = programs.find(p => p.ProgramId === valA)?.ProgramName || '';
        const programB = programs.find(p => p.ProgramId === valB)?.ProgramName || '';
        return sortDirection === 'asc' ? programA.localeCompare(programB, 'vi-VN', { numeric: true }) : programB.localeCompare(programA, 'vi-VN', { numeric: true });
      }

      if (sortColumn === 'EnrollmentCount') {
        const countA = valA ? Number(valA) : 0;
        const countB = valB ? Number(valB) : 0;
        return sortDirection === 'asc' ? countA - countB : countB - countA;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB, 'vi-VN', { numeric: true }) : valB.localeCompare(valA, 'vi-VN', { numeric: true });
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [classrooms, teachers, programs, searchQuery, filterStatus, filterProgram, filterTeacher, sortColumn, sortDirection]);

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
            Hệ thống quản lý lớp học XR
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Thiết Lập <span className="text-[#4EACAF]">Lớp Học VR</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Kiến tạo điều phối lớp học, liên kết giáo viên chuyên môn cao và chương trình giảng dạy rèn luyện phát âm thông minh của nền tảng GodotXR.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          id="btn-add-classroom"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Khai giảng lớp học mới
        </button>
      </div>

      {/* 2. Statistical Dashboard block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="classroom-statistics">
        <StatItem 
          title="Tổng lớp học" 
          value={totalClasses} 
          subtitle="Nhóm can thiệp âm học" 
          icon={<School className="w-5 h-5 text-[#4EACAF]" />} 
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Lớp đang hoạt động" 
          value={activeClasses} 
          subtitle="Thực hành VR trực tuyến" 
          icon={<Activity className="w-5 h-5 text-emerald-600" />} 
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Lớp sắp kết thúc" 
          value={endingSoonClasses} 
          subtitle="Hoàn thành giáo án đợt 1" 
          icon={<Clock className="w-5 h-5 text-rose-600" />} 
          bgColor="bg-rose-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Giáo viên phụ trách" 
          value={totalTeachersAllocated} 
          subtitle="Điều hợp viên tâm lý học" 
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
            placeholder="Tìm theo tên lớp, tên giáo viên, chương trình..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-normal text-slate-600 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white" 
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
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            variant="filter"
            options={[
              { value: 'ALL', label: 'Mọi trạng thái lớp' },
              { value: 'Active', label: 'Đang học' },
              { value: 'Upcoming', label: 'Sắp mở' },
              { value: 'Inactive', label: 'Tạm ngưng' },
              { value: 'Closed', label: 'Đã kết thúc' }
            ]}
          />

          <CustomSelect
            value={filterProgram}
            onChange={setFilterProgram}
            variant="filter"
            options={[
              { value: 'ALL', label: 'Mọi chương trình học' },
              ...programs.map(prog => ({
                value: prog.ProgramId,
                label: prog.ProgramName.slice(0, 32) + '...'
              }))
            ]}
          />

          <CustomSelect
            value={filterTeacher}
            onChange={setFilterTeacher}
            variant="filter"
            options={[
              { value: 'ALL', label: 'Mọi Giáo viên phụ trách' },
              ...teachers.map(tch => ({
                value: tch.TeacherId,
                label: tch.FullName
              }))
            ]}
          />
        </div>
      </div>

      {/* 4. Classroom Records Table & grid card component */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="classroom-records-panel">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-slate-800 leading-none">Danh sách lớp giảng dạy</h3>
            <p className="text-xs text-gray-400 font-normal uppercase tracking-wider mt-2">Tìm thấy {filteredClassrooms.length} phòng học luyện tập VR</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-[#4EACAF]/10 px-4 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 bg-[#4EACAF] rounded-full animate-pulse" />
            <span className="text-xs text-[#4EACAF] font-normal uppercase tracking-wider">Hạ tầng điều phối khóa học</span>
          </div>
        </div>

        {filteredClassrooms.length === 0 ? (
          <div className="py-24 text-center space-y-4" id="classroom-empty-state">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-200">
               <School className="w-8 h-8 text-gray-300" />
             </div>
             <p className="text-xl font-black text-gray-700">Không có lớp học nào đáp ứng bộ lọc tìm kiếm!</p>
             <button 
               onClick={() => {
                 setSearchQuery('');
                 setFilterStatus('ALL');
                 setFilterProgram('ALL');
                 setFilterTeacher('ALL');
               }}
               className="px-5 py-2 hover:bg-gray-100 rounded-xl font-black text-xs text-[#4EACAF] border border-gray-200 uppercase transition-all"
             >
               Đặt lại bộ lọc
             </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="classroom-table">
                <thead>
                  <tr className="bg-[#FDFCF5]/50 border-b border-gray-100 text-slate-550 font-semibold text-xs uppercase tracking-wider">
                    <th
                      onClick={() => handleSort('ClassId')}
                      className="w-[8%] py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Mã lớp"
                    >
                      <div className="flex items-center gap-1.5">
                        Mã Lớp
                        {sortColumn === 'ClassId' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('ClassName')}
                      className="w-[25%] py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Tên lớp học"
                    >
                      <div className="flex items-center gap-1.5">
                        Tên lớp
                        {sortColumn === 'ClassName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('TeacherId')}
                      className="w-[22%] py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Giáo viên"
                    >
                      <div className="flex items-center gap-1.5">
                        Giáo viên hướng dẫn
                        {sortColumn === 'TeacherId' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('StartDate')}
                      className="w-[17%] py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Ngày bắt đầu"
                    >
                      <div className="flex items-center gap-1.5">
                        Thời gian biểu
                        {sortColumn === 'StartDate' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('EnrollmentCount')}
                      className="w-[8%] py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Sĩ số học sinh"
                    >
                      <div className="flex items-center gap-1.5">
                        Học sinh
                        {sortColumn === 'EnrollmentCount' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th className="w-[10%] py-5 px-[5px] select-none">
                      Trạng thái
                    </th>
                    <th className="w-[10%] py-5 px-[5px] text-right select-none">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-normal text-sm text-slate-650">
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
                        <td className="py-5 px-[5px] font-mono text-slate-400 font-normal text-xs">
                          {cls.ClassId}
                        </td>
                         <td className="py-5 px-[5px] max-w-xs">
                           <p className="font-medium text-slate-800 text-sm flex items-center gap-2">
                             <span className="p-1.5 bg-orange-50 text-orange-500 rounded-lg">
                               <School className="w-4 h-4" />
                             </span>
                             {cls.ClassName}
                           </p>
                         </td>
                        <td className="py-5 px-[5px]">
                          {teacher ? (
                            <div className="flex items-center gap-3">
                               <img 
                                 src={resolveAvatarUrl(teacher.Avatar, teacher.FullName, 'adventurer')} 
                                 alt="Teacher Avatar" 
                                 className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100/40"
                                 referrerPolicy="no-referrer"
                               />
                               <div>
                                 <p className="font-medium text-slate-800">{teacher.FullName}</p>
                                 <p className="text-[10px] text-gray-400 font-normal uppercase tracking-wider">{teacher.Specialty.slice(0, 30)}...</p>
                               </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic font-medium">Chưa liên kết</span>
                          )}
                        </td>
                        <td className="py-5 px-[5px]">
                          <div className="space-y-1 text-xs">
                            <p className="font-medium text-gray-500 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              Từ: <span className="font-normal text-slate-650">{cls.StartDate}</span>
                            </p>
                            <p className="font-medium text-gray-500 flex items-center gap-1.5">
                              <CalendarRange className="w-3.5 h-3.5 text-gray-400" />
                              Đến: <span className="font-normal text-slate-650">{cls.EndDate}</span>
                            </p>
                          </div>
                        </td>
                        <td className="py-5 px-[5px]">
                          <button 
                            onClick={() => handleOpenStudents(cls)}
                            className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 px-3 py-1.5 rounded-xl text-xs transition-colors hover:scale-102 active:scale-98"
                            id={`btn-view-students-${cls.ClassId}`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-black">{studentCount} trẻ</span>
                          </button>
                        </td>
                        <td className="py-5 px-[5px]">
                          <span className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest",
                            cls.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                            cls.Status === 'Upcoming' ? 'bg-amber-50 text-amber-600' :
                            cls.Status === 'Inactive' ? 'bg-rose-50 text-[#FF8E8E]' :
                            'bg-gray-100 text-gray-500' // Closed
                          )}>
                            {cls.Status === 'Active' && 'Đang dạy'}
                            {cls.Status === 'Upcoming' && 'Sắp mở'}
                            {cls.Status === 'Inactive' && 'Tạm dừng'}
                            {cls.Status === 'Closed' && 'Đã kết thúc'}
                          </span>
                        </td>
                        <td className="py-5 px-[5px] text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <ActionButton
                              type="view"
                              onClick={() => handleOpenDetail(cls)}
                              title="Xem chi tiết lớp"
                              id={`action-detail-${cls.ClassId}`}
                            />
                            
                            <ActionButton
                              type="edit"
                              onClick={() => handleOpenEdit(cls)}
                              title="Sửa cấu hình lớp"
                              id={`action-edit-${cls.ClassId}`}
                            />

                            <ActionButton
                              type={cls.Status === 'Closed' ? 'unlock' : 'lock'}
                              onClick={() => handleToggleClassState(cls)}
                              title={cls.Status === 'Closed' ? "Khởi động lại khóa học" : "Đóng & chấm dứt lớp"}
                              id={`action-toggle-${cls.ClassId}`}
                            />
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
                itemLabel="lớp học"
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
            <h4 className="font-black text-[#555] text-sm">Giao diện điều phối trẻ nhỏ</h4>
            <p className="text-gray-500 text-xs font-bold leading-relaxed">
              Trải nghiệm lớp học được phân chia theo độ tuổi tối ưu từ 3 đến 10 tuổi để đảm bảo sự phát triển thể trạng não bộ và ngữ âm chính xác nhất.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-teal-50/40 p-6 rounded-[32px] border-2 border-teal-100">
          <Sparkles className="w-10 h-10 text-teal-400 shrink-0" />
          <div>
            <h4 className="font-black text-[#555] text-sm">Chương trình can thiệp XR</h4>
            <p className="text-gray-500 text-xs font-bold leading-relaxed">
              Sắp xếp giáo án thông minh giúp các chuyên gia can thiệp nhanh chóng thiết lập khối lượng bài tập tương tác 3D phù hợp cho từng học viên.
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
                    
                    {modalType === 'add' && 'Kiến tạo lớp học mới'}
                    {modalType === 'edit' && `Chỉnh sửa: Lớp ${selectedClass?.ClassName}`}
                    {modalType === 'students' && `Học viên lớp ${selectedClass?.ClassName}`}
                    {modalType === 'detail' && 'Thông tin lớp học rèn luyện'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Thiết lập đầy đủ lịch giảng, giáo viên đồng hành và nội dung bài chơi tương tác'}
                    {modalType === 'edit' && 'Cập nhật lại thời gian biểu, tình trạng giảng dạy phối hợp'}
                    {modalType === 'students' && 'Danh sách học sinh đang theo học lớp rèn luyện VR trực thuộc'}
                    {modalType === 'detail' && 'Lược đồ chi tiết về dữ liệu khóa học rèn luyện trực thuộc hệ thống'}
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
                  {isDetailLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <RefreshCw className="h-10 w-10 animate-spin text-[#4EACAF]" />
                      <p className="text-sm font-bold text-slate-400">
                        Đang tải chi tiết lớp học từ máy chủ...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-gray-50 font-bold">
                         <div className="w-20 h-20 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                            <School className="w-10 h-10 text-purple-600" />
                         </div>
                         <div className="space-y-2 flex-1 text-center md:text-left">
                            <div>
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                 <span className="text-2xl font-medium text-slate-800">{selectedClassroomDetail?.className || selectedClass.ClassName}</span>
                                 <span className="px-3 py-0.5 bg-gray-100 text-gray-400 font-black tracking-widest text-[9px] rounded-full uppercase">
                                   ID: {selectedClassroomDetail?.id || selectedClass.ClassId}
                                 </span>
                              </div>
                              <p className="text-gray-400 text-xs uppercase tracking-wider mt-1 font-black">
                                Chương trình: {selectedClassroomDetail?.programName || programs.find(p => p.ProgramId === selectedClass.ProgramId)?.ProgramName || 'Chưa định nghĩa'}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                              <span className={cn(
                                "inline-flex items-center px-4 py-1.5 rounded-full uppercase text-[10px] font-black tracking-wider",
                                (selectedClassroomDetail?.status || selectedClass.Status) === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                                (selectedClassroomDetail?.status || selectedClass.Status) === 'Upcoming' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                              )}>
                                {selectedClassroomDetail?.status || selectedClass.Status}
                              </span>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                         <DetailRow 
                           label="Tên Lớp" 
                           value={selectedClassroomDetail?.className || selectedClass.ClassName} 
                         />
                         <DetailRow 
                           label="Mã Lớp" 
                           value={String(selectedClassroomDetail?.id || selectedClass.ClassId)} 
                         />
                         <DetailRow 
                           label="Trạng thái hoạt động" 
                           value={selectedClassroomDetail?.status || selectedClass.Status} 
                         />
                         <DetailRow 
                           label="Sĩ số học sinh ghi danh" 
                           value={`${selectedClassroomDetail?.enrollmentCount ?? selectedClass.EnrollmentCount} học sinh`} 
                         />
                         <DetailRow 
                           label="Tên Chương trình học" 
                           value={selectedClassroomDetail?.programName || programs.find(p => p.ProgramId === selectedClass.ProgramId)?.ProgramName || 'Không rõ'} 
                         />
                         <DetailRow 
                           label="Mã định danh chương trình" 
                           value={String(selectedClassroomDetail?.programId || selectedClass.ProgramId)} 
                         />
                         <DetailRow 
                           label="Nhóm tuổi tương thích học phần" 
                           value={`Từ ${selectedClassroomDetail?.targetAgeFrom ?? programs.find(p => p.ProgramId === selectedClass.ProgramId)?.TargetAgeFrom ?? 3} tuổi tới ${selectedClassroomDetail?.targetAgeTo ?? programs.find(p => p.ProgramId === selectedClass.ProgramId)?.TargetAgeTo ?? 10} tuổi`}
                         />
                         <DetailRow 
                           label="Ngôn ngữ chính luyện tập" 
                           value={selectedClassroomDetail?.programLanguage || programs.find(p => p.ProgramId === selectedClass.ProgramId)?.Language || 'Tiếng Việt'}
                         />
                         <DetailRow 
                           label="Giáo viên đảm nhiệm" 
                           value={selectedClassroomDetail?.teacherName || teachers.find(t => t.TeacherId === selectedClass.TeacherId)?.FullName || 'Không rõ'} 
                         />
                         <DetailRow 
                           label="Mã định danh giáo viên" 
                           value={String(selectedClassroomDetail?.userId || selectedClass.TeacherId)} 
                         />
                         <DetailRow 
                           label="Chuyên môn giáo dục đồng hành" 
                           value={selectedClassroomDetail?.teacherSpecialty || teachers.find(t => t.TeacherId === selectedClass.TeacherId)?.Specialty || 'Chưa thiết lập'}
                         />
                         <DetailRow 
                           label="Học kỳ liên kết" 
                           value={selectedClassroomDetail?.semesterName || 'Chưa rõ'} 
                         />
                         <DetailRow 
                           label="Mã học kỳ" 
                           value={String(selectedClassroomDetail?.semesterId || selectedClass.SemesterId || 'Chưa rõ')} 
                         />
                         <DetailRow 
                           label="Thời gian hoạt động lớp học" 
                           value={`Từ ${formatDateDMY(selectedClassroomDetail ? selectedClassroomDetail.startDate : selectedClass.StartDate)} tới ${formatDateDMY(selectedClassroomDetail ? selectedClassroomDetail.endDate : selectedClass.EndDate)}`} 
                         />
                         <DetailRow 
                           label="Thời gian tạo lớp học" 
                           value={formatDateDMY(selectedClassroomDetail?.createdAt || selectedClass.CreatedAt)} 
                         />
                         <DetailRow 
                           label="Thời điểm cập nhật lớp học" 
                           value={formatDateDMY(selectedClassroomDetail?.updatedAt || selectedClass.UpdatedAt || 'Chưa có cập nhật')} 
                         />
                         
                         <div className="space-y-1.5 p-4 rounded-2xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40 col-span-1 md:col-span-2">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-bold">Mô tả giáo trình & Phương tiện VR</span>
                           <span className="font-bold text-gray-800 text-sm block leading-relaxed italic">
                             "{selectedClassroomDetail?.description || selectedClass.Description || 'Không có mô tả'}"
                           </span>
                         </div>
                      </div>

                      <div className="flex justify-end">
                         <button 
                           onClick={handleCloseModal}
                           className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                         >
                           Quay lại
                         </button>
                      </div>
                    </>
                  )}
                </div>
              ) : modalType === 'students' && selectedClass ? (
                /* Modal Body: LIST enrolled students inside class */
                <div className="app-modal-body p-8 md:p-10 space-y-6" id="modal-students-body">
                   <div className="flex items-center gap-4 bg-orange-50 p-5 rounded-3xl border border-orange-100">
                      <Users className="w-10 h-10 text-orange-500 shrink-0" />
                      <div>
                         <p className="font-black text-gray-800 text-base">Danh sách học sinh lớp can thiệp</p>
                         <p className="text-xs text-gray-500 font-bold">Hồ sơ trẻ đang kích hoạt học trình trong lớp này.</p>
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
                               src={resolveAvatarUrl(student.Avatar, student.FullName, 'bottts')} 
                               alt="Child avatar" 
                               className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100/35"
                               referrerPolicy="no-referrer"
                             />
                             <div>
                               <p className="font-medium text-slate-800">{student.FullName}</p>
                               <p className="text-xs text-gray-400">
                                 {student.Age} tuổi • Giới tính: {student.Gender === 'Male' ? 'Nam' : 'Nữ'}
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
                           <p>Chưa có trẻ nào được gán học tập vào lớp này.</p>
                        </div>
                     )}
                   </div>

                   <div className="flex justify-end pt-4 border-t border-gray-100">
                     <button 
                       onClick={handleCloseModal}
                       className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                     >
                       Quay lại
                     </button>
                   </div>
                </div>
              ) : (
                /* Modal Body: ADD/EDIT Form submission */
                <form onSubmit={handleSaveClassroom} className="app-modal-body p-8 md:p-10 space-y-6" id="classroom-form">
                  <div className="app-modal-form-grid grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Tên lớp học can thiệp <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ví dụ: Lớp Chồi 1 - Ghép vần thông minh"
                        value={formClassName}
                        onChange={(e) => setFormClassName(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700 text-sm" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Chuyên viên điều trị <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <CustomSelect
                        value={formTeacherId}
                        onChange={setFormTeacherId}
                        variant="form"
                        options={teachers.map(t => ({
                          value: t.TeacherId,
                          label: `${t.FullName} (${t.Specialty.slice(0, 30)}...)`
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Học trình / Chương trình học <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <CustomSelect
                        value={formProgramId}
                        onChange={setFormProgramId}
                        variant="form"
                        options={programs.map(p => ({
                          value: p.ProgramId,
                          label: p.ProgramName
                        }))}
                      />
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Học kỳ liên kết <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <CustomSelect
                        value={formSemesterId}
                        onChange={setFormSemesterId}
                        variant="form"
                        options={semesters.map(s => ({
                          value: s.SemesterId,
                          label: `${s.SemesterName} (Từ ${formatDateDMY(s.StartDate)} tới ${formatDateDMY(s.EndDate)})`
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Ngày bắt đầu học phần <span className="text-[#FF8E8E]">*</span>
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
                        Ngày kết thúc dự kiến <span className="text-[#FF8E8E]">*</span>
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
                        Khảo cứu chuyên môn / Mô tả lớp học
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Mô tả cấu trúc đồ chơi can thiệp hoặc ghi chú tiến trình đặc thù của lớp học..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="resize-y w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700 text-sm" 
                      />
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Trạng thái hoạt động
                      </label>
                      <CustomSelect
                        value={formStatus}
                        onChange={(val) => setFormStatus(val as any)}
                        variant="form"
                        options={[
                          { value: 'Upcoming', label: '🟡 Sắp mở khóa học (Upcoming)' },
                          { value: 'Active', label: '🟢 Đang hoạt động tích cực (Active)' },
                          { value: 'Inactive', label: '🔴 Tạm ngưng hoạt động (Inactive)' },
                          { value: 'Closed', label: '⚪ Đã kết thúc & lưu trữ (Closed)' }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="app-modal-actions pt-6 border-t border-gray-100 flex gap-4">
                     <button 
                       type="button"
                       onClick={handleCloseModal}
                       className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-black rounded-2xl transition-all uppercase text-xs tracking-widest"
                     >
                       Quay lại
                     </button>
                     <button 
                       type="submit"
                       className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/10 transition-all active:scale-98 uppercase text-xs tracking-widest"
                     >
                       Lưu cấu hình lớp
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
  borderColor,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={cn(
      'bg-white rounded-[32px] p-6 shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-300',
      borderColor
    )}>
      <div className={cn('absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150', bgColor)} />
      <div className="flex items-center gap-5 relative z-10">
        <div className={cn('p-4 rounded-2xl shadow-inner shrink-0', bgColor)}>
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">{title}</p>
          <p className="text-3xl font-black text-gray-900 leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-[11px] text-gray-500 font-medium pt-1 line-clamp-1">{subtitle}</p>
        </div>
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
