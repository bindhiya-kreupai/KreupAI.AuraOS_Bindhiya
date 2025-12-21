import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

/**
 * Reset Password API - Resets user password using valid token
 * Public endpoint (no authentication required)
 */

// Validation Schema
const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

/**
 * POST /api/auth/reset-password
 * Resets user password if token is valid and not expired
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ResetPasswordSchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    // Find all unused, non-expired reset tokens
    // We'll check each one to find the matching hashed token
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
        token: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
      },
    });

    // Find matching token by comparing hashed values
    let matchingToken: (typeof resetTokens)[0] | null = null;
    for (const dbToken of resetTokens) {
      const isMatch = await bcrypt.compare(validatedData.token, dbToken.token);
      if (isMatch) {
        matchingToken = dbToken;
        break;
      }
    }

    // If no matching token found
    if (!matchingToken) {
      logger.warn({
        ipAddress,
        tokenPrefix: validatedData.token.substring(0, 8),
      }, 'Password reset attempted with invalid or expired token');

      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if user account is active
    if (matchingToken.user.status !== 'Active') {
      logger.warn({
        userId: matchingToken.user.id,
        email: matchingToken.user.email,
        status: matchingToken.user.status,
        ipAddress,
      }, 'Password reset attempted for inactive account');

      return NextResponse.json(
        { success: false, error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password and mark token as used in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: matchingToken!.userId },
        data: { password: hashedPassword },
      });

      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: matchingToken!.id },
        data: { used: true },
      });

      // Invalidate all other active sessions for security
      await tx.userSession.updateMany({
        where: {
          userId: matchingToken!.userId,
          status: 'Active',
        },
        data: {
          status: 'Revoked',
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: matchingToken!.userId,
          action: 'PASSWORD_RESET_COMPLETED',
          module: 'Authentication',
          details: `Password reset completed for ${matchingToken!.user.email}. All active sessions revoked.`,
          ipAddress,
        },
      });
    });

    logger.info({
      userId: matchingToken.userId,
      email: matchingToken.user.email,
      ipAddress,
    }, 'Password reset completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error({ error }, 'Error in reset password endpoint');

    // Don't reveal internal errors to user
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
