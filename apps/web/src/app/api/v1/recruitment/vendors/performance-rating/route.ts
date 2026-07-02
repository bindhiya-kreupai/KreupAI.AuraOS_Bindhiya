import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import {
  assertVendor,
  badRequest,
  forbidden,
  listResponse,
  notFound,
  ok,
  parsePaging,
  serverError,
} from '../_lib/vendor-subdomain';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendorPerformanceReview = (prisma as any).vendorPerformanceReview;

function clampScore(value: unknown): number {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(n, 0), 5);
}

/** GET /api/v1/recruitment/vendors/performance-rating — tenant-scoped scorecards. */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:read')) return forbidden('read');

    const { page, pageSize, skip, searchParams } = parsePaging(request);
    const vendorId = searchParams.get('vendorId') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (vendorId) where.vendorId = vendorId;

    const [rows, total] = await Promise.all([
      vendorPerformanceReview.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      vendorPerformanceReview.count({ where }),
    ]);

    const vendorIds = Array.from(new Set(rows.map((r: { vendorId: string }) => r.vendorId)));
    const vendors = vendorIds.length
      ? await prisma.recruitmentVendor.findMany({
          where: { id: { in: vendorIds as string[] }, tenantId: user.tenantId },
          select: { id: true, name: true },
        })
      : [];
    const vendorById = new Map(vendors.map((v) => [v.id, v]));
    const items = rows.map((r: { vendorId: string }) => ({
      ...r,
      vendorName: vendorById.get(r.vendorId)?.name ?? null,
    }));

    return listResponse(items, total, page, pageSize);
  } catch (error) {
    console.error('[Vendor Performance API] GET Error:', error);
    return serverError('vendor performance reviews');
  }
});

/** POST /api/v1/recruitment/vendors/performance-rating — record a scorecard. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:create')) return forbidden('create');

    const body = await request.json();
    if (!body?.vendorId || !body?.periodLabel) {
      return badRequest('vendorId and periodLabel are required', 'معرّف المورّد والفترة مطلوبان');
    }
    if (!(await assertVendor(user.tenantId, body.vendorId))) {
      return notFound('Vendor not found', 'المورّد غير موجود');
    }

    const quality = clampScore(body.qualityScore);
    const timeliness = clampScore(body.timelinessScore);
    const communication = clampScore(body.communicationScore);
    const overall =
      body.overallScore !== undefined
        ? clampScore(body.overallScore)
        : Number(((quality + timeliness + communication) / 3).toFixed(2));

    const created = await vendorPerformanceReview.create({
      data: {
        tenantId: user.tenantId,
        vendorId: body.vendorId,
        periodLabel: String(body.periodLabel),
        qualityScore: quality,
        timelinessScore: timeliness,
        communicationScore: communication,
        overallScore: overall,
        reviewNotes: body.reviewNotes ?? null,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    // Keep the vendor's rolling rating in sync with the latest overall score.
    await prisma.recruitmentVendor.updateMany({
      where: { id: body.vendorId, tenantId: user.tenantId },
      data: { rating: overall, updatedBy: user.id },
    });

    return ok(created, 201, 'Performance review created successfully');
  } catch (error) {
    console.error('[Vendor Performance API] POST Error:', error);
    return serverError('vendor performance review');
  }
});
