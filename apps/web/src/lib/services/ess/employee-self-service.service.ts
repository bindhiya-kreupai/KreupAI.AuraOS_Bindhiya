// @ts-nocheck — tracker #29. 2026-06-17 audit re-verification documented 18 schema-drift
// sites that need domain investigation before TS can be re-enabled. Known drifted call-sites:
//   - L176 / L180 / L689 PayrollRun.payPeriodYear / payPeriodMonth (renamed/removed)
//   - L381 / L471 BenefitEnrollmentStatus enum no longer accepts 'PENDING'
//   - L427 / L456 BenefitPlan.isActive removed (use status string?)
//   - L466 CoverageLevel narrowed from string to enum
//   - L504 EmployeeDocument.uploadedAt removed
//   - L535 EmployeeDocument.employee (relation) is now .employeeId (scalar)
//   - L631 ExpenseClaim.expenseDate renamed
//   - L660 Employee.designation removed
//   - L677 LeavePolicy.leaveType relation removed
//   - L754 prisma.attendance delegate no longer exists (split into multiple models)
//   - L801 / L831 Employee.dateOfBirth no longer in default select shape
// Until these drift sites are remediated against the deployed schema, the file
// must stay under @ts-nocheck. (probation.service.ts was cleanly re-typed in
// the same commit — only this larger ESS surface is still pending.)
//
// Note: when removing @ts-nocheck, do NOT use a blanket `as any` cast — each
// drift site needs to map to the canonical shape (payslip period split, benefit
// enum migration, attendance model split, etc.) so callers get accurate types.
/**
 * Enhanced Employee Self-Service (ESS) Portal Service
 * Provides payslip portal, tax document access, benefits enrollment,
 * document repository, and expense claims for employees
 */

import { prisma } from '@aura/database';

// ============================================================================
// TYPES
// ============================================================================

export interface PayslipSummary {
  id: string;
  month: string; // "2026-04"
  monthLabel: string; // "April 2026"
  monthLabelAr: string; // "أبريل ٢٠٢٦"
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  status: 'DRAFT' | 'FINALIZED' | 'PAID';
  paidAt?: Date;
  downloadUrl?: string;
}

export interface YTDSummary {
  year: number;
  totalGrossEarnings: number;
  totalDeductions: number;
  totalNetPay: number;
  totalTaxPaid: number;
  totalPFContribution: number;
  totalOtherDeductions: number;
  currency: string;
  monthlyBreakdown: Array<{
    month: string;
    gross: number;
    deductions: number;
    net: number;
  }>;
}

export interface TaxDocument {
  id: string;
  type:
    | 'FORM_16'
    | 'FORM_12BA'
    | 'TDS_CERTIFICATE'
    | 'PF_STATEMENT'
    | 'ESI_CARD'
    | 'GOSI_STATEMENT'
    | 'SALARY_CERTIFICATE'
    | 'EMPLOYMENT_LETTER';
  name: string;
  nameAr: string;
  financialYear: string;
  generatedAt: Date;
  downloadUrl: string;
  fileSize?: number;
}

export interface BenefitEnrollment {
  id: string;
  planName: string;
  planNameAr: string;
  category:
    | 'HEALTH'
    | 'DENTAL'
    | 'VISION'
    | 'LIFE'
    | 'DISABILITY'
    | 'RETIREMENT'
    | 'EDUCATION'
    | 'OTHER';
  provider: string;
  coverageLevel: 'EMPLOYEE' | 'EMPLOYEE_SPOUSE' | 'FAMILY';
  monthlyCost: number;
  employerContribution: number;
  employeeContribution: number;
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  dependents?: Array<{ name: string; relationship: string; dateOfBirth?: Date }>;
}

export interface PersonalDocument {
  id: string;
  name: string;
  nameAr?: string;
  category: 'IDENTITY' | 'EDUCATION' | 'EMPLOYMENT' | 'MEDICAL' | 'VISA' | 'PERSONAL' | 'OTHER';
  fileUrl: string;
  fileType: string;
  fileSize: number;
  expiryDate?: Date;
  isVerified: boolean;
  uploadedAt: Date;
}

export interface ExpenseClaim {
  id: string;
  tenantId: string;
  employeeId: string;
  title: string;
  category:
    | 'TRAVEL'
    | 'MEALS'
    | 'ACCOMMODATION'
    | 'TRANSPORT'
    | 'OFFICE_SUPPLIES'
    | 'TRAINING'
    | 'COMMUNICATION'
    | 'MEDICAL'
    | 'OTHER';
  amount: number;
  currency: string;
  date: Date;
  description: string;
  receipts: Array<{ fileUrl: string; fileName: string }>;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
  approvedBy?: string;
  approvedAt?: Date;
  reimbursedAt?: Date;
  rejectionReason?: string;
}

export interface ESSProfileSummary {
  employeeId: string;
  name: string;
  nameAr?: string;
  designation: string;
  department: string;
  location: string;
  manager: string;
  joiningDate: Date;
  yearsOfService: number;
  leaveBalance: Array<{
    type: string;
    typeAr: string;
    available: number;
    used: number;
    total: number;
  }>;
  pendingApprovals: number;
  pendingExpenses: number;
  upcomingEvents: Array<{ type: string; title: string; date: Date }>;
  recentPayslip?: PayslipSummary;
}

export interface TeamDashboard {
  managerId: string;
  teamSize: number;
  presentToday: number;
  onLeave: number;
  absent: number;
  pendingApprovals: Array<{
    type: 'LEAVE' | 'EXPENSE' | 'OVERTIME' | 'REGULARIZATION' | 'SHIFT_SWAP';
    count: number;
  }>;
  teamLeaveCalendar: Array<{
    employeeId: string;
    employeeName: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
  }>;
  birthdays: Array<{ employeeId: string; name: string; date: Date }>;
  workAnniversaries: Array<{ employeeId: string; name: string; date: Date; years: number }>;
}

// ============================================================================
// MONTH NAMES
// ============================================================================

const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const MONTH_NAMES_AR = [
  'يناير',
  'فبراي��',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسم��ر',
];

// ============================================================================
// ESS SERVICE
// ============================================================================

export class EmployeeSelfService {
  // --------------------------------------------------------------------------
  // Payslip Portal
  // --------------------------------------------------------------------------

  /**
   * Get employee payslip history
   */
  static async getPayslipHistory(
    tenantId: string,
    employeeId: string,
    year?: number
  ): Promise<PayslipSummary[]> {
    const targetYear = year || new Date().getFullYear();

    const payslips = await prisma.payslip.findMany({
      where: {
        employeeId,
        payrollRun: {
          tenantId,
          payPeriodYear: targetYear,
        },
      },
      include: { payrollRun: true },
      orderBy: { payrollRun: { payPeriodMonth: 'desc' } },
    });

    return payslips.map((ps: any) => {
      const month = ps.payrollRun.payPeriodMonth;
      const yr = ps.payrollRun.payPeriodYear;
      return {
        id: ps.id,
        month: `${yr}-${String(month).padStart(2, '0')}`,
        monthLabel: `${MONTH_NAMES_EN[month - 1]} ${yr}`,
        monthLabelAr: `${MONTH_NAMES_AR[month - 1]} ${yr}`,
        grossEarnings: Number(ps.grossEarnings || 0),
        totalDeductions: Number(ps.totalDeductions || 0),
        netPay: Number(ps.netPay || 0),
        currency: ps.currency || 'AED',
        status: ps.payrollRun.status === 'FINALIZED' ? 'PAID' : ps.payrollRun.status,
        paidAt: ps.payrollRun.disbursedAt,
      };
    });
  }

  /**
   * Get Year-to-Date salary summary
   */
  static async getYTDSummary(
    tenantId: string,
    employeeId: string,
    year?: number
  ): Promise<YTDSummary> {
    const targetYear = year || new Date().getFullYear();
    const payslips = await this.getPayslipHistory(tenantId, employeeId, targetYear);

    const monthlyBreakdown = payslips.map((ps) => ({
      month: ps.month,
      gross: ps.grossEarnings,
      deductions: ps.totalDeductions,
      net: ps.netPay,
    }));

    return {
      year: targetYear,
      totalGrossEarnings: payslips.reduce((s, p) => s + p.grossEarnings, 0),
      totalDeductions: payslips.reduce((s, p) => s + p.totalDeductions, 0),
      totalNetPay: payslips.reduce((s, p) => s + p.netPay, 0),
      totalTaxPaid: 0, // Would be populated from payslip line items
      totalPFContribution: 0,
      totalOtherDeductions: 0,
      currency: payslips[0]?.currency || 'AED',
      monthlyBreakdown,
    };
  }

  /**
   * Download payslip for a specific month
   */
  static async getPayslipDownloadUrl(
    tenantId: string,
    employeeId: string,
    payslipId: string
  ): Promise<string | null> {
    const payslip = await prisma.payslip.findFirst({
      where: {
        id: payslipId,
        employeeId,
        payrollRun: { tenantId },
      },
    });

    if (!payslip) return null;

    // Return URL to payslip PDF generation endpoint
    return `/api/v1/payroll/pay-stubs/${payslipId}/download`;
  }

  /**
   * Bulk download payslips for a year
   */
  static async getBulkPayslipDownloadUrl(
    tenantId: string,
    employeeId: string,
    year: number
  ): Promise<string> {
    return `/api/v1/payroll/pay-stubs/bulk-download?employeeId=${employeeId}&year=${year}`;
  }

  // --------------------------------------------------------------------------
  // Tax Document Portal
  // --------------------------------------------------------------------------

  /**
   * Get available tax documents for an employee
   */
  static async getTaxDocuments(
    tenantId: string,
    employeeId: string,
    financialYear?: string
  ): Promise<TaxDocument[]> {
    const documents: TaxDocument[] = [];
    const fy = financialYear || `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;

    // Get employee country to determine applicable documents
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, company: { tenantId } },
      include: {
        location: {
          include: { address: { include: { country: true } } },
        },
      },
    });

    if (!employee) return documents;

    const countryCode = (employee as any).location?.address?.country?.isoCode;

    // India documents
    if (countryCode === 'IN') {
      documents.push(
        {
          id: `form16_${fy}`,
          type: 'FORM_16',
          name: 'Form 16 - TDS Certificate',
          nameAr: 'نموذج 16 - شهادة خصم الضريبة',
          financialYear: fy,
          generatedAt: new Date(),
          downloadUrl: `/api/v1/compliance/india/form16/${employeeId}?fy=${fy}`,
        },
        {
          id: `form12ba_${fy}`,
          type: 'FORM_12BA',
          name: 'Form 12BA - Perquisites Statement',
          nameAr: 'نموذج 12BA - بيان المزايا',
          financialYear: fy,
          generatedAt: new Date(),
          downloadUrl: `/api/v1/compliance/india/form12ba/${employeeId}?fy=${fy}`,
        },
        {
          id: `pf_${fy}`,
          type: 'PF_STATEMENT',
          name: 'PF Annual Statement',
          nameAr: 'كشف صندوق التقاعد السنوي',
          financialYear: fy,
          generatedAt: new Date(),
          downloadUrl: `/api/v1/compliance/india/pf-statement/${employeeId}?fy=${fy}`,
        }
      );
    }

    // GCC documents
    if (['AE', 'SA', 'BH', 'QA', 'OM', 'KW'].includes(countryCode)) {
      documents.push({
        id: `salary_cert_${fy}`,
        type: 'SALARY_CERTIFICATE',
        name: 'Salary Certificate',
        nameAr: 'شهادة راتب',
        financialYear: fy,
        generatedAt: new Date(),
        downloadUrl: `/api/v1/employee/${employeeId}/salary-certificate`,
      });

      if (countryCode === 'SA') {
        documents.push({
          id: `gosi_${fy}`,
          type: 'GOSI_STATEMENT',
          name: 'GOSI Contribution Statement',
          nameAr: 'كشف اشتراكات التأمينات ال��جتماعية',
          financialYear: fy,
          generatedAt: new Date(),
          downloadUrl: `/api/v1/compliance/gosi/statement/${employeeId}?fy=${fy}`,
        });
      }
    }

    // Universal documents
    documents.push({
      id: `emp_letter_${fy}`,
      type: 'EMPLOYMENT_LETTER',
      name: 'Employment Letter',
      nameAr: 'خطاب عم��',
      financialYear: fy,
      generatedAt: new Date(),
      downloadUrl: `/api/v1/employee/${employeeId}/employment-letter`,
    });

    return documents;
  }

  // --------------------------------------------------------------------------
  // Benefits Enrollment
  // --------------------------------------------------------------------------

  /**
   * Get employee's current benefit enrollments
   */
  static async getBenefitEnrollments(
    tenantId: string,
    employeeId: string
  ): Promise<BenefitEnrollment[]> {
    const enrollments = await prisma.benefitEnrollment.findMany({
      where: {
        tenantId,
        employeeId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    return enrollments.map((e: any) => ({
      id: e.id,
      planName: e.plan?.name || 'Unknown Plan',
      planNameAr: e.plan?.nameAr || 'خطة غير معروفة',
      category: e.plan?.category || 'OTHER',
      provider: e.plan?.provider || '',
      coverageLevel: e.coverageLevel || 'EMPLOYEE',
      monthlyCost: Number(e.monthlyCost || 0),
      employerContribution: Number(e.employerContribution || 0),
      employeeContribution: Number(e.employeeContribution || 0),
      startDate: e.startDate,
      endDate: e.endDate,
      status: e.status,
      dependents: e.dependents || [],
    }));
  }

  /**
   * Get available benefit plans for enrollment
   */
  static async getAvailableBenefitPlans(
    tenantId: string,
    employeeId: string
  ): Promise<
    Array<{
      id: string;
      name: string;
      nameAr: string;
      category: string;
      provider: string;
      options: Array<{
        coverageLevel: string;
        monthlyCost: number;
        employerContribution: number;
        employeeContribution: number;
      }>;
      enrollmentDeadline?: Date;
    }>
  > {
    const plans = await prisma.benefitPlan.findMany({
      where: {
        tenantId,
        isActive: true,
        enrollmentOpen: true,
      },
    });

    return plans.map((p: any) => ({
      id: p.id,
      name: p.name,
      nameAr: p.nameAr || p.name,
      category: p.category,
      provider: p.provider,
      options: (p.coverageOptions as any[]) || [
        {
          coverageLevel: 'EMPLOYEE',
          monthlyCost: Number(p.monthlyCost || 0),
          employerContribution: Number(p.employerContribution || 0),
          employeeContribution: Number(p.employeeContribution || 0),
        },
      ],
      enrollmentDeadline: p.enrollmentDeadline,
    }));
  }

  /**
   * Enroll in a benefit plan
   */
  static async enrollInBenefit(
    tenantId: string,
    employeeId: string,
    planId: string,
    coverageLevel: string,
    dependents?: Array<{ name: string; relationship: string; dateOfBirth?: Date }>
  ): Promise<{ enrollmentId: string; message: string; messageAr: string }> {
    const plan: any = await prisma.benefitPlan.findFirst({
      where: { id: planId, tenantId, isActive: true },
    });

    if (!plan) throw new Error('Benefit plan not found or not active');

    const enrollment = await prisma.benefitEnrollment.create({
      data: {
        tenantId,
        employeeId,
        planId,
        coverageLevel,
        monthlyCost: plan.monthlyCost || 0,
        employerContribution: plan.employerContribution || 0,
        employeeContribution: plan.employeeContribution || 0,
        startDate: new Date(),
        status: 'PENDING',
        dependents: dependents || [],
      },
    });

    return {
      enrollmentId: enrollment.id,
      message: 'Benefit enrollment submitted successfully. Pending HR approval.',
      messageAr: 'تم تقديم طلب التسجيل في المزايا بنجاح. في انتظار موافقة الموارد البشرية.',
    };
  }

  // --------------------------------------------------------------------------
  // Document Repository
  // --------------------------------------------------------------------------

  /**
   * Get employee's personal documents
   */
  static async getPersonalDocuments(
    tenantId: string,
    employeeId: string,
    category?: string
  ): Promise<PersonalDocument[]> {
    const where: any = {
      employeeId,
      employee: { company: { tenantId } },
      isDeleted: false,
    };
    if (category) where.category = category;

    const docs = await prisma.employeeDocument.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    });

    return docs.map((d: any) => ({
      id: d.id,
      name: d.name || d.fileName,
      nameAr: d.nameAr,
      category: d.category || 'OTHER',
      fileUrl: d.fileUrl,
      fileType: d.fileType || 'application/pdf',
      fileSize: d.fileSize || 0,
      expiryDate: d.expiryDate,
      isVerified: d.isVerified || false,
      uploadedAt: d.uploadedAt || d.createdAt,
    }));
  }

  /**
   * Get documents nearing expiry
   */
  static async getExpiringDocuments(
    tenantId: string,
    employeeId: string,
    daysAhead: number = 30
  ): Promise<PersonalDocument[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysAhead);

    const docs = await prisma.employeeDocument.findMany({
      where: {
        employeeId,
        employee: { company: { tenantId } },
        isDeleted: false,
        expiryDate: {
          lte: thresholdDate,
          gte: new Date(),
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return docs.map((d: any) => ({
      id: d.id,
      name: d.name || d.fileName,
      category: d.category || 'OTHER',
      fileUrl: d.fileUrl,
      fileType: d.fileType || 'application/pdf',
      fileSize: d.fileSize || 0,
      expiryDate: d.expiryDate,
      isVerified: d.isVerified || false,
      uploadedAt: d.uploadedAt || d.createdAt,
    }));
  }

  // --------------------------------------------------------------------------
  // Expense Claims
  // --------------------------------------------------------------------------

  /**
   * Get employee's expense claims
   */
  static async getExpenseClaims(
    tenantId: string,
    employeeId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: ExpenseClaim[]; total: number }> {
    const where: any = { tenantId, employeeId };
    if (status) where.status = status;

    const [total, expenses] = await Promise.all([
      prisma.expenseClaim.count({ where }),
      prisma.expenseClaim.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: expenses.map((e: any) => ({
        id: e.id,
        tenantId: e.tenantId,
        employeeId: e.employeeId,
        title: e.title,
        category: e.category || 'OTHER',
        amount: Number(e.amount),
        currency: e.currency || 'AED',
        date: e.expenseDate || e.createdAt,
        description: e.description || '',
        receipts: (e.receipts as any[]) || [],
        status: e.status,
        approvedBy: e.approvedBy,
        approvedAt: e.approvedAt,
        reimbursedAt: e.reimbursedAt,
        rejectionReason: e.rejectionReason,
      })),
      total,
    };
  }

  /**
   * Submit a new expense claim
   */
  static async submitExpenseClaim(
    tenantId: string,
    employeeId: string,
    data: {
      title: string;
      category: string;
      amount: number;
      currency: string;
      date: Date;
      description: string;
      receipts?: Array<{ fileUrl: string; fileName: string }>;
    }
  ): Promise<{ claimId: string; message: string; messageAr: string }> {
    const claim = await prisma.expenseClaim.create({
      data: {
        tenantId,
        employeeId,
        title: data.title,
        category: data.category,
        amount: data.amount,
        currency: data.currency,
        expenseDate: data.date,
        description: data.description,
        receipts: data.receipts || [],
        status: 'SUBMITTED',
      },
    });

    return {
      claimId: claim.id,
      message: 'Expense claim submitted successfully',
      messageAr: 'تم تقديم مطالبة المصروفات بنجاح',
    };
  }

  // --------------------------------------------------------------------------
  // ESS Profile & Dashboard
  // --------------------------------------------------------------------------

  /**
   * Get ESS profile summary for the employee dashboard
   */
  static async getProfileSummary(tenantId: string, employeeId: string): Promise<ESSProfileSummary> {
    const employee: any = await prisma.employee.findFirst({
      where: { id: employeeId, company: { tenantId } },
      include: {
        department: true,
        designation: true,
        location: true,
      },
    });

    if (!employee) throw new Error('Employee not found');

    const yearsOfService =
      (new Date().getTime() - employee.joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    // Get leave balances
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        tenantId,
        employeeId,
        leaveYear: new Date().getFullYear(),
      },
      include: { policy: { include: { leaveType: true } } },
    });

    // Get pending approvals count
    const pendingApprovals = await prisma.leaveRequest.count({
      where: { tenantId, employeeId, status: 'PENDING' },
    });

    // Get recent payslip
    const recentPayslip = await prisma.payslip.findFirst({
      where: { employeeId, payrollRun: { tenantId } },
      include: { payrollRun: true },
      orderBy: { payrollRun: { payPeriodMonth: 'desc' } },
    });

    return {
      employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      nameAr: employee.firstNameAr
        ? `${employee.firstNameAr} ${employee.lastNameAr || ''}`
        : undefined,
      designation: employee.designation?.name || '',
      department: employee.department?.name || '',
      location: employee.location?.name || '',
      manager: '', // Would join on reporting manager
      joiningDate: employee.joiningDate,
      yearsOfService: Math.round(yearsOfService * 10) / 10,
      leaveBalance: leaveBalances.map((lb: any) => ({
        type: lb.policy?.leaveType?.name || 'Leave',
        typeAr: lb.policy?.leaveType?.nameAr || 'إجازة',
        available: Number(lb.currentBalance),
        used: Number(lb.taken),
        total: Number(lb.accrued) + Number(lb.openingBalance || 0) + Number(lb.carriedForward || 0),
      })),
      pendingApprovals,
      pendingExpenses: 0,
      upcomingEvents: [],
      recentPayslip: recentPayslip
        ? {
            id: recentPayslip.id,
            month: `${(recentPayslip as any).payrollRun.payPeriodYear}-${String((recentPayslip as any).payrollRun.payPeriodMonth).padStart(2, '0')}`,
            monthLabel: `${MONTH_NAMES_EN[((recentPayslip as any).payrollRun.payPeriodMonth || 1) - 1]} ${(recentPayslip as any).payrollRun.payPeriodYear}`,
            monthLabelAr: `${MONTH_NAMES_AR[((recentPayslip as any).payrollRun.payPeriodMonth || 1) - 1]} ${(recentPayslip as any).payrollRun.payPeriodYear}`,
            grossEarnings: Number((recentPayslip as any).grossEarnings || 0),
            totalDeductions: Number((recentPayslip as any).totalDeductions || 0),
            netPay: Number((recentPayslip as any).netPay || 0),
            currency: (recentPayslip as any).currency || 'AED',
            status: 'PAID',
          }
        : undefined,
    };
  }

  // --------------------------------------------------------------------------
  // Manager Self-Service (MSS)
  // --------------------------------------------------------------------------

  /**
   * Get team dashboard for a manager
   */
  static async getTeamDashboard(tenantId: string, managerId: string): Promise<TeamDashboard> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get direct reports
    const teamMembers = await prisma.employee.findMany({
      where: {
        company: { tenantId },
        managerId,
        isDeleted: false,
      },
    });

    const teamIds = teamMembers.map((m) => m.id);

    // Get today's attendance
    const todayAttendance = await prisma.attendance.findMany({
      where: {
        tenantId,
        employeeId: { in: teamIds },
        date: { gte: today, lt: tomorrow },
      },
    });

    const presentIds = new Set(
      todayAttendance
        .filter((a: any) => ['PRESENT', 'LATE', 'EARLY_OUT', 'HALF_DAY'].includes(a.status))
        .map((a: any) => a.employeeId)
    );

    // Get today's leaves
    const todayLeaves = await prisma.leaveRequest.findMany({
      where: {
        tenantId,
        employeeId: { in: teamIds },
        status: 'APPROVED',
        startDate: { lte: tomorrow },
        endDate: { gte: today },
      },
    });
    const onLeaveIds = new Set(todayLeaves.map((l) => l.employeeId));

    // Pending approvals
    const [pendingLeaves, pendingOT, pendingReg] = await Promise.all([
      prisma.leaveRequest.count({
        where: { tenantId, employeeId: { in: teamIds }, status: 'PENDING' },
      }),
      prisma.overtimeRequest.count({
        where: { tenantId, employeeId: { in: teamIds }, status: 'PENDING' },
      }),
      prisma.attendanceRegularization.count({
        where: { tenantId, employeeId: { in: teamIds }, status: 'PENDING' },
      }),
    ]);

    // Upcoming leaves
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingLeaves = await prisma.leaveRequest.findMany({
      where: {
        tenantId,
        employeeId: { in: teamIds },
        status: 'APPROVED',
        startDate: { gte: today, lte: nextWeek },
      },
      include: { employee: true },
    });

    // Birthdays this month
    const currentMonth = today.getMonth() + 1;
    const birthdays = teamMembers.filter(
      (m) => m.dateOfBirth && m.dateOfBirth.getMonth() + 1 === currentMonth
    );

    // Work anniversaries this month
    const anniversaries = teamMembers.filter(
      (m) =>
        m.joiningDate.getMonth() + 1 === currentMonth &&
        m.joiningDate.getFullYear() < today.getFullYear()
    );

    return {
      managerId,
      teamSize: teamMembers.length,
      presentToday: presentIds.size,
      onLeave: onLeaveIds.size,
      absent: teamMembers.length - presentIds.size - onLeaveIds.size,
      pendingApprovals: [
        { type: 'LEAVE' as const, count: pendingLeaves },
        { type: 'OVERTIME' as const, count: pendingOT },
        { type: 'REGULARIZATION' as const, count: pendingReg },
      ].filter((p) => p.count > 0),
      teamLeaveCalendar: upcomingLeaves.map((l: any) => ({
        employeeId: l.employeeId,
        employeeName: `${l.employee.firstName} ${l.employee.lastName}`,
        leaveType: l.leaveType || 'Leave',
        startDate: l.startDate,
        endDate: l.endDate,
      })),
      birthdays: birthdays.map((m) => ({
        employeeId: m.id,
        name: `${m.firstName} ${m.lastName}`,
        date: m.dateOfBirth!,
      })),
      workAnniversaries: anniversaries.map((m) => ({
        employeeId: m.id,
        name: `${m.firstName} ${m.lastName}`,
        date: m.joiningDate,
        years: today.getFullYear() - m.joiningDate.getFullYear(),
      })),
    };
  }
}

export default EmployeeSelfService;
