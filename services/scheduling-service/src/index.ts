import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', service: 'scheduling-service', timestamp: new Date().toISOString() };
});

// Schedule endpoints
app.get('/api/v1/schedules', async (request, reply) => {
  return { message: 'List schedules' };
});

app.post('/api/v1/schedules', async (request, reply) => {
  return { message: 'Schedule created' };
});

app.get('/api/v1/schedules/:id/conflicts', async (request, reply) => {
  const { id } = request.params as { id: string };
  return { message: `Conflicts for schedule ${id}` };
});

// Shift endpoints
app.post('/api/v1/shifts', async (request, reply) => {
  return { message: 'Shift assigned' };
});

app.post('/api/v1/shifts/:id/swap', async (request, reply) => {
  const { id } = request.params as { id: string };
  return { message: `Shift ${id} swap requested` };
});

const start = async () => {
  const port = parseInt(process.env.PORT || '3003', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`Scheduling service listening on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;
