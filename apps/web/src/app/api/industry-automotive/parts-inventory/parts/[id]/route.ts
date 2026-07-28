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

      const existing = await prisma.automotivePart.findFirst({
        where: { tenantId, id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const part = await prisma.automotivePart.update({
        where: { id: existing.id },
        data: {
          ...body,
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json(
        {
          part: {
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
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error updating part:', error);
      return NextResponse.json(
        { error: 'Failed to update part', details: error.message },
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

      const existing = await prisma.automotivePart.findFirst({
        where: { tenantId, id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      await prisma.automotivePart.update({
        where: { id: existing.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting part:', error);
      return NextResponse.json(
        { error: 'Failed to delete part', details: error.message },
        { status: 500 }
      );
    }
  },
  { requiredPermissions: [] }
);
