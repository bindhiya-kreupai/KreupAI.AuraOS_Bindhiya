import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/recruitment/offers/e-sign
 * Send offer for e-signature or update offer status (accept/decline/send)
 */
export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { offerId, action } = body;

    if (!offerId || !action) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'offerId and action (send, accept, decline, approve) are required' } },
        { status: 400 }
      );
    }

    const offer = await prisma.jobOffer.findUnique({
      where: { id: offerId },
      include: { application: { include: { candidate: true } } },
    });

    if (!offer) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Offer not found' } },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData.status = 'approved';
        updateData.approvedBy = user.id;
        updateData.approvedDate = new Date();
        message = 'Offer approved successfully';
        break;
      case 'send':
        if (offer.status !== 'approved' && offer.status !== 'draft') {
          return NextResponse.json(
            { success: false, error: { code: 'E4003', message: 'Offer must be approved or draft before sending' } },
            { status: 422 }
          );
        }
        updateData.status = 'sent';
        updateData.sentDate = new Date();
        updateData.sentBy = user.id;
        message = 'Offer sent to candidate for signing';
        break;
      case 'accept':
        updateData.status = 'accepted';
        updateData.acceptedDate = new Date();
        message = 'Offer accepted';
        // Move candidate to OFFER_ACCEPTED stage
        await prisma.candidateApplication.update({
          where: { id: offer.applicationId },
          data: { currentStage: 'OFFER_ACCEPTED' },
        });
        break;
      case 'decline':
        updateData.status = 'declined';
        updateData.declinedDate = new Date();
        updateData.declineReason = body.reason || null;
        message = 'Offer declined';
        await prisma.candidateApplication.update({
          where: { id: offer.applicationId },
          data: { currentStage: 'REJECTED', status: 'REJECTED', rejectionReason: 'Offer declined' },
        });
        break;
      default:
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'action must be one of: approve, send, accept, decline' } },
          { status: 400 }
        );
    }

    const updated = await prisma.jobOffer.update({
      where: { id: offerId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Offer E-Sign API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to process offer action' } },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.EMPLOYEE_UPDATED,
  resourceType: 'job_offer',
  captureRequestBody: true,
});
