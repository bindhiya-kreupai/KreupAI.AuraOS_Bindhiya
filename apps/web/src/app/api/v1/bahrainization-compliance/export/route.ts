import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { bahrainizationExportService } from '@/lib/services/bahrainization-compliance';
import { badRequest, forbidden, hasAny, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles?.includes('SUPER_ADMIN') &&
    !ctx.roles?.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')
  ) {
    return forbidden();
  }
  try {
    const url = new URL(req.url);
    const entity = url.searchParams.get('entity') as
      'config' | 'targets' | 'hires' | 'snapshots' | 'certificate';
    const format = url.searchParams.get('format') as 'csv' | 'xlsx';

    if (!entity || !['config', 'targets', 'hires', 'snapshots', 'certificate'].includes(entity)) {
      return badRequest('invalid or missing entity');
    }
    if (!format || !['csv', 'xlsx'].includes(format)) {
      return badRequest('format must be csv or xlsx');
    }

    const filter: Record<string, unknown> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (!['entity', 'format', 'page', 'pageSize', 'ids'].includes(key) && value) {
        filter[key] = value;
      }
    }

    const idsParam = url.searchParams.get('ids');
    if (idsParam) {
      filter.ids = idsParam.split(',');
    }

    const { filename, buffer, mimeType } = await bahrainizationExportService.exportData(
      ctx.user.tenantId,
      entity,
      format,
      filter
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return serverError('Failed to export data', err);
  }
});
