import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch onboarding tasks for the tenant
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get('instanceId');
      const status = searchParams.get('status');
      const phase = searchParams.get('phase');
      const assignedTo = searchParams.get('assignedTo');

      const where: Record<string, unknown> = {
        instance: { tenantId },
      };
      if (instanceId) where.instanceId = instanceId;
      if (status) where.status = status;
      if (phase) where.phase = phase;
      if (assignedTo) where.assignedTo = assignedTo;

      const tasks = await prisma.onboardingTask.findMany({
        where,
        orderBy: [
          { priority: 'asc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
      console.error('Error fetching onboarding tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding tasks' },
        { status: 500 }
      );
    }
  }
);

// POST - Create a new onboarding task
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();

      if (!body.instanceId) {
        return NextResponse.json(
          { error: 'Instance ID is required' },
          { status: 400 }
        );
      }

      // Verify the instance belongs to this tenant
      const instance = await prisma.onboardingInstance.findFirst({
        where: { id: body.instanceId, tenantId: user.tenantId },
      });

      if (!instance) {
        return NextResponse.json(
          { error: 'Onboarding instance not found' },
          { status: 404 }
        );
      }

      const task = await prisma.onboardingTask.create({
        data: {
          instanceId: body.instanceId,
          taskName: body.taskName,
          description: body.description || '',
          category: body.category || null,
          phase: body.phase || null,
          responsibleParty: body.responsibleParty || null,
          assignedTo: body.assignedTo || null,
          priority: body.priority || 'medium',
          status: body.status || 'pending',
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          isMandatory: body.isMandatory ?? false,
          requiresApproval: body.requiresApproval ?? false,
          notes: body.notes || null,
        },
      });

      return NextResponse.json({ task }, { status: 201 });
    } catch (error) {
      console.error('Error creating onboarding task:', error);
      return NextResponse.json(
        { error: 'Failed to create onboarding task' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update a task (primarily for status updates)
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { id, ...updateFields } = body;

      if (!id) {
        return NextResponse.json(
          { error: 'Task ID is required' },
          { status: 400 }
        );
      }

      // Verify the task belongs to an instance within this tenant
      const existingTask = await prisma.onboardingTask.findFirst({
        where: {
          id,
          instance: { tenantId: user.tenantId },
        },
      });

      if (!existingTask) {
        return NextResponse.json(
          { error: 'Onboarding task not found' },
          { status: 404 }
        );
      }

      const task = await prisma.onboardingTask.update({
        where: { id },
        data: {
          ...(updateFields.taskName !== undefined && { taskName: updateFields.taskName }),
          ...(updateFields.description !== undefined && { description: updateFields.description }),
          ...(updateFields.category !== undefined && { category: updateFields.category }),
          ...(updateFields.phase !== undefined && { phase: updateFields.phase }),
          ...(updateFields.responsibleParty !== undefined && { responsibleParty: updateFields.responsibleParty }),
          ...(updateFields.assignedTo !== undefined && { assignedTo: updateFields.assignedTo }),
          ...(updateFields.priority !== undefined && { priority: updateFields.priority }),
          ...(updateFields.status !== undefined && { status: updateFields.status }),
          ...(updateFields.dueDate !== undefined && { dueDate: updateFields.dueDate ? new Date(updateFields.dueDate) : null }),
          ...(updateFields.completedDate !== undefined && { completedDate: updateFields.completedDate ? new Date(updateFields.completedDate) : null }),
          ...(updateFields.completedBy !== undefined && { completedBy: updateFields.completedBy }),
          ...(updateFields.isMandatory !== undefined && { isMandatory: updateFields.isMandatory }),
          ...(updateFields.requiresApproval !== undefined && { requiresApproval: updateFields.requiresApproval }),
          ...(updateFields.approvedBy !== undefined && { approvedBy: updateFields.approvedBy }),
          ...(updateFields.approvedAt !== undefined && { approvedAt: updateFields.approvedAt ? new Date(updateFields.approvedAt) : null }),
          ...(updateFields.notes !== undefined && { notes: updateFields.notes }),
        },
      });

      return NextResponse.json({ task }, { status: 200 });
    } catch (error) {
      console.error('Error updating onboarding task:', error);
      return NextResponse.json(
        { error: 'Failed to update onboarding task' },
        { status: 500 }
      );
    }
  }
);
