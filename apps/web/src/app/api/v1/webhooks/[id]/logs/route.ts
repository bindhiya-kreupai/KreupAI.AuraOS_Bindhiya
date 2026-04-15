import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

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

interface _RouteContext {
  params: Promise<{ id: string }>;
}

const mockDeliveryLogs: Record<string, DeliveryLog[]> = {
  wh_001: [
    {
      id: 'log_001',
      webhookId: 'wh_001',
      event: 'order.created',
      status: 'success',
      timestamp: '2026-01-23T09:15:00Z',
      responseCode: 200,
      responseTime: 145,
      requestHeaders: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': 'sha256=abc123',
        'X-Webhook-Id': 'wh_001',
      },
      requestBody: '{"event":"order.created","data":{"orderId":"ord_999","amount":59.99}}',
      responseBody: '{"received":true}',
      attemptNumber: 1,
      nextRetryAt: null,
    },
    {
      id: 'log_002',
      webhookId: 'wh_001',
      event: 'order.updated',
      status: 'success',
      timestamp: '2026-01-23T08:45:00Z',
      responseCode: 200,
      responseTime: 132,
      requestHeaders: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': 'sha256=def456',
        'X-Webhook-Id': 'wh_001',
      },
      requestBody: '{"event":"order.updated","data":{"orderId":"ord_998","status":"shipped"}}',
      responseBody: '{"received":true}',
      attemptNumber: 1,
      nextRetryAt: null,
    },
    {
      id: 'log_003',
      webhookId: 'wh_001',
      event: 'order.cancelled',
      status: 'failed',
      timestamp: '2026-01-22T22:10:00Z',
      responseCode: 500,
      responseTime: 3012,
      requestHeaders: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': 'sha256=ghi789',
        'X-Webhook-Id': 'wh_001',
      },
      requestBody:
        '{"event":"order.cancelled","data":{"orderId":"ord_997","reason":"customer_request"}}',
      responseBody: '{"error":"Internal Server Error"}',
      attemptNumber: 3,
      nextRetryAt: null,
    },
    {
      id: 'log_004',
      webhookId: 'wh_001',
      event: 'order.created',
      status: 'retrying',
      timestamp: '2026-01-22T20:00:00Z',
      responseCode: 503,
      responseTime: 5000,
      requestHeaders: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': 'sha256=jkl012',
        'X-Webhook-Id': 'wh_001',
      },
      requestBody: '{"event":"order.created","data":{"orderId":"ord_996","amount":120.00}}',
      responseBody: null,
      attemptNumber: 2,
      nextRetryAt: '2026-01-23T10:00:00Z',
    },
  ],
  wh_002: [
    {
      id: 'log_005',
      webhookId: 'wh_002',
      event: 'user.created',
      status: 'success',
      timestamp: '2026-01-22T16:20:00Z',
      responseCode: 200,
      responseTime: 98,
      requestHeaders: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': 'sha256=mno345',
        'X-Webhook-Id': 'wh_002',
      },
      requestBody: '{"event":"user.created","data":{"userId":"usr_500","email":"new@example.com"}}',
      responseBody: '{"status":"ok"}',
      attemptNumber: 1,
      nextRetryAt: null,
    },
  ],
};

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, params }: any) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const statusFilter = searchParams.get('status');
  const eventFilter = searchParams.get('event');

  const logs = mockDeliveryLogs[id];

  if (!logs) {
    return NextResponse.json({ error: `Webhook with id '${id}' not found` }, { status: 404 });
  }

  let filtered = [...logs];

  if (statusFilter) {
    filtered = filtered.filter((log) => log.status === statusFilter);
  }

  if (eventFilter) {
    filtered = filtered.filter((log) => log.event === eventFilter);
  }

  // Sort by timestamp descending (most recent first)
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
  };

  return NextResponse.json({ data: paginated, pagination });
});
