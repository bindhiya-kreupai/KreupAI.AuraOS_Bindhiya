/**
 * GET /api/ai/attrition/actions/[employeeId]
 * Retention recommendations for an employee (advisory)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';
import { canReadAiAutomation } from '@/lib/ai/ai-automation-auth';
import { getEmployeePrediction } from '@/lib/ai/attrition-ai';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> | { employeeId: string } }
) {
  try {
    const { context, error } = await authenticateWithPermissions(request);
    if (error || !context?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    }
    if (!canReadAiAutomation(context.permissions as string[], context.roles as string[])) {
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    }

    const resolved = await Promise.resolve(params);
    const prediction = await getEmployeePrediction(
      context.user.tenantId as string,
      resolved.employeeId,
      { userId: context.user.userId as string }
    );

    if (!prediction) {
      return NextResponse.json(
        { error: 'Employee not found', errorAr: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        employeeId: prediction.employeeId,
        employeeName: prediction.employeeName,
        riskScore: prediction.riskScore,
        riskLevel: prediction.riskLevel,
        recommendations: prediction.recommendations,
        primaryFactor: prediction.primaryFactor,
        factors: prediction.factors,
      },
    });
  } catch (err) {
    console.error('[attrition actions GET]', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to fetch retention actions',
        errorAr: 'فشل في جلب إجراءات الاحتفاظ',
      },
      { status: 500 }
    );
  }
}
