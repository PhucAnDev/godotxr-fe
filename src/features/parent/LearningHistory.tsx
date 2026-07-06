import { useState, useMemo, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import ActionButton from '../../components/common/ActionButton';
import CustomSelect from '../../components/common/CustomSelect';
import { getMyChildProfiles } from '../../services/childProfileService';
import { getResultsByChild } from '../../services/resultService';
import { getLessons } from '../../services/lessonService';
import { getExercises } from '../../services/exerciseService';
import type { ChildProfileResponse } from '../../services/childProfileService';
import type { ResultResponse } from '../../services/resultService';

export default function LearningHistory() {
  const navigate = useNavigate();

  const [children, setChildren] = useState<ChildProfileResponse[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  
  const [lessons, setLessons] = useState<Record<number, string>>({});
  const [exercises, setExercises] = useState<Record<number, string>>({});
  
  const [results, setResults] = useState<ResultResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Filter states
  const [timeRange, setTimeRange] = useState<string>('30');
  const [activityType, setActivityType] = useState<string>('ALL');

  // Sorting states
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch children
      const childrenResult = await getMyChildProfiles();
      let firstChildId: number | null = null;
      if (childrenResult.success && childrenResult.data && childrenResult.data.length > 0) {
        setChildren(childrenResult.data);
        firstChildId = childrenResult.data[0].id;
        setSelectedChildId(firstChildId);
      } else {
        setChildren([]);
      }

      // 2. Fetch lessons (page 1, size 100)
      const lessonsResult = await getLessons(1, 100);
      if (lessonsResult.success && lessonsResult.data?.items) {
        const lessonsMap: Record<number, string> = {};
        lessonsResult.data.items.forEach(l => {
          lessonsMap[l.id] = l.lessonName;
        });
        setLessons(lessonsMap);
      }

      // 3. Fetch exercises (page 1, size 100)
      const exercisesResult = await getExercises(1, 100);
      if (exercisesResult.success && exercisesResult.data?.items) {
        const exercisesMap: Record<number, string> = {};
        exercisesResult.data.items.forEach(e => {
          exercisesMap[e.id] = e.exerciseName;
        });
        setExercises(exercisesMap);
      }

      // 4. Fetch results for the first child if any
      if (firstChildId !== null) {
        const resultsResult = await getResultsByChild(firstChildId);
        if (resultsResult.success && resultsResult.data) {
          setResults(resultsResult.data);
        } else {
          setResults([]);
        }
      }
    } catch (error) {
      console.error('Error loading learning history initial data', error);
    } finally {
      setIsLoading(false);
      setIsDataLoaded(true);
    }
  };

  useEffect(() => {
    void loadInitialData();
  }, []);

  const handleChildChange = async (childId: number) => {
    setSelectedChildId(childId);
    setIsLoading(true);
    try {
      const resultsResult = await getResultsByChild(childId);
      if (resultsResult.success && resultsResult.data) {
        setResults(resultsResult.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Error fetching results for child', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: string) => {
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

  const getItemName = (item: ResultResponse) => {
    if (item.lessonId && lessons[item.lessonId]) {
      return lessons[item.lessonId];
    }
    if (item.exerciseId && exercises[item.exerciseId]) {
      return exercises[item.exerciseId];
    }
    if (item.lessonId) return `Bài học #${item.lessonId}`;
    if (item.exerciseId) return `Bài tập #${item.exerciseId}`;
    return `Buổi học #${item.id}`;
  };

  const getDurationText = (seconds: number) => {
    if (seconds <= 0) return '0 phút';
    const mins = Math.max(1, Math.round(seconds / 60));
    return `${mins} phút`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '---';
    try {
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day} Thg ${month}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  const getMappedStatus = (item: ResultResponse) => {
    if (!item.isFinalized) return 'Đang xử lý';
    if (item.completionStatus === 'Completed' || item.completionStatus === 'Success') return 'Hoàn thành';
    return 'Chưa đồng bộ';
  };

  // Filter logic
  const filteredResults = useMemo(() => {
    let list = results;

    // Filter by Time Range
    if (timeRange !== 'ALL') {
      const days = parseInt(timeRange) || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      list = list.filter(item => {
        const dateStr = item.completedAt || item.startedAt;
        if (!dateStr) return false;
        return new Date(dateStr).getTime() >= cutoffDate.getTime();
      });
    }

    // Filter by Activity Type
    if (activityType !== 'ALL') {
      if (activityType === 'LESSON') {
        list = list.filter(item => item.lessonId !== null && item.lessonId !== undefined);
      } else if (activityType === 'EXERCISE') {
        list = list.filter(item => item.exerciseId !== null && item.exerciseId !== undefined);
      }
    }

    return list;
  }, [results, timeRange, activityType]);

  // Sort logic
  const sortedHistory = useMemo(() => {
    const list = [...filteredResults];
    if (!sortColumn || !sortDirection) return list;

    return list.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortColumn === 'name') {
        valA = getItemName(a);
        valB = getItemName(b);
      } else if (sortColumn === 'duration') {
        valA = a.durationSeconds;
        valB = b.durationSeconds;
      } else if (sortColumn === 'date') {
        valA = new Date(a.completedAt || a.startedAt || 0).getTime();
        valB = new Date(b.completedAt || b.startedAt || 0).getTime();
      } else if (sortColumn === 'status') {
        valA = getMappedStatus(a);
        valB = getMappedStatus(b);
      } else {
        valA = a[sortColumn as keyof typeof a];
        valB = b[sortColumn as keyof typeof b];
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB, 'vi-VN', { numeric: true })
          : valB.localeCompare(valA, 'vi-VN', { numeric: true });
      }
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredResults, sortColumn, sortDirection, lessons, exercises]);

  // Options for custom selects
  const childOptions = useMemo(() => {
    return children.length > 0 
      ? children.map(child => ({ value: String(child.id), label: child.fullName }))
      : [{ value: '', label: 'Không có hồ sơ bé' }];
  }, [children]);

  const timeRangeOptions = [
    { value: '7', label: '7 Ngày Qua' },
    { value: '30', label: '30 Ngày Qua' },
    { value: '90', label: '90 Ngày Qua' },
    { value: 'ALL', label: 'Tất cả thời gian' },
  ];

  const activityTypeOptions = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'LESSON', label: 'Bài học' },
    { value: 'EXERCISE', label: 'Bài tập' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Lịch sử Học Tập Của Bé</h1>
          <p className="text-gray-500 mt-1">Theo dõi quá trình tiến bộ của bé qua các buổi học VR.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadInitialData()}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-white/80 cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          Làm mới
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-[#E2F2F3] rounded-[32px] p-6 shadow-inner border border-[#C5E1E3] grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-xs font-black text-[#264E50] uppercase tracking-wide ml-1">Chọn bé:</label>
          <CustomSelect
            value={String(selectedChildId || '')}
            onChange={(val) => handleChildChange(Number(val))}
            options={childOptions}
            variant="filter"
            disabled={children.length === 0}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-[#264E50] uppercase tracking-wide ml-1">Khoảng thời gian:</label>
          <CustomSelect
            value={timeRange}
            onChange={setTimeRange}
            options={timeRangeOptions}
            variant="filter"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-[#264E50] uppercase tracking-wide ml-1">Loại bài tập:</label>
          <CustomSelect
            value={activityType}
            onChange={setActivityType}
            options={activityTypeOptions}
            variant="filter"
          />
        </div>
      </div>

      {/* Table & states */}
      {isLoading && sortedHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-[32px] border border-gray-100 shadow-sm">
          <RefreshCw className="h-10 w-10 text-[#4EACAF] animate-spin" />
          <p className="text-gray-500 font-bold">Đang tải lịch sử học tập...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th 
                  onClick={() => handleSort('name')}
                  className="px-8 py-6 text-sm font-bold text-gray-600 uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                  title="Sắp xếp theo Tên bài tập"
                >
                  <div className="flex items-center gap-1.5">
                    Tên bài tập
                    {sortColumn === 'name' ? (
                      sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('duration')}
                  className="px-8 py-6 text-sm font-bold text-gray-600 uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                  title="Sắp xếp theo Thời lượng"
                >
                  <div className="flex items-center gap-1.5">
                    Thời lượng
                    {sortColumn === 'duration' ? (
                      sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('date')}
                  className="px-8 py-6 text-sm font-bold text-gray-600 uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                  title="Sắp xếp theo Ngày học"
                >
                  <div className="flex items-center gap-1.5">
                    Ngày học
                    {sortColumn === 'date' ? (
                      sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-8 py-6 text-sm font-bold text-gray-600 uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                  title="Sắp xếp theo Trạng thái"
                >
                  <div className="flex items-center gap-1.5">
                    Trạng thái
                    {sortColumn === 'status' ? (
                      sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>
                <th className="px-8 py-6 text-sm font-bold text-gray-600 uppercase tracking-widest text-right select-none">Tùy chọn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 font-bold text-gray-900">{getItemName(item)}</td>
                  <td className="px-8 py-6 text-gray-500 font-medium">{getDurationText(item.durationSeconds)}</td>
                  <td className="px-8 py-6 text-gray-500 font-medium">{formatDate(item.completedAt || item.startedAt)}</td>
                  <td className="px-8 py-6">
                     <StatusBadge status={getMappedStatus(item)} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <ActionButton 
                      type="view"
                      onClick={() => navigate('/parent/lesson-review')}
                      disabled={!item.isFinalized}
                      title="Xem lại bài học"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedHistory.length === 0 && (
            <div className="text-center py-20 text-gray-400 font-bold italic bg-white">
              Không tìm thấy lịch sử học tập nào
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Hoàn thành': 'bg-[#E8F5E9] text-[#2E7D32]',
    'Chưa đồng bộ': 'bg-[#FFF3E0] text-[#EF6C00]',
    'Đang xử lý': 'bg-[#F3E5F5] text-[#7B1FA2]',
  };
  
  return (
    <span className={cn('px-4 py-1 rounded-full text-xs font-bold ring-1 ring-inset ring-current/10', styles[status])}>
      {status}
    </span>
  );
}
