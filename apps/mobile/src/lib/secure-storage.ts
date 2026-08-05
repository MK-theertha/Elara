import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'elara.accessToken',
  refreshToken: 'elara.refreshToken',
  expiresAt: 'elara.expiresAt',
} as const;

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

/**
 * Wraps expo-secure-store (Keychain on iOS, Keystore-backed EncryptedSharedPreferences
 * on Android) so tokens never touch plain AsyncStorage.
 */
export const sessionStorage = {
  async save(session: StoredSession): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.accessToken, session.accessToken),
      SecureStore.setItemAsync(KEYS.refreshToken, session.refreshToken),
      SecureStore.setItemAsync(KEYS.expiresAt, session.expiresAt),
    ]);
  },

  async load(): Promise<StoredSession | null> {
    const [accessToken, refreshToken, expiresAt] = await Promise.all([
      SecureStore.getItemAsync(KEYS.accessToken),
      SecureStore.getItemAsync(KEYS.refreshToken),
      SecureStore.getItemAsync(KEYS.expiresAt),
    ]);
    if (!accessToken || !refreshToken || !expiresAt) return null;
    return { accessToken, refreshToken, expiresAt };
  },

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.accessToken),
      SecureStore.deleteItemAsync(KEYS.refreshToken),
      SecureStore.deleteItemAsync(KEYS.expiresAt),
    ]);
  },
};
