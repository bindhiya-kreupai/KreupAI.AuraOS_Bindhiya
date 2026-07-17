import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const advisorId = searchParams.get('advisorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (advisorId) where.advisorId = advisorId;
    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    const sales = await db.serviceSale.findMany({
      where,
      orderBy: { saleDate: 'desc' },
    });

    return NextResponse.json({ sales });
  } catch (error) {
    console.error('Failed to fetch service sales:', error);
    return NextResponse.json({ error: 'Failed to fetch service sales' }, { status: 500 });
  }
});

export const POST = createProtectedRoute(async (request: Request) => {
  try {
    const body = await request.json();
    const sale = await db.serviceSale.create({
      data: {
        saleId: body.saleId || `ssale-${Date.now()}`,
        advisorId: body.advisorId,
        technicianId: body.technicianId,
        repairOrderId: body.repairOrderId,
        serviceType: body.serviceType,
        laborAmount: body.laborAmount,
        partsAmount: body.partsAmount,
        totalAmount: body.totalAmount || body.laborAmount + body.partsAmount,
        saleDate: body.saleDate ? new Date(body.saleDate) : new Date(),
        status: body.status || 'completed',
      },
    });
    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    console.error('Failed to create service sale:', error);
    return NextResponse.json({ error: 'Failed to create service sale' }, { status: 500 });
  }
});
