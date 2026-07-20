import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

function serialize(s: any) {
  return {
    id: s.id,
    tenantId: s.tenantId,
    benchmarkCode: s.benchmarkCode,
    jobTitle: s.jobTitle,
    jobFamily: s.jobFamily,
    jobLevel: s.jobLevel,
    geography: s.geography,
    industry: s.industry,
    source: s.source,
    sourceName: s.sourceName,
    surveyDate: s.surveyDate?.toISOString() || null,
    currency: s.currency,
    sampleSize: s.sampleSize,
    percentile10: Number(s.percentile10),
    percentile25: Number(s.percentile25),
    percentile50: Number(s.percentile50),
    percentile75: Number(s.percentile75),
    percentile90: Number(s.percentile90),
    average: Number(s.average),
    standardDeviation: Number(s.standardDeviation),
    effectiveFrom: s.effectiveFrom?.toISOString() || null,
    effectiveTo: s.effectiveTo?.toISOString() || null,
    notes: s.notes,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (search) {
      where.OR = [
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { jobFamily: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    const benchmarks = await prisma.marketBenchmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: benchmarks.map(serialize) });
  } catch (error: any) {
    logger.error('Error fetching market benchmarks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch market benchmarks',
        message: 'Failed to fetch market benchmarks',
        messageAr: 'فشل جلب معايير السوق',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    if (!body.jobTitle) {
      return NextResponse.json(
        {
          success: false,
          error: 'jobTitle is required',
          message: 'jobTitle is required',
          messageAr: 'المسمى الوظيفي مطلوب',
        },
        { status: 400 }
      );
    }

    const benchmark = await prisma.marketBenchmark.create({
      data: {
        tenantId: user.tenantId,
        benchmarkCode: body.benchmarkCode || `MKB-${Date.now().toString(36).toUpperCase()}`,
        jobTitle: body.jobTitle,
        jobFamily: body.jobFamily || null,
        jobLevel: body.jobLevel || null,
        geography: body.geography || null,
        industry: body.industry || null,
        source: body.source || 'market_survey',
        sourceName: body.sourceName || null,
        surveyDate: body.surveyDate ? new Date(body.surveyDate) : null,
        currency: body.currency || 'USD',
        sampleSize: body.sampleSize != null ? Number(body.sampleSize) : 0,
        percentile10: Number(body.percentile10) || 0,
        percentile25: Number(body.percentile25) || 0,
        percentile50: Number(body.percentile50) || 0,
        percentile75: Number(body.percentile75) || 0,
        percentile90: Number(body.percentile90) || 0,
        average: Number(body.average) || 0,
        standardDeviation: Number(body.standardDeviation) || 0,
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : null,
        effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
        notes: body.notes || null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: serialize(benchmark) }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating market benchmark:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create market benchmark',
        message: 'Failed to create market benchmark',
        messageAr: 'فشل إنشاء معيار السوق',
      },
      { status: 500 }
    );
  }
});
