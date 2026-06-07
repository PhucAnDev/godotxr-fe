import { LogOut, Settings, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Logo } from '../../features/public/HomeView';
import type { SidebarItem, UserRole } from '../../app/navigation';

export function Sidebar({
  userRole,
  onLogout,
  sidebarItems,
  onClose,
  className,
}: {
  userRole: UserRole | null;
  onLogout: () => void;
  sidebarItems: SidebarItem[];
  onClose?: () => void;
  className?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = userRole === 'ADMIN';
  const isTeacher = userRole === 'TEACHER';

  return (
    <aside className={cn(
      'w-72 flex flex-col h-screen sticky top-0 transition-colors duration-500',
      isAdmin
        ? 'bg-slate-900 border-r border-slate-800 text-slate-100'
        : isTeacher
          ? 'bg-[#E6EFEB] border-r border-[#D2E0DC] text-gray-800'
          : 'bg-[#F2ECD8] border-r border-[#E5DFCA] text-[#423D33]',
      className
    )}>
      <div className="p-6 md:p-8 flex justify-between items-center shrink-0">
        <Logo className={isAdmin ? 'brightness-110' : ''} />
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-xl border transition-colors cursor-pointer',
              isAdmin
                ? 'border-slate-800 hover:bg-slate-800 text-slate-350'
                : isTeacher
                  ? 'border-[#D2E0DC] hover:bg-[#D7E5E0] text-gray-700'
                  : 'border-[#E5DFCA] hover:bg-[#E5DFCA] text-[#555]'
            )}
          >
            <X className="w-5 h-5 shrink-0" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.id === 'TEACHER_CLASSES' && location.pathname.startsWith('/teacher/class/')) ||
            (item.id === 'TEACHER_STUDENTS' && location.pathname.startsWith('/teacher/student/'));
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (onClose) onClose();
              }}
              className={cn(
                'w-full flex items-center space-x-3 px-5 py-3 transition-all shrink-0 cursor-pointer',
                isAdmin
                  ? 'rounded-xl text-sm ' + (isActive ? 'bg-[#4EACAF] text-white font-black shadow-md shadow-[#4EACAF]/15' : 'hover:bg-slate-800 text-slate-300 font-medium')
                  : isTeacher
                    ? 'rounded-[20px] text-sm ' + (isActive ? 'bg-[#4EACAF] text-white font-black shadow-lg shadow-[#4EACAF]/20' : 'hover:bg-[#D7E5E0] text-gray-700 font-bold')
                    : 'rounded-[24px] text-sm ' + (isActive ? 'bg-[#4EACAF] text-white font-black shadow-xl shadow-[#4EACAF]/20' : 'hover:bg-[#E5DFCA] text-[#555] font-bold tracking-tight')
              )}
            >
              <item.icon className={cn('shrink-0', isAdmin ? 'w-5 h-5' : 'w-6 h-6', isActive ? 'text-white opacity-1' : 'opacity-85')} />
              <span className="text-left font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={cn(
        'p-6 space-y-2 shrink-0 border-t',
        isAdmin ? 'border-slate-800' : isTeacher ? 'border-[#D2E0DC]' : 'border-[#E5DFCA]'
      )}>
        {userRole === 'PARENT' && (
          <button
            onClick={() => {
              navigate('/parent/settings');
              if (onClose) onClose();
            }}
            className="w-full flex items-center space-x-3 px-5 py-3 transition-all rounded-[24px] hover:bg-[#E5DFCA] text-[#555] font-bold text-sm tracking-tight cursor-pointer"
          >
            <Settings className="shrink-0 w-6 h-6 opacity-80" />
            <span className="text-left">Cài đặt</span>
          </button>
        )}
        <button
          onClick={onLogout}
          className={cn(
            'w-full flex items-center space-x-3 px-5 py-3 transition-all font-bold cursor-pointer',
            isAdmin
              ? 'rounded-xl text-sm hover:bg-red-950/40 text-red-400'
              : isTeacher
                ? 'rounded-[20px] text-sm hover:bg-red-50 text-red-600'
                : 'rounded-[24px] text-sm hover:bg-red-100/50 text-red-600 tracking-tight'
          )}
        >
          <LogOut className={cn('shrink-0', isAdmin ? 'w-5 h-5' : 'w-6 h-6')} />
          <span className="text-left font-bold">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
