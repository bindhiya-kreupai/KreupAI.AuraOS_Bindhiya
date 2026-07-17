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
          technicianName: `${shift.technician.firstName} ${shift.technician.lastName}`,
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
