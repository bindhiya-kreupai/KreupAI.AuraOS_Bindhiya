import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const createEventSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  eventType: z.enum([
    'MARRIAGE',
    'DIVORCE',
    'BIRTH',
    'ADOPTION',
    'DEATH',
    'EMPLOYMENT_CHANGE',
    'LOSS_OF_COVERAGE',
    'RELOCATION',
    'OTHER',
  ]),
  eventDate: z.string().datetime(),
  description: z.string().min(1, 'Description is required'),
  supportingDocuments: z.any().optional(),
  enrollmentDeadline: z.string().datetime().optional(),
});

// action: approve | reject | message
const updateEventSchema = z.object({
  id: z.string().min(1, 'Event ID is required'),
  action: z.enum(['approve', 'reject', 'message']),
  notes: z.string().optional(),
});

// ===== GET Handler =====
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const where: any = {
      tenantId: user.tenantId,
      isDeleted: false,
    };

    const employeeId = searchParams.get('employeeId');
    if (employeeId) {
      where.employeeId = employeeId;
    }

    const eventType = searchParams.get('eventType') || searchParams.get('type');
    if (eventType) {
      where.eventType = eventType;
    }

    const events = await prisma.qualifyingEvent.findMany({
      where,
      orderBy: { reportedDate: 'desc' },
    });

    // Derive a status the UI understands from persisted fields.
    const data = events.map((e) => ({
      ...e,
      status: e.verifiedDate ? (e.isActive ? 'APPROVED' : 'REJECTED') : 'PENDING',
    }));

    return NextResponse.json({ success: true, data, total: data.length }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching qualifying events:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch qualifying events',
        messageAr: 'فشل في جلب الأحداث المؤهلة',
      },
      { status: 500 }
    );
  }
});

// ===== POST Handler =====
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    const data = createEventSchema.parse(body);

    const event = await prisma.qualifyingEvent.create({
      data: {
        tenantId: user.tenantId,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        eventType: data.eventType,
        eventDate: new Date(data.eventDate),
        description: data.description,
        supportingDocuments: data.supportingDocuments as any,
        enrollmentDeadline: data.enrollmentDeadline ? new Date(data.enrollmentDeadline) : null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          messageAr: 'خطأ في التحقق من صحة البيانات',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    console.error('Error creating qualifying event:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create qualifying event',
        messageAr: 'فشل في إنشاء الحدث المؤهل',
      },
      { status: 500 }
    );
  }
});

// ===== PUT Handler (approve / reject / message) =====
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, action, notes } = updateEventSchema.parse(body);

    const existing = await prisma.qualifyingEvent.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Qualifying event not found',
          messageAr: 'لم يتم العثور على الحدث المؤهل',
        },
        { status: 404 }
      );
    }

    const dataToUpdate: any = { updatedBy: user.userId };

    if (action === 'approve') {
      dataToUpdate.verifiedBy = user.userId;
      dataToUpdate.verifiedDate = new Date();
      dataToUpdate.isActive = true;
      dataToUpdate.allowsEnrollment = true;
    } else if (action === 'reject') {
      dataToUpdate.verifiedBy = user.userId;
      dataToUpdate.verifiedDate = new Date();
      dataToUpdate.isActive = false;
      dataToUpdate.allowsEnrollment = false;
    }

    if (notes !== undefined) {
      dataToUpdate.notes = notes;
    }

    const event = await prisma.qualifyingEvent.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: event }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          messageAr: 'خطأ في التحقق من صحة البيانات',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    console.error('Error updating qualifying event:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update qualifying event',
        messageAr: 'فشل في تحديث الحدث المؤهل',
      },
      { status: 500 }
    );
  }
});
