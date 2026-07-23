import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function DELETE(request: Request, { params }: { params: { gradeId: string } }) {
  try {
    const { gradeId } = params;

    // Use deleteMany to avoid 500 crashes if multiple or none match
    const result = await db.civilServiceGrade.deleteMany({
      where: {
        gradeId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Grade not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete civil service grade:', error);
    return NextResponse.json({ error: 'Failed to delete civil service grade' }, { status: 500 });
  }
}
