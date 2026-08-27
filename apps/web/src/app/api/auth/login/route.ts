// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { comparePassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { validationErrorResponse } from '@/lib/validators';
import { authRateLimit } from '@/lib/middleware/rate-limit';
import { logAuthEvent } from '@/lib/logger';
import { logger } from '@/lib/logger';
import { generateDeviceFingerprint, isKnownDevice } from '@/lib/auth/device-fingerprint.service';
import { resolveLocation, formatLocation } from '@/lib/auth/geolocation.service';
import { logAnomalyEvent } from '@/lib/auth/session-anomaly.service';
import { sendNewDeviceLoginEmail } from '@/lib/services/email.service';

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)\s*(h|d|m|s)$/);
  if (!match) return 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const POST = authRateLimit(async function (request: NextRequest) {
  try {
    // Get client information from headers
    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

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
      return NextResponse.json({ success: false, error: 'Account is not active' }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = await comparePassword(validatedData.password, user.password);

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
          tenantId: user.tenantId,
          userId: user.id,
          action: 'LOGIN_MFA_REQUIRED',
          entityType: 'Authentication',
          metadata: {
            description: `User ${user.email} requires MFA verification from ${ipAddress}`,
          } as any,
          ipAddress,
        },
      });

      logger.info(
        {
          userId: user.id,
          email: user.email,
          ipAddress,
        },
        'Login password verified, MFA required'
      );

      // Return MFA required response
      return NextResponse.json({
        success: true,
        mfaRequired: true,
        userId: user.id,
        message: 'MFA verification required. Please provide your verification code.',
      });
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Enforce max concurrent sessions
    const maxSessions = parseInt(process.env.MAX_CONCURRENT_SESSIONS || '10', 10);
    const activeSessions = await prisma.userSession.count({
      where: { userId: user.id, status: 'Active' },
    });

    if (activeSessions >= maxSessions) {
      const oldestSessions = await prisma.userSession.findMany({
        where: { userId: user.id, status: 'Active' },
        orderBy: { lastActive: 'asc' },
        take: activeSessions - maxSessions + 1,
        select: { id: true },
      });

      if (oldestSessions.length > 0) {
        await prisma.userSession.updateMany({
          where: { id: { in: oldestSessions.map((s) => s.id) } },
          data: { status: 'Revoked' },
        });
        logger.info(
          { userId: user.id, revokedCount: oldestSessions.length },
          'Revoked oldest sessions to enforce max concurrent limit'
        );
      }
    }

    // Calculate session expiry from JWT_EXPIRES_IN (default 24h)
    const expiresInStr = process.env.JWT_EXPIRES_IN || '24h';
    const expiresInMs = parseDuration(expiresInStr);
    const expiresAt = new Date(Date.now() + expiresInMs);

    // Generate device fingerprint
    const acceptLanguage = request.headers.get('accept-language');
    const fingerprint = generateDeviceFingerprint(userAgent, ipAddress, acceptLanguage);

    // Resolve location from IP (best-effort, never blocks login)
    let locationStr = '';
    try {
      const geoLocation = await resolveLocation(ipAddress);
      locationStr = formatLocation(geoLocation);
    } catch (err: any) {
      logger.warn({ err, ipAddress }, 'Failed to resolve IP location — login proceeds');
    }

    // Check if this is a known device (best-effort)
    const deviceFingerprint = fingerprint.hash;
    let isKnown = true;
    try {
      isKnown = await isKnownDevice(user.id, deviceFingerprint, prisma);
    } catch (err: any) {
      logger.warn(
        { err, userId: user.id },
        'Failed to check known device status — assuming unknown device'
      );
      isKnown = false;
    }

    // Create user session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        ipAddress,
        device: userAgent.substring(0, 200), // Limit length
        browser: userAgent.split('/')[0]?.substring(0, 100),
        deviceFingerprint,
        location: locationStr || null,
        status: 'Active',
        expiresAt,
      },
    });

    // Detect and log anomaly if new device (best-effort, never blocks login — errors logged at ERROR level per AOS-SEC-010)
    if (!isKnown) {
      try {
        const anomalyType = locationStr ? 'NEW_DEVICE' : 'NEW_DEVICE';
        await logAnomalyEvent(
          {
            type: anomalyType,
            userId: user.id,
            email: user.email,
            ipAddress,
            device: userAgent.substring(0, 100),
            location: locationStr || 'Unknown',
            timestamp: new Date().toISOString(),
          },
          prisma
        );

        // Send email notification for new device login (best-effort)
        const userName = user.employee
          ? `${user.employee.firstName} ${user.employee.lastName}`
          : user.email;
        await sendNewDeviceLoginEmail(
          user.email,
          userName,
          userAgent.substring(0, 100),
          ipAddress,
          locationStr || 'Unknown',
          new Date().toLocaleString()
        );
      } catch (err: any) {
        logger.error(
          {
            err,
            userId: user.id,
            email: user.email,
            ipAddress,
            device: userAgent.substring(0, 100),
          },
          'Failed to record or notify anomaly event for new device login — login proceeds'
        );
      }
    }

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

    // Update last login — best-effort, never block login on it.
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    } catch (err: any) {
      logger.warn({ err, userId: user.id }, 'Failed to update lastLogin — login proceeds');
    }

    // Create audit log — best-effort. `module` is NOT NULL in the live DB
    // even though the schema marks it optional, so we always pass a value.
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'LOGIN',
          entityType: 'Authentication',
          module: 'auth',
          metadata: { description: `User logged in from ${ipAddress}` } as any,
          ipAddress,
        },
      });
    } catch (err: any) {
      logger.warn({ err, userId: user.id }, 'Failed to write login audit log — login proceeds');
    }

    // Log successful authentication
    logAuthEvent('login', user.id, user.email, ipAddress);

    // Return response — tokens are set as HTTP-only cookies so the browser
    // sends them automatically on subsequent same-origin requests. They are
    // also echoed in the body for clients that need bearer-style auth (mobile).
    const response = NextResponse.json({
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

    setAuthCookies(response, { accessToken, refreshToken });
    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error({ error }, '');
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
});
