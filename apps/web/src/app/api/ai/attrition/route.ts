/**
 * Attrition Prediction API
 * GET  — dashboard summary + distribution + drivers (session tenant)
 * POST — action: predict | batch | recompute | simulate | analytics
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';
import { canReadAiAutomation, canWriteAiAutomation } from '@/lib/ai/ai-automation-auth';
import {
  getAtRiskEmployees,
  getDashboard,
  getEmployeePrediction,
  recomputeAttrition,
  simulateRetention,
} from '@/lib/ai/attrition-ai';
import type { AttritionHorizonDays, AttritionRiskLevel } from '@/lib/ai/attrition-types';

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

function parseHorizon(raw: unknown): AttritionHorizonDays {
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
    const horizonDays = parseHorizon(searchParams.get('horizonDays'));
    const autoRecompute = searchParams.get('autoRecompute') !== 'false';

    const data = await getDashboard(auth.tenantId, {
      horizonDays,
      autoRecompute,
      userId: auth.userId,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[attrition GET]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch attrition data',
        errorAr: 'فشل في جلب بيانات المغادرة',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    }
    if (!canWriteAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const action = String(body.action || 'recompute');
    const horizonDays = parseHorizon(body.horizonDays);

    switch (action) {
      case 'predict': {
        const employeeId = String(body.employeeId || body.employeeData?.id || '');
        if (!employeeId) {
          return NextResponse.json(
            { error: 'employeeId is required', errorAr: 'معرف الموظف مطلوب' },
            { status: 400 }
          );
        }
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
      }

      case 'batch':
      case 'recompute': {
        const employeeIds = Array.isArray(body.employeeIds)
          ? body.employeeIds.map(String)
          : Array.isArray(body.employees)
            ? body.employees
                .map((e: { id?: string } | string) =>
                  typeof e === 'string' ? e : String(e?.id || '')
                )
                .filter(Boolean)
            : undefined;

        const result = await recomputeAttrition(auth.tenantId, auth.userId, {
          horizonDays,
          employeeIds,
          filters: {
            departmentId: body.departmentId ? String(body.departmentId) : undefined,
          },
        });

        const dashboard = await getDashboard(auth.tenantId, {
          horizonDays,
          autoRecompute: false,
          userId: auth.userId,
        });

        return NextResponse.json({
          success: true,
          data: { ...result, dashboard },
        });
      }

      case 'simulate': {
        const salaryBoostPercent = Number(body.salaryBoostPercent ?? body.salaryBoost ?? 0);
        const simulation = await simulateRetention(auth.tenantId, salaryBoostPercent, {
          horizonDays,
        });
        return NextResponse.json({ success: true, data: simulation });
      }

      case 'analytics': {
        const atRisk = await getAtRiskEmployees(auth.tenantId, {
          horizonDays,
          riskLevel: body.riskLevel as AttritionRiskLevel | undefined,
          departmentId: body.departmentId ? String(body.departmentId) : undefined,
          limit: Number(body.limit) || 100,
        });
        const dashboard = await getDashboard(auth.tenantId, {
          horizonDays,
          autoRecompute: false,
          userId: auth.userId,
        });
        return NextResponse.json({
          success: true,
          data: { ...dashboard, atRisk },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[attrition POST]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to run attrition action',
        errorAr: 'فشل في تنفيذ تنبؤ المغادرة',
      },
      { status: 500 }
    );
  }
}
