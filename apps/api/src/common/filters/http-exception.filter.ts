import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import type { ApiError } from '@elara/validation';

/**
 * Normalizes every thrown error (HttpException or otherwise) into the
 * { success: false, error } envelope, and keeps stack traces out of
 * responses/logs for anything that isn't an intentional HttpException.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body: ApiError = {
      success: false,
      error: {
        code: isHttp ? (HttpStatus[status] ?? 'ERROR') : 'INTERNAL_SERVER_ERROR',
        message: isHttp ? extractMessage(exception) : 'An unexpected error occurred',
        details: isHttp ? extractDetails(exception) : undefined,
      },
    };

    if (!isHttp) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json(body);
  }
}

function extractMessage(exception: HttpException): string {
  const response = exception.getResponse();
  if (typeof response === 'string') return response;
  if (typeof response === 'object' && response !== null && 'message' in response) {
    const { message } = response as { message: string | string[] };
    return Array.isArray(message) ? message.join(', ') : message;
  }
  return exception.message;
}

function extractDetails(exception: HttpException): unknown {
  const response = exception.getResponse();
  if (typeof response === 'object' && response !== null && 'message' in response) {
    const { message } = response as { message: unknown };
    return Array.isArray(message) ? message : undefined;
  }
  return undefined;
}
