/**
 * Password Reset Endpoint
 * Resets user password using a valid reset token
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { passwordResetService } from '@/lib/auth/password-reset.service';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const ResetSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * POST /api/auth/password-reset/reset
 * Reset password using a valid token
 *
 * @body token - Password reset token
 * @body newPassword - New password
 * @body confirmPassword - Password confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = ResetSchema.safeParse(body);
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

    const { token, newPassword } = validation.data;

    // Reset password
    const result = await passwordResetService.resetPassword({
      token,
      newPassword,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E1002',
            message: 'Invalid or expired token',
            details:
              'This password reset link is invalid or has expired. Please request a new one.',
          },
        },
        { status: 400 }
      );
    }

    logger.info({ userId: result.userId }, 'Password reset completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
      data: {
        userId: result.userId,
      },
    });
  } catch (error: any) {
    logger.error({ error }, 'Error resetting password');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Internal server error',
          details: 'Error resetting password',
        },
      },
      { status: 500 }
    );
  }
}
