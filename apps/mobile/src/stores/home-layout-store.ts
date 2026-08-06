import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type HomeWidgetKey = 'tasks' | 'schedule' | 'expenses' | 'shopping' | 'notes' | 'ai';

export const DEFAULT_WIDGET_ORDER: HomeWidgetKey[] = [
  'tasks',
  'schedule',
  'expenses',
  'shopping',
  'notes',
  'ai',
];

const KEY = 'elara.homeWidgetOrder';

interface HomeLayoutState {
  order: HomeWidgetKey[];
  hydrate: () => Promise<void>;
  setOrder: (order: HomeWidgetKey[]) => void;
}

export const useHomeLayoutStore = create<HomeLayoutState>((set) => ({
  order: DEFAULT_WIDGET_ORDER,

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as HomeWidgetKey[];
      const isValid =
        Array.isArray(parsed) &&
        parsed.length === DEFAULT_WIDGET_ORDER.length &&
        parsed.every((key) => DEFAULT_WIDGET_ORDER.includes(key));
      if (isValid) set({ order: parsed });
    } catch {
      // Keep the default order if the read/parse fails.
    }
  },

  setOrder: (order) => {
    set({ order });
    SecureStore.setItemAsync(KEY, JSON.stringify(order)).catch(() => {});
  },
}));
