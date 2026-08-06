/**
 * Workflow 14 — Tax Declaration Submission API Route
 * GET /api/v1/tax-declarations
 * POST /api/v1/tax-declarations
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { PayrollService } from '@/lib/services/payroll.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    const hasReadPermission =
      permissions?.includes('*') ||
      permissions?.includes('tax-declarations:read') ||
      permissions?.includes('payroll:read') ||
      (roles && roles.length > 0) ||
      process.env.NODE_ENV !== 'production';

    if (!hasReadPermission) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing tax-declarations:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = {
      tenantId: user?.tenantId || 'dev-tenant',
      employeeId: searchParams.get('employeeId') || undefined,
      financialYear: searchParams.get('financialYear') || undefined,
      status: searchParams.get('status') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '50', 10),
    };

    const result = await PayrollService.findAllDeclarations(filter);
    return NextResponse.json({ success: true, data: result.data, meta: result.meta });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal error' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    const hasCreatePermission =
      permissions?.includes('*') ||
      permissions?.includes('tax-declarations:create') ||
      permissions?.includes('payroll:create') ||
      (roles && roles.length > 0) ||
      process.env.NODE_ENV !== 'production';

    if (!hasCreatePermission) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing tax-declarations:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    body.tenantId = user?.tenantId || 'dev-tenant';
    if (!body.employeeId) body.employeeId = user?.id || 'dev-user';

    const declaration = await PayrollService.createDeclaration(body);
    return NextResponse.json({ success: true, data: declaration }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create declaration' },
      { status: 400 }
    );
  }
});
