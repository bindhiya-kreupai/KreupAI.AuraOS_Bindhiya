import { prisma } from '@aura/database';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

/**
 * User Service
 *
 * Handles all user management business logic including:
 * - User CRUD operations
 * - Profile management
 * - Password changes
 * - User status management
 * - Tenant isolation enforcement
 */

export interface CreateUserInput {
  email: string;
  password: string;
  tenantId: string;
  employeeId?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  mfaEnabled?: boolean;
}

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
  ipAddress: string;
}

export interface UserListOptions {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  sortBy?: 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export class UserService {
  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput, createdBy: string, ipAddress: string) {
    try {
      // Check if email already exists (case-insensitive)
      const existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: input.email,
            mode: 'insensitive',
          },
        },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
          error: 'Email already exists',
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          tenantId: input.tenantId,
          employeeId: input.employeeId,
          status: input.status || 'Active',
          mfaEnabled: false,
        },
        select: {
          id: true,
          email: true,
          tenantId: true,
          status: true,
          createdAt: true,
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: createdBy,
          action: 'USER_CREATED',
          module: 'User Management',
          details: `Created user: ${user.email}`,
          ipAddress,
        },
      });

      logger.info({ userId: user.id, email: user.email, createdBy }, 'User created successfully');

      return {
        success: true,
        user,
        message: 'User created successfully',
      };
    } catch (error: any) {
      logger.error({ error, input }, 'Error creating user');
      return {
        success: false,
        message: 'Failed to create user',
        error: 'An error occurred while creating user',
      };
    }
  }

  /**
   * Get user by ID with tenant isolation
   */
  async getUserById(userId: string, requestorTenantId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: requestorTenantId, // Enforce tenant isolation
      },
      select: {
        id: true,
        email: true,
        tenantId: true,
        status: true,
        mfaEnabled: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        roles: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          select: {
            role: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
            assignedAt: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!user) {
      logger.warn({ userId, requestorTenantId }, 'User not found or access denied');
      return null;
    }

    return user;
  }

  /**
   * Get user by email with tenant isolation
   */
  async getUserByEmail(email: string, tenantId: string) {
    return prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        tenantId,
      },
      select: {
        id: true,
        email: true,
        tenantId: true,
        status: true,
        mfaEnabled: true,
        lastLogin: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * List users with pagination and filtering
   */
  async listUsers(options: UserListOptions) {
    const {
      tenantId,
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build where clause
    const where: any = {
      tenantId, // Enforce tenant isolation
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          employee: {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        status: true,
        mfaEnabled: true,
        lastLogin: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    input: UpdateUserInput,
    updatedBy: string,
    requestorTenantId: string,
    ipAddress: string
  ) {
    try {
      // Verify user exists and belongs to tenant
      const existingUser = await prisma.user.findFirst({
        where: {
          id: userId,
          tenantId: requestorTenantId,
        },
      });

      if (!existingUser) {
        return {
          success: false,
          message: 'User not found or access denied',
          error: 'User not found',
        };
      }

      // If updating email, check for duplicates
      if (input.email && input.email !== existingUser.email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email: {
              equals: input.email,
              mode: 'insensitive',
            },
            id: {
              not: userId,
            },
          },
        });

        if (emailExists) {
          return {
            success: false,
            message: 'Email already in use',
            error: 'Email already exists',
          };
        }
      }

      // Build update data
      const updateData: any = {};

      if (input.email) updateData.email = input.email;
      if (input.status) updateData.status = input.status;
      if (input.mfaEnabled !== undefined) updateData.mfaEnabled = input.mfaEnabled;

      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 12);
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          status: true,
          mfaEnabled: true,
          updatedAt: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: updatedBy,
          action: 'USER_UPDATED',
          module: 'User Management',
          details: `Updated user: ${user.email}. Fields: ${Object.keys(updateData).join(', ')}`,
          ipAddress,
        },
      });

      logger.info({ userId: user.id, updatedBy, fields: Object.keys(updateData) }, 'User updated successfully');

      return {
        success: true,
        user,
        message: 'User updated successfully',
      };
    } catch (error: any) {
      logger.error({ error, userId }, 'Error updating user');
      return {
        success: false,
        message: 'Failed to update user',
        error: 'An error occurred while updating user',
      };
    }
  }

  /**
   * Change user password (requires current password)
   */
  async changePassword(input: ChangePasswordInput) {
    try {
      const { userId, currentPassword, newPassword, ipAddress } = input;

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'User not found',
        };
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        logger.warn({ userId, ipAddress }, 'Invalid current password during password change');
        return {
          success: false,
          message: 'Current password is incorrect',
          error: 'Invalid current password',
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and revoke all sessions
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        }),
        prisma.userSession.updateMany({
          where: {
            userId,
            status: 'Active',
          },
          data: {
            status: 'Revoked',
          },
        }),
        prisma.auditLog.create({
          data: {
            userId,
            action: 'PASSWORD_CHANGED',
            module: 'User Management',
            details: `User changed password. All active sessions revoked.`,
            ipAddress,
          },
        }),
      ]);

      logger.info({ userId, email: user.email, ipAddress }, 'Password changed successfully');

      return {
        success: true,
        message: 'Password changed successfully. Please login again.',
      };
    } catch (error: any) {
      logger.error({ error, userId: input.userId }, 'Error changing password');
      return {
        success: false,
        message: 'Failed to change password',
        error: 'An error occurred while changing password',
      };
    }
  }

  /**
   * Delete user (soft delete by setting status to Inactive)
   */
  async deleteUser(userId: string, deletedBy: string, requestorTenantId: string, ipAddress: string) {
    try {
      // Verify user exists and belongs to tenant
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          tenantId: requestorTenantId,
        },
        select: {
          id: true,
          email: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found or access denied',
          error: 'User not found',
        };
      }

      // Soft delete (set status to Inactive) and revoke sessions
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { status: 'Inactive' },
        }),
        prisma.userSession.updateMany({
          where: {
            userId,
            status: 'Active',
          },
          data: {
            status: 'Revoked',
          },
        }),
        prisma.auditLog.create({
          data: {
            userId: deletedBy,
            action: 'USER_DELETED',
            module: 'User Management',
            details: `Deleted user: ${user.email}`,
            ipAddress,
          },
        }),
      ]);

      logger.info({ userId, deletedBy, email: user.email }, 'User deleted successfully');

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error: any) {
      logger.error({ error, userId }, 'Error deleting user');
      return {
        success: false,
        message: 'Failed to delete user',
        error: 'An error occurred while deleting user',
      };
    }
  }

  /**
   * Activate/Deactivate user
   */
  async setUserStatus(
    userId: string,
    status: 'Active' | 'Inactive' | 'Suspended',
    updatedBy: string,
    requestorTenantId: string,
    ipAddress: string
  ) {
    try {
      // Verify user exists and belongs to tenant
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          tenantId: requestorTenantId,
        },
        select: {
          id: true,
          email: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found or access denied',
          error: 'User not found',
        };
      }

      // Update status
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: {
          id: true,
          email: true,
          status: true,
        },
      });

      // If deactivating or suspending, revoke all sessions
      if (status !== 'Active') {
        await prisma.userSession.updateMany({
          where: {
            userId,
            status: 'Active',
          },
          data: {
            status: 'Revoked',
          },
        });
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: updatedBy,
          action: 'USER_STATUS_CHANGED',
          module: 'User Management',
          details: `Changed user status to ${status}: ${user.email}`,
          ipAddress,
        },
      });

      logger.info({ userId, status, updatedBy }, 'User status changed successfully');

      return {
        success: true,
        user: updatedUser,
        message: `User status changed to ${status}`,
      };
    } catch (error: any) {
      logger.error({ error, userId }, 'Error changing user status');
      return {
        success: false,
        message: 'Failed to change user status',
        error: 'An error occurred while changing user status',
      };
    }
  }

  /**
   * Get user statistics for a tenant
   */
  async getUserStats(tenantId: string) {
    const [total, active, inactive, suspended, mfaEnabled] = await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId, status: 'Active' } }),
      prisma.user.count({ where: { tenantId, status: 'Inactive' } }),
      prisma.user.count({ where: { tenantId, status: 'Suspended' } }),
      prisma.user.count({ where: { tenantId, mfaEnabled: true } }),
    ]);

    return {
      total,
      active,
      inactive,
      suspended,
      mfaEnabled,
      mfaAdoptionRate: total > 0 ? (mfaEnabled / total) * 100 : 0,
    };
  }
}

// Export singleton instance
export const userService = new UserService();
