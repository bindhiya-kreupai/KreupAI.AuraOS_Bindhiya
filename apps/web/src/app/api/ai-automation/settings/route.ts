import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'aiAutomation';

const DEFAULT_SETTINGS = {
  settingsId: 'settings-1',
  modelSettings: {
    enableAutoRetraining: true,
    retrainingFrequency: 'monthly',
    minimumConfidenceThreshold: 0.7,
    enableExplainability: true,
  },
  features: {
    orgHealthPredictor: true,
    aiCoachingBot: true,
    workflowGenerator: true,
    resumeScreening: true,
    attritionPrediction: true,
    leaveForecasting: true,
    anomalyDetection: true,
    chatbot: true,
    interviewScheduling: true,
    performanceAnalysis: true,
    ldRecommendation: true,
    jobMatching: true,
    emailParsing: true,
    autoAccruals: true,
    nlpInsights: true,
  },
  notifications: {
    enableAlerts: true,
    alertThresholds: {
      attritionRisk: 0.7,
      orgHealthScore: 70,
      anomalySeverity: 0.8,
    },
    notificationChannels: ['email', 'slack'],
  },
  lastUpdatedByName: 'User',
};

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const settings = await readSettings(tenantId, MODULE, DEFAULT_SETTINGS);
    return NextResponse.json({ success: true, data: { ...settings, tenantId } });
  } catch (error: any) {
    logger.error({ err: error, module: MODULE }, 'Failed to read settings');
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
    // Strip server-managed fields so callers can't overwrite them.
    delete body.tenantId;
    delete body.updatedBy;
    delete body.updatedAt;
    await writeSettings(tenantId, MODULE, body, userId);
    const settings = await readSettings(tenantId, MODULE, DEFAULT_SETTINGS);
    return NextResponse.json({ success: true, data: { ...settings, tenantId } });
  } catch (error: any) {
    logger.error({ err: error, module: MODULE }, 'Failed to update settings');
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
});
