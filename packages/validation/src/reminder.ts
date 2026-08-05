import { z } from 'zod';
import { idSchema, isoDateSchema } from './common';

export const reminderSchema = z.object({
  id: idSchema,
  userId: idSchema,
  taskId: idSchema.nullable(),
  eventId: idSchema.nullable(),
  remindAt: isoDateSchema,
  message: z.string().max(200).nullable(),
  fired: z.boolean(),
  deletedAt: isoDateSchema.nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type ReminderDto = z.infer<typeof reminderSchema>;

export const createReminderSchema = z
  .object({
    taskId: idSchema.optional(),
    eventId: idSchema.optional(),
    remindAt: isoDateSchema,
    message: z.string().max(200).optional(),
  })
  .refine((r) => Boolean(r.taskId) !== Boolean(r.eventId), {
    message: 'exactly one of taskId or eventId must be set',
  });
export type CreateReminderInput = z.infer<typeof createReminderSchema>;

export const updateReminderSchema = z.object({
  remindAt: isoDateSchema.optional(),
  message: z.string().max(200).optional(),
});
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
