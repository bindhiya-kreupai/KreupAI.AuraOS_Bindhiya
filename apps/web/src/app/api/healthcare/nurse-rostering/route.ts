import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(req: Request) {
  try {
    const configs = await (db as any).rosterConfig.findMany({
      where: {
        description: 'Nurse Rostering Schedule',
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const schedules = configs.map((c: any) => ({
      id: c.id,
      scheduleName: c.name,
      startDate: c.config?.startDate,
      endDate: c.config?.endDate,
      shifts: c.config?.shifts || [],
      status: c.config?.status || 'Draft',
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ schedules });
  } catch (error: any) {
    console.error('Failed to fetch nurse schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch nurse schedules' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ensure unique name for RosterConfig's unique constraint on [tenantId, name]
    const uniqueName = `${body.scheduleName || 'New Schedule'} - ${Date.now()}`;

    const newConfig = await (db as any).rosterConfig.create({
      data: {
        tenantId: 'default-tenant',
        name: uniqueName,
        description: 'Nurse Rostering Schedule',
        config: {
          startDate: body.startDate || new Date().toISOString(),
          endDate: body.endDate || new Date().toISOString(),
          shifts: body.shifts || [],
          status: body.status || 'Draft',
        },
        isActive: true,
        createdBy: 'System',
        updatedBy: 'System',
      },
    });

    const schedule = {
      id: newConfig.id,
      scheduleName: newConfig.name,
      startDate: newConfig.config.startDate,
      endDate: newConfig.config.endDate,
      shifts: newConfig.config.shifts,
      status: newConfig.config.status,
      createdAt: newConfig.createdAt,
    };

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create nurse schedule:', error);
    return NextResponse.json({ error: 'Failed to create nurse schedule' }, { status: 500 });
  }
}
