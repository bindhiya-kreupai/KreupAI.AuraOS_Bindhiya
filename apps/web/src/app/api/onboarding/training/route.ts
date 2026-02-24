import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch training modules from onboarding programs
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get('instanceId');
      const programId = searchParams.get('programId');

      if (instanceId) {
        // Get training modules for a specific instance from its program
        const instance = await prisma.onboardingInstance.findFirst({
          where: { id: instanceId, tenantId },
          include: {
            program: true,
            tasks: {
              where: { category: 'training' },
              orderBy: { dueDate: 'asc' },
            },
          },
        });

        if (!instance) {
          return NextResponse.json(
            { error: 'Onboarding instance not found' },
            { status: 404 }
          );
        }

        const trainingModules = (instance.program?.trainingModules as unknown[]) || [];
        const trainingTasks = instance.tasks;

        return NextResponse.json({
          training: trainingModules,
          tasks: trainingTasks,
        }, { status: 200 });
      }

      if (programId) {
        const program = await prisma.onboardingProgram.findFirst({
          where: { id: programId, tenantId },
        });

        if (!program) {
          return NextResponse.json(
            { error: 'Onboarding program not found' },
            { status: 404 }
          );
        }

        const trainingModules = (program.trainingModules as unknown[]) || [];
        return NextResponse.json({ training: trainingModules }, { status: 200 });
      }

      // Get all training modules across active programs
      const programs = await prisma.onboardingProgram.findMany({
        where: { tenantId, isActive: true },
        select: { id: true, programName: true, trainingModules: true },
      });

      const training = programs.flatMap((p) => {
        const modules = (p.trainingModules as unknown[]) || [];
        return modules.map((mod: unknown) => ({
          ...(mod as Record<string, unknown>),
          programId: p.id,
          programName: p.programName,
        }));
      });

      return NextResponse.json({ training }, { status: 200 });
    } catch (error) {
      console.error('Error fetching onboarding training:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding training' },
        { status: 500 }
      );
    }
  }
);

// POST - Schedule or create training for an instance
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

      const instance = await prisma.onboardingInstance.findFirst({
        where: { id: body.instanceId, tenantId: user.tenantId },
      });

      if (!instance) {
        return NextResponse.json(
          { error: 'Onboarding instance not found' },
          { status: 404 }
        );
      }

      // Create a training task
      const task = await prisma.onboardingTask.create({
        data: {
          instanceId: body.instanceId,
          taskName: `Training: ${body.moduleName || body.taskName || 'Session'}`,
          description: body.description || '',
          category: 'training',
          phase: body.phase || 'first_week',
          responsibleParty: body.responsibleParty || 'hr',
          assignedTo: body.assignedTo || null,
          priority: body.priority || 'medium',
          status: 'pending',
          dueDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
          isMandatory: body.isMandatory ?? true,
          requiresApproval: false,
          notes: JSON.stringify({
            moduleId: body.moduleId,
            location: body.location,
            meetingLink: body.meetingLink,
            durationHours: body.durationHours,
            instructor: body.instructor,
          }),
        },
      });

      const training = {
        id: task.id,
        instanceId: body.instanceId,
        moduleName: body.moduleName,
        status: 'scheduled',
        scheduledDate: body.scheduledDate,
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ training }, { status: 201 });
    } catch (error) {
      console.error('Error creating training:', error);
      return NextResponse.json(
        { error: 'Failed to create training' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update training status (complete, reschedule)
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { id, ...updateFields } = body;

      if (!id) {
        return NextResponse.json(
          { error: 'Training/Task ID is required' },
          { status: 400 }
        );
      }

      const existingTask = await prisma.onboardingTask.findFirst({
        where: {
          id,
          instance: { tenantId: user.tenantId },
        },
      });

      if (!existingTask) {
        return NextResponse.json(
          { error: 'Training record not found' },
          { status: 404 }
        );
      }

      const task = await prisma.onboardingTask.update({
        where: { id },
        data: {
          ...(updateFields.status !== undefined && { status: updateFields.status }),
          ...(updateFields.dueDate !== undefined && { dueDate: updateFields.dueDate ? new Date(updateFields.dueDate) : null }),
          ...(updateFields.notes !== undefined && { notes: updateFields.notes }),
          ...(updateFields.status === 'completed' && {
            completedDate: new Date(),
            completedBy: user.userId,
          }),
        },
      });

      const training = {
        id: task.id,
        status: task.status,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ training }, { status: 200 });
    } catch (error) {
      console.error('Error updating training:', error);
      return NextResponse.json(
        { error: 'Failed to update training' },
        { status: 500 }
      );
    }
  }
);
