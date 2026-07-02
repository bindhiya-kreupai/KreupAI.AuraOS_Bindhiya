import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { DEI_ERRORS } from '../../../_shared';

const db = prisma as any;

/**
 * POST /api/dei/ergs/:id/members — the authenticated employee joins the ERG.
 * DELETE /api/dei/ergs/:id/members — the authenticated employee leaves the ERG.
 * Membership is derived server-side from the auth context; never trust a client id.
 */
export const POST = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, employeeId, params } = context;
    const ergId = params?.id as string | undefined;
    if (!ergId) return DEI_ERRORS.badRequest();
    if (!employeeId) {
      return DEI_ERRORS.badRequest(
        'No employee profile linked to this user',
        'لا يوجد ملف موظف مرتبط'
      );
    }

    const erg = await db.deiErg.findFirst({ where: { id: ergId, tenantId: user.tenantId } });
    if (!erg) return DEI_ERRORS.notFound('ERG');

    const existing = await db.deiErgMembership.findFirst({
      where: { tenantId: user.tenantId, ergId, employeeId },
    });
    if (!existing) {
      await db.deiErgMembership.create({
        data: { tenantId: user.tenantId, ergId, employeeId, role: 'member' },
      });
      await db.deiErg.update({
        where: { id: ergId },
        data: { memberCount: { increment: 1 } },
      });
    }

    const updated = await db.deiErg.findUnique({ where: { id: ergId } });
    return NextResponse.json({
      success: true,
      data: { ...updated, isMember: true },
      message: 'Joined group',
      messageAr: 'تم الانضمام إلى المجموعة',
    });
  } catch (error) {
    console.error('DEI ERG join error:', error);
    return DEI_ERRORS.server();
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, employeeId, params } = context;
    const ergId = params?.id as string | undefined;
    if (!ergId || !employeeId) return DEI_ERRORS.badRequest();

    const existing = await db.deiErgMembership.findFirst({
      where: { tenantId: user.tenantId, ergId, employeeId },
    });
    if (existing) {
      await db.deiErgMembership.delete({ where: { id: existing.id } });
      await db.deiErg.update({
        where: { id: ergId },
        data: { memberCount: { decrement: 1 } },
      });
    }

    const updated = await db.deiErg.findUnique({ where: { id: ergId } });
    return NextResponse.json({
      success: true,
      data: { ...updated, isMember: false },
      message: 'Left group',
      messageAr: 'تم مغادرة المجموعة',
    });
  } catch (error) {
    console.error('DEI ERG leave error:', error);
    return DEI_ERRORS.server();
  }
});
