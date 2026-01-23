import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      availableSlots: [
        {
          id: 'slot-001',
          date: '2026-01-27',
          startTime: '09:00',
          endTime: '09:45',
          interviewerId: 'int-001',
          interviewerName: 'Sarah Connor',
          type: 'video',
        },
        {
          id: 'slot-002',
          date: '2026-01-27',
          startTime: '11:00',
          endTime: '11:45',
          interviewerId: 'int-002',
          interviewerName: 'James Wilson',
          type: 'in-person',
        },
        {
          id: 'slot-003',
          date: '2026-01-28',
          startTime: '14:00',
          endTime: '14:45',
          interviewerId: 'int-001',
          interviewerName: 'Sarah Connor',
          type: 'video',
        },
        {
          id: 'slot-004',
          date: '2026-01-29',
          startTime: '10:00',
          endTime: '10:45',
          interviewerId: 'int-003',
          interviewerName: 'Michael Lee',
          type: 'phone',
        },
      ],
      timezone: 'UTC',
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    data: {
      id: 'interview-001',
      candidateId: body.candidateId,
      slotId: body.slotId,
      jobId: body.jobId,
      interviewType: body.interviewType || 'video',
      scheduledDate: body.date || '2026-01-27',
      scheduledTime: body.startTime || '09:00',
      duration: 45,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/interview-001',
      createdAt: new Date().toISOString(),
    },
  });
}
