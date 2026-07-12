import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { UpdateLicenseSchema, validationErrorResponse } from '@/lib/validators';
import { licenseService } from '@/lib/services';
import { logger } from '@/lib/logger';

// GET - Fetch single license by ID
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: any) => {
    try {
      const permissionError = requirePermission(Resource.LICENSES, Action.READ, permissions);
      if (permissionError) return permissionError;

      const licenseId = params.id;
      const result = await licenseService.getLicenseById(licenseId);

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: result.data });
    } catch (error: any) {
      logger.error('Error fetching license:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch license' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update license
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: any) => {
    try {
      const permissionError = requirePermission(Resource.LICENSES, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const licenseId = params.id;
      const body = await request.json();
      const validatedData = UpdateLicenseSchema.parse(body);

      const ipAddress =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

      const result = await licenseService.updateLicense(
        licenseId,
        validatedData,
        user.userId,
        ipAddress
      );

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'License updated successfully',
        data: result.data,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }

      logger.error('Error updating license:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update license' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete license (soft delete)
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: any) => {
    try {
      const permissionError = requirePermission(Resource.LICENSES, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const licenseId = params.id;

      const ipAddress =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

      const result = await licenseService.deleteLicense(licenseId, user.userId, ipAddress);

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'License deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting license:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete license' },
        { status: 500 }
      );
    }
  }
);
