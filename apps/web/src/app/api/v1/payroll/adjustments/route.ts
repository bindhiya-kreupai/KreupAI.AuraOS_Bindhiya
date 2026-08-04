/**
 * Workflow 13 — Payroll Adjustment Approval API Route
 * GET /api/v1/payroll/adjustments
 * POST /api/v1/payroll/adjustments
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { PayrollService } from '@/lib/services/payroll.service';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || ctx.user?.tenantId || 'dev-tenant';
    const employeeId = searchParams.get('employeeId') || undefined;
    const payrollMonth = searchParams.get('payrollMonth') || undefined;
    const adjustmentType = searchParams.get('adjustmentType') || undefined;
    const approvalStatus = searchParams.get('approvalStatus') || undefined;
    const isProcessed = searchParams.get('isProcessed') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await PayrollService.findAllAdjustments({
      tenantId,
      employeeId,
      payrollMonth,
      adjustmentType,
      approvalStatus,
      isProcessed,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch payroll adjustments' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: any) => {
  try {
    const body = await req.json();
    const tenantId = body.tenantId || ctx.user?.tenantId || 'dev-tenant';
    const createdBy = body.createdBy || ctx.user?.id || 'dev-user';

    const adjustment = await PayrollService.createAdjustment({
      ...body,
      tenantId,
      createdBy,
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
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create payroll adjustment' },
      { status: 400 }
    );
  }
});
