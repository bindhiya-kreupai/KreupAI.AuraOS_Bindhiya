import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import {
  CreatePasswordPolicySchema,
  UpdatePasswordPolicySchema,
  validationErrorResponse,
} from '@/lib/validators';
import { logger } from '@/lib/logger';

// GET - Fetch current password policy for this tenant
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.SYSTEM_SETTINGS, Action.READ, permissions);
    if (permissionError) return permissionError;

    const policy = await prisma.passwordPolicy.findFirst({
      where: { tenantId: user.tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

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

    return NextResponse.json({ success: true, data: policy });
  } catch (error: any) {
    logger.error('Error fetching password policy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch password policy' },
      { status: 500 }
    );
  }
});

// POST - Create password policy for this tenant (only if none exists)
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.SYSTEM_SETTINGS, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const validatedData = CreatePasswordPolicySchema.parse(body);

    const existingPolicy = await prisma.passwordPolicy.findFirst({
      where: { tenantId: user.tenantId, isDeleted: false },
    });

    if (existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Password policy already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    const newPolicy = await prisma.passwordPolicy.create({
      data: { ...validatedData, tenantId: user.tenantId },
    });

    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'CREATE',
        module: 'System Configuration',
        resourceType: 'System Configuration',
        metadata: { description: 'Created password policy' } as any,
        ipAddress,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Password policy created successfully', data: newPolicy },
      { status: 201 }
    );
  } catch (error: any) {
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

// PUT - Update password policy for this tenant
export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.SYSTEM_SETTINGS, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const validatedData = UpdatePasswordPolicySchema.parse(body);

    const existingPolicy = await prisma.passwordPolicy.findFirst({
      where: { tenantId: user.tenantId, isDeleted: false },
    });

    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'No password policy found. Use POST to create one.' },
        { status: 404 }
      );
    }

    const updatedPolicy = await prisma.passwordPolicy.update({
      where: { id: existingPolicy.id },
      data: validatedData,
    });

    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'UPDATE',
        module: 'System Configuration',
        resourceType: 'System Configuration',
        metadata: {
          description: `Updated password policy: ${JSON.stringify(validatedData)}`,
        } as any,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password policy updated successfully',
      data: updatedPolicy,
    });
  } catch (error: any) {
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

// DELETE - Delete password policy for this tenant (revert to defaults)
export const DELETE = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.SYSTEM_SETTINGS, Action.DELETE, permissions);
    if (permissionError) return permissionError;

    const existingPolicy = await prisma.passwordPolicy.findFirst({
      where: { tenantId: user.tenantId, isDeleted: false },
    });

    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'No password policy found' },
        { status: 404 }
      );
    }

    await prisma.passwordPolicy.delete({ where: { id: existingPolicy.id } });

    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'DELETE',
        module: 'System Configuration',
        resourceType: 'System Configuration',
        metadata: { description: 'Deleted password policy (reverted to defaults)' } as any,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password policy deleted successfully. System will use default values.',
    });
  } catch (error: any) {
    logger.error('Error deleting password policy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete password policy' },
      { status: 500 }
    );
  }
});
