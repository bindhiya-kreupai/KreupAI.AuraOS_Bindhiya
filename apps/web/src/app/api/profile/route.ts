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

    let employeeExtra: Record<string, any> = {};
    if (emp) {
      try {
        const fullEmployee = await prisma.employee.findUnique({
          where: { id: emp.id },
          select: {
            company: { select: { id: true, name: true, code: true } },
            department: { select: { id: true, name: true, code: true } },
            jobProfile: { select: { id: true, title: true } },
            grade: { select: { id: true, name: true, level: true } },
            type: { select: { id: true, name: true, code: true } },
            status: { select: { id: true, name: true, code: true } },
            location: { select: { id: true, name: true } },
          },
        });

        if (fullEmployee) {
          employeeExtra = {
            jobTitle: fullEmployee.jobProfile?.title || '',
            departmentName: fullEmployee.department?.name || '',
            companyName: fullEmployee.company?.name || '',
            typeName: fullEmployee.type?.name || '',
            statusName: fullEmployee.status?.name || '',
            locationName: fullEmployee.location?.name || '',
          };
        }
      } catch (innerError: any) {
        logger.warn('Could not fetch full employee details:', innerError?.message);
      }
    }

    const profile = {
      ...userProfile,
      employee: emp
        ? {
            ...emp,
            ...employeeExtra,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    logger.error('Error fetching profile:', error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch profile',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
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

    if (body.firstName !== undefined || body.lastName !== undefined) {
      await prisma.user.update({
        where: { id: user.userId },
        data: {
          ...(body.firstName !== undefined && { firstName: body.firstName }),
          ...(body.lastName !== undefined && { lastName: body.lastName }),
        },
      });

      if (userWithEmployee?.employee) {
        await prisma.employee.update({
          where: { id: userWithEmployee.employee.id },
          data: {
            ...(body.firstName !== undefined && { firstName: body.firstName }),
            ...(body.lastName !== undefined && { lastName: body.lastName }),
          },
        });
      }
    }

    if (userWithEmployee?.employee) {
      const allowedFields = ['careerInterests'];
      const updateData: Record<string, any> = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }
      if (Object.keys(updateData).length > 0) {
        await prisma.employee.update({
          where: { id: userWithEmployee.employee.id },
          data: updateData,
        });
      }
    }

    try {
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
    } catch {
      // Audit log failure should not block the response
    }

    return NextResponse.json({
      success: true,
      data: { id: userWithEmployee?.employee?.id || user.userId },
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    logger.error('Error updating profile:', error?.message || error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
});
