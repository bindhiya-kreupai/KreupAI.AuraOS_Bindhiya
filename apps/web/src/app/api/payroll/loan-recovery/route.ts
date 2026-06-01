import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const LoanSchema = z.object({
  employeeId: z.string(),
  loanType: z.string().min(1),
  principalAmount: z.number().positive(),
  interestRate: z.number().min(0).optional().default(0),
  tenure: z.number().int().positive(),
  startDate: z.string(),
  payrollMonth: z.string().optional(),
});

// GET - Fetch loan recovery schedule
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
        category: 'RECOVERY',
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

      // Map to frontend-expected loan shape
      const loans = adjustments.map((adj) => ({
        id: adj.id,
        employeeId: adj.employeeId,
        loanType: adj.name,
        code: adj.code,
        emiAmount: Number(adj.amount),
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
        data: loans,
        loans,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      logger.error('Error fetching loan recovery:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch loan recovery' },
        { status: 500 }
      );
    }
  }
);

// POST - Create loan recovery entry
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const data = LoanSchema.parse(body);

      // Calculate EMI using reducing balance method
      const monthlyRate = (data.interestRate || 0) / 12 / 100;
      const emiAmount = monthlyRate > 0
        ? (data.principalAmount * monthlyRate * Math.pow(1 + monthlyRate, data.tenure)) /
          (Math.pow(1 + monthlyRate, data.tenure) - 1)
        : data.principalAmount / data.tenure;

      const currentMonth = data.payrollMonth || new Date().toISOString().slice(0, 7);

      const adjustment = await prisma.payrollAdjustment.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          payrollMonth: currentMonth,
          adjustmentType: 'DEDUCTION',
          code: `LOAN-${data.loanType.toUpperCase().replace(/\s+/g, '-')}`,
          name: data.loanType,
          amount: Math.round(emiAmount * 100) / 100,
          reason: `Loan recovery: ${data.loanType} - Principal: ${data.principalAmount}, Rate: ${data.interestRate}%, Tenure: ${data.tenure} months`,
          category: 'RECOVERY',
          approvalStatus: 'PENDING',
          createdBy: user.userId,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Loan Recovery',
          details: `Created loan: ${data.loanType} - $${data.principalAmount} for ${data.tenure} months, EMI: $${Math.round(emiAmount * 100) / 100}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...adjustment,
          emiAmount: Math.round(emiAmount * 100) / 100,
          principalAmount: data.principalAmount,
          interestRate: data.interestRate,
          tenure: data.tenure,
        },
        loan: adjustment,
      }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating loan:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create loan' },
        { status: 500 }
      );
    }
  }
);
