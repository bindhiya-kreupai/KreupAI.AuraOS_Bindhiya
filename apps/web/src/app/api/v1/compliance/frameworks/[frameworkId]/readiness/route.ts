import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, serverError } from '@/lib/api/crud-helpers';

/**
 * GET /api/v1/compliance/frameworks/[frameworkId]/readiness
 * Computes FrameworkReadiness from the framework's controls in DB.
 * Returns a bare object — no {success,data} wrapper.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('compliance/frameworks:read')) {
      return forbidden('compliance/frameworks:read');
    }

    const frameworkId = params?.frameworkId;
    if (!frameworkId) return notFound('Compliance framework');

    const framework = await (prisma as any).complianceFramework.findFirst({
      where: {
        tenantId: user.tenantId,
        isDeleted: false,
        OR: [{ id: frameworkId }, { code: frameworkId }],
      },
      include: { controls: { where: { isDeleted: false } } },
    });

    if (!framework) return notFound('Compliance framework');

    const controls: any[] = framework.controls ?? [];
    const compliantCount = controls.filter((c) => c.status === 'compliant').length;
    const partialCount = controls.filter((c) => c.status === 'partial').length;
    const nonCompliantCount = controls.filter((c) => c.status === 'non-compliant').length;
    const notApplicableCount = controls.filter((c) => c.status === 'not-applicable').length;
    const totalControls = controls.length;

    const categoryMap = new Map<string, { compliant: number; total: number }>();
    for (const c of controls) {
      const existing = categoryMap.get(c.category) ?? { compliant: 0, total: 0 };
      existing.total++;
      if (c.status === 'compliant') existing.compliant++;
      categoryMap.set(c.category, existing);
    }

    const categoryBreakdown = [...categoryMap.entries()].map(([category, data]) => ({
      category,
      score: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
      compliant: data.compliant,
      total: data.total,
    }));

    const criticalGaps = controls
      .filter((c) => c.status === 'non-compliant' && c.riskLevel === 'critical')
      .map((c) => `${c.code}: ${c.name}`);

    const overallScore =
      totalControls > 0
        ? Math.round((compliantCount / totalControls) * 100)
        : (framework.readinessScore ?? 0);

    return NextResponse.json({
      frameworkId: framework.code ?? framework.id,
      overallScore,
      compliantCount,
      partialCount,
      nonCompliantCount,
      notApplicableCount,
      totalControls,
      categoryBreakdown,
      criticalGaps,
      lastAssessedAt: new Date().toISOString(),
      nextAuditDate: framework.nextAuditDate ? new Date(framework.nextAuditDate).toISOString() : '',
      certificationExpiry: framework.certificationExpiry
        ? new Date(framework.certificationExpiry).toISOString()
        : undefined,
    });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'v1/compliance/frameworks/[frameworkId]/readiness/route.ts' },
      'Failed to compute readiness'
    );
    return serverError(error, 'compute framework readiness');
  }
});
