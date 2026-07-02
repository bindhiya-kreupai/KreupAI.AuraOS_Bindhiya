/**
 * Grievances API — list + create. Tenant-scoped.
 * Backed by the existing ErGrievanceCase model (aura_er_grievance_case).
 *
 * @swagger
 * /api/compliance/grievances:
 *   get: { summary: List grievance cases }
 *   post: { summary: Raise a grievance case }
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@aura/database';
import { withEnhancedAuth, Resource, Action, requirePermission } from '@/lib/auth';
import { ERR, errorResponse, parsePaging, listShape, genCode } from '../_shared/route-helpers';

const CreateSchema = z.object({
  subject: z.string().min(1),
  grievanceType: z.string().min(1),
  channel: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  description: z.string().optional(),
  complainantId: z.string().optional(),
  respondentId: z.string().optional(),
  isWhistleblower: z.boolean().optional(),
  country: z.string().optional(),
  assigneeId: z.string().optional(),
  slaDays: z.number().int().optional(),
});

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  const permErr = requirePermission(Resource.COMPLIANCE, Action.READ, permissions);
  if (permErr) return permErr;
  try {
    const { page, pageSize, skip } = parsePaging(request.url);
    const sp = new URL(request.url).searchParams;
    const where: any = { tenantId: user.tenantId, isDeleted: false };
    if (sp.get('status')) where.status = sp.get('status');
    const [items, total] = await Promise.all([
      prisma.erGrievanceCase.findMany({
        where,
        orderBy: { raisedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.erGrievanceCase.count({ where }),
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
    const created = await prisma.erGrievanceCase.create({
      data: {
        tenantId: user.tenantId,
        caseNumber: genCode('GRV'),
        channel: body.channel || 'portal',
        grievanceType: body.grievanceType,
        severity: body.severity || 'MEDIUM',
        subject: body.subject,
        description: body.description,
        complainantId: body.complainantId,
        respondentId: body.respondentId,
        isWhistleblower: body.isWhistleblower ?? false,
        country: body.country,
        assigneeId: body.assigneeId,
        slaDays: body.slaDays ?? 30,
        status: 'OPEN',
        createdBy: user.userId,
      },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) return errorResponse(ERR.badRequest, 400);
    return errorResponse(ERR.server);
  }
});
