import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const SalaryStructureSchema = z.object({
  employeeId: z.string(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  basicSalary: z.coerce.number(),
  houseRentAllowance: z.coerce.number().optional().default(0),
  transportAllowance: z.coerce.number().optional().default(0),
  otherAllowances: z.any().optional(),
  grossSalary: z.coerce.number(),
  ctc: z.coerce.number(),
  payFrequency: z.string().optional(),
  medicalInsurance: z.coerce.number().optional().default(0),
  lifeInsurance: z.coerce.number().optional().default(0),
});

// GET - Fetch employee salary structures
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const isActive = searchParams.get('isActive');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);

      const where: Record<string, unknown> = { tenantId };
      if (employeeId) where.employeeId = employeeId;
      if (isActive !== null && isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const [total, structures] = await Promise.all([
        prisma.employeeSalaryStructure.count({ where }),
        prisma.employeeSalaryStructure.findMany({
          where,
          orderBy: { effectiveFrom: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      // Map to frontend-expected shape
      const salaries = structures.map((s) => ({
        id: s.id,
        employeeId: s.employeeId,
        effectiveFrom: s.effectiveFrom?.toISOString(),
        effectiveTo: s.effectiveTo?.toISOString(),
        isActive: s.isActive,
        basicSalary: Number(s.basicSalary || 0),
        houseRentAllowance: Number(s.houseRentAllowance || 0),
        transportAllowance: Number(s.transportAllowance || 0),
        otherAllowances: s.otherAllowances,
        grossSalary: Number(s.grossSalary || 0),
        ctc: Number(s.ctc || 0),
        payFrequency: s.payFrequency,
        medicalInsurance: Number(s.medicalInsurance || 0),
        lifeInsurance: Number(s.lifeInsurance || 0),
        createdBy: s.createdBy,
        createdAt: s.createdAt?.toISOString(),
        updatedAt: s.updatedAt?.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        salaries,
        data: { salaries },
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      logger.error('Error fetching employee salaries:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch employee salaries' },
        { status: 500 }
      );
    }
  }
);

// POST - Create a new salary structure
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const data = SalaryStructureSchema.parse(body);

      // Deactivate previous active structures for this employee
      await prisma.employeeSalaryStructure.updateMany({
        where: {
          tenantId,
          employeeId: data.employeeId,
          isActive: true,
        },
        data: {
          isActive: false,
          effectiveTo: data.effectiveFrom,
        },
      });

      const structure = await prisma.employeeSalaryStructure.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          effectiveFrom: data.effectiveFrom,
          effectiveTo: data.effectiveTo,
          basicSalary: data.basicSalary,
          houseRentAllowance: data.houseRentAllowance,
          transportAllowance: data.transportAllowance,
          otherAllowances: data.otherAllowances || undefined,
          grossSalary: data.grossSalary,
          ctc: data.ctc,
          payFrequency: data.payFrequency,
          medicalInsurance: data.medicalInsurance,
          lifeInsurance: data.lifeInsurance,
          isActive: true,
          createdBy: user.userId,
        },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          resourceType: 'Payroll - Employee Salaries',
          metadata: { description: `Created salary structure for employee: ${data.employeeId} - CTC: ${data.ctc}` } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: structure,
        salary: structure,
      }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating salary structure:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create salary structure' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update salary structure
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const { id, ...updateFields } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Salary structure id is required' },
          { status: 400 }
        );
      }

      // Verify ownership
      const existing = await prisma.employeeSalaryStructure.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Salary structure not found' },
          { status: 404 }
        );
      }

      const allowedFields = [
        'effectiveFrom', 'effectiveTo', 'basicSalary', 'houseRentAllowance',
        'transportAllowance', 'otherAllowances', 'grossSalary', 'ctc',
        'payFrequency', 'medicalInsurance', 'lifeInsurance', 'isActive',
      ];

      const dataToUpdate: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (updateFields[field] !== undefined) {
          if (field === 'effectiveFrom' || field === 'effectiveTo') {
            dataToUpdate[field] = new Date(updateFields[field]);
          } else {
            dataToUpdate[field] = updateFields[field];
          }
        }
      }

      const updated = await prisma.employeeSalaryStructure.update({
        where: { id },
        data: dataToUpdate,
      });

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'UPDATE',
          resourceType: 'Payroll - Employee Salaries',
          metadata: { description: `Updated salary structure for employee: ${existing.employeeId}` } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        salary: updated,
      });
    } catch (error: any) {
      logger.error('Error updating salary structure:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update salary structure' },
        { status: 500 }
      );
    }
  }
);
