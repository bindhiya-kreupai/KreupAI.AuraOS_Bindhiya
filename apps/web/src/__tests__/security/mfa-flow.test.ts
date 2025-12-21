import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mfaService } from '@/services/auth/mfa.service';
import { authService } from '@/services/auth/auth.service';
import { authenticator } from 'otplib';
import {
  createTestTenant,
  createTestUser,
  cleanupTestData,
  TestTenant,
  TestUser,
} from '../helpers/test-utils';

/**
 * MFA Flow Security Tests
 *
 * These tests verify that Multi-Factor Authentication flows work correctly
 * and securely enforce MFA requirements.
 */

describe('MFA Flow Security Tests', () => {
  let tenant: TestTenant;
  let user: TestUser;

  beforeEach(async () => {
    await cleanupTestData();
    tenant = await createTestTenant();
    user = await createTestUser(undefined, 'Test123!@#', tenant.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('MFA Setup Flow', () => {
    it('should generate QR code and backup codes', async () => {
      const result = await mfaService.setupMFA(user.id, user.email);

      expect(result.success).toBe(true);
      expect(result.secret).toBeDefined();
      expect(result.qrCodeUrl).toBeDefined();
      expect(result.backupCodes).toBeDefined();
      expect(result.backupCodes).toHaveLength(10);
      expect(result.qrCodeUrl).toContain('data:image/png;base64');
    });

    it('should not enable MFA until verified', async () => {
      await mfaService.setupMFA(user.id, user.email);

      const status = await mfaService.getMFAStatus(user.id);
      expect(status.enabled).toBe(false);
      expect(status.verified).toBe(false);
    });

    it('should allow re-setup if not verified', async () => {
      // First setup
      const result1 = await mfaService.setupMFA(user.id, user.email);
      expect(result1.success).toBe(true);
      const secret1 = result1.secret;

      // Second setup (should replace first)
      const result2 = await mfaService.setupMFA(user.id, user.email);
      expect(result2.success).toBe(true);
      const secret2 = result2.secret;

      // Secrets should be different
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('MFA Verification Flow', () => {
    it('should verify valid TOTP code and enable MFA', async () => {
      // Setup MFA
      const setupResult = await mfaService.setupMFA(user.id, user.email);
      expect(setupResult.success).toBe(true);

      // Generate valid TOTP code
      const code = authenticator.generate(setupResult.secret!);

      // Verify code
      const verifyResult = await mfaService.verifyMFASetup(user.id, code, '127.0.0.1');

      expect(verifyResult.success).toBe(true);

      // Check MFA is now enabled
      const status = await mfaService.getMFAStatus(user.id);
      expect(status.enabled).toBe(true);
      expect(status.verified).toBe(true);
    });

    it('should reject invalid TOTP code', async () => {
      // Setup MFA
      const setupResult = await mfaService.setupMFA(user.id, user.email);
      expect(setupResult.success).toBe(true);

      // Try to verify with invalid code
      const verifyResult = await mfaService.verifyMFASetup(user.id, '000000', '127.0.0.1');

      expect(verifyResult.success).toBe(false);
      expect(verifyResult.error).toContain('Invalid');

      // MFA should not be enabled
      const status = await mfaService.getMFAStatus(user.id);
      expect(status.enabled).toBe(false);
    });

    it('should reject verification if MFA not set up', async () => {
      const verifyResult = await mfaService.verifyMFASetup(user.id, '123456', '127.0.0.1');

      expect(verifyResult.success).toBe(false);
      expect(verifyResult.error).toContain('not set up');
    });
  });

  describe('MFA Login Flow', () => {
    let secret: string;
    let backupCodes: string[];

    beforeEach(async () => {
      // Setup and verify MFA
      const setupResult = await mfaService.setupMFA(user.id, user.email);
      secret = setupResult.secret!;
      backupCodes = setupResult.backupCodes!;

      const code = authenticator.generate(secret);
      await mfaService.verifyMFASetup(user.id, code, '127.0.0.1');
    });

    it('should require MFA code after password verification', async () => {
      const loginResult = await authService.login(
        {
          email: user.email,
          password: user.password,
        },
        '127.0.0.1',
        'Test Browser'
      );

      expect(loginResult.success).toBe(true);
      expect(loginResult.mfaRequired).toBe(true);
      expect(loginResult.userId).toBe(user.id);
      expect(loginResult.accessToken).toBeUndefined();
      expect(loginResult.refreshToken).toBeUndefined();
    });

    it('should validate correct TOTP code during login', async () => {
      const code = authenticator.generate(secret);
      const isValid = await mfaService.validateMFACode(user.id, code, false);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect TOTP code during login', async () => {
      const isValid = await mfaService.validateMFACode(user.id, '000000', false);

      expect(isValid).toBe(false);
    });

    it('should validate and consume backup code', async () => {
      const backupCode = backupCodes[0];

      // First use should succeed
      const isValid1 = await mfaService.validateMFACode(user.id, backupCode, true);
      expect(isValid1).toBe(true);

      // Second use of same code should fail
      const isValid2 = await mfaService.validateMFACode(user.id, backupCode, true);
      expect(isValid2).toBe(false);
    });

    it('should allow multiple different backup codes', async () => {
      // Use first backup code
      const isValid1 = await mfaService.validateMFACode(user.id, backupCodes[0], true);
      expect(isValid1).toBe(true);

      // Use second backup code
      const isValid2 = await mfaService.validateMFACode(user.id, backupCodes[1], true);
      expect(isValid2).toBe(true);

      // Use third backup code
      const isValid3 = await mfaService.validateMFACode(user.id, backupCodes[2], true);
      expect(isValid3).toBe(true);
    });

    it('should not accept TOTP code as backup code', async () => {
      const totpCode = authenticator.generate(secret);
      const isValid = await mfaService.validateMFACode(user.id, totpCode, true);

      expect(isValid).toBe(false);
    });

    it('should not accept backup code as TOTP code', async () => {
      const backupCode = backupCodes[0];
      const isValid = await mfaService.validateMFACode(user.id, backupCode, false);

      expect(isValid).toBe(false);
    });
  });

  describe('MFA Disable Flow', () => {
    beforeEach(async () => {
      // Setup and verify MFA
      const setupResult = await mfaService.setupMFA(user.id, user.email);
      const code = authenticator.generate(setupResult.secret!);
      await mfaService.verifyMFASetup(user.id, code, '127.0.0.1');
    });

    it('should disable MFA with correct password', async () => {
      const result = await mfaService.disableMFA(user.id, user.password, '127.0.0.1');

      expect(result.success).toBe(true);

      const status = await mfaService.getMFAStatus(user.id);
      expect(status.enabled).toBe(false);
    });

    it('should not disable MFA with incorrect password', async () => {
      const result = await mfaService.disableMFA(user.id, 'WrongPassword123!', '127.0.0.1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid password');

      const status = await mfaService.getMFAStatus(user.id);
      expect(status.enabled).toBe(true);
    });

    it('should return error if MFA not enabled', async () => {
      // Create new user without MFA
      const newUser = await createTestUser(undefined, 'Test123!@#', tenant.id);

      const result = await mfaService.disableMFA(newUser.id, newUser.password, '127.0.0.1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not enabled');
    });
  });

  describe('MFA Backup Code Regeneration', () => {
    beforeEach(async () => {
      // Setup and verify MFA
      const setupResult = await mfaService.setupMFA(user.id, user.email);
      const code = authenticator.generate(setupResult.secret!);
      await mfaService.verifyMFASetup(user.id, code, '127.0.0.1');
    });

    it('should regenerate backup codes', async () => {
      const result = await mfaService.regenerateBackupCodes(user.id, '127.0.0.1');

      expect(result.success).toBe(true);
      expect(result.codes).toBeDefined();
      expect(result.codes).toHaveLength(10);
    });

    it('should invalidate old backup codes after regeneration', async () => {
      // Setup MFA and get initial backup codes
      const setupResult = await mfaService.setupMFA(user.id, user.email);
      const oldBackupCodes = setupResult.backupCodes!;

      const code = authenticator.generate(setupResult.secret!);
      await mfaService.verifyMFASetup(user.id, code, '127.0.0.1');

      // Regenerate backup codes
      const regenResult = await mfaService.regenerateBackupCodes(user.id, '127.0.0.1');
      const newBackupCodes = regenResult.codes!;

      // Old backup codes should no longer work
      const oldCodeValid = await mfaService.validateMFACode(user.id, oldBackupCodes[0], true);
      expect(oldCodeValid).toBe(false);

      // New backup codes should work
      const newCodeValid = await mfaService.validateMFACode(user.id, newBackupCodes[0], true);
      expect(newCodeValid).toBe(true);
    });

    it('should return error if MFA not set up', async () => {
      const newUser = await createTestUser(undefined, 'Test123!@#', tenant.id);

      const result = await mfaService.regenerateBackupCodes(newUser.id, '127.0.0.1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not set up');
    });
  });

  describe('MFA Status Check', () => {
    it('should return disabled status for user without MFA', async () => {
      const status = await mfaService.getMFAStatus(user.id);

      expect(status.enabled).toBe(false);
      expect(status.verified).toBe(false);
    });

    it('should return unverified status after setup', async () => {
      await mfaService.setupMFA(user.id, user.email);

      const status = await mfaService.getMFAStatus(user.id);

      expect(status.enabled).toBe(false);
      expect(status.verified).toBe(false);
    });

    it('should return enabled and verified status after complete setup', async () => {
      const setupResult = await mfaService.setupMFA(user.id, user.email);
      const code = authenticator.generate(setupResult.secret!);
      await mfaService.verifyMFASetup(user.id, code, '127.0.0.1');

      const status = await mfaService.getMFAStatus(user.id);

      expect(status.enabled).toBe(true);
      expect(status.verified).toBe(true);
      expect(status.method).toBe('totp');
    });
  });

  describe('MFA Security Edge Cases', () => {
    it('should not validate MFA code for user without MFA enabled', async () => {
      const isValid = await mfaService.validateMFACode(user.id, '123456', false);

      expect(isValid).toBe(false);
    });

    it('should not validate MFA code for unverified MFA setup', async () => {
      // Setup but don't verify
      const setupResult = await mfaService.setupMFA(user.id, user.email);
      const code = authenticator.generate(setupResult.secret!);

      // Try to use code for login validation (should fail)
      const isValid = await mfaService.validateMFACode(user.id, code, false);

      expect(isValid).toBe(false);
    });

    it('should handle TOTP time window correctly', async () => {
      const setupResult = await mfaService.setupMFA(user.id, user.email);
      const secret = setupResult.secret!;

      // Verify setup
      const verifyCode = authenticator.generate(secret);
      await mfaService.verifyMFASetup(user.id, verifyCode, '127.0.0.1');

      // Generate current code
      const currentCode = authenticator.generate(secret);

      // Should be valid
      const isValid = await mfaService.validateMFACode(user.id, currentCode, false);
      expect(isValid).toBe(true);
    });

    it('should reject old TOTP codes after time window', async () => {
      const setupResult = await mfaService.setupMFA(user.id, user.email);
      const secret = setupResult.secret!;

      // Verify setup
      const verifyCode = authenticator.generate(secret);
      await mfaService.verifyMFASetup(user.id, verifyCode, '127.0.0.1');

      // Use obviously expired code (000000)
      const isValid = await mfaService.validateMFACode(user.id, '000000', false);
      expect(isValid).toBe(false);
    });
  });
});
