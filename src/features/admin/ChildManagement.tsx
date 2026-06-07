import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Baby, 
  Search, 
  ChevronDown, 
  X, 
  Plus, 
  Check, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Lock, 
  Unlock, 
  Calendar, 
  ShieldCheck, 
  Smile, 
  Sparkles,
  User,
  Heart,
  BookOpen,
  Info,
  Clock,
  TrendingUp,
  Brain,
  Activity,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';

// DB Interfaces
interface User {
  UserId: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
}

interface Child {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string; // 'Beginner', 'Intermediate', 'Advanced' / specific modules
  Note: string;
  Status: 'Active' | 'Inactive'; // Active = Đang học, Inactive = Tạm ngưng
  CreatedAt: string;
  UpdatedAt: string;
}

// History event for tracking progress
interface ProgressEvent {
  EventId: string;
  Title: string;
  Type: 'Score' | 'LevelUp' | 'Session' | 'Note';
  Value: string;
  Timestamp: string;
}

// Initial mock data matching both database specs
const MOCK_PARENT_USERS: User[] = [
  {
    UserId: 'USR-003',
    FullName: 'Phạm Minh Anh',
    Email: 'anvvpse172634@fpt.edu.vn',
    PhoneNumber: '0901234567'
  },
  {
    UserId: 'USR-005',
    FullName: 'Bùi Thị Lan',
    Email: 'lan.bui@gmail.com',
    PhoneNumber: '0978123456'
  },
  {
    UserId: 'USR-006',
    FullName: 'Hoàng Quốc Việt',
    Email: 'viet.hoang@yahoo.com',
    PhoneNumber: '0945678901'
  },
  {
    UserId: 'USR-007',
    FullName: 'Nguyễn Thanh Sơn',
    Email: 'son.nguyen@outlook.com',
    PhoneNumber: '0933221100'
  }
];

const INITIAL_CHILDREN: Child[] = [
  {
    ChildId: 'CHD-001',
    ParentUserId: 'USR-003',
    FullName: 'Leo (Phạm Minh Đức)',
    Age: 8,
    Gender: 'Male',
    LearningLevel: 'Advanced', // Cấp độ 4 - Phát âm nâng cao
    Note: 'Bé phát âm tốt nhưng thỉnh thoảng nói hơi nhanh, cần luyện nhịp thở.',
    Status: 'Active',
    CreatedAt: '2026-05-18 10:30',
    UpdatedAt: '2026-05-28 11:00'
  },
  {
    ChildId: 'CHD-002',
    ParentUserId: 'USR-003',
    FullName: 'Mimi (Phạm Ngọc Linh)',
    Age: 7,
    Gender: 'Female',
    LearningLevel: 'Beginner', // Cấp độ 1 - Nhận diện âm cơ bản
    Note: 'Bé thích tương tác với thế giới hoạt họa 3D sinh động trên kính VR.',
    Status: 'Active',
    CreatedAt: '2026-05-20 09:00',
    UpdatedAt: '2026-05-20 09:00'
  },
  {
    ChildId: 'CHD-003',
    ParentUserId: 'USR-005',
    FullName: 'Bi (Nguyễn Đức Huy)',
    Age: 9,
    Gender: 'Male',
    LearningLevel: 'Intermediate', // Cấp độ 3 - Từ kép & Câu đơn
    Note: 'Cần chú trọng hướng dẫn khẩu hình miệng khi bé phát âm phụ âm khó trong VR.',
    Status: 'Active',
    CreatedAt: '2026-04-05 16:00',
    UpdatedAt: '2026-05-25 09:00'
  },
  {
    ChildId: 'CHD-004',
    ParentUserId: 'USR-007',
    FullName: 'Sơn con (Nguyễn Thanh Lâm)',
    Age: 11,
    Gender: 'Male',
    LearningLevel: 'Advanced', // Cấp độ 5 - Hội thoại tự do
    Note: 'Đã hoàn thành xuất sắc bài rèn luyện. Tiến trình tiến bộ nhanh.',
    Status: 'Active',
    CreatedAt: '2026-03-12 15:00',
    UpdatedAt: '2026-05-01 16:30'
  },
  {
    ChildId: 'CHD-005',
    ParentUserId: 'USR-007',
    FullName: 'Tép (Nguyễn Hải Yến)',
    Age: 10,
    Gender: 'Female',
    LearningLevel: 'Beginner', // Cấp độ 1
    Note: 'Khuyến khích trải nghiệm VR 10-15 phút mỗi ngày theo quy định học đường.',
    Status: 'Inactive',
    CreatedAt: '2026-03-12 15:10',
    UpdatedAt: '2026-05-01 16:30'
  }
];

// Mock Learning history updates for a child
const MOCK_PROGRESS_HISTORY: Record<string, ProgressEvent[]> = {
  'CHD-001': [
    { EventId: 'EV-101', Title: 'Hoàn thành bài Luyện nói cụm từ đôi', Type: 'Score', Value: 'Độ chính xác: 95%', Timestamp: '2026-05-28 10:45' },
    { EventId: 'EV-102', Title: 'Được thăng cấp lên Advanced', Type: 'LevelUp', Value: 'Phát âm nâng cao', Timestamp: '2026-05-25 14:30' },
    { EventId: 'EV-103', Title: 'Trải nghiệm Bài tập Luyện thanh Gió VR', Type: 'Session', Value: 'Kéo dài 15 phút', Timestamp: '2026-05-24 09:15' }
  ],
  'CHD-002': [
    { EventId: 'EV-201', Title: 'Trả lời đúng 8/10 thẻ động vật 3D', Type: 'Score', Value: 'Độ chính xác: 80%', Timestamp: '2026-05-20 09:40' },
    { EventId: 'EV-202', Title: 'Khởi tạo hồ sơ học liệu', Type: 'Note', Value: 'Thiết lập định hướng rèn luyện qua VR', Timestamp: '2026-05-20 09:00' }
  ],
  'CHD-003': [
    { EventId: 'EV-301', Title: 'Vượt qua bài test phụ âm Ch & Tr', Type: 'Score', Value: 'Độ chính xác: 88%', Timestamp: '2026-05-25 08:30' },
    { EventId: 'EV-302', Title: 'Thăng cấp học lên Intermediate', Type: 'LevelUp', Value: 'Từ kép & Câu đơn', Timestamp: '2026-05-18 16:00' },
    { EventId: 'EV-303', Title: 'Trải nghiệm đảo phát âm AR', Type: 'Session', Value: 'Kéo dài 12 phút', Timestamp: '2026-05-15 11:10' }
  ]
};

export default function ChildManagement() {
  const [childrenList, setChildrenList] = useState<Child[]>(INITIAL_CHILDREN);
  const [parentUsers, setParentUsers] = useState<User[]>(MOCK_PARENT_USERS);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAge, setFilterAge] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterAge, filterGender, filterLevel, filterStatus]);

  // Modals state
  const [modalType, setModalType] = useState<'add' | 'edit' | 'detail' | 'progress' | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form states
  const [formParentUserId, setFormParentUserId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formAge, setFormAge] = useState<number>(5);
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [formLevel, setFormLevel] = useState('Beginner');
  const [formNote, setFormNote] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  // KPI computations
  const totalChildren = childrenList.length;
  const activeChildren = childrenList.filter(c => c.Status === 'Active').length;
  const needSupportChildren = childrenList.filter(c => c.Note.toLowerCase().includes('cần') || c.Age < 4).length;
  const averageAge = totalChildren > 0 
    ? parseFloat((childrenList.reduce((acc, c) => acc + c.Age, 0) / totalChildren).toFixed(1))
    : 0;

  const triggerNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => {
      setAlertConfig(null);
    }, 4000);
  };

  // Modal actions
  const handleOpenAdd = () => {
    setFormParentUserId(parentUsers[0]?.UserId || '');
    setFormFullName('');
    setFormAge(5);
    setFormGender('Female');
    setFormLevel('Beginner');
    setFormNote('');
    setFormStatus('Active');
    setSelectedChild(null);
    setModalType('add');
  };

  const handleOpenEdit = (child: Child) => {
    setSelectedChild(child);
    setFormParentUserId(child.ParentUserId);
    setFormFullName(child.FullName);
    setFormAge(child.Age);
    setFormGender(child.Gender);
    setFormLevel(child.LearningLevel);
    setFormNote(child.Note);
    setFormStatus(child.Status);
    setModalType('edit');
  };

  const handleOpenDetail = (child: Child) => {
    setSelectedChild(child);
    setModalType('detail');
  };

  const handleOpenProgress = (child: Child) => {
    setSelectedChild(child);
    setModalType('progress');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedChild(null);
  };

  // Submit Handler for Save / Update Child
  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formFullName) {
      triggerNotification('Vui lòng nhập họ và tên của bé!', 'warning');
      return;
    }

    if (formAge <= 0 || formAge > 18) {
      triggerNotification('Độ tuổi của bé phải từ 1 đến 18 tuổi!', 'warning');
      return;
    }

    if (modalType === 'add') {
      const newChild: Child = {
        ChildId: `CHD-${String(childrenList.length + 1).padStart(3, '0')}`,
        ParentUserId: formParentUserId,
        FullName: formFullName,
        Age: Number(formAge),
        Gender: formGender,
        LearningLevel: formLevel,
        Note: formNote || 'Không có ghi chú đặc biệt.',
        Status: formStatus,
        CreatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setChildrenList([newChild, ...childrenList]);
      triggerNotification(`Đã tạo hồ sơ học tập mới cho bé "${formFullName}"!`);
    } else if (modalType === 'edit' && selectedChild) {
      setChildrenList(childrenList.map(c => c.ChildId === selectedChild.ChildId ? {
        ...c,
        ParentUserId: formParentUserId,
        FullName: formFullName,
        Age: Number(formAge),
        Gender: formGender,
        LearningLevel: formLevel,
        Note: formNote,
        Status: formStatus,
        UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      } : c));

      triggerNotification(`Đã cập nhật dữ liệu cấu hình học cho bé "${formFullName}"!`);
    }

    handleCloseModal();
  };

  const handleToggleStatus = (child: Child) => {
    const nextStatus = child.Status === 'Active' ? 'Inactive' : 'Active';
    setChildrenList(childrenList.map(c => c.ChildId === child.ChildId ? {
      ...c,
      Status: nextStatus,
      UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    } : c));

    triggerNotification(
      nextStatus === 'Active' 
        ? `Đã kích hoạt hành trình học của bé "${child.FullName}"`
        : `Đã tạm ngừng hồ sơ học tập của bé "${child.FullName}"`,
      nextStatus === 'Active' ? 'success' : 'warning'
    );
  };

  // Full filter chain logic
  const filteredChildren = childrenList.filter(child => {
    const parent = parentUsers.find(p => p.UserId === child.ParentUserId);
    const searchString = `${child.FullName} ${parent?.FullName || ''}`.toLowerCase();
    
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesAge = filterAge === 'ALL' 
      ? true 
      : filterAge === 'UNDER_5' ? child.Age < 5
      : filterAge === 'S_5_7' ? (child.Age >= 5 && child.Age <= 7)
      : child.Age > 7;

    const matchesGender = filterGender === 'ALL' || child.Gender === filterGender;
    const matchesLevel = filterLevel === 'ALL' || child.LearningLevel === filterLevel;
    const matchesStatus = filterStatus === 'ALL' || child.Status === filterStatus;

    return matchesSearch && matchesAge && matchesGender && matchesLevel && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredChildren.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedChildren = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredChildren.slice(startIndex, startIndex + pageSize);
  }, [filteredChildren, currentPage, pageSize]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative">
      
      {/* Toast notifications */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
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
                <p className="font-black italic text-sm tracking-tight text-white">{alertConfig.message}</p>
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
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-md text-[11px] font-bold uppercase tracking-wider">
            <Baby className="w-3.5 h-3.5" />
            Hồ sơ học tập nhi đồng
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-2 pb-0.5 font-sans">
            Quản lý Hồ sơ trẻ
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Giám sát hồ sơ trẻ, phân cấp trình độ phát âm từ Beginner tới Advanced, liên đới tài khoản phụ huynh, và theo dõi lịch sử kết quả chơi game XR hỗ trợ âm ngữ phục hồi.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#3d8c8e] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm hồ sơ trẻ
        </button>
      </div>

      {/* 2. Statistic Dashboard representation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem 
          title="Tổng số trẻ" 
          value={totalChildren} 
          subtitle="Hồ sơ nhi đồng liên kết" 
          icon={<Baby className="w-5 h-5 text-[#4EACAF]" />} 
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Trẻ đang học" 
          value={activeChildren} 
          subtitle="Ủy quyền kích hoạt thực hành" 
          icon={<Activity className="w-5 h-5 text-emerald-600" />} 
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Bé cần lưu ý thêm" 
          value={needSupportChildren} 
          subtitle="Theo sát nhật ký học tập VR" 
          icon={<Brain className="w-5 h-5 text-rose-600" />} 
          bgColor="bg-rose-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Độ tuổi trung bình" 
          value={averageAge} 
          subtitle="Tuổi lý tưởng học âm ngữ" 
          icon={<Clock className="w-5 h-5 text-amber-600" />} 
          bgColor="bg-amber-50/70"
          borderColor="border-slate-100"
        />
      </div>

      {/* 3. Search and filtering panels matching system design */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
          <input 
            type="text" 
            placeholder="Tìm theo tên bé, hoặc tên phụ huynh..." 
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

        {/* Multi selections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <select 
              value={filterAge}
              onChange={(e) => setFilterAge(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-750 outline-none cursor-pointer pr-10 text-xs"
            >
              <option value="ALL">Mọi Độ Tuổi</option>
              <option value="UNDER_5">Dưới 5 tuổi</option>
              <option value="S_5_7">Từ 5 - 7 tuổi</option>
              <option value="OVER_7">Trên 7 tuổi</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-750 outline-none cursor-pointer pr-10 text-xs"
            >
              <option value="ALL">Mọi giới tính</option>
              <option value="Male">Cậu bé (Nam)</option>
              <option value="Female">Cô bé (Nữ)</option>
              <option value="Other">Khác</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-750 outline-none cursor-pointer pr-10 text-xs"
            >
              <option value="ALL">Mọi cấp độ học</option>
              <option value="Beginner">Beginner (Nhập môn)</option>
              <option value="Intermediate">Intermediate (Trung cấp)</option>
              <option value="Advanced">Advanced (Nâng cao)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/45 px-4 py-2.5 rounded-xl font-bold text-gray-750 outline-none cursor-pointer pr-10 text-xs"
            >
              <option value="ALL">Mọi Trạng thái</option>
              <option value="Active">Đang học</option>
              <option value="Inactive">Tạm ngưng</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Children records Table Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-none">Danh sách trẻ can thiệp âm</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Hiển thị {filteredChildren.length} bé phù hợp thiết lập bộ lọc</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-450 bg-[#4EACAF] rounded-full animate-pulse" />
            <span className="text-xs text-[#4EACAF] font-bold uppercase tracking-wider">Hạ tầng can thiệp VR</span>
          </div>
        </div>

        {filteredChildren.length === 0 ? (
          <div className="py-24 text-center space-y-4">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-200">
               <Baby className="w-8 h-8 text-gray-300" />
             </div>
             <p className="text-xl font-black text-gray-700">Không tìm thấy hồ sơ trẻ em phù hợp!</p>
             <button 
               onClick={() => {
                 setSearchQuery('');
                 setFilterAge('ALL');
                 setFilterGender('ALL');
                 setFilterLevel('ALL');
                 setFilterStatus('ALL');
               }}
               className="px-5 py-2 hover:bg-gray-100 rounded-xl font-black text-xs text-[#4EACAF] border border-gray-200 uppercase transition-all"
             >
               Đặt lại bộ lọc
             </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDFCF5]/50 border-b border-gray-100 text-[#555] font-bold text-xs uppercase tracking-widest">
                    <th className="py-5 px-10">Mã Số</th>
                    <th className="py-5 px-6">Hồ sơ trẻ</th>
                    <th className="py-5 px-6">Độ Tuổi</th>
                    <th className="py-5 px-6">Giới Tính</th>
                    <th className="py-5 px-6">Phụ huynh liên kết</th>
                    <th className="py-5 px-6">Cấp độ (Level)</th>
                    <th className="py-5 px-6">Trạng thái</th>
                    <th className="py-5 px-10 text-right">Tùy chọn quản trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                  {paginatedChildren.map((child) => {
                    const parent = parentUsers.find(p => p.UserId === child.ParentUserId);
                    return (
                      <tr 
                        key={child.ChildId} 
                        className="hover:bg-gray-50/40 transition-colors"
                      >
                        <td className="py-5 px-10 font-mono text-gray-400 font-black text-xs">
                          {child.ChildId}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <img 
                              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${child.FullName}`} 
                              alt={child.FullName} 
                              className="w-10 h-10 rounded-2xl bg-orange-50/50 border border-orange-100/30"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-extrabold text-gray-900 text-base">{child.FullName}</p>
                              <p className="text-xs text-gray-400 font-medium pt-0.5">Tạo ngày {child.CreatedAt.slice(0, 10)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="text-gray-900 font-extrabold">{child.Age} tuổi</span>
                        </td>
                        <td className="py-5 px-6 text-gray-600">
                          {child.Gender === 'Male' ? 'Cậu bé (Nam)' : child.Gender === 'Female' ? 'Cô bé (Nữ)' : 'Khác'}
                        </td>
                        <td className="py-5 px-6">
                          <div className="space-y-0.5">
                             <p className="text-gray-800 font-extrabold">{parent?.FullName || 'Chưa liên kết'}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{child.ParentUserId}</p>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                            child.LearningLevel === 'Beginner' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                            child.LearningLevel === 'Intermediate' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-purple-50 text-purple-600 border border-purple-100'
                          )}>
                            <Award className="w-3.5 h-3.5" />
                            {child.LearningLevel}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <span className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                            child.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                          )}>
                            {child.Status === 'Active' ? 'Đang học' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td className="py-5 px-10 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenDetail(child)}
                              className="p-2 hover:bg-teal-50 text-teal-600 rounded-xl transition-colors hover:scale-105"
                              title="Thông tin chi tiết"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>

                            <button 
                              onClick={() => handleOpenProgress(child)}
                              className="p-2 hover:bg-orange-50 text-orange-500 rounded-xl transition-colors hover:scale-105"
                              title="Lịch sử học tập & tiến trình"
                            >
                              <TrendingUp className="w-4.5 h-4.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleOpenEdit(child)}
                              className="p-2 hover:bg-sky-50 text-sky-500 rounded-xl transition-colors hover:scale-105"
                              title="Chỉnh sửa thông số học tập"
                            >
                              <Edit3 className="w-4.5 h-4.5" />
                            </button>

                            <button 
                              onClick={() => handleToggleStatus(child)}
                              className={cn(
                                "p-2 rounded-xl transition-colors hover:scale-105",
                                child.Status === 'Active' 
                                  ? 'hover:bg-rose-50 text-rose-500' 
                                  : 'hover:bg-emerald-50 text-emerald-500'
                              )}
                              title={child.Status === 'Active' ? "Tạm ngưng học" : "Kích hoạt lại bài học"}
                            >
                              {child.Status === 'Active' ? (
                                <Lock className="w-4.5 h-4.5" />
                              ) : (
                                <Unlock className="w-4.5 h-4.5" />
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
                totalItems={filteredChildren.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="hồ sơ trẻ"
              />
            </div>
          </>
        )}
      </div>

      {/* Aesthetic pairing decoration quote */}
      <div className="flex items-center justify-center gap-4 bg-orange-50/40 p-6 rounded-[32px] border-2 border-orange-100 max-w-lg mx-auto">
        <Smile className="w-10 h-10 text-orange-400 fill-current shrink-0 animate-pulse" />
        <p className="text-gray-500 font-bold text-xs md:text-sm italic leading-snug text-center">
          "Trò chơi tương tác hóa thân bằng kính XR giúp kích thích phản xạ võ não, rút ngắn tới 40% thời gian can thiệp phát âm thông thường."
        </p>
      </div>

      {/* 5. Modals Overlays */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto w-full h-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30"
            >
              {/* Modal Header */}
              <div className={cn(
                "px-8 py-6 flex items-center justify-between border-b",
                modalType === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' :
                modalType === 'edit' ? 'bg-sky-50 border-sky-100 text-gray-900' :
                modalType === 'progress' ? 'bg-orange-50 border-orange-100 text-gray-900' : 'bg-purple-50 border-purple-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'progress' && <TrendingUp className="w-6 h-6 text-orange-500" />}
                    {modalType === 'detail' && <Info className="w-6 h-6 text-purple-600" />}
                    {modalType === 'add' && 'Thiết lập hồ sơ trẻ mới'}
                    {modalType === 'edit' && `Chỉnh sửa: Bé ${selectedChild?.FullName}`}
                    {modalType === 'detail' && 'Chi tiết hồ sơ học viên'}
                    {modalType === 'progress' && `Nhật ký học & Tiến độ: ${selectedChild?.FullName}`}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Khởi tạo thông tin cá nhân, liên hệ cha mẹ và định hướng can thiệp'}
                    {modalType === 'edit' && 'Tinh chỉnh lại cấp độ học hoặc cập nhật lưu ý y tế/lớp học'}
                    {modalType === 'detail' && 'Liên kết dữ liệu tổng hợp gia đình và tình hình học liệu'}
                    {modalType === 'progress' && 'Báo cáo thông số trò chơi XR và ghi nhận phản xạ phát âm'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body: Detail area */}
              {modalType === 'detail' && selectedChild ? (
                <div className="p-8 md:p-10 space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start pb-6 border-b border-gray-50 font-bold">
                     <div className="w-24 h-24 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center p-3 shrink-0 mx-auto md:mx-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedChild.FullName}`} 
                          alt="Detail Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                     </div>
                     <div className="space-y-3 flex-1 text-center md:text-left">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                             <span className="text-2xl font-black text-gray-900">{selectedChild.FullName}</span>
                             <span className="px-3 py-0.5 bg-gray-100 text-gray-400 font-black tracking-widest text-[9px] rounded-full uppercase">
                               ID: {selectedChild.ChildId}
                             </span>
                          </div>
                          <p className="text-gray-400">Độ tuổi: {selectedChild.Age} tuổi | Giới tính: {selectedChild.Gender === 'Male' ? 'Nam' : 'Nữ'}</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs pt-1">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full italic font-black uppercase text-[10px]",
                            selectedChild.LearningLevel === 'Beginner' ? 'bg-sky-50 text-sky-600' :
                            selectedChild.LearningLevel === 'Intermediate' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                          )}>
                            Trình độ: {selectedChild.LearningLevel}
                          </span>

                          <span className={cn(
                            "inline-flex items-center px-4 py-0.5 rounded-full uppercase text-[10px] font-black",
                            selectedChild.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                          )}>
                            {selectedChild.Status === 'Active' ? 'Đang học tập' : 'Tạm dừng bài tập'}
                          </span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                     <DetailRow 
                       label="Tên đầy đủ trẻ (FullName)" 
                       value={selectedChild.FullName} 
                     />
                     <DetailRow 
                       label="Nhà quản trị bảo trợ (ParentUserId)" 
                       value={`${parentUsers.find(p => p.UserId === selectedChild.ParentUserId)?.FullName || 'Chưa rõ'} (${selectedChild.ParentUserId})`} 
                     />
                     <DetailRow 
                       label="Thông tin liên lạc khẩn của mẹ/cha" 
                       value={parentUsers.find(p => p.UserId === selectedChild.ParentUserId)?.PhoneNumber || 'Chưa cung cấp'} 
                     />
                     <DetailRow 
                       label="Thời khắc khởi tạo hồ sơ" 
                       value={selectedChild.CreatedAt} 
                     />
                     <DetailRow 
                       label="Sửa đổi sau cùng" 
                       value={selectedChild.UpdatedAt} 
                     />
                     <div className="space-y-1.5 p-4 rounded-2xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40 col-span-1 md:col-span-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Chẩn đoán - Lưu ý lâm sàng (Note)</span>
                       <span className="font-bold text-gray-800 text-sm block leading-relaxed italic">
                         "{selectedChild.Note}"
                       </span>
                     </div>
                  </div>

                  <div className="flex justify-end">
                     <button 
                       onClick={handleCloseModal}
                       className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl transition-all"
                     >
                       Quay lại
                     </button>
                  </div>
                </div>
              ) : modalType === 'progress' && selectedChild ? (
                /* Modal Body: Progress History tracking */
                <div className="p-8 md:p-10 space-y-6 max-h-[80vh] overflow-y-auto">
                   <div className="flex items-center gap-4 bg-orange-50 p-5 rounded-3xl border border-orange-100">
                      <TrendingUp className="w-10 h-10 text-orange-500 shrink-0" />
                      <div>
                         <p className="font-black text-gray-800">Tiến độ can thiệp sớm & Phát âm</p>
                         <p className="text-xs text-gray-500 font-bold">Lược sử các sự kiện kiểm tra phát âm và tương tác AR/VR gần nhất.</p>
                      </div>
                   </div>

                   <div className="relative border-l-4 border-orange-100 ml-6 pl-8 space-y-8 py-2">
                      {(MOCK_PROGRESS_HISTORY[selectedChild.ChildId] || []).map((evt) => (
                         <div key={evt.EventId} className="relative">
                            {/* Bullet icon representing different event types */}
                            <span className="absolute -left-[42px] top-1.5 w-6 h-6 rounded-full border-4 border-white shadow bg-orange-400 flex items-center justify-center text-xs" />
                            <div className="space-y-1.5">
                               <p className="text-sm font-black text-gray-800 leading-snug">{evt.Title}</p>
                               <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                                    evt.Type === 'Score' ? 'bg-emerald-50 text-emerald-600' :
                                    evt.Type === 'LevelUp' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                  )}>
                                    {evt.Type}
                                  </span>
                                  <span className="text-gray-500 font-bold">{evt.Value}</span>
                                  <span className="text-gray-300 font-bold ml-1">{evt.Timestamp}</span>
                               </div>
                            </div>
                         </div>
                      ))}

                      {(!MOCK_PROGRESS_HISTORY[selectedChild.ChildId] || MOCK_PROGRESS_HISTORY[selectedChild.ChildId].length === 0) && (
                         <div className="py-6 font-bold text-gray-400 text-sm">
                           Chưa ghi nhận sự kiện thực hành âm cụ thể nào trong vòng 30 ngày qua.
                         </div>
                      )}
                   </div>

                   <div className="flex justify-end pt-4 border-t border-gray-100">
                     <button 
                       onClick={handleCloseModal}
                       className="py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl transition-all"
                     >
                       Quay lại
                     </button>
                   </div>
                </div>
              ) : (
                /* Modal Body: Add/Edit Form */
                <form onSubmit={handleSaveChild} className="p-8 md:p-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Phụ huynh chịu trách nhiệm (Grand / ParentUser) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formParentUserId}
                          onChange={(e) => setFormParentUserId(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF]"
                        >
                          {parentUsers.map(p => (
                             <option key={p.UserId} value={p.UserId}>
                               {p.FullName} ({p.Email}) - {p.UserId}
                             </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Họ và Tên đầy đủ của bé <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ví dụ: Phạm Minh Đức"
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Độ tuổi can thiệp thích hợp <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        max="18"
                        placeholder="Ví dụ: 6"
                        value={formAge}
                        onChange={(e) => setFormAge(Number(e.target.value))}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Giới tính (Gender) <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formGender}
                          onChange={(e) => setFormGender(e.target.value as any)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF]"
                        >
                          <option value="Female">Nữ (Cô bé)</option>
                          <option value="Male">Nam (Cậu bé)</option>
                          <option value="Other">Khác</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Mức độ phát âm hiện hành (LearningLevel)
                      </label>
                      <div className="relative">
                        <select 
                          value={formLevel}
                          onChange={(e) => setFormLevel(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF]"
                        >
                          <option value="Beginner">Nhập môn (Beginner)</option>
                          <option value="Intermediate">Trung cấp (Intermediate)</option>
                          <option value="Advanced">Nâng cao (Advanced)</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Ghi chú chăm sóc & Khuyết tật (Note)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Bé nói lắp âm đầu"
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#4EACAF] focus:bg-white transition-all text-gray-700" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Trạng thái phân vùng
                      </label>
                      <div className="relative">
                        <select 
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF]"
                        >
                          <option value="Active">🟢 Đang theo học chính khóa</option>
                          <option value="Inactive">🔴 Tạm ngưng học rèn luyện</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex gap-4">
                     <button 
                       type="button"
                       onClick={handleCloseModal}
                       className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-sm tracking-widest"
                     >
                       Quay lại
                     </button>
                     <button 
                       type="submit"
                       className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/10 transition-all active:scale-98 uppercase text-sm tracking-widest"
                     >
                       Lưu hồ sơ bé
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
         <div className="space-y-0.5">
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">{title}</p>
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
    <div className="space-y-1.5 p-4 rounded-2xl bg-[#FDFCF5]/60 border border-[#F2ECD8]/40">
       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</span>
       <span className="font-bold text-gray-800 break-all text-sm block">
         {value}
       </span>
    </div>
  );
}
