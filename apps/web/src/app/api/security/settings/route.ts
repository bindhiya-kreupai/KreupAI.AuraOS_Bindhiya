import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const settings = {
      settingsId: 'settings-1',
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90,
        preventReuse: 5
      },
      sessionManagement: {
        sessionTimeout: 30,
        maxConcurrentSessions: 3,
        requireReauthForSensitive: true
      },
      mfa: {
        enabled: true,
        methods: ['totp', 'sms'],
        required: false,
        requiredForRoles: ['ADMIN', 'HR_MANAGER']
      },
      ipWhitelisting: {
        enabled: false,
        allowedIPs: []
      },
      auditSettings: {
        retentionDays: 365,
        logAllActions: true,
        alertOnSuspiciousActivity: true
      },
      dataEncryption: {
        encryptAtRest: true,
        encryptInTransit: true,
        algorithm: 'AES-256'
      },
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
      updatedByName: 'Admin'
    };

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();
    const { user } = context;

    const settings = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
      updatedByName: 'Admin'
    };

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
