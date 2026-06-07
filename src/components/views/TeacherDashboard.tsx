import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Eye, 
  Settings, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  School, 
  UserSquare2, 
  TrendingUp, 
  CheckCircle, 
  Info,
  Calendar,
  Volume2
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function TeacherDashboard() {
  const navigate = useNavigate();

  // Mock data for recent practices
  const [recentPractices] = useState([
    { id: '1', name: 'Nguyễn Tiến Minh (Leo)', age: 8, class: 'Lớp VR Phát Âm 1', exercise: 'Vật phẩm nông trại (Vần O)', score: 96, date: '10 phút trước', progress: 'Improving', needSupport: false },
    { id: '2', name: 'Phạm Minh Khang', age: 4, class: 'Lớp Sửa Ngọng S-X', exercise: 'Trò chơi đường đua (Phụ âm S)', score: 50, date: '1 giờ trước', progress: 'Need Support', needSupport: true },
    { id: '3', name: 'Trần Thảo Linh (Sophia)', age: 6, class: 'Lớp VR Phát Âm 1', exercise: 'Cụm từ ghép kì ảo (Âm kép)', score: 82, date: '3 giờ trước', progress: 'Improving', needSupport: false },
    { id: '4', name: 'Hoàng Anh Thư', age: 5, class: 'Lớp VR Phát Âm 1', exercise: 'Từ đơn lặp vần (Ghép âm)', score: 92, date: 'Hôm qua', progress: 'Stable', needSupport: false },
    { id: '5', name: 'Phạm Minh Hải', age: 7, class: 'Lớp Sửa Ngọng S-X', exercise: 'Vận động môi lưỡi (Thả lỏng hàm)', score: 45, date: 'Hôm qua', progress: 'Need Support', needSupport: true },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header Component */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight font-sans">Bảng Điều Khiển Giáo Viên</h1>
          <p className="text-xs text-slate-500 mt-1">Giám sát quá trình rèn luyện, kiểm duyệt âm thanh VR và hỗ trợ can thiệp cho học sinh</p>
        </div>
        <div className="mt-2 md:mt-0 text-[11px] bg-sky-50 text-sky-600 border border-sky-200 px-3 py-1 rounded-md font-semibold">
          Học kỳ II • Năm học 2025-2026
        </div>
      </div>

      {/* Main Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center shrink-0">
            <School className="w-5 h-5 text-[#4EACAF]" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 tracking-tight leading-none">3 Lớp học</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Đang hoạt động</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 tracking-tight leading-none">32 Học sinh</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Tổng học viên phụ trách</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-rose-600 tracking-tight leading-none">3 Học sinh</p>
            <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider mt-1">Cần hỗ trợ gấp</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 tracking-tight leading-none">145 Buổi</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Luyện tập hoàn thành</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Recent practices & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent practice results */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-teal-500" />
                Kết quả luyện tập gần đây (Dữ liệu từ thiết bị VR)
              </h4>
              <button 
                onClick={() => navigate('/teacher/results')}
                className="text-xs text-[#4EACAF] hover:text-[#4eacaf]/80 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Xem tất cả
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">Học sinh (Tuổi)</th>
                    <th className="px-5 py-3">Bài tập / Trò chơi</th>
                    <th className="px-5 py-3 text-center">Biểu điểm</th>
                    <th className="px-5 py-3">Tiến trình</th>
                    <th className="px-5 py-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentPractices.map((practice) => (
                    <tr key={practice.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-semibold text-slate-700 block">{practice.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Học viên {practice.age} tuổi</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-slate-650 block">{practice.exercise}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{practice.class}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md font-bold text-[11px]",
                          practice.score >= 80 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          practice.score >= 50 ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          "bg-rose-50 text-rose-600 border border-rose-100"
                        )}>
                          {practice.score}/100
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          practice.progress === 'Improving' ? "bg-emerald-50 text-emerald-600" :
                          practice.progress === 'Stable' ? "bg-indigo-50 text-indigo-600" :
                          "bg-rose-50 text-rose-600 border border-rose-200"
                        )}>
                          {practice.progress === 'Improving' ? 'Tiến bộ tốt' : 
                           practice.progress === 'Stable' ? 'Ổn định' : 'Cần hỗ trợ'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {practice.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Educational Safety Disclaimer */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#4EACAF] shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs text-slate-500 font-medium">
              <p className="font-semibold text-slate-700">Khăn dặn thông tin tham khảo chuyên môn:</p>
              <p>
                Dữ liệu âm học và biểu đồ hiển thị trên hệ thống được thu nhận từ quá trình trải nghiệm kính thực tế ảo VR đóng vai trò bổ trợ và phục vụ nhu cầu tham khảo cho phụ huynh cùng giáo viên. Hệ thống không đại diện cho bất kỳ chẩn đoán y khoa chuyên nghiệp nào.
              </p>
            </div>
          </div>

        </div>

        {/* Right column: Quick shortcuts & Alerts */}
        <div className="space-y-6">

          {/* Quick Actions Shortcuts */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 pb-1.5 border-b border-slate-100">
              Phím tắt nhanh
            </h4>
            
            <button 
              onClick={() => navigate('/teacher/classes')}
              className="w-full group flex items-center justify-between p-3.5 bg-sky-50/60 hover:bg-sky-50 rounded-lg border border-sky-100/50 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <School className="w-4 h-4 text-sky-500" />
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">Lớp học của tôi</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => navigate('/teacher/students')}
              className="w-full group flex items-center justify-between p-3.5 bg-teal-50/60 hover:bg-teal-50 rounded-lg border border-teal-100/50 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <UserSquare2 className="w-4 h-4 text-[#4EACAF]" />
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">Quản lý Học sinh</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#4EACAF] group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => navigate('/teacher/reports')}
              className="w-full group flex items-center justify-between p-3.5 bg-indigo-50/65 hover:bg-indigo-50 rounded-lg border border-indigo-100/50 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">Xuất báo cáo tổng hợp</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => navigate('/teacher/difficulty')}
              className="w-full group flex items-center justify-between p-3.5 bg-amber-50/60 hover:bg-amber-50 rounded-lg border border-amber-100/55 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">Điều chỉnh độ khó VR</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Warnings & Attention Needed */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
              Cảnh báo tiến trình chậm
            </h4>

            <div className="space-y-4 divide-y divide-slate-100">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-700 text-xs">Phạm Minh Khang</p>
                  <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">CẦN HỖ TRỢ</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Gặp khó khăn kéo dài với cụm phụ âm gió &ldquo;S&rdquo;. Điểm phát âm <b>50/100</b> dưới trung bình.
                </p>
                <p className="text-[9px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Ghi nhận 1 giờ trước
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-700 text-xs">Phạm Minh Hải</p>
                  <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">CẦN HỖ TRỢ</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Dấu hiệu bẹt nguyên âm trong bài lưỡi-môi. Điểm số sụt giảm liên tiếp trong tuần.
                </p>
                <p className="text-[9px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Ghi nhận Hôm qua
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-700 text-xs">Nguyễn Tiến Minh (Leo)</p>
                  <span className="text-[10px] text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">CẦN KIỂM TRA PHÒNG VR</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Hành động hủy/vấp lặp lại nhiều lần tại thiết bị kính số 03. Đang chờ hiệu chỉnh lại micro.
                </p>
                <p className="text-[9px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Ghi nhận 10 phút trước
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      <footer className="text-center py-4 text-[10px] text-slate-400 font-medium">
        Hạ Tầng Điều Phối Trị Liệu GodotXR - Hỗ trợ phát âm toàn diện nhi đồng. © 2026.
      </footer>
    </div>
  );
}
