import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ChatMessage } from '@elara/validation';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiGenerateContentResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

/** Thin wrapper around the Gemini REST API — deliberately a raw `fetch` call rather than
 * pulling in a client SDK, matching this codebase's preference for small hand-rolled HTTP
 * clients (see apps/mobile/src/lib/api-client.ts) over heavier dependencies. */
@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);

  constructor(private readonly config: ConfigService) {}

  async generateReply(systemInstruction: string, messages: ChatMessage[]): Promise<string> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('AI assistant is not configured on this server');
    }
    const model = this.config.get<string>('GEMINI_MODEL') ?? DEFAULT_MODEL;

    const requestBody = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    };

    let res: Response;
    try {
      res = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    } catch (err) {
      this.logger.error('Gemini request failed', err instanceof Error ? err.stack : String(err));
      throw new BadGatewayException('Could not reach the AI assistant. Try again in a moment.');
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      this.logger.error(`Gemini API error ${res.status}: ${detail}`);
      throw new BadGatewayException('The AI assistant had trouble responding. Try again.');
    }

    const json = (await res.json()) as GeminiGenerateContentResponse;
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    if (!text.trim()) {
      throw new BadGatewayException('The AI assistant returned an empty response.');
    }
    return text.trim();
  }
}
