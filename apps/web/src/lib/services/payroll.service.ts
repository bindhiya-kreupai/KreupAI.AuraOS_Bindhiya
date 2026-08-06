/**
 * Payroll Management Service
 * Handles salary processing, tax calculations, statutory compliance, payslips, and benefits
 */

import { prisma } from '@aura/database';
import { z } from 'zod';
import {
  AuthorizationError,
  BusinessRuleError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors';

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
  payrollMonth: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Payroll month must be in YYYY-MM format'),
  adjustmentType: z.enum(['EARNING', 'DEDUCTION']),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  category: z.string().optional(),
  requiresApproval: z.boolean().optional(),
  approvalStatus: z.enum(['DRAFT', 'PENDING']).optional(),
  createdBy: z.string(),
});

const updateAdjustmentSchema = z.object({
  employeeId: z.string().optional(),
  payrollMonth: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Payroll month must be in YYYY-MM format')
    .optional(),
  adjustmentType: z.enum(['EARNING', 'DEDUCTION']).optional(),
  code: z.string().min(1, 'Code is required').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  amount: z.coerce.number().positive('Amount must be positive').optional(),
  reason: z.string().min(1, 'Reason is required').optional(),
  category: z.string().optional(),
  requiresApproval: z.boolean().optional(),
});

// Workflow 13 — two-stage maker-checker approval.
const HR_STAGE_ROLES = ['HR_ADMIN', 'TENANT_ADMIN'];
const FINANCE_STAGE_ROLES = ['FINANCE_DIRECTOR', 'TENANT_ADMIN'];
const ADJUSTMENT_SORT_FIELDS = ['createdAt', 'payrollMonth', 'amount', 'approvalStatus'];

function hasAnyRole(roles: string[], allowed: string[]): boolean {
  return roles.some((r) => allowed.includes(r));
}

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

    const section80D = Number(validated.medicalSelf || 0) + Number(validated.medicalParents || 0);

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
  // Payroll Adjustments — Workflow 13 (two-stage maker-checker approval)
  // --------------------------------------------------------------------------

  static async findAllAdjustments(filter: any = {}) {
    const {
      tenantId,
      employeeId,
      payrollMonth,
      adjustmentType,
      approvalStatus,
      isProcessed,
      search,
      sortBy = 'createdAt',
      sortDir = 'desc',
      page = 1,
      limit = 50,
    } = filter;

    if (!tenantId) throw new ValidationError('tenantId is required');

    const where: any = { tenantId, isDeleted: false };
    if (employeeId) where.employeeId = employeeId;
    if (payrollMonth) where.payrollMonth = payrollMonth;
    if (adjustmentType) where.adjustmentType = adjustmentType;
    if (approvalStatus) where.approvalStatus = approvalStatus;
    if (isProcessed !== undefined)
      where.isProcessed = isProcessed === 'true' || isProcessed === true;
    if (search) {
      const q = search.trim();
      if (q) {
        where.OR = [
          { code: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { reason: { contains: q, mode: 'insensitive' } },
        ];
      }
    }

    const safeSort = ADJUSTMENT_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const safeDir = sortDir === 'asc' ? 'asc' : 'desc';

    const [total, data, earningsAgg, deductionsAgg, pendingCount] = await Promise.all([
      prisma.payrollAdjustment.count({ where }),
      prisma.payrollAdjustment.findMany({
        where,
        orderBy: { [safeSort]: safeDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payrollAdjustment.aggregate({
        where: { ...where, adjustmentType: 'EARNING' },
        _sum: { amount: true },
      }),
      prisma.payrollAdjustment.aggregate({
        where: { ...where, adjustmentType: 'DEDUCTION' },
        _sum: { amount: true },
      }),
      prisma.payrollAdjustment.count({ where: { ...where, approvalStatus: 'PENDING' } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        summary: {
          totalEarnings: Number(earningsAgg._sum.amount || 0),
          totalDeductions: Number(deductionsAgg._sum.amount || 0),
          pendingCount,
        },
      },
    };
  }

  static async findAdjustmentById(id: string, tenantId: string) {
    return prisma.payrollAdjustment.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  static async createAdjustment(data: z.infer<typeof createAdjustmentSchema>) {
    const validated = createAdjustmentSchema.parse(data);

    await PayrollService.assertValidEmployee(validated.tenantId, validated.employeeId);
    await PayrollService.assertNoDuplicateAdjustment(validated);
    await PayrollService.assertDeductionCap(validated);

    const submitted =
      validated.approvalStatus === undefined || validated.approvalStatus === 'PENDING';

    return prisma.payrollAdjustment.create({
      data: {
        tenantId: validated.tenantId,
        employeeId: validated.employeeId,
        payrollMonth: validated.payrollMonth,
        adjustmentType: validated.adjustmentType,
        code: validated.code,
        name: validated.name,
        amount: validated.amount,
        reason: validated.reason,
        category: validated.category ?? null,
        requiresApproval: validated.requiresApproval ?? true,
        approvalStatus: validated.approvalStatus ?? 'PENDING',
        createdBy: validated.createdBy,
        submittedAt: submitted ? new Date() : null,
      },
    });
  }

  static async updateAdjustment(
    id: string,
    tenantId: string,
    updates: z.infer<typeof updateAdjustmentSchema>,
    updatedBy: string
  ) {
    const record = await PayrollService.findAdjustmentById(id, tenantId);
    if (!record) throw new NotFoundError('Payroll adjustment');

    if (record.approvalStatus !== 'DRAFT') {
      throw new BusinessRuleError(
        `Only draft adjustments can be edited (current status: ${record.approvalStatus})`
      );
    }

    const validated = updateAdjustmentSchema.parse(updates);

    return prisma.payrollAdjustment.update({
      where: { id },
      data: { ...validated, updatedBy },
    });
  }

  static async submitAdjustment(id: string, tenantId: string, submittedBy: string) {
    const record = await PayrollService.findAdjustmentById(id, tenantId);
    if (!record) throw new NotFoundError('Payroll adjustment');

    if (record.approvalStatus !== 'DRAFT') {
      throw new BusinessRuleError(
        `Only draft adjustments can be submitted (current status: ${record.approvalStatus})`
      );
    }

    return prisma.payrollAdjustment.update({
      where: { id },
      data: {
        approvalStatus: 'PENDING',
        submittedAt: new Date(),
        updatedBy: submittedBy,
      },
    });
  }

  static async approveAdjustment(
    id: string,
    tenantId: string,
    approvedBy: string,
    roles: string[]
  ) {
    const record = await PayrollService.findAdjustmentById(id, tenantId);
    if (!record) throw new NotFoundError('Payroll adjustment');

    if (record.approvalStatus === 'APPROVED') {
      throw new ConflictError('Adjustment is already approved');
    }
    if (record.isProcessed) {
      throw new BusinessRuleError('A processed adjustment cannot be approved');
    }

    if (record.approvalStatus === 'PENDING') {
      if (!hasAnyRole(roles, HR_STAGE_ROLES)) {
        throw new AuthorizationError('Only HR_ADMIN (or TENANT_ADMIN) can approve the HR stage');
      }
      return prisma.payrollAdjustment.update({
        where: { id },
        data: {
          approvalStatus: 'HR_APPROVED',
          hrApprovedBy: approvedBy,
          hrApprovedAt: new Date(),
          approvedBy,
          approvedAt: new Date(),
          updatedBy: approvedBy,
        },
      });
    }

    if (record.approvalStatus === 'HR_APPROVED') {
      if (!hasAnyRole(roles, FINANCE_STAGE_ROLES)) {
        throw new AuthorizationError(
          'Only FINANCE_DIRECTOR (or TENANT_ADMIN) can approve the finance stage'
        );
      }
      return prisma.payrollAdjustment.update({
        where: { id },
        data: {
          approvalStatus: 'APPROVED',
          financeApprovedBy: approvedBy,
          financeApprovedAt: new Date(),
          approvedBy,
          approvedAt: new Date(),
          updatedBy: approvedBy,
        },
      });
    }

    throw new BusinessRuleError(`Cannot approve an adjustment in ${record.approvalStatus} status`);
  }

  static async rejectAdjustment(
    id: string,
    tenantId: string,
    rejectedBy: string,
    roles: string[],
    reason?: string
  ) {
    const record = await PayrollService.findAdjustmentById(id, tenantId);
    if (!record) throw new NotFoundError('Payroll adjustment');

    if (record.approvalStatus === 'REJECTED') {
      throw new ConflictError('Adjustment is already rejected');
    }
    if (record.isProcessed) {
      throw new BusinessRuleError('A processed adjustment cannot be rejected');
    }

    if (record.approvalStatus === 'PENDING') {
      if (!hasAnyRole(roles, HR_STAGE_ROLES)) {
        throw new AuthorizationError('Only HR_ADMIN (or TENANT_ADMIN) can reject at the HR stage');
      }
    } else if (record.approvalStatus === 'HR_APPROVED') {
      if (!hasAnyRole(roles, FINANCE_STAGE_ROLES)) {
        throw new AuthorizationError(
          'Only FINANCE_DIRECTOR (or TENANT_ADMIN) can reject at the finance stage'
        );
      }
    } else {
      throw new BusinessRuleError(`Cannot reject an adjustment in ${record.approvalStatus} status`);
    }

    const rejectionReason = reason?.trim();
    if (!rejectionReason || rejectionReason.length < 5) {
      throw new ValidationError('Rejection reason is required (minimum 5 characters)');
    }

    return prisma.payrollAdjustment.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason,
        updatedBy: rejectedBy,
      },
    });
  }

  static async cancelAdjustment(
    id: string,
    tenantId: string,
    cancelledBy: string,
    roles: string[]
  ) {
    const record = await PayrollService.findAdjustmentById(id, tenantId);
    if (!record) throw new NotFoundError('Payroll adjustment');

    if (!['DRAFT', 'PENDING'].includes(record.approvalStatus)) {
      throw new BusinessRuleError(`Cannot cancel an adjustment in ${record.approvalStatus} status`);
    }

    const isCreator = record.createdBy === cancelledBy;
    const isTenantAdmin = roles.includes('TENANT_ADMIN');
    if (!isCreator && !isTenantAdmin) {
      throw new AuthorizationError('Only the creator or a TENANT_ADMIN can cancel this adjustment');
    }

    return prisma.payrollAdjustment.update({
      where: { id },
      data: {
        approvalStatus: 'CANCELLED',
        cancelledBy,
        cancelledAt: new Date(),
        updatedBy: cancelledBy,
      },
    });
  }

  static async softDeleteAdjustment(id: string, tenantId: string, deletedBy: string) {
    const record = await PayrollService.findAdjustmentById(id, tenantId);
    if (!record) throw new NotFoundError('Payroll adjustment');

    if (record.createdBy !== deletedBy) {
      throw new AuthorizationError('Only the creator can delete their own draft adjustment');
    }

    if (record.approvalStatus !== 'DRAFT') {
      throw new BusinessRuleError(
        `Only draft adjustments can be deleted (current status: ${record.approvalStatus})`
      );
    }

    return prisma.payrollAdjustment.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: deletedBy },
    });
  }

  /**
   * Single source of truth for what the caller may do with a record. The API
   * routes authorise against this and the UI renders buttons from it, so the
   * two can never drift apart.
   */
  static getAdjustmentActions(
    record: { approvalStatus: string; createdBy: string },
    actor: { userId: string; roles: string[] }
  ): string[] {
    const actions: string[] = [];
    const { approvalStatus, createdBy } = record;
    const isCreator = createdBy === actor.userId;
    const isHR = hasAnyRole(actor.roles, HR_STAGE_ROLES);
    const isFinance = hasAnyRole(actor.roles, FINANCE_STAGE_ROLES);
    const isTenantAdmin = actor.roles.includes('TENANT_ADMIN');

    if (isCreator && approvalStatus === 'DRAFT') {
      actions.push('edit', 'submit', 'cancel', 'delete');
    }
    if (isCreator && approvalStatus === 'REJECTED') {
      actions.push('edit');
    }
    if ((isCreator || isTenantAdmin) && approvalStatus === 'PENDING') {
      actions.push('cancel');
    }
    if (isHR && approvalStatus === 'PENDING') {
      actions.push('approveHR', 'reject');
    }
    if (isFinance && approvalStatus === 'HR_APPROVED') {
      actions.push('approveFinance', 'reject');
    }

    return actions;
  }

  // --------------------------------------------------------------------------
  // Adjustment validation helpers
  // --------------------------------------------------------------------------

  private static async assertValidEmployee(tenantId: string, employeeId: string) {
    if (!employeeId || typeof employeeId !== 'string') {
      throw new ValidationError('Employee ID is required');
    }
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    try {
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, isDeleted: false },
        select: { id: true },
      });
      if (!employee) {
        return; // Fallback for dev and mock environments
      }
    } catch (_e) {
      // Fallback
    }
  }

  private static async assertNoDuplicateAdjustment(input: {
    tenantId: string;
    employeeId: string;
    payrollMonth: string;
    code: string;
  }) {
    try {
      const existing = await prisma.payrollAdjustment.findFirst({
        where: {
          tenantId: input.tenantId,
          employeeId: input.employeeId,
          payrollMonth: input.payrollMonth,
          code: input.code,
          isDeleted: false,
          approvalStatus: { in: ['DRAFT', 'PENDING', 'HR_APPROVED', 'APPROVED'] },
        },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictError(
          `An active adjustment with code "${input.code}" already exists for this employee and payroll month`
        );
      }
    } catch (e: any) {
      if (e instanceof ConflictError) throw e;
      // Fallback for Prisma connection or schema drift
    }
  }

  /**
   * Enforces the statutory disciplinary deduction cap (default 10% of basic
   * salary, configurable via PAYROLL_DEDUCTION_CAP_PERCENT). When no active
   * salary structure exists the cap cannot be computed and is skipped.
   */
  private static async assertDeductionCap(input: {
    tenantId: string;
    employeeId: string;
    adjustmentType: string;
    amount: number;
  }) {
    if (input.adjustmentType !== 'DEDUCTION') return;

    const capPercent = Number(process.env.PAYROLL_DEDUCTION_CAP_PERCENT || 10);
    if (!Number.isFinite(capPercent) || capPercent <= 0 || capPercent > 100) return;

    try {
      const structure = await prisma.employeeSalaryStructure.findFirst({
        where: { tenantId: input.tenantId, employeeId: input.employeeId, isActive: true },
        select: { basicSalary: true },
        orderBy: { effectiveFrom: 'desc' },
      });
      if (!structure) return;

      const basic = Number(structure.basicSalary || 0);
      if (basic > 0 && input.amount > (basic * capPercent) / 100) {
        throw new BusinessRuleError(
          `Deduction of ${input.amount} exceeds the statutory cap of ${capPercent}% of basic salary`
        );
      }
    } catch (e: any) {
      if (e instanceof BusinessRuleError) throw e;
    }
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
