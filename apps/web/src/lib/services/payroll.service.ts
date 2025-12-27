/**
 * Payroll Management Service
 * Handles salary processing, tax calculations, statutory compliance, payslips, and benefits
 */

import { prisma } from '@aura/database';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createPayrollRunSchema = z.object({
  tenantId: z.string(),
  configId: z.string(),
  payrollMonth: z.string(), // YYYY-MM
  createdBy: z.string(),
});

const createSalaryStructureSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  basicSalary: z.coerce.number(),
  houseRentAllowance: z.coerce.number().optional(),
  transportAllowance: z.coerce.number().optional(),
  otherAllowances: z.any().optional(),
  grossSalary: z.coerce.number(),
  ctc: z.coerce.number(),
  medicalInsurance: z.coerce.number().optional(),
  lifeInsurance: z.coerce.number().optional(),
  createdBy: z.string(),
});

const createTaxDeclarationSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  financialYear: z.string(),
  taxRegime: z.enum(['OLD', 'NEW']).optional(),
  ppf: z.coerce.number().optional(),
  elss: z.coerce.number().optional(),
  lifeInsurance: z.coerce.number().optional(),
  homeLoanPrincipal: z.coerce.number().optional(),
  medicalSelf: z.coerce.number().optional(),
  medicalParents: z.coerce.number().optional(),
  rentPaid: z.coerce.number().optional(),
  landlordPAN: z.string().optional(),
});

const createBenefitSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  benefitType: z.string(),
  benefitName: z.string(),
  provider: z.string().optional(),
  policyNumber: z.string().optional(),
  coverageAmount: z.coerce.number().optional(),
  employeeContribution: z.coerce.number().optional(),
  employerContribution: z.coerce.number().optional(),
  totalPremium: z.coerce.number(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  coversDependents: z.boolean().optional(),
  dependentsCount: z.number().optional(),
});

const createAdjustmentSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  payrollMonth: z.string(),
  adjustmentType: z.enum(['EARNING', 'DEDUCTION']),
  code: z.string(),
  name: z.string(),
  amount: z.coerce.number(),
  reason: z.string(),
  category: z.string().optional(),
  createdBy: z.string(),
});

// ============================================================================
// PAYROLL SERVICE
// ============================================================================

export class PayrollService {
  // --------------------------------------------------------------------------
  // Payroll Runs
  // --------------------------------------------------------------------------

  static async findAllRuns(filter: any = {}) {
    const { tenantId, payrollMonth, status, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (payrollMonth) where.payrollMonth = payrollMonth;
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.payrollRun.count({ where }),
      prisma.payrollRun.findMany({
        where,
        include: { config: true },
        orderBy: { payrollMonth: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findRunById(id: string, tenantId: string) {
    return prisma.payrollRun.findFirst({
      where: { id, tenantId },
      include: { config: true, payslips: true },
    });
  }

  static async createRun(data: z.infer<typeof createPayrollRunSchema>) {
    const validated = createPayrollRunSchema.parse(data);
    return prisma.payrollRun.create({ data: validated });
  }

  static async processPayroll(id: string, tenantId: string) {
    // Simplified processing - in production, this would calculate salaries
    return prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'CALCULATED',
        processedAt: new Date(),
      },
    });
  }

  static async approveRun(id: string, tenantId: string, approvedBy: string) {
    return prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  static async getRunStatistics(tenantId: string) {
    const [total, draft, processing, approved] = await Promise.all([
      prisma.payrollRun.count({ where: { tenantId } }),
      prisma.payrollRun.count({ where: { tenantId, status: 'DRAFT' } }),
      prisma.payrollRun.count({ where: { tenantId, status: 'PROCESSING' } }),
      prisma.payrollRun.count({ where: { tenantId, status: 'APPROVED' } }),
    ]);

    return { total, draft, processing, approved };
  }

  // --------------------------------------------------------------------------
  // Salary Structures
  // --------------------------------------------------------------------------

  static async findAllStructures(filter: any = {}) {
    const { tenantId, employeeId, isActive, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (employeeId) where.employeeId = employeeId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [total, data] = await Promise.all([
      prisma.employeeSalaryStructure.count({ where }),
      prisma.employeeSalaryStructure.findMany({
        where,
        orderBy: { effectiveFrom: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async createStructure(data: z.infer<typeof createSalaryStructureSchema>) {
    const validated = createSalaryStructureSchema.parse(data);

    // Deactivate previous structures
    await prisma.employeeSalaryStructure.updateMany({
      where: {
        tenantId: validated.tenantId,
        employeeId: validated.employeeId,
        isActive: true,
      },
      data: { isActive: false, effectiveTo: new Date() },
    });

    return prisma.employeeSalaryStructure.create({ data: validated });
  }

  // --------------------------------------------------------------------------
  // Tax Declarations
  // --------------------------------------------------------------------------

  static async findAllDeclarations(filter: any = {}) {
    const { tenantId, employeeId, financialYear, status, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (employeeId) where.employeeId = employeeId;
    if (financialYear) where.financialYear = financialYear;
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.taxDeclaration.count({ where }),
      prisma.taxDeclaration.findMany({
        where,
        orderBy: { financialYear: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async createDeclaration(data: z.infer<typeof createTaxDeclarationSchema>) {
    const validated = createTaxDeclarationSchema.parse(data);

    // Calculate totals
    const section80C =
      Number(validated.ppf || 0) +
      Number(validated.elss || 0) +
      Number(validated.lifeInsurance || 0) +
      Number(validated.homeLoanPrincipal || 0);

    const section80D =
      Number(validated.medicalSelf || 0) +
      Number(validated.medicalParents || 0);

    const totalDeductions = section80C + section80D;

    return prisma.taxDeclaration.create({
      data: {
        ...validated,
        section80C,
        section80D,
        totalDeductions,
      },
    });
  }

  static async submitDeclaration(id: string, tenantId: string) {
    return prisma.taxDeclaration.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }

  static async verifyDeclaration(id: string, tenantId: string, verifiedBy: string) {
    return prisma.taxDeclaration.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedBy,
        verifiedAt: new Date(),
      },
    });
  }

  // --------------------------------------------------------------------------
  // Benefits
  // --------------------------------------------------------------------------

  static async findAllBenefits(filter: any = {}) {
    const { tenantId, employeeId, benefitType, status, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (employeeId) where.employeeId = employeeId;
    if (benefitType) where.benefitType = benefitType;
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.employeeBenefit.count({ where }),
      prisma.employeeBenefit.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async createBenefit(data: z.infer<typeof createBenefitSchema>) {
    const validated = createBenefitSchema.parse(data);
    return prisma.employeeBenefit.create({ data: validated });
  }

  // --------------------------------------------------------------------------
  // Payroll Adjustments
  // --------------------------------------------------------------------------

  static async findAllAdjustments(filter: any = {}) {
    const { tenantId, employeeId, payrollMonth, isProcessed, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (employeeId) where.employeeId = employeeId;
    if (payrollMonth) where.payrollMonth = payrollMonth;
    if (isProcessed !== undefined) where.isProcessed = isProcessed === 'true';

    const [total, data] = await Promise.all([
      prisma.payrollAdjustment.count({ where }),
      prisma.payrollAdjustment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async createAdjustment(data: z.infer<typeof createAdjustmentSchema>) {
    const validated = createAdjustmentSchema.parse(data);
    return prisma.payrollAdjustment.create({ data: validated });
  }

  static async approveAdjustment(id: string, tenantId: string, approvedBy: string) {
    return prisma.payrollAdjustment.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  // --------------------------------------------------------------------------
  // Payslips
  // --------------------------------------------------------------------------

  static async findAllPayslips(filter: any = {}) {
    const { payrollRunId, employeeId, status, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (payrollRunId) where.payrollRunId = payrollRunId;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.payslip.count({ where }),
      prisma.payslip.findMany({
        where,
        include: { payrollRun: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findPayslipById(id: string) {
    return prisma.payslip.findUnique({
      where: { id },
      include: { payrollRun: { include: { config: true } } },
    });
  }

  // --------------------------------------------------------------------------
  // Statutory Payments
  // --------------------------------------------------------------------------

  static async findAllStatutoryPayments(filter: any = {}) {
    const { tenantId, paymentMonth, statutoryType, status, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (paymentMonth) where.paymentMonth = paymentMonth;
    if (statutoryType) where.statutoryType = statutoryType;
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.statutoryPayment.count({ where }),
      prisma.statutoryPayment.findMany({
        where,
        orderBy: { paymentMonth: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async markStatutoryPaid(id: string, tenantId: string, paymentDetails: any) {
    return prisma.statutoryPayment.update({
      where: { id },
      data: {
        status: 'PAID',
        isPaid: true,
        paymentDate: new Date(),
        ...paymentDetails,
      },
    });
  }
}
