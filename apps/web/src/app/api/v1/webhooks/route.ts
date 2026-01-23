import { NextRequest, NextResponse } from 'next/server';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastDeliveryAt: string | null;
  lastDeliveryStatus: 'success' | 'failed' | null;
}

interface WebhookCreatePayload {
  url: string;
  events: string[];
  secret: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const mockWebhooks: Webhook[] = [
  {
    id: 'wh_001',
    url: 'https://example.com/webhooks/orders',
    events: ['order.created', 'order.updated', 'order.cancelled'],
    secret: 'whsec_abc123def456',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    lastDeliveryAt: '2026-01-23T09:15:00Z',
    lastDeliveryStatus: 'success',
  },
  {
    id: 'wh_002',
    url: 'https://example.com/webhooks/users',
    events: ['user.created', 'user.updated'],
    secret: 'whsec_ghi789jkl012',
    active: true,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-18T11:45:00Z',
    lastDeliveryAt: '2026-01-22T16:20:00Z',
    lastDeliveryStatus: 'success',
  },
  {
    id: 'wh_003',
    url: 'https://staging.example.com/hooks/payments',
    events: ['payment.completed', 'payment.failed', 'payment.refunded'],
    secret: 'whsec_mno345pqr678',
    active: false,
    createdAt: '2026-01-05T12:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
    lastDeliveryAt: '2026-01-14T22:10:00Z',
    lastDeliveryStatus: 'failed',
  },
];

function generateWebhookId(): string {
  return 'wh_' + Date.now().toString(36);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const activeOnly = searchParams.get('active');

  let filtered = [...mockWebhooks];

  if (activeOnly === 'true') {
    filtered = filtered.filter((wh) => wh.active);
  } else if (activeOnly === 'false') {
    filtered = filtered.filter((wh) => !wh.active);
  }

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
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookCreatePayload = await request.json();

    if (!body.url || !body.events || !body.secret) {
      return NextResponse.json(
        { error: 'Missing required fields: url, events, secret' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        { error: 'events must be a non-empty array of event types' },
        { status: 400 }
      );
    }

    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const newWebhook: Webhook = {
      id: generateWebhookId(),
      url: body.url,
      events: body.events,
      secret: body.secret,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastDeliveryAt: null,
      lastDeliveryStatus: null,
    };

    return NextResponse.json({ data: newWebhook }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
