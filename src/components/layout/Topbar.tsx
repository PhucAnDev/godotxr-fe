import { Menu } from 'lucide-react';
import { cn, resolveAvatarUrl } from '../../lib/utils';
import { getSessionUser } from '../../lib/authSession';
import { getCurrentUser as getMockUser } from '../../lib/authMock';
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

  let avatarSeed = 'parent';
  let roleLabel = '';
  let badgeLabel = '';

  const currentUser = getSessionUser() || getMockUser();
  const userName = currentUser?.FullName || (isAdmin ? 'Quản trị viên' : isTeacher ? 'Giáo viên' : 'Phụ huynh');

  if (userRole === 'PARENT') {
    avatarSeed = currentUser ? currentUser.FullName : 'Sophia';
    roleLabel = 'Phụ huynh';
    badgeLabel = 'Đồng hành rèn luyện VR';
  } else if (userRole === 'TEACHER') {
    avatarSeed = currentUser ? currentUser.FullName : 'MsJohnson';
    roleLabel = 'Giáo viên';
    badgeLabel = 'Đồng quản nhiệm VR';
  } else if (userRole === 'ADMIN') {
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
                ? 'border-slate-800 hover:bg-slate-850 text-slate-350'
                : isTeacher
                  ? 'border-[#D2E0DC] hover:bg-[#D7E5E0] text-gray-700'
                  : 'border-[#E5DFCA] hover:bg-[#E5DFCA] text-[#555]'
            )}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className={cn(
          'flex items-center space-x-2 shrink-0'
        )}>
          <img
            src={resolveAvatarUrl((currentUser as any)?.Avatar || (currentUser as any)?.avatar, avatarSeed, 'open-peeps')}
            alt="My avatar"
            referrerPolicy="no-referrer"
            className={cn(
              'w-8 h-8 rounded-full bg-white border shrink-0 object-cover',
              isAdmin ? 'border-slate-700' : isTeacher ? 'border-[#D2E0DC]' : 'border-[#E5DFCA]'
            )}
          />
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className={cn(
              "text-xs font-semibold tracking-tight",
              isAdmin ? "text-slate-200" : isTeacher ? "text-gray-800" : "text-[#423D33]"
            )}>
              {userName}
            </span>
            <span className={cn(
              "text-[9px] opacity-70 font-normal uppercase mt-0.5 tracking-wider",
              isAdmin ? "text-slate-400" : isTeacher ? "text-gray-600" : "text-[#756D59]"
            )}>
              {badgeLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
