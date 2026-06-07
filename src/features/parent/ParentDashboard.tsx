import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Play } from 'lucide-react';
import { cn } from '../../lib/utils';

const data = [
  { day: 'T2', mins: 15 },
  { day: 'T3', mins: 20 },
  { day: 'T4', mins: 10 },
  { day: 'T5', mins: 25 },
  { day: 'T6', mins: 20 },
  { day: 'T7', mins: 30 },
  { day: 'CN', mins: 0 },
];

export default function ParentDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Chào mừng trở lại, Phụ huynh</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Child Profile Card */}
        <div className="lg:col-span-2 bg-[#4EACAF] rounded-[32px] p-1 shadow-lg h-full">
          <div className="bg-white rounded-[31px] p-8 h-full flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 bg-orange-100 rounded-full border-4 border-[#FDFCF5] shadow-md flex-shrink-0 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Leo" alt="Leo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-3xl font-black text-gray-900">Leo <span className="text-xl font-medium text-gray-400">8 tuổi</span></h3>
              </div>
              <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                <p><span className="font-bold">Mô-đun hiện tại:</span> Phân biệt âm vị khó</p>
                <p><span className="font-bold">Cấp độ VR:</span> 4</p>
                <p><span className="font-bold">Tổng số phiên học VR:</span> 45</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Số buổi hoàn thành" value="12" subtext="(Tuần này)" color="bg-[#A4E0E2]" textColor="text-cyan-900" />
          <StatCard label="Tần suất luyện tập" value="4 lần/tuần" subtext="" color="bg-[#FFB783]" textColor="text-orange-900" />
          <StatCard label="Thời lượng gần nhất" value="25 phút" subtext="(Hôm qua)" color="bg-[#CFB6F2]" textColor="text-purple-900" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Streak View */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
           <h4 className="text-lg font-bold">Chuỗi hàng tuần</h4>
           <div className="flex items-center justify-between gap-2 px-2">
             {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm",
                    i < 6 ? "bg-[#20D0D4] text-white" : "bg-gray-100 text-gray-400"
                  )}>
                    {i < 6 && <Flame className="w-5 h-5 fill-current" />}
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase">{day}</span>
                </div>
             ))}
           </div>
           <p className="text-sm font-medium text-[#4EACAF] text-center pt-2">Chuỗi 5 ngày! Tiếp tục cố gắng!</p>
        </div>

        {/* Start Button Area */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div className="space-y-1">
             <h4 className="text-xl font-bold flex items-center gap-3 text-slate-800">Thông tin bài luyện VR hôm nay</h4>
             <p className="text-sm text-gray-500">Giám sát và xem nhiệm vụ được thiết lập sẵn trên kính VR.</p>
             <p className="text-xs text-[#4EACAF] font-semibold italic">Dữ liệu đồng bộ trực tiếp từ thiết bị kính VR của trẻ</p>
           </div>
           <button className="bg-[#4EACAF] hover:bg-[#3d8a8c] text-white px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 shadow-lg shadow-[#4EACAF]/20 transition-all active:scale-95 cursor-pointer shrink-0">
             <Play className="w-4 h-4 fill-current" />
             Xem bài luyện hôm nay
           </button>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold mb-8">Hoạt động luyện tập hàng tuần</h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#20D0D4" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#20D0D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#999', fontSize: 12, fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#999', fontSize: 12 }} 
                unit=" Phút"
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#20D0D4', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="mins" 
                stroke="#20D0D4" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorMins)" 
                dot={{ fill: '#20D0D4', strokeWidth: 4, stroke: '#fff', r: 6 }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, color, textColor }: { label: string; value: string; subtext: string; color: string; textColor: string }) {
  return (
    <div className={cn("rounded-[32px] p-6 flex flex-col justify-center items-center text-center shadow-sm", color, textColor)}>
      <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black">{value}</p>
      {subtext && <p className="text-xs font-medium opacity-60 mt-1">{subtext}</p>}
    </div>
  );
}
