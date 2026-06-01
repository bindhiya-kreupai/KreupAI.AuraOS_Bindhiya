import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const ArrearSchema = z.object({
  employeeId: z.string(),
  type: z.string().min(1),
  amount: z.number(),
  effectiveMonth: z.string(),
  reason: z.string().optional(),
  payrollMonth: z.string().optional(),
});

// GET - Fetch arrears
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);

      const where: Record<string, unknown> = {
        tenantId,
        category: 'ARREAR',
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

      const arrears = adjustments.map((adj) => ({
        id: adj.id,
        employeeId: adj.employeeId,
        type: adj.name,
        code: adj.code,
        amount: Number(adj.amount),
        effectiveMonth: adj.payrollMonth,
        reason: adj.reason,
        status: adj.approvalStatus,
        isProcessed: adj.isProcessed,
        adjustmentType: adj.adjustmentType,
        createdAt: adj.createdAt?.toISOString(),
        createdBy: adj.createdBy,
        processedInRun: adj.processedInRun,
      }));

      return NextResponse.json({
        success: true,
        data: arrears,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      logger.error('Error fetching arrears:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch arrears' },
        { status: 500 }
      );
    }
  }
);

// POST - Create arrear
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const data = ArrearSchema.parse(body);

      const adjustment = await prisma.payrollAdjustment.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          payrollMonth: data.payrollMonth || data.effectiveMonth,
          adjustmentType: data.amount >= 0 ? 'EARNING' : 'DEDUCTION',
          code: `ARREAR-${data.type.toUpperCase().replace(/\s+/g, '-')}`,
          name: data.type,
          amount: Math.abs(data.amount),
          reason: data.reason || `Arrear: ${data.type} for ${data.effectiveMonth}`,
          category: 'ARREAR',
          approvalStatus: 'PENDING',
          createdBy: user.userId,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Arrears Management',
          details: `Created arrear: ${data.type} - $${data.amount}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: adjustment }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating arrear:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create arrear' },
        { status: 500 }
      );
    }
  }
);
