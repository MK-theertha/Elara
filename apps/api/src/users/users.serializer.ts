import type { User } from '@prisma/client';
import type { UserDto } from '@elara/validation';

/** Strips server-only fields (passwordHash) before a User ever reaches a response. */
export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    timezone: user.timezone,
    currency: user.currency,
    themeMode: user.themeMode as UserDto['themeMode'],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
