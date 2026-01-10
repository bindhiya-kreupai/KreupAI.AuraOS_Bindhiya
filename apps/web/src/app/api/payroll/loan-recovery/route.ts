import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const LoanSchema = z.object({
  employeeId: z.string(),
  loanType: z.string().min(1),
  principalAmount: z.number().positive(),
  interestRate: z.number().min(0),
  tenure: z.number().int().positive(),
  startDate: z.string(),
});

// GET - Fetch loan recovery schedule
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status');

      // Mock data - replace with actual database query
      const mockLoans = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'Sarah Jenkins',
          loanType: 'Personal Loan',
          principalAmount: 50000,
          interestRate: 8.5,
          tenure: 24,
          startDate: '2024-01-01',
          emiAmount: 2270,
          remainingEMIs: 18,
          totalPaid: 13620,
          status: 'ACTIVE',
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Mike Chen',
          loanType: 'Emergency Loan',
          principalAmount: 20000,
          interestRate: 6.0,
          tenure: 12,
          startDate: '2024-06-01',
          emiAmount: 1720,
          remainingEMIs: 9,
          totalPaid: 5160,
          status: 'ACTIVE',
        },
      ];

      let filteredData = mockLoans;
      if (employeeId) {
        filteredData = mockLoans.filter(loan => loan.employeeId === employeeId);
      }
      if (status) {
        filteredData = filteredData.filter(loan => loan.status === status);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error('Error fetching loan recovery:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch loan recovery' },
        { status: 500 }
      );
    }
  }
);

// POST - Create loan
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = LoanSchema.parse(body);

      // Calculate EMI using reducing balance method
      const monthlyRate = data.interestRate / 12 / 100;
      const emiAmount = monthlyRate > 0
        ? (data.principalAmount * monthlyRate * Math.pow(1 + monthlyRate, data.tenure)) /
          (Math.pow(1 + monthlyRate, data.tenure) - 1)
        : data.principalAmount / data.tenure;

      const newLoan = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        emiAmount: Math.round(emiAmount * 100) / 100,
        remainingEMIs: data.tenure,
        totalPaid: 0,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Loan Recovery',
          details: `Created loan: ${data.loanType} - $${data.principalAmount} for ${data.tenure} months`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newLoan }, { status: 201 });
    } catch (error) {
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
