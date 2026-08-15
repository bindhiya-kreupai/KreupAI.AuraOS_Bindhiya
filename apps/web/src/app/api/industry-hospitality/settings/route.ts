import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    settings: {
      settingsId: 'hosp-settings-1',
      organizationId: 'org-1',
      tipSettings: {
        autoDistribution: true,
        distributionFrequency: 'daily',
        minimumPoolAmount: 50,
      },
      eventSettings: {
        advanceBookingDays: 30,
        cancellationPenaltyPercent: 20,
        staffingBuffer: 10,
      },
      housekeepingSettings: {
        roomsPerHousekeeper: 15,
        deepCleanFrequency: 30,
        inspectionRequired: true,
      },
      notifications: {
        tipDistribution: true,
        eventStaffing: true,
        taskAssignment: true,
      },
      updatedAt: new Date().toISOString(),
    },
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json({ settings: body });
}
