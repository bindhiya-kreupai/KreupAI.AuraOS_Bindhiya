import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import {
  CreateSSOConfigSchema,
  UpdateSSOConfigSchema,
  validationErrorResponse,
} from '@/lib/validators';
import { logger } from '@/lib/logger';

// GET - Fetch current SSO configuration for this tenant
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.READ, permissions);
    if (permissionError) return permissionError;

    const config = await prisma.sSOConfig.findFirst({
      where: { tenantId: user.tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

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

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    logger.error('Error fetching SSO configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SSO configuration' },
      { status: 500 }
    );
  }
});

// POST - Create SSO configuration for this tenant (only if none exists)
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const validatedData = CreateSSOConfigSchema.parse(body);

    const existingConfig = await prisma.sSOConfig.findFirst({
      where: { tenantId: user.tenantId, isDeleted: false },
    });

    if (existingConfig) {
      return NextResponse.json(
        { success: false, error: 'SSO configuration already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    const newConfig = await prisma.sSOConfig.create({
      data: { ...validatedData, tenantId: user.tenantId, createdBy: user.userId },
    });

    return NextResponse.json(
      { success: true, message: 'SSO configuration created successfully', data: newConfig },
      { status: 201 }
    );
  } catch (error: any) {
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

// PUT - Update SSO configuration for this tenant
export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const validatedData = UpdateSSOConfigSchema.parse(body);

    const existingConfig = await prisma.sSOConfig.findFirst({
      where: { tenantId: user.tenantId, isDeleted: false },
    });

    if (!existingConfig) {
      return NextResponse.json(
        { success: false, error: 'No SSO configuration found. Use POST to create one.' },
        { status: 404 }
      );
    }

    const updatedConfig = await prisma.sSOConfig.update({
      where: { id: existingConfig.id },
      data: { ...validatedData, updatedBy: user.userId },
    });

    return NextResponse.json({
      success: true,
      message: 'SSO configuration updated successfully',
      data: updatedConfig,
    });
  } catch (error: any) {
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

// DELETE - Delete SSO configuration for this tenant (disable SSO)
export const DELETE = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.SSO_CONFIG, Action.DELETE, permissions);
    if (permissionError) return permissionError;

    const existingConfig = await prisma.sSOConfig.findFirst({
      where: { tenantId: user.tenantId, isDeleted: false },
    });

    if (!existingConfig) {
      return NextResponse.json(
        { success: false, error: 'No SSO configuration found' },
        { status: 404 }
      );
    }

    await prisma.sSOConfig.update({
      where: { id: existingConfig.id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId },
    });

    return NextResponse.json({
      success: true,
      message: 'SSO configuration deleted successfully. SSO is now disabled.',
    });
  } catch (error: any) {
    logger.error('Error deleting SSO configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete SSO configuration' },
      { status: 500 }
    );
  }
});
