import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';

export const dynamic = 'force-dynamic';

const SUPPORTED_ENTITY_TYPES = [
  'employees',
  'departments',
  'positions',
  'salary-structures',
  'leave-types',
  'job-profiles',
] as const;

type EntityType = (typeof SUPPORTED_ENTITY_TYPES)[number];

/**
 * POST /api/v1/admin/bulk-import
 * Bulk import various entity types
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    const { entityType, data, options } = body;

    if (!entityType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: `entityType is required. Supported types: ${SUPPORTED_ENTITY_TYPES.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    if (!SUPPORTED_ENTITY_TYPES.includes(entityType as EntityType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: `Unsupported entityType. Must be one of: ${SUPPORTED_ENTITY_TYPES.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'data array is required and must not be empty' },
        },
        { status: 400 }
      );
    }

    if (data.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'Maximum 1000 records can be imported at once' },
        },
        { status: 400 }
      );
    }

    // Create import job record
    const importJobId = crypto.randomUUID();

    // Proxy to employee service for bulk import
    const result = await ServiceProxy.post('employee', '/bulk-import', {
      jobId: importJobId,
      tenantId: user.tenantId,
      entityType,
      data,
      options: {
        updateExisting: options?.updateExisting ?? false,
        validateOnly: options?.validateOnly ?? false,
        skipErrors: options?.skipErrors ?? false,
      },
      requestedBy: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          jobId: importJobId,
          entityType,
          totalRecords: data.length,
          status: 'PROCESSING',
          estimatedCompletionTime: new Date(Date.now() + data.length * 100).toISOString(),
          ...(result || {}),
        },
        message: `Bulk import of ${data.length} ${entityType} records initiated`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 202 }
    );
  } catch (_error) {
    console.error('[Admin Bulk Import API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to initiate bulk import',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
