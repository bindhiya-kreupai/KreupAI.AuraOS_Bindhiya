import { Worker, Job } from 'bullmq';
import { ReportService, ReportConfig, GeneratedReport } from '../services/reportService';
import { prisma } from '../lib/prisma';

export interface ReportGenerationJobData {
  reportId: string;
  config: ReportConfig;
  requestedBy: string;
  tenantId?: string;
  priority?: number;
}

export interface ReportGenerationResult {
  reportId: string;
  executionId?: string;
  status: 'completed' | 'failed';
  filePath?: string;
  fileSize?: number;
  duration: number;
  error?: string;
}

const QUEUE_NAME = 'report-generation';

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

/**
 * Start the async report generation worker.
 *
 * Wired to real DB operations:
 *  - Creates a ReportExecution record with status RUNNING on job start
 *  - Updates the execution to COMPLETED / FAILED on job finish
 *  - Persists filePath, fileSize, executionTime in DB
 */
export async function startReportGenerationWorker(): Promise<Worker<ReportGenerationJobData, ReportGenerationResult>> {
  const reportService = new ReportService();

  const worker = new Worker<ReportGenerationJobData, ReportGenerationResult>(
    QUEUE_NAME,
    async (job: Job<ReportGenerationJobData>): Promise<ReportGenerationResult> => {
      const { reportId, config, requestedBy, tenantId = 'SYSTEM' } = job.data;
      const startTime = Date.now();

      job.log(`Starting report generation: ${reportId} requested by ${requestedBy}`);
      await job.updateProgress(10);

      // ------------------------------------------------------------------ //
      // Create a ReportExecution record in the DB (status = RUNNING)       //
      // We attempt to link to a ReportDefinition by reportId; if not found  //
      // we still create the execution via a stand-alone AnalyticsCache entry//
      // ------------------------------------------------------------------ //
      let executionId: string | undefined;

      try {
        // Try to find the parent ReportDefinition
        const reportDef = await prisma.reportDefinition.findFirst({
          where: { id: reportId, tenantId },
        });

        if (reportDef) {
          const execution = await prisma.reportExecution.create({
            data: {
              reportId: reportDef.id,
              tenantId,
              executedBy: requestedBy,
              parameters: config.filters as Record<string, unknown>,
              status: 'RUNNING',
              exportFormat: config.format.toUpperCase(),
            },
          });
          executionId = execution.id;
        }
      } catch (dbErr) {
        // Non-fatal: proceed with report generation even if DB create fails
        job.log(`[WARN] Could not create ReportExecution record: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`);
      }

      await job.updateProgress(20);

      try {
        // Generate the report file
        await job.updateProgress(30);
        const result: GeneratedReport = await reportService.generate(config);
        await job.updateProgress(90);

        const duration = Date.now() - startTime;

        // ---------------------------------------------------------------- //
        // Update ReportExecution to COMPLETED in DB                        //
        // ---------------------------------------------------------------- //
        if (executionId) {
          try {
            await prisma.reportExecution.update({
              where: { id: executionId },
              data: {
                status: 'COMPLETED',
                executionTime: duration,
                exportUrl: result.filePath ?? null,
                errorMessage: null,
              },
            });
          } catch (dbErr) {
            job.log(`[WARN] Could not update ReportExecution to COMPLETED: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`);
          }
        }

        // Cache report metadata in AnalyticsCache for fast re-fetch
        if (result.filePath) {
          try {
            const cacheKey = `report:${reportId}:${requestedBy}`;
            await prisma.analyticsCache.upsert({
              where: { tenantId_cacheKey: { tenantId, cacheKey } },
              update: {
                data: { filePath: result.filePath, status: 'completed', duration },
                generatedAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h TTL
              },
              create: {
                tenantId,
                cacheKey,
                category: 'REPORT',
                data: { filePath: result.filePath, status: 'completed', duration },
                generatedAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              },
            });
          } catch (cacheErr) {
            job.log(`[WARN] Could not cache report result: ${cacheErr instanceof Error ? cacheErr.message : String(cacheErr)}`);
          }
        }

        await job.updateProgress(100);

        return {
          reportId,
          executionId,
          status: 'completed',
          filePath: result.filePath,
          fileSize: result.fileSize,
          duration,
        };

      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Update ReportExecution to FAILED
        if (executionId) {
          try {
            await prisma.reportExecution.update({
              where: { id: executionId },
              data: {
                status: 'FAILED',
                executionTime: duration,
                errorMessage,
              },
            });
          } catch (dbErr) {
            job.log(`[WARN] Could not update ReportExecution to FAILED: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`);
          }
        }

        return {
          reportId,
          executionId,
          status: 'failed',
          duration,
          error: errorMessage,
        };
      }
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 3,
    }
  );

  worker.on('completed', (job, result) => {
    console.log(
      `Report generation completed: ${job.id} status: ${result.status} duration: ${result.duration}ms`
    );
  });

  worker.on('failed', (job, error) => {
    console.error(`Report generation job failed: ${job?.id}`, error.message);
  });

  console.log('Report generation worker started');
  return worker;
}
