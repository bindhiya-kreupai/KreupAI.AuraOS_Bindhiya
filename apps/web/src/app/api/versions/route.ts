/**
 * API Versions Information Endpoint
 * Public endpoint providing API version information and migration guides
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import {
  API_VERSIONS,
  DEFAULT_API_VERSION,
  LATEST_API_VERSION,
} from '@/lib/middleware/api-version';
import {
  VERSION_REGISTRY,
  getActiveVersions,
  getDeprecatedVersions,
  MigrationGuide,
  VersionAnnouncements,
} from '@/lib/versioning/version-manager';
import { logger } from '@/lib/logger';

/**
 * GET /api/versions
 * Get information about all API versions
 *
 * @swagger
 * /api/versions:
 *   get:
 *     tags: [Metadata]
 *     summary: Get API version information
 *     description: Returns information about all available API versions, including active, deprecated, and sunset versions. Public endpoint.
 *     responses:
 *       200:
 *         description: API version information
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
 *                       description: Active versions
 *                       items:
 *                         type: string
 *                       example: [v1]
 *                     deprecated:
 *                       type: array
 *                       description: Deprecated versions
 *                       items:
 *                         type: string
 *                       example: []
 *                     versions:
 *                       type: object
 *                       description: Detailed information for each version
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           version:
 *                             type: string
 *                           releaseDate:
 *                             type: string
 *                             format: date
 *                           status:
 *                             type: string
 *                             enum: [active, deprecated, sunset]
 *                           sunsetDate:
 *                             type: string
 *                             format: date
 *                           changelog:
 *                             type: array
 *                             items:
 *                               type: string
 *                           breakingChanges:
 *                             type: array
 *                             items:
 *                               type: string
 *                     announcements:
 *                       type: array
 *                       description: Version-related announcements
 *                       items:
 *                         type: object
 *                         properties:
 *                           version:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [release, deprecation, sunset]
 *                           date:
 *                             type: string
 *                             format: date
 *                           title:
 *                             type: string
 *                           message:
 *                             type: string
 *                           actionRequired:
 *                             type: boolean
 */
export async function GET(request: NextRequest) {
  try {
    const activeVersions = getActiveVersions();
    const deprecatedVersions = getDeprecatedVersions();
    const announcements = VersionAnnouncements.getAnnouncements();

    logger.info('API version information accessed');

    return NextResponse.json({
      success: true,
      data: {
        current: LATEST_API_VERSION,
        default: DEFAULT_API_VERSION,
        supported: [...API_VERSIONS],
        active: activeVersions,
        deprecated: deprecatedVersions,
        versions: VERSION_REGISTRY,
        announcements,
      },
    });
  } catch {
    logger.error({ error }, 'Error fetching API version information');
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch version information',
      },
      { status: 500 }
    );
  }
}
