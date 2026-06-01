import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultSettings = {
      settingsId: `settings-${user.tenantId}`,
      organizationId: user.tenantId,
      ticketSettings: {
        autoAssignment: true,
        assignmentMethod: 'skill_based',
        allowSelfAssignment: true,
        requireCategorySelection: true,
        defaultPriority: 'medium',
      },
      slaSettings: {
        enabled: true,
        businessHours: {
          monday: { enabled: true, startTime: '08:00', endTime: '17:00' },
          tuesday: { enabled: true, startTime: '08:00', endTime: '17:00' },
          wednesday: { enabled: true, startTime: '08:00', endTime: '17:00' },
          thursday: { enabled: true, startTime: '08:00', endTime: '17:00' },
          friday: { enabled: true, startTime: '08:00', endTime: '17:00' },
          saturday: { enabled: false, startTime: '', endTime: '' },
          sunday: { enabled: false, startTime: '', endTime: '' },
        },
        holidays: [],
        pauseOnPending: true,
      },
      satisfactionSettings: {
        enabled: true,
        surveyTrigger: 'on_resolution',
        followUpEnabled: true,
        lowRatingThreshold: 3,
      },
      escalationSettings: {
        autoEscalation: true,
        escalationThreshold: 120,
        notifyManagement: true,
      },
      notifications: {
        newTicketAssigned: true,
        slaWarning: true,
        escalationAlert: true,
        satisfactionSurveyReady: true,
      },
      updatedAt: new Date().toISOString(),
      tenantId: user.tenantId,
    };

    return NextResponse.json(
      { success: true, data: defaultSettings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching helpdesk settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const settings = {
      ...body,
      settingsId: `settings-${user.tenantId}`,
      organizationId: user.tenantId,
      updatedAt: new Date().toISOString(),
      tenantId: user.tenantId,
    };

    return NextResponse.json(
      { success: true, data: settings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating helpdesk settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
