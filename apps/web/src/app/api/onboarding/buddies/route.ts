import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch buddy assignments from onboarding instances
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const buddyId = searchParams.get('buddyId');

      const where: Record<string, unknown> = {
        tenantId,
        buddyId: { not: null },
      };
      if (buddyId) where.buddyId = buddyId;

      const instances = await prisma.onboardingInstance.findMany({
        where,
        include: {
          program: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform instances into buddy assignment format
      const assignments = instances.map((instance) => ({
        id: instance.id,
        onboardingId: instance.id,
        newHireId: instance.employeeId,
        newHireName: '', // Would be resolved by joining with employee table
        buddyId: instance.buddyId,
        buddyName: '', // Would be resolved by joining with employee table
        assignedDate: instance.createdAt.toISOString(),
        status: instance.status === 'completed' ? 'completed' : 'active',
        programName: instance.program?.programName || '',
        startDate: instance.startDate,
        progress: instance.progress,
      }));

      return NextResponse.json({ assignments }, { status: 200 });
    } catch (error: any) {
      console.error('Error fetching buddy assignments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch buddy assignments' },
        { status: 500 }
      );
    }
  }
);

// POST - Assign a buddy to an onboarding instance
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const body = await request.json();

      if (!body.instanceId || !body.buddyId) {
        return NextResponse.json(
          { error: 'Instance ID and Buddy ID are required' },
          { status: 400 }
        );
      }

      // Verify the instance belongs to this tenant
      const instance = await prisma.onboardingInstance.findFirst({
        where: { id: body.instanceId, tenantId },
      });

      if (!instance) {
        return NextResponse.json(
          { error: 'Onboarding instance not found' },
          { status: 404 }
        );
      }

      // Update the instance with the buddy assignment
      const updated = await prisma.onboardingInstance.update({
        where: { id: body.instanceId },
        data: {
          buddyId: body.buddyId,
        },
      });

      const assignment = {
        id: updated.id,
        onboardingId: updated.id,
        newHireId: updated.employeeId,
        buddyId: updated.buddyId,
        assignedDate: new Date().toISOString(),
        assignedBy: user.userId,
        status: 'active',
      };

      return NextResponse.json({ assignment }, { status: 201 });
    } catch (error: any) {
      console.error('Error assigning buddy:', error);
      return NextResponse.json(
        { error: 'Failed to assign buddy' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update buddy assignment
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

      const updated = await prisma.onboardingInstance.update({
        where: { id: instanceId },
        data: {
          ...(updateFields.buddyId !== undefined && { buddyId: updateFields.buddyId }),
        },
      });

      const assignment = {
        id: updated.id,
        onboardingId: updated.id,
        buddyId: updated.buddyId,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ assignment }, { status: 200 });
    } catch (error: any) {
      console.error('Error updating buddy assignment:', error);
      return NextResponse.json(
        { error: 'Failed to update buddy assignment' },
        { status: 500 }
      );
    }
  }
);
