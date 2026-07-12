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
    const asset = await db.renewableAsset.create({
      data: {
        assetId: body.assetId || `asset-${Date.now()}`,
        name: body.name,
        type: body.type,
        status: body.status || 'active',
        location: body.location || {},
        capacity: body.capacity || {},
        installation: body.installation || {},
        performance: body.performance || {},
        maintenance: body.maintenance || {},
        financials: body.financials || {},
      },
    });
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Failed to create renewable asset:', error);
    return NextResponse.json({ error: 'Failed to create renewable asset' }, { status: 500 });
  }
}
