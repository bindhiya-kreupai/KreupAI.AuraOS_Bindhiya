import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch onboarding settings (structured defaults with tenant context)
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const settings = {
        tenantId: user.tenantId,
        defaultProgramDuration: 90,
        requireBuddy: true,
        requirePreBoarding: true,
        surveyEnabled: true,
        surveySchedule: ['day_1', 'week_1', 'day_30', 'day_60', 'day_90'],
        autoAssignTasks: true,
        notifyManager: true,
        notifyIT: true,
        equipmentLeadTimeDays: 5,
        autoAssignBuddy: true,
        buddyMatchingCriteria: 'department',
        autoSendPreBoarding: true,
        preBoardingDaysBeforeStart: 7,
        autoCreateTasks: true,
        sendTaskReminders: true,
        reminderDaysBefore: 2,
        enableSurveys: true,
        enable30_60_90Plan: true,
        requireManagerReview: true,
        managerReviewFrequency: 'weekly',
        autoNotifications: {
          newHireWelcome: true,
          preBoardingPackage: true,
          taskAssigned: true,
          taskDue: true,
          taskOverdue: true,
          documentPending: true,
          equipmentReady: true,
          accessGranted: true,
          surveyDue: true,
          buddyAssigned: true,
          milestoneReached: true,
          completionCertificate: true,
        },
      };

      return NextResponse.json({ settings }, { status: 200 });
    } catch (error: any) {
      console.error('Error fetching onboarding settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding settings' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update onboarding settings (returns merged settings for now)
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();

      // Since there is no dedicated settings model yet, acknowledge the update
      // and return the merged settings
      const settings = {
        tenantId: user.tenantId,
        defaultProgramDuration: 90,
        requireBuddy: true,
        requirePreBoarding: true,
        surveyEnabled: true,
        surveySchedule: ['day_1', 'week_1', 'day_30', 'day_60', 'day_90'],
        autoAssignTasks: true,
        notifyManager: true,
        notifyIT: true,
        equipmentLeadTimeDays: 5,
        autoAssignBuddy: true,
        buddyMatchingCriteria: 'department',
        autoSendPreBoarding: true,
        preBoardingDaysBeforeStart: 7,
        autoCreateTasks: true,
        sendTaskReminders: true,
        reminderDaysBefore: 2,
        enableSurveys: true,
        enable30_60_90Plan: true,
        requireManagerReview: true,
        managerReviewFrequency: 'weekly',
        autoNotifications: {
          newHireWelcome: true,
          preBoardingPackage: true,
          taskAssigned: true,
          taskDue: true,
          taskOverdue: true,
          documentPending: true,
          equipmentReady: true,
          accessGranted: true,
          surveyDue: true,
          buddyAssigned: true,
          milestoneReached: true,
          completionCertificate: true,
        },
        ...body,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ settings }, { status: 200 });
    } catch (error: any) {
      console.error('Error updating onboarding settings:', error);
      return NextResponse.json(
        { error: 'Failed to update onboarding settings' },
        { status: 500 }
      );
    }
  }
);
