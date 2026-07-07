import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const createDelegationSchema = z.object({
  delegateId: z.string().min(1),
  scope: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    // Return delegate candidates (users in the same tenant) for the picker.
    if (searchParams.get('candidates') === 'true') {
      const query = (searchParams.get('q') || '').trim();
      const candidates = await prisma.user.findMany({
        where: {
          tenantId: user.tenantId,
          status: 'Active',
          id: { not: user.userId },
          ...(query
            ? {
                OR: [
                  { firstName: { contains: query, mode: 'insensitive' } },
                  { lastName: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        select: { id: true, firstName: true, lastName: true, email: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        take: 20,
      });

      return NextResponse.json(
        {
          candidates: candidates.map((candidate) => ({
            id: candidate.id,
            name:
              `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.email,
            email: candidate.email,
          })),
        },
        { status: 200 }
      );
    }

    // Always scope to the authenticated manager — never trust a client-sent id.
    const managerId = user.userId;

    const delegations = await prisma.userDelegation.findMany({
      where: {
        delegatorId: managerId,
        isDeleted: false,
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
      delegationName:
        `Delegation to ${d.delegatee.firstName || ''} ${d.delegatee.lastName || ''}`.trim(),
      status: determineDelegationStatus(d.startDate, d.endDate),
      startDate: d.startDate,
      endDate: d.endDate,
      delegatorId: d.delegatorId,
      delegateId: d.delegateeId,
      delegateName:
        `${d.delegatee.firstName || ''} ${d.delegatee.lastName || ''}`.trim() || d.delegatee.email,
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
  } catch (error: any) {
    console.error('Error fetching delegations:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Internal server error',
        messageAr: 'خطأ داخلي في الخادم',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validatedData = createDelegationSchema.parse(body);

    const start = new Date(validatedData.startDate);
    const end = new Date(validatedData.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return NextResponse.json(
        {
          error: 'Invalid date range',
          message: 'End date must be on or after the start date.',
          messageAr: 'يجب أن يكون تاريخ الانتهاء في نفس تاريخ البدء أو بعده.',
        },
        { status: 400 }
      );
    }

    if (validatedData.delegateId === user.userId) {
      return NextResponse.json(
        {
          error: 'Invalid delegate',
          message: 'You cannot delegate authority to yourself.',
          messageAr: 'لا يمكنك تفويض الصلاحية لنفسك.',
        },
        { status: 400 }
      );
    }

    // Ensure the delegate belongs to the same tenant — never trust a client-sent id.
    const delegatee = await prisma.user.findFirst({
      where: { id: validatedData.delegateId, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!delegatee) {
      return NextResponse.json(
        {
          error: 'Delegate not found',
          message: 'The selected delegate was not found.',
          messageAr: 'لم يتم العثور على المفوَّض المحدد.',
        },
        { status: 404 }
      );
    }

    const delegation = await prisma.userDelegation.create({
      data: {
        delegatorId: user.userId,
        delegateeId: validatedData.delegateId,
        role: 'MANAGER',
        startDate: start,
        endDate: end,
        reason: validatedData.scope,
        status: start > new Date() ? 'Scheduled' : 'Active',
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });

    return NextResponse.json({ delegation }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Please provide a delegate, scope, and date range.',
          messageAr: 'يرجى تحديد المفوَّض والنطاق والفترة الزمنية.',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    console.error('Error creating delegation:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Internal server error',
        messageAr: 'خطأ داخلي في الخادم',
      },
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
        {
          error: 'Delegation ID is required',
          message: 'Delegation ID is required.',
          messageAr: 'معرف التفويض مطلوب.',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.userDelegation.findFirst({
      where: {
        id,
        delegatorId: user.userId,
        isDeleted: false,
        delegator: { tenantId: user.tenantId },
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: 'Delegation not found',
          message: 'Delegation not found.',
          messageAr: 'لم يتم العثور على التفويض.',
        },
        { status: 404 }
      );
    }

    const dataToUpdate: any = { updatedBy: user.userId };
    if (updates.startDate) dataToUpdate.startDate = new Date(updates.startDate);
    if (updates.endDate) dataToUpdate.endDate = new Date(updates.endDate);
    if (updates.scope) dataToUpdate.reason = updates.scope;

    const startDate = dataToUpdate.startDate || existing.startDate;
    const endDate = dataToUpdate.endDate || existing.endDate;
    if (endDate < startDate) {
      return NextResponse.json(
        {
          error: 'Invalid date range',
          message: 'End date must be on or after the start date.',
          messageAr: 'يجب أن يكون تاريخ الانتهاء في نفس تاريخ البدء أو بعده.',
        },
        { status: 400 }
      );
    }

    const delegation = await prisma.userDelegation.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ delegation }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating delegation:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Internal server error',
        messageAr: 'خطأ داخلي في الخادم',
      },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          error: 'Delegation ID is required',
          message: 'Delegation ID is required.',
          messageAr: 'معرف التفويض مطلوب.',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.userDelegation.findFirst({
      where: {
        id,
        delegatorId: user.userId,
        isDeleted: false,
        delegator: { tenantId: user.tenantId },
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: 'Delegation not found',
          message: 'Delegation not found.',
          messageAr: 'لم يتم العثور على التفويض.',
        },
        { status: 404 }
      );
    }

    // Soft-delete so the delegation drops out of active/history lists.
    await prisma.userDelegation.update({
      where: { id },
      data: {
        status: 'Revoked',
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: user.userId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error revoking delegation:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Internal server error',
        messageAr: 'خطأ داخلي في الخادم',
      },
      { status: 500 }
    );
  }
});

function determineDelegationStatus(startDate: Date | null, endDate: Date | null): string {
  const now = new Date();
  if (!startDate || !endDate) return 'active';
  if (now < startDate) return 'scheduled';
  if (now > endDate) return 'expired';
  return 'active';
}
