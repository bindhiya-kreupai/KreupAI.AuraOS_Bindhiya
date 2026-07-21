import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request: NextRequest, { user, params }: any) => {
  try {
    const tenantId = user.tenantId;
    const { id } = params;

    const chain: any[] = [];
    let currentId = id;

    const formatEmp = (emp: any) => ({
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
    });

    // Loop to traverse manager hierarchy upwards
    while (currentId) {
      const emp = await prisma.employee.findFirst({
        where: { id: currentId, company: { tenantId }, isDeleted: false },
        include: { department: true, location: true, jobProfile: true, manager: true },
      });

      if (!emp) break;
      chain.push(formatEmp(emp));
      currentId = emp.managerId || '';
    }

    return NextResponse.json(chain);
  } catch (error: any) {
    console.error('[Directory Reporting Chain API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reporting chain' }, { status: 500 });
  }
});
