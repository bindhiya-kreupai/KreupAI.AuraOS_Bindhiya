/**
 * Agent Session Detail API Routes
 * Phase 4 Sprint 31-32: Session Management
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { AgentFrameworkService } from '@/lib/services/agentic-ai';

/**
 * GET /api/agents/sessions/[sessionId]
 * Get session details and conversation history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = AgentFrameworkService.getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        agentType: session.agentType,
        userId: session.userId,
        startedAt: session.startedAt,
        lastActivityAt: session.lastActivityAt,
        messages: session.messages,
        currentIntent: session.currentIntent,
        state: session.state,
      },
    });
  } catch (error: any) {
        return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/sessions/[sessionId]
 * End a conversation session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = AgentFrameworkService.getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    AgentFrameworkService.endSession(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Session ended successfully',
    });
  } catch (error: any) {
        return NextResponse.json(
      { success: false, error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
