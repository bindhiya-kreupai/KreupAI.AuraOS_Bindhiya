import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/payroll/salary-structures
 * List salary structures with pagination
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const search = searchParams.get('search') || undefined;
    const gradeId = searchParams.get('gradeId') || undefined;
    const status = searchParams.get('status') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (gradeId) where.gradeId = gradeId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.salaryStructure.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          grade: { select: { id: true, name: true, code: true } },
          _count: { select: { employees: true } },
        },
      }),
      prisma.salaryStructure.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Salary Structures API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch salary structures' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/payroll/salary-structures
 * Create a new salary structure
 */
export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.name || !body.code) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'name and code are required' } },
        { status: 400 }
      );
    }

    const structure = await prisma.salaryStructure.create({
      data: {
        tenantId: user.tenantId,
        name: body.name,
        code: body.code,
        gradeId: body.gradeId || null,
        basicSalary: body.basicSalary || 0,
        grossSalary: body.grossSalary || 0,
        currency: body.currency || 'USD',
        components: body.components || [],
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : new Date(),
        effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
        status: 'Active',
        createdBy: user.id,
      },
      include: {
        grade: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: structure,
        message: 'Salary structure created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[Salary Structures API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create salary structure',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.EMPLOYEE_UPDATED,
  resourceType: 'salary_structure',
  captureRequestBody: true,
});
