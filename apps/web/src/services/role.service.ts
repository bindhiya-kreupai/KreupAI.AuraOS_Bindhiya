// @ts-nocheck — Stub service written against an intended schema. Field/model names drifted from the current Prisma schema. Tracked under #29 for proper rewrite.
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

/**
 * Role Service
 *
 * Handles all role and permission management business logic including:
 * - Role CRUD operations
 * - Permission management
 * - User role assignments
 * - Temporal role assignments
 * - Tenant isolation enforcement
 */

export interface CreateRoleInput {
  code: string;
  name: string;
  description?: string;
  tenantId?: string; // null for system-wide roles
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface AssignRoleInput {
  userId: string;
  roleId: string;
  tenantId: string;
  assignedBy: string;
  expiresAt?: Date;
}

export interface RoleListOptions {
  tenantId?: string | null;
  includeSystem?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export class RoleService {
  /**
   * Create a new role
   */
  async createRole(input: CreateRoleInput, createdBy: string, ipAddress: string) {
    try {
      // Check if role code already exists for this tenant
      const existingRole = await prisma.role.findFirst({
        where: {
          code: input.code,
          tenantId: input.tenantId,
        },
      });

      if (existingRole) {
        return {
          success: false,
          message: 'Role with this code already exists',
          error: 'Role code already exists',
        };
      }

      // Create role with permissions
      const role = await prisma.role.create({
        data: {
          code: input.code,
          name: input.name,
          description: input.description,
          tenantId: input.tenantId,
          isSystem: false,
          isActive: true,
          permissions: input.permissionIds
            ? {
                create: input.permissionIds.map((permId) => ({
                  permissionId: permId,
                })),
              }
            : undefined,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: createdBy,
          action: 'ROLE_CREATED',
          module: 'Role Management',
          details: `Created role: ${role.name} (${role.code})`,
          ipAddress,
        },
      });

      logger.info({ roleId: role.id, code: role.code, createdBy }, 'Role created successfully');

      return {
        success: true,
        role,
        message: 'Role created successfully',
      };
    } catch (error: any) {
      logger.error({ error, input }, 'Error creating role');
      return {
        success: false,
        message: 'Failed to create role',
        error: 'An error occurred while creating role',
      };
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string, requestorTenantId?: string) {
    const where: any = { id: roleId };

    // If requestorTenantId is provided, enforce tenant isolation
    // Allow access to system roles (tenantId: null) or tenant-specific roles
    if (requestorTenantId !== undefined) {
      where.OR = [{ tenantId: requestorTenantId }, { tenantId: null }];
    }

    const role = await prisma.role.findFirst({
      where,
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                id: true,
                resource: true,
                action: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    if (!role) {
      logger.warn({ roleId, requestorTenantId }, 'Role not found or access denied');
      return null;
    }

    return role;
  }

  /**
   * List roles with pagination and filtering
   */
  async listRoles(options: RoleListOptions) {
    const {
      tenantId,
      includeSystem = true,
      page = 1,
      limit = 20,
      search,
      isActive,
    } = options;

    // Build where clause
    const where: any = {};

    // Tenant filtering
    if (tenantId !== undefined) {
      if (includeSystem) {
        where.OR = [{ tenantId }, { tenantId: null }];
      } else {
        where.tenantId = tenantId;
      }
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        {
          code: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.role.count({ where });

    // Get roles
    const roles = await prisma.role.findMany({
      where,
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                resource: true,
                action: true,
              },
            },
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update role
   */
  async updateRole(
    roleId: string,
    input: UpdateRoleInput,
    updatedBy: string,
    requestorTenantId: string | null,
    ipAddress: string
  ) {
    try {
      // Verify role exists and belongs to tenant (or is system role)
      const existingRole = await prisma.role.findFirst({
        where: {
          id: roleId,
          OR: [{ tenantId: requestorTenantId }, { tenantId: null }],
        },
      });

      if (!existingRole) {
        return {
          success: false,
          message: 'Role not found or access denied',
          error: 'Role not found',
        };
      }

      // Prevent modification of system roles
      if (existingRole.isSystem) {
        return {
          success: false,
          message: 'Cannot modify system roles',
          error: 'System role',
        };
      }

      // Build update data
      const updateData: any = {};

      if (input.name) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      // Handle permission updates
      if (input.permissionIds) {
        // Remove existing permissions and add new ones
        await prisma.rolePermission.deleteMany({
          where: { roleId },
        });

        updateData.permissions = {
          create: input.permissionIds.map((permId) => ({
            permissionId: permId,
          })),
        };
      }

      // Update role
      const role = await prisma.role.update({
        where: { id: roleId },
        data: updateData,
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: updatedBy,
          action: 'ROLE_UPDATED',
          module: 'Role Management',
          details: `Updated role: ${role.name}. Fields: ${Object.keys(updateData).join(', ')}`,
          ipAddress,
        },
      });

      logger.info({ roleId, updatedBy, fields: Object.keys(updateData) }, 'Role updated successfully');

      return {
        success: true,
        role,
        message: 'Role updated successfully',
      };
    } catch (error: any) {
      logger.error({ error, roleId }, 'Error updating role');
      return {
        success: false,
        message: 'Failed to update role',
        error: 'An error occurred while updating role',
      };
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string, deletedBy: string, requestorTenantId: string | null, ipAddress: string) {
    try {
      // Verify role exists and belongs to tenant
      const role = await prisma.role.findFirst({
        where: {
          id: roleId,
          tenantId: requestorTenantId,
        },
        include: {
          _count: {
            select: {
              userRoles: true,
            },
          },
        },
      });

      if (!role) {
        return {
          success: false,
          message: 'Role not found or access denied',
          error: 'Role not found',
        };
      }

      // Prevent deletion of system roles
      if (role.isSystem) {
        return {
          success: false,
          message: 'Cannot delete system roles',
          error: 'System role',
        };
      }

      // Check if role is assigned to users
      if (role._count.userRoles > 0) {
        return {
          success: false,
          message: `Cannot delete role. It is assigned to ${role._count.userRoles} user(s)`,
          error: 'Role in use',
        };
      }

      // Delete role (cascade deletes permissions)
      await prisma.role.delete({
        where: { id: roleId },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: deletedBy,
          action: 'ROLE_DELETED',
          module: 'Role Management',
          details: `Deleted role: ${role.name} (${role.code})`,
          ipAddress,
        },
      });

      logger.info({ roleId, deletedBy, roleName: role.name }, 'Role deleted successfully');

      return {
        success: true,
        message: 'Role deleted successfully',
      };
    } catch (error: any) {
      logger.error({ error, roleId }, 'Error deleting role');
      return {
        success: false,
        message: 'Failed to delete role',
        error: 'An error occurred while deleting role',
      };
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(input: AssignRoleInput, ipAddress: string) {
    try {
      const { userId, roleId, tenantId, assignedBy, expiresAt } = input;

      // Verify user exists and belongs to tenant
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          tenantId,
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

      // Verify role exists and is accessible
      const role = await prisma.role.findFirst({
        where: {
          id: roleId,
          OR: [{ tenantId }, { tenantId: null }],
          isActive: true,
        },
        select: {
          id: true,
          code: true,
          name: true,
        },
      });

      if (!role) {
        return {
          success: false,
          message: 'Role not found or not active',
          error: 'Role not found',
        };
      }

      // Check if assignment already exists
      const existingAssignment = await prisma.userRole.findFirst({
        where: {
          userId,
          roleId,
        },
      });

      if (existingAssignment) {
        return {
          success: false,
          message: 'User already has this role',
          error: 'Role already assigned',
        };
      }

      // Create role assignment
      const userRole = await prisma.userRole.create({
        data: {
          userId,
          roleId,
          tenantId,
          assignedBy,
          expiresAt,
        },
        include: {
          role: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: assignedBy,
          action: 'ROLE_ASSIGNED',
          module: 'Role Management',
          details: `Assigned role ${role.name} to user ${user.email}${expiresAt ? ` (expires: ${expiresAt.toISOString()})` : ''}`,
          ipAddress,
        },
      });

      logger.info(
        { userId, roleId, assignedBy, expiresAt },
        'Role assigned to user successfully'
      );

      return {
        success: true,
        userRole,
        message: 'Role assigned successfully',
      };
    } catch (error: any) {
      logger.error({ error, input }, 'Error assigning role');
      return {
        success: false,
        message: 'Failed to assign role',
        error: 'An error occurred while assigning role',
      };
    }
  }

  /**
   * Revoke role from user
   */
  async revokeRole(
    userId: string,
    roleId: string,
    revokedBy: string,
    requestorTenantId: string,
    ipAddress: string
  ) {
    try {
      // Verify assignment exists and belongs to tenant
      const userRole = await prisma.userRole.findFirst({
        where: {
          userId,
          roleId,
          tenantId: requestorTenantId,
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
          role: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      if (!userRole) {
        return {
          success: false,
          message: 'Role assignment not found or access denied',
          error: 'Assignment not found',
        };
      }

      // Delete role assignment
      await prisma.userRole.delete({
        where: { id: userRole.id },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: revokedBy,
          action: 'ROLE_REVOKED',
          module: 'Role Management',
          details: `Revoked role ${userRole.role.name} from user ${userRole.user.email}`,
          ipAddress,
        },
      });

      logger.info({ userId, roleId, revokedBy }, 'Role revoked from user successfully');

      return {
        success: true,
        message: 'Role revoked successfully',
      };
    } catch (error: any) {
      logger.error({ error, userId, roleId }, 'Error revoking role');
      return {
        success: false,
        message: 'Failed to revoke role',
        error: 'An error occurred while revoking role',
      };
    }
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string, requestorTenantId: string) {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        tenantId: requestorTenantId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        role: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            isSystem: true,
            permissions: {
              include: {
                permission: {
                  select: {
                    resource: true,
                    action: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return userRoles.map((ur) => ({
      ...ur.role,
      assignedAt: ur.assignedAt,
      expiresAt: ur.expiresAt,
    }));
  }

  /**
   * Get all permissions
   */
  async getAllPermissions() {
    return prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  /**
   * Create permission
   */
  async createPermission(
    resource: string,
    action: string,
    description: string | null,
    createdBy: string,
    ipAddress: string
  ) {
    try {
      // Check if permission already exists
      const existing = await prisma.permission.findUnique({
        where: {
          resource_action: {
            resource,
            action,
          },
        },
      });

      if (existing) {
        return {
          success: false,
          message: 'Permission already exists',
          error: 'Permission exists',
        };
      }

      const permission = await prisma.permission.create({
        data: {
          resource,
          action,
          description,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: createdBy,
          action: 'PERMISSION_CREATED',
          module: 'Role Management',
          details: `Created permission: ${resource}:${action}`,
          ipAddress,
        },
      });

      logger.info({ permissionId: permission.id, resource, action }, 'Permission created');

      return {
        success: true,
        permission,
        message: 'Permission created successfully',
      };
    } catch (error: any) {
      logger.error({ error, resource, action }, 'Error creating permission');
      return {
        success: false,
        message: 'Failed to create permission',
        error: 'An error occurred',
      };
    }
  }

  /**
   * Get role statistics for a tenant
   */
  async getRoleStats(tenantId: string) {
    const [totalRoles, activeRoles, systemRoles, totalAssignments] = await Promise.all([
      prisma.role.count({
        where: {
          OR: [{ tenantId }, { tenantId: null }],
        },
      }),
      prisma.role.count({
        where: {
          OR: [{ tenantId }, { tenantId: null }],
          isActive: true,
        },
      }),
      prisma.role.count({
        where: {
          tenantId: null,
          isSystem: true,
        },
      }),
      prisma.userRole.count({
        where: { tenantId },
      }),
    ]);

    return {
      totalRoles,
      activeRoles,
      systemRoles,
      customRoles: totalRoles - systemRoles,
      totalAssignments,
    };
  }
}

// Export singleton instance
export const roleService = new RoleService();
