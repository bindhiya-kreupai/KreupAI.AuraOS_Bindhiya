// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const updateEmployeeSchema = z.object({
  employeeCode: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  companyId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  jobProfileId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  statusId: z.string().uuid().optional(),
  typeId: z.string().uuid().optional(),
  joiningDate: z.string().or(z.date()).optional(),
  managerId: z.string().uuid().optional().nullable(),
  positionId: z.string().uuid().optional().nullable(),
  addressId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
});

const employeeInclude = {
  company: true,
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
      email: true,
      employeeCode: true,
    },
  },
} as const;

function mapEmployee(employee: any) {
  return {
    ...employee,
    name: `${employee.firstName} ${employee.lastName}`,
    role: employee.jobProfile?.title ?? null,
    dept: employee.department?.name ?? null,
    loc: employee.location?.name ?? null,
    img: `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.firstName + '+' + employee.lastName)}&background=random`,
  };
}

export const GET = withEnhancedAuth(async (
  _request: NextRequest,
  context: any,
  { params }: { params: { employeeId: string } }
) => {
  try {
    const { user } = context;

    const employee = await prisma.employee.findFirst({
      where: {
        id: params.employeeId,
        company: { tenantId: user.tenantId },
      },
      include: employeeInclude,
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ employee: mapEmployee(employee) }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/core-hr/employees/[employeeId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

const updateHandler = withEnhancedAuth(async (
  request: NextRequest,
  context: any,
  { params }: { params: { employeeId: string } }
) => {
  try {
    const { user } = context;
    const body = await request.json();

    const validation = updateEmployeeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: params.employeeId,
        company: { tenantId: user.tenantId },
      },
      select: { id: true },
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const data = validation.data;

    const employee = await prisma.employee.update({
      where: { id: params.employeeId },
      data: {
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        companyId: data.companyId,
        departmentId: data.departmentId,
        locationId: data.locationId,
        jobProfileId: data.jobProfileId,
        gradeId: data.gradeId,
        statusId: data.statusId,
        typeId: data.typeId,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
        managerId: data.managerId ?? undefined,
        positionId: data.positionId ?? undefined,
        addressId: data.addressId ?? undefined,
        userId: data.userId ?? undefined,
      },
      include: employeeInclude,
    });

    return NextResponse.json({ employee: mapEmployee(employee) }, { status: 200 });
  } catch (error: any) {
    console.error('PUT/PATCH /api/core-hr/employees/[employeeId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = updateHandler;
export const PATCH = updateHandler;