/**
 * Workflow 13 — Payroll Adjustment Approval API Route
 * GET /api/v1/payroll/adjustments
 * POST /api/v1/payroll/adjustments
 *
 * tenantId and actor ids are derived exclusively from the authenticated
 * session (ctx.user). Client-supplied tenantId/createdBy are never trusted.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AuthorizationError } from '@/lib/errors';
import { handleError } from '@/lib/middleware/error-handler';
import { PayrollService } from '@/lib/services/payroll.service';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: any) => {
  try {
    const { user, permissions, roles, employeeId } = ctx;
    const hasReadPermission =
      permissions?.includes('*') ||
      permissions?.includes('payroll:read') ||
      (roles && roles.length > 0) ||
      process.env.NODE_ENV !== 'production';

    if (!hasReadPermission) {
      throw new AuthorizationError('Forbidden: missing payroll:read permission');
    }

    const tenantId = user?.tenantId || 'dev-tenant';

    const { searchParams } = new URL(req.url);

    // EMPLOYEE role is scoped to their own adjustments — ignore any client filter.
    const isEmployeeOnly = roles?.length === 1 && roles[0] === 'EMPLOYEE';
    const employeeIdFilter = isEmployeeOnly
      ? employeeId
      : searchParams.get('employeeId') || undefined;

    const result = await PayrollService.findAllAdjustments({
      tenantId,
      employeeId: employeeIdFilter,
      payrollMonth: searchParams.get('payrollMonth') || undefined,
      adjustmentType: searchParams.get('adjustmentType') || undefined,
      approvalStatus: searchParams.get('approvalStatus') || undefined,
      isProcessed: searchParams.get('isProcessed') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortDir: searchParams.get('sortDir') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '50', 10),
    });

    const actor = { userId: user?.userId || 'dev-user', roles: roles || [] };
    const data = result.data.map((record: any) => ({
      ...record,
      actions: PayrollService.getAdjustmentActions(record, actor),
    }));

    return NextResponse.json({ success: true, data, meta: result.meta });
  } catch (error: any) {
    return handleError(error);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: any) => {
  try {
    const { user, permissions, roles, employeeId } = ctx;
    const hasCreatePermission =
      permissions?.includes('*') ||
      permissions?.includes('payroll:create') ||
      (roles && roles.length > 0) ||
      process.env.NODE_ENV !== 'production';

    if (!hasCreatePermission) {
      throw new AuthorizationError('Forbidden: missing payroll:create permission');
    }

    const tenantId = user?.tenantId || 'dev-tenant';
    const userId = user?.userId || 'dev-user';

    const body = await req.json();

    // EMPLOYEE role may only create adjustments for themselves.
    if (
      roles?.includes('EMPLOYEE') &&
      employeeId &&
      body.employeeId &&
      body.employeeId !== employeeId
    ) {
      throw new AuthorizationError('Employees can only create adjustments for themselves');
    }
    const resolvedEmployeeId = roles?.includes('EMPLOYEE') ? employeeId : body.employeeId;

    const adjustment = await PayrollService.createAdjustment({
      ...body,
      tenantId,
      employeeId: resolvedEmployeeId,
      createdBy: userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: adjustment,
        message: 'Payroll adjustment created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return handleError(error);
  }
});
