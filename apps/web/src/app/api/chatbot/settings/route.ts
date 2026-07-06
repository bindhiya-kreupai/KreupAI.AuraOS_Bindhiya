import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'chatbot';

const DEFAULT_SETTINGS = {
  botName: 'HR Assistant',
  botAvatar: null,
  defaultLanguage: 'en',
  enableLogging: true,
  logRetentionDays: 90,
  enableAnalytics: true,
  confidenceThreshold: 0.7,
  fallbackMessage: 'I did not understand that. Could you please rephrase?',
  maxConversationTurns: 50,
  sessionTimeoutMinutes: 30,
  enableContextPersistence: true,
  enableSentimentAnalysis: true,
  enableSpellCheck: true,
  enableProfanityFilter: true,
};

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const settings = await readSettings(tenantId, MODULE, DEFAULT_SETTINGS);
    return NextResponse.json({
      success: true,
      data: { ...settings, tenantId, settingsId: 'settings-1' },
    });
  } catch (error: any) {
    logger.error({ err: error, module: MODULE }, 'Failed to read chatbot settings');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const userId = context.user.userId;
    const body = await request.json();
    delete body.tenantId;
    delete body.settingsId;
    await writeSettings(tenantId, MODULE, body, userId);
    const settings = await readSettings(tenantId, MODULE, DEFAULT_SETTINGS);
    return NextResponse.json({
      success: true,
      data: { ...settings, tenantId, settingsId: 'settings-1' },
    });
  } catch (error: any) {
    logger.error({ err: error, module: MODULE }, 'Failed to update chatbot settings');
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
});
