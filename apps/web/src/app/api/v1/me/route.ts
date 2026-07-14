import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@aura/database';

/**
 * GET /api/v1/me
 *
 * Returns the currently authenticated user with profile data from the database.
 */
export const GET = requireSession(async (_request, session) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        tenantId: true,
        firstName: true,
        lastName: true,
        status: true,
        roles: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          select: {
            role: {
              select: {
                code: true,
                name: true,
              },
            },
          },
          take: 1,
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          userId: session.userId,
          email: session.email,
          tenantId: session.tenantId,
          sessionId: session.sessionId ?? null,
          employeeId: session.userId,
        },
      });
    }

    const primaryRole = user.roles[0]?.role?.name || '';
    const firstName = user.firstName || user.employee?.firstName || undefined;
    const lastName = user.lastName || user.employee?.lastName || undefined;

    return NextResponse.json({
      success: true,
      data: {
        userId: session.userId,
        email: session.email,
        tenantId: session.tenantId,
        sessionId: session.sessionId ?? null,
        employeeId: session.userId,
        firstName,
        lastName,
        role: primaryRole || undefined,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: {
        userId: session.userId,
        email: session.email,
        tenantId: session.tenantId,
        sessionId: session.sessionId ?? null,
        employeeId: session.userId,
      },
    });
  }
});
