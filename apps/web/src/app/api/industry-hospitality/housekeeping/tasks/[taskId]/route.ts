import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.scheduledTime) updateData.scheduledTime = new Date(updateData.scheduledTime);
    if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
    if (updateData.completionTime) updateData.completionTime = new Date(updateData.completionTime);

    const task = await db.housekeepingTask.update({
      where: { taskId: params.taskId },
      data: updateData,
    });
    return NextResponse.json({ task });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
