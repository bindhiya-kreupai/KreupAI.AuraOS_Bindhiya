/**
 * DEV-ONLY: Unprotected employee CRUD endpoints for local development.
 * These bypass authentication so the UI can be used without a login session.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
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

    return NextResponse.json({
      success: true,
      data: employees,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error: any) {
    console.error('[DEV] GET /api/dev/employees error:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Auto-resolve or create related entities from text names or UUIDs
    // 1. Company
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { code: 'DEFAULT', name: 'Default Company', tenantId: 'dev-tenant' },
      });
    }

    const isUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // 2. Department
    const deptInput = body.departmentId || 'General';
    let department = null;
    if (isUUID(deptInput)) {
      department = await prisma.department.findUnique({ where: { id: deptInput } });
    }
    if (!department) {
      department = await prisma.department.findFirst({
        where: { name: { equals: deptInput, mode: 'insensitive' }, companyId: company.id },
      });
    }
    if (!department) {
      department = await prisma.department.create({
        data: {
          code: deptInput.toUpperCase().replace(/\s+/g, '_').substring(0, 10),
          name: deptInput,
          companyId: company.id,
        },
      });
    }

    // 3. Location
    const locInput = body.locationId || 'Main Office';
    let location = null;
    if (isUUID(locInput)) {
      location = await prisma.location.findUnique({ where: { id: locInput } });
    }
    if (!location) {
      location = await prisma.location.findFirst({
        where: { name: { equals: locInput, mode: 'insensitive' }, companyId: company.id },
      });
    }
    if (!location) {
      let country = await prisma.country.findFirst();
      if (!country) {
        country = await prisma.country.create({
          data: { isoCode: 'US', name: 'United States', currency: 'USD' },
        });
      }
      let state = await prisma.state.findFirst({ where: { countryId: country.id } });
      if (!state) {
        state = await prisma.state.create({
          data: { countryId: country.id, code: 'DEF', name: 'Default State' },
        });
      }
      let city = await prisma.city.findFirst({ where: { stateId: state.id } });
      if (!city) {
        city = await prisma.city.create({ data: { stateId: state.id, name: 'Default City' } });
      }
      const address = await prisma.address.create({
        data: {
          line1: '123 Main St',
          postalCode: '12345',
          cityId: city.id,
          stateId: state.id,
          countryId: country.id,
        },
      });
      location = await prisma.location.create({
        data: {
          code: locInput.toUpperCase().replace(/\s+/g, '_').substring(0, 10),
          name: locInput,
          type: 'HEADQUARTERS',
          companyId: company.id,
          addressId: address.id,
        },
      });
    }

    // 4. Job Profile
    const jpInput = body.jobProfileId || 'Staff Member';
    let jobProfile = null;
    if (isUUID(jpInput)) {
      jobProfile = await prisma.jobProfile.findUnique({ where: { id: jpInput } });
    }
    if (!jobProfile) {
      jobProfile = await prisma.jobProfile.findFirst({
        where: { title: { equals: jpInput, mode: 'insensitive' } },
      });
    }
    if (!jobProfile) {
      let jobFamily = await prisma.jobFamily.findFirst();
      if (!jobFamily) {
        let jobFunction = await prisma.jobFunction.findFirst();
        if (!jobFunction) {
          jobFunction = await prisma.jobFunction.create({ data: { code: 'GEN', name: 'General' } });
        }
        jobFamily = await prisma.jobFamily.create({
          data: { code: 'GEN_FAM', name: 'General Family', functionId: jobFunction.id },
        });
      }
      jobProfile = await prisma.jobProfile.create({
        data: {
          code: jpInput.toUpperCase().replace(/\s+/g, '_').substring(0, 10),
          title: jpInput,
          familyId: jobFamily.id,
        },
      });
    }

    // 5. Grade
    const gradeInput = body.gradeId || 'Associate';
    let grade = null;
    if (isUUID(gradeInput)) {
      grade = await prisma.grade.findUnique({ where: { id: gradeInput } });
    }
    if (!grade) {
      grade = await prisma.grade.findFirst({
        where: { name: { equals: gradeInput, mode: 'insensitive' } },
      });
    }
    if (!grade) {
      grade = await prisma.grade.create({
        data: {
          code: gradeInput.toUpperCase().replace(/\s+/g, '_').substring(0, 10),
          name: gradeInput,
          level: 3,
        },
      });
    }

    // 6. Status
    const statusInput = body.statusId || 'Active';
    let empStatus = null;
    if (isUUID(statusInput)) {
      empStatus = await prisma.employeeStatus.findUnique({ where: { id: statusInput } });
    }
    if (!empStatus) {
      empStatus = await prisma.employeeStatus.findFirst({
        where: { name: { equals: statusInput, mode: 'insensitive' } },
      });
    }
    if (!empStatus) {
      empStatus = await prisma.employeeStatus.create({
        data: {
          code: statusInput.toUpperCase().replace(/\s+/g, '_').substring(0, 10),
          name: statusInput,
        },
      });
    }

    // 7. Employment Type
    const typeInput = body.typeId || 'Full Time';
    let empType = null;
    if (isUUID(typeInput)) {
      empType = await prisma.employmentType.findUnique({ where: { id: typeInput } });
    }
    if (!empType) {
      empType = await prisma.employmentType.findFirst({
        where: { name: { equals: typeInput, mode: 'insensitive' } },
      });
    }
    if (!empType) {
      empType = await prisma.employmentType.create({
        data: {
          code: typeInput.toUpperCase().replace(/\s+/g, '_').substring(0, 10),
          name: typeInput,
        },
      });
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        employeeCode: body.employeeCode,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        companyId: company.id,
        departmentId: department.id,
        locationId: location.id,
        jobProfileId: jobProfile.id,
        gradeId: grade.id,
        statusId: empStatus.id,
        typeId: empType.id,
        joiningDate: new Date(body.joiningDate || new Date()),
      },
      include: {
        company: true,
        department: true,
        location: true,
        jobProfile: true,
        grade: true,
        status: true,
        type: true,
      },
    });

    return NextResponse.json({ success: true, data: employee }, { status: 201 });
  } catch (error: any) {
    console.error('[DEV] POST /api/dev/employees error:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}
