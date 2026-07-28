import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function DELETE(req: Request, { params }: { params: { poolId: string } }) {
  try {
    const { poolId } = params;

    // Using deleteMany for safe deletion
    await (db as any).tipPool.deleteMany({
      where: {
        id: poolId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete tip pool:', error);
    return NextResponse.json({ error: 'Failed to delete tip pool' }, { status: 500 });
  }
}
