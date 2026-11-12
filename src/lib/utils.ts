import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getGrade(score: number) {
  if (score >= 90) return { grade: 'A+', color: 'text-green-600' };
  if (score >= 80) return { grade: 'A', color: 'text-green-500' };
  if (score >= 70) return { grade: 'B+', color: 'text-blue-500' };
  if (score >= 60) return { grade: 'B', color: 'text-blue-400' };
  if (score >= 50) return { grade: 'C', color: 'text-amber-500' };
  return { grade: 'D', color: 'text-red-500' };
}
