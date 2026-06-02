import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch payroll configuration/settings
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const companyId = searchParams.get('companyId');
      const countryCode = searchParams.get('countryCode');

      const where: Record<string, unknown> = { tenantId };
      if (companyId) where.companyId = companyId;
      if (countryCode) where.countryCode = countryCode;

      // If specific filters provided, return first match; otherwise return all configs
      if (companyId || countryCode) {
        const config = await prisma.payrollConfiguration.findFirst({
          where,
        });

        return NextResponse.json({
          success: true,
          settings: config,
          data: { settings: config },
        });
      }

      // Return all configs for this tenant
      const configs = await prisma.payrollConfiguration.findMany({
        where: { tenantId },
        orderBy: { countryCode: 'asc' },
      });

      // If only one config exists, return it as the primary settings
      const primaryConfig = configs.length === 1 ? configs[0] : configs[0] || null;

      return NextResponse.json({
        success: true,
        settings: primaryConfig,
        data: {
          settings: primaryConfig,
          configurations: configs,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching payroll settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payroll settings' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update payroll configuration/settings
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const { id, ...updateFields } = body;

      if (!id) {
        // If no id, try to find or create the first config for this tenant
        const existing = await prisma.payrollConfiguration.findFirst({
          where: { tenantId },
        });

        if (!existing) {
          // Create a new configuration
          const newConfig = await prisma.payrollConfiguration.create({
            data: {
              tenantId,
              companyId: updateFields.companyId || tenantId,
              countryCode: updateFields.countryCode || 'IN',
              payCycleType: updateFields.payCycleType || 'MONTHLY',
              payDay: updateFields.payDay || 1,
              cutoffDay: updateFields.cutoffDay || 25,
              componentsConfig: updateFields.componentsConfig || undefined,
              enableWPS: updateFields.enableWPS ?? false,
              enableGOSI: updateFields.enableGOSI ?? false,
              enablePF: updateFields.enablePF ?? true,
              enableESI: updateFields.enableESI ?? true,
              enableTDS: updateFields.enableTDS ?? true,
              overtimeCalculationBase: updateFields.overtimeCalculationBase,
              leaveEncashmentBase: updateFields.leaveEncashmentBase,
              gratuityCalculationBase: updateFields.gratuityCalculationBase,
            },
          });

          await prisma.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action: 'CREATE',
              resourceType: 'Payroll - Settings',
              metadata: { description: `Created payroll configuration for ${updateFields.countryCode || 'IN'}` } as any,
              ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            },
          });

          return NextResponse.json({
            success: true,
            settings: newConfig,
            data: { settings: newConfig },
          }, { status: 201 });
        }

        // Update existing config
        const allowedFields = [
          'companyId', 'countryCode', 'payCycleType', 'payDay', 'cutoffDay',
          'componentsConfig', 'enableWPS', 'enableGOSI', 'enablePF', 'enableESI',
          'enableTDS', 'overtimeCalculationBase', 'leaveEncashmentBase',
          'gratuityCalculationBase',
        ];

        const dataToUpdate: Record<string, unknown> = {};
        for (const field of allowedFields) {
          if (updateFields[field] !== undefined) {
            dataToUpdate[field] = updateFields[field];
          }
        }

        const updated = await prisma.payrollConfiguration.update({
          where: { id: existing.id },
          data: dataToUpdate,
        });

        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.userId,
            action: 'UPDATE',
            resourceType: 'Payroll - Settings',
            metadata: { description: `Updated payroll configuration: ${existing.countryCode}` } as any,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          },
        });

        return NextResponse.json({
          success: true,
          settings: updated,
          data: { settings: updated },
        });
      }

      // Update by specific id
      const existing = await prisma.payrollConfiguration.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Payroll configuration not found' },
          { status: 404 }
        );
      }

      const allowedFields = [
        'companyId', 'countryCode', 'payCycleType', 'payDay', 'cutoffDay',
        'componentsConfig', 'enableWPS', 'enableGOSI', 'enablePF', 'enableESI',
        'enableTDS', 'overtimeCalculationBase', 'leaveEncashmentBase',
        'gratuityCalculationBase',
      ];

      const dataToUpdate: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (updateFields[field] !== undefined) {
          dataToUpdate[field] = updateFields[field];
        }
      }

      const updated = await prisma.payrollConfiguration.update({
        where: { id },
        data: dataToUpdate,
      });

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'UPDATE',
          resourceType: 'Payroll - Settings',
          metadata: { description: `Updated payroll configuration: ${existing.countryCode}` } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        settings: updated,
        data: { settings: updated },
      });
    } catch (error: any) {
      logger.error('Error updating payroll settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update payroll settings' },
        { status: 500 }
      );
    }
  }
);
