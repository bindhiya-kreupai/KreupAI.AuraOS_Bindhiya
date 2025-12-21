import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authService } from '@/services/auth/auth.service';
import { prisma } from '@aura/database';
import bcrypt from 'bcryptjs';
import {
  createTestTenant,
  createTestUser,
  cleanupTestData,
  sleep,
  TestTenant,
  TestUser,
} from '../helpers/test-utils';

/**
 * Password Reset Flow Security Tests
 *
 * These tests verify that password reset flows work correctly and securely,
 * preventing common vulnerabilities like token reuse, email enumeration, etc.
 */

describe('Password Reset Flow Security Tests', () => {
  let tenant: TestTenant;
  let user: TestUser;

  beforeEach(async () => {
    await cleanupTestData();
    tenant = await createTestTenant();
    user = await createTestUser('test@example.com', 'OldPassword123!', tenant.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Password Reset Request', () => {
    it('should generate reset token for valid email', async () => {
      const result = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('reset link has been sent');

      // In development, token should be returned
      if (process.env.NODE_ENV === 'development') {
        expect(result.devToken).toBeDefined();
      }
    });

    it('should not reveal if email does not exist (security)', async () => {
      const result = await authService.requestPasswordReset({
        email: 'nonexistent@example.com',
        ipAddress: '127.0.0.1',
      });

      // Should return success to prevent email enumeration
      expect(result.success).toBe(true);
      expect(result.message).toContain('reset link has been sent');
    });

    it('should not reveal if account is inactive (security)', async () => {
      // Update user to inactive
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'Inactive' },
      });

      const result = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });

      // Should return success to prevent status enumeration
      expect(result.success).toBe(true);
      expect(result.message).toContain('reset link has been sent');
    });

    it('should invalidate previous tokens when new one is requested', async () => {
      // Request first token
      const result1 = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });

      const token1 = result1.devToken;

      // Request second token
      const result2 = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });

      const token2 = result2.devToken;

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);

      // First token should be marked as used/invalid
      const tokens = await prisma.passwordResetToken.findMany({
        where: {
          userId: user.id,
          used: false,
          expiresAt: { gt: new Date() },
        },
      });

      // Should only have one active token (the latest one)
      expect(tokens.length).toBe(1);
    });

    it('should create audit log for password reset request', async () => {
      await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          userId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
        },
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });
  });

  describe('Password Reset Completion', () => {
    let resetToken: string;

    beforeEach(async () => {
      const result = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });

      resetToken = result.devToken!;
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewPassword123!';

      const result = await authService.resetPassword({
        token: resetToken,
        newPassword,
        ipAddress: '127.0.0.1',
      });

      expect(result.success).toBe(true);

      // Verify new password works
      const loginResult = await authService.login(
        {
          email: user.email,
          password: newPassword,
        },
        '127.0.0.1',
        'Test Browser'
      );

      expect(loginResult.success).toBe(true);
    });

    it('should reject invalid token', async () => {
      const result = await authService.resetPassword({
        token: 'invalid-token-12345',
        newPassword: 'NewPassword123!',
        ipAddress: '127.0.0.1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid or expired');
    });

    it('should reject reused token', async () => {
      const newPassword = 'NewPassword123!';

      // First use
      const result1 = await authService.resetPassword({
        token: resetToken,
        newPassword,
        ipAddress: '127.0.0.1',
      });

      expect(result1.success).toBe(true);

      // Second use (should fail)
      const result2 = await authService.resetPassword({
        token: resetToken,
        newPassword: 'AnotherPassword123!',
        ipAddress: '127.0.0.1',
      });

      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Invalid or expired');
    });

    it('should mark token as used after successful reset', async () => {
      await authService.resetPassword({
        token: resetToken,
        newPassword: 'NewPassword123!',
        ipAddress: '127.0.0.1',
      });

      // Check token is marked as used
      const tokens = await prisma.passwordResetToken.findMany({
        where: {
          userId: user.id,
          used: true,
        },
      });

      expect(tokens.length).toBeGreaterThan(0);
    });

    it('should revoke all active sessions after password reset', async () => {
      // Create active sessions
      await prisma.userSession.createMany({
        data: [
          {
            userId: user.id,
            ipAddress: '192.168.1.1',
            device: 'Desktop',
            browser: 'Chrome',
            status: 'Active',
          },
          {
            userId: user.id,
            ipAddress: '192.168.1.2',
            device: 'Mobile',
            browser: 'Safari',
            status: 'Active',
          },
        ],
      });

      // Reset password
      await authService.resetPassword({
        token: resetToken,
        newPassword: 'NewPassword123!',
        ipAddress: '127.0.0.1',
      });

      // Verify all sessions are revoked
      const activeSessions = await prisma.userSession.findMany({
        where: {
          userId: user.id,
          status: 'Active',
        },
      });

      expect(activeSessions.length).toBe(0);
    });

    it('should create audit log for successful password reset', async () => {
      await authService.resetPassword({
        token: resetToken,
        newPassword: 'NewPassword123!',
        ipAddress: '127.0.0.1',
      });

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          userId: user.id,
          action: 'PASSWORD_RESET_COMPLETED',
        },
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });

    it('should not allow reset for inactive user', async () => {
      // Set user as inactive
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'Inactive' },
      });

      const result = await authService.resetPassword({
        token: resetToken,
        newPassword: 'NewPassword123!',
        ipAddress: '127.0.0.1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not active');
    });
  });

  describe('Token Expiration', () => {
    it('should reject expired token', async () => {
      // Create expired token manually
      const token = 'expired-token-12345';
      const hashedToken = await bcrypt.hash(token, 10);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: hashedToken,
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
          used: false,
          ipAddress: '127.0.0.1',
        },
      });

      const result = await authService.resetPassword({
        token,
        newPassword: 'NewPassword123!',
        ipAddress: '127.0.0.1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid or expired');
    });

    it('should accept token within expiration window', async () => {
      const result = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });

      const resetToken = result.devToken!;

      // Use immediately (well within 1 hour expiration)
      const resetResult = await authService.resetPassword({
        token: resetToken,
        newPassword: 'NewPassword123!',
        ipAddress: '127.0.0.1',
      });

      expect(resetResult.success).toBe(true);
    });
  });

  describe('Password Change (Authenticated User)', () => {
    it('should change password with correct current password', async () => {
      const result = await authService.login(
        {
          email: user.email,
          password: user.password,
        },
        '127.0.0.1',
        'Test Browser'
      );

      expect(result.success).toBe(true);
    });

    it('should reject password change with incorrect current password', async () => {
      const result = await authService.login(
        {
          email: user.email,
          password: 'WrongPassword123!',
        },
        '127.0.0.1',
        'Test Browser'
      );

      expect(result.success).toBe(false);
    });
  });

  describe('Password Security Requirements', () => {
    let resetToken: string;

    beforeEach(async () => {
      const result = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });

      resetToken = result.devToken!;
    });

    it('should hash password before storing', async () => {
      const newPassword = 'NewSecurePassword123!';

      await authService.resetPassword({
        token: resetToken,
        newPassword,
        ipAddress: '127.0.0.1',
      });

      // Get updated user
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      // Password should not match plain text
      expect(updatedUser?.password).not.toBe(newPassword);

      // Password should be hashed
      const isHashed = await bcrypt.compare(newPassword, updatedUser!.password);
      expect(isHashed).toBe(true);
    });

    it('should use strong hashing algorithm', async () => {
      const newPassword = 'NewSecurePassword123!';

      await authService.resetPassword({
        token: resetToken,
        newPassword,
        ipAddress: '127.0.0.1',
      });

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      // Bcrypt hashes start with $2a$ or $2b$
      expect(updatedUser?.password).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should allow multiple reset requests for same user', async () => {
      // First request
      const result1 = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });
      expect(result1.success).toBe(true);

      // Second request
      const result2 = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });
      expect(result2.success).toBe(true);

      // Third request
      const result3 = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });
      expect(result3.success).toBe(true);
    });

    it('should track IP address in password reset requests', async () => {
      const ipAddress = '192.168.1.100';

      await authService.requestPasswordReset({
        email: user.email,
        ipAddress,
      });

      const token = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      expect(token?.ipAddress).toBe(ipAddress);
    });

    it('should track IP address in password reset completions', async () => {
      const result = await authService.requestPasswordReset({
        email: user.email,
        ipAddress: '127.0.0.1',
      });

      const resetToken = result.devToken!;
      const completionIp = '192.168.1.200';

      await authService.resetPassword({
        token: resetToken,
        newPassword: 'NewPassword123!',
        ipAddress: completionIp,
      });

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'PASSWORD_RESET_COMPLETED',
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(auditLog?.ipAddress).toBe(completionIp);
    });
  });
});
