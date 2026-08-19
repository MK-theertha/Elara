import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  createNoteSchema,
  noteListQuerySchema,
  updateNoteSchema,
  type CreateNoteInput,
  type NoteDto,
  type NoteListQuery,
  type UpdateNoteInput,
} from '@elara/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(noteListQuerySchema)) query: NoteListQuery,
  ): Promise<NoteDto[]> {
    return this.notesService.list(user.id, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createNoteSchema)) body: CreateNoteInput,
  ): Promise<NoteDto> {
    return this.notesService.create(user.id, body);
  }

  @Get(':id')
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteDto> {
    return this.notesService.getById(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateNoteSchema)) body: UpdateNoteInput,
  ): Promise<NoteDto> {
    return this.notesService.update(user.id, id, body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.notesService.softDelete(user.id, id);
  }

  @Post(':id/restore')
  restore(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteDto> {
    return this.notesService.restore(user.id, id);
  }
}
