import { Users, GraduationCap, BookOpen, UserPlus, Layers, Bell, Search, ArrowUpRight, Play, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header page component */}
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <Layers className="w-3.5 h-3.5 animate-pulse" />
            Tổng quan quản trị hệ thống
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Bảng Điều Khiển <span className="text-[#4EACAF]">Hệ Thống</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Quản lý tài nguyên, người dùng và giám sát chỉ số đồng hành GodotXR
          </p>
        </div>
        <div className="flex items-center gap-4 self-stretch sm:self-auto shrink-0">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm hệ thống..." 
              className="pl-11 pr-4 py-3.5 text-sm rounded-2xl bg-white/60 border border-slate-200 outline-none w-full sm:w-60 focus:bg-white focus:border-[#4EACAF] transition-all font-semibold" 
            />
          </div>
          <button className="p-3.5 bg-white/60 border border-slate-200 rounded-2xl relative hover:bg-white transition-colors cursor-pointer shrink-0">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#FF8E8E] rounded-full ring-2 ring-white animate-pulse" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid - Standardized spacing, border and shadow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatCard 
          label="Tổng người dùng" 
          value="12,450" 
          growth="+350 Người quản trị mới tuần này" 
          icon={<Users className="w-6 h-6" />} 
          color="text-teal-600"
          bgColor="bg-teal-50 border-teal-100"
        />
        <AdminStatCard 
          label="Tổng giáo viên" 
          value="850" 
          growth="42 Tài khoản đang chờ duyệt" 
          icon={<GraduationCap className="w-6 h-6" />} 
          color="text-blue-600"
          bgColor="bg-blue-50 border-blue-100"
        />
        <AdminStatCard 
          label="Tổng lượt tập" 
          value="54,320" 
          growth="1,200 Lượt buổi hôm nay" 
          icon={<Play className="w-6 h-6" />} 
          color="text-emerald-600"
          bgColor="bg-emerald-50 border-emerald-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Quick Actions Component */}
         <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h4 className="text-lg font-bold text-slate-800">Thao tác quản trị nhanh</h4>
              <p className="text-xs text-slate-400 mt-1">Điều hướng tới các phân khu quản lý một chạm</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button className="flex items-center justify-between p-5 bg-[#4EACAF] hover:bg-[#3d8a8c] text-white rounded-xl shadow-sm transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5" />
                    <span className="font-bold text-sm">Quản lý người dùng</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </button>
               <button className="flex items-center justify-between p-5 bg-[#4EACAF] hover:bg-[#3d8a8c] text-white rounded-xl shadow-sm transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5" />
                    <span className="font-bold text-sm">Quản lý lớp học</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </button>
            </div>
         </div>

         {/* Recent System Activity */}
         <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-5">
            <div>
              <h4 className="text-lg font-bold text-slate-800">Hoạt động hệ thống gần đây</h4>
              <p className="text-xs text-slate-400 mt-1">Báo cáo trực tiếp các biến động trong 30 phút qua</p>
            </div>
            <div className="space-y-3.5">
               <ActivityItem time="10:15 AM" user="Ms. Trần Hồng" action="đã tạo lớp mới" target="Speech Explorers" />
               <ActivityItem time="10:05 AM" user="Bé Leo M." action="hoàn thành buổi học" target="Level 2, Unit 3" />
               <ActivityItem time="09:45 AM" user="Cảnh báo hệ thống" action="tải CPU máy chủ vượt ngưỡng 80%" status="warning" />
            </div>
         </div>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, growth, icon, color, bgColor }: { label: string; value: string; growth: string; icon: any; color: string; bgColor: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden group transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 font-black uppercase text-xs tracking-wider">{label}</p>
        <div className={cn("p-2.5 rounded-xl border", bgColor, color)}>
          {icon}
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
         <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
         <p className="text-xs font-semibold text-slate-400">{growth}</p>
      </div>
    </div>
  );
}

function ActivityItem({ time, user, action, target, status }: { time: string; user: string; action: string; target?: string; status?: string }) {
  return (
    <div className={cn("p-3 px-4 rounded-xl flex items-center gap-4 text-xs transition-colors hover:bg-slate-50", status === 'warning' ? 'bg-amber-50/70 border border-amber-100' : 'bg-slate-50/50 border border-slate-100')}>
      <div className="font-mono font-bold text-slate-400 select-none">{time}</div>
      <div className="flex-1 text-slate-600">
         <span className={cn("font-bold", status === 'warning' ? 'text-amber-800' : 'text-slate-800')}>{user}</span>
         <span className="italic"> {action}</span>
         {target && <span className="font-bold text-slate-800"> "{target}"</span>}
      </div>
    </div>
  );
}
