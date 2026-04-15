import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

interface TestDeliveryResult {
  success: boolean;
  statusCode: number;
  responseTime: number;
  webhookId: string;
  event: string;
  timestamp: string;
  requestPayload: Record<string, unknown>;
  responseBody: string | null;
  error: string | null;
}

interface _RouteContext {
  params: Promise<{ id: string }>;
}

const knownWebhookIds = ['wh_001', 'wh_002', 'wh_003'];

export const POST = withEnhancedAuth(async (request: NextRequest, { _user, params }: any) => {
  const { id } = await params;

  if (!knownWebhookIds.includes(id)) {
    return NextResponse.json({ error: `Webhook with id '${id}' not found` }, { status: 404 });
  }

  let eventType = 'test.ping';
  let customPayload: Record<string, unknown> | undefined;

  try {
    const body = await request.json();
    if (body.event) {
      eventType = body.event;
    }
    if (body.payload) {
      customPayload = body.payload;
    }
  } catch {
    // Body is optional for test delivery; proceed with defaults
  }

  const testPayload: Record<string, unknown> = customPayload || {
    event: eventType,
    data: {
      test: true,
      webhookId: id,
      message: 'This is a test delivery from AuraOS webhook system',
      timestamp: new Date().toISOString(),
    },
  };

  // Simulate variable response times and occasional failures
  const simulatedResponses: TestDeliveryResult[] = [
    {
      success: true,
      statusCode: 200,
      responseTime: 127,
      webhookId: id,
      event: eventType,
      timestamp: new Date().toISOString(),
      requestPayload: testPayload,
      responseBody: '{"received":true,"test":true}',
      error: null,
    },
    {
      success: true,
      statusCode: 202,
      responseTime: 89,
      webhookId: id,
      event: eventType,
      timestamp: new Date().toISOString(),
      requestPayload: testPayload,
      responseBody: '{"status":"accepted"}',
      error: null,
    },
    {
      success: false,
      statusCode: 500,
      responseTime: 2340,
      webhookId: id,
      event: eventType,
      timestamp: new Date().toISOString(),
      requestPayload: testPayload,
      responseBody: '{"error":"Internal Server Error"}',
      error: 'Remote server returned HTTP 500',
    },
    {
      success: false,
      statusCode: 0,
      responseTime: 30000,
      webhookId: id,
      event: eventType,
      timestamp: new Date().toISOString(),
      requestPayload: testPayload,
      responseBody: null,
      error: 'Connection timed out after 30000ms',
    },
  ];

  // For deterministic testing, use webhook ID to pick a response
  const index = knownWebhookIds.indexOf(id) % simulatedResponses.length;
  const result = simulatedResponses[index];

  const statusCode = result.success ? 200 : 502;

  return NextResponse.json({ data: result }, { status: statusCode });
});
