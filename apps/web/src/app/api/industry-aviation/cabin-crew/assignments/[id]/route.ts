import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const id = context.params.id;

      const data = await prisma.aviationFlightAssignment.findFirst({
        where: { tenantId, assignmentId: id, isDeleted: false },
      });

      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      return NextResponse.json({ assignment: data }, { status: 200 });
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

      const data = await prisma.aviationFlightAssignment.update({
        where: { id: existing.id },
        data: {
          ...body,
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ assignment: data }, { status: 200 });
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
