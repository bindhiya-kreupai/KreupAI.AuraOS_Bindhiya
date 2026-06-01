import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth/enhanced-middleware';
import { logger } from '@/lib/logger';

/**
 * MFA Disable API - Disable MFA for current user
 * Requires authentication and password confirmation
 */

// Validation Schema
const DisableMFASchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/mfa/disable
 * Disable MFA (requires password confirmation)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, { user }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = DisableMFASchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    // Get user with password
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        password: true,
        mfaEnabled: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!userRecord.mfaEnabled) {
      return NextResponse.json(
        { success: false, error: 'MFA is not enabled' },
        { status: 400 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(validatedData.password, userRecord.password);

    if (!passwordMatch) {
      logger.warn({
        userId: user.userId,
        ipAddress,
      }, 'Failed MFA disable attempt - incorrect password');

      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Disable MFA
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.userId },
        data: { mfaEnabled: false },
      }),
      prisma.userMFA.delete({
        where: { userId: user.userId },
      }),
    ]);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'MFA_DISABLED',
        entityType: 'Authentication',
        details: 'MFA disabled by user',
        ipAddress,
      },
    });

    logger.info({
      userId: user.userId,
      email: userRecord.email,
      ipAddress,
    }, 'MFA disabled');

    return NextResponse.json({
      success: true,
      message: 'MFA has been disabled for your account',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error({ error, userId: user.userId }, 'Error disabling MFA');

    return NextResponse.json(
      { success: false, error: 'Failed to disable MFA' },
      { status: 500 }
    );
  }
});
