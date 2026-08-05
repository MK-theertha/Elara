import { UnprocessableEntityException, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/**
 * Validates a request body/query against a Zod schema and returns the
 * parsed (and type-coerced) value. Thrown errors surface as 422s with
 * field-level details via AllExceptionsFilter's extractDetails().
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new UnprocessableEntityException({
        message: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      });
    }
    return result.data;
  }
}
