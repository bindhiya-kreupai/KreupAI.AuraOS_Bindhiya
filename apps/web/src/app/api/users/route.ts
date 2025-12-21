import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import {
  CreateUserSchema,
  UserQuerySchema,
  validationErrorResponse,
  validateQueryParams,
} from '@/lib/validators';
import { userService } from '@/lib/services';
import { logger } from '@/lib/logger';

// GET - Fetch all users with filters and pagination
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.USERS, Action.READ, permissions);
    if (permissionError) return permissionError;

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const { search, status, tenantId, page, limit } = validateQueryParams(
      UserQuerySchema,
      searchParams
    );

    // Use service layer
    const result = await userService.listUsers(
      {
        search,
        status,
        tenantId: tenantId || user.tenantId,
        page,
        limit,
      },
      user.userId
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

// POST - Create a new user
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.USERS, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    // Validate request body
    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);

    // Extract IP address
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Use service layer
    const result = await userService.createUser(
      {
        email: validatedData.email,
        password: validatedData.password,
        tenantId: validatedData.tenantId,
        status: validatedData.status,
        mfaEnabled: validatedData.mfaEnabled,
      },
      user.userId,
      ipAddress
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
});
