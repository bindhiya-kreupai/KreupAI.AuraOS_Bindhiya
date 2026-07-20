import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  canReadAiAutomation,
  canWriteAiAutomation,
  resolveAiAutomationAuth,
} from '@/lib/ai/ai-automation-auth';
import { getPerformanceDashboard } from '@/lib/ai/performance-ai';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canReadAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    }
    const params = new URL(request.url).searchParams;
    const view = params.get('view') || 'dashboard';
    const employeeId = params.get('employeeId') || undefined;
    const teamId = params.get('teamId') || undefined;
    if (view === 'employee' && !employeeId) {
      return NextResponse.json(
        { error: 'employeeId is required', errorAr: 'معرف الموظف مطلوب' },
        { status: 400 }
      );
    }
    if (view === 'team' && !teamId) {
      return NextResponse.json(
        { error: 'teamId is required', errorAr: 'معرف الفريق مطلوب' },
        { status: 400 }
      );
    }
    if (!['dashboard', 'employee', 'team'].includes(view)) {
      return NextResponse.json({ error: 'Invalid view', errorAr: 'عرض غير صالح' }, { status: 400 });
    }
    const data = await getPerformanceDashboard(auth.tenantId, {
      userId: auth.userId,
      persist: view === 'dashboard',
      employeeId: view === 'employee' ? employeeId : undefined,
      teamId: view === 'team' ? teamId : undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[performance GET]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch performance data',
        errorAr: 'فشل في جلب بيانات الأداء',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canWriteAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    if (String(body.action || 'recompute') !== 'recompute') {
      return NextResponse.json(
        { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
        { status: 400 }
      );
    }
    const data = await getPerformanceDashboard(auth.tenantId, {
      userId: auth.userId,
      persist: true,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[performance POST]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to recompute performance analysis',
        errorAr: 'فشل في إعادة حساب تحليل الأداء',
      },
      { status: 500 }
    );
  }
}
