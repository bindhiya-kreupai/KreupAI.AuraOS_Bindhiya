import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const logs = [
      {
        logId: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user.userId,
        userName: 'Admin User',
        action: 'update',
        resource: 'employee',
        resourceId: 'emp-001',
        changes: { field: 'salary', oldValue: '50000', newValue: '55000' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        errorMessage: null
      },
      {
        logId: `log-${Date.now() - 1000}`,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: user.userId,
        userName: 'HR Manager',
        action: 'create',
        resource: 'employee',
        resourceId: 'emp-002',
        changes: {},
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        errorMessage: null
      }
    ];

    return NextResponse.json({ logs }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();
    const { user } = context;

    const log = {
      logId: `log-${Date.now()}`,
      timestamp: body.timestamp || new Date().toISOString(),
      userId: user.userId,
      userName: body.userName || 'User',
      action: body.action || 'read',
      resource: body.resource || '',
      resourceId: body.resourceId || '',
      changes: body.changes || {},
      ipAddress: body.ipAddress || '',
      userAgent: body.userAgent || '',
      status: body.status || 'success',
      errorMessage: body.errorMessage || null
    };

    return NextResponse.json({ log }, { status: 201 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
