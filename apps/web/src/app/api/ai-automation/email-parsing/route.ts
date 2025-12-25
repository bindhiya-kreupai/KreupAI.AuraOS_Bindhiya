import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();
    const parsing = {
      parsingId: `parse-${Date.now()}`,
      emailId: body.emailId,
      subject: '',
      sender: '',
      category: 'general',
      intent: 'inquiry',
      priority: 'medium',
      actionRequired: false,
      extractedData: {},
      suggestedDepartment: 'HR',
      suggestedAssignee: '',
      confidenceLevel: 'medium',
      parsedDate: new Date().toISOString()
    };
    return NextResponse.json({ parsing }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
