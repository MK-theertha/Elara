import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { aiChatRequestSchema, type AiChatRequest, type AiChatResponse } from '@elara/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // Gemini calls cost real money per request — a tighter cap than the global
  // 120/min default keeps a runaway client from running up the bill.
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('chat')
  chat(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(aiChatRequestSchema)) body: AiChatRequest,
  ): Promise<AiChatResponse> {
    return this.aiService.chat(user.id, body);
  }
}
