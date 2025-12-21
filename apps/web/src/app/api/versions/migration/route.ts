/**
 * API Version Migration Guide Endpoint
 * Provides migration guides between API versions
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiVersion, isValidVersion } from '@/lib/middleware/api-version';
import { MigrationGuide } from '@/lib/versioning/version-manager';
import { logger } from '@/lib/logger';

/**
 * GET /api/versions/migration?from=v1&to=v2
 * Get migration guide between two API versions
 *
 * @swagger
 * /api/versions/migration:
 *   get:
 *     tags: [Metadata]
 *     summary: Get API version migration guide
 *     description: Returns detailed migration steps, breaking changes, and checklist for migrating between API versions. Public endpoint.
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Source API version (e.g., v1)
 *         example: v1
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Target API version (e.g., v2)
 *         example: v1
 *     responses:
 *       200:
 *         description: Migration guide
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
 *                       example: v1
 *                     to:
 *                       type: string
 *                       example: v1
 *                     steps:
 *                       type: array
 *                       description: Migration steps
 *                       items:
 *                         type: string
 *                     breakingChanges:
 *                       type: array
 *                       description: Breaking changes to be aware of
 *                       items:
 *                         type: string
 *                     checklist:
 *                       type: array
 *                       description: Migration checklist
 *                       items:
 *                         type: object
 *                         properties:
 *                           task:
 *                             type: string
 *                           required:
 *                             type: boolean
 *                           description:
 *                             type: string
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
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromVersion = searchParams.get('from');
    const toVersion = searchParams.get('to');

    // Validate parameters
    if (!fromVersion || !toVersion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Both "from" and "to" query parameters are required',
        },
        { status: 400 }
      );
    }

    // Validate versions
    if (!isValidVersion(fromVersion) || !isValidVersion(toVersion)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API version specified',
          message: `One or both versions are invalid. Valid versions: v1`,
        },
        { status: 400 }
      );
    }

    // Get migration guide
    const steps = MigrationGuide.getMigrationSteps(
      fromVersion as ApiVersion,
      toVersion as ApiVersion
    );
    const breakingChanges = MigrationGuide.getBreakingChanges(
      fromVersion as ApiVersion,
      toVersion as ApiVersion
    );
    const checklist = MigrationGuide.generateChecklist(
      fromVersion as ApiVersion,
      toVersion as ApiVersion
    );

    logger.info(
      { fromVersion, toVersion },
      'Migration guide accessed'
    );

    return NextResponse.json({
      success: true,
      data: {
        from: fromVersion,
        to: toVersion,
        steps,
        breakingChanges,
        checklist,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error generating migration guide');
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate migration guide',
      },
      { status: 500 }
    );
  }
}
