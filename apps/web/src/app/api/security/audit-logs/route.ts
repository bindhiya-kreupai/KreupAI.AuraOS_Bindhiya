import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    const permissionError = requirePermission(Resource.AUDIT_LOGS, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const sp = new URL(request.url).searchParams;
    const action = sp.get('action') || undefined;
    const userId = sp.get('userId') || undefined;
    const module = sp.get('module') || undefined;
    const from = sp.get('from') || undefined;
    const to = sp.get('to') || undefined;
    const q = sp.get('q') || undefined;

    const where: any = { tenantId: user.tenantId, isDeleted: false };
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (module) where.module = { contains: module, mode: 'insensitive' };
    if (q) where.userEmail = { contains: q, mode: 'insensitive' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from.includes('T') ? from : `${from}T00:00:00.000Z`);
      if (to) where.createdAt.lte = new Date(to.includes('T') ? to : `${to}T23:59:59.999Z`);
    }

    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list audit logs');
  }
});
