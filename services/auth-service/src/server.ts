/**
 * Fastify Server Setup
 */

import './instrumentation';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { logger } from './utils/logger';
import { config } from './config';
import { authRoutes } from './routes/auth.routes';
import { healthRoutes } from './routes/health.routes';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';

export async function createServer() {
  const server = Fastify({
    logger: logger as any,
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    trustProxy: true,
  });

  // Register plugins
  await server.register(helmet, {
    contentSecurityPolicy: false,
  });

  await server.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID'],
  });

  await server.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.windowMs,
    redis: redis,
    keyGenerator: (request) => {
      return request.headers['x-forwarded-for'] as string || request.ip;
    },
    errorResponseBuilder: () => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      };
    },
  });

  // Request logging
  server.addHook('onRequest', async (request) => {
    logger.info({
      requestId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    }, 'Incoming request');
  });

  server.addHook('onResponse', async (request, reply) => {
    logger.info({
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    }, 'Request completed');
  });

  // Error handler
  server.setErrorHandler((error, request, reply) => {
    logger.error({
      requestId: request.id,
      error: error.message,
      stack: error.stack,
    }, 'Request error');

    reply.status(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  });

  // Register routes
  await server.register(healthRoutes, { prefix: '/' });
  await server.register(authRoutes, { prefix: '/api/v1/auth' });

  // Graceful shutdown hooks
  server.addHook('onClose', async () => {
    logger.info('Closing server connections...');
    await prisma.$disconnect();
    await redis.quit();
    logger.info('All connections closed');
  });

  return server;
}
