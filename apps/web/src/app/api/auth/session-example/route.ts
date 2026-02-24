/**
 * Example Protected API Route
 * Demonstrates how to use session middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { withSession, withSessionAndTenant } from '@/lib/middleware/session.middleware';

/**
 * GET /api/auth/session-example
 * Example endpoint protected by session middleware
 *
 * This endpoint demonstrates basic session validation
 */
export const GET = withSession(async (request, { user }) => {
  // User is automatically validated and available here
  const { userId, email, tenantId } = user;

  return NextResponse.json({
    success: true,
    message: 'Session is valid',
    data: {
      userId,
      email,
      tenantId,
    },
  });
});

/**
 * POST /api/auth/session-example
 * Example endpoint with tenant isolation
 *
 * This endpoint demonstrates session validation with tenant access control
 * Try: POST /api/auth/session-example?tenantId=tenant-123
 */
export const POST = withSessionAndTenant(async (request, { user, tenantId }) => {
  // User is validated and tenant access is checked
  // You can safely query data for this tenant

  return NextResponse.json({
    success: true,
    message: 'Session and tenant access validated',
    data: {
      userId: user.userId,
      email: user.email,
      userTenantId: user.tenantId,
      requestedTenantId: tenantId,
      note: 'If these tenant IDs differ, tenant access control failed',
    },
  });
});
