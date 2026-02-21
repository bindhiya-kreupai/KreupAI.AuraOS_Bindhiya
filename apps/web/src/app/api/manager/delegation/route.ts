import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const createDelegationSchema = z.object({
  delegateName: z.string().min(1),
  delegateId: z.string().min(1),
  scope: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['active', 'scheduled', 'inactive']).optional(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId') || user.userId;

    const delegations = await prisma.userDelegation.findMany({
      where: {
        delegatorId: managerId,
        delegator: { tenantId: user.tenantId },
      },
      include: {
        delegatee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rules = delegations.map((d) => ({
      delegationId: d.id,
      delegationName: `Delegation to ${d.delegatee.firstName || ''} ${d.delegatee.lastName || ''}`.trim(),
      status: determineDelegationStatus(d.startDate, d.endDate),
      startDate: d.startDate,
      endDate: d.endDate,
      delegatorId: d.delegatorId,
      delegateId: d.delegateeId,
      delegateName: `${d.delegatee.firstName || ''} ${d.delegatee.lastName || ''}`.trim() || d.delegatee.email,
      scope: d.reason || 'All Approvals',
      createdAt: d.createdAt,
    }));

    const summary = {
      total: rules.length,
      active: rules.filter((r) => r.status === 'active').length,
      scheduled: rules.filter((r) => r.status === 'scheduled').length,
      expired: rules.filter((r) => r.status === 'expired').length,
    };

    return NextResponse.json({ delegations: rules, summary }, { status: 200 });
  } catch (error) {
    console.error('Error fetching delegations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validatedData = createDelegationSchema.parse(body);

    const delegation = await prisma.userDelegation.create({
      data: {
        delegatorId: user.userId,
        delegateeId: validatedData.delegateId,
        role: 'MANAGER',
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        reason: validatedData.scope,
        status: 'Scheduled',
      },
    });

    return NextResponse.json({ delegation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating delegation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Delegation ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.userDelegation.findFirst({
      where: {
        id,
        delegatorId: user.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Delegation not found' },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};
    if (updates.startDate) dataToUpdate.startDate = new Date(updates.startDate);
    if (updates.endDate) dataToUpdate.endDate = new Date(updates.endDate);
    if (updates.scope) dataToUpdate.reason = updates.scope;

    const delegation = await prisma.userDelegation.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ delegation }, { status: 200 });
  } catch (error) {
    console.error('Error updating delegation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

function determineDelegationStatus(
  startDate: Date | null,
  endDate: Date | null
): string {
  const now = new Date();
  if (!startDate || !endDate) return 'active';
  if (now < startDate) return 'scheduled';
  if (now > endDate) return 'expired';
  return 'active';
}
