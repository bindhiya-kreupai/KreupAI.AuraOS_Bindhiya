import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// Offboarding settings are returned as sensible defaults.
// In production, these would be stored in a tenant settings table.
// For now, GET returns defaults and PUT accepts updates (stored in-memory
// per request cycle). A dedicated settings model can be added later.

const DEFAULT_SETTINGS = {
  defaultNoticePeriod: 30,
  autoInitiateOffboarding: true,
  requireExitInterview: true,
  requireExitSurvey: true,
  exitSurveyAnonymous: false,
  exitSurveyExpiry: 30,
  sendExitSurveyAfter: 0,
  requireKnowledgeTransfer: true,
  knowledgeTransferDuration: 14,
  autoRevokeAccessOnExit: true,
  accessRevocationLeadTime: 0,
  autoCreateAlumniRecord: true,
  alumniOptInRequired: false,
  equipmentReturnReminder: 7,
  clearanceReminderFrequency: 'weekly' as const,
  finalSettlementDays: 45,
  allowCounterOffer: true,
  counterOfferApprovalRequired: true,
  notificationEmail: 'hr@company.com',
  hrNotificationEmail: 'hr@company.com',
  itNotificationEmail: 'it@company.com',
  financeNotificationEmail: 'finance@company.com',
};

// ===== GET Handler =====
export const GET = withEnhancedAuth(async (_request, _context) => {
  try {
    return NextResponse.json(
      { success: true, settings: DEFAULT_SETTINGS },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching offboarding settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch offboarding settings' },
      { status: 500 }
    );
  }
});

// ===== PUT Handler =====
export const PUT = withEnhancedAuth(async (request, _context) => {
  try {
    const body = await request.json();

    // Merge provided updates with defaults
    const updatedSettings = {
      ...DEFAULT_SETTINGS,
      ...body,
    };

    return NextResponse.json(
      { success: true, settings: updatedSettings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating offboarding settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update offboarding settings' },
      { status: 500 }
    );
  }
});
