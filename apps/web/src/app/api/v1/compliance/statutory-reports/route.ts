import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  statutoryReportService,
  type StatutoryReportStatus,
} from '@/lib/services/statutory-report.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/compliance/statutory-reports
 * - `?mode=specs` (default): list available report generators (registry)
 * - `?mode=runs` : list previously-generated reports for this tenant
 *
 * Filters: `country`, `code`, `status` (only applicable to mode=runs)
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    const { user, permissions } = context;
    if (!permissions.includes('compliance/statutory-reports:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing compliance/statutory-reports:read',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    try {
      const { searchParams } = new URL(request.url);
      const mode = searchParams.get('mode') ?? 'specs';
      const country = searchParams.get('country') || undefined;

      if (mode === 'runs') {
        const result = await statutoryReportService.list({
          tenantId: user.tenantId,
          code: searchParams.get('code') ?? undefined,
          countryCode: country,
          status: (searchParams.get('status') as StatutoryReportStatus) ?? undefined,
          page: Number(searchParams.get('page')) || 1,
          limit: Number(searchParams.get('limit')) || 50,
        });
        return NextResponse.json({ success: true, mode: 'runs', ...result });
      }

      const specs = statutoryReportService.listSpecs({ countryCode: country });
      return NextResponse.json({
        success: true,
        mode: 'specs',
        data: specs,
        meta: {
          total: specs.length,
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to fetch statutory reports',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
