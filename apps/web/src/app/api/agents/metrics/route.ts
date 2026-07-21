/**
 * Agent Metrics API Routes
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveAgentAuth } from '@/lib/ai/agent-auth';
import { agentError, AGENT_TYPES, type AgentTypeValue } from '@/lib/ai/agent-types';
import { getAgentMetricsByType } from '@/lib/ai/agent-session';

const VALID_TYPES: AgentTypeValue[] = [
  AGENT_TYPES.HR,
  AGENT_TYPES.RECRUITMENT,
  AGENT_TYPES.ANALYTICS,
];

export async function GET(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const agentType = searchParams.get('agentType') as AgentTypeValue;
    const days = Number(searchParams.get('days') || 30);

    if (!agentType || !VALID_TYPES.includes(agentType)) {
      return NextResponse.json(
        agentError(
          `Invalid agent type. Must be one of: ${VALID_TYPES.join(', ')}`,
          'نوع وكيل غير صالح'
        ),
        { status: 400 }
      );
    }

    const metrics = await getAgentMetricsByType(auth.tenantId, agentType, days);
    return NextResponse.json({ success: true, data: metrics });
  } catch {
    return NextResponse.json(agentError('Failed to fetch metrics', 'فشل تحميل المقاييس'), {
      status: 500,
    });
  }
}
