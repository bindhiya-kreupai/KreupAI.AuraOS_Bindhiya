/**
 * Monitoring API Swagger Documentation
 */

/**
 * @swagger
 * tags:
 *   name: Monitoring
 *   description: System monitoring and performance metrics endpoints
 */

/**
 * @swagger
 * /api/monitoring/queries:
 *   get:
 *     tags: [Monitoring]
 *     summary: Get database query performance statistics
 *     description: Returns real-time query performance metrics including slow query detection, average duration, and performance trends. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Query performance statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalQueries:
 *                           type: number
 *                           description: Total number of queries executed
 *                           example: 1523
 *                         slowQueries:
 *                           type: number
 *                           description: Number of queries exceeding 100ms
 *                           example: 45
 *                         verySlowQueries:
 *                           type: number
 *                           description: Number of queries exceeding 500ms
 *                           example: 8
 *                         criticalQueries:
 *                           type: number
 *                           description: Number of queries exceeding 1000ms
 *                           example: 2
 *                         totalDuration:
 *                           type: number
 *                           description: Total execution time of all queries (ms)
 *                           example: 35782
 *                         averageDuration:
 *                           type: number
 *                           description: Average query execution time (ms)
 *                           example: 23.5
 *                         minDuration:
 *                           type: number
 *                           description: Fastest query execution time (ms)
 *                           example: 2
 *                         maxDuration:
 *                           type: number
 *                           description: Slowest query execution time (ms)
 *                           example: 1250
 *                     slowQueryPercentage:
 *                       type: number
 *                       description: Percentage of slow queries
 *                       example: 2.95
 *                     criticalQueryPercentage:
 *                       type: number
 *                       description: Percentage of critical queries
 *                       example: 0.13
 *                     topSlowQueries:
 *                       type: array
 *                       description: List of slowest queries
 *                       items:
 *                         type: object
 *                         properties:
 *                           query:
 *                             type: string
 *                             description: Query identifier (Model.Action)
 *                             example: Employee.findMany
 *                           duration:
 *                             type: number
 *                             description: Execution time in milliseconds
 *                             example: 1250
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             description: When the query was executed
 *                             example: 2025-12-21T10:30:45.123Z
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     tags: [Monitoring]
 *     summary: Reset query performance statistics
 *     description: Clears all collected query performance metrics. Useful after deployments or for testing. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Query statistics reset successfully
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Monitoring]
 *     summary: Health check endpoint
 *     description: Returns system health status including database connectivity, cache availability, and query performance metrics. Public endpoint.
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-12-21T10:30:45.123Z
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 3600
 *                 environment:
 *                   type: string
 *                   example: production
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 node:
 *                   type: string
 *                   description: Node.js version
 *                   example: v20.10.0
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [healthy, unhealthy]
 *                           example: healthy
 *                         responseTime:
 *                           type: string
 *                           example: 15ms
 *                     cache:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [healthy, unavailable]
 *                           example: healthy
 *                     api:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: healthy
 *                         responseTime:
 *                           type: string
 *                           example: 25ms
 *                 performance:
 *                   type: object
 *                   properties:
 *                     queries:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 1523
 *                         slow:
 *                           type: number
 *                           example: 45
 *                         critical:
 *                           type: number
 *                           example: 2
 *                         averageDuration:
 *                           type: string
 *                           example: 23.50ms
 *       503:
 *         description: System is unhealthy or degraded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [degraded, unhealthy]
 *                   example: degraded
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */

export {};
