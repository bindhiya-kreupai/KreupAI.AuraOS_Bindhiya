import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const userId = body.userId || 'dev-user';
    const email = body.email || 'dev@auraos.local';
    const tenantId = body.tenantId || 'dev-tenant';
    const sessionId = crypto.randomUUID();

    // Generate tokens
    const accessToken = generateAccessToken({ userId, email, tenantId, sessionId });
    const refreshToken = generateRefreshToken({ userId, email, tenantId, sessionId });

    // Create response
    const response = NextResponse.json({
      success: true,
      data: {
        userId,
        email,
        tenantId,
        sessionId,
      },
    });

    // Set cookies
    setAuthCookies(response, { accessToken, refreshToken });

    return response;
  } catch (error: any) {
    console.error('Dev login error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Dev login failed' },
      { status: 500 }
    );
  }
}
