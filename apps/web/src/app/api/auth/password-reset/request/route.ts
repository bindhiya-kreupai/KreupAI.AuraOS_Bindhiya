/**
 * Password Reset Request Endpoint
 * Generates a password reset token and sends reset email
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { passwordResetService } from '@/lib/auth/password-reset.service';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const RequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  tenantId: z.string().optional(),
});

/**
 * POST /api/auth/password-reset/request
 * Request a password reset token
 *
 * @body email - User's email address
 * @body tenantId - Optional tenant ID for multi-tenant setup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation error',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { email, tenantId } = validation.data;

    // Generate reset token
    const result = await passwordResetService.generateResetToken({
      email,
      tenantId,
    });

    // Always return success (don't reveal if user exists)
    // This is a security best practice to prevent email enumeration
    if (result) {
      const { token, expiresAt } = result;

      // TODO: Send password reset email
      // For now, we'll just log it (in production, integrate with email service)
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

      logger.info(
        {
          email,
          resetUrl,
          expiresAt,
        },
        'Password reset email would be sent (not implemented yet)'
      );

      // In development, return the token (remove in production)
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Password reset instructions sent to your email',
          _dev: {
            token,
            resetUrl,
            expiresAt,
          },
        });
      }
    }

    // Always return success message (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions',
    });
  } catch (error: any) {
    logger.error({ error }, 'Error processing password reset request');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Internal server error',
          details: 'Error processing password reset request',
        },
      },
      { status: 500 }
    );
  }
}
