/**
 * User Repository
 * Handles all database operations for User model
 */

import { BaseRepository, type PaginatedResult } from './base.repository';
import type { User, UserStatus } from '@prisma/client';

export interface UserWithRelations extends User {
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  } | null;
}

export interface FindUsersOptions {
  tenantId: string;
  search?: string;
  status?: UserStatus;
  page?: number;
  limit?: number;
}

/**
 * User Repository
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('user');
  }

  /**
   * User-specific select fields (excludes password)
   */
  private get safeUserSelect() {
    return {
      id: true,
      email: true,
      status: true,
      tenantId: true,
      mfaEnabled: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true,
        },
      },
    };
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  /**
   * Find user by email (safe - no password)
   */
  async findByEmailSafe(email: string): Promise<UserWithRelations | null> {
    return this.findOne(
      { email },
      { select: this.safeUserSelect }
    ) as Promise<UserWithRelations | null>;
  }

  /**
   * Find user by ID (safe - no password)
   */
  async findByIdSafe(id: string): Promise<UserWithRelations | null> {
    return this.findById(id, { select: this.safeUserSelect }) as Promise<UserWithRelations | null>;
  }

  /**
   * Find users by tenant with filters and pagination
   */
  async findByTenant(options: FindUsersOptions): Promise<PaginatedResult<UserWithRelations>> {
    const { tenantId, search, status, page = 1, limit = 10 } = options;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.email = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    return this.findManyPaginated(
      {
        where,
        select: this.safeUserSelect,
        orderBy: { createdAt: 'desc' },
      },
      page,
      limit
    ) as Promise<PaginatedResult<UserWithRelations>>;
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ email });
  }

  /**
   * Create user with hashed password
   */
  async createUser(data: {
    email: string;
    password: string;
    tenantId: string;
    status?: UserStatus;
    mfaEnabled?: boolean;
  }): Promise<UserWithRelations> {
    return this.create(data, { select: this.safeUserSelect }) as Promise<UserWithRelations>;
  }

  /**
   * Update user (excludes password from return)
   */
  async updateUser(
    id: string,
    data: {
      email?: string;
      password?: string;
      status?: UserStatus;
      mfaEnabled?: boolean;
    }
  ): Promise<UserWithRelations> {
    return this.updateById(id, data, {
      select: this.safeUserSelect,
    }) as Promise<UserWithRelations>;
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.updateById(id, {
      lastLogin: new Date(),
    });
  }

  /**
   * Soft delete user (set status to Inactive)
   */
  async deactivateUser(id: string): Promise<UserWithRelations> {
    return this.updateById(
      id,
      { status: 'Inactive' },
      { select: this.safeUserSelect }
    ) as Promise<UserWithRelations>;
  }

  /**
   * Get users count by tenant
   */
  async countByTenant(tenantId: string, status?: UserStatus): Promise<number> {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }
    return this.count(where);
  }

  /**
   * Find users by IDs (for batch operations)
   */
  async findByIds(ids: string[]): Promise<UserWithRelations[]> {
    return this.findMany({
      where: { id: { in: ids } },
      select: this.safeUserSelect,
    }) as Promise<UserWithRelations[]>;
  }

  /**
   * Find users by tenant IDs (for validation)
   */
  async findByTenantIds(tenantIds: string[]): Promise<User[]> {
    return this.findMany({
      where: { tenantId: { in: tenantIds } },
    });
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
