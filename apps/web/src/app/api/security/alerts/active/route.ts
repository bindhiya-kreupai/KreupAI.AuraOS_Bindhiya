import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const alerts = [
      {
        alertId: `alert-${Date.now()}`,
        alertType: 'failed_login',
        severity: 'high',
        title: 'Multiple Failed Login Attempts',
        message: 'User attempted to login 5 times with incorrect password',
        userId: 'user-001',
        userName: 'John Doe',
        ipAddress: '192.168.1.100',
        timestamp: new Date().toISOString(),
        status: 'active',
        acknowledgedBy: null,
        acknowledgedAt: null,
        resolvedBy: null,
        resolvedAt: null,
        resolution: null,
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ alerts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching active security alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
