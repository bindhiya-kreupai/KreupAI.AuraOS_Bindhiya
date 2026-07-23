import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import {
  CreateLicenseSchema,
  LicenseQuerySchema,
  validationErrorResponse,
  validateQueryParams,
} from '@/lib/validators';
import { licenseService } from '@/lib/services';
import { logger } from '@/lib/logger';

// GET - Fetch licenses with filters
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LICENSES, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const { search, type, status, page, limit } = validateQueryParams(
      LicenseQuerySchema,
      searchParams
    );

    const result = await licenseService.listLicenses({
      tenantId: user.tenantId,
      search,
      type,
      status,
      page,
      limit,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error fetching licenses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch licenses' },
      { status: 500 }
    );
  }
});

// POST - Create new license
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LICENSES, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const validatedData = CreateLicenseSchema.parse(body);

    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const result = await licenseService.createLicense(
      validatedData,
      user.tenantId,
      user.userId,
      ipAddress
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'License created successfully',
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error creating license:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create license' },
      { status: 500 }
    );
  }
});
