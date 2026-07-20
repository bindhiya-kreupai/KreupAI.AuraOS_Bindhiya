/**
 * GET /api/ai/attrition/at-risk — paginated high-risk employees
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';
import { canReadAiAutomation } from '@/lib/ai/ai-automation-auth';
import { getAtRiskEmployees } from '@/lib/ai/attrition-ai';
import type { AttritionHorizonDays, AttritionRiskLevel } from '@/lib/ai/attrition-types';

async function resolveAuth(request: NextRequest) {
  const { context, error } = await authenticateWithPermissions(request);
  if (error || !context?.user?.tenantId) return null;
  return {
    tenantId: context.user.tenantId as string,
    permissions: context.permissions as string[],
    roles: context.roles as string[],
  };
}

function parseHorizon(raw: string | null): AttritionHorizonDays {
  const n = Number(raw);
  if (n === 90 || n === 180 || n === 365) return n;
  return 180;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    }
    if (!canReadAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || 50)));
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const offset = (page - 1) * limit;

    const data = await getAtRiskEmployees(auth.tenantId, {
      limit,
      offset,
      departmentId: searchParams.get('departmentId') || undefined,
      locationId: searchParams.get('locationId') || undefined,
      managerId: searchParams.get('managerId') || undefined,
      riskLevel: (searchParams.get('riskLevel') as AttritionRiskLevel) || undefined,
      minScore: searchParams.get('minScore') ? Number(searchParams.get('minScore')) : undefined,
      horizonDays: parseHorizon(searchParams.get('horizonDays')),
      autoRecompute: searchParams.get('autoRecompute') === 'true',
    });

    return NextResponse.json({
      success: true,
      data: {
        employees: data.employees,
        total: data.total,
        page: data.page,
        limit: data.limit,
      },
    });
  } catch (error) {
    console.error('[attrition at-risk GET]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch at-risk employees',
        errorAr: 'فشل في جلب الموظفين المعرضين للخطر',
      },
      { status: 500 }
    );
  }
}
