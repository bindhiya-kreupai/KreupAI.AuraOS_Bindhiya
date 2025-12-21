/**
 * Query Performance Monitoring API
 * Provides real-time query performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryMonitor } from '@/lib/monitoring/query-monitor';
import { authenticateRequest } from '@/lib/middleware/auth';
import { checkPermission } from '@/lib/middleware/rbac';
import { logger } from '@/lib/logger';

/**
 * GET /api/monitoring/queries
 * Get query performance statistics
 *
 * @swagger
 * /api/monitoring/queries:
 *   get:
 *     tags: [Monitoring]
 *     summary: Get query performance statistics
 *     description: Returns real-time database query performance metrics. Requires ADMIN role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Query performance statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalQueries:
 *                           type: number
 *                         slowQueries:
 *                           type: number
 *                         verySlowQueries:
 *                           type: number
 *                         criticalQueries:
 *                           type: number
 *                         averageDuration:
 *                           type: number
 *                         maxDuration:
 *                           type: number
 *                     slowQueryPercentage:
 *                       type: number
 *                     criticalQueryPercentage:
 *                       type: number
 *                     topSlowQueries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           query:
 *                             type: string
 *                           duration:
 *                             type: number
 *                           timestamp:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      logger.warn('Unauthorized monitoring access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = authResult.user!;

    // Check admin permission
    if (!checkPermission(user, 'monitoring', 'read')) {
      logger.warn({ userId: user.id }, 'User attempted to access monitoring without permission');
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get query statistics
    const summary = queryMonitor.getSummary();

    logger.info({ userId: user.id }, 'Query monitoring stats accessed');

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching query monitoring stats');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monitoring stats' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/monitoring/queries
 * Reset query statistics
 *
 * @swagger
 * /api/monitoring/queries:
 *   delete:
 *     tags: [Monitoring]
 *     summary: Reset query performance statistics
 *     description: Clears all collected query performance metrics. Requires ADMIN role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics reset successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = authResult.user!;

    // Check admin permission
    if (!checkPermission(user, 'monitoring', 'write')) {
      logger.warn({ userId: user.id }, 'User attempted to reset monitoring stats without permission');
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Reset statistics
    queryMonitor.reset();

    logger.info({ userId: user.id }, 'Query monitoring stats reset');

    return NextResponse.json({
      success: true,
      message: 'Query statistics reset successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Error resetting query monitoring stats');
    return NextResponse.json(
      { success: false, error: 'Failed to reset monitoring stats' },
      { status: 500 }
    );
  }
}
