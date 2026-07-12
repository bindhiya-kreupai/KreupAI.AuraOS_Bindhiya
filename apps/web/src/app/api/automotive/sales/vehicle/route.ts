import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const salesPersonId = searchParams.get('salesPersonId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (salesPersonId) where.salesPersonId = salesPersonId;
    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    const sales = await db.vehicleSale.findMany({
      where,
      orderBy: { saleDate: 'desc' },
    });

    return NextResponse.json({ sales });
  } catch (error) {
    console.error('Failed to fetch vehicle sales:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sale = await db.vehicleSale.create({
      data: {
        saleId: body.saleId || `vsale-${Date.now()}`,
        salesPersonId: body.salesPersonId,
        vin: body.vin,
        make: body.make,
        model: body.model,
        year: body.year,
        salePrice: body.salePrice,
        costPrice: body.costPrice,
        grossProfit: body.grossProfit || body.salePrice - body.costPrice,
        saleDate: body.saleDate ? new Date(body.saleDate) : new Date(),
        customerName: body.customerName,
        status: body.status || 'completed',
        commissionAmount: body.commissionAmount || null,
      },
    });
    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    console.error('Failed to create vehicle sale:', error);
    return NextResponse.json({ error: 'Failed to create vehicle sale' }, { status: 500 });
  }
}
