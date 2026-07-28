/**
 * Agent Messages API Routes — DB-backed session messages
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveAgentAuth } from '@/lib/ai/agent-auth';
import { agentError } from '@/lib/ai/agent-types';
import { getSessionById } from '@/lib/ai/agent-session';

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const { sessionId } = await context.params;
    const session = await getSessionById(auth.tenantId, auth.userId, sessionId);
    if (!session) {
      return NextResponse.json(agentError('Session not found', 'الجلسة غير موجودة'), {
        status: 404,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        messages: session.messages,
        totalMessages: session.messages.length,
      },
    });
  } catch {
    return NextResponse.json(agentError('Failed to fetch messages', 'فشل تحميل الرسائل'), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  return NextResponse.json(
    agentError(
      'Use agent chat endpoints (POST /api/agents/hr|recruitment|analytics with action: chat)',
      'استخدم نقاط محادثة الوكيل'
    ),
    { status: 400 }
  );
}
