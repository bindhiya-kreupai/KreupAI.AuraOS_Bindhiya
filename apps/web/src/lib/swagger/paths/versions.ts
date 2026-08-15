/**
 * API Versions Swagger Documentation
 */

/**
 * @swagger
 * tags:
 *   name: Metadata
 *   description: API metadata and version information endpoints
 */

/**
 * @swagger
 * /api/versions:
 *   get:
 *     tags: [Metadata]
 *     summary: Get API version information
 *     description: |
 *       Returns comprehensive information about all available API versions including:
 *       - Current and default versions
 *       - Supported, active, and deprecated versions
 *       - Detailed metadata for each version (release date, status, changelog, breaking changes)
 *       - Version-related announcements
 *
 *       This is a public endpoint that requires no authentication.
 *     responses:
 *       200:
 *         description: API version information retrieved successfully
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
 *                     current:
 *                       type: string
 *                       description: Latest stable API version
 *                       example: v1
 *                     default:
 *                       type: string
 *                       description: Default version when not specified
 *                       example: v1
 *                     supported:
 *                       type: array
 *                       description: All supported versions
 *                       items:
 *                         type: string
 *                       example: [v1]
 *                     active:
 *                       type: array
 *                       description: Currently active versions
 *                       items:
 *                         type: string
 *                       example: [v1]
 *                     deprecated:
 *                       type: array
 *                       description: Deprecated versions (still functional)
 *                       items:
 *                         type: string
 *                       example: []
 *                     versions:
 *                       type: object
 *                       description: Detailed metadata for each version
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           version:
 *                             type: string
 *                             example: v1
 *                           releaseDate:
 *                             type: string
 *                             format: date
 *                             example: 2025-12-21
 *                           status:
 *                             type: string
 *                             enum: [active, deprecated, sunset]
 *                             example: active
 *                           sunsetDate:
 *                             type: string
 *                             format: date
 *                             description: Date when version will be sunset (deprecated versions only)
 *                           changelog:
 *                             type: array
 *                             description: List of changes in this version
 *                             items:
 *                               type: string
 *                             example: ["Initial API release", "User management endpoints"]
 *                           breakingChanges:
 *                             type: array
 *                             description: List of breaking changes from previous version
 *                             items:
 *                               type: string
 *                             example: []
 *                     announcements:
 *                       type: array
 *                       description: Important version-related announcements
 *                       items:
 *                         type: object
 *                         properties:
 *                           version:
 *                             type: string
 *                             example: v1
 *                           type:
 *                             type: string
 *                             enum: [release, deprecation, sunset]
 *                             example: release
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: 2025-12-21
 *                           title:
 *                             type: string
 *                             example: API v1 Released
 *                           message:
 *                             type: string
 *                             example: Initial release of AuraOS API with comprehensive HRMS functionality
 *                           actionRequired:
 *                             type: boolean
 *                             description: Whether immediate action is required from API consumers
 *                             example: false
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/versions/migration:
 *   get:
 *     tags: [Metadata]
 *     summary: Get API version migration guide
 *     description: |
 *       Returns a detailed migration guide for migrating between two API versions, including:
 *       - Step-by-step migration instructions
 *       - Breaking changes to be aware of
 *       - Migration checklist with required and optional tasks
 *
 *       This is a public endpoint that requires no authentication.
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Source API version to migrate from
 *         example: v1
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Target API version to migrate to
 *         example: v1
 *     responses:
 *       200:
 *         description: Migration guide retrieved successfully
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
 *                     from:
 *                       type: string
 *                       description: Source version
 *                       example: v1
 *                     to:
 *                       type: string
 *                       description: Target version
 *                       example: v1
 *                     steps:
 *                       type: array
 *                       description: Ordered list of migration steps
 *                       items:
 *                         type: string
 *                       example: ["No migration needed - versions are the same"]
 *                     breakingChanges:
 *                       type: array
 *                       description: Breaking changes between versions
 *                       items:
 *                         type: string
 *                       example: []
 *                     checklist:
 *                       type: array
 *                       description: Migration checklist with tasks
 *                       items:
 *                         type: object
 *                         properties:
 *                           task:
 *                             type: string
 *                             description: Task name
 *                             example: Review changelog
 *                           required:
 *                             type: boolean
 *                             description: Whether this task is required
 *                             example: true
 *                           description:
 *                             type: string
 *                             description: Detailed task description
 *                             example: Review all changes in v1
 *       400:
 *         description: Invalid version parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Both "from" and "to" query parameters are required
 *                 message:
 *                   type: string
 *                   example: 'One or both versions are invalid. Valid versions: v1'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export {};
