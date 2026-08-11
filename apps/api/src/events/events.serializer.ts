import type { Event } from '@prisma/client';
import type { EventDto } from '@elara/validation';

export function toEventDto(event: Event): EventDto {
  return {
    id: event.id,
    userId: event.userId,
    title: event.title,
    description: event.description,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    location: event.location,
    category: event.category,
    recurrence: event.recurrence as EventDto['recurrence'],
    externalId: event.externalId,
    version: event.version,
    deletedAt: event.deletedAt ? event.deletedAt.toISOString() : null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}
