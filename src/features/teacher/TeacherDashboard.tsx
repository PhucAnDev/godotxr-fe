import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ArrowRight, 
  FileText, 
  School, 
  UserSquare2, 
  CheckCircle, 
  Info,
  Calendar,
  Volume2,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getSessionUser } from '../../lib/authSession';
import { getClassrooms } from '../../services/classroomService';
import { getEnrollments } from '../../services/enrollmentService';
import { getChildProfiles } from '../../services/childProfileService';
import { getResultsByChild } from '../../services/resultService';
import { getExercises } from '../../services/exerciseService';
import { getLessons } from '../../services/lessonService';

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace('T', ' ').slice(0, 19);
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return dateStr.replace('T', ' ').slice(0, 10);
}

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [classCount, setClassCount] = useState<number>(0);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [needSupportCount, setNeedSupportCount] = useState<number>(0);
  const [completedAttempts, setCompletedAttempts] = useState<number>(0);
  const [recentPractices, setRecentPractices] = useState<any[]>([]);
  const [needSupportList, setNeedSupportList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTeacherData() {
      setIsLoading(true);
      try {
        const currentUser = getSessionUser();
        const teacherId = currentUser ? Number(currentUser.UserId) : null;
        if (!teacherId) return;

        // 1. Fetch Classrooms
        const classroomsRes = await getClassrooms(1, 1000);
        if (cancelled) return;
        const allClassrooms = classroomsRes.success && classroomsRes.data?.items ? classroomsRes.data.items : [];
        const myClassrooms = allClassrooms.filter(c => c.userId === teacherId);
        setClassCount(myClassrooms.length);

        const myClassIds = myClassrooms.map(c => c.id);

        // 2. Fetch Enrollments
        const enrollmentsRes = await getEnrollments(1, 1000);
        if (cancelled) return;
        const allEnrollments = enrollmentsRes.success && enrollmentsRes.data?.items ? enrollmentsRes.data.items : [];
        const myStudentsEnrollments = allEnrollments.filter(e => myClassIds.includes(e.classId));
        
        // Find unique child IDs
        const uniqueChildIds = Array.from(new Set(myStudentsEnrollments.map(s => s.childId)));
        setStudentCount(uniqueChildIds.length);

        // 3. Fetch Child Profiles
        const childProfilesRes = await getChildProfiles(1, 1000);
        if (cancelled) return;
        const allChildren = childProfilesRes.success && childProfilesRes.data?.items ? childProfilesRes.data.items : [];

        // 4. Fetch Exercises and Lessons
        const [exercisesRes, lessonsRes] = await Promise.all([
          getExercises(1, 1000),
          getLessons(1, 1000)
        ]);
        if (cancelled) return;
        const exerciseList = exercisesRes.success && exercisesRes.data?.items ? exercisesRes.data.items : [];
        const lessonList = lessonsRes.success && lessonsRes.data?.items ? lessonsRes.data.items : [];

        // 5. Fetch results for each unique student
        const resultPromises = uniqueChildIds.map(childId => getResultsByChild(childId));
        const resultsList = await Promise.all(resultPromises);
        if (cancelled) return;

        let totalCompleted = 0;
        let supportCount = 0;
        let practicesAccumulator: any[] = [];
        let supportListAccumulator: any[] = [];

        resultsList.forEach((res, index) => {
          if (res.success && res.data) {
            const childId = uniqueChildIds[index];
            const childObj = allChildren.find(c => c.id === childId);
            const childName = childObj?.fullName || `Học sinh ID: ${childId}`;
            const childAge = childObj?.age || 6;

            const childEnrollment = myStudentsEnrollments.find(e => e.childId === childId);
            const className = childEnrollment?.className || 'Lớp học phụ trách';

            // Completed attempts
            const completedList = res.data.filter(r => r.completionStatus === 'Completed');
            totalCompleted += completedList.length;

            // Flag as need support if latest practice score < 60
            if (res.data.length > 0) {
              const sorted = [...res.data].sort((a, b) => {
                const dateA = a.completedAt || a.startedAt || '';
                const dateB = b.completedAt || b.startedAt || '';
                return dateB.localeCompare(dateA);
              });
              const latestResult = sorted[0];
              if (latestResult.score < 60) {
                supportCount++;
                const exerciseObj = latestResult.exerciseId ? exerciseList.find(e => e.id === latestResult.exerciseId) : null;
                const lessonObj = latestResult.lessonId ? lessonList.find(l => l.id === latestResult.lessonId) : null;
                const nameOfActivity = exerciseObj ? exerciseObj.exerciseName : (lessonObj ? lessonObj.lessonName : 'Bài rèn luyện');

                supportListAccumulator.push({
                  childName,
                  score: latestResult.score,
                  activityName: nameOfActivity,
                  time: latestResult.completedAt || latestResult.startedAt || ''
                });
              }
            }

            // Map all results to recent practices
            res.data.forEach(r => {
              const exerciseObj = r.exerciseId ? exerciseList.find(e => e.id === r.exerciseId) : null;
              const lessonObj = r.lessonId ? lessonList.find(l => l.id === r.lessonId) : null;
              const activityName = exerciseObj ? exerciseObj.exerciseName : (lessonObj ? lessonObj.lessonName : 'Bài rèn luyện');

              practicesAccumulator.push({
                id: String(r.id),
                name: childName,
                age: childAge,
                class: className,
                exercise: activityName,
                score: r.score,
                date: r.completedAt || r.startedAt || '',
                progress: r.score >= 80 ? 'Improving' : (r.score >= 60 ? 'Stable' : 'Need Support'),
                needSupport: r.score < 60
              });
            });
          }
        });

        setClassCount(myClassrooms.length);
        setStudentCount(uniqueChildIds.length);
        setCompletedAttempts(totalCompleted);
        setNeedSupportCount(supportCount);

        // Sort practices descending by date
        practicesAccumulator.sort((a, b) => b.date.localeCompare(a.date));
        setRecentPractices(practicesAccumulator.slice(0, 5));

        // Sort support list descending
        supportListAccumulator.sort((a, b) => b.time.localeCompare(a.time));
        setNeedSupportList(supportListAccumulator.slice(0, 3));
      } catch (err) {
        console.error('Error loading Teacher Dashboard:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTeacherData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header Component */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight font-sans">Bảng Điều Khiển Giáo Viên</h1>
          <p className="text-xs text-slate-500 mt-1">Giám sát quá trình rèn luyện, kiểm duyệt âm thanh VR và hỗ trợ can thiệp cho học sinh</p>
        </div>
        <div className="mt-2 md:mt-0 text-[11px] bg-sky-50 text-sky-600 border border-sky-200 px-3 py-1 rounded-md font-semibold">
          Học kỳ II • Năm học 2025–2026
        </div>
      </div>

      {/* Main Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center shrink-0">
            <School className="w-5 h-5 text-[#4EACAF]" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 tracking-tight leading-none">
              {isLoading ? '...' : `${classCount} Lớp học`}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Đang hoạt động</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 tracking-tight leading-none">
              {isLoading ? '...' : `${studentCount} Học sinh`}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Tổng học viên phụ trách</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-rose-600 tracking-tight leading-none">
              {isLoading ? '...' : `${needSupportCount} Học sinh`}
            </p>
            <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider mt-1">Cần hỗ trợ gấp</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 tracking-tight leading-none">
              {isLoading ? '...' : `${completedAttempts} Buổi`}
            </p>
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
                className="text-xs text-[#4EACAF] hover:text-[#4eacaf]/80 font-semibold flex items-center gap-1 cursor-pointer animate-pulse"
              >
                Xem tất cả
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-[5px] py-3">Học sinh (Tuổi)</th>
                    <th className="px-[5px] py-3">Bài tập / Trò chơi</th>
                    <th className="px-[5px] py-3 text-center">Biểu điểm</th>
                    <th className="px-[5px] py-3">Tiến trình</th>
                    <th className="px-[5px] py-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentPractices.length > 0 ? (
                    recentPractices.map((practice) => (
                      <tr key={practice.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-[5px] py-3">
                          <span className="font-semibold text-slate-700 block">{practice.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Học viên {practice.age} tuổi</span>
                        </td>
                        <td className="px-[5px] py-3">
                          <span className="font-semibold text-slate-650 block">{practice.exercise}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{practice.class}</span>
                        </td>
                        <td className="px-[5px] py-3 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md font-bold text-[11px]",
                            practice.score >= 80 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            practice.score >= 50 ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            "bg-rose-50 text-rose-600 border border-rose-100"
                          )}>
                            {practice.score}/100
                          </span>
                        </td>
                        <td className="px-[5px] py-3">
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
                        <td className="px-[5px] py-3 text-slate-400">
                          {formatRelativeTime(practice.date)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold">
                        {isLoading ? 'Đang tải dữ liệu kết quả học tập...' : 'Chưa ghi nhận lượt luyện tập VR nào từ học sinh.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Educational Safety Disclaimer */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#4EACAF] shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs text-slate-500 font-medium">
              <p className="font-semibold text-slate-700">Khuyên dặn thông tin tham khảo chuyên môn:</p>
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
              {needSupportList.length > 0 ? (
                needSupportList.map((sup, idx) => (
                  <div key={idx} className={cn("space-y-1", idx > 0 && "pt-3")}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-700 text-xs">{sup.childName}</p>
                      <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">CẦN HỖ TRỢ</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Lượt rèn luyện gần nhất bài <b>{sup.activityName}</b> đạt <b>{sup.score}/100</b> dưới trung bình.
                    </p>
                    <p className="text-[9px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Ghi nhận {formatRelativeTime(sup.time)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 font-semibold">
                  {isLoading ? 'Đang phân tích dữ liệu cảnh báo...' : 'Không có cảnh báo tiến trình chậm nào. Tất cả trẻ đang tiến bộ tốt!'}
                </div>
              )}
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
