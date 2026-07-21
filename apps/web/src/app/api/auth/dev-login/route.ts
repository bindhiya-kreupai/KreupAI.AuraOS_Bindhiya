import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || 'dev@auraos.local';
    const tenantId = body.tenantId || 'dev-tenant';
    const userId = body.userId || 'dev-user';

    const accessToken = generateAccessToken({
      userId,
      email,
      tenantId,
      sessionId: 'dev-session',
    });

    const refreshToken = generateRefreshToken({
      userId,
      email,
      tenantId,
      sessionId: 'dev-session',
    });

    const response = NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userId,
          email,
          tenantId,
        },
      },
      message: 'Dev quick-login successful',
    });

    setAuthCookies(response, { accessToken, refreshToken });
    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Dev login failed' },
      { status: 500 }
    );
  }
}
