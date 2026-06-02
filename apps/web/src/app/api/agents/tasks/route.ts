/**
 * Agent Tasks API Routes
 * Phase 4 Sprint 31-32: Task Management
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { AgentFrameworkService } from '@/lib/services/agentic-ai';
import type { TaskPriority , AgentType } from '@/lib/services/agentic-ai';

/**
 * GET /api/agents/tasks
 * Get tasks for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const agentType = searchParams.get('agentType');

    if (!userId || !tenantId) {
      return NextResponse.json(
        { success: false, error: 'Missing required query params: userId, tenantId' },
        { status: 400 }
      );
    }

    const tasks = await AgentFrameworkService.getUserTasks(userId, tenantId, {
      status: status as any,
      agentType: agentType as AgentType,
    });

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
        return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agentType,
      tenantId,
      userId,
      type,
      title,
      description,
      priority,
      input,
      dueDate,
    } = body;

    if (!agentType || !tenantId || !userId || !type || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const task = await AgentFrameworkService.createTask({
      agentType,
      tenantId,
      userId,
      type,
      title,
      description: description || '',
      priority: priority as TaskPriority || 'MEDIUM',
      input: input || {},
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
        return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
