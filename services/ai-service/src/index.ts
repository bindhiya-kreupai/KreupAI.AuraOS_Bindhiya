import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() };
});

// Resume parsing endpoints
app.post('/api/v1/ai/parse-resume', async (request, reply) => {
  return { message: 'Resume parsing started' };
});

// Recommendation endpoints
app.post('/api/v1/ai/recommendations', async (request, reply) => {
  return { message: 'Recommendations generated' };
});

app.get('/api/v1/ai/recommendations/:employeeId', async (request, reply) => {
  const { employeeId } = request.params as { employeeId: string };
  return { message: `Recommendations for employee ${employeeId}` };
});

// Predictive analytics endpoints
app.post('/api/v1/ai/predict/attrition', async (request, reply) => {
  return { message: 'Attrition prediction generated' };
});

app.post('/api/v1/ai/predict/engagement', async (request, reply) => {
  return { message: 'Engagement score calculated' };
});

const start = async () => {
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`AI service listening on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;
