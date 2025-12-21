import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { verifyToken, generateAccessToken } from '@/lib/auth/jwt';
import { validationErrorResponse } from '@/lib/validators';

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const { refreshToken } = RefreshTokenSchema.parse(body);

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid refresh token',
        },
        { status: 401 }
      );
    }

    // Validate token type
    if (decoded.type !== 'refresh') {
      return NextResponse.json(
        { success: false, error: 'Invalid token type' },
        { status: 401 }
      );
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        status: true,
        tenantId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    if (user.status !== 'Active') {
      return NextResponse.json(
        { success: false, error: 'User account is not active' },
        { status: 403 }
      );
    }

    // Verify session is still active
    if (decoded.sessionId) {
      const session = await prisma.userSession.findUnique({
        where: { id: decoded.sessionId },
        select: { status: true },
      });

      if (!session || session.status !== 'Active') {
        return NextResponse.json(
          { success: false, error: 'Session is not active' },
          { status: 401 }
        );
      }

      // Update session last active
      await prisma.userSession.update({
        where: { id: decoded.sessionId },
        data: { lastActive: new Date() },
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      sessionId: decoded.sessionId,
    });

    return NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
