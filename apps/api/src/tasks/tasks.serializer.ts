import type { Subtask, Task } from '@prisma/client';
import type { SubtaskDto, TaskDto } from '@elara/validation';

export function toSubtaskDto(subtask: Subtask): SubtaskDto {
  return {
    id: subtask.id,
    taskId: subtask.taskId,
    title: subtask.title,
    completed: subtask.completed,
    sortOrder: subtask.sortOrder,
    createdAt: subtask.createdAt.toISOString(),
    updatedAt: subtask.updatedAt.toISOString(),
  };
}

export function toTaskDto(task: Task & { subtasks?: Subtask[] }): TaskDto {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    notes: task.notes,
    status: task.status as TaskDto['status'],
    priority: task.priority as TaskDto['priority'],
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    category: task.category,
    recurrence: task.recurrence as TaskDto['recurrence'],
    parentTaskId: task.parentTaskId,
    subtasks: task.subtasks ? task.subtasks.map(toSubtaskDto) : undefined,
    version: task.version,
    deletedAt: task.deletedAt ? task.deletedAt.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
