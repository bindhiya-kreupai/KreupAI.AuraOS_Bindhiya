// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
/**
 * India Professional Tax API Routes
 * State-wise Professional Tax calculation for 17 Indian states
 *
 * @swagger
 * /api/compliance/india-professional-tax:
 *   get:
 *     summary: Get PT slabs or supported states
 *   post:
 *     summary: Calculate Professional Tax
 *     tags: [Compliance - India PT]
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { IndiaProfessionalTaxService } from '@/lib/services/compliance/india-professional-tax.service';
import { z } from 'zod';

const PTCalculationSchema = z.object({
  stateCode: z.string().min(2).max(2),
  monthlyGrossSalary: z.number().positive(),
  month: z.number().min(1).max(12),
});

// GET - Get PT info (slabs, supported states)
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action') || 'supportedStates';
      const stateCode = searchParams.get('stateCode');

      switch (action) {
        case 'supportedStates': {
          const states = IndiaProfessionalTaxService.getSupportedStates();
          return NextResponse.json({ success: true, data: { states } });
        }

        case 'slabs': {
          if (!stateCode) {
            return NextResponse.json(
              { error: 'Missing stateCode parameter', errorAr: 'معامل رمز الولاية مفقود' },
              { status: 400 }
            );
          }
          const slabs = IndiaProfessionalTaxService.getSlabs(stateCode);
          if (!slabs) {
            return NextResponse.json(
              { error: `Unsupported state: ${stateCode}`, errorAr: `ولاية غير مدعومة: ${stateCode}` },
              { status: 400 }
            );
          }
          return NextResponse.json({ success: true, data: slabs });
        }

        case 'compare': {
          const salaryStr = searchParams.get('salary');
          if (!salaryStr) {
            return NextResponse.json(
              { error: 'Missing salary parameter', errorAr: 'معامل الراتب مفقود' },
              { status: 400 }
            );
          }
          const comparison = IndiaProfessionalTaxService.comparePTAcrossStates(parseFloat(salaryStr));
          return NextResponse.json({ success: true, data: comparison });
        }

        default:
          return NextResponse.json(
            { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
            { status: 400 }
          );
      }
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch Professional Tax info' },
        { status: 500 }
      );
    }
  }
);

// POST - Calculate Professional Tax
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { action } = body;

      switch (action || 'calculateMonthly') {
        case 'calculateMonthly': {
          const data = PTCalculationSchema.parse(body);
          const result = IndiaProfessionalTaxService.calculateMonthlyPT(
            data.stateCode, data.monthlyGrossSalary, data.month
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'calculateAnnual': {
          const { stateCode, monthlyGrossSalary, monthlySalaries, startYear } = body;
          if (!stateCode) {
            return NextResponse.json(
              { error: 'Missing stateCode', errorAr: 'رمز الولاية مفقود' },
              { status: 400 }
            );
          }
          // Accept either an array of 12 salaries or a single salary replicated 12 times
          const salaries: number[] = monthlySalaries && Array.isArray(monthlySalaries)
            ? monthlySalaries
            : Array(12).fill(monthlyGrossSalary || 0);
          const result = IndiaProfessionalTaxService.calculateAnnualPT(stateCode, salaries, startYear);
          return NextResponse.json({ success: true, data: result });
        }

        case 'generateReturn': {
          const { stateCode, employees, month, year } = body;
          if (!stateCode || !employees || !month) {
            return NextResponse.json(
              { error: 'Missing required fields (stateCode, employees, month)', errorAr: 'حقول مطلوبة مفقودة (رمز الولاية، الموظفون، الشهر)' },
              { status: 400 }
            );
          }
          const result = IndiaProfessionalTaxService.generatePTReturn(
            user.tenantId, stateCode, month, year, employees
          );
          return NextResponse.json({ success: true, data: result });
        }

        default:
          return NextResponse.json(
            { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
            { status: 400 }
          );
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to calculate Professional Tax' },
        { status: 500 }
      );
    }
  }
);
