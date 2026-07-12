import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch current user profile
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        status: true,
        tenantId: true,
        mfaEnabled: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        firstName: true,
        lastName: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            joiningDate: true,
            careerInterests: true,
            company: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            jobProfile: {
              select: {
                id: true,
                title: true,
              },
            },
            grade: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
            type: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            status: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            location: {
              select: {
                id: true,
                name: true,
              },
            },
            address: {
              select: {
                id: true,
                street: true,
                city: true,
                state: true,
                country: true,
                zipCode: true,
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const emp = userProfile.employee;

    const profile = {
      ...userProfile,
      employee: emp
        ? {
            ...emp,
            jobTitle: emp.jobProfile?.title || '',
            departmentName: emp.department?.name || '',
            companyName: emp.company?.name || '',
            typeName: emp.type?.name || '',
            statusName: emp.status?.name || '',
            locationName: emp.location?.name || '',
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    logger.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
});

// PUT - Update current user profile
export const PUT = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();

    const userWithEmployee = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        employee: {
          select: { id: true },
        },
      },
    });

    if (!userWithEmployee?.employee) {
      return NextResponse.json(
        { success: false, error: 'Employee profile not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['careerInterests'];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.firstName !== undefined || body.lastName !== undefined) {
      await prisma.user.update({
        where: { id: user.userId },
        data: {
          ...(body.firstName !== undefined && { firstName: body.firstName }),
          ...(body.lastName !== undefined && { lastName: body.lastName }),
        },
      });

      await prisma.employee.update({
        where: { id: userWithEmployee.employee.id },
        data: {
          ...(body.firstName !== undefined && { firstName: body.firstName }),
          ...(body.lastName !== undefined && { lastName: body.lastName }),
        },
      });
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.employee.update({
        where: { id: userWithEmployee.employee.id },
        data: updateData,
      });
    }

    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'UPDATE',
        resourceType: 'Profile',
        metadata: { description: 'Updated profile information' } as any,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: userWithEmployee.employee.id },
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    logger.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
});
