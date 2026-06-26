import { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, X, Check, Trash2, AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useChildManagementApi } from '../../hooks/useChildManagementApi';
import type { ChildProfileResponse } from '../../services/childProfileService';
import { getSessionUser } from '../../lib/authSession';

const CARD_COLORS = [
  'bg-blue-300 border-blue-400',
  'bg-teal-300 border-teal-400',
  'bg-emerald-300 border-emerald-400',
  'bg-purple-300 border-purple-400',
  'bg-orange-300 border-orange-400',
  'bg-red-300 border-red-400',
  'bg-purple-400 border-purple-500',
  'bg-violet-400 border-violet-500',
];

interface FormState {
  fullName: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  learningLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  note: string;
}

const EMPTY_FORM: FormState = {
  fullName: '',
  age: '',
  gender: 'Male',
  learningLevel: 'Beginner',
  note: '',
};

export default function ProfileManagement() {
  const {
    getMyChildProfiles,
    createChildProfile,
    updateChildProfile,
    deleteChildProfile,
  } = useChildManagementApi();

  const [children, setChildren] = useState<ChildProfileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [modalType, setModalType] = useState<'form' | 'delete' | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedChild, setSelectedChild] = useState<ChildProfileResponse | null>(null);
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  
  const [alertConfig, setAlertConfig] = useState<{
    message: string;
    type: 'success' | 'warning';
  } | null>(null);

  const triggerNotification = useCallback(
    (message: string, type: 'success' | 'warning' = 'success') => {
      setAlertConfig({ message, type });
      window.setTimeout(() => setAlertConfig(null), 4000);
    },
    []
  );

  const fetchMyChildren = useCallback(async () => {
    setIsLoading(true);
    const result = await getMyChildProfiles();
    if (result.success && result.data) {
      setChildren(result.data);
    } else {
      triggerNotification(
        result.errors?.join(' ') || result.message || 'Không thể tải danh sách hồ sơ bé.',
        'warning'
      );
    }
    setIsLoading(false);
  }, [getMyChildProfiles, triggerNotification]);

  useEffect(() => {
    void fetchMyChildren();
  }, [fetchMyChildren]);

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedChild(null);
    setFormState(EMPTY_FORM);
    setFormError('');
  };

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedChild(null);
    setFormState(EMPTY_FORM);
    setFormError('');
    setModalType('form');
  };

  const openEditModal = (child: ChildProfileResponse, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card click
    setFormMode('edit');
    setSelectedChild(child);
    setFormState({
      fullName: child.fullName,
      age: String(child.age),
      gender: child.gender,
      learningLevel: child.learningLevel,
      note: child.note || '',
    });
    setFormError('');
    setModalType('form');
  };

  const openDeleteModal = (child: ChildProfileResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChild(child);
    setModalType('delete');
  };

  const handleFormChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setFormState((current) => ({ ...current, [key]: value }));
    setFormError('');
  };

  const validateForm = () => {
    if (!formState.fullName.trim()) return 'Vui lòng nhập tên của bé.';
    if (!formState.age.trim()) return 'Vui lòng nhập tuổi của bé.';
    const parsedAge = Number(formState.age);
    if (Number.isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 100) {
      return 'Độ tuổi của bé phải là một số hợp lệ từ 1 đến 100.';
    }
    return '';
  };

  const handleSubmitForm = async () => {
    const valError = validateForm();
    if (valError) {
      setFormError(valError);
      return;
    }

    const currentUser = getSessionUser();
    if (!currentUser) {
      setFormError('Không tìm thấy phiên làm việc của phụ huynh. Vui lòng đăng nhập lại.');
      return;
    }

    setFormError('');
    setIsSaving(true);

    const payload = {
      userId: Number(currentUser.UserId),
      fullName: formState.fullName.trim(),
      age: Number(formState.age),
      gender: formState.gender,
      learningLevel: formState.learningLevel,
      note: formState.note.trim() || null,
      status: 'Active' as const,
    };

    const result =
      formMode === 'create'
        ? await createChildProfile(payload)
        : await updateChildProfile(selectedChild!.id, payload);

    if (result.success && result.data) {
      triggerNotification(
        formMode === 'create' ? 'Đã tạo hồ sơ bé mới thành công!' : 'Đã cập nhật hồ sơ bé thành công!',
        'success'
      );
      await fetchMyChildren();
      handleCloseModal();
    } else {
      setFormError(result.errors?.join(' ') || result.message || 'Lưu thông tin thất bại.');
    }
    setIsSaving(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedChild) return;

    setFormError('');
    setIsDeleting(true);

    const result = await deleteChildProfile(selectedChild.id);
    if (result.success) {
      triggerNotification(`Đã xóa hồ sơ bé ${selectedChild.fullName} thành công!`, 'success');
      await fetchMyChildren();
      handleCloseModal();
    } else {
      triggerNotification(
        result.errors?.join(' ') || result.message || 'Không thể xóa hồ sơ bé.',
        'warning'
      );
    }
    setIsDeleting(false);
  };

  const getGenderText = (gender: 'Male' | 'Female' | 'Other') => {
    if (gender === 'Male') return 'Nam';
    if (gender === 'Female') return 'Nữ';
    return 'Khác';
  };

  const getLevelText = (level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    if (level === 'Beginner') return 'Cấp độ: Sơ cấp';
    if (level === 'Intermediate') return 'Cấp độ: Trung cấp';
    return 'Cấp độ: Nâng cao';
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative text-left">
      
      {/* Notifications */}
      {alertConfig && (
        <div
          className={cn(
            'fixed left-1/2 top-10 z-[300] w-[90%] max-w-lg -translate-x-1/2 flex items-center gap-4 rounded-3xl border-2 border-white p-5 shadow-2xl backdrop-blur-md text-white transition-all',
            alertConfig.type === 'success' ? 'bg-[#4EACAF]/95' : 'bg-red-500/95'
          )}
        >
          <div className="rounded-xl bg-white/20 p-2">
            {alertConfig.type === 'success' ? (
              <Check className="h-5 w-5 text-white" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex-1 font-black italic tracking-tight">{alertConfig.message}</div>
          <button
            onClick={() => setAlertConfig(null)}
            className="rounded-full p-1 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header card with refresh button */}
      <div className="bg-white/45 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản Lý Hồ Sơ Của Bé</h1>
          <p className="text-gray-500 font-bold text-sm">
            Quản lý hồ sơ, tình trạng học và đồng hành phát triển cùng bé
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchMyChildren()}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-6 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-white/80 cursor-pointer active:scale-95 shrink-0 self-start md:self-auto"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          Tải lại dữ liệu
        </button>
      </div>

      {isLoading && children.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <RefreshCw className="h-10 w-10 text-sky-500 animate-spin" />
          <p className="text-gray-500 font-bold">Đang tải danh sách hồ sơ bé...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {children.map((child, idx) => {
            const cardBg = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <div 
                key={child.id} 
                className={cn(
                  "rounded-[32px] p-8 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 group relative border-2 border-transparent",
                  cardBg
                )}
              >
                {/* Delete button (Trash icon) at the top-right corner of card */}
                <button
                  type="button"
                  onClick={(e) => openDeleteModal(child, e)}
                  className="absolute top-4 right-4 p-2 bg-white/30 hover:bg-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 text-gray-800"
                  title="Xóa hồ sơ bé"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-5" onClick={(e) => openEditModal(child, e)}>
                  <div className="w-20 h-20 bg-white/40 rounded-[28px] p-2 backdrop-blur-md overflow-hidden relative border-4 border-white/50 shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${child.fullName}`} 
                      alt={child.fullName} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Edit2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1 text-gray-900 min-w-0">
                    <h4 className="text-2xl font-black truncate" title={child.fullName}>{child.fullName}</h4>
                    <div className="text-xs font-bold opacity-80 space-y-0.5">
                      <p>Tuổi: {child.age}</p>
                      <p>Giới tính: {getGenderText(child.gender)}</p>
                      <p>{getLevelText(child.learningLevel)}</p>
                      <p className="line-clamp-1 italic text-[11px] opacity-70">
                        {child.note ? `Lưu ý: ${child.note}` : 'Không có ghi chú đặc biệt'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add profile card */}
          <button 
            onClick={openCreateModal}
            className="rounded-[32px] bg-sky-50 border-4 border-dashed border-sky-300 p-8 flex flex-col items-center justify-center gap-4 group hover:bg-sky-100 transition-all cursor-pointer h-full min-h-[160px]"
          >
            <div className="w-16 h-16 rounded-full bg-sky-200 flex items-center justify-center text-sky-600 transition-transform group-hover:scale-110">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-xl font-bold text-sky-800">Thêm hồ sơ mới</span>
          </button>
        </div>
      )}

      {!isLoading && children.length === 0 && (
        <p className="text-center text-gray-400 font-bold italic pt-12">Không còn hồ sơ nào để hiển thị</p>
      )}

      {/* Create / Edit Form Modal */}
      {modalType === 'form' && (
        <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-blue-900/10 animate-in fade-in duration-300">
          <div className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-sky-100 px-10 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 italic">
                {formMode === 'create' ? 'Đăng ký hồ sơ bé mới' : `Chỉnh sửa hồ sơ: ${selectedChild?.fullName}`}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="app-modal-body p-10 flex flex-col md:flex-row gap-10">
              <div className="space-y-6 flex-1 text-left">
                {formError && (
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-rose-800 text-xs font-bold leading-normal">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Full name input */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tên của bé</label>
                  <input 
                    type="text" 
                    value={formState.fullName}
                    onChange={(e) => handleFormChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:ring-4 focus:ring-sky-100 focus:bg-white transition-all text-gray-800" 
                  />
                </div>

                {/* Age input */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tuổi của bé</label>
                  <input 
                    type="number" 
                    value={formState.age}
                    onChange={(e) => handleFormChange('age', e.target.value)}
                    placeholder="Nhập tuổi (ví dụ: 6)..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:ring-4 focus:ring-sky-100 focus:bg-white transition-all text-gray-800" 
                  />
                </div>

                {/* Gender select */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Giới tính</label>
                  <div className="relative">
                    <select 
                      value={formState.gender}
                      onChange={(e) => handleFormChange('gender', e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-lg outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-sky-100 focus:bg-white transition-all text-gray-800"
                    >
                      <option value="Male">👦 Nam</option>
                      <option value="Female">👧 Nữ</option>
                      <option value="Other">⚪ Khác</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Learning level select */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cấp độ học tập</label>
                  <div className="relative">
                    <select 
                      value={formState.learningLevel}
                      onChange={(e) => handleFormChange('learningLevel', e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-lg outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-sky-100 focus:bg-white transition-all text-gray-800"
                    >
                      <option value="Beginner">🎨 Sơ cấp (Beginner)</option>
                      <option value="Intermediate">🚀 Trung cấp (Intermediate)</option>
                      <option value="Advanced">🏆 Nâng cao (Advanced)</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Notes input */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ghi chú bổ sung</label>
                  <textarea 
                    value={formState.note}
                    onChange={(e) => handleFormChange('note', e.target.value)}
                    placeholder="Nhập ghi chú đặc biệt về sức khỏe, thói quen hoặc quá trình tiếp thu của bé..."
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-base outline-none focus:ring-4 focus:ring-sky-100 focus:bg-white transition-all text-gray-800 resize-none"
                  />
                </div>
              </div>

              {/* Right panel: Profile image preview and action buttons */}
              <div className="flex flex-col items-center justify-center gap-8 w-full md:w-64">
                <div className="w-48 h-48 bg-orange-100 rounded-full border-8 border-gray-50 shadow-inner overflow-hidden relative group">
                  <img 
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${formState.fullName || 'default'}`} 
                    alt="profile preview" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                
                <div className="flex gap-4 w-full">
                  <button 
                    type="button"
                    onClick={handleCloseModal} 
                    disabled={isSaving}
                    className="flex-1 py-4 border-4 border-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50 text-center"
                  >
                    Hủy
                  </button>
                  <button 
                    type="button"
                    onClick={handleSubmitForm} 
                    disabled={isSaving}
                    className="flex-1 py-4 bg-sky-500 text-white font-black rounded-2xl shadow-lg shadow-sky-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === 'delete' && (
        <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-red-900/10 animate-in fade-in duration-300">
          <div className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-red-50 px-8 py-6 flex items-center justify-between border-b border-red-100">
              <h2 className="text-xl font-black text-red-700 italic flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Xác nhận xóa hồ sơ
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-red-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-red-500" />
              </button>
            </div>

            <div className="p-8 text-left space-y-6">
              <p className="text-gray-700 font-bold text-sm leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ của bé <strong className="text-red-600 font-extrabold">{selectedChild?.fullName}</strong>?
                Hành động này không thể hoàn tác và toàn bộ lịch sử học tập của bé sẽ bị xóa.
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isDeleting}
                  className="flex-1 py-3 border-2 border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-center disabled:opacity-50"
                >
                  Không, giữ lại
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                  Có, xóa hồ sơ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bot Illustration */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[55%] animate-bounce pointer-events-none">
        <img 
          src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Lucky&backgroundColor=ffffff" 
          alt="Bot" 
          className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full p-3 shadow-2xl border-4 border-orange-200" 
          referrerPolicy="no-referrer" 
        />
      </div>
    </div>
  );
}
