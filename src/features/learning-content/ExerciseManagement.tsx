import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Eye,
  Globe,
  HelpCircle,
  Layers,
  Mic,
  Play,
  Plus,
  RefreshCw,
  Search,
  Square,
  Tags,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Volume2,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import { cn } from '../../lib/utils';
import ActionButton from '../../components/common/ActionButton';
import CustomSelect from '../../components/common/CustomSelect';
import {
  useExerciseManagementApi,
  type ExerciseQuestionResponse,
  type ExerciseResponse,
  type ExerciseTypeResponse,
} from '../../hooks/useExerciseManagementApi';
import type { LessonResponse } from '../../services/lessonService';
import { getUsers } from '../../services/userService';

interface Lesson {
  LessonId: string;
  LessonName: string;
  Status?: string;
}

interface ExerciseType {
  TypeId: string;
  TypeName: string;
  Description: string;
  IsActive: boolean;
}

interface Exercise {
  ExerciseId: string;
  LessonId: string;
  TeacherId: string;
  TypeId: string;
  ExerciseName: string;
  Instruction: string;
  DifficultyLevel: 'Easy' | 'Medium' | 'Hard';
  TargetSkill: 'Pronunciation' | 'Vocabulary' | 'Oral Motor' | 'Communication';
  Language: 'Vietnamese' | 'English';
  DurationLimit: number;
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
}

interface ExerciseQuestion {
  QuestionId: string;
  ExerciseId: string;
  TeacherId: string;
  Instruction: string;
  QuestionSentence: string;
  AnswerSentence: string;
  InputType:
    | 'Speech'
    | 'Multiple Choice'
    | 'Repeat'
    | 'Listen and Repeat'
    | 'Oral Motor';
  AudioURL?: string;
  ImageURL?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

const FALLBACK_LESSONS: Lesson[] = [
  { LessonId: '1', LessonName: 'Bài học mẫu số 1', Status: 'Active' },
  { LessonId: '2', LessonName: 'Bài học mẫu số 2', Status: 'Active' },
];

const FALLBACK_TYPES: ExerciseType[] = [
  {
    TypeId: '1',
    TypeName: 'Pronunciation Practice',
    Description: 'Loại bài tập mẫu dùng cho phát âm.',
    IsActive: true,
  },
  {
    TypeId: '2',
    TypeName: 'Vocabulary Practice',
    Description: 'Loại bài tập mẫu dùng cho từ vựng.',
    IsActive: true,
  },
];

const FALLBACK_EXERCISES: Exercise[] = [
  {
    ExerciseId: '1',
    LessonId: '1',
    TeacherId: '1',
    TypeId: '1',
    ExerciseName: 'Bài tập phát âm mẫu',
    Instruction: 'Đọc to câu mẫu trong 10 giây.',
    DifficultyLevel: 'Easy',
    TargetSkill: 'Pronunciation',
    Language: 'Vietnamese',
    DurationLimit: 120,
    Status: 'Active',
    CreatedAt: '2026-06-20T10:00:00',
    UpdatedAt: '2026-06-20T10:00:00',
  },
];

const FALLBACK_QUESTIONS: ExerciseQuestion[] = [
  {
    QuestionId: '1',
    ExerciseId: '1',
    TeacherId: '1',
    Instruction: 'Lặp lại câu mẫu.',
    QuestionSentence: 'Xin chào, em tên là...',
    AnswerSentence: 'Xin chào, em tên là...',
    InputType: 'Repeat',
    CreatedAt: '2026-06-20T10:00:00',
    UpdatedAt: '2026-06-20T10:00:00',
  },
];

const mapLesson = (lesson: LessonResponse): Lesson => ({
  LessonId: String(lesson.id),
  LessonName: lesson.lessonName,
  Status: lesson.status,
});

const mapExerciseType = (item: ExerciseTypeResponse): ExerciseType => ({
  TypeId: String(item.id),
  TypeName: item.typeName,
  Description: item.description ?? '',
  IsActive: item.isActive,
});

const mapExercise = (item: ExerciseResponse): Exercise => ({
  ExerciseId: String(item.id),
  LessonId: String(item.lessonId),
  TeacherId: String(item.teacherId),
  TypeId: String(item.typeId),
  ExerciseName: item.exerciseName,
  Instruction: item.instruction ?? '',
  DifficultyLevel: (item.difficultyLevel as Exercise['DifficultyLevel']) || 'Easy',
  TargetSkill: (item.targetSkill as Exercise['TargetSkill']) || 'Pronunciation',
  Language: (item.language as Exercise['Language']) || 'Vietnamese',
  DurationLimit: item.durationLimit,
  Status: item.status,
  CreatedAt: item.createdAt,
  UpdatedAt: item.updatedAt ?? item.createdAt,
});

const mapExerciseQuestion = (item: ExerciseQuestionResponse): ExerciseQuestion => ({
  QuestionId: String(item.id),
  ExerciseId: String(item.exerciseId),
  TeacherId: String(item.teacherId),
  Instruction: item.instruction ?? '',
  QuestionSentence: item.questionSentence,
  AnswerSentence: item.answerSentence,
  InputType:
    (item.inputType as ExerciseQuestion['InputType']) || 'Speech',
  AudioURL: item.audioURL ?? undefined,
  ImageURL: item.imageURL ?? undefined,
  CreatedAt: item.createdAt,
  UpdatedAt: item.updatedAt ?? item.createdAt,
});

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('current_user');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { UserId?: string };
    return Number(parsed.UserId || 0);
  } catch {
    return 0;
  }
}

function getDifficultyClass(level: string) {
  switch (level?.toUpperCase()) {
    case 'EASY':
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-600 border border-amber-100';
    case 'HARD':
      return 'bg-rose-50 text-rose-600 border border-rose-100';
    case 'FOUNDATION':
      return 'bg-slate-50 text-slate-600 border border-slate-200';
    case 'GUIDED':
      return 'bg-sky-50 text-sky-600 border border-sky-200';
    case 'INDEPENDENT':
      return 'bg-purple-50 text-purple-600 border border-purple-200';
    default:
      return 'bg-gray-100 text-gray-500 border border-gray-200';
  }
}

function translateTypeName(name: string) {
  if (!name) return '';
  const upper = name.toUpperCase();
  if (upper === 'AUDITORY DISCRIMINATION') return 'Phân biệt âm';
  if (upper === 'MODELING AND IMITATION') return 'Bắt chước âm';
  if (upper === 'MINIMAL PAIRS') return 'Cặp tối thiểu';
  return name;
}

function translateDifficulty(level: string) {
  switch (level?.toUpperCase()) {
    case 'FOUNDATION': return 'Nền tảng';
    case 'GUIDED': return 'Hướng dẫn';
    case 'INDEPENDENT': return 'Độc lập';
    case 'EASY': return 'Dễ';
    case 'MEDIUM': return 'Vừa';
    case 'HARD': return 'Khó';
    default: return level;
  }
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default function ExerciseManagement() {
  const {
    getLessons,
    getExerciseTypes,
    getExerciseById,
    getExercises,
    getExerciseQuestionById,
    getExerciseQuestions,
    createExercise,
    updateExercise,
    deleteExercise,
    createExerciseQuestion,
    updateExerciseQuestion,
    deleteExerciseQuestion,
  } = useExerciseManagementApi();

  const [lessons, setLessons] = useState<Lesson[]>(FALLBACK_LESSONS);
  const [teachers, setTeachers] = useState<{ id: number; fullName: string }[]>([]);
  const [exerciseTypes, setExerciseTypes] =
    useState<ExerciseType[]>(FALLBACK_TYPES);
  const [exercises, setExercises] = useState<Exercise[]>(FALLBACK_EXERCISES);
  const [questions, setQuestions] =
    useState<ExerciseQuestion[]>(FALLBACK_QUESTIONS);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLesson, setFilterLesson] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [filterLanguage, setFilterLanguage] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentQuestionPage, setCurrentQuestionPage] = useState(1);
  const [questionPageSize, setQuestionPageSize] = useState(5);

  const [activeModal, setActiveModal] = useState<
    | 'exercise'
    | 'question'
    | 'preview'
    | 'preview_exercise'
    | 'delete_exercise'
    | 'delete_question'
    | null
  >(null);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(
    null
  );
  const [deletingQuestion, setDeletingQuestion] = useState<ExerciseQuestion | null>(
    null
  );
  const [exerciseModalMode, setExerciseModalMode] = useState<'add' | 'edit'>(
    'add'
  );
  const [questionModalMode, setQuestionModalMode] = useState<'add' | 'edit'>(
    'add'
  );
  const [previewQuestion, setPreviewQuestion] = useState<ExerciseQuestion | null>(
    null
  );
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioTimer, setAudioTimer] = useState(0);

  const [alertConfig, setAlertConfig] = useState<{
    message: string;
    type: 'success' | 'warning';
  } | null>(null);

  // Sorting states
  const [exerciseSortColumn, setExerciseSortColumn] = useState<keyof Exercise | null>(null);
  const [exerciseSortDirection, setExerciseSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [questionSortColumn, setQuestionSortColumn] = useState<keyof ExerciseQuestion | null>(null);
  const [questionSortDirection, setQuestionSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSortExercises = (column: keyof Exercise) => {
    if (exerciseSortColumn === column) {
      if (exerciseSortDirection === 'asc') {
        setExerciseSortDirection('desc');
      } else if (exerciseSortDirection === 'desc') {
        setExerciseSortColumn(null);
        setExerciseSortDirection(null);
      }
    } else {
      setExerciseSortColumn(column);
      setExerciseSortDirection('asc');
    }
  };

  const handleSortQuestions = (column: keyof ExerciseQuestion) => {
    if (questionSortColumn === column) {
      if (questionSortDirection === 'asc') {
        setQuestionSortDirection('desc');
      } else if (questionSortDirection === 'desc') {
        setQuestionSortColumn(null);
        setQuestionSortDirection(null);
      }
    } else {
      setQuestionSortColumn(column);
      setQuestionSortDirection('asc');
    }
  };

  const [exFormLessonId, setExFormLessonId] = useState('');
  const [exFormTeacherId, setExFormTeacherId] = useState('');
  const [exFormTypeId, setExFormTypeId] = useState('');
  const [exFormName, setExFormName] = useState('');
  const [exFormInstruction, setExFormInstruction] = useState('');
  const [exFormDifficulty, setExFormDifficulty] =
    useState<Exercise['DifficultyLevel']>('Easy');
  const [exFormTargetSkill, setExFormTargetSkill] =
    useState<Exercise['TargetSkill']>('Pronunciation');
  const [exFormLanguage, setExFormLanguage] =
    useState<Exercise['Language']>('Vietnamese');
  const [exFormDuration, setExFormDuration] = useState<number>(120);
  const [exFormStatus, setExFormStatus] = useState<Exercise['Status']>('Active');

  const [qstFormExerciseId, setQstFormExerciseId] = useState('');
  const [qstFormQuestionSentence, setQstFormQuestionSentence] = useState('');
  const [qstFormAnswerSentence, setQstFormAnswerSentence] = useState('');
  const [qstFormInputType, setQstFormInputType] =
    useState<ExerciseQuestion['InputType']>('Speech');
  const [qstFormInstruction, setQstFormInstruction] = useState('');
  const [qstFormAudioURL, setQstFormAudioURL] = useState('');
  const [qstFormImageURL, setQstFormImageURL] = useState('');

  const triggerToast = useCallback(
    (message: string, type: 'success' | 'warning' = 'success') => {
      setAlertConfig({ message, type });
      window.setTimeout(() => setAlertConfig(null), 3500);
    },
    []
  );

  const loadAllPages = useCallback(
    async <T,>(
      getter: (pageNumber: number, pageSize: number) => Promise<{
        success: boolean;
        message: string;
        errors: string[];
        data?: { items: T[]; totalPages: number };
      }>
    ) => {
      const loaded: T[] = [];
      let pageNumber = 1;
      let totalPages = 1;

      while (pageNumber <= totalPages) {
        const result = await getter(pageNumber, 100);
        if (!result.success || !result.data) {
          return {
            success: false as const,
            message: result.errors.join(' ') || result.message,
            items: loaded,
          };
        }

        loaded.push(...result.data.items);
        totalPages = result.data.totalPages || 1;
        pageNumber += 1;
      }

      return { success: true as const, message: '', items: loaded };
    },
    []
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);

    const [lessonResult, typeResult, exerciseResult, questionResult] =
      await Promise.all([
        loadAllPages(getLessons),
        loadAllPages(getExerciseTypes),
        loadAllPages(getExercises),
        loadAllPages(getExerciseQuestions),
      ]);

    if (lessonResult.success) {
      setLessons(lessonResult.items.map(mapLesson));
    } else {
      triggerToast(
        `${lessonResult.message || 'Không thể tải lessons.'} Đang giữ dữ liệu mẫu.`,
        'warning'
      );
    }

    const userRole = localStorage.getItem('user_role');
    if (userRole === 'ADMIN') {
      const userResult = await getUsers(1, 100);
      if (userResult.success && userResult.data) {
        const teacherList = userResult.data.items
          .filter((u) => u.roleName === 'Teacher')
          .map((u) => ({ id: u.id, fullName: u.fullName }));
        setTeachers(teacherList);
      }
    }

    if (typeResult.success) {
      setExerciseTypes(typeResult.items.map(mapExerciseType));
    } else {
      triggerToast(
        `${typeResult.message || 'Không thể tải exercise types.'} Đang giữ dữ liệu mẫu.`,
        'warning'
      );
    }

    if (exerciseResult.success) {
      setExercises(exerciseResult.items.map(mapExercise));
    } else {
      triggerToast(
        `${exerciseResult.message || 'Không thể tải exercises.'} Đang giữ dữ liệu mẫu.`,
        'warning'
      );
    }

    if (questionResult.success) {
      setQuestions(questionResult.items.map(mapExerciseQuestion));
    } else {
      triggerToast(
        `${questionResult.message || 'Không thể tải exercise questions.'} Đang giữ dữ liệu mẫu.`,
        'warning'
      );
    }

    setIsLoading(false);
  }, [
    getExerciseQuestions,
    getExerciseTypes,
    getExercises,
    getLessons,
    loadAllPages,
    triggerToast,
  ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    filterLesson,
    filterType,
    filterDifficulty,
    filterLanguage,
    filterStatus,
  ]);

  useEffect(() => {
    setCurrentQuestionPage(1);
  }, [selectedExercise]);

  useEffect(() => {
    if (!selectedExercise) return;
    const latest = exercises.find(
      (item) => item.ExerciseId === selectedExercise.ExerciseId
    );
    if (!latest) {
      setSelectedExercise(null);
      return;
    }
    if (latest !== selectedExercise) {
      setSelectedExercise(latest);
    }
  }, [exercises, selectedExercise]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((item) => {
      const searchStr =
        `${item.ExerciseName} ${item.TargetSkill} ${item.Instruction} ${item.ExerciseId}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());

      const matchesLesson =
        filterLesson === 'ALL' || item.LessonId === filterLesson;
      const matchesType = filterType === 'ALL' || item.TypeId === filterType;
      const matchesDifficulty =
        filterDifficulty === 'ALL' || item.DifficultyLevel === filterDifficulty;
      const matchesLanguage =
        filterLanguage === 'ALL' || item.Language === filterLanguage;
      const matchesStatus =
        filterStatus === 'ALL' || item.Status === filterStatus;

      return (
        matchesSearch &&
        matchesLesson &&
        matchesType &&
        matchesDifficulty &&
        matchesLanguage &&
        matchesStatus
      );
    });
  }, [
    exercises,
    filterDifficulty,
    filterLanguage,
    filterLesson,
    filterStatus,
    filterType,
    searchQuery,
  ]);

  const totalExercisesPages = Math.max(
    1,
    Math.ceil(filteredExercises.length / pageSize)
  );

  useEffect(() => {
    if (currentPage > totalExercisesPages) {
      setCurrentPage(totalExercisesPages);
    }
  }, [currentPage, totalExercisesPages]);

  const sortedExercises = useMemo(() => {
    if (!exerciseSortColumn || !exerciseSortDirection) return filteredExercises;
    return [...filteredExercises].sort((a, b) => {
      const valA = a[exerciseSortColumn];
      const valB = b[exerciseSortColumn];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return exerciseSortDirection === 'asc'
          ? valA.localeCompare(valB, 'vi-VN', { numeric: true })
          : valB.localeCompare(valA, 'vi-VN', { numeric: true });
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return exerciseSortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredExercises, exerciseSortColumn, exerciseSortDirection]);

  const paginatedExercises = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedExercises.slice(startIndex, startIndex + pageSize);
  }, [currentPage, sortedExercises, pageSize]);

  const selectedExerciseQuestions = useMemo(() => {
    if (!selectedExercise) return [];
    return questions.filter(
      (item) => item.ExerciseId === selectedExercise.ExerciseId
    );
  }, [questions, selectedExercise]);

  const totalQuestionsPages = Math.max(
    1,
    Math.ceil(selectedExerciseQuestions.length / questionPageSize)
  );

  useEffect(() => {
    if (currentQuestionPage > totalQuestionsPages) {
      setCurrentQuestionPage(totalQuestionsPages);
    }
  }, [currentQuestionPage, totalQuestionsPages]);

  const sortedQuestions = useMemo(() => {
    if (!questionSortColumn || !questionSortDirection) return selectedExerciseQuestions;
    return [...selectedExerciseQuestions].sort((a, b) => {
      const valA = a[questionSortColumn];
      const valB = b[questionSortColumn];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return questionSortDirection === 'asc'
          ? valA.localeCompare(valB, 'vi-VN', { numeric: true })
          : valB.localeCompare(valA, 'vi-VN', { numeric: true });
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return questionSortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [selectedExerciseQuestions, questionSortColumn, questionSortDirection]);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentQuestionPage - 1) * questionPageSize;
    return sortedQuestions.slice(
      startIndex,
      startIndex + questionPageSize
    );
  }, [currentQuestionPage, questionPageSize, sortedQuestions]);

  const totalExercises = exercises.length;
  const totalQuestionsSum = questions.length;
  const activeExercises = exercises.filter(
    (item) => item.Status === 'Active'
  ).length;
  const activeExerciseTypes = exerciseTypes.filter(
    (item) => item.IsActive
  ).length;

  const handleOpenAddExercise = () => {
    setExerciseModalMode('add');
    setEditingExerciseId(null);
    setExFormLessonId(lessons[0]?.LessonId || '');
    setExFormTypeId(exerciseTypes[0]?.TypeId || '');
    setExFormName('');
    setExFormInstruction('');
    setExFormDifficulty('Easy');
    setExFormTargetSkill('Pronunciation');
    setExFormLanguage('Vietnamese');
    setExFormDuration(120);
    setExFormStatus('Inactive');
    const userRole = localStorage.getItem('user_role');
    if (userRole === 'ADMIN') {
      setExFormTeacherId(teachers[0]?.id.toString() || getCurrentUserId().toString());
    } else {
      setExFormTeacherId(getCurrentUserId().toString());
    }
    setActiveModal('exercise');
  };

  const handleOpenEditExercise = async (exercise: Exercise) => {
    setExerciseModalMode('edit');
    setEditingExerciseId(exercise.ExerciseId);

    let latest = exercise;
    const result = await getExerciseById(Number(exercise.ExerciseId));
    if (result.success && result.data) {
      latest = mapExercise(result.data);
      setExercises((current) =>
        current.map((item) =>
          item.ExerciseId === latest.ExerciseId ? latest : item
        )
      );
    }

    setExFormLessonId(latest.LessonId);
    setExFormTypeId(latest.TypeId);
    setExFormName(latest.ExerciseName);
    setExFormInstruction(latest.Instruction);
    setExFormDifficulty(latest.DifficultyLevel);
    setExFormTargetSkill(latest.TargetSkill);
    setExFormLanguage(latest.Language);
    setExFormDuration(latest.DurationLimit);
    setExFormStatus(latest.Status);
    setExFormTeacherId(latest.TeacherId);
    setActiveModal('exercise');
  };

  const handleOpenAddQuestion = (exerciseId?: string) => {
    const resolvedExerciseId =
      exerciseId || selectedExercise?.ExerciseId || exercises[0]?.ExerciseId || '';

    if (!resolvedExerciseId) {
      triggerToast('Vui lòng chọn một bài tập trước khi thêm câu hỏi.', 'warning');
      return;
    }

    setQuestionModalMode('add');
    setEditingQuestionId(null);
    setQstFormExerciseId(resolvedExerciseId);
    setQstFormQuestionSentence('');
    setQstFormAnswerSentence('');
    setQstFormInputType('Speech');
    setQstFormInstruction('');
    setQstFormAudioURL('');
    setQstFormImageURL('');
    setActiveModal('question');
  };

  const handleOpenEditQuestion = async (question: ExerciseQuestion) => {
    setQuestionModalMode('edit');
    setEditingQuestionId(question.QuestionId);

    let latest = question;
    const result = await getExerciseQuestionById(Number(question.QuestionId));
    if (result.success && result.data) {
      latest = mapExerciseQuestion(result.data);
      setQuestions((current) =>
        current.map((item) =>
          item.QuestionId === latest.QuestionId ? latest : item
        )
      );
    }

    setQstFormExerciseId(latest.ExerciseId);
    setQstFormQuestionSentence(latest.QuestionSentence);
    setQstFormAnswerSentence(latest.AnswerSentence);
    setQstFormInputType(latest.InputType);
    setQstFormInstruction(latest.Instruction);
    setQstFormAudioURL(latest.AudioURL || '');
    setQstFormImageURL(latest.ImageURL || '');
    setActiveModal('question');
  };

  const handleOpenPreviewQuestion = async (question: ExerciseQuestion) => {
    let latest = question;
    const result = await getExerciseQuestionById(Number(question.QuestionId));
    if (result.success && result.data) {
      latest = mapExerciseQuestion(result.data);
      setQuestions((current) =>
        current.map((item) =>
          item.QuestionId === latest.QuestionId ? latest : item
        )
      );
    }

    setPreviewQuestion(latest);
    setActiveModal('preview');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setPreviewQuestion(null);
    setPlayingAudioId(null);
    setAudioTimer(0);
    setDeletingExercise(null);
    setDeletingQuestion(null);
  };

  const handleSubmitExerciseForm = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!exFormName.trim()) {
      triggerToast('Tên bài tập không được để trống!', 'warning');
      return;
    }
    if (!exFormLessonId || !exFormTypeId) {
      triggerToast('Bài học hoặc loại bài tập chưa hợp lệ!', 'warning');
      return;
    }
    if (exFormDuration <= 0) {
      triggerToast('Thời hạn phải lớn hơn 0 giây!', 'warning');
      return;
    }

    setIsSaving(true);
    const payload = {
      teacherId: Number(exFormTeacherId) || getCurrentUserId(),
      lessonId: Number(exFormLessonId),
      typeId: Number(exFormTypeId),
      exerciseName: exFormName.trim(),
      instruction: exFormInstruction.trim(),
      difficultyLevel: exFormDifficulty,
      targetSkill: exFormTargetSkill,
      language: exFormLanguage,
      durationLimit: exFormDuration,
      status: exFormStatus,
    };

    if (exerciseModalMode === 'add') {
      const result = await createExercise(payload);
      if (result.success && result.data) {
        const created = mapExercise(result.data);
        setExercises((current) => [created, ...current]);
        setSelectedExercise(created);
        triggerToast(`Thêm thành công bài tập "${created.ExerciseName}"!`);
        handleCloseModal();
      } else {
        triggerToast(
          result.errors.join(' ') || result.message || 'Không thể tạo bài tập.',
          'warning'
        );
      }
    } else if (editingExerciseId) {
      const result = await updateExercise(Number(editingExerciseId), payload);
      if (result.success && result.data) {
        const updated = mapExercise(result.data);
        setExercises((current) =>
          current.map((item) =>
            item.ExerciseId === updated.ExerciseId ? updated : item
          )
        );
        if (selectedExercise?.ExerciseId === updated.ExerciseId) {
          setSelectedExercise(updated);
        }
        triggerToast(`Đã lưu thay đổi cho bài tập ${updated.ExerciseId}!`);
        handleCloseModal();
      } else {
        triggerToast(
          result.errors.join(' ') ||
            result.message ||
            'Không thể cập nhật bài tập.',
          'warning'
        );
      }
    }

    setIsSaving(false);
  };

  const handleSubmitQuestionForm = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!qstFormExerciseId) {
      triggerToast('Vui lòng chọn bài tập tương ứng!', 'warning');
      return;
    }
    if (!qstFormQuestionSentence.trim() || !qstFormAnswerSentence.trim()) {
      triggerToast('Câu hỏi và đáp án mẫu không được để trống!', 'warning');
      return;
    }

    setIsSaving(true);
    const selectedEx = exercises.find(
      (item) => item.ExerciseId === qstFormExerciseId
    );
    const payload = {
      exerciseId: Number(qstFormExerciseId),
      teacherId: selectedEx ? Number(selectedEx.TeacherId) : getCurrentUserId(),
      instruction:
        qstFormInstruction.trim() ||
        'Lắng nghe giáo viên ảo hướng dẫn và hoàn thành bài luyện tập nhé!',
      questionSentence: qstFormQuestionSentence.trim(),
      answerSentence: qstFormAnswerSentence.trim(),
      inputType: qstFormInputType,
      audioURL: qstFormAudioURL.trim() || null,
      imageURL: qstFormImageURL.trim() || null,
    };

    if (questionModalMode === 'add') {
      const result = await createExerciseQuestion(payload);
      if (result.success && result.data) {
        const created = mapExerciseQuestion(result.data);
        setQuestions((current) => [created, ...current]);
        triggerToast(`Đã thêm câu hỏi ${created.QuestionId}!`);
        handleCloseModal();
      } else {
        triggerToast(
          result.errors.join(' ') || result.message || 'Không thể tạo câu hỏi.',
          'warning'
        );
      }
    } else if (editingQuestionId) {
      const result = await updateExerciseQuestion(
        Number(editingQuestionId),
        payload
      );
      if (result.success && result.data) {
        const updated = mapExerciseQuestion(result.data);
        setQuestions((current) =>
          current.map((item) =>
            item.QuestionId === updated.QuestionId ? updated : item
          )
        );
        triggerToast(`Đã cập nhật câu hỏi ${updated.QuestionId}!`);
        handleCloseModal();
      } else {
        triggerToast(
          result.errors.join(' ') ||
            result.message ||
            'Không thể cập nhật câu hỏi.',
          'warning'
        );
      }
    }

    setIsSaving(false);
  };

  const handleToggleExerciseStatus = async (
    exercise: Exercise,
    nextStatus: Exercise['Status']
  ) => {
    const result = await updateExercise(Number(exercise.ExerciseId), {
      teacherId: getCurrentUserId() || Number(exercise.TeacherId),
      lessonId: Number(exercise.LessonId),
      typeId: Number(exercise.TypeId),
      exerciseName: exercise.ExerciseName,
      instruction: exercise.Instruction,
      difficultyLevel: exercise.DifficultyLevel,
      targetSkill: exercise.TargetSkill,
      language: exercise.Language,
      durationLimit: exercise.DurationLimit,
      status: nextStatus,
    });

    if (result.success && result.data) {
      const updated = mapExercise(result.data);
      setExercises((current) =>
        current.map((item) =>
          item.ExerciseId === updated.ExerciseId ? updated : item
        )
      );
      if (selectedExercise?.ExerciseId === updated.ExerciseId) {
        setSelectedExercise(updated);
      }
      triggerToast(
        `Đã ${
          nextStatus === 'Active' ? 'kích hoạt' : 'ngừng hoạt động'
        } bài tập ${updated.ExerciseId}!`
      );
      return;
    }

    triggerToast(
      result.errors.join(' ') ||
        result.message ||
        'Không thể cập nhật trạng thái bài tập.',
      'warning'
    );
  };

  const handleOpenDeleteExercise = (exercise: Exercise) => {
    setDeletingExercise(exercise);
    setActiveModal('delete_exercise');
  };

  const handleConfirmDeleteExercise = async () => {
    if (!deletingExercise) return;
    const exerciseId = deletingExercise.ExerciseId;
    const result = await deleteExercise(Number(exerciseId));
    if (result.success) {
      setExercises((current) =>
        current.filter((item) => item.ExerciseId !== exerciseId)
      );
      setQuestions((current) =>
        current.filter((item) => item.ExerciseId !== exerciseId)
      );
      if (selectedExercise?.ExerciseId === exerciseId) {
        setSelectedExercise(null);
      }
      triggerToast(`Đã xóa bài tập ${exerciseId}`, 'warning');
      handleCloseModal();
      return;
    }

    triggerToast(
      result.errors.join(' ') || result.message || 'Không thể xóa bài tập.',
      'warning'
    );
  };

  const handleOpenDeleteQuestion = (question: ExerciseQuestion) => {
    setDeletingQuestion(question);
    setActiveModal('delete_question');
  };

  const handleConfirmDeleteQuestion = async () => {
    if (!deletingQuestion) return;
    const questionId = deletingQuestion.QuestionId;
    const result = await deleteExerciseQuestion(Number(questionId));
    if (result.success) {
      setQuestions((current) =>
        current.filter((item) => item.QuestionId !== questionId)
      );
      triggerToast(`Đã xóa câu hỏi ${questionId}`, 'warning');
      handleCloseModal();
      return;
    }

    triggerToast(
      result.errors.join(' ') || result.message || 'Không thể xóa câu hỏi.',
      'warning'
    );
  };

  const handlePlayAudio = (questionId: string, url?: string) => {
    if (!url) {
      triggerToast('Không có audio mẫu cho câu hỏi này!', 'warning');
      return;
    }

    if (playingAudioId === questionId) {
      setPlayingAudioId(null);
      setAudioTimer(0);
      return;
    }

    setPlayingAudioId(questionId);
    setAudioTimer(4);

    const interval = window.setInterval(() => {
      setAudioTimer((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setPlayingAudioId(null);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  return (
    <div className="relative space-y-12 pb-24 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="pointer-events-auto fixed left-1/2 top-12 z-[300] w-[90%] max-w-lg -translate-x-1/2"
          >
            <div
              className={cn(
                'flex items-center gap-4 rounded-3xl border-2 border-white p-5 shadow-2xl backdrop-blur-md',
                alertConfig.type === 'success'
                  ? 'bg-[#4EACAF]/95 text-white'
                  : 'bg-rose-500/95 text-white'
              )}
            >
              <div className="rounded-xl bg-white/20 p-2">
                {alertConfig.type === 'success' ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0 font-bold">
                <p className="text-sm leading-snug tracking-tight text-white">
                  {alertConfig.message}
                </p>
              </div>
              <button
                onClick={() => setAlertConfig(null)}
                className="rounded-full p-1 text-white transition-colors hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Học liệu luyện nói VR
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Quản Lý <span className="text-[#4EACAF]">Bài Tập & Câu Hỏi</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Hệ thống quản lý bài tập thực hành âm học và các câu hỏi rèn luyện tương tác. Hỗ trợ xây dựng ngân hàng học liệu phong phú và tối ưu lộ trình phát triển ngôn ngữ của trẻ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => void loadData()}
            className="flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-5 py-3.5 text-xs font-black uppercase text-slate-655 transition-all hover:border-[#4EACAF]/30 hover:text-[#4EACAF] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            Tải lại
          </button>
          <button
            onClick={() => handleOpenAddQuestion(selectedExercise?.ExerciseId)}
            className={cn(
              'flex shrink-0 items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-black uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer',
              selectedExercise
                ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 shadow-md shadow-orange-500/10'
                : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            )}
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi
          </button>
          <button
            onClick={handleOpenAddExercise}
            className="flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-[#4EACAF] px-8 py-4 text-xs font-black uppercase text-white shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 hover:bg-[#4EACAF]/90 active:scale-95 italic tracking-tight cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm bài tập
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardItem
          title="Tổng số bài tập"
          value={totalExercises}
          subtitle="Kho học liệu hiện có"
          icon={<Layers className="w-6 h-6 text-[#4EACAF]" />}
        />
        <StatCardItem
          title="Tổng số câu hỏi"
          value={totalQuestionsSum}
          subtitle="Câu luyện nói hỗ trợ"
          icon={<HelpCircle className="w-6 h-6 text-orange-500" />}
        />
        <StatCardItem
          title="Bài tập hoạt động"
          value={activeExercises}
          subtitle="Sẵn sàng phân phối"
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
        />
        <StatCardItem
          title="Loại bài tập"
          value={activeExerciseTypes}
          subtitle="Danh mục đang bật"
          icon={<Tags className="w-6 h-6 text-indigo-500" />}
        />
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
          Tìm kiếm & bộ lọc bài tập
        </h3>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bài tập, kỹ năng hoặc hướng dẫn..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border-2 border-transparent bg-slate-50 py-3.5 pl-11 pr-11 text-xs font-normal text-slate-600 outline-none transition-all placeholder:text-slate-400 focus:border-[#4EACAF] focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 rounded-full bg-gray-200/60 p-1.5 -translate-y-1/2 hover:bg-gray-200"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SelectField
            value={filterLesson}
            onChange={setFilterLesson}
            variant="filter"
            options={[
              { value: 'ALL', label: 'Mọi bài học' },
              ...lessons.map((item) => ({
                value: item.LessonId,
                label: item.LessonName,
              })),
            ]}
          />
          <SelectField
            value={filterType}
            onChange={setFilterType}
            variant="filter"
            options={[
              { value: 'ALL', label: 'Mọi loại bài tập' },
              ...exerciseTypes.map((item) => ({
                value: item.TypeId,
                label: item.TypeName,
              })),
            ]}
          />
          <SelectField
            value={filterDifficulty}
            onChange={setFilterDifficulty}
            variant="filter"
            options={[
              { value: 'ALL', label: 'Độ khó: tất cả' },
              { value: 'Foundation', label: 'Foundation' },
              { value: 'Guided', label: 'Guided' },
              { value: 'Independent', label: 'Independent' },
              { value: 'Easy', label: 'Easy' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Hard', label: 'Hard' },
            ]}
          />
          <SelectField
            value={filterLanguage}
            onChange={setFilterLanguage}
            variant="filter"
            options={[
              { value: 'ALL', label: 'Mọi ngôn ngữ' },
              { value: 'Vietnamese', label: 'Vietnamese' },
              { value: 'English', label: 'English' },
            ]}
          />
          <SelectField
            value={filterStatus}
            onChange={setFilterStatus}
            variant="filter"
            options={[
              { value: 'ALL', label: 'Mọi trạng thái' },
              { value: 'Active', label: 'Đang hoạt động' },
              { value: 'Inactive', label: 'Tạm ngưng' },
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-50 px-8 py-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-800">
              Chi tiết bài tập luyện nói
            </h3>
            <p className="mt-1 text-[11px] font-normal uppercase tracking-wider text-gray-400">
              Đang hiển thị {filteredExercises.length} bài tập theo bộ lọc
            </p>
          </div>
          <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
            API-backed content
          </span>
        </div>

        {filteredExercises.length === 0 ? (
          <div className="space-y-5 py-20 text-center">
            <Layers className="mx-auto h-16 w-16 text-gray-200" strokeWidth={1.5} />
            <h4 className="text-2xl font-black text-gray-700">Chưa có bài tập</h4>
            <p className="mx-auto max-w-md text-sm text-slate-400">
              Tạo bài tập đầu tiên để bắt đầu xây dựng học liệu luyện nói cho ứng dụng VR.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-sans text-slate-700">
                <thead>
                  <tr className="border-b border-gray-150 bg-[#FDFCF5]/50 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    <th 
                      onClick={() => handleSortExercises('ExerciseId')}
                      className="px-[5px] py-5 w-[6%] min-w-[60px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Mã bài"
                    >
                      <div className="flex items-center gap-1">
                        Mã bài
                        {exerciseSortColumn === 'ExerciseId' ? (
                          exerciseSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortExercises('ExerciseName')}
                      className="px-[5px] py-5 w-[28%] min-w-[240px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Tên bài"
                    >
                      <div className="flex items-center gap-1">
                        Tên bài luyện nói
                        {exerciseSortColumn === 'ExerciseName' ? (
                          exerciseSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortExercises('LessonId')}
                      className="px-[5px] py-5 w-[14%] min-w-[130px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Bài học"
                    >
                      <div className="flex items-center gap-1">
                        Bài học
                        {exerciseSortColumn === 'LessonId' ? (
                          exerciseSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortExercises('TypeId')}
                      className="px-[5px] py-5 w-[10%] min-w-[90px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Loại"
                    >
                      <div className="flex items-center gap-1">
                        Loại
                        {exerciseSortColumn === 'TypeId' ? (
                          exerciseSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortExercises('DifficultyLevel')}
                      className="px-[5px] py-5 w-[10%] min-w-[90px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Độ khó"
                    >
                      <div className="flex items-center gap-1">
                        Độ khó
                        {exerciseSortColumn === 'DifficultyLevel' ? (
                          exerciseSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortExercises('TargetSkill')}
                      className="px-[5px] py-5 w-[12%] min-w-[110px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Kỹ năng"
                    >
                      <div className="flex items-center gap-1">
                        Kỹ năng
                        {exerciseSortColumn === 'TargetSkill' ? (
                          exerciseSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortExercises('Status')}
                      className="px-[5px] py-5 w-[10%] min-w-[90px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Trạng thái"
                    >
                      <div className="flex items-center gap-1">
                        Trạng thái
                        {exerciseSortColumn === 'Status' ? (
                          exerciseSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th className="px-[5px] py-5 w-[5%] min-w-[65px] select-none text-slate-500 font-black uppercase text-[10px] tracking-widest">Số câu hỏi</th>
                    <th className="px-[5px] py-5 text-right w-[5%] min-w-[90px] select-none text-slate-500 font-black uppercase text-[10px] tracking-widest">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-normal text-slate-600 md:text-sm">
                  {paginatedExercises.map((exercise) => {
                    const lesson = lessons.find(
                      (item) => item.LessonId === exercise.LessonId
                    );
                    const type = exerciseTypes.find(
                      (item) => item.TypeId === exercise.TypeId
                    );
                    const questionCount = questions.filter(
                      (item) => item.ExerciseId === exercise.ExerciseId
                    ).length;
                    const isSelected =
                      selectedExercise?.ExerciseId === exercise.ExerciseId;

                    return (
                      <tr
                        key={exercise.ExerciseId}
                        className={cn(
                          'cursor-pointer border-l-4 transition-all hover:bg-slate-50/40',
                          isSelected
                            ? 'border-l-[#4EACAF] bg-[#4EACAF]/5 hover:bg-[#4EACAF]/10'
                            : 'border-l-transparent',
                          exercise.Status === 'Inactive' && 'bg-gray-50/20 opacity-70'
                        )}
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        <td className="px-[5px] py-5 font-mono text-xs font-extrabold text-gray-400">
                          {exercise.ExerciseId}
                        </td>
                        <td className="px-[5px] py-5">
                          <div className="max-w-md text-left">
                            <p className="text-sm font-black leading-snug text-gray-950">
                              {exercise.ExerciseName}
                            </p>
                            <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-gray-400">
                              {exercise.Instruction}
                            </p>
                            <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">
                              Giới hạn: {exercise.DurationLimit} giây • Ngôn ngữ:{' '}
                              {exercise.Language}
                            </p>
                          </div>
                        </td>
                        <td className="px-[5px] py-5 text-xs text-slate-800">
                          <span className="line-clamp-2 max-w-[180px] font-bold">
                            {lesson?.LessonName || 'Bài học không tồn tại'}
                          </span>
                        </td>
                        <td className="px-[5px] py-5">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                            {translateTypeName(type?.TypeName || 'Unknown')}
                          </span>
                        </td>
                        <td className="px-[5px] py-5">
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider',
                              getDifficultyClass(exercise.DifficultyLevel)
                            )}
                          >
                            {exercise.DifficultyLevel}
                          </span>
                        </td>
                        <td className="px-[5px] py-5">
                          <span className="rounded bg-[#4EACAF]/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#4EACAF]">
                            {exercise.TargetSkill}
                          </span>
                        </td>
                        <td className="px-[5px] py-5">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider',
                              exercise.Status === 'Active'
                                ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                                : 'border border-transparent bg-gray-100 text-gray-400'
                            )}
                          >
                            {exercise.Status === 'Active' ? 'Hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td className="px-[5px] py-5 text-center font-mono">
                          <span
                            className={cn(
                              'rounded-xl px-2.5 py-1 text-xs font-extrabold',
                              questionCount > 0
                                ? 'border border-amber-100 bg-amber-50 text-amber-600'
                                : 'bg-gray-100 text-gray-400'
                            )}
                          >
                            {questionCount}
                          </span>
                        </td>
                        <td
                          className="px-[5px] py-5 text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex flex-wrap items-center justify-end gap-1 max-w-[72px] ml-auto">
                            <ActionButton
                              type="view"
                              onClick={() => {
                                setSelectedExercise(exercise);
                                setActiveModal('preview_exercise');
                              }}
                              className={cn(isSelected && 'bg-[#4EACAF]/20 text-[#4EACAF]')}
                              title="Xem chi tiết bài tập"
                            />

                            <ActionButton
                              type="edit"
                              onClick={() => void handleOpenEditExercise(exercise)}
                              title="Sửa bài tập"
                            />

                            <ActionButton
                              type="add"
                              onClick={() => handleOpenAddQuestion(exercise.ExerciseId)}
                              title="Thêm câu hỏi"
                            />

                            <ActionButton
                              type="delete"
                              onClick={() => handleOpenDeleteExercise(exercise)}
                              title="Xóa bài tập"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-50 bg-white px-8 py-5">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredExercises.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="bài tập"
              />
            </div>
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-50 px-8 py-6 md:flex-row md:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800">
              <HelpCircle className="w-5.5 h-5.5 text-orange-500" />
              Câu hỏi luyện nói thuộc bài tập
            </h3>
            {selectedExercise ? (
              <p className="mt-1 text-xs font-bold text-[#4EACAF]">
                Đang hiển thị câu hỏi của{' '}
                <strong className="text-slate-700 underline">
                  {selectedExercise.ExerciseName} ({selectedExercise.ExerciseId})
                </strong>
              </p>
            ) : null}
          </div>

          {selectedExercise && (
            <button
              onClick={() => handleOpenAddQuestion(selectedExercise.ExerciseId)}
              className="self-start rounded-xl border border-orange-200/50 bg-orange-50 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-orange-600 transition-all hover:bg-orange-100 md:self-auto"
            >
              <Plus className="mr-1.5 inline h-4.5 w-4.5" />
              Thêm câu hỏi
            </button>
          )}
        </div>

        {!selectedExercise ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8 text-slate-300" />}
            title="Chưa chọn bài tập"
            description="Chọn một bài tập ở bảng phía trên để xem và quản lý các câu hỏi luyện nói thuộc bài tập đó."
          />
        ) : selectedExerciseQuestions.length === 0 ? (
          <EmptyState
            icon={<Activity className="w-8 h-8 text-gray-300" />}
            title="Bài tập này chưa có câu hỏi"
            description="Thêm câu luyện tập, câu trả lời mẫu, audio hoặc hình ảnh minh họa cho bài tập này."
            actionLabel="Thêm câu hỏi"
            onAction={() => handleOpenAddQuestion(selectedExercise.ExerciseId)}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-sans text-slate-700">
                <thead>
                  <tr className="border-b border-gray-150 bg-[#FDFCF5]/50 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    <th 
                      onClick={() => handleSortQuestions('QuestionId')}
                      className="px-[5px] py-5 w-[8%] min-w-[75px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Mã câu hỏi"
                    >
                      <div className="flex items-center gap-1">
                        Mã câu hỏi
                        {questionSortColumn === 'QuestionId' ? (
                          questionSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortQuestions('QuestionSentence')}
                      className="px-[5px] py-5 w-[32%] min-w-[260px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Câu luyện nói"
                    >
                      <div className="flex items-center gap-1">
                        Nội dung câu luyện nói
                        {questionSortColumn === 'QuestionSentence' ? (
                          questionSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortQuestions('AnswerSentence')}
                      className="px-[5px] py-5 w-[24%] min-w-[180px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Câu trả lời mẫu"
                    >
                      <div className="flex items-center gap-1">
                        Câu trả lời mẫu
                        {questionSortColumn === 'AnswerSentence' ? (
                          questionSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortQuestions('InputType')}
                      className="px-[5px] py-5 w-[12%] min-w-[100px] cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      title="Sắp xếp theo Đầu vào"
                    >
                      <div className="flex items-center gap-1">
                        Đầu vào
                        {questionSortColumn === 'InputType' ? (
                          questionSortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th className="px-[5px] py-5 w-[8%] min-w-[70px] select-none">Hình ảnh</th>
                    <th className="px-[5px] py-5 w-[8%] min-w-[85px] select-none">Âm thanh</th>
                    <th className="px-[5px] py-5 text-right w-[8%] min-w-[85px] select-none">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-bold text-gray-600 md:text-sm">
                  {paginatedQuestions.map((question) => {
                    const isAudioPlaying =
                      playingAudioId === question.QuestionId;

                    return (
                      <tr
                        key={question.QuestionId}
                        className="transition-all hover:bg-slate-50/20"
                      >
                        <td className="px-[5px] py-5 font-mono text-xs font-extrabold text-gray-400">
                          {question.QuestionId}
                        </td>
                        <td className="px-[5px] py-5">
                          <div className="max-w-sm text-left">
                            <p className="text-sm font-extrabold leading-snug text-slate-900">
                              {question.QuestionSentence}
                            </p>
                            <p className="mt-1 text-[11px] font-medium italic leading-relaxed text-gray-400">
                              "{question.Instruction}"
                            </p>
                          </div>
                        </td>
                        <td className="px-[5px] py-5">
                          <div className="inline-block max-w-sm rounded-lg border border-sky-100 bg-sky-50 px-3 py-1.5 font-mono text-xs text-sky-600">
                            {question.AnswerSentence}
                          </div>
                        </td>
                        <td className="px-[5px] py-5">
                          <span className="inline-flex items-center gap-1 rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-teal-600">
                            <Mic className="h-3 w-3 shrink-0" />
                            {question.InputType}
                          </span>
                        </td>
                        <td className="px-[5px] py-5">
                          {question.ImageURL ? (
                            <img
                              src={question.ImageURL}
                              alt="Minh họa"
                              className="h-11 w-11 cursor-pointer rounded-xl border border-slate-100 bg-slate-50 object-cover shadow-sm transition-transform hover:scale-105"
                              referrerPolicy="no-referrer"
                              onClick={() => void handleOpenPreviewQuestion(question)}
                            />
                          ) : (
                            <span className="text-xs italic text-gray-300">
                              Chưa có ảnh
                            </span>
                          )}
                        </td>
                        <td className="px-[5px] py-5">
                          {question.AudioURL ? (
                            <button
                              onClick={() =>
                                handlePlayAudio(
                                  question.QuestionId,
                                  question.AudioURL
                                )
                              }
                              className={cn(
                                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all',
                                isAudioPlaying
                                  ? 'animate-pulse border border-rose-200 bg-rose-100 text-rose-600 shadow-md'
                                  : 'bg-[#4EACAF]/10 text-[#4EACAF] hover:bg-[#4EACAF]/20'
                              )}
                            >
                              {isAudioPlaying ? (
                                <>
                                  <Square className="h-3.5 w-3.5 fill-rose-600" />
                                  <span>Tắt ({audioTimer}s)</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3.5 w-3.5" />
                                  <span>Nghe audio</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-xs italic text-gray-300">
                              Phát trực tiếp
                            </span>
                          )}
                        </td>
                        <td className="px-[5px] py-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => void handleOpenPreviewQuestion(question)}
                              className="rounded-xl p-2 text-[#4EACAF] hover:bg-[#4EACAF]/10"
                              title="Preview"
                            >
                              <Play className="h-4 w-4 fill-[#4EACAF]" />
                            </button>
                            <ActionButton
                              type="edit"
                              onClick={() => void handleOpenEditQuestion(question)}
                              title="Sửa câu hỏi"
                            />
                            <ActionButton
                              type="delete"
                              onClick={() => handleOpenDeleteQuestion(question)}
                              title="Xóa câu hỏi"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-50 bg-white px-8 py-5">
              <Pagination
                currentPage={currentQuestionPage}
                totalItems={selectedExerciseQuestions.length}
                pageSize={questionPageSize}
                onPageChange={setCurrentQuestionPage}
                onPageSizeChange={(size) => {
                  setQuestionPageSize(size);
                  setCurrentQuestionPage(1);
                }}
                itemLabel="câu hỏi"
              />
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-gray-900/10 p-4 backdrop-blur-xl animate-in fade-in duration-300 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="my-4 flex max-h-[calc(100vh-48px)] w-full max-w-2xl flex-col overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-2xl md:my-6"
            >
              <div
                className={cn(
                  'shrink-0 border-b px-6 py-5 md:px-8',
                  activeModal === 'exercise'
                    ? 'border-[#4EACAF]/10 bg-[#4EACAF]/10 text-gray-900'
                    : activeModal === 'question'
                      ? 'border-sky-100 bg-sky-50 text-gray-900'
                      : (activeModal === 'delete_exercise' || activeModal === 'delete_question')
                        ? 'border-rose-100 bg-rose-50 text-gray-900'
                        : activeModal === 'preview_exercise'
                          ? 'border-[#4EACAF]/10 bg-[#4EACAF]/10 text-gray-900'
                          : 'border-amber-100 bg-amber-50 text-gray-900'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-2xl font-black italic tracking-tight text-gray-900">
                      {activeModal === 'exercise' && (
                        <>
                          {exerciseModalMode === 'add' ? (
                            <Plus className="w-6 h-6 text-[#4EACAF]" />
                          ) : (
                            <Edit3 className="w-6 h-6 text-sky-500" />
                          )}
                          {exerciseModalMode === 'add'
                            ? 'Thêm bài tập mới'
                            : `Chỉnh sửa bài tập ${editingExerciseId}`}
                        </>
                      )}
                      {activeModal === 'question' && (
                        <>
                          {questionModalMode === 'add' ? (
                            <Plus className="w-6 h-6 text-[#4EACAF]" />
                          ) : (
                            <Edit3 className="w-6 h-6 text-sky-500" />
                          )}
                          {questionModalMode === 'add'
                            ? 'Thêm câu hỏi mới'
                            : `Chỉnh sửa câu hỏi ${editingQuestionId}`}
                        </>
                      )}
                      {activeModal === 'preview' && (
                        <>
                          <Play className="w-6 h-6 text-amber-500" />
                          Preview câu hỏi VR
                        </>
                      )}
                      {activeModal === 'delete_exercise' && (
                        <>
                          <Trash2 className="w-6 h-6 text-rose-500" />
                          Xác nhận xóa bài tập
                        </>
                      )}
                      {activeModal === 'delete_question' && (
                        <>
                          <Trash2 className="w-6 h-6 text-rose-500" />
                          Xác nhận xóa câu hỏi
                        </>
                      )}
                      {activeModal === 'preview_exercise' && (
                        <>
                          <Eye className="w-6 h-6 text-[#4EACAF]" />
                          Chi tiết bài tập luyện nói
                        </>
                      )}
                    </h2>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      {activeModal === 'exercise' &&
                        'Đồng bộ với API exercises và lessons'}
                      {activeModal === 'question' &&
                        'Đồng bộ với API exercisequestions'}
                      {activeModal === 'preview' &&
                        'Xem nội dung, hình ảnh và audio gắn với câu hỏi'}
                      {activeModal === 'preview_exercise' &&
                        'Xem thông tin cấu hình và hướng dẫn chi tiết của bài tập'}
                      {(activeModal === 'delete_exercise' || activeModal === 'delete_question') &&
                        'Hành động này không thể khôi phục và có thể ảnh hưởng đến kết quả học tập'}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="rounded-full p-2.5 transition-colors hover:bg-slate-100"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              {activeModal === 'delete_exercise' && deletingExercise ? (
                <div className="space-y-6 p-6 md:p-8">
                  <div className="flex items-center gap-4 rounded-3xl border border-rose-100 bg-rose-50 p-5 text-rose-700 animate-in fade-in duration-300">
                    <AlertTriangle className="h-10 w-10 shrink-0 text-rose-500" />
                    <div>
                      <h4 className="text-sm font-medium uppercase tracking-wider text-rose-950">
                        Xác nhận xóa bài tập
                      </h4>
                      <p className="mt-1 text-xs font-bold text-rose-700 leading-relaxed">
                        Bạn có chắc chắn muốn xóa bài tập <strong className="text-rose-950">"{deletingExercise.ExerciseName}"</strong>? Hành động này không thể hoàn tác và có thể ảnh hưởng đến kết quả học tập.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 border-t border-gray-150 pt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 cursor-pointer rounded-2xl border-4 border-gray-100 py-4 text-xs font-medium uppercase tracking-wider text-gray-400 transition-all hover:border-gray-200 hover:text-gray-600"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleConfirmDeleteExercise()}
                      className="flex-1 cursor-pointer rounded-2xl bg-rose-500 py-4 text-sm font-medium uppercase tracking-wider text-white shadow-xl shadow-rose-500/15 transition-all hover:bg-rose-600"
                    >
                      Xác nhận xóa
                    </button>
                  </div>
                </div>
              ) : activeModal === 'delete_question' && deletingQuestion ? (
                <div className="space-y-6 p-6 md:p-8">
                  <div className="flex items-center gap-4 rounded-3xl border border-rose-100 bg-rose-50 p-5 text-rose-700 animate-in fade-in duration-300">
                    <AlertTriangle className="h-10 w-10 shrink-0 text-rose-500" />
                    <div>
                      <h4 className="text-sm font-medium uppercase tracking-wider text-rose-950">
                        Xác nhận xóa câu hỏi
                      </h4>
                      <p className="mt-1 text-xs font-bold text-rose-700 leading-relaxed">
                        Bạn có chắc chắn muốn xóa câu hỏi <strong className="text-rose-950">"{deletingQuestion.QuestionSentence}"</strong>? Hành động này không thể hoàn tác và có thể ảnh hưởng đến kết quả học tập.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 border-t border-gray-150 pt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 cursor-pointer rounded-2xl border-4 border-gray-100 py-4 text-xs font-medium uppercase tracking-wider text-gray-400 transition-all hover:border-gray-200 hover:text-gray-600"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleConfirmDeleteQuestion()}
                      className="flex-1 cursor-pointer rounded-2xl bg-rose-500 py-4 text-sm font-medium uppercase tracking-wider text-white shadow-xl shadow-rose-500/15 transition-all hover:bg-rose-600"
                    >
                      Xác nhận xóa
                    </button>
                  </div>
                </div>
              ) : activeModal === 'exercise' ? (
                <form
                  onSubmit={(event) => void handleSubmitExerciseForm(event)}
                  className="space-y-6 overflow-y-auto p-6 md:p-8"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {localStorage.getItem('user_role') === 'ADMIN' && (
                      <FormField label="Giáo viên phụ trách">
                        <SelectField
                          value={exFormTeacherId}
                          onChange={setExFormTeacherId}
                          options={teachers.map((t) => ({
                            value: t.id.toString(),
                            label: t.fullName,
                          }))}
                        />
                      </FormField>
                    )}
                    <FormField label="Bài học liên kết">
                      <SelectField
                        value={exFormLessonId}
                        onChange={setExFormLessonId}
                        options={lessons
                          .filter((item) => item.Status === 'Active' || item.LessonId === exFormLessonId)
                          .map((item) => ({
                            value: item.LessonId,
                            label: item.LessonName,
                          }))}
                      />
                    </FormField>

                    <FormField label="Loại bài tập">
                      <SelectField
                        value={exFormTypeId}
                        onChange={setExFormTypeId}
                        options={exerciseTypes.map((item) => ({
                          value: item.TypeId,
                          label: item.TypeName,
                        }))}
                      />
                    </FormField>

                    <FormField label="Tên bài tập">
                      <input
                        type="text"
                        value={exFormName}
                        onChange={(event) => setExFormName(event.target.value)}
                        className="w-full rounded-2xl border-2 border-transparent bg-[#FDFCF5] px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                      />
                    </FormField>

                    <FormField label="Thời lượng (giây)">
                      <input
                        type="number"
                        min="1"
                        value={exFormDuration}
                        onChange={(event) =>
                          setExFormDuration(Number(event.target.value))
                        }
                        className="w-full rounded-2xl border-2 border-transparent bg-[#FDFCF5] px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                      />
                    </FormField>

                    <FormField label="Độ khó">
                      <SelectField
                        value={exFormDifficulty}
                        onChange={(value) =>
                          setExFormDifficulty(value as Exercise['DifficultyLevel'])
                        }
                        options={[
                          { value: 'Foundation', label: 'Foundation' },
                          { value: 'Guided', label: 'Guided' },
                          { value: 'Independent', label: 'Independent' },
                          { value: 'Easy', label: 'Easy' },
                          { value: 'Medium', label: 'Medium' },
                          { value: 'Hard', label: 'Hard' },
                        ]}
                      />
                    </FormField>

                    <FormField label="Kỹ năng mục tiêu">
                      <SelectField
                        value={exFormTargetSkill}
                        onChange={(value) =>
                          setExFormTargetSkill(value as Exercise['TargetSkill'])
                        }
                        options={[
                          { value: 'Pronunciation', label: 'Pronunciation' },
                          { value: 'Vocabulary', label: 'Vocabulary' },
                          { value: 'Oral Motor', label: 'Oral Motor' },
                          { value: 'Communication', label: 'Communication' },
                        ]}
                      />
                    </FormField>

                    <FormField label="Ngôn ngữ">
                      <SelectField
                        value={exFormLanguage}
                        onChange={(value) =>
                          setExFormLanguage(value as Exercise['Language'])
                        }
                        options={[
                          { value: 'Vietnamese', label: 'Vietnamese' },
                          { value: 'English', label: 'English' },
                        ]}
                      />
                    </FormField>

                    <FormField label="Trạng thái">
                      <SelectField
                        value={exFormStatus}
                        onChange={(value) =>
                          setExFormStatus(value as Exercise['Status'])
                        }
                        options={[
                          { value: 'Active', label: 'Hoạt động' },
                          { value: 'Inactive', label: 'Tạm ngưng' },
                        ]}
                      />
                    </FormField>

                    <div className="md:col-span-2">
                      <FormField label="Hướng dẫn bài tập">
                        <textarea
                          rows={4}
                          value={exFormInstruction}
                          onChange={(event) =>
                            setExFormInstruction(event.target.value)
                          }
                          className="w-full resize-y rounded-2xl border-2 border-transparent bg-[#FDFCF5] p-5 font-bold leading-relaxed text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                        />
                      </FormField>
                    </div>
                  </div>

                  <ModalActions
                    isSaving={isSaving}
                    onCancel={handleCloseModal}
                    submitLabel="Lưu bài tập"
                  />
                </form>
              ) : activeModal === 'question' ? (
                <form
                  onSubmit={(event) => void handleSubmitQuestionForm(event)}
                  className="space-y-6 overflow-y-auto p-6 md:p-8"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField label="Bài tập liên kết">
                      <SelectField
                        value={qstFormExerciseId}
                        onChange={setQstFormExerciseId}
                        options={exercises.map((item) => ({
                          value: item.ExerciseId,
                          label: `${item.ExerciseName} (${item.ExerciseId})`,
                        }))}
                      />
                    </FormField>

                    <FormField label="Kiểu đầu vào">
                      <SelectField
                        value={qstFormInputType}
                        onChange={(value) =>
                          setQstFormInputType(
                            value as ExerciseQuestion['InputType']
                          )
                        }
                        options={[
                          { value: 'Speech', label: 'Speech' },
                          { value: 'Multiple Choice', label: 'Multiple Choice' },
                          { value: 'Repeat', label: 'Repeat' },
                          {
                            value: 'Listen and Repeat',
                            label: 'Listen and Repeat',
                          },
                          { value: 'Oral Motor', label: 'Oral Motor' },
                        ]}
                      />
                    </FormField>

                    <div className="md:col-span-2">
                      <FormField label="Câu hỏi">
                        <textarea
                          rows={3}
                          value={qstFormQuestionSentence}
                          onChange={(event) =>
                            setQstFormQuestionSentence(event.target.value)
                          }
                          className="w-full resize-y rounded-2xl border-2 border-transparent bg-[#FDFCF5] p-5 font-bold leading-relaxed text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                        />
                      </FormField>
                    </div>

                    <div className="md:col-span-2">
                      <FormField label="Đáp án mẫu">
                        <textarea
                          rows={3}
                          value={qstFormAnswerSentence}
                          onChange={(event) =>
                            setQstFormAnswerSentence(event.target.value)
                          }
                          className="w-full resize-y rounded-2xl border-2 border-transparent bg-[#FDFCF5] p-5 font-bold leading-relaxed text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                        />
                      </FormField>
                    </div>

                    <div className="md:col-span-2">
                      <FormField label="Hướng dẫn">
                        <textarea
                          rows={3}
                          value={qstFormInstruction}
                          onChange={(event) =>
                            setQstFormInstruction(event.target.value)
                          }
                          className="w-full resize-y rounded-2xl border-2 border-transparent bg-[#FDFCF5] p-5 font-bold leading-relaxed text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                        />
                      </FormField>
                    </div>

                    <FormField label="Image URL">
                      <input
                        type="url"
                        value={qstFormImageURL}
                        onChange={(event) => setQstFormImageURL(event.target.value)}
                        className="w-full rounded-2xl border-2 border-transparent bg-[#FDFCF5] px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                      />
                    </FormField>

                    <FormField label="Audio URL">
                      <input
                        type="url"
                        value={qstFormAudioURL}
                        onChange={(event) => setQstFormAudioURL(event.target.value)}
                        className="w-full rounded-2xl border-2 border-transparent bg-[#FDFCF5] px-5 py-4 font-bold text-gray-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                      />
                    </FormField>
                  </div>

                  <ModalActions
                    isSaving={isSaving}
                    onCancel={handleCloseModal}
                    submitLabel="Lưu câu hỏi"
                  />
                </form>
              ) : activeModal === 'preview' ? (
                <div className="space-y-6 overflow-y-auto p-6 md:p-8">
                  {previewQuestion && (
                    <>
                      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                        <p className="text-sm font-black text-amber-700">
                          {previewQuestion.QuestionSentence}
                        </p>
                        <p className="mt-2 text-xs font-bold italic text-amber-600">
                          "{previewQuestion.Instruction}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <PreviewCard
                          label="Đáp án mẫu"
                          value={previewQuestion.AnswerSentence}
                        />
                        <PreviewCard
                          label="Kiểu đầu vào"
                          value={previewQuestion.InputType}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                            Hình ảnh minh họa
                          </p>
                          {previewQuestion.ImageURL ? (
                            <img
                              src={previewQuestion.ImageURL}
                              alt="preview"
                              className="mt-4 h-52 w-full rounded-2xl object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <p className="mt-4 text-sm font-bold text-gray-400">
                              Chưa có hình ảnh minh họa.
                            </p>
                          )}
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                            Audio mẫu
                          </p>
                          {previewQuestion.AudioURL ? (
                            <button
                              onClick={() =>
                                handlePlayAudio(
                                  previewQuestion.QuestionId,
                                  previewQuestion.AudioURL
                                )
                              }
                              className={cn(
                                'mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all',
                                playingAudioId === previewQuestion.QuestionId
                                  ? 'border border-rose-200 bg-rose-100 text-rose-600'
                                  : 'bg-[#4EACAF] text-white hover:bg-[#4EACAF]/90'
                              )}
                            >
                              {playingAudioId === previewQuestion.QuestionId ? (
                                <>
                                  <Square className="h-4 w-4 fill-rose-600" />
                                  Dừng audio ({audioTimer}s)
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-4.5 w-4.5" />
                                  Nghe thử Audio
                                </>
                              )}
                            </button>
                          ) : (
                            <p className="mt-4 text-sm font-bold text-gray-400">
                              Chưa có audio mẫu.
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : activeModal === 'preview_exercise' ? (
                <div className="space-y-6 overflow-y-auto p-6 md:p-8">
                  {selectedExercise && (() => {
                    const lesson = lessons.find(l => l.LessonId === selectedExercise.LessonId);
                    const type = exerciseTypes.find(t => t.TypeId === selectedExercise.TypeId);
                    return (
                      <>
                        <div className="rounded-3xl border border-[#4EACAF]/20 bg-[#4EACAF]/5 p-5">
                          <p className="text-sm font-black text-[#4EACAF]">
                            {selectedExercise.ExerciseName}
                          </p>
                          <p className="mt-2 text-xs font-bold text-gray-500">
                            Mã bài tập: {selectedExercise.ExerciseId}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <PreviewCard
                            label="Bài học liên kết"
                            value={lesson?.LessonName || 'Bài học không tồn tại'}
                          />
                          <PreviewCard
                            label="Loại bài tập"
                            value={translateTypeName(type?.TypeName || 'Không xác định')}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          <PreviewCard
                            label="Độ khó"
                            value={selectedExercise.DifficultyLevel}
                          />
                          <PreviewCard
                            label="Kỹ năng mục tiêu"
                            value={selectedExercise.TargetSkill}
                          />
                          <PreviewCard
                            label="Ngôn ngữ"
                            value={selectedExercise.Language || 'Vietnamese'}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <PreviewCard
                            label="Thời lượng giới hạn"
                            value={`${selectedExercise.DurationLimit} giây`}
                          />
                          <PreviewCard
                            label="Trạng thái"
                            value={selectedExercise.Status === 'Active' ? 'Hoạt động' : 'Tạm ngưng'}
                          />
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                            Hướng dẫn bài tập
                          </p>
                          <p className="mt-4 text-sm font-bold text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {selectedExercise.Instruction || 'Không có hướng dẫn.'}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  variant = 'form',
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  variant?: 'filter' | 'form';
}) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
      variant={variant}
    />
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function ModalActions({
  isSaving,
  onCancel,
  submitLabel,
}: {
  isSaving: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-gray-50 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-2xl bg-gray-100 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-gray-500 transition-all hover:bg-gray-200"
      >
        Hủy bỏ
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="flex items-center gap-2 rounded-2xl bg-[#4EACAF] px-8 py-3.5 text-xs font-medium uppercase tracking-wider text-white shadow-lg shadow-[#4EACAF]/10 transition-all hover:bg-[#4EACAF]/90"
      >
        {isSaving ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {submitLabel}
      </button>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="space-y-4 py-20 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-[#FDFCF5] shadow-xs">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-700">{title}</h4>
      <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-xl bg-orange-500 px-6 py-3 text-xs font-medium uppercase tracking-wider text-white shadow-md transition-all hover:bg-orange-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function StatCardItem({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-5 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black leading-tight tracking-tight text-gray-900">
          {value}
        </p>
        <p className="mt-1 text-xs font-normal uppercase tracking-wider text-gray-400">
          {title}
        </p>
        <p className="mt-1 text-[10px] font-bold text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function PreviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-3 text-sm font-bold leading-relaxed text-slate-700">
        {value}
      </p>
    </div>
  );
}
