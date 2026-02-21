import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const ReimbursementSchema = z.object({
  employeeId: z.string(),
  type: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().optional(),
  payrollMonth: z.string().optional(),
});

// GET - Fetch reimbursement claims
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
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
        category: 'REIMBURSEMENT',
        adjustmentType: 'EARNING',
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

      // Map to frontend-expected shape
      const claims = adjustments.map((adj) => ({
        id: adj.id,
        employeeId: adj.employeeId,
        type: adj.name,
        code: adj.code,
        amount: Number(adj.amount),
        description: adj.reason,
        date: adj.createdAt?.toISOString(),
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
        data: claims,
        claims,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      logger.error('Error fetching reimbursements:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reimbursements' },
        { status: 500 }
      );
    }
  }
);

// POST - Create reimbursement claim
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const data = ReimbursementSchema.parse(body);

      const currentMonth = data.payrollMonth || new Date().toISOString().slice(0, 7);

      const adjustment = await prisma.payrollAdjustment.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          payrollMonth: currentMonth,
          adjustmentType: 'EARNING',
          code: `REIMB-${data.type.toUpperCase().replace(/\s+/g, '-')}`,
          name: data.type,
          amount: data.amount,
          reason: data.description || `Reimbursement: ${data.type}`,
          category: 'REIMBURSEMENT',
          approvalStatus: 'PENDING',
          createdBy: user.userId,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Reimbursements',
          details: `Created reimbursement claim: ${data.type} - $${data.amount}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: adjustment,
        claim: adjustment,
      }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating reimbursement:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create reimbursement' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update reimbursement status
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
        where: { id, tenantId, category: 'REIMBURSEMENT' },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Reimbursement not found' },
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
          module: 'Payroll - Reimbursements',
          details: `Updated reimbursement claim status to: ${status}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated, claim: updated });
    } catch (error) {
      logger.error('Error updating reimbursement:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update reimbursement' },
        { status: 500 }
      );
    }
  }
);
