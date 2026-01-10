/**
 * Leave Encashment API Routes
 * Phase 2: Core Enhancement - Advanced Leave System
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { LeaveAccrualService } from '@/lib/services/leave';

/**
 * POST /api/leave/encashment
 * Submit leave encashment request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['tenantId', 'employeeId', 'leaveTypeCode', 'requestedDays', 'trigger'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required`, errorAr: `${field} مطلوب` },
          { status: 400 }
        );
      }
    }

    // Calculate encashment
    const calculation = await LeaveAccrualService.calculateEncashment(
      body.employeeId,
      body.leaveTypeCode,
      body.requestedDays,
      body.trigger
    );

    // Return calculation preview or process based on action
    if (body.action === 'PREVIEW') {
      return NextResponse.json({
        success: true,
        data: {
          preview: true,
          calculation,
        },
      });
    }

    // Process encashment
    const request_data = {
      id: `enc_${Date.now()}`,
      tenantId: body.tenantId,
      employeeId: body.employeeId,
      employeeName: body.employeeName || '',
      leaveTypeId: body.leaveTypeId || '',
      leaveTypeCode: body.leaveTypeCode,
      requestedDays: body.requestedDays,
      eligibleDays: calculation.eligibleDays,
      approvedDays: 0,
      calculationBasis: calculation.basis,
      dailyRate: calculation.dailyRate,
      totalAmount: calculation.totalAmount,
      trigger: body.trigger,
      reason: body.reason,
      status: 'PENDING' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: request_data,
    });
  } catch (error) {
        return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process encashment',
        errorAr: 'فشل في معالجة صرف الإجازات',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leave/encashment
 * Get encashment requests
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        encashments: [],
        summary: {
          totalAmount: 0,
          totalDays: 0,
          pendingCount: 0,
        },
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch encashment requests', errorAr: 'فشل في جلب طلبات صرف الإجازات' },
      { status: 500 }
    );
  }
}
