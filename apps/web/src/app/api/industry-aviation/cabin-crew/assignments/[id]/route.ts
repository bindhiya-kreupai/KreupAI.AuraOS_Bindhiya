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
      const id = context.params.id;

      const data = await prisma.aviationFlightAssignment.findFirst({
        where: { tenantId, assignmentId: id, isDeleted: false },
      });

      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      return NextResponse.json({ assignment: mapToFrontend(data) }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:read'] }
);

export const PUT = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const id = context.params.id;
      const body = await request.json();

      const existing = await prisma.aviationFlightAssignment.findFirst({
        where: { tenantId, assignmentId: id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const updateData: any = {};
      if (body.flightNumber !== undefined) updateData.flightNumber = body.flightNumber;
      if (body.departure?.airportCode !== undefined)
        updateData.departureAirport = body.departure.airportCode;
      if (body.arrival?.airportCode !== undefined)
        updateData.arrivalAirport = body.arrival.airportCode;
      if (body.scheduledDeparture !== undefined)
        updateData.scheduledDeparture = new Date(body.scheduledDeparture);
      if (body.scheduledArrival !== undefined)
        updateData.scheduledArrival = new Date(body.scheduledArrival);
      if (body.status !== undefined) updateData.status = body.status;
      if (body.aircraftType !== undefined) updateData.aircraftType = body.aircraftType;
      if (body.crewComplement !== undefined) updateData.crewComplement = body.crewComplement;
      if (body.reportTime !== undefined) updateData.reportTime = new Date(body.reportTime);
      if (body.clearTime !== undefined) updateData.clearTime = new Date(body.clearTime);

      const data = await prisma.aviationFlightAssignment.update({
        where: { id: existing.id },
        data: {
          ...updateData,
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ assignment: mapToFrontend(data) }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:write'] }
);

export const DELETE = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const id = context.params.id;

      const existing = await prisma.aviationFlightAssignment.findFirst({
        where: { tenantId, assignmentId: id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      await prisma.aviationFlightAssignment.update({
        where: { id: existing.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:delete'] }
);
