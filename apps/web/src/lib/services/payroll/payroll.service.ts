/**
 * Payroll Processing Service
 * Phase 2: Core Enhancement - Multi-Country Payroll Engine
 */

import {
  PayrollRun,
  PayrollRunInput,
  Payslip,
  PayslipLine,
  StatutoryLine,
  PayrollStatus,
  PayslipStatus,
  PayrollSummary,
  PayrollValidationResult,
  PayrollValidationError,
  PayrollValidationWarning,
  EmployeeSalaryStructure,
  SalaryComponent,
  TaxDetails,
  TaxRegime,
  INDIA_TAX_SLABS_OLD,
  INDIA_TAX_SLABS_NEW,
  INDIA_STANDARD_DEDUCTION_OLD,
  INDIA_STANDARD_DEDUCTION_NEW,
  INDIA_REBATE_87A_LIMIT_OLD,
  INDIA_REBATE_87A_LIMIT_NEW,
  INDIA_REBATE_87A_AMOUNT,
  INDIA_SURCHARGE_SLABS,
  INDIA_CESS_RATE,
  INDIA_PF_RATES,
  INDIA_ESI_RATES,
  COUNTRY_CURRENCIES,
} from './types';
import { SupportedCountryCode } from '../compliance/types';
import { GOSIService } from '../compliance/gosi.service';
import { LabourLawService } from '../compliance/labour-law.service';

// ============================================================================
// PAYROLL SERVICE
// ============================================================================

export class PayrollService {
  /**
   * Process a payroll run for a company
   */
  static async processPayroll(input: PayrollRunInput): Promise<PayrollRun> {
    const { tenantId, companyId, month, countryCode, employeeIds } = input;
    const currency = COUNTRY_CURRENCIES[countryCode];

    // Get employees to process
    const employees = await this.getEmployeesToProcess(tenantId, companyId, employeeIds);

    // Validate before processing
    const validation = await this.validatePayroll(employees, countryCode, month);
    if (!validation.isValid && validation.errors.length > 0) {
      throw new Error(`Payroll validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Calculate payslips for each employee
    const payslips: Payslip[] = [];
    for (const employee of employees) {
      const payslip = await this.calculatePayslip(employee, countryCode, month, currency);
      payslips.push(payslip);
    }

    // Calculate summary
    const summary = this.calculateSummary(payslips, countryCode);

    // Create payroll run
    const payrollRun: PayrollRun = {
      id: this.generateId(),
      tenantId,
      companyId,
      month,
      countryCode,
      currency,
      exchangeRate: 1,
      status: 'CALCULATED',
      totalEmployees: payslips.length,
      totalGross: payslips.reduce((sum, p) => sum + p.grossSalary, 0),
      totalDeductions: payslips.reduce((sum, p) => sum + p.totalDeductions, 0),
      totalNet: payslips.reduce((sum, p) => sum + p.netSalary, 0),
      totalStatutory: payslips.reduce((sum, p) => sum + p.totalStatutory, 0),
      totalTax: payslips.reduce((sum, p) => sum + (p.taxDetails?.monthlyTds || 0), 0),
      createdAt: new Date(),
      createdBy: 'system',
      processedAt: new Date(),
      payslips,
      summary,
    };

    return payrollRun;
  }

  /**
   * Calculate payslip for an employee
   */
  static async calculatePayslip(
    employee: EmployeeData,
    countryCode: SupportedCountryCode,
    month: string,
    currency: string
  ): Promise<Payslip> {
    const salaryStructure = employee.salaryStructure;

    // Get working days
    const workingDays = this.calculateWorkingDays(month, countryCode, employee);

    // Calculate earnings
    const earnings = this.calculateEarnings(salaryStructure, workingDays);
    const totalEarnings = earnings.reduce((sum, e) => sum + e.calculatedAmount, 0);

    // Calculate statutory deductions based on country
    const statutoryDeductions = this.calculateStatutoryDeductions(
      countryCode,
      employee,
      salaryStructure.basicSalary,
      totalEarnings
    );
    const totalStatutory = statutoryDeductions.reduce((sum, s) => sum + s.employeeAmount, 0);

    // Calculate tax (India only)
    let taxDetails: TaxDetails | undefined;
    if (countryCode === 'IN') {
      taxDetails = this.calculateIndiaTax(employee, totalEarnings, month);
    }

    // Calculate other deductions
    const deductions = this.calculateDeductions(salaryStructure, employee);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.calculatedAmount, 0);

    // Calculate net salary
    const grossSalary = totalEarnings;
    const netSalary = grossSalary - totalStatutory - totalDeductions - (taxDetails?.monthlyTds || 0);

    const payslip: Payslip = {
      id: this.generateId(),
      payrollRunId: '',
      employeeId: employee.id,
      employeeName: employee.name,
      employeeNameAr: employee.nameAr,
      employeeCode: employee.code,
      department: employee.department,
      designation: employee.designation,
      month,
      countryCode,
      currency,

      totalWorkingDays: workingDays.total,
      daysWorked: workingDays.worked,
      paidLeaveDays: workingDays.paidLeave,
      unpaidLeaveDays: workingDays.unpaidLeave,
      lopDays: workingDays.lop,

      basicSalary: salaryStructure.basicSalary,
      earnings,
      totalEarnings,

      deductions,
      totalDeductions,

      statutoryDeductions,
      totalStatutory,

      taxDetails,

      grossSalary,
      netSalary,

      ytdGross: 0, // Calculate from historical data
      ytdDeductions: 0,
      ytdTax: 0,
      ytdNet: 0,

      bankName: employee.bankName,
      bankAccountNumber: employee.bankAccountNumber,
      bankIBAN: employee.bankIBAN,

      status: 'CALCULATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return payslip;
  }

  /**
   * Calculate working days for the month
   */
  private static calculateWorkingDays(
    month: string,
    countryCode: SupportedCountryCode,
    employee: EmployeeData
  ): WorkingDays {
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    // Get weekend days from labour law
    const labourLaw = LabourLawService.getConfig(countryCode);
    const weekendDays = labourLaw.weekendDays;

    // Count working days
    let totalWorkingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthNum - 1, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (!weekendDays.includes(dayName)) {
        totalWorkingDays++;
      }
    }

    // Subtract holidays (would come from holiday calendar)
    const holidays = employee.holidays || 0;
    totalWorkingDays -= holidays;

    // Get leave data
    const paidLeave = employee.paidLeaveDays || 0;
    const unpaidLeave = employee.unpaidLeaveDays || 0;
    const lop = employee.lopDays || 0;

    const worked = totalWorkingDays - paidLeave - unpaidLeave - lop;

    return {
      total: totalWorkingDays,
      worked: Math.max(0, worked),
      paidLeave,
      unpaidLeave,
      lop,
    };
  }

  /**
   * Calculate earnings from salary structure
   */
  private static calculateEarnings(
    salaryStructure: EmployeeSalaryStructure,
    workingDays: WorkingDays
  ): PayslipLine[] {
    const earnings: PayslipLine[] = [];

    // Basic Salary (pro-rated if LOP)
    const proRataFactor = (workingDays.worked + workingDays.paidLeave) / workingDays.total;
    const proratedBasic = salaryStructure.basicSalary * proRataFactor;

    earnings.push({
      componentCode: 'BASIC',
      componentName: 'Basic Salary',
      componentNameAr: 'الراتب الأساسي',
      type: 'EARNING',
      category: 'BASIC',
      calculatedAmount: Math.round(proratedBasic * 100) / 100,
      daysOrUnits: workingDays.worked + workingDays.paidLeave,
      rate: salaryStructure.basicSalary / workingDays.total,
      isTaxable: true,
    });

    // Other earnings from salary structure
    for (const component of salaryStructure.components) {
      if (component.type === 'EARNING') {
        let amount = component.value;

        // Pro-rate if applicable
        if (component.calculationType === 'FIXED') {
          amount = component.value * proRataFactor;
        } else if (component.calculationType === 'PERCENTAGE') {
          amount = (proratedBasic * (component.percentage || 0)) / 100;
        }

        earnings.push({
          componentCode: component.componentCode,
          componentName: component.nameEn,
          componentNameAr: component.nameAr,
          type: 'EARNING',
          category: component.category,
          calculatedAmount: Math.round(amount * 100) / 100,
          isTaxable: component.isTaxable,
        });
      }
    }

    return earnings;
  }

  /**
   * Calculate deductions from salary structure
   */
  private static calculateDeductions(
    salaryStructure: EmployeeSalaryStructure,
    employee: EmployeeData
  ): PayslipLine[] {
    const deductions: PayslipLine[] = [];

    for (const component of salaryStructure.components) {
      if (component.type === 'DEDUCTION' && !this.isStatutoryComponent(component.componentCode)) {
        let amount = component.value;

        if (component.calculationType === 'PERCENTAGE') {
          amount = (salaryStructure.basicSalary * (component.percentage || 0)) / 100;
        }

        deductions.push({
          componentCode: component.componentCode,
          componentName: component.nameEn,
          componentNameAr: component.nameAr,
          type: 'DEDUCTION',
          category: component.category,
          calculatedAmount: Math.round(amount * 100) / 100,
          isTaxable: false,
        });
      }
    }

    // Add loan recovery if any
    if (employee.loanRecovery && employee.loanRecovery > 0) {
      deductions.push({
        componentCode: 'LOAN_RECOVERY',
        componentName: 'Loan Recovery',
        componentNameAr: 'استرداد القرض',
        type: 'DEDUCTION',
        category: 'LOAN_RECOVERY',
        calculatedAmount: employee.loanRecovery,
        isTaxable: false,
      });
    }

    return deductions;
  }

  /**
   * Calculate statutory deductions based on country
   */
  private static calculateStatutoryDeductions(
    countryCode: SupportedCountryCode,
    employee: EmployeeData,
    basicSalary: number,
    grossSalary: number
  ): StatutoryLine[] {
    const deductions: StatutoryLine[] = [];

    switch (countryCode) {
      case 'SA':
        // GOSI Contributions
        const gosiResult = GOSIService.calculateContributions(
          basicSalary,
          employee.housingAllowance || basicSalary * 0.25,
          employee.isSaudi || false
        );

        if (gosiResult.employeeContribution > 0) {
          deductions.push({
            code: 'GOSI_PENSION',
            name: 'GOSI - Pension',
            nameAr: 'التأمينات - المعاش',
            employeeAmount: gosiResult.breakdown.annuity.employee,
            employerAmount: gosiResult.breakdown.annuity.employer,
            totalAmount: gosiResult.breakdown.annuity.employee + gosiResult.breakdown.annuity.employer,
            basis: gosiResult.contributableSalary,
            rate: employee.isSaudi ? 9 : 0,
          });

          if (employee.isSaudi) {
            deductions.push({
              code: 'GOSI_SANED',
              name: 'GOSI - SANED',
              nameAr: 'التأمينات - ساند',
              employeeAmount: gosiResult.breakdown.saned.employee,
              employerAmount: gosiResult.breakdown.saned.employer,
              totalAmount: gosiResult.breakdown.saned.employee + gosiResult.breakdown.saned.employer,
              basis: gosiResult.contributableSalary,
              rate: 0.75,
            });
          }
        }

        deductions.push({
          code: 'GOSI_OCC_HAZARDS',
          name: 'GOSI - Occupational Hazards',
          nameAr: 'التأمينات - الأخطار المهنية',
          employeeAmount: 0,
          employerAmount: gosiResult.breakdown.occupationalHazards.employer,
          totalAmount: gosiResult.breakdown.occupationalHazards.employer,
          basis: gosiResult.contributableSalary,
          rate: 2,
        });
        break;

      case 'IN':
        // PF Calculation
        const pfBasis = Math.min(basicSalary, INDIA_PF_RATES.wageLimit);
        const pfEmployee = (pfBasis * INDIA_PF_RATES.employeeRate) / 100;
        const pfEmployerPf = (pfBasis * INDIA_PF_RATES.employerPfRate) / 100;
        const pfEmployerPension = (Math.min(basicSalary, INDIA_PF_RATES.pensionCeiling) * INDIA_PF_RATES.employerPensionRate) / 100;

        deductions.push({
          code: 'PF_EMPLOYEE',
          name: 'Provident Fund (Employee)',
          nameAr: 'صندوق الادخار (الموظف)',
          employeeAmount: Math.round(pfEmployee),
          employerAmount: Math.round(pfEmployerPf + pfEmployerPension),
          totalAmount: Math.round(pfEmployee + pfEmployerPf + pfEmployerPension),
          basis: pfBasis,
          rate: INDIA_PF_RATES.employeeRate,
        });

        // ESI Calculation (if applicable)
        if (grossSalary <= INDIA_ESI_RATES.wageLimit) {
          const esiEmployee = (grossSalary * INDIA_ESI_RATES.employeeRate) / 100;
          const esiEmployer = (grossSalary * INDIA_ESI_RATES.employerRate) / 100;

          deductions.push({
            code: 'ESI',
            name: 'Employee State Insurance',
            nameAr: 'التأمين الصحي الحكومي',
            employeeAmount: Math.round(esiEmployee),
            employerAmount: Math.round(esiEmployer),
            totalAmount: Math.round(esiEmployee + esiEmployer),
            basis: grossSalary,
            rate: INDIA_ESI_RATES.employeeRate,
          });
        }

        // Professional Tax (state-specific, using Maharashtra rates)
        const ptAmount = this.calculateProfessionalTax(grossSalary);
        if (ptAmount > 0) {
          deductions.push({
            code: 'PT',
            name: 'Professional Tax',
            nameAr: 'الضريبة المهنية',
            employeeAmount: ptAmount,
            employerAmount: 0,
            totalAmount: ptAmount,
            basis: grossSalary,
            rate: 0,
          });
        }
        break;

      case 'BH':
        // Bahrain SIO
        const sioEmployee = (grossSalary * 7) / 100;
        const sioEmployer = (grossSalary * 12) / 100;

        deductions.push({
          code: 'SIO',
          name: 'Social Insurance',
          nameAr: 'التأمين الاجتماعي',
          employeeAmount: Math.round(sioEmployee),
          employerAmount: Math.round(sioEmployer),
          totalAmount: Math.round(sioEmployee + sioEmployer),
          basis: grossSalary,
          rate: 7,
        });
        break;

      case 'OM':
        // Oman PASI (for Omanis only)
        if (employee.isLocalNational) {
          const pasiEmployee = (grossSalary * 7) / 100;
          const pasiEmployer = (grossSalary * 11.5) / 100;

          deductions.push({
            code: 'PASI',
            name: 'Public Authority for Social Insurance',
            nameAr: 'الهيئة العامة للتأمينات الاجتماعية',
            employeeAmount: Math.round(pasiEmployee),
            employerAmount: Math.round(pasiEmployer),
            totalAmount: Math.round(pasiEmployee + pasiEmployer),
            basis: grossSalary,
            rate: 7,
          });
        }
        break;

      case 'KW':
        // Kuwait PIFSS (for Kuwaitis only)
        if (employee.isLocalNational) {
          const pifssEmployee = (grossSalary * 8) / 100;
          const pifssEmployer = (grossSalary * 11.5) / 100;

          deductions.push({
            code: 'PIFSS',
            name: 'Public Institution for Social Security',
            nameAr: 'المؤسسة العامة للتأمينات الاجتماعية',
            employeeAmount: Math.round(pifssEmployee),
            employerAmount: Math.round(pifssEmployer),
            totalAmount: Math.round(pifssEmployee + pifssEmployer),
            basis: grossSalary,
            rate: 8,
          });
        }
        break;

      // UAE - No statutory deductions (but WPS applies for bank transfer)
      case 'AE':
      case 'QA':
        // No statutory employee deductions
        break;
    }

    return deductions;
  }

  /**
   * Calculate India TDS (Tax Deducted at Source)
   */
  private static calculateIndiaTax(
    employee: EmployeeData,
    monthlyGross: number,
    month: string
  ): TaxDetails {
    const regime: TaxRegime = employee.taxRegime || 'NEW';
    const annualGross = monthlyGross * 12;

    // Standard Deduction
    const standardDeduction = regime === 'NEW'
      ? INDIA_STANDARD_DEDUCTION_NEW
      : INDIA_STANDARD_DEDUCTION_OLD;

    // Get exemptions (80C, 80D, HRA, etc.) - only for Old Regime
    const exemptions = regime === 'OLD'
      ? this.getEmployeeExemptions(employee)
      : [];

    const totalExemptions = exemptions.reduce((sum, e) => sum + e.approvedAmount, 0);

    // Calculate taxable income
    const taxableIncome = Math.max(0, annualGross - standardDeduction - totalExemptions);

    // Get tax slabs based on regime
    const slabs = regime === 'NEW' ? INDIA_TAX_SLABS_NEW : INDIA_TAX_SLABS_OLD;

    // Calculate tax per slab
    let grossTax = 0;
    let remainingIncome = taxableIncome;
    const taxSlabs = slabs.map(slab => {
      const slabRange = slab.toAmount === Infinity
        ? remainingIncome
        : Math.min(remainingIncome, slab.toAmount - slab.fromAmount);

      const slabTax = slabRange > 0 ? (slabRange * slab.rate) / 100 : 0;
      remainingIncome = Math.max(0, remainingIncome - slabRange);

      return {
        ...slab,
        taxAmount: Math.round(slabTax),
      };
    });

    grossTax = taxSlabs.reduce((sum, s) => sum + s.taxAmount, 0);

    // Section 87A Rebate
    const rebateLimit = regime === 'NEW'
      ? INDIA_REBATE_87A_LIMIT_NEW
      : INDIA_REBATE_87A_LIMIT_OLD;
    const rebate87A = taxableIncome <= rebateLimit
      ? Math.min(grossTax, INDIA_REBATE_87A_AMOUNT)
      : 0;

    // Surcharge (for high income)
    let surcharge = 0;
    const taxAfterRebate = grossTax - rebate87A;
    for (const slab of INDIA_SURCHARGE_SLABS) {
      if (taxableIncome >= slab.fromAmount) {
        surcharge = (taxAfterRebate * slab.rate) / 100;
      }
    }

    // Health & Education Cess
    const healthEducationCess = ((taxAfterRebate + surcharge) * INDIA_CESS_RATE) / 100;

    // Total Tax
    const totalTax = Math.round(taxAfterRebate + surcharge + healthEducationCess);

    // Monthly TDS
    const [year, monthNum] = month.split('-').map(Number);
    const remainingMonths = 12 - monthNum + 1; // Months left in FY
    const ytdTds = employee.ytdTds || 0;
    const remainingTax = Math.max(0, totalTax - ytdTds);
    const monthlyTds = Math.round(remainingTax / remainingMonths);

    return {
      regime,
      annualGross,
      exemptions,
      totalExemptions,
      taxableIncome,
      taxSlabs,
      grossTax,
      rebate87A,
      surcharge: Math.round(surcharge),
      healthEducationCess: Math.round(healthEducationCess),
      totalTax,
      monthlyTds,
      ytdTds,
      remainingTds: remainingTax - monthlyTds,
    };
  }

  /**
   * Get employee tax exemptions (80C, 80D, HRA, etc.)
   */
  private static getEmployeeExemptions(employee: EmployeeData): TaxExemption[] {
    const exemptions: TaxExemption[] = [];

    // Section 80C (max 1.5L)
    if (employee.section80C) {
      exemptions.push({
        section: '80C',
        description: 'Life Insurance, PPF, ELSS, etc.',
        declaredAmount: employee.section80C,
        approvedAmount: Math.min(employee.section80C, 150000),
        maxLimit: 150000,
      });
    }

    // Section 80D (Health Insurance - max 25K self, 50K parents)
    if (employee.section80D) {
      exemptions.push({
        section: '80D',
        description: 'Health Insurance Premium',
        declaredAmount: employee.section80D,
        approvedAmount: Math.min(employee.section80D, 75000),
        maxLimit: 75000,
      });
    }

    // HRA Exemption
    if (employee.hraReceived && employee.rentPaid) {
      const hraExemption = this.calculateHRAExemption(
        employee.basicSalary * 12,
        employee.hraReceived,
        employee.rentPaid,
        employee.isMetroCity || false
      );
      exemptions.push({
        section: 'HRA',
        description: 'House Rent Allowance',
        declaredAmount: employee.hraReceived,
        approvedAmount: hraExemption,
        maxLimit: employee.hraReceived,
      });
    }

    return exemptions;
  }

  /**
   * Calculate HRA exemption for India
   */
  private static calculateHRAExemption(
    annualBasic: number,
    hraReceived: number,
    rentPaid: number,
    isMetroCity: boolean
  ): number {
    // HRA exemption is minimum of:
    // 1. Actual HRA received
    // 2. 50% (metro) or 40% (non-metro) of basic
    // 3. Rent paid - 10% of basic

    const percentageOfBasic = isMetroCity ? 0.5 : 0.4;
    const option1 = hraReceived;
    const option2 = annualBasic * percentageOfBasic;
    const option3 = Math.max(0, rentPaid - annualBasic * 0.1);

    return Math.round(Math.min(option1, option2, option3));
  }

  /**
   * Calculate Professional Tax (Maharashtra rates)
   */
  private static calculateProfessionalTax(grossSalary: number): number {
    if (grossSalary <= 7500) return 0;
    if (grossSalary <= 10000) return 175;
    return 200;
  }

  /**
   * Check if component is statutory
   */
  private static isStatutoryComponent(code: string): boolean {
    const statutoryCodes = [
      'PF', 'ESI', 'PT', 'TDS', 'GOSI', 'SANED', 'SIO', 'PASI', 'PIFSS',
    ];
    return statutoryCodes.some(s => code.toUpperCase().includes(s));
  }

  /**
   * Calculate payroll summary
   */
  private static calculateSummary(payslips: Payslip[], countryCode: SupportedCountryCode): PayrollSummary {
    // By Department
    const deptMap = new Map<string, { count: number; gross: number; net: number }>();
    payslips.forEach(p => {
      const existing = deptMap.get(p.department) || { count: 0, gross: 0, net: 0 };
      deptMap.set(p.department, {
        count: existing.count + 1,
        gross: existing.gross + p.grossSalary,
        net: existing.net + p.netSalary,
      });
    });

    const byDepartment = Array.from(deptMap.entries()).map(([dept, data]) => ({
      departmentId: dept,
      departmentName: dept,
      employeeCount: data.count,
      totalGross: data.gross,
      totalNet: data.net,
    }));

    // By Component
    const compMap = new Map<string, { name: string; type: 'EARNING' | 'DEDUCTION'; amount: number; count: number }>();
    payslips.forEach(p => {
      [...p.earnings, ...p.deductions].forEach(line => {
        const existing = compMap.get(line.componentCode) || { name: line.componentName, type: line.type, amount: 0, count: 0 };
        compMap.set(line.componentCode, {
          name: line.componentName,
          type: line.type,
          amount: existing.amount + line.calculatedAmount,
          count: existing.count + 1,
        });
      });
    });

    const byPayComponent = Array.from(compMap.entries()).map(([code, data]) => ({
      componentCode: code,
      componentName: data.name,
      type: data.type,
      totalAmount: data.amount,
      employeeCount: data.count,
    }));

    // Statutory Breakdown
    const statutoryBreakdown = this.calculateStatutoryBreakdown(payslips, countryCode);

    return {
      byDepartment,
      byPayComponent,
      byCategory: [],
      statutoryBreakdown,
    };
  }

  /**
   * Calculate statutory breakdown for summary
   */
  private static calculateStatutoryBreakdown(
    payslips: Payslip[],
    countryCode: SupportedCountryCode
  ): PayrollSummary['statutoryBreakdown'] {
    const breakdown: PayrollSummary['statutoryBreakdown'] = {};

    payslips.forEach(p => {
      p.statutoryDeductions.forEach(stat => {
        switch (stat.code) {
          case 'GOSI_PENSION':
          case 'GOSI_SANED':
            breakdown.gosiEmployeeTotal = (breakdown.gosiEmployeeTotal || 0) + stat.employeeAmount;
            breakdown.gosiEmployerTotal = (breakdown.gosiEmployerTotal || 0) + stat.employerAmount;
            break;
          case 'PF_EMPLOYEE':
            breakdown.pfEmployeeTotal = (breakdown.pfEmployeeTotal || 0) + stat.employeeAmount;
            breakdown.pfEmployerTotal = (breakdown.pfEmployerTotal || 0) + stat.employerAmount;
            break;
          case 'ESI':
            breakdown.esiEmployeeTotal = (breakdown.esiEmployeeTotal || 0) + stat.employeeAmount;
            breakdown.esiEmployerTotal = (breakdown.esiEmployerTotal || 0) + stat.employerAmount;
            break;
          case 'PT':
            breakdown.professionalTaxTotal = (breakdown.professionalTaxTotal || 0) + stat.employeeAmount;
            break;
        }
      });

      if (p.taxDetails) {
        breakdown.tdsTotal = (breakdown.tdsTotal || 0) + p.taxDetails.monthlyTds;
      }
    });

    return breakdown;
  }

  /**
   * Validate payroll before processing
   */
  static async validatePayroll(
    employees: EmployeeData[],
    countryCode: SupportedCountryCode,
    month: string
  ): Promise<PayrollValidationResult> {
    const errors: PayrollValidationError[] = [];
    const warnings: PayrollValidationWarning[] = [];

    for (const employee of employees) {
      // Check salary structure
      if (!employee.salaryStructure || employee.salaryStructure.basicSalary <= 0) {
        errors.push({
          employeeId: employee.id,
          employeeName: employee.name,
          field: 'salaryStructure',
          code: 'MISSING_SALARY',
          message: 'Salary structure not defined',
          messageAr: 'هيكل الراتب غير محدد',
        });
      }

      // Check bank details
      if (!employee.bankAccountNumber) {
        warnings.push({
          employeeId: employee.id,
          employeeName: employee.name,
          field: 'bankAccountNumber',
          code: 'MISSING_BANK',
          message: 'Bank account not configured',
          messageAr: 'الحساب البنكي غير مهيأ',
        });
      }

      // Country-specific validations
      if (countryCode === 'SA') {
        if (employee.isSaudi && !employee.nationalId) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.name,
            field: 'nationalId',
            code: 'MISSING_NATIONAL_ID',
            message: 'National ID required for Saudi employees',
            messageAr: 'رقم الهوية الوطنية مطلوب للموظفين السعوديين',
          });
        }
        if (!employee.isSaudi && !employee.iqamaNumber) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.name,
            field: 'iqamaNumber',
            code: 'MISSING_IQAMA',
            message: 'Iqama number required for non-Saudi employees',
            messageAr: 'رقم الإقامة مطلوب للموظفين غير السعوديين',
          });
        }
      }

      if (countryCode === 'AE' && !employee.labourCardNumber) {
        warnings.push({
          employeeId: employee.id,
          employeeName: employee.name,
          field: 'labourCardNumber',
          code: 'MISSING_LABOUR_CARD',
          message: 'Labour card number not configured for WPS',
          messageAr: 'رقم بطاقة العمل غير مهيأ لنظام حماية الأجور',
        });
      }

      if (countryCode === 'IN') {
        if (!employee.panNumber) {
          warnings.push({
            employeeId: employee.id,
            employeeName: employee.name,
            field: 'panNumber',
            code: 'MISSING_PAN',
            message: 'PAN not configured for TDS',
            messageAr: 'رقم PAN غير مهيأ للضريبة',
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Helper methods
  private static generateId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private static async getEmployeesToProcess(
    tenantId: string,
    companyId: string,
    employeeIds?: string[]
  ): Promise<EmployeeData[]> {
    // This would fetch from database
    // For now, return empty array - will be connected to actual employee data
    return [];
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

interface EmployeeData {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  department: string;
  designation: string;
  salaryStructure: EmployeeSalaryStructure;
  countryCode: SupportedCountryCode;
  joiningDate: Date;

  // Banking
  bankName?: string;
  bankAccountNumber?: string;
  bankIBAN?: string;

  // Leave/Attendance
  paidLeaveDays?: number;
  unpaidLeaveDays?: number;
  lopDays?: number;
  holidays?: number;

  // Compliance
  isSaudi?: boolean;
  isLocalNational?: boolean;
  nationalId?: string;
  iqamaNumber?: string;
  labourCardNumber?: string;
  panNumber?: string;

  // Housing
  housingAllowance?: number;

  // Loans
  loanRecovery?: number;

  // Tax (India)
  taxRegime?: TaxRegime;
  section80C?: number;
  section80D?: number;
  hraReceived?: number;
  rentPaid?: number;
  isMetroCity?: boolean;
  ytdTds?: number;
}

interface WorkingDays {
  total: number;
  worked: number;
  paidLeave: number;
  unpaidLeave: number;
  lop: number;
}

export default PayrollService;
