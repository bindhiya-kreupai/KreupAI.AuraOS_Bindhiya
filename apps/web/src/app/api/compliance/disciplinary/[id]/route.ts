/**
 * Disciplinary Actions API — get/update by id. Tenant-scoped.
 * Backed by ErDisciplinaryAction.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@aura/database';
import { withEnhancedAuth, Resource, Action, requirePermission } from '@/lib/auth';
import { ERR, errorResponse } from '../../_shared/route-helpers';

const UpdateSchema = z.object({
  status: z.string().optional(),
  actionType: z.string().optional(),
  severity: z.string().optional(),
  warningCount: z.number().int().optional(),
  suspensionDays: z.number().int().optional(),
  hearingHeld: z.boolean().optional(),
  hearingDate: z.string().optional().nullable(),
  responseRecorded: z.boolean().optional(),
  effectiveFrom: z.string().optional().nullable(),
  effectiveTo: z.string().optional().nullable(),
});

export const GET = withEnhancedAuth(async (_request: NextRequest, ctx: any) => {
  const permErr = requirePermission(Resource.COMPLIANCE, Action.READ, ctx.permissions);
  if (permErr) return permErr;
  try {
    const item = await prisma.erDisciplinaryAction.findFirst({
      where: { id: ctx.params?.id, tenantId: ctx.user.tenantId, isDeleted: false },
    });
    if (!item) return errorResponse(ERR.notFound, 404);
    return NextResponse.json({ success: true, data: item });
  } catch {
    return errorResponse(ERR.server);
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, ctx: any) => {
  const permErr = requirePermission(Resource.COMPLIANCE, Action.UPDATE, ctx.permissions);
  if (permErr) return permErr;
  try {
    const existing = await prisma.erDisciplinaryAction.findFirst({
      where: { id: ctx.params?.id, tenantId: ctx.user.tenantId, isDeleted: false },
    });
    if (!existing) return errorResponse(ERR.notFound, 404);
    const body = UpdateSchema.parse(await request.json());
    const data: any = { ...body, updatedBy: ctx.user.userId };
    for (const k of ['hearingDate', 'effectiveFrom', 'effectiveTo']) {
      if (body[k as keyof typeof body] !== undefined) {
        data[k] = body[k as keyof typeof body]
          ? new Date(body[k as keyof typeof body] as string)
          : null;
      }
    }
    if (body.status === 'ISSUED' && !existing.issuedAt) data.issuedAt = new Date();
    const updated = await prisma.erDisciplinaryAction.update({
      where: { id: ctx.params?.id },
      data,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) return errorResponse(ERR.badRequest, 400);
    return errorResponse(ERR.server);
  }
});
