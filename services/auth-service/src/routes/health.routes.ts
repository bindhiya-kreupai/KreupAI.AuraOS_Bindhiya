/**
 * Health Check Routes
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export async function healthRoutes(server: FastifyInstance) {
  // Health check endpoint
  server.get('/health', async (request, reply) => {
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
  server.get('/ready', async (request, reply) => {
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
  server.get('/live', async (request, reply) => {
    return reply.status(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  // Metrics endpoint (for Prometheus)
  server.get('/metrics', async (request, reply) => {
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
