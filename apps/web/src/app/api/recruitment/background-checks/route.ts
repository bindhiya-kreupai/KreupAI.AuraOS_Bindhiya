import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/background-checks
 * Fetch background checks for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const status = searchParams.get('status');

    // Mock data for background checks
    let mockBackgroundChecks = [
      {
        id: '1',
        tenantId: user.tenantId,
        candidateId: 'cand_101',
        candidateName: 'Michael Chen',
        candidateEmail: 'michael.chen@email.com',
        applicationId: 'app_1',
        jobTitle: 'Senior Software Engineer',
        checkType: 'Comprehensive',
        provider: 'BackgroundCheck Pro',
        providerReferenceId: 'BGC-2025-001',
        initiatedDate: '2025-12-24T10:00:00Z',
        completedDate: null,
        expectedCompletionDate: '2025-12-31T23:59:59Z',
        status: 'In Progress',
        overallResult: null,
        checks: [
          {
            type: 'Identity Verification',
            status: 'Completed',
            result: 'Clear',
            completedDate: '2025-12-24T14:00:00Z',
            notes: 'Identity verified successfully',
          },
          {
            type: 'Criminal Record',
            status: 'In Progress',
            result: null,
            completedDate: null,
            notes: 'Pending county court response',
          },
          {
            type: 'Employment Verification',
            status: 'Pending',
            result: null,
            completedDate: null,
            notes: 'Awaiting reference responses',
          },
          {
            type: 'Education Verification',
            status: 'Pending',
            result: null,
            completedDate: null,
            notes: 'Awaiting university confirmation',
          },
        ],
        consent: {
          obtained: true,
          date: '2025-12-24T09:00:00Z',
          ipAddress: '192.168.1.1',
          documentUrl: 'https://example.com/consent/michael-chen.pdf',
        },
        initiatedBy: 'recruiter_1',
        cost: 89.99,
        currency: 'USD',
        reportUrl: null,
        notes: 'Standard comprehensive background check',
      },
      {
        id: '2',
        tenantId: user.tenantId,
        candidateId: 'cand_103',
        candidateName: 'David Kumar',
        candidateEmail: 'david.kumar@email.com',
        applicationId: 'app_3',
        jobTitle: 'Product Manager',
        checkType: 'Basic',
        provider: 'BackgroundCheck Pro',
        providerReferenceId: 'BGC-2025-002',
        initiatedDate: '2025-12-22T11:00:00Z',
        completedDate: '2025-12-24T16:00:00Z',
        expectedCompletionDate: '2025-12-27T23:59:59Z',
        status: 'Completed',
        overallResult: 'Clear',
        checks: [
          {
            type: 'Identity Verification',
            status: 'Completed',
            result: 'Clear',
            completedDate: '2025-12-22T15:00:00Z',
            notes: 'Identity verified successfully',
          },
          {
            type: 'Criminal Record',
            status: 'Completed',
            result: 'Clear',
            completedDate: '2025-12-24T10:00:00Z',
            notes: 'No criminal records found',
          },
          {
            type: 'Employment Verification',
            status: 'Completed',
            result: 'Clear',
            completedDate: '2025-12-24T14:00:00Z',
            notes: 'Previous employment verified',
          },
        ],
        consent: {
          obtained: true,
          date: '2025-12-22T10:30:00Z',
          ipAddress: '192.168.1.2',
          documentUrl: 'https://example.com/consent/david-kumar.pdf',
        },
        initiatedBy: 'recruiter_2',
        cost: 49.99,
        currency: 'USD',
        reportUrl: 'https://example.com/reports/david-kumar-bgc.pdf',
        notes: 'Basic background check completed successfully',
      },
    ];

    // Filter by candidateId if provided
    if (candidateId) {
      mockBackgroundChecks = mockBackgroundChecks.filter(check => check.candidateId === candidateId);
    }

    // Filter by status if provided
    if (status) {
      mockBackgroundChecks = mockBackgroundChecks.filter(check => check.status === status);
    }

    return NextResponse.json({ data: mockBackgroundChecks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching background checks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/recruitment/background-checks
 * Initiate a new background check
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate required fields
    if (!body.candidateId || !body.checkType) {
      return NextResponse.json(
        { error: 'candidateId and checkType are required' },
        { status: 400 }
      );
    }

    // Mock creating a background check
    const newBackgroundCheck = {
      id: `bgc_${Date.now()}`,
      tenantId: user.tenantId,
      initiatedBy: user.userId,
      initiatedDate: new Date().toISOString(),
      status: 'Pending',
      overallResult: null,
      providerReferenceId: `BGC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      ...body,
    };

    return NextResponse.json({ data: newBackgroundCheck }, { status: 201 });
  } catch (error) {
    console.error('Error initiating background check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/recruitment/background-checks
 * Update background check status
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Background check ID is required' },
        { status: 400 }
      );
    }

    // Mock updating a background check
    const updatedBackgroundCheck = {
      id,
      tenantId: user.tenantId,
      ...updates,
      updatedBy: user.userId,
      updatedDate: new Date().toISOString(),
    };

    return NextResponse.json({ data: updatedBackgroundCheck }, { status: 200 });
  } catch (error) {
    console.error('Error updating background check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
