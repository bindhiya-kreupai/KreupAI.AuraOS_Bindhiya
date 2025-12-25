import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/requisitions
 * Fetch all job requisitions for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    // Mock data for job requisitions
    const mockRequisitions = [
      {
        id: '1',
        tenantId: user.tenantId,
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        requestedBy: 'John Doe',
        requestedDate: '2025-12-15T10:00:00Z',
        numberOfPositions: 2,
        employmentType: 'Full-time',
        priority: 'High',
        status: 'Open',
        location: 'San Francisco, CA',
        salaryRange: {
          min: 120000,
          max: 180000,
          currency: 'USD',
        },
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        description: 'We are looking for experienced software engineers to join our growing team.',
        approvalStatus: 'Approved',
        approvedBy: 'Jane Smith',
        approvedDate: '2025-12-16T14:30:00Z',
      },
      {
        id: '2',
        tenantId: user.tenantId,
        jobTitle: 'Product Manager',
        department: 'Product',
        requestedBy: 'Alice Johnson',
        requestedDate: '2025-12-18T09:00:00Z',
        numberOfPositions: 1,
        employmentType: 'Full-time',
        priority: 'Medium',
        status: 'Open',
        location: 'Remote',
        salaryRange: {
          min: 100000,
          max: 140000,
          currency: 'USD',
        },
        requiredSkills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
        description: 'Seeking a product manager to drive our product roadmap.',
        approvalStatus: 'Pending',
        approvedBy: null,
        approvedDate: null,
      },
    ];

    return NextResponse.json({ data: mockRequisitions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching job requisitions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/recruitment/requisitions
 * Create a new job requisition
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock creating a requisition
    const newRequisition = {
      id: `req_${Date.now()}`,
      tenantId: user.tenantId,
      createdBy: user.userId,
      createdDate: new Date().toISOString(),
      ...body,
      status: 'Draft',
      approvalStatus: 'Pending',
    };

    return NextResponse.json({ data: newRequisition }, { status: 201 });
  } catch (error) {
    console.error('Error creating job requisition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/recruitment/requisitions
 * Update an existing job requisition
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Requisition ID is required' },
        { status: 400 }
      );
    }

    // Mock updating a requisition
    const updatedRequisition = {
      id,
      tenantId: user.tenantId,
      ...updates,
      updatedBy: user.userId,
      updatedDate: new Date().toISOString(),
    };

    return NextResponse.json({ data: updatedRequisition }, { status: 200 });
  } catch (error) {
    console.error('Error updating job requisition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
