/**
 * Domain types are inferred from @elara/validation's Zod schemas — the schema
 * is the single source of truth, this module just gives consumers a
 * validation-free import path for the plain TS shapes.
 */
export type {
  ApiError,
  ApiResponse,
  ApiSuccess,
  ExpenseCategory,
  PaymentMethod,
  Priority,
  RecurrenceFreq,
  ShoppingCategory,
  TaskStatus,
  ThemeMode,
} from '@elara/validation';

export type { UserDto } from '@elara/validation';
export type { TaskDto, SubtaskDto } from '@elara/validation';
export type { EventDto } from '@elara/validation';
export type { ReminderDto } from '@elara/validation';
export type { NoteDto, NoteType, ChecklistItem } from '@elara/validation';
export type { ExpenseDto, ExpenseSummaryDto, ExpenseByCategoryDto } from '@elara/validation';
export type { ShoppingListDto, ShoppingItemDto } from '@elara/validation';
export type {
  SyncResource,
  SyncOp,
  SyncMutation,
  SyncConflict,
  SyncPullResponse,
  SyncPushResponse,
} from '@elara/validation';
