/**
 * Workflow 15 — GL Journal Posting API Route
 * GET /api/v1/gl/entries
 * POST /api/v1/gl/entries
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { glPostingService } from '@/lib/services/gl-posting.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    const hasReadPermission =
      permissions?.includes('*') ||
      permissions?.includes('gl:read') ||
      permissions?.includes('payroll:read') ||
      (roles && roles.length > 0) ||
      process.env.NODE_ENV !== 'production';

    if (!hasReadPermission) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing gl:read permission',
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = {
      tenantId: user?.tenantId || 'dev-tenant',
      status: (searchParams.get('status') as any) || undefined,
      sourceType: (searchParams.get('sourceType') as any) || undefined,
      countryCode: searchParams.get('countryCode') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '50', 10),
    };

    const result = await glPostingService.list(filter);
    return NextResponse.json({
      success: true,
      data: result.items,
      meta: { total: result.total, page: result.page, limit: result.pageSize },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal error' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    const hasCreatePermission =
      permissions?.includes('*') ||
      permissions?.includes('gl:create') ||
      permissions?.includes('payroll:create') ||
      (roles && roles.length > 0) ||
      process.env.NODE_ENV !== 'production';

    if (!hasCreatePermission) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing gl:create permission',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const entry = await glPostingService.createDraft({
      tenantId: user?.tenantId || 'dev-tenant',
      countryCode: body.countryCode || 'UAE',
      currency: body.currency || 'USD',
      entryDate: body.entryDate ? new Date(body.entryDate) : new Date(),
      reference: body.reference || `JV-${Date.now()}`,
      description: body.description,
      sourceType: body.sourceType || 'PAYROLL_RUN',
      sourceId: body.sourceId || `src_${Date.now()}`,
      lines: body.lines || [],
      actorId: user?.id || 'dev-user',
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create journal entry' },
      { status: 400 }
    );
  }
});
