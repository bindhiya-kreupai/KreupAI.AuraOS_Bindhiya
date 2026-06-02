// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
/**
 * Employee Self-Service / Manager Self-Service API Routes
 * Payslips, YTD summary, tax documents, benefits, profile, team dashboard, expense claims
 *
 * @swagger
 * /api/ess:
 *   get:
 *     summary: ESS/MSS data (payslips, ytdSummary, taxDocuments, benefits, profile, teamDashboard)
 *   post:
 *     summary: ESS actions (submitExpense)
 *     tags: [ESS/MSS]
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { EmployeeSelfService } from '@/lib/services/ess/employee-self-service.service';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const ExpenseClaimSchema = z.object({
  action: z.literal('submitExpense'),
  expenseData: z.object({
    category: z.string().min(1),
    amount: z.number().positive(),
    currency: z.string().min(3).max(3),
    description: z.string().min(1),
    date: z.string(),
    receipts: z.array(z.string()).optional(),
  }),
});

// GET - ESS/MSS data retrieval
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, employeeId: contextEmployeeId }) => {
    try {
      const permissionError = requirePermission(Resource.EMPLOYEES, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action') || 'profile';
      const requestedEmployeeId = searchParams.get('employeeId');

      // Use the requesting user's employeeId unless an explicit employeeId is provided
      // and the user has MANAGE permission
      let employeeId = contextEmployeeId || user.userId;
      if (requestedEmployeeId && requestedEmployeeId !== employeeId) {
        const manageError = requirePermission(Resource.EMPLOYEES, Action.MANAGE, permissions);
        if (manageError) {
          return NextResponse.json(
            {
              error: 'You can only access your own data unless you have manage permissions',
              errorAr: 'يمكنك الوصول إلى بياناتك الخاصة فقط ما لم تكن لديك صلاحيات الإدارة',
            },
            { status: 403 }
          );
        }
        employeeId = requestedEmployeeId;
      }

      switch (action) {
        case 'payslips': {
          const year = searchParams.get('year')
            ? parseInt(searchParams.get('year')!, 10)
            : undefined;
          const result = await EmployeeSelfService.getPayslipHistory(
            user.tenantId,
            employeeId,
            year
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'ytdSummary': {
          const result = await EmployeeSelfService.getYTDSummary(
            user.tenantId,
            employeeId
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'taxDocuments': {
          const countryCode = searchParams.get('countryCode');
          if (!countryCode) {
            return NextResponse.json(
              {
                error: 'countryCode parameter is required',
                errorAr: 'معامل رمز الدولة مطلوب',
              },
              { status: 400 }
            );
          }
          const result = await EmployeeSelfService.getTaxDocuments(
            user.tenantId,
            employeeId,
            countryCode
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'benefits': {
          const result = await EmployeeSelfService.getBenefitEnrollments(
            user.tenantId,
            employeeId
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'profile': {
          const result = await EmployeeSelfService.getProfileSummary(
            user.tenantId,
            employeeId
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'teamDashboard': {
          const managerId = employeeId;
          const result = await EmployeeSelfService.getTeamDashboard(
            user.tenantId,
            managerId
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
      logger.error({ error }, 'Error in ESS/MSS GET');
      return NextResponse.json(
        {
          error: 'Failed to retrieve ESS data',
          errorAr: 'فشل في استرجاع بيانات الخدمة الذاتية',
        },
        { status: 500 }
      );
    }
  }
);

// POST - ESS actions
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, employeeId: contextEmployeeId }) => {
    try {
      const permissionError = requirePermission(Resource.EMPLOYEES, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { action } = body;

      const employeeId = contextEmployeeId || user.userId;

      switch (action) {
        case 'submitExpense': {
          const validated = ExpenseClaimSchema.parse(body);
          const result = await EmployeeSelfService.submitExpenseClaim(
            user.tenantId,
            employeeId,
            validated.expenseData
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
          { success: false, error: 'Validation error', errorAr: 'خطأ في التحقق', details: error.errors },
          { status: 400 }
        );
      }
      logger.error({ error }, 'Error in ESS/MSS POST');
      return NextResponse.json(
        {
          error: 'Failed to process ESS request',
          errorAr: 'فشل في معالجة طلب الخدمة الذاتية',
        },
        { status: 500 }
      );
    }
  }
);
