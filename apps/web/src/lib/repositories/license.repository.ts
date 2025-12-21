/**
 * License Repository
 * Handles all database operations for License model
 */

import { BaseRepository, type PaginatedResult } from './base.repository';
import type { License, LicenseStatus, LicenseType } from '@prisma/client';

export interface FindLicensesOptions {
  tenantId?: string;
  search?: string;
  type?: LicenseType;
  status?: LicenseStatus;
  page?: number;
  limit?: number;
}

/**
 * License Repository
 */
export class LicenseRepository extends BaseRepository<License> {
  constructor() {
    super('license');
  }

  /**
   * Find license by name
   */
  async findByName(name: string): Promise<License | null> {
    return this.findOne({ name });
  }

  /**
   * Find licenses with filters and pagination
   */
  async findLicenses(options: FindLicensesOptions): Promise<PaginatedResult<License>> {
    const { tenantId, search, type, status, page = 1, limit = 10 } = options;

    const where: any = {};

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

    return this.findManyPaginated(
      {
        where,
        orderBy: { name: 'asc' },
      },
      page,
      limit
    );
  }

  /**
   * Check if license exists by name
   */
  async existsByName(name: string): Promise<boolean> {
    return this.exists({ name });
  }

  /**
   * Create license
   */
  async createLicense(data: {
    name: string;
    type: LicenseType;
    total: number;
    used?: number;
    expiryDate?: Date;
    vendor?: string;
    cost?: number;
    status?: LicenseStatus;
  }): Promise<License> {
    return this.create({
      ...data,
      used: data.used || 0,
      status: data.status || 'Active',
    });
  }

  /**
   * Update license
   */
  async updateLicense(
    id: string,
    data: {
      name?: string;
      type?: LicenseType;
      total?: number;
      used?: number;
      expiryDate?: Date;
      vendor?: string;
      cost?: number;
      status?: LicenseStatus;
    }
  ): Promise<License> {
    return this.updateById(id, data);
  }

  /**
   * Increment used count (allocate license)
   */
  async incrementUsed(id: string, count: number = 1): Promise<License> {
    return this.model.update({
      where: { id },
      data: {
        used: {
          increment: count,
        },
      },
    });
  }

  /**
   * Decrement used count (release license)
   */
  async decrementUsed(id: string, count: number = 1): Promise<License> {
    return this.model.update({
      where: { id },
      data: {
        used: {
          decrement: count,
        },
      },
    });
  }

  /**
   * Find licenses with available capacity
   */
  async findAvailableLicenses(
    tenantId?: string,
    type?: LicenseType
  ): Promise<License[]> {
    const where: any = {
      status: 'Active',
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (type) {
      where.type = type;
    }

    const licenses = await this.findMany({ where });

    // Filter licenses with available capacity
    return licenses.filter((license) => license.used < license.total);
  }

  /**
   * Find expired licenses
   */
  async findExpiredLicenses(): Promise<License[]> {
    return this.findMany({
      where: {
        expiryDate: {
          lt: new Date(),
        },
        status: {
          not: 'Expired',
        },
      },
    });
  }

  /**
   * Mark expired licenses as Expired
   */
  async markExpiredLicenses(): Promise<{ count: number }> {
    return this.updateMany(
      {
        expiryDate: {
          lt: new Date(),
        },
        status: {
          not: 'Expired',
        },
      },
      {
        status: 'Expired',
      }
    );
  }

  /**
   * Get license utilization stats
   */
  async getUtilizationStats(tenantId?: string): Promise<{
    total: number;
    active: number;
    expired: number;
    totalCapacity: number;
    totalUsed: number;
    utilizationPercentage: number;
  }> {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const licenses = await this.findMany({ where });

    const stats = licenses.reduce(
      (acc, license) => {
        acc.total++;
        if (license.status === 'Active') acc.active++;
        if (license.status === 'Expired') acc.expired++;
        acc.totalCapacity += license.total;
        acc.totalUsed += license.used;
        return acc;
      },
      {
        total: 0,
        active: 0,
        expired: 0,
        totalCapacity: 0,
        totalUsed: 0,
        utilizationPercentage: 0,
      }
    );

    stats.utilizationPercentage =
      stats.totalCapacity > 0
        ? Math.round((stats.totalUsed / stats.totalCapacity) * 100)
        : 0;

    return stats;
  }
}

// Export singleton instance
export const licenseRepository = new LicenseRepository();
