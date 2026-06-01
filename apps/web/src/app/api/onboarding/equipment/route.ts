import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch equipment requirements from onboarding programs
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get('instanceId');
      const programId = searchParams.get('programId');

      if (instanceId) {
        // Get equipment for a specific instance from its program
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

        const equipmentRequired = (instance.program?.equipmentRequired as unknown[]) || [];
        return NextResponse.json({ equipment: equipmentRequired }, { status: 200 });
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

        const equipmentRequired = (program.equipmentRequired as unknown[]) || [];
        return NextResponse.json({ equipment: equipmentRequired }, { status: 200 });
      }

      // Get all equipment requirements across active programs
      const programs = await prisma.onboardingProgram.findMany({
        where: { tenantId, isActive: true },
        select: { id: true, programName: true, equipmentRequired: true },
      });

      const equipment = programs.flatMap((p) => {
        const items = (p.equipmentRequired as unknown[]) || [];
        return items.map((item: unknown) => ({
          ...(item as Record<string, unknown>),
          programId: p.id,
          programName: p.programName,
        }));
      });

      return NextResponse.json({ equipment }, { status: 200 });
    } catch (error: any) {
      console.error('Error fetching onboarding equipment:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding equipment' },
        { status: 500 }
      );
    }
  }
);

// POST - Request equipment for an onboarding instance
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

      // Track equipment request as a task
      const task = await prisma.onboardingTask.create({
        data: {
          instanceId: body.instanceId,
          taskName: `Equipment: ${body.equipmentName || 'Request'}`,
          description: body.description || '',
          category: 'equipment',
          phase: body.phase || 'pre_boarding',
          responsibleParty: 'it',
          priority: 'high',
          status: 'pending',
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          isMandatory: true,
          requiresApproval: true,
          notes: JSON.stringify({
            equipmentType: body.equipmentType,
            specifications: body.specifications,
            requestedBy: user.userId,
          }),
        },
      });

      const equipment = {
        id: task.id,
        instanceId: body.instanceId,
        equipmentName: body.equipmentName,
        status: 'requested',
        requestedDate: new Date().toISOString(),
        requestedBy: user.userId,
      };

      return NextResponse.json({ equipment }, { status: 201 });
    } catch (error: any) {
      console.error('Error requesting equipment:', error);
      return NextResponse.json(
        { error: 'Failed to request equipment' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update equipment status
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { id, ...updateFields } = body;

      if (!id) {
        return NextResponse.json(
          { error: 'Equipment/Task ID is required' },
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
          { error: 'Equipment record not found' },
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

      const equipment = {
        id: task.id,
        status: task.status,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ equipment }, { status: 200 });
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      return NextResponse.json(
        { error: 'Failed to update equipment' },
        { status: 500 }
      );
    }
  }
);
