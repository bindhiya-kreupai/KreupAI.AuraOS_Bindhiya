import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;

    const recipients = await prisma.notificationRecipient.findMany({
      where: { userId: user.userId },
      include: { notification: true },
      orderBy: { notification: { createdAt: 'desc' } },
    });

    return NextResponse.json({ notifications: recipients }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
