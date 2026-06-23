import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';

/**
 * GET /api/v1/me
 *
 * Returns the currently authenticated user, derived purely from the
 * session JWT (no DB lookup). Used by the client-side AuthProvider
 * to populate `useCurrentUser()`.
 *
 * TODO(auth-db): Once the User + Employee Prisma models land, enrich
 * this response with employeeId, name, role, and avatar via a single
 * prisma.user.findUnique({ include: { employee: true } }) call.
 */
export const GET = requireSession(async (_request, session) => {
  return NextResponse.json({
    success: true,
    data: {
      userId: session.userId,
      email: session.email,
      tenantId: session.tenantId,
      sessionId: session.sessionId ?? null,
      // Placeholder — interns: until the Employee model returns,
      // pass `userId` anywhere you previously hardcoded 'EMP001'.
      employeeId: session.userId,
    },
  });
});
