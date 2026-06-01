import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const OffCyclePaymentSchema = z.object({
  employeeId: z.string(),
  type: z.enum(['BONUS', 'COMMISSION', 'REIMBURSEMENT', 'ADVANCE', 'OTHER']),
  amount: z.number().positive(),
  paymentDate: z.string(),
  reason: z.string().min(1),
  description: z.string().optional(),
  payrollMonth: z.string().optional(),
});

// GET - Fetch off-cycle payments
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status');
      const type = searchParams.get('type');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);

      // Off-cycle payments are PayrollAdjustments that are not part of the regular cycle
      // We use category 'OTHER' or look for specific off-cycle markers
      const where: Record<string, unknown> = { tenantId };
      if (employeeId) where.employeeId = employeeId;
      if (status) where.approvalStatus = status;
      if (type) {
        // Map off-cycle type to category
        const categoryMap: Record<string, string> = {
          BONUS: 'BONUS',
          COMMISSION: 'OTHER',
          REIMBURSEMENT: 'REIMBURSEMENT',
          ADVANCE: 'RECOVERY',
          OTHER: 'OTHER',
        };
        where.category = categoryMap[type] || 'OTHER';
      }
      // Off-cycle payments are those not yet processed
      where.isProcessed = false;

      const [total, adjustments] = await Promise.all([
        prisma.payrollAdjustment.count({ where }),
        prisma.payrollAdjustment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const payments = adjustments.map((adj) => ({
        id: adj.id,
        employeeId: adj.employeeId,
        type: adj.category,
        name: adj.name,
        amount: Number(adj.amount),
        reason: adj.reason,
        payrollMonth: adj.payrollMonth,
        status: adj.approvalStatus,
        adjustmentType: adj.adjustmentType,
        isProcessed: adj.isProcessed,
        createdAt: adj.createdAt?.toISOString(),
        createdBy: adj.createdBy,
        approvedBy: adj.approvedBy,
        approvedAt: adj.approvedAt?.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: payments,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      logger.error('Error fetching off-cycle payments:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch off-cycle payments' },
        { status: 500 }
      );
    }
  }
);

// POST - Create off-cycle payment
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const data = OffCyclePaymentSchema.parse(body);

      const currentMonth = data.payrollMonth || new Date().toISOString().slice(0, 7);
      const categoryMap: Record<string, string> = {
        BONUS: 'BONUS',
        COMMISSION: 'OTHER',
        REIMBURSEMENT: 'REIMBURSEMENT',
        ADVANCE: 'RECOVERY',
        OTHER: 'OTHER',
      };
      const adjustmentTypeMap: Record<string, 'EARNING' | 'DEDUCTION'> = {
        BONUS: 'EARNING',
        COMMISSION: 'EARNING',
        REIMBURSEMENT: 'EARNING',
        ADVANCE: 'DEDUCTION',
        OTHER: 'EARNING',
      };

      const adjustment = await prisma.payrollAdjustment.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          payrollMonth: currentMonth,
          adjustmentType: adjustmentTypeMap[data.type] || 'EARNING',
          code: `OFFCYCLE-${data.type}`,
          name: data.reason,
          amount: data.amount,
          reason: data.description || `Off-cycle payment: ${data.type} - ${data.reason}`,
          category: categoryMap[data.type] || 'OTHER',
          approvalStatus: 'PENDING',
          createdBy: user.userId,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Off-Cycle Payments',
          details: `Created off-cycle payment: ${data.type} - $${data.amount}`,
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
      logger.error('Error creating off-cycle payment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create off-cycle payment' },
        { status: 500 }
      );
    }
  }
);

// PUT - Approve/Reject off-cycle payment
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const { id, status } = body;

      if (!id || !status) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: id, status' },
          { status: 400 }
        );
      }

      // Verify ownership
      const existing = await prisma.payrollAdjustment.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Off-cycle payment not found' },
          { status: 404 }
        );
      }

      const updateData: Record<string, unknown> = {
        approvalStatus: status,
      };
      if (status === 'APPROVED') {
        updateData.approvedBy = user.userId;
        updateData.approvedAt = new Date();
      }

      const updated = await prisma.payrollAdjustment.update({
        where: { id },
        data: updateData,
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Payroll - Off-Cycle Payments',
          details: `Updated off-cycle payment status to: ${status}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('Error updating off-cycle payment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update off-cycle payment' },
        { status: 500 }
      );
    }
  }
);
