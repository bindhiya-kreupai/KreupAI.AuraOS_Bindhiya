import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const recommendation = {
      recommendationId: `ld-${Date.now()}`,
      employeeId: employeeId || '',
      employeeName: 'Employee Name',
      recommendedCourses: [],
      skillGaps: [],
      careerPath: [],
      priority: 'medium',
      generatedDate: new Date().toISOString()
    };
    return NextResponse.json({ recommendation }, { status: 200 });
  } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
