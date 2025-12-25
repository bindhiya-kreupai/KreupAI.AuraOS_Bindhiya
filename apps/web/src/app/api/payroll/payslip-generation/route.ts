import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// POST - Generate payslips for payroll run
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { payrollRunId, month, format = 'PDF', language = 'en' } = body;

      if (!payrollRunId && !month) {
        return NextResponse.json(
          { success: false, error: 'Either payrollRunId or month is required' },
          { status: 400 }
        );
      }

      // Mock payslip generation
      const mockEmployees = [
        { id: 'emp-1', name: 'Sarah Jenkins', netPay: 9000 },
        { id: 'emp-2', name: 'Mike Chen', netPay: 7800 },
        { id: 'emp-3', name: 'Jessica Wu', netPay: 9500 },
      ];

      const generatedPayslips = mockEmployees.map(emp => ({
        employeeId: emp.id,
        employeeName: emp.name,
        payslipId: `PS-${month}-${emp.id}`,
        format,
        language,
        downloadUrl: `/api/payroll/payslips/download/${emp.id}?month=${month}`,
        generatedAt: new Date().toISOString(),
      }));

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Payslip Generation',
          details: `Generated ${generatedPayslips.length} payslips for ${month}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          payslips: generatedPayslips,
          total: generatedPayslips.length,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch {
      logger.error('Error generating payslips:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate payslips' },
        { status: 500 }
      );
    }
  }
);

// GET - Get payslip generation status
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

      const mockStatus = {
        month,
        totalEmployees: 50,
        generated: 50,
        pending: 0,
        failed: 0,
        status: 'COMPLETED',
        generatedAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: mockStatus,
      });
    } catch {
      logger.error('Error fetching payslip generation status:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payslip generation status' },
        { status: 500 }
      );
    }
  }
);
