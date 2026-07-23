import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Volume2, 
  Award, 
  Activity, 
  ChevronDown, 
  Info, 
  MessageCircle, 
  CheckCircle, 
  Play, 
  Smile, 
  ShieldAlert, 
  User, 
  Sparkles,
  RotateCcw,
  VolumeX,
  FileAudio
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLearningResultApi } from '../../hooks/useLearningResultApi';
import CustomSelect from '../../components/common/CustomSelect';

interface Child {
  ChildId: string;
  FullName: string;
  Age: number;
  LearningLevel: string;
}

interface Result {
  ResultId: string;
  ChildId: string;
  ExerciseId: string;
  Score: number;
  AudioRecordUrl: string;
  ReplayDataUrl: string;
  FeedbackText: string;
  CreatedAt: string;
  SessionId: string;
  CompletionStatus: string;
  DurationSeconds: number;
  errorCount?: number;
  correctCount?: number;
}

type RoleView = 'ADMIN' | 'TEACHER' | 'PARENT';

function getStoredRoleView(): RoleView {
  const role = localStorage.getItem('user_role');
  if (role === 'TEACHER') return 'TEACHER';
  if (role === 'PARENT') return 'PARENT';
  return 'ADMIN';
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace('T', ' ').slice(0, 19);
}

function mapChildRecord(child: any): Child {
  return {
    ChildId: String(child.id),
    FullName: child.fullName,
    Age: child.age,
    LearningLevel: child.learningLevel,
  };
}

function mapResultRecord(result: any): Result {
  const completedAt = formatDateTime(result.completedAt);
  const startedAt = formatDateTime(result.startedAt);

  return {
    ResultId: String(result.id),
    ChildId: String(result.childId),
    ExerciseId: String(result.exerciseId || ''),
    Score: Math.round(result.score),
    AudioRecordUrl: result.audioRecordUrl ?? '',
    ReplayDataUrl: result.replayDataUrl ?? '',
    FeedbackText: result.feedbackText ?? '',
    CreatedAt: completedAt || startedAt,
    SessionId: result.sessionId || '',
    CompletionStatus: result.completionStatus || 'Incomplete',
    DurationSeconds: result.durationSeconds || 0,
    errorCount: result.errorCount,
    correctCount: result.correctCount,
  };
}

export default function PronunciationDetailPage() {
  const {
    getChildProfiles,
    getCurrentUserWithChildrenProfiles,
    getResultsByChild,
    updateResultFeedback,
    getChunksBySession,
    assessChunk,
  } = useLearningResultApi();

  // Selected state
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  
  // Details state
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loadingChunks, setLoadingChunks] = useState<boolean>(false);
  
  // Feedback comment state
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [savingFeedback, setSavingFeedback] = useState<boolean>(false);

  // AI Assessment state
  const [referenceTexts, setReferenceTexts] = useState<Record<number, string>>({});
  const [chunkAssessments, setChunkAssessments] = useState<Record<number, any>>({});
  const [assessingChunkIndex, setAssessingChunkIndex] = useState<number | null>(null);

  // General loading & error
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentRoleView, setCurrentRoleView] = useState<RoleView>(getStoredRoleView());
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load child profiles
  useEffect(() => {
    async function loadChildren() {
      setIsApiLoading(true);
      try {
        const roleView = getStoredRoleView();
        const childRecords = roleView === 'PARENT'
          ? await (async () => {
              const res = await getCurrentUserWithChildrenProfiles();
              return res.success && res.data ? res.data.childProfiles : [];
            })()
          : await (async () => {
              const res = await getChildProfiles();
              return res.success && res.data ? res.data.items : [];
            })();

        const mapped = childRecords.map(mapChildRecord);
        setChildren(mapped);
        if (mapped.length > 0) {
          setSelectedChildId(Number(mapped[0].ChildId));
        }
        setCurrentRoleView(roleView);
      } catch (err) {
        setApiError('Không thể tải danh sách trẻ từ hệ thống.');
      } finally {
        setIsApiLoading(false);
      }
    }
    loadChildren();
  }, [getChildProfiles, getCurrentUserWithChildrenProfiles]);

  // Load results when selectedChildId changes
  useEffect(() => {
    if (!selectedChildId) return;
    async function loadResults() {
      setIsApiLoading(true);
      setApiError(null);
      try {
        const res = await getResultsByChild(selectedChildId);
        if (res.success && res.data) {
          setResults(res.data.map(mapResultRecord));
        } else {
          setResults([]);
        }
      } catch (err) {
        setApiError('Không thể tải danh sách session học của trẻ.');
      } finally {
        setIsApiLoading(false);
      }
    }
    loadResults();
    setExpandedResultId(null);
    setChunks([]);
    setChunkAssessments({});
  }, [selectedChildId, getResultsByChild]);

  // Toggle result and fetch chunks
  const handleToggleResult = async (result: Result) => {
    if (expandedResultId === result.ResultId) {
      setExpandedResultId(null);
      setChunks([]);
      return;
    }

    setExpandedResultId(result.ResultId);
    setLoadingChunks(true);
    setChunks([]);
    setChunkAssessments({});
    setFeedbackInput(result.FeedbackText || '');

    try {
      const res = await getChunksBySession(Number(result.ChildId), result.SessionId);
      if (res.success && res.data) {
        setChunks(res.data);
      } else {
        setChunks([]);
        showToast('Không tìm thấy file chunk nào của session này.', 'warn');
      }
    } catch (err) {
      showToast('Có lỗi xảy ra khi tải danh sách file chunk.', 'warn');
    } finally {
      setLoadingChunks(false);
    }
  };

  // Save feedback/comments
  const handleSaveFeedback = async (resultId: string) => {
    if (!feedbackInput.trim()) {
      showToast('Vui lòng nhập nhận xét trước khi lưu.', 'warn');
      return;
    }

    setSavingFeedback(true);
    try {
      const res = await updateResultFeedback(Number(resultId), feedbackInput);
      if (res.success) {
        showToast('Đã lưu nhận xét của giáo viên thành công!', 'success');
        setResults(prev => prev.map(r => r.ResultId === resultId ? { ...r, FeedbackText: feedbackInput } : r));
      } else {
        showToast('Lưu nhận xét không thành công.', 'warn');
      }
    } catch (err) {
      showToast('Lỗi hệ thống khi cập nhật nhận xét.', 'warn');
    } finally {
      setSavingFeedback(false);
    }
  };

  // Run Azure Speech Pronunciation Assessment
  const handleAssessChunk = async (chunkIndex: number, result: Result) => {
    const text = referenceTexts[chunkIndex]?.trim();
    if (!text) {
      showToast('Vui lòng nhập văn bản chuẩn để AI so khớp phát âm.', 'warn');
      return;
    }

    setAssessingChunkIndex(chunkIndex);
    showToast(`AI đang tiến hành phân tích khẩu âm đoạn #${chunkIndex}...`, 'info');
    try {
      const res = await assessChunk({
        childProfileId: Number(result.ChildId),
        sessionId: result.SessionId,
        chunkIndex,
        referenceText: text
      });

      if (res.success && res.data) {
        setChunkAssessments(prev => ({ ...prev, [chunkIndex]: res.data }));
        showToast('AI đã hoàn thành đánh giá phát âm thành công!', 'success');
      } else {
        showToast('Không thể gọi AI đánh giá phát âm.', 'warn');
      }
    } catch (err) {
      showToast('Lỗi kết nối dịch vụ đánh giá phát âm AI.', 'warn');
    } finally {
      setAssessingChunkIndex(null);
    }
  };

  const getChildInfo = () => {
    return children.find(c => Number(c.ChildId) === selectedChildId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 relative" id="pronunciation-details-view">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
          >
            <div className={cn(
              "px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white bg-slate-900/90 backdrop-blur-md text-white text-sm font-semibold",
              toastMessage.type === 'success' ? 'border-emerald-500/30' : toastMessage.type === 'info' ? 'border-indigo-500/30' : 'border-rose-500/30'
            )}>
              <div className="p-2 rounded-lg bg-white/10">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : toastMessage.type === 'warn' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                ) : (
                  <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                )}
              </div>
              <p className="flex-1 min-w-0">{toastMessage.text}</p>
              <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/10 rounded-full text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled Dashboard Header */}
      <div className="bg-gradient-to-r from-[#4EACAF]/20 via-[#4EACAF]/5 to-transparent backdrop-blur-md rounded-3xl p-8 border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Đánh giá phát âm của trẻ (Kính GodotXR)
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Đánh giá & Phân tích <span className="text-[#4EACAF]">Phát âm</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl text-sm leading-relaxed">
            Chọn trẻ để xem danh sách phiên học (Session) từ thiết bị VR, lắng nghe file âm thanh ghi âm chi tiết của từng đoạn nói và thực hiện đánh giá phát âm AI.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 self-start md:self-center">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn học sinh của bạn:</label>
          <CustomSelect
            value={selectedChildId ? String(selectedChildId) : ''}
            onChange={(val) => setSelectedChildId(Number(val))}
            options={children.map((c) => ({
              value: c.ChildId,
              label: `${c.FullName} (${c.Age} tuổi)`
            }))}
            variant="form"
            className="min-w-[240px]"
          />
        </div>
      </div>

      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-sm font-semibold text-rose-700">
          {apiError}
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Session List (Accordion) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Danh sách Session luyện tập</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Click vào session bên dưới để xem chi tiết âm thanh</p>
            
            {isApiLoading ? (
              <div className="py-12 text-center">
                <Activity className="w-8 h-8 text-[#4EACAF] animate-spin mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">Đang tải lịch sử các phiên học...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Smile className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-semibold text-sm">Chưa có kết quả session nào của trẻ.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((res) => {
                  const isExpanded = expandedResultId === res.ResultId;
                  return (
                    <div 
                      key={res.ResultId}
                      className={cn(
                        "rounded-2xl border transition-all cursor-pointer overflow-hidden",
                        isExpanded 
                          ? "border-[#4EACAF] bg-[#4EACAF]/5 shadow-sm" 
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      )}
                      onClick={() => handleToggleResult(res)}
                    >
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              Session #{res.ResultId}
                            </span>
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                              res.CompletionStatus === 'Completed' 
                                ? "bg-emerald-50 text-emerald-700" 
                                : "bg-amber-50 text-amber-700"
                            )}>
                              {res.CompletionStatus === 'Completed' ? 'Đạt' : 'Chưa đạt'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-semibold">
                            Ngày hoàn thành: {res.CreatedAt}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-slate-800 leading-none">
                            {res.Score}%
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold tracking-tight mt-1">
                            {res.DurationSeconds} giây
                          </div>
                          <div className="text-[9px] text-[#4EACAF] font-bold tracking-tight mt-0.5 whitespace-nowrap">
                            Đúng: {res.correctCount ?? 0} | Sai: {res.errorCount ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Child profile overview info */}
          {selectedChildId && getChildInfo() && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl text-[#4EACAF] shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{getChildInfo()?.FullName}</h4>
                  <p className="text-xs text-slate-400 font-semibold">{getChildInfo()?.LearningLevel}</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
                <Info className="w-4 h-4 inline-block mr-1.5 text-slate-400 shrink-0" />
                <span>Bạn đang sử dụng quyền <strong>{currentRoleView === 'TEACHER' ? 'Giáo viên' : currentRoleView === 'PARENT' ? 'Phụ huynh' : 'Quản trị viên'}</strong> để truy cập và đánh giá hồ sơ.</span>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Session Details & Chunks */}
        <div className="lg:col-span-7 space-y-6">
          {expandedResultId ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
              
              {/* Session header details */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">Thông tin Session #{expandedResultId}</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Mã phiên lưu trữ: <span className="font-mono">{results.find(r => r.ResultId === expandedResultId)?.SessionId}</span>
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setExpandedResultId(null);
                    setChunks([]);
                  }} 
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Teacher Comments Section */}
              {(currentRoleView === 'ADMIN' || currentRoleView === 'TEACHER') && (
                <div className="space-y-3 bg-[#FFFDF5] p-4.5 rounded-2xl border border-yellow-100">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-amber-500" />
                    Nhận xét & Đánh giá của giáo viên
                  </h4>
                  <textarea
                    rows={3}
                    placeholder="Viết đánh giá tiến bộ của bé, các âm bé phát âm còn lỗi, bài tập luyện khẩu hình cần thực hành thêm tại nhà..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm font-medium placeholder-slate-400 bg-white focus:border-[#4EACAF] transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      disabled={savingFeedback}
                      onClick={() => handleSaveFeedback(expandedResultId)}
                      className="px-5 py-2.5 bg-[#4EACAF] hover:bg-[#3D8C8F] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      {savingFeedback ? (
                        <Activity className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Lưu nhận xét
                    </button>
                  </div>
                </div>
              )}

              {currentRoleView === 'PARENT' && results.find(r => r.ResultId === expandedResultId)?.FeedbackText && (
                <div className="space-y-2 bg-[#FFFDF5] p-4.5 rounded-2xl border border-yellow-100 italic">
                  <h4 className="text-sm font-bold text-slate-800 not-italic flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-[#4EACAF]" />
                    Nhận xét từ giáo viên đồng hành:
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                    &ldquo;{results.find(r => r.ResultId === expandedResultId)?.FeedbackText}&rdquo;
                  </p>
                </div>
              )}

              {/* Chunks List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Danh sách các file âm thanh chunk:</h4>
                  <span className="text-xs bg-[#4EACAF]/10 text-[#4EACAF] px-2 py-0.5 rounded font-bold">
                    {chunks.length} đoạn âm thanh
                  </span>
                </div>

                {loadingChunks ? (
                  <div className="py-12 text-center">
                    <Activity className="w-8 h-8 text-[#4EACAF] animate-spin mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">Đang quét tìm các file âm thanh từ máy chủ MinIO...</p>
                  </div>
                ) : chunks.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                    <VolumeX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Không quét thấy file audio chunk tương ứng.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chunks.map((chunk, idx) => {
                      const cIndex = chunk.chunkIndex;
                      const assessment = chunkAssessments[cIndex];
                      const isAssessing = assessingChunkIndex === cIndex;

                      return (
                        <div 
                          key={cIndex}
                          className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-4 transition-all hover:bg-slate-50/80"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-[#4EACAF]/10 text-[#4EACAF] rounded-lg">
                                <FileAudio className="w-4 h-4" />
                              </div>
                              <div className="text-sm font-bold text-slate-800">
                                Đoạn âm thanh #{cIndex + 1}
                              </div>
                            </div>
                            
                            {/* Audio player */}
                            <div className="w-full sm:w-auto">
                              <audio 
                                controls 
                                src={chunk.chunkUrl}
                                className="w-full max-w-[280px] h-9 outline-none"
                              />
                            </div>
                          </div>

                          {/* AI assessment form & feedback visualization */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">Từ/Câu kỳ vọng:</span>
                              <input 
                                type="text"
                                placeholder="Nhập từ chuẩn bé phải đọc..."
                                value={referenceTexts[cIndex] || ''}
                                onChange={(e) => setReferenceTexts(prev => ({ ...prev, [cIndex]: e.target.value }))}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-xs font-semibold placeholder-slate-400 focus:border-[#4EACAF]"
                              />
                              <button
                                disabled={isAssessing}
                                onClick={() => handleAssessChunk(cIndex, results.find(r => r.ResultId === expandedResultId)!)}
                                className="px-4 py-1.5 bg-[#4EACAF] hover:bg-[#3D8C8F] disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                              >
                                {isAssessing ? (
                                  <Activity className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5" />
                                )}
                                AI Đánh giá
                              </button>
                            </div>

                            {/* Assessment Report Visualization */}
                            {assessment && (
                              <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                  <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                                    <div className="text-xs font-bold text-slate-400">Độ chính xác</div>
                                    <div className="text-sm font-black text-emerald-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.accuracyScore || assessment.PronunciationAssessment?.AccuracyScore}%
                                    </div>
                                  </div>
                                  <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                                    <div className="text-xs font-bold text-slate-400">Phát âm</div>
                                    <div className="text-sm font-black text-indigo-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.pronunciationScore || assessment.PronunciationAssessment?.PronunciationScore}%
                                    </div>
                                  </div>
                                  <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100/50">
                                    <div className="text-xs font-bold text-slate-400">Trôi chảy</div>
                                    <div className="text-sm font-black text-purple-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.fluencyScore || assessment.PronunciationAssessment?.FluencyScore}%
                                    </div>
                                  </div>
                                  <div className="p-2 bg-teal-50/50 rounded-lg border border-teal-100/50">
                                    <div className="text-xs font-bold text-slate-400">Hoàn thành</div>
                                    <div className="text-sm font-black text-teal-600 mt-0.5">
                                      {assessment.pronunciationAssessment?.completenessScore || assessment.PronunciationAssessment?.CompletenessScore}%
                                    </div>
                                  </div>
                                </div>

                                {/* Words rendering */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                  <div className="text-xs font-bold text-slate-400">Chi tiết phát âm từng từ của AI:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {(assessment.words || assessment.Words || []).map((wObj: any, wIdx: number) => {
                                      const wordText = wObj.word || wObj.Word;
                                      const score = wObj.pronunciationAssessment?.accuracyScore || wObj.PronunciationAssessment?.AccuracyScore || 0;
                                      const isCorrect = score >= 80;
                                      const isMedium = score >= 50 && score < 80;

                                      return (
                                        <div 
                                          key={wIdx}
                                          className={cn(
                                            "px-2.5 py-1 rounded-lg border font-bold text-xs flex items-center gap-1.5 shadow-sm",
                                            isCorrect 
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                              : isMedium
                                              ? "bg-amber-50 text-amber-700 border-amber-100"
                                              : "bg-rose-50 text-rose-700 border-rose-100"
                                          )}
                                        >
                                          <span>{wordText}</span>
                                          <span className="text-[10px] opacity-70">({score})</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-[#4EACAF]">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-700">Chưa có session nào được mở rộng</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
                  Vui lòng click chọn một session luyện tập ở danh sách bên trái để xem các file âm thanh ghi âm cụ thể của bé và thực hiện đánh giá phát âm AI.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
