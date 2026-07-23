import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function DELETE(req: Request, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = params;

    // Using deleteMany for safe deletion
    await (db as any).housekeepingTask.deleteMany({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete housekeeping task:', error);
    return NextResponse.json({ error: 'Failed to delete housekeeping task' }, { status: 500 });
  }
}
