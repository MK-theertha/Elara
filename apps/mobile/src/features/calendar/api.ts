import type {
  CreateEventInput,
  EventDto,
  EventListQuery,
  UpdateEventInput,
} from '@elara/validation';
import { api } from '@/lib/api-client';

function toQueryString(query: EventListQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const eventsApi = {
  list: (query: EventListQuery = {}) => api.get<EventDto[]>(`/events${toQueryString(query)}`),
  create: (input: CreateEventInput) => api.post<EventDto>('/events', input),
  getById: (id: string) => api.get<EventDto>(`/events/${id}`),
  update: (id: string, input: UpdateEventInput) => api.patch<EventDto>(`/events/${id}`, input),
  delete: (id: string) => api.delete<void>(`/events/${id}`),
  restore: (id: string) => api.post<EventDto>(`/events/${id}/restore`),
};
