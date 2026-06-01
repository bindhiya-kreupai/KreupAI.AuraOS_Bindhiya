import type { ServiceResponse, ListOptions } from './base.service';
import { BaseService } from './base.service';
import type { LicenseType, LicenseStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

export interface CreateLicenseInput {
  name: string;
  type: LicenseType;
  total: number;
  used?: number;
  expiryDate?: Date;
  vendor?: string;
  cost?: number;
  status?: LicenseStatus;
}

export interface UpdateLicenseInput {
  name?: string;
  type?: LicenseType;
  total?: number;
  used?: number;
  expiryDate?: Date;
  vendor?: string;
  cost?: number;
  status?: LicenseStatus;
}

export interface LicenseQueryOptions extends ListOptions {
  type?: string;
  status?: string;
  tenantId?: string;
}

/**
 * License Service
 * Handles all license-related business logic
 */
export class LicenseService extends BaseService {
  constructor() {
    super('LicenseService');
  }
  /**
   * Calculate license utilization metrics
   */
  private calculateUtilization(license: any) {
    const utilization = license.total > 0 ? Math.round((license.used / license.total) * 100) : 0;
    const available = license.total - license.used;
    return {
      ...license,
      utilization,
      available,
    };
  }

  /**
   * List licenses with filters and pagination
   */
  async listLicenses(options: LicenseQueryOptions): Promise<ServiceResponse> {
    try {
      const { search, type, status, tenantId, page, limit } = options;

      const where: any = {};

      // TENANT ISOLATION: Always filter by tenant
      if (tenantId) {
        where.tenantId = tenantId;
      }

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      const [licenses, total] = await Promise.all([
        this.prisma.license.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.license.count({ where }),
      ]);

      // Add utilization metrics
      const licensesWithUtilization = licenses.map((license: any) =>
        this.calculateUtilization(license)
      );

      return {
        success: true,
        data: licensesWithUtilization,
        meta: this.buildPaginationMeta(total, page, limit),
      };
    } catch (error) {
      logger.error('LicenseService.listLicenses error:', error);
      return {
        success: false,
        error: 'Failed to fetch licenses',
      };
    }
  }

  /**
   * Get license by ID
   */
  async getLicenseById(licenseId: string): Promise<ServiceResponse> {
    try {
      const license = await this.prisma.license.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        return {
          success: false,
          error: 'License not found',
        };
      }

      return {
        success: true,
        data: this.calculateUtilization(license),
      };
    } catch (error) {
      logger.error('LicenseService.getLicenseById error:', error);
      return {
        success: false,
        error: 'Failed to fetch license',
      };
    }
  }

  /**
   * Create new license
   */
  async createLicense(
    input: CreateLicenseInput,
    createdBy: string,
    ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      // Check if license with same name already exists
      const existingLicense = await this.prisma.license.findUnique({
        where: { name: input.name },
      });

      if (existingLicense) {
        return {
          success: false,
          error: 'License with this name already exists',
        };
      }

      // Validate used count doesn't exceed total
      const usedCount = input.used || 0;
      if (usedCount > input.total) {
        return {
          success: false,
          error: 'Used licenses cannot exceed total licenses',
        };
      }

      // Create license within transaction
      const result = await this.executeTransaction(async (tx) => {
        const newLicense = await tx.license.create({
          data: {
            ...input,
            used: usedCount,
            status: input.status || 'Active',
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: createdBy,
            action: 'CREATE',
            module: 'License Management',
            details: `Created license: ${newLicense.name} (${newLicense.total} total)`,
            ipAddress,
          },
        });

        return newLicense;
      });

      return {
        success: true,
        data: this.calculateUtilization(result),
      };
    } catch (error) {
      logger.error('LicenseService.createLicense error:', error);
      return {
        success: false,
        error: 'Failed to create license',
      };
    }
  }

  /**
   * Update license
   */
  async updateLicense(
    licenseId: string,
    input: UpdateLicenseInput,
    updatedBy: string,
    ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      // Check if license exists
      const existingLicense = await this.prisma.license.findUnique({
        where: { id: licenseId },
      });

      if (!existingLicense) {
        return {
          success: false,
          error: 'License not found',
        };
      }

      // If name is being updated, check for conflicts
      if (input.name && input.name !== existingLicense.name) {
        const nameConflict = await this.prisma.license.findUnique({
          where: { name: input.name },
        });

        if (nameConflict) {
          return {
            success: false,
            error: 'License name already in use',
          };
        }
      }

      // Validate used count doesn't exceed total
      const newTotal = input.total ?? existingLicense.total;
      const newUsed = input.used ?? existingLicense.used;
      if (newUsed > newTotal) {
        return {
          success: false,
          error: 'Used licenses cannot exceed total licenses',
        };
      }

      // Update license within transaction
      const result = await this.executeTransaction(async (tx) => {
        const updatedLicense = await tx.license.update({
          where: { id: licenseId },
          data: input,
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: updatedBy,
            action: 'UPDATE',
            module: 'License Management',
            details: `Updated license: ${updatedLicense.name}`,
            ipAddress,
          },
        });

        return updatedLicense;
      });

      return {
        success: true,
        data: this.calculateUtilization(result),
      };
    } catch (error) {
      logger.error('LicenseService.updateLicense error:', error);
      return {
        success: false,
        error: 'Failed to update license',
      };
    }
  }

  /**
   * Delete license (soft delete)
   */
  async deleteLicense(
    licenseId: string,
    deletedBy: string,
    ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      const existingLicense = await this.prisma.license.findUnique({
        where: { id: licenseId },
      });

      if (!existingLicense) {
        return {
          success: false,
          error: 'License not found',
        };
      }

      // Soft delete by updating status
      await this.executeTransaction(async (tx) => {
        await tx.license.update({
          where: { id: licenseId },
          data: { status: 'Inactive' },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: deletedBy,
            action: 'DELETE',
            module: 'License Management',
            details: `Deleted license: ${existingLicense.name}`,
            ipAddress,
          },
        });
      });

      return {
        success: true,
      };
    } catch (error) {
      logger.error('LicenseService.deleteLicense error:', error);
      return {
        success: false,
        error: 'Failed to delete license',
      };
    }
  }

  /**
   * Allocate license (increment used count)
   */
  async allocateLicense(
    licenseId: string,
    allocatedBy: string,
    ipAddress: string,
    count: number = 1
  ): Promise<ServiceResponse> {
    try {
      const license = await this.prisma.license.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        return {
          success: false,
          error: 'License not found',
        };
      }

      const newUsed = license.used + count;
      if (newUsed > license.total) {
        return {
          success: false,
          error: 'Not enough available licenses',
        };
      }

      const result = await this.executeTransaction(async (tx) => {
        const updated = await tx.license.update({
          where: { id: licenseId },
          data: { used: newUsed },
        });

        await tx.auditLog.create({
          data: {
            userId: allocatedBy,
            action: 'UPDATE',
            module: 'License Management',
            details: `Allocated ${count} license(s): ${license.name}`,
            ipAddress,
          },
        });

        return updated;
      });

      return {
        success: true,
        data: this.calculateUtilization(result),
      };
    } catch (error) {
      logger.error('LicenseService.allocateLicense error:', error);
      return {
        success: false,
        error: 'Failed to allocate license',
      };
    }
  }

  /**
   * Release license (decrement used count)
   */
  async releaseLicense(
    licenseId: string,
    releasedBy: string,
    ipAddress: string,
    count: number = 1
  ): Promise<ServiceResponse> {
    try {
      const license = await this.prisma.license.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        return {
          success: false,
          error: 'License not found',
        };
      }

      const newUsed = Math.max(0, license.used - count);

      const result = await this.executeTransaction(async (tx) => {
        const updated = await tx.license.update({
          where: { id: licenseId },
          data: { used: newUsed },
        });

        await tx.auditLog.create({
          data: {
            userId: releasedBy,
            action: 'UPDATE',
            module: 'License Management',
            details: `Released ${count} license(s): ${license.name}`,
            ipAddress,
          },
        });

        return updated;
      });

      return {
        success: true,
        data: this.calculateUtilization(result),
      };
    } catch (error) {
      logger.error('LicenseService.releaseLicense error:', error);
      return {
        success: false,
        error: 'Failed to release license',
      };
    }
  }
}

// Export singleton instance
export const licenseService = new LicenseService();
