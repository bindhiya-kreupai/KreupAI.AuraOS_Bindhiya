import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  canReadAiAutomation,
  canWriteAiAutomation,
  resolveAiAutomationAuth,
} from '@/lib/ai/ai-automation-auth';
import {
  chatWithCandidateBot,
  getCandidateSessions,
  loadCandidateFlow,
  saveCandidateFlow,
} from '@/lib/ai/chatbot-ai';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canReadAiAutomation(auth.permissions, auth.roles))
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    const view = new URL(request.url).searchParams.get('view');
    return NextResponse.json({
      success: true,
      data:
        view === 'sessions'
          ? { sessions: await getCandidateSessions(auth.tenantId, auth.userId) }
          : await loadCandidateFlow(auth.tenantId),
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch chatbot data', errorAr: 'فشل جلب بيانات روبوت المحادثة' },
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
    if (body.action === 'save-flow')
      return NextResponse.json({
        success: true,
        data: await saveCandidateFlow(
          auth.tenantId,
          auth.userId,
          Array.isArray(body.nodes) ? body.nodes : [],
          Array.isArray(body.edges) ? body.edges : [],
          body.name
        ),
      });
    if (body.action === 'chat' && typeof body.message === 'string' && body.message.trim())
      return NextResponse.json({
        success: true,
        data: await chatWithCandidateBot(auth.tenantId, auth.userId, body.message, body.sessionId),
      });
    return NextResponse.json(
      { error: 'Invalid chatbot request', errorAr: 'طلب روبوت المحادثة غير صالح' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to process chatbot request', errorAr: 'فشلت معالجة طلب روبوت المحادثة' },
      { status: 500 }
    );
  }
}
