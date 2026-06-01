import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('reports:read')) {
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
    const filter = {
      tenantId: user.tenantId,
      category: searchParams.get('category') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };
    const result = await AnalyticsService.findAllReports(filter);
    return NextResponse.json({ success: true, data: result.data, meta: result.meta });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('reports:write') && !permissions.includes('reports:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing reports:write permission',
            messageAr: 'ممنوع: صلاحية كتابة التقارير غير متوفرة',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    body.tenantId = user.tenantId;
    body.createdBy = user.id;
    const report = await AnalyticsService.createReport(body);
    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
