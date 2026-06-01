import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/benefits/claims/[id]/approve
 * Approve a benefit claim
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/claims:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/claims:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;
    const body = await request.json().catch(() => ({}));

    const claim = await prisma.benefitClaim.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!claim) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Benefit claim not found' } },
        { status: 404 }
      );
    }

    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(claim.status)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4003', message: `Cannot approve claim with status: ${claim.status}` },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.benefitClaim.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date(),
        approvedAmount: body.approvedAmount || claim.amount,
        reviewerNotes: body.notes || null,
        paymentScheduledDate: body.paymentDate ? new Date(body.paymentDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Benefit claim approved successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Benefit Claim Approve API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to approve benefit claim' } },
      { status: 500 }
    );
  }
});
