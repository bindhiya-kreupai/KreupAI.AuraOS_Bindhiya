import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { CreateSSOConfigSchema, validationErrorResponse } from '@/lib/validators';
import { logger } from '@/lib/logger';

// GET - Fetch current SSO configuration (typically only one per system)
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.READ, permissions);
    if (permissionError) return permissionError;

    // Fetch the first (and typically only) SSO config
    const config = await prisma.sSOConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // If no config exists, return default disabled state
    if (!config) {
      return NextResponse.json({
        success: true,
        data: {
          enabled: false,
          provider: 'SAML',
          issuerUrl: null,
          ssoUrl: null,
          certificate: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error('Error fetching SSO configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SSO configuration' },
      { status: 500 }
    );
  }
});

// POST - Create SSO configuration (only if none exists)
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    // Validate request body
    const body = await request.json();
    const validatedData = CreateSSOConfigSchema.parse(body);

    // Check if a config already exists
    const existingConfig = await prisma.sSOConfig.findFirst();

    if (existingConfig) {
      return NextResponse.json(
        {
          success: false,
          error: 'SSO configuration already exists. Use PUT to update.',
        },
        { status: 400 }
      );
    }

    // Create new SSO config
    const newConfig = await prisma.sSOConfig.create({
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
        details: `Created SSO configuration (Provider: ${validatedData.provider})`,
        ipAddress,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'SSO configuration created successfully',
        data: newConfig,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error creating SSO configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create SSO configuration' },
      { status: 500 }
    );
  }
});

// PUT - Update SSO configuration
export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    // Validate request body
    const body = await request.json();
    const validatedData = CreateSSOConfigSchema.parse(body);

    // Fetch existing config
    const existingConfig = await prisma.sSOConfig.findFirst();

    if (!existingConfig) {
      return NextResponse.json(
        {
          success: false,
          error: 'No SSO configuration found. Use POST to create one.',
        },
        { status: 404 }
      );
    }

    // Update SSO config
    const updatedConfig = await prisma.sSOConfig.update({
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
        userId: user.userId,
        action: 'UPDATE',
        module: 'System Configuration',
        details: `Updated SSO configuration (Provider: ${validatedData.provider}, Enabled: ${validatedData.enabled})`,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'SSO configuration updated successfully',
      data: updatedConfig,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error updating SSO configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update SSO configuration' },
      { status: 500 }
    );
  }
});

// DELETE - Delete SSO configuration (disable SSO)
export const DELETE = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.DELETE, permissions);
    if (permissionError) return permissionError;

    // Fetch existing config
    const existingConfig = await prisma.sSOConfig.findFirst();

    if (!existingConfig) {
      return NextResponse.json(
        {
          success: false,
          error: 'No SSO configuration found',
        },
        { status: 404 }
      );
    }

    // Delete SSO config
    await prisma.sSOConfig.delete({
      where: { id: existingConfig.id },
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
        details: 'Deleted SSO configuration',
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'SSO configuration deleted successfully. SSO is now disabled.',
    });
  } catch (error) {
    logger.error('Error deleting SSO configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete SSO configuration' },
      { status: 500 }
    );
  }
});
