import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { logger } from '@/lib/logger';
import {
  errorResponse,
  forbidden,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

const VALID_CATEGORIES = [
  'HR',
  'IT',
  'SECURITY',
  'FINANCE',
  'HEALTH_SAFETY',
  'CODE_OF_CONDUCT',
  'LEAVE',
  'BENEFITS',
  'COMPENSATION',
  'PERFORMANCE',
  'TRAVEL',
  'EXPENSE',
];

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/policies:read')) {
      return forbidden('admin/policies:read');
    }
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const category = searchParams.get('category')?.toUpperCase();
    const status = searchParams.get('status')?.toUpperCase();
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = { tenantId };
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.policyDocument.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { acknowledgements: true } } },
      }),
      prisma.policyDocument.count({ where }),
    ]);

    const data = rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      title: r.title,
      category: r.category,
      version: r.version,
      status: r.status,
      applicableTo: r.applicableTo,
      summary: r.summary,
      contentLength: r.contentMarkdown?.length || 0,
      acknowledgementsRequired: r.acknowledgementsRequired,
      totalAcknowledgements: r._count.acknowledgements,
      publishedAt: r.publishedAt?.toISOString() || null,
      effectiveDate: r.effectiveDate?.toISOString().slice(0, 10) || null,
      reviewDate: r.reviewDate?.toISOString().slice(0, 10) || null,
      ownerId: r.ownerId,
      ownerName: r.ownerName,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return successList(data, page, limit, total, { apiVersion: 'v1' });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to list policies');
    return serverError(error, 'list policies');
  }
});

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('admin/policies:create')) {
        return forbidden('admin/policies:create');
      }
      const tenantId = user.tenantId;
      const body = await safeJson(request);
      if (!body) return validationError({ message: 'Invalid JSON body' });

      const { title, category, content, applicableTo } = body;
      const missing = ['title', 'category', 'content', 'applicableTo'].filter((f) => !body[f]);
      if (missing.length > 0) {
        return validationError({ missingFields: missing });
      }
      if (!VALID_CATEGORIES.includes(String(category).toUpperCase())) {
        return errorResponse(
          'E2001',
          `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
          400
        );
      }

      const created = await prisma.policyDocument.create({
        data: {
          tenantId,
          title,
          category: String(category).toUpperCase(),
          version: '1.0',
          status: 'DRAFT',
          applicableTo,
          summary: body.summary || null,
          contentMarkdown: content,
          acknowledgementsRequired: body.acknowledgementsRequired !== false,
          effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
          reviewDate: body.reviewDate ? new Date(body.reviewDate) : null,
          ownerId: user.userId,
          ownerName: body.ownerName || user.email,
          createdBy: user.userId,
        },
      });

      return successItem(
        {
          id: created.id,
          tenantId: created.tenantId,
          title: created.title,
          category: created.category,
          version: created.version,
          status: created.status,
          applicableTo: created.applicableTo,
          summary: created.summary,
          contentLength: created.contentMarkdown?.length || 0,
          acknowledgementsRequired: created.acknowledgementsRequired,
          effectiveDate: created.effectiveDate?.toISOString().slice(0, 10) || null,
          reviewDate: created.reviewDate?.toISOString().slice(0, 10) || null,
          ownerId: created.ownerId,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
        { status: 201 }
      );
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to create policy');
      return serverError(error, 'create policy');
    }
  }),
  {
    action: AuditAction.SETTINGS_UPDATED,
    resourceType: 'policy',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);
