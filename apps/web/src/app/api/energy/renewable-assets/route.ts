import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const assets = await db.renewableAsset.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Failed to fetch renewable assets:', error);
    return NextResponse.json({ error: 'Failed to fetch renewable assets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Construct Prisma payload from explicit form fields
    let performanceData: any = { efficiency: body.efficiency || 0 };
    if (body.type === 'Solar') {
      performanceData = {
        generating: `${Math.floor(Math.random() * 20) + 1} MW`,
        rate: `${Math.floor(Math.random() * 30) + 70}%`,
        irradiance: `${Math.floor(Math.random() * 200) + 800} W/m²`,
        efficiency: body.efficiency || 95,
      };
    } else if (body.type === 'Wind') {
      performanceData = {
        generating: `${Math.floor(Math.random() * 10) + 1} MW`,
        msg: 'Optimal wind conditions',
        speed: `${Math.floor(Math.random() * 10) + 5} m/s`,
        turbines: '10/10 Active',
      };
    } else if (body.type === 'Storage') {
      performanceData = {
        level: `${Math.floor(Math.random() * 40) + 60}%`,
        state: 'Discharging',
        efficiency: body.efficiency || 95,
      };
    }

    const asset = await db.renewableAsset.create({
      data: {
        assetId: body.assetId || `ra-${Date.now()}`,
        name: body.name || 'New Asset',
        type: body.type,
        status: body.status || 'Active',
        location: { address: body.location || 'Unknown' },
        capacity: { max: body.maxCapacity || 0 },
        installation: { date: new Date().toISOString() },
        performance: performanceData,
        maintenance: {},
        financials: {},
      },
    });
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Failed to create renewable asset:', error);
    return NextResponse.json({ error: 'Failed to create renewable asset' }, { status: 500 });
  }
}
