import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, ArrowUpRight, Play, Smile, Shield, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getUsers } from '../../services/userService';
import { getChildProfiles } from '../../services/childProfileService';
import { getResultsByChild } from '../../services/resultService';

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace('T', ' ').slice(0, 19);
}

interface RecentActivity {
  time: string;
  user: string;
  action: string;
  target?: string;
  status?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [newUsersThisWeek, setNewUsersThisWeek] = useState<string>('0 mới tuần này');
  const [pendingAccounts, setPendingAccounts] = useState<string>('0 chờ duyệt');
  const [attemptsToday, setAttemptsToday] = useState<string>('0 lượt hôm nay');
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setIsLoading(true);
        // 1. Fetch total users & filter teachers
        const userRes = await getUsers(1, 1000);
        if (cancelled) return;

        if (userRes.success && userRes.data) {
          const allUsers = userRes.data.items;
          setTotalUsers(userRes.data.totalCount);
          
          const teachers = allUsers.filter(u => u.roleName.toLowerCase() === 'teacher');
          setTotalTeachers(teachers.length);
          
          const inactive = allUsers.filter(u => !u.isActive).length;
          setPendingAccounts(`${inactive} tài khoản chưa hoạt động`);
          
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const thisWeekCount = allUsers.filter(u => new Date(u.createdAt) > oneWeekAgo).length;
          setNewUsersThisWeek(`+${thisWeekCount} tài khoản mới tuần này`);
        }

        // 2. Fetch children and results
        const childRes = await getChildProfiles(1, 1000);
        if (cancelled) return;

        if (childRes.success && childRes.data?.items) {
          const childrenList = childRes.data.items;
          const resultPromises = childrenList.map(c => getResultsByChild(c.id));
          const resultsList = await Promise.all(resultPromises);
          if (cancelled) return;

          let sumAttempts = 0;
          let sumAttemptsToday = 0;
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          let combinedResults: any[] = [];

          resultsList.forEach((res, index) => {
            if (res.success && res.data) {
              sumAttempts += res.data.length;
              const child = childrenList[index];

              // Sum attempts today
              const todayCount = res.data.filter(r => {
                const activeTime = r.completedAt ? new Date(r.completedAt) : (r.startedAt ? new Date(r.startedAt) : null);
                return activeTime && activeTime >= startOfToday;
              }).length;
              sumAttemptsToday += todayCount;

              // Map to activities
              res.data.forEach(r => {
                const activeTimeStr = r.completedAt || r.startedAt || '';
                combinedResults.push({
                  time: activeTimeStr ? formatDateTime(activeTimeStr).slice(11, 16) : '00:00',
                  rawTime: activeTimeStr,
                  user: `Bé ${child.fullName}`,
                  action: `đã rèn luyện ${r.exerciseId ? 'bài tập' : 'bài học'}`,
                  target: r.exerciseId ? `Mã bài tập: ${r.exerciseId}` : `Mã bài học: ${r.lessonId}`
                });
              });
            }
          });

          setTotalAttempts(sumAttempts);
          setAttemptsToday(`${sumAttemptsToday} lượt hôm nay`);

          // Sort activities by completion time
          combinedResults.sort((a, b) => b.rawTime.localeCompare(a.rawTime));
          setRecentActivities(combinedResults.slice(0, 8));
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative">
      {/* 1. Header (Matched styled card container) */}
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-bold uppercase tracking-widest leading-none">
            <Shield className="w-3.5 h-3.5" />
            Hệ thống Quản trị
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Bảng điều khiển <span className="text-[#4EACAF]">Hệ thống</span>
          </h1>
          <p className="text-gray-505 font-medium max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Giám sát trạng thái hoạt động, chỉ số người dùng và tài nguyên can thiệp GodotXR.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/users')}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
        >
          <Users className="w-5 h-5" strokeWidth={2} />
          Quản lý người dùng
        </button>
      </div>

      {/* 2. Stats Row (Matched StatItem grids) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatItem 
          title="Tổng người dùng" 
          value={isLoading ? 0 : totalUsers} 
          subtitle={isLoading ? "Đang tải dữ liệu..." : newUsersThisWeek} 
          icon={<Users className="w-5 h-5 text-[#4EACAF]" />} 
          bgColor="bg-[#4EACAF]/5"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Tổng giáo viên" 
          value={isLoading ? 0 : totalTeachers} 
          subtitle={isLoading ? "Đang tải dữ liệu..." : pendingAccounts} 
          icon={<GraduationCap className="w-5 h-5 text-blue-600" />} 
          bgColor="bg-blue-50/70"
          borderColor="border-slate-100"
        />
        <StatItem 
          title="Tổng lượt tập" 
          value={isLoading ? 0 : totalAttempts} 
          subtitle={isLoading ? "Đang tải dữ liệu..." : attemptsToday} 
          icon={<Play className="w-5 h-5 text-emerald-600 text-fill-current" />} 
          bgColor="bg-emerald-50/70"
          borderColor="border-slate-100"
        />
      </div>

      {/* 3. Main Central Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-none">Hoạt động rèn luyện gần đây</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              Danh sách chi tiết kết quả luyện tập của học sinh đồng bộ từ thiết bị VR
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4EACAF] rounded-full animate-pulse" />
            <span className="text-xs text-[#4EACAF] font-bold uppercase tracking-wider">Hệ thống đồng bộ</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
              <span className="text-sm font-bold animate-pulse">Đang tải danh sách hoạt động...</span>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="text-base font-bold text-slate-700">Chưa ghi nhận hoạt động rèn luyện nào!</p>
              <p className="text-slate-400 text-xs">Hãy để học sinh hoàn thành bài tập VR để cập nhật bảng nhật ký này.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Thời gian</th>
                  <th className="py-4 px-6">Học sinh</th>
                  <th className="py-4 px-6">Hành động</th>
                  <th className="py-4 px-6">Nội dung rèn luyện</th>
                  <th className="py-4 px-6 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-750">
                {recentActivities.map((act, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                    {/* Time */}
                    <td className="py-4 px-6 font-mono text-slate-400 font-bold text-xs">
                      {act.time}
                    </td>
                    {/* Student */}
                    <td className="py-4 px-6 font-bold text-slate-800 text-sm">
                      {act.user}
                    </td>
                    {/* Action */}
                    <td className="py-4 px-6 text-slate-600 font-medium text-sm">
                      {act.action}
                    </td>
                    {/* Target details */}
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 p-1 px-2 rounded-lg border border-slate-200">
                        {act.target}
                      </span>
                    </td>
                    {/* Status badge */}
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                        Đã đồng bộ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Decorative Quote */}
      <div className="flex items-center justify-center gap-4 bg-orange-50/40 p-6 rounded-[32px] border-2 border-orange-100 max-w-lg mx-auto">
        <Smile className="w-10 h-10 text-orange-400 fill-current shrink-0 animate-pulse" />
        <p className="text-gray-500 font-bold text-xs md:text-sm italic leading-snug">
          "Trẻ em nhận được sự hỗ trợ ngôn ngữ can thiệp sớm tốt nhất nhờ quy trình phối hợp khép kín giữa giáo viên đặc biệt và cha mẹ yêu thương."
        </p>
      </div>
    </div>
  );
}

function StatItem({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  borderColor,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={cn(
      'bg-white rounded-[32px] p-6 shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-300',
      borderColor
    )}>
      <div className={cn('absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150', bgColor)} />
      <div className="flex items-center gap-5 relative z-10">
        <div className={cn('p-4 rounded-2xl shadow-inner shrink-0', bgColor)}>
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-gray-405 font-bold uppercase text-[10px] tracking-wider">{title}</p>
          <p className="text-3xl font-black text-gray-900 leading-none">{value.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 font-medium pt-1 line-clamp-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
