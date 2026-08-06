export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AuthorizationError } from '@/lib/errors';
import { handleError } from '@/lib/middleware/error-handler';
import { PayrollService } from '@/lib/services/payroll.service';

/**
 * GET /api/v1/payroll/adjustments/[id]
 * PATCH /api/v1/payroll/adjustments/[id] (edit a DRAFT)
 * DELETE /api/v1/payroll/adjustments/[id] (soft-delete own DRAFT)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    if (!permissions.includes('payroll:read')) {
      throw new AuthorizationError('Forbidden: missing payroll:read permission');
    }

    const { id } = await context.params;
    const adjustment = await PayrollService.findAdjustmentById(id, user.tenantId);

    if (!adjustment) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E3001', message: 'Adjustment not found', messageAr: 'التعديل غير موجود' },
        },
        { status: 404 }
      );
    }

    const actor = { userId: user.userId, roles: roles || [] };
    return NextResponse.json({
      success: true,
      data: { ...adjustment, actions: PayrollService.getAdjustmentActions(adjustment, actor) },
      meta: { timestamp: new Date().toISOString(), apiVersion: 'v1' },
    });
  } catch (error: any) {
    return handleError(error);
  }
});

export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    if (!permissions.includes('payroll:update')) {
      throw new AuthorizationError('Forbidden: missing payroll:update permission');
    }

    const { id } = await context.params;
    const body = await request.json();

    // Only the creator may edit their own draft — enforced by the service via getAdjustmentActions.
    const existing = await PayrollService.findAdjustmentById(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E3001', message: 'Adjustment not found', messageAr: 'التعديل غير موجود' },
        },
        { status: 404 }
      );
    }
    const allowed = PayrollService.getAdjustmentActions(existing, {
      userId: user.userId,
      roles: roles || [],
    });
    if (!allowed.includes('edit')) {
      throw new AuthorizationError(
        'Only the creator can edit an adjustment that is still editable'
      );
    }

    const updated = await PayrollService.updateAdjustment(id, user.tenantId, body, user.userId);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Adjustment updated successfully',
    });
  } catch (error: any) {
    return handleError(error);
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    if (!permissions.includes('payroll:delete') && !permissions.includes('payroll:create')) {
      throw new AuthorizationError('Forbidden: missing payroll:delete permission');
    }

    const { id } = await context.params;

    const existing = await PayrollService.findAdjustmentById(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E3001', message: 'Adjustment not found', messageAr: 'التعديل غير موجود' },
        },
        { status: 404 }
      );
    }
    const allowed = PayrollService.getAdjustmentActions(existing, {
      userId: user.userId,
      roles: roles || [],
    });
    if (!allowed.includes('delete')) {
      throw new AuthorizationError('Only the creator can delete their own draft adjustment');
    }

    await PayrollService.softDeleteAdjustment(id, user.tenantId, user.userId);

    return NextResponse.json({
      success: true,
      message: 'Adjustment deleted successfully',
      meta: { timestamp: new Date().toISOString(), apiVersion: 'v1' },
    });
  } catch (error: any) {
    return handleError(error);
  }
});
