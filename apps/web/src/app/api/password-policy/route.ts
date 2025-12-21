import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { CreatePasswordPolicySchema, validationErrorResponse } from '@/lib/validators';
import { logger } from '@/lib/logger';

// GET - Fetch current password policy (typically only one per system)
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SYSTEM_CONFIG, Action.READ, permissions);
    if (permissionError) return permissionError;

    // Fetch the first (and typically only) password policy
    const policy = await prisma.passwordPolicy.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // If no policy exists, return default values
    if (!policy) {
      return NextResponse.json({
        success: true,
        data: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          expiryDays: 90,
          historyCount: 5,
          lockoutAttempts: 3,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: policy,
    });
  } catch (error) {
    logger.error('Error fetching password policy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch password policy' },
      { status: 500 }
    );
  }
});

// POST - Create password policy (only if none exists)
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SYSTEM_CONFIG, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    // Validate request body
    const body = await request.json();
    const validatedData = CreatePasswordPolicySchema.parse(body);

    // Check if a policy already exists
    const existingPolicy = await prisma.passwordPolicy.findFirst();

    if (existingPolicy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password policy already exists. Use PUT to update.',
        },
        { status: 400 }
      );
    }

    // Create new password policy
    const newPolicy = await prisma.passwordPolicy.create({
      data: validatedData,
    });

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'CREATE',
        module: 'System Configuration',
        details: 'Created password policy',
        ipAddress,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Password policy created successfully',
        data: newPolicy,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error creating password policy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create password policy' },
      { status: 500 }
    );
  }
});

// PUT - Update password policy
export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SYSTEM_CONFIG, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    // Validate request body
    const body = await request.json();
    const validatedData = CreatePasswordPolicySchema.parse(body);

    // Fetch existing policy
    const existingPolicy = await prisma.passwordPolicy.findFirst();

    if (!existingPolicy) {
      return NextResponse.json(
        {
          success: false,
          error: 'No password policy found. Use POST to create one.',
        },
        { status: 404 }
      );
    }

    // Update password policy
    const updatedPolicy = await prisma.passwordPolicy.update({
      where: { id: existingPolicy.id },
      data: validatedData,
    });

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'UPDATE',
        module: 'System Configuration',
        details: `Updated password policy: ${JSON.stringify(validatedData)}`,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password policy updated successfully',
      data: updatedPolicy,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error updating password policy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update password policy' },
      { status: 500 }
    );
  }
});

// DELETE - Delete password policy (revert to defaults)
export const DELETE = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SYSTEM_CONFIG, Action.DELETE, permissions);
    if (permissionError) return permissionError;

    // Fetch existing policy
    const existingPolicy = await prisma.passwordPolicy.findFirst();

    if (!existingPolicy) {
      return NextResponse.json(
        {
          success: false,
          error: 'No password policy found',
        },
        { status: 404 }
      );
    }

    // Delete password policy
    await prisma.passwordPolicy.delete({
      where: { id: existingPolicy.id },
    });

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'DELETE',
        module: 'System Configuration',
        details: 'Deleted password policy (reverted to defaults)',
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password policy deleted successfully. System will use default values.',
    });
  } catch (error) {
    logger.error('Error deleting password policy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete password policy' },
      { status: 500 }
    );
  }
});
