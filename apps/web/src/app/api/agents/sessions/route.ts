/**
 * Agent Sessions API Routes
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveAgentAuth } from '@/lib/ai/agent-auth';
import { agentError, AGENT_TYPES, type AgentTypeValue } from '@/lib/ai/agent-types';
import {
  deleteSession,
  getOrCreateSession,
  getSessionById,
  listSessions,
} from '@/lib/ai/agent-session';

const VALID_TYPES: AgentTypeValue[] = [
  AGENT_TYPES.HR,
  AGENT_TYPES.RECRUITMENT,
  AGENT_TYPES.ANALYTICS,
];

export async function POST(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const body = await request.json();
    const { agentType, sessionId } = body;

    if (!agentType || !VALID_TYPES.includes(agentType)) {
      return NextResponse.json(
        agentError(
          `Invalid agent type. Must be one of: ${VALID_TYPES.join(', ')}`,
          'نوع وكيل غير صالح'
        ),
        { status: 400 }
      );
    }

    const session = await getOrCreateSession(auth.tenantId, auth.userId, agentType, sessionId);

    const detail = await getSessionById(auth.tenantId, auth.userId, session.sessionId);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        agentType: session.agentType,
        startedAt: session.createdAt,
        messages: (detail?.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.createdAt.toISOString(),
        })),
      },
    });
  } catch {
    return NextResponse.json(agentError('Failed to start session', 'فشل بدء الجلسة'), {
      status: 500,
    });
  }
}

export async function GET(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const agentType = searchParams.get('agentType') as AgentTypeValue | null;
    const sessions = await listSessions(
      auth.tenantId,
      auth.userId,
      agentType && VALID_TYPES.includes(agentType) ? agentType : undefined
    );
    return NextResponse.json({ success: true, data: sessions });
  } catch {
    return NextResponse.json(agentError('Failed to fetch sessions', 'فشل تحميل الجلسات'), {
      status: 500,
    });
  }
}
