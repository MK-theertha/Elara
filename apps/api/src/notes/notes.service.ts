import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { CreateNoteInput, NoteDto, NoteListQuery, UpdateNoteInput } from '@elara/validation';
import { PrismaService } from '../prisma/prisma.service';
import { toNoteDto } from './notes.serializer';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOwned(userId: string, id: string, opts: { deleted?: boolean } = {}) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId, deletedAt: opts.deleted ? { not: null } : null },
    });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async create(userId: string, input: CreateNoteInput): Promise<NoteDto> {
    const note = await this.prisma.note.create({
      data: {
        userId,
        title: input.title,
        body: input.body,
        type: input.type,
        checklist: input.checklist,
        tags: input.tags,
        category: input.category,
      },
    });
    return toNoteDto(note);
  }

  async list(userId: string, query: NoteListQuery): Promise<NoteDto[]> {
    const where: Prisma.NoteWhereInput = {
      userId,
      deletedAt: null,
      // Hide archived notes unless the caller explicitly asks for them.
      archived: query.archived ?? false,
    };

    if (query.pinned !== undefined) where.pinned = query.pinned;
    if (query.tag) where.tags = { has: query.tag };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { body: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const notes = await this.prisma.note.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });
    return notes.map(toNoteDto);
  }

  async getById(userId: string, id: string): Promise<NoteDto> {
    const note = await this.findOwned(userId, id);
    return toNoteDto(note);
  }

  async update(userId: string, id: string, input: UpdateNoteInput): Promise<NoteDto> {
    await this.findOwned(userId, id);
    const note = await this.prisma.note.update({
      where: { id },
      data: { ...input, version: { increment: 1 } },
    });
    return toNoteDto(note);
  }

  async softDelete(userId: string, id: string): Promise<void> {
    await this.findOwned(userId, id);
    await this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date(), version: { increment: 1 } },
    });
  }

  async restore(userId: string, id: string): Promise<NoteDto> {
    await this.findOwned(userId, id, { deleted: true });
    const note = await this.prisma.note.update({
      where: { id },
      data: { deletedAt: null, version: { increment: 1 } },
    });
    return toNoteDto(note);
  }
}
