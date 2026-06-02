/**
 * Agent Sessions API Routes
 * Phase 4 Sprint 31-32: Conversation Sessions
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { AgentType } from '@/lib/services/agentic-ai';
import { AgentFrameworkService } from '@/lib/services/agentic-ai';

/**
 * POST /api/agents/sessions
 * Start a new conversation session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentType, userId, tenantId } = body;

    if (!agentType || !userId || !tenantId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: agentType, userId, tenantId' },
        { status: 400 }
      );
    }

    // Validate agent type
    const validTypes: AgentType[] = ['HR_AGENT', 'RECRUITMENT_AGENT', 'ANALYTICS_AGENT'];
    if (!validTypes.includes(agentType)) {
      return NextResponse.json(
        { success: false, error: `Invalid agent type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const session = await AgentFrameworkService.startSession(
      userId,
      tenantId,
      agentType as AgentType
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        agentType: session.agentType,
        startedAt: session.startedAt,
        messages: session.messages,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to start session' }, { status: 500 });
  }
}

/**
 * GET /api/agents/sessions
 * Get all active sessions for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tenantId = searchParams.get('tenantId');

    if (!userId || !tenantId) {
      return NextResponse.json(
        { success: false, error: 'Missing required query params: userId, tenantId' },
        { status: 400 }
      );
    }

    // In production, fetch from database
    // For now, return empty array (sessions are in memory)
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
