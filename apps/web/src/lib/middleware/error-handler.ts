import { NextResponse } from 'next/server';
import { z } from 'zod';
import logger from '@/lib/logger';
import {
  ApplicationError,
  isOperationalError,
  serializeError,
  getErrorStatusCode,
} from '@/lib/errors';

/**
 * Global Error Handler Middleware
 * Catches and formats errors for API responses
 */
export function handleError(error: Error | unknown): NextResponse {
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    logger.warn({ error: error.errors }, 'Validation error');
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      },
      { status: 400 }
    );
  }

  // Handle custom application errors
  if (error instanceof ApplicationError) {
    const statusCode = error.statusCode;

    // Log based on severity
    if (statusCode >= 500) {
      logger.error({ error, context: error.context }, error.message);
    } else if (statusCode >= 400) {
      logger.warn({ error, context: error.context }, error.message);
    }

    return NextResponse.json(serializeError(error), { status: statusCode });
  }

  // Handle unknown errors
  const err = error as Error;

  // Non-operational errors are serious - log with full details
  if (!isOperationalError(err)) {
    logger.error(
      {
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
      },
      'Unexpected error occurred'
    );
  }

  // Don't expose internal details in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }

  // In development, show full error
  return NextResponse.json(
    {
      success: false,
      error: {
        message: err.message || 'Unknown error',
        code: 'INTERNAL_ERROR',
        stack: err.stack,
      },
    },
    { status: 500 }
  );
}

/**
 * Async handler wrapper for API routes
 * Automatically catches errors and passes them to error handler
 *
 * @example
 * export const GET = withErrorHandling(async (request) => {
 *   const data = await fetchData();
 *   return NextResponse.json({ data });
 * });
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): (...args: Parameters<T>) => Promise<NextResponse> {
  return async (...args: Parameters<T>): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch {
      return handleError(error);
    }
  };
}

/**
 * Enhanced error handler with request logging
 */
export function withErrorHandlingAndLogging<
  T extends (request: any, ...args: any[]) => Promise<NextResponse>
>(handler: T): (...args: Parameters<T>) => Promise<NextResponse> {
  return async (...args: Parameters<T>): Promise<NextResponse> => {
    const startTime = Date.now();
    const request = args[0];

    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;

      // Log successful requests
      logger.info(
        {
          method: request.method,
          url: request.url,
          duration,
          status: response.status,
        },
        `${request.method} ${request.url} ${response.status} - ${duration}ms`
      );

      return response;
    } catch {
      const duration = Date.now() - startTime;

      // Log failed requests
      logger.error(
        {
          method: request.method,
          url: request.url,
          duration,
          error,
        },
        `${request.method} ${request.url} failed after ${duration}ms`
      );

      return handleError(error);
    }
  };
}
