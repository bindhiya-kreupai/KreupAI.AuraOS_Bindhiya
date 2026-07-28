import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const leaks = await db.leakDetection.findMany({
      orderBy: { detectedAt: 'desc' },
    });
    return NextResponse.json(leaks);
  } catch (error) {
    console.error('Failed to fetch leaks:', error);
    return NextResponse.json({ error: 'Failed to fetch leaks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const leak = await db.leakDetection.create({
      data: {
        leakId: body.leakId || `leak-${Date.now()}`,
        location: body.location || {},
        severity: body.severity,
        status: body.status || 'detected',
        detectedAt: body.detectedAt ? new Date(body.detectedAt) : new Date(),
        estimatedLoss: body.estimatedLoss || 0,
        repairedAt: body.repairedAt ? new Date(body.repairedAt) : null,
        repairCost: body.repairCost || null,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(leak, { status: 201 });
  } catch (error) {
    console.error('Failed to create leak detection:', error);
    return NextResponse.json({ error: 'Failed to create leak detection' }, { status: 500 });
  }
}
