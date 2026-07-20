/**
 * Agent Metrics Summary API — dashboard KPIs
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveAgentAuth } from '@/lib/ai/agent-auth';
import { agentError } from '@/lib/ai/agent-types';
import { getAgentMetricsSummary } from '@/lib/ai/agent-session';

export async function GET(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get('days') || 30);
    const summary = await getAgentMetricsSummary(auth.tenantId, days);
    return NextResponse.json({ success: true, data: summary });
  } catch {
    return NextResponse.json(
      agentError('Failed to fetch metrics summary', 'فشل تحميل ملخص المقاييس'),
      { status: 500 }
    );
  }
}
