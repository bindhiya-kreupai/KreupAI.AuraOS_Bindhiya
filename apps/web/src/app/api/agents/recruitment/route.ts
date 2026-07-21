/**
 * Recruitment Agent API Routes
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveAgentAuth } from '@/lib/ai/agent-auth';
import { agentError } from '@/lib/ai/agent-types';
import { chatWithRecruitmentAgent } from '@/lib/ai/recruitment-agent-ai';
import { RecruitmentAgentService } from '@/lib/services/agentic-ai';

export async function GET(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const definition = RecruitmentAgentService.getDefinition();
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
      agentError('Failed to fetch recruitment agent', 'فشل تحميل وكيل التوظيف'),
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
      const result = await chatWithRecruitmentAgent(auth, String(message), sessionId);
      return NextResponse.json({ success: true, data: result });
    }

    let result: unknown;
    switch (action) {
      case 'SCREEN_CANDIDATES': {
        const jobId = String(params?.jobId || '');
        if (!jobId) {
          return NextResponse.json(agentError('jobId is required', 'معرف الوظيفة مطلوب'), {
            status: 400,
          });
        }
        result = await RecruitmentAgentService.screenCandidates(
          jobId,
          auth.tenantId,
          params?.criteria
        );
        break;
      }
      case 'GET_UPCOMING_INTERVIEWS':
        result = await RecruitmentAgentService.getUpcomingInterviews(auth.tenantId, params);
        break;
      case 'GET_PIPELINE_STATS':
        result = await RecruitmentAgentService.getPipelineStats(auth.tenantId);
        break;
      case 'GET_OPEN_POSITIONS':
        result = await RecruitmentAgentService.getOpenPositions(auth.tenantId);
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
