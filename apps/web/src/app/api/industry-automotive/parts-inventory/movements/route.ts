import { NextRequest, NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const GET = createProtectedRoute(
  async (request, { auth }) => {
    try {
      const movements = await prisma.automotivePartMovement.findMany({
        where: {
          tenantId: auth!.tenantId,
          isDeleted: false,
        },
        orderBy: {
          movementDate: 'desc',
        },
      });

      return {
        data: movements.map((mov) => ({
          movementId: mov.id,
          partId: mov.partId,
          movementType: mov.movementType,
          quantity: mov.quantity,
          unitCost: mov.unitCost,
          totalCost: mov.totalCost,
          referenceId: mov.referenceId,
          referenceType: mov.referenceType,
          locationFrom: mov.locationFrom,
          locationTo: mov.locationTo,
          notes: mov.notes,
          movementDate: mov.movementDate,
          performedBy: mov.performedBy,
        })),
      };
    } catch (error: any) {
      console.error('Error fetching part movements:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch part movements', details: error.message }),
        { status: 500 }
      );
    }
  },
  {
    requiredPermissions: [],
    rateLimit: 'API_DEFAULT',
  }
);
