import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

function forbidden(message: string) {
  return NextResponse.json(
    {
      success: false,
      error: { code: 'E4030', message, messageAr: 'ممنوع' },
    },
    { status: 403 }
  );
}

function notFound() {
  return NextResponse.json(
    {
      success: false,
      error: { code: 'E4040', message: 'Salary structure not found', messageAr: 'غير موجود' },
    },
    { status: 404 }
  );
}

function serverError(error: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'E5001',
        message: 'Salary structure operation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
    },
    { status: 500 }
  );
}

const responseMeta = () => ({
  timestamp: new Date().toISOString(),
  requestId: crypto.randomUUID(),
  apiVersion: 'v1',
});

export const GET = withEnhancedAuth(
  async (
    _request: NextRequest,
    context: { user: { tenantId: string }; permissions: string[]; params?: { id?: string } }
  ) => {
    try {
      const { user, permissions, params } = context;
      if (!permissions.includes('payroll:read'))
        return forbidden('Forbidden: missing payroll:read');
      const id = params?.id;
      if (!id) return notFound();

      const structure = await prisma.salaryStructure.findFirst({
        where: { id, tenantId: user.tenantId, isDeleted: false },
        include: {
          grade: { select: { id: true, name: true, code: true } },
          _count: { select: { employees: true } },
        },
      });

      if (!structure) return notFound();

      return NextResponse.json({ success: true, data: structure, meta: responseMeta() });
    } catch (error) {
      return serverError(error);
    }
  }
);

export const PUT = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params?: { id?: string };
      }
    ) => {
      try {
        const { user, permissions, params } = context;
        if (!permissions.includes('payroll:update'))
          return forbidden('Forbidden: missing payroll:update');
        const id = params?.id;
        if (!id) return notFound();

        const existing = await prisma.salaryStructure.findFirst({
          where: { id, tenantId: user.tenantId, isDeleted: false },
          select: { id: true },
        });
        if (!existing) return notFound();

        const body = await request.json();
        // tenant-ok: id-based op preceded by tenant-scoped findFirst above
        const updated = await prisma.salaryStructure.update({
          where: { id },
          data: {
            name: body.name ?? undefined,
            code: body.code ?? undefined,
            gradeId: body.gradeId ?? undefined,
            basicSalary: body.basicSalary ?? undefined,
            grossSalary: body.grossSalary ?? undefined,
            currency: body.currency ?? undefined,
            components: body.components ?? undefined,
            effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
            effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
            status: body.status ?? undefined,
            updatedBy: user.id,
          },
          include: { grade: { select: { id: true, name: true, code: true } } },
        });

        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Salary structure updated',
          meta: responseMeta(),
        });
      } catch (error) {
        return serverError(error);
      }
    }
  ),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'salary_structure',
    captureRequestBody: true,
  }
);

export const DELETE = withAudit(
  withEnhancedAuth(
    async (
      _request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params?: { id?: string };
      }
    ) => {
      try {
        const { user, permissions, params } = context;
        if (!permissions.includes('payroll:delete'))
          return forbidden('Forbidden: missing payroll:delete');
        const id = params?.id;
        if (!id) return notFound();

        const existing = await prisma.salaryStructure.findFirst({
          where: { id, tenantId: user.tenantId, isDeleted: false },
          select: { id: true },
        });
        if (!existing) return notFound();

        // tenant-ok: id-based op preceded by tenant-scoped findFirst above
        await prisma.salaryStructure.update({
          where: { id },
          data: { isDeleted: true, deletedAt: new Date(), status: 'Archived', updatedBy: user.id },
        });

        return NextResponse.json({
          success: true,
          message: 'Salary structure archived',
          meta: responseMeta(),
        });
      } catch (error) {
        return serverError(error);
      }
    }
  ),
  { action: AuditAction.EMPLOYEE_UPDATED, resourceType: 'salary_structure' }
);
