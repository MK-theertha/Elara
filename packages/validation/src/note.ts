import { z } from 'zod';
import { idSchema, isoDateSchema } from './common';

export const noteTypeEnum = z.enum(['text', 'checklist']);
export type NoteType = z.infer<typeof noteTypeEnum>;

export const checklistItemSchema = z.object({
  text: z.string().min(1).max(300),
  checked: z.boolean(),
});
export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export const noteSchema = z.object({
  id: idSchema,
  userId: idSchema,
  title: z.string().min(1).max(200),
  body: z.string().max(20000).nullable(),
  type: noteTypeEnum,
  checklist: z.array(checklistItemSchema).nullable(),
  tags: z.array(z.string().max(30)),
  category: z.string().max(50).nullable(),
  pinned: z.boolean(),
  archived: z.boolean(),
  version: z.number().int(),
  deletedAt: isoDateSchema.nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type NoteDto = z.infer<typeof noteSchema>;

export const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(20000).optional(),
  type: noteTypeEnum.default('text'),
  checklist: z.array(checklistItemSchema).optional(),
  tags: z.array(z.string().max(30)).default([]),
  category: z.string().max(50).optional(),
});
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = createNoteSchema.partial().extend({
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export const noteListQuerySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  pinned: z.coerce.boolean().optional(),
  archived: z.coerce.boolean().optional(),
});
export type NoteListQuery = z.infer<typeof noteListQuerySchema>;
