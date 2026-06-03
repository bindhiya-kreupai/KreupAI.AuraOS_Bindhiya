import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/custom-fields
 * List custom fields defined for the tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/custom-fields:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/custom-fields:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const entityType = searchParams.get('entityType') || undefined;
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (entityType) where.entityType = entityType;
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';

    const [data, total] = await Promise.all([
      prisma.customField.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ entityType: 'asc' }, { displayOrder: 'asc' }],
      }),
      prisma.customField.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Custom Fields API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch custom fields' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/admin/custom-fields
 * Create a new custom field
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/custom-fields:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/custom-fields:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.entityType || !body.fieldName || !body.fieldType) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'entityType, fieldName and fieldType are required' },
        },
        { status: 400 }
      );
    }

    const VALID_ENTITY_TYPES = [
      'Employee',
      'Department',
      'Position',
      'LeaveRequest',
      'ExpenseReport',
    ];
    if (!VALID_ENTITY_TYPES.includes(body.entityType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: `entityType must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    const VALID_FIELD_TYPES = [
      'TEXT',
      'NUMBER',
      'DATE',
      'BOOLEAN',
      'SELECT',
      'MULTI_SELECT',
      'FILE',
      'TEXTAREA',
    ];
    if (!VALID_FIELD_TYPES.includes(body.fieldType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: `fieldType must be one of: ${VALID_FIELD_TYPES.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    const field = await prisma.customField.create({
      data: {
        tenantId: user.tenantId,
        entityType: body.entityType,
        fieldName: body.fieldName,
        fieldLabel: body.fieldLabel || body.fieldName,
        fieldType: body.fieldType,
        isRequired: body.isRequired ?? false,
        isActive: body.isActive ?? true,
        defaultValue: body.defaultValue || null,
        placeholder: body.placeholder || null,
        helpText: body.helpText || null,
        options: body.options || null, // For SELECT/MULTI_SELECT
        validationRules: body.validationRules || null,
        displayOrder: body.displayOrder || 0,
        section: body.section || 'General',
        createdBy: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: field,
        message: 'Custom field created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Custom Fields API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create custom field',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
