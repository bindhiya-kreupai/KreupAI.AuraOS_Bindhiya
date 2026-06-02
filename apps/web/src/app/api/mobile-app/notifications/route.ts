import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;

    const notifications = await prisma.notification.findMany({
      where: {
        tenantId: user.tenantId,
        type: 'push',
      },
      orderBy: { createdAt: 'desc' },
      include: { recipients: true },
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching mobile notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    const notification = await prisma.notification.create({
      data: {
        tenantId: user.tenantId,
        title: body.title,
        body: body.body,
        type: body.type || 'push',
        priority: body.priority || 'medium',
        targetType: body.targetType || 'all',
        targetValue: body.targetValue || null,
        status: body.status || 'draft',
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        metadata: body.metadata || null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating mobile notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
