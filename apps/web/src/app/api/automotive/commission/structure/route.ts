import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async () => {
  try {
    const structures = await db.commissionStructure.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // The frontend typically just needs the active structure
    const activeStructure = structures.find((s) => s.status === 'active') || structures[0];

    return NextResponse.json({ structure: activeStructure });
  } catch (error) {
    console.error('Failed to fetch commission structure:', error);
    return NextResponse.json({ error: 'Failed to fetch commission structure' }, { status: 500 });
  }
});
