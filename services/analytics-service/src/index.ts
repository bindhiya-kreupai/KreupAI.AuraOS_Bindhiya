import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', service: 'analytics-service', timestamp: new Date().toISOString() };
});

// Metrics endpoints
app.get('/api/v1/metrics', async (request, reply) => {
  return { message: 'Metrics endpoint' };
});

app.get('/api/v1/metrics/:type', async (request, reply) => {
  const { type } = request.params as { type: string };
  return { message: `Metrics for type: ${type}` };
});

// Reports endpoints
app.post('/api/v1/reports/generate', async (request, reply) => {
  return { message: 'Report generation queued' };
});

app.get('/api/v1/reports/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  return { message: `Report ${id}` };
});

const start = async () => {
  const port = parseInt(process.env.PORT || '3001', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`Analytics service listening on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;
