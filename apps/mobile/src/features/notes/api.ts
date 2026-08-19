import type { CreateNoteInput, NoteDto, NoteListQuery, UpdateNoteInput } from '@elara/validation';
import { api } from '@/lib/api-client';

function toQueryString(query: NoteListQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const notesApi = {
  list: (query: NoteListQuery = {}) => api.get<NoteDto[]>(`/notes${toQueryString(query)}`),
  create: (input: CreateNoteInput) => api.post<NoteDto>('/notes', input),
  getById: (id: string) => api.get<NoteDto>(`/notes/${id}`),
  update: (id: string, input: UpdateNoteInput) => api.patch<NoteDto>(`/notes/${id}`, input),
  delete: (id: string) => api.delete<void>(`/notes/${id}`),
  restore: (id: string) => api.post<NoteDto>(`/notes/${id}/restore`),
};
