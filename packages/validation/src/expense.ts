import { z } from 'zod';
import { expenseCategoryEnum, idSchema, isoDateSchema, paymentMethodEnum } from './common';

export const expenseSchema = z.object({
  id: idSchema,
  userId: idSchema,
  amount: z.number().positive(),
  currency: z.string().length(3),
  category: expenseCategoryEnum,
  description: z.string().max(500).nullable(),
  paymentMethod: paymentMethodEnum,
  occurredAt: isoDateSchema,
  version: z.number().int(),
  deletedAt: isoDateSchema.nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type ExpenseDto = z.infer<typeof expenseSchema>;

export const createExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  category: expenseCategoryEnum,
  description: z.string().max(500).optional(),
  paymentMethod: paymentMethodEnum.default('CASH'),
  occurredAt: isoDateSchema,
});
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial();
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export const expenseListQuerySchema = z.object({
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  category: expenseCategoryEnum.optional(),
});
export type ExpenseListQuery = z.infer<typeof expenseListQuerySchema>;

export const expenseSummarySchema = z.object({
  today: z.number(),
  thisWeek: z.number(),
  thisMonth: z.number(),
});
export type ExpenseSummaryDto = z.infer<typeof expenseSummarySchema>;

export const expenseByCategorySchema = z.array(
  z.object({
    category: expenseCategoryEnum,
    total: z.number(),
  }),
);
export type ExpenseByCategoryDto = z.infer<typeof expenseByCategorySchema>;
