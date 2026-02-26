/**
 * Integration Service - Entry Point
 * Proper Fastify microservice for third-party integrations and webhook management.
 *
 * Routes (all prefixed /api/v1):
 *   GET    /integrations                      — list configured integrations
 *   GET    /integrations/:id                  — integration detail with status
 *   POST   /integrations                      — configure new integration
 *   PUT    /integrations/:id                  — update integration config
 *   DELETE /integrations/:id                  — remove integration
 *   POST   /integrations/:id/test             — test connection
 *   GET    /integrations/:id/logs             — integration logs
 *   POST   /webhooks/receive/:provider        — incoming webhook receiver
 *   GET    /webhooks                          — list configured webhooks
 *   POST   /webhooks                          — register webhook
 *   GET    /webhooks/:id                      — get webhook details
 *   PUT    /webhooks/:id                      — update webhook
 *   DELETE /webhooks/:id                      — delete webhook
 *   POST   /webhooks/:id/test                 — test webhook delivery
 *   GET    /webhooks/:id/deliveries           — webhook delivery history
 *   GET    /health                            — health check
 */

import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { prisma } from './lib/prisma';
import { enqueueWebhookDelivery } from './workers/webhookDeliveryWorker';
import { webhookRoutes } from './routes/webhooks';
import { integrationRoutes } from './routes/integrations';

// ── App ───────────────────────────────────────────────────────────────────────

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  trustProxy: true,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  genReqId: (req) =>
    (req.headers['x-request-id'] as string) ||
    `int-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
});

// ── CORS / Security headers ───────────────────────────────────────────────────

app.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, X-Webhook-Signature');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  if (request.method === 'OPTIONS') {
    reply.code(204).send();
  }
});

// ── Error handler ─────────────────────────────────────────────────────────────

app.setErrorHandler(async (error, request, reply) => {
  request.log.error({ err: error }, 'Unhandled error');
  const statusCode = error.statusCode || 500;
  reply.code(statusCode).send({
    error: statusCode === 500 ? 'Internal Server Error' : error.message,
    statusCode,
    requestId: request.id,
  });
});

// ── Health ────────────────────────────────────────────────────────────────────

app.get('/health', async (_request: FastifyRequest, _reply: FastifyReply) => {
  return {
    status: 'ok',
    service: 'integration-service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});

// ── INTEGRATIONS ──────────────────────────────────────────────────────────────

interface IntegrationBody {
  tenantId: string;
  provider: string;
  name: string;
  credentials?: Record<string, string>;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

// List configured integrations
app.get('/api/v1/integrations', async (
  request: FastifyRequest<{ Querystring: { tenantId?: string; provider?: string; status?: string; page?: string; limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { tenantId, provider, status, page = '1', limit = '20' } = request.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;

    // Using Webhook model as a proxy for integration configurations
    // In production this would use a dedicated Integration model
    const [webhooks, total] = await Promise.all([
      prisma.webhook.findMany({
        where: {
          ...(tenantId ? { tenantId } : {}),
          ...(status === 'active' ? { isActive: true } : status === 'inactive' ? { isActive: false } : {}),
        },
        skip,
        take: limitNum,
        include: {
          _count: { select: { logs: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.webhook.count({
        where: {
          ...(tenantId ? { tenantId } : {}),
          ...(status === 'active' ? { isActive: true } : status === 'inactive' ? { isActive: false } : {}),
        },
      }),
    ]);

    // Map to integration-style response
    const integrations = webhooks.map((wh) => ({
      id: wh.id,
      tenantId: wh.tenantId,
      provider: 'webhook',
      name: `Webhook: ${wh.url}`,
      status: wh.isActive ? 'connected' : 'disconnected',
      url: wh.url,
      events: wh.events,
      deliveryCount: wh._count.logs,
      createdAt: wh.createdAt,
      updatedAt: wh.updatedAt,
    }));

    return reply.code(200).send({
      data: integrations,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to list integrations');
    return reply.code(500).send({ error: 'Failed to retrieve integrations' });
  }
});

// Get integration detail with status
app.get('/api/v1/integrations/:id', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const webhook = await prisma.webhook.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, event: true, success: true, statusCode: true, createdAt: true, responseTime: true },
        },
        _count: { select: { logs: true } },
      },
    });

    if (!webhook) {
      return reply.code(404).send({ error: 'Integration not found' });
    }

    const successRate = webhook._count.logs > 0
      ? `${Math.round((webhook.logs.filter((l) => l.success).length / Math.min(webhook._count.logs, 5)) * 100)}%`
      : 'N/A';

    return reply.code(200).send({
      data: {
        id: webhook.id,
        tenantId: webhook.tenantId,
        provider: 'webhook',
        name: `Webhook: ${webhook.url}`,
        status: webhook.isActive ? 'connected' : 'disconnected',
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        retryCount: webhook.retryCount,
        headers: webhook.headers,
        recentLogs: webhook.logs,
        stats: { totalDeliveries: webhook._count.logs, successRate },
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt,
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get integration');
    return reply.code(500).send({ error: 'Failed to retrieve integration' });
  }
});

// Configure new integration
app.post('/api/v1/integrations', async (
  request: FastifyRequest<{ Body: IntegrationBody }>,
  reply: FastifyReply
) => {
  try {
    const { tenantId, provider, name, config } = request.body;

    if (!tenantId || !provider) {
      return reply.code(400).send({ error: 'tenantId and provider are required' });
    }

    const url = (config?.url as string) || (config?.webhookUrl as string) || `https://hooks.example.com/${provider}`;
    const events = (config?.events as string[]) || ['*'];
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        tenantId,
        url,
        events,
        secret,
        isActive: true,
        headers: config?.headers as Record<string, string> | null,
        retryCount: (config?.retryCount as number) || 3,
        createdBy: (config?.createdBy as string) || 'system',
      },
    });

    return reply.code(201).send({
      data: {
        id: webhook.id,
        tenantId: webhook.tenantId,
        provider,
        name,
        status: 'connected',
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        secretHint: `${secret.slice(0, 8)}...`,
        connectedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to configure integration');
    return reply.code(500).send({ error: 'Failed to configure integration' });
  }
});

// Update integration config
app.put('/api/v1/integrations/:id', async (
  request: FastifyRequest<{ Params: { id: string }; Body: Partial<IntegrationBody & { url?: string; events?: string[]; isActive?: boolean; retryCount?: number; headers?: Record<string, string> }> }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const body = request.body;

    const existing = await prisma.webhook.findUnique({ where: { id } });
    if (!existing) {
      return reply.code(404).send({ error: 'Integration not found' });
    }

    const updateData: Record<string, unknown> = {};
    if (body.url) updateData.url = body.url;
    if (body.events) updateData.events = body.events;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.retryCount !== undefined) updateData.retryCount = body.retryCount;
    if (body.headers) updateData.headers = body.headers;

    const updated = await prisma.webhook.update({ where: { id }, data: updateData });

    return reply.code(200).send({
      data: {
        id: updated.id,
        status: updated.isActive ? 'connected' : 'disconnected',
        url: updated.url,
        events: updated.events,
        isActive: updated.isActive,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to update integration');
    return reply.code(500).send({ error: 'Failed to update integration' });
  }
});

// Remove integration
app.delete('/api/v1/integrations/:id', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const existing = await prisma.webhook.findUnique({ where: { id } });
    if (!existing) {
      return reply.code(404).send({ error: 'Integration not found' });
    }

    await prisma.webhook.delete({ where: { id } });

    return reply.code(200).send({ message: 'Integration removed', id });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to remove integration');
    return reply.code(500).send({ error: 'Failed to remove integration' });
  }
});

// Test connection
app.post('/api/v1/integrations/:id/test', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const webhook = await prisma.webhook.findUnique({ where: { id } });
    if (!webhook) {
      return reply.code(404).send({ error: 'Integration not found' });
    }

    // Enqueue a test webhook delivery
    const testPayload = {
      event: 'integration.test',
      data: { integrationId: id, message: 'AuraOS integration test' },
      timestamp: new Date().toISOString(),
    };

    const jobId = await enqueueWebhookDelivery(
      { id: webhook.id, url: webhook.url, events: webhook.events, secret: webhook.secret, active: webhook.isActive },
      testPayload
    );

    return reply.code(200).send({
      data: {
        integrationId: id,
        testJobId: jobId,
        status: 'test_queued',
        message: 'Test delivery queued. Check /integrations/:id/logs for results.',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to test integration');
    return reply.code(500).send({ error: 'Failed to test integration' });
  }
});

// Integration logs
app.get('/api/v1/integrations/:id/logs', async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { page?: string; limit?: string; success?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { page = '1', limit = '20', success } = request.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { webhookId: id };
    if (success !== undefined) where.success = success === 'true';

    const [logs, total] = await Promise.all([
      prisma.webhookLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.webhookLog.count({ where }),
    ]);

    return reply.code(200).send({
      data: logs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get integration logs');
    return reply.code(500).send({ error: 'Failed to retrieve logs' });
  }
});

// ── INCOMING WEBHOOK RECEIVER ─────────────────────────────────────────────────

interface IncomingWebhookProviders {
  provider: string;
}

app.post('/api/v1/webhooks/receive/:provider', async (
  request: FastifyRequest<{ Params: IncomingWebhookProviders; Body: Record<string, unknown> }>,
  reply: FastifyReply
) => {
  try {
    const { provider } = request.params;
    const body = request.body;
    const signature = request.headers['x-webhook-signature'] as string | undefined;
    const event = (request.headers['x-event-type'] as string) ||
                  (body?.event as string) ||
                  (body?.type as string) ||
                  'webhook.received';

    // Log the incoming webhook
    request.log.info({ provider, event, body }, 'Incoming webhook received');

    // Find matching active webhooks for this provider (by event subscription)
    const matchingWebhooks = await prisma.webhook.findMany({
      where: {
        isActive: true,
        events: { hasSome: [event, '*', `${provider}.*`] },
      },
    });

    // Process provider-specific logic
    let processingResult: Record<string, unknown> = { provider, event, receivedAt: new Date().toISOString() };

    switch (provider.toLowerCase()) {
      case 'slack':
        // Slack sends a challenge for URL verification
        if (body?.challenge) {
          return reply.code(200).send({ challenge: body.challenge });
        }
        processingResult = { ...processingResult, slackTeamId: body?.team_id, slackUserId: body?.event?.user };
        break;

      case 'github':
        processingResult = { ...processingResult, repository: (body as Record<string, unknown>)?.repository, action: body?.action };
        break;

      case 'stripe':
        processingResult = { ...processingResult, stripeEvent: body?.type, objectId: (body?.data as Record<string, unknown>)?.object?.id };
        break;

      default:
        processingResult = { ...processingResult, rawEvent: body };
    }

    // Forward to matching internal webhooks
    let forwardedCount = 0;
    for (const wh of matchingWebhooks) {
      try {
        await enqueueWebhookDelivery(
          { id: wh.id, url: wh.url, events: wh.events, secret: wh.secret, active: wh.isActive },
          { event, data: { provider, originalPayload: body, ...processingResult }, timestamp: new Date().toISOString() }
        );
        forwardedCount++;
      } catch (err) {
        request.log.warn({ err, webhookId: wh.id }, 'Failed to forward incoming webhook');
      }
    }

    return reply.code(200).send({
      received: true,
      provider,
      event,
      forwarded: forwardedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to process incoming webhook');
    return reply.code(500).send({ error: 'Failed to process webhook' });
  }
});

// ── WEBHOOKS (outgoing) ───────────────────────────────────────────────────────

// List configured webhooks
app.get('/api/v1/webhooks', async (
  request: FastifyRequest<{ Querystring: { tenantId?: string; isActive?: string; page?: string; limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { tenantId, isActive, page = '1', limit = '20' } = request.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [webhooks, total] = await Promise.all([
      prisma.webhook.findMany({
        where,
        skip,
        take: limitNum,
        include: { _count: { select: { logs: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.webhook.count({ where }),
    ]);

    const result = webhooks.map((wh) => ({
      ...wh,
      secret: `${wh.secret.slice(0, 8)}...`, // mask secret
      totalDeliveries: wh._count.logs,
    }));

    return reply.code(200).send({
      data: result,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to list webhooks');
    return reply.code(500).send({ error: 'Failed to retrieve webhooks' });
  }
});

// Register webhook
interface CreateWebhookBody {
  tenantId: string;
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  retryCount?: number;
  createdBy: string;
}

app.post('/api/v1/webhooks', async (
  request: FastifyRequest<{ Body: CreateWebhookBody }>,
  reply: FastifyReply
) => {
  try {
    const { tenantId, url, events, secret, headers, retryCount = 3, createdBy } = request.body;

    if (!tenantId || !url || !events || !createdBy) {
      return reply.code(400).send({ error: 'tenantId, url, events, and createdBy are required' });
    }

    if (!url.startsWith('https://') && process.env.NODE_ENV === 'production') {
      return reply.code(400).send({ error: 'Webhook URL must use HTTPS in production' });
    }

    const generatedSecret = secret || crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        tenantId,
        url,
        events,
        secret: generatedSecret,
        isActive: true,
        headers: headers as Record<string, string> | null,
        retryCount,
        createdBy,
      },
    });

    return reply.code(201).send({
      data: {
        ...webhook,
        secret: secret ? `${generatedSecret.slice(0, 8)}...` : generatedSecret, // Return full secret only on creation if not user-provided
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to register webhook');
    return reply.code(500).send({ error: 'Failed to register webhook' });
  }
});

// Get webhook details
app.get('/api/v1/webhooks/:id', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const webhook = await prisma.webhook.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, event: true, success: true, statusCode: true, responseTime: true, createdAt: true },
        },
        _count: { select: { logs: true } },
      },
    });

    if (!webhook) {
      return reply.code(404).send({ error: 'Webhook not found' });
    }

    return reply.code(200).send({
      data: {
        ...webhook,
        secret: `${webhook.secret.slice(0, 8)}...`,
        totalDeliveries: webhook._count.logs,
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get webhook');
    return reply.code(500).send({ error: 'Failed to retrieve webhook' });
  }
});

// Update webhook
app.put('/api/v1/webhooks/:id', async (
  request: FastifyRequest<{ Params: { id: string }; Body: Partial<CreateWebhookBody & { isActive: boolean }> }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const body = request.body;

    const existing = await prisma.webhook.findUnique({ where: { id } });
    if (!existing) {
      return reply.code(404).send({ error: 'Webhook not found' });
    }

    const updateData: Record<string, unknown> = {};
    if (body.url) updateData.url = body.url;
    if (body.events) updateData.events = body.events;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.retryCount !== undefined) updateData.retryCount = body.retryCount;
    if (body.headers) updateData.headers = body.headers;
    if (body.secret) updateData.secret = body.secret;

    const updated = await prisma.webhook.update({ where: { id }, data: updateData });

    return reply.code(200).send({
      data: {
        ...updated,
        secret: `${updated.secret.slice(0, 8)}...`,
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to update webhook');
    return reply.code(500).send({ error: 'Failed to update webhook' });
  }
});

// Delete webhook
app.delete('/api/v1/webhooks/:id', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const existing = await prisma.webhook.findUnique({ where: { id } });
    if (!existing) {
      return reply.code(404).send({ error: 'Webhook not found' });
    }

    await prisma.webhook.delete({ where: { id } });

    return reply.code(200).send({ message: 'Webhook deleted', id });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to delete webhook');
    return reply.code(500).send({ error: 'Failed to delete webhook' });
  }
});

// Test webhook delivery
app.post('/api/v1/webhooks/:id/test', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const webhook = await prisma.webhook.findUnique({ where: { id } });
    if (!webhook) {
      return reply.code(404).send({ error: 'Webhook not found' });
    }

    const jobId = await enqueueWebhookDelivery(
      { id: webhook.id, url: webhook.url, events: webhook.events, secret: webhook.secret, active: webhook.isActive },
      { event: 'webhook.test', data: { webhookId: id, message: 'AuraOS webhook test' }, timestamp: new Date().toISOString() }
    );

    return reply.code(200).send({
      data: {
        webhookId: id,
        jobId,
        status: 'test_queued',
        message: 'Test delivery queued. Check /webhooks/:id/deliveries for results.',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to test webhook');
    return reply.code(500).send({ error: 'Failed to test webhook' });
  }
});

// Webhook delivery history
app.get('/api/v1/webhooks/:id/deliveries', async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { page?: string; limit?: string; success?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { page = '1', limit = '20', success } = request.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { webhookId: id };
    if (success !== undefined) where.success = success === 'true';

    const [logs, total] = await Promise.all([
      prisma.webhookLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.webhookLog.count({ where }),
    ]);

    return reply.code(200).send({
      data: logs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get webhook deliveries');
    return reply.code(500).send({ error: 'Failed to retrieve deliveries' });
  }
});

// ── Also register legacy route handlers for backward compatibility ─────────────

// Note: The legacy routes from ./routes/integrations and ./routes/webhooks provide
// additional endpoints (connect, sync, oauth) that coexist with the routes above.
// We register them with distinct prefixes to avoid conflicts.

app.register(integrationRoutes, { prefix: '/api/v1/integrations-legacy' });
app.register(webhookRoutes, { prefix: '/api/v1/webhooks-legacy' });

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3004', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Integration service listening on ${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────

const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully...`);
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  app.log.error({ err: error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  app.log.error({ reason }, 'Unhandled rejection');
  process.exit(1);
});

start();

export default app;
