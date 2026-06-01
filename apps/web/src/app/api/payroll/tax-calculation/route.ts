import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const TaxDeclarationSchema = z.object({
  employeeId: z.string(),
  financialYear: z.string(),
  taxRegime: z.enum(['OLD', 'NEW']).optional().default('OLD'),
  ppf: z.coerce.number().optional().default(0),
  elss: z.coerce.number().optional().default(0),
  lifeInsurance: z.coerce.number().optional().default(0),
  nsc: z.coerce.number().optional().default(0),
  homeLoanPrincipal: z.coerce.number().optional().default(0),
  tuitionFees: z.coerce.number().optional().default(0),
  medicalSelf: z.coerce.number().optional().default(0),
  medicalParents: z.coerce.number().optional().default(0),
  preventiveCheckup: z.coerce.number().optional().default(0),
  educationLoanInterest: z.coerce.number().optional().default(0),
  homeLoanInterest: z.coerce.number().optional().default(0),
  rentPaid: z.coerce.number().optional().default(0),
  landlordPAN: z.string().optional(),
  section80G: z.coerce.number().optional().default(0),
  section80TTA: z.coerce.number().optional().default(0),
  otherDeductions: z.any().optional(),
});

// GET - Fetch tax declarations
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const financialYear = searchParams.get('fiscalYear') || searchParams.get('financialYear');
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);

      const where: Record<string, unknown> = { tenantId };
      if (employeeId) where.employeeId = employeeId;
      if (financialYear) where.financialYear = financialYear;
      if (status) where.status = status;

      const [total, declarations] = await Promise.all([
        prisma.taxDeclaration.count({ where }),
        prisma.taxDeclaration.findMany({
          where,
          orderBy: { financialYear: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      return NextResponse.json({
        success: true,
        declarations,
        data: declarations.length === 1 ? declarations[0] : declarations,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      logger.error('Error fetching tax declarations:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tax declarations' },
        { status: 500 }
      );
    }
  }
);

// POST - Create or calculate tax declaration
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const data = TaxDeclarationSchema.parse(body);

      // Calculate section totals
      const section80C = Math.min(
        (data.ppf || 0) +
        (data.elss || 0) +
        (data.lifeInsurance || 0) +
        (data.nsc || 0) +
        (data.homeLoanPrincipal || 0) +
        (data.tuitionFees || 0),
        150000 // Section 80C limit
      );

      const section80D =
        (data.medicalSelf || 0) +
        (data.medicalParents || 0) +
        (data.preventiveCheckup || 0);

      const totalDeductions = section80C + section80D +
        (data.educationLoanInterest || 0) +
        (data.homeLoanInterest || 0) +
        (data.section80G || 0) +
        (data.section80TTA || 0);

      // Upsert: create or update based on tenant+employee+year
      const declaration = await prisma.taxDeclaration.upsert({
        where: {
          tenantId_employeeId_financialYear: {
            tenantId,
            employeeId: data.employeeId,
            financialYear: data.financialYear,
          },
        },
        update: {
          taxRegime: data.taxRegime,
          ppf: data.ppf,
          elss: data.elss,
          lifeInsurance: data.lifeInsurance,
          nsc: data.nsc,
          homeLoanPrincipal: data.homeLoanPrincipal,
          tuitionFees: data.tuitionFees,
          medicalSelf: data.medicalSelf,
          medicalParents: data.medicalParents,
          preventiveCheckup: data.preventiveCheckup,
          educationLoanInterest: data.educationLoanInterest,
          homeLoanInterest: data.homeLoanInterest,
          rentPaid: data.rentPaid,
          landlordPAN: data.landlordPAN,
          section80G: data.section80G,
          section80TTA: data.section80TTA,
          otherDeductions: data.otherDeductions || undefined,
          totalDeductions,
        },
        create: {
          tenantId,
          employeeId: data.employeeId,
          financialYear: data.financialYear,
          taxRegime: data.taxRegime,
          ppf: data.ppf,
          elss: data.elss,
          lifeInsurance: data.lifeInsurance,
          nsc: data.nsc,
          homeLoanPrincipal: data.homeLoanPrincipal,
          tuitionFees: data.tuitionFees,
          medicalSelf: data.medicalSelf,
          medicalParents: data.medicalParents,
          preventiveCheckup: data.preventiveCheckup,
          educationLoanInterest: data.educationLoanInterest,
          homeLoanInterest: data.homeLoanInterest,
          rentPaid: data.rentPaid,
          landlordPAN: data.landlordPAN,
          section80G: data.section80G,
          section80TTA: data.section80TTA,
          otherDeductions: data.otherDeductions || undefined,
          totalDeductions,
          status: 'DRAFT',
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Tax Calculation',
          details: `Saved tax declaration: ${data.taxRegime} regime for FY ${data.financialYear} - Total deductions: ${totalDeductions}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: declaration,
        declaration,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error calculating tax:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to calculate tax' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update tax declarations
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const { id, status: newStatus, ...updateData } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Declaration id is required' },
          { status: 400 }
        );
      }

      // Verify the declaration belongs to this tenant
      const existing = await prisma.taxDeclaration.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Tax declaration not found' },
          { status: 404 }
        );
      }

      const dataToUpdate: Record<string, unknown> = {};

      // Handle status changes
      if (newStatus) {
        dataToUpdate.status = newStatus;
        if (newStatus === 'SUBMITTED') {
          dataToUpdate.submittedAt = new Date();
        } else if (newStatus === 'VERIFIED') {
          dataToUpdate.verifiedBy = user.userId;
          dataToUpdate.verifiedAt = new Date();
        }
      }

      // Handle field updates
      const allowedFields = [
        'taxRegime', 'ppf', 'elss', 'lifeInsurance', 'nsc', 'homeLoanPrincipal',
        'tuitionFees', 'medicalSelf', 'medicalParents', 'preventiveCheckup',
        'educationLoanInterest', 'homeLoanInterest', 'rentPaid', 'landlordPAN',
        'section80G', 'section80TTA', 'otherDeductions', 'rejectionReason',
        'proofsUploaded', 'proofDocuments',
      ];
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          dataToUpdate[field] = updateData[field];
        }
      }

      const updated = await prisma.taxDeclaration.update({
        where: { id },
        data: dataToUpdate,
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Payroll - Tax Calculation',
          details: `Updated tax declarations for employee: ${existing.employeeId}${newStatus ? ` - Status: ${newStatus}` : ''}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error updating tax declarations:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update tax declarations' },
        { status: 500 }
      );
    }
  }
);
