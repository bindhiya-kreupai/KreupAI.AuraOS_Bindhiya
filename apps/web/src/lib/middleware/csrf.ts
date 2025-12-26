/**
 * CSRF (Cross-Site Request Forgery) Protection Middleware
 *
 * Implements CSRF token validation to prevent cross-site request forgery attacks.
 * Uses the double-submit cookie pattern with secure token generation.
 */

import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf-secret-key';
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

// Methods that require CSRF validation
const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Paths that are exempt from CSRF validation (e.g., API endpoints for mobile apps)
const EXEMPT_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/webhooks/',
  '/api/health',
  '/api/metrics',
];

export interface CSRFConfig {
  /** Custom cookie name */
  cookieName?: string;
  /** Custom header name */
  headerName?: string;
  /** Paths to exempt from CSRF validation */
  exemptPaths?: string[];
  /** Whether to use secure cookies (HTTPS only) */
  secure?: boolean;
  /** SameSite cookie attribute */
  sameSite?: 'strict' | 'lax' | 'none';
  /** Custom error handler */
  onError?: (request: NextRequest, message: string) => NextResponse;
}

/**
 * Generate a secure CSRF token
 */
export function generateCSRFToken(): string {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  return token;
}

/**
 * Create a signed CSRF token with HMAC
 */
export function signCSRFToken(token: string): string {
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(token);
  const signature = hmac.digest('hex');
  return `${token}.${signature}`;
}

/**
 * Verify a signed CSRF token
 */
export function verifyCSRFToken(signedToken: string): boolean {
  try {
    const [token, signature] = signedToken.split('.');
    if (!token || !signature) {
      return false;
    }

    const hmac = createHmac('sha256', CSRF_SECRET);
    hmac.update(token);
    const expectedSignature = hmac.digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    logger.warn({ error }, 'CSRF token verification failed');
    return false;
  }
}

/**
 * Extract CSRF token from request
 */
export function extractCSRFToken(request: NextRequest, headerName: string = CSRF_HEADER_NAME): string | null {
  // First try header
  const headerToken = request.headers.get(headerName);
  if (headerToken) {
    return headerToken;
  }

  // Then try form data (for traditional form submissions)
  // Note: This would need to be handled differently for form data
  return null;
}

/**
 * Extract CSRF cookie from request
 */
export function extractCSRFCookie(request: NextRequest, cookieName: string = CSRF_COOKIE_NAME): string | null {
  const cookie = request.cookies.get(cookieName);
  return cookie?.value || null;
}

/**
 * Check if a path is exempt from CSRF validation
 */
export function isExemptPath(path: string, exemptPaths: string[] = EXEMPT_PATHS): boolean {
  return exemptPaths.some((exemptPath) => {
    if (exemptPath.endsWith('/')) {
      return path.startsWith(exemptPath);
    }
    return path === exemptPath;
  });
}

/**
 * Validate CSRF token (double-submit pattern)
 * Compares the token from the header/form with the token from the cookie
 */
export function validateCSRFTokens(
  headerToken: string | null,
  cookieToken: string | null
): { valid: boolean; error?: string } {
  if (!headerToken) {
    return { valid: false, error: 'Missing CSRF token in request header' };
  }

  if (!cookieToken) {
    return { valid: false, error: 'Missing CSRF cookie' };
  }

  // Verify both tokens are properly signed
  if (!verifyCSRFToken(headerToken)) {
    return { valid: false, error: 'Invalid CSRF token signature in header' };
  }

  if (!verifyCSRFToken(cookieToken)) {
    return { valid: false, error: 'Invalid CSRF token signature in cookie' };
  }

  // Extract the raw tokens (before signature)
  const [rawHeaderToken] = headerToken.split('.');
  const [rawCookieToken] = cookieToken.split('.');

  // Compare tokens
  if (rawHeaderToken !== rawCookieToken) {
    return { valid: false, error: 'CSRF token mismatch' };
  }

  return { valid: true };
}

/**
 * Create CSRF cookie options
 */
export function createCSRFCookieOptions(config: CSRFConfig = {}) {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    name: config.cookieName || CSRF_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: config.secure ?? isProduction,
    sameSite: config.sameSite || 'strict',
    path: '/',
    maxAge: CSRF_COOKIE_MAX_AGE,
  } as const;
}

/**
 * CSRF Protection Middleware
 *
 * Usage:
 * ```typescript
 * export const POST = withCSRFProtection(async (request) => {
 *   // Your handler code
 * });
 * ```
 */
export function withCSRFProtection(config: CSRFConfig = {}) {
  const cookieName = config.cookieName || CSRF_COOKIE_NAME;
  const headerName = config.headerName || CSRF_HEADER_NAME;
  const exemptPaths = config.exemptPaths || EXEMPT_PATHS;

  return function csrfMiddleware<T extends (request: NextRequest, ...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (request: NextRequest, ...args: any[]) => {
      const path = new URL(request.url).pathname;
      const method = request.method;

      // Skip CSRF validation for safe methods
      if (!PROTECTED_METHODS.includes(method)) {
        return handler(request, ...args);
      }

      // Skip CSRF validation for exempt paths
      if (isExemptPath(path, exemptPaths)) {
        return handler(request, ...args);
      }

      // Check for API key authentication (service-to-service calls don't need CSRF)
      const apiKey = request.headers.get('X-API-Key');
      if (apiKey) {
        // API key auth is handled by separate middleware
        return handler(request, ...args);
      }

      // Validate CSRF tokens
      const headerToken = extractCSRFToken(request, headerName);
      const cookieToken = extractCSRFCookie(request, cookieName);

      const validation = validateCSRFTokens(headerToken, cookieToken);

      if (!validation.valid) {
        logger.warn(
          {
            path,
            method,
            error: validation.error,
            hasHeader: !!headerToken,
            hasCookie: !!cookieToken,
          },
          'CSRF validation failed'
        );

        if (config.onError) {
          return config.onError(request, validation.error || 'CSRF validation failed');
        }

        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'CSRF validation failed',
              code: 'CSRF_VALIDATION_ERROR',
            },
          },
          { status: 403 }
        );
      }

      // CSRF validation passed
      return handler(request, ...args);
    }) as T;
  };
}

/**
 * Generate new CSRF token and create response with cookie
 *
 * Usage in login or session initialization:
 * ```typescript
 * const { token, response } = createCSRFTokenResponse(NextResponse.json({ success: true }));
 * // Include token in response body for client to use in headers
 * ```
 */
export function createCSRFTokenResponse(
  baseResponse: NextResponse,
  config: CSRFConfig = {}
): { token: string; response: NextResponse } {
  const rawToken = generateCSRFToken();
  const signedToken = signCSRFToken(rawToken);

  const cookieOptions = createCSRFCookieOptions(config);

  // Clone response and add CSRF cookie
  const response = baseResponse.clone() as NextResponse;
  response.cookies.set({
    ...cookieOptions,
    value: signedToken,
  });

  return { token: signedToken, response };
}

/**
 * CSRF token endpoint - generates new tokens for clients
 */
export async function handleCSRFTokenRequest(): Promise<NextResponse> {
  const rawToken = generateCSRFToken();
  const signedToken = signCSRFToken(rawToken);

  const response = NextResponse.json({
    success: true,
    csrfToken: signedToken,
  });

  const cookieOptions = createCSRFCookieOptions();
  response.cookies.set({
    ...cookieOptions,
    value: signedToken,
  });

  return response;
}

export default {
  generateCSRFToken,
  signCSRFToken,
  verifyCSRFToken,
  validateCSRFTokens,
  withCSRFProtection,
  createCSRFTokenResponse,
  handleCSRFTokenRequest,
  extractCSRFToken,
  extractCSRFCookie,
  isExemptPath,
  CSRF_HEADER_NAME,
  CSRF_COOKIE_NAME,
};
