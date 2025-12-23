/**
 * Overtime API Routes
 * Phase 2: Core Enhancement - Attendance Enhancement
 */

import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/lib/services/attendance';
import { LabourLawService } from '@/lib/services/compliance';
import { SupportedCountryCode } from '@/lib/services/compliance/types';

/**
 * GET /api/attendance/overtime
 * Get overtime records
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const status = searchParams.get('status');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    // Fetch overtime records
    return NextResponse.json({
      success: true,
      data: {
        overtime: [],
        summary: {
          totalHours: 0,
          totalAmount: 0,
          pendingApproval: 0,
          approved: 0,
          rejected: 0,
        },
      },
    });
  } catch (error) {
    console.error('Overtime fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overtime records', errorAr: 'فشل في جلب سجلات العمل الإضافي' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/overtime
 * Submit or approve overtime
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'submit';

    switch (action) {
      case 'submit':
        // Submit overtime request
        if (!body.employeeId || !body.date || !body.overtimeMinutes) {
          return NextResponse.json(
            {
              error: 'employeeId, date, and overtimeMinutes are required',
              errorAr: 'معرف الموظف والتاريخ ودقائق العمل الإضافي مطلوبة',
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            id: `ot_${Date.now()}`,
            ...body,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          },
        });

      case 'approve':
        // Approve overtime
        if (!body.overtimeId || !body.approverId) {
          return NextResponse.json(
            {
              error: 'overtimeId and approverId are required',
              errorAr: 'معرف العمل الإضافي ومعرف الموافق مطلوبان',
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            id: body.overtimeId,
            status: 'APPROVED',
            approvedBy: body.approverId,
            approvedAt: new Date().toISOString(),
            approvedMinutes: body.approvedMinutes,
          },
        });

      case 'reject':
        // Reject overtime
        if (!body.overtimeId || !body.approverId || !body.rejectionReason) {
          return NextResponse.json(
            {
              error: 'overtimeId, approverId, and rejectionReason are required',
              errorAr: 'معرف العمل الإضافي ومعرف الموافق وسبب الرفض مطلوبة',
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            id: body.overtimeId,
            status: 'REJECTED',
            rejectedBy: body.approverId,
            rejectedAt: new Date().toISOString(),
            rejectionReason: body.rejectionReason,
          },
        });

      case 'calculate':
        // Calculate overtime for an attendance record
        if (!body.attendanceRecordId || !body.countryCode || !body.hourlyRate) {
          return NextResponse.json(
            {
              error: 'attendanceRecordId, countryCode, and hourlyRate are required',
              errorAr: 'معرف سجل الحضور ورمز البلد وأجر الساعة مطلوبة',
            },
            { status: 400 }
          );
        }

        // Get overtime rates from labour law
        const labourLaw = LabourLawService.getConfig(body.countryCode as SupportedCountryCode);

        return NextResponse.json({
          success: true,
          data: {
            rates: labourLaw.overtimeRates,
            calculated: {
              normal: body.hourlyRate * labourLaw.overtimeRates.normal,
              night: body.hourlyRate * labourLaw.overtimeRates.night,
              holiday: body.hourlyRate * labourLaw.overtimeRates.holiday,
            },
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Overtime processing error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process overtime',
        errorAr: 'فشل في معالجة العمل الإضافي',
      },
      { status: 500 }
    );
  }
}
