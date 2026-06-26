import React, { useEffect, useState } from 'react';
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
  ArrowRight,
  BookOpen,
  Lock,
  Unlock,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import CustomSelect from '../../components/common/CustomSelect';
import { useSchoolYearManagementApi, type SchoolYearResponse } from '../../hooks/useSchoolYearManagementApi';

// DB Interface according to database architecture
interface SchoolYear {
  SchoolYearId: string;
  SchoolYearName: string;
  StartDate: string;
  EndDate: string;
  Status: 'Active' | 'Upcoming' | 'Completed';
  CreatedAt: string;
  UpdatedAt: string;
}

const mapSchoolYear = (year: SchoolYearResponse): SchoolYear => ({
  SchoolYearId: String(year.id),
  SchoolYearName: year.yearName,
  StartDate: year.startDate.slice(0, 10),
  EndDate: year.endDate.slice(0, 10),
  Status: year.status,
  CreatedAt: year.createdAt,
  UpdatedAt: year.updatedAt ?? year.createdAt,
});

// Initial Mock data for SCHOOL_YEAR table
const INITIAL_SCHOOL_YEARS: SchoolYear[] = [
  {
    SchoolYearId: 'SCH-2024',
    SchoolYearName: 'Năm học 2024 - 2025',
    StartDate: '2024-09-01',
    EndDate: '2025-05-31',
    Status: 'Completed',
    CreatedAt: '2024-08-15 09:00',
    UpdatedAt: '2025-05-31 17:00'
  },
  {
    SchoolYearId: 'SCH-2025',
    SchoolYearName: 'Năm học 2025 - 2026',
    StartDate: '2025-09-01',
    EndDate: '2026-05-31',
    Status: 'Active',
    CreatedAt: '2025-08-10 10:30',
    UpdatedAt: '2026-05-20 15:15'
  },
  {
    SchoolYearId: 'SCH-2026',
    SchoolYearName: 'Năm học 2026 - 2027',
    StartDate: '2026-09-01',
    EndDate: '2027-05-31',
    Status: 'Upcoming',
    CreatedAt: '2026-05-15 08:00',
    UpdatedAt: '2026-05-15 08:00'
  }
];

export default function SchoolYearManagement() {
  const { getSchoolYears, createSchoolYear, updateSchoolYear, deleteSchoolYear, setActiveSchoolYear } = useSchoolYearManagementApi();
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Popup toasts feedback helper
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => setAlertConfig(null), 3500);
  };

  useEffect(() => {
    void getSchoolYears().then(result => {
      if (result.success && result.data) setSchoolYears(result.data.items.map(mapSchoolYear));
      else triggerToast(result.errors.join(' ') || result.message, 'warning');
    });
  }, []);

  // Modal controls
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedYear, setSelectedYear] = useState<SchoolYear | null>(null);

  // Form Inputs
  const [formName, setFormName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<SchoolYear['Status']>('Upcoming');

  // Stats calculation
  const totalYears = schoolYears.length;
  const activeCount = schoolYears.filter(y => y.Status === 'Active').length;
  const completedCount = schoolYears.filter(y => y.Status === 'Completed').length;

  // Actions
  const handleSetCurrent = async (yearId: string) => {
    const targetYr = schoolYears.find(y => y.SchoolYearId === yearId);
    if (!targetYr) return;

    const result = await setActiveSchoolYear(Number(yearId));
    if (result.success) {
      const refreshed = await getSchoolYears();
      if (refreshed.data) setSchoolYears(refreshed.data.items.map(mapSchoolYear));
      triggerToast(result.message);
    } else triggerToast(result.errors.join(' ') || result.message, 'warning');
  };

  const handleCloseYear = async (yearId: string) => {
    const targetYr = schoolYears.find(y => y.SchoolYearId === yearId);
    if (!targetYr) return;

    const result = await updateSchoolYear(Number(yearId), {
      yearName: targetYr.SchoolYearName, startDate: targetYr.StartDate,
      endDate: targetYr.EndDate, status: 'Completed',
    });
    if (result.success && result.data) {
      setSchoolYears(current => current.map(y => y.SchoolYearId === yearId ? mapSchoolYear(result.data!) : y));
      triggerToast(result.message);
    } else triggerToast(result.errors.join(' ') || result.message, 'warning');
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedYear(null);
    setFormName('');
    setFormStartDate('');
    setFormEndDate('');
    setFormStatus('Upcoming');
    setIsOpenFormModal(true);
  };

  const handleOpenEdit = (y: SchoolYear) => {
    setModalMode('edit');
    setSelectedYear(y);
    setFormName(y.SchoolYearName);
    setFormStartDate(y.StartDate);
    setFormEndDate(y.EndDate);
    setFormStatus(y.Status);
    setIsOpenFormModal(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      triggerToast('Tên năm học bắt buộc phải nhập!', 'warning');
      return;
    }
    if (!formStartDate) {
      triggerToast('Ngày bắt đầu năm học không được để trống!', 'warning');
      return;
    }
    if (!formEndDate) {
      triggerToast('Ngày kết thúc năm học không được để trống!', 'warning');
      return;
    }
    if (new Date(formStartDate) >= new Date(formEndDate)) {
      triggerToast('Ngày bắt đầu phải trước ngày kết thúc!', 'warning');
      return;
    }

    const payload = { yearName: formName.trim(), startDate: formStartDate, endDate: formEndDate, status: formStatus };
    const apiResult = modalMode === 'add'
      ? await createSchoolYear(payload)
      : selectedYear ? await updateSchoolYear(Number(selectedYear.SchoolYearId), payload) : null;
    if (apiResult?.success && apiResult.data) {
      const mapped = mapSchoolYear(apiResult.data);
      setSchoolYears(current => modalMode === 'add' ? [mapped, ...current] : current.map(y => y.SchoolYearId === mapped.SchoolYearId ? mapped : y));
      triggerToast(apiResult.message);
      setIsOpenFormModal(false);
    } else if (apiResult) triggerToast(apiResult.errors.join(' ') || apiResult.message, 'warning');
    return;

    const sysDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (modalMode === 'add') {
      const yearStartVal = formStartDate.slice(0, 4);
      const nextId = `SCH-${yearStartVal}`;
      
      // Duplication check helper
      if (schoolYears.some(y => y.SchoolYearId === nextId)) {
        triggerToast(`Năm học khởi nguồn từ năm ${yearStartVal} đã tồn tại mã trùng lặp trong kho!`, 'warning');
        return;
      }

      const newYear: SchoolYear = {
        SchoolYearId: nextId,
        SchoolYearName: formName,
        StartDate: formStartDate,
        EndDate: formEndDate,
        Status: formStatus,
        CreatedAt: sysDate,
        UpdatedAt: sysDate
      };

      // If adding an Active school year, we turn other active physical years to Completed
      let newList = [...schoolYears];
      if (formStatus === 'Active') {
        newList = newList.map(y => y.Status === 'Active' ? { ...y, Status: 'Completed', UpdatedAt: sysDate } : y);
      }

      setSchoolYears([newYear, ...newList]);
      triggerToast(`Thêm năm học "${formName}" thành công!`);
    } else {
      if (!selectedYear) return;

      // If updating to Active, turn others to Completed
      let newList = [...schoolYears];
      if (formStatus === 'Active') {
        newList = newList.map(y => (y.Status === 'Active' && y.SchoolYearId !== selectedYear.SchoolYearId) 
          ? { ...y, Status: 'Completed', UpdatedAt: sysDate } 
          : y
        );
      }

      const updated = newList.map(y => {
        if (y.SchoolYearId === selectedYear.SchoolYearId) {
          return {
            ...y,
            SchoolYearName: formName,
            StartDate: formStartDate,
            EndDate: formEndDate,
            Status: formStatus,
            UpdatedAt: sysDate
          };
        }
        return y;
      });

      setSchoolYears(updated);
      triggerToast(`Thay đổi thông số năm học "${selectedYear.SchoolYearId}" thành công.`);
    }

    setIsOpenFormModal(false);
  };

  const handleDelete = async (yearId: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn phát động gỡ bỏ năm học ${yearId}? Hành động này có thể ảnh hưởng liên đới đến các kỳ thi và học sinh.`)) {
      const result = await deleteSchoolYear(Number(yearId));
      if (result.success) {
        setSchoolYears(current => current.filter(y => y.SchoolYearId !== yearId));
        triggerToast(result.message, 'warning');
      } else triggerToast(result.errors.join(' ') || result.message, 'warning');
    }
  };

  // Searching logic pipeline
  const filteredYears = schoolYears.filter(item => {
    const searchString = `${item.SchoolYearName} ${item.SchoolYearId}`.toLowerCase();
    const queryMatch = searchString.includes(searchQuery.toLowerCase());

    const statusMatch = 
      filterStatus === 'ALL' || 
      item.Status === filterStatus;

    return queryMatch && statusMatch;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative" id="school-year-root">
      
      {/* Dynamic Toast Feedback Overlay */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="year-toast-box"
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
            <Calendar className="w-3.5 h-3.5" />
            Điều hành cấu trúc thời gian trường học
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1">
            Quản Lý <span className="text-[#4EACAF]">Năm Học</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed">
            Thiết lập năm học, quản lý các mốc thời kỳ làm cơ sở xây dựng kế hoạch, tổ chức lớp học và phân phối học bạ điện tử trong hệ thống bổ trợ rèn luyện ngữ âm GodotXR.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          id="add-year-btn"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Thêm năm học mới
        </button>
      </div>

      {/* 2. Kid-friendly visual Statistics indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-[32px] p-6 border-b-4 border-[#4EACAF] shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
            <Layers className="w-7 h-7 text-[#4EACAF]" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{totalYears}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Tổng năm học</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 border-b-4 border-emerald-500 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-600 tracking-tight leading-tight">{activeCount}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Đang hoạt động</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 border-b-4 border-gray-400 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7 text-gray-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-500 tracking-tight leading-tight">{completedCount}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Đã kết thúc</p>
          </div>
        </div>
      </div>

      {/* 3. Search & filter bar */}
      <div className="bg-white rounded-[36px] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        {/* Search block */}
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm kiếm năm học theo niên khóa hoặc mã hệ thống..." 
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

        {/* State dropdown */}
        <CustomSelect
          value={filterStatus}
          onChange={setFilterStatus}
          variant="filter"
          className="w-full md:w-64"
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'Active', label: 'Đang hoạt động' },
            { value: 'Upcoming', label: 'Sắp diễn ra' },
            { value: 'Completed', label: 'Đã kết thúc' }
          ]}
        />
      </div>

      {/* 4. Elegant School Year Table list view */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden" id="year-table-container">
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
          <div>
            <h3 className="text-2xl font-black text-gray-900 leading-none italic">Chi tiết danh mục năm học</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Dữ liệu liên hành tinh quản lý niên khóa trẻ nhỏ</p>
          </div>
          <span className="text-xs bg-teal-50 text-teal-600 px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-teal-100/30">
            SCHOOL_YEAR
          </span>
        </div>

        {filteredYears.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100 italic">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700">Không tìm thấy thông tin niên niên khớp yêu cầu!</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
              }}
              className="px-6 py-2.5 bg-[#4EACAF]/10 hover:bg-[#4EACAF]/20 text-[#4EACAF] font-black text-xs uppercase rounded-xl transition-all"
            >
              Hủy bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="year-table-element">
              <thead>
                <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest">
                  <th className="py-5 px-10">Mã Năm Học</th>
                  <th className="py-5 px-6">Tên Niên Khóa</th>
                  <th className="py-5 px-6">Bắt đầu</th>
                  <th className="py-5 px-6">Kết thúc</th>
                  <th className="py-5 px-6">Trạng thái</th>
                  <th className="py-5 px-6">Thời điểm tạo</th>
                  <th className="py-5 px-10 text-right">Lựa chọn điều phối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold text-sm text-gray-700">
                {filteredYears.map((year) => (
                  <tr key={year.SchoolYearId} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* ID */}
                    <td className="py-5 px-10 font-mono text-gray-400 font-extrabold text-xs">
                      {year.SchoolYearId}
                    </td>

                    {/* Name */}
                    <td className="py-5 px-6 font-extrabold text-[#111] italic text-base">
                      {year.SchoolYearName}
                    </td>

                    {/* Start Date */}
                    <td className="py-5 px-6 text-gray-500 font-mono text-xs">
                      {year.StartDate}
                    </td>

                    {/* End Date */}
                    <td className="py-5 px-6 text-gray-500 font-mono text-xs">
                      {year.EndDate}
                    </td>

                    {/* Status Badge */}
                    <td className="py-5 px-6">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                        year.Status === 'Active' && 'bg-emerald-50 text-emerald-600 border-emerald-100',
                        year.Status === 'Upcoming' && 'bg-amber-50 text-amber-600 border-amber-100',
                        year.Status === 'Completed' && 'bg-gray-100 text-gray-500 border-gray-200'
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          year.Status === 'Active' && 'bg-emerald-500',
                          year.Status === 'Upcoming' && 'bg-amber-500',
                          year.Status === 'Completed' && 'bg-gray-400'
                        )} />
                        {year.Status === 'Active' ? 'Đang hoạt động' : 
                         year.Status === 'Upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                      </span>
                    </td>

                    {/* CreatedAt */}
                    <td className="py-5 px-6 text-xs text-gray-400 font-medium">
                      {year.CreatedAt}
                    </td>

                    {/* Actions tools */}
                    <td className="py-5 px-10 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Edit button */}
                        <button
                          onClick={() => handleOpenEdit(year)}
                          className="py-2 px-3 bg-teal-50 hover:bg-[#4EACAF] text-[#4EACAF] hover:text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1"
                          title="Sửa niên khóa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Sửa
                        </button>

                        {/* Set self as Current (Active) */}
                        {year.Status !== 'Active' && (
                          <button
                            onClick={() => handleSetCurrent(year.SchoolYearId)}
                            className="py-2 px-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl text-xs font-black transition-colors"
                            title="Đặt làm năm học hiện tại chủ quản"
                          >
                            Làm hiện tại
                          </button>
                        )}

                        {/* Close session button */}
                        {year.Status === 'Active' && (
                          <button
                            onClick={() => handleCloseYear(year.SchoolYearId)}
                            className="py-2 px-3 bg-rose-50 hover:bg-rose-600 text-[#FF8E8E] hover:text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1"
                            title="Đóng năm học hiện hành"
                          >
                            <Lock className="w-3 h-3" />
                            Đóng năm
                          </button>
                        )}

                        {/* Delete button option */}
                        <button
                          onClick={() => handleDelete(year.SchoolYearId)}
                          className="p-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-colors"
                          title="Gỡ sạch dữ liệu"
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
      </div>

      {/* 5. Create / Edit form Modal Container overlay */}
      <AnimatePresence>
        {isOpenFormModal && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/15 animate-in fade-in duration-300 overflow-y-auto w-full h-full" id="year-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="app-modal-panel app-modal-panel--compact bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 relative z-30"
              id="year-modal-box"
            >
              {/* Header block */}
              <div className={cn(
                "px-8 py-6 flex items-center justify-between border-b",
                modalMode === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' : 'bg-sky-50 border-sky-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalMode === 'add' ? <Plus className="w-6 h-6 text-[#4EACAF]" strokeWidth={2.5} /> : <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalMode === 'add' ? 'Thêm Niên Khóa Mới' : `Chỉnh Sửa Niên Khóa: ${selectedYear?.SchoolYearId}`}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Cân đối cơ số phòng học, phân phối trẻ thơ đúng tiến độ học kì
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
              <form onSubmit={handleSaveSubmit} className="app-modal-body p-8 space-y-6" id="year-detail-form">
                <div className="space-y-4">
                  
                  {/* Name value input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Tên niên khóa biểu diễn <span className="text-[#FF8E8E]">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Năm học 2025 - 2026..."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] text-sm focus:bg-white"
                      maxLength={40}
                    />
                  </div>

                  {/* Dates input cluster */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Start date */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Ngày phát động bắt đầu <span className="text-[#FF8E8E]">*</span>
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
                        Ngày kết thúc bế giảng <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <input 
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] text-sm focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Status Picker selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Trạng thái hiện tại của niên khóa <span className="text-[#FF8E8E]">*</span>
                    </label>
                      <CustomSelect
                        value={formStatus}
                        onChange={(val) => setFormStatus(val as SchoolYear['Status'])}
                        variant="form"
                        options={[
                          { value: 'Upcoming', label: 'Sắp diễn ra (Upcoming)' },
                          { value: 'Active', label: 'Đang hoạt động (Active)' },
                          { value: 'Completed', label: 'Đã kết thúc (Completed)' }
                        ]}
                      />
                  </div>

                  {/* Little helper warning */}
                  <div className="bg-[#FDFCF5] p-4 rounded-3xl border border-gray-100 flex gap-3 text-xs font-bold leading-relaxed text-gray-500">
                    <Info className="w-5 h-5 text-[#4EACAF] shrink-0" />
                    <span>Lưu ý: Nếu bạn đặt trạng thái là <strong>Đang hoạt động</strong>, hệ thống sẽ tự động điều chế khép lại (Completed) các niên khóa hoạt động trước đó để bảo toàn đồng bộ liên khoa.</span>
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
                    id="save-year-submit"
                  >
                    <Check className="w-4 h-4" />
                    Lưu niên khóa
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
