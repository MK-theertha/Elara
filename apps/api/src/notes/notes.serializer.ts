import type { Note } from '@prisma/client';
import type { ChecklistItem, NoteDto } from '@elara/validation';

export function toNoteDto(note: Note): NoteDto {
  return {
    id: note.id,
    userId: note.userId,
    title: note.title,
    body: note.body,
    type: note.type as NoteDto['type'],
    checklist: note.checklist as ChecklistItem[] | null,
    tags: note.tags,
    category: note.category,
    pinned: note.pinned,
    archived: note.archived,
    version: note.version,
    deletedAt: note.deletedAt ? note.deletedAt.toISOString() : null,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}
