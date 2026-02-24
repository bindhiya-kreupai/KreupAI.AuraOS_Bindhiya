import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const GarnishmentSchema = z.object({
  employeeId: z.string(),
  type: z.string().min(1),
  amount: z.number().positive(),
  percentage: z.number().min(0).max(100).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  courtOrderNumber: z.string().optional(),
  payrollMonth: z.string().optional(),
});

// GET - Fetch garnishments
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
        category: 'GARNISHMENT',
        adjustmentType: 'DEDUCTION',
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

      const garnishments = adjustments.map((adj) => ({
        id: adj.id,
        employeeId: adj.employeeId,
        type: adj.name,
        code: adj.code,
        amount: Number(adj.amount),
        reason: adj.reason,
        payrollMonth: adj.payrollMonth,
        status: adj.approvalStatus,
        isProcessed: adj.isProcessed,
        createdAt: adj.createdAt?.toISOString(),
        createdBy: adj.createdBy,
        approvedBy: adj.approvedBy,
        approvedAt: adj.approvedAt?.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: garnishments,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      logger.error('Error fetching garnishments:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch garnishments' },
        { status: 500 }
      );
    }
  }
);

// POST - Create garnishment
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const data = GarnishmentSchema.parse(body);

      const currentMonth = data.payrollMonth || new Date().toISOString().slice(0, 7);

      const reasonParts = [`Garnishment: ${data.type}`];
      if (data.courtOrderNumber) reasonParts.push(`Court Order: ${data.courtOrderNumber}`);
      if (data.percentage) reasonParts.push(`${data.percentage}% of salary`);
      if (data.startDate) reasonParts.push(`From: ${data.startDate}`);
      if (data.endDate) reasonParts.push(`Until: ${data.endDate}`);

      const adjustment = await prisma.payrollAdjustment.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          payrollMonth: currentMonth,
          adjustmentType: 'DEDUCTION',
          code: `GARN-${data.type.toUpperCase().replace(/\s+/g, '-')}`,
          name: data.type,
          amount: data.amount,
          reason: reasonParts.join(' | '),
          category: 'GARNISHMENT',
          approvalStatus: 'APPROVED', // Garnishments from court orders are pre-approved
          createdBy: user.userId,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Garnishments',
          details: `Created garnishment: ${data.type} - $${data.amount}${data.courtOrderNumber ? ` (${data.courtOrderNumber})` : ''}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: adjustment }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating garnishment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create garnishment' },
        { status: 500 }
      );
    }
  }
);
