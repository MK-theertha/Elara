import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  updateUserPreferencesSchema,
  updateUserSchema,
  type UpdateUserInput,
  type UpdateUserPreferencesInput,
  type UserDto,
} from '@elara/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import type { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserDto> {
    return this.usersService.getById(user.id);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateUserSchema)) body: UpdateUserInput,
  ): Promise<UserDto> {
    return this.usersService.update(user.id, body);
  }

  @Patch('me/preferences')
  updatePreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateUserPreferencesSchema)) body: UpdateUserPreferencesInput,
  ): Promise<UserDto> {
    return this.usersService.update(user.id, body);
  }
}
