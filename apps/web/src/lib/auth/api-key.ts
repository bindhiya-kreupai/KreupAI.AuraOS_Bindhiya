/**
 * API Key Authentication Module
 *
 * Provides API key-based authentication for service-to-service communication,
 * external integrations, and third-party applications.
 */

import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { prisma } from '@aura/database';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Configuration
const API_KEY_PREFIX = 'aura_';
const API_KEY_LENGTH = 32;
const API_KEY_HEADER = 'X-API-Key';
const API_KEY_QUERY_PARAM = 'api_key';

export interface APIKeyPayload {
  clientId: string;
  clientName: string;
  tenantId: string;
  permissions: string[];
  rateLimit?: number;
  expiresAt?: Date;
}

export interface APIKeyValidationResult {
  valid: boolean;
  client?: APIKeyPayload;
  error?: string;
}

/**
 * Generate a new API key
 * Format: aura_<random-bytes>
 */
export function generateAPIKey(): string {
  const keyBytes = randomBytes(API_KEY_LENGTH);
  const key = `${API_KEY_PREFIX}${keyBytes.toString('base64url')}`;
  return key;
}

/**
 * Hash an API key for secure storage
 * Uses SHA-256 for consistent hashing
 */
export function hashAPIKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Verify an API key matches a hash (timing-safe)
 */
export function verifyAPIKeyHash(apiKey: string, storedHash: string): boolean {
  try {
    const inputHash = hashAPIKey(apiKey);
    const inputBuffer = Buffer.from(inputHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (inputBuffer.length !== storedBuffer.length) {
      return false;
    }

    return timingSafeEqual(inputBuffer, storedBuffer);
  } catch (error) {
    logger.error({ error }, 'API key verification failed');
    return false;
  }
}

/**
 * Extract API key from request (header or query param)
 */
export function extractAPIKey(request: NextRequest): string | null {
  // Try header first
  const headerKey = request.headers.get(API_KEY_HEADER);
  if (headerKey) {
    return headerKey;
  }

  // Reject API keys in query parameters — they leak via logs, referer headers, and browser history
  const url = new URL(request.url);
  if (url.searchParams.has(API_KEY_QUERY_PARAM)) {
    logger.warn(
      'API key rejected — query parameter usage is not allowed. Use the X-API-Key header instead.'
    );
    return null;
  }

  return null;
}

/**
 * Validate API key format
 */
export function isValidAPIKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  if (!apiKey.startsWith(API_KEY_PREFIX)) {
    return false;
  }

  // Check minimum length
  const minLength = API_KEY_PREFIX.length + 20;
  if (apiKey.length < minLength) {
    return false;
  }

  return true;
}

/**
 * Validate an API key against the database
 */
export async function validateAPIKey(apiKey: string): Promise<APIKeyValidationResult> {
  // Validate format
  if (!isValidAPIKeyFormat(apiKey)) {
    return { valid: false, error: 'Invalid API key format' };
  }

  // Hash the key for lookup
  const keyHash = hashAPIKey(apiKey);

  try {
    // Look up the API key in the database
    // Note: You need to create an APIClient model in your schema
    const apiClient = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        tenantId: string;
        permissions: string;
        rateLimit: number | null;
        expiresAt: Date | null;
        isActive: boolean;
        lastUsedAt: Date | null;
      }>
    >`
      SELECT id, name, "tenantId", permissions, "rateLimit", "expiresAt", "isActive", "lastUsedAt"
      FROM "aura_api_key"
      WHERE "keyHash" = ${keyHash}
      LIMIT 1
    `;

    if (!apiClient || apiClient.length === 0) {
      return { valid: false, error: 'API key not found' };
    }

    const client = apiClient[0];

    // Check if client is active
    if (!client.isActive) {
      return { valid: false, error: 'API key is inactive' };
    }

    // Check expiration
    if (client.expiresAt && new Date(client.expiresAt) < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }

    // Update last used timestamp
    await prisma.$executeRaw`
      UPDATE "aura_api_key"
      SET "lastUsedAt" = NOW()
      WHERE id = ${client.id}
    `;

    return {
      valid: true,
      client: {
        clientId: client.id,
        clientName: client.name,
        tenantId: client.tenantId,
        permissions: JSON.parse(client.permissions || '[]'),
        rateLimit: client.rateLimit ?? undefined,
        expiresAt: client.expiresAt ?? undefined,
      },
    };
  } catch (error) {
    // If the table doesn't exist, return a more helpful error
    if ((error as Error).message?.includes('APIClient')) {
      logger.warn('APIClient table not found - API key auth requires database schema update');
      return { valid: false, error: 'API key authentication not configured' };
    }

    logger.error({ error }, 'API key validation failed');
    return { valid: false, error: 'API key validation failed' };
  }
}

/**
 * Check if client has required permission
 */
export function hasPermission(client: APIKeyPayload, requiredPermission: string): boolean {
  // Check for wildcard permission
  if (client.permissions.includes('*')) {
    return true;
  }

  // Check for exact permission
  if (client.permissions.includes(requiredPermission)) {
    return true;
  }

  // Check for resource wildcard (e.g., "employees:*")
  const [resource] = requiredPermission.split(':');
  if (client.permissions.includes(`${resource}:*`)) {
    return true;
  }

  return false;
}

/**
 * API Key Authentication Middleware
 *
 * Usage:
 * ```typescript
 * export const POST = withAPIKeyAuth(
 *   async (request, context) => {
 *     const { apiClient } = context;
 *     // Your handler code
 *   },
 *   { requiredPermissions: ['employees:read'] }
 * );
 * ```
 */
export interface APIKeyAuthOptions {
  /** Required permissions for this endpoint */
  requiredPermissions?: string[];
  /** Allow requests without API key (falls back to session auth) */
  optional?: boolean;
  /** Custom error handler */
  onError?: (request: NextRequest, error: string) => NextResponse;
}

export interface APIKeyAuthContext {
  apiClient?: APIKeyPayload;
  isAPIKeyAuth: boolean;
}

export function withAPIKeyAuth(options: APIKeyAuthOptions = {}) {
  return function apiKeyMiddleware<
    T extends (request: NextRequest, context: APIKeyAuthContext & any) => Promise<NextResponse>,
  >(handler: T): T {
    return (async (request: NextRequest, context: any = {}) => {
      const apiKey = extractAPIKey(request);

      // If no API key and auth is optional, continue without API key context
      if (!apiKey) {
        if (options.optional) {
          return handler(request, { ...context, isAPIKeyAuth: false });
        }

        const errorMessage = 'API key required';
        if (options.onError) {
          return options.onError(request, errorMessage);
        }

        return NextResponse.json(
          {
            success: false,
            error: {
              message: errorMessage,
              code: 'API_KEY_REQUIRED',
            },
          },
          { status: 401 }
        );
      }

      // Validate API key
      const validation = await validateAPIKey(apiKey);

      if (!validation.valid || !validation.client) {
        const errorMessage = validation.error || 'Invalid API key';

        logger.warn(
          {
            path: new URL(request.url).pathname,
            error: errorMessage,
          },
          'API key authentication failed'
        );

        if (options.onError) {
          return options.onError(request, errorMessage);
        }

        return NextResponse.json(
          {
            success: false,
            error: {
              message: errorMessage,
              code: 'API_KEY_INVALID',
            },
          },
          { status: 401 }
        );
      }

      // Check permissions
      if (options.requiredPermissions && options.requiredPermissions.length > 0) {
        const missingPermissions = options.requiredPermissions.filter(
          (perm) => !hasPermission(validation.client!, perm)
        );

        if (missingPermissions.length > 0) {
          const errorMessage = `Missing required permissions: ${missingPermissions.join(', ')}`;

          logger.warn(
            {
              clientId: validation.client.clientId,
              requiredPermissions: options.requiredPermissions,
              missingPermissions,
            },
            'API key permission check failed'
          );

          if (options.onError) {
            return options.onError(request, errorMessage);
          }

          return NextResponse.json(
            {
              success: false,
              error: {
                message: errorMessage,
                code: 'INSUFFICIENT_PERMISSIONS',
              },
            },
            { status: 403 }
          );
        }
      }

      // Authentication successful
      logger.debug(
        {
          clientId: validation.client.clientId,
          clientName: validation.client.clientName,
          path: new URL(request.url).pathname,
        },
        'API key authentication successful'
      );

      return handler(request, {
        ...context,
        apiClient: validation.client,
        isAPIKeyAuth: true,
      });
    }) as T;
  };
}

/**
 * Create a new API client and key
 */
export async function createAPIClient(data: {
  name: string;
  tenantId: string;
  permissions: string[];
  rateLimit?: number;
  expiresAt?: Date;
}): Promise<{ clientId: string; apiKey: string }> {
  const apiKey = generateAPIKey();
  const keyHash = hashAPIKey(apiKey);

  const result = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "aura_api_key" (id, name, "tenantId", "keyHash", permissions, "rateLimit", "expiresAt", "isActive", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      ${data.name},
      ${data.tenantId},
      ${keyHash},
      ${JSON.stringify(data.permissions)}::jsonb,
      ${data.rateLimit ?? null},
      ${data.expiresAt ?? null},
      true,
      NOW(),
      NOW()
    )
    RETURNING id
  `;

  return {
    clientId: result[0].id,
    apiKey, // Return the plain key only during creation
  };
}

/**
 * Revoke an API key (marks it as inactive)
 */
export async function revokeAPIKey(clientId: string): Promise<boolean> {
  try {
    await prisma.$executeRaw`
      UPDATE "aura_api_key"
      SET "isActive" = false, "updatedAt" = NOW()
      WHERE id = ${clientId}
    `;
    return true;
  } catch (error) {
    logger.error({ error, clientId }, 'Failed to revoke API key');
    return false;
  }
}

export default {
  generateAPIKey,
  hashAPIKey,
  verifyAPIKeyHash,
  extractAPIKey,
  validateAPIKey,
  hasPermission,
  withAPIKeyAuth,
  createAPIClient,
  revokeAPIKey,
  isValidAPIKeyFormat,
  API_KEY_HEADER,
};
