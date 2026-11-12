// ============================================================
// ACCULUM — Core Type Definitions
// ============================================================

export type UserRole = 'student' | 'teacher';

export type Interest =
  | 'Cricket'
  | 'Music'
  | 'Gaming'
  | 'Robotics'
  | 'Football'
  | 'Art'
  | 'Science'
  | 'Reading'
  | 'Technology'
  | 'Space'
  | 'Puzzles'
  | 'Nature'
  | 'Movies'
  | 'Cars'
  | 'Aviation';

export type LearningFormat = 'Video' | 'Text' | 'Audio' | 'Simulation' | 'Story' | 'Voice';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Language = 'English' | 'Kannada' | 'Hindi';

export type InterventionLevel = 'green' | 'yellow' | 'red';

export type SignalType =
  | 'confidence_mismatch_high'
  | 'confidence_mismatch_low'
  | 'low_score'
  | 'high_score'
  | 'low_engagement'
  | 'repeated_errors'
  | 'fast_improver'
  | 'advanced_ready';

// -----------------------------------------------
// USERS
// -----------------------------------------------

export interface Student {
  id: number;
  name: string;
  class: number;
  section: string;
  school: string;
  preferredLanguage: Language;
  interests: Interest[];
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  badge_count: number;
  created_at: string;
}

export interface Teacher {
  id: number;
  name: string;
  school: string;
  subjects: string[];
  classes: number[];
  created_at: string;
}

// -----------------------------------------------
// COURSES & LESSONS
// -----------------------------------------------

export interface Course {
  id: number;
  title: string;
  subject: string;
  class: number;
  difficulty: Difficulty;
  description: string;
  thumbnail: string;
  xp_reward: number;
  estimated_minutes: number;
  lesson_count: number;
  topics: string[];
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  order: number;
  formats: LearningFormat[];
  content: Record<LearningFormat, string>;
  estimated_minutes: number;
  xp_reward: number;
}

// -----------------------------------------------
// QUIZ
// -----------------------------------------------

export interface Question {
  id: number;
  lesson_id: number;
  topic: string;
  text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface QuizAttempt {
  id: number;
  student_id: number;
  lesson_id: number;
  score: number;
  accuracy: number;
  time_taken_seconds: number;
  answers: { question_id: number; selected: number; correct: boolean }[];
  confidence_before: number;
  completed_at: string;
}

// -----------------------------------------------
// PROGRESS & ANALYTICS
// -----------------------------------------------

export interface Progress {
  student_id: number;
  course_id: number;
  lesson_id: number;
  completed: boolean;
  score?: number;
  format_used?: LearningFormat;
  last_accessed: string;
}

export interface ConfidenceRating {
  id: number;
  student_id: number;
  topic: string;
  rating: number; // 1-5
  rated_at: string;
}

export interface LearningSignal {
  id: number;
  student_id: number;
  topic: string;
  signal_type: SignalType;
  confidence_score: number;
  performance_score: number;
  recommended_action: string;
  acknowledged: boolean;
  created_at: string;
}

// -----------------------------------------------
// GAMIFICATION
// -----------------------------------------------

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  condition: string;
}

export interface XPTransaction {
  id: number;
  student_id: number;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Badge {
  id: string;
  student_id: number;
  achievement_id: string;
  earned_at: string;
}

// -----------------------------------------------
// TEACHER TOOLS
// -----------------------------------------------

export interface Assignment {
  id: number;
  teacher_id: number;
  class: number;
  section: string;
  subject: string;
  topic: string;
  type: 'lesson' | 'quiz' | 'revision';
  due_date: string;
  message?: string;
  created_at: string;
}

export interface InterventionAlert {
  student: Student;
  signal: LearningSignal;
  latestQuiz?: QuizAttempt;
  level: InterventionLevel;
  recommendedAction: string;
}

// -----------------------------------------------
// PEER LEARNING
// -----------------------------------------------

export interface PeerHelp {
  id: number;
  student_id: number;
  helper_id: number;
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'completed';
  created_at: string;
}

// -----------------------------------------------
// NOTIFICATIONS & SMS
// -----------------------------------------------

export interface Notification {
  id: number;
  user_id: number;
  role: UserRole;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'intervention';
  read: boolean;
  created_at: string;
}

export interface SMSLog {
  id: number;
  to: string;
  message: string;
  status: 'sent' | 'failed' | 'mock';
  sent_at: string;
}

// -----------------------------------------------
// PERSONALIZATION ENGINE
// -----------------------------------------------

export interface PersonalizationProfile {
  studentId: number;
  interests: Interest[];
  preferredLanguage: Language;
  preferredFormats: LearningFormat[];
  confidencePattern: Record<string, number>;
  performancePattern: Record<string, number>;
  careerGoal?: string;
}

export interface PersonalizationOutput {
  recommendedLesson: string;
  recommendedDifficulty: Difficulty;
  recommendedFormat: LearningFormat;
  personalizedExample: string;
  revisionRecommended: boolean;
  interventionSignal?: SignalType;
  careerRecommendation?: string;
  motivationalMessage: string;
  themeColor: string;
  themeIcon: string;
  scoreAnnouncement: string;
}

// -----------------------------------------------
// CAREER ROADMAP
// -----------------------------------------------

export interface CareerPath {
  id: string;
  title: string;
  icon: string;
  description: string;
  requiredSkills: string[];
  suggestedSubjects: string[];
  roadmap: CareerMilestone[];
  aiEvolution?: string;
}

export interface CareerMilestone {
  class: number | string;
  focus: string;
  skills: string[];
}

// -----------------------------------------------
// DAILY GK
// -----------------------------------------------

export interface GKChallenge {
  id: number;
  date: string;
  questions: GKQuestion[];
}

export interface GKQuestion {
  id: number;
  text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  category: string;
}

// -----------------------------------------------
// PARENT REPORT
// -----------------------------------------------

export interface ParentReport {
  student_id: number;
  week_start: string;
  completion_rate: number;
  strongest_subject: string;
  needs_practice_subject: string;
  total_xp_earned: number;
  quizzes_taken: number;
  avg_score: number;
  streak_days: number;
  suggestion: string;
}
