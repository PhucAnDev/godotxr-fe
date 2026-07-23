export type Program = {
  ProgramId: string;
  ProgramName: string;
  Description?: string;
  TargetAgeFrom?: number;
  TargetAgeTo?: number;
  Language?: string;
  Status: string;
};

export type Lesson = {
  LessonId: string;
  ProgramId: string;
  LessonName: string;
  LessonOrder?: number;
  Description?: string;
  TargetSkill?: string;
  EstimatedDuration?: number;
  Status: string;
  maxScore?: number;
};

export type Exercise = {
  ExerciseId: string;
  LessonId: string;
  TypeId: string;
  ExerciseName: string;
  Instruction: string;
  DifficultyLevel: string;
  TargetSkill: string;
  DurationLimit?: number;
  Language?: string;
  Status: string;
};

export type ExerciseQuestion = {
  QuestionId: string;
  ExerciseId: string;
  QuestionSentence: string;
  AnswerSentence: string;
  InputType: string;
  AudioURL?: string;
  ImageURL?: string;
};
