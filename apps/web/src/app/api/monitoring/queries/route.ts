/**
 * Query Performance Monitoring API
 * Provides real-time query performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryMonitor } from '@/lib/monitoring/query-monitor';
import { withEnhancedAuth, Resource, Action } from '@/lib/auth';
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
export const GET = withEnhancedAuth(async (request: NextRequest) => {
  try {
    const summary = queryMonitor.getSummary();
    
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Error fetching query stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}, {
    resource: Resource.SYSTEM_SETTINGS,
    action: Action.READ
});
