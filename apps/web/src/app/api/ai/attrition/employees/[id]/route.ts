/**
 * GET /api/ai/attrition/employees/[id] — single employee risk detail
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';
import { canReadAiAutomation } from '@/lib/ai/ai-automation-auth';
import { getEmployeePrediction } from '@/lib/ai/attrition-ai';
import type { AttritionHorizonDays } from '@/lib/ai/attrition-types';

async function resolveAuth(request: NextRequest) {
  const { context, error } = await authenticateWithPermissions(request);
  if (error || !context?.user?.tenantId) return null;
  return {
    tenantId: context.user.tenantId as string,
    userId: context.user.userId as string,
    permissions: context.permissions as string[],
    roles: context.roles as string[],
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await resolveAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    }
    if (!canReadAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    }

    const resolved = await Promise.resolve(params);
    const employeeId = resolved.id;
    const horizonRaw = new URL(request.url).searchParams.get('horizonDays');
    const n = Number(horizonRaw);
    const horizonDays: AttritionHorizonDays = n === 90 || n === 180 || n === 365 ? n : 180;

    const prediction = await getEmployeePrediction(auth.tenantId, employeeId, {
      horizonDays,
      userId: auth.userId,
    });

    if (!prediction) {
      return NextResponse.json(
        { error: 'Employee not found', errorAr: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: prediction });
  } catch (error) {
    console.error('[attrition employee GET]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch employee attrition',
        errorAr: 'فشل في جلب تنبؤ مغادرة الموظف',
      },
      { status: 500 }
    );
  }
}
