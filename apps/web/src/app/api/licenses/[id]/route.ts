import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { UpdateLicenseSchema, validationErrorResponse } from '@/lib/validators';
import { licenseService } from '@/lib/services';
import { validateTenantAccess } from '@/lib/middleware/tenant-isolation';
import { logger } from '@/lib/logger';

// GET - Fetch single license by ID
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.LICENSES, Action.READ, permissions);
      if (permissionError) return permissionError;

      const licenseId = params.id;

      // Use service layer
      const result = await licenseService.getLicenseById(licenseId);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 404 }
        );
      }

      // TENANT ISOLATION: Validate user has access to this license's tenant
      validateTenantAccess(result.data.tenantId, user.tenantId, 'License', licenseId);

      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
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
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.LICENSES, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const licenseId = params.id;

      // Validate request body
      const body = await request.json();
      const validatedData = UpdateLicenseSchema.parse(body);

      // TENANT ISOLATION: Check if license exists and validate tenant access first
      const existingResult = await licenseService.getLicenseById(licenseId);
      if (!existingResult.success) {
        return NextResponse.json(
          { success: false, error: 'License not found' },
          { status: 404 }
        );
      }
      validateTenantAccess(existingResult.data.tenantId, user.tenantId, 'License', licenseId);

      // Extract IP address
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

      // Use service layer
      const result = await licenseService.updateLicense(
        licenseId,
        validatedData,
        user.userId,
        ipAddress
      );

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'License updated successfully',
        data: result.data,
      });
    } catch (error) {
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

// DELETE - Delete license (soft delete by setting status to Inactive)
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.LICENSES, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const licenseId = params.id;

      // TENANT ISOLATION: Check if license exists and validate tenant access first
      const existingResult = await licenseService.getLicenseById(licenseId);
      if (!existingResult.success) {
        return NextResponse.json(
          { success: false, error: 'License not found' },
          { status: 404 }
        );
      }
      validateTenantAccess(existingResult.data.tenantId, user.tenantId, 'License', licenseId);

      // Extract IP address
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

      // Use service layer
      const result = await licenseService.deleteLicense(licenseId, user.userId, ipAddress);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'License deactivated successfully',
      });
    } catch (error) {
      logger.error('Error deleting license:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete license' },
        { status: 500 }
      );
    }
  }
);
