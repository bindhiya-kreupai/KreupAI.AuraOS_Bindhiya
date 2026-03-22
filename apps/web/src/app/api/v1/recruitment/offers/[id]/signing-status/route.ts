import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/offers/[id]/signing-status
 * Get the signing/acceptance status of a job offer
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = await context.params;

    const offer = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
            jobPosting: { select: { title: true, department: true } },
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Offer not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        offerId: offer.id,
        candidateName: `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`,
        candidateEmail: offer.application.candidate.email,
        jobTitle: offer.jobTitle,
        department: offer.department,
        status: offer.status,
        salary: Number(offer.salary),
        currency: offer.currency,
        sentDate: offer.sentDate,
        acceptedDate: offer.acceptedDate,
        declinedDate: offer.declinedDate,
        declineReason: offer.declineReason,
        expiryDate: offer.expiryDate,
        offerLetterUrl: offer.offerLetterUrl,
        isExpired: offer.expiryDate ? new Date() > offer.expiryDate : false,
      },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Offer Signing Status API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch offer status' } },
      { status: 500 }
    );
  }
});
