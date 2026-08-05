import { z } from 'zod';

/**
 * Shared primitives reused across every resource schema. Kept here so a
 * single change (e.g. switching id generation) doesn't need to ripple
 * through every domain file.
 */
export const idSchema = z.string().uuid();
export const isoDateSchema = z.string().datetime({ offset: true });

export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type Priority = z.infer<typeof priorityEnum>;

export const taskStatusEnum = z.enum(['PENDING', 'COMPLETED']);
export type TaskStatus = z.infer<typeof taskStatusEnum>;

export const recurrenceFreqEnum = z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);
export type RecurrenceFreq = z.infer<typeof recurrenceFreqEnum>;

export const paymentMethodEnum = z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER']);
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;

export const expenseCategoryEnum = z.enum([
  'FOOD',
  'TRANSPORT',
  'SHOPPING',
  'BILLS',
  'ENTERTAINMENT',
  'HEALTH',
  'TRAVEL',
  'OTHER',
]);
export type ExpenseCategory = z.infer<typeof expenseCategoryEnum>;

export const shoppingCategoryEnum = z.enum([
  'GROCERIES',
  'HOUSEHOLD',
  'ELECTRONICS',
  'TRAVEL',
  'CUSTOM',
]);
export type ShoppingCategory = z.infer<typeof shoppingCategoryEnum>;

export const themeModeEnum = z.enum(['light', 'dark', 'system']);
export type ThemeMode = z.infer<typeof themeModeEnum>;

/** Cursor-based pagination query, used by /sync and other list-heavy endpoints. */
export const cursorPageQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

/** Offset-based pagination query, used by simple UI list endpoints. */
export const offsetPageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    cursor?: string | null;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
