import type { AiChatRequest, AiChatResponse } from '@elara/validation';
import { api } from '@/lib/api-client';

export const aiApi = {
  chat: (input: AiChatRequest) => api.post<AiChatResponse>('/ai/chat', input),
};
