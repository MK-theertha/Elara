import { create } from 'zustand';
import type { AuthTokens, UserDto } from '@elara/validation';
import { sessionStorage } from '@/lib/secure-storage';

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** True until the initial SecureStore read completes. */
  isHydrating: boolean;
  isAuthenticated: boolean;
  hydrate: () => Promise<void>;
  setSession: (user: UserDto, tokens: AuthTokens) => Promise<void>;
  setTokens: (tokens: AuthTokens) => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrating: true,
  isAuthenticated: false,

  hydrate: async () => {
    try {
      const stored = await sessionStorage.load();
      if (!stored) {
        set({ isHydrating: false });
        return;
      }
      set({
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        isAuthenticated: true,
        isHydrating: false,
      });
    } catch {
      // SecureStore read failed (e.g. keystore unavailable) — fail open to
      // a logged-out state rather than leaving the app stuck loading.
      set({ isHydrating: false });
    }
  },

  setSession: async (user, tokens) => {
    await sessionStorage.save(tokens);
    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
    });
  },

  setTokens: async (tokens) => {
    await sessionStorage.save(tokens);
    set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  },

  clearSession: async () => {
    await sessionStorage.clear();
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));

/** Non-hook accessor for use outside React (e.g. the API client). */
export function getAuthSnapshot() {
  return useAuthStore.getState();
}
