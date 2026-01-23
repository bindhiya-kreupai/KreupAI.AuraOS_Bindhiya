import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export interface ConnectIntegrationBody {
  provider: 'slack' | 'teams' | 'google_calendar' | 'outlook_calendar';
  credentials: Record<string, string>;
  config?: Record<string, unknown>;
}

export interface SyncIntegrationBody {
  direction?: 'push' | 'pull' | 'bidirectional';
  resources?: string[];
}

export interface IntegrationParams {
  id: string;
}

export async function integrationRoutes(app: FastifyInstance) {
  // List all integrations
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return { integrations: [], total: 0 };
  });

  // Connect a new integration
  app.post('/connect', async (request: FastifyRequest<{ Body: ConnectIntegrationBody }>, reply: FastifyReply) => {
    const { provider, config } = request.body;
    reply.status(201);
    return {
      id: 'int_generated_id',
      provider,
      status: 'connected',
      config,
      connectedAt: new Date().toISOString(),
    };
  });

  // Get integration status
  app.get('/:id', async (request: FastifyRequest<{ Params: IntegrationParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    return { id, provider: '', status: 'connected', lastSyncAt: null };
  });

  // Disconnect an integration
  app.delete('/:id', async (request: FastifyRequest<{ Params: IntegrationParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    return { id, status: 'disconnected', disconnectedAt: new Date().toISOString() };
  });

  // Trigger sync for an integration
  app.post('/:id/sync', async (request: FastifyRequest<{ Params: IntegrationParams; Body: SyncIntegrationBody }>, reply: FastifyReply) => {
    const { id } = request.params;
    const { direction, resources } = request.body;
    return {
      id,
      syncId: 'sync_generated_id',
      direction: direction || 'bidirectional',
      resources: resources || ['all'],
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    };
  });

  // Get sync history
  app.get('/:id/sync/history', async (request: FastifyRequest<{ Params: IntegrationParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    return { integrationId: id, syncs: [], total: 0 };
  });

  // OAuth callback
  app.get('/oauth/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { code?: string; state?: string };
    return { status: 'authenticated', state: query.state };
  });
}
