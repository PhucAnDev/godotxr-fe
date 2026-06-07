import { Bell, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCurrentUser } from '../../lib/authMock';
import type { UserRole } from '../../app/navigation';

export function Topbar({
  userRole,
  onMenuToggle,
}: {
  userRole: UserRole | null;
  onMenuToggle?: () => void;
}) {
  const isAdmin = userRole === 'ADMIN';
  const isTeacher = userRole === 'TEACHER';

  let greetingTitle = '';
  let greetingSub = '';
  let avatarSeed = 'parent';
  let roleLabel = '';
  let badgeLabel = '';

  const currentUser = getCurrentUser();

  if (userRole === 'PARENT') {
    greetingTitle = currentUser ? `Xin chào, ${currentUser.FullName}!` : 'Chào Phụ huynh!';
    greetingSub = 'Đồng hành rèn luyện thực tế ảo cùng con';
    avatarSeed = currentUser ? currentUser.FullName : 'Sophia';
    roleLabel = 'Phụ huynh';
    badgeLabel = 'Đồng hành rèn luyện VR';
  } else if (userRole === 'TEACHER') {
    greetingTitle = currentUser ? `Kính chào, ${currentUser.FullName}!` : 'Xin chào, Giáo viên';
    greetingSub = 'Giám sát lớp học và điều chỉnh dải bài tập tương tác';
    avatarSeed = currentUser ? currentUser.FullName : 'MsJohnson';
    roleLabel = 'Giáo viên';
    badgeLabel = 'Đồng quản nhiệm VR';
  } else if (userRole === 'ADMIN') {
    greetingTitle = currentUser ? `Quản trị: ${currentUser.FullName}` : 'Hệ thống Quản trị viên';
    greetingSub = 'Trạng thái vận hành và giám sát tài nguyên đồng bộ';
    avatarSeed = currentUser ? currentUser.FullName : 'AdminSys';
    roleLabel = 'Quản trị viên';
    badgeLabel = 'Quản trị hệ thống';
  }

  return (
    <header className={cn(
      'w-full h-14 shrink-0 flex items-center justify-between px-4 md:px-8 border-b',
      isAdmin
        ? 'bg-slate-900 border-slate-800 text-slate-100'
        : isTeacher
          ? 'bg-[#E6EFEB] border-[#D2E0DC] text-gray-800'
          : 'bg-[#F2ECD8] border-[#E5DFCA] text-[#423D33]'
    )}>
      <div className="flex items-center space-x-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className={cn(
              'md:hidden p-2 rounded-xl border transition-colors cursor-pointer',
              isAdmin
                ? 'border-slate-800 hover:bg-slate-850 text-slate-300'
                : isTeacher
                  ? 'border-[#D2E0DC] hover:bg-[#D7E5E0] text-gray-700'
                  : 'border-[#E5DFCA] hover:bg-[#E5DFCA] text-[#555]'
            )}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col justify-center">
          <h2 className="text-xs md:text-sm font-black tracking-tight leading-none uppercase">
            {greetingTitle}
          </h2>
          <p className="text-[10px] md:text-xs opacity-75 sm:block hidden mt-1 font-semibold leading-none">
            {greetingSub}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          className={cn(
            'p-2 rounded-xl transition-all relative cursor-pointer',
            isAdmin ? 'hover:bg-slate-800 text-slate-300' : isTeacher ? 'hover:bg-[#D7E5E0] text-gray-700' : 'hover:bg-[#E5DFCA] text-[#555]'
          )}
        >
          <Bell className="w-5 h-5 shrink-0" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        </button>

        <div className={cn(
          'flex items-center space-x-2 pl-3 border-l shrink-0',
          isAdmin ? 'border-slate-800' : isTeacher ? 'border-[#D2E0DC]' : 'border-[#E5DFCA]'
        )}>
          <img
            src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${avatarSeed}&backgroundColor=transparent`}
            alt="My avatar"
            referrerPolicy="no-referrer"
            className={cn(
              'w-7.5 h-7.5 rounded-full bg-white border shrink-0 object-cover',
              isAdmin ? 'border-slate-700' : isTeacher ? 'border-[#D2E0DC]' : 'border-[#E5DFCA]'
            )}
          />
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-xs font-black tracking-tight">{roleLabel}</span>
            <span className="text-[9px] opacity-60 font-semibold uppercase mt-0.5 tracking-wider">{badgeLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
