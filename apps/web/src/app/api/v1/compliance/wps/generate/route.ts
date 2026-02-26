import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/compliance/wps/generate
 * Generate a WPS (Wage Protection System) SIF file for UAE payroll
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    const { payrollMonth, companyId, payrollRunId } = body;

    if (!payrollMonth || !companyId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'payrollMonth and companyId are required' },
        },
        { status: 400 }
      );
    }

    // Get WPS configuration for this company
    const wpsConfig = await prisma.wPSConfiguration.findFirst({
      where: { tenantId: user.tenantId, companyId, isActive: true },
    });

    if (!wpsConfig) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4001',
            message:
              'WPS configuration not found for this company. Please configure WPS settings first.',
          },
        },
        { status: 404 }
      );
    }

    // Check for existing submission for this month
    const existing = await prisma.wPSSubmission.findFirst({
      where: {
        tenantId: user.tenantId,
        payrollMonth,
        ...(payrollRunId ? { payrollRunId } : {}),
      },
    });

    if (existing && !['VALIDATION_FAILED', 'REJECTED', 'CANCELLED'].includes(existing.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3002',
            message: `WPS submission already exists for ${payrollMonth} with status: ${existing.status}`,
          },
        },
        { status: 409 }
      );
    }

    const [year, month] = payrollMonth.split('-');
    const monthNames = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    const salaryMonth = `${monthNames[parseInt(month) - 1]}${year}`;

    // Create WPS submission record
    const submission = await prisma.wPSSubmission.create({
      data: {
        tenantId: user.tenantId,
        wpsConfigId: wpsConfig.id,
        payrollRunId: payrollRunId || null,
        payrollMonth,
        payrollYear: parseInt(year),
        salaryMonth,
        status: 'VALIDATING',
        createdBy: user.id,
      },
    });

    // Get employees with payslips for this period
    const payslips = payrollRunId
      ? await prisma.payslip.findMany({
          where: { payrollRunId, tenantId: user.tenantId },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeCode: true,
              },
            },
          },
        })
      : [];

    const records: any[] = [];
    let lineNumber = 1;
    let totalAmount = 0;

    for (const payslip of payslips) {
      const netSalary = Number(payslip.netSalary || 0);
      totalAmount += netSalary;

      const wpsRecord = await prisma.wPSRecord.create({
        data: {
          tenantId: user.tenantId,
          submissionId: submission.id,
          employeeId: payslip.employeeId,
          agentId: wpsConfig.wpsAgentCode,
          labourCardNumber: `LC${payslip.employee.employeeCode}`,
          personCode: payslip.employee.employeeCode,
          employeeName: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
          nationality: 'IN', // Default - should come from employee profile
          bankRoutingCode: wpsConfig.bankCode,
          accountNumber: `ACC${payslip.employee.employeeCode}`,
          basicSalary: payslip.basicSalary || 0,
          allowances: payslip.totalAllowances || 0,
          deductions: payslip.totalDeductions || 0,
          netSalary,
          leaveSalary: 0,
          salaryMonth,
          workingDays: 30,
          actualDays: 30,
          lineNumber,
          status: 'PENDING',
        },
      });

      records.push(wpsRecord);
      lineNumber++;
    }

    // Update submission totals
    const updatedSubmission = await prisma.wPSSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'VALIDATED',
        totalRecords: records.length,
        totalAmount,
        successCount: records.length,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          submission: updatedSubmission,
          recordCount: records.length,
          totalAmount,
          salaryMonth,
          wpsConfigId: wpsConfig.id,
        },
        message: 'WPS file generated successfully. Ready for submission.',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[WPS Generate API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to generate WPS file',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
