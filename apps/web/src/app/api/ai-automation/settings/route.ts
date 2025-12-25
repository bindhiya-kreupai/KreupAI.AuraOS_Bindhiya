import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const settings = {
      settingsId: 'settings-1',
      modelSettings: {
        enableAutoRetraining: true,
        retrainingFrequency: 'monthly',
        minimumConfidenceThreshold: 0.7,
        enableExplainability: true
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
        nlpInsights: true
      },
      notifications: {
        enableAlerts: true,
        alertThresholds: {
          attritionRisk: 0.7,
          orgHealthScore: 70,
          anomalySeverity: 0.8
        },
        notificationChannels: ['email', 'slack']
      },
      lastUpdatedDate: new Date().toISOString(),
      lastUpdatedBy: context.user.userId,
      lastUpdatedByName: 'User'
    };

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching AI automation settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    const settings = {
      ...body,
      lastUpdatedDate: new Date().toISOString(),
      lastUpdatedBy: context.user.userId,
      lastUpdatedByName: 'User'
    };

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error updating AI automation settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
