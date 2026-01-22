/**
 * Messaging Infrastructure Initialization
 * Sets up @aura/messaging at application startup
 */

import { messagingService } from '@/lib/queue/messaging.service';
import { logger } from '@/lib/logger';

/**
 * Initialize messaging infrastructure
 */
export async function initializeMessaging(): Promise<void> {
  try {
    logger.info('Initializing messaging infrastructure...');
    await messagingService.initialize();
    logger.info('Messaging infrastructure initialized successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize messaging infrastructure');
    // Don't throw - allow app to start even if RabbitMQ is unavailable
    // The messaging service will auto-reconnect and fall back to sync processing
  }
}

/**
 * Shutdown messaging infrastructure gracefully
 */
export async function shutdownMessaging(): Promise<void> {
  try {
    logger.info('Shutting down messaging infrastructure...');
    await messagingService.disconnect();
    logger.info('Messaging infrastructure shut down successfully');
  } catch (error) {
    logger.error({ error }, 'Error shutting down messaging infrastructure');
  }
}
