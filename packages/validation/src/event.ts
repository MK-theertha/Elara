import { z } from 'zod';
import { idSchema, isoDateSchema, recurrenceFreqEnum } from './common';

export const eventSchema = z
  .object({
    id: idSchema,
    userId: idSchema,
    title: z.string().min(1).max(200),
    description: z.string().max(5000).nullable(),
    startAt: isoDateSchema,
    endAt: isoDateSchema,
    location: z.string().max(200).nullable(),
    category: z.string().max(50).nullable(),
    recurrence: recurrenceFreqEnum,
    externalId: z.string().nullable(),
    version: z.number().int(),
    deletedAt: isoDateSchema.nullable(),
    createdAt: isoDateSchema,
    updatedAt: isoDateSchema,
  })
  .refine((event) => new Date(event.endAt) >= new Date(event.startAt), {
    message: 'endAt must not be before startAt',
    path: ['endAt'],
  });
export type EventDto = z.infer<typeof eventSchema>;

export const createEventSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    startAt: isoDateSchema,
    endAt: isoDateSchema,
    location: z.string().max(200).optional(),
    category: z.string().max(50).optional(),
    recurrence: recurrenceFreqEnum.default('NONE'),
  })
  .refine((event) => new Date(event.endAt) >= new Date(event.startAt), {
    message: 'endAt must not be before startAt',
    path: ['endAt'],
  });
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  startAt: isoDateSchema.optional(),
  endAt: isoDateSchema.optional(),
  location: z.string().max(200).optional(),
  category: z.string().max(50).optional(),
  recurrence: recurrenceFreqEnum.optional(),
});
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const eventListQuerySchema = z.object({
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  view: z.enum(['day', 'week', 'month']).optional(),
});
export type EventListQuery = z.infer<typeof eventListQuerySchema>;
