import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const roles = [
      {
        roleId: 'role-1',
        roleName: 'Admin',
        description: 'Full system access',
        permissions: ['read:all', 'write:all', 'delete:all'],
        assignedUsers: 5,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        roleId: 'role-2',
        roleName: 'HR Manager',
        description: 'HR department access',
        permissions: ['read:employees', 'write:employees', 'read:payroll'],
        assignedUsers: 12,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        roleId: 'role-3',
        roleName: 'Employee',
        description: 'Basic employee access',
        permissions: ['read:own', 'write:own'],
        assignedUsers: 150,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ roles }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    const role = {
      roleId: `role-${Date.now()}`,
      roleName: body.roleName || '',
      description: body.description || '',
      permissions: body.permissions || [],
      assignedUsers: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ role }, { status: 201 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    const role = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ role }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = withEnhancedAuth(async (request, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
