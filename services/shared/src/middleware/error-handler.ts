/**
 * @module error-handler
 * @description Standardized error handling middleware for AuraOS microservices.
 *              Provides consistent error response shapes across all Fastify services.
 * @project AuraOS Enterprise HCM Platform
 * @section 27 — Microservices Infrastructure
 *
 * Error Code Scheme:
 *   E1xxx — Authentication & Authorization
 *   E2xxx — Validation & Input
 *   E3xxx — Conflict & State
 *   E4xxx — Not Found
 *   E5xxx — Internal Server / Infrastructure
 */

import type { FastifyRequest, FastifyReply, FastifyError } from 'fastify';

// ============================================================================
// ERROR CODE REGISTRY
// ============================================================================

export const ErrorCodes = {
  // Auth (E1xxx)
  E1001: 'UNAUTHORIZED',
  E1002: 'TOKEN_EXPIRED',
  E1003: 'INVALID_TOKEN',
  E1004: 'FORBIDDEN',
  E1005: 'SESSION_REVOKED',

  // Validation (E2xxx)
  E2001: 'VALIDATION_ERROR',
  E2002: 'MISSING_TENANT',
  E2003: 'INVALID_TENANT',
  E2004: 'INVALID_PARAMETER',
  E2005: 'MISSING_REQUIRED_FIELD',

  // Conflict (E3xxx)
  E3001: 'CONFLICT',
  E3002: 'DUPLICATE_RECORD',
  E3003: 'STALE_DATA',
  E3004: 'VERSION_MISMATCH',

  // Not Found (E4xxx)
  E4001: 'NOT_FOUND',
  E4002: 'RESOURCE_DELETED',
  E4003: 'TENANT_NOT_FOUND',

  // Server (E5xxx)
  E5001: 'INTERNAL_SERVER_ERROR',
  E5002: 'DATABASE_ERROR',
  E5003: 'UPSTREAM_SERVICE_ERROR',
  E5004: 'TIMEOUT',
  E5005: 'CIRCUIT_OPEN',
} as const;

export type ErrorCode = keyof typeof ErrorCodes;

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

export class AuraServiceError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'AuraServiceError';
    this.code = code;
    this.statusCode = statusCode ?? statusFromCode(code);
    this.details = details;
  }
}

function statusFromCode(code: ErrorCode): number {
  const prefix = code.slice(0, 2);
  switch (prefix) {
    case 'E1': return parseInt(code.slice(1, 2)) === 4 ? 403 : 401;
    case 'E2': return 400;
    case 'E3': return 409;
    case 'E4': return 404;
    case 'E5': return 500;
    default: return 500;
  }
}

// ============================================================================
// ERROR RESPONSE BUILDER
// ============================================================================

interface ErrorResponse {
  error: {
    code: string;
    type: string;
    message: string;
    details?: unknown;
    path?: string;
    method?: string;
    requestId?: string;
    timestamp: string;
  };
}

function buildErrorResponse(
  code: string,
  type: string,
  message: string,
  req: FastifyRequest,
  details?: unknown,
): ErrorResponse {
  return {
    error: {
      code,
      type,
      message,
      details: process.env.NODE_ENV !== 'production' ? details : undefined,
      path: req.url,
      method: req.method,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    },
  };
}

// ============================================================================
// MAIN ERROR HANDLER
// ============================================================================

/**
 * errorHandler — global Fastify error handler.
 * Maps framework errors and custom AuraServiceErrors to standardized responses.
 */
export function errorHandler(
  err: FastifyError | AuraServiceError | Error,
  req: FastifyRequest,
  reply: FastifyReply,
): void {
  // Log error (in production: use structured logger)
  if (process.env.NODE_ENV !== 'test') {
    req.log?.error({ err, reqId: req.id, url: req.url }, 'Request error');
  }

  // AuraServiceError — already structured
  if (err instanceof AuraServiceError) {
    reply.code(err.statusCode).send(
      buildErrorResponse(err.code, ErrorCodes[err.code], err.message, req, err.details),
    );
    return;
  }

  // Fastify validation error (schema validation)
  const fastifyErr = err as FastifyError;
  if (fastifyErr.statusCode === 400 && fastifyErr.validation) {
    reply.code(400).send(
      buildErrorResponse(
        'E2001',
        ErrorCodes.E2001,
        'Request validation failed',
        req,
        fastifyErr.validation,
      ),
    );
    return;
  }

  // Fastify 404 (route not found — handled by notFoundHandler, but catch here too)
  if (fastifyErr.statusCode === 404) {
    reply.code(404).send(
      buildErrorResponse('E4001', ErrorCodes.E4001, 'Route not found', req),
    );
    return;
  }

  // Database constraint violation (detect by message patterns)
  if (
    err.message?.includes('unique constraint') ||
    err.message?.includes('Unique constraint') ||
    err.message?.includes('duplicate key')
  ) {
    reply.code(409).send(
      buildErrorResponse('E3002', ErrorCodes.E3002, 'A record with these values already exists', req),
    );
    return;
  }

  if (
    err.message?.includes('Record to update not found') ||
    err.message?.includes('Record to delete not found') ||
    err.message?.includes('No record was found')
  ) {
    reply.code(404).send(
      buildErrorResponse('E4001', ErrorCodes.E4001, 'Record not found', req),
    );
    return;
  }

  // Upstream service timeout
  if (err.message?.includes('ETIMEDOUT') || err.message?.includes('timeout')) {
    reply.code(503).send(
      buildErrorResponse('E5004', ErrorCodes.E5004, 'Upstream service timeout', req),
    );
    return;
  }

  // Generic internal server error
  reply.code(500).send(
    buildErrorResponse(
      'E5001',
      ErrorCodes.E5001,
      process.env.NODE_ENV === 'production'
        ? 'An internal error occurred. Please try again or contact support.'
        : err.message ?? 'Unknown error',
      req,
      process.env.NODE_ENV !== 'production'
        ? { stack: err.stack }
        : undefined,
    ),
  );
}

// ============================================================================
// 404 HANDLER
// ============================================================================

/**
 * notFoundHandler — Fastify setNotFoundHandler for unknown routes.
 */
export function notFoundHandler(req: FastifyRequest, reply: FastifyReply): void {
  reply.code(404).send(
    buildErrorResponse(
      'E4001',
      ErrorCodes.E4001,
      `Route ${req.method} ${req.url} not found`,
      req,
    ),
  );
}

// ============================================================================
// CONVENIENCE THROWERS
// ============================================================================

export function throwNotFound(resource: string, id?: string): never {
  throw new AuraServiceError(
    'E4001',
    id ? `${resource} with ID '${id}' not found` : `${resource} not found`,
  );
}

export function throwConflict(message: string, details?: unknown): never {
  throw new AuraServiceError('E3001', message, 409, details);
}

export function throwValidation(message: string, details?: unknown): never {
  throw new AuraServiceError('E2001', message, 400, details);
}

export function throwForbidden(message = 'Access denied'): never {
  throw new AuraServiceError('E1004', message);
}

export function throwUnauthorized(message = 'Authentication required'): never {
  throw new AuraServiceError('E1001', message);
}
