import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';

/**
 * POST /api/auth/dev-login
 *
 * DEV-ONLY escape hatch that issues a valid JWT for an arbitrary email +
 * tenantId without consulting the database. Exists because the User /
 * UserSession Prisma models are not yet present in the live schema, so
 * the real /api/auth/login cannot complete.
 *
 * Returns 404 in production. DELETE THIS FILE once the real login flow
 * works against the schema — it is a temporary unblock for intern work.
 */
const DevLoginSchema = z.object({
  email: z.string().email().default('dev@auraos.local'),
  tenantId: z.string().min(1).default('dev-tenant'),
  userId: z.string().min(1).default('dev-user'),
});

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine — defaults will be used
  }

  const parsed = DevLoginSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid dev-login payload', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email, tenantId, userId } = parsed.data;

  const accessToken = generateAccessToken({ userId, email, tenantId });
  const refreshToken = generateRefreshToken({ userId, email, tenantId });

  const response = NextResponse.json({
    success: true,
    data: { user: { id: userId, email, tenantId }, accessToken, refreshToken },
    message: 'Dev login successful — production will return 404',
  });

  setAuthCookies(response, { accessToken, refreshToken });
  return response;
}
