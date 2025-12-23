/**
 * Regularization API Routes
 * Phase 2: Core Enhancement - Attendance Enhancement
 */

import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/lib/services/attendance';

/**
 * GET /api/attendance/regularization
 * Get regularization requests
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const pending = searchParams.get('pending') === 'true';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    // Fetch regularization requests
    return NextResponse.json({
      success: true,
      data: {
        regularizations: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
        },
      },
    });
  } catch (error) {
    console.error('Regularization fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regularization requests', errorAr: 'فشل في جلب طلبات التصحيح' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/regularization
 * Submit or process regularization request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'submit';

    switch (action) {
      case 'submit':
        // Submit regularization request
        const required = ['tenantId', 'employeeId', 'date', 'reason', 'category'];
        for (const field of required) {
          if (!body[field]) {
            return NextResponse.json(
              { error: `${field} is required`, errorAr: `${field} مطلوب` },
              { status: 400 }
            );
          }
        }

        const regularization = await AttendanceService.submitRegularization({
          tenantId: body.tenantId,
          employeeId: body.employeeId,
          employeeName: body.employeeName || '',
          date: body.date,
          attendanceRecordId: body.attendanceRecordId,
          originalCheckIn: body.originalCheckIn,
          originalCheckOut: body.originalCheckOut,
          originalStatus: body.originalStatus || 'ABSENT',
          requestedCheckIn: body.requestedCheckIn,
          requestedCheckOut: body.requestedCheckOut,
          requestedStatus: body.requestedStatus || 'PRESENT',
          reason: body.reason,
          category: body.category,
          supportingDocument: body.supportingDocument,
        });

        return NextResponse.json({
          success: true,
          data: regularization,
        });

      case 'approve':
        // Approve regularization
        if (!body.regularizationId || !body.approverId) {
          return NextResponse.json(
            {
              error: 'regularizationId and approverId are required',
              errorAr: 'معرف التصحيح ومعرف الموافق مطلوبان',
            },
            { status: 400 }
          );
        }

        const approvedReg = await AttendanceService.processRegularization(
          body.regularizationId,
          body.approverId,
          'APPROVED',
          body.comments
        );

        return NextResponse.json({
          success: true,
          data: approvedReg,
        });

      case 'reject':
        // Reject regularization
        if (!body.regularizationId || !body.approverId) {
          return NextResponse.json(
            {
              error: 'regularizationId and approverId are required',
              errorAr: 'معرف التصحيح ومعرف الموافق مطلوبان',
            },
            { status: 400 }
          );
        }

        const rejectedReg = await AttendanceService.processRegularization(
          body.regularizationId,
          body.approverId,
          'REJECTED',
          body.comments
        );

        return NextResponse.json({
          success: true,
          data: rejectedReg,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Regularization processing error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process regularization',
        errorAr: 'فشل في معالجة طلب التصحيح',
      },
      { status: 500 }
    );
  }
}
