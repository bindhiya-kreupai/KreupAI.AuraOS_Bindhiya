import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Market Pricing API — salary benchmarks + compensation strategy.
 * Tenant-scoped. Backed by JobMarketPricing and JobCompensationStrategy models
 * (accessed via prisma-as-any because they are new module tables merged outside
 * the base schema).
 */

const db = prisma as any;

function toNum(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'object' && value !== null ? Number(value.toString()) : Number(value);
  return Number.isFinite(n) ? n : null;
}

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region')?.trim();
    const industry = searchParams.get('industry')?.trim();
    const companySize = searchParams.get('companySize')?.trim();
    const search = searchParams.get('search')?.trim();

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (region) where.region = region;
    if (industry) where.industry = industry;
    if (companySize) where.companySize = companySize;
    if (search) where.jobTitle = { contains: search, mode: 'insensitive' };

    const [rows, strategy] = await Promise.all([
      db.jobMarketPricing.findMany({ where, orderBy: { jobTitle: 'asc' } }),
      db.jobCompensationStrategy.findFirst({ where: { tenantId: user.tenantId } }),
    ]);

    const items = rows.map((r: any) => {
      const mid = toNum(r.marketMid);
      const internal = toNum(r.internalMedian);
      const diffPct = mid && internal ? ((internal - mid) / mid) * 100 : null;
      return {
        id: r.id,
        jobTitle: r.jobTitle,
        gradeLabel: r.gradeLabel,
        region: r.region,
        industry: r.industry,
        companySize: r.companySize,
        currency: r.currency,
        marketMin: toNum(r.marketMin),
        marketMid: mid,
        marketMax: toNum(r.marketMax),
        internalMedian: internal,
        marketTrend: r.marketTrend,
        diffPercent: diffPct === null ? null : Math.round(diffPct * 10) / 10,
      };
    });

    const regions = Array.from(new Set(rows.map((r: any) => r.region).filter(Boolean)));
    const industries = Array.from(new Set(rows.map((r: any) => r.industry).filter(Boolean)));

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: items.length,
        page: 1,
        pageSize: items.length,
        hasNextPage: false,
        strategy: strategy
          ? {
              id: strategy.id,
              targetPercentile: strategy.targetPercentile,
              scope: strategy.scope,
              description: strategy.description,
            }
          : null,
        filters: { regions, industries },
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching market pricing');
    return NextResponse.json(
      {
        error: 'Failed to fetch market pricing',
        message: 'Failed to fetch market pricing',
        messageAr: 'فشل في جلب تسعير السوق',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { jobTitle, gradeLabel, region, industry, companySize, marketMin, marketMid, marketMax } =
      body ?? {};

    if (!jobTitle || marketMin == null || marketMid == null || marketMax == null) {
      return NextResponse.json(
        {
          error: 'jobTitle, marketMin, marketMid, and marketMax are required',
          message: 'jobTitle, marketMin, marketMid, and marketMax are required',
          messageAr: 'عنوان الوظيفة والحد الأدنى والمتوسط والحد الأقصى للسوق مطلوبة',
        },
        { status: 400 }
      );
    }

    const record = await db.jobMarketPricing.create({
      data: {
        tenantId: user.tenantId,
        jobTitle,
        gradeLabel: gradeLabel || null,
        region: region || 'Global',
        industry: industry || 'Technology',
        companySize: companySize || null,
        marketMin: Number(marketMin),
        marketMid: Number(marketMid),
        marketMax: Number(marketMax),
        internalMedian: body.internalMedian != null ? Number(body.internalMedian) : null,
        currency: body.currency || 'USD',
        marketTrend: body.marketTrend || 'stable',
        source: body.source || null,
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    logger.error({ error }, 'Error creating market pricing benchmark');
    return NextResponse.json(
      {
        error: 'Failed to create market pricing benchmark',
        message: 'Failed to create market pricing benchmark',
        messageAr: 'فشل في إنشاء معيار تسعير السوق',
      },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const action = body?.action;

    if (action === 'strategy') {
      const { targetPercentile, scope, description } = body ?? {};
      if (
        targetPercentile == null ||
        Number(targetPercentile) < 1 ||
        Number(targetPercentile) > 100
      ) {
        return NextResponse.json(
          {
            error: 'targetPercentile must be between 1 and 100',
            message: 'targetPercentile must be between 1 and 100',
            messageAr: 'يجب أن يكون النسبة المئوية المستهدفة بين 1 و 100',
          },
          { status: 400 }
        );
      }

      const strategy = await db.jobCompensationStrategy.upsert({
        where: { tenantId: user.tenantId },
        update: {
          targetPercentile: Number(targetPercentile),
          scope: scope || 'All roles',
          description: description || null,
          updatedBy: user.userId,
        },
        create: {
          tenantId: user.tenantId,
          targetPercentile: Number(targetPercentile),
          scope: scope || 'All roles',
          description: description || null,
          updatedBy: user.userId,
        },
      });
      return NextResponse.json({ success: true, data: strategy });
    }

    // Otherwise update a benchmark row.
    const { id } = body ?? {};
    if (!id) {
      return NextResponse.json(
        { error: 'id is required', message: 'id is required', messageAr: 'المعرف مطلوب' },
        { status: 400 }
      );
    }

    const existing = await db.jobMarketPricing.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        {
          error: 'Benchmark not found',
          message: 'Benchmark not found',
          messageAr: 'المعيار غير موجود',
        },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = { updatedBy: user.userId };
    for (const key of [
      'jobTitle',
      'gradeLabel',
      'region',
      'industry',
      'companySize',
      'currency',
      'marketTrend',
      'source',
    ] as const) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    for (const key of ['marketMin', 'marketMid', 'marketMax', 'internalMedian'] as const) {
      if (body[key] !== undefined) data[key] = body[key] == null ? null : Number(body[key]);
    }

    // tenant-ok: id-based op preceded by tenant-scoped findFirst above
    const updated = await db.jobMarketPricing.update({ where: { id: existing.id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error({ error }, 'Error updating market pricing');
    return NextResponse.json(
      {
        error: 'Failed to update market pricing',
        message: 'Failed to update market pricing',
        messageAr: 'فشل في تحديث تسعير السوق',
      },
      { status: 500 }
    );
  }
});
