import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', service: 'workflow-service', timestamp: new Date().toISOString() };
});

// Workflow endpoints
app.post('/api/v1/workflows', async (request, reply) => {
  return { message: 'Workflow created' };
});

app.post('/api/v1/workflows/:id/execute', async (request, reply) => {
  const { id } = request.params as { id: string };
  return { message: `Workflow ${id} execution started` };
});

app.get('/api/v1/workflows/:id/status', async (request, reply) => {
  const { id } = request.params as { id: string };
  return { message: `Workflow ${id} status` };
});

// Approval endpoints
app.post('/api/v1/approvals', async (request, reply) => {
  return { message: 'Approval created' };
});

app.post('/api/v1/approvals/:id/resolve', async (request, reply) => {
  const { id } = request.params as { id: string };
  return { message: `Approval ${id} resolved` };
});

const start = async () => {
  const port = parseInt(process.env.PORT || '3002', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`Workflow service listening on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;
