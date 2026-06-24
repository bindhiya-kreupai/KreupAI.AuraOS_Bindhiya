import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { user } = context;
  try {
    const tenantId = user.tenantId;

    const departments = await prisma.department.findMany({
      where: {
        company: { tenantId },
        isDeleted: false,
      },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    const formatted = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      headId: undefined,
      headName: undefined,
      employeeCount: dept._count.employees,
      parentDepartmentId: dept.parentId || undefined,
      description: '',
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[Directory Departments API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch directory departments' }, { status: 500 });
  }
});
