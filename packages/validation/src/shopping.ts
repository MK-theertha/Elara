import { z } from 'zod';
import { idSchema, isoDateSchema, shoppingCategoryEnum } from './common';

export const shoppingItemSchema = z.object({
  id: idSchema,
  listId: idSchema,
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  category: z.string().max(50).nullable(),
  notes: z.string().max(500).nullable(),
  purchased: z.boolean(),
  sortOrder: z.number().int(),
  deletedAt: isoDateSchema.nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type ShoppingItemDto = z.infer<typeof shoppingItemSchema>;

export const createShoppingItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive().default(1),
  category: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
});
export type CreateShoppingItemInput = z.infer<typeof createShoppingItemSchema>;

export const updateShoppingItemSchema = createShoppingItemSchema.partial().extend({
  purchased: z.boolean().optional(),
});
export type UpdateShoppingItemInput = z.infer<typeof updateShoppingItemSchema>;

export const shoppingListSchema = z.object({
  id: idSchema,
  userId: idSchema,
  name: z.string().min(1).max(100),
  category: shoppingCategoryEnum,
  items: z.array(shoppingItemSchema).optional(),
  deletedAt: isoDateSchema.nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type ShoppingListDto = z.infer<typeof shoppingListSchema>;

export const createShoppingListSchema = z.object({
  name: z.string().min(1).max(100),
  category: shoppingCategoryEnum.default('CUSTOM'),
});
export type CreateShoppingListInput = z.infer<typeof createShoppingListSchema>;

export const updateShoppingListSchema = createShoppingListSchema.partial();
export type UpdateShoppingListInput = z.infer<typeof updateShoppingListSchema>;
