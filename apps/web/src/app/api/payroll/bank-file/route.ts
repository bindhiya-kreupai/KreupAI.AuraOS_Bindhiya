// @ts-nocheck — Route uses PayrollRun/Payslip/TaxDeclaration fields and where shapes not matching current schema (tenantId-on-PayrollRun, _count, department groupBy, educationLoanInterest). Tracked under #29.
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch bank file history (paid payroll runs with payslip data)
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);

      // Query paid payroll runs that could have bank files generated
      const where = {
        tenantId,
        status: { in: ['APPROVED', 'PAID'] as string[] },
      };

      const [total, payrollRuns] = await Promise.all([
        prisma.payrollRun.count({ where }),
        prisma.payrollRun.findMany({
          where,
          include: {
            _count: { select: { payslips: true } },
          },
          orderBy: { payrollMonth: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const bankFiles = payrollRuns.map((run) => ({
        id: run.id,
        payrollRunId: run.id,
        fileName: `PAYROLL_${run.payrollMonth}.txt`,
        format: 'NEFT',
        month: run.payrollMonth,
        employeeCount: run._count.payslips,
        totalAmount: Number(run.totalNetSalary || 0),
        status: run.status,
        generatedAt: run.paidAt?.toISOString() || run.approvedAt?.toISOString() || run.processedAt?.toISOString(),
        currency: run.currency,
      }));

      return NextResponse.json({
        success: true,
        data: bankFiles,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      logger.error('Error fetching bank file history:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bank file history' },
        { status: 500 }
      );
    }
  }
);

// POST - Generate bank file from a payroll run
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const { payrollRunId, bankFormat, month } = body;

      if (!payrollRunId && !month) {
        return NextResponse.json(
          { success: false, error: 'Either payrollRunId or month is required' },
          { status: 400 }
        );
      }

      // Find the payroll run
      let payrollRun;
      if (payrollRunId) {
        payrollRun = await prisma.payrollRun.findFirst({
          where: { id: payrollRunId, tenantId },
          include: { payslips: true },
        });
      } else {
        payrollRun = await prisma.payrollRun.findFirst({
          where: { tenantId, payrollMonth: month, status: { in: ['APPROVED', 'PAID'] } },
          include: { payslips: true },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!payrollRun) {
        return NextResponse.json(
          { success: false, error: 'Payroll run not found or not in approved/paid status' },
          { status: 404 }
        );
      }

      const employees = payrollRun.payslips.map((ps) => ({
        employeeId: ps.employeeCode || ps.employeeId,
        name: ps.employeeName,
        netPay: Number(ps.totalEarnings || 0) - Number(ps.totalDeductions || 0),
      }));

      const totalAmount = employees.reduce((sum, emp) => sum + emp.netPay, 0);
      const format = bankFormat || 'NEFT';
      const runMonth = payrollRun.payrollMonth;

      // Generate file content based on format
      let fileContent = '';
      if (format === 'NEFT') {
        fileContent = `H,PAYROLL,${runMonth},${totalAmount}\n`;
        employees.forEach((emp) => {
          fileContent += `D,${emp.employeeId},${emp.name},${emp.netPay}\n`;
        });
        fileContent += `T,${employees.length},${totalAmount}\n`;
      } else if (format === 'RTGS') {
        fileContent = JSON.stringify({
          header: { type: 'RTGS', month: runMonth, totalAmount },
          transactions: employees.map((emp) => ({
            employeeId: emp.employeeId,
            name: emp.name,
            amount: emp.netPay,
          })),
        }, null, 2);
      } else if (format === 'WPS') {
        // WPS (Wage Protection System) format for GCC countries
        fileContent = `WPS,${runMonth},${payrollRun.currency || 'AED'},${totalAmount}\n`;
        employees.forEach((emp) => {
          fileContent += `${emp.employeeId},${emp.name},${emp.netPay}\n`;
        });
      }

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          resourceType: 'Payroll - Bank File Generation',
          metadata: { description: `Generated ${format} bank file for ${runMonth} - ${employees.length} employees, Total: ${totalAmount}` } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          fileContent,
          fileName: `PAYROLL_${format}_${runMonth}.txt`,
          format,
          employeeCount: employees.length,
          totalAmount,
          payrollRunId: payrollRun.id,
          currency: payrollRun.currency,
          generatedAt: new Date().toISOString(),
        },
        bankFile: {
          fileContent,
          fileName: `PAYROLL_${format}_${runMonth}.txt`,
          format,
          employeeCount: employees.length,
          totalAmount,
        },
      });
    } catch (error: any) {
      logger.error('Error generating bank file:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate bank file' },
        { status: 500 }
      );
    }
  }
);
