import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Eye,
  Clock,
  ThumbsUp,
  TrendingUp,
  Volume2,
  Play,
  Pause,
  Info,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserSquare2,
  Sparkles,
  ShieldAlert,
  User,
  MessageCircle,
  VolumeX,
  FileAudio,
  CheckCircle,
  Check,
  FileText,
  Edit3,
  Filter,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';
import CustomSelect from '../../components/common/CustomSelect';
import { useLearningResultApi } from '../../hooks/useLearningResultApi';
import { getSessionUser } from '../../lib/authSession';
import { getLessons } from '../../services/lessonService';
import { getSpeechAccuracyBySession, createSpeechAccuracy } from '../../services/childSpeechAccuracyService';
import type { ChildProfileResponse } from '../../services/childProfileService';
import type { ResultResponse } from '../../services/resultService';
import type { LessonResponse } from '../../services/lessonService';

// DB Interfaces
interface Child {
  ChildId: string;
  FullName: string;
  Age: number;
  LearningLevel: string;
}

interface LearningResult {
  ResultId: string;
  ChildId: string;
  LessonId: string | null;
  AttemptNumber: number;
  CompletionStatus: 'Completed' | 'InProgress' | 'Failed' | 'NeedReview';
  Score: number;
  StartedAt: string;
  CompletedAt: string;
  DurationSeconds: number;
  AudioRecordUrl: string;
  ReplayDataUrl: string;
  InteractionLog: string;
  FeedbackText: string;
  CreatedAt: string;
  SessionId: string;
  ErrorCount?: number;
  CorrectCount?: number;
}

type RoleView = 'ADMIN' | 'TEACHER' | 'PARENT';

const API_PAGE_SIZE = 100;

interface DashboardCache {
  roleView: RoleView;
  children: Child[];
  lessons: LessonResponse[];
  results: LearningResult[];
  timestamp: number;
}
let memoryDashboardCache: DashboardCache | null = null;

interface SessionDetailCache {
  chunks: any[];
  assessments: Record<number, any>;
  timestamp: number;
}
const sessionDetailCache = new Map<string, SessionDetailCache>();
const audioBlobCache = new Map<string, string>();

function getStoredRoleView(): RoleView {
  const role = localStorage.getItem('user_role');
  if (role === 'TEACHER') return 'TEACHER';
  if (role === 'PARENT') return 'PARENT';
  return 'ADMIN';
}

function formatDateDMY(value: string | null | undefined): string {
  if (!value) return '';
  const dateTimeMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s|T)(\d{2}):(\d{2}):(\d{2})/);
  if (dateTimeMatch) {
    const [_, y, m, d, hr, min, sec] = dateTimeMatch;
    return `${d}/${m}/${y} ${hr}:${min}:${sec}`;
  }
  const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const [_, y, m, d] = dateMatch;
    return `${d}/${m}/${y}`;
  }
  return value;
}

// Trả về khóa ngày theo GIỜ ĐỊA PHƯƠNG (yyyy-MM-dd), KHÔNG dùng toISOString()
// vì toISOString() quy đổi sang UTC, lệch múi giờ VN (+7) khiến một phiên luyện lúc
// 0h-7h sáng bị "rơi" nhầm sang ngày hôm trước trên biểu đồ -> đây là nguyên nhân
// chính khiến số liệu theo ngày trước đây bị sai.
function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDDMM(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const mapChildRecord = (c: any): Child => ({
  ChildId: String(c.id),
  FullName: c.fullName,
  Age: c.age,
  LearningLevel: c.learningLevel || 'Chưa phân cấp',
});

export interface ParsedEvent {
  timeSeconds: number;
  text: string;
  spokenText?: string;
  isCorrect?: boolean;
}

export function cleanSpeechText(raw?: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();

  // Strip prefix "từ đúng:" or "từ đúng" if present
  cleaned = cleaned.replace(/^(?:từ\s+đúng\s*[:']?\s*)/i, '').trim();

  // Strip surrounding quotes '...' or "..."
  cleaned = cleaned.replace(/^['"]\s*|\s*['"]$/g, '').trim();

  // Strip bonus/penalty in parentheses, e.g. "(+ 20 điểm)", "(-10 điểm)", "(+20)"
  cleaned = cleaned.replace(/\s*\([+\-]?\s*\d+\s*(?:điểm(?:\s*thưởng)?|diem|pts?|points?|đ)?(?:\s*thưởng)?!*?\)/gi, '').trim();

  // Strip trailing score/points with explicit + or - sign, e.g. "+ 20 điểm", "+20 điểm thưởng!", "- 10 điểm", "-5 điểm", "+ 20"
  cleaned = cleaned.replace(/\s*[+\-]\s*\d+\s*(?:điểm(?:\s*thưởng)?|diem|pts?|points?|đ|thưởng)?!*$/gi, '').trim();

  // Strip attached score suffix without leading space (e.g. "]-5 điểm", "kẹo'-10 điểm")
  cleaned = cleaned.replace(/[+\-]\s*\d+\s*(?:điểm(?:\s*thưởng)?|diem|pts?|points?|đ|thưởng)?!*$/gi, '').trim();

  // Strip trailing score suffix without sign if accompanied by điểm / diem / points (e.g. "túi khoai tây chiên 20 điểm")
  cleaned = cleaned.replace(/\s+\d+\s*(?:điểm(?:\s*thưởng)?|diem|pts?|points?|đ)(?:\s*thưởng)?!*$/gi, '').trim();

  // Strip any leftover quotes
  cleaned = cleaned.replace(/^['"]\s*|\s*['"]$/g, '').trim();

  return cleaned;
}

export function parseInteractionLog(log: string): ParsedEvent[] {
  if (!log) return [];
  const segments = log.split(/[|\n]+/);
  const events: ParsedEvent[] = [];

  for (const segment of segments) {
    // 1. Wrong answer with child speech: [12s] Wrong Answer: từ đúng 'cần câu', trẻ nói: 'cần' -10 điểm
    // or [38s] Wrong Answer: từ đúng 'gói xúc xích', trẻ nói: '[Không nghe rõ/ Im lặng]'
    const wrongWithSpoken = segment.match(
      /\[(\d+)s?\]\s*Wrong\s+Answer:\s*(?:từ\s+đúng\s*)?['"]?([^,'"\n]+?)['"]?,?\s*trẻ\s+nói:\s*(?:['"](.*?)['"]|([^'"\n\-]+?))(?:\s*-\s*\d+\s*điểm)?.*$/i
    );
    if (wrongWithSpoken) {
      events.push({
        timeSeconds: parseInt(wrongWithSpoken[1], 10),
        text: cleanSpeechText(wrongWithSpoken[2]),
        spokenText: cleanSpeechText(wrongWithSpoken[3] || wrongWithSpoken[4]),
        isCorrect: false,
      });
      continue;
    }

    // 2. Wrong answer without child speech: [12s] Wrong Answer: từ đúng 'con cá'
    const wrongOnly = segment.match(/\[(\d+)s?\]\s*Wrong\s+Answer:\s*(?:từ\s+đúng\s*)?['"]?([^,'"\n\-]+?)['"]?(?:\s*-\s*\d+\s*điểm)?.*$/i);
    if (wrongOnly) {
      events.push({
        timeSeconds: parseInt(wrongOnly[1], 10),
        text: cleanSpeechText(wrongOnly[2]),
        spokenText: 'chưa đủ từ',
        isCorrect: false,
      });
      continue;
    }

    // 3. Correct answer: [25s] Correct Answer: cần câu (+ 20 điểm)
    const correctMatch = segment.match(/\[(\d+)s?\]\s*Correct\s+Answer:\s*(.+)/i);
    if (correctMatch) {
      const cleaned = cleanSpeechText(correctMatch[2]);
      events.push({
        timeSeconds: parseInt(correctMatch[1], 10),
        text: cleaned,
        spokenText: cleaned,
        isCorrect: true,
      });
      continue;
    }
  }
  return events;
}

export function getResultCounts(res: { CorrectCount?: number; ErrorCount?: number; InteractionLog?: string }) {
  let correct = res.CorrectCount ?? 0;
  let wrong = res.ErrorCount ?? 0;
  if (correct === 0 && wrong === 0 && res.InteractionLog) {
    const events = parseInteractionLog(res.InteractionLog);
    correct = events.filter(e => e.isCorrect === true).length;
    wrong = events.filter(e => e.isCorrect === false).length;
  }
  return { correct, wrong };
}

const mapResultRecord = (r: ResultResponse): LearningResult => {
  let parsedCorrect = 0;
  let parsedWrong = 0;
  if (r.interactionLog) {
    const events = parseInteractionLog(r.interactionLog);
    parsedCorrect = events.filter(e => e.isCorrect === true).length;
    parsedWrong = events.filter(e => e.isCorrect === false).length;
  }
  const correctCount = Math.max(r.correctCount ?? 0, parsedCorrect);
  const errorCount = Math.max(r.errorCount ?? 0, parsedWrong);

  return {
    ResultId: String(r.id),
    ChildId: String(r.childId),
    SessionId: r.sessionId || '',
    LessonId: r.lessonId ? String(r.lessonId) : null,
    AttemptNumber: r.attemptNumber || 1,
    CompletionStatus: (r.completionStatus as LearningResult['CompletionStatus']) || 'InProgress',
    Score: r.score || 0,
    StartedAt: r.startedAt || '',
    CompletedAt: r.completedAt || '',
    DurationSeconds: r.durationSeconds || 0,
    AudioRecordUrl: r.audioRecordUrl || '',
    ReplayDataUrl: r.replayDataUrl || '',
    InteractionLog: r.interactionLog || '',
    FeedbackText: r.feedbackText || '',
    CreatedAt: r.completedAt || r.startedAt || '',
    ErrorCount: errorCount,
    CorrectCount: correctCount,
  };
};

async function loadAllPages<T>(
  apiMethod: (page: number, size: number) => Promise<any>
): Promise<T[]> {
  let page = 1;
  let allItems: T[] = [];
  let hasMore = true;

  while (hasMore) {
    const res = await apiMethod(page, API_PAGE_SIZE);
    if (res.success && res.data) {
      const items = res.data.items || [];
      allItems = [...allItems, ...items];
      hasMore = items.length === API_PAGE_SIZE && page < 10;
      page++;
    } else {
      hasMore = false;
    }
  }
  return allItems;
}


export function isSilentOrUnclearSpeech(spokenText?: string): boolean {
  if (!spokenText) return false;
  const text = spokenText.toLowerCase().trim();
  return (
    text === '?' ||
    text === '[?]' ||
    text === '??' ||
    text === '???' ||
    text.includes('không nghe rõ') ||
    text.includes('im lặng') ||
    text.includes('khong nghe ro') ||
    text.includes('im lang') ||
    text.includes('chưa đủ từ') ||
    text.includes('chua du tu') ||
    text.includes('không rõ') ||
    text.includes('khong ro') ||
    text.includes('unclear') ||
    text.includes('silent') ||
    text.includes('no speech')
  );
}

const SPEECH_ERROR_CATEGORIES = [
  { value: 'Thay thế âm', label: 'Thay thế âm' },
  { value: 'Nuốt âm/Bỏ sót âm', label: 'Nuốt âm/Bỏ sót âm' },
  { value: 'Méo tiếng/Chưa tròn vành rõ chữ', label: 'Méo tiếng/Chưa tròn vành rõ chữ' },
  { value: 'Lệch thanh điệu (Hỏi/Ngã)', label: 'Lệch thanh điệu (Hỏi/Ngã)' },
];

interface SpeechErrorCategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placement?: 'bottom' | 'top' | 'auto';
}

function SpeechErrorCategoryDropdown({
  value,
  onChange,
  disabled = false,
  className,
  placement = 'auto'
}: SpeechErrorCategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPlacement, setDropdownPlacement] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedItem = useMemo(() => {
    if (!value) return SPEECH_ERROR_CATEGORIES[0];
    const trimmed = value.trim().toLowerCase();
    return (
      SPEECH_ERROR_CATEGORIES.find(
        cat => cat.value.toLowerCase() === trimmed || cat.label.toLowerCase() === trimmed
      ) || { value, label: value }
    );
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    if (placement === 'auto' && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 200 && rect.top > 200) {
        setDropdownPlacement('top');
      } else {
        setDropdownPlacement('bottom');
      }
    } else {
      setDropdownPlacement(placement === 'top' ? 'top' : 'bottom');
    }
  }, [isOpen, placement]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-medium rounded-xl border outline-none transition-all text-left",
          disabled
            ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed shadow-none"
            : isOpen
              ? "bg-white text-slate-800 border-amber-400 ring-2 ring-amber-400/20 shadow-xs cursor-pointer"
              : "bg-white text-slate-700 border-slate-200 hover:border-amber-300 focus:border-amber-400 shadow-2xs cursor-pointer"
        )}
      >
        <span className="truncate">{selectedItem.label}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-amber-500"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropdownPlacement === 'top' ? -4 : 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropdownPlacement === 'top' ? -4 : 4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute z-50 w-full min-w-[220px] bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 space-y-0.5",
              dropdownPlacement === 'top' ? "bottom-full mb-1.5" : "top-full mt-1.5"
            )}
          >
            {SPEECH_ERROR_CATEGORIES.map((cat) => {
              const isSelected = selectedItem.value.toLowerCase() === cat.value.toLowerCase();
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    onChange(cat.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer",
                    isSelected
                      ? "bg-amber-50 text-amber-900 font-semibold border border-amber-200/70"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isSelected ? "bg-amber-500" : "bg-slate-300"
                    )} />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LearningResultManagement() {
  const {
    getChildProfiles,
    getMyChildProfiles,
    getMyStudents,
    getCurrentUserWithChildrenProfiles,
    getResultsByChild,
    updateResultFeedback,
    getChunksBySession,
    assessChunk,
    downloadAudioChunk,
    getClassrooms,
    getEnrollments
  } = useLearningResultApi();

  const currentRoleView = getStoredRoleView();
  const hasFreshCache = Boolean(
    memoryDashboardCache && memoryDashboardCache.roleView === currentRoleView
  );

  const [results, setResults] = useState<LearningResult[]>(() =>
    hasFreshCache && memoryDashboardCache ? memoryDashboardCache.results : []
  );
  const [children, setChildren] = useState<Child[]>(() =>
    hasFreshCache && memoryDashboardCache ? memoryDashboardCache.children : []
  );
  const [lessons, setLessons] = useState<LessonResponse[]>(() =>
    hasFreshCache && memoryDashboardCache ? memoryDashboardCache.lessons : []
  );
  const [isApiLoading, setIsApiLoading] = useState<boolean>(() => !hasFreshCache);
  const [apiError, setApiError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<string>('ALL');
  const [filterChildId, setFilterChildId] = useState<string>('ALL');

  // Bộ tìm kiếm khoảng ngày thông minh riêng cho biểu đồ "Xu hướng kết quả luyện tập"
  // (độc lập với filterDateRange của danh sách bên trái, để không đổi ý nghĩa các số liệu khác)
  type DateRangePreset = '7D' | '30D' | 'THIS_MONTH' | 'LAST_MONTH' | 'ALL' | 'CUSTOM';
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('30D');
  const [customStartDate, setCustomStartDate] = useState<string>(''); // yyyy-MM-dd (input type=date)
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isDateSearchOpen, setIsDateSearchOpen] = useState(false);
  const dateSearchRef = useRef<HTMLDivElement | null>(null);

  // Trạng thái thu gọn / mở rộng biểu đồ xu hướng (lưu vào localStorage)
  const [isChartCollapsed, setIsChartCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('godotxr_result_chart_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleChartCollapsed = () => {
    setIsChartCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('godotxr_result_chart_collapsed', String(next));
      } catch { }
      return next;
    });
  };

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateSearchRef.current && !dateSearchRef.current.contains(e.target as Node)) {
        setIsDateSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quy đổi lựa chọn hiện tại (preset hoặc tùy chỉnh) thành khoảng ngày thực tế theo GIỜ ĐỊA PHƯƠNG
  const resolvedDateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateRangePreset === '7D') {
      const end = new Date(today);
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { start, end, isAll: false, label: `7 ngày qua · ${formatDDMM(start)} - ${formatDDMM(end)}` };
    }

    if (dateRangePreset === '30D') {
      const end = new Date(today);
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { start, end, isAll: false, label: `30 ngày qua · ${formatDDMM(start)} - ${formatDDMM(end)}` };
    }

    if (dateRangePreset === 'THIS_MONTH') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today);
      return { start, end, isAll: false, label: `Tháng này · ${formatDDMM(start)} - ${formatDDMM(end)}` };
    }

    if (dateRangePreset === 'LAST_MONTH') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start, end, isAll: false, label: `Tháng trước · ${formatDDMM(start)} - ${formatDDMM(end)}` };
    }

    if (dateRangePreset === 'CUSTOM') {
      if (customStartDate && customEndDate) {
        const start = new Date(`${customStartDate}T00:00:00`);
        const end = new Date(`${customEndDate}T00:00:00`);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start.getTime() <= end.getTime()) {
          return { start, end, isAll: false, label: `Tùy chỉnh · ${formatDDMM(start)} - ${formatDDMM(end)}` };
        }
      }
      // Chưa chọn đủ / chọn sai khoảng tùy chỉnh -> tạm dùng 30 ngày qua để biểu đồ không bị trống
      const end = new Date(today);
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { start, end, isAll: false, label: `30 ngày qua · ${formatDDMM(start)} - ${formatDDMM(end)}` };
    }

    // 'ALL'
    return { start: null as Date | null, end: null as Date | null, isAll: true, label: 'Toàn bộ thời gian' };
  }, [dateRangePreset, customStartDate, customEndDate]);

  const DATE_RANGE_PRESET_OPTIONS: { value: DateRangePreset; label: string }[] = [
    { value: '7D', label: '7 ngày qua' },
    { value: '30D', label: '30 ngày qua' },
    { value: 'THIS_MONTH', label: 'Tháng này' },
    { value: 'LAST_MONTH', label: 'Tháng trước' },
    { value: 'ALL', label: 'Toàn bộ thời gian' },
    { value: 'CUSTOM', label: 'Tùy chỉnh khoảng ngày...' },
  ];

  const canEditFeedback = currentRoleView === 'ADMIN' || currentRoleView === 'TEACHER';

  // Left Panel Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Detail Right Panel States
  const [selectedResult, setSelectedResult] = useState<LearningResult | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loadingChunks, setLoadingChunks] = useState<boolean>(false);
  const [playingChunkIndex, setPlayingChunkIndex] = useState<number | null>(null);
  const [loadingAudioIndex, setLoadingAudioIndex] = useState<number | null>(null);
  const [audioBlobUrls, setAudioBlobUrls] = useState<Record<number, string>>({});
  const [assessingChunkIndex, setAssessingChunkIndex] = useState<number | null>(null);
  const [chunkAssessments, setChunkAssessments] = useState<Record<number, any>>({});
  const [referenceTexts, setReferenceTexts] = useState<Record<number, string>>({});

  // Audio Chunk Filter States
  const [chunkStatusFilter, setChunkStatusFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SILENT' | 'ASSESSED'>('ALL');
  const [chunkSearchQuery, setChunkSearchQuery] = useState('');

  const [feedbackInput, setFeedbackInput] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [scoringChunkIndex, setScoringChunkIndex] = useState<number | null>(null);
  const [manualScores, setManualScores] = useState({
    accuracy: 90,
    pronunciation: 90,
    fluency: 90,
    completeness: 100,
    speechErrorCategory: 'Thay thế âm'
  });
  const [isSavingManualScore, setIsSavingManualScore] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionPanelRef = useRef<HTMLDivElement | null>(null);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const leftResultsScrollRef = useRef<HTMLDivElement | null>(null);
  const sessionDetailsScrollRef = useRef<HTMLDivElement | null>(null);
  const wordsScrollRef = useRef<HTMLDivElement | null>(null);
  const wordsSectionRef = useRef<HTMLDivElement | null>(null);
  const chunksScrollRef = useRef<HTMLDivElement | null>(null);
  const chunksSectionRef = useRef<HTMLDivElement | null>(null);
  const interactionLogScrollRef = useRef<HTMLDivElement | null>(null);

  // Smart Sub-Scroll Routing cho khung Session chi tiết
  useEffect(() => {
    const sessionEl = sessionPanelRef.current;
    if (!sessionEl) return;

    const handleSessionWheel = (e: WheelEvent) => {
      // 1. Luôn khóa 100% không cho trang tổng bên ngoài cuộn khi chuột nằm trong phạm vi Session card
      e.preventDefault();
      e.stopPropagation();

      const targetNode = e.target as Node;

      // 2. Nếu chuột nằm trong khung "Thống kê theo từng từ trong phiên" -> Cuộn ngang danh sách từ vựng
      if (
        wordsScrollRef.current &&
        (wordsScrollRef.current.contains(targetNode) ||
          (wordsSectionRef.current && wordsSectionRef.current.contains(targetNode)))
      ) {
        wordsScrollRef.current.scrollLeft += e.deltaY;
        return;
      }

      // 3. Nếu chuột nằm trong khung "Nhật ký tương tác (Interaction Log)" -> Cuộn dọc nhật ký log
      if (
        interactionLogScrollRef.current &&
        interactionLogScrollRef.current.contains(targetNode)
      ) {
        interactionLogScrollRef.current.scrollTop += e.deltaY;
        return;
      }

      // 4. Nếu chuột nằm trong khung "Danh sách các file âm thanh ghi âm" -> Cuộn dọc danh sách audio chunks
      if (
        chunksScrollRef.current &&
        (chunksScrollRef.current.contains(targetNode) ||
          (chunksSectionRef.current && chunksSectionRef.current.contains(targetNode)))
      ) {
        chunksScrollRef.current.scrollTop += e.deltaY;
        return;
      }

      // 5. Mặc định (Header, Quick stats, hoặc các khoảng trắng khác trong Session) -> Cuộn toàn bộ khung Session chi tiết chính
      if (sessionDetailsScrollRef.current) {
        sessionDetailsScrollRef.current.scrollTop += e.deltaY;
      }
    };

    sessionEl.addEventListener('wheel', handleSessionWheel, { passive: false });

    return () => {
      sessionEl.removeEventListener('wheel', handleSessionWheel);
    };
  }, [selectedResult]);

  // Khóa cuộn trang ngoài 100% và điều hướng cuộn cho nội dung Lịch sử khi chuột ở trong phạm vi Lịch sử
  useEffect(() => {
    const leftEl = leftPanelRef.current;
    if (!leftEl) return;

    const handleLeftWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const scrollTarget = leftResultsScrollRef.current;
      if (scrollTarget) {
        scrollTarget.scrollTop += e.deltaY;
      }
    };

    leftEl.addEventListener('wheel', handleLeftWheel, { passive: false });

    return () => {
      leftEl.removeEventListener('wheel', handleLeftWheel);
    };
  }, []);



  const handleScrollWords = (direction: 'left' | 'right') => {
    if (!wordsScrollRef.current) return;
    const scrollAmount = wordsScrollRef.current.clientWidth * 0.9;
    wordsScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const parsedEvents = useMemo(() => {
    return selectedResult ? parseInteractionLog(selectedResult.InteractionLog) : [];
  }, [selectedResult]);

  const chunkStats = useMemo(() => {
    let correctCount = 0;
    let wrongCount = 0;
    let silentCount = 0;
    let assessedCount = 0;

    chunks.forEach((chunk) => {
      const cIndex = chunk.chunkIndex;
      const event = parsedEvents[cIndex];
      const assessment = chunkAssessments[cIndex];
      const recognized = assessment?.recognizedText || assessment?.RecognizedText || assessment?.display || assessment?.Display;
      const isSilent = isSilentOrUnclearSpeech(event?.spokenText) || isSilentOrUnclearSpeech(recognized);
      const isAssessed = Boolean(chunkAssessments[cIndex]);

      if (isSilent) {
        silentCount++;
      } else if (event?.isCorrect === true) {
        correctCount++;
      } else if (event?.isCorrect === false) {
        wrongCount++;
      }

      if (isAssessed) {
        assessedCount++;
      }
    });

    return {
      total: chunks.length,
      correctCount,
      wrongCount,
      silentCount,
      assessedCount,
    };
  }, [chunks, parsedEvents, chunkAssessments]);

  const filteredChunks = useMemo(() => {
    return chunks.filter((chunk) => {
      const cIndex = chunk.chunkIndex;
      const event = parsedEvents[cIndex];
      const assessment = chunkAssessments[cIndex];
      const recognized = assessment?.recognizedText || assessment?.RecognizedText || assessment?.display || assessment?.Display || '';
      const isSilent = isSilentOrUnclearSpeech(event?.spokenText) || isSilentOrUnclearSpeech(recognized);
      const isAssessed = Boolean(chunkAssessments[cIndex]);
      const refText = referenceTexts[cIndex] || event?.text || '';
      const spoken = event?.spokenText || '';

      // Status filter
      if (chunkStatusFilter === 'CORRECT' && (event?.isCorrect !== true || isSilent)) return false;
      if (chunkStatusFilter === 'WRONG' && (event?.isCorrect !== false || isSilent)) return false;
      if (chunkStatusFilter === 'SILENT' && !isSilent) return false;
      if (chunkStatusFilter === 'ASSESSED' && !isAssessed) return false;

      // Keyword search
      if (chunkSearchQuery.trim()) {
        const q = chunkSearchQuery.trim().toLowerCase();
        const matchesRef = refText.toLowerCase().includes(q);
        const matchesSpoken = spoken.toLowerCase().includes(q);
        const matchesRecognized = recognized.toLowerCase().includes(q);
        const matchesIndex = `đoạn ${cIndex + 1}`.includes(q) || `[${event?.timeSeconds}s]`.includes(q) || `${event?.timeSeconds}s`.includes(q);
        if (!matchesRef && !matchesSpoken && !matchesRecognized && !matchesIndex) {
          return false;
        }
      }

      return true;
    });
  }, [chunks, chunkStatusFilter, chunkSearchQuery, parsedEvents, referenceTexts, chunkAssessments]);

  // Toast feedback triggers
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterDateRange, filterChildId]);

  // Load results list with in-memory SWR cache & optimized parallel queries
  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      // If we don't have fresh cache for this role view, show loading skeleton/spinner
      if (!memoryDashboardCache || memoryDashboardCache.roleView !== currentRoleView) {
        setIsApiLoading(true);
      }
      setApiError(null);

      try {
        const roleView = getStoredRoleView();
        const sessionUser = getSessionUser();

        let childRecords: any[] = [];
        let lessonRecords: LessonResponse[] = [];

        if (roleView === 'PARENT') {
          const [parentResult, lessonsRes] = await Promise.all([
            getMyChildProfiles().catch(() => ({ success: false, data: [] as ChildProfileResponse[] })),
            getLessons(1, 100).catch(() => ({ success: false, data: { items: [] as LessonResponse[] } }))
          ]);
          if (parentResult.success && Array.isArray(parentResult.data) && parentResult.data.length > 0) {
            childRecords = parentResult.data;
          } else {
            const fallbackUser = await getCurrentUserWithChildrenProfiles().catch(() => ({ success: false, data: null }));
            if (fallbackUser.success && fallbackUser.data?.childProfiles) {
              childRecords = fallbackUser.data.childProfiles;
            }
          }
          lessonRecords = (lessonsRes.success && lessonsRes.data?.items) ? lessonsRes.data.items : [];
        } else if (roleView === 'TEACHER') {
          // Direct endpoint for teacher's students in 1 single fast query
          const [myStudentsRes, lessonsRes] = await Promise.all([
            getMyStudents(1, 100).catch(() => ({ success: false, data: { items: [] } })),
            getLessons(1, 100).catch(() => ({ success: false, data: { items: [] as LessonResponse[] } }))
          ]);

          lessonRecords = (lessonsRes.success && lessonsRes.data?.items) ? lessonsRes.data.items : [];

          if (myStudentsRes.success && myStudentsRes.data?.items && myStudentsRes.data.items.length > 0) {
            childRecords = myStudentsRes.data.items;
          } else {
            // Fallback only if my-students returns empty
            const [allClassrooms, allEnrollments, allChildren] = await Promise.all([
              getClassrooms(1, 100).catch(() => ({ success: false, data: { items: [] } })),
              getEnrollments(1, 100).catch(() => ({ success: false, data: { items: [] } })),
              getChildProfiles(1, 100).catch(() => ({ success: false, data: { items: [] } }))
            ]);

            const classrooms = allClassrooms.data?.items || [];
            const enrollments = allEnrollments.data?.items || [];
            const allKids = allChildren.data?.items || [];

            const teacherId = Number(sessionUser?.UserId.replace(/\D/g, '')) || undefined;
            const teacherName = sessionUser?.FullName.trim().toLowerCase() ?? '';

            const teacherClassIds = new Set(
              classrooms
                .filter((classroom: any) => {
                  const matchedById = teacherId ? classroom.userId === teacherId : false;
                  const matchedByName = teacherName ? classroom.teacherName?.trim().toLowerCase() === teacherName : false;
                  return matchedById || matchedByName;
                })
                .map((classroom: any) => classroom.id)
            );

            const teacherEnrollments = enrollments.filter((enrollment: any) =>
              teacherClassIds.has(enrollment.classId)
            );

            const childIds = Array.from(
              new Set(teacherEnrollments.map((enrollment: any) => enrollment.childId))
            );

            childRecords = allKids.filter((child: any) => childIds.includes(child.id));
          }
        } else {
          // ADMIN view: load all children and lessons
          const [allChildrenRes, lessonsRes] = await Promise.all([
            getChildProfiles(1, 100).catch(() => ({ success: false, data: { items: [] } })),
            getLessons(1, 100).catch(() => ({ success: false, data: { items: [] as LessonResponse[] } }))
          ]);
          childRecords = allChildrenRes.data?.items || [];
          lessonRecords = lessonsRes.data?.items || [];
        }

        if (cancelled) return;

        const mappedChildren = childRecords.map(mapChildRecord);
        setChildren(mappedChildren);
        setLessons(lessonRecords);

        // Fetch results for all children concurrently
        const resultSettled = await Promise.allSettled(
          childRecords.map((child) => getResultsByChild(child.id))
        );

        const rawResults = resultSettled.flatMap((settled) => {
          if (settled.status !== 'fulfilled') return [];
          if (!settled.value.success || !settled.value.data) return [];
          return settled.value.data;
        });

        const uniqueResults = Array.from(
          new Map(rawResults.map((result) => [result.id, result])).values()
        ).sort((left, right) => {
          const rightTime = right.completedAt ?? right.startedAt ?? '';
          const leftTime = left.completedAt ?? left.startedAt ?? '';
          return rightTime.localeCompare(leftTime);
        });

        if (cancelled) return;

        const mappedResults = uniqueResults.map(mapResultRecord);
        setResults(mappedResults);

        // Save to in-memory SWR cache for instant load next time
        memoryDashboardCache = {
          roleView: roleView,
          children: mappedChildren,
          lessons: lessonRecords,
          results: mappedResults,
          timestamp: Date.now(),
        };
      } catch (error) {
        if (cancelled) return;
        setApiError(error instanceof Error ? error.message : 'Không thể tải dữ liệu kết quả từ API.');
      } finally {
        if (!cancelled) {
          setIsApiLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [getChildProfiles, getMyChildProfiles, getMyStudents, getCurrentUserWithChildrenProfiles, getResultsByChild, getClassrooms, getEnrollments, currentRoleView]);

  // Statistics computations
  const filteredResultsForStats = useMemo(() => {
    return results.filter((res) => {
      if (filterChildId !== 'ALL' && res.ChildId !== filterChildId) return false;
      return true;
    });
  }, [results, filterChildId]);

  const totalAttempts = filteredResultsForStats.length;
  const totalMinutes = filteredResultsForStats.reduce((sum, res) => sum + res.DurationSeconds, 0) / 60;
  const formattedTotalMinutes = totalMinutes > 0 ? Math.round(totalMinutes * 10) / 10 : 0;

  const completionRate = useMemo(() => {
    if (totalAttempts === 0) return 0;
    const completedCount = filteredResultsForStats.filter((r) => r.CompletionStatus === 'Completed').length;
    return Math.round((completedCount / totalAttempts) * 100);
  }, [filteredResultsForStats, totalAttempts]);

  // Overall Word totals (Correct / Wrong) across all sessions in current filter (all students or selected student)
  const overallWordTotals = useMemo(() => {
    let correct = 0;
    let wrong = 0;

    filteredResultsForStats.forEach((res) => {
      const cCount = res.CorrectCount ?? 0;
      const eCount = res.ErrorCount ?? 0;
      if (cCount > 0 || eCount > 0) {
        correct += cCount;
        wrong += eCount;
      } else if (res.InteractionLog) {
        const events = parseInteractionLog(res.InteractionLog);
        correct += events.filter(e => e.isCorrect === true).length;
        wrong += events.filter(e => e.isCorrect === false).length;
      }
    });

    const total = correct + wrong;
    const accuracyRate = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, wrong, total, accuracyRate };
  }, [filteredResultsForStats]);

  // Biểu đồ xu hướng kết quả luyện tập: gộp các lượt luyện theo ngày (theo GIỜ ĐỊA PHƯƠNG).
  // - Khi chọn "Toàn bộ thời gian": chỉ hiện các ngày thực sự có dữ liệu.
  // - Khi chọn một khoảng ngày cụ thể (7 ngày qua / 30 ngày qua / tháng này / tháng trước /
  //   tùy chỉnh): luôn render ĐỦ số cột theo đúng lịch trong khoảng đó (ngày không luyện vẫn
  //   có cột giá trị 0), lấy từ bộ tìm kiếm khoảng ngày thông minh phía trên biểu đồ.
  const practiceChartData = useMemo(() => {
    type DayEntry = {
      dateKey: string;
      label: string;
      attempts: number;
      scoreSum: number;
      correct: number;
      wrong: number;
    };

    const byDate = new Map<string, DayEntry>();

    filteredResultsForStats.forEach((res) => {
      const raw = res.CompletedAt || res.StartedAt;
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;

      const dateKey = toLocalDateKey(d);
      const label = formatDDMM(d);
      const counts = getResultCounts(res);

      const entry = byDate.get(dateKey) || { dateKey, label, attempts: 0, scoreSum: 0, correct: 0, wrong: 0 };
      entry.attempts += 1;
      entry.scoreSum += res.Score || 0;
      entry.correct += counts.correct;
      entry.wrong += counts.wrong;
      byDate.set(dateKey, entry);
    });

    const toChartPoint = (entry: DayEntry) => {
      const totalWords = entry.correct + entry.wrong;
      return {
        dateKey: entry.dateKey,
        label: entry.label,
        attempts: entry.attempts,
        avgScore: entry.attempts > 0 ? Math.round(entry.scoreSum / entry.attempts) : 0,
        accuracyRate: totalWords > 0 ? Math.round((entry.correct / totalWords) * 100) : 0,
      };
    };

    // "Toàn bộ": không phân kỳ, chỉ hiện các ngày có dữ liệu, sắp xếp theo thời gian
    if (resolvedDateRange.isAll || !resolvedDateRange.start || !resolvedDateRange.end) {
      return Array.from(byDate.values())
        .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
        .map(toChartPoint);
    }

    // Khoảng ngày cụ thể: luôn tạo đủ các ngày liên tiếp theo lịch thật trong khoảng đã chọn
    const days: DayEntry[] = [];
    const cursor = new Date(resolvedDateRange.start);
    while (cursor.getTime() <= resolvedDateRange.end.getTime()) {
      const dateKey = toLocalDateKey(cursor);
      const label = formatDDMM(cursor);
      days.push(byDate.get(dateKey) || { dateKey, label, attempts: 0, scoreSum: 0, correct: 0, wrong: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return days.map(toChartPoint);
  }, [filteredResultsForStats, resolvedDateRange]);

  // Bề rộng khả dụng của chart: khi có nhiều ngày (khoảng dài / "Toàn bộ"), thay vì nén hết
  // cột lại cho vừa khung, cho phép cuộn ngang để từng cột vẫn đủ rộng, dễ đọc và bấm vào xem.
  const practiceChartMinWidth = Math.max(practiceChartData.length * 56, 480);


  // Session-level stats for the currently selected session
  const sessionWordStats = useMemo(() => {
    if (!selectedResult || parsedEvents.length === 0) return [];
    const map = new Map<string, {
      word: string;
      correctCount: number;
      wrongCount: number;
      totalCount: number;
      accuracyRate: number;
      attempts: Array<{
        timeSeconds: number;
        spokenText?: string;
        isCorrect?: boolean;
      }>;
    }>();

    parsedEvents.forEach((ev) => {
      const w = cleanSpeechText(ev.text);
      if (!w) return;
      const key = w.toLowerCase().trim();

      const existing = map.get(key) || {
        word: w,
        correctCount: 0,
        wrongCount: 0,
        totalCount: 0,
        accuracyRate: 0,
        attempts: [],
      };

      if (ev.isCorrect === true) {
        existing.correctCount++;
      } else if (ev.isCorrect === false) {
        existing.wrongCount++;
      }

      existing.attempts.push({
        timeSeconds: ev.timeSeconds,
        spokenText: ev.spokenText,
        isCorrect: ev.isCorrect,
      });

      existing.totalCount = existing.correctCount + existing.wrongCount;
      existing.accuracyRate = existing.totalCount > 0
        ? Math.round((existing.correctCount / existing.totalCount) * 100)
        : 0;

      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.totalCount - a.totalCount);
  }, [selectedResult, parsedEvents]);

  const sessionCorrectWords = useMemo(() => {
    const parsedCorrect = parsedEvents.filter(e => e.isCorrect === true).length;
    return Math.max(selectedResult?.CorrectCount ?? 0, parsedCorrect);
  }, [selectedResult, parsedEvents]);

  const sessionWrongWords = useMemo(() => {
    const parsedWrong = parsedEvents.filter(e => e.isCorrect === false).length;
    return Math.max(selectedResult?.ErrorCount ?? 0, parsedWrong);
  }, [selectedResult, parsedEvents]);

  const sessionTotalWords = sessionCorrectWords + sessionWrongWords;
  const sessionAccuracy = sessionTotalWords > 0
    ? Math.round((sessionCorrectWords / sessionTotalWords) * 100)
    : 0;

  // Silky-smooth horizontal mouse wheel scrolling with momentum
  useEffect(() => {
    const sectionEl = wordsSectionRef.current;
    const scrollEl = wordsScrollRef.current;
    if (!sectionEl || !scrollEl) return;

    let targetScrollLeft = scrollEl.scrollLeft;
    let rafId: number | null = null;

    const onScroll = () => {
      // Keep target in sync if user drags the scrollbar
      if (!rafId) {
        targetScrollLeft = scrollEl.scrollLeft;
      }
    };

    const step = () => {
      const current = scrollEl.scrollLeft;
      const diff = targetScrollLeft - current;

      if (Math.abs(diff) > 0.5) {
        scrollEl.scrollLeft = current + diff * 0.22;
        rafId = requestAnimationFrame(step);
      } else {
        scrollEl.scrollLeft = targetScrollLeft;
        rafId = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (scrollEl.scrollWidth > scrollEl.clientWidth) {
        e.preventDefault();

        // Convert lines/pages to pixels if mouse wheel uses DOM_DELTA_LINE
        let delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (e.deltaMode === 1) {
          delta *= 28;
        } else if (e.deltaMode === 2) {
          delta *= scrollEl.clientWidth;
        }

        const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
        targetScrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft + delta));

        if (!rafId) {
          rafId = requestAnimationFrame(step);
        }
      }
    };

    sectionEl.addEventListener('wheel', handleWheel, { passive: false });
    scrollEl.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      sectionEl.removeEventListener('wheel', handleWheel);
      scrollEl.removeEventListener('scroll', onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }, [selectedResult, sessionWordStats]);

  // Silky-smooth vertical mouse wheel scrolling inside audio chunks section
  useEffect(() => {
    const sectionEl = chunksSectionRef.current;
    const scrollEl = chunksScrollRef.current;
    if (!sectionEl || !scrollEl) return;

    let targetScrollTop = scrollEl.scrollTop;
    let rafId: number | null = null;

    const onScroll = () => {
      if (!rafId) {
        targetScrollTop = scrollEl.scrollTop;
      }
    };

    const step = () => {
      const current = scrollEl.scrollTop;
      const diff = targetScrollTop - current;

      if (Math.abs(diff) > 0.5) {
        scrollEl.scrollTop = current + diff * 0.22;
        rafId = requestAnimationFrame(step);
      } else {
        scrollEl.scrollTop = targetScrollTop;
        rafId = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (scrollEl.scrollHeight > scrollEl.clientHeight) {
        e.preventDefault();
        e.stopPropagation();

        let delta = e.deltaY;
        if (e.deltaMode === 1) {
          delta *= 28;
        } else if (e.deltaMode === 2) {
          delta *= scrollEl.clientHeight;
        }

        const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
        targetScrollTop = Math.max(0, Math.min(maxScroll, targetScrollTop + delta));

        if (!rafId) {
          rafId = requestAnimationFrame(step);
        }
      }
    };

    sectionEl.addEventListener('wheel', handleWheel, { passive: false });
    scrollEl.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      sectionEl.removeEventListener('wheel', handleWheel);
      scrollEl.removeEventListener('scroll', onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }, [selectedResult, filteredChunks]);

  // Expanded Right Panel selection handler - Optimized with instant metadata load & session cache
  const handleSelectResult = async (res: LearningResult) => {
    if (selectedResult?.ResultId === res.ResultId) {
      return;
    }

    // Stop currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingChunkIndex(null);
    }

    setSelectedResult(res);
    setFeedbackInput(res.FeedbackText || '');
    setShowFeedbackInput(false);
    setChunkSearchQuery('');
    setChunkStatusFilter('ALL');

    // Parse InteractionLog to pre-populate expected reference text for each chunk
    const logEvents = parseInteractionLog(res.InteractionLog);
    const initialRefTexts: Record<number, string> = {};
    logEvents.forEach((ev, idx) => {
      initialRefTexts[idx] = ev.text;
    });
    setReferenceTexts(initialRefTexts);

    // 0ms INSTANT DISPLAY FROM SESSION CACHE
    if (sessionDetailCache.has(res.SessionId)) {
      const cached = sessionDetailCache.get(res.SessionId)!;
      setChunks(cached.chunks);
      setChunkAssessments(cached.assessments);
      setLoadingChunks(false);
      return;
    }

    setChunks([]);
    setChunkAssessments({});
    setLoadingChunks(true);

    try {
      const child = children.find(c => c.ChildId === res.ChildId);
      const childIdVal = child ? Number(child.ChildId) : Number(res.ChildId);

      // Fetch chunk metadata and pre-stored speech accuracy IN PARALLEL (instant JSON, no heavy WAV downloads upfront)
      const [chunkRes, accuracyRes] = await Promise.all([
        getChunksBySession(childIdVal, res.SessionId),
        getSpeechAccuracyBySession(res.SessionId).catch(err => {
          console.error('Error fetching stored speech accuracy:', err);
          return { success: false, data: [] } as any;
        })
      ]);

      if (chunkRes.success && chunkRes.data) {
        // Map chunks with resolved endpoint URLs without blocking UI
        const formattedChunks = chunkRes.data.map((chunk: any) => ({
          ...chunk,
          chunkUrl: chunk.chunkUrl?.replace('http://minio:9000', 'https://minio.103-162-30-111.sslip.io')
        }));
        setChunks(formattedChunks);

        // Process stored speech accuracy entries from DB
        const groupedByChunk: Record<number, any> = {};
        if (accuracyRes.success && accuracyRes.data && accuracyRes.data.length > 0) {
          accuracyRes.data.forEach((item: any) => {
            const cIndex = item.audioChunkIndex ?? 0;
            if (!groupedByChunk[cIndex]) {
              const speechCat = item.speechErrorCategory || item.SpeechErrorCategory || 'Thay thế âm';
              groupedByChunk[cIndex] = {
                accuracyScore: item.accuracyScore,
                AccuracyScore: item.accuracyScore,
                pronunciationScore: item.pronunciationScore ?? 0,
                PronunciationScore: item.pronunciationScore ?? 0,
                fluencyScore: item.fluencyScore ?? 0,
                FluencyScore: item.fluencyScore ?? 0,
                completenessScore: item.completenessScore ?? 0,
                CompletenessScore: item.completenessScore ?? 0,
                speechErrorCategory: speechCat,
                SpeechErrorCategory: speechCat,
                PronunciationAssessment: {
                  AccuracyScore: item.accuracyScore,
                  accuracyScore: item.accuracyScore,
                  FluencyScore: item.fluencyScore ?? 0,
                  fluencyScore: item.fluencyScore ?? 0,
                  PronunciationScore: item.pronunciationScore ?? 0,
                  pronunciationScore: item.pronunciationScore ?? 0,
                  CompletenessScore: item.completenessScore ?? 0,
                  completenessScore: item.completenessScore ?? 0,
                },
                Words: []
              };
            }
            groupedByChunk[cIndex].Words.push({
              Word: item.word,
              word: item.word,
              AccuracyScore: item.accuracyScore,
              accuracyScore: item.accuracyScore,
              ErrorType: item.errorType,
              errorType: item.errorType
            });
          });
          setChunkAssessments(groupedByChunk);
        }

        // Cache session details for 0ms instant display next time
        sessionDetailCache.set(res.SessionId, {
          chunks: formattedChunks,
          assessments: groupedByChunk,
          timestamp: Date.now()
        });
      } else {
        setChunks([]);
      }
    } catch (err) {
      showToast('Không quét thấy file audio chunk tương ứng.', 'warn');
    } finally {
      setLoadingChunks(false);
    }
  };

  // Revoke object URLs on component unmount
  useEffect(() => {
    return () => {
      audioBlobCache.forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      audioBlobCache.clear();
    };
  }, []);

  // Audio Play handler - On-demand lazy download and in-memory cache
  const handlePlayChunk = async (rawUrl: string, index: number) => {
    const event = parsedEvents[index];
    const assessment = chunkAssessments[index];
    const recognized = assessment?.recognizedText || assessment?.RecognizedText || assessment?.display || assessment?.Display;
    if (isSilentOrUnclearSpeech(event?.spokenText) || isSilentOrUnclearSpeech(recognized)) {
      showToast("Không có file âm thanh khả dụng do trẻ im lặng hoặc không nghe rõ.", "warn");
      return;
    }

    if (playingChunkIndex === index) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingChunkIndex(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingChunkIndex(null);
    }

    const audioKey = `${selectedResult?.SessionId}_${index}`;
    let playUrl = audioBlobUrls[index] || audioBlobCache.get(audioKey);

    // If not cached yet, download this single audio chunk on-demand
    if (!playUrl) {
      if (!selectedResult) return;
      const child = children.find(c => c.ChildId === selectedResult.ChildId);
      const childIdVal = child ? Number(child.ChildId) : Number(selectedResult.ChildId);

      setLoadingAudioIndex(index);
      try {
        const blobRes = await downloadAudioChunk(childIdVal, selectedResult.SessionId, index);
        if (blobRes.success && blobRes.data) {
          playUrl = URL.createObjectURL(blobRes.data);
          audioBlobCache.set(audioKey, playUrl);
          setAudioBlobUrls(prev => ({ ...prev, [index]: playUrl! }));
        } else {
          playUrl = rawUrl?.replace('http://minio:9000', 'https://minio.103-162-30-111.sslip.io');
        }
      } catch (err) {
        console.error('Failed to download audio chunk:', err);
        playUrl = rawUrl?.replace('http://minio:9000', 'https://minio.103-162-30-111.sslip.io');
      } finally {
        setLoadingAudioIndex(null);
      }
    }

    if (!playUrl) {
      showToast("Không thể tải file âm thanh của đoạn này.", "warn");
      return;
    }

    const audio = new Audio(playUrl);
    audioRef.current = audio;
    setPlayingChunkIndex(index);

    audio.play().catch(err => {
      console.error("Audio playback failed:", err);
      showToast("Không thể phát âm thanh trên trình duyệt.", "warn");
      setPlayingChunkIndex(null);
    });

    audio.onended = () => {
      setPlayingChunkIndex(null);
    };
  };

  // Cleanup audio play on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [selectedResult]);

  // Save feedback remarks
  const handleSaveFeedback = async () => {
    if (!selectedResult) return;
    if (!feedbackInput.trim()) {
      showToast('Vui lòng điền nội dung nhận xét!', 'warn');
      return;
    }

    setSavingFeedback(true);
    try {
      const res = await updateResultFeedback(Number(selectedResult.ResultId), feedbackInput);
      if (res.success) {
        showToast('Lưu nhận xét và hướng dẫn rèn luyện thành công!', 'success');
        setResults(prev => prev.map(r => r.ResultId === selectedResult.ResultId ? { ...r, FeedbackText: feedbackInput } : r));
        setSelectedResult(prev => prev ? { ...prev, FeedbackText: feedbackInput } : null);
        setShowFeedbackInput(false);
      } else {
        showToast('Lưu phản hồi thất bại.', 'warn');
      }
    } catch (err) {
      showToast('Lỗi hệ thống khi cập nhật phản hồi.', 'warn');
    } finally {
      setSavingFeedback(false);
    }
  };

  // Run AI Speech Pronunciation Assessment
  const handleAssessChunk = async (chunkIndex: number) => {
    if (!selectedResult) return;
    const event = parsedEvents[chunkIndex];
    const assessment = chunkAssessments[chunkIndex];
    const recognized = assessment?.recognizedText || assessment?.RecognizedText || assessment?.display || assessment?.Display;
    if (isSilentOrUnclearSpeech(event?.spokenText) || isSilentOrUnclearSpeech(recognized)) {
      showToast("Không thể đánh giá AI đối với đoạn âm thanh trẻ im lặng hoặc không nghe rõ.", "warn");
      return;
    }
    const text = referenceTexts[chunkIndex]?.trim();
    if (!text) {
      showToast('Vui lòng điền từ chuẩn để AI đánh giá!', 'warn');
      return;
    }

    setAssessingChunkIndex(chunkIndex);
    showToast(`AI đang tiến hành thẩm âm đoạn #${chunkIndex + 1}...`, 'info');

    try {
      const child = children.find(c => c.ChildId === selectedResult.ChildId);
      const childIdVal = child ? Number(child.ChildId) : Number(selectedResult.ChildId);
      const logEvents = parseInteractionLog(selectedResult.InteractionLog);
      const event = logEvents[chunkIndex];

      const isCorrectAnswer = event?.isCorrect === true;
      const res = await assessChunk({
        childProfileId: childIdVal,
        sessionId: selectedResult.SessionId,
        chunkIndex,
        referenceText: cleanSpeechText(text),
        spokenText: isCorrectAnswer ? '' : cleanSpeechText(event?.spokenText)
      });

      if (res.success && res.data) {
        setChunkAssessments(prev => ({ ...prev, [chunkIndex]: res.data }));
        showToast('AI đã hoàn tất đánh giá phát âm thành công!', 'success');
      } else {
        showToast('Đánh giá AI thất bại.', 'warn');
      }
    } catch (err) {
      showToast('Lỗi kết nối dịch vụ đánh giá phát âm AI.', 'warn');
    } finally {
      setAssessingChunkIndex(null);
    }
  };

  // Open manual score modal
  const handleOpenManualScore = (chunkIndex: number) => {
    const event = parsedEvents[chunkIndex];
    const existing = chunkAssessments[chunkIndex];
    const recognized = existing?.recognizedText || existing?.RecognizedText || existing?.display || existing?.Display;
    if (isSilentOrUnclearSpeech(event?.spokenText) || isSilentOrUnclearSpeech(recognized)) {
      showToast("Không hỗ trợ thao tác hoặc nhập điểm khi trẻ im lặng hoặc không nghe rõ.", "warn");
      return;
    }
    if (existing) {
      const acc = existing.accuracyScore ?? existing.AccuracyScore ?? existing.pronunciationAssessment?.accuracyScore ?? existing.PronunciationAssessment?.AccuracyScore ?? 90;
      const pron = existing.pronunciationScore ?? existing.PronunciationScore ?? existing.pronScore ?? existing.PronScore ?? existing.pronunciationAssessment?.pronunciationScore ?? existing.PronunciationAssessment?.PronScore ?? 90;
      const flu = existing.fluencyScore ?? existing.FluencyScore ?? existing.pronunciationAssessment?.fluencyScore ?? existing.PronunciationAssessment?.FluencyScore ?? 90;
      const comp = existing.completenessScore ?? existing.CompletenessScore ?? existing.pronunciationAssessment?.completenessScore ?? existing.PronunciationAssessment?.CompletenessScore ?? 100;
      const speechCat = existing.speechErrorCategory || existing.SpeechErrorCategory || 'Thay thế âm';
      setManualScores({
        accuracy: Math.round(Number(acc)),
        pronunciation: Math.round(Number(pron)),
        fluency: Math.round(Number(flu)),
        completeness: Math.round(Number(comp)),
        speechErrorCategory: speechCat
      });
    } else {
      setManualScores({
        accuracy: 90,
        pronunciation: 90,
        fluency: 90,
        completeness: 100,
        speechErrorCategory: 'Thay thế âm'
      });
    }
    setScoringChunkIndex(chunkIndex);
  };

  // Save manual scores
  const handleSaveManualScore = async () => {
    if (scoringChunkIndex === null || !selectedResult) return;
    const event = parsedEvents[scoringChunkIndex];
    const existing = chunkAssessments[scoringChunkIndex];
    const recognized = existing?.recognizedText || existing?.RecognizedText || existing?.display || existing?.Display;
    if (isSilentOrUnclearSpeech(event?.spokenText) || isSilentOrUnclearSpeech(recognized)) {
      showToast("Không hỗ trợ lưu điểm đối với đoạn im lặng hoặc không nghe rõ.", "warn");
      return;
    }
    setIsSavingManualScore(true);

    try {
      const child = children.find(c => c.ChildId === selectedResult.ChildId);
      const childIdVal = child ? Number(child.ChildId) : Number(selectedResult.ChildId);
      const word = referenceTexts[scoringChunkIndex]?.trim() || parsedEvents[scoringChunkIndex]?.text || 'N/A';
      const cleanWord = cleanSpeechText(word);

      const payload = {
        childProfileId: childIdVal,
        sessionId: selectedResult.SessionId,
        audioChunkIndex: scoringChunkIndex,
        word: cleanWord,
        accuracyScore: Number(manualScores.accuracy),
        pronunciationScore: Number(manualScores.pronunciation),
        fluencyScore: Number(manualScores.fluency),
        completenessScore: Number(manualScores.completeness),
        errorType: Number(manualScores.accuracy) < 50 ? 'Mispronunciation' : 'None',
        speechErrorCategory: manualScores.speechErrorCategory || 'Thay thế âm',
        lessonId: selectedResult.LessonId ? Number(selectedResult.LessonId) : undefined,
        resultId: selectedResult.ResultId ? Number(selectedResult.ResultId) : undefined
      };

      const res = await createSpeechAccuracy(payload);
      if (res.success && res.data) {
        const updatedAssessment = {
          AccuracyScore: Number(manualScores.accuracy),
          accuracyScore: Number(manualScores.accuracy),
          PronScore: Number(manualScores.pronunciation),
          pronScore: Number(manualScores.pronunciation),
          PronunciationScore: Number(manualScores.pronunciation),
          pronunciationScore: Number(manualScores.pronunciation),
          FluencyScore: Number(manualScores.fluency),
          fluencyScore: Number(manualScores.fluency),
          CompletenessScore: Number(manualScores.completeness),
          completenessScore: Number(manualScores.completeness),
          SpeechErrorCategory: manualScores.speechErrorCategory,
          speechErrorCategory: manualScores.speechErrorCategory,
          recognizedText: cleanWord,
          Words: [
            {
              Word: cleanWord,
              word: cleanWord,
              AccuracyScore: Number(manualScores.accuracy),
              accuracyScore: Number(manualScores.accuracy),
              ErrorType: Number(manualScores.accuracy) < 50 ? 'Mispronunciation' : 'None',
              errorType: Number(manualScores.accuracy) < 50 ? 'Mispronunciation' : 'None'
            }
          ]
        };

        setChunkAssessments(prev => ({ ...prev, [scoringChunkIndex]: updatedAssessment }));
        showToast('Đã lưu điểm đánh giá thành công!', 'success');
        setScoringChunkIndex(null);
      } else {
        showToast('Lưu điểm thất bại.', 'warn');
      }
    } catch (err) {
      showToast('Lỗi hệ thống khi lưu điểm.', 'warn');
    } finally {
      setIsSavingManualScore(false);
    }
  };

  // Direct handler for changing speech error category from audio chunk card
  const handleDirectCategoryChange = async (chunkIndex: number, newCategory: string) => {
    if (!selectedResult) return;
    const event = parsedEvents[chunkIndex];
    const existing = chunkAssessments[chunkIndex] || {};

    const updated = {
      ...existing,
      speechErrorCategory: newCategory,
      SpeechErrorCategory: newCategory
    };

    setChunkAssessments(prev => ({
      ...prev,
      [chunkIndex]: updated
    }));

    if (sessionDetailCache.has(selectedResult.SessionId)) {
      const cached = sessionDetailCache.get(selectedResult.SessionId)!;
      if (cached.assessments) {
        cached.assessments[chunkIndex] = updated;
      }
    }

    if (currentRoleView !== 'PARENT' && !isSilentOrUnclearSpeech(event?.spokenText)) {
      try {
        const child = children.find(c => c.ChildId === selectedResult.ChildId);
        const childIdVal = child ? Number(child.ChildId) : Number(selectedResult.ChildId);
        const word = referenceTexts[chunkIndex]?.trim() || parsedEvents[chunkIndex]?.text || 'N/A';
        const cleanWord = cleanSpeechText(word);

        const acc = existing.accuracyScore ?? existing.AccuracyScore ?? 90;
        const pron = existing.pronunciationScore ?? existing.PronunciationScore ?? 90;
        const flu = existing.fluencyScore ?? existing.FluencyScore ?? 90;
        const comp = existing.completenessScore ?? existing.CompletenessScore ?? 100;

        const payload = {
          childProfileId: childIdVal,
          sessionId: selectedResult.SessionId,
          audioChunkIndex: chunkIndex,
          word: cleanWord,
          accuracyScore: Number(acc),
          pronunciationScore: Number(pron),
          fluencyScore: Number(flu),
          completenessScore: Number(comp),
          errorType: Number(acc) < 50 ? 'Mispronunciation' : 'None',
          speechErrorCategory: newCategory,
          lessonId: selectedResult.LessonId ? Number(selectedResult.LessonId) : undefined,
          resultId: selectedResult.ResultId ? Number(selectedResult.ResultId) : undefined
        };

        await createSpeechAccuracy(payload);
        showToast(`Đã lưu phân loại lỗi: "${newCategory}"`, 'success');
      } catch (err) {
        console.error('Lỗi khi lưu phân loại lỗi phát âm:', err);
      }
    }
  };

  // Filters logic
  const filteredResults = useMemo(() => {
    return results.filter((res) => {
      const child = children.find((c) => c.ChildId === res.ChildId);
      const lesson = lessons.find((l) => String(l.id) === res.LessonId);

      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchChild = child?.FullName.toLowerCase().includes(query);
        const matchLesson = lesson?.lessonName.toLowerCase().includes(query);
        const matchSession = (res.SessionId || res.ResultId).toLowerCase().includes(query);
        if (!matchChild && !matchLesson && !matchSession) return false;
      }

      // Status Filter
      if (filterStatus !== 'ALL') {
        if (filterStatus === 'Completed' && res.CompletionStatus !== 'Completed') return false;
        if (filterStatus === 'Failed' && res.CompletionStatus !== 'Failed') return false;
        if (filterStatus === 'InProgress' && res.CompletionStatus !== 'InProgress') return false;
      }

      // Child Profile Filter
      if (filterChildId !== 'ALL' && res.ChildId !== filterChildId) return false;

      // Date Range Filter
      if (filterDateRange !== 'ALL') {
        const now = new Date();
        const completedDate = res.CompletedAt ? new Date(res.CompletedAt) : new Date(res.StartedAt);
        const diffTime = Math.abs(now.getTime() - completedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterDateRange === 'TODAY' && diffDays > 1) return false;
        if (filterDateRange === 'WEEK' && diffDays > 7) return false;
        if (filterDateRange === 'MONTH' && diffDays > 30) return false;
      }

      return true;
    });
  }, [results, children, lessons, searchQuery, filterStatus, filterChildId, filterDateRange]);

  // Paginated list
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredResults.slice(startIndex, startIndex + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  const getChildDetailInfo = (childId: string) => {
    return children.find((c) => c.ChildId === childId);
  };

  return (
    <div className="min-h-full flex flex-col gap-3 pb-6 relative" id="results-split-page-wrapper">
      {/* Toast notifications */}
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
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
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

      {/* Page Header Bar - Compact single row */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-0.5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight leading-none">
            Kết Quả <span className="text-[#FF8E8E]">Luyện Tập</span>
          </h1>
        </div>

        <div className="bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2 self-start sm:self-center shrink-0">
          <div className="w-6 h-6 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            <UserSquare2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider whitespace-nowrap">Học viên:</span>
            <CustomSelect
              value={filterChildId}
              onChange={(val) => setFilterChildId(val)}
              options={[
                { value: 'ALL', label: '🌟 TẤT CẢ HỌC SINH MẦM NON' },
                ...children.map((kd) => ({
                  value: kd.ChildId,
                  label: `👶 ${kd.FullName} (${kd.Age}t) - ${kd.LearningLevel}`
                }))
              ]}
              className="min-w-[190px] sm:min-w-[220px] font-medium text-xs"
            />
          </div>
        </div>
      </div>

      {/* Biểu đồ xu hướng kết quả luyện tập (Có nút thu gọn / mở rộng) */}
      {practiceChartData.length > 0 && (
        <div className="shrink-0 bg-white rounded-xl border border-slate-100 shadow-2xs transition-all overflow-hidden">
          {/* Header row - gom tất cả control vào 1 hàng duy nhất */}
          <div className="px-3.5 py-2 flex items-center justify-between flex-wrap gap-2 border-b border-slate-100/60 bg-slate-50/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 bg-[#4EACAF]/10 rounded-lg flex items-center justify-center text-[#4EACAF] shrink-0">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm leading-tight truncate">Xu hướng kết quả luyện tập</h3>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-medium bg-[#4EACAF]/10 text-[#3D8C8F] shrink-0 hidden sm:inline-block">
                    {resolvedDateRange.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Legend - chỉ hiển thị khi mở rộng */}
              {!isChartCollapsed && (
                <div className="hidden sm:flex items-center gap-2.5 text-[11px] font-medium mr-1">
                  <div className="flex items-center gap-1 text-[#4EACAF]">
                    <span className="w-2 h-2 rounded-full bg-[#4EACAF] inline-block" />
                    <span>Số lượt</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#FF8E8E]">
                    <span className="w-2 h-2 rounded-full bg-[#FF8E8E] inline-block" />
                    <span>Độ chính xác</span>
                  </div>
                </div>
              )}

              {/* Date range picker button */}
              <div className="relative inline-block" ref={dateSearchRef}>
                <button
                  type="button"
                  onClick={() => setIsDateSearchOpen((o) => !o)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors shadow-2xs cursor-pointer",
                    isDateSearchOpen
                      ? "border-[#4EACAF] text-[#3D8C8F] bg-[#4EACAF]/5"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#4EACAF]/50"
                  )}
                >
                  <Calendar className="w-3 h-3 text-[#4EACAF] shrink-0" />
                  <span className="truncate max-w-[120px]">{resolvedDateRange.label}</span>
                  <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform shrink-0", isDateSearchOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isDateSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1.5 z-30 bg-white rounded-xl border border-slate-200 shadow-xl w-[270px] p-2 space-y-0.5"
                    >
                      {DATE_RANGE_PRESET_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setDateRangePreset(opt.value);
                            if (opt.value !== 'CUSTOM') setIsDateSearchOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                            dateRangePreset === opt.value
                              ? "bg-[#4EACAF]/10 text-[#3D8C8F]"
                              : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <span>{opt.label}</span>
                          {dateRangePreset === opt.value && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}

                      {dateRangePreset === 'CUSTOM' && (
                        <div className="pt-2 mt-1 border-t border-slate-100 space-y-2 px-1 pb-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Từ ngày</label>
                              <input
                                type="date"
                                value={customStartDate}
                                max={customEndDate || undefined}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-[#4EACAF] outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Đến ngày</label>
                              <input
                                type="date"
                                value={customEndDate}
                                min={customStartDate || undefined}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-[#4EACAF] outline-none"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={!customStartDate || !customEndDate}
                            onClick={() => setIsDateSearchOpen(false)}
                            className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-[#4EACAF] hover:bg-[#3D8C8F] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            Áp dụng
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Collapse / Expand Toggle Button */}
              <button
                type="button"
                onClick={toggleChartCollapsed}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                title={isChartCollapsed ? "Mở rộng biểu đồ" : "Thu gọn biểu đồ"}
              >
                {isChartCollapsed ? (
                  <>
                    <span>Mở biểu đồ</span>
                    <ChevronDown className="w-3 h-3 text-[#4EACAF]" />
                  </>
                ) : (
                  <>
                    <span>Thu gọn</span>
                    <ChevronUp className="w-3 h-3 text-slate-400" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Chart visual area (Hiển thị khi không thu gọn) */}
          <AnimatePresence initial={false}>
            {!isChartCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-2 sm:p-2.5">
                  <div className="w-full overflow-x-auto">
                    <div className="h-40" style={{ minWidth: practiceChartMinWidth }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={practiceChartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} />
                          <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 11 }}
                            allowDecimals={false}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 11 }}
                            domain={[0, 100]}
                            tickFormatter={(val) => `${val}%`}
                          />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: '#1E293B', borderRadius: '10px', color: '#fff', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', padding: '8px 12px' }}
                            labelStyle={{ fontWeight: 600, color: '#94A3B8', fontSize: '11px' }}
                            formatter={(val: any, name: any) => {
                              if (name === 'attempts') return [`${val} lượt`, 'Số lượt luyện'];
                              if (name === 'accuracyRate') return [`${val}%`, 'Độ chính xác phát âm'];
                              return [val, name];
                            }}
                          />
                          <Bar yAxisId="left" dataKey="attempts" name="attempts" fill="#4EACAF" radius={[4, 4, 0, 0]} maxBarSize={22} />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="accuracyRate"
                            name="accuracyRate"
                            stroke="#FF8E8E"
                            strokeWidth={2.5}
                            dot={{ r: 3.5, fill: '#FF8E8E', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                            activeDot={{ r: 5, fill: '#FF8E8E', strokeWidth: 2, stroke: '#FFFFFF' }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-sm font-medium text-rose-700">
          {apiError}
        </div>
      )}

      {/* Split-Panel Content View with Contained Viewport Heights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch lg:h-[700px] min-h-[620px]">

        {/* Left Side: Results List */}
        <div ref={leftPanelRef} className="lg:col-span-5 h-full min-h-0">
          <div className="h-full flex flex-col min-h-0 bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm overscroll-contain">
            {/* Header (Fixed) */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4EACAF]" />
                <h3 className="font-semibold text-slate-800 text-sm">Lịch sử luyện tập</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                  {filteredResults.length}
                </span>
              </div>
            </div>

            {/* Filters Subsystem (Fixed) */}
            <div className="shrink-0 space-y-2 pt-2.5 pb-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo học sinh, bài tập, Session ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-3 py-1.5 rounded-xl border border-slate-200 outline-none text-xs font-normal focus:border-[#4EACAF] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'Completed', label: 'Đã hoàn thành' },
                    { value: 'InComplete', label: 'Chưa hoàn thành' }
                  ]}
                  className="w-full text-xs"
                />

                <CustomSelect
                  value={filterDateRange}
                  onChange={setFilterDateRange}
                  options={[
                    { value: 'ALL', label: 'Tất cả thời gian' },
                    { value: 'TODAY', label: 'Hôm nay' },
                    { value: 'WEEK', label: '7 ngày qua' },
                    { value: 'MONTH', label: '30 ngày qua' }
                  ]}
                  className="w-full text-xs"
                />
              </div>
            </div>

            {/* Results Items List (Scrollable Area) */}
            {isApiLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <Activity className="w-8 h-8 text-[#4EACAF] animate-spin mb-2" />
                <p className="text-sm font-normal text-slate-500">Đang tải danh sách kết quả...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <VolumeX className="w-12 h-12 mb-3 opacity-40" />
                <p className="font-normal text-sm">Không tìm thấy lượt luyện tập phù hợp.</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col">
                <div ref={leftResultsScrollRef} className="flex-1 min-h-0 overflow-y-auto pr-1 p-0.5 space-y-2.5 overscroll-contain">
                  {paginatedResults.map((res) => {
                    const isSelected = selectedResult?.ResultId === res.ResultId;
                    const child = getChildDetailInfo(res.ChildId);
                    const lesson = lessons.find(l => String(l.id) === res.LessonId);
                    const counts = getResultCounts(res);

                    return (
                      <div
                        key={res.ResultId}
                        onClick={() => handleSelectResult(res)}
                        className={cn(
                          "rounded-xl border p-3 transition-all cursor-pointer space-y-2",
                          isSelected
                            ? "border-[#4EACAF] bg-[#4EACAF]/5 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 bg-white"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="font-semibold text-slate-800 text-xs font-mono truncate">
                              Session #{res.SessionId || res.ResultId}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal truncate">
                              <span className="font-medium text-slate-700 truncate">{child?.FullName || `Bé (ID: ${res.ChildId})`}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400 truncate">{lesson?.lessonName || 'Bài tập tự do'}</span>
                            </div>
                          </div>
                          <span className={cn(
                            "text-[9px] px-2 py-0.5 rounded font-medium uppercase shrink-0 tracking-wider",
                            res.CompletionStatus === 'Completed'
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          )}>
                            {res.CompletionStatus === 'Completed' ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100/60 pt-2 text-[10.5px] font-medium text-slate-500 gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{res.DurationSeconds}s</span>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-[#4EACAF]">Điểm: {res.Score}/{lessons.find(l => String(l.id) === res.LessonId)?.maxScore ?? 95}</span>
                            <span className="text-slate-300">|</span>
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">
                              {counts.correct} đúng
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60 whitespace-nowrap">
                              {counts.wrong} sai
                            </span>
                          </div>
                          <span className="text-slate-400 shrink-0 text-[10px]">{formatDateDMY(res.CompletedAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fixed bottom pagination */}
                <div className="shrink-0 pt-2 mt-1 border-t border-slate-100">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredResults.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    itemLabel="lượt luyện"
                    compact
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed session assessment & Chunks */}
        <div ref={sessionPanelRef} className="lg:col-span-7 h-full min-h-0">
          {selectedResult ? (
            <div className="h-full flex flex-col min-h-0 bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-sm animate-in fade-in duration-300 overscroll-contain">

              {/* Header Info (Fixed at top of Right Panel) */}
              <div className="shrink-0 flex items-start justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 font-mono leading-tight">
                    Session #{selectedResult.SessionId || selectedResult.ResultId}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal mt-0.5">
                    <span className="font-medium text-slate-700">
                      Học sinh: {getChildDetailInfo(selectedResult.ChildId)?.FullName || `Bé (ID: ${selectedResult.ChildId})`}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 truncate max-w-[280px]">
                      {lessons.find(l => String(l.id) === selectedResult.LessonId)?.lessonName || 'Bài tập tự do'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Đóng chi tiết"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Statistics Quick Info (Fixed) */}
              <div className="shrink-0 grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 my-2">
                <div className="text-center">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Thời lượng</span>
                  <span className="text-sm sm:text-base font-bold text-slate-800 mt-0.5 block">{selectedResult.DurationSeconds} giây</span>
                </div>
                <div className="text-center border-x border-slate-200">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Điểm số</span>
                  <span className="text-sm sm:text-base font-bold text-indigo-600 mt-0.5 block">
                    {selectedResult.Score}/{lessons.find(l => String(l.id) === selectedResult.LessonId)?.maxScore ?? 95}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Tổng từ đúng / sai</span>
                  <div className="text-[11px] font-medium mt-1 flex items-center justify-center gap-1">
                    <span className="text-emerald-600 font-medium">Đúng: {sessionCorrectWords}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-rose-500 font-medium">Sai: {sessionWrongWords}</span>
                  </div>
                  <span className="text-[9.5px] font-normal text-slate-400 block mt-0.5 truncate">
                    (Tổng {sessionTotalWords} từ · {sessionAccuracy}% chuẩn)
                  </span>
                </div>
              </div>

              {/* Scrollable details container (The ONLY part that scrolls on the right) */}
              <div
                ref={sessionDetailsScrollRef}
                className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-1.5 space-y-2.5 overscroll-contain"
                onWheel={(e) => e.stopPropagation()}
              >

                {/* Thống kê chi tiết theo từng từ trong phiên */}
                <div
                  ref={wordsSectionRef}
                  className="space-y-2 bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#4EACAF]" />
                      <span>Thống kê theo từng từ trong phiên</span>
                      <span className="text-xs bg-teal-50 text-[#4EACAF] border border-teal-100 px-2 py-0.5 rounded-full font-medium">
                        {sessionWordStats.length} từ
                      </span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium flex items-center gap-1.5">
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md font-medium">
                          ✓ Đúng: {sessionCorrectWords} lần
                        </span>
                        <span className="text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md font-medium">
                          ✕ Sai: {sessionWrongWords} lần
                        </span>
                      </div>

                      {sessionWordStats.length > 2 && (
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <button
                            type="button"
                            onClick={() => handleScrollWords('left')}
                            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Cuộn sang trái"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScrollWords('right')}
                            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Cuộn sang phải"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {sessionWordStats.length > 0 ? (
                    <div
                      ref={wordsScrollRef}
                      className="overflow-x-auto pb-2 pt-1 px-0.5 overscroll-contain"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-2 min-w-full items-stretch">
                        {sessionWordStats.map((item) => {
                          const isAllCorrect = item.wrongCount === 0;
                          const isAllWrong = item.correctCount === 0;

                          return (
                            <div
                              key={item.word}
                              className={cn(
                                "w-full sm:w-[calc(50%-4px)] min-w-[280px] shrink-0 p-2 rounded-xl border transition-all flex flex-col gap-2",
                                isAllCorrect
                                  ? "bg-emerald-50/30 border-emerald-200/80 hover:border-emerald-300"
                                  : isAllWrong
                                    ? "bg-rose-50/30 border-rose-200/80 hover:border-rose-300"
                                    : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2 min-h-[44px]">
                                <div>
                                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Từ vựng</span>
                                  <span className="text-sm font-semibold text-slate-800 capitalize leading-snug line-clamp-2">
                                    {item.word}
                                  </span>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0",
                                  item.accuracyRate >= 80 ? "bg-emerald-100 text-emerald-800" :
                                    item.accuracyRate >= 50 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                                )}>
                                  {item.accuracyRate}% đúng
                                </span>
                              </div>

                              {/* Chi tiết đúng bao nhiêu lần, sai bao nhiêu lần */}
                              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                                <div className="flex items-center gap-1 bg-emerald-100/80 text-emerald-900 px-2 py-0.5 rounded-md font-medium">
                                  <span>✓ Đúng:</span>
                                  <span>{item.correctCount} lần</span>
                                </div>
                                <div className="flex items-center gap-1 bg-rose-100/80 text-rose-900 px-2 py-0.5 rounded-md font-medium">
                                  <span>✕ Sai:</span>
                                  <span>{item.wrongCount} lần</span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-normal ml-auto">
                                  Tổng: {item.totalCount} lần
                                </span>
                              </div>

                              {/* Stacked visual progress bar */}
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                                <div
                                  className="bg-emerald-500 h-full transition-all duration-500"
                                  style={{ width: `${item.accuracyRate}%` }}
                                />
                                <div
                                  className="bg-rose-500 h-full transition-all duration-500"
                                  style={{ width: `${100 - item.accuracyRate}%` }}
                                />
                              </div>

                              {/* Khu vực chi tiết phát âm: ngang bằng nhau trên cùng một hàng */}
                              <div className="space-y-2 pt-1 flex-1 flex flex-col justify-start">
                                {/* Ghi chú khi trẻ phát âm đúng */}
                                {item.correctCount > 0 ? (
                                  <div className="text-[11px] text-emerald-700 bg-white/90 p-2 rounded-lg border border-emerald-200 leading-snug">
                                    <span className="font-medium">Lúc nói đúng: </span>
                                    {item.attempts.some(a => a.isCorrect)
                                      ? item.attempts
                                        .filter(a => a.isCorrect)
                                        .map((a) => `[${a.timeSeconds}s] Trẻ nói "${a.spokenText || item.word}"`)
                                        .join(', ')
                                      : `Phát âm chính xác ${item.correctCount} lần`}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 bg-slate-50/70 p-2 rounded-lg border border-dashed border-slate-200 leading-snug">
                                    <span className="font-medium text-slate-500">Lúc nói đúng: </span>Chưa có lần nào đúng
                                  </div>
                                )}

                                {/* Ghi chú khi trẻ phát âm sai */}
                                {item.wrongCount > 0 ? (
                                  <div className="text-[11px] text-rose-700 bg-white/90 p-2 rounded-lg border border-rose-200 leading-snug">
                                    <span className="font-medium">Lúc nói sai: </span>
                                    {item.attempts.some(a => !a.isCorrect && a.spokenText)
                                      ? item.attempts
                                        .filter(a => !a.isCorrect && a.spokenText)
                                        .map((a) => `[${a.timeSeconds}s] Trẻ nói "${a.spokenText}"`)
                                        .join(', ')
                                      : `Phát âm chưa đúng ${item.wrongCount} lần`}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-emerald-700 bg-emerald-50/50 p-2 rounded-lg border border-dashed border-emerald-200/80 leading-snug">
                                    <span className="font-medium text-emerald-800">Lúc nói sai: </span>Không có lần nào sai (Bé nói chuẩn 100%)
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 italic border border-slate-100">
                      Chưa có nhật ký tương tác chi tiết từng từ cho lượt luyện tập này.
                    </div>
                  )}
                </div>

                {/* Comments feedback text section */}
                {canEditFeedback && (
                  showFeedbackInput ? (
                    <div className="space-y-2 bg-[#FFFDF5] p-2 rounded-xl border border-amber-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-amber-500" />
                          Nhận xét & Hướng dẫn từ giáo viên
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setFeedbackInput(selectedResult.FeedbackText || '');
                            setShowFeedbackInput(false);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Đóng khung nhập"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        autoFocus
                        placeholder="Viết hướng dẫn khẩu hình, các từ bé cần luyện thêm ở nhà hoặc nhận xét chung..."
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 outline-none text-xs font-normal placeholder-slate-400 bg-white focus:border-[#4EACAF] transition-colors resize-none"
                      />
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setFeedbackInput(selectedResult.FeedbackText || '');
                            setShowFeedbackInput(false);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          disabled={savingFeedback}
                          onClick={handleSaveFeedback}
                          className="px-3 py-1.5 bg-[#4EACAF] hover:bg-[#3D8C8F] text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                  ) : selectedResult.FeedbackText ? (
                    <div className="space-y-1.5 bg-[#FFFDF5] p-2 rounded-xl border border-yellow-100">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-amber-500" />
                          Nhận xét & Hướng dẫn từ giáo viên
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setFeedbackInput(selectedResult.FeedbackText || '');
                            setShowFeedbackInput(true);
                          }}
                          className="text-xs text-[#4EACAF] hover:text-[#3D8C8F] font-medium flex items-center gap-1 cursor-pointer hover:underline"
                        >
                          <Edit3 className="w-3 h-3" />
                          Chỉnh sửa
                        </button>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedResult.FeedbackText}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackInput('');
                        setShowFeedbackInput(true);
                      }}
                      className="w-full flex items-center justify-between p-2 bg-[#FFFDF5] hover:bg-amber-50/70 rounded-xl border border-dashed border-amber-300/80 text-slate-700 transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-slate-700 group-hover:text-amber-900">
                          Nhận xét & Hướng dẫn từ giáo viên
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[#4EACAF] group-hover:text-[#3D8C8F] flex items-center gap-1 group-hover:underline">
                        + Viết nhận xét
                      </span>
                    </button>
                  )
                )}

                {/* Display feedback text to parent */}
                {currentRoleView === 'PARENT' && (
                  <div className="space-y-2 bg-[#FFFDF5] p-2 rounded-xl border border-yellow-100">
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-amber-500" />
                      Nhận xét & Hướng dẫn từ giáo viên
                    </h4>
                    <div className="p-2 bg-white rounded-lg border border-slate-200/60 text-sm font-normal text-slate-700 leading-relaxed min-h-[50px] whitespace-pre-wrap">
                      {selectedResult.FeedbackText ? (
                        selectedResult.FeedbackText
                      ) : (
                        <span className="text-slate-400 italic">Chưa có nhận xét hay hướng dẫn nào từ giáo viên cho lượt luyện tập này.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Interaction Log Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#4EACAF]" />
                    Nhật ký tương tác (Interaction Log)
                  </h4>
                  <div
                    ref={interactionLogScrollRef}
                    className="p-2 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs whitespace-pre-line leading-relaxed shadow-inner border border-slate-850 max-h-48 overflow-y-auto space-y-1 overscroll-contain"
                  >
                    {selectedResult.InteractionLog ? (
                      selectedResult.InteractionLog
                        .split(/\s*\|\s*/)
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))
                    ) : (
                      "Hệ thống chưa ghi nhận vết log tương tác ở phiên tập này..."
                    )}
                  </div>
                </div>

                {/* Chunk audio listing section */}
                <div ref={chunksSectionRef} className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#4EACAF]" />
                        <span>Danh sách các file âm thanh ghi âm</span>
                      </h4>
                      <span className="text-xs bg-[#4EACAF]/10 text-[#4EACAF] px-2.5 py-0.5 rounded-full font-medium">
                        {filteredChunks.length} / {chunks.length} đoạn
                      </span>
                    </div>
                    {(chunkSearchQuery || chunkStatusFilter !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => { setChunkSearchQuery(''); setChunkStatusFilter('ALL'); }}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Đặt lại bộ lọc</span>
                      </button>
                    )}
                  </div>

                  {/* Filter and Search Toolbar */}
                  {chunks.length > 0 && !loadingChunks && (
                    <div className="bg-slate-50/90 p-2 rounded-xl border border-slate-200/60 space-y-2">
                      {/* Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={chunkSearchQuery}
                          onChange={(e) => setChunkSearchQuery(e.target.value)}
                          placeholder="Tìm theo từ chuẩn, từ trẻ nói, mốc giây [..s] hoặc số thứ tự đoạn..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-normal placeholder:text-slate-400 focus:outline-none focus:border-[#4EACAF] focus:ring-2 focus:ring-[#4EACAF]/15 transition-all text-slate-800"
                        />
                        {chunkSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setChunkSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Filter Status Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        <button
                          type="button"
                          onClick={() => setChunkStatusFilter('ALL')}
                          className={cn(
                            "px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 border",
                            chunkStatusFilter === 'ALL'
                              ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100/70"
                          )}
                        >
                          <span>Tất cả</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded-full",
                            chunkStatusFilter === 'ALL' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                          )}>
                            {chunkStats.total}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setChunkStatusFilter('CORRECT')}
                          className={cn(
                            "px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 border",
                            chunkStatusFilter === 'CORRECT'
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50/70"
                          )}
                        >
                          <span>✓ Phát âm đúng</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded-full font-medium",
                            chunkStatusFilter === 'CORRECT' ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                          )}>
                            {chunkStats.correctCount}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setChunkStatusFilter('WRONG')}
                          className={cn(
                            "px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 border",
                            chunkStatusFilter === 'WRONG'
                              ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                              : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50/70"
                          )}
                        >
                          <span>✕ Phát âm sai</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded-full font-medium",
                            chunkStatusFilter === 'WRONG' ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
                          )}>
                            {chunkStats.wrongCount}
                          </span>
                        </button>

                        {chunkStats.silentCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setChunkStatusFilter('SILENT')}
                            className={cn(
                              "px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 border",
                              chunkStatusFilter === 'SILENT'
                                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                                : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50/70"
                            )}
                          >
                            <span>Im lặng / Chưa rõ</span>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.2 rounded-full font-medium",
                              chunkStatusFilter === 'SILENT' ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                            )}>
                              {chunkStats.silentCount}
                            </span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setChunkStatusFilter('ASSESSED')}
                          className={cn(
                            "px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 border",
                            chunkStatusFilter === 'ASSESSED'
                              ? "bg-[#4EACAF] text-white border-[#4EACAF] shadow-xs"
                              : "bg-white text-[#3D8C8F] border-[#4EACAF]/30 hover:bg-[#4EACAF]/10"
                          )}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Đã đánh giá</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded-full font-medium",
                            chunkStatusFilter === 'ASSESSED' ? "bg-white/20 text-white" : "bg-[#4EACAF]/15 text-[#3D8C8F]"
                          )}>
                            {chunkStats.assessedCount}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {loadingChunks ? (
                    <div className="py-12 text-center">
                      <Activity className="w-8 h-8 text-[#4EACAF] animate-spin mx-auto mb-2" />
                      <p className="text-xs font-normal text-slate-500">Đang quét danh sách đoạn âm thanh...</p>
                    </div>
                  ) : chunks.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                      <VolumeX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-normal">Không quét thấy file audio chunk tương ứng trong session này.</p>
                    </div>
                  ) : filteredChunks.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl space-y-2">
                      <Search className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs font-normal text-slate-600">Không tìm thấy đoạn âm thanh nào phù hợp với bộ lọc.</p>
                      <button
                        type="button"
                        onClick={() => { setChunkSearchQuery(''); setChunkStatusFilter('ALL'); }}
                        className="text-xs font-medium text-[#4EACAF] hover:underline cursor-pointer"
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  ) : (
                    <div
                      ref={chunksScrollRef}
                      className="max-h-[580px] overflow-y-auto pr-1.5 p-0.5 space-y-2 overscroll-contain"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {filteredChunks.map((chunk) => {
                        const cIndex = chunk.chunkIndex;
                        const assessment = chunkAssessments[cIndex];
                        const isAssessing = assessingChunkIndex === cIndex;
                        const event = parsedEvents[cIndex];
                        const recognizedTextFromAssessment = assessment?.recognizedText || assessment?.RecognizedText || assessment?.display || assessment?.Display;
                        const isSilentOrUnclear = isSilentOrUnclearSpeech(event?.spokenText) || isSilentOrUnclearSpeech(recognizedTextFromAssessment);

                        return (
                          <div
                            key={cIndex}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-2 space-y-2 transition-all hover:bg-slate-50/80"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 pb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="p-2 bg-[#4EACAF]/10 text-[#4EACAF] rounded-lg">
                                  <FileAudio className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-semibold text-slate-800">
                                  {event
                                    ? `Đoạn âm thanh giây: [${event.timeSeconds}s]`
                                    : `Đoạn âm thanh #${cIndex + 1}`
                                  }
                                </div>
                                {event && event.isCorrect !== undefined && (
                                  <span className={cn(
                                    "text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ml-1",
                                    event.isCorrect
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  )}>
                                    {event.isCorrect ? '✓ Đúng' : '✕ Sai'}
                                  </span>
                                )}
                              </div>

                              {/* Player control button with on-demand loading state */}
                              <button
                                disabled={isSilentOrUnclear || loadingAudioIndex === cIndex}
                                onClick={() => handlePlayChunk(chunk.chunkUrl, cIndex)}
                                title={isSilentOrUnclear ? "Audio không khả dụng do trẻ im lặng hoặc không nghe rõ" : undefined}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-sm border self-start sm:self-auto",
                                  isSilentOrUnclear
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                                    : loadingAudioIndex === cIndex
                                      ? "bg-sky-50 text-sky-600 border-sky-200 cursor-wait"
                                      : playingChunkIndex === cIndex
                                        ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/80 cursor-pointer"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/80 cursor-pointer"
                                )}
                              >
                                {isSilentOrUnclear ? (
                                  <>
                                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Không có ghi âm</span>
                                  </>
                                ) : loadingAudioIndex === cIndex ? (
                                  <>
                                    <Activity className="w-3.5 h-3.5 animate-spin text-sky-600" />
                                    <span>Đang tải audio...</span>
                                  </>
                                ) : playingChunkIndex === cIndex ? (
                                  <>
                                    <Pause className="w-3.5 h-3.5 animate-pulse" />
                                    <span>Đang phát...</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3.5 h-3.5" />
                                    <span>Nghe ghi âm</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Expectation text input & AI assessment trigger */}
                            <div className="space-y-3">
                              {currentRoleView !== 'PARENT' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500">Từ/Câu kỳ vọng:</span>
                                    <input
                                      type="text"
                                      disabled={isSilentOrUnclear}
                                      placeholder="Nhập từ chuẩn bé phải phát âm..."
                                      value={referenceTexts[cIndex] || ''}
                                      onChange={(e) => setReferenceTexts(prev => ({ ...prev, [cIndex]: e.target.value }))}
                                      className={cn(
                                        "flex-1 px-3 py-1.5 rounded-lg border outline-none text-xs font-normal placeholder-slate-400 transition-all",
                                        isSilentOrUnclear
                                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-75"
                                          : "bg-white border-slate-200 focus:border-[#4EACAF]"
                                      )}
                                    />
                                    <button
                                      type="button"
                                      disabled={isAssessing || isSilentOrUnclear}
                                      onClick={() => handleAssessChunk(cIndex)}
                                      title={isSilentOrUnclear ? "Không hỗ trợ AI đánh giá khi trẻ im lặng hoặc không nghe rõ" : undefined}
                                      className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 shrink-0",
                                        isSilentOrUnclear
                                          ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-70"
                                          : "bg-[#4EACAF] hover:bg-[#3D8C8F] disabled:bg-slate-350 text-white cursor-pointer"
                                      )}
                                    >
                                      {isAssessing ? (
                                        <Activity className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Sparkles className="w-3.5 h-3.5" />
                                      )}
                                      AI Đánh giá
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isSilentOrUnclear}
                                      onClick={() => handleOpenManualScore(cIndex)}
                                      title={isSilentOrUnclear ? "Không thể nhập điểm khi trẻ im lặng hoặc không nghe rõ" : "Giáo viên nhập / điều chỉnh 4 thông số điểm"}
                                      className={cn(
                                        "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 border shadow-sm",
                                        isSilentOrUnclear
                                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 shadow-none"
                                          : "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800 cursor-pointer hover:shadow"
                                      )}
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                      Nhập điểm
                                    </button>
                                  </div>
                                  {event && event.spokenText && (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="font-medium text-slate-500">Trẻ thực tế nói:</span>
                                        <span className={cn(
                                          "font-medium italic px-2.5 py-0.5 rounded-lg border",
                                          isSilentOrUnclear
                                            ? "bg-amber-50 text-amber-800 border-amber-200"
                                            : event.isCorrect ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                                        )}>
                                          "{isSilentOrUnclear ? (event.spokenText || '[Không nghe rõ/ Im lặng]') : (assessment?.recognizedText || assessment?.RecognizedText || assessment?.display || assessment?.Display || event.spokenText)}"
                                        </span>
                                      </div>
                                      {isSilentOrUnclear && (
                                        <p className="text-[11px] font-normal text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1.5 mt-1">
                                          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                          <span>Trẻ im lặng hoặc phát âm không nghe rõ: Hệ thống không ghi nhận được file âm thanh để phát lại và AI không có dữ liệu đầu vào để thẩm âm.</span>
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {referenceTexts[cIndex] && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-slate-500">Từ/Câu kỳ vọng:</span>
                                      <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
                                        "{referenceTexts[cIndex]}"
                                      </span>
                                    </div>
                                  )}
                                  {event && event.spokenText && (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="font-medium text-slate-500">Trẻ thực tế nói:</span>
                                        <span className={cn(
                                          "font-medium italic px-3 py-1 rounded-xl border",
                                          isSilentOrUnclear
                                            ? "bg-amber-50 text-amber-800 border-amber-200"
                                            : event.isCorrect ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                                        )}>
                                          "{isSilentOrUnclear ? (event.spokenText || '[Không nghe rõ/ Im lặng]') : (assessment?.recognizedText || assessment?.RecognizedText || assessment?.display || assessment?.Display || event.spokenText)}"
                                        </span>
                                      </div>
                                      {isSilentOrUnclear && (
                                        <p className="text-[11px] font-normal text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1.5 mt-1">
                                          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                          <span>Trẻ im lặng hoặc không nghe rõ: Không có audio ghi âm & Đánh giá AI.</span>
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Assessment scores presentation layout */}
                              {assessment && (() => {
                                const accuracyVal = assessment.accuracyScore ??
                                  assessment.AccuracyScore ??
                                  assessment.pronunciationAssessment?.accuracyScore ??
                                  assessment.PronunciationAssessment?.AccuracyScore ?? 0;

                                const pronVal = assessment.pronunciationScore ??
                                  assessment.PronunciationScore ??
                                  assessment.pronScore ??
                                  assessment.PronScore ??
                                  assessment.pronunciationAssessment?.pronunciationScore ??
                                  assessment.PronunciationAssessment?.PronScore ??
                                  assessment.PronunciationAssessment?.PronunciationScore ?? 0;

                                const fluencyVal = assessment.fluencyScore ??
                                  assessment.FluencyScore ??
                                  assessment.pronunciationAssessment?.fluencyScore ??
                                  assessment.PronunciationAssessment?.FluencyScore ?? 0;

                                const completenessVal = assessment.completenessScore ??
                                  assessment.CompletenessScore ??
                                  assessment.pronunciationAssessment?.completenessScore ??
                                  assessment.PronunciationAssessment?.CompletenessScore ?? 0;

                                return (
                                  <div className="p-2 bg-white border border-slate-200/85 rounded-lg space-y-2 animate-in fade-in duration-300">
                                    {currentRoleView !== 'PARENT' && (
                                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                          <Activity className="w-3.5 h-3.5 text-[#4EACAF]" />
                                          4 Thông số đánh giá:
                                        </span>
                                        <button
                                          type="button"
                                          disabled={isSilentOrUnclear}
                                          onClick={() => handleOpenManualScore(cIndex)}
                                          title={isSilentOrUnclear ? "Không thể chỉnh sửa thông số khi trẻ im lặng hoặc không nghe rõ" : undefined}
                                          className={cn(
                                            "text-xs font-medium border px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all shadow-sm",
                                            isSilentOrUnclear
                                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 shadow-none"
                                              : "text-[#4EACAF] hover:text-[#388285] bg-[#4EACAF]/10 hover:bg-[#4EACAF]/20 border-[#4EACAF]/25 cursor-pointer"
                                          )}
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                          Chỉnh sửa 4 thông số
                                        </button>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                                      <div
                                        onClick={currentRoleView !== 'PARENT' && !isSilentOrUnclear ? () => handleOpenManualScore(cIndex) : undefined}
                                        className={cn(
                                          "p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50 transition-all",
                                          currentRoleView !== 'PARENT' && !isSilentOrUnclear && "cursor-pointer hover:border-emerald-300 hover:shadow-sm",
                                          isSilentOrUnclear && "opacity-75 cursor-not-allowed"
                                        )}
                                        title={currentRoleView !== 'PARENT' && !isSilentOrUnclear ? "Nhấp để giáo viên điều chỉnh 4 thông số" : undefined}
                                      >
                                        <div className="text-xs font-medium text-slate-500">Độ chính xác</div>
                                        <div className="text-sm font-semibold text-emerald-600 mt-0.5">
                                          {accuracyVal}%
                                        </div>
                                      </div>
                                      <div
                                        onClick={currentRoleView !== 'PARENT' && !isSilentOrUnclear ? () => handleOpenManualScore(cIndex) : undefined}
                                        className={cn(
                                          "p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/50 transition-all",
                                          currentRoleView !== 'PARENT' && !isSilentOrUnclear && "cursor-pointer hover:border-indigo-300 hover:shadow-sm",
                                          isSilentOrUnclear && "opacity-75 cursor-not-allowed"
                                        )}
                                        title={currentRoleView !== 'PARENT' && !isSilentOrUnclear ? "Nhấp để giáo viên điều chỉnh 4 thông số" : undefined}
                                      >
                                        <div className="text-xs font-medium text-slate-500">Phát âm</div>
                                        <div className="text-sm font-semibold text-indigo-600 mt-0.5">
                                          {pronVal}%
                                        </div>
                                      </div>
                                      <div
                                        onClick={currentRoleView !== 'PARENT' && !isSilentOrUnclear ? () => handleOpenManualScore(cIndex) : undefined}
                                        className={cn(
                                          "p-2 bg-purple-50/50 rounded-lg border border-purple-100/50 transition-all",
                                          currentRoleView !== 'PARENT' && !isSilentOrUnclear && "cursor-pointer hover:border-purple-300 hover:shadow-sm",
                                          isSilentOrUnclear && "opacity-75 cursor-not-allowed"
                                        )}
                                        title={currentRoleView !== 'PARENT' && !isSilentOrUnclear ? "Nhấp để giáo viên điều chỉnh 4 thông số" : undefined}
                                      >
                                        <div className="text-xs font-medium text-slate-500">Trôi chảy</div>
                                        <div className="text-sm font-semibold text-purple-600 mt-0.5">
                                          {fluencyVal}%
                                        </div>
                                      </div>
                                      <div
                                        onClick={currentRoleView !== 'PARENT' && !isSilentOrUnclear ? () => handleOpenManualScore(cIndex) : undefined}
                                        className={cn(
                                          "p-2 bg-teal-50/50 rounded-lg border border-teal-100/50 transition-all",
                                          currentRoleView !== 'PARENT' && !isSilentOrUnclear && "cursor-pointer hover:border-teal-300 hover:shadow-sm",
                                          isSilentOrUnclear && "opacity-75 cursor-not-allowed"
                                        )}
                                        title={currentRoleView !== 'PARENT' && !isSilentOrUnclear ? "Nhấp để giáo viên điều chỉnh 4 thông số" : undefined}
                                      >
                                        <div className="text-xs font-medium text-slate-500">Hoàn thành</div>
                                        <div className="text-sm font-semibold text-teal-600 mt-0.5">
                                          {completenessVal}%
                                        </div>
                                      </div>
                                    </div>

                                    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-start gap-x-8 gap-y-3">
                                      {/* Chi tiết phát âm cụm từ của AI */}
                                      <div className="space-y-1.5">
                                        <div className="text-xs font-medium text-slate-400">Chi tiết phát âm cụm từ của AI:</div>
                                        <div className="flex flex-wrap gap-2">
                                          {(assessment.words || assessment.Words || []).map((wObj: any, wIdx: number) => {
                                            const wordText = wObj.word || wObj.Word;
                                            const score = wObj.accuracyScore ??
                                              wObj.AccuracyScore ??
                                              wObj.pronunciationAssessment?.accuracyScore ??
                                              wObj.PronunciationAssessment?.AccuracyScore ??
                                              accuracyVal;
                                            const isCorrect = score >= 80;
                                            const isMedium = score >= 50 && score < 80;

                                            return (
                                              <div
                                                key={wIdx}
                                                className={cn(
                                                  "px-2.5 py-1 rounded-lg border font-medium text-xs flex items-center gap-1.5 shadow-sm",
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

                                      {/* Lỗi phát âm nằm ngang hàng bên phải */}
                                      {(() => {
                                        const speechCat =
                                          assessment?.speechErrorCategory ||
                                          assessment?.SpeechErrorCategory ||
                                          chunkAssessments[cIndex]?.speechErrorCategory ||
                                          chunkAssessments[cIndex]?.SpeechErrorCategory ||
                                          'Thay thế âm';

                                        const isParent =
                                          currentRoleView === 'PARENT' ||
                                          (typeof window !== 'undefined' &&
                                            (window.location.hash.includes('/parent') ||
                                              window.location.pathname.includes('/parent')));

                                        return (
                                          <div className="space-y-1.5 shrink-0">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block" />
                                              <span>Lỗi phát âm:</span>
                                            </div>
                                            {isParent ? (
                                              <div className="flex items-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-amber-200/80 bg-amber-50 text-amber-800 font-semibold text-xs shadow-xs">
                                                  {speechCat}
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="min-w-[190px]">
                                                <SpeechErrorCategoryDropdown
                                                  value={speechCat}
                                                  disabled={isSilentOrUnclear}
                                                  onChange={(val) => handleDirectCategoryChange(cIndex, val)}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* End of chunksSectionRef */}
              </div>
              {/* End of scrollable details container */}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-[#4EACAF] mb-3">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-slate-700">Chưa có lượt luyện tập nào được chọn</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                Vui lòng click chọn một lượt luyện tập ở danh sách bên trái để xem các file âm thanh ghi âm cụ thể của bé và thực hiện đánh giá phát âm AI.
              </p>
            </div>
          )}
        </div>

      </div>
      {/* Manual Scoring Modal */}
      <AnimatePresence>
        {scoringChunkIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 rounded-t-3xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#4EACAF]/10 text-[#4EACAF] rounded-xl">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Chấm điểm đoạn #{scoringChunkIndex + 1}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Từ kỳ vọng: <span className="font-semibold text-[#4EACAF]">"{referenceTexts[scoringChunkIndex] || parsedEvents[scoringChunkIndex]?.text || 'N/A'}"</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setScoringChunkIndex(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Accuracy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Độ chính xác
                    </span>
                    <span className="text-emerald-600 font-semibold text-sm">{manualScores.accuracy}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={manualScores.accuracy}
                      onChange={(e) => setManualScores(prev => ({ ...prev, accuracy: Number(e.target.value) }))}
                      className="flex-1 accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualScores.accuracy}
                      onChange={(e) => setManualScores(prev => ({ ...prev, accuracy: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                      className="w-16 px-2 py-1 text-xs font-medium text-center border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Pronunciation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      Phát âm
                    </span>
                    <span className="text-indigo-600 font-semibold text-sm">{manualScores.pronunciation}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={manualScores.pronunciation}
                      onChange={(e) => setManualScores(prev => ({ ...prev, pronunciation: Number(e.target.value) }))}
                      className="flex-1 accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualScores.pronunciation}
                      onChange={(e) => setManualScores(prev => ({ ...prev, pronunciation: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                      className="w-16 px-2 py-1 text-xs font-medium text-center border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Fluency */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      Trôi chảy
                    </span>
                    <span className="text-purple-600 font-semibold text-sm">{manualScores.fluency}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={manualScores.fluency}
                      onChange={(e) => setManualScores(prev => ({ ...prev, fluency: Number(e.target.value) }))}
                      className="flex-1 accent-purple-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualScores.fluency}
                      onChange={(e) => setManualScores(prev => ({ ...prev, fluency: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                      className="w-16 px-2 py-1 text-xs font-medium text-center border border-slate-200 rounded-lg focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* Completeness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                      Hoàn thành
                    </span>
                    <span className="text-teal-600 font-semibold text-sm">{manualScores.completeness}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={manualScores.completeness}
                      onChange={(e) => setManualScores(prev => ({ ...prev, completeness: Number(e.target.value) }))}
                      className="flex-1 accent-teal-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualScores.completeness}
                      onChange={(e) => setManualScores(prev => ({ ...prev, completeness: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                      className="w-16 px-2 py-1 text-xs font-medium text-center border border-slate-200 rounded-lg focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>

                {/* Speech Error Category */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Lỗi phát âm
                    </span>
                  </div>
                  <SpeechErrorCategoryDropdown
                    value={manualScores.speechErrorCategory}
                    onChange={(val) => setManualScores(prev => ({ ...prev, speechErrorCategory: val }))}
                  />
                </div>

                {/* Presets */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Mức gợi ý nhanh:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setManualScores(prev => ({ ...prev, accuracy: 100, pronunciation: 100, fluency: 100, completeness: 100 }))}
                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualScores(prev => ({ ...prev, accuracy: 90, pronunciation: 90, fluency: 85, completeness: 100 }))}
                      className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      90%
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualScores(prev => ({ ...prev, accuracy: 75, pronunciation: 70, fluency: 70, completeness: 80 }))}
                      className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualScores(prev => ({ ...prev, accuracy: 50, pronunciation: 50, fluency: 40, completeness: 50 }))}
                      className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      50%
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50/80 border-t border-slate-100 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setScoringChunkIndex(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isSavingManualScore}
                  onClick={handleSaveManualScore}
                  className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-[#4EACAF] hover:bg-[#3D8C8F] transition-all flex items-center gap-1.5 shadow-md shadow-[#4EACAF]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingManualScore ? (
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  Lưu điểm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
