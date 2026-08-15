/**
 * DEV-ONLY: Unprotected employee delete endpoint for local development.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return NextResponse.json(
        { success: false, error: { message: 'Employee not found' } },
        { status: 404 }
      );
    }

    await prisma.employee.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    console.error('[DEV] DELETE /api/dev/employees/[id] error:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { message: 'Employee not found' } },
        { status: 404 }
      );
    }

    const isUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Build update data - only include fields that were provided
    const updateData: any = {};
    if (body.firstName) updateData.firstName = body.firstName;
    if (body.lastName) updateData.lastName = body.lastName;
    if (body.email) updateData.email = body.email;
    if (body.joiningDate) updateData.joiningDate = new Date(body.joiningDate);

    if (body.companyId) {
      if (isUUID(body.companyId)) {
        updateData.companyId = body.companyId;
      } else {
        const matched = await prisma.company.findFirst({
          where: { name: { equals: body.companyId, mode: 'insensitive' } },
        });
        if (matched) updateData.companyId = matched.id;
      }
    }

    if (body.departmentId) {
      if (isUUID(body.departmentId)) {
        updateData.departmentId = body.departmentId;
      } else {
        const matched = await prisma.department.findFirst({
          where: { name: { equals: body.departmentId, mode: 'insensitive' } },
        });
        if (matched) updateData.departmentId = matched.id;
      }
    }

    if (body.locationId) {
      if (isUUID(body.locationId)) {
        updateData.locationId = body.locationId;
      } else {
        const matched = await prisma.location.findFirst({
          where: { name: { equals: body.locationId, mode: 'insensitive' } },
        });
        if (matched) updateData.locationId = matched.id;
      }
    }

    if (body.jobProfileId) {
      if (isUUID(body.jobProfileId)) {
        updateData.jobProfileId = body.jobProfileId;
      } else {
        const matched = await prisma.jobProfile.findFirst({
          where: { title: { equals: body.jobProfileId, mode: 'insensitive' } },
        });
        if (matched) updateData.jobProfileId = matched.id;
      }
    }

    if (body.gradeId) {
      if (isUUID(body.gradeId)) {
        updateData.gradeId = body.gradeId;
      } else {
        const matched = await prisma.grade.findFirst({
          where: { name: { equals: body.gradeId, mode: 'insensitive' } },
        });
        if (matched) updateData.gradeId = matched.id;
      }
    }

    if (body.statusId) {
      if (isUUID(body.statusId)) {
        updateData.statusId = body.statusId;
      } else {
        const matched = await prisma.employeeStatus.findFirst({
          where: { name: { equals: body.statusId, mode: 'insensitive' } },
        });
        if (matched) updateData.statusId = matched.id;
      }
    }

    if (body.typeId) {
      if (isUUID(body.typeId)) {
        updateData.typeId = body.typeId;
      } else {
        const matched = await prisma.employmentType.findFirst({
          where: { name: { equals: body.typeId, mode: 'insensitive' } },
        });
        if (matched) updateData.typeId = matched.id;
      }
    }

    if (body.managerId !== undefined) {
      const mgrInput = body.managerId;
      if (!mgrInput) {
        updateData.managerId = null;
      } else if (isUUID(mgrInput)) {
        updateData.managerId = mgrInput;
      } else {
        const matched = await prisma.employee.findFirst({
          where: {
            OR: [
              { firstName: { contains: mgrInput, mode: 'insensitive' } },
              { lastName: { contains: mgrInput, mode: 'insensitive' } },
            ],
          },
        });
        if (matched) updateData.managerId = matched.id;
      }
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    console.error('[DEV] PUT /api/dev/employees/[id] error:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}
