import Fastify from 'fastify';
import { webhookRoutes } from './routes/webhooks';
import { integrationRoutes } from './routes/integrations';

const app = Fastify({
  logger: true,
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', service: 'integration-service', timestamp: new Date().toISOString() };
});

// Register routes
app.register(webhookRoutes, { prefix: '/api/v1/webhooks' });
app.register(integrationRoutes, { prefix: '/api/v1/integrations' });

const start = async () => {
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`Integration service listening on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;
