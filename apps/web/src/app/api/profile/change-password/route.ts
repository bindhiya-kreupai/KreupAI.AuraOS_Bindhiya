import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withAuth } from '@/lib/auth';
import { ChangePasswordSchema, validationErrorResponse } from '@/lib/validators';
import { hashPassword, comparePassword, validatePasswordStrength } from '@/lib/auth/password';

// POST - Change user password
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    // Validate request body
    const body = await request.json();
    const validatedData = ChangePasswordSchema.parse(body);

    // Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, password: true, email: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      validatedData.currentPassword,
      currentUser.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Validate new password strength
    const strengthErrors = validatePasswordStrength(validatedData.newPassword);
    if (strengthErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password does not meet strength requirements',
          details: strengthErrors,
        },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    const isSameAsOld = await comparePassword(
      validatedData.newPassword,
      currentUser.password
    );

    if (isSameAsOld) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.userId },
      data: { password: hashedPassword },
    });

    // Revoke all other sessions (force re-login on all devices)
    await prisma.userSession.updateMany({
      where: {
        userId: user.userId,
        status: 'Active',
      },
      data: { status: 'Revoked' },
    });

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'UPDATE',
        module: 'Profile',
        details: 'Password changed successfully',
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. All sessions have been revoked. Please login again.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
});
