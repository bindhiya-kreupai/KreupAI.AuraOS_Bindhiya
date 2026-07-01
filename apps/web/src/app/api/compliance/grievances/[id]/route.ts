/**
 * Grievances API — get/update by id. Tenant-scoped.
 * Backed by ErGrievanceCase.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@aura/database';
import { withEnhancedAuth, Resource, Action, requirePermission } from '@/lib/auth';
import { ERR, errorResponse } from '../../_shared/route-helpers';

const UpdateSchema = z.object({
  status: z.string().optional(),
  severity: z.string().optional(),
  assigneeId: z.string().optional(),
  outcome: z.string().optional(),
  labourAuthorityRef: z.string().optional(),
  resolvedAt: z.string().optional().nullable(),
});

export const GET = withEnhancedAuth(async (_request: NextRequest, ctx: any) => {
  const permErr = requirePermission(Resource.COMPLIANCE, Action.READ, ctx.permissions);
  if (permErr) return permErr;
  try {
    const item = await prisma.erGrievanceCase.findFirst({
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
    const existing = await prisma.erGrievanceCase.findFirst({
      where: { id: ctx.params?.id, tenantId: ctx.user.tenantId, isDeleted: false },
    });
    if (!existing) return errorResponse(ERR.notFound, 404);
    const body = UpdateSchema.parse(await request.json());
    const data: any = { ...body, updatedBy: ctx.user.userId };
    if (body.resolvedAt !== undefined) {
      data.resolvedAt = body.resolvedAt ? new Date(body.resolvedAt) : null;
    }
    if (body.status === 'RESOLVED' && !existing.resolvedAt && !data.resolvedAt) {
      data.resolvedAt = new Date();
      data.resolvedBy = ctx.user.userId;
    }
    const updated = await prisma.erGrievanceCase.update({ where: { id: ctx.params?.id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) return errorResponse(ERR.badRequest, 400);
    return errorResponse(ERR.server);
  }
});
