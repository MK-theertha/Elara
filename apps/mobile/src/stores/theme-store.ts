import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';

const KEY = 'elara.themeMode';

interface ThemeModeState {
  mode: ThemeMode;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
}

export const useThemeModeStore = create<ThemeModeState>((set) => ({
  mode: 'system',

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        set({ mode: stored });
      }
    } catch {
      // Keep the 'system' default if the read fails.
    }
  },

  setMode: async (mode) => {
    set({ mode });
    try {
      await SecureStore.setItemAsync(KEY, mode);
    } catch {
      // Best-effort — the mode still applies for this session even if it can't persist.
    }
  },
}));
