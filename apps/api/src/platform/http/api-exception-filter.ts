import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiError } from '@omniva/schemas';
import type { Response } from 'express';
import { DomainError, type DomainErrorKind } from './domain-error.js';

const STATUS_BY_KIND: Readonly<Record<DomainErrorKind, HttpStatus>> = {
  'invalid-input': HttpStatus.BAD_REQUEST,
  unauthenticated: HttpStatus.UNAUTHORIZED,
  forbidden: HttpStatus.FORBIDDEN,
  'not-found': HttpStatus.NOT_FOUND,
  conflict: HttpStatus.CONFLICT,
};

/** Maps every error to the one ApiError shape (CODING_STANDARDS §4). */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const [status, body] = this.toApiError(exception);
    response.status(status).json(body);
  }

  private toApiError(exception: unknown): readonly [number, ApiError] {
    if (exception instanceof DomainError) {
      return [STATUS_BY_KIND[exception.kind], { code: exception.code, message: exception.message }];
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return [status, { code: HttpStatus[status] ?? 'HTTP_ERROR', message: exception.message }];
    }
    this.logger.error(`Unhandled ${errorName(exception)}`, stackFrames(exception));
    return [
      HttpStatus.INTERNAL_SERVER_ERROR,
      { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side.' },
    ];
  }
}

function errorName(exception: unknown): string {
  return exception instanceof Error ? exception.name : typeof exception;
}

/**
 * The stack without its first line, which repeats the error's message: messages can quote
 * user input, and logs carry technical detail only (CODING_STANDARDS §7).
 */
function stackFrames(exception: unknown): string | undefined {
  if (!(exception instanceof Error) || exception.stack === undefined) return undefined;
  return exception.stack.split('\n').slice(1).join('\n');
}
