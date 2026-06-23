import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  X, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  AlertTriangle, 
  Eye, 
  Award, 
  Clock, 
  Play, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Star,
  Sparkles,
  BookOpen,
  Settings,
  Flame,
  Activity,
  Layers,
  Globe,
  Smile,
  Trash2,
  Copy,
  Image as ImageIcon,
  Square,
  Volume2,
  Mic,
  Tags,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/common/Pagination';

// DB Interfaces according to schema
interface Lesson {
  LessonId: string;
  LessonName: string;
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
  TypeId: string;
  ExerciseName: string;
  Instruction: string;
  DifficultyLevel: 'Easy' | 'Medium' | 'Hard';
  TargetSkill: 'Pronunciation' | 'Vocabulary' | 'Oral Motor' | 'Communication';
  Language: 'Vietnamese' | 'English';
  DurationLimit: number; // in seconds
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
  InputType: 'Speech' | 'Multiple Choice' | 'Repeat' | 'Listen and Repeat' | 'Oral Motor';
  AudioURL?: string;
  ImageURL?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface StudentReport {
  studentName: string;
  avatarSeed: string;
  score: number;
  timeSpent: number;
  attemptsCount: number;
  passed: boolean;
  completionDate: string;
}

// 1. Mock Lessons from DB
const MOCK_LESSONS: Lesson[] = [
  { LessonId: 'LSN-001', LessonName: 'Nhận Diện Ký Tự Nguyên Âm Đơn Sơ Khởi' },
  { LessonId: 'LSN-002', LessonName: 'Chinh Phục Phụ Âm Phản Xạ Lạc Lối' },
  { LessonId: 'LSN-003', LessonName: 'Giao Tiếp Không Gian cùng Phi Hành Gia' },
  { LessonId: 'LSN-004', LessonName: 'Từ Vựng Sắc Màu Cổ Tích Thần Kỳ' },
  { LessonId: 'LSN-005', LessonName: 'Uốn Lưỡi Tránh Ngọng Chữ R Nâng Cao' },
  { LessonId: 'LSN-006', LessonName: 'Tên Gọi Các Bạn Động Vật Nông Trại Vui Vẻ' }
];

// 2. Mock Exercise Types from DB
const MOCK_EXERCISE_TYPES: ExerciseType[] = [
  { TypeId: 'TYP-001', TypeName: 'Nhận diện giọng nói', Description: 'Nhận diện phát âm qua microphone ảo thời gian thực trong VR', IsActive: true },
  { TypeId: 'TYP-002', TypeName: 'Thẻ bài tương tác', Description: 'Bộ thẻ bài 3D nổi chọn ghép lật vật phẩm', IsActive: true },
  { TypeId: 'TYP-003', TypeName: 'Hướng dẫn phát âm 3D', Description: 'Hướng dẫn khẩu hình 3D miệng và uốn rung lưỡi', IsActive: true },
  { TypeId: 'TYP-004', TypeName: 'Bắn bóng nước', Description: 'Bắn bóng nước bập bùng để ghép chữ hoặc chọn khái niệm thích hợp', IsActive: true }
];

// 3. Initial Mock Exercises
const INITIAL_EXERCISES: Exercise[] = [
  {
    ExerciseId: 'EXE-001',
    LessonId: 'LSN-001',
    TypeId: 'TYP-003',
    ExerciseName: 'Thổi hơi dập lửa cùng Bé Rồng đỏ',
    Instruction: 'Bé hãy mở to vòm miệng phát âm tròn âm "A" thật to và đều đặn trong 3 giây để tạo ra luồng gió ảo thổi tắt ngọn nến lung linh của bé Rồng dễ thương.',
    DifficultyLevel: 'Easy',
    TargetSkill: 'Oral Motor',
    Language: 'Vietnamese',
    DurationLimit: 120,
    Status: 'Active',
    CreatedAt: '2026-05-10 10:15',
    UpdatedAt: '2026-05-12 11:30'
  },
  {
    ExerciseId: 'EXE-002',
    LessonId: 'LSN-001',
    TypeId: 'TYP-001',
    ExerciseName: 'Đọc trơn cùng Khủng Long Bay Pterodactyl',
    Instruction: 'Chào mừng bé! Khi chú khủng long bay ngang qua màn hình và mang theo các nguyên âm A, E, O, bé hãy hướng mắt về đó và dốc sức phát âm chính xác nguyên âm để nhận thêm sao vàng nhé.',
    DifficultyLevel: 'Easy',
    TargetSkill: 'Pronunciation',
    Language: 'Vietnamese',
    DurationLimit: 90,
    Status: 'Active',
    CreatedAt: '2026-05-11 09:20',
    UpdatedAt: '2026-05-11 09:20'
  },
  {
    ExerciseId: 'EXE-003',
    LessonId: 'LSN-002',
    TypeId: 'TYP-002',
    ExerciseName: 'Bộ gắp lọc táo ngọng N và L',
    Instruction: 'Hãy dùng tay cầm VR gắp các quả táo phát âm chuẩn âm L (Lá, Lúa, Lông) đặt vào rổ Con Thỏ L, các quả táo phát âm N (Nước, Núi, Nấm) gieo vào rổ Con Thỏ N.',
    DifficultyLevel: 'Medium',
    TargetSkill: 'Oral Motor',
    Language: 'Vietnamese',
    DurationLimit: 180,
    Status: 'Active',
    CreatedAt: '2026-05-12 15:00',
    UpdatedAt: '2026-05-13 14:15'
  },
  {
    ExerciseId: 'EXE-004',
    LessonId: 'LSN-003',
    TypeId: 'TYP-001',
    ExerciseName: 'Phản xạ tiếng Anh cùng Phi Hành Gia Cosmo',
    Instruction: 'Lắng nghe phi hành gia Cosmo hỏi thăm sức khỏe bé, sau đó bé ấn nút đàm thoại trên tay cầm VR để trả lời thật dứt khoát "Hello Commander, I am fine!" bằng giọng nói trôi chảy.',
    DifficultyLevel: 'Hard',
    TargetSkill: 'Communication',
    Language: 'English',
    DurationLimit: 120,
    Status: 'Active',
    CreatedAt: '2026-05-14 08:30',
    UpdatedAt: '2026-05-18 10:00'
  },
  {
    ExerciseId: 'EXE-005',
    LessonId: 'LSN-004',
    TypeId: 'TYP-002',
    ExerciseName: 'Lọ nước ma thuật rực rỡ màu sắc',
    Instruction: 'Mụ phù thủy tốt bụng vừa tạo ra một thung lũng màu sắc đầy sương khói bay bổng. Bé hãy bấm chọn chính xác lọ nước ma thuật có màu sắc tương ứng theo khẩu lệnh như "Red" hoặc "Yellow"!',
    DifficultyLevel: 'Easy',
    TargetSkill: 'Vocabulary',
    Language: 'English',
    DurationLimit: 150,
    Status: 'Active',
    CreatedAt: '2026-05-15 11:45',
    UpdatedAt: '2026-05-15 11:45'
  },
  {
    ExerciseId: 'EXE-006',
    LessonId: 'LSN-005',
    TypeId: 'TYP-003',
    ExerciseName: 'Rung đầu lưỡi rước Ong Vàng về tổ',
    Instruction: 'Kỹ thuật tuyệt vời cho chữ R! Bé hãy cong đầu lưỡi lên vòm họng và rung sâu tạo ra tiếng "Rrrrr" liên hồi. Càng giữ hơi rung lâu, đàn ong vàng đáng yêu càng kéo về xây tổ nhiều bấy nhiêu.',
    DifficultyLevel: 'Hard',
    TargetSkill: 'Oral Motor',
    Language: 'Vietnamese',
    DurationLimit: 60,
    Status: 'Active',
    CreatedAt: '2026-05-18 16:30',
    UpdatedAt: '2026-05-20 09:12'
  },
  {
    ExerciseId: 'EXE-007',
    LessonId: 'LSN-006',
    TypeId: 'TYP-004',
    ExerciseName: 'Bắn bóng nước đoán bạn Bò Sữa vui nhộn',
    Instruction: 'Toàn bộ nông trại vang lên tiếng kêu ngộ nghĩnh của các con vật. Khi bé nghe tiếng "Moooohhh", hãy dùng súng bắn bong bóng nhắm bắn chính xác vào chú Bò Sữa 3D đang gặm cỏ để dắt bạn ấy về nông trại.',
    DifficultyLevel: 'Medium',
    TargetSkill: 'Vocabulary',
    Language: 'English',
    DurationLimit: 180,
    Status: 'Inactive',
    CreatedAt: '2026-05-22 14:00',
    UpdatedAt: '2026-05-25 10:45'
  }
];

// 4. Initial Mock questions for EXERCISE_QUESTION
const INITIAL_QUESTIONS: ExerciseQuestion[] = [
  {
    QuestionId: 'QST-001',
    ExerciseId: 'EXE-001',
    TeacherId: 'TCH-001',
    Instruction: 'Bé hãy hít sâu, bĩu môi nhẹ rồi thổi một hơi thật dài thẳng vào microphone.',
    QuestionSentence: 'Hít hơi vào vòm ngấn cổ rồi thổi rung ngọn lửa rồng!',
    AnswerSentence: '[Luồng hơi liên tục trong 3 giây > 40dB]',
    InputType: 'Oral Motor',
    AudioURL: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    ImageURL: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=300',
    CreatedAt: '2026-05-15 10:15',
    UpdatedAt: '2026-05-15 10:15'
  },
  {
    QuestionId: 'QST-002',
    ExerciseId: 'EXE-002',
    TeacherId: 'TCH-002',
    Instruction: 'Nghe kĩ nguyên âm của Khủng Long Bay và đọc to rõ ràng.',
    QuestionSentence: 'Nguyên âm "A" tròn vòm miệng!',
    AnswerSentence: 'A',
    InputType: 'Repeat',
    AudioURL: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    ImageURL: 'https://images.unsplash.com/photo-1584441401314-d02f82c045b7?auto=format&fit=crop&q=80&w=300',
    CreatedAt: '2026-05-16 09:30',
    UpdatedAt: '2026-05-16 11:20'
  },
  {
    QuestionId: 'QST-003',
    ExerciseId: 'EXE-003',
    TeacherId: 'TCH-001',
    Instruction: 'Tìm quả táo ngọt chứa tiếng có âm "L" chính xác để cứu Thỏ trắng.',
    QuestionSentence: 'Hãy gắp quả táo ghi chữ: LÁ, LÚA, NƯỚC, NẤM',
    AnswerSentence: 'LÁ, LÚA',
    InputType: 'Multiple Choice',
    ImageURL: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=300',
    CreatedAt: '2026-05-17 14:00',
    UpdatedAt: '2026-05-18 09:45'
  },
  {
    QuestionId: 'QST-004',
    ExerciseId: 'EXE-004',
    TeacherId: 'TCH-003',
    Instruction: 'Trả lời câu hỏi đàm thoại tiếng Anh của Phi hành gia một cách lịch sự.',
    QuestionSentence: 'Space Ranger John asks: "How is the weather outside your rocket?"',
    AnswerSentence: 'It is sunny / It is beautiful',
    InputType: 'Speech',
    AudioURL: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    ImageURL: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300',
    CreatedAt: '2026-05-19 11:00',
    UpdatedAt: '2026-05-19 11:30'
  },
  {
    QuestionId: 'QST-005',
    ExerciseId: 'EXE-005',
    TeacherId: 'TCH-001',
    Instruction: 'Chọn lọ ma thuật có dán nhãn màu sắc phù hợp với yêu cầu.',
    QuestionSentence: 'Hãy nhấp vào lọ ma thuật màu vàng rực rỡ nhất: YELLOW',
    AnswerSentence: 'Lọ màu vàng',
    InputType: 'Multiple Choice',
    ImageURL: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=300',
    CreatedAt: '2026-05-20 16:20',
    UpdatedAt: '2026-05-20 16:20'
  },
  {
    QuestionId: 'QST-006',
    ExerciseId: 'EXE-006',
    TeacherId: 'TCH-002',
    Instruction: 'Uốn lưỡi chạm hàm trên và giữ nguyên luồng rung hơi chữ R.',
    QuestionSentence: 'Hãy uốn đầu lưỡi kêu to: "Rrrrrrrrr" liên tục trong 4 giây!',
    AnswerSentence: '[Đầu lưỡi rung đều, tần số f > 12Hz]',
    InputType: 'Speech',
    CreatedAt: '2026-05-22 08:30',
    UpdatedAt: '2026-05-23 10:15'
  }
];

// 5. Mock Students academic reports list for each exercise
const MOCK_REPORTS_BY_EXERCISE: Record<string, StudentReport[]> = {
  'EXE-001': [
    { studentName: 'Nguyễn Minh Anh', avatarSeed: 'boy1', score: 95, timeSpent: 45, attemptsCount: 1, passed: true, completionDate: '2026-05-28' },
    { studentName: 'Trần Gia Bảo', avatarSeed: 'boy2', score: 82, timeSpent: 55, attemptsCount: 2, passed: true, completionDate: '2026-05-29' },
    { studentName: 'Lê Quỳnh Chi', avatarSeed: 'girl1', score: 60, timeSpent: 70, attemptsCount: 3, passed: false, completionDate: '2026-05-29' }
  ],
  'EXE-002': [
    { studentName: 'Phạm Đức Duy', avatarSeed: 'boy3', score: 90, timeSpent: 30, attemptsCount: 1, passed: true, completionDate: '2026-05-25' },
    { studentName: 'Hoàng Phương Thảo', avatarSeed: 'girl2', score: 95, timeSpent: 28, attemptsCount: 1, passed: true, completionDate: '2026-05-26' }
  ],
  'EXE-003': [
    { studentName: 'Nguyễn Minh Anh', avatarSeed: 'boy1', score: 88, timeSpent: 120, attemptsCount: 2, passed: true, completionDate: '2026-05-20' },
    { studentName: 'Vũ Hải Đăng', avatarSeed: 'boy4', score: 78, timeSpent: 140, attemptsCount: 4, passed: true, completionDate: '2026-05-21' },
    { studentName: 'Lê Quỳnh Chi', avatarSeed: 'girl1', score: 45, timeSpent: 180, attemptsCount: 3, passed: false, completionDate: '2026-05-22' }
  ],
  'EXE-004': [
    { studentName: 'Trần Gia Bảo', avatarSeed: 'boy2', score: 92, timeSpent: 65, attemptsCount: 1, passed: true, completionDate: '2026-05-24' },
    { studentName: 'Phạm Đức Duy', avatarSeed: 'boy3', score: 85, timeSpent: 80, attemptsCount: 2, passed: true, completionDate: '2026-05-25' }
  ],
  'EXE-005': [
    { studentName: 'Hoàng Phương Thảo', avatarSeed: 'girl2', score: 100, timeSpent: 40, attemptsCount: 1, passed: true, completionDate: '2026-05-27' },
    { studentName: 'Vũ Hải Đăng', avatarSeed: 'boy4', score: 85, timeSpent: 62, attemptsCount: 1, passed: true, completionDate: '2026-05-28' }
  ],
  'EXE-006': [
    { studentName: 'Nguyễn Minh Anh', avatarSeed: 'boy1', score: 90, timeSpent: 42, attemptsCount: 1, passed: true, completionDate: '2026-05-29' }
  ],
  'EXE-007': []
};

export default function ExerciseManagement() {
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [questions, setQuestions] = useState<ExerciseQuestion[]>(INITIAL_QUESTIONS);
  
  const lessons = MOCK_LESSONS;
  const exerciseTypes = MOCK_EXERCISE_TYPES;

  // Selected state
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Filter conditions for Exercises
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLesson, setFilterLesson] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [filterLanguage, setFilterLanguage] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Exercise Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Question Pagination states
  const [currentQuestionPage, setCurrentQuestionPage] = useState(1);
  const [questionPageSize, setQuestionPageSize] = useState(5);

  // Auto-reset exercise pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterLesson, filterType, filterDifficulty, filterLanguage, filterStatus]);

  // Auto-reset question pagination when selected exercise changes
  useEffect(() => {
    setCurrentQuestionPage(1);
  }, [selectedExercise]);

  // Unified Modal type & payload states
  const [activeModal, setActiveModal] = useState<'add_exercise' | 'edit_exercise' | 'add_question' | 'edit_question' | 'instruction' | 'reports' | 'preview_question' | null>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);
  
  // Audio Player Simulated state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioInterval, setAudioInterval] = useState<any>(null);
  const [audioTimer, setAudioTimer] = useState<number>(0);

  // Choice test helper for dynamic VR simulation previews
  const [selectedPreviewChoice, setSelectedPreviewChoice] = useState<string | null>(null);
  const [simulationVoiceState, setSimulationVoiceState] = useState<'idle' | 'listening' | 'recorded' | 'analysing'>('idle');
  const [spokenResult, setSpokenResult] = useState('');

  // Toast feedback state
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => setAlertConfig(null), 3500);
  };

  // CLEAN AUDIO INTERVAL UPON UNMOUNT
  useEffect(() => {
    return () => {
      if (audioInterval) clearInterval(audioInterval);
    };
  }, [audioInterval]);

  // Form input variables for Exercise form
  const [exFormLessonId, setExFormLessonId] = useState('');
  const [exFormTypeId, setExFormTypeId] = useState('');
  const [exFormName, setExFormName] = useState('');
  const [exFormInstruction, setExFormInstruction] = useState('');
  const [exFormDifficulty, setExFormDifficulty] = useState<Exercise['DifficultyLevel']>('Easy');
  const [exFormTargetSkill, setExFormTargetSkill] = useState<Exercise['TargetSkill']>('Pronunciation');
  const [exFormLanguage, setExFormLanguage] = useState<Exercise['Language']>('Vietnamese');
  const [exFormDuration, setExFormDuration] = useState<number>(120);
  const [exFormStatus, setExFormStatus] = useState<Exercise['Status']>('Active');

  // Form input variables for Question form
  const [qstFormExerciseId, setQstFormExerciseId] = useState('');
  const [qstFormQuestionSentence, setQstFormQuestionSentence] = useState('');
  const [qstFormAnswerSentence, setQstFormAnswerSentence] = useState('');
  const [qstFormInputType, setQstFormInputType] = useState<ExerciseQuestion['InputType']>('Speech');
  const [qstFormInstruction, setQstFormInstruction] = useState('');
  const [qstFormAudioURL, setQstFormAudioURL] = useState('');
  const [qstFormImageURL, setQstFormImageURL] = useState('');

  // Stats Counters
  const totalExercises = exercises.length;
  const totalQuestionsSum = questions.length;
  const activeExercises = exercises.filter(e => e.Status === 'Active').length;
  const activeExerciseTypes = exerciseTypes.filter(t => t.IsActive).length;

  // Actions handlers
  const handleToggleExerciseStatus = (exId: string, current: 'Active' | 'Inactive') => {
    const nextStatus = current === 'Active' ? 'Inactive' : 'Active';
    setExercises(prev => prev.map(ex => ex.ExerciseId === exId ? {
      ...ex,
      Status: nextStatus,
      UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    } : ex));
    triggerToast(`Đã ${nextStatus === 'Active' ? 'kích hoạt' : 'ngừng hoạt động'} bài tập ${exId}!`);
  };

  const handleOpenAddExercise = () => {
    setExFormLessonId(lessons[0]?.LessonId || '');
    setExFormTypeId(exerciseTypes[0]?.TypeId || '');
    setExFormName('');
    setExFormInstruction('');
    setExFormDifficulty('Easy');
    setExFormTargetSkill('Pronunciation');
    setExFormLanguage('Vietnamese');
    setExFormDuration(120);
    setExFormStatus('Active');
    setActiveModal('add_exercise');
  };

  const handleOpenEditExercise = (ex: Exercise) => {
    setModalPayload(ex);
    setExFormLessonId(ex.LessonId);
    setExFormTypeId(ex.TypeId);
    setExFormName(ex.ExerciseName);
    setExFormInstruction(ex.Instruction);
    setExFormDifficulty(ex.DifficultyLevel);
    setExFormTargetSkill(ex.TargetSkill);
    setExFormLanguage(ex.Language);
    setExFormDuration(ex.DurationLimit);
    setExFormStatus(ex.Status);
    setActiveModal('edit_exercise');
  };

  const handleOpenAddQuestion = (presetExId?: string) => {
    // Determine which exercise id should be focused
    const selectedId = presetExId || selectedExercise?.ExerciseId || exercises[0]?.ExerciseId || '';
    
    if (!selectedId) {
      triggerToast('Vui lòng chọn một bài tập trước khi thêm câu hỏi.', 'warning');
      return;
    }

    setQstFormExerciseId(selectedId);
    setQstFormQuestionSentence('');
    setQstFormAnswerSentence('');
    setQstFormInputType('Speech');
    setQstFormInstruction('');
    setQstFormAudioURL('');
    setQstFormImageURL('');
    
    setActiveModal('add_question');
  };

  const handleHeaderAddQuestionClick = () => {
    if (!selectedExercise) {
      triggerToast('Vui lòng chọn một bài tập trước khi thêm câu hỏi.', 'warning');
      return;
    }
    handleOpenAddQuestion(selectedExercise.ExerciseId);
  };

  const handleOpenEditQuestion = (qst: ExerciseQuestion) => {
    setModalPayload(qst);
    setQstFormExerciseId(qst.ExerciseId);
    setQstFormQuestionSentence(qst.QuestionSentence);
    setQstFormAnswerSentence(qst.AnswerSentence);
    setQstFormInputType(qst.InputType);
    setQstFormInstruction(qst.Instruction);
    setQstFormAudioURL(qst.AudioURL || '');
    setQstFormImageURL(qst.ImageURL || '');
    setActiveModal('edit_question');
  };

  const handleOpenPreviewQuestion = (qst: ExerciseQuestion) => {
    setModalPayload(qst);
    setSelectedPreviewChoice(null);
    setSimulationVoiceState('idle');
    setSpokenResult('');
    setActiveModal('preview_question');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  // Submit Exercise Form
  const handleSubmitExerciseForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exFormName.trim()) {
      triggerToast('Tên bài tập không được để trống!', 'warning');
      return;
    }
    if (!exFormLessonId) {
      triggerToast('Bài học liên kết không hợp lệ!', 'warning');
      return;
    }
    if (!exFormTypeId) {
      triggerToast('Loại bài tập liên kết không hợp lệ!', 'warning');
      return;
    }
    if (exFormDuration <= 0) {
      triggerToast('Thời hạn giới hạn giây phải lớn hơn 0!', 'warning');
      return;
    }

    const sysDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (activeModal === 'add_exercise') {
      const nextId = `EXE-${String(exercises.length + 1).padStart(3, '0')}`;
      const newEx: Exercise = {
        ExerciseId: nextId,
        LessonId: exFormLessonId,
        TypeId: exFormTypeId,
        ExerciseName: exFormName,
        Instruction: exFormInstruction,
        DifficultyLevel: exFormDifficulty,
        TargetSkill: exFormTargetSkill,
        Language: exFormLanguage,
        DurationLimit: exFormDuration,
        Status: exFormStatus,
        CreatedAt: sysDate,
        UpdatedAt: sysDate
      };
      setExercises([newEx, ...exercises]);
      // Auto select the newly created exercise
      setSelectedExercise(newEx);
      triggerToast(`Thêm thành công bài tập "${exFormName}"!`);
    } else if (activeModal === 'edit_exercise' && modalPayload) {
      const updatedList = exercises.map(ex => ex.ExerciseId === modalPayload.ExerciseId ? {
        ...ex,
        LessonId: exFormLessonId,
        TypeId: exFormTypeId,
        ExerciseName: exFormName,
        Instruction: exFormInstruction,
        DifficultyLevel: exFormDifficulty,
        TargetSkill: exFormTargetSkill,
        Language: exFormLanguage,
        DurationLimit: exFormDuration,
        Status: exFormStatus,
        UpdatedAt: sysDate
      } : ex);
      setExercises(updatedList);
      
      // Keep selected state up to date
      if (selectedExercise && selectedExercise.ExerciseId === modalPayload.ExerciseId) {
        setSelectedExercise({
          ...selectedExercise,
          LessonId: exFormLessonId,
          TypeId: exFormTypeId,
          ExerciseName: exFormName,
          Instruction: exFormInstruction,
          DifficultyLevel: exFormDifficulty,
          TargetSkill: exFormTargetSkill,
          Language: exFormLanguage,
          DurationLimit: exFormDuration,
          Status: exFormStatus,
          UpdatedAt: sysDate
        });
      }
      triggerToast(`Đã lưu thay đổi cho bài tập ${modalPayload.ExerciseId}!`);
    }
    handleCloseModal();
  };

  // Submit Question Form
  const handleSubmitQuestionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qstFormExerciseId) {
      triggerToast('Vui lòng chọn bài tập tương ứng!', 'warning');
      return;
    }
    if (!qstFormQuestionSentence.trim()) {
      triggerToast('Câu luyện tập không được để trống!', 'warning');
      return;
    }
    if (!qstFormAnswerSentence.trim()) {
      triggerToast('Câu trả lời mẫu không được để trống!', 'warning');
      return;
    }

    const sysDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (activeModal === 'add_question') {
      const nextId = `QST-${String(questions.length + 1).padStart(3, '0')}`;
      const newQst: ExerciseQuestion = {
        QuestionId: nextId,
        ExerciseId: qstFormExerciseId,
        TeacherId: 'TCH-001', // current teacher
        Instruction: qstFormInstruction || 'Lắng nghe giáo viên ảo hướng dẫn và hoàn thành bài luyện tập nhé!',
        QuestionSentence: qstFormQuestionSentence,
        AnswerSentence: qstFormAnswerSentence,
        InputType: qstFormInputType,
        AudioURL: qstFormAudioURL.trim() || undefined,
        ImageURL: qstFormImageURL.trim() || undefined,
        CreatedAt: sysDate,
        UpdatedAt: sysDate
      };
      setQuestions([newQst, ...questions]);
      triggerToast(`Đã thêm thành công câu hỏi ${nextId}!`);
    } else if (activeModal === 'edit_question' && modalPayload) {
      setQuestions(prev => prev.map(q => q.QuestionId === modalPayload.QuestionId ? {
        ...q,
        ExerciseId: qstFormExerciseId,
        Instruction: qstFormInstruction,
        QuestionSentence: qstFormQuestionSentence,
        AnswerSentence: qstFormAnswerSentence,
        InputType: qstFormInputType,
        AudioURL: qstFormAudioURL.trim() || undefined,
        ImageURL: qstFormImageURL.trim() || undefined,
        UpdatedAt: sysDate
      } : q));
      triggerToast(`Đã cập nhật thông tin câu hỏi ${modalPayload.QuestionId}!`);
    }
    handleCloseModal();
  };

  // Delete Question handler
  const handleDeleteQuestion = (qId: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi ${qId} không?`)) {
      setQuestions(prev => prev.filter(q => q.QuestionId !== qId));
      triggerToast(`Đã xóa câu hỏi ${qId}`, 'warning');
    }
  };

  // Play audio simulation
  const handlePlayAudio = (qId: string, url?: string) => {
    if (!url) {
      triggerToast('Không có audio mẫu cho câu hỏi này!', 'warning');
      return;
    }
    
    if (playingAudioId === qId) {
      clearInterval(audioInterval);
      setPlayingAudioId(null);
      setAudioTimer(0);
      return;
    }

    if (audioInterval) clearInterval(audioInterval);
    
    setPlayingAudioId(qId);
    setAudioTimer(4); // default mock voice timer
    
    const interval = setInterval(() => {
      setAudioTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPlayingAudioId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setAudioInterval(interval);
    triggerToast(`Đang phát âm thanh mô tả giọng đọc mẫu...`);
  };

  // VR Speech Simulation Action
  const triggerVoiceTalkSimulate = () => {
    if (!modalPayload) return;
    setSimulationVoiceState('listening');
    setTimeout(() => {
      setSimulationVoiceState('recorded');
      setTimeout(() => {
        setSimulationVoiceState('analysing');
        setTimeout(() => {
          setSimulationVoiceState('idle');
          setSpokenResult(modalPayload.AnswerSentence.replace(/[\[\]]/g, ''));
          triggerToast('Đồng bộ hóa nhận dạng thành công trong không gian ảo!', 'success');
        }, 1500);
      }, 1000);
    }, 2000);
  };

  // Search filter core logic (Exercises)
  const filteredExercises = useMemo(() => {
    return exercises.filter(item => {
      const searchStr = `${item.ExerciseName} ${item.TargetSkill} ${item.Instruction} ${item.ExerciseId}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      
      const matchesLesson = filterLesson === 'ALL' || item.LessonId === filterLesson;
      const matchesType = filterType === 'ALL' || item.TypeId === filterType;
      const matchesDifficulty = filterDifficulty === 'ALL' || item.DifficultyLevel === filterDifficulty;
      const matchesLanguage = filterLanguage === 'ALL' || item.Language === filterLanguage;
      const matchesStatus = filterStatus === 'ALL' || item.Status === filterStatus;

      return matchesSearch && matchesLesson && matchesType && matchesDifficulty && matchesLanguage && matchesStatus;
    });
  }, [exercises, searchQuery, filterLesson, filterType, filterDifficulty, filterLanguage, filterStatus]);

  // Paginated exercises
  const totalExercisesPages = Math.max(1, Math.ceil(filteredExercises.length / pageSize));
  
  useEffect(() => {
    if (currentPage > totalExercisesPages) {
      setCurrentPage(totalExercisesPages);
    }
  }, [currentPage, totalExercisesPages]);

  const paginatedExercises = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredExercises.slice(startIndex, startIndex + pageSize);
  }, [filteredExercises, currentPage, pageSize]);

  // Selected exercise questions pool with custom pagination
  const selectedExerciseQuestions = useMemo(() => {
    if (!selectedExercise) return [];
    return questions.filter(q => q.ExerciseId === selectedExercise.ExerciseId);
  }, [questions, selectedExercise]);

  const totalQuestionsPages = Math.max(1, Math.ceil(selectedExerciseQuestions.length / questionPageSize));

  useEffect(() => {
    if (currentQuestionPage > totalQuestionsPages) {
      setCurrentQuestionPage(totalQuestionsPages);
    }
  }, [currentQuestionPage, totalQuestionsPages]);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentQuestionPage - 1) * questionPageSize;
    return selectedExerciseQuestions.slice(startIndex, startIndex + questionPageSize);
  }, [selectedExerciseQuestions, currentQuestionPage, questionPageSize]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative font-sans" id="exercises-gop-root">
      
      {/* Toast Alert Feedback Bar */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="global-feedback-toast"
          >
            <div className={cn(
              "p-5 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-white backdrop-blur-md",
              alertConfig.type === 'success' ? 'bg-[#4EACAF]/95 text-white' : 'bg-rose-500/95 text-white'
            )}>
              <div className="bg-white/20 p-2 rounded-xl shrink-0">
                {alertConfig.type === 'success' ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0 font-bold">
                <p className="text-sm tracking-tight text-white leading-snug">{alertConfig.message}</p>
              </div>
              <button 
                onClick={() => setAlertConfig(null)} 
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Area with Multi-Action CTAs */}
      <div className="bg-white rounded-[40px] p-6 md:p-8 border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-xl text-xs font-black uppercase tracking-wider leading-none">
            <Activity className="w-4 h-4" />
            Học liệu luyện nói VR
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight font-sans">
            Quản Lý Bài Tập & Câu Hỏi
          </h1>
          <p className="text-slate-500 text-sm max-w-3xl leading-relaxed">
            Tạo và quản lý bài tập luyện nói, loại bài tập, độ khó, kỹ năng mục tiêu và các câu hỏi luyện tập được sử dụng trong ứng dụng VR. Website chỉ quản lý học liệu và dữ liệu theo dõi. Trẻ thực hiện bài tập trong ứng dụng VR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={handleHeaderAddQuestionClick}
            className={cn(
              "font-black text-xs uppercase px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95",
              selectedExercise 
                ? "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100" 
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
            )}
            title={selectedExercise ? "Thêm câu luyện tập cho bài tập " + selectedExercise.ExerciseName : "Vui lòng chọn bài tập để mở rộng thêm câu hỏi"}
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi
          </button>

          <button 
            onClick={handleOpenAddExercise}
            className="bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#4EACAF]/10 transition-all active:scale-95 text-xs uppercase cursor-pointer"
            id="btn-global-add-exercise"
          >
            <Plus className="w-4 h-4" />
            Thêm bài tập
          </button>
        </div>
      </div>

      {/* 2. Unified Quick Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardItem 
          title="Tổng Số Bài Tập" 
          value={totalExercises} 
          subtitle="Các bài trong kho học liệu" 
          icon={<Layers className="w-6 h-6 text-[#4EACAF]" />} 
          bgColor="bg-teal-50"
          borderColor="border-teal-100"
        />
        <StatCardItem 
          title="Tổng Số Câu Hỏi" 
          value={totalQuestionsSum} 
          subtitle="Số câu rèn luyện hỗ trợ" 
          icon={<HelpCircle className="w-6 h-6 text-orange-500" />} 
          bgColor="bg-orange-50/70"
          borderColor="border-orange-100"
        />
        <StatCardItem 
          title="Bài Tập Đang Hoạt Động" 
          value={activeExercises} 
          subtitle="Đang chuyển giao lên VR" 
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />} 
          bgColor="bg-emerald-50"
          borderColor="border-emerald-100"
        />
        <StatCardItem 
          title="Loại Bài Tập" 
          value={activeExerciseTypes} 
          subtitle="Phong phú phương pháp tương tác" 
          icon={<Tags className="w-6 h-6 text-indigo-500" />} 
          bgColor="bg-indigo-50"
          borderColor="border-indigo-100"
        />
      </div>

      {/* 3. Search and Deep Filters Tool */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Tìm kiếm & Bộ lọc bài nói</h3>
        
        {/* Search Input bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài tập theo tên, hướng dẫn hoặc kỹ năng mục tiêu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 border-2 border-transparent font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200/60 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Dropdowns Filters set */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <select 
              value={filterLesson}
              onChange={(e) => setFilterLesson(e.target.value)}
              className="w-full appearance-none bg-slate-50 border-2 border-transparent hover:border-[#4EACAF]/20 px-4 py-3 rounded-2xl font-bold text-xs text-slate-600 outline-none cursor-pointer pr-10 uppercase focus:bg-white focus:border-[#4EACAF] transition-colors"
            >
              <option value="ALL">Mọi bài học</option>
              {lessons.map(les => (
                <option key={les.LessonId} value={les.LessonId}>
                  {les.LessonName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full appearance-none bg-slate-50 border-2 border-transparent hover:border-[#4EACAF]/20 px-4 py-3 rounded-2xl font-bold text-xs text-slate-600 outline-none cursor-pointer pr-10 uppercase focus:bg-white focus:border-[#4EACAF] transition-colors"
            >
              <option value="ALL">Mọi loại bài tập</option>
              {exerciseTypes.map(typ => (
                <option key={typ.TypeId} value={typ.TypeId}>
                  {typ.TypeName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full appearance-none bg-slate-50 border-2 border-transparent hover:border-[#4EACAF]/20 px-4 py-3 rounded-2xl font-bold text-xs text-slate-600 outline-none cursor-pointer pr-10 uppercase focus:bg-white focus:border-[#4EACAF] transition-colors"
            >
              <option value="ALL">Độ khó: tất cả</option>
              <option value="Easy">Dễ (Easy)</option>
              <option value="Medium">Vừa (Medium)</option>
              <option value="Hard">Khó (Hard)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full appearance-none bg-slate-50 border-2 border-transparent hover:border-[#4EACAF]/20 px-4 py-3 rounded-2xl font-bold text-xs text-slate-600 outline-none cursor-pointer pr-10 uppercase focus:bg-white focus:border-[#4EACAF] transition-colors"
            >
              <option value="ALL">Mọi ngôn ngữ</option>
              <option value="Vietnamese">Vietnamese</option>
              <option value="English">English</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-slate-50 border-2 border-transparent hover:border-[#4EACAF]/20 px-4 py-3 rounded-2xl font-bold text-xs text-slate-600 outline-none cursor-pointer pr-10 uppercase focus:bg-white focus:border-[#4EACAF] transition-colors"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="Active">Đang hoạt động</option>
              <option value="Inactive">Tạm ngưng</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Primary Exercise Library Database Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm" id="exercise-table-container">
        <div className="px-8 py-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Chi tiết bài tập luyện nói</h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Đang hiển thị {filteredExercises.length} bài tập theo bộ lọc</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-500 font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider">
            Web dashboard đồng hành VR
          </span>
        </div>

        {filteredExercises.length === 0 ? (
          <div className="py-20 text-center space-y-5">
            <Layers className="w-16 h-16 text-gray-200 mx-auto" strokeWidth={1.5} />
            <h4 className="text-2xl font-black text-gray-700">Chưa có bài tập</h4>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Tạo bài tập đầu tiên để bắt đầu xây dựng học liệu luyện nói cho ứng dụng VR.
            </p>
            <button 
              onClick={handleOpenAddExercise}
              className="px-6 py-3 bg-[#4EACAF] text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md hover:bg-[#5ec4c7]"
            >
              Thêm bài tập
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-slate-700">
                <thead>
                  <tr className="bg-[#FDFCF5]/50 border-b border-gray-150 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                    <th className="py-5 px-8">Mã Bài</th>
                    <th className="py-5 px-6">Tên bài luyện nói</th>
                    <th className="py-5 px-6">Bài học con</th>
                    <th className="py-5 px-6">Loại bài tập</th>
                    <th className="py-5 px-6">Độ Khó</th>
                    <th className="py-5 px-6 font-bold">Kỹ Năng Đích</th>
                    <th className="py-5 px-6">Trạng thái</th>
                    <th className="py-5 px-6">Số câu hỏi</th>
                    <th className="py-5 px-8 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-xs md:text-sm text-gray-600">
                  {paginatedExercises.map((ex) => {
                    const lessonObj = lessons.find(l => l.LessonId === ex.LessonId);
                    const typeObj = exerciseTypes.find(t => t.TypeId === ex.TypeId);
                    const qCount = questions.filter(q => q.ExerciseId === ex.ExerciseId).length;
                    const isSelected = selectedExercise?.ExerciseId === ex.ExerciseId;

                    return (
                      <tr 
                        key={ex.ExerciseId} 
                        className={cn(
                          "hover:bg-slate-50/40 transition-all cursor-pointer border-l-4",
                          isSelected ? "bg-[#4EACAF]/5 hover:bg-[#4EACAF]/10 border-l-[#4EACAF]" : "border-l-transparent",
                          ex.Status === 'Inactive' ? 'opacity-70 bg-gray-50/20' : ''
                        )}
                        onClick={() => setSelectedExercise(ex)}
                      >
                        {/* ID */}
                        <td className="py-5 px-8 font-mono text-gray-400 font-extrabold text-xs">
                          {ex.ExerciseId}
                        </td>

                        {/* Name & Instruction snippet */}
                        <td className="py-5 px-6">
                          <div className="max-w-xs font-bold text-left">
                            <p className="text-gray-950 font-black text-sm leading-snug">{ex.ExerciseName}</p>
                            <p className="text-[11px] text-gray-400 font-medium line-clamp-2 leading-relaxed mt-1">{ex.Instruction}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Giới hạn: {ex.DurationLimit} giây • Ngôn ngữ: {ex.Language}</p>
                          </div>
                        </td>

                        {/* Lesson ID / Name */}
                        <td className="py-5 px-6 text-xs text-slate-800">
                          {lessonObj ? (
                            <span className="line-clamp-2 max-w-[150px] font-bold" title={lessonObj.LessonName}>
                              {lessonObj.LessonName}
                            </span>
                          ) : (
                            <span className="italic text-rose-500">Bị mất bài học</span>
                          )}
                        </td>

                        {/* Exercise Game Type */}
                        <td className="py-5 px-6">
                          {typeObj ? (
                            <span className="bg-slate-100 text-slate-600 font-black px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide">
                              {typeObj.TypeName}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium italic text-xs">Kỳ vọng khuyết</span>
                          )}
                        </td>

                        {/* Difficulty */}
                        <td className="py-5 px-6">
                          <DifficultyLevelBadge level={ex.DifficultyLevel} />
                        </td>

                        {/* Target Skill */}
                        <td className="py-5 px-6 font-bold">
                          <span className="bg-[#4EACAF]/15 text-[#4EACAF] font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">
                            {ex.TargetSkill}
                          </span>
                        </td>

                        {/* Release Status */}
                        <td className="py-5 px-6">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            ex.Status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-400 border border-transparent'
                          )}>
                            {ex.Status === 'Active' ? '● Hoạt động' : '○ Tạm ngưng'}
                          </span>
                        </td>

                        {/* Number of child Questions under this task */}
                        <td className="py-5 px-6 font-mono text-center">
                          <span className={cn(
                            "px-2.5 py-1 rounded-xl text-xs font-extrabold",
                            qCount > 0 ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-gray-100 text-gray-400"
                          )}>
                            {qCount} câu
                          </span>
                        </td>

                        {/* Action Toolbar */}
                        <td className="py-5 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* Fast Select viewing */}
                            <button
                              onClick={() => setSelectedExercise(ex)}
                              className={cn(
                                "p-2 rounded-xl transition-all font-bold text-xs uppercase",
                                isSelected ? "bg-[#4EACAF]/20 text-[#4EACAF]" : "hover:bg-[#4EACAF]/10 text-gray-500 hover:text-[#4EACAF]"
                              )}
                              title="Xem toàn bộ câu hỏi liên kết mặt sau"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Enable Status quick toggle */}
                            <button
                              onClick={() => handleToggleExerciseStatus(ex.ExerciseId, ex.Status)}
                              className="p-2 hover:bg-slate-50 rounded-xl text-[#4EACAF] transition-colors"
                              title="Bật/Tắt phân phát dải bài"
                            >
                              {ex.Status === 'Active' ? (
                                <ToggleRight className="w-5.5 h-5.5 text-[#4EACAF]" />
                              ) : (
                                <ToggleLeft className="w-5.5 h-5.5 text-gray-300" />
                              )}
                            </button>

                            {/* View Reports */}
                            <button
                              onClick={() => { setModalPayload(ex); setActiveModal('reports'); }}
                              className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-1"
                              title="Xem kết quả rèn luyện"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              Kết quả
                            </button>

                            {/* Direct edit triggers */}
                            <button
                              onClick={() => handleOpenEditExercise(ex)}
                              className="p-2 text-sky-500 hover:bg-sky-50 rounded-xl"
                              title="Sửa bài tập"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            
                            {/* Fast Add Question icon */}
                            <button
                              onClick={() => handleOpenAddQuestion(ex.ExerciseId)}
                              className="p-2 text-orange-500 hover:bg-orange-50 rounded-xl"
                              title="Thêm nhanh câu luyện nói"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-5 border-t border-gray-50 bg-white">
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

      {/* 5. Sub-Panel: Dynamic Related Question Management Arena */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden" id="questions-pool-block">
        <div className="px-8 py-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5.5 h-5.5 text-orange-500" />
              Câu hỏi luyện nói thuộc bài tập
            </h3>
            {selectedExercise ? (
              <p className="text-xs text-[#4EACAF] font-bold mt-1">
                Đang hiển thị danh sách câu nói của bài tập: <strong className="underline text-slate-700">{selectedExercise.ExerciseName} ({selectedExercise.ExerciseId})</strong>
              </p>
            ) : null}
          </div>

          {selectedExercise && (
            <button 
              onClick={() => handleOpenAddQuestion(selectedExercise.ExerciseId)}
              className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-xl border border-orange-200/50 flex items-center gap-1.5 transition-all self-start cursor-pointer md:self-auto"
            >
              <Plus className="w-4.5 h-4.5" />
              Thêm câu tự động
            </button>
          )}
        </div>

        {!selectedExercise ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-[#FDFCF5] rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200 shadow-xs">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-xl font-bold text-slate-700 font-sans">Chưa chọn bài tập</h4>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
              Chọn một bài tập trong danh sách ở trên để xem và quản lý các câu hỏi luyện tập thuộc bài tập đó.
            </p>
          </div>
        ) : selectedExerciseQuestions.length === 0 ? (
          <div className="py-20 text-center space-y-5">
            <Activity className="w-16 h-16 text-gray-200 mx-auto" strokeWidth={1.5} />
            <h4 className="text-2xl font-black text-gray-700">Bài tập này chưa có câu hỏi</h4>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Thêm câu luyện tập, câu trả lời mẫu, audio hoặc hình ảnh minh họa cho bài tập này.
            </p>
            <button 
              onClick={() => handleOpenAddQuestion(selectedExercise.ExerciseId)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
            >
              Thêm câu hỏi
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-slate-700">
                <thead>
                  <tr className="bg-[#FDFCF5]/50 border-b border-gray-150 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                    <th className="py-5 px-8">Mã Câu Hỏi</th>
                    <th className="py-5 px-6">Nội dung câu luyện nói</th>
                    <th className="py-5 px-6">Câu trả lời mẫu mong chờ</th>
                    <th className="py-5 px-6">Phương thức đầu vào</th>
                    <th className="py-5 px-6">Hình ảnh</th>
                    <th className="py-5 px-6">Âm thanh mẫu</th>
                    <th className="py-5 px-8 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-xs md:text-sm text-gray-600">
                  {paginatedQuestions.map((qst) => {
                    const isAudioPlaying = playingAudioId === qst.QuestionId;

                    return (
                      <tr key={qst.QuestionId} className="hover:bg-slate-50/20 transition-all font-bold">
                        {/* ID */}
                        <td className="py-5 px-8 font-mono text-gray-400 font-extrabold text-xs">
                          {qst.QuestionId}
                        </td>

                        {/* Content & Instruction description */}
                        <td className="py-5 px-6">
                          <div className="max-w-xs font-bold text-left">
                            <p className="text-slate-900 font-extrabold text-sm leading-snug">{qst.QuestionSentence}</p>
                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-1 italic">"{qst.Instruction}"</p>
                          </div>
                        </td>

                        {/* Expected pattern answer */}
                        <td className="py-5 px-6">
                          <div className="max-w-xs font-mono text-xs text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 inline-block">
                            {qst.AnswerSentence}
                          </div>
                        </td>

                        {/* Input mechanism type */}
                        <td className="py-5 px-6">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border",
                            qst.InputType === 'Speech' ? "bg-teal-50 text-teal-600 border-teal-100" :
                            qst.InputType === 'Oral Motor' ? "bg-amber-50 text-amber-600 border-amber-100" :
                            qst.InputType === 'Multiple Choice' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            "bg-purple-50 text-purple-600 border-purple-100"
                          )}>
                            <Mic className="w-3 h-3 shrink-0" />
                            {qst.InputType}
                          </span>
                        </td>

                        {/* Image URL preview thumb */}
                        <td className="py-5 px-6">
                          {qst.ImageURL ? (
                            <img 
                              src={qst.ImageURL} 
                              alt="Minh họa" 
                              className="w-11 h-11 rounded-xl object-cover border border-slate-100 bg-slate-50 hover:scale-105 shadow-sm transition-transform cursor-pointer referrer-policy"
                              referrerPolicy="no-referrer"
                              onClick={() => handleOpenPreviewQuestion(qst)}
                            />
                          ) : (
                            <span className="text-gray-300 italic text-xs">Chưa có ảnh</span>
                          )}
                        </td>

                        {/* Audio track simulated controller */}
                        <td className="py-5 px-6">
                          {qst.AudioURL ? (
                            <button
                              onClick={() => handlePlayAudio(qst.QuestionId, qst.AudioURL)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
                                isAudioPlaying 
                                  ? "bg-rose-100 text-rose-600 border border-rose-200 shadow-md animate-pulse" 
                                  : "bg-[#4EACAF]/10 hover:bg-[#4EACAF]/20 text-[#4EACAF]"
                              )}
                            >
                              {isAudioPlaying ? (
                                <>
                                  <Square className="w-3.5 h-3.5 fill-rose-600" />
                                  <span>Tắt ({audioTimer}s)</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Nghe audio</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-300 italic text-xs">Phát trực tiếp</span>
                          )}
                        </td>

                        {/* Actions Toolbar on Question level */}
                        <td className="py-5 px-8 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* VR Sandbox simulator */}
                            <button
                              onClick={() => handleOpenPreviewQuestion(qst)}
                              className="p-2 text-[#4EACAF] hover:bg-[#4EACAF]/10 rounded-xl"
                              title="Kiểm thử bài tập VR mẫu giả lập"
                            >
                              <Play className="w-4 h-4 fill-[#4EACAF]" />
                            </button>

                            {/* Question editing */}
                            <button
                              onClick={() => handleOpenEditQuestion(qst)}
                              className="p-2 text-sky-500 hover:bg-sky-50 rounded-xl"
                              title="Cấu hình lại câu hỏi"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Deletion control */}
                            <button
                              onClick={() => handleDeleteQuestion(qst.QuestionId)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                              title="Loại bỏ khỏi câu nói"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-5 border-t border-gray-50 bg-white">
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

      {/* 6. Dynamic Integrated Forms, VR sandbox simulation, & Reports Modal wrapper */}
      <AnimatePresence>
        {activeModal && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-start justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto" id="exercises-overlay-block">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl border border-gray-100 relative z-30 my-4 md:my-6 max-h-[calc(100vh-48px)] flex flex-col overflow-hidden"
              id="unified-modal-box"
            >
              {/* Header Title Section change depending on category */}
              <div className={cn(
                "px-6 md:px-8 py-5 flex items-center justify-between border-b shrink-0",
                (activeModal === 'add_exercise' || activeModal === 'add_question') ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' :
                (activeModal === 'edit_exercise' || activeModal === 'edit_question') ? 'bg-sky-50 border-sky-100 text-gray-900' :
                activeModal === 'preview_question' ? 'bg-amber-50 border-amber-100 text-gray-900' :
                'bg-indigo-50 border-indigo-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {(activeModal === 'add_exercise' || activeModal === 'add_question') && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {(activeModal === 'edit_exercise' || activeModal === 'edit_question') && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {activeModal === 'preview_question' && <Play className="w-6 h-6 text-amber-500" />}
                    {activeModal === 'reports' && <TrendingUp className="w-6 h-6 text-indigo-500" />}
                    
                    {activeModal === 'add_exercise' && 'Thêm bài tập mới'}
                    {activeModal === 'edit_exercise' && `Chỉnh sửa bài tập: ${modalPayload?.ExerciseId}`}
                    {activeModal === 'add_question' && 'Thêm câu hỏi mới'}
                    {activeModal === 'edit_question' && `Cập nhật câu hỏi: ${modalPayload?.QuestionId}`}
                    {activeModal === 'reports' && `Lịch sử rèn luyện: ${modalPayload?.ExerciseName}`}
                    {activeModal === 'preview_question' && `Giả lập tương tác VR cho trẻ`}
                  </h2>
                  <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider mt-0.5">
                    {activeModal === 'add_exercise' && 'Tải lên cấu hình bài tập rèn nói chất lượng cao'}
                    {activeModal === 'edit_exercise' && 'Thay đổi thông số rèn luyện bài tập hiện tại'}
                    {activeModal === 'add_question' && 'Bổ sung ngữ liệu câu luyện tập và câu trả lời mẫu cho bé'}
                    {activeModal === 'edit_question' && 'Tinh chỉnh nội dung text hướng dẫn hoặc URL hình ảnh/âm thanh'}
                    {activeModal === 'reports' && 'Tổng hợp thời lượng, số lượt tương tác và kết quả đạt chuẩn'}
                    {activeModal === 'preview_question' && 'Môi trường giả lập thực hành 3D để kiểm tra mức độ bài nói'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="p-2.5 hover:bg-slate-100 rounded-full transition-colors shrink-0"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body: STUDENT REPORTS */}
              {activeModal === 'reports' && modalPayload ? (
                <div className="app-modal-body flex flex-col min-h-0">
                  <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
                    <div className="bg-indigo-50/70 p-5 rounded-3xl border border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Users className="w-10 h-10 text-indigo-600 shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-indigo-950 text-sm uppercase tracking-wider">Lịch sử rèn luyện các trẻ</h4>
                          <p className="text-xs font-bold text-indigo-600 mt-0.5">Báo cáo thời gian thực kết quả bài rèn luyện</p>
                        </div>
                      </div>
                      {(() => {
                        const list = MOCK_REPORTS_BY_EXERCISE[modalPayload.ExerciseId] || [];
                        const passRate = list.length > 0 
                          ? Math.round((list.filter(item => item.passed).length / list.length) * 100)
                          : 0;
                        return (
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-extrabold uppercase">Tỉ lệ Đạt</p>
                            <p className="text-2xl font-black text-indigo-600">{passRate}%</p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {(() => {
                        const list = MOCK_REPORTS_BY_EXERCISE[modalPayload.ExerciseId] || [];
                        if (list.length === 0) {
                          return (
                            <div className="text-center py-12 text-gray-400 font-bold italic">
                              Chưa ghi nhận hoạt động rèn luyện VR nào cho bài tập này.
                            </div>
                          );
                        }
                        return list.map((report, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 hover:border-indigo-100 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <img 
                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${report.avatarSeed}&backgroundColor=ffdfbf`} 
                                alt="Avatar" 
                                className="w-11 h-11 rounded-2xl bg-slate-50 border-2 border-white shadow-sm shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <p className="font-black text-xs text-gray-900 truncate leading-none mb-1">{report.studentName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Thực hiện: {report.completionDate}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 text-right shrink-0">
                              <div>
                                <p className="text-[9px] text-gray-400 font-extrabold uppercase leading-none mb-1">Thời lượng</p>
                                <p className="text-xs text-slate-800 font-mono font-black">{report.timeSpent}s • lặp: {report.attemptsCount} lần</p>
                              </div>

                              <div>
                                <p className="text-[9px] text-gray-400 font-extrabold uppercase leading-none mb-1">Chuẩn đạt</p>
                                <p className={cn(
                                  "text-sm font-black leading-none",
                                  report.passed ? 'text-emerald-500' : 'text-[#FF8E8E]'
                                )}>
                                  {report.score}% {report.passed ? 'ĐẠT' : 'CHƯA'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="px-6 md:px-8 py-4 border-t border-slate-100 flex justify-end bg-white shrink-0">
                    <button 
                      onClick={handleCloseModal}
                      className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                    >
                      Đóng báo cáo
                    </button>
                  </div>
                </div>
              ) : activeModal === 'preview_question' && modalPayload ? (
                /* Modal Body: VR INTERACTIVE PREVIEW SIMULATION PLAYER */
                <div className="app-modal-body flex flex-col min-h-0">
                  <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
                    <div className="bg-slate-900 text-white rounded-3xl p-6 relative font-mono text-left overflow-hidden border-4 border-slate-700 shadow-inner">
                      {/* Retro coordinate grid backdrops */}
                      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />
                      
                      <div className="relative space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <span className="text-[10px] font-black text-[#4EACAF] bg-[#4EACAF]/10 px-2.5 py-1 rounded-md border border-[#4EACAF]/10 italic">
                            MÔI TRƯỜNG GIẢ LẬP KÍNH VR 3D (GODOTXR SENSOR)
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Connected</span>
                          </div>
                        </div>

                        {/* Illustrative element mockup if exists */}
                        {modalPayload.ImageURL && (
                          <div className="w-full h-40 rounded-2xl overflow-hidden relative border border-white/10 shadow-lg">
                            <img 
                              src={modalPayload.ImageURL} 
                              alt="Mock" 
                              className="w-full h-full object-cover shrink-0 referrer-policy"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                              <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase">Hình ảnh minh họa VR</span>
                            </div>
                          </div>
                        )}

                        {/* Display Question Speech request Bubble */}
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Mô-đun robot nói mẫu dặn dò:</p>
                          <p className="text-amber-300 font-extrabold text-sm italic">"{modalPayload.Instruction}"</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Học sinh chuẩn bị phát âm câu:</p>
                          <p className="text-white text-base font-black italic">"{modalPayload.QuestionSentence}"</p>
                        </div>

                        {/* Active simulation response states */}
                        <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/5 text-center min-h-[100px] space-y-3">
                          {simulationVoiceState === 'idle' && !spokenResult && (
                            <div className="space-y-1">
                              <p className="text-slate-400 text-xs font-bold">Kính VR đang chờ bé phản ứng phát chuẩn...</p>
                              <p className="text-[10px] text-slate-500">Bấm nút "Nói trên microphone" để xem thuật toán so khớp</p>
                            </div>
                          )}

                          {simulationVoiceState === 'listening' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center gap-1">
                                <span className="w-1.5 h-6 bg-[#4EACAF] rounded-full animate-bounce delay-100" />
                                <span className="w-1.5 h-10 bg-emerald-500 rounded-full animate-bounce delay-200" />
                                <span className="w-1.5 h-7 bg-orange-400 rounded-full animate-bounce delay-300" />
                                <span className="w-1.5 h-4 bg-sky-400 rounded-full animate-bounce delay-400" />
                              </div>
                              <span className="text-xs text-[#4EACAF] font-bold uppercase tracking-widest leading-none">VR cảm biến hấp thụ luồng hơi...</span>
                            </div>
                          )}

                          {simulationVoiceState === 'recorded' && (
                            <div className="space-y-1">
                              <span className="text-xs text-sky-400 font-bold uppercase">Ghi nhận file giọng nói thành công (.wav)</span>
                            </div>
                          )}

                          {simulationVoiceState === 'analysing' && (
                            <div className="space-y-2">
                              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                              <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Đang chạy thuật toán kiểm thử...</span>
                            </div>
                          )}

                          {spokenResult && (
                            <div className="space-y-2">
                              <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/20 text-xs font-extrabold">
                                Độ khớp phát âm: 98% (Từ ngữ chuẩn)
                              </div>
                              <p className="text-slate-300 text-xs">Phát hiện giọng đọc: <strong className="text-white">"{spokenResult}"</strong></p>
                            </div>
                          )}
                        </div>

                        {/* Controller Buttons inside VR */}
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={triggerVoiceTalkSimulate}
                            disabled={simulationVoiceState !== 'idle'}
                            className="flex-1 py-3 bg-[#4EACAF] hover:bg-[#4EACAF]/90 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Mic className="w-4 h-4" />
                            Giả lập thổi nói mẫu
                          </button>
                          
                          {modalPayload.AudioURL && (
                            <button
                              type="button"
                              onClick={() => handlePlayAudio(modalPayload.QuestionId, modalPayload.AudioURL)}
                              className="bg-slate-800 hover:bg-slate-750 text-slate-300 px-4 py-3 border border-slate-700 text-xs rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Volume2 className="w-4 h-4" />
                              Nghe giọng mẫu robot
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 md:px-8 py-4 border-t border-slate-100 flex justify-end bg-white shrink-0">
                    <button 
                      onClick={handleCloseModal}
                      className="py-3.5 px-7 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all uppercase text-xs tracking-wider"
                    >
                      Thoát giả lập
                    </button>
                  </div>
                </div>
              ) : (activeModal === 'add_exercise' || activeModal === 'edit_exercise') ? (
                /* Modal Body: ADD / EDIT EXERCISE FORM */
                <form onSubmit={handleSubmitExerciseForm} className="app-modal-body flex flex-col min-h-0" id="add-edit-exercise-form">
                  <div className="p-6 md:p-8 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)]">
                    <div className="space-y-4">
                      {/* Lesson Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Thuộc bài giảng can thiệp <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={exFormLessonId}
                            onChange={(e) => setExFormLessonId(e.target.value)}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] focus:bg-white transition-colors text-xs uppercase"
                          >
                            {lessons.map(l => (
                              <option key={l.LessonId} value={l.LessonId}>
                                {l.LessonName} ({l.LessonId})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Exercise Type selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Giao thức VR tương thích (Exercise Type) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={exFormTypeId}
                            onChange={(e) => setExFormTypeId(e.target.value)}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] focus:bg-white transition-colors text-xs uppercase"
                          >
                            {exerciseTypes.map(typ => (
                              <option key={typ.TypeId} value={typ.TypeId}>
                                {typ.TypeName} - ({typ.Description})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Title Name */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Tên bài tập <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ví dụ: Đọc trơn cùng khủng long bay phát chữ A..." 
                          value={exFormName}
                          onChange={(e) => setExFormName(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs"
                        />
                      </div>

                      {/* Instructions Text */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Hướng dẫn bài tập <span className="text-rose-500">*</span>
                        </label>
                        <textarea 
                          required
                          rows={4}
                          placeholder="Nhập chi tiết hướng dẫn kịch bản cách chơi trẻ cần thực hành trong kính thực tế ảo 3D..." 
                          value={exFormInstruction}
                          onChange={(e) => setExFormInstruction(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm leading-relaxed"
                        />
                      </div>

                      {/* Options settings grid */}
                      <div className="app-modal-form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Difficulty */}
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            Độ khó học phần <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select 
                              value={exFormDifficulty}
                              onChange={(e) => setExFormDifficulty(e.target.value as Exercise['DifficultyLevel'])}
                              className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] focus:bg-white transition-colors text-xs uppercase"
                            >
                              <option value="Easy">Easy (Dễ)</option>
                              <option value="Medium">Medium (Vừa)</option>
                              <option value="Hard">Hard (Khó)</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Target Skill */}
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            Kỹ năng mục tiêu <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select 
                              value={exFormTargetSkill}
                              onChange={(e) => setExFormTargetSkill(e.target.value as Exercise['TargetSkill'])}
                              className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] focus:bg-white transition-colors text-xs uppercase"
                            >
                              <option value="Pronunciation">Pronunciation (Phát âm)</option>
                              <option value="Vocabulary">Vocabulary (Vốn từ)</option>
                              <option value="Oral Motor">Oral Motor (Hàm miệng)</option>
                              <option value="Communication">Communication (Giao tiếp)</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Language selection */}
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            Ngôn ngữ luyện tập <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select 
                              value={exFormLanguage}
                              onChange={(e) => setExFormLanguage(e.target.value as Exercise['Language'])}
                              className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] focus:bg-white transition-colors text-xs uppercase"
                            >
                              <option value="Vietnamese">Vietnamese</option>
                              <option value="English">English</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Time Duration timer Limit */}
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            Giới hạn thời gian (giây) <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="number" 
                            required
                            min={15}
                            max={600}
                            value={exFormDuration}
                            onChange={(e) => setExFormDuration(parseInt(e.target.value) || 120)}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs"
                          />
                        </div>
                      </div>

                      {/* Status selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Trạng thái <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={exFormStatus}
                            onChange={(e) => setExFormStatus(e.target.value as Exercise['Status'])}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] focus:bg-white transition-colors text-xs uppercase"
                          >
                            <option value="Active">Đang hoạt động</option>
                            <option value="Inactive">Tạm ngưng</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 md:px-8 py-4 border-t border-slate-100 flex gap-3 bg-white shrink-0">
                    <button 
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-3.5 border-2 border-slate-100 text-slate-400 hover:text-slate-600 font-extrabold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-wider"
                    >
                      Bỏ qua
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3.5 bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/10 transition-all text-sm uppercase tracking-wider"
                    >
                      Lưu trữ thông tin
                    </button>
                  </div>
                </form>
              ) : (
                /* Modal Body: ADD / EDIT QUESTION FORM */
                <form onSubmit={handleSubmitQuestionForm} className="app-modal-body flex flex-col min-h-0" id="add-edit-question-form">
                  <div className="p-6 md:p-8 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)]">
                    <div className="space-y-4">
                      {/* Prest Exercise selection option (Disabled if created from exercise context block) */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Bài tập luyện nói liên quan <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={qstFormExerciseId}
                            onChange={(e) => setQstFormExerciseId(e.target.value)}
                            disabled={!!selectedExercise && activeModal === 'add_question'}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] focus:bg-white disabled:opacity-75 transition-colors text-xs uppercase"
                          >
                            {exercises.map(ex => (
                              <option key={ex.ExerciseId} value={ex.ExerciseId}>
                                {ex.ExerciseName} ({ex.ExerciseId})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* QuestionSentence wordings */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Câu luyện tập <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ví dụ: Hãy uốn cong vòm lưỡi ra luồng hơi: TRĂM PHẦN TRĂM..." 
                          value={qstFormQuestionSentence}
                          onChange={(e) => setQstFormQuestionSentence(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs"
                        />
                      </div>

                      {/* AnswerSentence wordings */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Câu trả lời mẫu <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ví dụ: TRĂM PHẦN TRĂM / [Luồng rung đầu lưỡi]" 
                          value={qstFormAnswerSentence}
                          onChange={(e) => setQstFormAnswerSentence(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs"
                        />
                      </div>

                      {/* InputType option list */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Kiểu input <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={qstFormInputType}
                            onChange={(e) => setQstFormInputType(e.target.value as ExerciseQuestion['InputType'])}
                            className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none cursor-pointer appearance-none focus:border-[#4EACAF] focus:bg-white transition-colors text-xs uppercase"
                          >
                            <option value="Speech">Speech (Giọng nói)</option>
                            <option value="Multiple Choice">Multiple Choice (Chọn đáp án)</option>
                            <option value="Repeat">Repeat (Lặp lại)</option>
                            <option value="Listen and Repeat">Listen and Repeat (Nghe và lặp lại)</option>
                            <option value="Oral Motor">Oral Motor (Hàm miệng uốn lưỡi)</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Question level instructions text */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Hướng dẫn hành hạ chi tiết (Lời của trợ lý kính VR)
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ví dụ: Bé hãy lắng nghe cẩn thận, sau đó phát ra luồng rung hơi chữ R tròn trịa..." 
                          value={qstFormInstruction}
                          onChange={(e) => setQstFormInstruction(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs"
                        />
                      </div>

                      {/* Audio URL option */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Audio mẫu URL (Optional)
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://test.soundhelix.com/song-1.mp3" 
                          value={qstFormAudioURL}
                          onChange={(e) => setQstFormAudioURL(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs font-mono"
                        />
                      </div>

                      {/* Image URL option */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Hình ảnh minh họa URL (Optional)
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://images.unsplash.com/photo-example" 
                          value={qstFormImageURL}
                          onChange={(e) => setQstFormImageURL(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent hover:border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 md:px-8 py-4 border-t border-slate-100 flex gap-3 bg-white shrink-0">
                    <button 
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-3.5 border-2 border-slate-100 text-slate-400 hover:text-slate-600 font-extrabold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-wider"
                    >
                      Bỏ qua
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3.5 bg-[#4EACAF] hover:bg-[#4EACAF]/95 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/10 transition-all text-sm uppercase tracking-wider"
                    >
                      Lưu trữ thông tin
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents helper
interface StatCardItemProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

function StatCardItem({ title, value, subtitle, icon, bgColor, borderColor }: StatCardItemProps) {
  return (
    <div className={cn(
      "p-5 rounded-[28px] border-2 flex items-center gap-4 shadow-xs transition-all hover:scale-[1.01] hover:shadow-md",
      bgColor,
      borderColor
    )}>
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs shrink-0 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</p>
        <p className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest mt-1.5 leading-none">{title}</p>
        <p className="text-[9px] text-slate-400 font-bold mt-1 leading-none">{subtitle}</p>
      </div>
    </div>
  );
}

// Difficulty Level colored badge Selector
function DifficultyLevelBadge({ level }: { level: Exercise['DifficultyLevel'] }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border",
      level === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
      level === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
      'bg-rose-50 text-rose-600 border-rose-100'
    )}>
      <Award className="w-3 h-3 shrink-0" />
      {level === 'Easy' ? 'Dễ (Easy)' : level === 'Medium' ? 'Vừa (Medium)' : 'Khó (Hard)'}
    </span>
  );
}
