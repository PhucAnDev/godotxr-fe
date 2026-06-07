import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter, FileText, Download, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const chartData = [
  { date: 'Oct 20', score: 15 },
  { date: 'Oct 22', score: 25 },
  { date: 'Oct 24', score: 32 },
  { date: 'Oct 26', score: 45 },
  { date: 'Oct 28', score: 60 },
  { date: 'Oct 30', score: 85 },
];

export default function ReportGenerator() {
  const [success, setSuccess] = useState(false);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-black text-[#5C89C1] tracking-tight">Tạo Báo Cáo Kết Quả Học Tập</h1>
      </div>

      <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 space-y-10">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-end gap-6 pb-10 border-b border-gray-50">
           <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Chọn học sinh:</label>
              <div className="relative">
                <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-700 appearance-none outline-none focus:border-[#5C89C1]/30 transition-all cursor-pointer">
                  <option>Leo Chen</option>
                  <option>Lily Chen</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
           </div>
           <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Khoảng thời gian:</label>
              <div className="relative">
                <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-700 appearance-none outline-none focus:border-[#5C89C1]/30 transition-all cursor-pointer">
                  <option>30 Ngày Qua</option>
                  <option>90 Ngày Qua</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
           </div>
           <button className="px-10 py-5 bg-[#7CAE9B] text-white font-black rounded-2xl shadow-xl shadow-[#7CAE9B]/20 hover:scale-105 active:scale-95 transition-all">
             Áp dụng bộ lọc
           </button>
        </div>

        {/* Report Preview */}
        <div className="bg-gray-100 rounded-[32px] p-12 overflow-hidden relative">
           <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-16 space-y-10">
              <div className="flex justify-between items-start">
                 <div>
                   <h2 className="text-3xl font-black text-gray-900 mb-2">Báo cáo chuyên nghiệp - Giáo viên: Cô Trần</h2>
                   <p className="text-xl font-bold text-gray-500">Biểu đồ tiến độ (30 Ngày Qua)</p>
                 </div>
                 <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Lucky" alt="Logo" className="w-16 h-16 opacity-50" referrerPolicy="no-referrer" />
              </div>

              {/* Internal Report Chart */}
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <Area type="monotone" dataKey="score" stroke="#5C89C1" fill="#5C89C1" fillOpacity={0.1} strokeWidth={3} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="space-y-6">
                 <h3 className="text-xl font-black text-gray-900 border-b-2 border-gray-100 pb-2">Tóm tắt buổi học</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ReportItem title="Session 1" detail="Get 30 - Vocabulary (Score: 85%)" color="bg-blue-50 border-blue-100 text-blue-900" />
                    <ReportItem title="Session 2" detail="Get 25 - Pronunciation (Score: 92%)" color="bg-green-50 border-green-100 text-green-900" />
                    <ReportItem title="Session 3" detail="Get 20 - Fluency (Score: 80%)" color="bg-purple-50 border-purple-100 text-purple-900" />
                 </div>
              </div>
           </div>

           {/* Floating Action Button for Export */}
           <div className="absolute top-1/2 left-1/2 md:left-auto md:right-24 -translate-y-1/2 -translate-x-1/2 md:translate-x-0 scale-75 md:scale-100">
              <button 
                onClick={() => { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }}
                className="group relative flex items-center justify-center p-1 bg-white rounded-[40px] shadow-2xl overflow-hidden border-[10px] border-white focus:outline-none"
              >
                 <div className="bg-blue-600 px-16 py-8 rounded-[30px] flex items-center gap-6 group-hover:scale-105 transition-transform">
                   <span className="text-7xl font-black text-white italic">Xuất PDF</span>
                   <Download className="w-16 h-16 text-white" />
                 </div>
              </button>
           </div>
        </div>
      </div>

      {/* Success Toast */}
      <div className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[100] transform transition-all duration-500",
        success ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0 pointer-events-none"
      )}>
        <div className="bg-[#4EACAF] text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold">
           <CheckCircle2 className="w-5 h-5" />
           Báo cáo đã được tạo thành công
        </div>
      </div>
    </div>
  );
}

function ReportItem({ title, detail, color }: { title: string; detail: string; color: string }) {
  return (
    <div className={cn("p-6 rounded-3xl border-2 space-y-1", color)}>
       <p className="text-sm font-black uppercase tracking-widest">{title}</p>
       <p className="text-base font-bold opacity-80">{detail}</p>
    </div>
  );
}
