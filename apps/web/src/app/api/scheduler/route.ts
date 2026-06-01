/**
 * Scheduler Management API
 *
 * GET  /api/scheduler         - Get scheduler status and all jobs
 * POST /api/scheduler         - Start/stop the scheduler or trigger a specific job
 *
 * POST body options:
 *   { "action": "start" }                     - Start all enabled jobs
 *   { "action": "stop" }                      - Stop all jobs
 *   { "action": "trigger", "jobId": "..." }   - Trigger a specific job immediately
 *   { "action": "pause",   "jobId": "..." }   - Pause a specific job
 *   { "action": "resume",  "jobId": "..." }   - Resume a specific job
 *
 * This endpoint is protected by a shared secret (SCHEDULER_API_SECRET env var)
 * to prevent unauthorized access. In production, you should also add proper
 * authentication via withEnhancedAuth.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jobScheduler } from '@/lib/queue/scheduler';
import { initializeScheduler, shutdownScheduler } from '@/lib/init/scheduler';
import { logger } from '@/lib/logger';

const SCHEDULER_SECRET = process.env.SCHEDULER_API_SECRET || '';

/**
 * Verify that the request carries a valid scheduler secret.
 * If SCHEDULER_API_SECRET is not configured, the endpoint is open
 * (suitable for development only).
 */
function verifyAccess(request: NextRequest): boolean {
  if (!SCHEDULER_SECRET) {
    // No secret configured: allow access (dev mode)
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }

  // Accept both "Bearer <secret>" and raw "<secret>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  return token === SCHEDULER_SECRET;
}

/**
 * GET /api/scheduler
 * Returns the current scheduler status and all registered jobs.
 */
export async function GET(request: NextRequest) {
  if (!verifyAccess(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const status = jobScheduler.getStatus();

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to get scheduler status');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scheduler
 * Manage the scheduler: start, stop, trigger, pause, or resume jobs.
 */
export async function POST(request: NextRequest) {
  if (!verifyAccess(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, jobId } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'start': {
        await initializeScheduler();
        const status = jobScheduler.getStatus();
        logger.info('Scheduler started via API');
        return NextResponse.json({
          success: true,
          message: 'Scheduler started',
          data: status,
        });
      }

      case 'stop': {
        await shutdownScheduler();
        const status = jobScheduler.getStatus();
        logger.info('Scheduler stopped via API');
        return NextResponse.json({
          success: true,
          message: 'Scheduler stopped',
          data: status,
        });
      }

      case 'trigger': {
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: jobId' },
            { status: 400 }
          );
        }

        logger.info({ jobId }, 'Job triggered via API');
        const result = await jobScheduler.triggerNow(jobId);
        return NextResponse.json({
          success: result.success,
          message: result.message,
          data: result.result,
        });
      }

      case 'pause': {
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: jobId' },
            { status: 400 }
          );
        }

        jobScheduler.pause(jobId);
        logger.info({ jobId }, 'Job paused via API');
        return NextResponse.json({
          success: true,
          message: `Job '${jobId}' paused`,
          data: jobScheduler.getJob(jobId),
        });
      }

      case 'resume': {
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: jobId' },
            { status: 400 }
          );
        }

        jobScheduler.resume(jobId);
        logger.info({ jobId }, 'Job resumed via API');
        return NextResponse.json({
          success: true,
          message: `Job '${jobId}' resumed`,
          data: jobScheduler.getJob(jobId),
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: '${action}'. Valid actions: start, stop, trigger, pause, resume`,
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error({ error }, 'Scheduler API error');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
