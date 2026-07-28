import { NextResponse } from 'next/server';
import { db } from '@aura/database';

export async function DELETE(req: Request, { params }: { params: { locumId: string } }) {
  try {
    await (db as any).locumProvider.deleteMany({
      where: {
        id: params.locumId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete locum provider:', error);
    return NextResponse.json({ error: 'Failed to delete locum provider' }, { status: 500 });
  }
}
