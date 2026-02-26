/**
 * @module auth-middleware
 * @description Shared authentication middleware for AuraOS microservices.
 *              Handles JWT verification for inter-service calls, multi-tenant
 *              context extraction, and role-based access control.
 * @project AuraOS Enterprise HCM Platform
 * @section 27 — Microservices Infrastructure
 */

import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import * as jwt from 'jsonwebtoken';

// ============================================================================
// TYPES
// ============================================================================

export interface ServiceTokenPayload {
  sub: string;       // Subject (userId or serviceId)
  iss: string;       // Issuer (service name)
  aud: string;       // Audience (target service)
  tenantId: string;  // Multi-tenant context
  roles: string[];   // User or service roles
  sessionId?: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user?: ServiceTokenPayload;
  tenantId?: string;
  serviceContext?: {
    callerService: string;
    correlationId: string;
    requestId: string;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET ?? 'aura-default-secret-change-in-production';
const JWT_ALGORITHM = 'HS256' as const;
const TOKEN_HEADER = 'authorization';
const SERVICE_TOKEN_HEADER = 'x-service-token';
const TENANT_HEADER = 'x-tenant-id';
const CORRELATION_HEADER = 'x-correlation-id';

// ============================================================================
// MIDDLEWARE FACTORIES
// ============================================================================

/**
 * verifyServiceToken — JWT verification middleware for inter-service calls.
 * Accepts both standard Bearer tokens (user auth) and X-Service-Token headers
 * (service-to-service auth).
 */
export function verifyServiceToken(
  req: AuthenticatedRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
): void {
  // Check service token header first (service-to-service)
  const serviceToken = req.headers[SERVICE_TOKEN_HEADER] as string | undefined;
  // Fall back to Authorization header (user token)
  const authHeader = req.headers[TOKEN_HEADER] as string | undefined;

  const token = serviceToken ?? (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

  if (!token) {
    reply.code(401).send({
      error: {
        code: 'E1001',
        message: 'Authentication required — no token provided',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    }) as ServiceTokenPayload;

    req.user = payload;
    req.tenantId = payload.tenantId;
    req.serviceContext = {
      callerService: payload.iss,
      correlationId: (req.headers[CORRELATION_HEADER] as string) ?? generateCorrelationId(),
      requestId: req.id,
    };

    done();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      reply.code(401).send({
        error: {
          code: 'E1002',
          message: 'Authentication token has expired',
          timestamp: new Date().toISOString(),
        },
      });
    } else if (err instanceof jwt.JsonWebTokenError) {
      reply.code(401).send({
        error: {
          code: 'E1003',
          message: 'Invalid authentication token',
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      reply.code(500).send({
        error: {
          code: 'E5001',
          message: 'Internal server error during authentication',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}

/**
 * extractTenantId — middleware to extract and validate multi-tenant context.
 * Tenant ID can come from the JWT payload (preferred) or X-Tenant-ID header.
 * Guards against cross-tenant data leakage.
 */
export function extractTenantId(
  req: AuthenticatedRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
): void {
  // Priority: JWT payload > header
  const tenantId =
    req.user?.tenantId ??
    (req.headers[TENANT_HEADER] as string | undefined);

  if (!tenantId) {
    reply.code(400).send({
      error: {
        code: 'E2002',
        message: 'Tenant context required — provide X-Tenant-ID header or use a tenant-scoped token',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Validate tenant ID format (UUID or slug)
  if (!/^[a-zA-Z0-9_-]{3,64}$/.test(tenantId)) {
    reply.code(400).send({
      error: {
        code: 'E2003',
        message: 'Invalid tenant ID format',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  req.tenantId = tenantId;
  done();
}

/**
 * requireRole — factory that returns a Fastify preHandler hook enforcing
 *               at least one of the specified roles on the authenticated user.
 */
export function requireRole(
  roles: string[],
): (req: AuthenticatedRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => void {
  return function roleGuard(
    req: AuthenticatedRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction,
  ): void {
    if (!req.user) {
      reply.code(401).send({
        error: {
          code: 'E1001',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const userRoles = req.user.roles ?? [];
    const hasRole = roles.some((r) => userRoles.includes(r));

    if (!hasRole) {
      reply.code(403).send({
        error: {
          code: 'E1004',
          message: `Access denied — required role(s): ${roles.join(', ')}`,
          userRoles,
          requiredRoles: roles,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    done();
  };
}

/**
 * generateServiceToken — create a short-lived JWT for service-to-service calls.
 */
export function generateServiceToken(params: {
  serviceId: string;
  targetService: string;
  tenantId: string;
  roles?: string[];
  expiresInSeconds?: number;
}): string {
  const payload: Omit<ServiceTokenPayload, 'iat' | 'exp'> = {
    sub: params.serviceId,
    iss: params.serviceId,
    aud: params.targetService,
    tenantId: params.tenantId,
    roles: params.roles ?? ['SERVICE'],
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: params.expiresInSeconds ?? 300, // 5 minutes
  });
}

// ============================================================================
// HELPERS
// ============================================================================

function generateCorrelationId(): string {
  return `cor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
