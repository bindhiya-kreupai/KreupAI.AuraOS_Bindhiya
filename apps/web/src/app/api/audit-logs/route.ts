import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import {
  AuditLogQuerySchema,
  validationErrorResponse,
  validateQueryParams,
} from '@/lib/validators';
import { logger } from '@/lib/logger';

// GET - Fetch audit logs with filters
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.AUDIT_LOGS, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const { userId, action, module, fromDate, toDate, page, limit } = validateQueryParams(
      AuditLogQuerySchema,
      searchParams
    );

    const where: any = {
      tenantId: user.tenantId,
      isDeleted: false,
    };

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (module) {
      where.module = {
        contains: module,
        mode: 'insensitive',
      };
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(
          fromDate.includes('T') ? fromDate : `${fromDate}T00:00:00.000Z`
        );
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate.includes('T') ? toDate : `${toDate}T23:59:59.999Z`);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          userId: true,
          action: true,
          module: true,
          details: true,
          ipAddress: true,
          severity: true,
          resourceType: true,
          resourceId: true,
          success: true,
          metadata: true,
          userEmail: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
});
