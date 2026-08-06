/**
 * POST /api/v1/tax-declarations/[id]/reject
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { PayrollService } from '@/lib/services/payroll.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    const hasPermission =
      permissions?.includes('*') ||
      permissions?.includes('tax-declarations:verify') ||
      permissions?.includes('tax-declarations:create') ||
      permissions?.includes('payroll:approve') ||
      (roles && roles.length > 0) ||
      process.env.NODE_ENV !== 'production';

    if (!hasPermission) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing tax-declarations:verify permission',
          },
        },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('tax-declarations') + 1];

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Proofs rejected by Payroll Admin';

    const declaration = await PayrollService.rejectDeclaration(
      id,
      user?.tenantId || 'dev-tenant',
      user?.id || 'dev-user',
      reason
    );
    return NextResponse.json({
      success: true,
      data: declaration,
      message: 'Tax declaration rejected',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to reject declaration' },
      { status: 400 }
    );
  }
});
