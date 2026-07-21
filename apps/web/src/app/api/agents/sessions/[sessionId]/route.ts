/**
 * Agent Session Detail API Routes
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveAgentAuth } from '@/lib/ai/agent-auth';
import { agentError } from '@/lib/ai/agent-types';
import { deleteSession, getSessionById } from '@/lib/ai/agent-session';

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
    return NextResponse.json({ success: true, data: session });
  } catch {
    return NextResponse.json(agentError('Failed to fetch session', 'فشل تحميل الجلسة'), {
      status: 500,
    });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const { sessionId } = await context.params;
    const deleted = await deleteSession(auth.tenantId, auth.userId, sessionId);
    if (!deleted) {
      return NextResponse.json(agentError('Session not found', 'الجلسة غير موجودة'), {
        status: 404,
      });
    }
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json(agentError('Failed to delete session', 'فشل حذف الجلسة'), {
      status: 500,
    });
  }
}
