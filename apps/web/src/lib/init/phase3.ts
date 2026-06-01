/**
 * Phase 3 Infrastructure Initialization
 * Centralized initialization for all Phase 3 services
 */

import { initializeMessaging, shutdownMessaging } from './messaging';
import { initializeSearch, shutdownSearch } from './search';
import { initializeScheduler, shutdownScheduler } from './scheduler';
import { eventBusService } from '@/lib/events/event-bus.service';
import { logger } from '@/lib/logger';

/**
 * Initialize all Phase 3 services
 */
export async function initializePhase3Services(): Promise<void> {
  logger.info('=== Initializing Phase 3 Infrastructure ===');

  const startTime = performance.now();

  try {
    // Initialize services in parallel where possible
    await Promise.allSettled([
      // Messaging (RabbitMQ)
      initializeMessaging().catch((error) => {
        logger.error({ error }, 'Failed to initialize messaging');
        return Promise.resolve(); // Don't fail startup
      }),

      // Search (Elasticsearch)
      initializeSearch().catch((error) => {
        logger.error({ error }, 'Failed to initialize search');
        return Promise.resolve(); // Don't fail startup
      }),
    ]);

    // Initialize Event Bus (in-memory, always succeeds)
    eventBusService.initialize();

    // Initialize Background Job Scheduler
    // This starts cron tasks for all enabled jobs. It runs after messaging
    // so that the queue is available for job dispatch.
    await initializeScheduler().catch((error) => {
      logger.error({ error }, 'Failed to initialize scheduler');
      // Don't fail startup
    });

    const duration = Math.round(performance.now() - startTime);

    logger.info(
      { duration },
      '=== Phase 3 Infrastructure Initialized Successfully ==='
    );
  } catch (error: any) {
    logger.error({ error }, 'Error during Phase 3 initialization');
    // Don't throw - allow app to start even if some services fail
  }
}

/**
 * Shutdown all Phase 3 services gracefully
 */
export async function shutdownPhase3Services(): Promise<void> {
  logger.info('=== Shutting Down Phase 3 Infrastructure ===');

  try {
    await Promise.allSettled([
      shutdownScheduler(),
      shutdownMessaging(),
      shutdownSearch(),
    ]);

    logger.info('=== Phase 3 Infrastructure Shut Down Successfully ===');
  } catch (error: any) {
    logger.error({ error }, 'Error during Phase 3 shutdown');
  }
}

/**
 * Health check for Phase 3 services
 */
export async function checkPhase3Health(): Promise<{
  messaging: boolean;
  search: boolean;
  events: boolean;
  scheduler: boolean;
  overall: boolean;
}> {
  const { messagingService } = await import('@/lib/queue/messaging.service');
  const { employeeSearchService } = await import('@/lib/search/employee-search.service');
  const { jobScheduler } = await import('@/lib/queue/scheduler');

  const health = {
    messaging: messagingService.isReady(),
    search: employeeSearchService.isReady(),
    events: true, // Event bus is in-memory, always ready
    scheduler: jobScheduler.isRunning,
    overall: false,
  };

  health.overall = health.messaging && health.search && health.events && health.scheduler;

  return health;
}
