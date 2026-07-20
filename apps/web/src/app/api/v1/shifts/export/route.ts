import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { shiftExportService } from '@/lib/services/shift-management/export';
import { badRequest, forbidden, hasAny, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const VALID_ENTITIES = ['shifts', 'assignments', 'rosters', 'swap-requests'] as const;
const VALID_FORMATS = ['csv', 'xlsx', 'pdf'] as const;

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles?.includes('SUPER_ADMIN') &&
    !ctx.roles?.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'shifts:read', 'dashboard:read', 'tenant:read')
  ) {
    return forbidden();
  }

  try {
    const url = new URL(req.url);
    const entity = url.searchParams.get('entity') as (typeof VALID_ENTITIES)[number];
    const format = url.searchParams.get('format') as (typeof VALID_FORMATS)[number];

    if (!entity || !VALID_ENTITIES.includes(entity)) {
      return badRequest('entity must be one of: shifts, assignments, rosters, swap-requests');
    }
    if (!format || !VALID_FORMATS.includes(format)) {
      return badRequest('format must be one of: csv, xlsx, pdf');
    }

    const filter: Record<string, any> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (!['entity', 'format'].includes(key) && value) {
        filter[key] = value;
      }
    }

    const { filename, buffer, mimeType } = await shiftExportService.exportData(
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
