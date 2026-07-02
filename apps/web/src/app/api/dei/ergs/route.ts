import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { DEI_ERRORS } from '../_shared';

const db = prisma as any;

/**
 * GET /api/dei/ergs — list Employee Resource Groups (with the caller's membership flag).
 * POST /api/dei/ergs — propose a new ERG.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, employeeId } = context;

    const ergs = await db.deiErg.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const myMemberships = employeeId
      ? await db.deiErgMembership.findMany({
          where: { tenantId: user.tenantId, employeeId },
          select: { ergId: true },
        })
      : [];
    const joinedSet = new Set(myMemberships.map((m: { ergId: string }) => m.ergId));

    const items = ergs.map((e: { id: string }) => ({
      ...e,
      isMember: joinedSet.has(e.id),
    }));

    return NextResponse.json({
      items,
      total: items.length,
      page: 1,
      pageSize: items.length,
      hasNextPage: false,
    });
  } catch (error) {
    console.error('DEI ergs GET error:', error);
    return DEI_ERRORS.server();
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json().catch(() => ({}));
    if (!body.name || typeof body.name !== 'string') {
      return DEI_ERRORS.badRequest('ERG name is required', 'اسم المجموعة مطلوب');
    }

    const erg = await db.deiErg.create({
      data: {
        tenantId: user.tenantId,
        name: body.name,
        nameAr: body.nameAr ?? null,
        category: body.category || 'cultural',
        description: body.description ?? null,
        colorClass: body.colorClass ?? null,
        nextEvent: body.nextEvent ?? null,
        nextEventAt: body.nextEventAt ? new Date(body.nextEventAt) : null,
        status: 'proposed',
        createdBy: user.userId,
      },
    });

    return NextResponse.json(
      { success: true, data: erg, message: 'ERG proposed', messageAr: 'تم اقتراح المجموعة' },
      { status: 201 }
    );
  } catch (error) {
    console.error('DEI ergs POST error:', error);
    return DEI_ERRORS.server();
  }
});
