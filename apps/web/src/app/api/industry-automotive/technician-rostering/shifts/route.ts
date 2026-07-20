import { NextRequest, NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const GET = createProtectedRoute(
  async (request, { auth }) => {
    try {
      const shifts = await prisma.automotiveTechnicianShift.findMany({
        where: {
          tenantId: auth!.tenantId,
          isDeleted: false,
        },
        include: {
          technician: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

      return {
        data: shifts.map((shift) => ({
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
        })),
      };
    } catch (error: any) {
      console.error('Error fetching shifts:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch shifts', details: error.message }),
        { status: 500 }
      );
    }
  },
  {
    requiredPermissions: [],
    rateLimit: 'API_DEFAULT',
  }
);

export const POST = createProtectedRoute(
  async (request, { auth }) => {
    try {
      const body = await request.json();

      const shift = await prisma.automotiveTechnicianShift.create({
        data: {
          tenantId: auth!.tenantId,
          technicianId: body.technicianId,
          date: body.date ? new Date(body.date) : new Date(),
          shiftType: body.shiftType || 'regular',
          startTime: body.startTime || '09:00',
          endTime: body.endTime || '17:00',
          breakDuration: body.breakDuration || 60,
          location: body.location || 'Main Bay',
          serviceAdvisor: body.serviceAdvisor || '',
          assignedJobs: body.assignedJobs || [],
          status: body.status || 'scheduled',
          notes: body.notes || '',
          createdBy: auth!.userId,
          updatedBy: auth!.userId,
        },
        include: {
          technician: true,
        },
      });

      return {
        data: {
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
      };
    } catch (error: any) {
      console.error('Error creating shift:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create shift', details: error.message }),
        { status: 500 }
      );
    }
  },
  {
    requiredPermissions: [],
    rateLimit: 'API_DEFAULT',
  }
);
