/**
 * Job Scheduler
 * Handles scheduled/periodic jobs using cron expressions
 */

import cron from 'node-cron';
import { queueService } from './queue.service';
import { QUEUE_NAMES } from './rabbitmq';
import { logger } from '@/lib/logger';

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
}

/**
 * Job Scheduler Service
 */
export class JobScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private jobConfigs: Map<string, ScheduledJob> = new Map();

  constructor() {
    // Register default scheduled jobs
    this.registerDefaultJobs();
  }

  /**
   * Register a scheduled job
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
        scheduled: config.enabled,
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
   * Execute a scheduled job
   */
  private async executeJob(config: ScheduledJob): Promise<void> {
    try {
      logger.info({ jobId: config.id, name: config.name }, 'Executing scheduled job');

      // Enqueue the job
      const jobId = await queueService.enqueue(config.queue, config.jobType, config.data);

      // Update last run time
      config.lastRun = new Date().toISOString();
      this.jobConfigs.set(config.id, config);

      logger.info(
        { jobId: config.id, enqueuedJobId: jobId, name: config.name },
        'Scheduled job enqueued successfully'
      );
    } catch (error) {
      logger.error(
        { error, jobId: config.id, name: config.name },
        'Failed to execute scheduled job'
      );
    }
  }

  /**
   * Unschedule a job
   */
  unschedule(jobId: string): void {
    const task = this.tasks.get(jobId);
    if (task) {
      task.stop();
      this.tasks.delete(jobId);
      logger.info({ jobId }, 'Job unscheduled');
    }
  }

  /**
   * Pause a job
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
   * Resume a job
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
   * Get all scheduled jobs
   */
  getJobs(): ScheduledJob[] {
    return Array.from(this.jobConfigs.values());
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): ScheduledJob | undefined {
    return this.jobConfigs.get(jobId);
  }

  /**
   * Register default scheduled jobs
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
      enabled: false, // Disabled by default, enable manually
    });

    // Monthly payroll initiation (1st day of month at 2 AM)
    this.schedule({
      id: 'monthly-payroll-init',
      name: 'Monthly Payroll Initiation',
      cronExpression: '0 2 1 * *', // 1st day of every month at 2 AM
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'MONTHLY_PAYROLL_INIT',
      data: {},
      enabled: false,
    });

    // Leave balance update (daily at 1 AM)
    this.schedule({
      id: 'daily-leave-accrual',
      name: 'Daily Leave Accrual',
      cronExpression: '0 1 * * *', // Every day at 1 AM
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'LEAVE_ACCRUAL',
      data: {},
      enabled: false,
    });

    // Attendance anomaly detection (hourly)
    this.schedule({
      id: 'hourly-attendance-check',
      name: 'Hourly Attendance Anomaly Check',
      cronExpression: '0 * * * *', // Every hour
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'ATTENDANCE_ANOMALY_CHECK',
      data: {},
      enabled: false,
    });

    // Weekly reports generation (Monday at 8 AM)
    this.schedule({
      id: 'weekly-reports',
      name: 'Weekly Reports Generation',
      cronExpression: '0 8 * * 1', // Every Monday at 8 AM
      queue: QUEUE_NAMES.REPORT_GENERATION,
      jobType: 'WEEKLY_REPORTS',
      data: {},
      enabled: false,
    });

    // Monthly statutory reports (Last day of month at 11 PM)
    this.schedule({
      id: 'monthly-statutory-reports',
      name: 'Monthly Statutory Reports',
      cronExpression: '0 23 L * *', // Last day of month at 11 PM
      queue: QUEUE_NAMES.REPORT_GENERATION,
      jobType: 'MONTHLY_STATUTORY_REPORTS',
      data: {},
      enabled: false,
    });

    // Cache warmup (every 6 hours)
    this.schedule({
      id: 'cache-warmup',
      name: 'Cache Warmup',
      cronExpression: '0 */6 * * *', // Every 6 hours
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'CACHE_WARMUP',
      data: {},
      enabled: false,
    });

    // Database cleanup (daily at 3 AM)
    this.schedule({
      id: 'daily-db-cleanup',
      name: 'Daily Database Cleanup',
      cronExpression: '0 3 * * *', // Every day at 3 AM
      queue: QUEUE_NAMES.SCHEDULED_JOBS,
      jobType: 'DB_CLEANUP',
      data: {},
      enabled: false,
    });

    logger.info('Default scheduled jobs registered');
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll(): void {
    this.tasks.forEach((task, jobId) => {
      task.stop();
      logger.info({ jobId }, 'Job stopped');
    });

    logger.info('All scheduled jobs stopped');
  }

  /**
   * Start all enabled jobs
   */
  startAll(): void {
    this.tasks.forEach((task, jobId) => {
      const config = this.jobConfigs.get(jobId);
      if (config?.enabled) {
        task.start();
        logger.info({ jobId }, 'Job started');
      }
    });

    logger.info('All enabled jobs started');
  }
}

// Export singleton instance
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
 * Every minute:        * * * * *
 * Every 5 minutes:     *\/5 * * * *
 * Every hour:          0 * * * *
 * Every day at midnight: 0 0 * * *
 * Every Monday:        0 0 * * 1
 * 1st day of month:    0 0 1 * *
 * Last day of month:   0 0 L * *
 * Every weekday:       0 0 * * 1-5
 * Every 6 hours:       0 *\/6 * * *
 */
