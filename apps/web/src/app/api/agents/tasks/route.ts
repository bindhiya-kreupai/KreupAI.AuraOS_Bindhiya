/**
 * Agent Tasks API Routes
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveAgentAuth } from '@/lib/ai/agent-auth';
import { agentError } from '@/lib/ai/agent-types';
import { AgentFrameworkService } from '@/lib/services/agentic-ai';
import type { TaskPriority, AgentType } from '@/lib/services/agentic-ai';

export async function GET(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const agentType = searchParams.get('agentType');

    const tasks = await AgentFrameworkService.getUserTasks(auth.userId, auth.tenantId, {
      status: status as never,
      agentType: agentType as AgentType,
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch {
    return NextResponse.json(agentError('Failed to fetch tasks', 'فشل تحميل المهام'), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  if (!auth.canWrite) {
    return NextResponse.json(agentError('Permission denied', 'تم رفض الإذن'), { status: 403 });
  }

  try {
    const body = await request.json();
    const { agentType, type, title, description, priority, input, dueDate } = body;

    if (!agentType || !type || !title) {
      return NextResponse.json(agentError('Missing required fields', 'حقول مطلوبة مفقودة'), {
        status: 400,
      });
    }

    const task = await AgentFrameworkService.createTask({
      agentType,
      tenantId: auth.tenantId,
      userId: auth.userId,
      type,
      title,
      description: description || '',
      priority: (priority as TaskPriority) || 'MEDIUM',
      input: input || {},
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return NextResponse.json({ success: true, data: task });
  } catch {
    return NextResponse.json(agentError('Failed to create task', 'فشل إنشاء المهمة'), {
      status: 500,
    });
  }
}
