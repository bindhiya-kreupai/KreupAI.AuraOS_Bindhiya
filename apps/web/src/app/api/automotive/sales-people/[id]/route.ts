import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    const salesPerson = await db.salesPerson.findUnique({
      where: { salesPersonId: params.id },
    });

    if (!salesPerson) {
      return NextResponse.json({ error: 'Sales person not found' }, { status: 404 });
    }

    const [firstName, ...rest] = salesPerson.name.split(' ');
    const mappedSalesPerson = {
      ...salesPerson,
      firstName: firstName || '',
      lastName: rest.join(' ') || '',
      performanceMetrics: salesPerson.performance,
    };

    return NextResponse.json({ salesPerson: mappedSalesPerson });
  } catch (error) {
    console.error('Failed to fetch sales person:', error);
    return NextResponse.json({ error: 'Failed to fetch sales person' }, { status: 500 });
  }
});

export const PUT = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    const body = await request.json();
    const updateData: any = {};

    if (body.firstName !== undefined || body.lastName !== undefined) {
      updateData.name = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    } else if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.email !== undefined) updateData.email = body.email;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.baseSalary !== undefined) updateData.baseSalary = body.baseSalary;
    if (body.commissionRate !== undefined) updateData.commissionRate = body.commissionRate;

    if (body.performanceMetrics !== undefined) {
      updateData.performance = body.performanceMetrics;
    } else if (body.performance !== undefined) {
      updateData.performance = body.performance;
    }

    const salesPerson = await db.salesPerson.update({
      where: { salesPersonId: params.id },
      data: updateData,
    });

    const [firstName, ...rest] = salesPerson.name.split(' ');
    const mappedSalesPerson = {
      ...salesPerson,
      firstName: firstName || '',
      lastName: rest.join(' ') || '',
      performanceMetrics: salesPerson.performance,
    };

    return NextResponse.json({ salesPerson: mappedSalesPerson });
  } catch (error) {
    console.error('Failed to update sales person:', error);
    return NextResponse.json({ error: 'Failed to update sales person' }, { status: 500 });
  }
});

export const DELETE = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    await db.salesPerson.delete({
      where: { salesPersonId: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete sales person:', error);
    return NextResponse.json({ error: 'Failed to delete sales person' }, { status: 500 });
  }
});
