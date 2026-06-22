import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  X, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  AlertTriangle, 
  Tags, 
  Mic, 
  Brain, 
  MessageSquare, 
  Clock, 
  Power, 
  Activity, 
  Layers, 
  Calendar,
  Sparkles,
  SlidersHorizontal,
  FolderHeart
} from 'lucide-react';
import { cn } from '../../lib/utils';

// DB Interface
interface ExerciseType {
  TypeId: string;
  TypeName: string;
  Description: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

// Initial Mock data suggestion: DB EXERCISE_TYPES table
const INITIAL_EXERCISE_TYPES: ExerciseType[] = [
  {
    TypeId: 'TYP-001',
    TypeName: 'Pronunciation Practice',
    Description: 'Luyện tập phát âm chuẩn từng âm tiết, từ vựng và câu ngắn thông qua bộ nhận dạng giọng nói tự động (ASR). Tạp âm môi trường được khử lọc phục vụ hoạt động.',
    IsActive: true,
    CreatedAt: '2026-05-10 10:15',
    UpdatedAt: '2026-05-12 11:30'
  },
  {
    TypeId: 'TYP-002',
    TypeName: 'Vocabulary Practice',
    Description: 'Học hiểu từ vựng qua tương tác trực quan 3D, flashcards thông minh lật mở và các trò chơi ghép đồ vật ngộ nghĩnh nhằm kích thích ghi nhớ sâu.',
    IsActive: true,
    CreatedAt: '2026-05-11 09:20',
    UpdatedAt: '2026-05-11 09:20'
  },
  {
    TypeId: 'TYP-003',
    TypeName: 'Oral Motor Exercise',
    Description: 'Chuỗi bài tập trò chơi rèn luyện cơ hàm, khum môi, uốn uốn và điều phối hơi thở giúp làm tăng độ linh hoạt của các bộ phận tạo âm thực tế.',
    IsActive: true,
    CreatedAt: '2026-05-12 14:00',
    UpdatedAt: '2026-05-13 15:45'
  },
  {
    TypeId: 'TYP-004',
    TypeName: 'Listening and Repeating',
    Description: 'Rèn luyện phản xạ nghe chủ động và bắt chước nhại giọng trợ lý robot 3D với ngữ điệu sinh động và phát âm mẫu lôi cuốn.',
    IsActive: true,
    CreatedAt: '2026-05-14 08:30',
    UpdatedAt: '2026-05-15 10:00'
  },
  {
    TypeId: 'TYP-005',
    TypeName: 'Communication Response',
    Description: 'Các kịch bản hội thoại giả lập giúp bé tự chọn cách phản hồi thông qua khẩu lệnh phù hợp trong các tình huống thực tiễn và giao lưu bạn bè.',
    IsActive: false,
    CreatedAt: '2025-12-15 11:45',
    UpdatedAt: '2026-01-10 14:15'
  }
];

// Helper to get matching beautiful icon based on type name
const getTypeIcon = (typeName: string) => {
  const norm = typeName.toLowerCase();
  if (norm.includes('pronunciation') || norm.includes('phát âm')) {
    return <Mic className="w-8 h-8 text-[#4EACAF]" />;
  }
  if (norm.includes('vocabulary') || norm.includes('từ vựng')) {
    return <Tags className="w-8 h-8 text-orange-400" strokeWidth={2.2} />;
  }
  if (norm.includes('motor') || norm.includes('cơ miệng')) {
    return <Brain className="w-8 h-8 text-[#FF8E8E]" />;
  }
  if (norm.includes('listening') || norm.includes('nghe')) {
    return <FolderHeart className="w-8 h-8 text-indigo-500" />;
  }
  return <MessageSquare className="w-8 h-8 text-sky-500" />;
};

// Helper to get decorative color gradient for cards based on Type ID
const getCardGradient = (typeId: string) => {
  const colors = [
    'from-teal-500/10 via-emerald-500/5 to-transparent',
    'from-orange-400/10 via-yellow-500/5 to-transparent',
    'from-pink-500/10 via-rose-500/5 to-transparent',
    'from-indigo-500/10 via-purple-500/5 to-transparent',
    'from-sky-500/10 via-cyan-500/5 to-transparent'
  ];
  const charCodeSum = typeId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charCodeSum % colors.length];
};

export default function ExerciseTypeManagement() {
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>(INITIAL_EXERCISE_TYPES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<string>('ALL');

  // Popup toasts feedback helper
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => setAlertConfig(null), 3500);
  };

  // Modal flow controls
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);

  // Form Inputs
  const [formTypeName, setFormTypeName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Stats calculation
  const totalTypes = exerciseTypes.length;
  const activeCount = exerciseTypes.filter(t => t.IsActive).length;
  const inactiveCount = exerciseTypes.filter(t => !t.IsActive).length;

  // Actions
  const handleToggleState = (typeId: string) => {
    const updated = exerciseTypes.map(t => {
      if (t.TypeId === typeId) {
        const nextState = !t.IsActive;
        triggerToast(
          `Đã chuyển trạng thái hoạt động của loại bài tập sang: ${nextState ? 'BẬT (Hoạt động)' : 'TẮT (Tạm ngưng)'}.`
        );
        return {
          ...t,
          IsActive: nextState,
          UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
      }
      return t;
    });
    setExerciseTypes(updated);
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedType(null);
    setFormTypeName('');
    setFormDescription('');
    setFormIsActive(true);
    setIsOpenFormModal(true);
  };

  const handleOpenEdit = (t: ExerciseType) => {
    setModalMode('edit');
    setSelectedType(t);
    setFormTypeName(t.TypeName);
    setFormDescription(t.Description);
    setFormIsActive(t.IsActive);
    setIsOpenFormModal(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTypeName.trim()) {
      triggerToast('Tên phân loại bài tập bắt buộc phải nhập!', 'warning');
      return;
    }
    if (!formDescription.trim()) {
      triggerToast('Vui lòng cung giải thích lý do tóm lược cho phân loại này!', 'warning');
      return;
    }

    const sysDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (modalMode === 'add') {
      const nextIdNum = exerciseTypes.length + 1;
      const nextId = `TYP-${String(nextIdNum).padStart(3, '0')}`;
      const newType: ExerciseType = {
        TypeId: nextId,
        TypeName: formTypeName,
        Description: formDescription,
        IsActive: formIsActive,
        CreatedAt: sysDate,
        UpdatedAt: sysDate
      };
      setExerciseTypes([newType, ...exerciseTypes]);
      triggerToast(`Thêm phân loại bài tập "${formTypeName}" thành công!`);
    } else {
      if (!selectedType) return;
      const updated = exerciseTypes.map(t => {
        if (t.TypeId === selectedType.TypeId) {
          return {
            ...t,
            TypeName: formTypeName,
            Description: formDescription,
            IsActive: formIsActive,
            UpdatedAt: sysDate
          };
        }
        return t;
      });
      setExerciseTypes(updated);
      triggerToast(`Đã thay đổi thông số phân loại bài tập "${selectedType.TypeId}" thành công!`);
    }

    setIsOpenFormModal(false);
  };

  // Searching logic pipeline
  const filteredTypes = exerciseTypes.filter(item => {
    const searchString = `${item.TypeName} ${item.Description} ${item.TypeId}`.toLowerCase();
    const queryMatch = searchString.includes(searchQuery.toLowerCase());

    const statusMatch = 
      filterActive === 'ALL' || 
      (filterActive === 'ACTIVE' && item.IsActive) || 
      (filterActive === 'INACTIVE' && !item.IsActive);

    return queryMatch && statusMatch;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative" id="exercise-type-root">
      
      {/* Dynamic Toast Feedback Overlay */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="type-toast-box"
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

      {/* 1. Header Hero section */}
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <Activity className="w-3.5 h-3.5" />
            Cơ sở phân cấp dữ liệu GodotXR
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1">
            Quản Lý <span className="text-[#4EACAF]">Loại Bài Tập</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed">
            Phân mục hóa dữ liệu, quản lý và điều chế các công nghệ phản xạ cốt lõi như Nhận Diện Giọng Nói, uốn cơ môi hàm, hay thẻ học ghép 3D thực tế ảo.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          id="add-type-btn"
        >
          <Plus className="w-5 h-5" />
          Thêm loại bài tập
        </button>
      </div>

      {/* 2. Visual Statistic indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#4EACAF] shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
            <Layers className="w-7 h-7 text-[#4EACAF]" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{totalTypes}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Tổng Loại Bài Tập</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 border-b-4 border-emerald-500 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
            <Sparkles className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-tight text-emerald-600">{activeCount}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Đang Hoạt Động</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 border-b-4 border-gray-300 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
            <Power className="w-7 h-7 text-gray-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-800 tracking-tight leading-tight text-gray-500">{inactiveCount}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Đã Tắt / Tạm Ngưng</p>
          </div>
        </div>
      </div>

      {/* 3. Dropdowns search & filtration bar */}
      <div className="bg-white rounded-[36px] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        {/* Search Input block */}
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm kiếm phân loại theo tên hoặc nội dung hướng dẫn..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FDFCF5] border-2 border-transparent font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 bg-gray-200/60 rounded-full hover:bg-gray-200"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {/* State Selection Dropdown status */}
        <div className="relative w-full md:w-64">
          <select 
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="w-full appearance-none bg-[#FDFCF5] border-2 border-transparent hover:border-[#4EACAF]/20 pl-5 pr-10 py-4 rounded-2xl font-black italic text-xs tracking-wide text-gray-700 outline-none cursor-pointer uppercase focus:bg-white focus:border-[#4EACAF]"
          >
            <option value="ALL">Mọi trạng thái</option>
            <option value="ACTIVE">Kích hoạt (Hoạt động)</option>
            <option value="INACTIVE">Khóa / Bảo trì</option>
          </select>
          <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 4. Elegant Kid-Friendly Cards Grid list */}
      {filteredTypes.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-gray-100 py-24 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100 italic">
            <Layers className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-xl font-black text-gray-700">Không khớp loại bài tập nào trong cơ sở học!</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setFilterActive('ALL');
            }}
            className="px-6 py-2.5 bg-[#4EACAF]/10 hover:bg-[#4EACAF]/20 text-[#4EACAF] font-black text-xs uppercase rounded-xl transition-all"
          >
            Cách tạo lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="types-card-list">
          {filteredTypes.map((type) => (
            <div 
              key={type.TypeId} 
              className={cn(
                "bg-white rounded-[40px] border border-slate-100/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between p-8",
                !type.IsActive ? "opacity-75 bg-slate-50/20" : ""
              )}
            >
              {/* Top background decorative blob */}
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-br -z-0 opacity-80 pointer-events-none",
                getCardGradient(type.TypeId)
              )} />

              <div className="space-y-6 relative z-10">
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-white shadow-md rounded-[20px] border border-gray-100 flex items-center justify-center">
                    {getTypeIcon(type.TypeName)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-transparent">
                      {type.TypeId}
                    </span>
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider leading-none",
                      type.IsActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-[#FF8E8E] border border-rose-100/40'
                    )}>
                      {type.IsActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                    </span>
                  </div>
                </div>

                {/* Title & Desc */}
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-snug line-clamp-1 italic">
                    {type.TypeName}
                  </h3>
                  <p className="text-gray-500 font-bold text-sm leading-relaxed line-clamp-3">
                    {type.Description}
                  </p>
                </div>
              </div>

              {/* Footer action logs & interactive commands */}
              <div className="border-t border-gray-50 mt-6 pt-5 flex items-center justify-between relative z-10">
                {/* Creation date badge */}
                <div className="flex items-center gap-1.5 font-bold text-gray-400 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-gray-300" />
                  <span>{type.CreatedAt}</span>
                </div>

                {/* Button groups */}
                <div className="flex items-center gap-1 justify-end">
                  {/* Toggle Active state Button */}
                  <button 
                    onClick={() => handleToggleState(type.TypeId)}
                    className="p-2.5 hover:bg-teal-50 text-[#4EACAF] rounded-2xl transition-colors"
                    title={type.IsActive ? "Tắt kích hoạt" : "Bật kích hoạt"}
                  >
                    {type.IsActive ? (
                      <ToggleRight className="w-7 h-7 text-[#4EACAF]" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-300" />
                    )}
                  </button>

                  {/* Edit Card details Button */}
                  <button 
                    onClick={() => handleOpenEdit(type)}
                    className="py-2.5 px-4 bg-[#4EACAF]/10 hover:bg-[#4EACAF] hover:text-white text-[#4EACAF] rounded-2xl text-xs font-black italic tracking-widest uppercase transition-all flex items-center gap-1.5 shrink-0"
                    title="Chỉnh sửa loại"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Create / Edit popup Modal Overlay */}
      <AnimatePresence>
        {isOpenFormModal && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto w-full h-full" id="type-overlay-container">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="app-modal-panel app-modal-panel--compact bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 relative z-30"
              id="type-modal-box"
            >
              {/* Header block */}
              <div className={cn(
                "px-8 py-6 flex items-center justify-between border-b",
                modalMode === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' : 'bg-sky-50 border-sky-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalMode === 'add' ? <Plus className="w-6 h-6 text-[#4EACAF]" /> : <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalMode === 'add' ? 'Thêm Loại Bài Tập' : `Chỉnh Sửa Loại: ${selectedType?.TypeId}`}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalMode === 'add' ? 'Tài liệu liên kết nhóm đồ họa trực quan nhi đồng' : 'Cấu hình lại mô tả kịch bản hỗ trợ giáo viên'}
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
              <form onSubmit={handleSaveSubmit} className="app-modal-body p-8 space-y-6" id="type-info-form">
                <div className="space-y-4">
                  
                  {/* TypeName input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Tên loại bài tập <span className="text-[#FF8E8E]">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Pronunciation Practice..."
                      value={formTypeName}
                      onChange={(e) => setFormTypeName(e.target.value)}
                      className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] text-sm focus:bg-white"
                      maxLength={50}
                    />
                  </div>

                  {/* Description input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Giải thích mô tả ý nghĩa cốt lõi <span className="text-[#FF8E8E]">*</span>
                    </label>
                    <textarea 
                      placeholder="Mô tả cụ thể kịch bản hoạt động của loại học phần này khi chiếu trên môi trường web hoặc kính VR..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl p-5 font-bold text-gray-700 outline-none focus:border-[#4EACAF] text-sm focus:bg-white resize-none leading-relaxed"
                      maxLength={300}
                    />
                  </div>

                  {/* Toggle Active state */}
                  <div className="bg-[#FDFCF5] p-5 rounded-3xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-gray-800 leading-none mb-1.5">Kích hoạt phân loại bài tập</p>
                      <p className="text-xs text-gray-400 font-bold uppercase leading-none">Cho phép giáo viên áp dụng học liệu rộng rãi</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormIsActive(!formIsActive)}
                      className="p-1 px-2.5 transition-all text-xs"
                    >
                      {formIsActive ? (
                        <ToggleRight className="w-10 h-10 text-[#4EACAF]" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-300" />
                      )}
                    </button>
                  </div>

                </div>

                {/* Footer Save details */}
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
                    id="save-type-submit"
                  >
                    <Check className="w-4 h-4" />
                    Lưu Thay Đổi
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

// Simple internal helper component for visual details rendering uniformity
interface StatCard {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}
function StatCardItem({ title, value, subtitle, icon, bgColor, borderColor }: StatCard) {
  return (
    <div className={cn("bg-white p-6 rounded-[32px] border border-gray-100/40 shadow-sm flex items-center justify-between gap-4", bgColor)}>
      <div className="space-y-1.5">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{value}</p>
        <p className="text-[10px] text-neutral-400 font-bold italic truncate max-w-[170px]">{subtitle}</p>
      </div>
      <div className={cn("w-14 h-14 bg-white/70 shadow-sm rounded-2xl flex items-center justify-center border shrink-0", borderColor)}>
        {icon}
      </div>
    </div>
  );
}

function DifficultyLevelBadge({ level }: { level: 'Easy' | 'Medium' | 'Hard' }) {
  let styleClasses = '';
  switch (level) {
    case 'Easy':
      styleClasses = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      break;
    case 'Medium':
      styleClasses = 'bg-orange-50 text-orange-600 border border-orange-100';
      break;
    case 'Hard':
      styleClasses = 'bg-rose-50 text-[#FF8E8E] border border-rose-100/50';
      break;
  }

  return (
    <span className={cn("inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider", styleClasses)}>
      {level === 'Easy' ? '🟢' : level === 'Medium' ? '🟡' : '🔴'} {level}
    </span>
  );
}
