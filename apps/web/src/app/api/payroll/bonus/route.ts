import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const BonusSchema = z.object({
  employeeId: z.string(),
  name: z.string().min(1),
  amount: z.number().positive(),
  payrollMonth: z.string().optional(),
  reason: z.string().optional(),
});

// GET - Fetch bonus entries
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: Record<string, unknown> = {
      tenantId,
      category: 'BONUS',
    };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.approvalStatus = status;

    const [total, adjustments] = await Promise.all([
      prisma.payrollAdjustment.count({ where }),
      prisma.payrollAdjustment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Map to frontend bonus shape
    const bonuses = adjustments.map((adj) => ({
      id: adj.id,
      employeeId: adj.employeeId,
      name: adj.name,
      code: adj.code,
      amount: Number(adj.amount),
      reason: adj.reason,
      payrollMonth: adj.payrollMonth,
      status: adj.approvalStatus,
      isProcessed: adj.isProcessed,
      adjustmentType: adj.adjustmentType,
      createdAt: adj.createdAt?.toISOString(),
      createdBy: adj.createdBy,
      approvedBy: adj.approvedBy,
      approvedAt: adj.approvedAt?.toISOString(),
    }));

    // Group by payrollMonth for cycle view
    const cycleMap = new Map<
      string,
      { month: string; totalPool: number; count: number; items: typeof bonuses }
    >();
    for (const bonus of bonuses) {
      const month = bonus.payrollMonth || 'unscheduled';
      if (!cycleMap.has(month)) {
        cycleMap.set(month, { month, totalPool: 0, count: 0, items: [] });
      }
      const cycle = cycleMap.get(month)!;
      cycle.totalPool += bonus.amount;
      cycle.count += 1;
      cycle.items.push(bonus);
    }

    return NextResponse.json({
      success: true,
      data: bonuses,
      bonuses,
      cycles: Array.from(cycleMap.values()),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Error fetching bonus cycles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bonus cycles' },
      { status: 500 }
    );
  }
});

// POST - Create bonus entry
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const body = await request.json();
    const data = BonusSchema.parse(body);

    const currentMonth = data.payrollMonth || new Date().toISOString().slice(0, 7);

    const adjustment = await prisma.payrollAdjustment.create({
      data: {
        tenantId,
        employeeId: data.employeeId,
        payrollMonth: currentMonth,
        adjustmentType: 'EARNING',
        code: `BONUS-${data.name.toUpperCase().replace(/\s+/g, '-')}`,
        name: data.name,
        amount: data.amount,
        reason: data.reason || `Bonus: ${data.name}`,
        category: 'BONUS',
        approvalStatus: 'PENDING',
        createdBy: user.userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'CREATE',
        module: 'Payroll - Bonus Processing',
        resourceType: 'Payroll - Bonus Processing',
        metadata: { description: `Created bonus: ${data.name} - $${data.amount}` } as any,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: adjustment,
        bonus: adjustment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error creating bonus cycle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bonus cycle' },
      { status: 500 }
    );
  }
});
