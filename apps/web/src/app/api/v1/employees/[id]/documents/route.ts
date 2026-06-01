import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/employees/[id]/documents
 * List documents for an employee with optional category filter
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('employees:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing employees:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const employeeId = pathParts[pathParts.indexOf('employees') + 1];

    const { searchParams } = url;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const skip = (page - 1) * limit;

    // Verify employee belongs to this tenant
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, company: { tenantId: user.tenantId } },
      select: { id: true },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 404 }
      );
    }

    const whereClause: Record<string, unknown> = {
      tenantId: user.tenantId,
      employeeId,
    };

    if (category) {
      whereClause.category = category;
    }

    const [documents, total] = await Promise.all([
      prisma.employeeDocument.findMany({
        where: whereClause,
        select: {
          id: true,
          employeeId: true,
          documentName: true,
          documentNumber: true,
          category: true,
          fileName: true,
          fileSize: true,
          fileType: true,
          fileUrl: true,
          version: true,
          issueDate: true,
          expiryDate: true,
          isExpired: true,
          isVerified: true,
          isConfidential: true,
          status: true,
          uploadedBy: true,
          description: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.employeeDocument.count({
        where: whereClause,
      }),
    ]);

    // Map to shape compatible with existing frontend expectations
    const data = documents.map((doc) => ({
      id: doc.id,
      employeeId: doc.employeeId,
      name: doc.documentName,
      category: doc.category,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      documentNumber: doc.documentNumber,
      version: doc.version,
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate,
      isExpired: doc.isExpired,
      isVerified: doc.isVerified,
      isConfidential: doc.isConfidential,
      status: doc.status,
      uploadedBy: doc.uploadedBy,
      description: doc.description,
      tags: doc.tags,
      uploadedAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Employee Documents API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch employee documents',
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
