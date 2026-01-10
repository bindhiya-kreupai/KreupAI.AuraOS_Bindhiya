import type { ServiceResponse, ListOptions } from './base.service';
import { BaseService } from './base.service';
import { hashPassword } from '@/lib/auth/password';
import type { User, UserStatus } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  password: string;
  tenantId: string;
  status?: UserStatus;
  mfaEnabled?: boolean;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  status?: UserStatus;
  mfaEnabled?: boolean;
}

export interface UserQueryOptions extends ListOptions {
  tenantId?: string;
  status?: string;
}

/**
 * User Service
 * Handles all user-related business logic
 */
export class UserService extends BaseService {
  constructor() {
    super('UserService');
  }
  /**
   * List users with filters and pagination
   */
  async listUsers(
    options: UserQueryOptions,
    requestingUserId: string
  ): Promise<ServiceResponse> {
    try {
      const { search, status, tenantId, page, limit } = options;

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

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          select: {
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
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        success: true,
        data: users,
        meta: this.buildPaginationMeta(total, page, limit),
      };
    } catch (error) {
      this.logger.error({ error, options }, 'Failed to list users');
      return {
        success: false,
        error: 'Failed to fetch users',
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ServiceResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
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
        },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to get user by ID');
      return {
        success: false,
        error: 'Failed to fetch user',
      };
    }
  }

  /**
   * Create new user
   */
  async createUser(
    input: CreateUserInput,
    createdBy: string,
    ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password);

      // Create user within a transaction
      const result = await this.executeTransaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: input.email,
            password: hashedPassword,
            tenantId: input.tenantId,
            status: input.status || 'Active',
            mfaEnabled: input.mfaEnabled || false,
          },
          select: {
            id: true,
            email: true,
            status: true,
            tenantId: true,
            mfaEnabled: true,
            createdAt: true,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: createdBy,
            action: 'CREATE',
            module: 'User Management',
            details: `Created user: ${newUser.email}`,
            ipAddress,
          },
        });

        return newUser;
      });

      this.logger.info({ userId: result.id, email: result.email }, 'User created successfully');

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error({ error, input: { email: input.email } }, 'Failed to create user');
      return {
        success: false,
        error: 'Failed to create user',
      };
    }
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    input: UpdateUserInput,
    updatedBy: string,
    ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // If email is being updated, check for conflicts
      if (input.email && input.email !== existingUser.email) {
        const emailConflict = await this.prisma.user.findUnique({
          where: { email: input.email },
        });

        if (emailConflict) {
          return {
            success: false,
            error: 'Email already in use',
          };
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (input.email) updateData.email = input.email;
      if (input.status) updateData.status = input.status;
      if (input.mfaEnabled !== undefined) updateData.mfaEnabled = input.mfaEnabled;
      if (input.password) {
        updateData.password = await hashPassword(input.password);
      }

      // Update user within a transaction
      const result = await this.executeTransaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: updateData,
          select: {
            id: true,
            email: true,
            status: true,
            tenantId: true,
            mfaEnabled: true,
            updatedAt: true,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: updatedBy,
            action: 'UPDATE',
            module: 'User Management',
            details: `Updated user: ${updatedUser.email}`,
            ipAddress,
          },
        });

        return updatedUser;
      });

      this.logger.info({ userId, updatedBy }, 'User updated successfully');

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error({ error, userId, input }, 'Failed to update user');
      return {
        success: false,
        error: 'Failed to update user',
      };
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(
    userId: string,
    deletedBy: string,
    ipAddress: string
  ): Promise<ServiceResponse> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Soft delete by updating status
      await this.executeTransaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { status: 'Inactive' },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: deletedBy,
            action: 'DELETE',
            module: 'User Management',
            details: `Deleted user: ${existingUser.email}`,
            ipAddress,
          },
        });
      });

      this.logger.info({ userId, deletedBy }, 'User deleted successfully');

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error({ error, userId, deletedBy }, 'Failed to delete user');
      return {
        success: false,
        error: 'Failed to delete user',
      };
    }
  }

  /**
   * Check if user exists by email
   */
  async userExistsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return !!user;
  }
}

// Export singleton instance
export const userService = new UserService();
