import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

const mapToFrontend = (dbRecord: any) => ({
  ...dbRecord,
  departure: { airportCode: dbRecord.departureAirport, gate: '' },
  arrival: { airportCode: dbRecord.arrivalAirport, gate: '' },
});

export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const data = await prisma.aviationFlightAssignment.findMany({
        where: { tenantId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ assignments: data.map(mapToFrontend) }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:read'] }
);

export const POST = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const body = await request.json();

      const data = await prisma.aviationFlightAssignment.create({
        data: {
          assignmentId: body.assignmentId || crypto.randomUUID(),
          flightNumber: body.flightNumber || 'TBD',
          departureAirport: body.departure?.airportCode || 'N/A',
          arrivalAirport: body.arrival?.airportCode || 'N/A',
          scheduledDeparture: body.scheduledDeparture
            ? new Date(body.scheduledDeparture)
            : new Date(),
          scheduledArrival: body.scheduledArrival ? new Date(body.scheduledArrival) : new Date(),
          status: body.status || 'scheduled',
          aircraftType: body.aircraftType || 'N/A',
          aircraftRegistration: body.aircraftRegistration || 'N/A',
          position: body.position || 'forward',
          reportTime: body.reportTime ? new Date(body.reportTime) : new Date(),
          clearTime: body.clearTime ? new Date(body.clearTime) : new Date(),
          flightTimeMinutes: body.flightTimeMinutes || 0,
          dutyTimeMinutes: body.dutyTimeMinutes || 0,
          crewComplement: body.crewComplement || null,
          briefingInfo: body.briefingInfo || null,
          tenantId,
          createdBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ assignment: mapToFrontend(data) }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:write'] }
);
