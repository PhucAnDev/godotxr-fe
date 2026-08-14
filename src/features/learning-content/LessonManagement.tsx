import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
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
  Calendar,
  Sparkles,
  Smile,
  GraduationCap,
  Play,
  Volume2,
  Bookmark,
  TrendingUp,
  Award,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkle,
  Trash2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Boxes,
  Image as ImageIcon,
  Camera,
  Layout
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ActionButton from '../../components/common/ActionButton';
import Pagination from '../../components/common/Pagination';
import CustomSelect from '../../components/common/CustomSelect';
import SearchableSelect from '../../components/common/SearchableSelect';
import { useLessonManagementApi, type LessonResponse } from '../../hooks/useLessonManagementApi';
import {
  getLessonImages, uploadLessonImage, deleteLessonImage,
  getLessonSlots, configureLessonSlot, assignItemToSlot,
  updateLessonSlot, deleteLessonSlot
} from '../../services/lessonSlotService';
import { getItemAssets, type ItemAssetResponse } from '../../services/itemAssetService';

// DB Interfaces
interface Program {
  ProgramId: string;
  ProgramName: string;
  Language: 'Vietnamese' | 'English';
  Status: 'Active' | 'Inactive';
}

interface Lesson {
  LessonId: string;
  ProgramId: string;
  LessonName: string;
  LessonOrder: number;
  Description: string;
  TargetSkill: string;
  EstimatedDuration: number; // minutes
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
  MaxScore?: number;
}

interface Exercise {
  ExerciseId: string;
  ExerciseName: string;
  ExerciseType: 'Speech Recognition' | 'Interactive Card' | 'Pronunciation Guide' | 'Bouncing Match';
  ScoreToPass: number;
}

const mapLesson = (lesson: LessonResponse): Lesson => ({
  LessonId: String(lesson.id), ProgramId: String(lesson.programId),
  LessonName: lesson.lessonName, LessonOrder: lesson.lessonOrder,
  Description: lesson.description ?? '', TargetSkill: (lesson.targetSkill ?? 'Pronunciation') as Lesson['TargetSkill'],
  EstimatedDuration: lesson.estimatedDuration, Status: lesson.status,
  CreatedAt: lesson.createdAt, UpdatedAt: lesson.updatedAt ?? lesson.createdAt,
  MaxScore: lesson.maxScore,
});

// Predefined Mock Programs
const MOCK_PROGRAMS: Program[] = [
  { ProgramId: 'PRG-001', ProgramName: 'Thám hiểm Đảo Khủng Long VR - Luyện Âm Tròn Vành', Language: 'Vietnamese', Status: 'Active' },
  { ProgramId: 'PRG-002', ProgramName: 'Space Language Explorer - Anh Ngữ Vũ Trụ', Language: 'English', Status: 'Active' },
  { ProgramId: 'PRG-003', ProgramName: 'Vương Quốc Âm Thanh Tranh 3D - Kể Chuyện Cổ Tích', Language: 'Vietnamese', Status: 'Active' },
  { ProgramId: 'PRG-005', ProgramName: 'Smart Phonetics Adventure - Đồ Vật & Con Vật 3D', Language: 'English', Status: 'Active' }
];

// Predefined Mock Lessons
const INITIAL_LESSONS: Lesson[] = [
  {
    LessonId: 'LSN-001',
    ProgramId: 'PRG-001',
    LessonName: 'Nhận Diện Ký Tự Nguyên Âm Đơn Sơ Khởi',
    LessonOrder: 1,
    Description: 'Lấy cảm hứng từ chú khủng long cổ dài để hướng dẫn trẻ cách mở khẩu hình tròn trịa phát âm các nguyên âm tiếng Việt A, O, E.',
    TargetSkill: 'Pronunciation',
    EstimatedDuration: 15,
    Status: 'Active',
    CreatedAt: '2026-05-10 09:00',
    UpdatedAt: '2026-05-11 11:30'
  },
  {
    LessonId: 'LSN-002',
    ProgramId: 'PRG-001',
    LessonName: 'Chinh Phục Phụ Âm Phản Xạ Lạc Lối',
    LessonOrder: 2,
    Description: 'Sửa lỗi ngọng âm N và L phổ biến thông qua việc hái các quả đào thần kỳ rải rác trên đảo trong không gian ảo 3D.',
    TargetSkill: 'Oral Motor',
    EstimatedDuration: 20,
    Status: 'Active',
    CreatedAt: '2026-05-11 10:00',
    UpdatedAt: '2026-05-11 15:40'
  },
  {
    LessonId: 'LSN-003',
    ProgramId: 'PRG-002',
    LessonName: 'Giao Tiếp Không Gian cùng Phi Hành Gia',
    LessonOrder: 1,
    Description: 'Bé đối thoại trực tiếp bằng tiếng Anh với Robot vũ trụ để rèn kỹ năng phản xạ câu ngắn và phát âm phụ âm gió S, X.',
    TargetSkill: 'Communication',
    EstimatedDuration: 25,
    Status: 'Active',
    CreatedAt: '2026-05-12 14:00',
    UpdatedAt: '2026-05-15 08:20'
  },
  {
    LessonId: 'LSN-004',
    ProgramId: 'PRG-003',
    LessonName: 'Từ Vựng Sắc Màu Cổ Tích Thần Kỳ',
    LessonOrder: 1,
    Description: 'Học hệ thống từ vựng về màu sắc thông qua lăng kính phép thuật 3D phóng lớn vật thể của mụ phù thủy tốt bụng.',
    TargetSkill: 'Vocabulary',
    EstimatedDuration: 18,
    Status: 'Active',
    CreatedAt: '2026-05-14 16:00',
    UpdatedAt: '2026-05-14 16:00'
  },
  {
    LessonId: 'LSN-005',
    ProgramId: 'PRG-001',
    LessonName: 'Uốn Lưỡi Tránh Ngọng Chữ R Nâng Cao',
    LessonOrder: 3,
    Description: 'Các bài tập thổi bong bóng nước kỹ thuật số để tạo lực đẩy hơi lưỡi thích ứng điều trị tật líu lưỡi hoặc mất hơi chữ R.',
    TargetSkill: 'Oral Motor',
    EstimatedDuration: 30,
    Status: 'Inactive',
    CreatedAt: '2026-05-15 11:15',
    UpdatedAt: '2026-05-20 17:00'
  },
  {
    LessonId: 'LSN-006',
    ProgramId: 'PRG-005',
    LessonName: 'Tên Gọi Các Bạn Động Vật Nông Trại Vui Vẻ',
    LessonOrder: 2,
    Description: 'Trò chơi kéo bóng bay ghép chữ cái tiếng Anh đầu tiên về thế giới động vật. Bé gắp thả đồ vật bằng tay cầm VR.',
    TargetSkill: 'Vocabulary',
    EstimatedDuration: 15,
    Status: 'Active',
    CreatedAt: '2026-05-20 10:00',
    UpdatedAt: '2026-05-21 09:12'
  }
];

// Mock Exercises list associated with each Lesson
const MOCK_EXERCISES_BY_LESSON: Record<string, Exercise[]> = {
  'LSN-001': [
    { ExerciseId: 'EXE-101', ExerciseName: 'Thổi gió dập lửa cùng Bé Rồng đỏ', ExerciseType: 'Pronunciation Guide', ScoreToPass: 80 },
    { ExerciseId: 'EXE-102', ExerciseName: 'Nhận diện phát âm nguyên âm đơn chuẩn xác', ExerciseType: 'Speech Recognition', ScoreToPass: 85 }
  ],
  'LSN-002': [
    { ExerciseId: 'EXE-201', ExerciseName: 'Hái táo âm L - hái sung âm N', ExerciseType: 'Interactive Card', ScoreToPass: 75 },
    { ExerciseId: 'EXE-202', ExerciseName: 'Phát âm lặp lại cụm từ "lên núi - lấy nước"', ExerciseType: 'Speech Recognition', ScoreToPass: 90 }
  ],
  'LSN-003': [
    { ExerciseId: 'EXE-301', ExerciseName: 'Chào hỏi đại sứ ngôi sao tinh vân', ExerciseType: 'Speech Recognition', ScoreToPass: 80 },
    { ExerciseId: 'EXE-302', ExerciseName: 'Tìm mảnh vỡ vũ trụ chứa âm gió /s/', ExerciseType: 'Bouncing Match', ScoreToPass: 85 }
  ],
  'LSN-004': [
    { ExerciseId: 'EXE-401', ExerciseName: 'Bầu trời bảy sắc cầu vồng của tiên nữ', ExerciseType: 'Interactive Card', ScoreToPass: 70 }
  ],
  'LSN-005': [
    { ExerciseId: 'EXE-501', ExerciseName: 'Luyện thở hơi kéo bọt xà phòng', ExerciseType: 'Pronunciation Guide', ScoreToPass: 75 }
  ],
  'LSN-006': [
    { ExerciseId: 'EXE-601', ExerciseName: 'Chăn bò sữa chuẩn giọng Mỹ', ExerciseType: 'Speech Recognition', ScoreToPass: 85 },
    { ExerciseId: 'EXE-602', ExerciseName: 'Đố vui tên động vật nông trại VR', ExerciseType: 'Bouncing Match', ScoreToPass: 80 }
  ]
};
export default function LessonManagement() {
  const { getLessons, getPrograms, createLesson, updateLesson, deleteLesson } = useLessonManagementApi();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  // VR Configuration states
  const [lessonImages, setLessonImages] = useState<any[]>([]);
  const [lessonSlots, setLessonSlots] = useState<any[]>([]);
  const [itemAssets, setItemAssets] = useState<ItemAssetResponse[]>([]);
  const [isLoadingVrConfig, setIsLoadingVrConfig] = useState(false);
  const [vrModalTab, setVrModalTab] = useState<'angles' | 'slots'>('angles');

  // Angle image form state
  const [newAngleName, setNewAngleName] = useState('');
  const [newAngleFile, setNewAngleFile] = useState<File | null>(null);

  // Slot configuration form state
  const [newSlotName, setNewSlotName] = useState('');
  const [newSlotImageId, setNewSlotImageId] = useState<number | null>(null);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting states
  const [sortColumn, setSortColumn] = useState<keyof Lesson | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (column: keyof Lesson) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Reset page of lessons on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterProgram, filterStatus]);

  // Modal systems
  const [modalType, setModalType] = useState<'add' | 'edit' | 'exercises' | 'delete' | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Form input field state
  const [formProgramId, setFormProgramId] = useState('');
  const [formLessonName, setFormLessonName] = useState('');
  const [formLessonOrder, setFormLessonOrder] = useState<number | ''>(1);
  const [formDesc, setFormDesc] = useState('');
  const [formTargetSkill, setFormTargetSkill] = useState<Lesson['TargetSkill']>('Pronunciation');
  const [formDuration, setFormDuration] = useState<number | ''>(15);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formMaxScore, setFormMaxScore] = useState<number | ''>(100);

  // Target skill options memo for the CustomSelect input
  const targetSkillOptions = useMemo(() => {
    const defaultOptions = [
      { value: 'Pronunciation', label: 'Phát âm' },
      { value: 'Vocabulary', label: 'Từ vựng' },
      { value: 'Oral Motor', label: 'Hàm miệng' },
      { value: 'Communication', label: 'Giao tiếp' }
    ];
    if (formTargetSkill && !defaultOptions.some(opt => opt.value === formTargetSkill)) {
      return [...defaultOptions, { value: formTargetSkill, label: formTargetSkill }];
    }
    return defaultOptions;
  }, [formTargetSkill]);

  // Sparkle alert trigger helper
  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setAlertConfig({ message, type });
    setTimeout(() => setAlertConfig(null), 3500);
  };

  useEffect(() => {
    void Promise.all([getLessons(), getPrograms()]).then(([lessonResult, programResult]) => {
      if (lessonResult.success && lessonResult.data) setLessons(lessonResult.data.items.map(mapLesson));
      else triggerToast(lessonResult.errors.join(' ') || lessonResult.message, 'warning');
      if (programResult.success && programResult.data) {
        setPrograms(programResult.data.items.map(p => ({
          ProgramId: String(p.id),
          ProgramName: p.programName,
          Language: p.language,
          Status: p.status,
        })));
      }
    });
  }, []);

  // Statistic Computations
  const totalLessons = lessons.length;
  const activeLessons = lessons.filter(l => l.Status === 'Active').length;

  // Calculate average duration
  const avgDuration = totalLessons > 0
    ? Math.round(lessons.reduce((sum, l) => sum + l.EstimatedDuration, 0) / totalLessons)
    : 0;

  // Clean target skills count
  const targetSkillsCount = new Set(lessons.map(l => l.TargetSkill)).size;

  // Actions
  const handleToggleStatus = async (lessonId: string) => {
    const lesson = lessons.find(l => l.LessonId === lessonId);
    if (!lesson) return;
    const result = await updateLesson(Number(lessonId), { lessonName: lesson.LessonName, lessonOrder: lesson.LessonOrder, description: lesson.Description, targetSkill: lesson.TargetSkill, estimatedDuration: lesson.EstimatedDuration, status: lesson.Status === 'Active' ? 'Inactive' : 'Active', maxScore: lesson.MaxScore });
    if (result.success && result.data) setLessons(current => current.map(l => l.LessonId === lessonId ? mapLesson(result.data!) : l));
    else triggerToast(result.errors.join(' ') || result.message, 'warning');
  };

  const handleOpenAdd = () => {
    setFormProgramId(programs[0]?.ProgramId || '');
    setFormLessonName('');
    setFormLessonOrder(lessons.length + 1);
    setFormDesc('');
    setFormTargetSkill('Pronunciation');
    setFormDuration(15);
    setFormStatus('Active');
    setFormMaxScore(100);
    setSelectedLesson(null);
    setModalType('add');
  };

  const handleOpenEdit = (les: Lesson) => {
    setSelectedLesson(les);
    setFormProgramId(les.ProgramId);
    setFormLessonName(les.LessonName);
    setFormLessonOrder(les.LessonOrder);
    setFormDesc(les.Description);
    setFormTargetSkill(les.TargetSkill);
    setFormDuration(les.EstimatedDuration);
    setFormStatus(les.Status);
    setFormMaxScore(les.MaxScore ?? 100);
    setModalType('edit');
  };

  const handleOpenExercises = async (les: Lesson) => {
    setSelectedLesson(les);
    setModalType('exercises');
    setVrModalTab('angles');
    setIsLoadingVrConfig(true);

    // Fetch item assets library if not loaded
    if (!assetsLoaded) {
      const assetResult = await getItemAssets(1, 1000);
      if (assetResult.success && assetResult.data) {
        setItemAssets(assetResult.data.items);
        setAssetsLoaded(true);
      }
    }

    // Fetch angle images and slots
    const imagesPromise = getLessonImages(Number(les.LessonId));
    const slotsPromise = getLessonSlots(Number(les.LessonId));

    const [imagesRes, slotsRes] = await Promise.all([imagesPromise, slotsPromise]);

    if (imagesRes.success && imagesRes.data) {
      setLessonImages(imagesRes.data);
    } else {
      setLessonImages([]);
    }

    if (slotsRes.success && slotsRes.data) {
      setLessonSlots(slotsRes.data);
    } else {
      setLessonSlots([]);
    }

    setIsLoadingVrConfig(false);
  };

  const refreshVrConfig = async (lessonId: number) => {
    const imagesPromise = getLessonImages(lessonId);
    const slotsPromise = getLessonSlots(lessonId);
    const [imagesRes, slotsRes] = await Promise.all([imagesPromise, slotsPromise]);
    if (imagesRes.success && imagesRes.data) setLessonImages(imagesRes.data);
    if (slotsRes.success && slotsRes.data) setLessonSlots(slotsRes.data);
  };

  const handleUploadAngle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson || !newAngleName.trim() || !newAngleFile) {
      triggerToast('Vui lòng điền tên góc chụp và chọn tệp ảnh!', 'warning');
      return;
    }
    setIsLoadingVrConfig(true);
    const formData = new FormData();
    formData.append('AngleName', newAngleName.trim());
    formData.append('ImageFile', newAngleFile);

    const result = await uploadLessonImage(Number(selectedLesson.LessonId), formData);
    setIsLoadingVrConfig(false);
    if (result.success) {
      triggerToast('Tải lên ảnh góc chụp thành công!');
      setNewAngleName('');
      setNewAngleFile(null);
      refreshVrConfig(Number(selectedLesson.LessonId));
    } else {
      triggerToast(result.errors.join(' ') || 'Tải ảnh lên thất bại', 'warning');
    }
  };

  const handleDeleteAngle = async (imageId: number) => {
    if (!selectedLesson) return;
    if (!window.confirm('Bạn có chắc muốn xóa góc chụp này? Các Spawner liên kết với góc chụp này sẽ bị mất góc chụp tham chiếu.')) return;
    setIsLoadingVrConfig(true);
    const result = await deleteLessonImage(Number(selectedLesson.LessonId), imageId);
    setIsLoadingVrConfig(false);
    if (result.success) {
      triggerToast('Xóa góc chụp thành công!');
      refreshVrConfig(Number(selectedLesson.LessonId));
    } else {
      triggerToast(result.errors.join(' ') || 'Xóa góc chụp thất bại', 'warning');
    }
  };

  const handleEditSlotClick = (slot: any) => {
    setEditingSlotId(slot.id);
    setNewSlotName(slot.slotName);
    setNewSlotImageId(slot.lessonImageId);
  };

  const handleCancelEditSlot = () => {
    setEditingSlotId(null);
    setNewSlotName('');
    setNewSlotImageId(null);
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!selectedLesson) return;
    if (!window.confirm('Bạn có chắc muốn xóa vị trí đặt vật phẩm này?')) return;
    setIsLoadingVrConfig(true);
    try {
      await deleteLessonSlot(Number(selectedLesson.LessonId), slotId);
      setIsLoadingVrConfig(false);
      triggerToast('Xóa vị trí thành công!');
      if (editingSlotId === slotId) {
        handleCancelEditSlot();
      }
      refreshVrConfig(Number(selectedLesson.LessonId));
    } catch (err: any) {
      setIsLoadingVrConfig(false);
      triggerToast(err.message || 'Xóa vị trí thất bại', 'warning');
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson || !newSlotName.trim()) {
      triggerToast('Vui lòng điền tên vị trí!', 'warning');
      return;
    }
    setIsLoadingVrConfig(true);

    let result;
    if (editingSlotId) {
      result = await updateLessonSlot(Number(selectedLesson.LessonId), editingSlotId, {
        slotName: newSlotName.trim(),
        lessonImageId: newSlotImageId
      });
    } else {
      result = await configureLessonSlot(Number(selectedLesson.LessonId), {
        slotName: newSlotName.trim(),
        lessonImageId: newSlotImageId
      });
    }

    setIsLoadingVrConfig(false);
    if (result.success) {
      triggerToast(editingSlotId ? 'Cập nhật vị trí thành công!' : 'Thêm vị trí đặt vật phẩm thành công!');
      setNewSlotName('');
      setNewSlotImageId(null);
      setEditingSlotId(null);
      refreshVrConfig(Number(selectedLesson.LessonId));
    } else {
      triggerToast(result.errors.join(' ') || (editingSlotId ? 'Cập nhật vị trí thất bại' : 'Thêm vị trí thất bại'), 'warning');
    }
  };

  const handleAssignItem = async (slotId: number, itemAssetId: number | null) => {
    if (!selectedLesson) return;
    setIsLoadingVrConfig(true);
    const result = await assignItemToSlot(Number(selectedLesson.LessonId), slotId, itemAssetId);
    setIsLoadingVrConfig(false);
    if (result.success) {
      triggerToast('Gán vật phẩm 3D thành công!');
      refreshVrConfig(Number(selectedLesson.LessonId));
    } else {
      triggerToast(result.errors.join(' ') || 'Gán vật phẩm thất bại', 'warning');
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedLesson(null);
    setEditingSlotId(null);
    setNewSlotName('');
    setNewSlotImageId(null);
  };

  const handleOpenDelete = (les: Lesson) => {
    setSelectedLesson(les);
    setModalType('delete');
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;
    const result = await deleteLesson(Number(selectedLesson.LessonId));
    if (result.success) {
      setLessons(current => current.filter(l => l.LessonId !== selectedLesson.LessonId));
      triggerToast(result.message || 'Xóa bài học thành công.');
      handleCloseModal();
    } else {
      triggerToast(result.errors.join(' ') || result.message || 'Xóa bài học thất bại.', 'warning');
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formProgramId) {
      triggerToast('Vui lòng chọn một chương trình học trực thuộc!', 'warning');
      return;
    }
    if (!formLessonName.trim()) {
      triggerToast('Vui lòng điền tên tiêu đề bài học!', 'warning');
      return;
    }
    if (formLessonOrder === '' || formLessonOrder <= 0) {
      triggerToast('Thứ tự bài học phải lớn hơn 0!', 'warning');
      return;
    }
    if (!formDesc.trim()) {
      triggerToast('Hãy mô tả một vài nét cơ bản cho giáo viên biết!', 'warning');
      return;
    }
    if (formDuration === '' || formDuration < 5 || formDuration > 120) {
      triggerToast('Thời lượng ước tính lý tưởng từ 5 đến 120 phút!', 'warning');
      return;
    }
    if (formMaxScore === '' || formMaxScore < 0) {
      triggerToast('Điểm tối đa không được âm!', 'warning');
      return;
    }

    const common = {
      lessonName: formLessonName.trim(),
      lessonOrder: Number(formLessonOrder),
      description: formDesc.trim(),
      targetSkill: formTargetSkill,
      estimatedDuration: Number(formDuration),
      status: formStatus,
      maxScore: Number(formMaxScore)
    };
    const result = modalType === 'add'
      ? await createLesson({ ...common, programId: Number(formProgramId) })
      : selectedLesson ? await updateLesson(Number(selectedLesson.LessonId), common) : null;
    if (result?.success && result.data) {
      const mapped = mapLesson(result.data);
      setLessons(current => modalType === 'add' ? [mapped, ...current] : current.map(l => l.LessonId === mapped.LessonId ? mapped : l));
      triggerToast(result.message);
      handleCloseModal();
    } else if (result) triggerToast(result.errors.join(' ') || result.message, 'warning');
  };

  // Filtering Search computation logic
  const filteredLessons = lessons.filter(item => {
    const program = programs.find(p => p.ProgramId === item.ProgramId);
    const skillLabel = item.TargetSkill === 'Pronunciation' ? 'phát âm' :
      item.TargetSkill === 'Vocabulary' ? 'từ vựng' :
        item.TargetSkill === 'Oral Motor' ? 'hàm miệng cơ môi miệng' :
          item.TargetSkill === 'Communication' ? 'giao tiếp' :
            item.TargetSkill;
    const searchString = `${item.LessonName} ${item.TargetSkill} ${skillLabel} ${item.LessonId}`.toLowerCase();

    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesProgram = filterProgram === 'ALL' || item.ProgramId === filterProgram;
    const matchesStatus = filterStatus === 'ALL' || item.Status === filterStatus;

    return matchesSearch && matchesProgram && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const sortedLessons = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredLessons;
    return [...filteredLessons].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB, 'vi-VN', { numeric: true })
          : valB.localeCompare(valA, 'vi-VN', { numeric: true });
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredLessons, sortColumn, sortDirection]);

  const paginatedLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedLessons.slice(startIndex, startIndex + pageSize);
  }, [sortedLessons, currentPage, pageSize]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative" id="lesson-view-root">

      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-lg pointer-events-auto"
            id="lesson-toast-box"
          >
            <div className={cn(
              "p-5 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-white backdrop-blur-md",
              alertConfig.type === 'success' ? 'bg-[#4EACAF]/95 text-white' : 'bg-[#FF8E8E]/95 text-white'
            )}>
              {alertConfig.type === 'success' ? (
                <div className="bg-white/20 p-2 rounded-xl shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="bg-white/20 p-2 rounded-xl shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0 font-bold">
                <p className="italic text-sm tracking-tight text-white leading-snug">{alertConfig.message}</p>
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

      {/* 1. Header (GodotXR Premium Kid-friendly Aesthetics) */}
      <div className="bg-white/40 backdrop-blur-md rounded-xl p-8 md:p-10 border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-widest leading-none">
            <BookOpen className="w-3.5 h-3.5" />
            Học phần tương tác 3D
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none italic pb-1 mt-2">
            Quản Lý <span className="text-[#4EACAF]">Bài Học</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl text-sm md:text-base leading-relaxed mt-1">
            Sắp xếp bài học theo kế hoạch chương trình can thiệp và gán các kỹ năng mục tiêu như Phát âm, Vốn từ vựng, Vận động môi miệng nhằm cấu hình giáo trình trực quan nhất.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          id="add-lesson-btn"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Thêm bài học mới
        </button>
      </div>

      {/* 2. Soft pastel rounded statistic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Bài Học"
          value={totalLessons}
          subtitle="Giáo án lưu hành"
          icon={<BookOpen className="w-6 h-6 text-[#4EACAF]" />}
          bgColor="bg-teal-50"
          borderColor="border-teal-100"
        />
        <StatCard
          title="Đang Hoạt Động"
          value={activeLessons}
          subtitle="Đang liên kết ở các lớp"
          icon={<Smile className="w-6 h-6 text-emerald-500" />}
          bgColor="bg-emerald-50"
          borderColor="border-emerald-100"
        />
        <StatCard
          title="Thời Lượng Trung Bình"
          value={`${avgDuration} phút`}
          subtitle="Học giả lý thuyết & VR"
          icon={<Clock className="w-6 h-6 text-indigo-500" />}
          bgColor="bg-indigo-50"
          borderColor="border-indigo-100"
        />
        <StatCard
          title="Kỹ Năng Mục Tiêu"
          value={targetSkillsCount}
          subtitle="Các nhóm bổ trợ khẩu hình"
          icon={<Award className="w-6 h-6 text-[#FF8E8E]" />}
          bgColor="bg-rose-50"
          borderColor="border-rose-100"
        />
      </div>

      {/* 3. Filter and search group */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 space-y-3">
        {/* Search Input bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo tên bài học, kỹ năng điều trị (Phát âm, Từ vựng, Hàm miệng, Giao tiếp)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-200 font-normal text-slate-600 placeholder-slate-400 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-250 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CustomSelect
            value={filterProgram}
            onChange={setFilterProgram}
            options={[
              { value: 'ALL', label: 'Mọi chương trình học' },
              ...programs.map(p => ({ value: p.ProgramId, label: p.ProgramName }))
            ]}
          />
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'ALL', label: 'Mọi trạng thái giáo án' },
              { value: 'Active', label: 'Đang thông qua (Active)' },
              { value: 'Inactive', label: 'Bảo lưu / Đóng (Inactive)' }
            ]}
          />
        </div>
      </div>

      {/* 4. Interactive table list cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="lesson-table-box">


        {filteredLessons.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-100 italic">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700 text-center font-extrabold pb-1">Không tìm thấy bài học nào cho bộ lọc hiện hành</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterProgram('ALL');
                setFilterStatus('ALL');
              }}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-[#4EACAF] font-medium text-xs uppercase rounded-xl transition-all"
            >
              Hoàn tác chọn bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="lessons-table-body">
                <thead>
                  <tr className="bg-[#FDFCF5]/55 border-b border-gray-100 text-[#555] font-extrabold text-xs uppercase tracking-widest whitespace-nowrap">
                    <th
                      onClick={() => handleSort('LessonId')}
                      className="w-[6%] py-5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none whitespace-nowrap"
                      title="Sắp xếp theo Mã Số"
                    >
                      <div className="flex items-center gap-1">
                        Mã Số
                        {sortColumn === 'LessonId' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('LessonOrder')}
                      className="w-[6%] py-5 px-2 cursor-pointer hover:bg-slate-100/50 transition-colors select-none whitespace-nowrap"
                      title="Sắp xếp theo Thứ tự"
                    >
                      <div className="flex items-center gap-1">
                        STT
                        {sortColumn === 'LessonOrder' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('LessonName')}
                      className="w-[20%] py-5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none whitespace-nowrap"
                      title="Sắp xếp theo tên bài học"
                    >
                      <div className="flex items-center gap-1">
                        Tên bài học
                        {sortColumn === 'LessonName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('ProgramId')}
                      className="w-[18%] py-5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none whitespace-nowrap"
                      title="Sắp xếp theo Chương trình"
                    >
                      <div className="flex items-center gap-1">
                        Chương trình học
                        {sortColumn === 'ProgramId' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('TargetSkill')}
                      className="w-[14%] py-5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none whitespace-nowrap"
                      title="Sắp xếp theo Mục tiêu kỹ năng"
                    >
                      <div className="flex items-center gap-1">
                        Mục Tiêu Kỹ Năng
                        {sortColumn === 'TargetSkill' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('EstimatedDuration')}
                      className="w-[10%] py-5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none whitespace-nowrap"
                      title="Sắp xếp theo Thời lượng"
                    >
                      <div className="flex items-center gap-1">
                        Thời Lượng
                        {sortColumn === 'EstimatedDuration' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('MaxScore')}
                      className="w-[10%] py-5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none whitespace-nowrap"
                      title="Sắp xếp theo Điểm tối đa"
                    >
                      <div className="flex items-center gap-1">
                        Điểm tối đa
                        {sortColumn === 'MaxScore' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-[#4EACAF]" /> : <ArrowDown className="h-3.5 w-3.5 text-[#4EACAF]" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                    <th className="w-[8%] py-5 px-4 select-none whitespace-nowrap">
                      Trạng Thái
                    </th>
                    <th className="w-[8%] py-5 px-4 text-right select-none whitespace-nowrap">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-normal text-sm text-slate-650">
                  {paginatedLessons.map((lesson) => {
                    const program = programs.find(p => p.ProgramId === lesson.ProgramId);

                    return (
                      <tr key={lesson.LessonId} className="hover:bg-gray-50/40 transition-colors">
                        <td className="py-5 px-4 font-mono text-gray-400 font-extrabold text-xs">
                          {lesson.LessonId}
                        </td>
                        <td className="py-5 px-2 font-mono text-gray-400 font-extrabold text-xs">
                          {lesson.LessonOrder}
                        </td>
                        <td className="py-5 px-4">
                          <p className="font-medium text-slate-800 leading-snug line-clamp-1 max-w-md font-bold">{lesson.LessonName}</p>
                        </td>
                        <td className="py-5 px-4">
                          {program ? (
                            <p className="text-gray-800 font-extrabold max-w-sm line-clamp-1">{program.ProgramName}</p>
                          ) : (
                            <span className="text-red-500 font-bold italic text-xs">Chương trình bị xóa</span>
                          )}
                        </td>
                        <td className="py-5 px-4">
                          <SkillBadge skill={lesson.TargetSkill} />
                        </td>
                        <td className="py-5 px-4 font-normal text-slate-650 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{lesson.EstimatedDuration} phút</span>
                          </div>
                        </td>
                        <td className="py-5 px-4 font-bold text-slate-650 whitespace-nowrap">
                          <span>{lesson.MaxScore ?? 100}đ</span>
                        </td>
                        <td className="py-5 px-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            lesson.Status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-400 border border-transparent'
                          )}>
                            {lesson.Status === 'Active' ? '● Hoạt động' : '○ Tạm ngưng'}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 px-1">
                            <ActionButton
                              type="play"
                              onClick={() => handleOpenExercises(lesson)}
                              title="cấu hình vị trí vật phẩm"
                            />

                            <ActionButton
                              type="edit"
                              onClick={() => handleOpenEdit(lesson)}
                              title="Cập nhật thông số bài học"
                            />

                            <ActionButton
                              type="delete"
                              onClick={() => handleOpenDelete(lesson)}
                              title="Xóa bài học"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-6 border-t border-slate-50">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredLessons.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                itemLabel="bài học"
              />
            </div>
          </>
        )}
      </div>

      {/* 5. Modal Systems */}
      <AnimatePresence>
        {modalType && (
          <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-gray-900/10 animate-in fade-in duration-300 overflow-y-auto w-full h-full" id="lesson-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative z-30 my-8"
              id="lesson-modal-box"
            >
              {/* Modal Header banner */}
              <div className={cn(
                "px-8 py-6 flex items-center justify-between border-b",
                modalType === 'add' ? 'bg-[#4EACAF]/10 border-[#4EACAF]/10 text-gray-900' :
                  modalType === 'edit' ? 'bg-sky-50 border-sky-100 text-gray-900' :
                    modalType === 'delete' ? 'bg-rose-50 border-rose-100 text-gray-900' : 'bg-indigo-50 border-indigo-100 text-gray-900'
              )}>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                    {modalType === 'add' && <Plus className="w-6 h-6 text-[#4EACAF]" />}
                    {modalType === 'edit' && <Edit3 className="w-6 h-6 text-sky-500" />}
                    {modalType === 'exercises' && <Boxes className="w-6 h-6 text-indigo-500" />}
                    {modalType === 'delete' && <Trash2 className="w-6 h-6 text-rose-500" />}

                    {modalType === 'add' && 'Tạo bài học mới'}
                    {modalType === 'edit' && `Sửa thông tin bài học: ${selectedLesson?.LessonId}`}
                    {modalType === 'exercises' && 'Cấu hình phân cảnh học tập VR'}
                    {modalType === 'delete' && 'Xác nhận xóa bài học'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {modalType === 'add' && 'Thiết lập nội dung và gán lớp kỹ năng rèn nói cho bài học'}
                    {modalType === 'edit' && 'Cập nhật lại thông tin thứ tự và thời lượng can thiệp của bài giảng'}
                    {modalType === 'exercises' && 'Quản lý góc chụp phòng học và cấu hình Spawner vật phẩm 3D cho Client VR'}
                    {modalType === 'delete' && 'Hành động này không thể khôi phục và có thể ảnh hưởng đến kết quả học tập'}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2.5 hover:bg-white/70 rounded-full transition-colors"
                  id="lesson-modal-close"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body conditional rendering */}
              {modalType === 'exercises' && selectedLesson ? (
                <div className="app-modal-body p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto" id="modal-exercises-view">
                  {/* Tab Selectors */}
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                    <button
                      onClick={() => setVrModalTab('angles')}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-sm font-bold tracking-tight transition-all flex items-center justify-center gap-2",
                        vrModalTab === 'angles'
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      <Camera className="w-4 h-4 text-blue-500" />
                      Ảnh góc chụp ({lessonImages.length})
                    </button>
                    <button
                      onClick={() => setVrModalTab('slots')}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-sm font-bold tracking-tight transition-all flex items-center justify-center gap-2",
                        vrModalTab === 'slots'
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      <Boxes className="w-4 h-4 text-blue-500" />
                      Vị trí vật phẩm ({lessonSlots.length})
                    </button>
                  </div>

                  {isLoadingVrConfig ? (
                    <div className="flex flex-col justify-center items-center py-16 space-y-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                      <span className="font-bold text-slate-500 text-sm">Đang đồng bộ phân cảnh VR...</span>
                    </div>
                  ) : vrModalTab === 'angles' ? (
                    /* --- ANGLES TAB --- */
                    <div className="space-y-6">
                      {/* Form Upload Angle Image */}
                      <form onSubmit={handleUploadAngle} className="bg-slate-50 p-5 rounded-3xl border border-slate-200/50 space-y-4">
                        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                          <Plus className="w-4.5 h-4.5 text-blue-500" />
                          Đăng ký góc chụp tổng thể mới
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tên góc chụp</label>
                            <input
                              type="text"
                              placeholder="Ví dụ: Góc kệ sách, Kệ trái cây..."
                              value={newAngleName}
                              onChange={(e) => setNewAngleName(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 text-slate-800"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chọn ảnh chụp thực tế</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="file"
                                accept="image/*"
                                id="angleFile"
                                onChange={(e) => setNewAngleFile(e.target.files?.[0] || null)}
                                className="hidden"
                              />
                              <label
                                htmlFor="angleFile"
                                className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 bg-white px-4 py-2 rounded-xl cursor-pointer font-semibold text-slate-650 text-sm hover:bg-slate-50 transition-colors"
                              >
                                Choose File
                              </label>
                              <span className="text-xs text-slate-500 truncate max-w-[150px]">
                                {newAngleFile ? newAngleFile.name : 'Chưa chọn tệp'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                          >
                            Tải lên góc chụp
                          </button>
                        </div>
                      </form>

                      {/* List of Angle Images */}
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">Danh sách góc chụp đã có</h4>
                        {lessonImages.length === 0 ? (
                          <div className="text-center py-10 text-slate-400 font-bold italic text-sm">
                            Chưa có góc chụp nào được đăng ký cho bài học này.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {lessonImages.map((img) => {
                              const fullImgUrl = img.imageUrl.startsWith('http')
                                ? img.imageUrl
                                : `${import.meta.env.VITE_API_BASE_URL || ''}${img.imageUrl}`;
                              return (
                                <div key={img.id} className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                                  <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                                    <img
                                      src={fullImgUrl}
                                      alt={img.angleName}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAngle(img.id)}
                                      className="absolute top-2.5 right-2.5 bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-xl shadow-md transition-colors cursor-pointer"
                                      title="Xóa góc chụp"
                                    >
                                      <Trash2 className="w-4.5 h-4.5" />
                                    </button>
                                  </div>
                                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <span className="font-bold text-sm text-slate-800">{img.angleName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">ID: {img.id}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* --- SLOTS TAB --- */
                    <div className="space-y-6">
                      {/* Form Add/Edit Slot */}
                      <form onSubmit={handleAddSlot} className={cn("p-5 rounded-3xl border space-y-4 transition-colors duration-300", editingSlotId ? "bg-amber-50/30 border-amber-200" : "bg-slate-50 border-slate-200/50")}>
                        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                          {editingSlotId ? (
                            <>
                              <Edit3 className="w-4.5 h-4.5 text-amber-550" />
                              Cập nhật vị trí đặt vật phẩm
                            </>
                          ) : (
                            <>
                              <Plus className="w-4.5 h-4.5 text-blue-500" />
                              Thêm vị trí đặt vật phẩm mới
                            </>
                          )}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tên vị trí vật phẩm (Tên gợi nhớ) <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              placeholder="Ví dụ: Kệ trái cây - Vị trí táo..."
                              value={newSlotName}
                              onChange={(e) => setNewSlotName(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 text-slate-800"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thuộc góc chụp nào?</label>
                            <select
                              value={newSlotImageId || ''}
                              onChange={(e) => setNewSlotImageId(e.target.value ? Number(e.target.value) : null)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500 text-slate-800"
                            >
                              <option value="">-- Chọn góc chụp để đánh dấu --</option>
                              {lessonImages.map((img) => (
                                <option key={img.id} value={img.id}>{img.angleName}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          {editingSlotId && (
                            <button
                              type="button"
                              onClick={handleCancelEditSlot}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-750 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                            >
                              Hủy
                            </button>
                          )}
                          <button
                            type="submit"
                            className={cn(
                              "text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer",
                              editingSlotId ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
                            )}
                          >
                            {editingSlotId ? 'Cập nhật vị trí' : 'Đăng ký vị trí'}
                          </button>
                        </div>
                      </form>

                      {/* List of Registered Slots */}
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">Danh sách vị trí & Gán mô hình 3D</h4>
                        {lessonSlots.length === 0 ? (
                          <div className="text-center py-10 text-slate-400 font-bold italic text-sm">
                            Chưa cấu hình vị trí đặt vật phẩm nào cho bài học này.
                          </div>
                        ) : (
                          <div className="space-y-3 pr-1">
                            {lessonSlots.map((slot) => {
                              const assignedImg = lessonImages.find(img => img.id === slot.lessonImageId);
                              return (
                                <div key={slot.id} className="bg-[#FDFCF5] p-4 rounded-2xl border border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2">
                                      <strong className="text-sm text-slate-850">Tên vị trí: {slot.slotName}</strong>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-medium">
                                      {assignedImg ? (
                                        <span className="flex items-center gap-1 text-slate-500">
                                          <Camera className="w-3.5 h-3.5" />
                                          Góc: <strong className="text-slate-700 font-extrabold">{assignedImg.angleName}</strong>
                                        </span>
                                      ) : (
                                        <span className="text-amber-500 font-bold italic">Chưa liên kết góc chụp</span>
                                      )}

                                    </div>
                                  </div>

                                  {/* Select 3D Asset Dropdown & Action Buttons */}
                                  <div className="flex items-center gap-2 w-full md:w-auto md:min-w-[480px]">
                                    <span className="text-xs font-bold text-slate-400 uppercase shrink-0">Vật phẩm:</span>
                                    <SearchableSelect
                                      value={slot.itemAssetId || ''}
                                      onChange={(val) => handleAssignItem(slot.id, val ? Number(val) : null)}
                                      options={[
                                        { value: '', label: '-- [Không gán vật phẩm] --' },
                                        ...itemAssets.map(asset => ({
                                          value: asset.id,
                                          label: `${asset.name} ("${asset.answerSentence}")`
                                        }))
                                      ]}
                                      placeholder="-- [Không gán vật phẩm] --"
                                      className="flex-1"
                                    />

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleEditSlotClick(slot)}
                                        className={cn(
                                          "p-2 rounded-xl transition-all shadow-sm active:scale-90 cursor-pointer border",
                                          editingSlotId === slot.id
                                            ? "bg-amber-100 text-amber-700 border-amber-200"
                                            : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50 hover:text-amber-600"
                                        )}
                                        title="Chỉnh sửa vị trí này"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSlot(slot.id)}
                                        className="p-2 rounded-xl bg-white text-slate-650 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm active:scale-90 cursor-pointer"
                                        title="Xóa vị trí này"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={handleCloseModal}
                      className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Đóng cấu hình
                    </button>
                  </div>
                </div>
              ) : modalType === 'delete' && selectedLesson ? (
                <div className="app-modal-body p-8 md:p-10 space-y-6" id="modal-delete-confirm">
                  <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100 flex items-center gap-4 text-rose-700 animate-in fade-in duration-300">
                    <AlertTriangle className="w-10 h-10 shrink-0 text-rose-500" />
                    <div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wider text-rose-900">Xác nhận xóa bài học</h4>
                      <p className="text-xs font-bold text-rose-600/95 mt-1 leading-relaxed">
                        Bạn có chắc chắn muốn xóa bài học <strong className="text-rose-900">"{selectedLesson.LessonName}"</strong>? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các lớp học đang liên kết.
                      </p>
                    </div>
                  </div>

                  <div className="app-modal-actions pt-6 border-t border-gray-150 flex gap-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteLesson}
                      className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl shadow-xl shadow-rose-500/15 transition-all text-sm uppercase tracking-wider cursor-pointer"
                    >
                      Xác nhận xóa
                    </button>
                  </div>
                </div>
              ) : (
                /* Modal Body: ADD OR EDIT FORM rendering */
                <form onSubmit={handleSaveLesson} className="app-modal-body p-8 md:p-10 space-y-6" id="lesson-add-edit-form">
                  <div className="space-y-4">

                    {/* Program Selection drop-down */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Chương trình học trực thuộc <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <CustomSelect
                        value={formProgramId}
                        onChange={setFormProgramId}
                        variant="form"
                        options={programs
                          .filter(p => p.Status === 'Active')
                          .map(p => ({
                            value: p.ProgramId,
                            label: p.ProgramName
                          }))}
                      />
                    </div>

                    <div className="app-modal-form-grid grid grid-cols-1 md:grid-cols-3 gap-6">

                      {/* Lesson Name */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Tên bài học <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Đọc trơn tru thanh ngã, lisp sọc..."
                          value={formLessonName}
                          onChange={(e) => setFormLessonName(e.target.value)}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 placeholder-gray-300 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                      {/* Lesson Order */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Thứ tự bài học <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={50}
                          value={formLessonOrder}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormLessonOrder(val === '' ? '' : (parseInt(val) || 0));
                          }}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                    </div>

                    {/* Lesson Description */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                        Mô tả chi tiết bài học <span className="text-[#FF8E8E]">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Tóm tắt kịch bản tương tác game và phân bổ kỹ năng để phụ huynh tiện theo dõi..."
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        className="resize-y w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 placeholder-gray-300 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                      />
                    </div>

                    <div className="app-modal-form-grid grid grid-cols-1 md:grid-cols-4 gap-6">

                      {/* Target Skill badge category */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Kỹ năng bổ trợ <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <CustomSelect
                          value={formTargetSkill}
                          onChange={(val) => setFormTargetSkill(val)}
                          variant="form"
                          options={targetSkillOptions}
                        />
                      </div>

                      {/* Estimated Duration */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Thời lượng ước tính (Phút) <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={5}
                          max={120}
                          value={formDuration}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormDuration(val === '' ? '' : (parseInt(val) || 0));
                          }}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                      {/* Max Score */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Điểm tối đa <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          max={1000}
                          value={formMaxScore}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormMaxScore(val === '' ? '' : (parseFloat(val) || 0));
                          }}
                          className="w-full bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none transition-all focus:border-[#4EACAF] focus:bg-white text-sm"
                        />
                      </div>

                      {/* Status select */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-bold">
                          Trạng thái giáo trình <span className="text-[#FF8E8E]">*</span>
                        </label>
                        <CustomSelect
                          value={formStatus}
                          onChange={(val) => setFormStatus(val as 'Active' | 'Inactive')}
                          variant="form"
                          options={[
                            { value: 'Active', label: 'Hoạt động (Active)' },
                            { value: 'Inactive', label: 'Tạm khóa (Inactive)' }
                          ]}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Submit and Cancel block button bar */}
                  <div className="app-modal-actions pt-6 border-t border-gray-150 flex gap-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-4 border-4 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-wider"
                    >
                      Hủy cấu hình
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black rounded-2xl shadow-xl shadow-[#4EACAF]/15 transition-all text-sm uppercase tracking-wider"
                      id="lesson-submit-button"
                    >
                      Xác nhận lưu trữ
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
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

function StatCard({ title, value, subtitle, icon, bgColor, borderColor }: StatCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-xl border flex items-center gap-3.5 shadow-sm transition-transform hover:-translate-y-0.5",
      bgColor,
      borderColor
    )}>
      <div className="bg-white p-2 border border-slate-100 rounded-lg shadow-sm shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-medium text-slate-800 tracking-tight leading-none">{value}</p>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{title}</p>
      </div>
    </div>
  );
}

// Skill Badge category selector
function SkillBadge({ skill }: { skill: string }) {
  if (!skill) return null;

  const isPronunciation = skill === 'Pronunciation';
  const isVocabulary = skill === 'Vocabulary';
  const isOralMotor = skill === 'Oral Motor';
  const isCommunication = skill === 'Communication';

  const badgeClass = isPronunciation
    ? 'bg-[#4EACAF]/10 text-[#4EACAF] border border-[#4EACAF]/15' :
    isVocabulary ? 'bg-sky-50 text-sky-600 border border-sky-100' :
      isOralMotor ? 'bg-orange-50 text-orange-600 border border-orange-100' :
        'bg-purple-50 text-purple-600 border border-purple-100';

  const label = isPronunciation ? 'Phát âm' :
    isVocabulary ? 'Từ vựng' :
      isOralMotor ? 'Hàm miệng' :
        isCommunication ? 'Giao tiếp' :
          skill;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap",
      badgeClass
    )}>
      <Award className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
