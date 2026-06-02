import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;

    const templates = await prisma.notificationTemplate.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    const template = await prisma.notificationTemplate.create({
      data: {
        tenantId: user.tenantId,
        name: body.name,
        subject: body.subject,
        body: body.body,
        type: body.type,
        category: body.category || null,
        variables: body.variables || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating notification template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
