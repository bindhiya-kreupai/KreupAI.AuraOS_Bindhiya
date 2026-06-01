import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema
const encashLeaveSchema = z.object({
  employeeId: z.string().uuid(),
  policyId: z.string().uuid(),
  numberOfDays: z.number().int().min(1),
  reason: z.string().min(10).max(500).optional().nullable(),
  requestedPaymentMonth: z.string().regex(/^\d{4}-\d{2}$/),
});

/**
 * POST /api/v1/leave/encash
 * Submit a leave encashment request
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
    const validationResult = encashLeaveSchema.safeParse(body);
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

    // Verify employee belongs to tenant
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

    // Fetch the leave policy to verify encashment is allowed
    const policy = await prisma.leavePolicy.findFirst({
      where: {
        id: data.policyId,
        tenantId: user.tenantId,
        isActive: true,
      },
    });

    if (!policy) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3002',
            message: 'Leave policy not found',
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

    if (!policy.allowEncashment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4001',
            message: 'Leave encashment not allowed for this leave type',
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

    // Check maximum encashment days
    const maxEncashDays = policy.maxEncashmentDays ? Number(policy.maxEncashmentDays) : null;
    if (maxEncashDays !== null && data.numberOfDays > maxEncashDays) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: `Maximum encashment allowed is ${maxEncashDays} days`,
            details: { maxEncashmentDays: maxEncashDays, requested: data.numberOfDays },
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

    // Get the employee's current leave balance
    const currentYear = new Date().getFullYear();
    const balance = await prisma.leaveBalance.findFirst({
      where: {
        tenantId: user.tenantId,
        employeeId: data.employeeId,
        policyId: data.policyId,
        leaveYear: currentYear,
      },
    });

    if (!balance) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4002',
            message: 'No leave balance record found for this policy and year',
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

    const currentBalance = Number(balance.currentBalance);
    if (currentBalance < data.numberOfDays) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4002',
            message: 'Insufficient leave balance for encashment',
            details: {
              currentBalance,
              requested: data.numberOfDays,
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

    // Calculate encashment amount
    // dailyRate is a placeholder - in production this would come from payroll/salary data
    // Using encashmentRate as percentage of calculated daily rate
    const encashmentRate = Number(policy.encashmentRate);
    // We store a placeholder daily rate; actual rate would come from payroll integration
    const dailyRate = 0; // Will be computed by payroll service
    const totalAmount = dailyRate * data.numberOfDays * (encashmentRate / 100);

    // Create the encashment record
    const encashment = await prisma.leaveEncashment.create({
      data: {
        tenantId: user.tenantId,
        employeeId: data.employeeId,
        leaveTypeId: policy.leaveTypeId,
        policyId: data.policyId,
        requestedDays: data.numberOfDays,
        eligibleDays: Math.min(data.numberOfDays, maxEncashDays ?? data.numberOfDays),
        calculationBasis: 'BASIC',
        dailyRate,
        totalAmount,
        encashmentRate,
        trigger: 'ON_REQUEST',
        reason: data.reason ?? undefined,
        status: 'PENDING',
        payrollMonth: data.requestedPaymentMonth,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: encashment.id,
          tenantId: encashment.tenantId,
          employeeId: encashment.employeeId,
          leaveTypeId: encashment.leaveTypeId,
          policyId: encashment.policyId,
          requestedDays: Number(encashment.requestedDays),
          eligibleDays: Number(encashment.eligibleDays),
          approvedDays: encashment.approvedDays ? Number(encashment.approvedDays) : null,
          calculationBasis: encashment.calculationBasis,
          dailyRate: Number(encashment.dailyRate),
          totalAmount: Number(encashment.totalAmount),
          encashmentRate: Number(encashment.encashmentRate),
          trigger: encashment.trigger,
          reason: encashment.reason,
          status: encashment.status,
          currentBalance,
          balanceAfterEncashment: currentBalance - data.numberOfDays,
          payrollMonth: encashment.payrollMonth,
          createdAt: encashment.createdAt.toISOString(),
          updatedAt: encashment.updatedAt.toISOString(),
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
    console.error('[Leave Encashment API] POST Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to submit leave encashment request',
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
