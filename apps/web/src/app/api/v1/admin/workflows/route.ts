import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);

    const isActive = searchParams.get('isActive');
    const trigger = searchParams.get('trigger');
    const search = searchParams.get('search');

    const where: any = { tenantId };
    if (isActive !== null) where.isActive = isActive === 'true';
    if (trigger) where.trigger = trigger;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const workflows = await prisma.workflowDefinition.findMany({
      where,
      include: {
        _count: { select: { instances: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const total = workflows.length;
    const active = workflows.filter(w => w.isActive).length;
    const inactive = total - active;

    return NextResponse.json({
      success: true,
      data: workflows,
      meta: { total, active, inactive },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Workflow name is required' },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflowDefinition.create({
      data: {
        tenantId,
        name: body.name,
        description: body.description || null,
        trigger: body.trigger || 'MANUAL',
        triggerEvent: body.triggerEvent || null,
        nodes: body.nodes || [],
        edges: body.edges || [],
        isActive: body.isActive ?? false,
        version: 1,
        createdBy: user.userId,
      },
    });

    return NextResponse.json(
      { success: true, data: workflow, message: 'Workflow created successfully' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
});
