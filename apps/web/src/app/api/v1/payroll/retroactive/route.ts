export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const retroactiveSchema = z.object({
  employeeId: z.string().uuid('Valid employee ID is required'),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective date must be in YYYY-MM-DD format'),
  reason: z.enum(['salary_increase', 'promotion', 'correction', 'reclassification']),
  previousRate: z.number().positive('Previous rate must be positive'),
  newRate: z.number().positive('New rate must be positive'),
  rateType: z.enum(['hourly', 'salary']).default('salary'),
  payrollMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Payroll month must be in YYYY-MM format').optional(),
});

/**
 * POST /api/v1/payroll/retroactive
 * Create a PayrollAdjustment for retroactive pay
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const body = await request.json();

    // Validate request body
    const validationResult = retroactiveSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
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
      }, { status: 400 });
    }

    const { employeeId, effectiveDate, reason, previousRate, newRate, rateType, payrollMonth } = validationResult.data;

    // Verify employee belongs to this tenant
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!employee) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'E3001',
          message: 'Employee not found in this tenant',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      }, { status: 404 });
    }

    // Calculate retroactive amount
    // Find the payroll runs between the effective date and now
    const effectiveMonth = effectiveDate.slice(0, 7); // YYYY-MM
    const currentMonth = new Date().toISOString().slice(0, 7);

    const affectedRuns = await prisma.payrollRun.findMany({
      where: {
        tenantId,
        payrollMonth: {
          gte: effectiveMonth,
          lte: currentMonth,
        },
        status: { in: ['PAID', 'APPROVED', 'CALCULATED'] },
      },
      select: {
        id: true,
        payrollMonth: true,
      },
      orderBy: { payrollMonth: 'asc' },
    });

    const periodsAffected = Math.max(affectedRuns.length, 1);
    const rateDifference = newRate - previousRate;
    const hoursPerPeriod = rateType === 'hourly' ? 80 : 1;
    const retroactiveAmount = rateDifference * hoursPerPeriod * periodsAffected;
    const taxAdjustment = retroactiveAmount * 0.30; // Estimated tax impact
    const netRetroactivePay = retroactiveAmount - taxAdjustment;

    // Determine which month to apply the adjustment
    const targetMonth = payrollMonth || currentMonth;

    // Create the payroll adjustment
    const adjustment = await prisma.payrollAdjustment.create({
      data: {
        tenantId,
        employeeId,
        payrollMonth: targetMonth,
        adjustmentType: 'EARNING',
        code: 'RETRO_PAY',
        name: `Retroactive pay - ${reason.replace('_', ' ')}`,
        amount: Math.round(retroactiveAmount * 100) / 100,
        reason: `Retroactive pay adjustment: ${reason.replace('_', ' ')} effective ${effectiveDate}. Rate changed from ${previousRate} to ${newRate} (${rateType}). Affects ${periodsAffected} pay period(s).`,
        category: 'ARREAR',
        requiresApproval: true,
        approvalStatus: 'PENDING',
        createdBy: user.userId,
      },
    });

    // Build affected pay periods detail
    const affectedPayPeriods = affectedRuns.length > 0
      ? affectedRuns.map((run) => {
          const [year, month] = run.payrollMonth.split('-').map(Number);
          const lastDay = new Date(year, month, 0).getDate();
          return {
            periodStart: `${run.payrollMonth}-01`,
            periodEnd: `${run.payrollMonth}-${String(lastDay).padStart(2, '0')}`,
            difference: Math.round((rateDifference * hoursPerPeriod) * 100) / 100,
          };
        })
      : [{
          periodStart: `${effectiveMonth}-01`,
          periodEnd: `${currentMonth}-28`,
          difference: Math.round(retroactiveAmount * 100) / 100,
        }];

    return NextResponse.json({
      success: true,
      data: {
        calculationId: adjustment.id,
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        reason,
        effectiveDate,
        periodsAffected,
        previousRate,
        newRate,
        rateDifference: Math.round(rateDifference * 100) / 100,
        retroactiveAmount: Math.round(retroactiveAmount * 100) / 100,
        taxAdjustment: Math.round(taxAdjustment * 100) / 100,
        netRetroactivePay: Math.round(netRetroactivePay * 100) / 100,
        affectedPayPeriods,
        status: 'calculated',
        approvalStatus: adjustment.approvalStatus,
        createdAt: adjustment.createdAt.toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[Retroactive Pay API] POST Error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to calculate retroactive pay',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    }, { status: 500 });
  }
});
