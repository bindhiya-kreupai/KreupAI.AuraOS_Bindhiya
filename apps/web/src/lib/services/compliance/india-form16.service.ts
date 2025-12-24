/**
 * India Form 16 Generator Service
 * Generates Form 16 (Part A & Part B) as per Income Tax Act, 1961
 *
 * Form 16 is the annual Tax Deducted at Source (TDS) certificate
 * issued by employers to employees for salary income
 *
 * Key Features:
 * - Form 16 Part A: TDS certificate with quarterly breakup
 * - Form 16 Part B: Detailed salary and deductions statement
 * - Annexure: Computation of income and tax
 * - PDF generation support
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Form16EmployerDetails {
  name: string;
  tan: string;                        // Tax Deduction Account Number
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email?: string;
  phone?: string;
}

export interface Form16EmployeeDetails {
  name: string;
  pan: string;
  employeeId: string;
  designation?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dateOfJoining: Date;
  dateOfLeaving?: Date;              // If applicable
}

export interface Form16QuarterlyTDS {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  periodFrom: Date;
  periodTo: Date;
  receiptDate: Date;                 // Date of tax deposit
  bsrCode: string;                   // Bank branch code
  challanSerialNo: string;
  dateOfChallan: Date;
  taxDeducted: number;
  taxDeposited: number;
  acknowledgementNumber?: string;     // 26AS acknowledgement
}

export interface Form16SalaryDetails {
  grossSalary: number;
  salaryAsPerSection17_1: number;
  valueOfPerquisites17_2: number;
  profitsInLieuOfSalary17_3: number;

  // Allowances exempt under Section 10
  exemptAllowances: {
    hra: number;                      // House Rent Allowance
    lta: number;                      // Leave Travel Allowance
    standardDeduction: number;        // Rs 50,000 under section 16
    professionalTax: number;          // Entertainment allowance & PT
    otherExemptions: number;
  };

  // Deductions under Chapter VI-A
  deductions: {
    section80C: number;               // Max 1,50,000
    section80CCC: number;             // Pension contribution
    section80CCD_1: number;           // NPS employee contribution
    section80CCD_1B: number;          // Additional NPS - Max 50,000
    section80CCD_2: number;           // NPS employer contribution
    section80D: number;               // Medical insurance
    section80DD: number;              // Disabled dependent
    section80DDB: number;             // Medical treatment
    section80E: number;               // Education loan interest
    section80EE: number;              // Home loan interest (first-time)
    section80EEA: number;             // Home loan interest (affordable housing)
    section80EEB: number;             // Electric vehicle loan interest
    section80G: number;               // Donations
    section80GG: number;              // Rent paid
    section80GGA: number;             // Scientific research donations
    section80GGC: number;             // Political party donations
    section80TTA: number;             // Savings account interest
    section80TTB: number;             // Senior citizen interest
    section80U: number;               // Disability
  };

  // Home loan interest under Section 24
  interestOnHousingLoan: number;

  // Income from other sources
  incomeFromOtherSources: number;
}

export interface Form16TaxComputation {
  grossTotalIncome: number;
  totalDeductions: number;
  totalTaxableIncome: number;
  taxOnTotalIncome: number;
  surcharge: number;
  healthAndEducationCess: number;
  totalTaxPayable: number;
  reliefUnderSection89: number;       // If applicable
  netTaxPayable: number;
  totalTaxDeducted: number;
  balanceTax: number;                 // Refund if negative
  taxRegime: 'OLD' | 'NEW';
}

export interface Form16PartA {
  certificateNo: string;
  lastUpdated: Date;
  financialYear: string;              // e.g., "2024-25"
  assessmentYear: string;             // e.g., "2025-26"

  employer: Form16EmployerDetails;
  employee: Form16EmployeeDetails;

  periodOfEmployment: {
    from: Date;
    to: Date;
  };

  quarterlyTDS: Form16QuarterlyTDS[];

  // Summary
  totalTaxDeducted: number;
  totalTaxDeposited: number;
  verificationDate: Date;
}

export interface Form16PartB {
  financialYear: string;
  assessmentYear: string;

  employer: Form16EmployerDetails;
  employee: Form16EmployeeDetails;

  salaryDetails: Form16SalaryDetails;
  taxComputation: Form16TaxComputation;

  // Verification
  place: string;
  date: Date;
  signatory: {
    name: string;
    designation: string;
    fatherName?: string;
  };
}

export interface Form16Complete {
  partA: Form16PartA;
  partB: Form16PartB;
  generatedAt: Date;
  generatedBy: string;
}

// ============================================================================
// FORM 16 SERVICE
// ============================================================================

export class Form16Service {
  /**
   * Generate complete Form 16 (Part A and Part B)
   */
  static generate(
    employer: Form16EmployerDetails,
    employee: Form16EmployeeDetails,
    salaryDetails: Form16SalaryDetails,
    quarterlyTDS: Form16QuarterlyTDS[],
    financialYear: string,
    taxRegime: 'OLD' | 'NEW',
    generatedBy: string,
    verificationPlace: string = 'India'
  ): Form16Complete {
    const assessmentYear = this.getAssessmentYear(financialYear);
    const taxComputation = this.computeTax(salaryDetails, taxRegime);

    const partA = this.generatePartA(
      employer,
      employee,
      quarterlyTDS,
      financialYear,
      assessmentYear
    );

    const partB = this.generatePartB(
      employer,
      employee,
      salaryDetails,
      taxComputation,
      financialYear,
      assessmentYear,
      verificationPlace,
      generatedBy
    );

    return {
      partA,
      partB,
      generatedAt: new Date(),
      generatedBy,
    };
  }

  /**
   * Generate Form 16 Part A
   */
  static generatePartA(
    employer: Form16EmployerDetails,
    employee: Form16EmployeeDetails,
    quarterlyTDS: Form16QuarterlyTDS[],
    financialYear: string,
    assessmentYear: string
  ): Form16PartA {
    const totalTaxDeducted = quarterlyTDS.reduce((sum, q) => sum + q.taxDeducted, 0);
    const totalTaxDeposited = quarterlyTDS.reduce((sum, q) => sum + q.taxDeposited, 0);

    // Determine employment period from quarterly TDS dates
    const periods = quarterlyTDS.map(q => ({ from: q.periodFrom, to: q.periodTo }));
    const periodFrom = periods.length > 0
      ? new Date(Math.min(...periods.map(p => p.from.getTime())))
      : employee.dateOfJoining;
    const periodTo = periods.length > 0
      ? new Date(Math.max(...periods.map(p => p.to.getTime())))
      : employee.dateOfLeaving || new Date();

    return {
      certificateNo: this.generateCertificateNumber(employer.tan, financialYear),
      lastUpdated: new Date(),
      financialYear,
      assessmentYear,
      employer,
      employee,
      periodOfEmployment: {
        from: periodFrom,
        to: periodTo,
      },
      quarterlyTDS,
      totalTaxDeducted,
      totalTaxDeposited,
      verificationDate: new Date(),
    };
  }

  /**
   * Generate Form 16 Part B
   */
  static generatePartB(
    employer: Form16EmployerDetails,
    employee: Form16EmployeeDetails,
    salaryDetails: Form16SalaryDetails,
    taxComputation: Form16TaxComputation,
    financialYear: string,
    assessmentYear: string,
    place: string,
    signatory: string
  ): Form16PartB {
    return {
      financialYear,
      assessmentYear,
      employer,
      employee,
      salaryDetails,
      taxComputation,
      place,
      date: new Date(),
      signatory: {
        name: signatory,
        designation: 'Authorized Signatory',
      },
    };
  }

  /**
   * Compute tax based on salary details and regime
   */
  static computeTax(
    salaryDetails: Form16SalaryDetails,
    taxRegime: 'OLD' | 'NEW'
  ): Form16TaxComputation {
    // Calculate gross salary
    const grossSalary = salaryDetails.grossSalary;

    // Calculate exempt allowances
    const totalExemptions =
      salaryDetails.exemptAllowances.hra +
      salaryDetails.exemptAllowances.lta +
      salaryDetails.exemptAllowances.standardDeduction +
      salaryDetails.exemptAllowances.professionalTax +
      salaryDetails.exemptAllowances.otherExemptions;

    // Calculate deductions under Chapter VI-A (only for Old Regime)
    let totalDeductions = 0;
    if (taxRegime === 'OLD') {
      const ded = salaryDetails.deductions;
      const section80CTotal = Math.min(
        ded.section80C + ded.section80CCC + ded.section80CCD_1,
        150000
      );

      totalDeductions =
        section80CTotal +
        Math.min(ded.section80CCD_1B, 50000) +
        ded.section80CCD_2 +
        ded.section80D +
        ded.section80DD +
        ded.section80DDB +
        ded.section80E +
        ded.section80EE +
        ded.section80EEA +
        ded.section80EEB +
        ded.section80G +
        ded.section80GG +
        ded.section80GGA +
        ded.section80GGC +
        Math.min(ded.section80TTA, 10000) +
        Math.min(ded.section80TTB, 50000) +
        ded.section80U;

      // Add housing loan interest
      totalDeductions += Math.min(salaryDetails.interestOnHousingLoan, 200000);
    } else {
      // New regime: only standard deduction of Rs 75,000 (FY 2024-25)
      totalDeductions = 75000;
    }

    // Calculate gross total income
    const grossTotalIncome = grossSalary - totalExemptions +
      salaryDetails.incomeFromOtherSources;

    // Calculate taxable income
    const totalTaxableIncome = Math.max(0, grossTotalIncome - totalDeductions);

    // Calculate tax based on regime
    const taxOnTotalIncome = this.calculateTax(totalTaxableIncome, taxRegime);

    // Calculate surcharge
    const surcharge = this.calculateSurcharge(totalTaxableIncome, taxOnTotalIncome);

    // Health and Education Cess (4%)
    const healthAndEducationCess = (taxOnTotalIncome + surcharge) * 0.04;

    // Total tax payable
    const totalTaxPayable = taxOnTotalIncome + surcharge + healthAndEducationCess;

    return {
      grossTotalIncome,
      totalDeductions,
      totalTaxableIncome,
      taxOnTotalIncome,
      surcharge,
      healthAndEducationCess,
      totalTaxPayable,
      reliefUnderSection89: 0,
      netTaxPayable: totalTaxPayable,
      totalTaxDeducted: 0, // Will be filled from Part A
      balanceTax: totalTaxPayable,
      taxRegime,
    };
  }

  /**
   * Calculate tax based on slabs
   */
  private static calculateTax(income: number, regime: 'OLD' | 'NEW'): number {
    if (regime === 'NEW') {
      return this.calculateNewRegimeTax(income);
    }
    return this.calculateOldRegimeTax(income);
  }

  /**
   * Calculate tax under New Regime (FY 2024-25)
   */
  private static calculateNewRegimeTax(income: number): number {
    // Section 87A rebate for income up to Rs 7,00,000
    if (income <= 700000) {
      const tax = this.calculateNewRegimeTaxWithoutRebate(income);
      return Math.max(0, tax - Math.min(tax, 25000));
    }
    return this.calculateNewRegimeTaxWithoutRebate(income);
  }

  private static calculateNewRegimeTaxWithoutRebate(income: number): number {
    // New Tax Regime slabs FY 2024-25
    const slabs = [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 0.05 },
      { min: 700000, max: 1000000, rate: 0.10 },
      { min: 1000000, max: 1200000, rate: 0.15 },
      { min: 1200000, max: 1500000, rate: 0.20 },
      { min: 1500000, max: Infinity, rate: 0.30 },
    ];

    let tax = 0;
    for (const slab of slabs) {
      if (income <= slab.min) break;
      const taxableInSlab = Math.min(income, slab.max) - slab.min;
      tax += taxableInSlab * slab.rate;
    }
    return Math.round(tax);
  }

  /**
   * Calculate tax under Old Regime
   */
  private static calculateOldRegimeTax(income: number): number {
    // Section 87A rebate for income up to Rs 5,00,000
    if (income <= 500000) {
      const tax = this.calculateOldRegimeTaxWithoutRebate(income);
      return Math.max(0, tax - Math.min(tax, 12500));
    }
    return this.calculateOldRegimeTaxWithoutRebate(income);
  }

  private static calculateOldRegimeTaxWithoutRebate(income: number): number {
    // Old Tax Regime slabs
    const slabs = [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 0.05 },
      { min: 500000, max: 1000000, rate: 0.20 },
      { min: 1000000, max: Infinity, rate: 0.30 },
    ];

    let tax = 0;
    for (const slab of slabs) {
      if (income <= slab.min) break;
      const taxableInSlab = Math.min(income, slab.max) - slab.min;
      tax += taxableInSlab * slab.rate;
    }
    return Math.round(tax);
  }

  /**
   * Calculate surcharge based on income
   */
  private static calculateSurcharge(income: number, tax: number): number {
    if (income <= 5000000) return 0;
    if (income <= 10000000) return tax * 0.10;
    if (income <= 20000000) return tax * 0.15;
    if (income <= 50000000) return tax * 0.25;
    return tax * 0.37; // Max 37% for income > 5 crore
  }

  /**
   * Generate certificate number
   */
  private static generateCertificateNumber(tan: string, financialYear: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${tan}/${financialYear}/${timestamp}`;
  }

  /**
   * Get assessment year from financial year
   */
  private static getAssessmentYear(financialYear: string): string {
    const [startYear, endYear] = financialYear.split('-').map(y =>
      y.length === 2 ? parseInt(`20${y}`) : parseInt(y)
    );
    return `${startYear + 1}-${(endYear + 1).toString().slice(-2)}`;
  }

  /**
   * Validate TAN format
   * Format: 4 letters + 5 digits + 1 letter
   */
  static validateTAN(tan: string): boolean {
    if (!tan) return false;
    return /^[A-Z]{4}[0-9]{5}[A-Z]$/.test(tan.toUpperCase());
  }

  /**
   * Validate PAN format
   * Format: 5 letters + 4 digits + 1 letter
   */
  static validatePAN(pan: string): boolean {
    if (!pan) return false;
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
  }

  /**
   * Generate Form 16 HTML template
   */
  static generateHTML(form16: Form16Complete): string {
    const { partA, partB } = form16;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Form 16 - ${partA.financialYear}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
    .section { margin: 20px 0; }
    .section-title { font-weight: bold; background: #f0f0f0; padding: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #000; padding: 5px; text-align: left; }
    th { background: #e0e0e0; }
    .amount { text-align: right; }
    .total { font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h2>FORM NO. 16</h2>
    <p>[See rule 31(1)(a)]</p>
    <p>Certificate under Section 203 of the Income-tax Act, 1961 for tax deducted at source on salary</p>
  </div>

  <div class="section">
    <div class="section-title">PART A</div>
    <table>
      <tr><th>Certificate No.</th><td>${partA.certificateNo}</td></tr>
      <tr><th>Financial Year</th><td>${partA.financialYear}</td></tr>
      <tr><th>Assessment Year</th><td>${partA.assessmentYear}</td></tr>
    </table>

    <h4>Employer Details</h4>
    <table>
      <tr><th>Name</th><td>${partA.employer.name}</td></tr>
      <tr><th>TAN</th><td>${partA.employer.tan}</td></tr>
      <tr><th>PAN</th><td>${partA.employer.pan}</td></tr>
      <tr><th>Address</th><td>${partA.employer.address}, ${partA.employer.city}, ${partA.employer.state} - ${partA.employer.pincode}</td></tr>
    </table>

    <h4>Employee Details</h4>
    <table>
      <tr><th>Name</th><td>${partA.employee.name}</td></tr>
      <tr><th>PAN</th><td>${partA.employee.pan}</td></tr>
      <tr><th>Employee ID</th><td>${partA.employee.employeeId}</td></tr>
      <tr><th>Period of Employment</th><td>${this.formatDate(partA.periodOfEmployment.from)} to ${this.formatDate(partA.periodOfEmployment.to)}</td></tr>
    </table>

    <h4>Quarterly TDS Details</h4>
    <table>
      <tr>
        <th>Quarter</th>
        <th>Period</th>
        <th>Tax Deducted</th>
        <th>Tax Deposited</th>
        <th>Challan Date</th>
      </tr>
      ${partA.quarterlyTDS.map(q => `
        <tr>
          <td>${q.quarter}</td>
          <td>${this.formatDate(q.periodFrom)} - ${this.formatDate(q.periodTo)}</td>
          <td class="amount">₹${this.formatNumber(q.taxDeducted)}</td>
          <td class="amount">₹${this.formatNumber(q.taxDeposited)}</td>
          <td>${this.formatDate(q.dateOfChallan)}</td>
        </tr>
      `).join('')}
      <tr class="total">
        <td colspan="2">Total</td>
        <td class="amount">₹${this.formatNumber(partA.totalTaxDeducted)}</td>
        <td class="amount">₹${this.formatNumber(partA.totalTaxDeposited)}</td>
        <td></td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">PART B (Annexure)</div>

    <h4>Details of Salary Paid and Tax Deducted</h4>
    <table>
      <tr>
        <th>Particulars</th>
        <th class="amount">Amount (₹)</th>
      </tr>
      <tr>
        <td>1. Gross Salary</td>
        <td class="amount">${this.formatNumber(partB.salaryDetails.grossSalary)}</td>
      </tr>
      <tr>
        <td>2. Less: Exempt Allowances (HRA, LTA, etc.)</td>
        <td class="amount">${this.formatNumber(
          partB.salaryDetails.exemptAllowances.hra +
          partB.salaryDetails.exemptAllowances.lta +
          partB.salaryDetails.exemptAllowances.otherExemptions
        )}</td>
      </tr>
      <tr>
        <td>3. Less: Standard Deduction u/s 16</td>
        <td class="amount">${this.formatNumber(partB.salaryDetails.exemptAllowances.standardDeduction)}</td>
      </tr>
      <tr class="total">
        <td>4. Income under head Salaries</td>
        <td class="amount">${this.formatNumber(partB.taxComputation.grossTotalIncome)}</td>
      </tr>
      <tr>
        <td>5. Less: Deductions under Chapter VI-A</td>
        <td class="amount">${this.formatNumber(partB.taxComputation.totalDeductions)}</td>
      </tr>
      <tr class="total">
        <td>6. Total Taxable Income</td>
        <td class="amount">${this.formatNumber(partB.taxComputation.totalTaxableIncome)}</td>
      </tr>
      <tr>
        <td>7. Tax on Total Income</td>
        <td class="amount">${this.formatNumber(partB.taxComputation.taxOnTotalIncome)}</td>
      </tr>
      <tr>
        <td>8. Surcharge</td>
        <td class="amount">${this.formatNumber(partB.taxComputation.surcharge)}</td>
      </tr>
      <tr>
        <td>9. Health & Education Cess (4%)</td>
        <td class="amount">${this.formatNumber(partB.taxComputation.healthAndEducationCess)}</td>
      </tr>
      <tr class="total">
        <td>10. Total Tax Payable</td>
        <td class="amount">${this.formatNumber(partB.taxComputation.totalTaxPayable)}</td>
      </tr>
      <tr class="total">
        <td>11. Tax Regime</td>
        <td class="amount">${partB.taxComputation.taxRegime} REGIME</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <p><strong>Verification:</strong></p>
    <p>I, ${partB.signatory.name}, ${partB.signatory.designation}, hereby certify that a sum of Rs. ${this.formatNumber(partA.totalTaxDeducted)} has been deducted and deposited to the credit of the Central Government.</p>
    <p>Place: ${partB.place}</p>
    <p>Date: ${this.formatDate(partB.date)}</p>
    <br><br>
    <p>Signature of the person responsible for deduction of tax</p>
    <p>Name: ${partB.signatory.name}</p>
    <p>Designation: ${partB.signatory.designation}</p>
  </div>
</body>
</html>
    `;
  }

  // Helper methods
  private static formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private static formatNumber(num: number): string {
    return num.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    });
  }
}

export default Form16Service;
