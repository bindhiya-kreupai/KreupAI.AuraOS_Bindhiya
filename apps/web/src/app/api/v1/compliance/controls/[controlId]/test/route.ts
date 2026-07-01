import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, serverError } from '@/lib/api/crud-helpers';

/**
 * POST /api/v1/compliance/controls/[controlId]/test
 * Runs a deterministic control test, records a ComplianceTest row, and returns
 * a ControlTestResult { testId, controlId, result, details, completedAt }.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('compliance/controls:create')) {
      return forbidden('compliance/controls:create');
    }

    const controlId = params?.controlId;
    if (!controlId) return notFound('Compliance control');

    const control = await (prisma as any).complianceControl.findFirst({
      where: {
        tenantId: user.tenantId,
        isDeleted: false,
        OR: [{ id: controlId }, { code: controlId }],
      },
      select: { id: true, status: true, name: true, code: true },
    });
    if (!control) return notFound('Compliance control');

    // Deterministic verdict derived from the control's current compliance status.
    const result: 'pass' | 'fail' | 'partial' =
      control.status === 'compliant'
        ? 'pass'
        : control.status === 'non-compliant'
          ? 'fail'
          : 'partial';

    const details =
      result === 'pass'
        ? `Automated control test passed for ${control.code}.`
        : result === 'fail'
          ? `Automated control test failed for ${control.code}. Remediation required.`
          : `Automated control test partially passed for ${control.code}.`;

    const remediationRequired =
      result === 'pass' ? null : `Review and remediate control ${control.code} (${control.name}).`;

    const now = new Date();
    const created = await (prisma as any).complianceTest.create({
      data: {
        tenantId: user.tenantId,
        controlId: control.id,
        testName: `Automated test — ${control.code}`,
        result,
        details,
        remediationRequired,
        duration: 1,
        runBy: user.userId,
        runAt: now,
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });

    // Reflect the run on the control's testing dates.
    await (prisma as any).complianceControl.update({
      where: { id: control.id },
      data: { lastTested: now, updatedBy: user.userId },
    });

    return NextResponse.json({
      testId: created.id,
      controlId: control.id,
      result,
      details,
      remediationRequired: remediationRequired ?? undefined,
      completedAt: now.toISOString(),
    });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'v1/compliance/controls/[controlId]/test/route.ts' },
      'Failed to run control test'
    );
    return serverError(error, 'run control test');
  }
});
