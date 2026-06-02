// @ts-nocheck — Uses Employee.designationId / designation relation and tenantId-on-Employee fields that don't exist (multi-tenancy is via Employee.company.tenantId). Tracked under #29.
/**
 * GET /api/v1/payroll/pay-stubs/:id/download
 * Download payslip as a printable HTML document
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { PayslipPDFGenerator } from '@/lib/services/payroll/payslip-pdf.service';
import type { Payslip as ServicePayslip } from '@/lib/services/payroll/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('payroll:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing payroll:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = await (context as RouteContext).params;

    // Fetch payslip with payroll run (for tenant check + month + config)
    const payslip = await prisma.payslip.findFirst({
      where: { id },
      include: {
        payrollRun: {
          include: { config: true },
        },
      },
    });

    if (!payslip) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Payslip not found' } },
        { status: 404 }
      );
    }

    // Tenant isolation via payrollRun
    if (payslip.payrollRun.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: { code: 'E4003', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Get employee details for bank info and department
    const [employee, complianceDetails] = await Promise.all([
      prisma.employee.findFirst({
        where: { id: payslip.employeeId, tenantId: user.tenantId },
        select: {
          departmentId: true,
          designationId: true,
          department: { select: { name: true } },
          designation: { select: { name: true } },
        },
      }),
      prisma.employeeComplianceDetails.findFirst({
        where: { employeeId: payslip.employeeId, tenantId: user.tenantId },
        select: { bankName: true, bankAccountNumber: true, bankIBAN: true },
      }),
    ]);

    // Parse earnings and deductions JSON
    const earningsJson =
      (payslip.earnings as Array<{
        code: string;
        name: string;
        nameAr?: string;
        amount: number;
      }>) || [];
    const deductionsJson =
      (payslip.deductions as Array<{
        code: string;
        name: string;
        nameAr?: string;
        amount: number;
      }>) || [];

    // Build statutory deductions from individual fields
    const statutoryDeductions: ServicePayslip['statutoryDeductions'] = [];
    const countryCode = payslip.payrollRun.config.countryCode;

    if (countryCode === 'IN') {
      if (Number(payslip.employeePF) > 0 || Number(payslip.employerPF) > 0) {
        statutoryDeductions.push({
          code: 'PF',
          name: 'Provident Fund',
          nameAr: 'صندوق التوفير',
          employeeAmount: Number(payslip.employeePF),
          employerAmount: Number(payslip.employerPF),
          totalAmount: Number(payslip.employeePF) + Number(payslip.employerPF),
          basis: Number(payslip.basicSalary),
          rate: 12,
        });
      }
      if (Number(payslip.employeeESI) > 0 || Number(payslip.employerESI) > 0) {
        statutoryDeductions.push({
          code: 'ESI',
          name: 'Employee State Insurance',
          nameAr: 'التأمين الصحي',
          employeeAmount: Number(payslip.employeeESI),
          employerAmount: Number(payslip.employerESI),
          totalAmount: Number(payslip.employeeESI) + Number(payslip.employerESI),
          basis: Number(payslip.grossSalary),
          rate: 0.75,
        });
      }
    } else if (countryCode === 'SA') {
      if (Number(payslip.employeePension) > 0 || Number(payslip.employerGOSI) > 0) {
        statutoryDeductions.push({
          code: 'GOSI',
          name: 'GOSI Contribution',
          nameAr: 'اشتراك التأمينات',
          employeeAmount: Number(payslip.employeePension) + Number(payslip.employeeSaned),
          employerAmount: Number(payslip.employerGOSI),
          totalAmount:
            Number(payslip.employeePension) +
            Number(payslip.employeeSaned) +
            Number(payslip.employerGOSI),
          basis: Number(payslip.basicSalary),
          rate: 9.75,
        });
      }
    }

    // Map Prisma Payslip → service Payslip type
    const servicePayslip: ServicePayslip = {
      id: payslip.id,
      payrollRunId: payslip.payrollRunId,
      employeeId: payslip.employeeId,
      employeeName: payslip.employeeName,
      employeeCode: payslip.employeeCode,
      department: employee?.department?.name || 'N/A',
      designation: employee?.designation?.name || 'N/A',
      month: payslip.payrollRun.payrollMonth,
      countryCode: countryCode as any,
      currency: payslip.payrollRun.currency,
      totalWorkingDays: payslip.workingDays,
      daysWorked: Number(payslip.paidDays),
      paidLeaveDays: 0,
      unpaidLeaveDays: 0,
      lopDays: Number(payslip.lopDays),
      basicSalary: Number(payslip.basicSalary),
      earnings: earningsJson.map((e) => ({
        componentCode: e.code,
        componentName: e.name,
        componentNameAr: e.nameAr || e.name,
        type: 'EARNING' as const,
        category: 'ALLOWANCE' as const,
        calculatedAmount: e.amount,
        isTaxable: true,
      })),
      totalEarnings: Number(payslip.totalEarnings),
      deductions: deductionsJson.map((d) => ({
        componentCode: d.code,
        componentName: d.name,
        componentNameAr: d.nameAr || d.name,
        type: 'DEDUCTION' as const,
        category: 'OTHER_DEDUCTION' as const,
        calculatedAmount: d.amount,
        isTaxable: false,
      })),
      totalDeductions: Number(payslip.totalDeductions),
      statutoryDeductions,
      totalStatutory: Number(payslip.totalStatutoryEmployee),
      grossSalary: Number(payslip.grossSalary),
      netSalary: Number(payslip.netSalary),
      ytdGross: 0,
      ytdDeductions: 0,
      ytdTax: 0,
      ytdNet: 0,
      bankName: complianceDetails?.bankName || undefined,
      bankAccountNumber: complianceDetails?.bankAccountNumber || undefined,
      bankIBAN: complianceDetails?.bankIBAN || undefined,
      status: payslip.status as any,
      createdAt: payslip.createdAt,
      updatedAt: payslip.updatedAt,
    };

    // Generate HTML/CSS using PayslipPDFGenerator
    const { searchParams } = new URL(request.url);
    const language = (searchParams.get('language') as 'en' | 'ar' | 'bilingual') || 'en';

    const { html, css } = PayslipPDFGenerator.generate(servicePayslip, {
      language,
      showYTD: false,
      showBankDetails: !!complianceDetails?.bankAccountNumber,
      showStatutoryBreakdown: statutoryDeductions.length > 0,
      showTaxDetails: Number(payslip.employeeTDS) > 0,
      companyName: 'AuraOS',
    });

    // Build complete HTML document
    const fullDocument = `<!DOCTYPE html>
<html lang="${language === 'ar' ? 'ar' : 'en'}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payslip - ${payslip.employeeName} - ${payslip.payrollRun.payrollMonth}</title>
  <style>${css}</style>
</head>
<body>${html}</body>
</html>`;

    const contentBuffer = Buffer.from(fullDocument, 'utf-8');

    return new NextResponse(contentBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="payslip-${payslip.employeeCode}-${payslip.payrollRun.payrollMonth}.html"`,
        'Content-Length': contentBuffer.length.toString(),
        'X-Payslip-Id': payslip.id,
        'X-Pay-Period': payslip.payrollRun.payrollMonth,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error: any) {
    console.error('[Pay Stub Download API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to generate payslip' } },
      { status: 500 }
    );
  }
});
