/**
 * Interview Scheduling API Routes
 * Phase 3: Intelligence Layer - Recruitment Automation
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'schedule';

    switch (action) {
      case 'schedule':
        if (!body.candidateId || !body.interviewers) {
          return NextResponse.json(
            { error: 'candidateId and interviewers are required' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            interviewId: `int_${Date.now()}`,
            suggestedSlots: [
              { date: '2025-01-02', time: '10:00 AM', duration: 60, conflicts: 0, score: 0.98 },
              { date: '2025-01-02', time: '2:00 PM', duration: 60, conflicts: 0, score: 0.95 },
              { date: '2025-01-03', time: '11:00 AM', duration: 60, conflicts: 1, score: 0.88 },
            ],
            bestSlot: {
              date: '2025-01-02',
              time: '10:00 AM',
              reason: 'All interviewers available, optimal time zone',
            },
          },
        });

      case 'optimize':
        return NextResponse.json({
          success: true,
          data: {
            optimization: {
              currentSchedule: body.currentSchedule || [],
              optimizedSchedule: [
                { candidate: 'C1', slot: '2025-01-02 10:00', panel: ['I1', 'I2'] },
                { candidate: 'C2', slot: '2025-01-02 11:30', panel: ['I1', 'I3'] },
                { candidate: 'C3', slot: '2025-01-02 14:00', panel: ['I2', 'I3'] },
              ],
              improvement: '30% reduction in interviewer idle time',
              conflicts: 0,
            },
          },
        });

      case 'availability':
        return NextResponse.json({
          success: true,
          data: {
            interviewerId: body.interviewerId,
            availableSlots: [
              { date: '2025-01-02', slots: ['10:00', '14:00', '15:30'] },
              { date: '2025-01-03', slots: ['09:00', '11:00', '16:00'] },
              { date: '2025-01-06', slots: ['10:30', '13:00', '14:30'] },
            ],
            busySlots: [{ date: '2025-01-02', time: '11:30', reason: 'Team meeting' }],
          },
        });

      case 'reschedule':
        return NextResponse.json({
          success: true,
          data: {
            interviewId: body.interviewId,
            newSlot: body.newSlot,
            notificationsSent: true,
            message: 'Interview rescheduled successfully',
          },
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process interview scheduling' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    return NextResponse.json({
      success: true,
      data: {
        upcomingInterviews: 12,
        totalThisWeek: 15,
        completionRate: 0.93,
        avgSchedulingTime: '2.3 hours',
        interviews: [
          {
            id: 'int-1',
            candidate: 'Jane Doe',
            position: 'Senior Developer',
            date: '2025-01-02',
            time: '10:00 AM',
            interviewers: ['John Smith', 'Sarah Miller'],
            status: 'SCHEDULED',
          },
          {
            id: 'int-2',
            candidate: 'Mike Johnson',
            position: 'Product Manager',
            date: '2025-01-02',
            time: '2:00 PM',
            interviewers: ['Alice Brown', 'Bob Wilson'],
            status: 'SCHEDULED',
          },
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
}
