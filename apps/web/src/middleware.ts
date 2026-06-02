import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allow-list of origins permitted to call /api/* with credentials.
// Production tenants belong here; dev origins are allowed when NODE_ENV !== 'production'.
const PROD_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (PROD_ORIGINS.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production' && DEV_ORIGINS.includes(origin)) return true;
  return false;
}

const ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const ALLOWED_HEADERS = [
  'Authorization',
  'Content-Type',
  'X-Requested-With',
  'X-Tenant-Id',
  'X-Request-Id',
  'X-CSRF-Token',
  'Accept',
  'Accept-Language',
].join(',');
const EXPOSED_HEADERS = ['X-Request-Id', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'].join(',');

function applyCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  }
  response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
  response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  response.headers.set('Access-Control-Expose-Headers', EXPOSED_HEADERS);
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');
  const origin = request.headers.get('origin');

  // Inject a request id on every request so downstream handlers can correlate logs.
  const incomingRequestId = request.headers.get('x-request-id');
  const requestId =
    incomingRequestId && incomingRequestId.length <= 100 ? incomingRequestId : crypto.randomUUID();

  // Preflight: short-circuit OPTIONS for /api with CORS headers, never hitting route handlers.
  if (isApi && request.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 });
    preflight.headers.set('X-Request-Id', requestId);
    return applyCorsHeaders(preflight, origin);
  }

  // Forward request id to the route handler.
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({ request: { headers: forwardedHeaders } });
  response.headers.set('X-Request-Id', requestId);

  if (isApi) {
    applyCorsHeaders(response, origin);
  }

  return response;
}

export const config = {
  // Run on every /api/* request, and on top-level pages so the request id is set.
  // Skip static assets and Next internals.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
