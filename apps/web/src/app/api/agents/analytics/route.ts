/**
 * Analytics Agent API Routes
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveAgentAuth } from '@/lib/ai/agent-auth';
import { agentError } from '@/lib/ai/agent-types';
import { chatWithAnalyticsAgent } from '@/lib/ai/analytics-agent-ai';
import { AnalyticsAgentService } from '@/lib/services/agentic-ai';

export async function GET(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const definition = AnalyticsAgentService.getDefinition();
    return NextResponse.json({
      success: true,
      data: {
        id: definition.id,
        type: definition.type,
        name: definition.name,
        description: definition.description,
        capabilities: definition.capabilities,
        isActive: definition.isActive,
      },
    });
  } catch {
    return NextResponse.json(
      agentError('Failed to fetch analytics agent', 'فشل تحميل وكيل التحليلات'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, message, sessionId, params } = body;

    if (action === 'chat') {
      if (!message?.trim()) {
        return NextResponse.json(agentError('Message is required', 'الرسالة مطلوبة'), {
          status: 400,
        });
      }
      const result = await chatWithAnalyticsAgent(auth, String(message), sessionId);
      return NextResponse.json({ success: true, data: result });
    }

    let result: unknown;
    switch (action) {
      case 'GENERATE_INSIGHT':
        result = await AnalyticsAgentService.generateInsight(
          { domain: params?.domain || 'WORKFORCE', question: params?.question || '' },
          auth.tenantId
        );
        break;
      case 'ANALYZE_TREND':
        result = await AnalyticsAgentService.analyzeTrend(
          params?.metricId || 'headcount',
          auth.tenantId,
          params?.period || { start: new Date(Date.now() - 90 * 86400000), end: new Date() },
          params?.granularity || 'MONTH'
        );
        break;
      case 'DETECT_ANOMALIES':
        result = await AnalyticsAgentService.detectAnomalies(
          auth.tenantId,
          params?.domain || 'WORKFORCE'
        );
        break;
      case 'GENERATE_REPORT':
        result = await AnalyticsAgentService.generateReport(
          params?.reportType || 'WORKFORCE_REVIEW',
          auth.tenantId,
          params?.options
        );
        break;
      default:
        return NextResponse.json(agentError(`Unknown action: ${action}`, 'إجراء غير معروف'), {
          status: 400,
        });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to execute action';
    return NextResponse.json(agentError(msg, 'فشل تنفيذ الإجراء'), { status: 500 });
  }
}
