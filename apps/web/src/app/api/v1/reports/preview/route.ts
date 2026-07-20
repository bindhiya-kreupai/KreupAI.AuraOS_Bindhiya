import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ReportMetadataService } from '@/lib/services/report-metadata.service';

/**
 * POST /api/v1/reports/preview
 * Runs a real, tenant-scoped preview query for the given data source, projected to the
 * selected columns. Powers the custom report builder preview (ColumnPicker/ReportPreview).
 *
 * Body: { dataSource: string, columns?: string[], limit?: number }
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
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

    const body = await request.json().catch(() => ({}));
    const dataSource: string = body.dataSource;
    if (!dataSource) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4000',
            message: 'dataSource is required',
            messageAr: 'مصدر البيانات مطلوب',
          },
        },
        { status: 400 }
      );
    }

    const selectedColumns: string[] = Array.isArray(body.columns) ? body.columns : [];
    const limit: number = typeof body.limit === 'number' ? body.limit : 25;

    const result = await ReportMetadataService.preview(
      dataSource,
      user.tenantId,
      selectedColumns,
      limit
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5000',
          message: error?.message || 'Failed to generate report preview',
          messageAr: 'فشل إنشاء معاينة التقرير',
        },
      },
      { status: 500 }
    );
  }
});
