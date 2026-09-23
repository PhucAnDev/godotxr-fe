import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import {
  TrendingUp,
  Search,
  X,
  SlidersHorizontal,
  Info,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Award,
  Clock,
  Smile,
  ShieldAlert,
  Download,
  Calendar,
  ListRestart,
  Eye,
  ChevronDown,
  BrainCircuit,
  ExternalLink,
  Zap,
  Target,
  Sparkles,
  Heart,
  Baby,
  User,
  Activity,
  History,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Mic,
  Volume2,
  BookOpen,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { cn, resolveAvatarUrl, formatVietnamDateTime } from '../../lib/utils';
import CustomSelect from '../../components/common/CustomSelect';
import ActionButton from '../../components/common/ActionButton';
import { getSessionUser } from '../../lib/authSession';
import { getMyChildProfiles, getChildProfiles, getMyStudents } from '../../services/childProfileService';
import { getAnalyzesByChildId, getAnalyzes } from '../../services/analyzeService';
import { getResultsByChild, type ResultResponse } from '../../services/resultService';
import { getLessons } from '../../services/lessonService';
import { getSemesters, type SemesterResponse } from '../../services/semesterService';
import { getSpeechAccuracyByChild, type ChildSpeechAccuracyResponse } from '../../services/childSpeechAccuracyService';
import type { ChildProfileResponse } from '../../services/childProfileService';
import type { AnalyzeResponse } from '../../services/analyzeService';
import type { LessonResponse } from '../../services/lessonService';
import {
  parseInteractionLog,
  cleanSpeechText,
  isSilentOrUnclearSpeech
} from './LearningResultManagement';

export interface AnalyzedVocabularyItem {
  word: string;
  lessonId: number | null;
  lessonName: string;
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  accuracyRate: number;
  avgSpeechScore?: number;
  masteryStatus: 'MASTERED' | 'PRACTICING' | 'NEEDS_HELP' | 'NOT_PRACTICED';
  lastPracticed: string;
  correctExamples: Array<{ spokenText: string; timeSeconds: number; dateStr?: string }>;
  wrongExamples: Array<{ spokenText: string; timeSeconds: number; dateStr?: string; errorType?: string; speechErrorCategory?: string }>;
  speechErrorCategory?: string;
  speechErrorCategories?: string[];
  speechErrorCategoryCounts?: Record<string, number>;
  allTimeAttempts: number;
  allTimeAccuracyRate: number;
  allTimeMasteryStatus: 'MASTERED' | 'PRACTICING' | 'NEEDS_HELP';
  allTimeLastPracticed: string;
  hasTimeframeData: boolean;
}


// DB Interfaces according to project specification
interface Child {
  ChildId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Status: 'Active' | 'Inactive';
  Avatar?: string;
}

interface Analysis {
  AnalysisId: string;
  ChildId: string;
  TotalExercises: number;
  CompletedExercises: number;
  TotalPracticeTime: number; // in minutes
  AverageScore: number;
  ProgressLevel: 'Improving' | 'Stable' | 'Need Support';
  Strengths: string;
  Weaknesses: string;
  Recommendation: string;
  LastAnalyzedAt: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface LessonProgress {
  lessonId: string;
  lessonName: string;
  totalAttempts: number;
  firstAttempt: {
    score: number;
    maxScore: number;
    durationSeconds: number;
    correctCount: number;
    errorCount: number;
    date: string;
  };
  latestAttempt: {
    score: number;
    maxScore: number;
    durationSeconds: number;
    correctCount: number;
    errorCount: number;
    date: string;
  };
  metrics: {
    scoreDiff: number;
    durationDiff: number;
    correctDiff: number;
    errorDiff: number;
  };
  status: 'improving' | 'speed_up' | 'accuracy_up' | 'stable' | 'needs_practice';
  description: string;
}

interface ProgressAnalysisCache {
  roleView: string;
  analyses: Analysis[];
  children: Child[];
  allResultsMap: Map<number, ResultResponse[]>;
  speechAccuraciesMap: Map<number, ChildSpeechAccuracyResponse[]>;
  allLessons: LessonResponse[];
  dbSemesters: SemesterResponse[];
  timestamp: number;
}
let memoryProgressCache: ProgressAnalysisCache | null = null;

export default function ProgressAnalysis() {
  const currentUser = getSessionUser();
  const actualRole = currentUser?.Role || 'PARENT';
  const storedRoleView = (localStorage.getItem('user_role') as 'ADMIN' | 'TEACHER' | 'PARENT') || actualRole;
  const hasFreshProgressCache = Boolean(
    memoryProgressCache && memoryProgressCache.roleView === storedRoleView
  );

  // Database datasets state
  const [analyses, setAnalyses] = useState<Analysis[]>(() =>
    hasFreshProgressCache && memoryProgressCache ? memoryProgressCache.analyses : []
  );
  const [children, setChildren] = useState<Child[]>(() =>
    hasFreshProgressCache && memoryProgressCache ? memoryProgressCache.children : []
  );
  const [isLoading, setIsLoading] = useState<boolean>(() => !hasFreshProgressCache);

  // Maps for chart aggregation
  const [allResultsMap, setAllResultsMap] = useState<Map<number, ResultResponse[]>>(() =>
    hasFreshProgressCache && memoryProgressCache ? memoryProgressCache.allResultsMap : new Map()
  );
  const [speechAccuraciesMap, setSpeechAccuraciesMap] = useState<Map<number, ChildSpeechAccuracyResponse[]>>(() =>
    hasFreshProgressCache && memoryProgressCache ? memoryProgressCache.speechAccuraciesMap : new Map()
  );
  const [allLessons, setAllLessons] = useState<LessonResponse[]>(() =>
    hasFreshProgressCache && memoryProgressCache ? memoryProgressCache.allLessons : []
  );
  const [dbSemesters, setDbSemesters] = useState<SemesterResponse[]>(() =>
    hasFreshProgressCache && memoryProgressCache ? memoryProgressCache.dbSemesters : []
  );

  // Selector state
  const [selectedChildId, setSelectedChildId] = useState<string>('ALL');

  // Speech Accuracy Specific Filter States
  const [speechSelectedLessonId, setSpeechSelectedLessonId] = useState<string>('ALL');
  const [speechTimeframe, setSpeechTimeframe] = useState<'week' | 'month' | 'semester'>('week');
  const [speechSemester, setSpeechSemester] = useState<string>('HK1');
  const [speechMonth, setSpeechMonth] = useState<number>(new Date().getMonth());
  const [speechYear, setSpeechYear] = useState<number>(new Date().getFullYear());

  // Vocabulary & Spoken Word Analysis filter & search states
  const [vocabSearchQuery, setVocabSearchQuery] = useState('');
  const [vocabStatusFilter, setVocabStatusFilter] = useState<'ALL' | 'MASTERED' | 'PRACTICING' | 'NEEDS_HELP'>('ALL');
  const [vocabSortBy, setVocabSortBy] = useState<'MOST_PRACTICED' | 'HIGHEST_ACCURACY' | 'LOWEST_ACCURACY' | 'RECENT'>('MOST_PRACTICED');
  const [vocabTimeScope, setVocabTimeScope] = useState<'ALL_TIME' | 'FILTERED'>('ALL_TIME');

  // Search & Filter table parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgressLevel, setFilterProgressLevel] = useState<string>('ALL');

  // Sorting states
  const [sortColumn, setSortColumn] = useState<keyof Analysis | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (column: keyof Analysis) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Role Switch Simulator - Admin, Teacher, Parent
  const [currentRoleView, setCurrentRoleView] = useState<'ADMIN' | 'TEACHER' | 'PARENT'>(storedRoleView);

  // Modal display control
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Status visual notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper selectors
  const getChildDetails = (id: string): Child => {
    return children.find(c => c.ChildId === id) || {
      ChildId: id,
      FullName: 'Bé',
      Age: 5,
      Gender: 'Other',
      LearningLevel: 'Cơ bản',
      Status: 'Active'
    };
  };

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return '';
    return formatVietnamDateTime(dateStr, true);
  };

  const [loadingProgressDetails, setLoadingProgressDetails] = useState(false);
  const [lessonProgressList, setLessonProgressList] = useState<LessonProgress[]>([]);

  async function loadAllPages<T>(
    apiMethod: (page: number, size: number) => Promise<any>
  ): Promise<T[]> {
    let page = 1;
    let allItems: T[] = [];
    let hasMore = true;
    const pageSize = 100;

    while (hasMore) {
      const res = await apiMethod(page, pageSize);
      if (res.success && res.data) {
        const items = res.data.items || [];
        allItems = [...allItems, ...items];
        hasMore = items.length === pageSize && page < 10;
        page++;
      } else {
        hasMore = false;
      }
    }
    return allItems;
  }

  function computeLessonProgress(results: any[], lessons: any[]): LessonProgress[] {
    const grouped: Record<string, any[]> = {};
    results.forEach(res => {
      if (!res.lessonId) return;
      const lId = String(res.lessonId);
      if (!grouped[lId]) grouped[lId] = [];
      grouped[lId].push(res);
    });

    const progressList: LessonProgress[] = [];

    Object.entries(grouped).forEach(([lId, attempts]) => {
      const sorted = [...attempts].sort((a, b) => {
        const aTime = a.startedAt || a.completedAt || '';
        const bTime = b.startedAt || b.completedAt || '';
        return aTime.localeCompare(bTime);
      });

      if (sorted.length < 2) return;

      const first = sorted[0];
      const latest = sorted[sorted.length - 1];

      const lessonObj = lessons.find(l => String(l.id) === lId);
      const lessonName = lessonObj?.lessonName || first.lessonName || latest.lessonName || 'Bài tập tự do';
      const maxScore = lessonObj?.maxScore || 95;

      const firstScore = first.score ?? 0;
      const latestScore = latest.score ?? 0;
      const firstDuration = first.durationSeconds ?? 0;
      const latestDuration = latest.durationSeconds ?? 0;
      const firstCorrect = first.correctCount ?? 0;
      const latestCorrect = latest.correctCount ?? 0;
      const firstError = first.errorCount ?? 0;
      const latestError = latest.errorCount ?? 0;

      const scoreDiff = latestScore - firstScore;
      const durationDiff = firstDuration - latestDuration; // positive = faster
      const correctDiff = latestCorrect - firstCorrect;
      const errorDiff = firstError - latestError; // positive = fewer errors

      let status: LessonProgress['status'] = 'stable';
      let description = '';

      const scorePctDiff = maxScore > 0 ? (scoreDiff / maxScore) * 100 : 0;
      const durationPctDiff = firstDuration > 0 ? (durationDiff / firstDuration) * 100 : 0;

      if (scorePctDiff >= 15 && durationPctDiff >= 10) {
        status = 'improving';
        description = `Bé tiến bộ vượt bậc! Vừa tăng chính xác phát âm (+${scoreDiff} điểm), vừa phản xạ nhanh hơn (+${durationDiff} giây).`;
      } else if (scoreDiff > 0 || errorDiff > 0) {
        status = 'accuracy_up';
        description = `Bé cải thiện rõ rệt về độ chính xác phát âm. Điểm số tăng (+${scoreDiff} điểm) và giảm số lỗi phát âm sai.`;
      } else if (durationPctDiff >= 15 && scoreDiff >= 0) {
        status = 'speed_up';
        description = `Bé phản xạ nhanh nhạy hơn hẳn! Rút ngắn thời gian làm bài đến ${durationDiff} giây mà vẫn giữ vững độ chính xác.`;
      } else if (scoreDiff < -10 || errorDiff < -3) {
        status = 'needs_practice';
        description = `Bé có dấu hiệu phát âm sai nhiều hơn hoặc giảm điểm số so với lần đầu. Cần ôn tập và hướng dẫn kỹ lưỡng hơn.`;
      } else {
        status = 'stable';
        description = `Bé duy trì năng lực ổn định ở bài học này qua các lần thực hành.`;
      }

      progressList.push({
        lessonId: lId,
        lessonName,
        totalAttempts: sorted.length,
        firstAttempt: {
          score: firstScore,
          maxScore,
          durationSeconds: firstDuration,
          correctCount: firstCorrect,
          errorCount: firstError,
          date: formatDateStr(first.completedAt || first.startedAt || ''),
        },
        latestAttempt: {
          score: latestScore,
          maxScore,
          durationSeconds: latestDuration,
          correctCount: latestCorrect,
          errorCount: latestError,
          date: formatDateStr(latest.completedAt || latest.startedAt || ''),
        },
        metrics: {
          scoreDiff,
          durationDiff,
          correctDiff,
          errorDiff,
        },
        status,
        description,
      });
    });

    return progressList;
  }

  useEffect(() => {
    if (!selectedAnalysis) {
      setLessonProgressList([]);
      return;
    }

    const childId = Number(selectedAnalysis.ChildId);
    const existingResults = allResultsMap.get(childId);

    // Instant computation if child results and lessons already cached in memory
    if (existingResults && existingResults.length > 0 && allLessons.length > 0) {
      const progress = computeLessonProgress(existingResults, allLessons);
      setLessonProgressList(progress);
      return;
    }

    let isMounted = true;
    async function loadProgressDetails() {
      setLoadingProgressDetails(true);
      try {
        const [resultsRes, lessonsRes] = await Promise.all([
          existingResults
            ? Promise.resolve({ success: true, data: existingResults })
            : getResultsByChild(childId),
          allLessons.length > 0
            ? Promise.resolve({ success: true, data: { items: allLessons } })
            : getLessons(1, 100).catch(() => ({ success: false, data: { items: [] as LessonResponse[] } }))
        ]);

        if (!isMounted) return;

        if (resultsRes.success && resultsRes.data) {
          const lessonsList = (lessonsRes.success && (lessonsRes as any).data?.items) ? (lessonsRes as any).data.items : allLessons;
          const progress = computeLessonProgress(resultsRes.data, lessonsList);
          setLessonProgressList(progress);
        }
      } catch (err) {
        console.error("Error loading progress details:", err);
      } finally {
        if (isMounted) setLoadingProgressDetails(false);
      }
    }

    void loadProgressDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedAnalysis, allResultsMap, allLessons]);

  const loadData = async () => {
    // If fresh cache exists, perform silent background update without full page loader
    if (!memoryProgressCache || memoryProgressCache.roleView !== currentRoleView) {
      setIsLoading(true);
    }
    try {
      let fetchedChildren: ChildProfileResponse[] = [];

      // 0. Fetch lessons & semesters list from API in 1 parallel round-trip
      const [lessonsRes, semestersRes] = await Promise.all([
        getLessons(1, 100).catch(() => ({ success: false, data: { items: [] as LessonResponse[] } })),
        getSemesters(1, 100).catch(() => ({ success: false, data: { items: [] as SemesterResponse[] } })),
      ]);
      const lessonsData = (lessonsRes.success && lessonsRes.data?.items) ? lessonsRes.data.items : [];
      const semestersData = (semestersRes.success && semestersRes.data?.items) ? semestersRes.data.items : [];
      setAllLessons(lessonsData);
      setDbSemesters(semestersData);

      // 1. Fetch children based on role view
      if (currentRoleView === 'PARENT') {
        const res = await getMyChildProfiles();
        if (res.success && res.data) {
          fetchedChildren = res.data;
        }
      } else if (currentRoleView === 'TEACHER') {
        const res = await getMyStudents(1, 100);
        if (res.success && res.data?.items && res.data.items.length > 0) {
          fetchedChildren = res.data.items;
        } else {
          const fallbackRes = await getChildProfiles(1, 100);
          fetchedChildren = fallbackRes.data?.items || [];
        }
      } else {
        const res = await getChildProfiles(1, 100);
        fetchedChildren = res.data?.items || [];
      }

      // Map to Child state format
      const mappedChildren: Child[] = fetchedChildren.map(c => ({
        ChildId: String(c.id),
        FullName: c.fullName,
        Age: c.age,
        Gender: c.gender,
        LearningLevel: c.learningLevel === 'Beginner' ? 'Bậc 1 - Sơ cấp VR' : c.learningLevel === 'Intermediate' ? 'Bậc 2 - Trung cấp VR' : 'Bậc 3 - Nâng cao VR',
        Status: c.status,
        Avatar: (c as any).avatar || (c as any).Avatar
      }));
      setChildren(mappedChildren);

      // 2. Fetch analyses safely based on role
      let allAnalyses: AnalyzeResponse[] = [];
      if (currentRoleView === 'PARENT') {
        if (fetchedChildren.length > 0) {
          const promises = fetchedChildren.map(c => getAnalyzesByChildId(c.id));
          const resList = await Promise.all(promises);
          resList.forEach(res => {
            if (res.success && res.data) {
              allAnalyses = [...allAnalyses, ...res.data];
            }
          });
        }
      } else {
        // Admin / Teacher: use getAnalyzes() paged endpoint to get all analyses in system
        let page = 1;
        let hasMore = true;
        while (hasMore) {
          const res = await getAnalyzes(page, 100);
          if (res.success && res.data?.items) {
            allAnalyses = [...allAnalyses, ...res.data.items];
            hasMore = res.data.items.length === 100 && page < 10;
            page++;
          } else {
            hasMore = false;
          }
        }
      }

      // 3. Fetch VR results per child using getResultsByChild (/api/results/by-child/{childId})
      const resultsMap = new Map<number, ResultResponse[]>();
      if (fetchedChildren.length > 0) {
        const resultPromises = fetchedChildren.map(async (c) => {
          const res = await getResultsByChild(c.id);
          if (res.success && res.data) {
            resultsMap.set(c.id, res.data);
          }
        });
        await Promise.all(resultPromises);
      }
      setAllResultsMap(resultsMap);

      // 4. Fetch ChildSpeechAccuracies per child using getSpeechAccuracyByChild
      const speechMap = new Map<number, ChildSpeechAccuracyResponse[]>();
      if (fetchedChildren.length > 0) {
        const speechPromises = fetchedChildren.map(async (c) => {
          const res = await getSpeechAccuracyByChild(c.id);
          if (res.success && res.data) {
            speechMap.set(c.id, res.data);
          }
        });
        await Promise.all(speechPromises);
      }
      setSpeechAccuraciesMap(speechMap);

      // Map to Analysis state format 100% strictly computed from VR Results API (/api/results/by-child/{childId})
      const mappedAnalyses: Analysis[] = fetchedChildren.map(c => {
        const analyzeObj = allAnalyses.find(a => a.childId === c.id);
        const childResults = resultsMap.get(c.id) || [];
        const totalEx = childResults.length;
        const completedEx = childResults.filter(
          r => r.completionStatus === 'Completed' || (r.score !== undefined && r.score >= 50)
        ).length;
        const totalDurationSec = childResults.reduce((sum, r) => sum + (r.durationSeconds || 0), 0);
        const totalPracticeMin = Math.round(totalDurationSec / 60);

        // STRICT COMPUTATION ONLY FROM VR RESULTS API:
        const avgScore = totalEx > 0
          ? Math.round(childResults.reduce((sum, r) => sum + (r.score || 0), 0) / totalEx)
          : 0;

        const progressLevel: Analysis['ProgressLevel'] =
          totalEx === 0 ? 'Need Support' :
            avgScore >= 75 ? 'Improving' :
              avgScore >= 50 ? 'Stable' : 'Need Support';

        return {
          AnalysisId: analyzeObj ? String(analyzeObj.id) : String(c.id),
          ChildId: String(c.id),
          TotalExercises: totalEx,
          CompletedExercises: completedEx,
          TotalPracticeTime: totalPracticeMin,
          AverageScore: avgScore,
          ProgressLevel: progressLevel,
          Strengths: analyzeObj?.strengths || 'Chưa ghi nhận điểm mạnh cụ thể.',
          Weaknesses: analyzeObj?.weaknesses || 'Chưa ghi nhận điểm yếu cụ thể.',
          Recommendation: analyzeObj?.recommendation || 'Tiếp tục luyện tập các bài học VR hàng ngày.',
          LastAnalyzedAt: analyzeObj ? formatDateStr(analyzeObj.assessmentDate) : (childResults.length > 0 && childResults[0].completedAt ? formatDateStr(childResults[0].completedAt) : 'Chưa kiểm định'),
          CreatedAt: analyzeObj?.createdAt || '',
          UpdatedAt: analyzeObj?.updatedAt || analyzeObj?.createdAt || ''
        };
      });
      setAnalyses(mappedAnalyses);

      // Save to in-memory SWR cache for 0ms instant reload
      memoryProgressCache = {
        roleView: currentRoleView,
        analyses: mappedAnalyses,
        children: mappedChildren,
        allResultsMap: resultsMap,
        speechAccuraciesMap: speechMap,
        allLessons: lessonsData,
        dbSemesters: semestersData,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error loading Progress Analysis data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [currentRoleView]);

  // ROLE-BASED FILTERING FOR STUDENTS
  const getRoleFilteredChildren = useMemo(() => {
    return children;
  }, [children]);

  // Handle auto updates when role view swaps out of scope child
  useEffect(() => {
    const isAvailable = getRoleFilteredChildren.some(c => c.ChildId === selectedChildId);
    if (!isAvailable && selectedChildId !== 'ALL') {
      setSelectedChildId('ALL');
    }
  }, [getRoleFilteredChildren, selectedChildId]);

  // DYNAMIC COMPUTATIONS FOR ACTIVE WORKSPACE
  // Filtered list of analysis rows to feed the table
  const filteredAnalysesList = useMemo(() => {
    return analyses.filter(item => {
      // Ẩn hoàn toàn các trẻ chưa có dữ liệu bài tập VR nào (TotalExercises === 0)
      if (item.TotalExercises === 0) return false;

      const kid = getChildDetails(item.ChildId);

      // Filter by role scope first
      const isAvailableInRole = getRoleFilteredChildren.some(c => c.ChildId === item.ChildId);
      if (!isAvailableInRole) return false;

      // Filter by dropdown selected Child
      if (selectedChildId !== 'ALL' && item.ChildId !== selectedChildId) return false;

      // Filter by progress level
      if (filterProgressLevel !== 'ALL' && item.ProgressLevel !== filterProgressLevel) return false;

      // Filter by textual keyword query
      const matchCriteria = `${item.AnalysisId} ${kid.FullName} ${item.Strengths} ${item.Weaknesses} ${item.ProgressLevel}`.toLowerCase();
      if (searchQuery && !matchCriteria.includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  }, [analyses, selectedChildId, filterProgressLevel, searchQuery, getRoleFilteredChildren]);

  const sortedAnalysesList = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredAnalysesList;
    return [...filteredAnalysesList].sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];

      if (sortColumn === 'ChildId') {
        valA = getChildDetails(a.ChildId).FullName;
        valB = getChildDetails(b.ChildId).FullName;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB, 'vi-VN', { numeric: true })
          : valB.localeCompare(valA, 'vi-VN', { numeric: true });
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredAnalysesList, sortColumn, sortDirection]);

  // Aggregate stats derived from filtered elements (100% from VR API)
  const metrics = useMemo(() => {
    const subset = analyses.filter(item => {
      const inRole = getRoleFilteredChildren.some(c => c.ChildId === item.ChildId);
      if (!inRole) return false;
      if (selectedChildId !== 'ALL' && item.ChildId !== selectedChildId) return false;
      return true;
    });

    if (subset.length === 0) {
      return {
        totalEx: 0,
        completedEx: 0,
        practiceTime: 0,
        avgScore: 0,
        level: 'Stable'
      };
    }

    const totalEx = subset.reduce((acc, curr) => acc + curr.TotalExercises, 0);
    const completedEx = subset.reduce((acc, curr) => acc + curr.CompletedExercises, 0);
    const practiceTime = subset.reduce((acc, curr) => acc + curr.TotalPracticeTime, 0);
    const itemsWithEx = subset.filter(curr => curr.TotalExercises > 0);
    const avgScore = itemsWithEx.length > 0 ? Math.round(itemsWithEx.reduce((acc, curr) => acc + curr.AverageScore, 0) / itemsWithEx.length) : 0;

    let level = 'Stable';
    const activeLevelCounts = subset.reduce((acc, curr) => {
      acc[curr.ProgressLevel] = (acc[curr.ProgressLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let maxTypeCount = 0;
    Object.entries(activeLevelCounts).forEach(([lvl, count]) => {
      const numCount = count as number;
      if (numCount > maxTypeCount) {
        maxTypeCount = numCount;
        level = lvl;
      }
    });

    return {
      totalEx,
      completedEx,
      practiceTime,
      avgScore,
      level
    };
  }, [analyses, selectedChildId, getRoleFilteredChildren]);

  // Weekly aggregation for Left & Right Charts (strictly filtered within current week bounds)
  const weeklyChartData = useMemo(() => {
    const daysOrder = [
      { key: 'T2', dayIndex: 1, name: 'Thứ 2' },
      { key: 'T3', dayIndex: 2, name: 'Thứ 3' },
      { key: 'T4', dayIndex: 3, name: 'Thứ 4' },
      { key: 'T5', dayIndex: 4, name: 'Thứ 5' },
      { key: 'T6', dayIndex: 5, name: 'Thứ 6' },
      { key: 'T7', dayIndex: 6, name: 'Thứ 7' },
      { key: 'CN', dayIndex: 0, name: 'Chủ Nhật' },
    ];

    // Compute current week bounds (Monday 00:00:00 to Sunday 23:59:59)
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + distanceToMon);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const targetChildIds: number[] = [];
    if (selectedChildId !== 'ALL') {
      targetChildIds.push(Number(selectedChildId));
    } else {
      getRoleFilteredChildren.forEach(c => targetChildIds.push(Number(c.ChildId)));
    }

    let relevantResults: ResultResponse[] = [];
    let relevantSpeech: ChildSpeechAccuracyResponse[] = [];

    targetChildIds.forEach(id => {
      const resList = allResultsMap.get(id);
      if (resList) relevantResults.push(...resList);
      const accList = speechAccuraciesMap.get(id);
      if (accList) relevantSpeech.push(...accList);
    });

    return daysOrder.map(dayObj => {
      const dayResults = relevantResults.filter(r => {
        const dateStr = r.startedAt || r.completedAt;
        if (!dateStr) return false;
        const dt = new Date(dateStr);
        // Only include results that fall strictly within the current week
        if (dt < startOfWeek || dt > endOfWeek) return false;
        return dt.getDay() === dayObj.dayIndex;
      });

      const dayMins = Math.round(dayResults.reduce((sum, r) => sum + (r.durationSeconds || 0), 0) / 60);
      const dayScoreAvg = dayResults.length > 0
        ? Math.round(dayResults.reduce((sum, r) => sum + (r.score || 0), 0) / dayResults.length)
        : 0;

      const daySpeech = relevantSpeech.filter(s => {
        if (!s.createdAt) return false;
        const dt = new Date(s.createdAt);
        if (dt < startOfWeek || dt > endOfWeek) return false;
        return dt.getDay() === dayObj.dayIndex;
      });

      const accuracyAvg = daySpeech.length > 0
        ? Math.round(daySpeech.reduce((sum, s) => sum + (s.accuracyScore || 0), 0) / daySpeech.length)
        : 0;

      return {
        day: dayObj.key,
        name: dayObj.name,
        mins: dayMins,
        score: dayScoreAvg,
        accuracy: accuracyAvg
      };
    });
  }, [allResultsMap, speechAccuraciesMap, selectedChildId, getRoleFilteredChildren]);

  // Flexible Analytics for Both Charts (Filtering by Lesson & Timeframe: Week, Month, Semester)
  const { speechChartData, vrResultsChartData, wordBreakdown, speechStatsSummary } = useMemo(() => {
    const targetChildIds: number[] = [];
    if (selectedChildId !== 'ALL') {
      targetChildIds.push(Number(selectedChildId));
    } else {
      getRoleFilteredChildren.forEach(c => targetChildIds.push(Number(c.ChildId)));
    }

    let relevantSpeech: ChildSpeechAccuracyResponse[] = [];
    let relevantResults: ResultResponse[] = [];

    targetChildIds.forEach(id => {
      const accList = speechAccuraciesMap.get(id);
      if (accList) relevantSpeech.push(...accList);

      const resList = allResultsMap.get(id);
      if (resList) relevantResults.push(...resList);
    });

    // Filter by selected Lesson
    if (speechSelectedLessonId !== 'ALL') {
      const lessonIdNum = Number(speechSelectedLessonId);
      relevantSpeech = relevantSpeech.filter(s => s.lessonId === lessonIdNum);
      relevantResults = relevantResults.filter(r => r.lessonId === lessonIdNum);
    }

    let chartData: { label: string; name: string; accuracy: number; totalRecords: number }[] = [];
    let vrChartData: { label: string; name: string; mins: number; score: number }[] = [];
    let filteredByTimeframeSpeech: ChildSpeechAccuracyResponse[] = [];
    let filteredByTimeframeResults: ResultResponse[] = [];

    const now = new Date();

    if (speechTimeframe === 'week') {
      const currentDay = now.getDay();
      const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + distanceToMon);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      filteredByTimeframeSpeech = relevantSpeech.filter(s => {
        if (!s.createdAt) return false;
        const dt = new Date(s.createdAt);
        return dt >= startOfWeek && dt <= endOfWeek;
      });

      filteredByTimeframeResults = relevantResults.filter(r => {
        const dateStr = r.startedAt || r.completedAt;
        if (!dateStr) return false;
        const dt = new Date(dateStr);
        return dt >= startOfWeek && dt <= endOfWeek;
      });

      const daysOrder = [
        { key: 'T2', dayIndex: 1, name: 'Thứ 2' },
        { key: 'T3', dayIndex: 2, name: 'Thứ 3' },
        { key: 'T4', dayIndex: 3, name: 'Thứ 4' },
        { key: 'T5', dayIndex: 4, name: 'Thứ 5' },
        { key: 'T6', dayIndex: 5, name: 'Thứ 6' },
        { key: 'T7', dayIndex: 6, name: 'Thứ 7' },
        { key: 'CN', dayIndex: 0, name: 'Chủ Nhật' },
      ];

      chartData = daysOrder.map(dayObj => {
        const daySpeech = filteredByTimeframeSpeech.filter(s => {
          const dt = new Date(s.createdAt);
          return dt.getDay() === dayObj.dayIndex;
        });

        const accuracyAvg = daySpeech.length > 0
          ? Math.round(daySpeech.reduce((sum, s) => sum + (s.accuracyScore || 0), 0) / daySpeech.length)
          : 0;

        return {
          label: dayObj.key,
          name: dayObj.name,
          accuracy: accuracyAvg,
          totalRecords: daySpeech.length
        };
      });

      vrChartData = daysOrder.map(dayObj => {
        const dayResults = filteredByTimeframeResults.filter(r => {
          const dt = new Date(r.startedAt || r.completedAt || '');
          return dt.getDay() === dayObj.dayIndex;
        });

        const dayMins = Math.round(dayResults.reduce((sum, r) => sum + (r.durationSeconds || 0), 0) / 60);
        const dayScoreAvg = dayResults.length > 0
          ? Math.round(dayResults.reduce((sum, r) => sum + (r.score || 0), 0) / dayResults.length)
          : 0;

        return {
          label: dayObj.key,
          name: dayObj.name,
          mins: dayMins,
          score: dayScoreAvg
        };
      });

    } else if (speechTimeframe === 'month') {
      const currentYear = speechYear;
      const currentMonth = speechMonth;

      const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

      filteredByTimeframeSpeech = relevantSpeech.filter(s => {
        if (!s.createdAt) return false;
        const formatted = s.createdAt.includes('T') ? s.createdAt : s.createdAt.replace(' ', 'T');
        const dt = new Date(formatted);
        return dt >= startOfMonth && dt <= endOfMonth;
      });

      filteredByTimeframeResults = relevantResults.filter(r => {
        const dateStr = r.startedAt || r.completedAt;
        if (!dateStr) return false;
        const formatted = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
        const dt = new Date(formatted);
        return dt >= startOfMonth && dt <= endOfMonth;
      });

      const weeks = [
        { key: 'Tuần 1', startDay: 1, endDay: 7, name: 'Tuần 1 (Ngày 1-7)' },
        { key: 'Tuần 2', startDay: 8, endDay: 14, name: 'Tuần 2 (Ngày 8-14)' },
        { key: 'Tuần 3', startDay: 15, endDay: 21, name: 'Tuần 3 (Ngày 15-21)' },
        { key: 'Tuần 4', startDay: 22, endDay: 31, name: 'Tuần 4 (Ngày 22-31)' },
      ];

      chartData = weeks.map(wObj => {
        const weekSpeech = filteredByTimeframeSpeech.filter(s => {
          const formatted = s.createdAt.includes('T') ? s.createdAt : s.createdAt.replace(' ', 'T');
          const day = new Date(formatted).getDate();
          return day >= wObj.startDay && day <= wObj.endDay;
        });

        const accuracyAvg = weekSpeech.length > 0
          ? Math.round(weekSpeech.reduce((sum, s) => sum + (s.accuracyScore || 0), 0) / weekSpeech.length)
          : 0;

        return {
          label: wObj.key,
          name: wObj.name,
          accuracy: accuracyAvg,
          totalRecords: weekSpeech.length
        };
      });

      vrChartData = weeks.map(wObj => {
        const weekResults = filteredByTimeframeResults.filter(r => {
          const dateStr = r.startedAt || r.completedAt || '';
          const formatted = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
          const day = new Date(formatted).getDate();
          return day >= wObj.startDay && day <= wObj.endDay;
        });

        const mins = Math.round(weekResults.reduce((sum, r) => sum + (r.durationSeconds || 0), 0) / 60);
        const score = weekResults.length > 0
          ? Math.round(weekResults.reduce((sum, r) => sum + (r.score || 0), 0) / weekResults.length)
          : 0;

        return {
          label: wObj.key,
          name: wObj.name,
          mins,
          score
        };
      });

    } else {
      const matchedSemester = dbSemesters.find(sem => String(sem.id) === speechSemester);

      if (matchedSemester) {
        const semStart = new Date(matchedSemester.startDate);
        const semEnd = new Date(matchedSemester.endDate);

        filteredByTimeframeSpeech = relevantSpeech.filter(s => {
          if (!s.createdAt) return false;
          const dt = new Date(s.createdAt);
          return dt >= semStart && dt <= semEnd;
        });

        filteredByTimeframeResults = relevantResults.filter(r => {
          const dateStr = r.startedAt || r.completedAt;
          if (!dateStr) return false;
          const dt = new Date(dateStr);
          return dt >= semStart && dt <= semEnd;
        });

        const startMonth = semStart.getMonth();
        const endMonth = semEnd.getMonth();
        let allowedMonths: number[] = [];

        if (startMonth <= endMonth) {
          for (let m = startMonth; m <= endMonth; m++) allowedMonths.push(m);
        } else {
          for (let m = startMonth; m <= 11; m++) allowedMonths.push(m);
          for (let m = 0; m <= endMonth; m++) allowedMonths.push(m);
        }

        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

        chartData = allowedMonths.map(mIdx => {
          const monthSpeech = filteredByTimeframeSpeech.filter(s => new Date(s.createdAt).getMonth() === mIdx);
          const accuracyAvg = monthSpeech.length > 0
            ? Math.round(monthSpeech.reduce((sum, s) => sum + (s.accuracyScore || 0), 0) / monthSpeech.length)
            : 0;

          return {
            label: monthNames[mIdx],
            name: `Tháng ${mIdx + 1}`,
            accuracy: accuracyAvg,
            totalRecords: monthSpeech.length
          };
        });

        vrChartData = allowedMonths.map(mIdx => {
          const monthResults = filteredByTimeframeResults.filter(r => new Date(r.startedAt || r.completedAt || '').getMonth() === mIdx);
          const mins = Math.round(monthResults.reduce((sum, r) => sum + (r.durationSeconds || 0), 0) / 60);
          const score = monthResults.length > 0
            ? Math.round(monthResults.reduce((sum, r) => sum + (r.score || 0), 0) / monthResults.length)
            : 0;

          return {
            label: monthNames[mIdx],
            name: `Tháng ${mIdx + 1}`,
            mins,
            score
          };
        });
      } else {
        let allowedMonths: number[] = [];
        if (speechSemester === 'HK1') {
          allowedMonths = [8, 9, 10, 11, 0];
        } else if (speechSemester === 'HK2') {
          allowedMonths = [1, 2, 3, 4, 5];
        } else {
          allowedMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        }

        filteredByTimeframeSpeech = relevantSpeech.filter(s => {
          if (!s.createdAt) return false;
          const m = new Date(s.createdAt).getMonth();
          return allowedMonths.includes(m);
        });

        filteredByTimeframeResults = relevantResults.filter(r => {
          const dateStr = r.startedAt || r.completedAt;
          if (!dateStr) return false;
          const m = new Date(dateStr).getMonth();
          return allowedMonths.includes(m);
        });

        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

        chartData = allowedMonths.map(mIdx => {
          const monthSpeech = filteredByTimeframeSpeech.filter(s => new Date(s.createdAt).getMonth() === mIdx);
          const accuracyAvg = monthSpeech.length > 0
            ? Math.round(monthSpeech.reduce((sum, s) => sum + (s.accuracyScore || 0), 0) / monthSpeech.length)
            : 0;

          return {
            label: monthNames[mIdx],
            name: `Tháng ${mIdx + 1}`,
            accuracy: accuracyAvg,
            totalRecords: monthSpeech.length
          };
        });

        vrChartData = allowedMonths.map(mIdx => {
          const monthResults = filteredByTimeframeResults.filter(r => new Date(r.startedAt || r.completedAt || '').getMonth() === mIdx);
          const mins = Math.round(monthResults.reduce((sum, r) => sum + (r.durationSeconds || 0), 0) / 60);
          const score = monthResults.length > 0
            ? Math.round(monthResults.reduce((sum, r) => sum + (r.score || 0), 0) / monthResults.length)
            : 0;

          return {
            label: monthNames[mIdx],
            name: `Tháng ${mIdx + 1}`,
            mins,
            score
          };
        });
      }
    }

    // Word Breakdown & Error Type Aggregation
    const wordMap: Record<string, { word: string; count: number; totalScore: number; errors: Record<string, number> }> = {};
    const errorTypeCounts: Record<string, number> = {
      Mispronunciation: 0,
      Omission: 0,
      Insertion: 0,
      None: 0
    };

    filteredByTimeframeSpeech.forEach(s => {
      const w = s.word?.trim() || 'Khác';
      if (!wordMap[w]) {
        wordMap[w] = { word: w, count: 0, totalScore: 0, errors: {} };
      }
      wordMap[w].count += 1;
      wordMap[w].totalScore += (s.accuracyScore || 0);

      const err = s.errorType || 'None';
      errorTypeCounts[err] = (errorTypeCounts[err] || 0) + 1;
      wordMap[w].errors[err] = (wordMap[w].errors[err] || 0) + 1;
    });

    const breakdownList = Object.values(wordMap).map(item => ({
      word: item.word,
      count: item.count,
      avgAccuracy: Math.round(item.totalScore / item.count),
      topError: Object.entries(item.errors).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
    })).sort((a, b) => b.avgAccuracy - a.avgAccuracy);

    const overallAvg = filteredByTimeframeSpeech.length > 0
      ? Math.round(filteredByTimeframeSpeech.reduce((sum, s) => sum + (s.accuracyScore || 0), 0) / filteredByTimeframeSpeech.length)
      : 0;

    return {
      speechChartData: chartData,
      vrResultsChartData: vrChartData,
      wordBreakdown: breakdownList,
      speechStatsSummary: {
        totalRecords: filteredByTimeframeSpeech.length,
        overallAvg,
        errorTypeCounts
      }
    };
  }, [allResultsMap, speechAccuraciesMap, selectedChildId, speechSelectedLessonId, speechTimeframe, speechSemester, speechMonth, speechYear, dbSemesters, getRoleFilteredChildren]);

  // Comprehensive Vocabulary & Spoken Word Analysis
  const vocabularyAnalysis = useMemo(() => {
    const targetChildIds: number[] = [];
    if (selectedChildId !== 'ALL') {
      targetChildIds.push(Number(selectedChildId));
    } else {
      getRoleFilteredChildren.forEach(c => targetChildIds.push(Number(c.ChildId)));
    }

    let allResultsPool: ResultResponse[] = [];
    let allSpeechPool: ChildSpeechAccuracyResponse[] = [];

    targetChildIds.forEach(id => {
      const resList = allResultsMap.get(id);
      if (resList) allResultsPool.push(...resList);

      const spList = speechAccuraciesMap.get(id);
      if (spList) allSpeechPool.push(...spList);
    });

    // Filter by lesson if selected
    if (speechSelectedLessonId !== 'ALL') {
      const lessonIdNum = Number(speechSelectedLessonId);
      allResultsPool = allResultsPool.filter(r => r.lessonId === lessonIdNum);
      allSpeechPool = allSpeechPool.filter(s => s.lessonId === lessonIdNum);
    }

    // Timeframe-filtered subsets for comparison
    let timeframeResultsPool: ResultResponse[] = [];
    let timeframeSpeechPool: ChildSpeechAccuracyResponse[] = [];

    const now = new Date();
    if (speechTimeframe === 'week') {
      const currentDay = now.getDay();
      const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + distanceToMon);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      timeframeResultsPool = allResultsPool.filter(r => {
        const d = r.startedAt || r.completedAt;
        if (!d) return false;
        const dt = new Date(d.includes('T') ? d : d.replace(' ', 'T'));
        return dt >= startOfWeek && dt <= endOfWeek;
      });
      timeframeSpeechPool = allSpeechPool.filter(s => {
        if (!s.createdAt) return false;
        const dt = new Date(s.createdAt.includes('T') ? s.createdAt : s.createdAt.replace(' ', 'T'));
        return dt >= startOfWeek && dt <= endOfWeek;
      });
    } else if (speechTimeframe === 'month') {
      const startOfMonth = new Date(speechYear, speechMonth, 1);
      const endOfMonth = new Date(speechYear, speechMonth + 1, 0, 23, 59, 59, 999);
      timeframeResultsPool = allResultsPool.filter(r => {
        const d = r.startedAt || r.completedAt;
        if (!d) return false;
        const dt = new Date(d.includes('T') ? d : d.replace(' ', 'T'));
        return dt >= startOfMonth && dt <= endOfMonth;
      });
      timeframeSpeechPool = allSpeechPool.filter(s => {
        if (!s.createdAt) return false;
        const dt = new Date(s.createdAt.includes('T') ? s.createdAt : s.createdAt.replace(' ', 'T'));
        return dt >= startOfMonth && dt <= endOfMonth;
      });
    } else if (speechTimeframe === 'semester') {
      let allowedMonths: number[] = [];
      if (speechSemester === 'HK1') {
        allowedMonths = [8, 9, 10, 11, 0];
      } else if (speechSemester === 'HK2') {
        allowedMonths = [1, 2, 3, 4, 5];
      } else {
        allowedMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      }
      timeframeResultsPool = allResultsPool.filter(r => {
        const d = r.startedAt || r.completedAt;
        if (!d) return false;
        const dt = new Date(d.includes('T') ? d : d.replace(' ', 'T'));
        return allowedMonths.includes(dt.getMonth());
      });
      timeframeSpeechPool = allSpeechPool.filter(s => {
        if (!s.createdAt) return false;
        const dt = new Date(s.createdAt.includes('T') ? s.createdAt : s.createdAt.replace(' ', 'T'));
        return allowedMonths.includes(dt.getMonth());
      });
    }

    interface WordStatAggregator {
      word: string;
      lessonId: number | null;
      lessonName: string;
      lastPracticed: string;
      allAttempts: number;
      allCorrect: number;
      allWrong: number;
      allCorrectEx: Array<{ spokenText: string; timeSeconds: number; dateStr?: string }>;
      allWrongEx: Array<{ spokenText: string; timeSeconds: number; dateStr?: string; errorType?: string; speechErrorCategory?: string }>;
      allSpeechScores: number[];
      speechErrorCategoryCounts: Record<string, number>;
      seenSpeechRecordKeys: Set<string>;
      lastSpeechErrorCategory?: string;
      tfAttempts: number;
      tfCorrect: number;
      tfWrong: number;
      tfCorrectEx: Array<{ spokenText: string; timeSeconds: number; dateStr?: string }>;
      tfWrongEx: Array<{ spokenText: string; timeSeconds: number; dateStr?: string; errorType?: string; speechErrorCategory?: string }>;
      tfSpeechScores: number[];
    }

    const normalizeSpeechErrorCat = (rawCategory?: string, errorType?: string): string | undefined => {
      if (rawCategory && typeof rawCategory === 'string' && rawCategory.trim()) {
        const trimmed = rawCategory.trim();
        if (trimmed === 'Không' || trimmed.toLowerCase() === 'không' || trimmed === 'None') {
          return undefined;
        }
        return trimmed;
      }
      if (!errorType || errorType === 'None') return undefined;
      if (errorType === 'Mispronunciation') return 'Thay thế âm';
      if (errorType === 'Omission') return 'Nuốt âm/Bỏ sót âm';
      if (errorType === 'Distortion') return 'Méo tiếng/Chưa tròn vành rõ chữ';
      if (errorType === 'Tone') return 'Lệch thanh điệu (Hỏi/Ngã)';
      return undefined;
    };

    const masterMap = new Map<string, WordStatAggregator>();

    const getOrCreateMaster = (rawWord: string, lessonId: number | null, dateStr?: string): WordStatAggregator => {
      const cleaned = cleanSpeechText(rawWord);
      const key = cleaned.toLowerCase().trim();
      if (masterMap.has(key)) {
        const existing = masterMap.get(key)!;
        if (!existing.lessonId && lessonId) {
          existing.lessonId = lessonId;
          existing.lessonName = allLessons.find(l => l.id === lessonId)?.lessonName || `Bài học #${lessonId}`;
        }
        if (dateStr && (!existing.lastPracticed || new Date(dateStr) > new Date(existing.lastPracticed))) {
          existing.lastPracticed = dateStr;
        }
        return existing;
      }

      const lessonName = lessonId
        ? (allLessons.find(l => l.id === lessonId)?.lessonName || `Bài học #${lessonId}`)
        : 'Bài rèn luyện';

      const newItem: WordStatAggregator = {
        word: cleaned,
        lessonId,
        lessonName,
        lastPracticed: dateStr || new Date().toISOString(),
        allAttempts: 0,
        allCorrect: 0,
        allWrong: 0,
        allCorrectEx: [],
        allWrongEx: [],
        allSpeechScores: [],
        speechErrorCategoryCounts: {},
        seenSpeechRecordKeys: new Set<string>(),
        lastSpeechErrorCategory: undefined,
        tfAttempts: 0,
        tfCorrect: 0,
        tfWrong: 0,
        tfCorrectEx: [],
        tfWrongEx: [],
        tfSpeechScores: []
      };
      masterMap.set(key, newItem);
      return newItem;
    };

    const isTfResult = (r: ResultResponse) => timeframeResultsPool.includes(r);
    const isTfSpeech = (s: ChildSpeechAccuracyResponse) => timeframeSpeechPool.includes(s);

    // Build fast lookup for speech accuracy details (speechErrorCategory)
    const speechAccuracyLookup = new Map<string, ChildSpeechAccuracyResponse>();
    allSpeechPool.forEach(sp => {
      if (sp.sessionId) {
        if (sp.audioChunkIndex !== undefined && sp.audioChunkIndex !== null) {
          speechAccuracyLookup.set(`${sp.sessionId}_idx_${sp.audioChunkIndex}`, sp);
        }
        if (sp.word) {
          const wKey = `${sp.sessionId}_word_${cleanSpeechText(sp.word).toLowerCase()}`;
          if (!speechAccuracyLookup.has(wKey)) {
            speechAccuracyLookup.set(wKey, sp);
          }
        }
      }
    });

    // 1. Process all results
    allResultsPool.forEach(r => {
      if (!r.interactionLog) return;
      const events = parseInteractionLog(r.interactionLog);
      const sessionDate = r.completedAt || r.startedAt;
      const inTf = isTfResult(r);

      events.forEach((evt, evtIdx) => {
        if (!evt.text || evt.text.trim().length === 0) return;
        if (isSilentOrUnclearSpeech(evt.spokenText)) return;
        const entry = getOrCreateMaster(evt.text, r.lessonId || null, sessionDate);
        entry.allAttempts += 1;
        if (inTf) entry.tfAttempts += 1;

        if (evt.isCorrect) {
          entry.allCorrect += 1;
          const spoken = cleanSpeechText(evt.spokenText) || entry.word;
          if (entry.allCorrectEx.length < 5) {
            entry.allCorrectEx.push({ spokenText: spoken, timeSeconds: evt.timeSeconds, dateStr: sessionDate });
          }
          if (inTf) {
            entry.tfCorrect += 1;
            if (entry.tfCorrectEx.length < 5) {
              entry.tfCorrectEx.push({ spokenText: spoken, timeSeconds: evt.timeSeconds, dateStr: sessionDate });
            }
          }
        } else {
          entry.allWrong += 1;
          const spoken = cleanSpeechText(evt.spokenText) || 'chưa đủ từ';
          const matchedSp =
            speechAccuracyLookup.get(`${r.sessionId}_idx_${evtIdx}`) ||
            speechAccuracyLookup.get(`${r.sessionId}_word_${cleanSpeechText(evt.text).toLowerCase()}`);
          const cat = normalizeSpeechErrorCat(
            matchedSp?.speechErrorCategory || (matchedSp as any)?.SpeechErrorCategory,
            matchedSp?.errorType
          );
          if (cat) {
            const recKey = matchedSp?.id ? `id_${matchedSp.id}` : matchedSp ? `${matchedSp.sessionId}_idx_${matchedSp.audioChunkIndex}` : undefined;
            if (recKey) entry.seenSpeechRecordKeys.add(recKey);
            entry.speechErrorCategoryCounts[cat] = (entry.speechErrorCategoryCounts[cat] || 0) + 1;
            entry.lastSpeechErrorCategory = cat;
          }
          const wrongObj = { spokenText: spoken, timeSeconds: evt.timeSeconds, dateStr: sessionDate, speechErrorCategory: cat };
          if (entry.allWrongEx.length < 5) {
            entry.allWrongEx.push(wrongObj);
          }
          if (inTf) {
            entry.tfWrong += 1;
            if (entry.tfWrongEx.length < 5) {
              entry.tfWrongEx.push(wrongObj);
            }
          }
        }
      });
    });

    // 2. Process all speech accuracy records
    allSpeechPool.forEach(sp => {
      if (!sp.word) return;
      const rawWord = cleanSpeechText(sp.word);
      if (!rawWord) return;
      const entry = getOrCreateMaster(rawWord, sp.lessonId || null, sp.createdAt);
      const inTf = isTfSpeech(sp);

      if (sp.accuracyScore !== undefined && sp.accuracyScore !== null) {
        entry.allSpeechScores.push(sp.accuracyScore);
        if (inTf) entry.tfSpeechScores.push(sp.accuracyScore);
      }

      const cat = normalizeSpeechErrorCat(
        sp.speechErrorCategory || (sp as any)?.SpeechErrorCategory,
        sp.errorType
      );
      if (cat) {
        const recKey = sp.id ? `id_${sp.id}` : sp.sessionId ? `${sp.sessionId}_idx_${sp.audioChunkIndex}` : undefined;
        if (!recKey || !entry.seenSpeechRecordKeys.has(recKey)) {
          if (recKey) entry.seenSpeechRecordKeys.add(recKey);
          entry.speechErrorCategoryCounts[cat] = (entry.speechErrorCategoryCounts[cat] || 0) + 1;
          entry.lastSpeechErrorCategory = cat;
        }
      }

      if (entry.allAttempts === 0) {
        entry.allAttempts += 1;
        const isGood = (sp.accuracyScore || 0) >= 75 && sp.errorType === 'None';
        if (isGood) {
          entry.allCorrect += 1;
          entry.allCorrectEx.push({ spokenText: entry.word, timeSeconds: 0, dateStr: sp.createdAt });
        } else {
          entry.allWrong += 1;
          const errDesc = sp.errorType === 'Mispronunciation' ? 'Sai âm' : sp.errorType === 'Omission' ? 'Đọc thiếu âm' : (sp.errorType || 'Phát âm chưa chuẩn');
          entry.allWrongEx.push({ spokenText: errDesc, timeSeconds: 0, dateStr: sp.createdAt, errorType: sp.errorType || undefined, speechErrorCategory: cat });
        }

        if (inTf) {
          entry.tfAttempts += 1;
          if (isGood) {
            entry.tfCorrect += 1;
            entry.tfCorrectEx.push({ spokenText: entry.word, timeSeconds: 0, dateStr: sp.createdAt });
          } else {
            entry.tfWrong += 1;
            const errDesc = sp.errorType === 'Mispronunciation' ? 'Sai âm' : sp.errorType === 'Omission' ? 'Đọc thiếu âm' : (sp.errorType || 'Phát âm chưa chuẩn');
            entry.tfWrongEx.push({ spokenText: errDesc, timeSeconds: 0, dateStr: sp.createdAt, errorType: sp.errorType || undefined, speechErrorCategory: cat });
          }
        }
      }
    });

    // Build the master list with both allTime and timeframe data
    const allItems: AnalyzedVocabularyItem[] = Array.from(masterMap.values()).map(entry => {
      const allScore = entry.allSpeechScores.length > 0
        ? Math.round(entry.allSpeechScores.reduce((a, b) => a + b, 0) / entry.allSpeechScores.length)
        : undefined;

      const allRate = entry.allAttempts > 0
        ? Math.round((entry.allCorrect / entry.allAttempts) * 100)
        : (allScore || 0);

      const allMastery: 'MASTERED' | 'PRACTICING' | 'NEEDS_HELP' = allRate >= 80 ? 'MASTERED' : allRate >= 50 ? 'PRACTICING' : 'NEEDS_HELP';

      const tfScore = entry.tfSpeechScores.length > 0
        ? Math.round(entry.tfSpeechScores.reduce((a, b) => a + b, 0) / entry.tfSpeechScores.length)
        : undefined;

      const tfRate = entry.tfAttempts > 0
        ? Math.round((entry.tfCorrect / entry.tfAttempts) * 100)
        : (tfScore || 0);

      let tfMastery: 'MASTERED' | 'PRACTICING' | 'NEEDS_HELP' | 'NOT_PRACTICED' = 'NOT_PRACTICED';
      if (entry.tfAttempts > 0) {
        tfMastery = tfRate >= 80 ? 'MASTERED' : tfRate >= 50 ? 'PRACTICING' : 'NEEDS_HELP';
      }

      // Collect all distinct error categories sorted by occurrence frequency descending
      let sortedCategories: string[] = Object.entries(entry.speechErrorCategoryCounts)
        .filter(([c]) => c !== 'Không' && c.toLowerCase() !== 'không')
        .sort((a, b) => b[1] - a[1])
        .map(([c]) => c);

      if (sortedCategories.length === 0 && entry.lastSpeechErrorCategory && entry.lastSpeechErrorCategory !== 'Không') {
        sortedCategories = [entry.lastSpeechErrorCategory];
      }

      const primaryErrorCategory = sortedCategories[0] || undefined;

      return {
        word: entry.word,
        lessonId: entry.lessonId,
        lessonName: entry.lessonName,
        totalAttempts: entry.allAttempts,
        correctCount: entry.allCorrect,
        wrongCount: entry.allWrong,
        accuracyRate: allRate,
        avgSpeechScore: allScore,
        masteryStatus: allMastery,
        lastPracticed: entry.lastPracticed,
        correctExamples: entry.allCorrectEx,
        wrongExamples: entry.allWrongEx,
        speechErrorCategory: primaryErrorCategory,
        speechErrorCategories: sortedCategories,
        speechErrorCategoryCounts: entry.speechErrorCategoryCounts,
        allTimeAttempts: entry.allAttempts,
        allTimeAccuracyRate: allRate,
        allTimeMasteryStatus: allMastery,
        allTimeLastPracticed: entry.lastPracticed,
        hasTimeframeData: true
      };
    });

    const totalWords = allItems.length;
    const timeframePracticedWords = allItems.filter(i => i.totalAttempts > 0).length;

    const activeItems = allItems;
    const masteredCount = activeItems.filter(i => i.masteryStatus === 'MASTERED').length;
    const practicingCount = activeItems.filter(i => i.masteryStatus === 'PRACTICING').length;
    const needsHelpCount = activeItems.filter(i => i.masteryStatus === 'NEEDS_HELP').length;

    const totalCorrect = activeItems.reduce((sum, i) => sum + i.correctCount, 0);
    const totalWrong = activeItems.reduce((sum, i) => sum + i.wrongCount, 0);
    const totalSpoken = totalCorrect + totalWrong;
    const overallSpokenAccuracy = totalSpoken > 0 ? Math.round((totalCorrect / totalSpoken) * 100) : 0;

    return {
      allItems,
      totalWords,
      timeframePracticedWords,
      masteredCount,
      practicingCount,
      needsHelpCount,
      totalCorrect,
      totalWrong,
      totalSpoken,
      overallSpokenAccuracy
    };
  }, [
    allResultsMap,
    speechAccuraciesMap,
    allLessons,
    selectedChildId,
    speechSelectedLessonId,
    vocabTimeScope,
    speechTimeframe,
    speechSemester,
    speechMonth,
    speechYear,
    getRoleFilteredChildren
  ]);

  // Filtered and sorted vocabulary list with STABLE ordering to prevent jitter and layout rearrangement
  const filteredVocabularyItems = useMemo(() => {
    let list = [...vocabularyAnalysis.allItems];

    if (vocabStatusFilter !== 'ALL') {
      list = list.filter(item => item.masteryStatus === vocabStatusFilter);
    }

    if (vocabSearchQuery.trim()) {
      const q = vocabSearchQuery.toLowerCase().trim();
      list = list.filter(item =>
        item.word.toLowerCase().includes(q) ||
        item.lessonName.toLowerCase().includes(q) ||
        item.correctExamples.some(ex => ex.spokenText.toLowerCase().includes(q)) ||
        item.wrongExamples.some(ex => ex.spokenText.toLowerCase().includes(q))
      );
    }

    // ALWAYS sort by stable allTime properties so switching vocabTimeScope never swaps cards!
    list.sort((a, b) => {
      if (vocabSortBy === 'MOST_PRACTICED') {
        return b.allTimeAttempts - a.allTimeAttempts;
      }
      if (vocabSortBy === 'HIGHEST_ACCURACY') {
        return b.allTimeAccuracyRate - a.allTimeAccuracyRate;
      }
      if (vocabSortBy === 'LOWEST_ACCURACY') {
        return a.allTimeAccuracyRate - b.allTimeAccuracyRate;
      }
      if (vocabSortBy === 'RECENT') {
        return new Date(b.allTimeLastPracticed).getTime() - new Date(a.allTimeLastPracticed).getTime();
      }
      return 0;
    });

    return list;
  }, [vocabularyAnalysis.allItems, vocabStatusFilter, vocabSearchQuery, vocabSortBy]);

  const formatVocabDate = (dateStr?: string) => {
    if (!dateStr) return 'Gần đây';
    try {
      const d = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) return 'Gần đây';
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return 'Gần đây';
    }
  };

  // Render state indicator badges
  const renderProgressLevelBadge = (level: Analysis['ProgressLevel'] | string) => {
    const styler: Record<string, { bg: string; text: string; label: string; dot: string }> = {
      Improving: { bg: 'bg-[#F2FAF4] text-[#34A853] border-emerald-100', text: 'text-[#34A853]', label: 'Đang tiến bộ', dot: 'bg-emerald-500' },
      Stable: { bg: 'bg-[#F2FAFB] text-[#20D0D4] border-cyan-100', text: 'text-[#20D0D4]', label: 'Ổn định', dot: 'bg-[#20D0D4]' },
      'Need Support': { bg: 'bg-[#FFF2F2] text-[#FF8E8E] border-rose-100', text: 'text-[#FF8E8E]', label: 'Cần hỗ trợ', dot: 'bg-rose-500' }
    };
    const style = styler[level] || styler.Stable;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border", style.bg)}>
        <span className={cn("w-1.5 h-1.5 rounded-full animate-ping", style.dot)} />
        {style.label}
      </span>
    );
  };



  // Actions simulations
  const handleOpenAnalysisModal = (an: Analysis) => {
    setSelectedAnalysis(an);
    setIsDetailOpen(true);
  };

  const handleSimulateReportExport = (kidId: string, anaId: string) => {
    const kid = getChildDetails(kidId);
    showToast(`Đang cấu trúc và kết xuất báo cáo PDF cho bé ${kid.FullName}...`, 'info');
    setTimeout(() => {
      showToast(`Đã xuất báo cáo can thiệp mầm học: GODOTXR_REPORT_${anaId}.pdf!`, 'success');
    }, 2500);
  };

  return (
    <div className="space-y-4 pb-24 relative text-left" id="progress-analysis-view">

      {/* Dynamic Toast Feedback Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="analysis-toast-floating"
          >
            <div className={cn(
              "px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 border-2 border-white backdrop-blur-md font-bold text-white text-sm tracking-wide leading-snug",
              toastMessage.type === 'success' ? 'bg-[#4EACAF]/95' : toastMessage.type === 'info' ? 'bg-indigo-600/95' : 'bg-[#FF8E8E]/95'
            )}>
              <div className="bg-white/20 p-2 rounded-xl shrink-0">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : toastMessage.type === 'warn' ? (
                  <ShieldAlert className="w-5 h-5 text-white" />
                ) : (
                  <Activity className="w-5 h-5 text-white animate-pulse" />
                )}
              </div>
              <p className="flex-1 min-w-0 font-extrabold italic">{toastMessage.text}</p>
              <button
                onClick={() => setToastMessage(null)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1 relative z-20">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight leading-tight">
            Phân Tích <span className="text-[#4EACAF]">Tiến Độ</span>
          </h1>
        </div>

        {/* Child Selector Dropdown on the right side of the Header */}
        <div className="bg-white/60 p-4 rounded-3xl border border-white/80 shadow-sm flex items-center gap-3 self-start lg:self-center shrink-0">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
            <Baby className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium text-[10px] text-slate-400 uppercase tracking-wider leading-none">Học sinh rèn luyện:</h4>
            <CustomSelect
              value={selectedChildId}
              onChange={(val) => {
                setSelectedChildId(val);
                showToast(`Đã tải dải dữ liệu của Học sinh: ${val === 'ALL' ? 'Tất cả Học sinh' : getChildDetails(val).FullName}`, 'success');
              }}
              options={[
                { value: 'ALL', label: '🌟 TẤT CẢ HỌC SINH' },
                ...getRoleFilteredChildren.map((kd) => ({
                  value: kd.ChildId,
                  label: `${kd.FullName} (${kd.Age}t)`,
                  avatarUrl: resolveAvatarUrl(kd.Avatar, kd.FullName, 'bottts')
                }))
              ]}
              className="min-w-[240px] font-medium"
            />
          </div>
        </div>

      </div>

      {/* 3. Kid-friendly colorful Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

        {/* Total assign exercises */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 border border-teal-100">
            <Activity className="w-5 h-5 text-[#4EACAF]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{metrics.totalEx}</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1.5">Tổng bài tập</p>
          </div>
        </div>

        {/* Total play session times */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
            <Clock className="w-5 h-5 text-[#FF8E8E]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {metrics.practiceTime} m
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1.5">Thời lượng tập VR</p>
          </div>
        </div>

        {/* Avg score rating */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
            <Award className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {metrics.avgScore}/100
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1.5">Điểm bình quân</p>
          </div>
        </div>

        {/* Total Vocabulary Words Learned */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {vocabularyAnalysis.totalWords} <span className="text-xs font-medium text-slate-400">từ</span>
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1.5">Vốn từ đã học</p>
          </div>
        </div>

        {/* Spoken Correct vs Wrong Counts */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center shrink-0 border border-cyan-100">
            <Mic className="w-5 h-5 text-[#20D0D4]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none flex items-center">
              <span className="text-emerald-600">{vocabularyAnalysis.totalCorrect}</span>
              <span className="text-slate-300 mx-1 text-lg font-normal">/</span>
              <span className="text-rose-500">{vocabularyAnalysis.totalWrong}</span>
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1.5">Nói đúng / sai</p>
          </div>
        </div>

      </div>

      {/* 4. Dual Analytical Charts Section */}
      <div className="space-y-4">

        {/* Global Filter Bar for Analytical Charts */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Top Row: Title & Primary Fixed Controls */}
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-2.5 text-slate-800">
              <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-[#20D0D4]">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-slate-800">Bộ lọc Thống kê Biểu đồ</h4>
                <p className="text-[11px] text-slate-400 font-normal">Áp dụng bộ lọc bài học và thời gian cho cả 2 biểu đồ bên dưới</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Lesson Select */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-52 shrink-0">
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={speechSelectedLessonId}
                  onChange={(e) => setSpeechSelectedLessonId(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-700 outline-none w-full cursor-pointer"
                >
                  <option value="ALL">Tất cả bài học</option>
                  {allLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.lessonName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeframe Selector Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSpeechTimeframe('week')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all text-center",
                    speechTimeframe === 'week' ? "bg-white text-[#20D0D4] shadow-xs" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Theo Tuần
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechTimeframe('month')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all text-center",
                    speechTimeframe === 'month' ? "bg-white text-[#20D0D4] shadow-xs" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Theo Tháng
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechTimeframe('semester')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all text-center",
                    speechTimeframe === 'semester' ? "bg-white text-[#20D0D4] shadow-xs" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Theo Học Kỳ
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Filter Toolbar (Dedicated fixed sub-bar so top bar never jitters) */}
          <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 min-h-[42px]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-[#20D0D4]" />
              <span>Phạm vi thời gian chi tiết:</span>
            </div>

            <div className="flex items-center gap-2">
              {speechTimeframe === 'week' && (
                <span className="text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200/80 shadow-2xs">
                  7 ngày trong tuần hiện tại (Thứ 2 - Chủ Nhật)
                </span>
              )}

              {speechTimeframe === 'month' && (
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-slate-200/80 shadow-2xs">
                  <span className="text-xs font-medium text-slate-500">Chọn tháng:</span>
                  <select
                    value={speechMonth}
                    onChange={(e) => setSpeechMonth(Number(e.target.value))}
                    className="bg-transparent font-medium text-xs text-[#20D0D4] outline-none cursor-pointer"
                  >
                    {[
                      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
                      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
                      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
                    ].map((mName, mIdx) => (
                      <option key={mIdx} value={mIdx}>
                        {mName} ({mIdx === new Date().getMonth() ? 'Hiện tại' : `T${mIdx + 1}`})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {speechTimeframe === 'semester' && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {dbSemesters.map((sem) => (
                    <button
                      key={sem.id}
                      type="button"
                      onClick={() => setSpeechSemester(String(sem.id))}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-all border",
                        speechSemester === String(sem.id)
                          ? "bg-[#20D0D4] text-white border-[#20D0D4] shadow-2xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {sem.semesterName}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSpeechSemester('HK1')}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all border",
                      speechSemester === 'HK1'
                        ? "bg-[#20D0D4] text-white border-[#20D0D4] shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    HK1 (T9-T1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeechSemester('HK2')}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all border",
                      speechSemester === 'HK2'
                        ? "bg-[#20D0D4] text-white border-[#20D0D4] shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    HK2 (T2-T6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeechSemester('ALL_YEAR')}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all border",
                      speechSemester === 'ALL_YEAR'
                        ? "bg-[#20D0D4] text-white border-[#20D0D4] shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Cả Năm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Chart: Bar Chart for Score & Practice Duration */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4EACAF]/10 rounded-xl flex items-center justify-center text-[#4EACAF]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Điểm số & Thời lượng rèn luyện</h3>
                  <p className="text-xs text-slate-400 font-normal">Thống kê điểm & thời gian VR theo bộ lọc trên</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <div className="flex items-center gap-1.5 text-[#4EACAF]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4EACAF] inline-block" />
                  <span>Thời lượng (phút)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#FF8E8E]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF8E8E] inline-block" />
                  <span>Điểm số (đ)</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vrResultsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
                    labelStyle={{ fontWeight: 600, color: '#94A3B8' }}
                    labelFormatter={(label, items) => {
                      const item = items?.[0]?.payload;
                      return item ? `${item.name} (${label})` : label;
                    }}
                    formatter={(val: any, name: any) => [name === 'mins' ? `${val} phút` : `${val} điểm`, name === 'mins' ? 'Thời lượng VR' : 'Điểm số trung bình']}
                  />
                  <Bar dataKey="mins" name="mins" fill="#4EACAF" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="score" name="score" fill="#FF8E8E" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Chart: Area Chart for Speech Accuracy */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-[#20D0D4]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Hoạt động luyện tập phát âm</h3>
                  <p className="text-xs text-slate-400 font-normal">Tỉ lệ chính xác âm lời nói theo bộ lọc trên</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#20D0D4]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#20D0D4] inline-block animate-pulse" />
                <span>Độ chính xác (%)</span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={speechChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#20D0D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#20D0D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
                    formatter={(val: any) => [`${val}%`, 'Độ chính xác phát âm']}
                    labelFormatter={(label, items) => {
                      const item = items?.[0]?.payload;
                      return item ? `${item.name} (${label})` : label;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#20D0D4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAccuracy)"
                    dot={{ r: 4, fill: '#20D0D4', strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6, fill: '#20D0D4', strokeWidth: 2, stroke: '#FFFFFF' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* 5. Comprehensive Vocabulary Mastery & Speech Analysis Widget */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5" id="vocab-analysis-section">
        {/* Header & Main Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 border border-teal-100/60 shadow-xs shrink-0">
              <BookOpen className="w-5 h-5 text-[#20D0D4]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800 text-base sm:text-lg leading-tight tracking-tight whitespace-nowrap">
                  Phân tích Vốn Từ Vựng &amp; Luyện Phát Âm của Trẻ
                </h3>
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
                  {vocabularyAnalysis.totalWords} từ vựng
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal mt-0.5 whitespace-nowrap truncate">
                Chi tiết các từ vựng bé đã rèn luyện, số lần nói đúng/sai và phân tích lỗi phát âm
              </p>
            </div>
          </div>
        </div>

        {/* Filter Categories Chips (Clickable) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setVocabStatusFilter('ALL')}
            className={cn(
              "p-3 rounded-xl border text-left transition-colors flex items-center justify-between",
              vocabStatusFilter === 'ALL'
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-slate-50/70 hover:bg-slate-100 border-slate-200/70 text-slate-700"
            )}
          >
            <div className="min-w-0">
              <p className={cn("text-[11px] font-medium uppercase tracking-wider whitespace-nowrap truncate", vocabStatusFilter === 'ALL' ? "text-slate-300" : "text-slate-400")}>
                Tất cả từ đã học
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5 whitespace-nowrap">
                <span className="text-lg font-bold leading-tight">{vocabularyAnalysis.totalWords}</span>
              </div>
            </div>
            <BookOpen className={cn("w-4 h-4 shrink-0 ml-1", vocabStatusFilter === 'ALL' ? "text-slate-300" : "text-slate-400")} />
          </button>

          <button
            type="button"
            onClick={() => setVocabStatusFilter('MASTERED')}
            className={cn(
              "p-3 rounded-xl border text-left transition-colors flex items-center justify-between",
              vocabStatusFilter === 'MASTERED'
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200/70 text-emerald-800"
            )}
          >
            <div className="min-w-0">
              <p className={cn("text-[11px] font-medium uppercase tracking-wider whitespace-nowrap truncate", vocabStatusFilter === 'MASTERED' ? "text-emerald-100" : "text-emerald-600")}>
                Đã thành thạo (&ge;80%)
              </p>
              <p className="text-lg font-bold leading-tight mt-0.5">{vocabularyAnalysis.masteredCount}</p>
            </div>
            <CheckCircle2 className={cn("w-4 h-4 shrink-0 ml-1", vocabStatusFilter === 'MASTERED' ? "text-emerald-100" : "text-emerald-600")} />
          </button>

          <button
            type="button"
            onClick={() => setVocabStatusFilter('PRACTICING')}
            className={cn(
              "p-3 rounded-xl border text-left transition-colors flex items-center justify-between",
              vocabStatusFilter === 'PRACTICING'
                ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                : "bg-cyan-50/50 hover:bg-cyan-50 border-cyan-200/70 text-cyan-800"
            )}
          >
            <div className="min-w-0">
              <p className={cn("text-[11px] font-medium uppercase tracking-wider whitespace-nowrap truncate", vocabStatusFilter === 'PRACTICING' ? "text-cyan-100" : "text-cyan-600")}>
                Đang rèn luyện (50-79%)
              </p>
              <p className="text-lg font-bold leading-tight mt-0.5">{vocabularyAnalysis.practicingCount}</p>
            </div>
            <RefreshCw className={cn("w-4 h-4 shrink-0 ml-1", vocabStatusFilter === 'PRACTICING' ? "text-cyan-100" : "text-cyan-600")} />
          </button>

          <button
            type="button"
            onClick={() => setVocabStatusFilter('NEEDS_HELP')}
            className={cn(
              "p-3 rounded-xl border text-left transition-colors flex items-center justify-between",
              vocabStatusFilter === 'NEEDS_HELP'
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-rose-50/50 hover:bg-rose-50 border-rose-200/70 text-rose-800"
            )}
          >
            <div className="min-w-0">
              <p className={cn("text-[11px] font-medium uppercase tracking-wider whitespace-nowrap truncate", vocabStatusFilter === 'NEEDS_HELP' ? "text-rose-100" : "text-rose-600")}>
                Cần chú ý / Sai (&lt;50%)
              </p>
              <p className="text-lg font-bold leading-tight mt-0.5">{vocabularyAnalysis.needsHelpCount}</p>
            </div>
            <AlertTriangle className={cn("w-4 h-4 shrink-0 ml-1", vocabStatusFilter === 'NEEDS_HELP' ? "text-rose-100" : "text-rose-600")} />
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm nhanh từ vựng (ví dụ: quả táo, bánh quy, xúc xích, cần câu...)"
              value={vocabSearchQuery}
              onChange={(e) => setVocabSearchQuery(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2 text-xs font-normal rounded-xl border border-slate-200/80 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
            />
            {vocabSearchQuery && (
              <button
                type="button"
                onClick={() => setVocabSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-400">Sắp xếp:</span>
            <CustomSelect
              value={vocabSortBy}
              onChange={(val) => setVocabSortBy(val as any)}
              options={[
                { value: 'MOST_PRACTICED', label: 'Luyện nhiều nhất' },
                { value: 'HIGHEST_ACCURACY', label: 'Tỷ lệ đúng cao nhất' },
                { value: 'LOWEST_ACCURACY', label: 'Cần rèn luyện nhất' },
                { value: 'RECENT', label: 'Mới học gần đây' }
              ]}
              className="min-w-[170px] text-xs font-medium"
            />
          </div>
        </div>

        {/* Word Cards Grid */}
        {filteredVocabularyItems.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-600">
              {vocabSearchQuery
                ? `Không tìm thấy từ vựng nào khớp với "${vocabSearchQuery}"`
                : 'Chưa có dữ liệu từ vựng nào phù hợp với bộ lọc hiện tại'}
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Hãy thử chọn &ldquo;Toàn bộ từ đã học&rdquo; hoặc bấm chuyển bộ lọc trạng thái để xem danh mục từ ngữ khác của bé.
            </p>
          </div>
        ) : (
          <div className="max-h-[580px] overflow-y-auto pr-2 p-1">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredVocabularyItems.map((item) => {
              const isNotPracticed = item.totalAttempts === 0;
              const isMastered = !isNotPracticed && item.masteryStatus === 'MASTERED';
              const isNeedsHelp = !isNotPracticed && item.masteryStatus === 'NEEDS_HELP';

              return (
                <div
                  key={item.word}
                  className={cn(
                    "rounded-2xl p-5 border bg-white shadow-xs hover:shadow-md transition-colors space-y-3.5 flex flex-col justify-between",
                    isNotPracticed ? "border-slate-200/80" : isMastered ? "border-emerald-100/90" : isNeedsHelp ? "border-rose-100/90" : "border-cyan-100/90"
                  )}
                >
                  {/* Top: Word & Status Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                        <Volume2 className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-base leading-tight tracking-tight capitalize">
                          {item.word}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[11px] font-normal text-slate-500 mt-0.5">
                          <BookOpen className="w-3 h-3 text-teal-600" />
                          {item.lessonName}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isNotPracticed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Chưa luyện mốc này
                        </span>
                      ) : isMastered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Đã thành thạo
                        </span>
                      ) : isNeedsHelp ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Cần chú ý
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200">
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
                          Đang rèn luyện
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Accuracy Bar & Numerical Counts */}
                  <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs gap-2 flex-wrap sm:flex-nowrap">
                      <span className="font-medium text-slate-600 whitespace-nowrap shrink-0">
                        Độ chính xác: <span className={cn("text-sm font-semibold", isNotPracticed ? "text-slate-400" : isMastered ? "text-emerald-700" : isNeedsHelp ? "text-rose-600" : "text-cyan-700")}>{isNotPracticed ? '0%' : `${item.accuracyRate}%`}</span>
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium shrink-0 whitespace-nowrap">
                        <span className="text-slate-500 whitespace-nowrap">Tổng: {item.totalAttempts} lượt</span>
                        <span className={cn("px-1.5 py-0.5 rounded whitespace-nowrap", isNotPracticed ? "text-slate-400 bg-slate-100" : "text-emerald-700 bg-emerald-100/70 font-medium")}>
                          {item.correctCount} đúng
                        </span>
                        <span className={cn("px-1.5 py-0.5 rounded whitespace-nowrap", isNotPracticed ? "text-slate-400 bg-slate-100" : "text-rose-700 bg-rose-100/70 font-medium")}>
                          {item.wrongCount} sai
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isNotPracticed ? "bg-slate-300" : item.accuracyRate >= 80 ? "bg-emerald-500" : item.accuracyRate >= 50 ? "bg-[#20D0D4]" : "bg-rose-500"
                        )}
                        style={{ width: `${isNotPracticed ? 0 : Math.min(100, Math.max(5, item.accuracyRate))}%` }}
                      />
                    </div>

                    {/* Speech Error Category (Lỗi phát âm) */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-start sm:items-center justify-between gap-2 text-xs flex-wrap sm:flex-nowrap">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium shrink-0 pt-0.5 sm:pt-0">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0 inline-block",
                            isNotPracticed
                              ? "bg-slate-300"
                              : item.speechErrorCategories && item.speechErrorCategories.length > 0
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          )}
                        />
                        Lỗi phát âm{item.speechErrorCategories && item.speechErrorCategories.length > 1 ? ` (${item.speechErrorCategories.length})` : ''}:
                      </span>
                      {isNotPracticed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-100/70 text-slate-400 italic text-[11px]">
                          Chưa có dữ liệu
                        </span>
                      ) : item.speechErrorCategories && item.speechErrorCategories.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-end gap-1.5 max-w-full sm:max-w-[70%]">
                          {item.speechErrorCategories.map((cat, catIdx) => {
                            const count = item.speechErrorCategoryCounts?.[cat];
                            return (
                              <span
                                key={catIdx}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-amber-200/80 bg-amber-50 text-amber-800 font-semibold text-[11px] shadow-2xs whitespace-nowrap"
                                title={count ? `Lỗi: ${cat} (${count} lần đánh giá)` : cat}
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{cat}</span>
                                {count && count > 1 ? (
                                  <span className="text-[10px] bg-amber-200/80 text-amber-900 rounded-full px-1.5 py-0.2 font-bold ml-0.5">
                                    {count}
                                  </span>
                                ) : null}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-emerald-200/70 bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          Chuẩn - Không có lỗi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Balanced Side-by-side Comparison Slots: Lúc nói đúng vs Lúc nói sai */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                    {/* Left Slot: Lúc nói đúng */}
                    <div className="bg-[#F2FAF4] border border-emerald-100/80 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-1.5 border-b border-emerald-100 mb-2 gap-2">
                          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-medium min-w-0 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">Lúc nói đúng ({item.correctCount} lần)</span>
                          </div>
                          <span className="text-[10px] font-medium text-emerald-700 uppercase bg-emerald-100/70 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                            Chuẩn
                          </span>
                        </div>

                        <div className="min-h-[72px] flex flex-col justify-center">
                          {item.correctExamples.length > 0 ? (
                            <div className="space-y-1.5">
                              {item.correctExamples.slice(0, 2).map((ex, exIdx) => (
                                <div
                                  key={exIdx}
                                  className="bg-white/95 px-2.5 py-1.5 rounded-lg border border-emerald-200/70 text-xs flex items-center justify-between shadow-2xs gap-2"
                                >
                                  <span className="text-slate-700 font-normal truncate mr-1">
                                    trẻ nói: <span className="text-emerald-700 font-medium">&ldquo;{ex.spokenText}&rdquo;</span>
                                  </span>
                                  {ex.timeSeconds > 0 && (
                                    <span className="text-[10px] text-slate-400 font-normal shrink-0 whitespace-nowrap">
                                      [{ex.timeSeconds}s]
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-xs text-slate-400 italic font-normal">
                              {isNotPracticed
                                ? "Chưa có lượt phát âm trong mốc này"
                                : "Chưa có lượt phát âm đúng nào"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Slot: Lúc nói sai & Lỗi */}
                    <div className="bg-[#FFF2F2] border border-rose-100/80 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-1.5 border-b border-rose-100 mb-2">
                          <div className="flex items-center gap-1.5 text-rose-800 text-xs font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Lúc nói sai &amp; lỗi ({item.wrongCount} lần)</span>
                          </div>
                          <span className="text-[10px] font-medium text-rose-700 uppercase bg-rose-100/70 px-1.5 py-0.5 rounded">
                            Cần sửa
                          </span>
                        </div>

                        <div className="min-h-[72px] flex flex-col justify-center">
                          {item.wrongExamples.length > 0 ? (
                            <div className="space-y-1.5">
                              {item.wrongExamples.slice(0, 2).map((ex, exIdx) => (
                                <div
                                  key={exIdx}
                                  className="bg-white/95 px-2.5 py-1.5 rounded-lg border border-rose-200/70 text-xs flex items-center justify-between shadow-2xs gap-2"
                                >
                                  <span className="text-slate-700 font-normal truncate mr-1">
                                    trẻ nói: <span className="text-rose-700 font-medium">&ldquo;{ex.spokenText}&rdquo;</span>
                                  </span>
                                  {ex.timeSeconds > 0 && (
                                    <span className="text-[10px] text-slate-400 font-normal shrink-0 whitespace-nowrap">
                                      [{ex.timeSeconds}s]
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className={cn("text-center text-xs italic flex items-center justify-center gap-1 font-normal", isNotPracticed ? "text-slate-400" : "text-emerald-600 font-medium")}>
                              {isNotPracticed ? (
                                "Chưa có lượt phát âm trong mốc này"
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                  Bé phát âm rất chuẩn, không sai lần nào!
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Timestamp */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Lần tập: <span className="text-slate-600 font-medium">{isNotPracticed ? `Toàn kỳ: ${formatVocabDate(item.allTimeLastPracticed)}` : formatVocabDate(item.lastPracticed)}</span></span>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>

      {/* 6. Multi functional search & search filter options for the table analysis rows */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3" id="table-search-box-wrap">

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm dòng nhật ký phân tích (Ví dụ: Leo, Sophia, vần uô, Cần hỗ trợ...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Progress level dropdown selector */}
          <CustomSelect
            value={filterProgressLevel}
            onChange={setFilterProgressLevel}
            options={[
              { value: 'ALL', label: 'MỨC TIẾN TRÌNH (TẤT CẢ)' },
              { value: 'Improving', label: 'ĐANG TIẾN BỘ' },
              { value: 'Stable', label: 'ỔN ĐỊNH' },
              { value: 'Need Support', label: 'CẦN HỖ TRỢ' }
            ]}
            className="w-full md:w-56"
          />

          {/* Refresh parameters */}
          {(searchQuery || filterProgressLevel !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterProgressLevel('ALL');
                showToast('Đã dọn dẹp các màng lọc bảng!', 'info');
              }}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ListRestart className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* 6. Robust Table list of historical and current Analysis instances */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden" id="analysis-table-block">

        {filteredAnalysesList.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100">
              <ShieldAlert className="w-8 h-8 text-gray-300 animate-pulse" />
            </div>
            <p className="text-base font-bold text-gray-700">Không tìm thấy phân tích tiến bộ của dải dữ liệu được chọn!</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto font-normal">Vui lòng điều hòa lại bộ lọc góc nhìn giảng dạy hoặc chọn học sinh khác trên thanh công cụ.</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FDFCF5]/60 border-b border-gray-100 text-[#555] font-medium text-xs uppercase tracking-wider">
                  <th
                    onClick={() => handleSort('AnalysisId')}
                    className="py-5 px-10 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                    title="Sắp xếp theo Mã phân tích"
                  >
                    <div className="flex items-center gap-1.5">
                      ID
                      {sortColumn === 'AnalysisId' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('ChildId')}
                    className="py-5 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                    title="Sắp xếp theo Học sinh"
                  >
                    <div className="flex items-center gap-1.5">
                      Học sinh
                      {sortColumn === 'ChildId' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('TotalExercises')}
                    className="py-5 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-center"
                    title="Sắp xếp theo Tổng bài chơi"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Tổng bài chơi
                      {sortColumn === 'TotalExercises' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('CompletedExercises')}
                    className="py-5 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-center"
                    title="Sắp xếp theo Đã vượt ải"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Đã vượt ải
                      {sortColumn === 'CompletedExercises' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th className="py-5 px-6 text-center select-none">Tỷ lệ</th>
                  <th
                    onClick={() => handleSort('AverageScore')}
                    className="py-5 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-center"
                    title="Sắp xếp theo Điểm trung bình"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Điểm trung bình
                      {sortColumn === 'AverageScore' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th className="py-5 px-10 text-right select-none">Tùy chọn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {sortedAnalysesList.map((anItem) => {
                  const subChild = getChildDetails(anItem.ChildId);
                  const completionPercentage = anItem.TotalExercises > 0 ? Math.round((anItem.CompletedExercises / anItem.TotalExercises) * 100) : 0;

                  return (
                    <tr key={anItem.AnalysisId} className="hover:bg-slate-50/50 transition-colors">

                      {/* Analysis ID */}
                      <td className="py-5 px-10 font-mono text-gray-400 text-xs font-normal">
                        {anItem.AnalysisId}
                      </td>

                      {/* Child spec */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveAvatarUrl(subChild.Avatar, subChild.FullName, 'bottts')}
                            alt={subChild.FullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                          />
                          <div>
                            <div className="text-gray-900 font-semibold text-sm md:text-base leading-none">
                              {subChild.FullName}
                            </div>
                            <span className="text-[10px] text-gray-400 tracking-tight font-normal">
                              Tuổi: {subChild.Age} | Trình độ: {subChild.LearningLevel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total Exercises */}
                      <td className="py-5 px-6 text-center font-mono text-gray-500">
                        {anItem.TotalExercises > 0 ? `${anItem.TotalExercises} ải` : '--'}
                      </td>

                      {/* Completed Exercises */}
                      <td className="py-5 px-6 text-center font-mono text-emerald-600 font-medium">
                        {anItem.TotalExercises > 0 ? `${anItem.CompletedExercises} ải` : '--'}
                      </td>

                      {/* Percentage gauge info */}
                      <td className="py-5 px-6 text-center">
                        {anItem.TotalExercises > 0 ? (
                          <div className="space-y-1 inline-block">
                            <span className="text-xs font-medium text-gray-700">{completionPercentage}%</span>
                            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionPercentage}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-normal text-gray-400">--</span>
                        )}
                      </td>

                      {/* Avg Score rating */}
                      <td className="py-5 px-6 text-center">
                        {anItem.TotalExercises > 0 ? (
                          <span className={cn(
                            "font-semibold text-base",
                            anItem.AverageScore >= 85 ? 'text-[#34A853]' : anItem.AverageScore >= 60 ? 'text-[#20D0D4]' : 'text-[#FF8E8E]'
                          )}>
                            {anItem.AverageScore} đ
                          </span>
                        ) : (
                          <span className="text-xs font-normal text-gray-400">--</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-5 px-10 text-right">
                        <div className="flex items-center justify-end gap-1.5">

                          {/* Details interactive modal trigger */}
                          <ActionButton
                            type="view"
                            onClick={() => handleOpenAnalysisModal(anItem)}
                            title="Truy cập sâu thông tin chi tiết"
                          />

                          {/* Trigger mock export report PDF with feedback toast */}
                          <button
                            onClick={() => handleSimulateReportExport(anItem.ChildId, anItem.AnalysisId)}
                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                            title="Xuất báo cáo PDF học đường"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Simulate checking secondary logs with details toast */}
                          <button
                            onClick={() => {
                              const k_name = getChildDetails(anItem.ChildId).FullName;
                              showToast(`Mở dải nhật ký chi tiết lớp học VR của: "${k_name}" thành công!`, 'info');
                            }}
                            className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-600 hover:text-white rounded-xl transition-all"
                            title="Xem lịch sử tương tác lớp học"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 7. Detailed Analysis Assessment Interactive Modal Component */}
      <AnimatePresence>
        {isDetailOpen && selectedAnalysis && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/20 animate-in fade-in duration-300 overflow-y-auto w-full h-full">

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col my-8"
              id="analysis-detail-modal"
            >

              {/* Modal header */}
              <div className="bg-[#E2F2F3] px-8 py-6 flex items-center justify-between border-b border-[#C5E1E3] text-gray-900">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-[#4EACAF] text-white px-2.5 py-0.5 rounded-lg text-[10px] font-medium uppercase tracking-wider">
                    <BrainCircuit className="w-3 h-3 animate-ping" />
                    Phân tích tiến độ học tập sư phạm
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
                    Tổng duyệt kiểm tra tiến trình #{selectedAnalysis.AnalysisId}
                  </h2>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors shrink-0"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal assessment body with responsive columns */}
              <div className="app-modal-body p-8 space-y-6 overflow-y-auto max-h-[70vh]">

                {/* Child mini metadata panel */}
                <div className="bg-[#FDFCF5] p-5.5 rounded-3xl border border-yellow-105 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#4EACAF]">
                      <Baby className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-xs text-gray-400 uppercase tracking-wider">Hồ sơ học sinh:</h4>
                      <p className="text-base font-semibold text-gray-800 leading-tight">
                        {getChildDetails(selectedAnalysis.ChildId).FullName}
                      </p>
                      <p className="text-xs font-normal text-gray-400 mt-0.5">
                        Tuổi: {getChildDetails(selectedAnalysis.ChildId).Age} | Cấp học: {getChildDetails(selectedAnalysis.ChildId).LearningLevel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub statistics grid showing assessment details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-450 block uppercase font-medium tracking-wider mb-1">Mục bài thi cử</span>
                    <span className="text-slate-800 font-semibold text-lg">{selectedAnalysis.TotalExercises} bài</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-450 block uppercase font-medium tracking-wider mb-1">Đã hoàn thành đạt</span>
                    <span className="text-emerald-650 font-semibold text-lg">{selectedAnalysis.CompletedExercises} bài</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-450 block uppercase font-medium tracking-wider mb-1">Thời lượng tích dồn</span>
                    <span className="text-slate-800 font-semibold text-lg">{selectedAnalysis.TotalPracticeTime} Phút</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-450 block uppercase font-medium tracking-wider mb-1">Dải điểm kiểm định</span>
                    <span className="text-slate-800 font-semibold text-lg">{selectedAnalysis.AverageScore}/100đ</span>
                  </div>

                </div>

                {/* Phân tích tiến độ theo bài học */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#4EACAF]" />
                    Phân tích tiến bộ chi tiết theo bài học
                  </h4>

                  {loadingProgressDetails ? (
                    <div className="py-8 text-center">
                      <Activity className="w-6 h-6 text-[#4EACAF] animate-spin mx-auto mb-2" />
                      <p className="text-xs font-medium text-slate-500">Đang phân tích dữ liệu so sánh tiến trình...</p>
                    </div>
                  ) : lessonProgressList.length === 0 ? (
                    <div className="py-8 text-center text-slate-450 border border-dashed border-slate-200 rounded-2xl">
                      <Info className="w-6 h-6 mx-auto mb-1.5 opacity-55 text-slate-400" />
                      <p className="text-xs font-normal">Chưa có bài học nào được luyện tập từ 2 lần trở lên để đánh giá tiến bộ.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lessonProgressList.map((progress, idx) => {
                        return (
                          <div
                            key={idx}
                            className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 space-y-4 text-left animate-in fade-in duration-350"
                          >
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 pb-3">
                              <div className="space-y-1">
                                <h5 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                                  <Award className="w-4 h-4 text-[#4EACAF]" />
                                  {progress.lessonName}
                                </h5>
                                <span className="text-[10.5px] font-normal text-slate-400 block">
                                  Tổng số: {progress.totalAttempts} lượt thực hành
                                </span>
                              </div>

                              {/* Progress status tag */}
                              <div className="self-start sm:self-auto">
                                {progress.status === 'improving' && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium uppercase tracking-wider">
                                    🚀 Tiến bộ vượt bậc
                                  </span>
                                )}
                                {progress.status === 'accuracy_up' && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium uppercase tracking-wider">
                                    📈 Tăng chính xác
                                  </span>
                                )}
                                {progress.status === 'speed_up' && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-medium uppercase tracking-wider">
                                    ⚡ Tăng tốc độ
                                  </span>
                                )}
                                {progress.status === 'needs_practice' && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-xs font-medium uppercase tracking-wider">
                                    ⚠️ Cần ôn tập thêm
                                  </span>
                                )}
                                {progress.status === 'stable' && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-105 text-slate-700 border border-slate-200 rounded-full text-xs font-medium uppercase tracking-wider">
                                    🟢 Duy trì ổn định
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Comparison Metrics Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Score Comparison */}
                              <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Điểm số</span>
                                  <div className="text-xs font-medium text-slate-750">
                                    {progress.firstAttempt.score}đ → {progress.latestAttempt.score}đ
                                  </div>
                                </div>
                                <span className={cn(
                                  "text-xs font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg",
                                  progress.metrics.scoreDiff > 0
                                    ? "bg-emerald-50 text-emerald-600"
                                    : progress.metrics.scoreDiff < 0
                                      ? "bg-rose-50 text-rose-600"
                                      : "bg-slate-50 text-slate-500"
                                )}>
                                  {progress.metrics.scoreDiff > 0 && <ArrowUp className="w-3 h-3" />}
                                  {progress.metrics.scoreDiff < 0 && <ArrowDown className="w-3 h-3" />}
                                  {progress.metrics.scoreDiff === 0 ? '0' : `${progress.metrics.scoreDiff > 0 ? '+' : ''}${progress.metrics.scoreDiff}`}
                                </span>
                              </div>

                              {/* Duration Comparison */}
                              <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Thời lượng</span>
                                  <div className="text-xs font-medium text-slate-750">
                                    {progress.firstAttempt.durationSeconds}s → {progress.latestAttempt.durationSeconds}s
                                  </div>
                                </div>
                                <span className={cn(
                                  "text-xs font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg",
                                  progress.metrics.durationDiff > 0
                                    ? "bg-emerald-50 text-emerald-600"
                                    : progress.metrics.durationDiff < 0
                                      ? "bg-rose-50 text-rose-600"
                                      : "bg-slate-50 text-slate-500"
                                )}>
                                  {progress.metrics.durationDiff > 0 && <ArrowDown className="w-3 h-3 text-emerald-600" />}
                                  {progress.metrics.durationDiff < 0 && <ArrowUp className="w-3 h-3 text-rose-600" />}
                                  {progress.metrics.durationDiff === 0 ? '0s' : `${progress.metrics.durationDiff > 0 ? '-' : '+'}${Math.abs(progress.metrics.durationDiff)}s`}
                                </span>
                              </div>

                              {/* Accuracy Comparison */}
                              <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Lỗi phát âm</span>
                                  <div className="text-xs font-medium text-slate-750">
                                    {progress.firstAttempt.errorCount} lỗi → {progress.latestAttempt.errorCount} lỗi
                                  </div>
                                </div>
                                <span className={cn(
                                  "text-xs font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg",
                                  progress.metrics.errorDiff > 0
                                    ? "bg-emerald-50 text-emerald-600"
                                    : progress.metrics.errorDiff < 0
                                      ? "bg-rose-50 text-rose-600"
                                      : "bg-slate-50 text-slate-500"
                                )}>
                                  {progress.metrics.errorDiff > 0 && <ArrowDown className="w-3 h-3 text-emerald-600" />}
                                  {progress.metrics.errorDiff < 0 && <ArrowUp className="w-3 h-3 text-rose-600" />}
                                  {progress.metrics.errorDiff === 0 ? '0' : `${progress.metrics.errorDiff > 0 ? '-' : '+'}${Math.abs(progress.metrics.errorDiff)}`}
                                </span>
                              </div>
                            </div>

                            {/* Educational Explanation Box */}
                            <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200/50 text-xs text-slate-600 leading-relaxed font-normal flex items-start gap-2">
                              <Info className="w-4 h-4 text-[#4EACAF] shrink-0 mt-0.5" />
                              <span>{progress.description}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Modal footer controls with action triggers conforms to strict UI guidelines */}
              <div className="bg-gray-50 px-8 py-5 flex items-center justify-between border-t border-gray-100">
                <span className="text-[10px] text-gray-400 font-normal italic">
                  Cập nhật sau cùng lúc: {selectedAnalysis.LastAnalyzedAt}
                </span>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      handleSimulateReportExport(selectedAnalysis.ChildId, selectedAnalysis.AnalysisId);
                    }}
                    className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    Báo cáo gốc PDF
                  </button>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="px-4.5 py-2.5 bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white rounded-2xl text-xs font-medium transition-colors"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
