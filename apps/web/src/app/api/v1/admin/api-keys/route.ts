import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user } = context;
  const _tenantId = user.tenantId;

  const apiKeys = [
    {
      id: 'key-001',
      name: 'Payroll Integration',
      prefix: 'aura_live_3kf8...',
      status: 'active',
      permissions: ['payroll:read', 'payroll:write', 'employees:read'],
      createdAt: '2025-06-15T10:00:00Z',
      lastUsed: '2026-01-23T08:30:00Z',
      expiresAt: '2026-06-15T10:00:00Z',
      usageCount: 15420,
      rateLimit: { requests: 1000, window: '1 hour' },
      createdBy: 'admin-001',
      ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    },
    {
      id: 'key-002',
      name: 'ATS Integration',
      prefix: 'aura_live_9xm2...',
      status: 'active',
      permissions: ['recruitment:read', 'recruitment:write', 'employees:read'],
      createdAt: '2025-08-20T14:00:00Z',
      lastUsed: '2026-01-23T09:15:00Z',
      expiresAt: '2026-08-20T14:00:00Z',
      usageCount: 8932,
      rateLimit: { requests: 500, window: '1 hour' },
      createdBy: 'admin-001',
      ipWhitelist: [],
    },
    {
      id: 'key-003',
      name: 'BI Dashboard',
      prefix: 'aura_live_7pq4...',
      status: 'active',
      permissions: ['analytics:read', 'employees:read', 'reports:read'],
      createdAt: '2025-09-10T09:00:00Z',
      lastUsed: '2026-01-22T22:00:00Z',
      expiresAt: null,
      usageCount: 45210,
      rateLimit: { requests: 2000, window: '1 hour' },
      createdBy: 'admin-001',
      ipWhitelist: ['10.0.5.0/24'],
    },
    {
      id: 'key-004',
      name: 'Legacy System (deprecated)',
      prefix: 'aura_live_2ab1...',
      status: 'revoked',
      permissions: ['employees:read'],
      createdAt: '2025-03-01T08:00:00Z',
      lastUsed: '2025-10-15T12:00:00Z',
      expiresAt: '2026-03-01T08:00:00Z',
      revokedAt: '2025-11-01T10:00:00Z',
      revokedBy: 'admin-001',
      revokeReason: 'Legacy system decommissioned',
      usageCount: 23456,
      rateLimit: { requests: 100, window: '1 hour' },
      createdBy: 'admin-001',
      ipWhitelist: [],
    },
  ];

  return NextResponse.json({
    success: true,
    data: apiKeys,
    meta: { total: apiKeys.length, active: 3, revoked: 1 },
  });
});

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    const { user } = context;
    const _tenantId = user.tenantId;

    const body = await request.json();

    // API key MUST come from a CSPRNG; Math.random() is predictable and unsafe for tokens.
    // 32 bytes -> 64 hex chars -> ~256 bits of entropy.
    const keyBytes = crypto.randomBytes(32).toString('hex');
    const keySecret = `aura_live_${keyBytes}`;
    const keyPrefix = `aura_live_${keyBytes.slice(0, 4)}...`;

    const newKey = {
      id: 'key-005',
      name: body.name || 'New API Key',
      key: keySecret,
      prefix: keyPrefix,
      status: 'active',
      permissions: body.permissions || ['employees:read'],
      createdAt: new Date().toISOString(),
      lastUsed: null,
      expiresAt: body.expiresAt || null,
      usageCount: 0,
      rateLimit: body.rateLimit || { requests: 1000, window: '1 hour' },
      createdBy: 'admin-001',
      ipWhitelist: body.ipWhitelist || [],
      note: 'Store this key securely. It will not be shown again.',
    };

    return NextResponse.json(
      {
        success: true,
        data: newKey,
        message: 'API key generated successfully. Store it securely.',
      },
      { status: 201 }
    );
  }),
  {
    action: AuditAction.API_KEY_CREATED,
    resourceType: 'api_key',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);
