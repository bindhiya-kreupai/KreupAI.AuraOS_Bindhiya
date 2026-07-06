import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

const db = prisma as any;

function mapEvent(e: any) {
  return {
    eventId: e.id,
    eventName: e.eventName,
    eventType: e.eventType,
    eventFormat: e.eventFormat,
    description: e.description || '',
    eventDate: e.eventDate,
    eventStatus: e.status,
    maxAttendees: e.maxAttendees ?? undefined,
    currentAttendees: e.currentAttendees ?? 0,
    rsvpCount: e.currentAttendees ?? 0,
    location: e.location || '',
    tags: e.tags || [],
    createdDate: e.createdAt,
    lastUpdatedDate: e.updatedAt,
  };
}

// RSVP — register the authenticated alumnus for an event.
export const POST = withEnhancedAuth<{ params: Promise<{ eventId: string }> }>(
  async (request, context) => {
    try {
      const { user } = context;
      // The enhanced-auth context exposes the resolved employee id at the top
      // level; fall back to the user id (employeeId === userId today).
      const authEmployeeId = context.employeeId ?? user.userId;
      const params = await context.params;
      const eventId = params.eventId;
      const body = await request.json().catch(() => ({}));

      const event = await db.alumniEvent.findFirst({
        where: { id: eventId, tenantId: user.tenantId },
      });
      if (!event) {
        return NextResponse.json(
          { message: 'Event not found', messageAr: 'الفعالية غير موجودة' },
          { status: 404 }
        );
      }

      // Never trust a client-sent alumni id — bind to the authenticated user.
      const employeeId = authEmployeeId;

      const existing = await db.alumniEventRegistration.findFirst({
        where: { tenantId: user.tenantId, eventId, employeeId },
      });
      if (existing) {
        return NextResponse.json(
          {
            message: 'You are already registered for this event',
            messageAr: 'أنت مسجل بالفعل في هذه الفعالية',
          },
          { status: 409 }
        );
      }

      if (typeof event.maxAttendees === 'number' && event.currentAttendees >= event.maxAttendees) {
        return NextResponse.json(
          {
            message: 'This event is full',
            messageAr: 'هذه الفعالية ممتلئة',
          },
          { status: 409 }
        );
      }

      const registration = body.registration || {};
      await db.alumniEventRegistration.create({
        data: {
          tenantId: user.tenantId,
          eventId,
          employeeId,
          attendeeName: registration.alumniName || null,
          attendeeEmail: registration.alumniEmail || user.email || null,
          registrationStatus: 'confirmed',
          guestCount: registration.guestCount ?? 0,
        },
      });

      const updated = await db.alumniEvent.update({
        where: { id: eventId },
        data: { currentAttendees: { increment: 1 } },
      });

      return NextResponse.json(mapEvent(updated), { status: 201 });
    } catch (error) {
      console.error('Error registering for event:', error);
      return NextResponse.json(
        {
          message: 'Failed to register for event',
          messageAr: 'فشل في التسجيل للفعالية',
        },
        { status: 500 }
      );
    }
  }
);
