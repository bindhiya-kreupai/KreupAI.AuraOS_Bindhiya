import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

// Validation schema for creating an employee
const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  companyId: z.string().uuid('Valid company ID is required'),
  departmentId: z.string().uuid('Valid department ID is required'),
  locationId: z.string().uuid('Valid location ID is required'),
  jobProfileId: z.string().uuid('Valid job profile ID is required'),
  gradeId: z.string().uuid('Valid grade ID is required'),
  statusId: z.string().uuid('Valid status ID is required'),
  typeId: z.string().uuid('Valid type ID is required'),
  joiningDate: z.string().or(z.date()),
  managerId: z.string().uuid().optional().nullable(),
  positionId: z.string().uuid().optional().nullable(),
  addressId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
});

// Validation schema for updating an employee
const updateEmployeeSchema = z.object({
  id: z.string().uuid('Valid employee ID is required'),
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

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || searchParams.get('query') || '';
    const departmentId = searchParams.get('departmentId');
    const statusId = searchParams.get('statusId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search filter across firstName, lastName, email, employeeCode
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (statusId) {
      where.statusId = statusId;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    // Map results to include convenience fields the frontend expects
    const mappedEmployees = employees.map((emp) => ({
      ...emp,
      name: `${emp.firstName} ${emp.lastName}`,
      role: emp.jobProfile?.title ?? null,
      dept: emp.department?.name ?? null,
      loc: emp.location?.name ?? null,
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.firstName + '+' + emp.lastName)}&background=random`,
    }));

    return NextResponse.json(
      {
        employees: mappedEmployees,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/core-hr/employees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate input
    const validation = createEmployeeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check for duplicate email
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: data.email },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'An employee with this email already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate employeeCode
    const existingCode = await prisma.employee.findUnique({
      where: { employeeCode: data.employeeCode },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'An employee with this employee code already exists' },
        { status: 409 }
      );
    }

    const employee = await prisma.employee.create({
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
        joiningDate: new Date(data.joiningDate),
        managerId: data.managerId ?? undefined,
        positionId: data.positionId ?? undefined,
        addressId: data.addressId ?? undefined,
        userId: data.userId ?? undefined,
      },
      include: {
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
      },
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/core-hr/employees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate input
    const validation = updateEmployeeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data;

    // Check employee exists
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== existing.email) {
      const emailTaken = await prisma.employee.findUnique({
        where: { email: updateData.email },
      });
      if (emailTaken) {
        return NextResponse.json(
          { error: 'An employee with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Convert joiningDate if present
    const dataToUpdate: any = { ...updateData };
    if (dataToUpdate.joiningDate) {
      dataToUpdate.joiningDate = new Date(dataToUpdate.joiningDate);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: dataToUpdate,
      include: {
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
      },
    });

    return NextResponse.json({ employee }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/core-hr/employees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
