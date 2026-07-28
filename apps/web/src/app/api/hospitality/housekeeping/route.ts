import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(req: Request) {
  try {
    const tasks = await (db as any).housekeepingTask.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mappedTasks = tasks.map((t: any) => ({
      id: t.id,
      taskId: t.taskId,
      roomNumber: t.roomNumber,
      roomType: t.roomType,
      taskType: t.taskType,
      assignedTo: t.assignedTo,
      priority: t.priority,
      status: t.status,
      scheduledTime: t.scheduledTime,
      startTime: t.startTime,
      completionTime: t.completionTime,
      duration: t.duration,
      inspectionScore: t.inspectionScore,
      notes: t.notes,
    }));

    return NextResponse.json({ tasks: mappedTasks });
  } catch (error: any) {
    console.error('Failed to fetch housekeeping tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch housekeeping tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newTask = await (db as any).housekeepingTask.create({
      data: {
        taskId: body.taskId || `HK-${Date.now()}`,
        roomNumber: body.roomNumber || 'Room 101',
        roomType: body.roomType || 'Standard',
        taskType: body.taskType || 'Cleaning',
        assignedTo: body.assignedTo || 'Unassigned',
        priority: body.priority || 'Normal',
        status: body.status || 'Dirty',
        scheduledTime: new Date(),
        duration: 0,
        inspectionScore: 0,
      },
    });

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create housekeeping task:', error);
    return NextResponse.json({ error: 'Failed to create housekeeping task' }, { status: 500 });
  }
}
