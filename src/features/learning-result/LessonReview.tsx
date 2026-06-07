import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, Clock, FileText, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function LessonReview() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Chi Tiết Xem Lại Buổi Học VR</h1>
          <p className="text-sm text-gray-400 mt-1">Replay session & biểu đồ âm học được biên dịch từ phiên học VR độc lập của trẻ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Video Player Side */}
        <div className="xl:col-span-2 space-y-4">
          <div className="relative group bg-black rounded-[32px] overflow-hidden shadow-2xl aspect-video border-[12px] border-white">
            <img 
              src="https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=2000&auto=format&fit=crop" 
              alt="Review Session" 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
                        <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform group-hover:bg-white/30 cursor-pointer">
                <Play className="w-10 h-10 text-white fill-current translate-x-1" />
              </button>
            </div>

            {/* Hint label over replay */}
            <div className="absolute top-6 left-6 bg-[#1D1D1D]/75 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Replay session từ ứng dụng VR</p>
            </div>

            {/* Video Controls bar (simplified) */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4">
               <div className="h-2 bg-white/20 rounded-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 bg-[#4EACAF] w-1/3" />
                  <div className="absolute top-0 left-[32%] w-4 h-4 bg-white rounded-full -mt-1 shadow-md cursor-pointer" />
               </div>
               <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-6">
                    <SkipBack className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100" />
                    <Play className="w-6 h-6 cursor-pointer fill-current" />
                    <SkipForward className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100" />
                    <span className="text-sm font-mono font-medium">04:25 / 15:00</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <Volume2 className="w-5 h-5 cursor-pointer" />
                    <Maximize className="w-5 h-5 cursor-pointer" />
                  </div>
               </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100/80">
            <p className="text-xs font-semibold leading-relaxed">
              * Lưu ý: Đoạn video trên mô phỏng góc nhìn của trẻ từ bên trong thiết bị VR trong buổi rèn luyện phụ âm. Hành vi chuyển động tay, hướng nhìn và giọng nói được ghi trực tiếp phục vụ cho quá trình giám định sư phạm.
            </p>
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#FFF3E0] rounded-[32px] p-8 shadow-sm border border-orange-100/50">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              Thông tin phiên học
            </h4>
            <div className="space-y-2 text-gray-700 text-sm">
               <p><span className="font-bold text-gray-400">Trẻ:</span> Leo (8 tuổi)</p>
               <p><span className="font-bold text-gray-400">Ngày:</span> 29 tháng 5, 2026</p>
               <p><span className="font-bold text-gray-400">Thời lượng VR:</span> 15 phút</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-400" />
              Điểm Luyện Âm & Ghi Âm
            </h4>
            <p className="text-xs text-gray-400 mb-4 italic">Audio recording được lưu tự động sau buổi luyện tập VR để giáo viên nghe lại</p>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
              <p className="text-sm font-bold text-gray-600 italic">Bài tập phụ âm khó - Nông trại vui vẻ</p>
              <div className="flex items-center gap-4">
                 <div className="h-10 flex-1 flex items-center gap-1">
                    {[1,2,1,3,2,1,4,2,3,2,1,3,2,4,2,1,2,3,2,1,2,3,4,1,2,3,2,1].map((h, i) => (
                      <div key={i} className="bg-blue-200 w-1 flex-1 rounded-full" style={{ height: `${h * 20}%` }} />
                    ))}
                 </div>
                 <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md transform hover:scale-110 active:scale-95 transition-all cursor-pointer">
                    <Play className="w-5 h-5 text-white fill-current translate-x-0.5" />
                 </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Nhật Ký Tương Tác VR
            </h4>
            <p className="text-xs text-gray-400 mb-4 italic">Replay session ghi nhận hành vi tương tác từ ứng dụng VR</p>
            <div className="space-y-4">
               <EventItem time="01:20" label='Khó khăn phát âm phụ âm: "Tr / Ch"' color="bg-orange-100/70 text-orange-700" />
               <EventItem time="03:45" label='Vượt ải phát âm đúng từ: "Trái cam"' color="bg-[#F2FAF4] text-[#34A853]" />
               <EventItem time="07:30" label="Nhắc nhở âm vị hệ thống tự động kích hoạt" color="bg-purple-100/70 text-purple-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventItem({ time, label, color }: { time: string; label: string; color: string }) {
  return (
    <div className={cn("p-4 rounded-2xl flex items-center gap-4 transition-all hover:translate-x-1", color)}>
      <span className="font-mono font-bold opacity-60">{time}</span>
      <span className="font-bold text-sm">{label}</span>
    </div>
  );
}
