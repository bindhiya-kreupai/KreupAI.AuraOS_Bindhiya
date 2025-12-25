import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/offers
 * Fetch all job offers for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const status = searchParams.get('status');

    // Mock data for job offers
    let mockOffers = [
      {
        id: '1',
        tenantId: user.tenantId,
        candidateId: 'cand_101',
        candidateName: 'Michael Chen',
        candidateEmail: 'michael.chen@email.com',
        applicationId: 'app_1',
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        offerDate: '2025-12-23T10:00:00Z',
        expiryDate: '2026-01-06T23:59:59Z',
        status: 'Pending',
        employmentType: 'Full-time',
        startDate: '2026-01-20',
        compensation: {
          baseSalary: 165000,
          currency: 'USD',
          payFrequency: 'Annual',
          bonus: {
            type: 'Performance',
            amount: 25000,
            description: 'Annual performance bonus',
          },
          equity: {
            type: 'Stock Options',
            amount: 10000,
            vestingSchedule: '4 years with 1 year cliff',
          },
        },
        benefits: [
          'Health Insurance (Medical, Dental, Vision)',
          '401(k) with 4% company match',
          'Unlimited PTO',
          'Remote work options',
          'Professional development budget ($5,000/year)',
          'Home office stipend',
        ],
        workLocation: 'San Francisco, CA (Hybrid)',
        reportingTo: 'John Smith - Engineering Manager',
        offerLetterUrl: 'https://example.com/offers/michael-chen-offer.pdf',
        createdBy: 'recruiter_1',
        createdDate: '2025-12-23T09:00:00Z',
        approvedBy: 'hiring_manager_1',
        approvedDate: '2025-12-23T09:30:00Z',
      },
      {
        id: '2',
        tenantId: user.tenantId,
        candidateId: 'cand_103',
        candidateName: 'David Kumar',
        candidateEmail: 'david.kumar@email.com',
        applicationId: 'app_3',
        jobTitle: 'Product Manager',
        department: 'Product',
        offerDate: '2025-12-24T14:00:00Z',
        expiryDate: '2026-01-07T23:59:59Z',
        status: 'Accepted',
        employmentType: 'Full-time',
        startDate: '2026-02-01',
        compensation: {
          baseSalary: 125000,
          currency: 'USD',
          payFrequency: 'Annual',
          bonus: {
            type: 'Performance',
            amount: 15000,
            description: 'Annual performance bonus',
          },
          equity: {
            type: 'RSUs',
            amount: 5000,
            vestingSchedule: '4 years with quarterly vesting',
          },
        },
        benefits: [
          'Health Insurance (Medical, Dental, Vision)',
          '401(k) with 4% company match',
          '20 days PTO',
          'Remote work options',
          'Professional development budget ($3,000/year)',
        ],
        workLocation: 'Remote',
        reportingTo: 'Alice Johnson - VP of Product',
        offerLetterUrl: 'https://example.com/offers/david-kumar-offer.pdf',
        createdBy: 'recruiter_2',
        createdDate: '2025-12-24T13:00:00Z',
        approvedBy: 'hiring_manager_2',
        approvedDate: '2025-12-24T13:30:00Z',
        acceptedDate: '2025-12-24T18:00:00Z',
      },
    ];

    // Filter by candidateId if provided
    if (candidateId) {
      mockOffers = mockOffers.filter(offer => offer.candidateId === candidateId);
    }

    // Filter by status if provided
    if (status) {
      mockOffers = mockOffers.filter(offer => offer.status === status);
    }

    return NextResponse.json({ data: mockOffers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching job offers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/recruitment/offers
 * Create a new job offer
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock creating a job offer
    const newOffer = {
      id: `offer_${Date.now()}`,
      tenantId: user.tenantId,
      createdBy: user.userId,
      createdDate: new Date().toISOString(),
      offerDate: new Date().toISOString(),
      status: 'Pending',
      ...body,
    };

    return NextResponse.json({ data: newOffer }, { status: 201 });
  } catch (error) {
    console.error('Error creating job offer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/recruitment/offers
 * Update job offer status (accept, reject, withdraw)
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, status, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Offer ID is required' },
        { status: 400 }
      );
    }

    // Mock updating a job offer
    const updatedOffer = {
      id,
      tenantId: user.tenantId,
      status,
      ...updates,
      updatedBy: user.userId,
      updatedDate: new Date().toISOString(),
      ...(status === 'Accepted' && { acceptedDate: new Date().toISOString() }),
      ...(status === 'Rejected' && { rejectedDate: new Date().toISOString() }),
      ...(status === 'Withdrawn' && { withdrawnDate: new Date().toISOString() }),
    };

    return NextResponse.json({ data: updatedOffer }, { status: 200 });
  } catch (error) {
    console.error('Error updating job offer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
