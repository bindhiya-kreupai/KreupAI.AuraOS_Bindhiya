import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  canReadAiAutomation,
  canWriteAiAutomation,
  resolveAiAutomationAuth,
} from '@/lib/ai/ai-automation-auth';
import { getJobBoardDashboard, postToJobBoards, syncJobBoards } from '@/lib/ai/job-boards-ai';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canReadAiAutomation(auth.permissions, auth.roles))
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    return NextResponse.json({ success: true, data: await getJobBoardDashboard(auth.tenantId) });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch job boards', errorAr: 'فشل جلب منصات الوظائف' },
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
    const body = await request.json().catch(() => ({}));
    if (body.action === 'post')
      return NextResponse.json({
        success: true,
        data: await postToJobBoards(auth.tenantId, auth.userId, body.jobData || {}, body.boards),
      });
    if (body.action === 'sync')
      return NextResponse.json({ success: true, data: await syncJobBoards() });
    return NextResponse.json(
      { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to process job board request', errorAr: 'فشلت معالجة طلب منصة الوظائف' },
      { status: 500 }
    );
  }
}
