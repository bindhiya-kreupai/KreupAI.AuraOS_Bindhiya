import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'security';

const DEFAULT_SETTINGS = {
  settingsId: 'settings-1',
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    preventReuse: 5,
  },
  sessionManagement: {
    sessionTimeout: 30,
    maxConcurrentSessions: 3,
    requireReauthForSensitive: true,
  },
  mfa: {
    enabled: true,
    methods: ['totp', 'sms'],
    required: false,
    requiredForRoles: ['ADMIN', 'HR_MANAGER'],
  },
  ipWhitelisting: {
    enabled: false,
    allowedIPs: [],
  },
  auditSettings: {
    retentionDays: 365,
    logAllActions: true,
    alertOnSuspiciousActivity: true,
  },
  dataEncryption: {
    encryptAtRest: true,
    encryptInTransit: true,
    algorithm: 'AES-256',
  },
  updatedByName: 'Admin',
};

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const settings = await readSettings(tenantId, MODULE, DEFAULT_SETTINGS);
    return NextResponse.json({ success: true, data: { ...settings, tenantId } });
  } catch (error: any) {
    logger.error({ err: error, module: MODULE }, 'Failed to read settings');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const userId = context.user.userId;
    const body = await request.json();
    // Strip server-managed fields so callers can't overwrite them.
    delete body.tenantId;
    delete body.updatedBy;
    delete body.updatedAt;
    await writeSettings(tenantId, MODULE, body, userId);
    const settings = await readSettings(tenantId, MODULE, DEFAULT_SETTINGS);
    return NextResponse.json({ success: true, data: { ...settings, tenantId } });
  } catch (error: any) {
    logger.error({ err: error, module: MODULE }, 'Failed to update settings');
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
});
