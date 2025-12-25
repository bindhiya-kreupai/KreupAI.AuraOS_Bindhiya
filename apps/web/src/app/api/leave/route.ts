/**
 * Leave Management API Routes
 * Phase 2: Core Enhancement - Advanced Leave System
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { LeaveAccrualService } from '@/lib/services/leave';

/**
 * GET /api/leave
 * Get leave requests or balances
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'requests'; // 'requests' | 'balances' | 'policies'
    const employeeId = searchParams.get('employeeId');
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'balances':
        if (!employeeId) {
          return NextResponse.json(
            { error: 'employeeId is required for balances', errorAr: 'معرف الموظف مطلوب للأرصدة' },
            { status: 400 }
          );
        }
        // Fetch balances
        return NextResponse.json({
          success: true,
          data: {
            employeeId,
            year: parseInt(year),
            balances: [],
          },
        });

      case 'policies':
        // Fetch policies
        return NextResponse.json({
          success: true,
          data: {
            policies: [],
          },
        });

      case 'requests':
      default:
        // Fetch leave requests
        return NextResponse.json({
          success: true,
          data: {
            requests: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
            },
          },
        });
    }
  } catch {
        return NextResponse.json(
      { error: 'Failed to fetch leave data', errorAr: 'فشل في جلب بيانات الإجازات' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leave
 * Submit leave request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['tenantId', 'employeeId', 'leaveTypeId', 'startDate', 'endDate', 'reason'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required`, errorAr: `${field} مطلوب` },
          { status: 400 }
        );
      }
    }

    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'End date cannot be before start date', errorAr: 'لا يمكن أن يكون تاريخ الانتهاء قبل تاريخ البدء' },
        { status: 400 }
      );
    }

    // Calculate total days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check balance (would connect to database)
    // For now, return success
    return NextResponse.json({
      success: true,
      data: {
        id: `leave_${Date.now()}`,
        ...body,
        totalDays,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
    });
  } catch {
        return NextResponse.json(
      { error: 'Failed to submit leave request', errorAr: 'فشل في تقديم طلب الإجازة' },
      { status: 500 }
    );
  }
}
