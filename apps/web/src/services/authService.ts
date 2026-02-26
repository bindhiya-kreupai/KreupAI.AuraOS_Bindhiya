/**
 * @module authService (client-side)
 * @description Client-side Auth Service — MFA setup/verify, session management,
 *              login history, and security score. Uses mock data with APIClient fallback.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type MFAMethod = 'totp' | 'sms' | 'email';

export interface MFASetupResult {
  method: MFAMethod;
  /** For TOTP: the base64 QR code data URI */
  qrCodeDataUri?: string;
  /** For TOTP: the plaintext secret for manual entry */
  secret?: string;
  /** For SMS/Email: the masked recipient */
  deliveryTarget?: string;
  /** Backup codes */
  backupCodes?: string[];
  /** Session token for this setup flow */
  setupToken: string;
}

export interface MFAStatus {
  enabled: boolean;
  method: MFAMethod | null;
  enabledAt: string | null;
  lastVerifiedAt: string | null;
  backupCodesCount: number;
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  browser: string;
  os: string;
  success: boolean;
  failureReason?: string;
  mfaUsed: boolean;
}

export interface SecurityScore {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  items: SecurityScoreItem[];
  lastAnalyzedAt: string;
}

export interface SecurityScoreItem {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  recommendation?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

let MOCK_MFA_STATUS: MFAStatus = {
  enabled: false,
  method: null,
  enabledAt: null,
  lastVerifiedAt: null,
  backupCodesCount: 0,
};

const MOCK_SESSIONS: ActiveSession[] = [
  {
    id: 'sess-001',
    deviceName: 'MacBook Pro',
    deviceType: 'desktop',
    browser: 'Chrome 121',
    os: 'macOS 14',
    ipAddress: '192.168.1.105',
    location: 'New York, NY, US',
    isCurrent: true,
    createdAt: '2026-02-25T08:30:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'sess-002',
    deviceName: 'iPhone 15 Pro',
    deviceType: 'mobile',
    browser: 'Safari 17',
    os: 'iOS 17.3',
    ipAddress: '203.0.113.42',
    location: 'Brooklyn, NY, US',
    isCurrent: false,
    createdAt: '2026-02-24T16:00:00Z',
    lastActiveAt: '2026-02-24T20:15:00Z',
  },
  {
    id: 'sess-003',
    deviceName: 'Windows Desktop',
    deviceType: 'desktop',
    browser: 'Firefox 122',
    os: 'Windows 11',
    ipAddress: '198.51.100.23',
    location: 'Chicago, IL, US',
    isCurrent: false,
    createdAt: '2026-02-20T09:00:00Z',
    lastActiveAt: '2026-02-23T18:00:00Z',
  },
];

const MOCK_LOGIN_HISTORY: LoginHistoryEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-02-25T08:30:00Z',
    ipAddress: '192.168.1.105',
    location: 'New York, NY, US',
    browser: 'Chrome 121',
    os: 'macOS 14',
    success: true,
    mfaUsed: false,
  },
  {
    id: 'log-002',
    timestamp: '2026-02-24T16:00:00Z',
    ipAddress: '203.0.113.42',
    location: 'Brooklyn, NY, US',
    browser: 'Safari 17',
    os: 'iOS 17.3',
    success: true,
    mfaUsed: false,
  },
  {
    id: 'log-003',
    timestamp: '2026-02-23T14:22:00Z',
    ipAddress: '198.51.100.99',
    location: 'Unknown',
    browser: 'Unknown',
    os: 'Unknown',
    success: false,
    failureReason: 'Invalid password',
    mfaUsed: false,
  },
  {
    id: 'log-004',
    timestamp: '2026-02-22T09:15:00Z',
    ipAddress: '192.168.1.105',
    location: 'New York, NY, US',
    browser: 'Chrome 121',
    os: 'macOS 14',
    success: true,
    mfaUsed: false,
  },
  {
    id: 'log-005',
    timestamp: '2026-02-21T18:05:00Z',
    ipAddress: '192.168.1.105',
    location: 'New York, NY, US',
    browser: 'Chrome 121',
    os: 'macOS 14',
    success: true,
    mfaUsed: false,
  },
];

function generateBackupCodes(): string[] {
  return Array.from(
    { length: 8 },
    () =>
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class AuthClientService {
  /**
   * Get current MFA status for the logged-in user
   */
  static async getMFAStatus(): Promise<MFAStatus> {
    try {
      return await APIClient.get<MFAStatus>('/v1/auth/mfa/status');
    } catch {
      return { ...MOCK_MFA_STATUS };
    }
  }

  /**
   * Initiate MFA setup — returns QR code for TOTP or delivery target for SMS/Email
   */
  static async enableMFA(method: MFAMethod): Promise<MFASetupResult> {
    try {
      return await APIClient.post<MFASetupResult>('/v1/auth/mfa/enable', { method });
    } catch {
      const setupToken = `setup-${Date.now()}`;

      if (method === 'totp') {
        const secret = generateTOTPSecret();
        // Real apps use otplib or speakeasy to generate QR. We use a placeholder SVG data URI.
        const issuer = 'AuraOS';
        const account = 'user@company.com';
        const _otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

        // Generate a minimal data URI placeholder (real app would use qrcode library)
        const qrCodeDataUri = `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="white"/>
            <text x="100" y="90" text-anchor="middle" font-size="12" fill="#333">QR Code Placeholder</text>
            <text x="100" y="110" text-anchor="middle" font-size="10" fill="#666">Scan with your</text>
            <text x="100" y="125" text-anchor="middle" font-size="10" fill="#666">authenticator app</text>
            <rect x="20" y="20" width="60" height="60" fill="none" stroke="#333" stroke-width="3"/>
            <rect x="120" y="20" width="60" height="60" fill="none" stroke="#333" stroke-width="3"/>
            <rect x="20" y="120" width="60" height="60" fill="none" stroke="#333" stroke-width="3"/>
          </svg>
        `)}`;

        return {
          method: 'totp',
          qrCodeDataUri,
          secret,
          backupCodes: generateBackupCodes(),
          setupToken,
        };
      }

      if (method === 'sms') {
        return {
          method: 'sms',
          deliveryTarget: '+1 •••-•••-1234',
          backupCodes: generateBackupCodes(),
          setupToken,
        };
      }

      return {
        method: 'email',
        deliveryTarget: 'u***@company.com',
        backupCodes: generateBackupCodes(),
        setupToken,
      };
    }
  }

  /**
   * Verify the MFA code entered during setup
   */
  static async verifyMFA(
    code: string,
    setupToken?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await APIClient.post<{ success: boolean; message: string }>('/v1/auth/mfa/verify', {
        code,
        setupToken,
      });
    } catch {
      // Accept any 6-digit code in mock mode
      if (code.length === 6 && /^\d{6}$/.test(code)) {
        MOCK_MFA_STATUS = {
          enabled: true,
          method: 'totp',
          enabledAt: new Date().toISOString(),
          lastVerifiedAt: new Date().toISOString(),
          backupCodesCount: 8,
        };
        return { success: true, message: 'MFA enabled successfully' };
      }
      return { success: false, message: 'Invalid verification code. Please try again.' };
    }
  }

  /**
   * Disable MFA (requires re-authentication)
   */
  static async disableMFA(password: string): Promise<{ success: boolean; message: string }> {
    try {
      return await APIClient.post<{ success: boolean; message: string }>('/v1/auth/mfa/disable', {
        password,
      });
    } catch {
      if (password) {
        MOCK_MFA_STATUS = {
          enabled: false,
          method: null,
          enabledAt: null,
          lastVerifiedAt: null,
          backupCodesCount: 0,
        };
        return { success: true, message: 'MFA has been disabled' };
      }
      return { success: false, message: 'Password is required to disable MFA' };
    }
  }

  /**
   * Get all active sessions for the current user
   */
  static async getActiveSessions(): Promise<ActiveSession[]> {
    try {
      return await APIClient.get<ActiveSession[]>('/v1/auth/sessions');
    } catch {
      return [...MOCK_SESSIONS];
    }
  }

  /**
   * Revoke a specific session
   */
  static async revokeSession(sessionId: string): Promise<void> {
    try {
      await APIClient.delete(`/v1/auth/sessions/${sessionId}`);
    } catch {
      const idx = MOCK_SESSIONS.findIndex((s) => s.id === sessionId);
      if (idx >= 0) MOCK_SESSIONS.splice(idx, 1);
    }
  }

  /**
   * Revoke all sessions except the current one
   */
  static async revokeAllSessions(): Promise<{ revokedCount: number }> {
    try {
      return await APIClient.post<{ revokedCount: number }>('/v1/auth/sessions/revoke-all', {});
    } catch {
      const otherSessions = MOCK_SESSIONS.filter((s) => !s.isCurrent);
      const count = otherSessions.length;
      MOCK_SESSIONS.splice(0, MOCK_SESSIONS.length, ...MOCK_SESSIONS.filter((s) => s.isCurrent));
      return { revokedCount: count };
    }
  }

  /**
   * Get recent login history
   */
  static async getLoginHistory(limit = 20): Promise<LoginHistoryEntry[]> {
    try {
      return await APIClient.get<LoginHistoryEntry[]>('/v1/auth/login-history', { limit });
    } catch {
      return MOCK_LOGIN_HISTORY.slice(0, limit);
    }
  }

  /**
   * Get security score for the current user
   */
  static async getSecurityScore(): Promise<SecurityScore> {
    try {
      return await APIClient.get<SecurityScore>('/v1/auth/security-score');
    } catch {
      const mfa = MOCK_MFA_STATUS;
      const hasRecentFailure = MOCK_LOGIN_HISTORY.some(
        (e) => !e.success && new Date(e.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      );
      const activeSessions = MOCK_SESSIONS.length;

      const items: SecurityScoreItem[] = [
        {
          id: 'mfa',
          label: 'Two-Factor Authentication',
          description: 'Protect your account with a second verification step',
          passed: mfa.enabled,
          points: mfa.enabled ? 30 : 0,
          maxPoints: 30,
          recommendation: mfa.enabled ? undefined : 'Enable MFA to protect your account',
        },
        {
          id: 'password-strength',
          label: 'Strong Password',
          description: 'Password meets complexity requirements',
          passed: true, // Assumed in mock
          points: 20,
          maxPoints: 20,
        },
        {
          id: 'recent-password',
          label: 'Password Age',
          description: 'Password was changed within the last 90 days',
          passed: true,
          points: 15,
          maxPoints: 15,
        },
        {
          id: 'no-suspicious-logins',
          label: 'No Suspicious Activity',
          description: 'No failed login attempts in the last 7 days',
          passed: !hasRecentFailure,
          points: hasRecentFailure ? 0 : 20,
          maxPoints: 20,
          recommendation: hasRecentFailure
            ? 'Review recent login attempts and consider changing your password'
            : undefined,
        },
        {
          id: 'session-hygiene',
          label: 'Session Management',
          description: 'Few active sessions across devices',
          passed: activeSessions <= 2,
          points: activeSessions <= 2 ? 15 : 5,
          maxPoints: 15,
          recommendation:
            activeSessions > 2 ? 'Revoke sessions on devices you no longer use' : undefined,
        },
      ];

      const totalScore = items.reduce((sum, i) => sum + i.points, 0);
      const grade: SecurityScore['grade'] =
        totalScore >= 90
          ? 'A'
          : totalScore >= 75
            ? 'B'
            : totalScore >= 60
              ? 'C'
              : totalScore >= 45
                ? 'D'
                : 'F';

      return {
        score: totalScore,
        grade,
        items,
        lastAnalyzedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    input: ChangePasswordInput
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await APIClient.post<{ success: boolean; message: string }>(
        '/v1/auth/change-password',
        input
      );
    } catch {
      if (input.newPassword !== input.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }
      if (input.newPassword.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters' };
      }
      return {
        success: true,
        message: 'Password changed successfully. You will be logged out of other sessions.',
      };
    }
  }
}

export default AuthClientService;
