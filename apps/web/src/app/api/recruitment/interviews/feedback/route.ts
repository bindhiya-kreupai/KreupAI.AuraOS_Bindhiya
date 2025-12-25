import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/interviews/feedback
 * Fetch interview feedback for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interviewId');
    const candidateId = searchParams.get('candidateId');

    // Mock data for interview feedback
    let mockFeedback = [
      {
        id: '1',
        tenantId: user.tenantId,
        interviewId: 'interview_3',
        candidateId: 'cand_101',
        candidateName: 'Michael Chen',
        interviewerId: 'emp_4',
        interviewerName: 'Bob Wilson',
        interviewerRole: 'Recruiter',
        submittedDate: '2025-12-20T12:00:00Z',
        overallRating: 4.5,
        recommendation: 'Strong Hire',
        technicalSkills: {
          rating: 4.5,
          comments: 'Excellent understanding of React and TypeScript. Strong problem-solving skills.',
        },
        communication: {
          rating: 5.0,
          comments: 'Very articulate and clear in explaining technical concepts.',
        },
        cultureFit: {
          rating: 4.0,
          comments: 'Aligns well with company values. Team-oriented mindset.',
        },
        strengths: [
          'Deep knowledge of modern JavaScript frameworks',
          'Great communication skills',
          'Strong system design thinking',
        ],
        weaknesses: [
          'Limited experience with AWS',
          'Could improve on testing practices',
        ],
        detailedComments: 'Michael demonstrated strong technical skills and excellent communication. He would be a great addition to the team.',
        areasToImprove: [
          'Cloud infrastructure knowledge',
          'Unit testing best practices',
        ],
        nextSteps: 'Move to technical round with engineering team',
      },
      {
        id: '2',
        tenantId: user.tenantId,
        interviewId: 'interview_1',
        candidateId: 'cand_101',
        candidateName: 'Michael Chen',
        interviewerId: 'emp_1',
        interviewerName: 'John Smith',
        interviewerRole: 'Senior Engineer',
        submittedDate: '2025-12-26T15:30:00Z',
        overallRating: 4.8,
        recommendation: 'Strong Hire',
        technicalSkills: {
          rating: 5.0,
          comments: 'Exceptional technical depth. Handled complex system design questions with ease.',
        },
        communication: {
          rating: 4.5,
          comments: 'Clear communicator. Explained design decisions well.',
        },
        cultureFit: {
          rating: 5.0,
          comments: 'Perfect fit for our engineering culture. Collaborative and growth-minded.',
        },
        strengths: [
          'Expert-level React and Node.js skills',
          'Strong architectural thinking',
          'Excellent problem-solving approach',
        ],
        weaknesses: [
          'Could be more familiar with our specific tech stack',
        ],
        detailedComments: 'One of the strongest candidates I have interviewed. Ready for senior role.',
        areasToImprove: [
          'Familiarize with our deployment pipeline',
        ],
        nextSteps: 'Recommend for final round with CTO',
      },
    ];

    // Filter by interviewId if provided
    if (interviewId) {
      mockFeedback = mockFeedback.filter(feedback => feedback.interviewId === interviewId);
    }

    // Filter by candidateId if provided
    if (candidateId) {
      mockFeedback = mockFeedback.filter(feedback => feedback.candidateId === candidateId);
    }

    return NextResponse.json({ data: mockFeedback }, { status: 200 });
  } catch {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/recruitment/interviews/feedback
 * Submit interview feedback
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, employeeId } = context;
    const body = await request.json();

    // Mock creating feedback
    const newFeedback = {
      id: `feedback_${Date.now()}`,
      tenantId: user.tenantId,
      interviewerId: employeeId || user.userId,
      submittedBy: user.userId,
      submittedDate: new Date().toISOString(),
      ...body,
    };

    return NextResponse.json({ data: newFeedback }, { status: 201 });
  } catch {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
