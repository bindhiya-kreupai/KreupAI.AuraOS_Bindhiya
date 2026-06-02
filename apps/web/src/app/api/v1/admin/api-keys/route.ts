import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { logger } from '@/lib/logger';

function hashKey(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;

    const rows = await prisma.aPIKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const data = rows.map((row) => ({
      id: row.id,
      name: row.name,
      prefix: `${row.prefix}...`,
      status: row.revokedAt ? 'revoked' : row.isActive ? 'active' : 'inactive',
      permissions: row.scopes,
      createdAt: row.createdAt.toISOString(),
      lastUsed: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
      expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
      usageCount: row.requestCount,
      createdBy: row.createdBy,
      revokedAt: row.revokedAt ? row.revokedAt.toISOString() : undefined,
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        total: data.length,
        active: data.filter((d) => d.status === 'active').length,
        revoked: data.filter((d) => d.status === 'revoked').length,
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to list API keys');
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to list API keys' } },
      { status: 500 }
    );
  }
});

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user } = context;
      const tenantId = user.tenantId;

      const body = await request.json();
      if (!body.name?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'name is required' },
          },
          { status: 400 }
        );
      }

      // 32 bytes -> 64 hex chars -> ~256 bits of entropy
      const keyBytes = crypto.randomBytes(32).toString('hex');
      const keySecret = `aura_live_${keyBytes}`;
      const keyHash = hashKey(keySecret);
      const prefix = `aura_live_${keyBytes.slice(0, 4)}`;

      const created = await prisma.aPIKey.create({
        data: {
          tenantId,
          name: body.name,
          keyHash,
          prefix,
          scopes: Array.isArray(body.permissions) ? body.permissions : ['employees:read'],
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          isActive: true,
          createdBy: user.userId,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            id: created.id,
            name: created.name,
            key: keySecret, // only returned ONCE on creation
            prefix: `${created.prefix}...`,
            status: 'active',
            permissions: created.scopes,
            createdAt: created.createdAt.toISOString(),
            expiresAt: created.expiresAt ? created.expiresAt.toISOString() : null,
            usageCount: 0,
            createdBy: created.createdBy,
            note: 'Store this key securely. It will not be shown again.',
          },
          message: 'API key generated successfully. Store it securely.',
        },
        { status: 201 }
      );
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to create API key');
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to create API key' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.API_KEY_CREATED,
    resourceType: 'api_key',
    captureRequestBody: true,
    captureResponseBody: false, // don't log the raw key
  }
);
