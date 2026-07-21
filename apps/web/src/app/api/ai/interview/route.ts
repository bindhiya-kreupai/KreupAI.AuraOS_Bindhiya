import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  canReadAiAutomation,
  canWriteAiAutomation,
  resolveAiAutomationAuth,
} from '@/lib/ai/ai-automation-auth';
import {
  confirmInterviewProposal,
  createInterviewProposal,
  getInterviewSchedules,
  getSuggestedInterviewSlots,
} from '@/lib/ai/interview-scheduling-ai';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canReadAiAutomation(auth.permissions, auth.roles))
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    const params = new URL(request.url).searchParams;
    if (params.get('view') === 'suggest-slots') {
      const candidateId = params.get('candidateId');
      if (!candidateId)
        return NextResponse.json(
          { error: 'candidateId is required', errorAr: 'معرف المرشح مطلوب' },
          { status: 400 }
        );
      return NextResponse.json({
        success: true,
        data: { candidateId, suggestedSlots: await getSuggestedInterviewSlots(auth.tenantId) },
      });
    }
    const schedules = await getInterviewSchedules(auth.tenantId);
    const suggestedSlots = await getSuggestedInterviewSlots(auth.tenantId);
    return NextResponse.json({
      success: true,
      data: {
        ...schedules,
        schedules: schedules.proposals,
        suggestedSlots,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch interview schedules', errorAr: 'فشل جلب جداول المقابلات' },
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
    if (body.action === 'schedule') {
      if (!body.candidateId)
        return NextResponse.json(
          { error: 'candidateId is required', errorAr: 'معرف المرشح مطلوب' },
          { status: 400 }
        );
      return NextResponse.json({
        success: true,
        data: await createInterviewProposal(auth.tenantId, auth.userId, body),
      });
    }
    if (body.action === 'confirm') {
      const data =
        body.proposalId &&
        (await confirmInterviewProposal(auth.tenantId, auth.userId, body.proposalId));
      if (!data)
        return NextResponse.json(
          { error: 'Proposal not found', errorAr: 'لم يتم العثور على المقترح' },
          { status: 404 }
        );
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json(
      { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to process interview schedule', errorAr: 'فشلت معالجة جدولة المقابلة' },
      { status: 500 }
    );
  }
}
