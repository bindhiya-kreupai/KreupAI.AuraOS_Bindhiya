/**
 * Authentication Service - Entry Point
 * Microservice for handling authentication, authorization, MFA, OAuth2, and SAML
 */

import tracer from 'dd-trace';
import { createServer } from './server';
import { logger } from './utils/logger';
import { config } from './config';

// Initialize Datadog APM
if (config.datadog.enabled) {
  tracer.init({
    service: config.datadog.service,
    env: config.datadog.env,
    version: config.datadog.version,
    logInjection: true,
    runtimeMetrics: true,
  });
  logger.info('Datadog APM initialized');
}

async function start() {
  try {
    const server = await createServer();

    // Start HTTP server
    await server.listen({
      port: config.port,
      host: config.host,
    });

    logger.info(`Auth service listening on ${config.host}:${config.port}`);
    logger.info(`Environment: ${config.env}`);
    logger.info(`Node version: ${process.version}`);

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, shutting down gracefully...`);
        await server.close();
        process.exit(0);
      });
    });

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error({ err: error }, 'Uncaught exception');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled rejection');
      process.exit(1);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

start();
