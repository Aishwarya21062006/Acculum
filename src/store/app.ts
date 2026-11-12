import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@/types';

interface AppState {
  sessionStartTime: number | null;
  breakDismissed: boolean;
  isOnline: boolean;
  pendingSync: any[];
  notifications: Notification[];
  unreadCount: number;
  currentLesson: number | null;
  currentCourse: number | null;
  startSession: () => void;
  dismissBreak: () => void;
  setOnline: (online: boolean) => void;
  addPendingSync: (data: any) => void;
  clearPendingSync: () => void;
  setNotifications: (n: Notification[]) => void;
  setCurrentLesson: (id: number | null) => void;
  setCurrentCourse: (id: number | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sessionStartTime: null,
      breakDismissed: false,
      isOnline: true,
      pendingSync: [],
      notifications: [],
      unreadCount: 0,
      currentLesson: null,
      currentCourse: null,
      startSession: () => set({ sessionStartTime: Date.now(), breakDismissed: false }),
      dismissBreak: () => set({ breakDismissed: true, sessionStartTime: Date.now() }),
      setOnline: (online) => set({ isOnline: online }),
      addPendingSync: (data) => set((s) => ({ pendingSync: [...s.pendingSync, data] })),
      clearPendingSync: () => set({ pendingSync: [] }),
      setNotifications: (n) => set({ notifications: n, unreadCount: n.filter(x => !x.read).length }),
      setCurrentLesson: (id) => set({ currentLesson: id }),
      setCurrentCourse: (id) => set({ currentCourse: id }),
    }),
    { name: 'acculum-app' }
  )
);
