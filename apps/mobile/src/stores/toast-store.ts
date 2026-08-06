import { create } from 'zustand';

export type ToastTone = 'neutral' | 'success' | 'danger';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
  action?: ToastAction;
}

interface ToastStore {
  toast: ToastState | null;
  show: (message: string, tone?: ToastTone, action?: ToastAction) => void;
  dismiss: () => void;
}

let nextId = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  show: (message, tone = 'neutral', action) => {
    nextId += 1;
    set({ toast: { id: nextId, message, tone, action } });
  },
  dismiss: () => set({ toast: null }),
}));
