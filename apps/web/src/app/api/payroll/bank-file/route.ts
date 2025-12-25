import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@aura/database';

// POST - Generate bank file
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { payrollRunId, bankFormat, month } = body;

      if (!payrollRunId && !month) {
        return NextResponse.json(
          { success: false, error: 'Either payrollRunId or month is required' },
          { status: 400 }
        );
      }

      // Mock bank file data
      const mockEmployees = [
        {
          employeeId: 'EMP-001',
          name: 'Sarah Jenkins',
          accountNumber: '1234567890',
          ifscCode: 'HDFC0001234',
          netPay: 9000,
        },
        {
          employeeId: 'EMP-002',
          name: 'Mike Chen',
          accountNumber: '2345678901',
          ifscCode: 'ICIC0002345',
          netPay: 7800,
        },
      ];

      const totalAmount = mockEmployees.reduce((sum, emp) => sum + emp.netPay, 0);

      let fileContent = '';
      const format = bankFormat || 'NEFT';

      // Generate file based on format
      if (format === 'NEFT') {
        // NEFT format (simplified)
        fileContent = 'H,PAYROLL,' + month + ',' + totalAmount + '\n';
        mockEmployees.forEach(emp => {
          fileContent += `D,${emp.accountNumber},${emp.ifscCode},${emp.name},${emp.netPay}\n`;
        });
        fileContent += `T,${mockEmployees.length},${totalAmount}\n`;
      } else if (format === 'RTGS') {
        // RTGS format (simplified)
        fileContent = JSON.stringify({
          header: { type: 'RTGS', month, totalAmount },
          transactions: mockEmployees.map(emp => ({
            accountNumber: emp.accountNumber,
            ifscCode: emp.ifscCode,
            name: emp.name,
            amount: emp.netPay,
          })),
        }, null, 2);
      }

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Bank File Generation',
          details: `Generated ${format} bank file for ${month} - ${mockEmployees.length} employees, Total: $${totalAmount}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          fileContent,
          fileName: `PAYROLL_${format}_${month}.txt`,
          format,
          employeeCount: mockEmployees.length,
          totalAmount,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch {
      logger.error('Error generating bank file:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate bank file' },
        { status: 500 }
      );
    }
  }
);

// GET - Fetch bank file history
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      // Mock history data
      const mockHistory = [
        {
          id: '1',
          fileName: 'PAYROLL_NEFT_2024-08.txt',
          format: 'NEFT',
          month: '2024-08',
          employeeCount: 50,
          totalAmount: 420000,
          generatedAt: new Date('2024-08-28').toISOString(),
          generatedBy: 'admin',
        },
        {
          id: '2',
          fileName: 'PAYROLL_RTGS_2024-07.txt',
          format: 'RTGS',
          month: '2024-07',
          employeeCount: 48,
          totalAmount: 385000,
          generatedAt: new Date('2024-07-28').toISOString(),
          generatedBy: 'admin',
        },
      ];

      return NextResponse.json({
        success: true,
        data: mockHistory,
        meta: { total: mockHistory.length },
      });
    } catch {
      logger.error('Error fetching bank file history:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bank file history' },
        { status: 500 }
      );
    }
  }
);
