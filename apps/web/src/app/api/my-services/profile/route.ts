import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    const employee = await prisma.employee.findFirst({
      where: {
        userId: user.userId,
        isDeleted: false,
      },
      include: {
        department: true,
        location: true,
        jobProfile: true,
        grade: true,
        status: true,
        type: true,
        address: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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

    const profile = {
      id: employee.id,
      employeeId: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: '',
      preferredName: '',
      email: employee.email,
      personalEmail: employee.user?.email || employee.email,
      jobTitle: employee.jobProfile?.title || '',
      department: employee.department?.name || '',
      location: employee.location?.name || '',
      employmentType: employee.type?.code?.toLowerCase() || 'full_time',
      hireDate: employee.joiningDate?.toISOString() || '',
      status: employee.status?.code?.toLowerCase() || 'active',
      reportsTo: employee.managerId || '',
      profilePhoto: '',
      address: employee.address?.street || '',
      city: employee.address?.city || '',
      state: employee.address?.state || '',
      country: employee.address?.country || '',
      postalCode: employee.address?.zipCode || '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      maritalStatus: '',
      mobilePhone: '',
      workPhone: '',
      careerInterests: employee.careerInterests,
      skills: [],
      certifications: [],
    };

    return NextResponse.json({ success: true, data: profile }, { status: 200 });
  } catch (error: any) {
    console.error('[My Services Profile] GET Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const employee = await prisma.employee.findFirst({
      where: {
        userId: user.userId,
        isDeleted: false,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee profile not found' },
        { status: 404 }
      );
    }

    const employeeUpdateData: Record<string, any> = {};
    if (body.firstName !== undefined) employeeUpdateData.firstName = body.firstName;
    if (body.lastName !== undefined) employeeUpdateData.lastName = body.lastName;
    if (body.careerInterests !== undefined)
      employeeUpdateData.careerInterests = body.careerInterests;

    const updatedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: employeeUpdateData,
    });

    if (employee.userId && (body.firstName !== undefined || body.lastName !== undefined)) {
      await prisma.user.update({
        where: { id: employee.userId },
        data: {
          ...(body.firstName !== undefined && { firstName: body.firstName }),
          ...(body.lastName !== undefined && { lastName: body.lastName }),
        },
      });
    }

    return NextResponse.json({ success: true, data: updatedEmployee }, { status: 200 });
  } catch (error: any) {
    console.error('[My Services Profile] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
});
