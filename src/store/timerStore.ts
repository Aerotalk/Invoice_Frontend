import { create } from 'zustand';
import { apiService } from '../services/api';

interface TimerState {
  isRunning: boolean;
  seconds: number;
  projectId: string;
  projectName: string;
  taskName: string;
  description: string;
  billingRate: number;
  isBillable: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  startTimer: (projectId: string, projectName: string, taskName: string, rate?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopAndLogTimer: () => Promise<boolean>;
  tick: () => void;
  updateDescription: (desc: string) => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  seconds: 0,
  projectId: "",
  projectName: "",
  taskName: "",
  description: "",
  billingRate: 100,
  isBillable: true,
  intervalId: null,

  startTimer: (projectId, projectName, taskName, rate = 100) => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);

    const id = setInterval(() => {
      get().tick();
    }, 1000);

    set({
      isRunning: true,
      seconds: 0,
      projectId,
      projectName,
      taskName,
      billingRate: rate,
      isBillable: rate > 0,
      intervalId: id
    });
  },

  tick: () => set((state) => ({ seconds: state.seconds + 1 })),

  pauseTimer: () => {
    const { intervalId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    set({ isRunning: false, intervalId: null });
  },

  resumeTimer: () => {
    const { isRunning, intervalId } = get();
    if (isRunning || intervalId) return;

    const id = setInterval(() => {
      get().tick();
    }, 1000);

    set({ isRunning: true, intervalId: id });
  },

  updateDescription: (description) => set({ description }),

  stopAndLogTimer: async () => {
    const { seconds, projectId, projectName, taskName, description, billingRate, isBillable, intervalId } = get();
    if (intervalId) clearInterval(intervalId);

    if (seconds < 5) {
      // Don't log sessions shorter than 5 seconds
      set({ isRunning: false, seconds: 0, intervalId: null, description: "" });
      return false;
    }

    const hours = parseFloat((seconds / 3600).toFixed(4));
    
    // Log active hours to our API
    await apiService.createTimeEntry({
      projectId,
      projectName,
      taskName,
      hours: parseFloat(Math.max(0.1, hours).toFixed(2)), // minimum 0.1 hours logged
      date: new Date().toISOString().split('T')[0],
      isBillable,
      billingRate,
      description: description || "Active tracked sprint session."
    });

    set({
      isRunning: false,
      seconds: 0,
      projectId: "",
      projectName: "",
      taskName: "",
      description: "",
      intervalId: null
    });
    
    return true;
  },

  resetTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      isRunning: false,
      seconds: 0,
      projectId: "",
      projectName: "",
      taskName: "",
      description: "",
      intervalId: null
    });
  }
}));
