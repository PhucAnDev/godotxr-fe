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
    <div className="space-y-4 pb-24 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Bảng điều khiển <span className="text-[#4EACAF]">Hệ thống</span>
          </h1>
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
      <div className="flex items-center justify-center gap-4 bg-orange-50/40 p-6 rounded-xl border-2 border-orange-100 max-w-lg mx-auto">
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
  borderColor = 'border-slate-100',
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border', bgColor, borderColor)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 leading-none">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">{title}</p>
        {subtitle && <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">{subtitle}</p>}
      </div>
    </div>
  );
}
