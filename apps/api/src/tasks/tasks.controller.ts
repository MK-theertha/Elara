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
  createSubtaskSchema,
  createTaskSchema,
  taskListQuerySchema,
  updateSubtaskSchema,
  updateTaskSchema,
  type CreateSubtaskInput,
  type CreateTaskInput,
  type SubtaskDto,
  type TaskDto,
  type TaskListQuery,
  type UpdateSubtaskInput,
  type UpdateTaskInput,
} from '@elara/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(taskListQuerySchema)) query: TaskListQuery,
  ): Promise<TaskDto[]> {
    return this.tasksService.list(user.id, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createTaskSchema)) body: CreateTaskInput,
  ): Promise<TaskDto> {
    return this.tasksService.create(user.id, body);
  }

  @Get(':id')
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskDto> {
    return this.tasksService.getById(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) body: UpdateTaskInput,
  ): Promise<TaskDto> {
    return this.tasksService.update(user.id, id, body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.tasksService.softDelete(user.id, id);
  }

  @Post(':id/complete')
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskDto> {
    return this.tasksService.complete(user.id, id);
  }

  @Post(':id/reopen')
  reopen(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskDto> {
    return this.tasksService.reopen(user.id, id);
  }

  @Post(':id/restore')
  restore(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskDto> {
    return this.tasksService.restore(user.id, id);
  }

  @Get(':id/subtasks')
  listSubtasks(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SubtaskDto[]> {
    return this.tasksService.listSubtasks(user.id, id);
  }

  @Post(':id/subtasks')
  createSubtask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(createSubtaskSchema)) body: CreateSubtaskInput,
  ): Promise<SubtaskDto> {
    return this.tasksService.createSubtask(user.id, id, body);
  }

  @Patch('subtasks/:id')
  updateSubtask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateSubtaskSchema)) body: UpdateSubtaskInput,
  ): Promise<SubtaskDto> {
    return this.tasksService.updateSubtask(user.id, id, body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('subtasks/:id')
  async deleteSubtask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.tasksService.deleteSubtask(user.id, id);
  }
}
