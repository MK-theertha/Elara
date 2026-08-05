import { z } from 'zod';
import { idSchema, isoDateSchema, themeModeEnum } from './common';

export const userSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  name: z.string().nullable(),
  timezone: z.string(),
  currency: z.string().length(3),
  themeMode: themeModeEnum,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type UserDto = z.infer<typeof userSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateUserPreferencesSchema = z.object({
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
  themeMode: themeModeEnum.optional(),
});
export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;
