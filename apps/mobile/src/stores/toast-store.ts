import { create } from 'zustand';

export type ToastTone = 'neutral' | 'success' | 'danger';

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastStore {
  toast: ToastState | null;
  show: (message: string, tone?: ToastTone) => void;
  dismiss: () => void;
}

let nextId = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  show: (message, tone = 'neutral') => {
    nextId += 1;
    set({ toast: { id: nextId, message, tone } });
  },
  dismiss: () => set({ toast: null }),
}));
