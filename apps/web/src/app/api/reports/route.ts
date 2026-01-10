/**
 * Reports API Routes
 * Phase 3: Intelligence Layer - Advanced Reporting
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/reporting';

/**
 * POST /api/reports
 * Generate or manage reports
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    const action = body.action || 'generate';

    switch (action) {
      case 'generate':
        // Generate report
        if (!body.reportId && !body.templateId) {
          return NextResponse.json(
            { error: 'reportId or templateId is required', errorAr: 'معرف التقرير أو القالب مطلوب' },
            { status: 400 }
          );
        }

        let reportDef;
        if (body.templateId) {
          // Create report from template
          reportDef = await ReportService.createFromTemplate(
            body.tenantId,
            body.templateId,
            body.name || 'Generated Report',
            body.createdBy || 'system'
          );
        } else {
          // Use provided report definition
          reportDef = body.reportDefinition;
        }

        if (!reportDef) {
          return NextResponse.json(
            { error: 'Report definition not found', errorAr: 'تعريف التقرير غير موجود' },
            { status: 404 }
          );
        }

        const result = await ReportService.generateReport(
          reportDef,
          body.parameters || {},
          body.format || 'PDF'
        );

        return NextResponse.json({
          success: true,
          data: result,
        });

      case 'export':
        // Export report to specific format
        if (!body.result) {
          return NextResponse.json(
            { error: 'report result is required', errorAr: 'نتيجة التقرير مطلوبة' },
            { status: 400 }
          );
        }

        const exportData = await ReportService.exportReport(
          body.result,
          body.format || 'PDF'
        );

        return NextResponse.json({
          success: true,
          data: {
            fileName: exportData.fileName,
            contentType: exportData.contentType,
            content: exportData.content,
          },
        });

      case 'schedule':
        // Schedule report
        if (!body.reportId || !body.schedule) {
          return NextResponse.json(
            { error: 'reportId and schedule are required', errorAr: 'معرف التقرير والجدولة مطلوبان' },
            { status: 400 }
          );
        }

        const schedule = await ReportService.scheduleReport(
          { ...body.reportDefinition, id: body.reportId },
          body.schedule
        );

        return NextResponse.json({
          success: true,
          data: schedule,
        });

      case 'create-from-template':
        // Create report from template
        if (!body.templateId) {
          return NextResponse.json(
            { error: 'templateId is required', errorAr: 'معرف القالب مطلوب' },
            { status: 400 }
          );
        }

        const newReport = await ReportService.createFromTemplate(
          body.tenantId,
          body.templateId,
          body.name || 'New Report',
          body.createdBy || 'system',
          body.customizations
        );

        return NextResponse.json({
          success: true,
          data: newReport,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
        return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process report',
        errorAr: 'فشل في معالجة التقرير',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports
 * Get report templates or reports
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const type = searchParams.get('type'); // 'templates' | 'reports' | 'schedules'
    const reportType = searchParams.get('reportType');
    const category = searchParams.get('category');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'templates':
        const templates = await ReportService.getTemplates(
          reportType as any,
          category || undefined
        );
        return NextResponse.json({
          success: true,
          data: {
            templates,
            categories: ReportService.getCategories(),
          },
        });

      case 'categories':
        return NextResponse.json({
          success: true,
          data: ReportService.getCategories(),
        });

      case 'reports':
      case 'schedules':
      default:
        // In production, fetch from database
        return NextResponse.json({
          success: true,
          data: {
            items: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
            },
          },
        });
    }
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch reports', errorAr: 'فشل في جلب التقارير' },
      { status: 500 }
    );
  }
}
