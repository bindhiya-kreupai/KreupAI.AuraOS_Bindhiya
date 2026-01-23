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
  description?: string;
  metadata?: Record<string, string>;
}

interface WebhookUpdatePayload {
  url?: string;
  events?: string[];
  secret?: string;
  active?: boolean;
  description?: string;
  metadata?: Record<string, string>;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

const mockWebhookDetails: Record<string, Webhook> = {
  wh_001: {
    id: 'wh_001',
    url: 'https://example.com/webhooks/orders',
    events: ['order.created', 'order.updated', 'order.cancelled'],
    secret: 'whsec_abc123def456',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    lastDeliveryAt: '2026-01-23T09:15:00Z',
    lastDeliveryStatus: 'success',
    description: 'Production order events webhook',
    metadata: { environment: 'production', team: 'commerce' },
  },
  wh_002: {
    id: 'wh_002',
    url: 'https://example.com/webhooks/users',
    events: ['user.created', 'user.updated'],
    secret: 'whsec_ghi789jkl012',
    active: true,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-18T11:45:00Z',
    lastDeliveryAt: '2026-01-22T16:20:00Z',
    lastDeliveryStatus: 'success',
    description: 'User lifecycle events',
    metadata: { environment: 'production', team: 'identity' },
  },
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const webhook = mockWebhookDetails[id];

  if (!webhook) {
    return NextResponse.json(
      { error: `Webhook with id '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: webhook });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const webhook = mockWebhookDetails[id];

  if (!webhook) {
    return NextResponse.json(
      { error: `Webhook with id '${id}' not found` },
      { status: 404 }
    );
  }

  try {
    const body: WebhookUpdatePayload = await request.json();

    if (body.url) {
      try {
        new URL(body.url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    if (body.events && (!Array.isArray(body.events) || body.events.length === 0)) {
      return NextResponse.json(
        { error: 'events must be a non-empty array of event types' },
        { status: 400 }
      );
    }

    const updatedWebhook: Webhook = {
      ...webhook,
      ...(body.url && { url: body.url }),
      ...(body.events && { events: body.events }),
      ...(body.secret && { secret: body.secret }),
      ...(typeof body.active === 'boolean' && { active: body.active }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.metadata && { metadata: body.metadata }),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: updatedWebhook });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const webhook = mockWebhookDetails[id];

  if (!webhook) {
    return NextResponse.json(
      { error: `Webhook with id '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { message: `Webhook '${id}' has been deleted successfully` },
    { status: 200 }
  );
}
