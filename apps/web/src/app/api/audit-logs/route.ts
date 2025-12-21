import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { AuditLogQuerySchema, validationErrorResponse, validateQueryParams } from '@/lib/validators';
import { logger } from '@/lib/logger';

// GET - Fetch audit logs with filters
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission - audit logs are read-only
    const permissionError = requirePermission(Resource.AUDIT_LOGS, Action.READ, permissions);
    if (permissionError) return permissionError;

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const { userId, action, module, fromDate, toDate, page, limit } = validateQueryParams(
      AuditLogQuerySchema,
      searchParams
    );

    // Build where clause
    const where: any = {};

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

    // Date range filter
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    // Execute query
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
          createdAt: true,
          user: {
            select: {
              email: true,
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
  } catch (error) {
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
