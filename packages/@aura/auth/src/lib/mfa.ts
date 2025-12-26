/**
 * Multi-Factor Authentication (MFA)
 * Supports TOTP and SMS-based MFA
 *
 * @module @aura/auth
 */

import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

export interface MFASecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerification {
  verified: boolean;
  method: 'totp' | 'sms' | 'backup';
}

export class MFAService {
  /**
   * Generate TOTP secret and QR code for user
   */
  async generateTOTPSecret(
    userId: string,
    email: string,
    issuer: string = 'AuraOS'
  ): Promise<MFASecret> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${issuer} (${email})`,
      issuer,
      length: 32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(8);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Verify TOTP token
   */
  verifyTOTP(secret: string, token: string, window: number = 1): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window,
    });
  }

  /**
   * Generate SMS verification code
   */
  generateSMSCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }

    return codes;
  }

  /**
   * Hash backup code for storage
   */
  hashBackupCode(code: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(code: string, hashedCode: string): boolean {
    const hash = this.hashBackupCode(code);
    return hash === hashedCode;
  }

  /**
   * Send SMS verification code
   */
  async sendSMSCode(phoneNumber: string, code: string): Promise<boolean> {
    // In production, integrate with Twilio/SNS/other SMS provider
    console.log(`SMS Code for ${phoneNumber}: ${code}`);

    // Mock implementation
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    try {
      // Example: Twilio integration
      // const twilioClient = require('twilio')(
      //   process.env.TWILIO_ACCOUNT_SID,
      //   process.env.TWILIO_AUTH_TOKEN
      // );
      //
      // await twilioClient.messages.create({
      //   body: `Your AuraOS verification code is: ${code}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber,
      // });

      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Send email verification code
   */
  async sendEmailCode(email: string, code: string): Promise<boolean> {
    // Use the email queue service
    console.log(`Email Code for ${email}: ${code}`);
    return true;
  }
}

/**
 * MFA middleware for API routes
 */
export async function requireMFA(
  userId: string,
  mfaToken: string,
  method: 'totp' | 'sms' | 'backup'
): Promise<MFAVerification> {
  // In production, fetch user's MFA configuration from database
  // const user = await getUserById(userId);

  const mfaService = new MFAService();

  try {
    switch (method) {
      case 'totp':
        // Verify TOTP token
        // const verified = mfaService.verifyTOTP(user.mfaSecret, mfaToken);
        const verified = true; // Mock
        return { verified, method: 'totp' };

      case 'sms':
        // Verify SMS code
        // const smsVerified = await verifySMSCode(userId, mfaToken);
        return { verified: true, method: 'sms' };

      case 'backup':
        // Verify and invalidate backup code
        // const backupVerified = await verifyAndInvalidateBackupCode(userId, mfaToken);
        return { verified: true, method: 'backup' };

      default:
        return { verified: false, method };
    }
  } catch (error) {
    console.error('MFA verification failed:', error);
    return { verified: false, method };
  }
}
