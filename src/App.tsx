/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams, Outlet } from 'react-router-dom';
import { cn } from './lib/utils';
import { 
  LayoutDashboard, 
  UserCircle, 
  History, 
  PlayCircle, 
  BarChart3, 
  Settings, 
  LogOut,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  ShieldCheck,
  Search,
  ChevronDown,
  Bell,
  KeyRound,
  Heart,
  Baby,
  School,
  Tags,
  HelpCircle,
  Calendar,
  FolderOpen,
  Volume2,
  TrendingUp,
  Lightbulb,
  Menu,
  X
} from 'lucide-react';

// Import Views
import LoginView from './components/views/LoginView';
import ForgotPasswordView from './components/views/ForgotPasswordView';
import FirstLoginChangePasswordView from './components/views/FirstLoginChangePasswordView';
import TeacherParentChildManagement from './components/views/TeacherParentChildManagement';
import AccountSettings from './components/views/AccountSettings';
import { getCurrentUser, mockLogout } from './lib/authMock';
import ParentDashboard from './components/views/ParentDashboard';
import ParentChildClass from './components/views/ParentChildClass';
import ParentRecommendations from './components/views/ParentRecommendations';
import ParentProfileSettings from './components/views/ParentProfileSettings';
import LessonReview from './components/views/LessonReview';
import LearningHistory from './components/views/LearningHistory';
import TeacherDashboard from './components/views/TeacherDashboard';
import DifficultySettings from './components/views/DifficultySettings';
import AdminDashboard from './components/views/AdminDashboard';
import ReportGenerator from './components/views/ReportGenerator';
import ProfileManagement from './components/views/ProfileManagement';
import UserManagement from './components/views/UserManagement';
import RoleManagement from './components/views/RoleManagement';
import TeacherManagement from './components/views/TeacherManagement';
import ParentManagement from './components/views/ParentManagement';
import ChildManagement from './components/views/ChildManagement';
import ClassroomManagement from './components/views/ClassroomManagement';
import EnrollmentManagement from './components/views/EnrollmentManagement';
import ProgramManagement from './components/views/ProgramManagement';
import LessonManagement from './components/views/LessonManagement';
import ExerciseManagement from './components/views/ExerciseManagement';
import ExerciseTypeManagement from './components/views/ExerciseTypeManagement';
import SchoolYearManagement from './components/views/SchoolYearManagement';
import SemesterManagement from './components/views/SemesterManagement';
import LearningResultManagement from './components/views/LearningResultManagement';
import PronunciationDetailPage from './components/views/PronunciationDetailPage';
import ProgressAnalysis from './components/views/ProgressAnalysis';
import TeacherClasses from './components/views/TeacherClasses';
import TeacherClassDetail from './components/views/TeacherClassDetail';
import TeacherStudentDetail from './components/views/TeacherStudentDetail';
import TeacherStudents from './components/views/TeacherStudents';
import HomeView, { Logo } from './components/views/HomeView';

export type Screen = 
  | 'HOME'
  | 'LOGIN' 
  | 'FORGOT_PASSWORD'
  | 'PARENT_DASHBOARD' 
  | 'PARENT_CHILD_CLASS' 
  | 'PARENT_RECOMMENDATIONS' 
  | 'PARENT_SETTINGS'
  | 'TEACHER_DASHBOARD' 
  | 'TEACHER_STUDENTS'
  | 'TEACHER_PARENTS_CHILDREN'
  | 'ADMIN_ACCOUNT'
  | 'TEACHER_ACCOUNT'
  | 'TEACHER_MANAGEMENT'
  | 'PARENT_MANAGEMENT'
  | 'CHILD_MANAGEMENT'
  | 'CLASSROOM_MANAGEMENT'
  | 'ENROLLMENT_MANAGEMENT'
  | 'PROGRAM_MANAGEMENT'
  | 'LESSON_MANAGEMENT'
  | 'EXERCISE_MANAGEMENT'
  | 'EXERCISE_TYPE_MANAGEMENT'
  | 'EXERCISE_QUESTION_MANAGEMENT'
  | 'SCHOOL_YEAR_MANAGEMENT'
  | 'SEMESTER_MANAGEMENT'
  | 'LEARNING_RESULT_MANAGEMENT'
  | 'PRONUNCIATION_DETAIL_PAGE'
  | 'PROGRESS_ANALYSIS'
  | 'TEACHER_CLASSES'
  | 'TEACHER_CLASS_DETAIL'
  | 'TEACHER_STUDENT_DETAIL'
  | 'ADMIN_DASHBOARD' 
  | 'LESSON_REVIEW' 
  | 'HISTORY' 
  | 'DIFFICULTY' 
  | 'REPORTS' 
  | 'PROFILES'
  | 'USER_MANAGEMENT'
  | 'ROLE_MANAGEMENT';

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'PARENT' | 'TEACHER' | 'ADMIN' | null>(() => {
    return (localStorage.getItem('user_role') as any) || null;
  });

  const handleLogin = (role: 'PARENT' | 'TEACHER' | 'ADMIN') => {
    setUserRole(role);
    localStorage.setItem('user_role', role);
    if (role === 'PARENT') navigate('/parent/dashboard');
    else if (role === 'TEACHER') navigate('/teacher/dashboard');
    else navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    mockLogout();
    setUserRole(null);
    localStorage.removeItem('user_role');
    navigate('/');
  };

  const parentSidebarItems = [
    { id: 'PARENT_DASHBOARD' as Screen, label: 'Bảng điều khiển', icon: LayoutDashboard, path: '/parent/dashboard' },
    { id: 'PARENT_CHILD_CLASS' as Screen, label: 'Lớp học của con', icon: School, path: '/parent/class' },
    { id: 'PARENT_RECOMMENDATIONS' as Screen, label: 'Khuyến nghị luyện tập', icon: Lightbulb, path: '/parent/recommendations' },
    { id: 'PROFILES' as Screen, label: 'Hồ sơ của bé', icon: UserCircle, path: '/parent/profiles' },
    { id: 'HISTORY' as Screen, label: 'Lịch sử học tập', icon: History, path: '/parent/history' },
    { id: 'LESSON_REVIEW' as Screen, label: 'Xem lại buổi học', icon: PlayCircle, path: '/parent/lesson-review' },
    { id: 'LEARNING_RESULT_MANAGEMENT' as Screen, label: 'Kết quả luyện tập', icon: GraduationCap, path: '/parent/results' },
    { id: 'PROGRESS_ANALYSIS' as Screen, label: 'Phân tích tiến độ', icon: TrendingUp, path: '/parent/progress' },
    { id: 'PRONUNCIATION_DETAIL_PAGE' as Screen, label: 'Chi tiết phát âm', icon: Volume2, path: '/parent/pronunciation' },
    { id: 'REPORTS' as Screen, label: 'Báo cáo tiến độ', icon: BarChart3, path: '/parent/reports' },
    { id: 'PARENT_SETTINGS' as Screen, label: 'Cài đặt tài khoản', icon: Settings, path: '/parent/settings' },
  ];

  const teacherSidebarItems = [
    { id: 'TEACHER_DASHBOARD' as Screen, label: 'Trang chủ', icon: LayoutDashboard, path: '/teacher/dashboard' },
    { id: 'TEACHER_CLASSES' as Screen, label: 'Lớp học của tôi', icon: School, path: '/teacher/classes' },
    { id: 'TEACHER_STUDENTS' as Screen, label: 'Học sinh', icon: UserCircle, path: '/teacher/students' },
    { id: 'TEACHER_PARENTS_CHILDREN' as Screen, label: 'Phụ huynh & Trẻ', icon: Users, path: '/teacher/parents-children' },
    { id: 'LEARNING_RESULT_MANAGEMENT' as Screen, label: 'Kết quả luyện tập', icon: GraduationCap, path: '/teacher/results' },
    { id: 'PROGRESS_ANALYSIS' as Screen, label: 'Phân tích tiến độ', icon: TrendingUp, path: '/teacher/progress' },
    { id: 'PRONUNCIATION_DETAIL_PAGE' as Screen, label: 'Chi tiết phát âm', icon: Volume2, path: '/teacher/pronunciation' },
    { id: 'LESSON_MANAGEMENT' as Screen, label: 'Quản lý bài học', icon: PlayCircle, path: '/teacher/lessons' },
    { id: 'EXERCISE_MANAGEMENT' as Screen, label: 'Quản lý bài tập & câu hỏi', icon: BookOpen, path: '/teacher/exercises' },
    { id: 'DIFFICULTY' as Screen, label: 'Độ khó bài tập', icon: Settings, path: '/teacher/difficulty' },
    { id: 'REPORTS' as Screen, label: 'Báo cáo kết quả', icon: BarChart3, path: '/teacher/reports' },
    { id: 'LESSON_REVIEW' as Screen, label: 'Xem lại buổi học', icon: PlayCircle, path: '/teacher/lesson-review' },
    { id: 'TEACHER_ACCOUNT' as Screen, label: 'Tài khoản cá nhân', icon: Settings, path: '/teacher/account' },
  ];

  const adminSidebarItems = [
    { id: 'ADMIN_DASHBOARD' as Screen, label: 'Bảng điều khiển', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'LEARNING_RESULT_MANAGEMENT' as Screen, label: 'Kết quả luyện tập', icon: GraduationCap, path: '/admin/results' },
    { id: 'PROGRESS_ANALYSIS' as Screen, label: 'Phân tích tiến độ', icon: TrendingUp, path: '/admin/progress' },
    { id: 'PRONUNCIATION_DETAIL_PAGE' as Screen, label: 'Chi tiết phát âm', icon: Volume2, path: '/admin/pronunciation' },
    { id: 'USER_MANAGEMENT' as Screen, label: 'Quản lý người dùng', icon: Users, path: '/admin/users' },
    { id: 'ROLE_MANAGEMENT' as Screen, label: 'Quản lý vai trò', icon: KeyRound, path: '/admin/roles' },
    { id: 'TEACHER_MANAGEMENT' as Screen, label: 'Quản lý giáo viên', icon: GraduationCap, path: '/admin/teachers' },
    { id: 'PARENT_MANAGEMENT' as Screen, label: 'Quản lý phụ huynh', icon: Heart, path: '/admin/parents' },
    { id: 'CHILD_MANAGEMENT' as Screen, label: 'Quản lý hồ sơ trẻ', icon: Baby, path: '/admin/children' },
    { id: 'CLASSROOM_MANAGEMENT' as Screen, label: 'Quản lý lớp học', icon: School, path: '/admin/classrooms' },
    { id: 'ENROLLMENT_MANAGEMENT' as Screen, label: 'Quản lý ghi danh', icon: FileText, path: '/admin/enrollments' },
    { id: 'PROGRAM_MANAGEMENT' as Screen, label: 'Quản lý chương trình học', icon: BookOpen, path: '/admin/programs' },
    { id: 'LESSON_MANAGEMENT' as Screen, label: 'Quản lý bài học', icon: PlayCircle, path: '/admin/lessons' },
    { id: 'EXERCISE_MANAGEMENT' as Screen, label: 'Quản lý bài tập & câu hỏi', icon: BookOpen, path: '/admin/exercises' },
    { id: 'EXERCISE_TYPE_MANAGEMENT' as Screen, label: 'Quản lý loại bài tập', icon: Tags, path: '/admin/exercise-types' },
    { id: 'SCHOOL_YEAR_MANAGEMENT' as Screen, label: 'Quản lý năm học', icon: Calendar, path: '/admin/school-years' },
    { id: 'SEMESTER_MANAGEMENT' as Screen, label: 'Quản lý học kỳ', icon: FolderOpen, path: '/admin/semesters' },
    { id: 'REPORTS' as Screen, label: 'Báo cáo hệ thống', icon: BarChart3, path: '/admin/reports' },
    { id: 'ADMIN_ACCOUNT' as Screen, label: 'Tài khoản cá nhân', icon: Settings, path: '/admin/account' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF5] text-[#1D1D1D] font-sans selection:bg-[#4EACAF]/30">
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Views */}
          <Route path="/" element={
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HomeView onGetStarted={() => navigate('/login')} onLogin={() => navigate('/login')} />
            </motion.div>
          } />
          <Route path="/login" element={
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoginView onLogin={handleLogin} onForgotPasswordClick={() => navigate('/forgot-password')} onBackToHome={() => navigate('/')} />
            </motion.div>
          } />
          <Route path="/forgot-password" element={
            <motion.div key="forgot_password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ForgotPasswordView onBackToLogin={() => navigate('/login')} onBackToHome={() => navigate('/')} />
            </motion.div>
          } />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/change-password" element={
            <motion.div key="change_password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChangePasswordRoute 
                onSuccess={() => {
                  const curr = getCurrentUser();
                  if (curr) {
                    handleLogin(curr.Role);
                  } else {
                    navigate('/login');
                  }
                }} 
                onLogout={handleLogout}
              />
            </motion.div>
          } />

          {/* PARENT Routes Group */}
          <Route path="/parent" element={
            <AuthenticatedLayout userRole={userRole} allowedRole="PARENT" onLogout={handleLogout} sidebarItems={parentSidebarItems} />
          }>
            <Route path="" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="class" element={<ParentChildClass />} />
            <Route path="recommendations" element={<ParentRecommendations />} />
            <Route path="settings" element={<AccountSettings />} />
            <Route path="profiles" element={<ProfileManagement />} />
            <Route path="history" element={<LearningHistory />} />
            <Route path="lesson-review" element={<LessonReview />} />
            <Route path="results" element={<LearningResultManagement />} />
            <Route path="progress" element={<ProgressAnalysis />} />
            <Route path="pronunciation" element={<PronunciationDetailPage />} />
            <Route path="reports" element={<ReportGenerator />} />
          </Route>

          {/* TEACHER Routes Group */}
          <Route path="/teacher" element={
            <AuthenticatedLayout userRole={userRole} allowedRole="TEACHER" onLogout={handleLogout} sidebarItems={teacherSidebarItems} />
          }>
            <Route path="" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="students" element={<TeacherStudents onNavigate={(screen) => handleTeacherNavigation(screen, navigate)} />} />
            <Route path="student/:childId" element={<TeacherStudentDetailRouteWrapper onNavigate={(screen) => handleTeacherNavigation(screen, navigate)} />} />
            <Route path="parents-children" element={<TeacherParentChildManagement />} />
            <Route path="classes" element={<TeacherClasses onNavigate={(screen) => handleTeacherNavigation(screen, navigate)} />} />
            <Route path="class/:classId" element={<TeacherClassDetailRouteWrapper onNavigate={(screen) => handleTeacherNavigation(screen, navigate)} />} />
            <Route path="results" element={<LearningResultManagement />} />
            <Route path="progress" element={<ProgressAnalysis />} />
            <Route path="pronunciation" element={<PronunciationDetailPage />} />
            <Route path="lessons" element={<LessonManagement />} />
            <Route path="exercises" element={<ExerciseManagement />} />
            <Route path="questions" element={<Navigate to="../exercises" replace />} />
            <Route path="difficulty" element={<DifficultySettings />} />
            <Route path="reports" element={<ReportGenerator />} />
            <Route path="lesson-review" element={<LessonReview />} />
            <Route path="account" element={<AccountSettings />} />
          </Route>

          {/* ADMIN Routes Group */}
          <Route path="/admin" element={
            <AuthenticatedLayout userRole={userRole} allowedRole="ADMIN" onLogout={handleLogout} sidebarItems={adminSidebarItems} />
          }>
            <Route path="" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="results" element={<LearningResultManagement />} />
            <Route path="progress" element={<ProgressAnalysis />} />
            <Route path="pronunciation" element={<PronunciationDetailPage />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="parents" element={<ParentManagement />} />
            <Route path="children" element={<ChildManagement />} />
            <Route path="classrooms" element={<ClassroomManagement />} />
            <Route path="enrollments" element={<EnrollmentManagement />} />
            <Route path="programs" element={<ProgramManagement />} />
            <Route path="lessons" element={<LessonManagement />} />
            <Route path="exercises" element={<ExerciseManagement />} />
            <Route path="exercise-types" element={<ExerciseTypeManagement />} />
            <Route path="questions" element={<Navigate to="../exercises" replace />} />
            <Route path="school-years" element={<SchoolYearManagement />} />
            <Route path="semesters" element={<SemesterManagement />} />
            <Route path="reports" element={<ReportGenerator />} />
            <Route path="account" element={<AccountSettings />} />
          </Route>

          {/* Safe Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

// Guarded component for change-password route
function ChangePasswordRoute({
  onSuccess,
  onLogout,
}: {
  onSuccess: () => void;
  onLogout: () => void;
}) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.MustChangePassword) {
    if (currentUser.Role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (currentUser.Role === 'TEACHER') {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/parent/dashboard" replace />;
  }

  return (
    <FirstLoginChangePasswordView
      onSuccess={onSuccess}
      onLogout={onLogout}
    />
  );
}

// Redirect and Shell component for authorized routes
function AuthenticatedLayout({ 
  userRole, 
  allowedRole,
  onLogout, 
  sidebarItems 
}: { 
  userRole: 'PARENT' | 'TEACHER' | 'ADMIN' | null; 
  allowedRole: 'PARENT' | 'TEACHER' | 'ADMIN';
  onLogout: () => void;
  sidebarItems: { id: Screen; label: string; icon: any; path: string }[];
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = getCurrentUser();

  if (!userRole || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.MustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to={`/${userRole.toLowerCase()}`} replace />;
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
        "flex min-h-screen w-full transition-colors duration-500 font-sans",
        isAdmin ? "bg-slate-50 text-slate-900 admin-portal0" : 
        isTeacher ? "bg-[#F4F9F9] text-gray-800 teacher-portal" : 
        "bg-[#FDFCF5] text-[#1D1D1D] parent-portal"
      )}
    >
      {/* Desktop Sidebar */}
      <Sidebar 
        userRole={userRole}
        onLogout={onLogout}
        sidebarItems={sidebarItems}
        className="hidden md:flex shrink-0"
      />

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            />
            
            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
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

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
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

// Global Header Component for Shell
function Header({
  userRole,
  onMenuToggle
}: {
  userRole: 'PARENT' | 'TEACHER' | 'ADMIN' | null;
  onMenuToggle?: () => void;
}) {
  const isAdmin = userRole === 'ADMIN';
  const isTeacher = userRole === 'TEACHER';

  // Greeting and info configuration according to roles
  let greetingTitle = "";
  let greetingSub = "";
  let avatarSeed = "parent";
  let roleLabel = "";
  let badgeLabel = "";

  const currentUser = getCurrentUser();

  if (userRole === 'PARENT') {
    greetingTitle = currentUser ? `Xin chào, ${currentUser.FullName}!` : "Chào Phụ huynh!";
    greetingSub = "Đồng hành rèn luyện thực tế ảo cùng con";
    avatarSeed = currentUser ? currentUser.FullName : "Sophia";
    roleLabel = "Phụ huynh";
    badgeLabel = "Đồng hành rèn luyện VR";
  } else if (userRole === 'TEACHER') {
    greetingTitle = currentUser ? `Kính chào, ${currentUser.FullName}!` : "Xin chào, Giáo viên";
    greetingSub = "Giám sát lớp học và điều chỉnh dải bài tập tương tác";
    avatarSeed = currentUser ? currentUser.FullName : "MsJohnson";
    roleLabel = "Giáo viên";
    badgeLabel = "Đồng quản nhiệm VR";
  } else if (userRole === 'ADMIN') {
    greetingTitle = currentUser ? `Quản trị: ${currentUser.FullName}` : "Hệ thống Quản trị viên";
    greetingSub = "Trạng thái vận hành và giám sát tài nguyên đồng bộ";
    avatarSeed = currentUser ? currentUser.FullName : "AdminSys";
    roleLabel = "Quản trị viên";
    badgeLabel = "Quản trị hệ thống";
  }

  return (
    <header className={cn(
      "w-full h-14 shrink-0 flex items-center justify-between px-4 md:px-8 border-b",
      isAdmin 
        ? "bg-slate-900 border-slate-800 text-slate-100" 
        : isTeacher 
          ? "bg-[#E6EFEB] border-[#D2E0DC] text-gray-800" 
          : "bg-[#F2ECD8] border-[#E5DFCA] text-[#423D33]"
    )}>
      {/* Left side: Hamburger on mobile, and Greetings */}
      <div className="flex items-center space-x-3">
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className={cn(
              "md:hidden p-2 rounded-xl border transition-colors cursor-pointer",
              isAdmin 
                ? "border-slate-800 hover:bg-slate-850 text-slate-300"
                : isTeacher
                  ? "border-[#D2E0DC] hover:bg-[#D7E5E0] text-gray-700"
                  : "border-[#E5DFCA] hover:bg-[#E5DFCA] text-[#555]"
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

      {/* Right side: Bell icon & User profile avatar */}
      <div className="flex items-center space-x-4">
        {/* Unfunctional but styled Notification Button */}
        <button 
          className={cn(
            "p-2 rounded-xl transition-all relative cursor-pointer",
            isAdmin ? "hover:bg-slate-800 text-slate-300" : isTeacher ? "hover:bg-[#D7E5E0] text-gray-700" : "hover:bg-[#E5DFCA] text-[#555]"
          )}
        >
          <Bell className="w-5 h-5 shrink-0" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* User avatar/initial section */}
        <div className={cn(
          "flex items-center space-x-2 pl-3 border-l shrink-0",
          isAdmin ? "border-slate-800" : isTeacher ? "border-[#D2E0DC]" : "border-[#E5DFCA]"
        )}>
          <img 
            src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${avatarSeed}&backgroundColor=transparent`} 
            alt="My avatar" 
            referrerPolicy="no-referrer"
            className={cn(
              "w-7.5 h-7.5 rounded-full bg-white border shrink-0 object-cover",
              isAdmin ? "border-slate-700" : isTeacher ? "border-[#D2E0DC]" : "border-[#E5DFCA]"
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

// Helper to handle teacher relative navigability
function handleTeacherNavigation(screen: string, navigate: any) {
  if (screen.startsWith('TEACHER_STUDENT_DETAIL:')) {
    const childId = screen.split(':')[1];
    navigate(`/teacher/student/${childId}`);
  } else if (screen.startsWith('TEACHER_CLASS_DETAIL:')) {
    const classId = screen.split(':')[1];
    navigate(`/teacher/class/${classId}`);
  } else if (screen === 'TEACHER_CLASSES') {
    navigate('/teacher/classes');
  } else if (screen === 'TEACHER_STUDENTS') {
    navigate('/teacher/students');
  } else {
    // Generic fallback for any direct state changes
    const pathSegment = screen.toLowerCase().replace('teacher_', '').replace('_management', 's');
    navigate(`/teacher/${pathSegment}`);
  }
}

// Wrapper for Teacher class screen mapping
function TeacherClassDetailRouteWrapper({ 
  onNavigate 
}: { 
  onNavigate: (path: string) => void 
}) {
  const { classId } = useParams<{ classId: string }>();
  return <TeacherClassDetail classId={classId || 'CLS-801'} onNavigate={onNavigate} />;
}

// Wrapper for Teacher student state mapping
function TeacherStudentDetailRouteWrapper({ 
  onNavigate 
}: { 
  onNavigate: (path: string) => void 
}) {
  const { childId } = useParams<{ childId: string }>();
  return <TeacherStudentDetail childId={childId || 'CHD-001'} onNavigate={onNavigate} />;
}

function Sidebar({ 
  userRole,
  onLogout,
  sidebarItems,
  onClose,
  className
}: { 
  userRole: 'PARENT' | 'TEACHER' | 'ADMIN' | null;
  onLogout: () => void;
  sidebarItems: { id: Screen; label: string; icon: any; path: string }[];
  onClose?: () => void;
  className?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = userRole === 'ADMIN';
  const isTeacher = userRole === 'TEACHER';

  return (
    <aside className={cn(
      "w-72 flex flex-col h-screen sticky top-0 transition-colors duration-500",
      isAdmin 
        ? "bg-slate-900 border-r border-slate-800 text-slate-100" 
        : isTeacher 
          ? "bg-[#E6EFEB] border-r border-[#D2E0DC] text-gray-800" 
          : "bg-[#F2ECD8] border-r border-[#E5DFCA] text-[#423D33]",
      className
    )}>
      <div className="p-6 md:p-8 flex justify-between items-center shrink-0">
        <Logo className={isAdmin ? "brightness-110" : ""} />
        {onClose && (
          <button 
            onClick={onClose}
            className={cn(
              "p-2 rounded-xl border transition-colors cursor-pointer",
              isAdmin 
                ? "border-slate-800 hover:bg-slate-800 text-slate-350"
                : isTeacher
                  ? "border-[#D2E0DC] hover:bg-[#D7E5E0] text-gray-700"
                  : "border-[#E5DFCA] hover:bg-[#E5DFCA] text-[#555]"
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
                "w-full flex items-center space-x-3 px-5 py-3 transition-all shrink-0 cursor-pointer",
                isAdmin 
                  ? "rounded-xl text-sm " + (isActive ? "bg-[#4EACAF] text-white font-black shadow-md shadow-[#4EACAF]/15" : "hover:bg-slate-800 text-slate-300 font-medium")
                  : isTeacher
                    ? "rounded-[20px] text-sm " + (isActive ? "bg-[#4EACAF] text-white font-black shadow-lg shadow-[#4EACAF]/20" : "hover:bg-[#D7E5E0] text-gray-700 font-bold")
                    : "rounded-[24px] text-sm " + (isActive ? "bg-[#4EACAF] text-white font-black shadow-xl shadow-[#4EACAF]/20" : "hover:bg-[#E5DFCA] text-[#555] font-bold tracking-tight")
              )}
            >
              <item.icon className={cn("shrink-0", isAdmin ? "w-5 h-5" : "w-6 h-6", isActive ? "text-white opacity-1" : "opacity-85")} />
              <span className="text-left font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings / Logout action block */}
      <div className={cn(
        "p-6 space-y-2 shrink-0 border-t",
        isAdmin ? "border-slate-800" : isTeacher ? "border-[#D2E0DC]" : "border-[#E5DFCA]"
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
            "w-full flex items-center space-x-3 px-5 py-3 transition-all font-bold cursor-pointer",
            isAdmin 
              ? "rounded-xl text-sm hover:bg-red-950/40 text-red-400" 
              : isTeacher
                ? "rounded-[20px] text-sm hover:bg-red-50 text-red-600"
                : "rounded-[24px] text-sm hover:bg-red-100/50 text-red-600 tracking-tight"
          )}
        >
          <LogOut className={cn("shrink-0", isAdmin ? "w-5 h-5" : "w-6 h-6")} />
          <span className="text-left font-bold">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

