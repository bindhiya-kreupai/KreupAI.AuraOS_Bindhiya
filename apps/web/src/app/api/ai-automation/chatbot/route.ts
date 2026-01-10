import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const conversations = [];
    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();
    const conversation = {
      conversationId: `conv-${Date.now()}`,
      employeeId: body.employeeId,
      employeeName: body.employeeName,
      messages: [],
      startTime: new Date().toISOString(),
      primaryIntent: 'general_inquiry',
      allIntents: [],
      resolved: false,
      messageCount: 0,
      averageResponseTime: 0,
      status: 'active',
      createdDate: new Date().toISOString()
    };
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
