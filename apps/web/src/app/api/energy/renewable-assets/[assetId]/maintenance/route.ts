import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function POST(request: Request, { params }: { params: { assetId: string } }) {
  try {
    const body = await request.json();

    const asset = await db.renewableAsset.findUnique({ where: { assetId: params.assetId } });
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

    // In a real implementation, you would update the maintenance JSON array.
    // Assuming maintenance is an object with a "records" array for simplicity.
    const maintenanceData = (asset.maintenance as any) || { records: [] };
    const currentRecords = Array.isArray(maintenanceData.records) ? maintenanceData.records : [];

    const updatedMaintenance = {
      ...maintenanceData,
      records: [...currentRecords, { ...body, timestamp: new Date().toISOString() }],
    };

    const updatedAsset = await db.renewableAsset.update({
      where: { assetId: params.assetId },
      data: { maintenance: updatedMaintenance },
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Failed to add maintenance record:', error);
    return NextResponse.json({ error: 'Failed to add maintenance record' }, { status: 500 });
  }
}
