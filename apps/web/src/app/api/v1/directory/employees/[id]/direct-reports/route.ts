import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request: NextRequest, { user, params }: any) => {
  try {
    const tenantId = user.tenantId;
    const { id } = params; // managerId

    const employees = await prisma.employee.findMany({
      where: {
        managerId: id,
        company: { tenantId },
        isDeleted: false,
      },
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
    console.error('[Directory Direct Reports API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch direct reports' }, { status: 500 });
  }
});
