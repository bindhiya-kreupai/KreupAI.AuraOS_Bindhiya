/**
 * Health Check Routes
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export async function healthRoutes(server: FastifyInstance) {
  // Health check endpoint
  server.get('/health', async (_request, reply) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      // Check Redis connection
      await redis.ping();

      return reply.status(200).send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Readiness check endpoint
  server.get('/ready', async (_request, reply) => {
    try {
      // Check if service is ready to handle requests
      await prisma.$queryRaw`SELECT 1`;
      await redis.ping();

      return reply.status(200).send({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'not ready',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Liveness check endpoint
  server.get('/live', async (_request, reply) => {
    return reply.status(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  // K8s-convention aliases (Phase 3 #40). Same semantics as /live and /ready
  // but path-aligned with the rest of the AuraOS service mesh.
  server.get('/healthz', async (_request, reply) => {
    return reply.status(200).send({ status: 'alive', uptime: process.uptime() });
  });

  server.get('/readyz', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await redis.ping();
      return reply.status(200).send({ status: 'ready' });
    } catch (error) {
      return reply.status(503).send({
        status: 'not_ready',
        error: error instanceof Error ? error.message : 'unknown',
      });
    }
  });

  // Metrics endpoint (for Prometheus)
  server.get('/metrics', async (_request, reply) => {
    const metrics = {
      process: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      timestamp: new Date().toISOString(),
    };

    return reply.status(200).send(metrics);
  });
}
