import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async () => {
  try {
    const salesPeople = await db.salesPerson.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const mappedSalesPeople = salesPeople.map((sp) => {
      const [firstName, ...rest] = sp.name.split(' ');
      return {
        ...sp,
        firstName: firstName || '',
        lastName: rest.join(' ') || '',
        performanceMetrics: sp.performance,
      };
    });

    return NextResponse.json({ salesPeople: mappedSalesPeople });
  } catch (error) {
    console.error('Failed to fetch sales people:', error);
    return NextResponse.json({ error: 'Failed to fetch sales people' }, { status: 500 });
  }
});

export const POST = createProtectedRoute(async (request: Request) => {
  try {
    const body = await request.json();
    const salesPerson = await db.salesPerson.create({
      data: {
        salesPersonId: body.salesPersonId || `SP-${Date.now()}`,
        name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
        email: body.email || '',
        department: body.department || 'sales',
        baseSalary: body.baseSalary || 0,
        commissionRate: body.commissionRate || 0,
        status: body.status || 'active',
        performance: body.performanceMetrics || body.performance || {},
      },
    });

    const [firstName, ...rest] = salesPerson.name.split(' ');
    const mappedSalesPerson = {
      ...salesPerson,
      firstName: firstName || '',
      lastName: rest.join(' ') || '',
      performanceMetrics: salesPerson.performance,
    };

    return NextResponse.json({ salesPerson: mappedSalesPerson }, { status: 201 });
  } catch (error) {
    console.error('Failed to create sales person:', error);
    return NextResponse.json({ error: 'Failed to create sales person' }, { status: 500 });
  }
});
