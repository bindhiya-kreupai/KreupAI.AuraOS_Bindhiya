/**
 * Agent Task Detail API Routes
 * Phase 4 Sprint 31-32: Task Management
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { AgentFrameworkService } from '@/lib/services/agentic-ai';
import type { TaskStatus } from '@/lib/services/agentic-ai';

/**
 * GET /api/agents/tasks/[taskId]
 * Get task details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const task = await AgentFrameworkService.getTask(taskId);

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch {
        return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/agents/tasks/[taskId]
 * Update task status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const { status, output } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses: TaskStatus[] = [
      'PENDING',
      'QUEUED',
      'IN_PROGRESS',
      'WAITING_APPROVAL',
      'WAITING_INPUT',
      'COMPLETED',
      'FAILED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const task = await AgentFrameworkService.updateTaskStatus(taskId, status, output);

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch {
        return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task'
      },
      { status: 500 }
    );
  }
}
