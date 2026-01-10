import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/pipeline
 * Fetch hiring pipelines for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    // Mock data for hiring pipelines
    const mockPipelines = [
      {
        id: '1',
        tenantId: user.tenantId,
        name: 'Engineering Hiring Pipeline',
        description: 'Standard pipeline for engineering positions',
        isDefault: true,
        isActive: true,
        stages: [
          {
            id: 'stage_1',
            name: 'Application Received',
            order: 1,
            type: 'Application',
            duration: 1, // days
            isRequired: true,
            actions: ['Review Resume', 'Screen Application'],
          },
          {
            id: 'stage_2',
            name: 'Phone Screen',
            order: 2,
            type: 'Interview',
            duration: 3,
            isRequired: true,
            actions: ['Schedule Call', 'Conduct Screening', 'Collect Feedback'],
          },
          {
            id: 'stage_3',
            name: 'Technical Assessment',
            order: 3,
            type: 'Assessment',
            duration: 5,
            isRequired: true,
            actions: ['Send Assessment', 'Review Submission', 'Grade Results'],
          },
          {
            id: 'stage_4',
            name: 'Technical Interview',
            order: 4,
            type: 'Interview',
            duration: 7,
            isRequired: true,
            actions: ['Schedule Interview', 'Conduct Interview', 'Collect Feedback'],
          },
          {
            id: 'stage_5',
            name: 'Manager Interview',
            order: 5,
            type: 'Interview',
            duration: 5,
            isRequired: true,
            actions: ['Schedule Interview', 'Conduct Interview', 'Collect Feedback'],
          },
          {
            id: 'stage_6',
            name: 'Background Check',
            order: 6,
            type: 'Verification',
            duration: 7,
            isRequired: true,
            actions: ['Request Consent', 'Initiate Check', 'Review Results'],
          },
          {
            id: 'stage_7',
            name: 'Offer',
            order: 7,
            type: 'Offer',
            duration: 5,
            isRequired: true,
            actions: ['Prepare Offer', 'Send Offer', 'Track Response'],
          },
          {
            id: 'stage_8',
            name: 'Hired',
            order: 8,
            type: 'Onboarding',
            duration: 0,
            isRequired: true,
            actions: ['Complete Onboarding Prep'],
          },
        ],
        applicableRoles: ['Software Engineer', 'Senior Software Engineer', 'Tech Lead'],
        createdBy: 'admin_1',
        createdDate: '2025-01-01T00:00:00Z',
        updatedDate: '2025-12-01T10:00:00Z',
      },
      {
        id: '2',
        tenantId: user.tenantId,
        name: 'Product & Design Pipeline',
        description: 'Pipeline for product and design positions',
        isDefault: false,
        isActive: true,
        stages: [
          {
            id: 'stage_1',
            name: 'Application Review',
            order: 1,
            type: 'Application',
            duration: 2,
            isRequired: true,
            actions: ['Review Portfolio', 'Screen Application'],
          },
          {
            id: 'stage_2',
            name: 'Initial Screen',
            order: 2,
            type: 'Interview',
            duration: 3,
            isRequired: true,
            actions: ['Phone/Video Screen', 'Collect Feedback'],
          },
          {
            id: 'stage_3',
            name: 'Portfolio Presentation',
            order: 3,
            type: 'Assessment',
            duration: 7,
            isRequired: true,
            actions: ['Schedule Presentation', 'Conduct Review', 'Collect Feedback'],
          },
          {
            id: 'stage_4',
            name: 'Team Interview',
            order: 4,
            type: 'Interview',
            duration: 5,
            isRequired: true,
            actions: ['Schedule Interview', 'Conduct Interview', 'Collect Feedback'],
          },
          {
            id: 'stage_5',
            name: 'Final Interview',
            order: 5,
            type: 'Interview',
            duration: 5,
            isRequired: true,
            actions: ['Schedule with Leadership', 'Conduct Interview', 'Collect Feedback'],
          },
          {
            id: 'stage_6',
            name: 'Background Check',
            order: 6,
            type: 'Verification',
            duration: 7,
            isRequired: false,
            actions: ['Initiate Check', 'Review Results'],
          },
          {
            id: 'stage_7',
            name: 'Offer',
            order: 7,
            type: 'Offer',
            duration: 5,
            isRequired: true,
            actions: ['Prepare Offer', 'Send Offer', 'Track Response'],
          },
          {
            id: 'stage_8',
            name: 'Hired',
            order: 8,
            type: 'Onboarding',
            duration: 0,
            isRequired: true,
            actions: ['Complete Onboarding Prep'],
          },
        ],
        applicableRoles: ['Product Manager', 'Product Designer', 'UX Researcher'],
        createdBy: 'admin_1',
        createdDate: '2025-02-01T00:00:00Z',
        updatedDate: '2025-11-15T14:30:00Z',
      },
    ];

    return NextResponse.json({ data: mockPipelines }, { status: 200 });
  } catch (error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/recruitment/pipeline
 * Create a new hiring pipeline
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.stages || !Array.isArray(body.stages)) {
      return NextResponse.json(
        { error: 'name and stages array are required' },
        { status: 400 }
      );
    }

    // Mock creating a pipeline
    const newPipeline = {
      id: `pipeline_${Date.now()}`,
      tenantId: user.tenantId,
      createdBy: user.userId,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      isActive: true,
      ...body,
    };

    return NextResponse.json({ data: newPipeline }, { status: 201 });
  } catch (error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
