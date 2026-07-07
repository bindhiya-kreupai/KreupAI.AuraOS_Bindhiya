import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ReportMetadataService } from '@/lib/services/report-metadata.service';

/**
 * GET /api/v1/reports/metadata
 * Returns the real, tenant-scoped catalog of report data sources and their columns.
 * Optional query: ?dataSource=<id> to return columns for a single source only.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('reports:read') && !permissions.includes('analytics:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing reports:read permission',
            messageAr: 'ممنوع: صلاحية قراءة التقارير غير متوفرة',
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dataSourceId = searchParams.get('dataSource');

    if (dataSourceId) {
      const columns = ReportMetadataService.getColumns(dataSourceId);
      return NextResponse.json({ success: true, data: { dataSource: dataSourceId, columns } });
    }

    const dataSources = await ReportMetadataService.getDataSources(user.tenantId);
    return NextResponse.json({ success: true, data: { dataSources } });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5000',
          message: error?.message || 'Failed to load report metadata',
          messageAr: 'فشل تحميل بيانات التقرير الوصفية',
        },
      },
      { status: 500 }
    );
  }
});
