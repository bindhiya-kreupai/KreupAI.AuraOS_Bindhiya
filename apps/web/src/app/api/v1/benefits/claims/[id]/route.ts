import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/benefits/claims/[id]
 * Get a specific benefit claim
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/claims:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/claims:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;

    const claim = await prisma.benefitClaim.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        plan: { select: { id: true, planName: true, category: true, carrierName: true } },
        enrollment: { select: { id: true, coverageTier: true, effectiveDate: true } },
      },
    });

    if (!claim) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Benefit claim not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: claim,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Benefit Claim Detail API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch benefit claim' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/benefits/claims/[id]
 * Update a benefit claim (only SUBMITTED claims can be updated)
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/claims:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/claims:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;
    const body = await request.json();

    const claim = await prisma.benefitClaim.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!claim) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Benefit claim not found' } },
        { status: 404 }
      );
    }

    if (claim.status !== 'SUBMITTED') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4003', message: 'Only submitted claims can be updated' },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.benefitClaim.update({
      where: { id },
      data: {
        amount: body.amount,
        description: body.description,
        providerName: body.providerName,
        receiptUrls: body.receiptUrls,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Benefit Claim Detail API] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update benefit claim' } },
      { status: 500 }
    );
  }
});
