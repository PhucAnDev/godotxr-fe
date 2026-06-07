import React, { useState, useEffect, useMemo } from 'react';
import { 
  Baby, 
  Search, 
  Filter, 
  Sparkles, 
  Award, 
  GraduationCap, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight, 
  Heart, 
  Phone, 
  Mail, 
  CheckCircle2, 
  SlidersHorizontal 
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import Pagination from '../common/Pagination';

// Shared interfaces
export interface Child {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Note: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
  ProgressLevel: 'Improving' | 'Stable' | 'Need Support';
}

export interface ParentUser {
  UserId: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
}

// Exactly matching MOCK database from TeacherStudentDetail
const MOCK_PARENT_USERS: ParentUser[] = [
  { UserId: 'USR-P1', FullName: 'Nguyễn Tiến Dũng', Email: 'dung.nguyen@email.com', PhoneNumber: '0912345678' },
  { UserId: 'USR-P2', FullName: 'Trần Thị Thu Hương', Email: 'huong.tran@email.com', PhoneNumber: '0987654321' },
  { UserId: 'USR-P3', FullName: 'Phạm Minh Hải', Email: 'hai.pham@email.com', PhoneNumber: '0901122334' },
  { UserId: 'USR-P4', FullName: 'Hoàng Ngọc Ánh', Email: 'anh.hoang@email.com', PhoneNumber: '0933445566' }
];

const MOCK_CHILDREN: Child[] = [
  { 
    ChildId: 'CHD-001', 
    ParentUserId: 'USR-P1', 
    FullName: 'Nguyễn Tiến Minh (Leo)', 
    Age: 8, 
    Gender: 'Male', 
    LearningLevel: 'Bậc 1 - Phát âm đơn', 
    Note: 'Bé thông minh nhưng thỉnh thoảng mất tập trung giữa buổi chơi. Thích trò chơi Nông trại 3D. Cần hỗ trợ phụ âm trượt sóng.',
    Status: 'Active',
    ProgressLevel: 'Improving',
    CreatedAt: '2026-01-10',
    UpdatedAt: '2026-05-30'
  },
  { 
    ChildId: 'CHD-002', 
    ParentUserId: 'USR-P2', 
    FullName: 'Trần Thảo Linh (Sophia)', 
    Age: 9, 
    Gender: 'Female', 
    LearningLevel: 'Bậc 2 - Âm đôi ghép từ', 
    Note: 'Phản xạ phát âm nhạy bén, lực hơi khá tốt. Thỉnh thoảng bị mỏi hàm khi uốn cụm âm kép ngắn.',
    Status: 'Active',
    ProgressLevel: 'Stable',
    CreatedAt: '2026-01-12',
    UpdatedAt: '2026-05-29'
  },
  { 
    ChildId: 'CHD-003', 
    ParentUserId: 'USR-P3', 
    FullName: 'Phạm Minh Khang', 
    Age: 7, 
    Gender: 'Male', 
    LearningLevel: 'Bậc 1 - Sửa ngọng S', 
    Note: 'Bé rụt rè trước micro mộc. Phát hơi dẹt lưỡi, đặc biệt là dải âm gió S và X. Điểm luyện tập gần đây thấp, cần giáo viên hỗ trợ thêm.',
    Status: 'Active',
    ProgressLevel: 'Need Support',
    CreatedAt: '2026-02-15',
    UpdatedAt: '2026-05-28'
  },
  { 
    ChildId: 'CHD-004', 
    ParentUserId: 'USR-P4', 
    FullName: 'Hoàng Anh Thư', 
    Age: 10, 
    Gender: 'Female', 
    LearningLevel: 'Bậc 2 - Ghép vần', 
    Note: 'Phát âm tròn chữ nhưng âm lượng tương đối nhỏ. Họng khỏe nhưng lưỡi hơi thụ động về sau.',
    Status: 'Active',
    ProgressLevel: 'Stable',
    CreatedAt: '2026-02-20',
    UpdatedAt: '2026-05-31'
  }
];

interface TeacherStudentsProps {
  onNavigate: (screen: string) => void;
}

export default function TeacherStudents({ onNavigate }: TeacherStudentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4); // 4 cards per page

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGender, selectedLevel]);

  // Find associated parent user info helpers
  const getParentInfo = (parentId: string) => {
    return MOCK_PARENT_USERS.find(p => p.UserId === parentId);
  };

  // Get Avatar based on gender and student ID to match other screens
  const getAvatarUrl = (id: string, gender: string) => {
    const seed = id.toLowerCase();
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=c0aede`;
  };

  // Filter children list
  const filteredChildren = useMemo(() => {
    return MOCK_CHILDREN.filter(child => {
      const parent = getParentInfo(child.ParentUserId);
      const matchesSearch = 
        child.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.ChildId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.LearningLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (parent && parent.FullName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGender = selectedGender === 'All' || child.Gender === selectedGender;
      const matchesLevel = selectedLevel === 'All' || child.LearningLevel.includes(selectedLevel);

      return matchesSearch && matchesGender && matchesLevel;
    });
  }, [searchTerm, selectedGender, selectedLevel]);

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

  // Statistics
  const stats = useMemo(() => {
    return {
      total: MOCK_CHILDREN.length,
      averageAge: (MOCK_CHILDREN.reduce((sum, c) => sum + c.Age, 0) / MOCK_CHILDREN.length).toFixed(1),
      boys: MOCK_CHILDREN.filter(c => c.Gender === 'Male').length,
      girls: MOCK_CHILDREN.filter(c => c.Gender === 'Female').length,
    };
  }, []);

  return (
    <div className="space-y-8" id="teacher-students-container">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-[#4EACAF]/10 to-[#FF8E8E]/10 p-8 rounded-[40px] border-2 border-white/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4EACAF]/10 border border-[#4EACAF]/20 text-[#4EACAF] text-xs font-black uppercase tracking-wider">
            <Baby className="w-4 h-4" /> Danh sách học sinh của tôi
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-gray-900">
            Quản Lý <span className="text-[#4EACAF]">Phát Âm</span> Học Viên
          </h1>
          <p className="text-gray-500 font-bold max-w-xl text-sm">
            Theo dõi sự tiến bộ, điều chỉnh độ khó và hỗ trợ dầy đủ quá trình tập luyện tương tác 3D GodotXR của từng bé.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="p-4 bg-white rounded-3xl shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF8E8E]/10 text-[#FF8E8E] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stats.total}</div>
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Tổng học viên</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of fast overview boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-slate-50 flex items-center gap-5"
        >
          <div className="w-14 h-14 bg-[#4EACAF]/10 text-[#4EACAF] rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-gray-900">{stats.total} Học sinh</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lớp tôi phụ trách</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-slate-50 flex items-center gap-5"
        >
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-gray-900">{stats.averageAge} Tuổi</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Độ tuổi trung bình</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-slate-50 flex items-center gap-5"
        >
          <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-gray-900">{stats.boys} Bé trai</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tình cảm &ăng nổ</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-slate-50 flex items-center gap-5"
        >
          <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-gray-900">{stats.girls} Bé gái</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Dịu dàng & siêng năng</p>
          </div>
        </motion.div>
      </div>

      {/* Control filters bar */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border-b-4 border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, ID hoặc tên phụ huynh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-13 pr-5 py-4 rounded-[20px] bg-slate-50 border-2 border-slate-50 focus:border-[#4EACAF] focus:bg-white text-sm font-bold text-gray-800 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-[18px]">
            {['All', 'Male', 'Female'].map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={cn(
                  "px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer",
                  selectedGender === gender
                    ? "bg-[#4EACAF] text-white shadow-md shadow-[#4EACAF]/20"
                    : "text-gray-500 hover:text-gray-800 hover:bg-slate-100/60"
                )}
              >
                {gender === 'All' ? 'Tất cả giới tính' : gender === 'Male' ? 'Bé Trai' : 'Bé Gái'}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-[18px]">
            {['All', 'Bậc 1', 'Bậc 2'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={cn(
                  "px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer",
                  selectedLevel === lvl
                    ? "bg-[#4EACAF] text-white shadow-md shadow-[#4EACAF]/20"
                    : "text-gray-500 hover:text-gray-800 hover:bg-slate-100/60"
                )}
              >
                {lvl === 'All' ? 'Tất cả trình độ' : lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Children grid display */}
      {filteredChildren.length === 0 ? (
        <div className="bg-white py-16 px-6 text-center rounded-[40px] border-2 border-dashed border-slate-200">
          <AlertCircle className="w-14 h-14 text-orange-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy thông tin phù hợp</h3>
          <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto">
            Hệ thống không tìm thấy học viên nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn. Hãy đổi thông số tìm kiếm nhé!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {paginatedChildren.map((child) => {
              const parent = getParentInfo(child.ParentUserId);
              return (
                <motion.div
                  key={child.ChildId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-[40px] p-8 shadow-sm border-b-8 border-gray-100 hover:border-b-8 hover:border-[#4EACAF]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    {/* Top line ID & Level Tag */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <span className="text-[10px] font-black italic tracking-wider text-gray-400 uppercase bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                        {child.ChildId}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#4EACAF] bg-[#4EACAF]/10 px-2.5 py-1 rounded-full border border-[#4EACAF]/10">
                          {child.LearningLevel}
                        </span>
                        {child.ProgressLevel === 'Improving' && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            Đang tiến bộ
                          </span>
                        )}
                        {child.ProgressLevel === 'Stable' && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                            Ổn định
                          </span>
                        )}
                        {child.ProgressLevel === 'Need Support' && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Thầy cô cần hỗ trợ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Main profile block */}
                    <div className="flex items-start gap-5">
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-[28px] bg-sky-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                          <img 
                            src={getAvatarUrl(child.ChildId, child.Gender)} 
                            alt={child.FullName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-md",
                          child.Gender === 'Male' ? "bg-sky-500 text-white" : "bg-pink-500 text-white"
                        )}>
                          {child.Gender === 'Male' ? '♂' : '♀'}
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <h3 className="text-2xl font-black italic tracking-tight text-gray-900 hover:text-[#4EACAF] transition-colors">
                          {child.FullName}
                        </h3>
                        <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                          <span>Tuổi: <strong className="text-slate-800">{child.Age}</strong></span>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1">
                            Trạng thái: 
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3" /> Tích cực
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Parental Info section */}
                    {parent && (
                      <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-black">
                          <Heart className="w-4 h-4 text-orange-400 fill-orange-400" /> 
                          <span>Phụ huynh: {parent.FullName}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#777] font-bold">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{parent.PhoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{parent.Email}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Diagnostic remarks / Notes of teaching */}
                    {child.Note && (
                      <p className="text-xs text-slate-400 italic font-bold border-l-4 border-slate-100 pl-3 leading-relaxed">
                        " {child.Note} "
                      </p>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-bold uppercase">
                      Cập nhật: {child.UpdatedAt}
                    </span>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNavigate(`TEACHER_STUDENT_DETAIL:${child.ChildId}`)}
                      className="inline-flex items-center gap-1.5 px-5 py-3 bg-[#4EACAF] text-white font-black text-xs rounded-2xl shadow-md hover:bg-[#5ec4c7] hover:shadow-lg shadow-[#4EACAF]/10 transition-all cursor-pointer"
                    >
                      Xem chi tiết học bạ
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-white rounded-[40px] p-6 border border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredChildren.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemLabel="học sinh"
            />
          </div>
        </div>
      )}
    </div>
  );
}
