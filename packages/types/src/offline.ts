import type { SyncOp, SyncResource } from '@elara/validation';

/** Overall connectivity/sync state surfaced by the mobile app's sync indicator. */
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

/** Per-row sync bookkeeping columns added to every local SQLite table. */
export interface LocalSyncMeta {
  syncStatus: 'synced' | 'pending' | 'error';
}

/** A queued local mutation awaiting push to the server (mirrors SyncMutation). */
export interface QueuedMutation {
  id: string;
  resource: SyncResource;
  op: SyncOp;
  recordId: string;
  payload?: Record<string, unknown>;
  clientVersion?: number;
  createdAt: string;
  retryCount: number;
  nextAttemptAt?: string;
}
