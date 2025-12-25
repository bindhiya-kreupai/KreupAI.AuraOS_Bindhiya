import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch year-end processing status
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const fiscalYear = searchParams.get('fiscalYear') || new Date().getFullYear().toString();

      const mockYearEndData = {
        fiscalYear,
        status: 'IN_PROGRESS',
        checklist: [
          { id: '1', task: 'Generate Form 16 for all employees', status: 'COMPLETED', completedAt: '2024-03-15' },
          { id: '2', task: 'Process final tax deductions', status: 'COMPLETED', completedAt: '2024-03-20' },
          { id: '3', task: 'Calculate leave encashment', status: 'IN_PROGRESS', completedAt: null },
          { id: '4', task: 'Generate PF annual statements', status: 'PENDING', completedAt: null },
          { id: '5', task: 'Prepare statutory returns', status: 'PENDING', completedAt: null },
        ],
        summary: {
          totalEmployees: 50,
          form16Generated: 50,
          finalTaxProcessed: 50,
          leaveEncashment: 0,
          pfStatementsGenerated: 0,
        },
        deadlines: {
          form16: '2024-05-31',
          pfReturns: '2024-04-15',
          esiReturns: '2024-04-15',
          tdsReturns: '2024-05-31',
        },
      };

      return NextResponse.json({
        success: true,
        data: mockYearEndData,
      });
    } catch (error) {
      logger.error('Error fetching year-end data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch year-end data' },
        { status: 500 }
      );
    }
  }
);

// POST - Process year-end task
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { fiscalYear, taskId, action } = body;

      if (!fiscalYear || !taskId) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: fiscalYear, taskId' },
          { status: 400 }
        );
      }

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Year-End Processing',
          details: `Processed year-end task: ${taskId} for FY ${fiscalYear}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      const result = {
        taskId,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        processedBy: user.userId,
      };

      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error processing year-end task:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to process year-end task' },
        { status: 500 }
      );
    }
  }
);
