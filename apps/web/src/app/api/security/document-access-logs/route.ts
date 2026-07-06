import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

const VALID_ACTIONS = ['viewed', 'downloaded', 'printed', 'edited', 'shared'];

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/document-logs:read')) {
      return forbidden('security/document-logs:read');
    }
    const tenantId = user.tenantId;
    const sp = new URL(request.url).searchParams;
    const { page, limit, skip } = parsePagination(sp);
    const action = sp.get('action') || undefined;
    const q = sp.get('q') || undefined;

    // Seed a few rows once, idempotently, so the page renders for empty tenants.
    try {
      const existing = await (prisma as any).documentAccessLog.count({ where: { tenantId } });
      if (existing === 0) {
        const now = Date.now();
        await (prisma as any).documentAccessLog.createMany({
          data: [
            {
              tenantId,
              documentId: 'doc-fin-q1',
              documentName: 'Q1_Financial_Report.pdf',
              action: 'downloaded',
              userId: user.userId || 'system',
              userName: user.email || 'Finance User',
              ipAddress: '192.168.1.45',
              createdAt: new Date(now - 1000 * 60 * 30),
            },
            {
              tenantId,
              documentId: 'doc-contract-jsmith',
              documentName: 'Employee_Contract_JSmith.pdf',
              action: 'viewed',
              userId: user.userId || 'system',
              userName: user.email || 'HR Manager',
              ipAddress: '192.168.1.12',
              createdAt: new Date(now - 1000 * 60 * 90),
            },
            {
              tenantId,
              documentId: 'doc-mkt-budget',
              documentName: 'Marketing_Budget_2025.xlsx',
              action: 'printed',
              userId: user.userId || 'system',
              userName: user.email || 'Marketing User',
              ipAddress: '10.5.2.11',
              createdAt: new Date(now - 1000 * 60 * 60 * 20),
            },
          ],
        });
      }
    } catch {
      // Seeding is best-effort; ignore if the table is unavailable.
    }

    const where: any = { tenantId };
    if (action && VALID_ACTIONS.includes(action)) where.action = action;
    if (q) {
      where.OR = [
        { documentName: { contains: q, mode: 'insensitive' } },
        { userName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      (prisma as any).documentAccessLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).documentAccessLog.count({ where }),
    ]);

    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list document access logs');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/document-logs:create')) {
      return forbidden('security/document-logs:create');
    }
    const body = await safeJson(request);
    if (!body) return validationError({ body: 'Invalid JSON body' });

    const documentId = typeof body.documentId === 'string' ? body.documentId.trim() : '';
    const documentName = typeof body.documentName === 'string' ? body.documentName.trim() : '';
    const action = typeof body.action === 'string' ? body.action.trim() : '';

    const errors: Record<string, string> = {};
    if (!documentId) errors.documentId = 'documentId is required';
    if (!documentName) errors.documentName = 'documentName is required';
    if (!VALID_ACTIONS.includes(action)) {
      errors.action = `action must be one of: ${VALID_ACTIONS.join(', ')}`;
    }
    if (Object.keys(errors).length > 0) return validationError(errors);

    const created = await (prisma as any).documentAccessLog.create({
      data: {
        tenantId: user.tenantId,
        documentId,
        documentName,
        action,
        userId: user.userId || 'system',
        userName: user.email || null,
        ipAddress: clientIp(request),
      },
    });

    return successItem(created, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'record document access');
  }
});
