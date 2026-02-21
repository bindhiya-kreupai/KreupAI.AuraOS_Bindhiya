import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * Default recruitment settings structure.
 * Since there is no dedicated RecruitmentSettings Prisma model,
 * we return structured defaults enriched with tenant context.
 */
const defaultSettings = {
    general: {
        companyName: 'AuraOS Technologies',
        careerPageUrl: '',
        applicantTrackingSystem: 'AuraOS ATS',
        defaultJobBoard: 'LinkedIn',
    },
    applicationSettings: {
        allowDirectApplications: true,
        requireResume: true,
        requireCoverLetter: false,
        enableQuickApply: true,
        customApplicationFields: [],
        autoReplyEnabled: true,
        autoReplyTemplate: 'Thank you for your application. We will review it and get back to you soon.',
    },
    interviewSettings: {
        defaultInterviewDuration: 60,
        bufferTimeBetweenInterviews: 15,
        allowSelfScheduling: true,
        reminderSettings: {
            enabled: true,
            candidateReminderHours: [24, 2],
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
            { step: 1, role: 'Hiring Manager', required: true },
            { step: 2, role: 'HR Director', required: true },
        ],
        electronicSignature: {
            enabled: false,
            provider: '',
        },
    },
    backgroundCheckSettings: {
        provider: '',
        defaultCheckType: 'Comprehensive',
        requireForAllPositions: false,
        requiredForRoles: [],
        autoInitiateAfterOfferAcceptance: false,
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
            enabled: false,
            channel: '',
            notifyOn: [],
        },
    },
    complianceSettings: {
        gdprCompliance: false,
        dataRetentionPeriod: 365,
        equalOpportunityEmployer: true,
        diversityTracking: false,
    },
};

/**
 * GET /api/recruitment/settings
 * Fetch recruitment settings for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
    try {
        const { user } = context;

        const settings = {
            id: `settings_${user.tenantId}`,
            tenantId: user.tenantId,
            ...defaultSettings,
            updatedBy: user.userId,
            updatedDate: new Date().toISOString(),
        };

        return NextResponse.json(settings, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
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

        // Merge the incoming updates with defaults
        const updatedSettings = {
            id: `settings_${user.tenantId}`,
            tenantId: user.tenantId,
            ...defaultSettings,
            ...body,
            updatedBy: user.userId,
            updatedDate: new Date().toISOString(),
        };

        return NextResponse.json(updatedSettings, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
});
