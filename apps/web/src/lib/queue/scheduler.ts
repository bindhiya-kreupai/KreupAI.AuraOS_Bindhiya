/**
 * Job Scheduler
 * Handles scheduled/periodic jobs using cron expressions.
 *
 * Jobs are registered with cron schedules and execute their logic directly
 * via the job functions in @/lib/jobs. When RabbitMQ is available, jobs are
 * also enqueued for distributed processing. When it is not available, jobs
 * run in-process as a fallback.
 *
 * IMPORTANT: The scheduler must be explicitly started via initializeScheduler()
 * or the /api/scheduler API endpoint. It does NOT start on import.
 */

import cron from 'node-cron';
import { queueService } from './queue.service';
import { QUEUE_NAMES } from './rabbitmq';
import { logger } from '@/lib/logger';

// Import job functions from @/lib/jobs
import { processLeaveAccruals } from '@/lib/jobs/leaveAccrualJob';
import { processPayroll } from '@/lib/jobs/payrollProcessingJob';
import { runComplianceChecks } from '@/lib/jobs/complianceCheckJob';
import { enforceDataRetention } from '@/lib/jobs/dataRetentionJob';
import { sendAnniversaryReminders } from '@/lib/jobs/anniversaryReminderJob';
import { generateAIRecommendations } from '@/lib/jobs/aiRecommendationJob';
import { generateReport } from '@/lib/jobs/reportGenerationJob';
import { generateTaxDocuments } from '@/lib/jobs/taxDocumentGenerationJob';

export interface ScheduledJob {
  id: string;
  name: string;
  cronExpression: string;
  queue: string;
  jobType: string;
  data: any;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  lastResult?: {
    success: boolean;
    processedCount: number;
    errors: string[];
    duration: number;
  };
}

/**
 * Map of job types to their direct execution functions.
 * When a scheduled job fires, the corresponding function is called directly.
 * This avoids a hard dependency on RabbitMQ being available.
 */
type JobExecutor = (data: any) => Promise<{ success: boolean; processedCount: number; errors: string[] }>;

const JOB_EXECUTORS: Record<string, JobExecutor> = {
  DAILY_PAYROLL_CHECK: async () => {
    const runId = `payroll-daily-${Date.now()}`;
    return await processPayroll(runId);
  },

  MONTHLY_PAYROLL_INIT: async () => {
    const runId = `payroll-monthly-${new Date().toISOString().slice(0, 7)}`;
    return await processPayroll(runId);
  },

  LEAVE_ACCRUAL: async () => {
    return await processLeaveAccruals();
  },

  ATTENDANCE_ANOMALY_CHECK: async () => {
    // Compliance checks cover attendance anomaly detection (break compliance,
    // overtime, working hours limits).
    return await runComplianceChecks();
  },

  WEEKLY_REPORTS: async () => {
    return await generateReport('weekly-summary', 'pdf');
  },

  MONTHLY_STATUTORY_REPORTS: async () => {
    const currentYear = new Date().getFullYear();
    return await generateTaxDocuments(currentYear, 'W2');
  },

  CACHE_WARMUP: async () => {
    // Cache warmup triggers AI recommendation pre-computation and anniversary
    // scanning so that data is fresh for the next business day.
    const aiResult = await generateAIRecommendations();
    const anniversaryResult = await sendAnniversaryReminders();
    return {
      success: aiResult.success && anniversaryResult.success,
      processedCount: aiResult.processedCount + anniversaryResult.processedCount,
      errors: [...aiResult.errors, ...anniversaryResult.errors],
    };
  },

  DB_CLEANUP: async () => {
    return await enforceDataRetention();
  },
};

/**
 * Job Scheduler Service
 *
 * The scheduler registers cron tasks on construction but does NOT start them.
 * Call startAll() (or the init module) to begin scheduling.
 */
export class JobScheduler {
  private tasks: Map<string, ReturnType<typeof cron.schedule>> = new Map();
  private jobConfigs: Map<string, ScheduledJob> = new Map();
  private _isRunning = false;

  constructor() {
    // Register default scheduled jobs (none are started yet)
    this.registerDefaultJobs();
  }

  /**
   * Whether the scheduler is currently running (i.e. cron tasks are active).
   */
  get isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * Register a scheduled job.
   * The task is created but only started if config.enabled is true AND
   * the scheduler has been explicitly started.
   */
  schedule(config: ScheduledJob): void {
    if (!cron.validate(config.cronExpression)) {
      logger.error(
        { jobId: config.id, expression: config.cronExpression },
        'Invalid cron expression'
      );
      return;
    }

    // Stop existing task if running
    if (this.tasks.has(config.id)) {
      this.unschedule(config.id);
    }

    const task = cron.schedule(
      config.cronExpression,
      async () => {
        await this.executeJob(config);
      },
      {
        scheduled: false, // Never auto-start; we control lifecycle explicitly
      }
    );

    this.tasks.set(config.id, task);
    this.jobConfigs.set(config.id, config);

    logger.info(
      {
        jobId: config.id,
        name: config.name,
        expression: config.cronExpression,
        enabled: config.enabled,
      },
      'Scheduled job registered'
    );
  }

  /**
   * Execute a scheduled job.
   *
   * Strategy:
   * 1. Try to execute the job directly via JOB_EXECUTORS (in-process).
   * 2. Also try to enqueue the job via RabbitMQ for distributed workers.
   * 3. Log the result and update job metadata.
   */
  private async executeJob(config: ScheduledJob): Promise<void> {
    const startTime = performance.now();

    try {
      logger.info(
        { jobId: config.id, name: config.name, jobType: config.jobType },
        'Executing scheduled job'
      );

      // Direct execution via job executor
      const executor = JOB_EXECUTORS[config.jobType];
      if (executor) {
        const result = await executor(config.data);
        const duration = Math.round(performance.now() - startTime);

        // Update last run metadata
        config.lastRun = new Date().toISOString();
        config.lastResult = {
          success: result.success,
          processedCount: result.processedCount,
          errors: result.errors,
          duration,
        };
        this.jobConfigs.set(config.id, config);

        if (result.success) {
          logger.info(
            {
              jobId: config.id,
              name: config.name,
              processedCount: result.processedCount,
              duration,
            },
            'Scheduled job completed successfully'
          );
        } else {
          logger.warn(
            {
              jobId: config.id,
              name: config.name,
              errors: result.errors,
              processedCount: result.processedCount,
              duration,
            },
            'Scheduled job completed with errors'
          );
        }
      } else {
        // No direct executor; fall back to queue-only path
        logger.warn(
          { jobId: config.id, jobType: config.jobType },
          'No direct executor found, attempting queue dispatch only'
        );
      }

      // Also enqueue to RabbitMQ for distributed processing (best-effort)
      try {
        await queueService.enqueue(config.queue, config.jobType, {
          ...config.data,
          scheduledJobId: config.id,
          triggeredAt: new Date().toISOString(),
        });

        logger.info(
          { jobId: config.id, name: config.name },
          'Scheduled job also enqueued to message queue'
        );
      } catch (enqueueError) {
        // Queue dispatch is best-effort; the direct execution already ran
        logger.debug(
          { error: enqueueError, jobId: config.id },
          'Queue dispatch skipped (queue unavailable)'
        );
      }
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);

      config.lastRun = new Date().toISOString();
      config.lastResult = {
        success: false,
        processedCount: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        duration,
      };
      this.jobConfigs.set(config.id, config);

      logger.error(
        { error, jobId: config.id, name: config.name, duration },
        'Failed to execute scheduled job'
      );
    }
  }

  /**
   * Unschedule a job (removes it entirely)
   */
  unschedule(jobId: string): void {
    const task = this.tasks.get(jobId);
    if (task) {
      task.stop();
      this.tasks.delete(jobId);
      this.jobConfigs.delete(jobId);
      logger.info({ jobId }, 'Job unscheduled');
    }
  }

  /**
   * Pause a single job
   */
  pause(jobId: string): void {
    const task = this.tasks.get(jobId);
    const config = this.jobConfigs.get(jobId);

    if (task && config) {
      task.stop();
      config.enabled = false;
      this.jobConfigs.set(jobId, config);
      logger.info({ jobId }, 'Job paused');
    }
  }

  /**
   * Resume a single job
   */
  resume(jobId: string): void {
    const task = this.tasks.get(jobId);
    const config = this.jobConfigs.get(jobId);

    if (task && config) {
      task.start();
      config.enabled = true;
      this.jobConfigs.set(jobId, config);
      logger.info({ jobId }, 'Job resumed');
    }
  }

  /**
   * Trigger a specific job immediately (on-demand execution)
   */
  async triggerNow(jobId: string): Promise<{
    success: boolean;
    message: string;
    result?: ScheduledJob['lastResult'];
  }> {
    const config = this.jobConfigs.get(jobId);
    if (!config) {
      return { success: false, message: `Job '${jobId}' not found` };
    }

    logger.info({ jobId }, 'Triggering job on-demand');
    await this.executeJob(config);

    return {
      success: config.lastResult?.success ?? false,
      message: `Job '${config.name}' executed`,
      result: config.lastResult,
    };
  }

  /**
   * Get all scheduled jobs with their current status
   */
  getJobs(): ScheduledJob[] {
    return Array.from(this.jobConfigs.values());
  }

  /**
   * Get a single job by ID
   */
  getJob(jobId: string): ScheduledJob | undefined {
    return this.jobConfigs.get(jobId);
  }

  /**
   * Register all default scheduled jobs.
   * All jobs are enabled by default. The scheduler's startAll() method
   * controls when cron tasks actually begin firing.
   */
  private registerDefaultJobs(): void {
    // Daily payroll processing (midnight)
    this.schedule({
      id: 'daily-payroll-check',
      name: 'Daily Payroll Check',
      cronExpression: '0 0 * * *', // Every day at midnight
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'DAILY_PAYROLL_CHECK',
      data: {},
      enabled: true,
    });

    // Monthly payroll initiation (1st day of month at 2 AM)
    this.schedule({
      id: 'monthly-payroll-init',
      name: 'Monthly Payroll Initiation',
      cronExpression: '0 2 1 * *', // 1st day of every month at 2 AM
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'MONTHLY_PAYROLL_INIT',
      data: {},
      enabled: true,
    });

    // Leave balance update (daily at 1 AM)
    this.schedule({
      id: 'daily-leave-accrual',
      name: 'Daily Leave Accrual',
      cronExpression: '0 1 * * *', // Every day at 1 AM
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'LEAVE_ACCRUAL',
      data: {},
      enabled: true,
    });

    // Attendance anomaly detection (hourly)
    this.schedule({
      id: 'hourly-attendance-check',
      name: 'Hourly Attendance Anomaly Check',
      cronExpression: '0 * * * *', // Every hour
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'ATTENDANCE_ANOMALY_CHECK',
      data: {},
      enabled: true,
    });

    // Weekly reports generation (Monday at 8 AM)
    this.schedule({
      id: 'weekly-reports',
      name: 'Weekly Reports Generation',
      cronExpression: '0 8 * * 1', // Every Monday at 8 AM
      queue: QUEUE_NAMES.REPORT_GENERATION,
      jobType: 'WEEKLY_REPORTS',
      data: {},
      enabled: true,
    });

    // Monthly statutory reports (28th of every month at 11 PM)
    // Note: Using 28th instead of 'L' (last day) because node-cron does not
    // support the 'L' modifier. This ensures the job runs reliably every month.
    this.schedule({
      id: 'monthly-statutory-reports',
      name: 'Monthly Statutory Reports',
      cronExpression: '0 23 28 * *', // 28th of every month at 11 PM
      queue: QUEUE_NAMES.REPORT_GENERATION,
      jobType: 'MONTHLY_STATUTORY_REPORTS',
      data: {},
      enabled: true,
    });

    // Cache warmup (every 6 hours)
    this.schedule({
      id: 'cache-warmup',
      name: 'Cache Warmup',
      cronExpression: '0 */6 * * *', // Every 6 hours
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'CACHE_WARMUP',
      data: {},
      enabled: true,
    });

    // Database cleanup (daily at 3 AM)
    this.schedule({
      id: 'daily-db-cleanup',
      name: 'Daily Database Cleanup',
      cronExpression: '0 3 * * *', // Every day at 3 AM
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'DB_CLEANUP',
      data: {},
      enabled: true,
    });

    logger.info(
      { jobCount: this.jobConfigs.size },
      'Default scheduled jobs registered (all enabled)'
    );
  }

  /**
   * Stop all scheduled cron tasks.
   * Jobs remain registered but will not fire until startAll() is called again.
   */
  stopAll(): void {
    this.tasks.forEach((task, jobId) => {
      task.stop();
      logger.info({ jobId }, 'Job stopped');
    });

    this._isRunning = false;
    logger.info('All scheduled jobs stopped');
  }

  /**
   * Start all enabled cron tasks.
   * This is the only way jobs begin executing on their cron schedules.
   */
  startAll(): void {
    let startedCount = 0;

    this.tasks.forEach((task, jobId) => {
      const config = this.jobConfigs.get(jobId);
      if (config?.enabled) {
        task.start();
        startedCount++;
        logger.info({ jobId, name: config.name }, 'Job started');
      }
    });

    this._isRunning = true;

    logger.info(
      { startedCount, totalJobs: this.jobConfigs.size },
      'Scheduler started: all enabled jobs are now active'
    );
  }

  /**
   * Get a summary of the scheduler's state for monitoring / health checks.
   */
  getStatus(): {
    isRunning: boolean;
    totalJobs: number;
    enabledJobs: number;
    jobs: Array<{
      id: string;
      name: string;
      enabled: boolean;
      cronExpression: string;
      lastRun?: string;
      lastSuccess?: boolean;
    }>;
  } {
    const jobs = this.getJobs().map((j) => ({
      id: j.id,
      name: j.name,
      enabled: j.enabled,
      cronExpression: j.cronExpression,
      lastRun: j.lastRun,
      lastSuccess: j.lastResult?.success,
    }));

    return {
      isRunning: this._isRunning,
      totalJobs: jobs.length,
      enabledJobs: jobs.filter((j) => j.enabled).length,
      jobs,
    };
  }
}

// Export singleton instance.
// The scheduler registers jobs on construction but does NOT start them.
export const jobScheduler = new JobScheduler();

// Graceful shutdown
process.on('SIGINT', () => {
  jobScheduler.stopAll();
});

process.on('SIGTERM', () => {
  jobScheduler.stopAll();
});

/**
 * Common cron expressions for reference:
 *
 * Every minute:          * * * * *
 * Every 5 minutes:       *\/5 * * * *
 * Every hour:            0 * * * *
 * Every day at midnight: 0 0 * * *
 * Every Monday:          0 0 * * 1
 * 1st day of month:      0 0 1 * *
 * 28th of month:         0 0 28 * *
 * Every weekday:         0 0 * * 1-5
 * Every 6 hours:         0 *\/6 * * *
 */
