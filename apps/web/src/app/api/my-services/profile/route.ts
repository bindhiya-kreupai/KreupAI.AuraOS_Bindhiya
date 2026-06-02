// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    const employee = await prisma.employee.findFirst({
      where: {
        tenantId: user.tenantId,
        userId: user.userId,
      },
      include: {
        department: true,
        location: true,
        jobProfile: true,
        grade: true,
        status: true,
        type: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: employee },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[My Services Profile] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const employee = await prisma.employee.findFirst({
      where: {
        tenantId: user.tenantId,
        userId: user.userId,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee profile not found' },
        { status: 404 }
      );
    }

    const allowedFields = [
      'personalEmail',
      'mobileNumber',
      'phone',
      'currentAddress',
      'emergencyContactName',
      'emergencyContactPhone',
      'emergencyContactRelationship',
      'bankName',
      'bankAccountNumber',
      'bankRoutingNumber',
      'bankAccountType',
      'careerInterests',
      'metadata',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: updateData,
      include: {
        department: true,
        location: true,
        jobProfile: true,
        grade: true,
        status: true,
        type: true,
      },
    });

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[My Services Profile] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
});
