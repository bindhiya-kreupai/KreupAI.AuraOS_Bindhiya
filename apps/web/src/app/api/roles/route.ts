import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth/enhanced-middleware';
import { logger } from '@/lib/logger';

/**
 * Role Management API - Database-Backed RBAC Implementation
 * Supports both system-wide roles and tenant-specific roles
 */

// Validation Schemas
const CreateRoleSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z_]+$/),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  isSystem: z.boolean().default(false),
  permissionIds: z.array(z.string()).optional(),
});

const RoleQuerySchema = z.object({
  isActive: z.enum(['true', 'false']).optional(),
  isSystem: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// GET - Fetch all roles for the tenant
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    if (!permissions.includes('roles:read') && !permissions.includes('roles:manage')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = RoleQuerySchema.parse({
      isActive: searchParams.get('isActive') || undefined,
      isSystem: searchParams.get('isSystem') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    });

    // Build where clause
    const where: any = {
      tenantId: user.tenantId, // Only show tenant-specific roles
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    if (query.isSystem !== undefined) {
      where.isSystem = query.isSystem === 'true';
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Fetch roles with pagination
    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          isSystem: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              userRoles: true,
              permissions: true,
            },
          },
        },
        orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.role.count({ where }),
    ]);

    logger.info({
      userId: user.userId,
      tenantId: user.tenantId,
      count: roles.length,
      total,
    }, 'Roles fetched successfully');

    return NextResponse.json({
      success: true,
      data: roles,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    logger.error({ error, userId: user.userId }, 'Error fetching roles');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
});

// POST - Create a new role
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    if (!permissions.includes('roles:create') && !permissions.includes('roles:manage')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = CreateRoleSchema.parse(body);

    // Check if role code already exists for this tenant
    const existingRole = await prisma.role.findUnique({
      where: {
        tenantId_code: {
          tenantId: user.tenantId,
          code: validatedData.code,
        },
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role with this code already exists' },
        { status: 400 }
      );
    }

    // Create role with permissions
    const newRole = await prisma.role.create({
      data: {
        tenantId: user.tenantId,
        code: validatedData.code,
        name: validatedData.name,
        description: validatedData.description,
        isSystem: validatedData.isSystem,
        isActive: true,
        permissions: validatedData.permissionIds
          ? {
              create: validatedData.permissionIds.map((permId) => ({
                permissionId: permId,
              })),
            }
          : undefined,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        isSystem: true,
        isActive: true,
        createdAt: true,
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                resource: true,
                action: true,
              },
            },
          },
        },
      },
    });

    // Create audit log
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'CREATE',
        module: 'Role Management',
        details: `Created role: ${newRole.code} (${newRole.name})`,
        ipAddress,
      },
    });

    logger.info({
      userId: user.userId,
      tenantId: user.tenantId,
      roleId: newRole.id,
      roleCode: newRole.code,
    }, 'Role created successfully');

    return NextResponse.json(
      {
        success: true,
        data: newRole,
        message: 'Role created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error({ error, userId: user.userId }, 'Error creating role');
    return NextResponse.json(
      { success: false, error: 'Failed to create role' },
      { status: 500 }
    );
  }
});
