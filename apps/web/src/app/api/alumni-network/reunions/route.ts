import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// Reunions are alumni events flagged isReunion=true.
const db = prisma as any;

function mapReunion(e: any) {
  return {
    reunionId: e.id,
    reunionName: e.eventName,
    batchYear: e.batchYear ?? undefined,
    department: undefined,
    location: e.location || undefined,
    eventId: e.id,
    expectedAttendees: e.maxAttendees ?? 0,
    actualAttendees: e.currentAttendees ?? 0,
    eventDate: e.eventDate,
    description: e.description || '',
    status: e.status,
  };
}

export const GET = withEnhancedAuth(async (_request: NextRequest, context) => {
  try {
    const { user } = context;
    const reunions = await db.alumniEvent.findMany({
      where: { tenantId: user.tenantId, isReunion: true },
      orderBy: { eventDate: 'asc' },
    });
    return NextResponse.json(reunions.map(mapReunion), { status: 200 });
  } catch (error) {
    console.error('Error fetching reunions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch reunions', messageAr: 'فشل في جلب اللقاءات' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.reunionName || !body.eventDate) {
      return NextResponse.json(
        {
          message: 'reunionName and eventDate are required',
          messageAr: 'اسم اللقاء وتاريخه مطلوبان',
        },
        { status: 400 }
      );
    }

    const created = await db.alumniEvent.create({
      data: {
        tenantId: user.tenantId,
        eventName: body.reunionName,
        eventType: 'reunion',
        eventFormat: body.eventFormat || 'in_person',
        description: body.description || null,
        eventDate: new Date(body.eventDate),
        location: body.location || null,
        status: body.status || 'published',
        maxAttendees: body.expectedAttendees ?? null,
        isReunion: true,
        batchYear: body.batchYear ?? null,
        createdBy: context.employeeId ?? user.userId,
      },
    });

    return NextResponse.json(mapReunion(created), { status: 201 });
  } catch (error) {
    console.error('Error creating reunion:', error);
    return NextResponse.json(
      { message: 'Failed to create reunion', messageAr: 'فشل في إنشاء اللقاء' },
      { status: 500 }
    );
  }
});
