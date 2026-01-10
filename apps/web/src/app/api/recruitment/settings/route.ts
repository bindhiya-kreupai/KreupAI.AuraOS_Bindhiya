import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/settings
 * Fetch recruitment settings for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    // Mock data for recruitment settings
    const mockSettings = {
      id: 'settings_1',
      tenantId: user.tenantId,
      general: {
        companyName: 'AuraOS Technologies',
        careerPageUrl: 'https://careers.auraos.com',
        applicantTrackingSystem: 'AuraOS ATS',
        defaultJobBoard: 'LinkedIn',
      },
      applicationSettings: {
        allowDirectApplications: true,
        requireResume: true,
        requireCoverLetter: false,
        enableQuickApply: true,
        customApplicationFields: [
          {
            id: 'field_1',
            name: 'Portfolio URL',
            type: 'url',
            required: false,
            applicableRoles: ['Designer', 'Product Manager'],
          },
          {
            id: 'field_2',
            name: 'GitHub Profile',
            type: 'url',
            required: false,
            applicableRoles: ['Software Engineer', 'DevOps Engineer'],
          },
        ],
        autoReplyEnabled: true,
        autoReplyTemplate: 'Thank you for your application. We will review it and get back to you soon.',
      },
      interviewSettings: {
        defaultInterviewDuration: 60, // minutes
        bufferTimeBetweenInterviews: 15, // minutes
        allowSelfScheduling: true,
        reminderSettings: {
          enabled: true,
          candidateReminderHours: [24, 2], // hours before interview
          interviewerReminderHours: [24, 1],
        },
        videoConferencing: {
          provider: 'Zoom',
          autoGenerateMeetingLinks: true,
        },
      },
      offerSettings: {
        defaultOfferExpiryDays: 14,
        requireApproval: true,
        approvalWorkflow: [
          {
            step: 1,
            role: 'Hiring Manager',
            required: true,
          },
          {
            step: 2,
            role: 'HR Director',
            required: true,
          },
          {
            step: 3,
            role: 'CFO',
            required: false,
            condition: 'salary > 150000',
          },
        ],
        electronicSignature: {
          enabled: true,
          provider: 'DocuSign',
        },
      },
      backgroundCheckSettings: {
        provider: 'BackgroundCheck Pro',
        defaultCheckType: 'Comprehensive',
        requireForAllPositions: false,
        requiredForRoles: ['Engineering Manager', 'Finance', 'HR'],
        autoInitiateAfterOfferAcceptance: true,
      },
      notificationSettings: {
        emailNotifications: {
          newApplication: true,
          interviewScheduled: true,
          interviewRescheduled: true,
          feedbackSubmitted: true,
          offerExtended: true,
          backgroundCheckCompleted: true,
        },
        slackIntegration: {
          enabled: true,
          channel: '#recruitment',
          notifyOn: ['New Application', 'Offer Accepted', 'Candidate Hired'],
        },
      },
      complianceSettings: {
        gdprCompliance: true,
        dataRetentionPeriod: 365, // days
        equalOpportunityEmployer: true,
        diversityTracking: true,
      },
      updatedBy: user.userId,
      updatedDate: '2025-12-15T10:00:00Z',
    };

    return NextResponse.json({ data: mockSettings }, { status: 200 });
  } catch (error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/recruitment/settings
 * Update recruitment settings
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock updating settings
    const updatedSettings = {
      id: 'settings_1',
      tenantId: user.tenantId,
      ...body,
      updatedBy: user.userId,
      updatedDate: new Date().toISOString(),
    };

    return NextResponse.json({ data: updatedSettings }, { status: 200 });
  } catch (error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
