import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  CreateSubtaskInput,
  CreateTaskInput,
  SubtaskDto,
  TaskDto,
  TaskListQuery,
  UpdateSubtaskInput,
  UpdateTaskInput,
} from '@elara/validation';
import type { PrismaService } from '../prisma/prisma.service';
import { toTaskDto, toSubtaskDto } from './tasks.serializer';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOwned(userId: string, id: string, opts: { deleted?: boolean } = {}) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId, deletedAt: opts.deleted ? { not: null } : null },
      include: { subtasks: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(userId: string, input: CreateTaskInput): Promise<TaskDto> {
    const task = await this.prisma.task.create({
      data: {
        userId,
        title: input.title,
        notes: input.notes,
        priority: input.priority,
        dueDate: input.dueDate,
        category: input.category,
        recurrence: input.recurrence,
        subtasks: input.subtasks
          ? {
              create: input.subtasks.map((subtask, index) => ({
                title: subtask.title,
                sortOrder: subtask.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: { subtasks: true },
    });
    return toTaskDto(task);
  }

  async list(userId: string, query: TaskListQuery): Promise<TaskDto[]> {
    const where: Prisma.TaskWhereInput = { userId, deletedAt: null };

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.category) where.category = query.category;

    if (query.view === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      where.status = 'PENDING';
      // Undated tasks default into Today so they aren't hidden from every view.
      where.OR = [{ dueDate: null }, { dueDate: { gte: start, lte: end } }];
    } else if (query.view === 'upcoming') {
      where.status = 'PENDING';
      where.dueDate = { gt: new Date() };
    } else if (query.view === 'completed') {
      where.status = 'COMPLETED';
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: { subtasks: true },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
    return tasks.map(toTaskDto);
  }

  async getById(userId: string, id: string): Promise<TaskDto> {
    const task = await this.findOwned(userId, id);
    return toTaskDto(task);
  }

  async update(userId: string, id: string, input: UpdateTaskInput): Promise<TaskDto> {
    await this.findOwned(userId, id);
    const task = await this.prisma.task.update({
      where: { id },
      data: { ...input, version: { increment: 1 } },
      include: { subtasks: true },
    });
    return toTaskDto(task);
  }

  async softDelete(userId: string, id: string): Promise<void> {
    await this.findOwned(userId, id);
    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date(), version: { increment: 1 } },
    });
  }

  async complete(userId: string, id: string): Promise<TaskDto> {
    await this.findOwned(userId, id);
    const task = await this.prisma.task.update({
      where: { id },
      data: { status: 'COMPLETED', version: { increment: 1 } },
      include: { subtasks: true },
    });
    return toTaskDto(task);
  }

  async reopen(userId: string, id: string): Promise<TaskDto> {
    await this.findOwned(userId, id);
    const task = await this.prisma.task.update({
      where: { id },
      data: { status: 'PENDING', version: { increment: 1 } },
      include: { subtasks: true },
    });
    return toTaskDto(task);
  }

  async restore(userId: string, id: string): Promise<TaskDto> {
    await this.findOwned(userId, id, { deleted: true });
    const task = await this.prisma.task.update({
      where: { id },
      data: { deletedAt: null, version: { increment: 1 } },
      include: { subtasks: true },
    });
    return toTaskDto(task);
  }

  async listSubtasks(userId: string, taskId: string): Promise<SubtaskDto[]> {
    const task = await this.findOwned(userId, taskId);
    return task.subtasks.map(toSubtaskDto);
  }

  async createSubtask(
    userId: string,
    taskId: string,
    input: CreateSubtaskInput,
  ): Promise<SubtaskDto> {
    const task = await this.findOwned(userId, taskId);
    const subtask = await this.prisma.subtask.create({
      data: {
        taskId,
        title: input.title,
        sortOrder: input.sortOrder ?? task.subtasks.length,
      },
    });
    return toSubtaskDto(subtask);
  }

  private async findOwnedSubtask(userId: string, subtaskId: string) {
    const subtask = await this.prisma.subtask.findFirst({
      where: { id: subtaskId, task: { userId } },
    });
    if (!subtask) throw new NotFoundException('Subtask not found');
    return subtask;
  }

  async updateSubtask(
    userId: string,
    subtaskId: string,
    input: UpdateSubtaskInput,
  ): Promise<SubtaskDto> {
    await this.findOwnedSubtask(userId, subtaskId);
    const subtask = await this.prisma.subtask.update({
      where: { id: subtaskId },
      data: input,
    });
    return toSubtaskDto(subtask);
  }

  async deleteSubtask(userId: string, subtaskId: string): Promise<void> {
    await this.findOwnedSubtask(userId, subtaskId);
    await this.prisma.subtask.delete({ where: { id: subtaskId } });
  }
}
