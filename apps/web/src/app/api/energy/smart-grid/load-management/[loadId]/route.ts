import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { loadId: string } }) {
  try {
    const body = await request.json();
    const loadManagement = await db.loadManagement.update({
      where: { programId: params.loadId },
      data: body,
    });

    return NextResponse.json(loadManagement);
  } catch (error) {
    console.error('Failed to update load management:', error);
    return NextResponse.json({ error: 'Failed to update load management' }, { status: 500 });
  }
}
