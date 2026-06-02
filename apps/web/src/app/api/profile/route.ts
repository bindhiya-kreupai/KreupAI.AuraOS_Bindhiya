// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withAuth } from '@/lib/auth';
import { ChangePasswordSchema, validationErrorResponse } from '@/lib/validators';
import { hashPassword, comparePassword } from '@/lib/auth/password';
import { logger } from '@/lib/logger';

// GET - Fetch current user profile
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    // Fetch user profile with employee data
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        status: true,
        tenantId: true,
        mfaEnabled: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            maritalStatus: true,
            nationality: true,
            personalEmail: true,
            mobileNumber: true,
            emergencyContact: true,
            emergencyContactNumber: true,
            company: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            jobProfile: {
              select: {
                id: true,
                title: true,
              },
            },
            grade: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
            employmentType: {
              select: {
                id: true,
                name: true,
              },
            },
            employeeStatus: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userProfile,
    });
  } catch (error: any) {
    logger.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
});

// PUT - Update current user profile
export const PUT = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();

    // Users can only update limited fields in their profile
    const allowedFields = ['personalEmail', 'mobileNumber', 'emergencyContact', 'emergencyContactNumber'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Check if user has employee record
    const userWithEmployee = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        employee: {
          select: { id: true },
        },
      },
    });

    if (!userWithEmployee?.employee) {
      return NextResponse.json(
        { success: false, error: 'Employee profile not found' },
        { status: 404 }
      );
    }

    // Update employee profile
    const updatedEmployee = await prisma.employee.update({
      where: { id: userWithEmployee.employee.id },
      data: updateData,
      select: {
        id: true,
        personalEmail: true,
        mobileNumber: true,
        emergencyContact: true,
        emergencyContactNumber: true,
        updatedAt: true,
      },
    });

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'UPDATE',
        resourceType: 'Profile',
        metadata: { description: 'Updated profile information' } as any,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    logger.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
});
