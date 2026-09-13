import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, X, RefreshCw, Baby, Award, Activity, FileText, Check, AlertTriangle, User } from 'lucide-react';
import { cn, resolveAvatarUrl } from '../../lib/utils';
import { useChildManagementApi } from '../../hooks/useChildManagementApi';
import type { ChildProfileResponse } from '../../services/childProfileService';

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

export default function ProfileManagement() {
  const { getMyChildProfiles } = useChildManagementApi();

  const [children, setChildren] = useState<ChildProfileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfileResponse | null>(null);

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

  const handleOpenDetail = (child: ChildProfileResponse) => {
    setSelectedChild(child);
  };

  const handleCloseDetail = () => {
    setSelectedChild(null);
  };

  const getGenderText = (gender: 'Male' | 'Female' | 'Other' | string) => {
    if (gender === 'Male') return 'Nam';
    if (gender === 'Female') return 'Nữ';
    return 'Khác';
  };

  const getLevelText = (level: 'Beginner' | 'Intermediate' | 'Advanced' | string) => {
    if (level === 'Beginner') return 'Cấp độ: Sơ cấp';
    if (level === 'Intermediate') return 'Cấp độ: Trung cấp';
    if (level === 'Advanced') return 'Cấp độ: Nâng cao';
    return `Cấp độ: ${level}`;
  };

  const getChildTypeLabel = (childType: string | null | undefined) => {
    if (!childType) return 'Chưa phân loại';
    if (childType === 'SSD') return 'Rối loạn âm lời nói (SSD)';
    if (childType === 'DLD') return 'Phát triển ngôn ngữ (DLD)';
    return childType;
  };

  return (
    <div className="space-y-6 pb-24 relative text-left">
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
          <div className="flex-1 font-medium tracking-tight">{alertConfig.message}</div>
          <button
            onClick={() => setAlertConfig(null)}
            className="rounded-full p-1 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header with title and refresh button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight leading-tight">
            Quản Lý <span className="text-[#FF8E8E]">Hồ Sơ Của Bé</span>
          </h1>
          <p className="text-sm font-normal text-slate-500">
            Thông tin hồ sơ học tập và rèn luyện thực tế ảo của bé
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchMyChildren()}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-6 py-4 text-sm font-medium text-slate-600 transition-all hover:bg-white/80 cursor-pointer active:scale-95 shrink-0 self-start md:self-auto shadow-xs"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          Tải lại dữ liệu
        </button>
      </div>

      {isLoading && children.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <RefreshCw className="h-10 w-10 text-sky-500 animate-spin" />
          <p className="text-gray-500 font-normal">Đang tải danh sách hồ sơ bé...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {children.map((child, idx) => {
            const cardBg = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <div
                key={child.id}
                onClick={() => handleOpenDetail(child)}
                className={cn(
                  "rounded-xl p-8 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 group relative border-2 border-transparent",
                  cardBg
                )}
                title="Nhấn để xem chi tiết hồ sơ bé"
              >
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 bg-white/40 rounded-[28px] p-2 backdrop-blur-md overflow-hidden relative border-4 border-white/50 shrink-0">
                    <img
                      src={resolveAvatarUrl(child.avatar, child.fullName, 'adventurer')}
                      alt={child.fullName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1 text-gray-900 min-w-0 flex-1">
                    <h4 className="text-2xl font-bold truncate" title={child.fullName}>
                      {child.fullName}
                    </h4>
                    <div className="text-xs font-normal opacity-90 space-y-0.5">
                      <p>Tuổi: {child.age}</p>
                      <p>Giới tính: {getGenderText(child.gender)}</p>
                      {child.childType && <p>Phân loại: {getChildTypeLabel(child.childType)}</p>}
                      <p>{getLevelText(child.learningLevel)}</p>
                      <p className="line-clamp-1 italic text-[11px] opacity-70">
                        {child.note ? `Lưu ý: ${child.note}` : 'Không có ghi chú đặc biệt'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subtle view hint badge */}
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-normal text-gray-800/70">
                  <span>Trạng thái: <span className="text-emerald-700 font-medium">{child.status === 'Active' ? 'Hoạt động' : 'Tạm dừng'}</span></span>
                  <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-800">
                    <Eye className="w-3.5 h-3.5" /> Chi tiết
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && children.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-12 text-center space-y-3 max-w-lg mx-auto mt-10">
          <Baby className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">Chưa có hồ sơ của bé</h3>
          <p className="text-sm text-slate-500 font-normal leading-relaxed">
            Hiện tại chưa có hồ sơ của bé nào được kết nối với tài khoản phụ huynh. Vui lòng liên hệ với giáo viên hoặc quản trị viên nhà trường để được hỗ trợ tạo và ghép hồ sơ bé.
          </p>
        </div>
      )}

      {/* Read-only Detail Modal */}
      {selectedChild && createPortal(
        <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-blue-900/10 animate-in fade-in duration-300">
          <div className="app-modal-panel bg-white rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-100 to-teal-100 px-8 py-6 flex items-center justify-between border-b border-sky-200/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/80 rounded-2xl shadow-xs text-sky-600">
                  <Baby className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Thông Tin Hồ Sơ Bé
                  </h2>
                  <p className="text-xs font-normal text-slate-500">
                    Chi tiết hồ sơ học tập và can thiệp
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/60 rounded-full transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6 text-left max-h-[75vh] overflow-y-auto">
              {/* Profile Card Summary */}
              <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-sm border-2 border-sky-200 shrink-0 overflow-hidden">
                  <img
                    src={resolveAvatarUrl(selectedChild.avatar, selectedChild.fullName, 'adventurer')}
                    alt={selectedChild.fullName}
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-2xl font-bold text-slate-800 truncate">
                    {selectedChild.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                      <User className="w-3 h-3" />
                      {getGenderText(selectedChild.gender)} • {selectedChild.age} tuổi
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <Activity className="w-3 h-3" />
                      {selectedChild.status === 'Active' ? 'Đang hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Cấp độ học tập
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedChild.learningLevel === 'Beginner'
                      ? '🎨 Sơ cấp (Beginner)'
                      : selectedChild.learningLevel === 'Intermediate'
                      ? '🚀 Trung cấp (Intermediate)'
                      : selectedChild.learningLevel === 'Advanced'
                      ? '🏆 Nâng cao (Advanced)'
                      : selectedChild.learningLevel}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-500" />
                    Phân loại trẻ
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {getChildTypeLabel(selectedChild.childType)}
                  </p>
                </div>
              </div>

              {/* Special Note */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  Ghi chú & dặn dò đặc biệt
                </span>
                <p className="text-sm font-normal text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                  {selectedChild.note ? selectedChild.note : 'Không có ghi chú đặc biệt nào từ nhà trường.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm shadow-md transition-all cursor-pointer active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Floating Bot Illustration */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[55%] animate-pulse pointer-events-none">
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
