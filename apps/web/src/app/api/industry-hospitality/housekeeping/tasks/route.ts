import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const tasks = await db.housekeepingTask.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = await db.housekeepingTask.create({
      data: {
        taskId: body.taskId || `tsk-${Date.now()}`,
        roomNumber: body.roomNumber,
        roomType: body.roomType,
        taskType: body.taskType,
        assignedTo: body.assignedTo,
        priority: body.priority || 'medium',
        status: body.status || 'pending',
        scheduledTime: body.scheduledTime ? new Date(body.scheduledTime) : new Date(),
        startTime: body.startTime ? new Date(body.startTime) : null,
        completionTime: body.completionTime ? new Date(body.completionTime) : null,
        duration: body.duration,
        inspectionScore: body.inspectionScore,
        notes: body.notes,
      },
    });
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
