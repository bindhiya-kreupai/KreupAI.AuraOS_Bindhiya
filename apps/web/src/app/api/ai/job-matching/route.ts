import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  canReadAiAutomation,
  canWriteAiAutomation,
  resolveAiAutomationAuth,
} from '@/lib/ai/ai-automation-auth';
import { getJobMatches, persistJobMatches } from '@/lib/ai/job-matching-ai';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canReadAiAutomation(auth.permissions, auth.roles))
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    const params = new URL(request.url).searchParams;
    const data = await getJobMatches(auth.tenantId, {
      view: params.get('view') || undefined,
      jobId: params.get('jobId'),
      candidateId: params.get('candidateId'),
    });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch job matches', errorAr: 'فشل جلب مطابقات الوظائف' },
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
    if (body.action !== 'match')
      return NextResponse.json(
        { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
        { status: 400 }
      );
    const data = await getJobMatches(auth.tenantId, { ...body, userId: auth.userId });
    await persistJobMatches(auth.tenantId, auth.userId, data);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process job matching', errorAr: 'فشلت معالجة مطابقة الوظائف' },
      { status: 500 }
    );
  }
}
