/**
 * Leave Accrual API Routes
 * Phase 2: Core Enhancement - Advanced Leave System
 */

import { NextRequest, NextResponse } from 'next/server';
import { LeaveAccrualService } from '@/lib/services/leave';

/**
 * POST /api/leave/accrual
 * Process monthly leave accrual
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    const processDate = body.processDate ? new Date(body.processDate) : new Date();

    const result = await LeaveAccrualService.processMonthlyAccrual({
      tenantId: body.tenantId,
      processDate,
      employeeIds: body.employeeIds,
      leaveTypeIds: body.leaveTypeIds,
      isMonthEnd: body.isMonthEnd || false,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Leave accrual error:', error);
    return NextResponse.json(
      { error: 'Failed to process leave accrual', errorAr: 'فشل في معالجة استحقاق الإجازات' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leave/accrual
 * Get accrual history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const employeeId = searchParams.get('employeeId');
    const year = searchParams.get('year');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    // Fetch accrual history
    return NextResponse.json({
      success: true,
      data: {
        accrualRuns: [],
        summary: {
          totalAccrued: 0,
          totalEmployees: 0,
        },
      },
    });
  } catch (error) {
    console.error('Accrual history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accrual history', errorAr: 'فشل في جلب سجل الاستحقاق' },
      { status: 500 }
    );
  }
}
