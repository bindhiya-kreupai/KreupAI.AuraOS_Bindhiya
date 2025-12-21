import { BaseService, ServiceResponse, ListOptions } from './base.service';
import type { Prisma } from '@prisma/client';

export interface MasterDataQueryOptions extends ListOptions {
  [key: string]: any;
}

export interface EntityConfig {
  model: any;
  searchFields?: string[];
  include?: any;
  unique?: string;
}

/**
 * Master Data Service
 * Generic service for managing master data entities
 */
export class MasterDataService extends BaseService {
  constructor() {
    super('MasterDataService');
  }

  private entities: Record<string, EntityConfig> = {
    countries: {
      model: this.prisma.country,
      searchFields: ['name', 'isoCode'],
      unique: 'isoCode',
    },
    states: {
      model: this.prisma.state,
      searchFields: ['name', 'code'],
      include: { country: { select: { id: true, name: true, isoCode: true } } },
    },
    cities: {
      model: this.prisma.city,
      searchFields: ['name'],
      include: {
        state: {
          select: {
            id: true,
            name: true,
            country: { select: { id: true, name: true } },
          },
        },
      },
    },
    currencies: {
      model: this.prisma.currency,
      searchFields: ['name', 'code'],
      unique: 'code',
    },
    languages: {
      model: this.prisma.language,
      searchFields: ['name', 'code'],
      unique: 'code',
    },
  };

  /**
   * Validate entity type
   */
  private validateEntity(entity: string): EntityConfig | null {
    return this.entities[entity] || null;
  }

  /**
   * List entities with filters and pagination
   */
  async listEntities(
    entityType: string,
    options: MasterDataQueryOptions
  ): Promise<ServiceResponse> {
    try {
      const config = this.validateEntity(entityType);
      if (!config) {
        return {
          success: false,
          error: 'Invalid entity type',
        };
      }

      const { search, status, page, limit, ...filters } = options;

      const where: any = { ...filters };

      if (search && config.searchFields) {
        where.OR = config.searchFields.map((field) => ({
          [field]: { contains: search, mode: 'insensitive' },
        }));
      }

      if (status) {
        where.status = status;
      }

      const [items, total] = await Promise.all([
        config.model.findMany({
          where,
          include: config.include,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        config.model.count({ where }),
      ]);

      return {
        success: true,
        data: items,
        meta: this.buildPaginationMeta(total, page, limit),
      };
    } catch (error) {
      console.error('MasterDataService.listEntities error:', error);
      return {
        success: false,
        error: 'Failed to fetch entities',
      };
    }
  }

  /**
   * Get entity by ID
   */
  async getEntityById(
    entityType: string,
    entityId: string
  ): Promise<ServiceResponse> {
    try {
      const config = this.validateEntity(entityType);
      if (!config) {
        return {
          success: false,
          error: 'Invalid entity type',
        };
      }

      const item = await config.model.findUnique({
        where: { id: entityId },
        include: config.include,
      });

      if (!item) {
        return {
          success: false,
          error: 'Entity not found',
        };
      }

      return {
        success: true,
        data: item,
      };
    } catch (error) {
      console.error('MasterDataService.getEntityById error:', error);
      return {
        success: false,
        error: 'Failed to fetch entity',
      };
    }
  }

  /**
   * Create entity
   */
  async createEntity(
    entityType: string,
    data: any,
    createdBy: string,
    ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      const config = this.validateEntity(entityType);
      if (!config) {
        return {
          success: false,
          error: 'Invalid entity type',
        };
      }

      // Check for unique constraint if applicable
      if (config.unique && data[config.unique]) {
        const existing = await config.model.findUnique({
          where: { [config.unique]: data[config.unique] },
        });

        if (existing) {
          return {
            success: false,
            error: `${config.unique} already exists`,
          };
        }
      }

      const result = await this.executeTransaction(async (tx) => {
        const item = await tx[entityType.slice(0, -1)].create({
          data,
          include: config.include,
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: createdBy,
            action: 'CREATE',
            module: 'Master Data',
            details: `Created ${entityType.slice(0, -1)}: ${item.name || item.code}`,
            ipAddress,
          },
        });

        return item;
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('MasterDataService.createEntity error:', error);
      return {
        success: false,
        error: 'Failed to create entity',
      };
    }
  }

  /**
   * Update entity
   */
  async updateEntity(
    entityType: string,
    entityId: string,
    data: any,
    updatedBy: string,
    ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      const config = this.validateEntity(entityType);
      if (!config) {
        return {
          success: false,
          error: 'Invalid entity type',
        };
      }

      // Check if entity exists
      const existing = await config.model.findUnique({
        where: { id: entityId },
      });

      if (!existing) {
        return {
          success: false,
          error: 'Entity not found',
        };
      }

      const result = await this.executeTransaction(async (tx) => {
        const updated = await tx[entityType.slice(0, -1)].update({
          where: { id: entityId },
          data,
          include: config.include,
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: updatedBy,
            action: 'UPDATE',
            module: 'Master Data',
            details: `Updated ${entityType.slice(0, -1)}: ${updated.name || updated.code}`,
            ipAddress,
          },
        });

        return updated;
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('MasterDataService.updateEntity error:', error);
      return {
        success: false,
        error: 'Failed to update entity',
      };
    }
  }

  /**
   * Delete entity (soft delete if status field exists)
   */
  async deleteEntity(
    entityType: string,
    entityId: string,
    deletedBy: string,
    ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      const config = this.validateEntity(entityType);
      if (!config) {
        return {
          success: false,
          error: 'Invalid entity type',
        };
      }

      const existing = await config.model.findUnique({
        where: { id: entityId },
      });

      if (!existing) {
        return {
          success: false,
          error: 'Entity not found',
        };
      }

      await this.executeTransaction(async (tx) => {
        // Soft delete if status field exists, otherwise hard delete
        if ('status' in existing) {
          await tx[entityType.slice(0, -1)].update({
            where: { id: entityId },
            data: { status: 'Inactive' },
          });
        } else {
          await tx[entityType.slice(0, -1)].delete({
            where: { id: entityId },
          });
        }

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: deletedBy,
            action: 'DELETE',
            module: 'Master Data',
            details: `Deleted ${entityType.slice(0, -1)}: ${existing.name || existing.code}`,
            ipAddress,
          },
        });
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('MasterDataService.deleteEntity error:', error);
      return {
        success: false,
        error: 'Failed to delete entity',
      };
    }
  }

  /**
   * Get states by country ID
   */
  async getStatesByCountry(countryId: string): Promise<ServiceResponse> {
    try {
      const states = await this.prisma.state.findMany({
        where: { countryId },
        include: { country: { select: { id: true, name: true } } },
        orderBy: { name: 'asc' },
      });

      return {
        success: true,
        data: states,
      };
    } catch (error) {
      console.error('MasterDataService.getStatesByCountry error:', error);
      return {
        success: false,
        error: 'Failed to fetch states',
      };
    }
  }

  /**
   * Get cities by state ID
   */
  async getCitiesByState(stateId: string): Promise<ServiceResponse> {
    try {
      const cities = await this.prisma.city.findMany({
        where: { stateId },
        include: { state: { select: { id: true, name: true } } },
        orderBy: { name: 'asc' },
      });

      return {
        success: true,
        data: cities,
      };
    } catch (error) {
      console.error('MasterDataService.getCitiesByState error:', error);
      return {
        success: false,
        error: 'Failed to fetch cities',
      };
    }
  }
}

// Export singleton instance
export const masterDataService = new MasterDataService();
