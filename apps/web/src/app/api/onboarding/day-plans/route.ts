import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch 30-60-90 day plans derived from instances and tasks grouped by phase
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get('instanceId');

      const where: Record<string, unknown> = { tenantId };
      if (instanceId) where.id = instanceId;

      const instances = await prisma.onboardingInstance.findMany({
        where,
        include: {
          tasks: {
            orderBy: { dueDate: 'asc' },
          },
          program: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform instances into day plan format grouped by milestone phases
      const plans = instances.map((instance) => {
        const tasks = instance.tasks;

        // Group tasks by phase milestones
        const day30Tasks = tasks.filter(
          (t) => t.phase === 'first_week' || t.phase === 'first_month' || t.phase === 'day_30'
        );
        const day60Tasks = tasks.filter((t) => t.phase === 'day_60');
        const day90Tasks = tasks.filter((t) => t.phase === 'day_90');

        const buildMilestone = (phaseTasks: typeof tasks, phase: string) => {
          const total = phaseTasks.length;
          const completed = phaseTasks.filter((t) => t.status === 'completed').length;
          return {
            milestoneId: `${instance.id}-${phase}`,
            phase,
            goals: phaseTasks.map((t) => ({
              goalId: t.id,
              description: t.taskName,
              status: t.status,
              completedDate: t.completedDate?.toISOString() || null,
            })),
            achievementPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            status: completed === total && total > 0 ? 'completed' : total > 0 ? 'in_progress' : 'not_started',
          };
        };

        return {
          id: instance.id,
          onboardingId: instance.id,
          employeeId: instance.employeeId,
          managerId: instance.managerId,
          status: instance.status,
          day30Goals: buildMilestone(day30Tasks, 'day_30'),
          day60Goals: buildMilestone(day60Tasks, 'day_60'),
          day90Goals: buildMilestone(day90Tasks, 'day_90'),
          createdDate: instance.createdAt.toISOString(),
          programName: instance.program?.programName || '',
        };
      });

      return NextResponse.json({ plans }, { status: 200 });
    } catch (error) {
      console.error('Error fetching day plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch day plans' },
        { status: 500 }
      );
    }
  }
);

// POST - Create a day plan (creates tasks for the plan phases)
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const body = await request.json();

      if (!body.instanceId) {
        return NextResponse.json(
          { error: 'Instance ID is required' },
          { status: 400 }
        );
      }

      const instance = await prisma.onboardingInstance.findFirst({
        where: { id: body.instanceId, tenantId },
      });

      if (!instance) {
        return NextResponse.json(
          { error: 'Onboarding instance not found' },
          { status: 404 }
        );
      }

      // Create tasks for each phase of the plan
      const phases = ['day_30', 'day_60', 'day_90'];
      for (const phase of phases) {
        const goals = body[`${phase}Goals`] || [];
        for (const goal of goals) {
          await prisma.onboardingTask.create({
            data: {
              instanceId: body.instanceId,
              taskName: goal.description || goal.title,
              description: goal.description || '',
              phase,
              priority: goal.priority || 'medium',
              status: 'pending',
              dueDate: goal.targetDate ? new Date(goal.targetDate) : null,
              isMandatory: goal.isMandatory ?? false,
              requiresApproval: false,
            },
          });
        }
      }

      const plan = {
        id: instance.id,
        onboardingId: instance.id,
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      return NextResponse.json({ plan }, { status: 201 });
    } catch (error) {
      console.error('Error creating day plan:', error);
      return NextResponse.json(
        { error: 'Failed to create day plan' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update a day plan
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const body = await request.json();
      const { instanceId, ...updateFields } = body;

      if (!instanceId) {
        return NextResponse.json(
          { error: 'Instance ID is required' },
          { status: 400 }
        );
      }

      const instance = await prisma.onboardingInstance.findFirst({
        where: { id: instanceId, tenantId },
      });

      if (!instance) {
        return NextResponse.json(
          { error: 'Onboarding instance not found' },
          { status: 404 }
        );
      }

      // Update notes or other fields on the instance
      const updated = await prisma.onboardingInstance.update({
        where: { id: instanceId },
        data: {
          ...(updateFields.notes !== undefined && { notes: updateFields.notes }),
        },
      });

      const plan = {
        id: updated.id,
        onboardingId: updated.id,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ plan }, { status: 200 });
    } catch (error) {
      console.error('Error updating day plan:', error);
      return NextResponse.json(
        { error: 'Failed to update day plan' },
        { status: 500 }
      );
    }
  }
);
