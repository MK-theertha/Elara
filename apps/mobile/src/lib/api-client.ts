import Constants from 'expo-constants';
import type { ApiResponse } from '@elara/validation';
import { getAuthSnapshot } from '@/stores/auth-store';

function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // Dev: derive the host machine's LAN IP from Expo's own dev server URL so
  // the Android emulator / a physical device can reach the API without a
  // hardcoded IP that breaks every time the network changes.
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000/api/v1`;
  }

  return 'http://localhost:3000/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Set false to skip attaching the Authorization header (e.g. login/register). */
  auth?: boolean;
}

async function rawFetch(path: string, options: RequestOptions, accessToken: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.auth !== false && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const { refreshToken, setTokens, clearSession } = getAuthSnapshot();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      await clearSession();
      return false;
    }
    await setTokens(json.data);
    return true;
  } catch {
    await clearSession();
    return false;
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { accessToken } = getAuthSnapshot();
  let res = await rawFetch(path, options, accessToken);

  if (res.status === 401 && options.auth !== false) {
    // Multiple requests can 401 at once (e.g. a screen firing several
    // queries) — share one in-flight refresh instead of racing several.
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null;
    });
    const refreshed = await refreshPromise;
    if (refreshed) {
      res = await rawFetch(path, options, getAuthSnapshot().accessToken);
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new ApiError(res.status, json.error.code, json.error.message, json.error.details);
  }
  return json.data;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown, options?: { auth?: boolean }) =>
    apiFetch<T>(path, { method: 'POST', body, auth: options?.auth }),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
