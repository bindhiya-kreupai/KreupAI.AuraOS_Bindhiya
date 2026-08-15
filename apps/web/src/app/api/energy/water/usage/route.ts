import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const usage = await db.waterUsage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(usage);
  } catch (error) {
    console.error('Failed to fetch water usage:', error);
    return NextResponse.json({ error: 'Failed to fetch water usage' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const usage = await db.waterUsage.create({
      data: {
        usageId: body.usageId || `wu-${Date.now()}`,
        facilityId: body.facilityId,
        period: body.period || {},
        totalUsage: body.totalUsage,
        breakdown: body.breakdown || {},
        departmentUsage: body.departmentUsage || {},
        fixtureUsage: body.fixtureUsage || {},
        comparison: body.comparison || {},
        efficiency: body.efficiency || {},
      },
    });
    return NextResponse.json(usage, { status: 201 });
  } catch (error) {
    console.error('Failed to record water usage:', error);
    return NextResponse.json({ error: 'Failed to record water usage' }, { status: 500 });
  }
}
