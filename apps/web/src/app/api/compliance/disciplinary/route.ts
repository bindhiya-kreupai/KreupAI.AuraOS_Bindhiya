/**
 * Disciplinary Actions API — list + create. Tenant-scoped.
 * Backed by the existing ErDisciplinaryAction model (aura_er_disciplinary_action).
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@aura/database';
import { withEnhancedAuth, Resource, Action, requirePermission } from '@/lib/auth';
import { ERR, errorResponse, parsePaging, listShape, genCode } from '../_shared/route-helpers';

const CreateSchema = z.object({
  employeeId: z.string().min(1),
  misconductType: z.string().min(1),
  actionType: z.string().min(1),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  linkedGrievanceId: z.string().optional(),
  warningCount: z.number().int().optional(),
  suspensionDays: z.number().int().optional(),
  country: z.string().optional(),
  effectiveFrom: z.string().optional().nullable(),
  effectiveTo: z.string().optional().nullable(),
});

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  const permErr = requirePermission(Resource.COMPLIANCE, Action.READ, permissions);
  if (permErr) return permErr;
  try {
    const { page, pageSize, skip } = parsePaging(request.url);
    const sp = new URL(request.url).searchParams;
    const where: any = { tenantId: user.tenantId, isDeleted: false };
    if (sp.get('employeeId')) where.employeeId = sp.get('employeeId');
    if (sp.get('status')) where.status = sp.get('status');
    const [items, total] = await Promise.all([
      prisma.erDisciplinaryAction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.erDisciplinaryAction.count({ where }),
    ]);
    return NextResponse.json({ success: true, data: listShape(items, total, page, pageSize) });
  } catch {
    return errorResponse(ERR.server);
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  const permErr = requirePermission(Resource.COMPLIANCE, Action.CREATE, permissions);
  if (permErr) return permErr;
  try {
    const body = CreateSchema.parse(await request.json());
    const created = await prisma.erDisciplinaryAction.create({
      data: {
        tenantId: user.tenantId,
        actionNumber: genCode('DA'),
        employeeId: body.employeeId,
        linkedGrievanceId: body.linkedGrievanceId,
        misconductType: body.misconductType,
        severity: body.severity || 'MEDIUM',
        actionType: body.actionType,
        warningCount: body.warningCount ?? 0,
        suspensionDays: body.suspensionDays ?? 0,
        country: body.country,
        status: 'DRAFT',
        issuedBy: user.userId,
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : null,
        effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
        createdBy: user.userId,
      },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) return errorResponse(ERR.badRequest, 400);
    return errorResponse(ERR.server);
  }
});
