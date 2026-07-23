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

      const existing = await prisma.automotiveTechnician.findFirst({
        where: { tenantId, id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const data = await prisma.automotiveTechnician.update({
        where: { id: existing.id },
        data: {
          ...body,
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ technician: data }, { status: 200 });
    } catch (error: any) {
      console.error('Error updating technician:', error);
      return NextResponse.json(
        { error: 'Failed to update technician', details: error.message },
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

      const existing = await prisma.automotiveTechnician.findFirst({
        where: { tenantId, id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      await prisma.automotiveTechnician.update({
        where: { id: existing.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting technician:', error);
      return NextResponse.json(
        { error: 'Failed to delete technician', details: error.message },
        { status: 500 }
      );
    }
  },
  { requiredPermissions: [] }
);
