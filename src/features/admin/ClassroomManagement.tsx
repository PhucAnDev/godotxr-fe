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
const MOCK_TEACHERS: Teacher[] = [
  { 
    TeacherId: 'TCH-001', 
    FullName: 'Trần Thị Hồng (Ms. Johnson)', 
    Specialty: 'Phát âm cơ bản & Đồng hành rèn luyện VR',
    Email: 'hong.johnson@godotxr.edu',
    AvatarSeed: 'Michelle'
  },
  { 
    TeacherId: 'TCH-002', 
    FullName: 'Lê Hoàng Long', 
    Specialty: 'Chậm phát âm & Hỗ trợ rèn luyện tập trung',
    Email: 'long.le@godotxr.edu',
    AvatarSeed: 'George'
  },
  { 
    TeacherId: 'TCH-003', 
    FullName: 'Nguyễn Thị Mai', 
    Specialty: 'Phát triển giao tiếp xã hội & Ghép âm',
    Email: 'mai.nguyen@godotxr.edu',
    AvatarSeed: 'Anna'
  },
  { 
    TeacherId: 'TCH-004', 
    FullName: 'Phạm Tuấn Anh', 
    Specialty: 'Sửa tật ngọng ngữ âm & Luyện thanh',
    Email: 'tuananh.pham@godotxr.edu',
    AvatarSeed: 'Jack'
  }
];

const MOCK_PROGRAMS: Program[] = [
  { 
    ProgramId: 'PRG-001', 
    ProgramName: 'Nhận diện âm đơn & Từ vựng căn bản (Level 1)', 
    Language: 'Tiếng Việt', 
    TargetAgeFrom: 3, 
    TargetAgeTo: 5 
  },
  { 
    ProgramId: 'PRG-002', 
    ProgramName: 'Luyện phát âm âm đôi & Cụm từ thông dụng (Level 2)', 
    Language: 'Tiếng Việt', 
    TargetAgeFrom: 4, 
    TargetAgeTo: 6 
  },
  { 
    ProgramId: 'PRG-003', 
    ProgramName: 'Kích hoạt phản xạ hội thoại & Kể chuyện 3D (Level 3)', 
    Language: 'Tiếng Việt', 
    TargetAgeFrom: 5, 
    TargetAgeTo: 8 
  },
  { 
    ProgramId: 'PRG-004', 
    ProgramName: 'Luyện âm tương tác & Sửa ngọng phụ âm gió (Level 4)', 
    Language: 'Tiếng Việt/Tiếng Anh', 
    TargetAgeFrom: 6, 
    TargetAgeTo: 10 
  }
];

const INITIAL_CLASSROOMS: Classroom[] = [
  {
    ClassId: 'CLS-001',
    TeacherId: 'TCH-001',
    ProgramId: 'PRG-002',
    ClassName: 'Lớp Chồi 1 - Ghép vần thông minh',
    Description: 'Ứng dụng kính thực tế ảo tăng cường để huấn luyện nâng cao từ kép và phối hợp âm điệu phù hợp cho bé chậm nói.',
    StartDate: '2026-06-01',
    EndDate: '2026-09-01',
    Status: 'Upcoming',
    CreatedAt: '2026-05-15 10:00',
    UpdatedAt: '2026-05-15 10:00'
  },
  {
    ClassId: 'CLS-002',
    TeacherId: 'TCH-003',
    ProgramId: 'PRG-001',
    ClassName: 'Lớp Mầm 2 - Nhận biết sinh vật sống',
    Description: 'Lớp học nhập môn phát âm âm đơn bằng giáo cụ trực quan 3D AR, khơi gợi trí tò mò ngôn ngữ từ thủa sơ khai.',
    StartDate: '2026-04-10',
    EndDate: '2026-07-10',
    Status: 'Active',
    CreatedAt: '2026-04-01 09:30',
    UpdatedAt: '2026-04-10 14:00'
  },
  {
    ClassId: 'CLS-003',
    TeacherId: 'TCH-002',
    ProgramId: 'PRG-003',
    ClassName: 'Lớp Lá Phản Xạ Cấp 3',
    Description: 'Tập trung kích hoạt giao tiếp phản xạ tự do trong môi trường giả lập đại dương và vũ trụ của phần mềm GodotXR.',
    StartDate: '2026-03-15',
    EndDate: '2026-06-15',
    Status: 'Active',
    CreatedAt: '2026-03-01 11:00',
    UpdatedAt: '2026-03-15 08:00'
  },
  {
    ClassId: 'CLS-004',
    TeacherId: 'TCH-004',
    ProgramId: 'PRG-004',
    ClassName: 'Lớp Sửa Ngọng S, X nâng cao',
    Description: 'Sửa đổi khẩu hình miệng khi nói phụ âm gió thông qua visual âm sinh học thời gian thực hỗ trợ điều trị nhi khoa.',
    StartDate: '2026-01-10',
    EndDate: '2026-04-10',
    Status: 'Closed',
    CreatedAt: '2025-12-25 10:00',
    UpdatedAt: '2026-04-10 17:00'
  },
  {
    ClassId: 'CLS-005',
    TeacherId: 'TCH-001',
    ProgramId: 'PRG-003',
    ClassName: 'Lớp Chồi 3 - Đọc Truyện 3D',
    Description: 'Sử dụng công nghệ chiếu lập thể để các em thảo luận nhóm, kể lại nội dung chuyện cổ tích quen thuộc.',
    StartDate: '2026-05-20',
    EndDate: '2026-08-20',
    Status: 'Active',
    CreatedAt: '2026-05-01 15:30',
    UpdatedAt: '2026-05-20 09:00'
  }
];

// Mock students data mapping for classes to render in students modal
const MOCK_CHILDREN_IN_CLASS: Record<string, EnrolledStudent[]> = {
  'CLS-001': [
    { ChildId: 'CHD-001', FullName: 'Phạm Minh Đức (Leo)', Age: 6, Gender: 'Male', ParentName: 'Phạm Minh Anh', Phone: '0901234567' },
    { ChildId: 'CHD-003', FullName: 'Nguyễn Đức Huy (Bi)', Age: 5, Gender: 'Male', ParentName: 'Bùi Thị Lan', Phone: '0978123456' }
  ],
  'CLS-002': [
    { ChildId: 'CHD-002', FullName: 'Phạm Ngọc Linh (Mimi)', Age: 4, Gender: 'Female', ParentName: 'Phạm Minh Anh', Phone: '0901234567' },
    { ChildId: 'CHD-005', FullName: 'Nguyễn Hải Yến (Tép)', Age: 3, Gender: 'Female', ParentName: 'Nguyễn Thanh Sơn', Phone: '0933221100' }
  ],
  'CLS-003': [
    { ChildId: 'CHD-004', FullName: 'Nguyễn Thanh Lâm', Age: 7, Gender: 'Male', ParentName: 'Nguyễn Thanh Sơn', Phone: '0933221100' }
  ],
  'CLS-005': [
    { ChildId: 'CHD-001', FullName: 'Phạm Minh Đức (Leo)', Age: 6, Gender: 'Male', ParentName: 'Phạm Minh Anh', Phone: '0901234567' },
    { ChildId: 'CHD-004', FullName: 'Nguyễn Thanh Lâm', Age: 7, Gender: 'Male', ParentName: 'Nguyễn Thanh Sơn', Phone: '0933221100' }
  ]
};

export default function ClassroomManagement() {
  const { getClassrooms, getPrograms, getSemesters, getUsers, createClassroom, updateClassroom } = useClassroomManagementApi();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
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
    void Promise.all([getClassrooms(), getUsers(1, 100), getPrograms(), getSemesters()]).then(([classResult, userResult, programResult, semesterResult]) => {
      if (classResult.success && classResult.data) setClassrooms(classResult.data.items.map(mapClassroom));
      else triggerNotification(classResult.errors.join(' ') || classResult.message, 'warning');
      if (userResult.data) setTeachers(userResult.data.items.filter(u => u.roleName === 'Teacher').map(u => ({ TeacherId: String(u.id), FullName: u.fullName, Specialty: u.specialty, Email: u.email, AvatarSeed: u.username })));
      if (programResult.data) setPrograms(programResult.data.items.map(p => ({ ProgramId: String(p.id), ProgramName: p.programName, Language: p.language, TargetAgeFrom: p.targetAgeFrom, TargetAgeTo: p.targetAgeTo })));
      if (semesterResult.data) setDefaultSemesterId(String(semesterResult.data.items[0]?.id ?? ''));
    });
  }, []);

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
              <option value="ALL">Mọi trạng thái lớp</option>
              <option value="Active">Đang học</option>
              <option value="Upcoming">Sắp mở</option>
              <option value="Inactive">Tạm ngưng</option>
              <option value="Closed">Đã kết thúc</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-750 outline-none cursor-pointer pr-10 text-xs"
            >
              <option value="ALL">Mọi chương trình học</option>
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
              <option value="ALL">Mọi Giáo viên phụ trách</option>
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
            <h3 className="text-lg font-bold text-slate-800 leading-none">Danh sách lớp giảng dạy</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Tìm thấy {filteredClassrooms.length} phòng học luyện tập VR</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-[#4EACAF]/10 px-4 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 bg-[#4EACAF] rounded-full animate-pulse" />
            <span className="text-xs text-[#4EACAF] font-bold uppercase tracking-wider">Hạ tầng điều phối khóa học</span>
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
                  <tr className="bg-[#FDFCF5]/50 border-b border-gray-100 text-[#555] font-bold text-xs uppercase tracking-widest">
                    <th className="py-5 px-10">Mã Lớp</th>
                    <th className="py-5 px-6">Phòng & Chương trình</th>
                    <th className="py-5 px-6">Giáo viên hướng dẫn</th>
                    <th className="py-5 px-6">Thời gian biểu</th>
                    <th className="py-5 px-6">Học sinh</th>
                    <th className="py-5 px-6">Trạng thái</th>
                    <th className="py-5 px-10 text-right">Tùy chọn hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {paginatedClassrooms.map((cls) => {
                    const teacher = teachers.find(t => t.TeacherId === cls.TeacherId);
                    const program = programs.find(p => p.ProgramId === cls.ProgramId);
                    const studentCount = (MOCK_CHILDREN_IN_CLASS[cls.ClassId] || []).length;
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
                              {program ? program.ProgramName : 'Chưa định cấu hình Chương trình'}
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
                            <span className="text-gray-400 italic font-medium">Chưa liên kết</span>
                          )}
                        </td>
                        <td className="py-5 px-6">
                          <div className="space-y-1 text-xs">
                            <p className="font-medium text-gray-500 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              Từ: <span className="font-extrabold text-gray-800">{cls.StartDate}</span>
                            </p>
                            <p className="font-medium text-gray-500 flex items-center gap-1.5">
                              <CalendarRange className="w-3.5 h-3.5 text-gray-400" />
                              Đến: <span className="font-extrabold text-gray-800">{cls.EndDate}</span>
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
                            <span className="font-black">{studentCount} trẻ</span>
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
                            {cls.Status === 'Active' && 'Đang dạy (Active)'}
                            {cls.Status === 'Upcoming' && 'Sắp mở (Upcoming)'}
                            {cls.Status === 'Inactive' && 'Tạm dừng (Inactive)'}
                            {cls.Status === 'Closed' && 'Đã kết thúc (Closed)'}
                          </span>
                        </td>
                        <td className="py-5 px-10 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleOpenDetail(cls)}
                              className="p-2.5 hover:bg-teal-50 text-teal-600 rounded-xl transition-colors hover:scale-105"
                              title="Xem chi tiết lớp"
                              id={`action-detail-${cls.ClassId}`}
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleOpenEdit(cls)}
                              className="p-2.5 hover:bg-sky-50 text-sky-500 rounded-xl transition-colors hover:scale-105"
                              title="Sửa cấu hình lớp"
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
                              title={cls.Status === 'Closed' ? "Khởi động lại khóa học" : "Đóng & chấm dứt lớp"}
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
                            Chương trình: {programs.find(p => p.ProgramId === selectedClass.ProgramId)?.ProgramName || 'Chưa định nghĩa'}
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
                       label="Tên Lớp (ClassName)" 
                       value={selectedClass.ClassName} 
                     />
                     <DetailRow 
                       label="Mã định danh chương trình (ProgramId)" 
                       value={`${programs.find(p => p.ProgramId === selectedClass.ProgramId)?.ProgramName || 'Không rõ'} (${selectedClass.ProgramId})`}
                     />
                     <DetailRow 
                       label="Nhóm tuổi tương thích học phần" 
                       value={`Từ ${programs.find(p => p.ProgramId === selectedClass.ProgramId)?.TargetAgeFrom || 3} tuổi tới ${programs.find(p => p.ProgramId === selectedClass.ProgramId)?.TargetAgeTo || 10} tuổi`}
                     />
                     <DetailRow 
                       label="Ngôn ngữ chính luyện tập" 
                       value={programs.find(p => p.ProgramId === selectedClass.ProgramId)?.Language || 'Tiếng Việt'}
                     />
                     <DetailRow 
                       label="Chuyên viên phụ trách (Teacher)" 
                       value={`${teachers.find(t => t.TeacherId === selectedClass.TeacherId)?.FullName || 'Không rỏ'} (${selectedClass.TeacherId})`}
                     />
                     <DetailRow 
                       label="Chuyên môn giáo dục đồng hành" 
                       value={teachers.find(t => t.TeacherId === selectedClass.TeacherId)?.Specialty || 'Chưa thiết lập'}
                     />
                     <DetailRow 
                       label="Thời biểu nộp hồ sơ khóa học" 
                       value={`Từ ${selectedClass.StartDate} tới ${selectedClass.EndDate}`} 
                     />
                     <DetailRow 
                       label="Thời gian cấu tạo lớp học" 
                       value={selectedClass.CreatedAt} 
                     />
                     
                     <div className="space-y-1.5 p-4 rounded-2xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40 col-span-1 md:col-span-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-bold">Mô tả giáo trình & Phương tiện VR (Description)</span>
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
                       Quay lại
                     </button>
                  </div>
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
                     {(MOCK_CHILDREN_IN_CLASS[selectedClass.ClassId] || []).map((student) => (
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

                     {(!MOCK_CHILDREN_IN_CLASS[selectedClass.ClassId] || MOCK_CHILDREN_IN_CLASS[selectedClass.ClassId].length === 0) && (
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
                        Tên lớp học can thiệp (ClassName) <span className="text-[#FF8E8E]">*</span>
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
                        Chuyên viên điều trị (TeacherId) <span className="text-[#FF8E8E]">*</span>
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
                        Học trình / Chương trình học (ProgramId) <span className="text-[#FF8E8E]">*</span>
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
                        Khảo cứu chuyên môn / Mô tả lớp học (Description)
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Mô tả cấu trúc đồ chơi can thiệp hoặc ghi chú tiến trình đặc thù của lớp học..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700 text-sm" 
                      />
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Trạng thái hoạt động
                      </label>
                      <div className="relative">
                        <select 
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] text-sm"
                        >
                          <option value="Upcoming">🟡 Sắp mở khóa học (Upcoming)</option>
                          <option value="Active">🟢 Đang hoạt động tích cực (Active)</option>
                          <option value="Inactive">🔴 Tạm ngưng hoạt động (Inactive)</option>
                          <option value="Closed">⚪ Đã kết thúc & lưu trữ (Closed)</option>
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
