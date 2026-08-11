import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  CreateEventInput,
  EventDto,
  EventListQuery,
  UpdateEventInput,
} from '@elara/validation';
import { PrismaService } from '../prisma/prisma.service';
import { toEventDto } from './events.serializer';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOwned(userId: string, id: string, opts: { deleted?: boolean } = {}) {
    const event = await this.prisma.event.findFirst({
      where: { id, userId, deletedAt: opts.deleted ? { not: null } : null },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(userId: string, input: CreateEventInput): Promise<EventDto> {
    const event = await this.prisma.event.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        startAt: input.startAt,
        endAt: input.endAt,
        location: input.location,
        category: input.category,
        recurrence: input.recurrence,
      },
    });
    return toEventDto(event);
  }

  async list(userId: string, query: EventListQuery): Promise<EventDto[]> {
    const where: Prisma.EventWhereInput = { userId, deletedAt: null };

    // Range filter is an overlap check, not a strict start-within-range check, so a
    // multi-day event that merely spans into the requested window still shows up.
    if (query.from || query.to) {
      if (query.to) where.startAt = { lte: new Date(query.to) };
      if (query.from) where.endAt = { gte: new Date(query.from) };
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: { startAt: 'asc' },
    });
    return events.map(toEventDto);
  }

  async getById(userId: string, id: string): Promise<EventDto> {
    const event = await this.findOwned(userId, id);
    return toEventDto(event);
  }

  async update(userId: string, id: string, input: UpdateEventInput): Promise<EventDto> {
    await this.findOwned(userId, id);
    const event = await this.prisma.event.update({
      where: { id },
      data: { ...input, version: { increment: 1 } },
    });
    return toEventDto(event);
  }

  async softDelete(userId: string, id: string): Promise<void> {
    await this.findOwned(userId, id);
    await this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date(), version: { increment: 1 } },
    });
  }

  async restore(userId: string, id: string): Promise<EventDto> {
    await this.findOwned(userId, id, { deleted: true });
    const event = await this.prisma.event.update({
      where: { id },
      data: { deletedAt: null, version: { increment: 1 } },
    });
    return toEventDto(event);
  }
}
