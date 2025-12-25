import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const sessions = [
      {
        sessionId: `session-${Date.now()}`,
        employeeId: 'emp-001',
        employeeName: 'John Doe',
        sessionType: 'general',
        startTime: new Date().toISOString(),
        messages: [],
        sentimentAnalysis: {
          overallSentiment: 'positive',
          sentimentScore: 0.7,
          emotionalTone: ['confident', 'engaged'],
          concernLevel: 'low'
        },
        topics: ['career growth', 'skills development'],
        keyInsights: [],
        actionItems: [],
        resources: [],
        followUpScheduled: false,
        status: 'active',
        createdDate: new Date().toISOString()
      }
    ];

    return NextResponse.json({ sessions }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    const session = {
      sessionId: `session-${Date.now()}`,
      employeeId: body.employeeId || 'emp-001',
      employeeName: body.employeeName || 'Employee',
      sessionType: body.sessionType || 'general',
      startTime: new Date().toISOString(),
      messages: [],
      sentimentAnalysis: {
        overallSentiment: 'neutral',
        sentimentScore: 0,
        emotionalTone: [],
        concernLevel: 'low'
      },
      topics: [],
      keyInsights: [],
      actionItems: [],
      resources: [],
      followUpScheduled: false,
      status: 'active',
      createdDate: new Date().toISOString()
    };

    return NextResponse.json({ session }, { status: 201 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
