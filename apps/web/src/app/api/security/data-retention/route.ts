import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  safeJson,
  serverError,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

const VALID_ACTIONS = ['archive', 'delete', 'anonymize'];

export const DEFAULT_POLICIES: {
  category: string;
  description: string;
  retentionDays: number;
  action: string;
}[] = [
  {
    category: 'audit-logs',
    description: 'System audit and access logs',
    retentionDays: 365,
    action: 'archive',
  },
  {
    category: 'employee-records',
    description: 'Employee records after termination',
    retentionDays: 2555,
    action: 'archive',
  },
  {
    category: 'payroll-records',
    description: 'Payroll history records',
    retentionDays: 2555,
    action: 'archive',
  },
  {
    category: 'application-data',
    description: 'Rejected candidate application data',
    retentionDays: 180,
    action: 'delete',
  },
  {
    category: 'session-logs',
    description: 'User session logs',
    retentionDays: 90,
    action: 'delete',
  },
];

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/retention:read'))
      return forbidden('security/retention:read');
    let rows = await (prisma as any).dataRetentionPolicy.findMany({
      where: { tenantId: user.tenantId, isDeleted: false },
      orderBy: { category: 'asc' },
    });
    if (!rows || rows.length === 0) {
      await Promise.all(
        DEFAULT_POLICIES.map((p) =>
          (prisma as any).dataRetentionPolicy.upsert({
            where: { tenantId_category: { tenantId: user.tenantId, category: p.category } },
            create: {
              tenantId: user.tenantId,
              category: p.category,
              description: p.description,
              retentionDays: p.retentionDays,
              action: p.action,
              isActive: true,
              createdBy: user.userId,
              updatedBy: user.userId,
            },
            update: {},
          })
        )
      );
      rows = await (prisma as any).dataRetentionPolicy.findMany({
        where: { tenantId: user.tenantId, isDeleted: false },
        orderBy: { category: 'asc' },
      });
    }
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/data-retention/route.ts' },
      'Failed to list policies'
    );
    return serverError(error, 'list');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/retention:update'))
      return forbidden('security/retention:update');
    const body = await safeJson(request);
    if (!body || !Array.isArray(body.policies)) {
      return validationError({ message: 'policies array is required', field: 'policies' });
    }
    for (const p of body.policies) {
      if (!p || typeof p.category !== 'string' || !p.category.trim()) {
        return validationError({ message: 'Each policy requires a category', field: 'category' });
      }
      if (p.action !== undefined && !VALID_ACTIONS.includes(String(p.action))) {
        return validationError({ message: `Invalid action for ${p.category}`, field: 'action' });
      }
    }
    await Promise.all(
      body.policies.map((p: any) => {
        const update: any = { updatedBy: user.userId };
        if (p.retentionDays !== undefined)
          update.retentionDays = Math.max(1, Number(p.retentionDays) || 1);
        if (p.action !== undefined) update.action = String(p.action);
        if (p.isActive !== undefined) update.isActive = Boolean(p.isActive);
        if (p.description !== undefined) update.description = String(p.description);
        return (prisma as any).dataRetentionPolicy.upsert({
          where: { tenantId_category: { tenantId: user.tenantId, category: String(p.category) } },
          create: {
            tenantId: user.tenantId,
            category: String(p.category),
            description: p.description ? String(p.description) : null,
            retentionDays:
              p.retentionDays !== undefined ? Math.max(1, Number(p.retentionDays) || 1) : 365,
            action: p.action ? String(p.action) : 'archive',
            isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
            createdBy: user.userId,
            updatedBy: user.userId,
          },
          update,
        });
      })
    );
    const rows = await (prisma as any).dataRetentionPolicy.findMany({
      where: { tenantId: user.tenantId, isDeleted: false },
      orderBy: { category: 'asc' },
    });
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/data-retention/route.ts' },
      'Failed to update policies'
    );
    return serverError(error, 'update');
  }
});
