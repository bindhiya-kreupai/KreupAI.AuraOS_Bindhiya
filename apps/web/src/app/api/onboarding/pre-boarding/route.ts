import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch pre-boarding packages (tasks in pre_boarding phase + program pre-boarding config)
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get('instanceId');

      // Get instances with pre-boarding tasks
      const where: Record<string, unknown> = { tenantId };
      if (instanceId) where.id = instanceId;

      const instances = await prisma.onboardingInstance.findMany({
        where,
        include: {
          tasks: {
            where: { phase: 'pre_boarding' },
            orderBy: { dueDate: 'asc' },
          },
          program: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Build pre-boarding packages from instances
      const packages = instances.map((instance) => ({
        id: instance.id,
        onboardingId: instance.id,
        employeeId: instance.employeeId,
        employeeName: '', // Will be populated by frontend if needed
        status: instance.status === 'not_started' ? 'draft' : 'sent',
        tasks: instance.tasks,
        programName: instance.program?.programName || '',
        documentsRequired: instance.program?.documentsRequired || [],
        startDate: instance.startDate,
        hireDate: instance.hireDate,
      }));

      return NextResponse.json({ packages }, { status: 200 });
    } catch (error: any) {
      console.error('Error fetching pre-boarding packages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pre-boarding packages' },
        { status: 500 }
      );
    }
  }
);

// POST - Create/send a pre-boarding package
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

      // Verify the instance belongs to this tenant
      const instance = await prisma.onboardingInstance.findFirst({
        where: { id: body.instanceId, tenantId },
        include: { program: true },
      });

      if (!instance) {
        return NextResponse.json(
          { error: 'Onboarding instance not found' },
          { status: 404 }
        );
      }

      // Create pre-boarding tasks from the program template if provided
      if (body.tasks && Array.isArray(body.tasks)) {
        for (const taskData of body.tasks) {
          await prisma.onboardingTask.create({
            data: {
              instanceId: body.instanceId,
              taskName: taskData.taskName,
              description: taskData.description || '',
              category: taskData.category || 'documentation',
              phase: 'pre_boarding',
              responsibleParty: taskData.responsibleParty || 'new_hire',
              priority: taskData.priority || 'medium',
              status: 'pending',
              dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
              isMandatory: taskData.isMandatory ?? true,
              requiresApproval: taskData.requiresApproval ?? false,
            },
          });
        }
      }

      const preBoardingPackage = {
        id: instance.id,
        onboardingId: instance.id,
        status: 'sent',
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      return NextResponse.json({ package: preBoardingPackage }, { status: 201 });
    } catch (error: any) {
      console.error('Error creating pre-boarding package:', error);
      return NextResponse.json(
        { error: 'Failed to create pre-boarding package' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update pre-boarding package status
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

      // Update instance notes or status as needed
      const updated = await prisma.onboardingInstance.update({
        where: { id: instanceId },
        data: {
          ...(updateFields.notes !== undefined && { notes: updateFields.notes }),
        },
        include: {
          tasks: {
            where: { phase: 'pre_boarding' },
          },
        },
      });

      const preBoardingPackage = {
        id: updated.id,
        onboardingId: updated.id,
        tasks: updated.tasks,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ package: preBoardingPackage }, { status: 200 });
    } catch (error: any) {
      console.error('Error updating pre-boarding package:', error);
      return NextResponse.json(
        { error: 'Failed to update pre-boarding package' },
        { status: 500 }
      );
    }
  }
);
