import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user } = context;
  const tenantId = user.tenantId;

  const permissionMatrix = {
    roles: [
      { id: 'role-001', name: 'Super Admin', level: 0, userCount: 3 },
      { id: 'role-002', name: 'HR Admin', level: 1, userCount: 8 },
      { id: 'role-003', name: 'HR Manager', level: 2, userCount: 15 },
      { id: 'role-004', name: 'Department Manager', level: 3, userCount: 45 },
      { id: 'role-005', name: 'Team Lead', level: 4, userCount: 78 },
      { id: 'role-006', name: 'Employee', level: 5, userCount: 1098 },
    ],
    modules: [
      { id: 'mod-emp', name: 'Employee Management' },
      { id: 'mod-leave', name: 'Leave Management' },
      { id: 'mod-pay', name: 'Payroll' },
      { id: 'mod-perf', name: 'Performance' },
      { id: 'mod-recruit', name: 'Recruitment' },
      { id: 'mod-learn', name: 'Learning' },
      { id: 'mod-analytics', name: 'Analytics' },
      { id: 'mod-admin', name: 'Admin Settings' },
    ],
    permissions: {
      'role-001': {
        'mod-emp': ['create', 'read', 'update', 'delete', 'export', 'bulk-edit'],
        'mod-leave': ['create', 'read', 'update', 'delete', 'approve', 'export'],
        'mod-pay': ['create', 'read', 'update', 'delete', 'run-payroll', 'export'],
        'mod-perf': ['create', 'read', 'update', 'delete', 'calibrate', 'export'],
        'mod-recruit': ['create', 'read', 'update', 'delete', 'approve', 'export'],
        'mod-learn': ['create', 'read', 'update', 'delete', 'assign', 'export'],
        'mod-analytics': ['read', 'export', 'create-reports', 'schedule'],
        'mod-admin': ['create', 'read', 'update', 'delete', 'configure'],
      },
      'role-002': {
        'mod-emp': ['create', 'read', 'update', 'export'],
        'mod-leave': ['create', 'read', 'update', 'approve', 'export'],
        'mod-pay': ['read', 'update', 'run-payroll', 'export'],
        'mod-perf': ['create', 'read', 'update', 'calibrate'],
        'mod-recruit': ['create', 'read', 'update', 'approve'],
        'mod-learn': ['create', 'read', 'update', 'assign'],
        'mod-analytics': ['read', 'export', 'create-reports'],
        'mod-admin': ['read', 'update'],
      },
      'role-006': {
        'mod-emp': ['read-own', 'update-own'],
        'mod-leave': ['create-own', 'read-own'],
        'mod-pay': ['read-own'],
        'mod-perf': ['read-own', 'submit-self-review'],
        'mod-recruit': ['read-referrals'],
        'mod-learn': ['read', 'enroll', 'track-progress'],
        'mod-analytics': [],
        'mod-admin': [],
      },
    },
    lastUpdated: '2025-12-15T10:00:00Z',
    updatedBy: 'admin-001',
  };

  return NextResponse.json({ success: true, data: permissionMatrix });
});

export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    const { user } = context;
    const tenantId = user.tenantId;

    const body = await request.json();

    const updatedPermissions = {
      roleId: body.roleId || 'role-004',
      moduleId: body.moduleId || 'mod-analytics',
      permissions: body.permissions || ['read', 'export'],
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin-001',
      changelog: {
        previous: ['read'],
        current: ['read', 'export'],
        reason: body.reason || 'Granting export access to department managers',
      },
    };

    return NextResponse.json({
      success: true,
      data: updatedPermissions,
      message: 'Permissions updated successfully',
    });
  }),
  {
    action: AuditAction.PERMISSION_GRANTED,
    resourceType: 'permission_matrix',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);
