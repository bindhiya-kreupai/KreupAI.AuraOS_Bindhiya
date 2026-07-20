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

export const POST = createProtectedRoute(
  async (request, { auth }) => {
    try {
      const body = await request.json();

      const part = await prisma.automotivePart.create({
        data: {
          tenantId: auth!.tenantId,
          partNumber: body.partNumber || `PN-${Date.now()}`,
          partName: body.partName,
          description: body.description || '',
          category: body.category || 'general',
          manufacturer: body.manufacturer || 'Unknown',
          barcode: body.barcode || '',
          supplierId: body.supplierId || '',
          unitOfMeasure: body.unitOfMeasure || 'pcs',
          costPrice: body.costPrice || 0,
          retailPrice: body.retailPrice || 0,
          taxRate: body.taxRate || 0,
          quantityOnHand: body.quantityOnHand || 0,
          reorderPoint: body.reorderPoint || 0,
          reorderQuantity: body.reorderQuantity || 0,
          locationBin: body.locationBin || '',
          status: body.status || 'in_stock',
          lastRestockDate: body.lastRestockDate ? new Date(body.lastRestockDate) : null,
          createdBy: auth!.userId,
          updatedBy: auth!.userId,
        },
      });

      return {
        data: {
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
        },
      };
    } catch (error: any) {
      console.error('Error creating part:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create part', details: error.message }),
        { status: 500 }
      );
    }
  },
  {
    requiredPermissions: [],
    rateLimit: 'API_DEFAULT',
  }
);
