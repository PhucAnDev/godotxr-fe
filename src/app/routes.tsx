import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { getCurrentUser } from '../lib/authMock';
import HomeView from '../features/public/HomeView';
import LoginView from '../features/auth/LoginView';
import ForgotPasswordView from '../features/auth/ForgotPasswordView';
import AccountSettings from '../features/auth/AccountSettings';
import AdminDashboard from '../features/admin/AdminDashboard';
import UserManagement from '../features/admin/UserManagement';
import RoleManagement from '../features/admin/RoleManagement';
import TeacherManagement from '../features/admin/TeacherManagement';
import ParentManagement from '../features/admin/ParentManagement';
import ChildManagement from '../features/admin/ChildManagement';
import ClassroomManagement from '../features/admin/ClassroomManagement';
import EnrollmentManagement from '../features/admin/EnrollmentManagement';
import SchoolYearManagement from '../features/admin/SchoolYearManagement';
import SemesterManagement from '../features/admin/SemesterManagement';
import TeacherDashboard from '../features/teacher/TeacherDashboard';
import TeacherClasses from '../features/teacher/TeacherClasses';
import TeacherClassDetail from '../features/teacher/TeacherClassDetail';
import TeacherStudents from '../features/teacher/TeacherStudents';
import TeacherStudentDetail from '../features/teacher/TeacherStudentDetail';
import TeacherParentChildManagement from '../features/teacher/TeacherParentChildManagement';
import DifficultySettings from '../features/teacher/DifficultySettings';
import ParentDashboard from '../features/parent/ParentDashboard';
import ParentChildClass from '../features/parent/ParentChildClass';
import ParentRecommendations from '../features/parent/ParentRecommendations';
import ProfileManagement from '../features/parent/ProfileManagement';
import LearningHistory from '../features/parent/LearningHistory';
import ProgramManagement from '../features/learning-content/ProgramManagement';
import LessonManagement from '../features/learning-content/LessonManagement';
import ExerciseManagement from '../features/learning-content/ExerciseManagement';
import ExerciseTypeManagement from '../features/learning-content/ExerciseTypeManagement';
import LearningResultManagement from '../features/learning-result/LearningResultManagement';
import PronunciationDetailPage from '../features/learning-result/PronunciationDetailPage';
import ProgressAnalysis from '../features/learning-result/ProgressAnalysis';
import LessonReview from '../features/learning-result/LessonReview';
import ReportGenerator from '../features/reports/ReportGenerator';
import { ChangePasswordRoute, RegisterRedirect } from './routeGuards';
import {
  adminSidebarItems,
  parentSidebarItems,
  teacherSidebarItems,
  type UserRole,
} from './navigation';

export function AppRoutes() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('user_role') as UserRole | null) || null;
  });

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('user_role', role);
    if (role === 'PARENT') navigate('/parent/dashboard');
    else if (role === 'TEACHER') navigate('/teacher/dashboard');
    else navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    // Xóa toàn bộ dữ liệu phiên đăng nhập khỏi localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_role');
    setUserRole(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF5] text-[#1D1D1D] font-sans selection:bg-[#4EACAF]/30">
      <AnimatePresence mode="wait">
        <Routes>
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
          <Route path="/register" element={<RegisterRedirect />} />
          <Route path="/change-password" element={
            <motion.div key="change_password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChangePasswordRoute
                onSuccess={() => {
                  const currentUser = getCurrentUser();
                  if (currentUser) {
                    handleLogin(currentUser.Role);
                  } else {
                    navigate('/login');
                  }
                }}
                onLogout={handleLogout}
              />
            </motion.div>
          } />

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function handleTeacherNavigation(screen: string, navigate: (to: string) => void) {
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
    const pathSegment = screen.toLowerCase().replace('teacher_', '').replace('_management', 's');
    navigate(`/teacher/${pathSegment}`);
  }
}

function TeacherClassDetailRouteWrapper({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const { classId } = useParams<{ classId: string }>();
  return <TeacherClassDetail classId={classId || 'CLS-801'} onNavigate={onNavigate} />;
}

function TeacherStudentDetailRouteWrapper({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const { childId } = useParams<{ childId: string }>();
  return <TeacherStudentDetail childId={childId || 'CHD-001'} onNavigate={onNavigate} />;
}
