import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { user } = context;
  try {
    const tenantId = user.tenantId;

    const employees = await prisma.employee.findMany({
      where: {
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
      directReportsCount: employees.filter((e) => e.managerId === emp.id).length,
      isActive: true,
    });

    // Build the hierarchy tree
    const buildTree = (emp: any, level = 0): any => {
      const reports = employees.filter((e) => e.managerId === emp.id);
      return {
        employee: formatEmp(emp),
        children: reports.map((r) => buildTree(r, level + 1)),
        level,
        isExpanded: true,
      };
    };

    // Root nodes: employees who don't have a manager, or whose manager doesn't exist in the list
    const rootEmployees = employees.filter(
      (e) => !e.managerId || !employees.some((parent) => parent.id === e.managerId)
    );

    if (rootEmployees.length === 0 && employees.length > 0) {
      // Fallback: use first employee as root
      const root = buildTree(employees[0]);
      return NextResponse.json(root);
    }

    if (rootEmployees.length > 0) {
      const root = buildTree(rootEmployees[0]);
      return NextResponse.json(root);
    }

    return NextResponse.json(null);
  } catch (error: any) {
    console.error('[Directory Org Chart API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch org chart' }, { status: 500 });
  }
});
