/**
 * Search Infrastructure Initialization
 * Sets up @aura/search at application startup
 */

import { employeeSearchService } from '@/lib/search/employee-search.service';
import { logger } from '@/lib/logger';

/**
 * Initialize search infrastructure
 */
export async function initializeSearch(): Promise<void> {
  try {
    logger.info('Initializing search infrastructure...');
    await employeeSearchService.initialize();
    logger.info('Search infrastructure initialized successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize search infrastructure');
    // Don't throw - allow app to start even if Elasticsearch is unavailable
    // Search functionality will be unavailable but app will still function
  }
}

/**
 * Shutdown search infrastructure gracefully
 */
export async function shutdownSearch(): Promise<void> {
  try {
    logger.info('Shutting down search infrastructure...');
    await employeeSearchService.disconnect();
    logger.info('Search infrastructure shut down successfully');
  } catch (error) {
    logger.error({ error }, 'Error shutting down search infrastructure');
  }
}
