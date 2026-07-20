import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { user } = context;
  try {
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const departmentId = searchParams.get('departmentId');
    const locationId = searchParams.get('locationId');

    const where: any = {
      company: { tenantId },
      isDeleted: false,
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (locationId) {
      where.locationId = locationId;
    }

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { employeeCode: { contains: query, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: true,
        location: true,
        jobProfile: true,
        manager: true,
      },
    });

    const formatted = employees.map((emp) => ({
      id: emp.id,
      employeeId: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      phone: '',
      extension: '',
      designation: emp.jobProfile?.title || '',
      department: emp.department?.name || '',
      departmentId: emp.departmentId,
      location: emp.location?.name || '',
      locationId: emp.locationId,
      managerId: emp.managerId || undefined,
      managerName: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : undefined,
      employmentType: 'full_time',
      workLocation: 'office',
      joinDate: emp.joiningDate.toISOString(),
      avatarInitials: `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase(),
      avatarColor: 'bg-indigo-500',
      skills: [],
      directReportsCount: 0,
      isActive: true,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[Directory Employees API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch directory employees',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
