/**
 * GET /api/ai/attrition/runs/[runId] — batch recompute status
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';
import { canReadAiAutomation } from '@/lib/ai/ai-automation-auth';
import { getRunStatus } from '@/lib/ai/attrition-ai';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> | { runId: string } }
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
    const status = await getRunStatus(context.user.tenantId as string, resolved.runId);
    if (!status) {
      return NextResponse.json(
        { error: 'Run not found', errorAr: 'التشغيل غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: status });
  } catch (err) {
    console.error('[attrition run GET]', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to fetch run status',
        errorAr: 'فشل في جلب حالة التشغيل',
      },
      { status: 500 }
    );
  }
}
