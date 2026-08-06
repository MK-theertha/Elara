import type {
  CreateSubtaskInput,
  CreateTaskInput,
  SubtaskDto,
  TaskDto,
  TaskListQuery,
  UpdateSubtaskInput,
  UpdateTaskInput,
} from '@elara/validation';
import { api } from '@/lib/api-client';

function toQueryString(query: TaskListQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const tasksApi = {
  list: (query: TaskListQuery = {}) => api.get<TaskDto[]>(`/tasks${toQueryString(query)}`),
  create: (input: CreateTaskInput) => api.post<TaskDto>('/tasks', input),
  getById: (id: string) => api.get<TaskDto>(`/tasks/${id}`),
  update: (id: string, input: UpdateTaskInput) => api.patch<TaskDto>(`/tasks/${id}`, input),
  delete: (id: string) => api.delete<void>(`/tasks/${id}`),
  complete: (id: string) => api.post<TaskDto>(`/tasks/${id}/complete`),
  reopen: (id: string) => api.post<TaskDto>(`/tasks/${id}/reopen`),
  restore: (id: string) => api.post<TaskDto>(`/tasks/${id}/restore`),
  createSubtask: (taskId: string, input: CreateSubtaskInput) =>
    api.post<SubtaskDto>(`/tasks/${taskId}/subtasks`, input),
  updateSubtask: (subtaskId: string, input: UpdateSubtaskInput) =>
    api.patch<SubtaskDto>(`/tasks/subtasks/${subtaskId}`, input),
  deleteSubtask: (subtaskId: string) => api.delete<void>(`/tasks/subtasks/${subtaskId}`),
};
