import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Student, Teacher, UserRole } from '@/types';

interface AuthState {
  role: UserRole | null;
  student: Student | null;
  teacher: Teacher | null;
  isAuthenticated: boolean;
  loginStudent: (student: Student) => void;
  loginTeacher: (teacher: Teacher) => void;
  logout: () => void;
  updateStudent: (updates: Partial<Student>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      student: null,
      teacher: null,
      isAuthenticated: false,
      loginStudent: (student) => set({ role: 'student', student, teacher: null, isAuthenticated: true }),
      loginTeacher: (teacher) => set({ role: 'teacher', teacher, student: null, isAuthenticated: true }),
      logout: () => set({ role: null, student: null, teacher: null, isAuthenticated: false }),
      updateStudent: (updates) =>
        set((state) => {
          if (!state.student) return state;
          const updated = { ...state.student, ...updates };
          
          // Optionally here we could make an API call to sync in background
          if (typeof window !== 'undefined') {
            fetch(`/api/students/${updated.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates)
            }).catch(console.error);
          }
          
          return { student: updated };
        }),
    }),
    { name: 'acculum-auth' }
  )
);
