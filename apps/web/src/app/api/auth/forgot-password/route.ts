import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

/**
 * Forgot Password API - Generates password reset token
 * Public endpoint (no authentication required)
 */

// Validation Schema
const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Token expiration: 1 hour
const TOKEN_EXPIRY_HOURS = 1;

/**
 * POST /api/auth/forgot-password
 * Initiates password reset flow by generating a reset token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ForgotPasswordSchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    // Find user by email (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: validatedData.email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        email: true,
        status: true,
        tenantId: true,
      },
    });

    // IMPORTANT: Always return success even if user not found (security best practice)
    // This prevents email enumeration attacks
    if (!user) {
      logger.warn({
        email: validatedData.email,
        ipAddress,
      }, 'Password reset requested for non-existent email');

      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Check if user account is active
    if (user.status !== 'Active') {
      logger.warn({
        userId: user.id,
        email: user.email,
        status: user.status,
        ipAddress,
      }, 'Password reset requested for inactive account');

      // Still return success to prevent account status enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate secure random token (32 bytes = 256 bits)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing (never store plain tokens)
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      data: {
        used: true, // Mark as used to invalidate
      },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
        ipAddress,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'Authentication',
        metadata: { description: `Password reset requested for ${user.email}` } as any,
        ipAddress,
      },
    });

    logger.info({
      userId: user.id,
      email: user.email,
      ipAddress,
      expiresAt,
    }, 'Password reset token generated successfully');

    // TODO: Send email with reset link
    // In production, this would send an email like:
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetUrl);

    // For now, in development, we'll return the token (REMOVE IN PRODUCTION!)
    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      ...(isDevelopment && {
        // ONLY in development - provide token for testing
        devToken: resetToken,
        devExpiresAt: expiresAt.toISOString(),
        devWarning: 'Token is provided for development testing only. Remove in production!',
      }),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address', details: error.errors },
        { status: 400 }
      );
    }

    logger.error({ error }, 'Error in forgot password endpoint');

    // Don't reveal internal errors to user
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
