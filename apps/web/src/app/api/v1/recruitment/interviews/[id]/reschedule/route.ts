import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  return NextResponse.json({
    success: true,
    data: {
      id,
      previousDate: '2026-01-27',
      previousTime: '09:00',
      newDate: body.date || '2026-01-30',
      newTime: body.startTime || '14:00',
      duration: body.duration || 45,
      reason: body.reason || 'Scheduling conflict',
      status: 'rescheduled',
      updatedAt: new Date().toISOString(),
    },
  });
}
