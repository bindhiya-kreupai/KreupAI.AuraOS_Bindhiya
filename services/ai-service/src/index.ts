import './instrumentation';
import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() };
});

// ── Kubernetes probe endpoints (Phase 3 #40) ──────────────────────────────────
// /healthz — liveness: returns 200 unconditionally if the process is up.
//           No external calls — depending on Postgres here would let a transient
//           DB outage trigger pod restarts and cause cascade failures.
// /readyz  — readiness: returns 200 by default. Override per service when there
//           are real dependency probes worth gating traffic on.
app.get('/healthz', async () => ({ status: 'alive', uptime: process.uptime() }));
app.get('/readyz', async () => ({ status: 'ready' }));

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
  const port = parseInt(process.env.AI_SERVICE_PORT || '3006', 10);
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
