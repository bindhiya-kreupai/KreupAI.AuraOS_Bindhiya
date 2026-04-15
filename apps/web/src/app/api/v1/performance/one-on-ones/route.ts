import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (_request: NextRequest, { _user }: any) => {
  return NextResponse.json({
    success: true,
    data: {
      oneOnOnes: [
        {
          id: 'oo-001',
          managerId: 'emp-201',
          managerName: 'Engineering Manager',
          reportId: 'emp-101',
          reportName: 'Jane Smith',
          frequency: 'weekly',
          nextMeeting: '2026-01-27T10:00:00Z',
          duration: 30,
          status: 'scheduled',
          agendaItems: ['Career development', 'Project updates', 'Blockers'],
          lastMeetingNotes: 'Discussed promotion path and Q1 goals.',
        },
        {
          id: 'oo-002',
          managerId: 'emp-201',
          managerName: 'Engineering Manager',
          reportId: 'emp-102',
          reportName: 'Tom Brown',
          frequency: 'bi-weekly',
          nextMeeting: '2026-01-30T14:00:00Z',
          duration: 30,
          status: 'scheduled',
          agendaItems: ['Sprint retrospective', 'Skill development'],
          lastMeetingNotes: 'Reviewed Q4 performance and set Q1 priorities.',
        },
        {
          id: 'oo-003',
          managerId: 'emp-201',
          managerName: 'Engineering Manager',
          reportId: 'emp-105',
          reportName: 'David Lee',
          frequency: 'weekly',
          nextMeeting: '2026-01-28T11:00:00Z',
          duration: 45,
          status: 'scheduled',
          agendaItems: ['Onboarding progress', 'Training feedback', 'Team integration'],
          lastMeetingNotes: 'Discussed first month experiences and learning plan.',
        },
      ],
      total: 3,
    },
  });
});

export const POST = withEnhancedAuth(async (request: NextRequest, { _user }: any) => {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    data: {
      id: 'oo-004',
      managerId: body.managerId,
      managerName: body.managerName || 'Engineering Manager',
      reportId: body.reportId,
      reportName: body.reportName,
      frequency: body.frequency || 'weekly',
      nextMeeting: body.nextMeeting || '2026-02-03T10:00:00Z',
      duration: body.duration || 30,
      status: 'scheduled',
      agendaItems: body.agendaItems || [],
      meetingLink: 'https://meet.example.com/oo-004',
      createdAt: new Date().toISOString(),
    },
  });
});
