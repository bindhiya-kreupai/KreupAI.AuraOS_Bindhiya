import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  canReadAiAutomation,
  canWriteAiAutomation,
  resolveAiAutomationAuth,
} from '@/lib/ai/ai-automation-auth';
import { commitAccruals, getAccrualDashboard, previewAccruals } from '@/lib/ai/auto-accruals-ai';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canReadAiAutomation(auth.permissions, auth.roles))
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    return NextResponse.json({ success: true, data: await getAccrualDashboard(auth.tenantId) });
  } catch (error) {
    console.error('[auto-accruals GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch accrual data', errorAr: 'فشل جلب بيانات الاستحقاقات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canWriteAiAutomation(auth.permissions, auth.roles))
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    const { action = 'dry-run' } = await request.json().catch(() => ({}));
    if (action === 'dry-run')
      return NextResponse.json({
        success: true,
        data: await previewAccruals(auth.tenantId, auth.userId),
      });
    if (action === 'commit')
      return NextResponse.json({
        success: true,
        data: await commitAccruals(auth.tenantId, auth.userId),
      });
    return NextResponse.json(
      { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[auto-accruals POST]', error);
    return NextResponse.json(
      { error: 'Failed to process accruals', errorAr: 'فشل معالجة الاستحقاقات' },
      { status: 500 }
    );
  }
}
