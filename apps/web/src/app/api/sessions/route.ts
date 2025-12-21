import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { SessionQuerySchema, validationErrorResponse, validateQueryParams } from '@/lib/validators';
import { logger } from '@/lib/logger';

// GET - Fetch all sessions with filters
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.SESSIONS, Action.READ, permissions);
    if (permissionError) return permissionError;

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const { userId, status, page, limit } = validateQueryParams(
      SessionQuerySchema,
      searchParams
    );

    // Build where clause
    const where: any = {};

    // If userId provided and not an admin, ensure they can only see their own sessions
    if (userId) {
      // Check if user has permission to view other users' sessions
      const canViewAllSessions = permissions.includes('sessions:manage');
      if (!canViewAllSessions && userId !== user.userId) {
        return NextResponse.json(
          { success: false, error: 'Can only view your own sessions' },
          { status: 403 }
        );
      }
      where.userId = userId;
    } else {
      // Default to current user's sessions if not admin
      const canViewAllSessions = permissions.includes('sessions:manage');
      if (!canViewAllSessions) {
        where.userId = user.userId;
      }
    }

    if (status) {
      where.status = status;
    }

    // Execute query
    const [sessions, total] = await Promise.all([
      prisma.userSession.findMany({
        where,
        select: {
          id: true,
          userId: true,
          ipAddress: true,
          device: true,
          browser: true,
          location: true,
          lastActive: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { lastActive: 'desc' },
      }),
      prisma.userSession.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: sessions,
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

    logger.error('Error fetching sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
});
