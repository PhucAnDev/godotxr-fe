import { useState, useMemo } from 'react';
import { Search, ChevronDown, Eye, Filter, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import ActionButton from '../../components/common/ActionButton';

const historyData = [
  { id: 1, name: 'Phiêu lưu ngôn ngữ: Nông trại', duration: '12 phút', date: '10 Thg 11, 2023', status: 'Hoàn thành' },
  { id: 2, name: 'Luyện từ: Màu sắc', duration: '8 phút', date: '9 Thg 11, 2023', status: 'Chưa đồng bộ' },
  { id: 3, name: 'Kể chuyện: Thỏ và Rùa', duration: '15 phút', date: '8 Thg 11, 2023', status: 'Đang xử lý' },
  { id: 4, name: 'Phát âm bậc 1: Phụ âm đơn', duration: '10 phút', date: '7 Thg 11, 2023', status: 'Hoàn thành' },
];

export default function LearningHistory() {
  const navigate = useNavigate();

  // Sorting states
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

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

  const sortedHistory = useMemo(() => {
    if (!sortColumn || !sortDirection) return historyData;
    return [...historyData].sort((a, b) => {
      let valA: any = a[sortColumn as keyof typeof a];
      let valB: any = b[sortColumn as keyof typeof b];

      // Custom conversion for dates to sort chronologically: "10 Thg 11, 2023" -> Date
      if (sortColumn === 'date') {
        const parseDate = (dStr: string) => {
          const parts = dStr.split(' ');
          const day = parseInt(parts[0]) || 1;
          const month = parseInt(parts[2].replace(',', '')) || 1;
          const year = parseInt(parts[3]) || 2026;
          return new Date(year, month - 1, day).getTime();
        };
        valA = parseDate(valA);
        valB = parseDate(valB);
      } else if (sortColumn === 'duration') {
        // "12 phút" -> 12
        valA = parseInt(valA) || 0;
        valB = parseInt(valB) || 0;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB, 'vi-VN')
          : valB.localeCompare(valA, 'vi-VN');
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [sortColumn, sortDirection]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Lịch sử Học Tập Của Bé</h1>
          <p className="text-gray-500 mt-1">Theo dõi quá trình tiến bộ của bé qua các buổi học.</p>
        </div>
        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
           <button className="px-6 py-2 bg-[#4EACAF] text-white rounded-xl font-bold">Tất cả</button>
           <button className="px-6 py-2 text-gray-400 font-medium">Theo tháng</button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-[#E2F2F3] rounded-[32px] p-6 shadow-inner border border-[#C5E1E3] grid grid-cols-1 md:grid-cols-3 gap-6">
        <FilterGroup label="Chọn bé" value="Leo" />
        <FilterGroup label="Khoảng thời gian" value="30 Ngày Qua" />
        <FilterGroup label="Loại bài tập" value="Tất cả" />
      </div>

      {/* Table */}
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
                <td className="px-8 py-6 font-bold text-gray-900">{item.name}</td>
                <td className="px-8 py-6 text-gray-500 font-medium">{item.duration}</td>
                <td className="px-8 py-6 text-gray-500 font-medium">{item.date}</td>
                <td className="px-8 py-6">
                   <StatusBadge status={item.status} />
                </td>
                <td className="px-8 py-6 text-right">
                  <ActionButton 
                    type="view"
                    onClick={() => navigate('/parent/lesson-review')}
                    disabled={item.status !== 'Hoàn thành'}
                    title="Xem lại bài học"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterGroup({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-[#264E50] uppercase tracking-wide ml-1">{label}:</label>
      <div className="relative">
        <select className="w-full bg-white border-2 border-white rounded-2xl px-5 py-3 font-semibold text-gray-700 appearance-none shadow-sm outline-none focus:border-[#4EACAF]/30 transition-all cursor-pointer">
          <option>{value}</option>
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
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
    <span className={cn("px-4 py-1 rounded-full text-xs font-bold ring-1 ring-inset ring-current/10", styles[status])}>
      {status}
    </span>
  );
}
