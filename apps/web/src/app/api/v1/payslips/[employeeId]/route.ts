export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

/**
 * GET /api/v1/payslips/:employeeId
 * Get payslips for a specific employee
 *
 * Query Parameters:
 * - limit (optional): Number of records (default: 12, max: 24)
 * - page (optional): Page number (default: 1)
 * - month (optional): Specific month in YYYY-MM format
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { params: Promise<{ employeeId: string }> }) => {
    try {
      const { employeeId } = await context.params;
      const user = (context as unknown as { user: { tenantId: string; userId: string } }).user;
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const limit = Math.min(
        parseInt(searchParams.get('limit') || '12'),
        24
      );
      const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
      const skip = (page - 1) * limit;
      const month = searchParams.get('month');

      // Verify employee belongs to this tenant
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, tenantId },
        select: { id: true },
      });

      if (!employee) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee not found in this tenant',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        }, { status: 404 });
      }

      // Build where clause for payslips
      // Payslips are linked through PayrollRun which has tenantId
      const where: Record<string, unknown> = {
        employeeId,
        payrollRun: { tenantId },
      };

      if (month) {
        where.payrollRun = { tenantId, payrollMonth: month };
      }

      const [payslips, total] = await Promise.all([
        prisma.payslip.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
          select: {
            id: true,
            payrollRunId: true,
            employeeId: true,
            employeeCode: true,
            employeeName: true,
            basicSalary: true,
            totalEarnings: true,
            totalDeductions: true,
            grossSalary: true,
            netSalary: true,
            status: true,
            pdfUrl: true,
            createdAt: true,
            payrollRun: {
              select: {
                payrollMonth: true,
                currency: true,
              },
            },
          },
        }),
        prisma.payslip.count({ where }),
      ]);

      const data = payslips.map((p) => ({
        id: p.id,
        payrollRunId: p.payrollRunId,
        employeeId: p.employeeId,
        employeeCode: p.employeeCode,
        employeeName: p.employeeName,
        month: p.payrollRun.payrollMonth,
        basicSalary: Number(p.basicSalary),
        totalEarnings: Number(p.totalEarnings),
        totalDeductions: Number(p.totalDeductions),
        grossSalary: Number(p.grossSalary),
        netSalary: Number(p.netSalary),
        currency: p.payrollRun.currency,
        status: p.status,
        pdfUrl: p.pdfUrl,
        createdAt: p.createdAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data,
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      }, { status: 200 });
    } catch (error) {
      console.error('[Payslips API] GET Error:', error);

      return NextResponse.json({
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch payslips',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      }, { status: 500 });
    }
  }
);
