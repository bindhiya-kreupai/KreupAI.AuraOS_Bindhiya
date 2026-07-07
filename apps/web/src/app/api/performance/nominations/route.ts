/**
 * 360 feedback nominations API — backed by aura_feedback360_nomination,
 * accessed via (prisma as any).feedback360Nomination. Tenant-scoped.
 * The nominator is always the authenticated user — never trusted from the client.
 * Each user may nominate up to 5 active peers per cycle.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const MAX_NOMINATIONS = 5;

const createSchema = z.object({
  nomineeName: z.string().min(1, 'Nominee name is required'),
  nomineeId: z.string().optional(),
  cycleId: z.string().optional(),
});

function currentActor(user: { userId: string; employeeId?: string }): string {
  return user.employeeId || user.userId;
}

function err(code: string, message: string, messageAr: string, status: number, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, messageAr, ...(details ? { details } : {}) } },
    { status }
  );
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const actorId = currentActor(user);
    const where = { tenantId: user.tenantId, nominatorId: actorId, isDeleted: false };
    const rows = await (prisma as any).feedback360Nomination.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({
      items: rows,
      total: rows.length,
      page: 1,
      pageSize: rows.length,
      hasNextPage: false,
    });
  } catch (error) {
    return err('E5001', 'Failed to fetch nominations', 'فشل في جلب الترشيحات', 500);
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const actorId = currentActor(user);
    const body = await request.json().catch(() => null);
    if (!body) return err('E2001', 'Invalid JSON body', 'نص الطلب غير صالح', 400);

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return err('E2001', 'Validation failed', 'فشل التحقق من الصحة', 400, parsed.error.errors);
    }

    const count = await (prisma as any).feedback360Nomination.count({
      where: { tenantId: user.tenantId, nominatorId: actorId, isDeleted: false },
    });
    if (count >= MAX_NOMINATIONS) {
      return err(
        'E4009',
        `You can nominate up to ${MAX_NOMINATIONS} peers`,
        `يمكنك ترشيح ما يصل إلى ${MAX_NOMINATIONS} من الزملاء`,
        409
      );
    }

    const created = await (prisma as any).feedback360Nomination.create({
      data: {
        tenantId: user.tenantId,
        nominatorId: actorId,
        nomineeId: parsed.data.nomineeId || null,
        nomineeName: parsed.data.nomineeName,
        cycleId: parsed.data.cycleId || null,
        status: 'pending',
      },
    });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    return err('E5001', 'Failed to create nomination', 'فشل في إنشاء الترشيح', 500);
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const actorId = currentActor(user);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return err('E2001', 'Nomination ID is required', 'معرّف الترشيح مطلوب', 400);

    const existing = await (prisma as any).feedback360Nomination.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return err('E4004', 'Nomination not found', 'الترشيح غير موجود', 404);
    if (existing.nominatorId !== actorId) {
      return err(
        'E4030',
        'You can only remove your own nominations',
        'يمكنك إزالة ترشيحاتك فقط',
        403
      );
    }

    await (prisma as any).feedback360Nomination.update({
      where: { id },
      data: { isDeleted: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return err('E5001', 'Failed to remove nomination', 'فشل في إزالة الترشيح', 500);
  }
});
