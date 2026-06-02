import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch access requirements from onboarding programs
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get('instanceId');
      const programId = searchParams.get('programId');

      if (instanceId) {
        // Get access requirements for a specific instance from its program
        const instance = await prisma.onboardingInstance.findFirst({
          where: { id: instanceId, tenantId },
          include: { program: true },
        });

        if (!instance) {
          return NextResponse.json(
            { error: 'Onboarding instance not found' },
            { status: 404 }
          );
        }

        const accessRequired = (instance.program?.accessRequired as unknown[]) || [];
        return NextResponse.json({ access: accessRequired }, { status: 200 });
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

        const accessRequired = (program.accessRequired as unknown[]) || [];
        return NextResponse.json({ access: accessRequired }, { status: 200 });
      }

      // Get all access requirements across active programs
      const programs = await prisma.onboardingProgram.findMany({
        where: { tenantId, isActive: true },
        select: { id: true, programName: true, accessRequired: true },
      });

      const access = programs.flatMap((p) => {
        const items = (p.accessRequired as unknown[]) || [];
        return items.map((item: unknown) => ({
          ...(item as Record<string, unknown>),
          programId: p.id,
          programName: p.programName,
        }));
      });

      return NextResponse.json({ access }, { status: 200 });
    } catch (error: any) {
      console.error('Error fetching onboarding access:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding access' },
        { status: 500 }
      );
    }
  }
);

// POST - Request access for an onboarding instance
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

      // Track access request as a task
      const task = await prisma.onboardingTask.create({
        data: {
          instanceId: body.instanceId,
          taskName: `Access: ${body.accessName || 'Request'}`,
          description: body.description || '',
          category: 'access',
          phase: body.phase || 'first_day',
          responsibleParty: 'it',
          priority: 'high',
          status: 'pending',
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          isMandatory: true,
          requiresApproval: true,
          notes: JSON.stringify({
            accessType: body.accessType,
            systems: body.systems,
            permissions: body.permissions,
            requestedBy: user.userId,
          }),
        },
      });

      const access = {
        id: task.id,
        instanceId: body.instanceId,
        accessName: body.accessName,
        status: 'requested',
        requestedDate: new Date().toISOString(),
        requestedBy: user.userId,
      };

      return NextResponse.json({ access }, { status: 201 });
    } catch (error: any) {
      console.error('Error requesting access:', error);
      return NextResponse.json(
        { error: 'Failed to request access' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update access status (grant, revoke)
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { id, ...updateFields } = body;

      if (!id) {
        return NextResponse.json(
          { error: 'Access/Task ID is required' },
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
          { error: 'Access record not found' },
          { status: 404 }
        );
      }

      const task = await prisma.onboardingTask.update({
        where: { id },
        data: {
          ...(updateFields.status !== undefined && { status: updateFields.status }),
          ...(updateFields.notes !== undefined && { notes: updateFields.notes }),
          ...(updateFields.status === 'completed' && {
            completedDate: new Date(),
            completedBy: user.userId,
          }),
        },
      });

      const access = {
        id: task.id,
        status: task.status,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ access }, { status: 200 });
    } catch (error: any) {
      console.error('Error updating access:', error);
      return NextResponse.json(
        { error: 'Failed to update access' },
        { status: 500 }
      );
    }
  }
);
