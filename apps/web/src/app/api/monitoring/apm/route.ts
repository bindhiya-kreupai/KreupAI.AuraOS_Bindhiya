/**
 * APM Monitoring API
 *
 * Provides access to Application Performance Monitoring metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { apm, apmConfig } from '@/lib/monitoring/apm';
import { getPrismaQueryStats, resetPrismaQueryStats } from '@/lib/monitoring/prisma-apm';

/**
 * GET - Fetch APM metrics and statistics
 */
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SYSTEM, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    let data: any = {};

    switch (type) {
      case 'overview':
        data = {
          apm: {
            enabled: apm.isEnabled(),
            config: apmConfig,
            currentTransaction: apm.getCurrentTransaction()
          },
          queries: getPrismaQueryStats()
        };
        break;

      case 'queries':
        data = getPrismaQueryStats();
        break;

      case 'config':
        data = {
          enabled: apm.isEnabled(),
          ...apmConfig
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching APM metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch APM metrics' },
      { status: 500 }
    );
  }
});

/**
 * POST - Control APM operations (reset stats, etc.)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SYSTEM, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'reset_query_stats':
        resetPrismaQueryStats();
        return NextResponse.json({
          success: true,
          message: 'Query statistics reset successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing APM action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform APM action' },
      { status: 500 }
    );
  }
});
