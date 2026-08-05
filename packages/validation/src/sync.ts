import { z } from 'zod';
import { idSchema, isoDateSchema } from './common';

export const syncResourceEnum = z.enum([
  'tasks',
  'subtasks',
  'events',
  'reminders',
  'notes',
  'expenses',
  'shoppingLists',
  'shoppingItems',
]);
export type SyncResource = z.infer<typeof syncResourceEnum>;

export const syncOpEnum = z.enum(['create', 'update', 'delete']);
export type SyncOp = z.infer<typeof syncOpEnum>;

export const syncPullQuerySchema = z.object({
  since: z.string().optional(),
  resources: z.array(syncResourceEnum).optional(),
});
export type SyncPullQuery = z.infer<typeof syncPullQuerySchema>;

export const syncMutationSchema = z.object({
  resource: syncResourceEnum,
  op: syncOpEnum,
  id: idSchema,
  payload: z.record(z.string(), z.unknown()).optional(),
  clientVersion: z.number().int().optional(),
});
export type SyncMutation = z.infer<typeof syncMutationSchema>;

export const syncPushRequestSchema = z.object({
  mutations: z.array(syncMutationSchema).min(1).max(500),
});
export type SyncPushRequest = z.infer<typeof syncPushRequestSchema>;

export const syncConflictSchema = z.object({
  resource: syncResourceEnum,
  id: idSchema,
  reason: z.enum(['version_mismatch', 'not_found', 'forbidden']),
  serverVersion: z.number().int().optional(),
});
export type SyncConflict = z.infer<typeof syncConflictSchema>;

export const syncPushResponseSchema = z.object({
  applied: z.array(
    z.object({ resource: syncResourceEnum, id: idSchema, version: z.number().int() }),
  ),
  conflicts: z.array(syncConflictSchema),
});
export type SyncPushResponse = z.infer<typeof syncPushResponseSchema>;

export const syncPullResponseSchema = z.object({
  cursor: z.string(),
  changes: z.record(syncResourceEnum, z.array(z.record(z.string(), z.unknown()))),
  serverTime: isoDateSchema,
});
export type SyncPullResponse = z.infer<typeof syncPullResponseSchema>;
