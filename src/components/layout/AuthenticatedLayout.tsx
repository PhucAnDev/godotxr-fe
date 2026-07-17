import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigate, Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { getAuthenticatedRedirect } from '../../app/routeGuards';
import type { SidebarItem, UserRole } from '../../app/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AuthenticatedLayout({
  userRole,
  allowedRole,
  onLogout,
  sidebarItems,
}: {
  userRole: UserRole | null;
  allowedRole: UserRole;
  onLogout: () => void;
  sidebarItems: SidebarItem[];
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const redirectTo = getAuthenticatedRedirect(userRole, allowedRole);

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  const isAdmin = userRole === 'ADMIN';
  const isTeacher = userRole === 'TEACHER';

  return (
    <motion.div
      key="app-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'flex min-h-screen w-full transition-colors duration-500 font-sans',
        isAdmin ? 'bg-slate-50 text-slate-900 admin-portal' :
          isTeacher ? 'bg-[#F4F9F9] text-gray-800 teacher-portal' :
            'bg-[#FDFCF5] text-[#1D1D1D] parent-portal'
      )}
    >
      <Sidebar
        userRole={userRole}
        onLogout={onLogout}
        sidebarItems={sidebarItems}
        className="hidden md:flex shrink-0"
      />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-50 flex h-full"
            >
              <Sidebar
                userRole={userRole}
                onLogout={onLogout}
                sidebarItems={sidebarItems}
                onClose={() => setIsMobileMenuOpen(false)}
                className="flex w-72"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar
          userRole={userRole}
          onMenuToggle={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </motion.div>
  );
}
