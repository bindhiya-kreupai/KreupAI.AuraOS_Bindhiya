/**
 * POST /api/v1/gl/entries/[id]/post
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { glPostingService } from '@/lib/services/gl-posting.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    const hasPermission =
      permissions?.includes('*') ||
      permissions?.includes('gl:post') ||
      permissions?.includes('payroll:approve') ||
      (roles && roles.length > 0) ||
      process.env.NODE_ENV !== 'production';

    if (!hasPermission) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing gl:post permission',
          },
        },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('entries') + 1];

    const result = await glPostingService.post(
      id,
      user?.tenantId || 'dev-tenant',
      user?.id || 'dev-user'
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'GL journal entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'GL journal entry posted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to post entry' },
      { status: 400 }
    );
  }
});
