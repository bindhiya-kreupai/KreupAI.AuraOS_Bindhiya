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
      },
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!employee) {
      const profile = {
        id: dbUser?.id || user.userId,
        employeeId: '',
        firstName: dbUser?.firstName || '',
        lastName: dbUser?.lastName || '',
        middleName: '',
        preferredName: '',
        email: dbUser?.email || user.email,
        personalEmail: dbUser?.email || user.email,
        jobTitle: '',
        department: '',
        location: '',
        employmentType: 'full_time',
        hireDate: '',
        status: 'active',
        reportsTo: '',
        profilePhoto: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        maritalStatus: '',
        mobilePhone: '',
        workPhone: '',
        careerInterests: null,
        skills: [],
        certifications: [],
      };

      return NextResponse.json({ success: true, data: profile }, { status: 200 });
    }

    const profile = {
      id: employee.id,
      employeeId: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: '',
      preferredName: '',
      email: employee.email,
      personalEmail: dbUser?.email || employee.email,
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

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (employee) {
      const employeeUpdateData: Record<string, any> = {};
      if (body.firstName !== undefined) employeeUpdateData.firstName = body.firstName;
      if (body.lastName !== undefined) employeeUpdateData.lastName = body.lastName;
      if (body.careerInterests !== undefined)
        employeeUpdateData.careerInterests = body.careerInterests;

      await prisma.employee.update({
        where: { id: employee.id },
        data: employeeUpdateData,
      });
    }

    if (dbUser && (body.firstName !== undefined || body.lastName !== undefined)) {
      await prisma.user.update({
        where: { id: user.userId },
        data: {
          ...(body.firstName !== undefined && { firstName: body.firstName }),
          ...(body.lastName !== undefined && { lastName: body.lastName }),
        },
      });
    }

    return NextResponse.json(
      { success: true, data: { id: employee?.id || dbUser?.id } },
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
