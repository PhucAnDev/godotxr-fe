import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, 
  Users, 
  Calendar, 
  Baby, 
  Search, 
  ChevronDown, 
  X, 
  Plus, 
  Check, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Clock, 
  ShieldCheck, 
  Smile, 
  Sparkles,
  ArrowRightLeft,
  XCircle,
  TrendingUp,
  Brain,
  Activity,
  Award,
  CheckCircle2,
  Trash2,
  BookOpen,
  Info,
  ExternalLink
} from 'lucide-react';
import { cn, resolveAvatarUrl } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import CustomSelect from '../../components/common/CustomSelect';
import { useEnrollmentManagementApi, type EnrollmentResponse } from '../../hooks/useEnrollmentManagementApi';

// DB Interfaces
interface Child {
  ChildId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  Status: 'Active' | 'Inactive';
  Avatar?: string | null;
}

interface Classroom {
  ClassId: string;
  ClassName: string;
  TeacherId: string;
  TeacherName: string;
  ProgramId: string;
  ProgramName: string;
  Status: 'Active' | 'Inactive' | 'Upcoming' | 'Closed';
}

interface Enrollment {
  EnrollmentId: string;
  ChildId: string;
  ClassId: string;
  EnrollmentDate: string;
  Status: 'Active' | 'Completed' | 'Cancelled' | 'Pending'; // Đang học, Đã hoàn thành, Đã hủy, Chờ duyệt
  CreatedAt: string;
  UpdatedAt: string;
}

const mapEnrollment = (enrollment: EnrollmentResponse): Enrollment => ({
  EnrollmentId: String(enrollment.id), ChildId: String(enrollment.childId), ClassId: String(enrollment.classId),
  EnrollmentDate: enrollment.enrollmentDate.slice(0, 10), Status: enrollment.status as Enrollment['Status'],
  CreatedAt: enrollment.createdAt, UpdatedAt: enrollment.updatedAt,
});

// Mock Data
const MOCK_CHILDREN: Child[] = [
  { ChildId: 'CHD-001', FullName: 'Leo (Phạm Minh Đức)', Age: 6, Gender: 'Male', LearningLevel: 'Advanced', Status: 'Active' },
  { ChildId: 'CHD-002', FullName: 'Mimi (Phạm Ngọc Linh)', Age: 4, Gender: 'Female', LearningLevel: 'Beginner', Status: 'Active' },
  { ChildId: 'CHD-003', FullName: 'Bi (Nguyễn Đức Huy)', Age: 5, Gender: 'Male', LearningLevel: 'Intermediate', Status: 'Active' },
  { ChildId: 'CHD-004', FullName: 'Sơn con (Nguyễn Thanh Lâm)', Age: 7, Gender: 'Male', LearningLevel: 'Advanced', Status: 'Active' },
  { ChildId: 'CHD-005', FullName: 'Tép (Nguyễn Hải Yến)', Age: 3, Gender: 'Female', LearningLevel: 'Beginner', Status: 'Inactive' }
];

const MOCK_CLASSROOMS: Classroom[] = [
  { 
    ClassId: 'CLS-001', 
    ClassName: 'Lớp Chồi 1 - Ghép vần thông minh', 
    TeacherId: 'TCH-001',
    TeacherName: 'Trần Thị Hồng (Ms. Johnson)',
    ProgramId: 'PRG-002', 
    ProgramName: 'Luyện phát âm âm đôi & Cụm từ thông dụng (Level 2)',
    Status: 'Active'
  },
  { 
    ClassId: 'CLS-002', 
    ClassName: 'Lớp Mầm 2 - Nhận biết sinh vật sống', 
    TeacherId: 'TCH-003',
    TeacherName: 'Nguyễn Thị Mai',
    ProgramId: 'PRG-001', 
    ProgramName: 'Nhận diện âm đơn & Từ vựng căn bản (Level 1)',
    Status: 'Active'
  },
  { 
    ClassId: 'CLS-003', 
    ClassName: 'Lớp Lá Phản Xạ Cấp 3', 
    TeacherId: 'TCH-002',
    TeacherName: 'Lê Hoàng Long',
    ProgramId: 'PRG-003', 
    ProgramName: 'Kích hoạt phản xạ hội thoại & Kể chuyện 3D (Level 3)',
    Status: 'Active'
  },
  { 
    ClassId: 'CLS-004', 
    ClassName: 'Lớp Sửa Ngọng S, X nâng cao', 
    TeacherId: 'TCH-004',
    TeacherName: 'Phạm Tuấn Anh',
    ProgramId: 'PRG-004', 
    ProgramName: 'Luyện âm tương tác & Sửa ngọng phụ âm gió (Level 4)',
    Status: 'Closed'
  },
  { 
    ClassId: 'CLS-005', 
    ClassName: 'Lớp Chồi 3 - Đọc Truyện 3D', 
    TeacherId: 'TCH-001',
    TeacherName: 'Trần Thị Hồng (Ms. Johnson)',
    ProgramId: 'PRG-003', 
    ProgramName: 'Kích hoạt phản xạ hội thoại & Kể chuyện 3D (Level 3)',
    Status: 'Active'
  }
];

const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    EnrollmentId: 'ENR-001',
    ChildId: 'CHD-001',
    ClassId: 'CLS-001',
    EnrollmentDate: '2026-05-18',
    Status: 'Active',
    CreatedAt: '2026-05-15 10:00',
    UpdatedAt: '2026-05-18 10:30'
  },
  {
    EnrollmentId: 'ENR-002',
    ChildId: 'CHD-002',
    ClassId: 'CLS-002',
    EnrollmentDate: '2026-05-20',
    Status: 'Active',
    CreatedAt: '2026-05-19 14:00',
    UpdatedAt: '2026-05-20 09:00'
  },
  {
    EnrollmentId: 'ENR-003',
    ChildId: 'CHD-003',
    ClassId: 'CLS-001',
    EnrollmentDate: '2026-04-05',
    Status: 'Completed',
    CreatedAt: '2026-04-01 11:30',
    UpdatedAt: '2026-05-28 16:00'
  },
  {
    EnrollmentId: 'ENR-004',
    ChildId: 'CHD-004',
    ClassId: 'CLS-003',
    EnrollmentDate: '2026-03-12',
    Status: 'Active',
    CreatedAt: '2026-03-10 09:00',
    UpdatedAt: '2026-03-12 15:00'
  },
  {
    EnrollmentId: 'ENR-005',
    ChildId: 'CHD-005',
    ClassId: 'CLS-002',
    EnrollmentDate: '2026-03-15',
    Status: 'Cancelled',
    CreatedAt: '2026-03-14 16:30',
    UpdatedAt: '2026-04-01 10:00'
  },
  {
    EnrollmentId: 'ENR-006',
    ChildId: 'CHD-001',
    ClassId: 'CLS-003',
    EnrollmentDate: '2026-05-29',
    Status: 'Pending',
    CreatedAt: '2026-05-29 17:30',
    UpdatedAt: '2026-05-29 17:30'
  }
];

export default function EnrollmentManagement() {
  const { getEnrollments, getChildProfiles, getClassrooms, createEnrollment, updateEnrollment, transferEnrollment, approveEnrollment } = useEnrollmentManagementApi();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page of enrollments on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterClass, filterLevel]);

  // Modal Setup
  const [modalType, setModalType] = useState<'add' | 'edit' | 'detail' | 'transfer' | 'cancel_confirm' | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form States
  const [formChildId, setFormChildId] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formEnrollmentDate, setFormEnrollmentDate] = useState('');
  const [formStatus, setFormStatus] = useState<Enrollment['Status']>('Active');

  // Sparkle notification trigger
  const triggerNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => {
      setAlertConfig(null);
    }, 4000);
  };

  useEffect(() => {
    void Promise.all([getEnrollments(), getChildProfiles(), getClassrooms()]).then(([enrollmentResult, childResult, classResult]) => {
      if (enrollmentResult.success && enrollmentResult.data) setEnrollments(enrollmentResult.data.items.map(mapEnrollment));
      else triggerNotification(enrollmentResult.errors.join(' ') || enrollmentResult.message, 'warning');
      if (childResult.data) setChildren(childResult.data.items.map(c => ({ ChildId: String(c.id), FullName: c.fullName, Age: c.age, Gender: c.gender, LearningLevel: c.learningLevel, Status: c.status, Avatar: c.avatar || null })));
      if (classResult.data) setClassrooms(classResult.data.items.map(c => ({ ClassId: String(c.id), ClassName: c.className, TeacherId: String(c.userId), TeacherName: c.teacherName, ProgramId: String(c.programId), ProgramName: c.programName, Status: c.status as Classroom['Status'] })));
    });
  }, []);

  // Stats Counters
  const totalEnrollments = enrollments.length;
  const activeCount = enrollments.filter(e => e.Status === 'Active').length;
  const completedCount = enrollments.filter(e => e.Status === 'Completed').length;
  const cancelledCount = enrollments.filter(e => e.Status === 'Cancelled').length;

  // Show forms
  const handleOpenAdd = () => {
    // Default selecting active kids and classes if they exist
    const defaultChild = children.find(c => c.Status === 'Active')?.ChildId || children[0]?.ChildId || '';
    const defaultClass = classrooms.find(cls => cls.Status === 'Active')?.ClassId || classrooms[0]?.ClassId || '';
    
    setFormChildId(defaultChild);
    setFormClassId(defaultClass);
    setFormEnrollmentDate(new Date().toISOString().slice(0, 10));
    setFormStatus('Active');
    setSelectedEnrollment(null);
    setModalType('add');
  };

  const handleOpenEdit = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setFormChildId(enrollment.ChildId);
    setFormClassId(enrollment.ClassId);
    setFormEnrollmentDate(enrollment.EnrollmentDate);
    setFormStatus(enrollment.Status);
    setModalType('edit');
  };

  const handleOpenDetail = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setModalType('detail');
  };

  const handleOpenTransfer = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setFormClassId(enrollment.ClassId);
    setModalType('transfer');
  };

  const handleOpenCancelConfirm = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setModalType('cancel_confirm');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedEnrollment(null);
  };

  // Form submit handler with validation UI
  const handleSaveEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formChildId) {
      triggerNotification('Vui lòng chọn em bé muốn ghi danh!', 'warning');
      return;
    }

    if (!formClassId) {
      triggerNotification('Vui lòng chọn lớp học tiếp nhận!', 'warning');
      return;
    }

    if (!formEnrollmentDate) {
      triggerNotification('Vui lòng điền ngày bắt đầu nhập lớp!', 'warning');
      return;
    }

    const currentChild = children.find(c => c.ChildId === formChildId);
    const currentClass = classrooms.find(cls => cls.ClassId === formClassId);

    if (!currentChild) {
      triggerNotification('Mã định danh bé không hợp lệ!', 'warning');
      return;
    }

    if (!currentClass) {
      triggerNotification('Mã lớp học không tồn tại!', 'warning');
      return;
    }

    const payload = { childId: Number(formChildId), classId: Number(formClassId), enrollmentDate: formEnrollmentDate, status: formStatus };
    const apiResult = modalType === 'add' ? await createEnrollment(payload) : selectedEnrollment ? await updateEnrollment(Number(selectedEnrollment.EnrollmentId), payload) : null;
    if (apiResult?.success && apiResult.data) {
      const mapped = mapEnrollment(apiResult.data);
      setEnrollments(current => modalType === 'add' ? [mapped, ...current] : current.map(e => e.EnrollmentId === mapped.EnrollmentId ? mapped : e));
      triggerNotification(apiResult.message);
      handleCloseModal();
    } else if (apiResult) triggerNotification(apiResult.errors.join(' ') || apiResult.message, 'warning');
    return;

    if (modalType === 'add') {
      // Check if duplicate active enrollment exists
      const isDuplicated = enrollments.some(
        e => e.ChildId === formChildId && e.ClassId === formClassId && e.Status === 'Active'
      );

      if (isDuplicated) {
        triggerNotification(`Đã tồn tại hồ sơ ghi danh đang học của bé ${currentChild.FullName} tại lớp ${currentClass.ClassName}!`, 'warning');
        return;
      }

      const newId = `ENR-${String(enrollments.length + 1).padStart(3, '0')}`;
      const newEnrollment: Enrollment = {
        EnrollmentId: newId,
        ChildId: formChildId,
        ClassId: formClassId,
        EnrollmentDate: formEnrollmentDate,
        Status: formStatus,
        CreatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setEnrollments([newEnrollment, ...enrollments]);
      triggerNotification(`Đã ghi danh thành công bé "${currentChild.FullName}" vào lớp "${currentClass.ClassName}"!`);
    } else if (modalType === 'edit' && selectedEnrollment) {
      setEnrollments(enrollments.map(e => e.EnrollmentId === selectedEnrollment.EnrollmentId ? {
        ...e,
        ChildId: formChildId,
        ClassId: formClassId,
        EnrollmentDate: formEnrollmentDate,
        Status: formStatus,
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      } : e));

      triggerNotification(`Đã cập nhật hồ sơ ghi danh ${selectedEnrollment.EnrollmentId}!`);
    }

    handleCloseModal();
  };

  // Transfer class submit action
  const handleTransferClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEnrollment) return;

    if (!formClassId || formClassId === selectedEnrollment.ClassId) {
      triggerNotification('Vui lòng chọn lớp học mục tiêu khác lớp học cũ!', 'warning');
      return;
    }

    const nextClass = classrooms.find(c => c.ClassId === formClassId);
    const childObj = children.find(c => c.ChildId === selectedEnrollment.ChildId);

    if (!nextClass || !childObj) {
      triggerNotification('Lỗi dữ liệu cấu hình lớp học hoặc học sinh!', 'warning');
      return;
    }

    const result = await transferEnrollment(Number(selectedEnrollment.EnrollmentId), Number(formClassId));
    if (result.success && result.data) {
      setEnrollments(current => current.map(e => e.EnrollmentId === selectedEnrollment.EnrollmentId ? mapEnrollment(result.data!) : e));
      triggerNotification(result.message);
      handleCloseModal();
    } else triggerNotification(result.errors.join(' ') || result.message, 'warning');
  };

  // Set to cancelled quick action
  const handleCancelEnrollment = async (enrollment: Enrollment) => {
    const childObj = children.find(c => c.ChildId === enrollment.ChildId);
    const result = await updateEnrollment(Number(enrollment.EnrollmentId), { childId: Number(enrollment.ChildId), classId: Number(enrollment.ClassId), enrollmentDate: enrollment.EnrollmentDate, status: 'Cancelled' });
    if (result.success && result.data) {
      setEnrollments(current => current.map(e => e.EnrollmentId === enrollment.EnrollmentId ? mapEnrollment(result.data!) : e));
      triggerNotification(result.message, 'warning');
    } else triggerNotification(result.errors.join(' ') || result.message, 'warning');
  };

  // Approve pending approval enrollment helper
  const handleApproveEnrollment = async (enrollment: Enrollment) => {
    const childObj = children.find(c => c.ChildId === enrollment.ChildId);
    const result = await approveEnrollment(Number(enrollment.EnrollmentId));
    if (result.success && result.data) {
      setEnrollments(current => current.map(e => e.EnrollmentId === enrollment.EnrollmentId ? mapEnrollment(result.data!) : e));
      triggerNotification(result.message);
    } else triggerNotification(result.errors.join(' ') || result.message, 'warning');
  };

  // Filter & Search computation chain
  const filteredEnrollments = enrollments.filter(item => {
    const child = children.find(c => c.ChildId === item.ChildId);
    const classroom = classrooms.find(cls => cls.ClassId === item.ClassId);

    const childName = child?.FullName || '';
    const className = classroom?.ClassName || '';
    
    const searchString = `${childName} ${className} ${item.EnrollmentId}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || item.Status === filterStatus;
    const matchesClass = filterClass === 'ALL' || item.ClassId === filterClass;
    const matchesLevel = filterLevel === 'ALL' || child?.LearningLevel === filterLevel;

    return matchesSearch && matchesStatus && matchesClass && matchesLevel;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedEnrollments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEnrollments.slice(startIndex, startIndex + pageSize);
  }, [filteredEnrollments, currentPage, pageSize]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative" id="enrollment-view-root">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="toast-box"
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
              <div className="flex-1 min-w-0">
                <p className="font-extrabold italic text-sm tracking-tight text-white leading-snug">{alertConfig.message}</p>
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

      {/* 1. Page Header (GodotXR Premium Aesthetic) */}
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <School className="w-3.5 h-3.5" />
            Can thiệp ngôn ngữ học học đường
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Biên Chế <span className="text-[#4EACAF]">Lớp Học</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Xem xét gán lớp học cho trẻ em rèn luyện, kiểm duyệt đơn nhập học tự động gửi từ phụ huynh qua cổng tương tác VR và theo dõi tình trạng học vị của từng bé.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          id="add-enrollment-btn"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Biên chế học viên mới
        </button>
      </div>

      {/* 2. Kid-friendly soft shadow statistic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem 
          title="Tổng Ghi Danh" 
          value={totalEnrollments} 
          subtitle="Tất cả học trình được thiết lập" 
          icon={<Users className="w-5 h-5 text-[#4EACAF]" />} 
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Bé Đang Học" 
          value={activeCount} 
          subtitle="Đang thực hành phòng game 3D" 
          icon={<Activity className="w-5 h-5 text-emerald-650" />} 
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Đã Hoàn Thành" 
          value={completedCount} 
          subtitle="Tốt nghiệp sửa phát âm" 
          icon={<CheckCircle2 className="w-5 h-5 text-indigo-600" />} 
          bgColor="bg-indigo-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Ghi Danh Đã Hủy" 
          value={cancelledCount} 
          subtitle="Tạm ngưng lộ trình học tập" 
          icon={<XCircle className="w-5 h-5 text-rose-650" />} 
          bgColor="bg-rose-50/70"
          borderColor="border-slate-100"
        />
      </div>

      {/* 3. Search and filter section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
          <input 
            type="text" 
            placeholder="Tìm theo tên bé, tên lớp học hoặc Id ghi danh..." 
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

        {/* Filters Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'ALL', label: 'Mọi trạng thái ghi danh' },
              { value: 'Active', label: 'Đang học' },
              { value: 'Pending', label: 'Chờ duyệt' },
              { value: 'Completed', label: 'Đã hoàn thành' },
              { value: 'Cancelled', label: 'Đã hủy bỏ' }
            ]}
          />
          <CustomSelect
            value={filterClass}
            onChange={setFilterClass}
            options={[
              { value: 'ALL', label: 'Mọi lớp học' },
              ...classrooms.map(cls => ({ value: cls.ClassId, label: cls.ClassName }))
            ]}
          />
          <CustomSelect
            value={filterLevel}
            onChange={setFilterLevel}
            options={[
              { value: 'ALL', label: 'Mọi cấp độ học' },
              { value: 'Beginner', label: 'Beginner (Mới học)' },
              { value: 'Intermediate', label: 'Intermediate (Cơ bản)' },
              { value: 'Advanced', label: 'Advanced (Nâng cao)' }
            ]}
          />
        </div>
      </div>

      {/* 4. Table view of mock data */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="enrollment-list-box">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-none">Danh sách ghi danh chi tiết</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Đang kết xuất {filteredEnrollments.length} hồ sơ ghi học phần</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4EACAF] rounded-full animate-pulse" />
            <span className="text-xs text-[#4EACAF] font-bold uppercase tracking-wider">Máy chủ an toàn</span>
          </div>
        </div>

        {filteredEnrollments.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100">
              <Baby className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700 text-center">Không tìm thấy ghi danh phù hợp tinh chỉnh lọc!</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
                setFilterClass('ALL');
                setFilterLevel('ALL');
              }}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 duration-200 text-xs font-black uppercase text-[#4EACAF] rounded-xl border border-gray-200"
            >
              Reset bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="enrollment-table">
                <thead>
                  <tr className="bg-[#FDFCF5]/50 border-b border-gray-100 text-[#555] font-bold text-xs uppercase tracking-widest">
                    <th className="py-5 px-10 w-[5%] whitespace-nowrap">ID</th>
                    <th className="py-5 px-6 w-[18%] whitespace-nowrap">Em bé điều trị</th>
                    <th className="py-5 px-6 w-[22%] whitespace-nowrap">Lớp tiếp nhận</th>
                    <th className="py-5 px-6 w-[15%] whitespace-nowrap">Cấp độ phát âm</th>
                    <th className="py-5 px-6 w-[12%] whitespace-nowrap">Ngày Nhập Lớp</th>
                    <th className="py-5 px-6 w-[13%] whitespace-nowrap">Trạng thái ghi danh</th>
                    <th className="py-5 px-10 text-right w-[15%] whitespace-nowrap">Quản lý thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {paginatedEnrollments.map((enrollment) => {
                    const child = children.find(c => c.ChildId === enrollment.ChildId);
                    const classroom = classrooms.find(cls => cls.ClassId === enrollment.ClassId);

                    return (
                      <tr key={enrollment.EnrollmentId} className="hover:bg-gray-50/40 transition-colors">
                        <td className="py-5 px-10 font-mono text-gray-400 font-black text-xs whitespace-nowrap">
                          {enrollment.EnrollmentId}
                        </td>
                        <td className="py-5 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img 
                              src={resolveAvatarUrl(child?.Avatar, child?.FullName || enrollment.ChildId, 'bottts')} 
                              alt="Baby avatar" 
                              className="w-9 h-9 rounded-xl bg-orange-100/50 border border-orange-200/20"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-extrabold text-gray-900 leading-tight whitespace-nowrap">{child?.FullName || 'Chưa rõ thông tin'}</p>
                              <p className="text-[10px] text-gray-400 font-bold mt-0.5 whitespace-nowrap">{child?.ChildId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          {classroom ? (
                            <div className="space-y-0.5 max-w-[200px]">
                              <p className="text-gray-800 font-extrabold truncate" title={classroom.ClassName}>{classroom.ClassName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{classroom.ClassId}</p>
                            </div>
                          ) : (
                            <span className="text-[#FF8E8E] italic text-xs whitespace-nowrap">Bị lỗi lớp học</span>
                          )}
                        </td>
                        <td className="py-5 px-6 whitespace-nowrap">
                          {child ? (
                            <span className={cn(
                              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap",
                              child.LearningLevel === 'Beginner' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                              child.LearningLevel === 'Intermediate' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-purple-50 text-purple-600 border border-purple-100'
                            )}>
                              <Award className="w-3.5 h-3.5" />
                              {child.LearningLevel}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-5 px-6 font-medium text-gray-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-gray-700 whitespace-nowrap">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {enrollment.EnrollmentDate}
                          </div>
                        </td>
                        <td className="py-5 px-6 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap",
                            enrollment.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                            enrollment.Status === 'Completed' ? 'bg-indigo-50 text-indigo-600' :
                            enrollment.Status === 'Cancelled' ? 'bg-rose-50 text-rose-500' :
                            'bg-amber-50 text-amber-600 animate-pulse' // Pending approval state
                          )}>
                            {enrollment.Status === 'Active' && '⚡ Đang học'}
                            {enrollment.Status === 'Completed' && '🎓 Đã hoàn thành'}
                            {enrollment.Status === 'Cancelled' && '❌ Đã hủy'}
                            {enrollment.Status === 'Pending' && '⏳ Chờ duyệt'}
                          </span>
                        </td>
                        <td className="py-5 px-10 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            {enrollment.Status === 'Pending' && (
                              <button 
                                onClick={() => handleApproveEnrollment(enrollment)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 duration-150 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 whitespace-nowrap"
                                title="Duyệt hồ sơ nhanh"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Duyệt
                              </button>
                            )}

                            <button 
                              onClick={() => handleOpenDetail(enrollment)}
                              className="p-2.5 hover:bg-teal-50 text-teal-600 rounded-xl transition-colors hover:scale-105"
                              title="Xem chi tiết ghi danh"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>

                            <button 
                              onClick={() => handleOpenEdit(enrollment)}
                              className="p-2.5 hover:bg-sky-50 text-sky-500 rounded-xl transition-colors hover:scale-105"
                              title="Cập nhật cấu hình ghi danh"
                            >
                              <Edit3 className="w-4.5 h-4.5" />
                            </button>

                            {enrollment.Status === 'Active' && (
                              <>
                                <button 
                                  onClick={() => handleOpenTransfer(enrollment)}
                                  className="p-2.5 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors hover:scale-105"
                                  title="Chuyển lớp cho bé"
                                >
                                  <ArrowRightLeft className="w-4.5 h-4.5" />
                                </button>

                                <button 
                                  onClick={() => handleOpenCancelConfirm(enrollment)}
                                  className="p-2.5 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors hover:scale-105"
                                  title="Hủy bỏ ghi danh"
                                >
                                  <XCircle className="w-4.5 h-4.5" />
                                </button>
                              </>
                            )}
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
                totalItems={filteredEnrollments.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="hồ sơ"
              />
            </div>
          </>
        )}
      </div>

      {/* Decorating fun facts */}
      <div className="bg-orange-50/40 p-6 rounded-[32px] border-2 border-orange-100 max-w-xl mx-auto flex items-center gap-4">
        <Smile className="w-12 h-12 text-orange-400 fill-current shrink-0 animate-bounce" />
        <div className="space-y-1">
          <h4 className="font-extrabold text-gray-800 text-sm">Ghi chú quản trị viên tuyển sinh</h4>
          <p className="text-gray-500 text-xs font-medium leading-relaxed">
            Các lớp học VR chỉ tiếp nhận các học sinh trong tầm tuổi quy định của Chương trình để bảo toàn tính hiệu quả. Hãy sử dụng hành động <strong className="text-indigo-600">Chuyển lớp</strong> để dịch chuyển hồ sơ của trẻ khi cần thay đổi thời khóa biểu.
          </p>
        </div>
      </div>

      {/* 5. Modal Systems Overlay */}
      <AnimatePresence>
        {modalType && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto w-full h-full" id="enrollment-modal-container">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30 my-8"
              id="enrollment-modal-inner"
            >
              {/* Modal Header */}
              <div className={cn(
                "px-8 py-6 flex items-center justify-between border-b",
                modalType === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' :
                modalType === 'edit' ? 'bg-sky-50 border-sky-100 text-gray-900' :
                modalType === 'transfer' ? 'bg-indigo-50 border-indigo-100 text-gray-900' :
                modalType === 'cancel_confirm' ? 'bg-rose-50 border-rose-100 text-gray-900 bg-rose-50' : 'bg-purple-50 border-purple-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'transfer' && <ArrowRightLeft className="w-6 h-6 text-indigo-500" />}
                    {modalType === 'detail' && <Info className="w-6 h-6 text-purple-600" />}
                    {modalType === 'cancel_confirm' && <AlertTriangle className="w-6 h-6 text-rose-500" />}
                    
                    {modalType === 'add' && 'Ghi danh học viên mới'}
                    {modalType === 'edit' && `Chỉnh sửa: Ghi danh ${selectedEnrollment?.EnrollmentId}`}
                    {modalType === 'transfer' && `Chuyển lớp: Bé ${children.find(c => c.ChildId === selectedEnrollment?.ChildId)?.FullName}`}
                    {modalType === 'detail' && 'Chi tiết thông tin ghi danh'}
                    {modalType === 'cancel_confirm' && 'Xác nhận hủy bỏ ghi danh'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Ghi danh bé nhập học và phân cấp lớp theo học lý tưởng'}
                    {modalType === 'edit' && 'Cập nhật thời hạn nhập lớp hoặc trạng thái can thiệp học trình'}
                    {modalType === 'transfer' && 'Dịch chuyển trẻ sang lớp mới có khung thời gian thích hợp hơn'}
                    {modalType === 'detail' && 'Liên kết chéo thông tin học viên, lớp giảng dạy và ngày lập học bạ'}
                    {modalType === 'cancel_confirm' && 'Hành động này sẽ hủy quá trình học của bé tại lớp học hiện tại'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                  id="modal-close-trigger"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body: DETAIL */}
              {modalType === 'detail' && selectedEnrollment ? (
                <div className="app-modal-body p-8 md:p-10 space-y-8" id="modal-detail">
                  {(() => {
                    const child = children.find(c => c.ChildId === selectedEnrollment.ChildId);
                    const classroom = classrooms.find(cls => cls.ClassId === selectedEnrollment.ClassId);

                    return (
                      <>
                        <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-gray-50 font-bold">
                           <div className="w-20 h-20 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mx-auto md:mx-0 p-2">
                              <img 
                                src={resolveAvatarUrl(child?.Avatar, child?.FullName || selectedEnrollment.ChildId, 'bottts')} 
                                alt="Detail Avatar" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                           </div>
                           <div className="space-y-2 flex-1 text-center md:text-left">
                              <div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                   <span className="text-2xl font-black text-gray-900">{child?.FullName || 'Không rõ'}</span>
                                   <span className="px-3 py-0.5 bg-gray-100 text-gray-400 font-black tracking-widest text-[9px] rounded-full uppercase">
                                     Mã Bé: {selectedEnrollment.ChildId}
                                   </span>
                                </div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mt-1 font-black">
                                  Tên lớp học: {classroom?.ClassName || 'Không rõ lớp'}
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                                <span className={cn(
                                  "inline-flex items-center px-4 py-1.5 rounded-full uppercase text-[10px] font-black tracking-wider",
                                  selectedEnrollment.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                                  selectedEnrollment.Status === 'Completed' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'
                                )}>
                                  Trạng thái ghi danh: {selectedEnrollment.Status}
                                </span>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                           <DetailRow 
                             label="Mã Phiếu Ghi Danh (EnrollmentId)" 
                             value={selectedEnrollment.EnrollmentId} 
                           />
                           <DetailRow 
                             label="Ngày Nhập Học (EnrollmentDate)" 
                             value={selectedEnrollment.EnrollmentDate} 
                           />
                           <DetailRow 
                             label="Bé can thiệp (ChildFullName)" 
                             value={`${child?.FullName || 'Chưa định dạng'} (${child?.Age || 0} tuổi | ${child?.Gender === 'Male' ? 'Nam' : 'Nữ'})`} 
                           />
                           <DetailRow 
                             label="Mức độ ngữ âm ban đầu" 
                             value={child?.LearningLevel || ' Beginner'} 
                           />
                           <DetailRow 
                             label="Giáo viên chủ trị" 
                             value={classroom?.TeacherName || 'Chưa phân công'} 
                           />
                           <DetailRow 
                             label="Giáo trình tích hợp" 
                             value={classroom?.ProgramName || 'Chưa liên kết'} 
                           />
                           <DetailRow 
                             label="Thời gian thiết lập hồ sơ" 
                             value={selectedEnrollment.CreatedAt} 
                           />
                           <DetailRow 
                             label="Cập nhật gần nhất" 
                             value={selectedEnrollment.UpdatedAt} 
                           />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-50">
                           <button 
                             onClick={handleCloseModal}
                             className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                           >
                             Quay lại
                           </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : modalType === 'transfer' && selectedEnrollment ? (
                /* Modal Body: TRANSFER CLASS */
                <form onSubmit={handleTransferClassSubmit} className="app-modal-body p-8 md:p-10 space-y-6" id="transfer-form">
              ) : modalType === 'cancel_confirm' && selectedEnrollment ? (
                /* Modal Body: CANCEL CONFIRMATION */
                <div className="app-modal-body p-8 md:p-10 space-y-6" id="modal-cancel-confirm">
                  {(() => {
                    const child = children.find(c => c.ChildId === selectedEnrollment.ChildId);
                    const classroom = classrooms.find(cls => cls.ClassId === selectedEnrollment.ClassId);

                    return (
                      <div className="space-y-6 font-bold">
                        <div className="flex items-center gap-4 bg-rose-50 p-5 rounded-3xl border border-rose-100 text-rose-700">
                          <AlertTriangle className="w-10 h-10 shrink-0 text-rose-500 animate-pulse" />
                          <div>
                            <p className="font-extrabold text-sm uppercase tracking-wider">Cảnh báo hủy ghi danh</p>
                            <p className="text-xs text-rose-600/80 font-bold mt-1">
                              Bạn có chắc chắn muốn hủy bỏ ghi danh của bé <strong className="text-rose-900">{child?.FullName}</strong> tại lớp học <strong className="text-rose-900">{classroom?.ClassName}</strong> không?
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#FDFCF5]/60 border border-[#F2ECD8]/40 rounded-2xl p-5 space-y-3 text-sm">
                          <div className="flex justify-between border-b border-gray-100 pb-2 font-bold">
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Học sinh:</span>
                            <span className="text-gray-800 font-extrabold">{child?.FullName || 'Không rõ'} ({child?.ChildId})</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-2 font-bold">
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Lớp tiếp nhận:</span>
                            <span className="text-gray-800 font-extrabold">{classroom?.ClassName || 'Không rõ'}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Ngày nhập lớp:</span>
                            <span className="text-gray-850 font-extrabold">{selectedEnrollment.EnrollmentDate}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 font-medium italic">
                          * Lưu ý: Hành động này sẽ chuyển trạng thái ghi danh sang "Đã hủy" (Cancelled) và bé sẽ không thể tham gia các bài học của lớp này nữa.
                        </p>

                        <div className="app-modal-actions pt-6 border-t border-gray-150 flex gap-4">
                           <button 
                             type="button"
                             onClick={handleCloseModal}
                             className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-450 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                           >
                             Quay lại
                           </button>
                           <button 
                             type="button"
                             onClick={async () => {
                               await handleCancelEnrollment(selectedEnrollment);
                               handleCloseModal();
                             }}
                             className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl shadow-xl shadow-rose-600/15 transition-all text-sm uppercase tracking-wider"
                           >
                             Xác nhận hủy
                           </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                  {(() => {
                    const currentClass = classrooms.find(c => c.ClassId === selectedEnrollment.ClassId);
                    const child = children.find(c => c.ChildId === selectedEnrollment.ChildId);

                    return (
                      <div className="space-y-6 font-bold">
                        <div className="flex items-center gap-4 bg-indigo-50 p-5 rounded-3xl border border-indigo-100 text-indigo-700">
                          <ArrowRightLeft className="w-10 h-10 shrink-0" />
                          <div>
                            <p className="font-extrabold text-sm uppercase tracking-wider">Mở cổng tái điều phối lớp</p>
                            <p className="text-xs text-indigo-600/80 font-bold mt-1">
                              Tiến hành chuyển lớp cho bé <strong className="text-indigo-900">{child?.FullName}</strong>. Lớp hiện hành của bé: <strong className="text-indigo-900">{currentClass?.ClassName}</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            Chọn môn học / Lớp học mới muốn chuyển sang <span className="text-[#FF8E8E]">*</span>
                          </label>
                          <CustomSelect
                            value={formClassId}
                            onChange={setFormClassId}
                            variant="form"
                            options={classrooms.filter(c => c.ClassId !== selectedEnrollment.ClassId && c.Status === 'Active').map(cls => ({
                              value: cls.ClassId,
                              label: `${cls.ClassName} (${cls.ClassId})`
                            }))}
                          />
                          <span className="text-xs text-gray-400 font-semibold italic mt-1 block">
                            * Chỉ hiển thị các lớp học đang hoạt động (Active status) của hệ thống GodotXR.
                          </span>
                        </div>

                        <div className="app-modal-actions pt-6 border-t border-gray-150 flex gap-4">
                           <button 
                             type="button"
                             onClick={handleCloseModal}
                             className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                           >
                             Hủy chuyển lớp
                           </button>
                           <button 
                             type="submit"
                             className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/15 transition-all text-sm uppercase tracking-wider"
                           >
                             Xác nhận chuyển lớp
                           </button>
                        </div>
                      </div>
                    );
                  })()}
                </form>
              ) : (
                /* Modal Body: ADD / EDIT form template */
                <form onSubmit={handleSaveEnrollment} className="app-modal-body p-8 md:p-10 space-y-6" id="add-edit-enroll-form">
                  <div className="app-modal-form-grid grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Chọn học viên nhi đồng (ChildId) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <CustomSelect
                        value={formChildId}
                        onChange={setFormChildId}
                        disabled={modalType === 'edit'}
                        variant="form"
                        options={[
                          { value: '', label: '-- Chọn một em bé --' },
                          ...children.map(c => ({
                            value: c.ChildId,
                            label: `${c.FullName} (${c.ChildId} - ${c.Age} tuổi) [${c.Status === 'Active' ? 'Hoạt động' : 'Tạm ngưng'}]`
                          }))
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Chọn lớp học tiếp nhận (ClassId) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <CustomSelect
                        value={formClassId}
                        onChange={setFormClassId}
                        variant="form"
                        options={[
                          { value: '', label: '-- Chọn một lớp học --' },
                          ...classrooms.map(cls => ({
                            value: cls.ClassId,
                            label: `${cls.ClassName} (${cls.ClassId})`
                          }))
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Ngày ghi danh nhập học <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="date" 
                        required
                        value={formEnrollmentDate}
                        onChange={(e) => setFormEnrollmentDate(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700 text-sm" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Trạng thái học tập
                      </label>
                      <CustomSelect
                        value={formStatus}
                        onChange={(val) => setFormStatus(val as any)}
                        variant="form"
                        options={[
                          { value: 'Active', label: '🟢 Đang học tập chính khóa' },
                          { value: 'Pending', label: '⏳ Chờ kiểm duyệt hồ sơ' },
                          { value: 'Completed', label: '🎓 Đã hoàn thành khóa can thiệp' },
                          { value: 'Cancelled', label: '🔴 Đã hủy bỏ ghi danh' }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="app-modal-actions pt-6 border-t border-gray-100 flex gap-4">
                     <button 
                       type="button"
                       onClick={handleCloseModal}
                       className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                     >
                       Quay lại
                     </button>
                     <button 
                       type="submit"
                       className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/10 transition-all active:scale-98 text-sm uppercase tracking-wider"
                     >
                       Xác nhận ghi danh
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

// Helper stat item visual representation
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
      "bg-white rounded-[32px] p-6 shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-300",
      borderColor
    )}>
      <div className={cn("absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150", bgColor)} />
      
      <div className="flex items-center gap-5 relative z-10">
         <div className={cn("p-4 rounded-2xl shadow-inner shrink-0", bgColor)}>
            {icon}
         </div>
         <div className="space-y-0.5 font-bold">
            <p className="text-gray-400 font-black uppercase text-[10px] tracking-wider">{title}</p>
            <p className="text-3xl font-black text-gray-900 leading-none">{value.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500 font-medium pt-1 line-clamp-1">{subtitle}</p>
         </div>
      </div>
    </div>
  );
}

// Detail Column Row Item
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 p-4 rounded-xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40">
       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-bold">{label}</span>
       <span className="font-extrabold text-gray-800 break-all text-sm block">
         {value}
       </span>
    </div>
  );
}
