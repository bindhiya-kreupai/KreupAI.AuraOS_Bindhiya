/**
 * Scheduler Infrastructure Initialization
 * Sets up background job scheduler at application startup.
 *
 * IMPORTANT: The scheduler is only started when this module's
 * initializeScheduler() function is called explicitly (e.g. from
 * the Phase 3 init pipeline or from the /api/scheduler endpoint).
 * It does NOT start on import or on every page load.
 */

import { jobScheduler } from '@/lib/queue/scheduler';
import { logger } from '@/lib/logger';

let isInitialized = false;

/**
 * Initialize and start the background job scheduler.
 *
 * This registers queue-side job handlers and starts all enabled cron
 * tasks. Safe to call multiple times; subsequent calls are no-ops.
 */
export async function initializeScheduler(): Promise<void> {
  if (isInitialized) {
    logger.debug('Scheduler already initialized, skipping');
    return;
  }

  try {
    logger.info('Initializing background job scheduler...');

    // Register queue-side handlers so that jobs dispatched through RabbitMQ
    // also get processed by the correct functions.
    await registerQueueHandlers();

    // Start all enabled cron tasks
    jobScheduler.startAll();

    isInitialized = true;

    const status = jobScheduler.getStatus();
    logger.info(
      {
        totalJobs: status.totalJobs,
        enabledJobs: status.enabledJobs,
        isRunning: status.isRunning,
      },
      'Background job scheduler initialized and started'
    );
  } catch (error: any) {
    logger.error({ error }, 'Failed to initialize background job scheduler');
    // Don't throw - allow app to start even if scheduler fails.
    // Jobs can still be triggered manually via the API.
  }
}

/**
 * Stop the scheduler gracefully.
 */
export async function shutdownScheduler(): Promise<void> {
  try {
    logger.info('Shutting down background job scheduler...');
    jobScheduler.stopAll();
    isInitialized = false;
    logger.info('Background job scheduler shut down successfully');
  } catch (error: any) {
    logger.error({ error }, 'Error shutting down background job scheduler');
  }
}

/**
 * Register handlers on the queue service so that jobs enqueued via
 * RabbitMQ (by the scheduler or by other producers) are processed
 * by the correct job functions.
 */
async function registerQueueHandlers(): Promise<void> {
  // Dynamic imports to keep the init module lightweight and avoid circular deps
  const { queueService } = await import('@/lib/queue/queue.service');
  const { processLeaveAccruals } = await import('@/lib/jobs/leaveAccrualJob');
  const { processPayroll } = await import('@/lib/jobs/payrollProcessingJob');
  const { runComplianceChecks } = await import('@/lib/jobs/complianceCheckJob');
  const { runGccComplianceMaintenance } = await import('@/lib/jobs/gccComplianceJob');
  const { enforceDataRetention } = await import('@/lib/jobs/dataRetentionJob');
  const { sendAnniversaryReminders } = await import('@/lib/jobs/anniversaryReminderJob');
  const { generateAIRecommendations } = await import('@/lib/jobs/aiRecommendationJob');
  const { generateReport } = await import('@/lib/jobs/reportGenerationJob');
  const { generateTaxDocuments } = await import('@/lib/jobs/taxDocumentGenerationJob');

  queueService.registerHandler('DAILY_PAYROLL_CHECK', async (job) => {
    const result = await processPayroll(`payroll-daily-${Date.now()}`);
    return { success: result.success, data: result };
  });

  queueService.registerHandler('MONTHLY_PAYROLL_INIT', async (job) => {
    const runId = `payroll-monthly-${new Date().toISOString().slice(0, 7)}`;
    const result = await processPayroll(runId);
    return { success: result.success, data: result };
  });

  queueService.registerHandler('LEAVE_ACCRUAL', async (job) => {
    const result = await processLeaveAccruals();
    return { success: result.success, data: result };
  });

  queueService.registerHandler('ATTENDANCE_ANOMALY_CHECK', async (job) => {
    const result = await runComplianceChecks();
    return { success: result.success, data: result };
  });

  queueService.registerHandler('WEEKLY_REPORTS', async (job) => {
    const result = await generateReport('weekly-summary', 'pdf');
    return { success: result.success, data: result };
  });

  queueService.registerHandler('MONTHLY_STATUTORY_REPORTS', async (job) => {
    const currentYear = new Date().getFullYear();
    const result = await generateTaxDocuments(currentYear, 'W2');
    return { success: result.success, data: result };
  });

  queueService.registerHandler('CACHE_WARMUP', async (job) => {
    const aiResult = await generateAIRecommendations();
    const anniversaryResult = await sendAnniversaryReminders();
    return {
      success: aiResult.success && anniversaryResult.success,
      data: {
        ai: aiResult,
        anniversaries: anniversaryResult,
      },
    };
  });

  queueService.registerHandler('DB_CLEANUP', async (job) => {
    const result = await enforceDataRetention();
    return { success: result.success, data: result };
  });

  queueService.registerHandler('GCC_COMPLIANCE_MAINTENANCE', async (job) => {
    const result = await runGccComplianceMaintenance();
    return { success: result.success, data: result };
  });

  logger.info('Queue-side job handlers registered for all 9 scheduled job types');
}
