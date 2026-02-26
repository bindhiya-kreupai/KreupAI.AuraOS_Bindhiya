/**
 * InputValidator
 *
 * OWASP-compliant input sanitization and injection prevention.
 * Covers: XSS, SQL injection, path traversal, header injection.
 *
 * @module @aura/security
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  threats: string[];
  sanitized: string;
}

export interface SecurityMiddlewareOptions {
  /** Block requests with detected threats (true) or just sanitize (false). Default: false */
  blockOnThreat?: boolean;
  /** Maximum allowed input length. Default: 10000 chars */
  maxInputLength?: number;
  /** Custom allowed HTML tags (default: none) */
  allowedTags?: string[];
}

// ---------------------------------------------------------------------------
// XSS Prevention
// ---------------------------------------------------------------------------

// Dangerous patterns that indicate XSS attempts
const XSS_PATTERNS: RegExp[] = [
  /<script[\s\S]*?>/gi,
  /<\/script>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /on\w+\s*=/gi,              // onclick=, onload=, onerror=, etc.
  /<\s*iframe/gi,
  /<\s*object/gi,
  /<\s*embed/gi,
  /<\s*link/gi,
  /<\s*meta/gi,
  /data:\s*text\/html/gi,
  /data:\s*application\/javascript/gi,
  /expression\s*\(/gi,        // CSS expression
  /-moz-binding/gi,
  /<!--[\s\S]*?-->/g,         // HTML comments that might hide code
];

// HTML entity encoding map
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Sanitize input to prevent XSS attacks.
 * Strips dangerous HTML/JS patterns and encodes entities.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return String(input);

  let sanitized = input;

  // Remove dangerous patterns
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Encode remaining HTML special characters
  sanitized = sanitized.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] ?? char);

  return sanitized.trim();
}

/**
 * Detect XSS patterns in input without sanitizing.
 */
export function detectXSS(input: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(input));
}

// ---------------------------------------------------------------------------
// SQL Injection Detection
// ---------------------------------------------------------------------------

// Patterns indicating SQL injection attempts
const SQL_INJECTION_PATTERNS: RegExp[] = [
  /('|\")(\s*)(;|\-\-|\||\/\*)/i,                  // Quote followed by comment/terminator
  /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b/i,
  /\b(OR|AND)\b\s+\d+\s*=\s*\d+/i,                 // OR 1=1, AND 1=1
  /\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?/i,
  /;\s*(DROP|DELETE|UPDATE|INSERT)\b/i,
  /\b(SLEEP|BENCHMARK|WAITFOR)\s*\(/i,              // Time-based blind SQLi
  /\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b/i,
  /\/\*[\s\S]*?\*\//,                               // SQL comments
  /\-\-\s*$/m,                                      // Inline SQL comment
  /xp_cmdshell/i,                                   // SQL Server proc
  /INFORMATION_SCHEMA/i,
  /\bCAST\s*\(\s*\w+\s+AS\b/i,
  /\bCONVERT\s*\(/i,
  /\bCHAR\s*\(\d/i,
];

/**
 * Detect SQL injection patterns in input.
 * Returns true if the input appears to contain SQL injection.
 */
export function validateSQL(input: string): ValidationResult {
  const threats: string[] = [];

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      threats.push(`SQL injection pattern detected: ${pattern.source}`);
    }
  }

  return {
    valid: threats.length === 0,
    threats,
    sanitized: input.replace(/['";\-\-]/g, ''),
  };
}

// ---------------------------------------------------------------------------
// Path Traversal Prevention
// ---------------------------------------------------------------------------

const PATH_TRAVERSAL_PATTERNS: RegExp[] = [
  /\.\.\//g,                    // ../
  /\.\.\\/g,                    // ..\
  /\0/g,                        // Null byte
  /%2e%2e/gi,                   // URL-encoded ..
  /%252e%252e/gi,               // Double URL-encoded ..
  /\.\.[/\\]/g,
  /[/\\]\.\.[/\\]/g,
  /^\/etc\//i,                  // Unix /etc/ access
  /^\/proc\//i,                 // Unix /proc/ access
  /^c:\\windows/i,              // Windows system paths
  /^c:\\program files/i,
];

/**
 * Detect and prevent path traversal attacks.
 */
export function validatePath(input: string): ValidationResult {
  const threats: string[] = [];

  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(input)) {
      threats.push(`Path traversal pattern detected: ${pattern.source}`);
    }
  }

  // Normalize path — remove traversal sequences
  const sanitized = input
    .replace(/\.\.\//g, '')
    .replace(/\.\.\\/g, '')
    .replace(/\0/g, '')
    .replace(/\/+/g, '/')
    .replace(/\\+/g, '\\');

  return { valid: threats.length === 0, threats, sanitized };
}

// ---------------------------------------------------------------------------
// Header Injection Prevention
// ---------------------------------------------------------------------------

const HEADER_INJECTION_PATTERNS: RegExp[] = [
  /\r\n/,     // CRLF injection
  /\r/,       // CR
  /\n/,       // LF (allows HTTP response splitting)
  /%0d%0a/gi, // URL-encoded CRLF
  /%0d/gi,
  /%0a/gi,
];

/**
 * Detect HTTP header injection (CRLF injection) attempts.
 */
export function validateHeaders(headers: Record<string, string>): ValidationResult {
  const threats: string[] = [];
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    let headerThreat = false;

    for (const pattern of HEADER_INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        threats.push(`Header injection in "${key}": CRLF detected`);
        headerThreat = true;
        break;
      }
    }

    // Sanitize: remove all CR/LF characters
    sanitized[key] = headerThreat
      ? value.replace(/[\r\n]/g, '').replace(/%0d|%0a/gi, '')
      : value;
  }

  return {
    valid: threats.length === 0,
    threats,
    sanitized: JSON.stringify(sanitized),
  };
}

// ---------------------------------------------------------------------------
// Express-compatible security middleware
// ---------------------------------------------------------------------------

export interface ExpressRequest {
  body?: unknown;
  query?: Record<string, string>;
  params?: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  path: string;
}

export interface ExpressResponse {
  status: (code: number) => ExpressResponse;
  json: (data: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

export type NextFunction = (err?: unknown) => void;

/**
 * Create a security middleware combining all WAF checks.
 * Compatible with Express.js request/response/next signature.
 */
export function createSecurityMiddleware(options: SecurityMiddlewareOptions = {}) {
  const {
    blockOnThreat  = false,
    maxInputLength = 10_000,
  } = options;

  return function securityMiddleware(
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ): void {
    const threats: string[] = [];

    // 1. Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 2. Check path traversal
    const pathResult = validatePath(req.path);
    if (!pathResult.valid) {
      threats.push(...pathResult.threats);
    }

    // 3. Check query parameters for XSS and SQL injection
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          if (value.length > maxInputLength) {
            threats.push(`Query param "${key}" exceeds max length`);
          }
          if (detectXSS(value)) {
            threats.push(`XSS pattern in query param "${key}"`);
          }
          const sqlResult = validateSQL(value);
          if (!sqlResult.valid) {
            threats.push(...sqlResult.threats.map(t => `Query param "${key}": ${t}`));
          }
        }
      }
    }

    // 4. Check request body
    if (req.body && typeof req.body === 'object') {
      const bodyStr = JSON.stringify(req.body);
      if (bodyStr.length > maxInputLength * 10) {
        threats.push('Request body exceeds maximum size');
      }
      if (detectXSS(bodyStr)) {
        threats.push('XSS pattern detected in request body');
      }
    }

    if (threats.length > 0) {
      console.warn('[SecurityMiddleware] Threats detected:', {
        ip: req.ip,
        path: req.path,
        threats,
      });

      if (blockOnThreat) {
        res.status(400).json({
          error: 'Security validation failed',
          code: 'SECURITY_THREAT_DETECTED',
        });
        return;
      }
    }

    next();
  };
}
