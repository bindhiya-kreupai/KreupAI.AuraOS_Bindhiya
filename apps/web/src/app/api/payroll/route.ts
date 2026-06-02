/**
 * Payroll API Routes
 * Phase 2: Core Enhancement - Payroll Engine v2
 *
 * @swagger
 * /api/payroll:
 *   post:
 *     summary: Process payroll for a company
 *     tags: [Payroll]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *               - companyId
 *               - month
 *               - countryCode
 *             properties:
 *               tenantId:
 *                 type: string
 *               companyId:
 *                 type: string
 *               month:
 *                 type: string
 *                 example: "2024-01"
 *               countryCode:
 *                 type: string
 *                 enum: [AE, SA, BH, QA, OM, KW, IN]
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Payroll processed successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { PayrollService } from '@/lib/services/payroll';
import type { SupportedCountryCode } from '@/lib/services/compliance/types';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * POST /api/payroll
 * Process payroll run
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tenantId || !body.companyId || !body.month || !body.countryCode) {
      return NextResponse.json(
        {
          error: 'Missing required fields: tenantId, companyId, month, countryCode',
          errorAr: 'حقول مطلوبة مفقودة: معرف المستأجر، معرف الشركة، الشهر، رمز البلد',
        },
        { status: 400 }
      );
    }

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(body.month)) {
      return NextResponse.json(
        {
          error: 'Invalid month format. Use YYYY-MM',
          errorAr: 'صيغة الشهر غير صالحة. استخدم YYYY-MM',
        },
        { status: 400 }
      );
    }

    // Validate country code
    const validCountries: SupportedCountryCode[] = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'];
    if (!validCountries.includes(body.countryCode)) {
      return NextResponse.json(
        {
          error: `Invalid country code. Supported: ${validCountries.join(', ')}`,
          errorAr: `رمز البلد غير صالح. المدعومة: ${validCountries.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const payrollRun = await PayrollService.processPayroll({
      tenantId: body.tenantId,
      companyId: body.companyId,
      month: body.month,
      countryCode: body.countryCode,
      employeeIds: body.employeeIds,
      includeVariables: body.includeVariables,
      processAttendance: body.processAttendance,
      processLeave: body.processLeave,
    });

    return NextResponse.json({
      success: true,
      data: payrollRun,
    });
  } catch (error: any) {
        return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process payroll',
        errorAr: 'فشل في معالجة الرواتب',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payroll
 * Get payroll runs list
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const payrollMonth = searchParams.get('month') || undefined;
      const status = searchParams.get('status') || undefined;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);

      const where: Record<string, unknown> = { tenantId };
      if (payrollMonth) where.payrollMonth = payrollMonth;
      if (status) where.status = status;

      const [total, payrollRuns] = await Promise.all([
        prisma.payrollRun.count({ where }),
        prisma.payrollRun.findMany({
          where,
          include: {
            config: true,
            _count: { select: { payslips: true } },
          },
          orderBy: { payrollMonth: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const runs = payrollRuns.map((run) => ({
        ...run,
        payslipsCount: run._count.payslips,
        _count: undefined,
      }));

      return NextResponse.json({
        success: true,
        runs,
        payrollRuns: runs,
        data: {
          payrollRuns: runs,
          runs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      logger.error('Error fetching payroll runs:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payroll runs', errorAr: 'فشل في جلب سجلات الرواتب' },
        { status: 500 }
      );
    }
  }
);
