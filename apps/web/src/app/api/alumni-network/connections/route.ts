import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

const db = prisma as any;

function mapConnection(c: any) {
  return {
    connectionId: c.id,
    fromAlumniId: c.fromEmployeeId,
    fromAlumniName: '',
    toAlumniId: c.toEmployeeId,
    toAlumniName: '',
    connectionStatus: c.connectionStatus,
    connectionDate: c.createdAt,
    message: c.message || undefined,
  };
}

export const GET = withEnhancedAuth(async (_request: NextRequest, context) => {
  try {
    const { user } = context;
    const employeeId = context.employeeId ?? user.userId;
    // Scope to the authenticated employee's connections (either direction).
    const connections = await db.alumniConnection.findMany({
      where: {
        tenantId: user.tenantId,
        OR: [{ fromEmployeeId: employeeId }, { toEmployeeId: employeeId }],
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(connections.map(mapConnection), { status: 200 });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { message: 'Failed to fetch connections', messageAr: 'فشل في جلب الاتصالات' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const toEmployeeId = body.toAlumniId || body.toEmployeeId;
    if (!toEmployeeId) {
      return NextResponse.json(
        { message: 'toAlumniId is required', messageAr: 'معرّف الخريج المستهدف مطلوب' },
        { status: 400 }
      );
    }

    // Never trust a client-sent "from" id — bind to the authenticated user.
    const fromEmployeeId = context.employeeId ?? user.userId;
    if (fromEmployeeId === toEmployeeId) {
      return NextResponse.json(
        {
          message: 'You cannot connect with yourself',
          messageAr: 'لا يمكنك الاتصال بنفسك',
        },
        { status: 400 }
      );
    }

    const existing = await db.alumniConnection.findFirst({
      where: { tenantId: user.tenantId, fromEmployeeId, toEmployeeId },
    });
    if (existing) {
      return NextResponse.json(mapConnection(existing), { status: 200 });
    }

    const connection = await db.alumniConnection.create({
      data: {
        tenantId: user.tenantId,
        fromEmployeeId,
        toEmployeeId,
        connectionStatus: 'pending',
        message: body.message || null,
      },
    });

    return NextResponse.json(mapConnection(connection), { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json(
      { message: 'Failed to create connection', messageAr: 'فشل في إنشاء الاتصال' },
      { status: 500 }
    );
  }
});
