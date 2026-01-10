import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/offers
 * Fetch all job offers
 */
export const GET = withEnhancedAuth(async (request: NextRequest, _context) => {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status');

    const offers = await prisma.jobOffer.findMany({
      where: {
        ...(applicationId && { applicationId }),
        ...(status && { status }),
      },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: {
              select: {
                title: true,
                department: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match UI expectations
    const transformedOffers = offers.map((offer) => ({
      id: offer.id,
      applicationId: offer.applicationId,
      candidateId: offer.application.candidateId,
      candidateName: `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`,
      candidateEmail: offer.application.candidate.email,
      jobTitle: offer.jobTitle,
      department: offer.department,
      location: offer.location,
      employmentType: offer.employmentType,
      startDate: offer.startDate?.toISOString(),
      salary: offer.salary.toString(),
      currency: offer.currency,
      bonus: offer.bonus?.toString(),
      equity: offer.equity,
      benefits: offer.benefits,
      status: offer.status,
      approvedBy: offer.approvedBy,
      approvedDate: offer.approvedDate?.toISOString(),
      sentDate: offer.sentDate?.toISOString(),
      sentBy: offer.sentBy,
      acceptedDate: offer.acceptedDate?.toISOString(),
      declinedDate: offer.declinedDate?.toISOString(),
      declineReason: offer.declineReason,
      expiryDate: offer.expiryDate?.toISOString(),
      offerLetterUrl: offer.offerLetterUrl,
      notes: offer.notes,
      createdAt: offer.createdAt.toISOString(),
      updatedAt: offer.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data: transformedOffers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
});

/**
 * POST /api/recruitment/offers
 * Create a new job offer
 */
export const POST = withEnhancedAuth(async (request: NextRequest, _context) => {
  try {
    const body = await request.json();

    const offer = await prisma.jobOffer.create({
      data: {
        applicationId: body.applicationId,
        jobTitle: body.jobTitle,
        department: body.department,
        location: body.location,
        employmentType: body.employmentType,
        startDate: body.startDate ? new Date(body.startDate) : null,
        salary: body.salary,
        currency: body.currency || 'USD',
        bonus: body.bonus,
        equity: body.equity,
        benefits: body.benefits,
        status: body.status || 'draft',
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        notes: body.notes,
      },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
    });

    return NextResponse.json({ data: offer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
});

/**
 * PUT /api/recruitment/offers/:id
 * Update job offer status (accept, reject, withdraw)
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, _context) => {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Offer ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (updates.jobTitle) updateData.jobTitle = updates.jobTitle;
    if (updates.department) updateData.department = updates.department;
    if (updates.location) updateData.location = updates.location;
    if (updates.employmentType) updateData.employmentType = updates.employmentType;
    if (updates.startDate) updateData.startDate = new Date(updates.startDate);
    if (updates.salary !== undefined) updateData.salary = updates.salary;
    if (updates.currency) updateData.currency = updates.currency;
    if (updates.bonus !== undefined) updateData.bonus = updates.bonus;
    if (updates.equity !== undefined) updateData.equity = updates.equity;
    if (updates.benefits) updateData.benefits = updates.benefits;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.expiryDate) updateData.expiryDate = new Date(updates.expiryDate);
    if (updates.offerLetterUrl) updateData.offerLetterUrl = updates.offerLetterUrl;

    // Status workflow updates
    if (updates.status) {
      updateData.status = updates.status;

      if (updates.status === 'approved') {
        updateData.approvedBy = updates.approvedBy;
        updateData.approvedDate = new Date();
      } else if (updates.status === 'sent') {
        updateData.sentBy = updates.sentBy;
        updateData.sentDate = new Date();
      } else if (updates.status === 'accepted') {
        updateData.acceptedDate = new Date();
      } else if (updates.status === 'declined') {
        updateData.declinedDate = new Date();
        if (updates.declineReason) updateData.declineReason = updates.declineReason;
      }
    }

    const offer = await prisma.jobOffer.update({
      where: { id },
      data: updateData,
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
    });

    return NextResponse.json({ data: offer }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
});
