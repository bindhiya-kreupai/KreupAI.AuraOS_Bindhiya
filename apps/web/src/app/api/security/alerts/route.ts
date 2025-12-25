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
      },
      {
        alertId: `alert-${Date.now() - 1000}`,
        alertType: 'suspicious_activity',
        severity: 'medium',
        title: 'Unusual Access Pattern Detected',
        message: 'User accessed sensitive data outside normal working hours',
        userId: 'user-002',
        userName: 'Jane Smith',
        ipAddress: '192.168.1.101',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'acknowledged',
        acknowledgedBy: 'admin-001',
        acknowledgedAt: new Date(Date.now() - 3600000).toISOString(),
        resolvedBy: null,
        resolvedAt: null,
        resolution: null,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    return NextResponse.json({ alerts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching security alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    const alert = {
      alertId: `alert-${Date.now()}`,
      alertType: body.alertType || 'access_violation',
      severity: body.severity || 'low',
      title: body.title || '',
      message: body.message || '',
      userId: body.userId || null,
      userName: body.userName || null,
      ipAddress: body.ipAddress || null,
      timestamp: body.timestamp || new Date().toISOString(),
      status: 'active',
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedBy: null,
      resolvedAt: null,
      resolution: null,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error('Error creating security alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();
    const { user } = context;

    const alert = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId
    };

    return NextResponse.json({ alert }, { status: 200 });
  } catch (error) {
    console.error('Error updating security alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
