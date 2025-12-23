/**
 * Agent Messages API Routes
 * Phase 4 Sprint 31-32: Conversation Messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { AgentFrameworkService } from '@/lib/services/agentic-ai';

/**
 * POST /api/agents/sessions/[sessionId]/messages
 * Send a message to the agent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    const session = AgentFrameworkService.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Process the message and get response
    const response = await AgentFrameworkService.processMessage(sessionId, message);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: response.sessionId,
        messageId: response.messageId,
        agentType: response.agentType,
        content: response.content,
        contentType: response.contentType,
        intent: response.intent,
        actions: response.actions,
        suggestions: response.suggestions,
        attachments: response.attachments,
        requiresInput: response.requiresInput,
        timestamp: response.timestamp,
      },
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/sessions/[sessionId]/messages
 * Get conversation history
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
        messages: session.messages,
        totalMessages: session.messages.length,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
