import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { EventsModule } from '../events/events.module';
import { NotesModule } from '../notes/notes.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiClient } from './gemini.client';

@Module({
  imports: [TasksModule, EventsModule, NotesModule],
  controllers: [AiController],
  providers: [AiService, GeminiClient],
})
export class AiModule {}
