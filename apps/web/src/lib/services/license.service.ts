import type { ServiceResponse, ListOptions } from './base.service';
import { BaseService } from './base.service';
import { logger } from '@/lib/logger';

export interface CreateLicenseInput {
  name: string;
  type: string;
  total: number;
  used?: number;
  status?: string;
}

export interface UpdateLicenseInput {
  name?: string;
  type?: string;
  total?: number;
  used?: number;
  status?: string;
}

export interface LicenseQueryOptions extends ListOptions {
  tenantId: string;
  type?: string;
  status?: string;
}

export class LicenseService extends BaseService {
  constructor() {
    super('LicenseService');
  }

  private calculateUtilization(license: any) {
    const utilization = license.total > 0 ? Math.round((license.used / license.total) * 100) : 0;
    const available = license.total - license.used;
    return {
      ...license,
      utilization,
      available,
    };
  }

  async listLicenses(options: LicenseQueryOptions): Promise<ServiceResponse> {
    try {
      const { tenantId, search, type, status, page, limit } = options;

      const where: any = { tenantId, isDeleted: false };

      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
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

      const licensesWithUtilization = licenses.map((license: any) =>
        this.calculateUtilization(license)
      );

      return {
        success: true,
        data: licensesWithUtilization,
        meta: this.buildPaginationMeta(total, page, limit),
      };
    } catch (error: any) {
      logger.error('LicenseService.listLicenses error:', error);
      return { success: false, error: 'Failed to fetch licenses' };
    }
  }

  async getLicenseById(licenseId: string, tenantId: string): Promise<ServiceResponse> {
    try {
      const license = await this.prisma.license.findFirst({
        where: { id: licenseId, tenantId, isDeleted: false },
      });

      if (!license) {
        return { success: false, error: 'License not found' };
      }

      return {
        success: true,
        data: this.calculateUtilization(license),
      };
    } catch (error: any) {
      logger.error('LicenseService.getLicenseById error:', error);
      return { success: false, error: 'Failed to fetch license' };
    }
  }

  async createLicense(
    input: CreateLicenseInput,
    tenantId: string,
    createdBy: string,
    _ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      const existingLicense = await this.prisma.license.findFirst({
        where: { name: input.name, tenantId, isDeleted: false },
      });

      if (existingLicense) {
        return { success: false, error: 'License with this name already exists' };
      }

      const usedCount = input.used || 0;
      if (usedCount > input.total) {
        return { success: false, error: 'Used licenses cannot exceed total licenses' };
      }

      const result = await this.executeTransaction(async (tx) => {
        const newLicense = await tx.license.create({
          data: {
            name: input.name,
            type: input.type,
            total: input.total,
            used: usedCount,
            status: input.status || 'Active',
            tenantId,
            createdBy,
            updatedBy: createdBy,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId,
            action: 'CREATE',
            module: 'License Management',
            resourceType: 'License',
            resourceId: newLicense.id,
            metadata: {
              details: `Created license: ${newLicense.name} (${newLicense.total} total)`,
            } as any,
            ipAddress: _ipAddress,
          },
        });

        return newLicense;
      });

      return {
        success: true,
        data: this.calculateUtilization(result),
      };
    } catch (error: any) {
      logger.error('LicenseService.createLicense error:', error);
      return { success: false, error: 'Failed to create license' };
    }
  }

  async updateLicense(
    licenseId: string,
    input: UpdateLicenseInput,
    tenantId: string,
    updatedBy: string,
    _ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      const existingLicense = await this.prisma.license.findFirst({
        where: { id: licenseId, tenantId, isDeleted: false },
      });

      if (!existingLicense) {
        return { success: false, error: 'License not found' };
      }

      if (input.name && input.name !== existingLicense.name) {
        const nameConflict = await this.prisma.license.findFirst({
          where: { name: input.name, tenantId, isDeleted: false },
        });

        if (nameConflict) {
          return { success: false, error: 'License name already in use' };
        }
      }

      const newTotal = input.total ?? existingLicense.total;
      const newUsed = input.used ?? existingLicense.used;
      if (newUsed > newTotal) {
        return { success: false, error: 'Used licenses cannot exceed total licenses' };
      }

      const result = await this.executeTransaction(async (tx) => {
        const updateData: any = { updatedBy };
        if (input.name !== undefined) updateData.name = input.name;
        if (input.type !== undefined) updateData.type = input.type;
        if (input.total !== undefined) updateData.total = input.total;
        if (input.used !== undefined) updateData.used = input.used;
        if (input.status !== undefined) updateData.status = input.status;

        const updatedLicense = await tx.license.update({
          where: { id: licenseId },
          data: updateData,
        });

        await tx.auditLog.create({
          data: {
            tenantId,
            action: 'UPDATE',
            module: 'License Management',
            resourceType: 'License',
            resourceId: updatedLicense.id,
            metadata: { details: `Updated license: ${updatedLicense.name}` } as any,
            ipAddress: _ipAddress,
          },
        });

        return updatedLicense;
      });

      return {
        success: true,
        data: this.calculateUtilization(result),
      };
    } catch (error: any) {
      logger.error('LicenseService.updateLicense error:', error);
      return { success: false, error: 'Failed to update license' };
    }
  }

  async deleteLicense(
    licenseId: string,
    tenantId: string,
    deletedBy: string,
    _ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      const existingLicense = await this.prisma.license.findFirst({
        where: { id: licenseId, tenantId, isDeleted: false },
      });

      if (!existingLicense) {
        return { success: false, error: 'License not found' };
      }

      await this.executeTransaction(async (tx) => {
        await tx.license.update({
          where: { id: licenseId },
          data: {
            status: 'Inactive',
            isDeleted: true,
            deletedAt: new Date(),
            updatedBy: deletedBy,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId,
            action: 'DELETE',
            module: 'License Management',
            resourceType: 'License',
            resourceId: licenseId,
            metadata: { details: `Deleted license: ${existingLicense.name}` } as any,
            ipAddress: _ipAddress,
          },
        });
      });

      return { success: true };
    } catch (error: any) {
      logger.error('LicenseService.deleteLicense error:', error);
      return { success: false, error: 'Failed to delete license' };
    }
  }

  async allocateLicense(
    licenseId: string,
    tenantId: string,
    allocatedBy: string,
    ipAddress: string,
    count: number = 1
  ): Promise<ServiceResponse> {
    try {
      const license = await this.prisma.license.findFirst({
        where: { id: licenseId, tenantId, isDeleted: false },
      });

      if (!license) {
        return { success: false, error: 'License not found' };
      }

      const newUsed = license.used + count;
      if (newUsed > license.total) {
        return { success: false, error: 'Not enough available licenses' };
      }

      const result = await this.executeTransaction(async (tx) => {
        const updated = await tx.license.update({
          where: { id: licenseId },
          data: { used: newUsed, updatedBy: allocatedBy },
        });

        await tx.auditLog.create({
          data: {
            tenantId,
            action: 'UPDATE',
            module: 'License Management',
            resourceType: 'License',
            resourceId: licenseId,
            metadata: { details: `Allocated ${count} license(s): ${license.name}` } as any,
            ipAddress,
          },
        });

        return updated;
      });

      return {
        success: true,
        data: this.calculateUtilization(result),
      };
    } catch (error: any) {
      logger.error('LicenseService.allocateLicense error:', error);
      return { success: false, error: 'Failed to allocate license' };
    }
  }

  async releaseLicense(
    licenseId: string,
    tenantId: string,
    releasedBy: string,
    ipAddress: string,
    count: number = 1
  ): Promise<ServiceResponse> {
    try {
      const license = await this.prisma.license.findFirst({
        where: { id: licenseId, tenantId, isDeleted: false },
      });

      if (!license) {
        return { success: false, error: 'License not found' };
      }

      const newUsed = Math.max(0, license.used - count);

      const result = await this.executeTransaction(async (tx) => {
        const updated = await tx.license.update({
          where: { id: licenseId },
          data: { used: newUsed, updatedBy: releasedBy },
        });

        await tx.auditLog.create({
          data: {
            tenantId,
            action: 'UPDATE',
            module: 'License Management',
            resourceType: 'License',
            resourceId: licenseId,
            metadata: { details: `Released ${count} license(s): ${license.name}` } as any,
            ipAddress,
          },
        });

        return updated;
      });

      return {
        success: true,
        data: this.calculateUtilization(result),
      };
    } catch (error: any) {
      logger.error('LicenseService.releaseLicense error:', error);
      return { success: false, error: 'Failed to release license' };
    }
  }
}

export const licenseService = new LicenseService();
