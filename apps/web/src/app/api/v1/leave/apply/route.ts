import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schemas
const applyLeaveSchema = z
  .object({
    employeeId: z.string().uuid(),
    leaveTypeId: z.string().uuid(),
    policyId: z.string().uuid().optional().nullable(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    halfDayStart: z.boolean().default(false),
    halfDayEnd: z.boolean().default(false),
    reason: z.string().min(10).max(500),
    contactNumber: z.string().optional().nullable(),
    addressDuringLeave: z.string().optional().nullable(),
    delegateToEmployeeId: z.string().uuid().optional().nullable(),
    documents: z
      .array(
        z.object({
          fileName: z.string(),
          fileUrl: z.string(),
          fileType: z.string(),
        })
      )
      .optional()
      .nullable(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  });

/**
 * Calculate business days between two dates (excluding weekends)
 */
function calculateTotalDays(
  startDate: Date,
  endDate: Date,
  halfDayStart: boolean,
  halfDayEnd: boolean
): number {
  let totalDays = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      totalDays += 1;
    }
    current.setDate(current.getDate() + 1);
  }

  // Adjust for half days
  if (halfDayStart && totalDays > 0) totalDays -= 0.5;
  if (halfDayEnd && totalDays > 0) totalDays -= 0.5;

  return totalDays;
}

/**
 * POST /api/v1/leave/apply
 * Submit a new leave application
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('leave:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leave:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    // Validate request body
    const validationResult = applyLeaveSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed',
            details: { errors: validationResult.error.errors },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Verify the employee belongs to the same tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: data.employeeId,
        company: { tenantId: user.tenantId },
      },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 404 }
      );
    }

    // Calculate total leave days
    const totalDays = calculateTotalDays(startDate, endDate, data.halfDayStart, data.halfDayEnd);

    if (totalDays <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2002',
            message: 'Total leave days must be greater than zero',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    // Check for overlapping leave requests (PENDING or APPROVED)
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        tenantId: user.tenantId,
        employeeId: data.employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: 'Overlapping leave request exists for the selected date range',
            details: { existingRequestId: overlapping.id },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 409 }
      );
    }

    // Check leave balance if a policy is provided
    if (data.policyId) {
      const leaveYear = startDate.getFullYear();
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          tenantId: user.tenantId,
          employeeId: data.employeeId,
          policyId: data.policyId,
          leaveYear,
        },
      });

      if (balance && Number(balance.currentBalance) < totalDays) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4002',
              message: 'Insufficient leave balance',
              details: {
                currentBalance: Number(balance.currentBalance),
                requested: totalDays,
              },
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 400 }
        );
      }
    }

    // Create the leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        tenantId: user.tenantId,
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        policyId: data.policyId ?? undefined,
        startDate,
        endDate,
        totalDays,
        halfDayStart: data.halfDayStart,
        halfDayEnd: data.halfDayEnd,
        reason: data.reason,
        contactNumber: data.contactNumber ?? undefined,
        addressDuringLeave: data.addressDuringLeave ?? undefined,
        delegateToEmployeeId: data.delegateToEmployeeId ?? undefined,
        documents: data.documents ?? undefined,
        status: 'PENDING',
        currentApproverLevel: 1,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: leaveRequest.id,
          tenantId: leaveRequest.tenantId,
          employeeId: leaveRequest.employeeId,
          leaveTypeId: leaveRequest.leaveTypeId,
          policyId: leaveRequest.policyId,
          startDate: leaveRequest.startDate.toISOString().split('T')[0],
          endDate: leaveRequest.endDate.toISOString().split('T')[0],
          totalDays: Number(leaveRequest.totalDays),
          halfDayStart: leaveRequest.halfDayStart,
          halfDayEnd: leaveRequest.halfDayEnd,
          reason: leaveRequest.reason,
          contactNumber: leaveRequest.contactNumber,
          addressDuringLeave: leaveRequest.addressDuringLeave,
          delegateToEmployeeId: leaveRequest.delegateToEmployeeId,
          documents: leaveRequest.documents,
          status: leaveRequest.status,
          appliedAt: leaveRequest.appliedAt.toISOString(),
          approvers: leaveRequest.approvers,
          currentApproverLevel: leaveRequest.currentApproverLevel,
          createdAt: leaveRequest.createdAt.toISOString(),
          updatedAt: leaveRequest.updatedAt.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Leave Application API] POST Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to submit leave application',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
