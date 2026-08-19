import { z } from 'zod';

export const chatRoleEnum = z.enum(['user', 'assistant']);
export type ChatRole = z.infer<typeof chatRoleEnum>;

export const chatMessageSchema = z.object({
  role: chatRoleEnum,
  content: z.string().min(1).max(4000),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const aiChatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40),
});
export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;

export const aiChatResponseSchema = z.object({
  reply: z.string(),
});
export type AiChatResponse = z.infer<typeof aiChatResponseSchema>;
