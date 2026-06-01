import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/statutory/pt/calculations
 * Get Professional Tax (PT) calculations for a specific month
 *
 * Query Parameters:
 * - month (required): Month in YYYY-MM format
 * - companyId (required): Company ID
 * - state (required): State code (MH, KA, TN, etc.)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('statutory:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing statutory:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const companyId = searchParams.get('companyId');
    const state = searchParams.get('state');

    if (!month || !companyId || !state) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'month, companyId, and state are required in query parameters',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    // Get PT configuration for this company and state
    const ptConfig = await prisma.indiaProfessionalTaxConfig.findFirst({
      where: { tenantId: user.tenantId, companyId, stateCode: state, isActive: true },
    });

    // Query PT deductions for this month
    const deductions = await prisma.indiaProfessionalTaxDeduction.findMany({
      where: {
        tenantId: user.tenantId,
        deductionMonth: month,
        ...(ptConfig ? { configId: ptConfig.id } : {}),
      },
      select: {
        employeeId: true,
        employeeName: true,
        grossSalary: true,
        taxAmount: true,
        isFebruaryAdjustment: true,
        status: true,
      },
    });

    // If no PT deductions found, fall back to payslip data
    if (deductions.length === 0) {
      const payrollRuns = await prisma.payrollRun.findMany({
        where: {
          tenantId: user.tenantId,
          payrollMonth: month,
          config: { companyId },
          status: { in: ['CALCULATED', 'APPROVED', 'PAID'] },
          isDeleted: false,
        },
        select: { id: true },
      });

      const runIds = payrollRuns.map((r) => r.id);

      // Get payslips and check earnings JSON for PT deductions
      const payslips =
        runIds.length > 0
          ? await prisma.payslip.findMany({
              where: { payrollRunId: { in: runIds } },
              select: {
                employeeId: true,
                employeeCode: true,
                employeeName: true,
                grossSalary: true,
                deductions: true,
              },
            })
          : [];

      // Extract PT from deductions JSON
      const ptEmployees = payslips
        .map((p) => {
          const deds = (p.deductions as Array<{ code: string; amount: number }>) || [];
          const ptDed = deds.find((d) => d.code === 'PT' || d.code === 'PROFESSIONAL_TAX');
          return ptDed
            ? {
                employeeCode: p.employeeCode,
                employeeName: p.employeeName,
                grossSalary: Number(p.grossSalary),
                ptAmount: ptDed.amount,
              }
            : null;
        })
        .filter(Boolean);

      const totalPT = ptEmployees.reduce((sum, e) => sum + (e?.ptAmount || 0), 0);

      return NextResponse.json({
        success: true,
        data: {
          month,
          companyId,
          state,
          stateInfo: ptConfig
            ? {
                code: ptConfig.stateCode,
                name: ptConfig.stateName,
                ptRegistrationNumber: ptConfig.ptRegistrationNumber,
                slabs: ptConfig.slabs,
                maxAnnualTax: Number(ptConfig.maxAnnualTax),
              }
            : { code: state },
          summary: {
            totalEmployees: payslips.length,
            employeesLiable: ptEmployees.length,
            totalPT,
          },
          employees: ptEmployees,
          generatedAt: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    }

    const totalPT = deductions.reduce((sum, d) => sum + Number(d.taxAmount), 0);
    const employeesLiable = deductions.filter((d) => Number(d.taxAmount) > 0).length;

    return NextResponse.json({
      success: true,
      data: {
        month,
        companyId,
        state,
        stateInfo: ptConfig
          ? {
              code: ptConfig.stateCode,
              name: ptConfig.stateName,
              ptRegistrationNumber: ptConfig.ptRegistrationNumber,
              slabs: ptConfig.slabs,
              maxAnnualTax: Number(ptConfig.maxAnnualTax),
            }
          : { code: state },
        summary: {
          totalEmployees: deductions.length,
          employeesLiable,
          totalPT,
        },
        employees: deductions.map((d) => ({
          employeeId: d.employeeId,
          employeeName: d.employeeName,
          grossSalary: Number(d.grossSalary),
          ptAmount: Number(d.taxAmount),
          isFebruaryAdjustment: d.isFebruaryAdjustment,
          status: d.status,
        })),
        generatedAt: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[PT Calculations API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch PT calculations',
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
});
