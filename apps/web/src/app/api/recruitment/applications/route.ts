import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/applications
 * Fetch all candidate applications for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    // Mock data for applications
    let mockApplications = [
      {
        id: '1',
        tenantId: user.tenantId,
        jobId: 'job_1',
        jobTitle: 'Senior Software Engineer',
        candidateId: 'cand_101',
        candidateName: 'Michael Chen',
        candidateEmail: 'michael.chen@email.com',
        candidatePhone: '+1-555-0123',
        appliedDate: '2025-12-20T10:30:00Z',
        status: 'Under Review',
        stage: 'Phone Screen',
        source: 'LinkedIn',
        resumeUrl: 'https://example.com/resumes/michael-chen.pdf',
        coverLetterUrl: 'https://example.com/letters/michael-chen.pdf',
        experience: 8,
        currentCompany: 'Tech Corp',
        currentTitle: 'Software Engineer',
        expectedSalary: 160000,
        noticePeriod: '2 weeks',
        rating: 4.5,
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      },
      {
        id: '2',
        tenantId: user.tenantId,
        jobId: 'job_1',
        jobTitle: 'Senior Software Engineer',
        candidateId: 'cand_102',
        candidateName: 'Sarah Williams',
        candidateEmail: 'sarah.williams@email.com',
        candidatePhone: '+1-555-0124',
        appliedDate: '2025-12-21T14:15:00Z',
        status: 'New',
        stage: 'Application Received',
        source: 'Company Website',
        resumeUrl: 'https://example.com/resumes/sarah-williams.pdf',
        coverLetterUrl: null,
        experience: 6,
        currentCompany: 'Startup Inc',
        currentTitle: 'Full Stack Developer',
        expectedSalary: 140000,
        noticePeriod: '1 month',
        rating: null,
        skills: ['Vue.js', 'Python', 'Django', 'PostgreSQL'],
      },
      {
        id: '3',
        tenantId: user.tenantId,
        jobId: 'job_2',
        jobTitle: 'Product Manager',
        candidateId: 'cand_103',
        candidateName: 'David Kumar',
        candidateEmail: 'david.kumar@email.com',
        candidatePhone: '+1-555-0125',
        appliedDate: '2025-12-22T09:00:00Z',
        status: 'Interview',
        stage: 'Technical Interview',
        source: 'Referral',
        resumeUrl: 'https://example.com/resumes/david-kumar.pdf',
        coverLetterUrl: 'https://example.com/letters/david-kumar.pdf',
        experience: 5,
        currentCompany: 'Product Co',
        currentTitle: 'Associate Product Manager',
        expectedSalary: 120000,
        noticePeriod: '3 weeks',
        rating: 4.8,
        skills: ['Product Strategy', 'Agile', 'Jira', 'Analytics', 'User Research'],
      },
    ];

    // Filter by jobId if provided
    if (jobId) {
      mockApplications = mockApplications.filter(app => app.jobId === jobId);
    }

    // Filter by status if provided
    if (status) {
      mockApplications = mockApplications.filter(app => app.status === status);
    }

    return NextResponse.json({ data: mockApplications }, { status: 200 });
  } catch {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/recruitment/applications
 * Create a new candidate application
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock creating an application
    const newApplication = {
      id: `app_${Date.now()}`,
      tenantId: user.tenantId,
      createdBy: user.userId,
      createdDate: new Date().toISOString(),
      appliedDate: new Date().toISOString(),
      status: 'New',
      stage: 'Application Received',
      rating: null,
      ...body,
    };

    return NextResponse.json({ data: newApplication }, { status: 201 });
  } catch {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/recruitment/applications
 * Update application status or details
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Mock updating an application
    const updatedApplication = {
      id,
      tenantId: user.tenantId,
      ...updates,
      updatedBy: user.userId,
      updatedDate: new Date().toISOString(),
    };

    return NextResponse.json({ data: updatedApplication }, { status: 200 });
  } catch {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
