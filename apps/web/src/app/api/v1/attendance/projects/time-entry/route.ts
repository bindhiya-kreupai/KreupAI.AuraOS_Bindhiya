import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

interface TimeEntryRequest {
  projectId: string;
  hours: number;
  date: string;
  notes?: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  employeeId: string;
  hours: number;
  date: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const POST = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('attendance:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing attendance:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const body: TimeEntryRequest = await request.json();

    if (!body.projectId || !body.hours || !body.date) {
      return NextResponse.json(
        { error: 'projectId, hours, and date are required' },
        { status: 400 }
      );
    }

    if (body.hours <= 0 || body.hours > 24) {
      return NextResponse.json({ error: 'hours must be between 0 and 24' }, { status: 400 });
    }

    const newEntry: TimeEntry = {
      id: `te-${Date.now()}`,
      projectId: body.projectId,
      employeeId: 'emp-001',
      hours: body.hours,
      date: body.date,
      notes: body.notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newEntry, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
});
