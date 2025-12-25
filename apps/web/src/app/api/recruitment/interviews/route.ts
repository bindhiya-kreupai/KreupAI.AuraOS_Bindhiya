import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/interviews
 * Fetch all scheduled interviews for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status');

    // Mock data for interviews
    let mockInterviews = [
      {
        id: '1',
        tenantId: user.tenantId,
        applicationId: 'app_1',
        candidateId: 'cand_101',
        candidateName: 'Michael Chen',
        jobTitle: 'Senior Software Engineer',
        interviewType: 'Technical',
        interviewRound: 1,
        scheduledDate: '2025-12-26T14:00:00Z',
        duration: 60,
        status: 'Scheduled',
        interviewMode: 'Video Call',
        meetingLink: 'https://meet.example.com/abc-123',
        interviewers: [
          {
            id: 'emp_1',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'Senior Engineer',
          },
          {
            id: 'emp_2',
            name: 'Jane Doe',
            email: 'jane.doe@company.com',
            role: 'Tech Lead',
          },
        ],
        location: null,
        notes: 'Focus on system design and React experience',
        createdDate: '2025-12-23T10:00:00Z',
        createdBy: 'recruiter_1',
      },
      {
        id: '2',
        tenantId: user.tenantId,
        applicationId: 'app_3',
        candidateId: 'cand_103',
        candidateName: 'David Kumar',
        jobTitle: 'Product Manager',
        interviewType: 'Behavioral',
        interviewRound: 2,
        scheduledDate: '2025-12-27T10:00:00Z',
        duration: 45,
        status: 'Scheduled',
        interviewMode: 'In-Person',
        meetingLink: null,
        interviewers: [
          {
            id: 'emp_3',
            name: 'Alice Johnson',
            email: 'alice.johnson@company.com',
            role: 'VP of Product',
          },
        ],
        location: 'Building A, Conference Room 3',
        notes: 'Assess leadership and communication skills',
        createdDate: '2025-12-24T09:00:00Z',
        createdBy: 'recruiter_2',
      },
      {
        id: '3',
        tenantId: user.tenantId,
        applicationId: 'app_1',
        candidateId: 'cand_101',
        candidateName: 'Michael Chen',
        jobTitle: 'Senior Software Engineer',
        interviewType: 'Phone Screen',
        interviewRound: 1,
        scheduledDate: '2025-12-20T11:00:00Z',
        duration: 30,
        status: 'Completed',
        interviewMode: 'Phone Call',
        meetingLink: null,
        interviewers: [
          {
            id: 'emp_4',
            name: 'Bob Wilson',
            email: 'bob.wilson@company.com',
            role: 'Recruiter',
          },
        ],
        location: null,
        notes: 'Initial screening call',
        createdDate: '2025-12-18T15:00:00Z',
        createdBy: 'recruiter_1',
        completedDate: '2025-12-20T11:35:00Z',
      },
    ];

    // Filter by applicationId if provided
    if (applicationId) {
      mockInterviews = mockInterviews.filter(interview => interview.applicationId === applicationId);
    }

    // Filter by status if provided
    if (status) {
      mockInterviews = mockInterviews.filter(interview => interview.status === status);
    }

    return NextResponse.json({ data: mockInterviews }, { status: 200 });
  } catch {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/recruitment/interviews
 * Schedule a new interview
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock creating an interview
    const newInterview = {
      id: `interview_${Date.now()}`,
      tenantId: user.tenantId,
      createdBy: user.userId,
      createdDate: new Date().toISOString(),
      status: 'Scheduled',
      ...body,
    };

    return NextResponse.json({ data: newInterview }, { status: 201 });
  } catch {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/recruitment/interviews
 * Update interview details or status
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    // Mock updating an interview
    const updatedInterview = {
      id,
      tenantId: user.tenantId,
      ...updates,
      updatedBy: user.userId,
      updatedDate: new Date().toISOString(),
    };

    return NextResponse.json({ data: updatedInterview }, { status: 200 });
  } catch {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
