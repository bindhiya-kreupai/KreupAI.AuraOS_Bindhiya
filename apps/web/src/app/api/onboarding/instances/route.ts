import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch all onboarding instances for the tenant
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const employeeId = searchParams.get('employeeId');
      const programId = searchParams.get('programId');

      const where: Record<string, unknown> = { tenantId };
      if (status) where.status = status;
      if (employeeId) where.employeeId = employeeId;
      if (programId) where.programId = programId;

      const instances = await prisma.onboardingInstance.findMany({
        where,
        include: {
          tasks: true,
          program: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ instances }, { status: 200 });
    } catch (error) {
      console.error('Error fetching onboarding instances:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding instances' },
        { status: 500 }
      );
    }
  }
);

// POST - Create a new onboarding instance
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const body = await request.json();

      const instance = await prisma.onboardingInstance.create({
        data: {
          tenantId,
          employeeId: body.employeeId,
          programId: body.programId,
          status: body.status || 'not_started',
          startDate: body.startDate ? new Date(body.startDate) : null,
          hireDate: body.hireDate ? new Date(body.hireDate) : null,
          managerId: body.managerId || null,
          buddyId: body.buddyId || null,
          progress: body.progress ?? 0,
          totalTasks: body.totalTasks ?? 0,
          completedTasks: body.completedTasks ?? 0,
          overdueTasks: body.overdueTasks ?? 0,
          currentPhase: body.currentPhase || null,
          notes: body.notes || null,
          createdBy: user.userId,
        },
        include: {
          tasks: true,
          program: true,
        },
      });

      return NextResponse.json({ instance }, { status: 201 });
    } catch (error) {
      console.error('Error creating onboarding instance:', error);
      return NextResponse.json(
        { error: 'Failed to create onboarding instance' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update an existing onboarding instance
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const body = await request.json();
      const { id, ...updateFields } = body;

      if (!id) {
        return NextResponse.json(
          { error: 'Instance ID is required' },
          { status: 400 }
        );
      }

      // Verify the instance belongs to this tenant
      const existing = await prisma.onboardingInstance.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Onboarding instance not found' },
          { status: 404 }
        );
      }

      const instance = await prisma.onboardingInstance.update({
        where: { id },
        data: {
          ...(updateFields.status !== undefined && { status: updateFields.status }),
          ...(updateFields.startDate !== undefined && { startDate: updateFields.startDate ? new Date(updateFields.startDate) : null }),
          ...(updateFields.completionDate !== undefined && { completionDate: updateFields.completionDate ? new Date(updateFields.completionDate) : null }),
          ...(updateFields.managerId !== undefined && { managerId: updateFields.managerId }),
          ...(updateFields.buddyId !== undefined && { buddyId: updateFields.buddyId }),
          ...(updateFields.progress !== undefined && { progress: updateFields.progress }),
          ...(updateFields.totalTasks !== undefined && { totalTasks: updateFields.totalTasks }),
          ...(updateFields.completedTasks !== undefined && { completedTasks: updateFields.completedTasks }),
          ...(updateFields.overdueTasks !== undefined && { overdueTasks: updateFields.overdueTasks }),
          ...(updateFields.currentPhase !== undefined && { currentPhase: updateFields.currentPhase }),
          ...(updateFields.notes !== undefined && { notes: updateFields.notes }),
        },
        include: {
          tasks: true,
          program: true,
        },
      });

      return NextResponse.json({ instance }, { status: 200 });
    } catch (error) {
      console.error('Error updating onboarding instance:', error);
      return NextResponse.json(
        { error: 'Failed to update onboarding instance' },
        { status: 500 }
      );
    }
  }
);
