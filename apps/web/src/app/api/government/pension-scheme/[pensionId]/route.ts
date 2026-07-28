import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function DELETE(request: Request, { params }: { params: { pensionId: string } }) {
  try {
    const { pensionId } = params;

    // Use deleteMany to avoid 500 crashes if multiple or none match
    const result = await db.pensionScheme.deleteMany({
      where: {
        pensionId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Pension scheme not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete pension scheme:', error);
    return NextResponse.json({ error: 'Failed to delete pension scheme' }, { status: 500 });
  }
}
