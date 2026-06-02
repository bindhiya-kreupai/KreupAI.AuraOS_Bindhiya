import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/webhooks
 * List webhooks with optional active filter and pagination
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('webhooks:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing webhooks:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const activeOnly = searchParams.get('active');
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      tenantId: user.tenantId,
    };

    if (activeOnly === 'true') {
      whereClause.isActive = true;
    } else if (activeOnly === 'false') {
      whereClause.isActive = false;
    }

    const [webhooks, total] = await Promise.all([
      prisma.webhook.findMany({
        where: whereClause,
        include: {
          logs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              createdAt: true,
              success: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.webhook.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Map to shape compatible with existing frontend expectations
    const data = webhooks.map((wh) => {
      const lastLog = wh.logs[0] || null;
      return {
        id: wh.id,
        url: wh.url,
        events: wh.events,
        secret: wh.secret,
        active: wh.isActive,
        headers: wh.headers,
        retryCount: wh.retryCount,
        createdBy: wh.createdBy,
        createdAt: wh.createdAt.toISOString(),
        updatedAt: wh.updatedAt.toISOString(),
        lastDeliveryAt: lastLog?.createdAt?.toISOString() || null,
        lastDeliveryStatus: lastLog ? (lastLog.success ? 'success' : 'failed') : null,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Webhooks API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch webhooks',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/webhooks
 * Create a new webhook
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('webhooks:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing webhooks:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    // Validate required fields
    if (!body.url || !body.events || !body.secret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Missing required fields: url, events, secret',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'events must be a non-empty array of event types',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Invalid URL format',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    const webhook = await prisma.webhook.create({
      data: {
        tenantId: user.tenantId,
        url: body.url,
        events: body.events,
        secret: body.secret,
        isActive: true,
        headers: body.headers || null,
        retryCount: body.retryCount ?? 3,
        createdBy: user.userId,
      },
    });

    const data = {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      active: webhook.isActive,
      headers: webhook.headers,
      retryCount: webhook.retryCount,
      createdBy: webhook.createdBy,
      createdAt: webhook.createdAt.toISOString(),
      updatedAt: webhook.updatedAt.toISOString(),
      lastDeliveryAt: null,
      lastDeliveryStatus: null,
    };

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Webhooks API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create webhook',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
