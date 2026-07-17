import { NextRequest, NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const GET = createProtectedRoute(
  async (request, { auth }) => {
    try {
      const parts = await prisma.automotivePart.findMany({
        where: {
          tenantId: auth!.tenantId,
          isDeleted: false,
        },
        orderBy: {
          partName: 'asc',
        },
      });

      return {
        data: parts.map((part) => ({
          partId: part.id,
          partNumber: part.partNumber,
          partName: part.partName,
          description: part.description,
          category: part.category,
          manufacturer: part.manufacturer,
          barcode: part.barcode,
          supplierId: part.supplierId,
          unitOfMeasure: part.unitOfMeasure,
          costPrice: part.costPrice,
          retailPrice: part.retailPrice,
          taxRate: part.taxRate,
          quantityOnHand: part.quantityOnHand,
          reorderPoint: part.reorderPoint,
          reorderQuantity: part.reorderQuantity,
          locationBin: part.locationBin,
          status: part.status,
          lastRestockDate: part.lastRestockDate,
        })),
      };
    } catch (error: any) {
      console.error('Error fetching parts:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch parts', details: error.message }),
        { status: 500 }
      );
    }
  },
  {
    requiredPermissions: [],
    rateLimit: 'API_DEFAULT',
  }
);
