import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const KEY = 'elara.preferences';

export interface NotificationPreferences {
  taskReminders: boolean;
  eventReminders: boolean;
  dailySummary: boolean;
}

export interface Preferences {
  language: string;
  timezone: string;
  currency: string;
  biometricEnabled: boolean;
  notifications: NotificationPreferences;
  lastBackupAt: string | null;
}

function deviceDefaults(): Pick<Preferences, 'language' | 'timezone'> {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions();
    return { language: resolved.locale ?? 'en-US', timezone: resolved.timeZone ?? 'Automatic' };
  } catch {
    return { language: 'en-US', timezone: 'Automatic' };
  }
}

const DEFAULT_PREFERENCES: Preferences = {
  ...deviceDefaults(),
  currency: 'USD',
  biometricEnabled: false,
  notifications: { taskReminders: true, eventReminders: true, dailySummary: false },
  lastBackupAt: null,
};

interface PreferencesState extends Preferences {
  hydrate: () => Promise<void>;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  setCurrency: (currency: string) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  markBackedUp: () => void;
}

async function persist(state: Preferences): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(state));
  } catch {
    // Best-effort — preferences still apply for this session even if they can't persist.
  }
}

/** Session-persisted app preferences — language/timezone/currency, notification toggles,
 * biometric-lock opt-in, and last-backup timestamp. SecureStore-backed, hydrated once at
 * root, same pattern as auth-store. */
export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...DEFAULT_PREFERENCES,

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<Preferences>;
      set((state) => ({
        ...state,
        ...parsed,
        notifications: { ...state.notifications, ...parsed.notifications },
      }));
    } catch {
      // Keep defaults if the read/parse fails.
    }
  },

  setLanguage: (language) => {
    set({ language });
    persist({ ...get() });
  },
  setTimezone: (timezone) => {
    set({ timezone });
    persist({ ...get() });
  },
  setCurrency: (currency) => {
    set({ currency });
    persist({ ...get() });
  },
  setBiometricEnabled: (biometricEnabled) => {
    set({ biometricEnabled });
    persist({ ...get() });
  },
  setNotificationPreference: (key, value) => {
    set((state) => ({ notifications: { ...state.notifications, [key]: value } }));
    persist({ ...get() });
  },
  markBackedUp: () => {
    const lastBackupAt = new Date().toISOString();
    set({ lastBackupAt });
    persist({ ...get() });
  },
}));
