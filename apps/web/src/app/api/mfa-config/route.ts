import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { CreateMFAConfigSchema, validationErrorResponse } from '@/lib/validators';
import { logger } from '@/lib/logger';

// GET - Fetch current MFA configuration (typically only one per system)
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.READ, permissions);
    if (permissionError) return permissionError;

    // Fetch the first (and typically only) MFA config
    const config = await prisma.mFAConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // If no config exists, return default disabled state
    if (!config) {
      return NextResponse.json({
        success: true,
        data: {
          enabled: false,
          enforceForAdmins: true,
          enforceForAll: false,
          methods: {
            authenticatorApp: true,
            sms: false,
            email: false,
          },
          gracePeriodDays: 7,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    logger.error('Error fetching MFA configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch MFA configuration' },
      { status: 500 }
    );
  }
});

// POST - Create MFA configuration (only if none exists)
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    // Validate request body
    const body = await request.json();
    const validatedData = CreateMFAConfigSchema.parse(body);

    // Check if a config already exists
    const existingConfig = await prisma.mFAConfig.findFirst();

    if (existingConfig) {
      return NextResponse.json(
        {
          success: false,
          error: 'MFA configuration already exists. Use PUT to update.',
        },
        { status: 400 }
      );
    }

    // Create new MFA config
    const newConfig = await prisma.mFAConfig.create({
      data: validatedData,
    });

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'CREATE',
        resourceType: 'System Configuration',
        metadata: { description: `Created MFA configuration (Enabled: ${validatedData.enabled})` } as any,
        ipAddress,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'MFA configuration created successfully',
        data: newConfig,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error creating MFA configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create MFA configuration' },
      { status: 500 }
    );
  }
});

// PUT - Update MFA configuration
export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    // Validate request body
    const body = await request.json();
    const validatedData = CreateMFAConfigSchema.parse(body);

    // Fetch existing config
    const existingConfig = await prisma.mFAConfig.findFirst();

    if (!existingConfig) {
      return NextResponse.json(
        {
          success: false,
          error: 'No MFA configuration found. Use POST to create one.',
        },
        { status: 404 }
      );
    }

    // Update MFA config
    const updatedConfig = await prisma.mFAConfig.update({
      where: { id: existingConfig.id },
      data: validatedData,
    });

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'UPDATE',
        resourceType: 'System Configuration',
        metadata: { description: `Updated MFA configuration (Enabled: ${validatedData.enabled}, Enforce for All: ${validatedData.enforceForAll})` } as any,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'MFA configuration updated successfully',
      data: updatedConfig,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error updating MFA configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update MFA configuration' },
      { status: 500 }
    );
  }
});

// DELETE - Delete MFA configuration (disable MFA)
export const DELETE = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.DELETE, permissions);
    if (permissionError) return permissionError;

    // Fetch existing config
    const existingConfig = await prisma.mFAConfig.findFirst();

    if (!existingConfig) {
      return NextResponse.json(
        {
          success: false,
          error: 'No MFA configuration found',
        },
        { status: 404 }
      );
    }

    // Delete MFA config
    await prisma.mFAConfig.delete({
      where: { id: existingConfig.id },
    });

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'DELETE',
        resourceType: 'System Configuration',
        metadata: { description: 'Deleted MFA configuration' } as any,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'MFA configuration deleted successfully. MFA is now disabled.',
    });
  } catch (error: any) {
    logger.error('Error deleting MFA configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete MFA configuration' },
      { status: 500 }
    );
  }
});
