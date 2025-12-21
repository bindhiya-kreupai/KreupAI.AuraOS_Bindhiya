/**
 * Custom Error Classes
 *
 * Provides structured error handling with proper error codes and metadata
 */

/**
 * Base Application Error
 */
export class ApplicationError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 * Thrown when input validation fails
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', true, context);
  }
}

/**
 * Authentication Error
 * Thrown when authentication fails
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, context);
  }
}

/**
 * Authorization Error
 * Thrown when user lacks required permissions
 */
export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, context);
  }
}

/**
 * Not Found Error
 * Thrown when a resource is not found
 */
export class NotFoundError extends ApplicationError {
  constructor(resource: string = 'Resource', context?: Record<string, any>) {
    super(`${resource} not found`, 404, 'NOT_FOUND', true, context);
  }
}

/**
 * Conflict Error
 * Thrown when a resource conflict occurs (e.g., duplicate email)
 */
export class ConflictError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 409, 'CONFLICT', true, context);
  }
}

/**
 * Rate Limit Error
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends ApplicationError {
  constructor(message: string = 'Rate limit exceeded', context?: Record<string, any>) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true, context);
  }
}

/**
 * Database Error
 * Thrown when database operations fail
 */
export class DatabaseError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 500, 'DATABASE_ERROR', true, context);
  }
}

/**
 * External Service Error
 * Thrown when external API calls fail
 */
export class ExternalServiceError extends ApplicationError {
  constructor(service: string, message: string, context?: Record<string, any>) {
    super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', true, context);
  }
}

/**
 * Tenant Isolation Error
 * Thrown when tenant isolation is violated
 */
export class TenantIsolationError extends ApplicationError {
  constructor(message: string = 'Tenant isolation violation', context?: Record<string, any>) {
    super(message, 403, 'TENANT_ISOLATION_ERROR', true, context);
  }
}

/**
 * Business Rule Error
 * Thrown when business rules are violated
 */
export class BusinessRuleError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION', true, context);
  }
}

/**
 * Check if error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof ApplicationError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Error serializer for API responses
 */
export function serializeError(error: Error) {
  if (error instanceof ApplicationError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(error.context && { context: error.context }),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
    };
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
    };
  }

  // In development, show full error details
  return {
    success: false,
    error: {
      message: error.message,
      code: 'INTERNAL_ERROR',
      stack: error.stack,
    },
  };
}

/**
 * Get HTTP status code from error
 */
export function getErrorStatusCode(error: Error): number {
  if (error instanceof ApplicationError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Error handler utility for async route handlers
 *
 * @example
 * export const GET = asyncHandler(async (request) => {
 *   const data = await someOperation();
 *   return NextResponse.json({ data });
 * });
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      throw error; // Let global error handler catch it
    }
  };
}
