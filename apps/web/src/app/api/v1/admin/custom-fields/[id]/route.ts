import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/custom-fields/[id]
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
    const { id } = context.params;

    const field = await prisma.customField.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!field) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Custom field not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: field,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch custom field' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/admin/custom-fields/[id]
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/custom-fields:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/custom-fields:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;
    const body = await request.json();

    const field = await prisma.customField.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!field) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Custom field not found' } },
        { status: 404 }
      );
    }

    const updated = await prisma.customField.update({
      where: { id },
      data: {
        fieldLabel: body.fieldLabel,
        isRequired: body.isRequired,
        isActive: body.isActive,
        defaultValue: body.defaultValue,
        placeholder: body.placeholder,
        helpText: body.helpText,
        options: body.options,
        validationRules: body.validationRules,
        displayOrder: body.displayOrder,
        section: body.section,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update custom field' } },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/v1/admin/custom-fields/[id]
 */
export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/custom-fields:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/custom-fields:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;

    const field = await prisma.customField.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!field) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Custom field not found' } },
        { status: 404 }
      );
    }

    // Soft delete by deactivating
    await prisma.customField.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date(), updatedBy: user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Custom field deactivated successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to delete custom field' } },
      { status: 500 }
    );
  }
});
