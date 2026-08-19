import { Injectable } from '@nestjs/common';
import type { AiChatRequest, AiChatResponse } from '@elara/validation';
import { TasksService } from '../tasks/tasks.service';
import { EventsService } from '../events/events.service';
import { NotesService } from '../notes/notes.service';
import { GeminiClient } from './gemini.client';

const NOTE_PREVIEW_LENGTH = 200;

@Injectable()
export class AiService {
  constructor(
    private readonly gemini: GeminiClient,
    private readonly tasksService: TasksService,
    private readonly eventsService: EventsService,
    private readonly notesService: NotesService,
  ) {}

  async chat(userId: string, input: AiChatRequest): Promise<AiChatResponse> {
    const systemInstruction = await this.buildSystemInstruction(userId);
    const reply = await this.gemini.generateReply(systemInstruction, input.messages);
    return { reply };
  }

  /** Read-only context assembled fresh per request — the assistant never sees more than
   * what the current user is already entitled to via the normal REST endpoints, and it
   * cannot take actions; it can only describe what it's given here. */
  private async buildSystemInstruction(userId: string): Promise<string> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const [todayTasks, upcomingTasks, todayEvents, pinnedNotes] = await Promise.all([
      this.tasksService.list(userId, { view: 'today' }),
      this.tasksService.list(userId, { view: 'upcoming' }),
      this.eventsService.list(userId, {
        from: startOfToday.toISOString(),
        to: endOfToday.toISOString(),
      }),
      this.notesService.list(userId, { pinned: true }),
    ]);

    const lines = [
      "You are Elara's AI assistant — a calm, capable helper for the user's tasks, calendar, " +
        'and notes.',
      'Answer using ONLY the context below. If something is not covered by it, say you do not ' +
        'have that information rather than guessing.',
      'Be concise and conversational, and reply in plain text — no markdown formatting.',
      '',
      `Today's date: ${now.toDateString()}`,
      '',
      "Today's tasks:",
      formatList(
        todayTasks.map((t) => `${t.title}${t.dueDate ? ` (due ${t.dueDate})` : ''} [${t.status}]`),
      ),
      '',
      'Upcoming tasks:',
      formatList(
        upcomingTasks
          .slice(0, 10)
          .map((t) => `${t.title}${t.dueDate ? ` (due ${t.dueDate})` : ''}`),
      ),
      '',
      "Today's events:",
      formatList(
        todayEvents.map(
          (e) => `${e.title} (${e.startAt} – ${e.endAt})${e.location ? ` at ${e.location}` : ''}`,
        ),
      ),
      '',
      'Pinned notes:',
      formatList(
        pinnedNotes.map(
          (n) => `${n.title}${n.body ? `: ${n.body.slice(0, NOTE_PREVIEW_LENGTH)}` : ''}`,
        ),
      ),
    ];

    return lines.join('\n');
  }
}

function formatList(items: string[]): string {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : '(none)';
}
