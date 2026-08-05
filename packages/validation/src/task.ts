import { z } from 'zod';
import {
  idSchema,
  isoDateSchema,
  priorityEnum,
  recurrenceFreqEnum,
  taskStatusEnum,
} from './common';

export const subtaskSchema = z.object({
  id: idSchema,
  taskId: idSchema,
  title: z.string().min(1).max(200),
  completed: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type SubtaskDto = z.infer<typeof subtaskSchema>;

export const createSubtaskSchema = z.object({
  title: z.string().min(1).max(200),
  sortOrder: z.number().int().optional(),
});
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;

export const updateSubtaskSchema = createSubtaskSchema.partial().extend({
  completed: z.boolean().optional(),
});
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;

export const taskSchema = z.object({
  id: idSchema,
  userId: idSchema,
  title: z.string().min(1).max(200),
  notes: z.string().max(5000).nullable(),
  status: taskStatusEnum,
  priority: priorityEnum,
  dueDate: isoDateSchema.nullable(),
  category: z.string().max(50).nullable(),
  recurrence: recurrenceFreqEnum,
  parentTaskId: idSchema.nullable(),
  subtasks: z.array(subtaskSchema).optional(),
  version: z.number().int(),
  deletedAt: isoDateSchema.nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type TaskDto = z.infer<typeof taskSchema>;

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(5000).optional(),
  priority: priorityEnum.default('MEDIUM'),
  dueDate: isoDateSchema.optional(),
  category: z.string().max(50).optional(),
  recurrence: recurrenceFreqEnum.default('NONE'),
  subtasks: z.array(createSubtaskSchema).optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.omit({ subtasks: true }).partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskListQuerySchema = z.object({
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  category: z.string().optional(),
  view: z.enum(['today', 'upcoming', 'completed', 'all']).optional(),
  sort: z.string().optional(),
});
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
