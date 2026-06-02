/**
 * Payslip API Routes
 * Phase 2: Core Enhancement - Payroll Engine v2
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/payroll/payslips
 * Get payslips for an employee or payroll run
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const payrollRunId = searchParams.get('payrollRunId');
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);

      if (!payrollRunId && !employeeId) {
        return NextResponse.json(
          {
            error: 'Either payrollRunId or employeeId is required',
            errorAr: 'مطلوب إما معرف تشغيل الرواتب أو معرف الموظف',
          },
          { status: 400 }
        );
      }

      const where: Record<string, unknown> = {};
      if (payrollRunId) where.payrollRunId = payrollRunId;
      if (employeeId) where.employeeId = employeeId;
      if (status) where.status = status;

      // Filter by tenant through payrollRun relation
      where.payrollRun = { tenantId };

      const [total, payslips] = await Promise.all([
        prisma.payslip.count({ where }),
        prisma.payslip.findMany({
          where,
          include: { payrollRun: true },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      // Compute summary
      const summary = {
        totalEmployees: total,
        totalGross: payslips.reduce((sum, p) => sum + (p.totalEarnings?.toNumber?.() ?? Number(p.totalEarnings) ?? 0), 0),
        totalDeductions: payslips.reduce((sum, p) => sum + (p.totalDeductions?.toNumber?.() ?? Number(p.totalDeductions) ?? 0), 0),
        totalNet: payslips.reduce((sum, p) => {
          const earnings = p.totalEarnings?.toNumber?.() ?? Number(p.totalEarnings) ?? 0;
          const deductions = p.totalDeductions?.toNumber?.() ?? Number(p.totalDeductions) ?? 0;
          return sum + (earnings - deductions);
        }, 0),
      };

      return NextResponse.json({
        success: true,
        payslips,
        data: {
          payslips,
          summary,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      logger.error('Error fetching payslips:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payslips', errorAr: 'فشل في جلب كشوف الرواتب' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/payroll/payslips
 * Generate payslip PDF or retrieve payslip details
 */
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { payslipId, format = 'pdf', language = 'en' } = body;

      if (!payslipId) {
        return NextResponse.json(
          { success: false, error: 'payslipId is required', errorAr: 'معرف كشف الراتب مطلوب' },
          { status: 400 }
        );
      }

      // Fetch the real payslip
      const payslip = await prisma.payslip.findUnique({
        where: { id: payslipId },
        include: { payrollRun: { include: { config: true } } },
      });

      if (!payslip) {
        return NextResponse.json(
          { success: false, error: 'Payslip not found' },
          { status: 404 }
        );
      }

      // Verify tenant access
      if (payslip.payrollRun.tenantId !== user.tenantId) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          resourceType: 'Payroll - Payslip Generation',
          metadata: { description: `Generated payslip ${format} for employee: ${payslip.employeeName}` } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          payslipId,
          payslip,
          format,
          language,
          downloadUrl: `/api/payroll/payslips/download/${payslipId}`,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('Error generating payslip:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate payslip', errorAr: 'فشل في إنشاء كشف الراتب' },
        { status: 500 }
      );
    }
  }
);
