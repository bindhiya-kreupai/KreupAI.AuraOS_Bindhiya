/**
 * Example CSRF-Protected Endpoint
 * Demonstrates how to use CSRF protection middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCSRFProtection } from '@/lib/middleware/csrf.middleware';

/**
 * GET /api/auth/csrf-example
 * Example GET endpoint (no CSRF required)
 */
export const GET = withCSRFProtection(async (request, { user }) => {
  // GET requests don't require CSRF validation
  return NextResponse.json({
    success: true,
    message: 'GET request successful (no CSRF required)',
    data: {
      userId: user.userId,
      email: user.email,
    },
  });
});

/**
 * POST /api/auth/csrf-example
 * Example POST endpoint (CSRF required)
 *
 * @body _csrf - CSRF token (or use X-CSRF-Token header)
 * @body data - Your request data
 */
export const POST = withCSRFProtection(async (request, { user, csrfToken }) => {
  // CSRF token automatically validated by middleware
  // If we reach here, CSRF token is valid

  const body = await request.json();

  return NextResponse.json({
    success: true,
    message: 'POST request successful (CSRF validated)',
    data: {
      userId: user.userId,
      email: user.email,
      csrfTokenUsed: csrfToken.substring(0, 8) + '...',
      receivedData: body,
    },
  });
});

/**
 * PUT /api/auth/csrf-example
 * Example PUT endpoint (CSRF required)
 */
export const PUT = withCSRFProtection(async (request, { user }) => {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    message: 'PUT request successful (CSRF validated)',
    data: {
      userId: user.userId,
      updatedData: body,
    },
  });
});

/**
 * DELETE /api/auth/csrf-example
 * Example DELETE endpoint (CSRF required)
 */
export const DELETE = withCSRFProtection(async (request, { user }) => {
  return NextResponse.json({
    success: true,
    message: 'DELETE request successful (CSRF validated)',
    data: {
      userId: user.userId,
    },
  });
});
