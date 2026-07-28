import { NextResponse } from 'next/server';
import { db } from '@aura/database';

export async function DELETE(req: Request, { params }: { params: { providerId: string } }) {
  try {
    await (db as any).healthcareProvider.deleteMany({
      where: {
        id: params.providerId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete healthcare provider:', error);
    return NextResponse.json({ error: 'Failed to delete healthcare provider' }, { status: 500 });
  }
}
