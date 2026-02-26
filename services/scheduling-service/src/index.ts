/**
 * Scheduling Service
 *
 * Manages distributed cron jobs and publishes cron.job.completed events
 * to the @aura/events RabbitMQ bus so downstream consumers can react to
 * job completions (e.g. audit-log, analytics, alerting).
 */

import Fastify from 'fastify';
import { startCronRegistry, stopCronRegistry, CRON_JOBS } from './scheduler/cron-registry';
import { getRabbitMQEventBus } from '@aura/events';

const app = Fastify({
  logger: true,
});

// ---------------------------------------------------------------------------
// RabbitMQ event bus — publishes cron lifecycle events
// ---------------------------------------------------------------------------

const CRON_EXCHANGE = 'aura.scheduling';
let busReady = false;

async function initEventBus(): Promise<void> {
  try {
    const bus = getRabbitMQEventBus();
    await bus.connect();
    await bus.createExchange(CRON_EXCHANGE, 'topic', { durable: true });
    await bus.createQueue('scheduling.cron.events', {
      durable: true,
      deadLetterExchange: 'aura.scheduling.dlx',
    });
    busReady = true;
    app.log.info('[scheduling-service] RabbitMQ event bus ready');
  } catch (err) {
    // Non-fatal — service can operate without event publishing
    app.log.warn(
      { err },
      '[scheduling-service] Event bus unavailable — cron events will not be published'
    );
  }
}

/**
 * Publish a cron.job.completed event after a job finishes.
 * Called by the cron-registry wrapper (see below).
 */
export async function publishCronJobCompleted(params: {
  jobName: string;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
}): Promise<void> {
  if (!busReady) return;

  try {
    const bus = getRabbitMQEventBus();
    await bus.publish(
      CRON_EXCHANGE,
      'cron.job.completed',
      {
        eventType: 'cron.job.completed',
        service: 'scheduling-service',
        ...params,
        startedAt: params.startedAt.toISOString(),
        completedAt: params.completedAt.toISOString(),
      },
      { persistent: true }
    );
  } catch (err) {
    app.log.warn({ err }, '[scheduling-service] Failed to publish cron.job.completed event');
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/health', async () => {
  return {
    status: 'ok',
    service: 'scheduling-service',
    timestamp: new Date().toISOString(),
    eventBus: busReady ? 'connected' : 'unavailable',
  };
});

// Cron job status endpoint — lists all registered HCM jobs and their metadata
app.get('/api/v1/cron-jobs', async () => {
  return {
    jobs: CRON_JOBS.map((j) => ({
      name:           j.name,
      cron:           j.cron,
      enabled:        j.enabled ?? true,
      lockTtlSeconds: j.lockTtlSeconds ?? 300,
    })),
    total: CRON_JOBS.length,
  };
});

// Schedule endpoints
app.get('/api/v1/schedules', async (_request, _reply) => {
  return { message: 'List schedules' };
});

app.post('/api/v1/schedules', async (_request, _reply) => {
  return { message: 'Schedule created' };
});

app.get('/api/v1/schedules/:id/conflicts', async (request, _reply) => {
  const { id } = request.params as { id: string };
  return { message: `Conflicts for schedule ${id}` };
});

// Shift endpoints
app.post('/api/v1/shifts', async (_request, _reply) => {
  return { message: 'Shift assigned' };
});

app.post('/api/v1/shifts/:id/swap', async (request, _reply) => {
  const { id } = request.params as { id: string };
  return { message: `Shift ${id} swap requested` };
});

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

const start = async () => {
  const port = parseInt(process.env.PORT || '3009', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    // Init event bus (non-blocking — service starts even if RabbitMQ is down)
    await initEventBus();

    // Start the distributed cron scheduler before accepting HTTP traffic
    await startCronRegistry();

    await app.listen({ port, host });
    app.log.info(`Scheduling service listening on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

async function shutdown(signal: string) {
  console.log(`[scheduling-service] Received ${signal} — shutting down gracefully`);
  try {
    await stopCronRegistry();
    // Disconnect event bus
    if (busReady) {
      await getRabbitMQEventBus().disconnect();
    }
    await app.close();
  } catch (err) {
    console.error('[scheduling-service] Error during shutdown:', err);
  }
  process.exit(0);
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT',  () => shutdown('SIGINT'));

start();

export default app;
