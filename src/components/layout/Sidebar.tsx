import { LogOut, Settings, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Logo } from '../../features/public/HomeView';
import type { SidebarItem, UserRole } from '../../app/navigation';

function isSidebarItemActive(item: SidebarItem, pathname: string) {
  if (pathname === item.path) {
    return true;
  }

  if (item.id === 'TEACHER_CLASSES' && pathname.startsWith('/teacher/class/')) {
    return true;
  }

  if (item.id === 'TEACHER_STUDENTS' && pathname.startsWith('/teacher/student/')) {
    return true;
  }

  return item.children?.some((child) => pathname === child.path) ?? false;
}

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

  const defaultExpandedGroups = useMemo(
    () =>
      Object.fromEntries(
        sidebarItems
          .filter(
            (item) =>
              item.children &&
              (item.path === location.pathname ||
                item.children.some((child) => child.path === location.pathname))
          )
          .map((item) => [item.id, true])
      ) as Record<string, boolean>,
    [location.pathname, sidebarItems]
  );

  const [expandedGroups, setExpandedGroups] =
    useState<Record<string, boolean>>(defaultExpandedGroups);

  useEffect(() => {
    setExpandedGroups((current) => ({ ...defaultExpandedGroups, ...current }));
  }, [defaultExpandedGroups]);

  const baseItemClass = isAdmin
    ? 'rounded-xl text-sm'
    : isTeacher
      ? 'rounded-[20px] text-sm'
      : 'rounded-[24px] text-sm';

  const activeItemClass = isAdmin
    ? 'bg-[#4EACAF] text-white font-medium shadow-md shadow-[#4EACAF]/15'
    : isTeacher
      ? 'bg-[#4EACAF] text-white font-medium shadow-lg shadow-[#4EACAF]/20'
      : 'bg-[#4EACAF] text-white font-medium shadow-xl shadow-[#4EACAF]/20';

  const inactiveItemClass = isAdmin
    ? 'hover:bg-slate-800 text-slate-350 font-normal'
    : isTeacher
      ? 'hover:bg-[#D7E5E0] text-gray-700 font-medium'
      : 'hover:bg-[#E5DFCA] text-[#555] font-medium tracking-tight';

  return (
    <aside
      className={cn(
        'w-72 flex flex-col h-screen sticky top-0 transition-colors duration-500',
        isAdmin
          ? 'bg-slate-900 border-r border-slate-800 text-slate-100'
          : isTeacher
            ? 'bg-[#E6EFEB] border-r border-[#D2E0DC] text-gray-800'
            : 'bg-[#F2ECD8] border-r border-[#E5DFCA] text-[#423D33]',
        className
      )}
    >
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
          const isActive = isSidebarItemActive(item, location.pathname);
          const isExpanded =
            item.children && (expandedGroups[item.id] || isActive);

          return (
            <div key={item.id} className="space-y-1.5">
              <button
                onClick={() => {
                  navigate(item.path);
                  if (item.children) {
                    setExpandedGroups((current) => ({
                      ...current,
                      [item.id]: true,
                    }));
                  }
                  if (onClose) onClose();
                }}
                className={cn(
                  'w-full flex items-center space-x-3 px-5 py-3 transition-all shrink-0 cursor-pointer',
                  baseItemClass,
                  isActive ? activeItemClass : inactiveItemClass
                )}
              >
                <item.icon
                  className={cn(
                    'shrink-0',
                    isAdmin ? 'w-5 h-5' : 'w-6 h-6',
                    isActive ? 'text-white opacity-100' : 'opacity-85'
                  )}
                />
                <span className="text-left">{item.label}</span>
              </button>

              {item.children && isExpanded && (
                <div className="ml-4 pl-3 border-l border-white/10 space-y-1">
                  {item.children.map((child) => {
                    const isChildActive = location.pathname === child.path;
                    return (
                      <button
                        key={child.id}
                        onClick={() => {
                          navigate(child.path);
                          setExpandedGroups((current) => ({
                            ...current,
                            [item.id]: true,
                          }));
                          if (onClose) onClose();
                        }}
                        className={cn(
                          'w-full flex items-center space-x-3 px-4 py-2.5 transition-all cursor-pointer',
                          baseItemClass,
                          isChildActive ? activeItemClass : inactiveItemClass
                        )}
                      >
                        <child.icon
                          className={cn(
                            'shrink-0',
                            isAdmin ? 'w-4.5 h-4.5' : 'w-5 h-5',
                            isChildActive ? 'text-white opacity-100' : 'opacity-85'
                          )}
                        />
                        <span className="text-left text-[15px]">
                          {child.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div
        className={cn(
          'p-6 space-y-2 shrink-0 border-t',
          isAdmin
            ? 'border-slate-800'
            : isTeacher
              ? 'border-[#D2E0DC]'
              : 'border-[#E5DFCA]'
        )}
      >
        {userRole === 'PARENT' && (
          <button
            onClick={() => {
              navigate('/parent/settings');
              if (onClose) onClose();
            }}
            className="w-full flex items-center space-x-3 px-5 py-3 transition-all rounded-[24px] hover:bg-[#E5DFCA] text-[#555] font-normal text-sm tracking-tight cursor-pointer"
          >
            <Settings className="shrink-0 w-6 h-6 opacity-80" />
            <span className="text-left">Cài đặt</span>
          </button>
        )}
        <button
          onClick={onLogout}
          className={cn(
            'w-full flex items-center space-x-3 px-5 py-3 transition-all font-normal cursor-pointer',
            isAdmin
              ? 'rounded-xl text-sm hover:bg-red-950/40 text-red-400'
              : isTeacher
                ? 'rounded-[20px] text-sm hover:bg-red-50 text-red-600'
                : 'rounded-[24px] text-sm hover:bg-red-100/50 text-red-600 tracking-tight'
          )}
        >
          <LogOut className={cn('shrink-0', isAdmin ? 'w-5 h-5' : 'w-6 h-6')} />
          <span className="text-left">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
