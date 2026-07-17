import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const data = await prisma.aviationPilotProfile.findMany({
        where: { tenantId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ pilots: data }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:read'] }
);

export const POST = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const body = await request.json();

      const data = await prisma.aviationPilotProfile.create({
        data: {
          ...body,
          tenantId,
          createdBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ pilot: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:write'] }
);
