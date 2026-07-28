import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function DELETE(req: Request, { params }: { params: { scheduleId: string } }) {
  try {
    await (db as any).rosterConfig.updateMany({
      where: {
        id: params.scheduleId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete nurse schedule:', error);
    return NextResponse.json({ error: 'Failed to delete nurse schedule' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { scheduleId: string } }) {
  try {
    const body = await req.json();

    // 1. Fetch the existing RosterConfig
    const existingConfig = await (db as any).rosterConfig.findUnique({
      where: { id: params.scheduleId },
    });

    if (!existingConfig) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // 2. Update shifts inside config
    const updatedConfigJson = {
      ...(typeof existingConfig.config === 'object' && existingConfig.config !== null
        ? existingConfig.config
        : {}),
      shifts: body.shifts,
    };

    // 3. Save back to DB
    const updatedConfig = await (db as any).rosterConfig.update({
      where: { id: params.scheduleId },
      data: {
        config: updatedConfigJson,
      },
    });

    const schedule = {
      id: updatedConfig.id,
      scheduleName: updatedConfig.name,
      startDate: updatedConfig.config.startDate,
      endDate: updatedConfig.config.endDate,
      shifts: updatedConfig.config.shifts,
      status: updatedConfig.config.status,
      createdAt: updatedConfig.createdAt,
    };

    return NextResponse.json({ schedule }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to update nurse schedule shifts:', error);
    return NextResponse.json({ error: 'Failed to update nurse schedule shifts' }, { status: 500 });
  }
}
