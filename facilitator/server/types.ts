// ─── Student Learning Report Schema ─────────────────────────────────────────

export interface AccumulReportSchema {
  report_version: string;
  generated_at: string;
  student: ReportStudent;
  learning_activities: ReportLesson[];
  quizzes: ReportQuiz[];
  ai_questions: ReportAIQuestion[];
  peer_competitions: ReportPeerCompetition[];
  confidence_data: ReportConfidence[];
  adaptive_learning: ReportAdaptiveLearning;
}

export interface ReportStudent {
  student_id: string;
  full_name: string;
  class: string;
  school: string;
  preferred_language: string;
  interests: string[];
}

export interface ReportLesson {
  lesson_id: string;
  title: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: string;
  format: string;
  language: string;
  completed: boolean;
  partially_completed: boolean;
  skipped: boolean;
  time_spent_seconds: number;
  date: string;
}

export interface ReportQuiz {
  quiz_id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  total_questions: number;
  correct: number;
  incorrect: number;
  score_percentage: number;
  attempts: number;
  time_taken_seconds: number;
  questions_skipped: number;
  hints_requested: number;
  repeated_mistakes: number;
  date: string;
}

export interface ReportAIQuestion {
  question: string;
  subject: string;
  topic: string;
  lesson_context?: string;
  help_type: 'explanation' | 'hint' | 'example' | 'clarification';
  date: string;
}

export interface ReportPeerCompetition {
  competition_id: string;
  subject: string;
  topic: string;
  difficulty: string;
  total_questions: number;
  student_score: number;
  completed: boolean;
  time_taken_seconds: number;
  correct: number;
  incorrect: number;
  date: string;
  xp_earned: number;
  previous_score?: number;
}

export interface ReportConfidence {
  topic: string;
  subject: string;
  confidence_rating: number;
  associated_quiz_score?: number;
  date: string;
}

export interface ReportAdaptiveLearning {
  difficulty_served: string;
  difficulty_changes: number;
  recommended_revisions: string[];
  topics_revisited: string[];
  formats_used: string[];
  languages_used: string[];
  interests_used: string[];
}

// ─── Database Entities ───────────────────────────────────────────────────────

export interface FacilitatorProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  school?: string;
  facilitator_id?: string;
  subjects?: string[];
  classes?: string[];
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  student_id: string;
  full_name: string;
  class: string;
  school: string;
  preferred_language: string;
  interests?: string[];
  created_at: string;
  updated_at: string;
}

export interface StudentReport {
  id: string;
  student_id: string;
  report_version: string;
  report_date: string;
  raw_json: string;
  imported_at: string;
  imported_by: string;
  is_demo: number;
}

export interface LearningActivity {
  id: string;
  report_id: string;
  student_id: string;
  activity_type: 'lesson' | 'quiz' | 'ai_question' | 'peer_competition' | 'revision';
  subject?: string;
  topic?: string;
  subtopic?: string;
  difficulty?: string;
  language?: string;
  score_numerator?: number;
  score_denominator?: number;
  time_spent_seconds?: number;
  completed: number;
  attempts: number;
  hints_requested: number;
  questions_skipped: number;
  repeated_mistakes: number;
  confidence_rating?: number;
  activity_date?: string;
  extra_data?: string;
  created_at: string;
}

export interface LearningSignal {
  id: string;
  student_id: string;
  report_id: string;
  signal_type: string;
  subject?: string;
  topic?: string;
  subtopic?: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
  confidence_score: number;
  recommended_action: string;
  status: 'active' | 'resolved' | 'monitoring';
  created_at: string;
  updated_at: string;
}

export interface Intervention {
  id: string;
  student_id: string;
  signal_id?: string;
  facilitator_id: string;
  intervention_type: string;
  subject?: string;
  topic?: string;
  subtopic?: string;
  language?: string;
  format?: string;
  difficulty?: string;
  notes?: string;
  status: string;
  assigned_at: string;
  completed_at?: string;
  created_at: string;
}

export interface Reassessment {
  id: string;
  intervention_id: string;
  student_id: string;
  subject?: string;
  topic?: string;
  before_score_numerator: number;
  before_score_denominator: number;
  after_score_numerator?: number;
  after_score_denominator?: number;
  before_report_id?: string;
  after_report_id?: string;
  improvement_percentage?: number;
  status: string;
  completed_at?: string;
  created_at: string;
}

// ─── Service Types ───────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  studentId?: string;
  studentName?: string;
  reportVersion?: string;
  reportDate?: string;
  activitiesCount?: number;
  quizzesCount?: number;
  signalsDetected?: number;
}

export interface ParsedReport {
  student: Omit<StudentProfile, 'created_at' | 'updated_at'>;
  lessons: Partial<LearningActivity>[];
  quizzes: Partial<LearningActivity>[];
  aiQuestions: Partial<LearningActivity>[];
  peerCompetitions: Partial<LearningActivity>[];
}

export interface RawSignal {
  signal_type: string;
  subject: string;
  topic: string;
  subtopic?: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string[];
  confidence_score: number;
  recommended_action: string;
}

export interface InterventionRecommendation {
  intervention_type: string;
  topic: string;
  format: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ComparisonResult {
  improvement: boolean;
  change_percentage: number;
  before_score: number;
  after_score: number;
  summary: string;
}

export interface DashboardStats {
  total_students: number;
  on_track: number;
  needs_attention: number;
  requires_intervention: number;
  recent_signals: LearningSignal[];
  recent_interventions: Intervention[];
}

// ─── Textbook, RAG, & Quiz Interfaces ───────────────────────────────────────

export interface Textbook {
  id: string;
  title: string;
  class_grade: string;
  subject: string;
  language: string;
  academic_year: string;
  description?: string;
  pdf_storage_path: string;
  pdf_filename: string;
  file_size_bytes?: number;
  page_count?: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  teacher_id?: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
  // Computed/joined fields
  chapter_count?: number;
  topic_count?: number;
  assignments?: string[];
}

export interface TextbookChunk {
  id: string;
  textbook_id: string;
  class_grade?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  language?: string;
  page_number: number;
  chunk_index: number;
  chunk_text: string;
  token_count?: number;
  embedding?: number[] | string;
  created_at: string;
}

export interface TextbookTopic {
  id: string;
  textbook_id: string;
  chapter_number?: number;
  chapter_name: string;
  topic_name: string;
  subtopics?: string[];
  short_description?: string;
  page_start?: number;
  page_end?: number;
  order_index?: number;
  published: boolean;
  created_at: string;
}

export interface TextbookAssignment {
  id: string;
  textbook_id: string;
  class_grade: string;
  assigned_by?: string;
  assigned_at: string;
}

export interface GeneratedQuiz {
  id: string;
  textbook_id?: string;
  created_by?: string;
  class_grade: string;
  subject: string;
  chapter?: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question_count: number;
  language: string;
  question_types?: string[];
  status: 'active' | 'archived';
  created_at: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_number: number;
  question_type: 'MCQ' | 'True_False' | 'Fill_Blanks' | 'Short_Answer';
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  chapter?: string;
  topic?: string;
  page_reference?: number;
  chunk_ids?: string[];
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  textbook_id?: string;
  chapter?: string;
  topic: string;
  difficulty: string;
  score_numerator: number;
  score_denominator: number;
  score_percentage: number;
  time_taken_seconds: number;
  submitted_at: string;
  created_at: string;
  student_name?: string;
  responses?: QuizResponse[];
}

export interface QuizResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  student_answer?: string;
  is_correct: boolean;
  correct_answer: string;
  explanation?: string;
  created_at: string;
}

export interface TopicMastery {
  id: string;
  student_id: string;
  subject: string;
  topic: string;
  mastery_level: 'Low' | 'Medium' | 'High';
  mastery_score: number;
  total_attempts: number;
  last_attempt_date: string;
  created_at: string;
  updated_at: string;
}

