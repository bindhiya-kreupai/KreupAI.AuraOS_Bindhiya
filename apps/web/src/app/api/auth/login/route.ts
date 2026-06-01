import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { comparePassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { validationErrorResponse } from '@/lib/validators';
import { authRateLimit } from '@/lib/middleware/rate-limit';
import { logAuthEvent } from '@/lib/logger';
import { logger } from '@/lib/logger';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const POST = authRateLimit(async function (request: NextRequest) {
  try {
    // Get client information from headers
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Validate request body
    const body = await request.json();
    const validatedData = LoginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        password: true,
        status: true,
        tenantId: true,
        mfaEnabled: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!user) {
      logAuthEvent('failed-login', undefined, validatedData.email, ipAddress, 'User not found');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'Active') {
      return NextResponse.json(
        { success: false, error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      logAuthEvent('failed-login', user.id, user.email, ipAddress, 'Invalid password');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if MFA is enabled for this user
    if (user.mfaEnabled) {
      // Create audit log for MFA required
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_MFA_REQUIRED',
          entityType: 'Authentication',
          details: `User ${user.email} requires MFA verification from ${ipAddress}`,
          ipAddress,
        },
      });

      logger.info({
        userId: user.id,
        email: user.email,
        ipAddress,
      }, 'Login password verified, MFA required');

      // Return MFA required response
      return NextResponse.json({
        success: true,
        mfaRequired: true,
        userId: user.id,
        message: 'MFA verification required. Please provide your verification code.',
      });
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create user session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        ipAddress,
        device: userAgent.substring(0, 200), // Limit length
        browser: userAgent.split('/')[0]?.substring(0, 100),
        status: 'Active',
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      sessionId: session.id,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      sessionId: session.id,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'Authentication',
        details: `User logged in from ${ipAddress}`,
        ipAddress,
      },
    });

    // Log successful authentication
    logAuthEvent('login', user.id, user.email, ipAddress);

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
          mfaEnabled: user.mfaEnabled,
          employee: user.employee,
        },
        session: {
          id: session.id,
          createdAt: session.createdAt,
        },
      },
      message: 'Login successful',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error({ error }, '');
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
});
