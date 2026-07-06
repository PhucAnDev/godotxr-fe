import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Baby,
  BookOpen,
  Calendar,
  FileText,
  FolderOpen,
  GraduationCap,
  Heart,
  History,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  PlayCircle,
  School,
  Settings,
  Tags,
  TrendingUp,
  UserCircle,
  Users,
  Volume2,
} from 'lucide-react';

export type UserRole = 'PARENT' | 'TEACHER' | 'ADMIN';

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
  | 'ANALYZE_MANAGEMENT'
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

export type SidebarItem = {
  id: Screen;
  label: string;
  icon: LucideIcon;
  path: string;
  children?: SidebarItem[];
};

export const parentSidebarItems: SidebarItem[] = [
  {
    id: 'PARENT_DASHBOARD',
    label: 'Bảng điều khiển',
    icon: LayoutDashboard,
    path: '/parent/dashboard',
  },
  {
    id: 'PARENT_CHILD_CLASS',
    label: 'Lớp học của con',
    icon: School,
    path: '/parent/class',
  },
  {
    id: 'PARENT_RECOMMENDATIONS',
    label: 'Khuyến nghị luyện tập',
    icon: Lightbulb,
    path: '/parent/recommendations',
  },
  {
    id: 'PROFILES',
    label: 'Hồ sơ của bé',
    icon: UserCircle,
    path: '/parent/profiles',
  },
  {
    id: 'HISTORY',
    label: 'Lịch sử học tập',
    icon: History,
    path: '/parent/history',
  },
  {
    id: 'LEARNING_RESULT_MANAGEMENT',
    label: 'Kết quả luyện tập',
    icon: GraduationCap,
    path: '/parent/results',
  },
  {
    id: 'PROGRESS_ANALYSIS',
    label: 'Phân tích tiến độ',
    icon: TrendingUp,
    path: '/parent/progress',
  },
  {
    id: 'PARENT_SETTINGS',
    label: 'Cài đặt tài khoản',
    icon: Settings,
    path: '/parent/settings',
  },
];

export const teacherSidebarItems: SidebarItem[] = [
  {
    id: 'TEACHER_DASHBOARD',
    label: 'Trang chủ',
    icon: LayoutDashboard,
    path: '/teacher/dashboard',
  },
  {
    id: 'TEACHER_CLASSES',
    label: 'Lớp học của tôi',
    icon: School,
    path: '/teacher/classes',
  },
  {
    id: 'TEACHER_STUDENTS',
    label: 'Học sinh',
    icon: UserCircle,
    path: '/teacher/students',
  },
  {
    id: 'CHILD_MANAGEMENT',
    label: 'Quản lý hồ sơ trẻ',
    icon: Baby,
    path: '/teacher/children',
  },
  {
    id: 'LEARNING_RESULT_MANAGEMENT',
    label: 'Kết quả luyện tập',
    icon: GraduationCap,
    path: '/teacher/results',
  },
  {
    id: 'PRONUNCIATION_DETAIL_PAGE',
    label: 'Chi tiết phát âm',
    icon: Volume2,
    path: '/teacher/pronunciation',
  },
  {
    id: 'PROGRESS_ANALYSIS',
    label: 'Phân tích tiến độ',
    icon: TrendingUp,
    path: '/teacher/progress',
  },
  {
    id: 'ANALYZE_MANAGEMENT',
    label: 'Đánh giá trẻ',
    icon: FileText,
    path: '/teacher/analyzes',
  },
  {
    id: 'PARENT_MANAGEMENT',
    label: 'Quản lý phụ huynh',
    icon: Heart,
    path: '/teacher/parents',
  },
  {
    id: 'LESSON_MANAGEMENT',
    label: 'Quản lý bài học',
    icon: PlayCircle,
    path: '/teacher/lessons',
  },
  {
    id: 'EXERCISE_MANAGEMENT',
    label: 'Quản lý bài tập và câu hỏi',
    icon: BookOpen,
    path: '/teacher/exercises',
  },
  {
    id: 'DIFFICULTY',
    label: 'Độ khó bài tập',
    icon: Settings,
    path: '/teacher/difficulty',
  },
  {
    id: 'REPORTS',
    label: 'Báo cáo kết quả',
    icon: BarChart3,
    path: '/teacher/reports',
  },
  {
    id: 'LESSON_REVIEW',
    label: 'Xem lại buổi học',
    icon: PlayCircle,
    path: '/teacher/lesson-review',
  },
  {
    id: 'TEACHER_ACCOUNT',
    label: 'Tài khoản cá nhân',
    icon: Settings,
    path: '/teacher/account',
  },
];

const userManagementChildren: SidebarItem[] = [
  {
    id: 'TEACHER_MANAGEMENT',
    label: 'Quản lý giáo viên',
    icon: GraduationCap,
    path: '/admin/teachers',
  },
  {
    id: 'PARENT_MANAGEMENT',
    label: 'Quản lý phụ huynh',
    icon: Heart,
    path: '/admin/parents',
  },
  {
    id: 'CHILD_MANAGEMENT',
    label: 'Quản lý hồ sơ trẻ',
    icon: Baby,
    path: '/admin/children',
  },
  {
    id: 'ANALYZE_MANAGEMENT',
    label: 'Đánh giá trẻ',
    icon: FileText,
    path: '/admin/analyzes',
  },
  {
    id: 'ROLE_MANAGEMENT',
    label: 'Quản lý vai trò',
    icon: KeyRound,
    path: '/admin/roles',
  },
];

export const adminSidebarItems: SidebarItem[] = [
  {
    id: 'ADMIN_DASHBOARD',
    label: 'Bảng điều khiển',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
  },
  {
    id: 'USER_MANAGEMENT',
    label: 'Quản lý người dùng',
    icon: Users,
    path: '/admin/users',
    children: userManagementChildren,
  },
  {
    id: 'CLASSROOM_MANAGEMENT',
    label: 'Quản lý lớp học',
    icon: School,
    path: '/admin/classrooms',
  },
  {
    id: 'ENROLLMENT_MANAGEMENT',
    label: 'Quản lý ghi danh',
    icon: FileText,
    path: '/admin/enrollments',
  },
  {
    id: 'SEMESTER_MANAGEMENT',
    label: 'Quản lý học kỳ',
    icon: FolderOpen,
    path: '/admin/semesters',
  },
  {
    id: 'SCHOOL_YEAR_MANAGEMENT',
    label: 'Quản lý năm học',
    icon: Calendar,
    path: '/admin/school-years',
  },
  {
    id: 'PROGRAM_MANAGEMENT',
    label: 'Quản lý chương trình học',
    icon: BookOpen,
    path: '/admin/programs',
  },
  {
    id: 'LESSON_MANAGEMENT',
    label: 'Quản lý bài học',
    icon: PlayCircle,
    path: '/admin/lessons',
  },
  {
    id: 'EXERCISE_MANAGEMENT',
    label: 'Quản lý bài tập và câu hỏi',
    icon: BookOpen,
    path: '/admin/exercises',
  },
  {
    id: 'EXERCISE_TYPE_MANAGEMENT',
    label: 'Quản lý loại bài tập',
    icon: Tags,
    path: '/admin/exercise-types',
  },
  {
    id: 'LEARNING_RESULT_MANAGEMENT',
    label: 'Kết quả luyện tập',
    icon: GraduationCap,
    path: '/admin/results',
  },
  {
    id: 'PROGRESS_ANALYSIS',
    label: 'Phân tích tiến độ',
    icon: TrendingUp,
    path: '/admin/progress',
  },
  {
    id: 'PRONUNCIATION_DETAIL_PAGE',
    label: 'Chi tiết phát âm',
    icon: Volume2,
    path: '/admin/pronunciation',
  },
  {
    id: 'REPORTS',
    label: 'Báo cáo hệ thống',
    icon: BarChart3,
    path: '/admin/reports',
  },
  {
    id: 'ADMIN_ACCOUNT',
    label: 'Tài khoản cá nhân',
    icon: Settings,
    path: '/admin/account',
  },
];
