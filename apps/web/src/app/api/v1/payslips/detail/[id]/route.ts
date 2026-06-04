export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

/**
 * GET /api/v1/payslips/detail/:id
 * Get detailed payslip information including all earnings and deductions breakdown
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      const user = (context as unknown as { user: { tenantId: string; userId: string } }).user;
      const tenantId = user.tenantId;
      const permissions = (context as unknown as { permissions: string[] }).permissions ?? [];
      if (!permissions.includes('payslips:read')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing payslips:read permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }

      // tenant-ok: where clause filters on payrollRun.tenantId via relation
      const payslip = await prisma.payslip.findFirst({
        where: {
          id,
          payrollRun: { tenantId },
        },
        include: {
          payrollRun: {
            select: {
              payrollMonth: true,
              currency: true,
              paidAt: true,
            },
          },
        },
      });

      if (!payslip) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: 'Payslip not found',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 404 }
        );
      }

      const data = {
        id: payslip.id,
        payrollRunId: payslip.payrollRunId,
        employeeId: payslip.employeeId,
        employeeCode: payslip.employeeCode,
        employeeName: payslip.employeeName,
        month: payslip.payrollRun.payrollMonth,

        // Salary Structure
        basicSalary: Number(payslip.basicSalary),

        // Earnings breakdown
        earnings: payslip.earnings,
        totalEarnings: Number(payslip.totalEarnings),

        // Deductions breakdown
        deductions: payslip.deductions,
        totalDeductions: Number(payslip.totalDeductions),

        // Statutory contributions - employee
        employeePF: Number(payslip.employeePF),
        employeeESI: Number(payslip.employeeESI),
        employeePension: Number(payslip.employeePension),
        employeeTDS: Number(payslip.employeeTDS),
        employeeSaned: Number(payslip.employeeSaned),
        totalStatutoryEmployee: Number(payslip.totalStatutoryEmployee),

        // Statutory contributions - employer
        employerPF: Number(payslip.employerPF),
        employerESI: Number(payslip.employerESI),
        employerPension: Number(payslip.employerPension),
        employerGOSI: Number(payslip.employerGOSI),
        totalStatutoryEmployer: Number(payslip.totalStatutoryEmployer),

        // Calculations
        grossSalary: Number(payslip.grossSalary),
        netSalary: Number(payslip.netSalary),

        // Attendance & overtime
        workingDays: payslip.workingDays,
        paidDays: Number(payslip.paidDays),
        lopDays: Number(payslip.lopDays),
        overtimeHours: Number(payslip.overtimeHours),
        overtimeAmount: Number(payslip.overtimeAmount),

        // Status & metadata
        currency: payslip.payrollRun.currency,
        status: payslip.status,
        pdfUrl: payslip.pdfUrl,
        paidAt: payslip.payrollRun.paidAt?.toISOString() || null,
        createdAt: payslip.createdAt.toISOString(),
      };

      return NextResponse.json(
        {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('[Payslip Detail API] GET Error:', error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to fetch payslip',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 500 }
      );
    }
  }
);
