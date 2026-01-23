import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export interface CreateWebhookBody {
  url: string;
  events: string[];
  secret?: string;
  active?: boolean;
}

export interface UpdateWebhookBody {
  url?: string;
  events?: string[];
  secret?: string;
  active?: boolean;
}

export interface WebhookParams {
  id: string;
}

export async function webhookRoutes(app: FastifyInstance) {
  // List all webhooks
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return { webhooks: [], total: 0 };
  });

  // Create a webhook
  app.post('/', async (request: FastifyRequest<{ Body: CreateWebhookBody }>, reply: FastifyReply) => {
    const { url, events, secret, active } = request.body;
    reply.status(201);
    return {
      id: 'wh_generated_id',
      url,
      events,
      secret: secret ? '***' : undefined,
      active: active ?? true,
      createdAt: new Date().toISOString(),
    };
  });

  // Get a specific webhook
  app.get('/:id', async (request: FastifyRequest<{ Params: WebhookParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    return { id, url: '', events: [], active: true };
  });

  // Update a webhook
  app.put('/:id', async (request: FastifyRequest<{ Params: WebhookParams; Body: UpdateWebhookBody }>, reply: FastifyReply) => {
    const { id } = request.params;
    const updates = request.body;
    return { id, ...updates, updatedAt: new Date().toISOString() };
  });

  // Delete a webhook
  app.delete('/:id', async (request: FastifyRequest<{ Params: WebhookParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    reply.status(204);
    return;
  });

  // Test a webhook delivery
  app.post('/:id/test', async (request: FastifyRequest<{ Params: WebhookParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    return { id, testDelivery: 'queued', timestamp: new Date().toISOString() };
  });

  // Get webhook delivery history
  app.get('/:id/deliveries', async (request: FastifyRequest<{ Params: WebhookParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    return { webhookId: id, deliveries: [], total: 0 };
  });
}
