import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { notFound } from '@/lib/api/crud-helpers';

interface DeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending' | 'retrying';
  timestamp: string;
  responseCode: number | null;
  responseTime: number;
  requestHeaders: Record<string, string>;
  requestBody: string;
  responseBody: string | null;
  attemptNumber: number;
  nextRetryAt: string | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, params, permissions, roles }: any) => {
    if (!roles?.includes('SUPER_ADMIN') && !permissions.includes('webhooks:read')) {
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
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const webhook = await prisma.webhook.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!webhook) return notFound('Webhook');

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const statusFilter = searchParams.get('status');
    const eventFilter = searchParams.get('event');

    const where: any = { webhookId: id };

    if (eventFilter) where.event = eventFilter;
    if (statusFilter === 'success') where.success = true;
    else if (statusFilter === 'failed') where.success = false;

    const [total, rows] = await Promise.all([
      prisma.webhookLog.count({ where }),
      prisma.webhookLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const logs: DeliveryLog[] = rows.map((log) => {
      const rawPayload = log.payload as any;
      const status: DeliveryLog['status'] = log.success
        ? 'success'
        : log.attempts >= 3
          ? 'failed'
          : 'retrying';
      return {
        id: log.id,
        webhookId: log.webhookId,
        event: log.event,
        status,
        timestamp: log.createdAt.toISOString(),
        responseCode: log.statusCode,
        responseTime: log.responseTime ?? 0,
        requestHeaders: rawPayload?.headers || {},
        requestBody: rawPayload?.body || JSON.stringify(rawPayload || {}),
        responseBody: log.responseBody,
        attemptNumber: log.attempts,
        nextRetryAt: null,
      };
    });

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = { page, limit, total, totalPages };

    return NextResponse.json({ data: logs, pagination });
  }
);
