import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const createWindowSchema = z.object({
  windowName: z.string().min(1, 'Window name is required'),
  windowType: z.string().min(1, 'Window type is required'),
  planYear: z.number().int(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  description: z.string().optional(),
  eligibleCategories: z.any().optional(),
  instructions: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateWindowSchema = createWindowSchema.partial().extend({
  id: z.string().min(1, 'Window ID is required'),
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

    const windowType = searchParams.get('type') || searchParams.get('windowType');
    if (windowType) {
      where.windowType = windowType;
    }

    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const planYear = searchParams.get('planYear');
    if (planYear) {
      where.planYear = parseInt(planYear);
    }

    const windows = await prisma.enrollmentWindow.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(
      { success: true, data: windows, total: windows.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching enrollment windows:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch enrollment windows',
        messageAr: 'فشل في جلب نوافذ التسجيل',
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
    const data = createWindowSchema.parse(body);

    if (new Date(data.endDate) < new Date(data.startDate)) {
      return NextResponse.json(
        {
          success: false,
          message: 'End date must be after start date',
          messageAr: 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء',
        },
        { status: 400 }
      );
    }

    const window = await prisma.enrollmentWindow.create({
      data: {
        tenantId: user.tenantId,
        windowName: data.windowName,
        windowType: data.windowType,
        planYear: data.planYear,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description,
        eligibleCategories: data.eligibleCategories as any,
        instructions: data.instructions,
        isActive: data.isActive ?? true,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: window }, { status: 201 });
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
    console.error('Error creating enrollment window:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create enrollment window',
        messageAr: 'فشل في إنشاء نافذة التسجيل',
      },
      { status: 500 }
    );
  }
});

// ===== PUT Handler =====
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    const data = updateWindowSchema.parse(body);
    const { id, ...updates } = data;

    const existing = await prisma.enrollmentWindow.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Enrollment window not found',
          messageAr: 'لم يتم العثور على نافذة التسجيل',
        },
        { status: 404 }
      );
    }

    const dataToUpdate: any = { updatedBy: user.userId };
    if (updates.windowName !== undefined) dataToUpdate.windowName = updates.windowName;
    if (updates.windowType !== undefined) dataToUpdate.windowType = updates.windowType;
    if (updates.planYear !== undefined) dataToUpdate.planYear = updates.planYear;
    if (updates.startDate !== undefined) dataToUpdate.startDate = new Date(updates.startDate);
    if (updates.endDate !== undefined) dataToUpdate.endDate = new Date(updates.endDate);
    if (updates.description !== undefined) dataToUpdate.description = updates.description;
    if (updates.eligibleCategories !== undefined)
      dataToUpdate.eligibleCategories = updates.eligibleCategories as any;
    if (updates.instructions !== undefined) dataToUpdate.instructions = updates.instructions;
    if (updates.isActive !== undefined) dataToUpdate.isActive = updates.isActive;

    const window = await prisma.enrollmentWindow.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: window }, { status: 200 });
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
    console.error('Error updating enrollment window:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update enrollment window',
        messageAr: 'فشل في تحديث نافذة التسجيل',
      },
      { status: 500 }
    );
  }
});

// ===== DELETE Handler =====
export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Window ID is required',
          messageAr: 'معرف النافذة مطلوب',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.enrollmentWindow.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Enrollment window not found',
          messageAr: 'لم يتم العثور على نافذة التسجيل',
        },
        { status: 404 }
      );
    }

    const window = await prisma.enrollmentWindow.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isActive: false },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Enrollment window removed successfully',
        messageAr: 'تمت إزالة نافذة التسجيل بنجاح',
        data: window,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting enrollment window:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete enrollment window',
        messageAr: 'فشل في حذف نافذة التسجيل',
      },
      { status: 500 }
    );
  }
});
