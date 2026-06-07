import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  X, 
  Edit3, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Layers, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Lock, 
  Info,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Sparkles,
  SlidersHorizontal,
  FolderOpen,
  User,
  Activity,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../common/Pagination';

// DB Interfaces according to specifications
interface SchoolYear {
  SchoolYearId: string;
  SchoolYearName: string;
}

interface Teacher {
  TeacherId: string;
  FullName: string;
}

interface Classroom {
  ClassId: string;
  ClassName: string;
}

interface Semester {
  SemesterId: string;
  SchoolYearId: string;
  TeacherId: string;
  ClassId: string;
  SemesterName: string;
  ClassCount: number;
  Description: string;
  StartDate: string;
  EndDate: string;
  Status: 'Active' | 'Upcoming' | 'Completed';
  CreatedAt: string;
  UpdatedAt: string;
}

// Initial Mock data
const MOCK_SCHOOL_YEARS: SchoolYear[] = [
  { SchoolYearId: 'SCH-2024', SchoolYearName: 'Năm học 2024 - 2025' },
  { SchoolYearId: 'SCH-2025', SchoolYearName: 'Năm học 2025 - 2026' },
  { SchoolYearId: 'SCH-2026', SchoolYearName: 'Năm học 2026 - 2027' }
];

const MOCK_TEACHERS: Teacher[] = [
  { TeacherId: 'TCH-001', FullName: 'Trần Thị Hồng (Ms. Johnson)' },
  { TeacherId: 'TCH-002', FullName: 'Lê Hoàng Long' },
  { TeacherId: 'TCH-003', FullName: 'Nguyễn Thị Mai' },
  { TeacherId: 'TCH-004', FullName: 'Phạm Tuấn Anh' }
];

const MOCK_CLASSROOMS: Classroom[] = [
  { ClassId: 'CLS-001', ClassName: 'Lớp Chồi 1 - Ghép vần thông minh' },
  { ClassId: 'CLS-002', ClassName: 'Lớp Mầm 2 - Nhận biết sinh vật sống' },
  { ClassId: 'CLS-003', ClassName: 'Lớp Lá Phản Xạ Cấp 3' },
  { ClassId: 'CLS-004', ClassName: 'Lớp Sửa Ngọng S, X nâng cao' },
  { ClassId: 'CLS-005', ClassName: 'Lớp Chồi 3 - Đọc Truyện 3D' }
];

const INITIAL_SEMESTERS: Semester[] = [
  {
    SemesterId: 'SEM-001',
    SchoolYearId: 'SCH-2025',
    TeacherId: 'TCH-001',
    ClassId: 'CLS-002',
    SemesterName: 'Học kỳ I - Làm quen rèn luyện VR',
    ClassCount: 4,
    Description: 'Học kỳ I tập trung vào các âm đơn phát âm cơ bản, rèn luyện kỹ năng nghe hiểu và phản xạ 3D qua VR.',
    StartDate: '2025-09-01',
    EndDate: '2026-01-15',
    Status: 'Active',
    CreatedAt: '2025-08-20 09:00',
    UpdatedAt: '2025-09-01 08:30'
  },
  {
    SemesterId: 'SEM-002',
    SchoolYearId: 'SCH-2025',
    TeacherId: 'TCH-002',
    ClassId: 'CLS-003',
    SemesterName: 'Học kỳ II - Đọc Truyện 3D VR',
    ClassCount: 5,
    Description: 'Học kỳ II ứng dụng tương tác 3D nâng cao giúp học sinh học và sửa phát âm âm đôi ghép từ.',
    StartDate: '2026-02-01',
    EndDate: '2026-05-31',
    Status: 'Active',
    CreatedAt: '2026-01-20 10:00',
    UpdatedAt: '2026-02-01 09:00'
  },
  {
    SemesterId: 'SEM-003',
    SchoolYearId: 'SCH-2026',
    TeacherId: 'TCH-003',
    ClassId: 'CLS-001',
    SemesterName: 'Học kỳ I - Năm học mới 2026-2027',
    ClassCount: 3,
    Description: 'Khởi động khóa rèn luyện phát âm VR thế hệ mới cho các học sinh nhập học đợt mùa thu.',
    StartDate: '2026-09-01',
    EndDate: '2027-01-15',
    Status: 'Upcoming',
    CreatedAt: '2026-05-15 14:00',
    UpdatedAt: '2026-05-15 14:00'
  }
];

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState<Semester[]>(INITIAL_SEMESTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSchoolYear, setFilterSchoolYear] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Auto-reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterSchoolYear]);

  // Popup toasts feedback helper
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => setAlertConfig(null), 3500);
  };

  // Modal controls
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  // Form Inputs
  const [formSchoolYearId, setFormSchoolYearId] = useState('SCH-2025');
  const [formTeacherId, setFormTeacherId] = useState('TCH-001');
  const [formClassId, setFormClassId] = useState('CLS-002');
  const [formSemesterName, setFormSemesterName] = useState('');
  const [formClassCount, setFormClassCount] = useState<number>(4);
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<Semester['Status']>('Upcoming');

  // Helper resolvers
  const getSchoolYearName = (id: string) => {
    return MOCK_SCHOOL_YEARS.find(s => s.SchoolYearId === id)?.SchoolYearName || id;
  };

  const getTeacherName = (id: string) => {
    return MOCK_TEACHERS.find(t => t.TeacherId === id)?.FullName || id;
  };

  const getClassName = (id: string) => {
    return MOCK_CLASSROOMS.find(c => c.ClassId === id)?.ClassName || id;
  };

  // Stats calculation
  const totalSemesters = semesters.length;
  const activeSemesters = semesters.filter(s => s.Status === 'Active').length;
  const totalClassesInSemesters = semesters.reduce((acc, curr) => acc + (Number(curr.ClassCount) || 0), 0);
  const uniqueTeachersCount = new Set(semesters.map(s => s.TeacherId)).size;

  // Actions
  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedSemester(null);
    setFormSchoolYearId(MOCK_SCHOOL_YEARS[0]?.SchoolYearId || '');
    setFormTeacherId(MOCK_TEACHERS[0]?.TeacherId || '');
    setFormClassId(MOCK_CLASSROOMS[0]?.ClassId || '');
    setFormSemesterName('');
    setFormClassCount(4);
    setFormDescription('');
    setFormStartDate('');
    setFormEndDate('');
    setFormStatus('Upcoming');
    setIsOpenFormModal(true);
  };

  const handleOpenEdit = (sem: Semester) => {
    setModalMode('edit');
    setSelectedSemester(sem);
    setFormSchoolYearId(sem.SchoolYearId);
    setFormTeacherId(sem.TeacherId);
    setFormClassId(sem.ClassId);
    setFormSemesterName(sem.SemesterName);
    setFormClassCount(sem.ClassCount);
    setFormDescription(sem.Description);
    setFormStartDate(sem.StartDate);
    setFormEndDate(sem.EndDate);
    setFormStatus(sem.Status);
    setIsOpenFormModal(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSemesterName.trim()) {
      triggerToast('Tên học kỳ bắt buộc phải nhập!', 'warning');
      return;
    }
    if (!formStartDate) {
      triggerToast('Ngày bắt đầu học kỳ không được để trống!', 'warning');
      return;
    }
    if (!formEndDate) {
      triggerToast('Ngày kết thúc học kỳ không được để trống!', 'warning');
      return;
    }
    if (new Date(formStartDate) >= new Date(formEndDate)) {
      triggerToast('Ngày bắt đầu phải trước ngày kết thúc học kỳ!', 'warning');
      return;
    }

    const sysDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (modalMode === 'add') {
      const randomPrefix = Math.floor(Math.random() * 900) + 100;
      const nextId = `SEM-${randomPrefix}`;

      const newSemester: Semester = {
        SemesterId: nextId,
        SchoolYearId: formSchoolYearId,
        TeacherId: formTeacherId,
        ClassId: formClassId,
        SemesterName: formSemesterName,
        ClassCount: Number(formClassCount) || 0,
        Description: formDescription,
        StartDate: formStartDate,
        EndDate: formEndDate,
        Status: formStatus,
        CreatedAt: sysDate,
        UpdatedAt: sysDate
      };

      setSemesters([newSemester, ...semesters]);
      triggerToast(`Thêm học kỳ "${formSemesterName}" thành công!`);
    } else {
      if (!selectedSemester) return;

      const updated = semesters.map(s => {
        if (s.SemesterId === selectedSemester.SemesterId) {
          return {
            ...s,
            SchoolYearId: formSchoolYearId,
            TeacherId: formTeacherId,
            ClassId: formClassId,
            SemesterName: formSemesterName,
            ClassCount: Number(formClassCount) || 0,
            Description: formDescription,
            StartDate: formStartDate,
            EndDate: formEndDate,
            Status: formStatus,
            UpdatedAt: sysDate
          };
        }
        return s;
      });

      setSemesters(updated);
      triggerToast(`Cập nhật thông tin học kỳ "${selectedSemester.SemesterId}" thành công.`);
    }

    setIsOpenFormModal(false);
  };

  const handleDelete = (semId: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học kỳ ${semId}? Tất cả thông tin liên kết lớp và giáo viên có liên quan sẽ bị gián đoạn sinh lý học.`)) {
      setSemesters(semesters.filter(s => s.SemesterId !== semId));
      triggerToast(`Đã gỡ bỏ học kỳ "${semId}" khỏi hệ thống điều hành.`, 'warning');
    }
  };

  const handleUpdateStatus = (semId: string, newStatus: Semester['Status']) => {
    const updated = semesters.map(s => {
      if (s.SemesterId === semId) {
        return {
          ...s,
          Status: newStatus,
          UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
      }
      return s;
    });
    setSemesters(updated);
    triggerToast(`Đã chuyển đổi trạng thái học kỳ thành "${newStatus === 'Active' ? 'Đang diễn ra' : newStatus === 'Completed' ? 'Đã kết thúc' : 'Sắp diễn ra'}".`);
  };

  // Searching & filtering logic
  const filteredSemesters = semesters.filter(item => {
    const schoolYearName = getSchoolYearName(item.SchoolYearId).toLowerCase();
    const teacherName = getTeacherName(item.TeacherId).toLowerCase();
    const className = getClassName(item.ClassId).toLowerCase();
    const semName = item.SemesterName.toLowerCase();
    const semId = item.SemesterId.toLowerCase();

    const combineSearchText = `${semName} ${semId} ${schoolYearName} ${teacherName} ${className}`;
    const queryMatch = combineSearchText.includes(searchQuery.toLowerCase());

    const statusMatch = filterStatus === 'ALL' || item.Status === filterStatus;
    const yearMatch = filterSchoolYear === 'ALL' || item.SchoolYearId === filterSchoolYear;

    return queryMatch && statusMatch && yearMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSemesters.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedSemesters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSemesters.slice(startIndex, startIndex + pageSize);
  }, [filteredSemesters, currentPage, pageSize]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative" id="semester-root-view">
      
      {/* Dynamic Toast Feedback Overlay */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="semester-toast-box"
          >
            <div className={cn(
              "p-5 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-white backdrop-blur-md",
              alertConfig.type === 'success' ? 'bg-[#4EACAF]/95 text-white' : 'bg-[#FF8E8E]/95 text-white'
            )}>
              {alertConfig.type === 'success' ? (
                <div className="bg-white/20 p-2 rounded-xl shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="bg-white/20 p-2 rounded-xl shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0 font-bold">
                <p className="italic text-sm tracking-tight text-white leading-snug">{alertConfig.message}</p>
              </div>
              <button 
                onClick={() => setAlertConfig(null)} 
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Hero Panel */}
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <BookOpen className="w-3.5 h-3.5" />
            Điều phối sơ đồ học kỳ rèn luyện
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1">
            Quản Lý <span className="text-[#4EACAF]">Học Kỳ</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed">
            Gán lớp học và giáo viên vào từng học kỳ. Điều tiết kế hoạch rèn luyện, phân hóa chương trình dạy học GodotXR.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          id="add-semester-btn"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Thêm học kỳ mới
        </button>
      </div>

      {/* 2. Kid-friendly visual Statistics indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total semesters */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#4EACAF] shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
            <FolderOpen className="w-7 h-7 text-[#4EACAF]" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{totalSemesters}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tổng học kỳ</p>
          </div>
        </div>

        {/* Active Semesters */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-emerald-500 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-600 tracking-tight leading-none">{activeSemesters}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Đang diễn ra</p>
          </div>
        </div>

        {/* Total Class Count in Semesters */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-amber-500 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-55 rounded-2xl flex items-center justify-center shrink-[#FFF2E2]">
            <Layers className="w-7 h-7 text-amber-55 bg-amber-50 text-amber-500 rounded-lg p-1" />
          </div>
          <div>
            <p className="text-3xl font-black text-amber-600 tracking-tight leading-none">{totalClassesInSemesters}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Tổng số lớp gán</p>
          </div>
        </div>

        {/* Unique teachers involved */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-sky-500 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-sky-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-sky-600 tracking-tight leading-none">{uniqueTeachersCount}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Giáo viên đồng hành VR</p>
          </div>
        </div>
      </div>

      {/* 3. Search & filter bar */}
      <div className="bg-white rounded-[36px] p-6 shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4" id="sem-filter-container">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo học kỳ, niên khóa, giáo viên, lớp học..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FDFCF5] border-2 border-transparent font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 bg-gray-200/60 rounded-full hover:bg-gray-200 animate-in zoom-in-50 duration-200"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Dropdown Filters group */}
        <div className="flex flex-col sm:flex-row gap-4">
          
          {/* Status filter select */}
          <div className="relative w-full sm:w-56">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent hover:border-[#4EACAF]/20 pl-5 pr-10 py-4 rounded-2xl font-black italic text-xs tracking-wide text-gray-700 outline-none cursor-pointer uppercase focus:bg-white focus:border-[#4EACAF]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Active">Đang diễn ra</option>
              <option value="Upcoming">Sắp diễn ra</option>
              <option value="Completed">Đã kết thúc</option>
            </select>
            <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* School year filter select */}
          <div className="relative w-full sm:w-64">
            <select 
              value={filterSchoolYear}
              onChange={(e) => setFilterSchoolYear(e.target.value)}
              className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent hover:border-[#4EACAF]/20 pl-5 pr-10 py-4 rounded-2xl font-black italic text-xs tracking-wide text-gray-700 outline-none cursor-pointer uppercase focus:bg-white focus:border-[#4EACAF]"
            >
              <option value="ALL">Tất cả năm học</option>
              {MOCK_SCHOOL_YEARS.map(sy => (
                <option key={sy.SchoolYearId} value={sy.SchoolYearId}>
                  {sy.SchoolYearName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* 4. Elegant Semesters Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden" id="semester-table-card">
        <div className="px-10 py-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
          <div>
            <h3 className="text-2xl font-black text-gray-900 leading-none italic">Chi tiết cấu phân hệ Học kỳ</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Dữ liệu phân công giáo án và hỗ trợ bé sửa ngọng GodotXR</p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-100/30 self-start sm:self-center">
            SEMASTERS
          </span>
        </div>

        {filteredSemesters.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700">Không tìm thấy thông tin học kỳ tương ứng!</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
                setFilterSchoolYear('ALL');
              }}
              className="px-6 py-2.5 bg-[#4EACAF]/10 hover:bg-[#4EACAF]/20 text-[#4EACAF] font-black text-xs uppercase rounded-xl transition-all"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto text-left">
            <table className="w-full border-collapse" id="semester-table-element">
              <thead>
                <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                  <th className="py-5 px-10">Mã học kỳ</th>
                  <th className="py-5 px-6">Tên Học Kỳ</th>
                  <th className="py-5 px-6">Năm học liên đới</th>
                  <th className="py-5 px-6">Lớp học</th>
                  <th className="py-5 px-6">Giáo viên đảm trách</th>
                  <th className="py-5 px-6 text-center">Gán cơ số lớp</th>
                  <th className="py-5 px-6">Ngày khởi chiếu</th>
                  <th className="py-5 px-6">Ngày kết bế</th>
                  <th className="py-5 px-6">Trạng thái hoạt động</th>
                  <th className="py-5 px-10 text-right">Tác vụ can thiệp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                {paginatedSemesters.map((sem) => (
                  <tr key={sem.SemesterId} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Semester ID */}
                    <td className="py-5 px-10 font-mono text-gray-400 font-extrabold text-xs">
                      {sem.SemesterId}
                    </td>

                    {/* Semester Name & description */}
                    <td className="py-5 px-6 max-w-xs">
                      <div className="font-extrabold text-[#111] leading-tight mb-1 text-sm md:text-base">
                        {sem.SemesterName}
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-1">
                        {sem.Description || "Không có miêu tả về lộ trình học này..."}
                      </p>
                    </td>

                    {/* School Year Name */}
                    <td className="py-5 px-6 text-teal-600 font-extrabold text-xs">
                      {getSchoolYearName(sem.SchoolYearId)}
                    </td>

                    {/* ClassName */}
                    <td className="py-5 px-6 font-semibold text-gray-600 text-xs">
                      <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg">
                        {getClassName(sem.ClassId)}
                      </span>
                    </td>

                    {/* TeacherName */}
                    <td className="py-5 px-6 text-gray-700 font-black text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 border border-indigo-100 text-[10px]">
                          {getTeacherName(sem.TeacherId).slice(0, 2)}
                        </div>
                        <span className="truncate max-w-[150px]">
                          {getTeacherName(sem.TeacherId)}
                        </span>
                      </div>
                    </td>

                    {/* Class count */}
                    <td className="py-5 px-6 text-center">
                      <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-black">
                        {sem.ClassCount} lớp
                      </span>
                    </td>

                    {/* StartDate */}
                    <td className="py-5 px-6 text-gray-500 font-mono text-xs">
                      {sem.StartDate}
                    </td>

                    {/* EndDate */}
                    <td className="py-5 px-6 text-gray-500 font-mono text-xs">
                      {sem.EndDate}
                    </td>

                    {/* Status Badge */}
                    <td className="py-5 px-6">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                        sem.Status === 'Active' && 'bg-emerald-50 text-emerald-600 border-emerald-100',
                        sem.Status === 'Upcoming' && 'bg-amber-50 text-amber-600 border-amber-100',
                        sem.Status === 'Completed' && 'bg-gray-100 text-gray-500 border-gray-200'
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          sem.Status === 'Active' && 'bg-emerald-500',
                          sem.Status === 'Upcoming' && 'bg-amber-500',
                          sem.Status === 'Completed' && 'bg-gray-400'
                        )} />
                        {sem.Status === 'Active' ? 'Đang diễn ra' : 
                         sem.Status === 'Upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                      </span>
                    </td>

                    {/* Actions tools */}
                    <td className="py-5 px-10 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Edit button */}
                        <button
                          onClick={() => handleOpenEdit(sem)}
                          className="py-1.5 px-3 bg-teal-50 hover:bg-[#4EACAF] text-[#4EACAF] hover:text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1"
                          title="Chỉnh sửa học kỳ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Sửa
                        </button>

                        {/* Status switcher quick buttons */}
                        {sem.Status === 'Upcoming' && (
                          <button
                            onClick={() => handleUpdateStatus(sem.SemesterId, 'Active')}
                            className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-xs font-black transition-colors"
                            title="Khởi động học kỳ"
                          >
                            Bắt đầu
                          </button>
                        )}

                        {sem.Status === 'Active' && (
                          <button
                            onClick={() => handleUpdateStatus(sem.SemesterId, 'Completed')}
                            className="py-1.5 px-2 bg-gray-100 hover:bg-gray-500 text-gray-500 hover:text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1"
                            title="Gác bút hoàn tất học kỳ"
                          >
                            <Lock className="w-3 h-3" />
                            Đóng
                          </button>
                        )}

                        {/* Delete button option */}
                        <button
                          onClick={() => handleDelete(sem.SemesterId)}
                          className="p-1.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-colors"
                          title="Gỡ bỏ vĩnh viễn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredSemesters.length > 0 && (
          <div className="px-10 py-6 border-t border-gray-50 bg-white">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredSemesters.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemLabel="học kỳ"
            />
          </div>
        )}
      </div>

      {/* 5. Create / Edit form Modal Container overlay */}
      <AnimatePresence>
        {isOpenFormModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/15 animate-in fade-in duration-300 overflow-y-auto w-full h-full" id="semester-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30"
              id="semester-modal-box"
            >
              {/* Header block */}
              <div className={cn(
                "px-8 py-6 flex items-center justify-between border-b",
                modalMode === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' : 'bg-sky-50 border-sky-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalMode === 'add' ? <Plus className="w-6 h-6 text-[#4EACAF]" strokeWidth={2.5} /> : <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalMode === 'add' ? 'Thiết lập Học kỳ rèn luyện mới' : `Chỉnh sửa học kỳ: ${selectedSemester?.SemesterId}`}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Gán lớp học, chọn giáo viên chủ quản điều tiết khóa rèn luyện VR
                  </p>
                </div>
                <button 
                  onClick={() => setIsOpenFormModal(false)}
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Form Input areas */}
              <form onSubmit={handleSaveSubmit} className="p-8 space-y-6" id="semester-detail-form">
                <div className="space-y-4">
                  
                  {/* Semester Name value input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Tên Học kỳ phái sinh <span className="text-[#FF8E8E]">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Học kỳ I - Luyện phản xạ VR rèn luyện..."
                      value={formSemesterName}
                      onChange={(e) => setFormSemesterName(e.target.value)}
                      className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] text-sm focus:bg-white"
                      maxLength={60}
                    />
                  </div>

                  {/* School Year Select Dropdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Thuộc Niên Khóa chính <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formSchoolYearId}
                          onChange={(e) => setFormSchoolYearId(e.target.value)}
                          className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent rounded-2xl pl-5 pr-10 py-4 font-black italic text-xs tracking-wide text-gray-700 outline-none cursor-pointer uppercase focus:bg-white focus:border-[#4EACAF]"
                        >
                          {MOCK_SCHOOL_YEARS.map(sy => (
                            <option key={sy.SchoolYearId} value={sy.SchoolYearId}>
                              {sy.SchoolYearName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Cơ số lớp trong học kỳ <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="number" 
                        min={1}
                        max={30}
                        value={formClassCount}
                        onChange={(e) => setFormClassCount(Number(e.target.value) || 1)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] text-sm focus:bg-white"
                      />
                    </div>

                  </div>

                  {/* Teacher & Class select grids */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Giáo viên trưởng khoa phụ trách <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formTeacherId}
                          onChange={(e) => setFormTeacherId(e.target.value)}
                          className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent rounded-2xl pl-5 pr-10 py-4 font-black italic text-[11px] tracking-tight text-gray-700 outline-none cursor-pointer uppercase focus:bg-white focus:border-[#4EACAF]"
                        >
                          {MOCK_TEACHERS.map(tch => (
                            <option key={tch.TeacherId} value={tch.TeacherId}>
                              {tch.FullName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Giao gán cho lớp học <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formClassId}
                          onChange={(e) => setFormClassId(e.target.value)}
                          className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent rounded-2xl pl-5 pr-10 py-4 font-black italic text-[11px] tracking-tight text-gray-700 outline-none cursor-pointer uppercase focus:bg-white focus:border-[#4EACAF]"
                        >
                          {MOCK_CLASSROOMS.map(cls => (
                            <option key={cls.ClassId} value={cls.ClassId}>
                              {cls.ClassName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                  </div>

                  {/* Dates input cluster */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Start date */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Ngày khai khóa <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] text-sm focus:bg-white"
                      />
                    </div>

                    {/* End date */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Ngày kết thúc dự kiến <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] text-sm focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Description input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Mô tả lộ trình học kỳ
                    </label>
                    <textarea 
                      placeholder="Mô tả các yêu cầu rèn luyện phát âm, phương pháp GodotXR được áp dụng..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] text-sm focus:bg-white resize-none"
                    />
                  </div>

                  {/* Status Picker selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Trạng thái định đoạt học kỳ <span className="text-[#FF8E8E]">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as Semester['Status'])}
                        className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent rounded-2xl pl-5 pr-10 py-4 font-black italic text-xs tracking-wide text-gray-700 outline-none cursor-pointer uppercase focus:bg-white focus:border-[#4EACAF]"
                      >
                        <option value="Upcoming">Sắp diễn ra (Upcoming)</option>
                        <option value="Active">Đang diễn ra (Active)</option>
                        <option value="Completed">Đã kết thúc (Completed)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                </div>

                {/* Submit footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
                  <button 
                    type="button"
                    onClick={() => setIsOpenFormModal(false)}
                    className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-500 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="py-3.5 px-8 bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-[#4EACAF]/10"
                    id="save-semester-submit"
                  >
                    <Check className="w-4 h-4" />
                    Lưu học kỳ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
