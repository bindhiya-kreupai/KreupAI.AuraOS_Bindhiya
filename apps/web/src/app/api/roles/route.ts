import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { CreateRoleSchema, validationErrorResponse } from '@/lib/validators';

// GET - Fetch all roles
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.ROLES, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Fetch roles
    const roles = await prisma.role.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        usersCount: true,
        status: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
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
    const permissionError = requirePermission(Resource.ROLES, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    // Validate request body
    const body = await request.json();
    const validatedData = CreateRoleSchema.parse(body);

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name },
    });

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role with this name already exists' },
        { status: 400 }
      );
    }

    // Create role
    const newRole = await prisma.role.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status,
        usersCount: 0,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'CREATE',
        module: 'Role Management',
        details: `Created role: ${newRole.name}`,
        ipAddress,
      },
    });

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
      return validationErrorResponse(error);
    }

    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create role' },
      { status: 500 }
    );
  }
});
