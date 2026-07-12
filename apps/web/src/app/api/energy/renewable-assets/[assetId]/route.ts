import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { assetId: string } }) {
  try {
    const asset = await db.renewableAsset.findUnique({
      where: { assetId: params.assetId },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Failed to fetch asset:', error);
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { assetId: string } }) {
  try {
    const body = await request.json();
    const asset = await db.renewableAsset.update({
      where: { assetId: params.assetId },
      data: body,
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Failed to update asset:', error);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}
