import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const PUT = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const id = context.params.id;
      const body = await request.json();

      const existing = await prisma.automotiveTechnicianShift.findFirst({
        where: { tenantId, id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      // Update data mapping date fields if necessary
      const dataToUpdate = { ...body };
      if (body.date) {
        dataToUpdate.date = new Date(body.date);
      }

      const shift = await prisma.automotiveTechnicianShift.update({
        where: { id: existing.id },
        data: {
          ...dataToUpdate,
          updatedBy: context.auth!.userId,
        },
        include: {
          technician: true,
        },
      });

      return NextResponse.json(
        {
          shift: {
            shiftId: shift.id,
            technicianId: shift.technicianId,
            technicianName: shift.technician
              ? `${shift.technician.firstName} ${shift.technician.lastName}`
              : 'Unknown',
            date: shift.date,
            shiftType: shift.shiftType,
            startTime: shift.startTime,
            endTime: shift.endTime,
            breakDuration: shift.breakDuration,
            location: shift.location,
            serviceAdvisor: shift.serviceAdvisor,
            assignedJobs: shift.assignedJobs,
            status: shift.status,
            notes: shift.notes,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error updating shift:', error);
      return NextResponse.json(
        { error: 'Failed to update shift', details: error.message },
        { status: 500 }
      );
    }
  },
  { requiredPermissions: [] }
);

export const DELETE = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const id = context.params.id;

      const existing = await prisma.automotiveTechnicianShift.findFirst({
        where: { tenantId, id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      await prisma.automotiveTechnicianShift.update({
        where: { id: existing.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting shift:', error);
      return NextResponse.json(
        { error: 'Failed to delete shift', details: error.message },
        { status: 500 }
      );
    }
  },
  { requiredPermissions: [] }
);
