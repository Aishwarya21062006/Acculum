import {
  Facilitator, Student, StudentDetail, StudentReport, LearningSignal,
  Intervention, DashboardStats, Notification, ValidationResult,
  RegisterData, CreateInterventionData,
  Textbook, TextbookTopic, GeneratedQuiz, QuizAttempt, TopicMastery,
} from './types';

const SESSION_KEY = 'acculum_session_token';
export const getToken = () => localStorage.getItem(SESSION_KEY);
export const setToken = (t: string) => localStorage.setItem(SESSION_KEY, t);
export const clearToken = () => localStorage.removeItem(SESSION_KEY);

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['X-Session-Token'] = token;

  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `Request failed (${res.status})` }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: RegisterData) =>
    apiFetch<{ token: string; facilitator: Facilitator }>('/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    }),
  login: (email: string, password: string) =>
    apiFetch<{ token: string; facilitator: Facilitator }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  me: () => apiFetch<Facilitator>('/auth/me'),
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportsApi = {
  import: async (file: File) => {
    const formData = new FormData();
    formData.append('report', file);
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['X-Session-Token'] = token;
    const res = await fetch('/api/reports/import', { method: 'POST', body: formData, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.message || (Array.isArray(err.errors) ? err.errors.join(' · ') : null) || `Import failed (${res.status})`;
      throw new Error(msg);
    }
    return res.json() as Promise<{
      valid: boolean; validation: ValidationResult; student: { id: string; full_name: string; class: string };
      report_id: string; signals_detected: number; ai_summary: string; warnings: string[];
    }>;
  },
  list: () => apiFetch<StudentReport[]>('/reports'),
  getById: (id: string) => apiFetch<StudentReport & { activities: any[] }>(`/reports/${id}`),
  getByStudent: (studentId: string) => apiFetch<StudentReport[]>(`/reports/student/${studentId}`),
};

// ─── Students ────────────────────────────────────────────────────────────────
export const studentsApi = {
  list: () => apiFetch<Student[]>('/students'),
  getById: (id: string) => apiFetch<StudentDetail>(`/students/${id}`),
  getSignals: (id: string) => apiFetch<LearningSignal[]>(`/students/${id}/signals`),
};

// ─── Interventions ───────────────────────────────────────────────────────────
export const interventionsApi = {
  create: (data: CreateInterventionData) =>
    apiFetch<Intervention>('/interventions', { method: 'POST', body: JSON.stringify(data) }),
  list: () => apiFetch<Intervention[]>('/interventions'),
  getByStudent: (studentId: string) => apiFetch<Intervention[]>(`/interventions/student/${studentId}`),
  update: (id: string, data: Partial<Intervention>) =>
    apiFetch<Intervention>(`/interventions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  createReassessment: (data: {
    intervention_id: string; student_id: string; subject?: string; topic?: string;
    before_report_id: string; after_report_id: string;
  }) => apiFetch<any>('/reassessments', { method: 'POST', body: JSON.stringify(data) }),
  getReassessmentsByStudent: (studentId: string) =>
    apiFetch<any[]>(`/reassessments/student/${studentId}`),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => apiFetch<DashboardStats>('/analytics/dashboard'),
  class: () => apiFetch<any[]>('/analytics/class'),
  topics: () => apiFetch<{ topics: any[]; total_students: number; class_wide_threshold: number }>('/analytics/topics'),
};

// ─── Demo ────────────────────────────────────────────────────────────────────
export const demoApi = {
  load: () => apiFetch<{ message: string; students_loaded: string[] }>('/demo/load', { method: 'POST' }),
  clear: () => apiFetch<{ message: string }>('/demo/clear', { method: 'DELETE' }),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationsApi = {
  list: () => apiFetch<Notification[]>('/notifications'),
  markRead: (id: string) => apiFetch<{ ok: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),
};

// ─── Textbooks ───────────────────────────────────────────────────────────────
export const textbooksApi = {
  list: () => apiFetch<Textbook[]>('/textbooks'),
  getById: (id: string) => apiFetch<Textbook & { topics: TextbookTopic[] }>(`/textbooks/${id}`),
  upload: async (formData: FormData) => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['X-Session-Token'] = token;

    const res = await fetch('/api/textbooks/upload', {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Upload failed (${res.status})`);
    }

    return res.json() as Promise<Textbook>;
  },
  assign: (id: string, class_grades: string[]) =>
    apiFetch<{ message: string; class_grades: string[] }>(`/textbooks/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ class_grades }),
    }),
  delete: (id: string) => apiFetch<{ message: string }>(`/textbooks/${id}`, { method: 'DELETE' }),
  getFileUrl: (id: string) => `/api/textbooks/${id}/file`,
};

// ─── Student Textbooks ───────────────────────────────────────────────────────
export const studentTextbooksApi = {
  list: (classGrade: string = '7') =>
    apiFetch<Textbook[]>(`/student/textbooks?class_grade=${encodeURIComponent(classGrade)}`),
  getById: (id: string) =>
    apiFetch<Textbook & { topics: TextbookTopic[]; chapters: { chapter_name: string; chapter_number?: number; topics: TextbookTopic[] }[] }>(
      `/student/textbooks/${id}`
    ),
  explain: (id: string, data: { question: string; topic?: string; chapter?: string }) =>
    apiFetch<{
      answer: string;
      references: { chapter: string; topic: string; page_number: number }[];
      passages_retrieved: number;
      sufficient_context: boolean;
    }>(`/student/textbooks/${id}/explain`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Quizzes ─────────────────────────────────────────────────────────────────
export const quizzesApi = {
  generate: (data: {
    textbook_id?: string;
    class_grade: string;
    subject: string;
    chapter?: string;
    topic: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    question_count?: number;
    language?: string;
    question_types?: string[];
  }) => apiFetch<GeneratedQuiz>('/quizzes/generate', { method: 'POST', body: JSON.stringify(data) }),
  list: (params: { class_grade?: string; subject?: string; topic?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.class_grade) q.set('class_grade', params.class_grade);
    if (params.subject) q.set('subject', params.subject);
    if (params.topic) q.set('topic', params.topic);
    return apiFetch<GeneratedQuiz[]>(`/quizzes?${q.toString()}`);
  },
  getById: (id: string) => apiFetch<GeneratedQuiz>(`/quizzes/${id}`),
  submit: (
    quizId: string,
    data: {
      student_id: string;
      answers: { question_id: string; student_answer: string }[];
      time_taken_seconds?: number;
    }
  ) =>
    apiFetch<{
      attempt: QuizAttempt;
      responses: any[];
      mastery: TopicMastery;
      intervention_recommended?: {
        recommended: boolean;
        reason: string;
        suggested_action: string;
        intervention_id?: string;
      };
    }>(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getStudentAttempts: (studentId: string) =>
    apiFetch<QuizAttempt[]>(`/quizzes/student/${studentId}/attempts`),
  getStudentMastery: (studentId: string) =>
    apiFetch<TopicMastery[]>(`/quizzes/student/${studentId}/mastery`),
};

// ─── Textbook Analytics ──────────────────────────────────────────────────────
export const textbookAnalyticsApi = {
  get: (classGrade: string = '7') =>
    apiFetch<{
      class_grade: string;
      topic_statistics: any[];
      weak_topics: any[];
      chapter_statistics: any[];
      mastery_distribution: { mastery_level: string; count: number }[];
      recent_attempts: any[];
      active_interventions: any[];
    }>(`/analytics/textbook?class_grade=${encodeURIComponent(classGrade)}`),
};
