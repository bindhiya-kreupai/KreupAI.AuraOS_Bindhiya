export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

/**
 * GET /api/v1/payroll/tax-documents
 * Get tax documents list for the tenant
 *
 * Query Parameters:
 * - type (optional): Filter by document type (W2, 1099, FORM_16)
 * - year (optional): Filter by tax year
 * - status (optional): Filter by status (GENERATED, DELIVERED, AMENDED)
 * - employeeId (optional): Filter by employee
 * - page (optional): Page number (default: 1)
 * - limit (optional): Records per page (default: 50, max: 100)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('payroll:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing payroll:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { tenantId };
    if (type) where.type = type.toUpperCase();
    if (year) where.taxYear = parseInt(year);
    if (status) where.status = status.toUpperCase();
    if (employeeId) where.employeeId = employeeId;

    const [documents, total] = await Promise.all([
      prisma.taxDocument.findMany({
        where,
        orderBy: [{ taxYear: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip,
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.taxDocument.count({ where }),
    ]);

    const data = documents.map((doc) => ({
      id: doc.id,
      employeeId: doc.employeeId,
      employeeName: `${doc.employee.firstName} ${doc.employee.lastName}`,
      employeeCode: doc.employee.employeeCode,
      type: doc.type,
      taxYear: doc.taxYear,
      status: doc.status.toLowerCase(),
      generatedAt: doc.generatedAt.toISOString(),
      deliveredAt: doc.deliveredAt?.toISOString() || null,
      fileUrl: doc.fileUrl,
      amendments: doc.amendments,
      downloadUrl: doc.fileUrl ? `/api/v1/payroll/tax-documents/${doc.id}/download` : null,
    }));

    // Compute summary
    const allDocs = await prisma.taxDocument.groupBy({
      by: ['type', 'status'],
      where: { tenantId, ...(year ? { taxYear: parseInt(year) } : {}) },
      _count: true,
    });

    const summaryMap: Record<string, number> = {};
    for (const group of allDocs) {
      const key = `${group.type}_${group.status}`;
      summaryMap[key] = group._count;
    }

    const summary = {
      w2Count:
        (summaryMap['W2_GENERATED'] || 0) +
        (summaryMap['W2_DELIVERED'] || 0) +
        (summaryMap['W2_AMENDED'] || 0),
      form1099Count:
        (summaryMap['1099_GENERATED'] || 0) +
        (summaryMap['1099_DELIVERED'] || 0) +
        (summaryMap['1099_AMENDED'] || 0),
      pendingCount: (summaryMap['W2_GENERATED'] || 0) + (summaryMap['1099_GENERATED'] || 0),
      deliveredCount: (summaryMap['W2_DELIVERED'] || 0) + (summaryMap['1099_DELIVERED'] || 0),
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          documents: data,
          total,
          summary,
        },
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Tax Documents API] GET Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch tax documents',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
