import type { SubjectId } from './index';

// Static demo progress data per student interest
export interface SubjectProgress {
  subjectId: SubjectId;
  subjectName: string;
  icon: string;
  progress: number;   // 0-100
  score: number;      // average score 0-100
  status: 'strong' | 'on-track' | 'needs-attention' | 'not-started';
  trend: 'up' | 'down' | 'stable';
  chaptersCompleted: number;
  totalChapters: number;
  lastActivity: string;
}

export const DEMO_SUBJECT_PROGRESS: SubjectProgress[] = [
  { subjectId: 'mathematics', subjectName: 'Mathematics', icon: '🔢', progress: 68, score: 72, status: 'on-track', trend: 'up', chaptersCompleted: 4, totalChapters: 6, lastActivity: '2 hours ago' },
  { subjectId: 'science', subjectName: 'Science', icon: '🔬', progress: 84, score: 88, status: 'strong', trend: 'up', chaptersCompleted: 5, totalChapters: 6, lastActivity: '1 day ago' },
  { subjectId: 'social-science', subjectName: 'Social Science', icon: '🌍', progress: 72, score: 74, status: 'on-track', trend: 'stable', chaptersCompleted: 3, totalChapters: 4, lastActivity: '3 days ago' },
  { subjectId: 'english', subjectName: 'English', icon: '📝', progress: 91, score: 93, status: 'strong', trend: 'up', chaptersCompleted: 5, totalChapters: 5, lastActivity: 'Today' },
  { subjectId: 'kannada', subjectName: 'Kannada', icon: '🅺', progress: 76, score: 78, status: 'on-track', trend: 'stable', chaptersCompleted: 3, totalChapters: 4, lastActivity: '2 days ago' },
  { subjectId: 'hindi', subjectName: 'Hindi', icon: '🇮🇳', progress: 59, score: 61, status: 'needs-attention', trend: 'down', chaptersCompleted: 2, totalChapters: 4, lastActivity: '5 days ago' },
  { subjectId: 'computer-science', subjectName: 'Computer Science', icon: '💻', progress: 88, score: 92, status: 'strong', trend: 'up', chaptersCompleted: 4, totalChapters: 4, lastActivity: 'Yesterday' },
];

export function getOverallProgress(progress: SubjectProgress[]): number {
  if (!progress.length) return 0;
  return Math.round(progress.reduce((sum, p) => sum + p.progress, 0) / progress.length);
}

export function getStatusColor(status: SubjectProgress['status']): string {
  switch (status) {
    case 'strong': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'on-track': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'needs-attention': return 'text-red-600 bg-red-50 border-red-200';
    case 'not-started': return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export function getStatusLabel(status: SubjectProgress['status']): string {
  switch (status) {
    case 'strong': return 'Strong';
    case 'on-track': return 'On Track';
    case 'needs-attention': return 'Needs Attention';
    case 'not-started': return 'Not Started';
  }
}
