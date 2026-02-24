import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const existing = await prisma.notification.findFirst({
      where: { id, tenantId: user.tenantId },
      include: { recipients: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        sentCount: existing.recipients.length > 0 ? existing.recipients.length : 1,
      },
      include: { recipients: true },
    });

    return NextResponse.json({ notification }, { status: 200 });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
