/**
 * India Statutory Forms Service
 * Phase 4: India Payroll Compliance
 */

import {
  Form16Data,
  Form16PartA,
  Form16PartB,
  Form12BAData,
  Form24QData,
  Form24QSalaryDetail,
  EPFMonthlyReturn,
  EPFContribution,
  ESIMonthlyReturn,
  ESIContribution,
  Form12BBData,
} from './types';

/**
 * Tax slabs for different regimes
 */
const TAX_SLABS_OLD = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250001, max: 500000, rate: 5 },
  { min: 500001, max: 1000000, rate: 20 },
  { min: 1000001, max: Infinity, rate: 30 },
];

const TAX_SLABS_NEW = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300001, max: 600000, rate: 5 },
  { min: 600001, max: 900000, rate: 10 },
  { min: 900001, max: 1200000, rate: 15 },
  { min: 1200001, max: 1500000, rate: 20 },
  { min: 1500001, max: Infinity, rate: 30 },
];

/**
 * India Statutory Forms Service
 */
export class IndiaFormsService {
  // ============================================================================
  // FORM 16 GENERATION
  // ============================================================================

  /**
   * Generate Form 16 for employee
   */
  static async generateForm16(
    tenantId: string,
    employeeId: string,
    financialYear: string
  ): Promise<Form16Data> {
    // In production, fetch employee data and payroll history

    // Calculate assessment year (FY 2023-24 -> AY 2024-25)
    const fyParts = financialYear.split('-');
    const assessmentYear = `${parseInt(fyParts[0]) + 1}-${parseInt(fyParts[1]) + 1}`;

    const partA: Form16PartA = {
      certificateNo: `FORM16/${financialYear}/${employeeId}`,
      lastUpdated: new Date(),
      employer: {
        name: 'Company Name',
        tan: 'DELC12345E',
        pan: 'AAACA1234A',
        address: 'Company Address, City, State - 110001',
      },
      employee: {
        name: 'Employee Name',
        pan: 'ABCDE1234F',
        designation: 'Software Engineer',
      },
      assessmentYear,
      financialYear,
      employmentPeriod: {
        from: new Date(`${fyParts[0]}-04-01`),
        to: new Date(`20${fyParts[1]}-03-31`),
      },
      quarterlyTDS: [
        {
          quarter: 'Q1',
          receiptNo: `Q1/${financialYear}`,
          receiptDate: new Date(),
          taxDeposited: 0,
          bsrCode: '0510101',
          challanNo: 'CHL001',
          challanDate: new Date(),
        },
        {
          quarter: 'Q2',
          receiptNo: `Q2/${financialYear}`,
          receiptDate: new Date(),
          taxDeposited: 0,
          bsrCode: '0510101',
          challanNo: 'CHL002',
          challanDate: new Date(),
        },
        {
          quarter: 'Q3',
          receiptNo: `Q3/${financialYear}`,
          receiptDate: new Date(),
          taxDeposited: 0,
          bsrCode: '0510101',
          challanNo: 'CHL003',
          challanDate: new Date(),
        },
        {
          quarter: 'Q4',
          receiptNo: `Q4/${financialYear}`,
          receiptDate: new Date(),
          taxDeposited: 0,
          bsrCode: '0510101',
          challanNo: 'CHL004',
          challanDate: new Date(),
        },
      ],
      totalTaxDeducted: 0,
      totalTaxDeposited: 0,
    };

    const partB = await this.generateForm16PartB(employeeId, financialYear);

    // Update Part A with actual tax values
    const quarterlyTax = partB.taxComputation.tdsDeducted / 4;
    partA.quarterlyTDS.forEach(q => {
      q.taxDeposited = quarterlyTax;
    });
    partA.totalTaxDeducted = partB.taxComputation.tdsDeducted;
    partA.totalTaxDeposited = partB.taxComputation.tdsDeducted;

    return { partA, partB };
  }

  /**
   * Generate Form 16 Part B
   */
  private static async generateForm16PartB(
    employeeId: string,
    financialYear: string
  ): Promise<Form16PartB> {
    // In production, calculate from actual payroll data

    const grossSalary = {
      basicSalary: 600000,
      hra: 240000,
      transportAllowance: 12000,
      specialAllowance: 200000,
      lta: 30000,
      otherAllowances: 50000,
      bonus: 60000,
      commission: 0,
      arrears: 0,
      total: 1192000,
    };

    const exemptions = {
      hraExemption: Math.min(
        240000, // Actual HRA
        0.5 * 600000, // 50% of basic (metro)
        240000 - 0.1 * 600000 // Rent - 10% of basic
      ),
      ltaExemption: 30000,
      professionalTax: 2400,
      standardDeduction: 50000,
      entertainmentAllowance: 0,
      other: 0,
      total: 0,
    };
    exemptions.total = exemptions.hraExemption + exemptions.ltaExemption +
      exemptions.professionalTax + exemptions.standardDeduction;

    const incomeFromSalary = grossSalary.total - exemptions.total;

    const otherIncome = {
      incomeFromHouseProperty: 0,
      incomeFromOtherSources: 20000,
      total: 20000,
    };

    const grossTotalIncome = incomeFromSalary + otherIncome.total;

    const deductions = {
      section80C: {
        ppf: 100000,
        lifeInsurance: 30000,
        elss: 20000,
        nsc: 0,
        tuitionFees: 0,
        homeLoanPrincipal: 0,
        sukanyaSamriddhi: 0,
        nps80CCD1: 0,
        other: 0,
        total: 150000, // Capped at 1.5L
      },
      section80CCD1B: 50000,
      section80D: {
        selfFamily: 25000,
        parents: 25000,
        preventiveHealth: 5000,
        total: 55000,
      },
      section80E: 0,
      section80G: 0,
      section80TTA: 10000,
      section80TTB: 0,
      section80U: 0,
      section80DD: 0,
      section80DDB: 0,
      section24b: 0,
      totalDeductions: 265000,
    };

    const totalTaxableIncome = Math.max(0, grossTotalIncome - deductions.totalDeductions);

    // Calculate tax
    const taxComputation = this.calculateTax(totalTaxableIncome, 'OLD');

    return {
      grossSalary,
      exemptions,
      incomeFromSalary,
      otherIncome,
      grossTotalIncome,
      deductions,
      totalTaxableIncome,
      taxComputation: {
        ...taxComputation,
        taxRegime: 'OLD',
        reliefUnder89: 0,
        netTaxPayable: taxComputation.totalTaxPayable,
        tdsDeducted: taxComputation.totalTaxPayable,
        refundDue: 0,
        balanceTaxPayable: 0,
      },
      verification: {
        place: 'New Delhi',
        date: new Date(),
        designation: 'HR Manager',
      },
    };
  }

  /**
   * Calculate tax based on regime
   */
  static calculateTax(
    taxableIncome: number,
    regime: 'OLD' | 'NEW'
  ): {
    taxOnIncome: number;
    rebateUnder87A: number;
    taxAfterRebate: number;
    surcharge: number;
    healthEducationCess: number;
    totalTaxPayable: number;
  } {
    const slabs = regime === 'OLD' ? TAX_SLABS_OLD : TAX_SLABS_NEW;
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const slab of slabs) {
      if (remainingIncome <= 0) break;

      const taxableInSlab = Math.min(remainingIncome, slab.max - slab.min + 1);
      tax += (taxableInSlab * slab.rate) / 100;
      remainingIncome -= taxableInSlab;
    }

    // Rebate under 87A
    const rebateThreshold = regime === 'OLD' ? 500000 : 700000;
    const maxRebate = regime === 'OLD' ? 12500 : 25000;
    const rebate = taxableIncome <= rebateThreshold ? Math.min(tax, maxRebate) : 0;

    const taxAfterRebate = Math.max(0, tax - rebate);

    // Surcharge
    let surcharge = 0;
    if (taxableIncome > 10000000) {
      surcharge = taxAfterRebate * 0.15;
    } else if (taxableIncome > 5000000) {
      surcharge = taxAfterRebate * 0.10;
    }

    // Health & Education Cess (4%)
    const cess = (taxAfterRebate + surcharge) * 0.04;

    return {
      taxOnIncome: Math.round(tax),
      rebateUnder87A: Math.round(rebate),
      taxAfterRebate: Math.round(taxAfterRebate),
      surcharge: Math.round(surcharge),
      healthEducationCess: Math.round(cess),
      totalTaxPayable: Math.round(taxAfterRebate + surcharge + cess),
    };
  }

  // ============================================================================
  // FORM 24Q GENERATION
  // ============================================================================

  /**
   * Generate Form 24Q for quarter
   */
  static async generateForm24Q(
    tenantId: string,
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
    financialYear: string
  ): Promise<Form24QData> {
    // In production, fetch from actual payroll data

    const employees: Form24QSalaryDetail[] = [];

    // Summary
    const summary = {
      totalEmployees: employees.length,
      totalSalaryPaid: employees.reduce((sum, e) => sum + e.amountPaid, 0),
      totalTaxDeducted: employees.reduce((sum, e) => sum + e.tdsDeducted, 0),
      totalTaxDeposited: employees.reduce((sum, e) => sum + e.totalTaxDeposited, 0),
      interestOnLateFiling: 0,
      feeOnLateFiling: 0,
      penaltyForShortDeduction: 0,
    };

    return {
      quarter,
      financialYear,
      returnType: 'ORIGINAL',
      deductor: {
        tan: 'DELC12345E',
        pan: 'AAACA1234A',
        name: 'Company Name',
        address: {
          flatNo: '123',
          buildingName: 'Tech Park',
          street: 'MG Road',
          area: 'Sector 5',
          city: 'Gurugram',
          state: 'Haryana',
          pincode: '122001',
        },
        phone: '01234567890',
        email: 'hr@company.com',
        responsiblePerson: {
          name: 'HR Manager',
          designation: 'Manager - HR',
        },
      },
      challans: [],
      salaryDetails: employees,
      summary,
      verification: {
        place: 'Gurugram',
        date: new Date(),
        verifierName: 'HR Manager',
        verifierDesignation: 'Manager - HR',
      },
    };
  }

  // ============================================================================
  // EPF RETURNS
  // ============================================================================

  /**
   * Generate EPF Monthly Return
   */
  static async generateEPFReturn(
    tenantId: string,
    month: string,
    year: number
  ): Promise<EPFMonthlyReturn> {
    // In production, fetch from payroll data

    const contributions: EPFContribution[] = [];

    const summary = {
      totalEmployees: contributions.length,
      totalWages: contributions.reduce((sum, c) => sum + c.grossWages, 0),
      employeeContribution: contributions.reduce((sum, c) => sum + c.employeeContribution, 0),
      employerContribution: contributions.reduce((sum, c) => sum + c.employerContribution, 0),
      employerEPS: contributions.reduce((sum, c) => sum + c.epsContribution, 0),
      employerEPF: 0, // Calculate: employer contrib - EPS
      adminCharges: 0, // 0.5% of EPF wages
      edliCharges: 0, // 0.5% of EPF wages
      totalDeposit: 0,
    };

    summary.employerEPF = summary.employerContribution - summary.employerEPS;
    const totalEpfWages = contributions.reduce((sum, c) => sum + c.epfWages, 0);
    summary.adminCharges = Math.round(totalEpfWages * 0.005);
    summary.edliCharges = Math.round(totalEpfWages * 0.005);
    summary.totalDeposit = summary.employeeContribution + summary.employerContribution +
      summary.adminCharges + summary.edliCharges;

    return {
      establishmentCode: 'DL/XXXXX/XXXXX',
      establishmentName: 'Company Name',
      address: 'Company Address',
      month,
      year,
      contributions,
      summary,
      payment: {
        challanNo: '',
        date: new Date(),
        amount: summary.totalDeposit,
        bank: 'SBI',
        branch: 'Main Branch',
      },
    };
  }

  /**
   * Calculate EPF contribution for employee
   */
  static calculateEPFContribution(
    grossWages: number,
    ncpDays: number = 0
  ): {
    epfWages: number;
    epsWages: number;
    employeeContribution: number;
    employerContribution: number;
    epsContribution: number;
    epfEmployer: number;
  } {
    // EPF wage ceiling is 15000
    const epfWages = Math.min(grossWages, 15000);
    const epsWages = Math.min(grossWages, 15000);

    // Employee contribution: 12% of EPF wages
    const employeeContribution = Math.round(epfWages * 0.12);

    // Employer contribution: 12% of EPF wages
    const totalEmployerContribution = Math.round(epfWages * 0.12);

    // EPS: 8.33% of EPS wages (max 1250 per month)
    const epsContribution = Math.min(Math.round(epsWages * 0.0833), 1250);

    // Employer EPF: Remainder after EPS
    const epfEmployer = totalEmployerContribution - epsContribution;

    return {
      epfWages,
      epsWages,
      employeeContribution,
      employerContribution: totalEmployerContribution,
      epsContribution,
      epfEmployer,
    };
  }

  // ============================================================================
  // ESI RETURNS
  // ============================================================================

  /**
   * Generate ESI Monthly Return
   */
  static async generateESIReturn(
    tenantId: string,
    month: string,
    year: number
  ): Promise<ESIMonthlyReturn> {
    // In production, fetch from payroll data

    const employees: ESIContribution[] = [];

    const summary = {
      totalEmployees: employees.length,
      totalWages: employees.reduce((sum, e) => sum + e.grossWages, 0),
      employeeContribution: employees.reduce((sum, e) => sum + e.employeeContribution, 0),
      employerContribution: employees.reduce((sum, e) => sum + e.employerContribution, 0),
      totalContribution: 0,
    };

    summary.totalContribution = summary.employeeContribution + summary.employerContribution;

    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);

    return {
      employerCode: '12345678901234567',
      employerName: 'Company Name',
      address: 'Company Address',
      month,
      year,
      contributionPeriod: {
        from: startDate,
        to: endDate,
      },
      employees,
      summary,
      payment: {
        challanNo: '',
        date: new Date(),
        amount: summary.totalContribution,
        bank: 'SBI',
      },
    };
  }

  /**
   * Calculate ESI contribution
   */
  static calculateESIContribution(grossWages: number): {
    isEligible: boolean;
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
  } {
    // ESI applicable only if gross wages <= 21000
    const isEligible = grossWages <= 21000;

    if (!isEligible) {
      return {
        isEligible: false,
        employeeContribution: 0,
        employerContribution: 0,
        totalContribution: 0,
      };
    }

    // Employee: 0.75%
    const employeeContribution = Math.round(grossWages * 0.0075);

    // Employer: 3.25%
    const employerContribution = Math.round(grossWages * 0.0325);

    return {
      isEligible: true,
      employeeContribution,
      employerContribution,
      totalContribution: employeeContribution + employerContribution,
    };
  }

  // ============================================================================
  // FORM 12BB - Investment Declaration
  // ============================================================================

  /**
   * Submit investment declaration
   */
  static async submitForm12BB(
    declaration: Omit<Form12BBData, 'status' | 'submittedAt'>
  ): Promise<Form12BBData> {
    const form: Form12BBData = {
      ...declaration,
      status: 'SUBMITTED',
      submittedAt: new Date(),
    };

    // Validate HRA claim
    if (form.hra.claiming && form.hra.totalRentPaid > 100000 && !form.hra.landlordPan) {
      throw new Error('Landlord PAN is required for rent > 1 lakh per year');
    }

    // Validate 80C limit
    if (form.deductions.section80C.total > 150000) {
      form.deductions.section80C.total = 150000;
    }

    // In production, save to database
    return form;
  }

  /**
   * Process investment declaration for tax calculation
   */
  static async processDeclaration(
    declaration: Form12BBData
  ): Promise<{
    totalDeductions: number;
    estimatedTax: number;
    monthlyTDS: number;
  }> {
    let totalDeductions = 0;

    // HRA exemption (calculated separately)
    if (declaration.hra.claiming) {
      totalDeductions += declaration.hra.totalRentPaid;
    }

    // Section 80C
    totalDeductions += Math.min(declaration.deductions.section80C.total, 150000);

    // Section 80CCD(1B)
    totalDeductions += Math.min(declaration.deductions.section80CCD1B.npsContribution, 50000);

    // Section 80D
    totalDeductions += Math.min(declaration.deductions.section80D.total, 100000);

    // Section 80E
    if (declaration.deductions.section80E.claiming) {
      totalDeductions += declaration.deductions.section80E.interestPaid;
    }

    // Section 80G
    totalDeductions += declaration.deductions.section80G.total;

    // Section 24b
    if (declaration.deductions.section24b.claiming) {
      totalDeductions += Math.min(declaration.deductions.section24b.interestPaid, 200000);
    }

    // Estimate tax (simplified)
    // In production, use actual salary and proper calculation
    const estimatedIncome = 1200000 - totalDeductions;
    const taxDetails = this.calculateTax(estimatedIncome, declaration.taxRegime);

    return {
      totalDeductions,
      estimatedTax: taxDetails.totalTaxPayable,
      monthlyTDS: Math.round(taxDetails.totalTaxPayable / 12),
    };
  }
}
