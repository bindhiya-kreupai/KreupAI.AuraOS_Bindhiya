import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Catch-all route handler for unmatched API paths.
 *
 * PRODUCTION: Returns 501 Not Implemented. Never serves mock data.
 * DEVELOPMENT: Returns 501 Not Implemented with diagnostic information.
 *
 * This handler exists to surface missing API implementations explicitly
 * rather than silently failing or returning fake data.
 */
function buildErrorResponse(method: string, routePath: string[]) {
  const path = `/api/${routePath.join('/')}`;
  const timestamp = new Date().toISOString();

  const body: Record<string, unknown> = {
    error: 'Not Implemented',
    message: `API endpoint not implemented: ${method} ${path}`,
    messageAr: `نقطة نهاية API غير مطبقة: ${method} ${path}`,
    status: 501,
    path,
    method,
    timestamp,
  };

  if (isDev) {
    body.hint =
      'This path has no dedicated route handler. Create a route.ts file in the corresponding app/api/ directory.';
  }

  // Structured logging for observability
  console.warn(
    JSON.stringify({
      level: 'warn',
      msg: `Unimplemented API hit: ${method} ${path}`,
      method,
      path,
      timestamp,
      environment: process.env.NODE_ENV,
    })
  );

  return NextResponse.json(body, { status: 501 });
}

export async function GET(_request: NextRequest, { params }: { params: { route: string[] } }) {
  return buildErrorResponse('GET', params.route);
}

export async function POST(_request: NextRequest, { params }: { params: { route: string[] } }) {
  return buildErrorResponse('POST', params.route);
}

export async function PUT(_request: NextRequest, { params }: { params: { route: string[] } }) {
  return buildErrorResponse('PUT', params.route);
}

export async function DELETE(_request: NextRequest, { params }: { params: { route: string[] } }) {
  return buildErrorResponse('DELETE', params.route);
}

export async function PATCH(_request: NextRequest, { params }: { params: { route: string[] } }) {
  return buildErrorResponse('PATCH', params.route);
}
