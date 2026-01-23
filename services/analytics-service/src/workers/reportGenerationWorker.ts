import { Worker, Job } from 'bullmq';
import { ReportService, ReportConfig, GeneratedReport } from '../services/reportService';

export interface ReportGenerationJobData {
  reportId: string;
  config: ReportConfig;
  requestedBy: string;
  priority?: number;
}

export interface ReportGenerationResult {
  reportId: string;
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
 * Start the async report generation worker
 */
export async function startReportGenerationWorker(): Promise<Worker<ReportGenerationJobData, ReportGenerationResult>> {
  const reportService = new ReportService();

  const worker = new Worker<ReportGenerationJobData, ReportGenerationResult>(
    QUEUE_NAME,
    async (job: Job<ReportGenerationJobData>) => {
      const { reportId, config, requestedBy } = job.data;
      const startTime = Date.now();

      job.log('Starting report generation: ' + reportId + ' requested by ' + requestedBy);
      await job.updateProgress(10);

      try {
        // Generate the report
        await job.updateProgress(30);
        const result: GeneratedReport = await reportService.generate(config);
        await job.updateProgress(90);

        const duration = Date.now() - startTime;

        // TODO: Send notification to requestedBy user
        // TODO: Store report metadata in database

        await job.updateProgress(100);

        return {
          reportId,
          status: 'completed',
          filePath: result.filePath,
          fileSize: result.fileSize,
          duration,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        return {
          reportId,
          status: 'failed',
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 3,
    }
  );

  worker.on('completed', (job, result) => {
    console.log('Report generation completed:', job.id, 'status:', result.status, 'duration:', result.duration + 'ms');
  });

  worker.on('failed', (job, error) => {
    console.error('Report generation job failed:', job?.id, error.message);
  });

  console.log('Report generation worker started');
  return worker;
}
