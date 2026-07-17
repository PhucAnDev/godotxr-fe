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
  ArrowRight,
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Play
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import CustomSelect from '../../components/common/CustomSelect';
import { useSemesterManagementApi, type SemesterResponse } from '../../hooks/useSemesterManagementApi';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import ActionButton from '../../components/common/ActionButton';

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

const mapSemester = (semester: SemesterResponse): Semester => ({
  SemesterId: String(semester.id), SchoolYearId: String(semester.schoolYearId),
  TeacherId: String(semester.teacherId), ClassId: '', SemesterName: semester.semesterName,
  ClassCount: semester.classCount, Description: semester.description ?? '',
  StartDate: semester.startDate.slice(0, 10), EndDate: semester.endDate.slice(0, 10),
  Status: semester.status, CreatedAt: semester.createdAt, UpdatedAt: semester.updatedAt ?? semester.createdAt,
});

const formatDateDMY = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
  }
  return dateStr;
};

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
  const { getSemesters, getSchoolYears, getUsers, createSemester, updateSemester, deleteSemester } = useSemesterManagementApi();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSchoolYear, setFilterSchoolYear] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof Semester | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (column: keyof Semester) => {
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

  useEffect(() => {
    void Promise.all([getSemesters(), getSchoolYears(), getUsers(1, 100)]).then(([semesterResult, yearResult, userResult]) => {
      if (semesterResult.success && semesterResult.data) setSemesters(semesterResult.data.items.map(mapSemester));
      else triggerToast(semesterResult.errors.join(' ') || semesterResult.message, 'warning');
      if (yearResult.data) setSchoolYears(yearResult.data.items.map(y => ({ SchoolYearId: String(y.id), SchoolYearName: y.yearName })));
      if (userResult.data) setTeachers(userResult.data.items.filter(u => u.roleName === 'Teacher').map(u => ({ TeacherId: String(u.id), FullName: u.fullName })));
    });
  }, []);

  // Modal controls
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    return schoolYears.find(s => s.SchoolYearId === id)?.SchoolYearName || id;
  };

  const getTeacherName = (id: string) => {
    return teachers.find(t => t.TeacherId === id)?.FullName || id;
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
    setFormSchoolYearId(schoolYears[0]?.SchoolYearId || '');
    setFormTeacherId(teachers[0]?.TeacherId || '');
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

  const handleSaveSubmit = async (e: React.FormEvent) => {
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

    const payload = { semesterName: formSemesterName.trim(), schoolYearId: Number(formSchoolYearId), teacherId: Number(formTeacherId), classCount: Number(formClassCount), description: formDescription.trim(), startDate: formStartDate, endDate: formEndDate, status: formStatus };
    const apiResult = modalMode === 'add' ? await createSemester(payload) : selectedSemester ? await updateSemester(Number(selectedSemester.SemesterId), payload) : null;
    if (apiResult?.success && apiResult.data) {
      const mapped = mapSemester(apiResult.data);
      setSemesters(current => modalMode === 'add' ? [mapped, ...current] : current.map(s => s.SemesterId === mapped.SemesterId ? mapped : s));
      triggerToast(apiResult.message);
      setIsOpenFormModal(false);
    } else if (apiResult) triggerToast(apiResult.errors.join(' ') || apiResult.message, 'warning');
    return;

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

  const handleDeleteClick = (sem: Semester) => {
    setSemesterToDelete(sem);
    setIsOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!semesterToDelete) return;
    setIsDeleting(true);
    const result = await deleteSemester(Number(semesterToDelete.SemesterId));
    if (result.success) {
      setSemesters(current => current.filter(s => s.SemesterId !== semesterToDelete.SemesterId));
      triggerToast(result.message, 'success');
      setIsOpenDeleteModal(false);
      setSemesterToDelete(null);
    } else {
      triggerToast(result.errors.join(' ') || result.message, 'warning');
    }
    setIsDeleting(false);
  };

  const handleUpdateStatus = async (semId: string, newStatus: Semester['Status']) => {
    const semester = semesters.find(s => s.SemesterId === semId);
    if (!semester) return;
    const result = await updateSemester(Number(semId), { semesterName: semester.SemesterName, schoolYearId: Number(semester.SchoolYearId), teacherId: Number(semester.TeacherId), classCount: semester.ClassCount, description: semester.Description, startDate: semester.StartDate, endDate: semester.EndDate, status: newStatus });
    if (!result.success || !result.data) {
      triggerToast(result.errors.join(' ') || result.message, 'warning');
      return;
    }
    setSemesters(current => current.map(s => s.SemesterId === semId ? mapSemester(result.data!) : s));
    triggerToast(result.message);
    return;
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
  const filteredSemesters = useMemo(() => {
    const filtered = semesters.filter(item => {
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

    if (!sortColumn || !sortDirection) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (sortColumn === 'SemesterId') {
        const numA = Number(a.SemesterId.replace(/\D/g, '')) || 0;
        const numB = Number(b.SemesterId.replace(/\D/g, '')) || 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      if (sortColumn === 'SchoolYearId') {
        const nameA = getSchoolYearName(a.SchoolYearId);
        const nameB = getSchoolYearName(b.SchoolYearId);
        return sortDirection === 'asc' ? nameA.localeCompare(nameB, 'vi-VN', { numeric: true }) : nameB.localeCompare(nameA, 'vi-VN', { numeric: true });
      }

      if (sortColumn === 'ClassId') {
        const nameA = getClassName(a.ClassId);
        const nameB = getClassName(b.ClassId);
        return sortDirection === 'asc' ? nameA.localeCompare(nameB, 'vi-VN', { numeric: true }) : nameB.localeCompare(nameA, 'vi-VN', { numeric: true });
      }

      if (sortColumn === 'TeacherId') {
        const nameA = getTeacherName(a.TeacherId);
        const nameB = getTeacherName(b.TeacherId);
        return sortDirection === 'asc' ? nameA.localeCompare(nameB, 'vi-VN', { numeric: true }) : nameB.localeCompare(nameA, 'vi-VN', { numeric: true });
      }

      if (sortColumn === 'ClassCount') {
        return sortDirection === 'asc' ? (Number(valA) || 0) - (Number(valB) || 0) : (Number(valB) || 0) - (Number(valA) || 0);
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB, 'vi-VN', { numeric: true }) : valB.localeCompare(valA, 'vi-VN', { numeric: true });
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [semesters, searchQuery, filterStatus, filterSchoolYear, sortColumn, sortDirection, schoolYears, teachers]);

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
            <p className="text-3xl font-medium text-slate-800 tracking-tight leading-none">{totalSemesters}</p>
            <p className="text-xs text-gray-400 font-normal uppercase tracking-wider mt-1.5">Tổng học kỳ</p>
          </div>
        </div>

        {/* Active Semesters */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-emerald-500 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-600 tracking-tight leading-none">{activeSemesters}</p>
            <p className="text-xs text-gray-400 font-normal uppercase tracking-wider mt-1.5">Đang diễn ra</p>
          </div>
        </div>

        {/* Total Class Count in Semesters */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-amber-500 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-55 rounded-2xl flex items-center justify-center shrink-[#FFF2E2]">
            <Layers className="w-7 h-7 text-amber-55 bg-amber-50 text-amber-500 rounded-lg p-1" />
          </div>
          <div>
            <p className="text-3xl font-black text-amber-600 tracking-tight leading-none">{totalClassesInSemesters}</p>
            <p className="text-xs text-gray-400 font-normal uppercase tracking-wider mt-1.5">Tổng số lớp gán</p>
          </div>
        </div>

        {/* Unique teachers involved */}
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-sky-500 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-sky-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-sky-600 tracking-tight leading-none">{uniqueTeachersCount}</p>
            <p className="text-xs text-gray-400 font-normal uppercase tracking-wider mt-1.5">Giáo viên đồng hành VR</p>
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
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Status filter select */}
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            variant="filter"
            className="w-full sm:w-56"
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'Active', label: 'Đang diễn ra' },
              { value: 'Upcoming', label: 'Sắp diễn ra' },
              { value: 'Completed', label: 'Đã kết thúc' }
            ]}
          />

          {/* School year filter select */}
          <CustomSelect
            value={filterSchoolYear}
            onChange={setFilterSchoolYear}
            variant="filter"
            className="w-full sm:w-64"
            options={[
              { value: 'ALL', label: 'Tất cả năm học' },
              ...schoolYears.map(sy => ({
                value: sy.SchoolYearId,
                label: sy.SchoolYearName
              }))
            ]}
          />
        </div>
      </div>

      {/* 4. Elegant Semesters Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden" id="semester-table-card">
        <div className="px-10 py-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
          <div>
            <h3 className="text-2xl font-medium text-slate-800 leading-none italic">Quản lý Lộ trình Học kỳ</h3>
            <p className="text-xs text-gray-400 font-normal uppercase tracking-wider mt-2">Phân công giáo án và quản lý lộ trình rèn luyện phát âm cho trẻ</p>
          </div>
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
              className="px-6 py-2.5 bg-[#4EACAF]/10 hover:bg-[#4EACAF]/20 text-[#4EACAF] font-medium text-xs uppercase rounded-xl transition-all"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto text-left">
             <table className="w-full border-collapse" id="semester-table-element">
                <thead>
                  <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                    <th
                      onClick={() => handleSort('SemesterId')}
                      className="py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Mã học kỳ"
                    >
                      <div className="flex items-center gap-1.5">
                        Mã học kỳ
                        {sortColumn === 'SemesterId' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('SemesterName')}
                      className="py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Tên học kỳ"
                    >
                      <div className="flex items-center gap-1.5">
                        Tên Học Kỳ
                        {sortColumn === 'SemesterName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('SchoolYearId')}
                      className="py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Năm học"
                    >
                      <div className="flex items-center gap-1.5">
                        Năm học liên đới
                        {sortColumn === 'SchoolYearId' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('TeacherId')}
                      className="py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Giáo viên"
                    >
                      <div className="flex items-center gap-1.5">
                        Giáo viên đảm trách
                        {sortColumn === 'TeacherId' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('ClassCount')}
                      className="py-5 px-[5px] text-center cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Số lớp"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        Số lớp
                        {sortColumn === 'ClassCount' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('StartDate')}
                      className="py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Ngày bắt đầu"
                    >
                      <div className="flex items-center gap-1.5">
                        Ngày khởi chiếu
                        {sortColumn === 'StartDate' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('EndDate')}
                      className="py-5 px-[5px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Ngày kết thúc"
                    >
                      <div className="flex items-center gap-1.5">
                        Ngày kết thúc
                        {sortColumn === 'EndDate' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th className="py-5 px-[5px] select-none">
                      Trạng thái
                    </th>
                    <th className="py-5 px-[5px] text-right select-none">Tùy chọn</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-50 font-normal text-sm text-slate-650">
                {paginatedSemesters.map((sem) => (
                  <tr key={sem.SemesterId} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Semester ID */}
                    <td className="py-5 px-[5px] font-mono text-gray-400 font-extrabold text-xs">
                      {sem.SemesterId}
                    </td>

                    {/* Semester Name & description */}
                    <td className="py-5 px-[5px] max-w-xs">
                      <div className="font-extrabold text-[#111] leading-tight mb-1 text-sm md:text-base">
                        {sem.SemesterName}
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-1">
                        {sem.Description || "Không có miêu tả về lộ trình học này..."}
                      </p>
                    </td>

                    {/* School Year Name */}
                    <td className="py-5 px-[5px] text-teal-600 font-extrabold text-xs">
                      {getSchoolYearName(sem.SchoolYearId)}
                    </td>



                    {/* TeacherName */}
                    <td className="py-5 px-[5px] text-gray-700 font-black text-xs">
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
                    <td className="py-5 px-[5px] text-center">
                      <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-black">
                        {sem.ClassCount} lớp
                      </span>
                    </td>

                    {/* StartDate */}
                    <td className="py-5 px-[5px] text-gray-500 font-mono text-xs">
                      {formatDateDMY(sem.StartDate)}
                    </td>

                    {/* EndDate */}
                    <td className="py-5 px-[5px] text-gray-500 font-mono text-xs">
                      {formatDateDMY(sem.EndDate)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-5 px-[5px]">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
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
                    <td className="py-5 px-[5px] text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Edit button */}
                        <ActionButton
                          type="edit"
                          onClick={() => handleOpenEdit(sem)}
                          title="Chỉnh sửa học kỳ"
                        />

                        {/* Status switcher quick buttons */}
                        {sem.Status === 'Upcoming' && (
                          <ActionButton
                            type="play"
                            onClick={() => handleUpdateStatus(sem.SemesterId, 'Active')}
                            title="Khởi động học kỳ (Bắt đầu)"
                          />
                        )}

                        {sem.Status === 'Active' && (
                          <ActionButton
                            type="lock"
                            onClick={() => handleUpdateStatus(sem.SemesterId, 'Completed')}
                            title="Gác bút hoàn tất học kỳ (Đóng)"
                          />
                        )}

                        {/* Delete button option */}
                        <ActionButton
                          type="delete"
                          onClick={() => handleDeleteClick(sem)}
                          title="Gỡ bỏ vĩnh viễn"
                        />

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
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/15 animate-in fade-in duration-300 overflow-y-auto w-full h-full" id="semester-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30"
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
              <form onSubmit={handleSaveSubmit} className="app-modal-body p-8 space-y-6" id="semester-detail-form">
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
                      <CustomSelect
                        value={formSchoolYearId}
                        onChange={setFormSchoolYearId}
                        variant="form"
                        options={schoolYears.map(sy => ({
                          value: sy.SchoolYearId,
                          label: sy.SchoolYearName
                        }))}
                      />
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
                      <CustomSelect
                        value={formTeacherId}
                        onChange={setFormTeacherId}
                        variant="form"
                        options={teachers.map(tch => ({
                          value: tch.TeacherId,
                          label: tch.FullName
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Giao gán cho lớp học <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <CustomSelect
                        value={formClassId}
                        onChange={setFormClassId}
                        variant="form"
                        options={MOCK_CLASSROOMS.map(cls => ({
                          value: cls.ClassId,
                          label: cls.ClassName
                        }))}
                      />
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
                      className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] text-sm focus:bg-white resize-y"
                    />
                  </div>

                  {/* Status Picker selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Trạng thái định đoạt học kỳ <span className="text-[#FF8E8E]">*</span>
                    </label>
                    <CustomSelect
                      value={formStatus}
                      onChange={(val) => setFormStatus(val as Semester['Status'])}
                      variant="form"
                      options={[
                        { value: 'Upcoming', label: 'Sắp diễn ra (Upcoming)' },
                        { value: 'Active', label: 'Đang diễn ra (Active)' },
                        { value: 'Completed', label: 'Đã kết thúc (Completed)' }
                      ]}
                    />
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

        {isOpenDeleteModal && semesterToDelete && (
          <ConfirmDeleteModal
            title="Xóa học kỳ"
            subtitle="HÀNH ĐỘNG NÀY SẼ XÓA VĨNH VIỄN HỌC KỲ KHỎI HỆ THỐNG"
            onClose={() => {
              setIsOpenDeleteModal(false);
              setSemesterToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
            accent="rose"
          >
            <p className="font-semibold">
              Bạn sắp xóa học kỳ <strong>{semesterToDelete.SemesterName}</strong> (ID: {semesterToDelete.SemesterId}).
            </p>
            <p className="mt-2">
              Tất cả thông tin liên kết lớp và giáo viên có liên quan sẽ bị gián đoạn sinh lý học và hành động này không thể hoàn tác. Vui lòng xác nhận nếu đây là học kỳ bạn thực sự muốn xóa.
            </p>
          </ConfirmDeleteModal>
        )}
      </AnimatePresence>

    </div>
  );
}
