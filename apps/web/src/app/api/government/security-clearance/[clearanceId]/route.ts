import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function DELETE(request: Request, { params }: { params: { clearanceId: string } }) {
  try {
    const { clearanceId } = params;

    // Use deleteMany to avoid 500 crashes if multiple or none match
    const result = await db.securityClearance.deleteMany({
      where: {
        clearanceId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Security clearance not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete security clearance:', error);
    return NextResponse.json({ error: 'Failed to delete security clearance' }, { status: 500 });
  }
}
