/**
 * India Statutory Forms Types
 * Phase 4: India Payroll Compliance
 */

// ============================================================================
// FORM 16 - TDS Certificate
// ============================================================================

export interface Form16Data {
  // Part A - TDS on Salary
  partA: Form16PartA;
  // Part B - Details of Salary & Tax Computation
  partB: Form16PartB;
}

export interface Form16PartA {
  // Certificate Number
  certificateNo: string;
  lastUpdated: Date;

  // Employer Details
  employer: {
    name: string;
    tan: string;
    pan: string;
    address: string;
  };

  // Employee Details
  employee: {
    name: string;
    pan: string;
    designation?: string;
  };

  // Assessment Year
  assessmentYear: string;
  financialYear: string;

  // Period of Employment
  employmentPeriod: {
    from: Date;
    to: Date;
  };

  // Quarter-wise TDS Details
  quarterlyTDS: {
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    receiptNo: string;
    receiptDate: Date;
    taxDeposited: number;
    bsrCode: string;
    challanNo: string;
    challanDate: Date;
  }[];

  // Summary
  totalTaxDeducted: number;
  totalTaxDeposited: number;
}

export interface Form16PartB {
  // Gross Salary
  grossSalary: {
    basicSalary: number;
    hra: number;
    transportAllowance: number;
    specialAllowance: number;
    lta: number;
    otherAllowances: number;
    bonus: number;
    commission: number;
    arrears: number;
    total: number;
  };

  // Exemptions under Section 10
  exemptions: {
    hraExemption: number; // 10(13A)
    ltaExemption: number; // 10(5)
    professionalTax: number;
    standardDeduction: number; // 16(ia)
    entertainmentAllowance: number; // 16(ii)
    other: number;
    total: number;
  };

  // Income from Salary
  incomeFromSalary: number;

  // Other Income
  otherIncome: {
    incomeFromHouseProperty: number;
    incomeFromOtherSources: number;
    total: number;
  };

  // Gross Total Income
  grossTotalIncome: number;

  // Deductions under Chapter VI-A
  deductions: {
    section80C: {
      ppf: number;
      lifeInsurance: number;
      elss: number;
      nsc: number;
      tuitionFees: number;
      homeLoanPrincipal: number;
      sukanyaSamriddhi: number;
      nps80CCD1: number;
      other: number;
      total: number; // Max 1.5L
    };
    section80CCD1B: number; // Additional NPS (Max 50K)
    section80D: {
      selfFamily: number;
      parents: number;
      preventiveHealth: number;
      total: number;
    };
    section80E: number; // Education Loan Interest
    section80G: number; // Donations
    section80TTA: number; // Savings Interest (Max 10K)
    section80TTB: number; // Senior Citizen Interest (Max 50K)
    section80U: number; // Disability
    section80DD: number; // Dependent Disability
    section80DDB: number; // Medical Treatment
    section24b: number; // Home Loan Interest (Max 2L)
    totalDeductions: number;
  };

  // Total Income (Taxable)
  totalTaxableIncome: number;

  // Tax Computation
  taxComputation: {
    taxRegime: 'OLD' | 'NEW';
    taxOnIncome: number;
    rebateUnder87A: number;
    taxAfterRebate: number;
    surcharge: number;
    healthEducationCess: number;
    totalTaxPayable: number;
    reliefUnder89: number;
    netTaxPayable: number;
    tdsDeducted: number;
    refundDue: number;
    balanceTaxPayable: number;
  };

  // Verification
  verification: {
    place: string;
    date: Date;
    designation: string;
    signature?: string;
  };
}

// ============================================================================
// FORM 12BA - Statement of Perquisites
// ============================================================================

export interface Form12BAData {
  // Header
  assessmentYear: string;
  financialYear: string;

  // Employer Details
  employer: {
    name: string;
    tan: string;
    address: string;
  };

  // Employee Details
  employee: {
    name: string;
    designation: string;
    pan: string;
    address: string;
  };

  // Perquisites Details
  perquisites: {
    // Accommodation
    accommodation: {
      type: 'RENT_FREE' | 'CONCESSIONAL' | 'NONE';
      period: { from: Date; to: Date };
      valueAsPerRules: number;
      rentPaidByEmployee: number;
      taxableValue: number;
    };

    // Motor Car
    motorCar: {
      provided: boolean;
      type: 'EMPLOYER_OWNED' | 'EMPLOYEE_OWNED' | 'HIRED';
      cubicCapacity: 'UPTO_1600CC' | 'ABOVE_1600CC';
      driverProvided: boolean;
      personalUsePercentage: number;
      taxableValue: number;
    };

    // Sweeper/Gardener/Watchman/Personal Attendant
    domesticServants: {
      sweeperValue: number;
      gardenerValue: number;
      watchmanValue: number;
      personalAttendantValue: number;
      total: number;
    };

    // Gas/Electricity/Water
    utilities: {
      gasValue: number;
      electricityValue: number;
      waterValue: number;
      total: number;
    };

    // Education for Children
    educationBenefit: {
      institutionOwnedByEmployer: boolean;
      numberOfChildren: number;
      annualValue: number;
      taxableValue: number; // Exempt up to 1000/month/child
    };

    // Interest Free Loans
    interestFreeLoan: {
      loanAmount: number;
      interestRateCharged: number;
      sbiRate: number;
      taxableValue: number;
    };

    // Use of Movable Assets
    movableAssets: {
      assetDescription: string;
      costToEmployer: number;
      period: { from: Date; to: Date };
      taxableValue: number; // 10% of cost p.a.
    };

    // Transfer of Movable Assets
    assetTransfer: {
      assetDescription: string;
      dateOfTransfer: Date;
      costToEmployer: number;
      depreciation: number;
      amountRecovered: number;
      taxableValue: number;
    };

    // Gifts/Vouchers
    gifts: {
      occasionalGifts: number; // Exempt up to 5000
      taxableValue: number;
    };

    // Credit Card Expenses
    creditCard: {
      paidByEmployer: number;
      businessPurpose: number;
      taxableValue: number;
    };

    // Club Membership
    clubMembership: {
      corporateMembership: boolean;
      clubName: string;
      annualFees: number;
      taxableValue: number;
    };

    // Stock Options (ESOP)
    esop: {
      exerciseDate: Date;
      fmvOnExercise: number;
      exercisePrice: number;
      numberOfShares: number;
      taxableValue: number;
    };

    // Other Perquisites
    otherPerquisites: {
      description: string;
      value: number;
    }[];

    // Total Perquisites
    totalPerquisites: number;
  };

  // Profits in Lieu of Salary
  profitsInLieu: {
    compensationForTermination: number;
    paymentFromPF: number;
    paymentFromSuperannuation: number;
    paymentFromGratuity: number;
    other: number;
    total: number;
  };

  // Declaration
  declaration: {
    place: string;
    date: Date;
    employerSignature?: string;
  };
}

// ============================================================================
// FORM 24Q - Quarterly TDS Return
// ============================================================================

export interface Form24QData {
  // Header
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  financialYear: string;
  returnType: 'ORIGINAL' | 'REVISED';

  // Deductor Details
  deductor: {
    tan: string;
    pan: string;
    name: string;
    address: {
      flatNo: string;
      buildingName: string;
      street: string;
      area: string;
      city: string;
      state: string;
      pincode: string;
    };
    phone: string;
    email: string;
    responsiblePerson: {
      name: string;
      designation: string;
      pan?: string;
      address?: string;
    };
  };

  // Challan Details
  challans: Form24QChallan[];

  // Salary Details (Annexure II)
  salaryDetails: Form24QSalaryDetail[];

  // Summary
  summary: {
    totalEmployees: number;
    totalSalaryPaid: number;
    totalTaxDeducted: number;
    totalTaxDeposited: number;
    interestOnLateFiling: number;
    feeOnLateFiling: number;
    penaltyForShortDeduction: number;
  };

  // Verification
  verification: {
    place: string;
    date: Date;
    verifierName: string;
    verifierDesignation: string;
  };
}

export interface Form24QChallan {
  challanNo: string;
  challanDate: Date;
  bsrCode: string;
  mode: 'ELECTRONIC' | 'CHEQUE' | 'CASH';
  amount: {
    tds: number;
    surcharge: number;
    cess: number;
    interest: number;
    penalty: number;
    other: number;
    total: number;
  };
  section: '192' | '194';
}

export interface Form24QSalaryDetail {
  employeeId: string;
  employeeName: string;
  pan: string;
  sectionCode: '192';
  dateOfPayment: Date;
  amountPaid: number;
  tdsDeducted: number;
  tdsChallanNo: string;
  totalTaxDeposited: number;
  dateOfDeposit: Date;
  bsrCode: string;
  remarks?: string;
}

// ============================================================================
// EPF/ESI RETURNS
// ============================================================================

export interface EPFMonthlyReturn {
  // Form 12A
  establishmentCode: string;
  establishmentName: string;
  address: string;
  month: string;
  year: number;

  // Employee Contributions
  contributions: EPFContribution[];

  // Summary
  summary: {
    totalEmployees: number;
    totalWages: number;
    employeeContribution: number; // 12%
    employerContribution: number; // 12%
    employerEPS: number; // 8.33% (part of employer)
    employerEPF: number; // 3.67% (part of employer)
    adminCharges: number; // 0.5%
    edliCharges: number; // 0.5%
    totalDeposit: number;
  };

  // Payment Details
  payment: {
    challanNo: string;
    date: Date;
    amount: number;
    bank: string;
    branch: string;
  };
}

export interface EPFContribution {
  uanNumber: string;
  memberName: string;
  grossWages: number;
  epfWages: number; // Capped at 15000
  epsWages: number; // Capped at 15000
  employeeContribution: number;
  employerContribution: number;
  epsContribution: number;
  ncp: number; // Non-Contributing Period days
  refund: boolean;
}

export interface ESIMonthlyReturn {
  // Form 5
  employerCode: string;
  employerName: string;
  address: string;
  month: string;
  year: number;

  // Contribution Period
  contributionPeriod: {
    from: Date;
    to: Date;
  };

  // Employee Details
  employees: ESIContribution[];

  // Summary
  summary: {
    totalEmployees: number;
    totalWages: number;
    employeeContribution: number; // 0.75%
    employerContribution: number; // 3.25%
    totalContribution: number; // 4%
  };

  // Payment
  payment: {
    challanNo: string;
    date: Date;
    amount: number;
    bank: string;
  };
}

export interface ESIContribution {
  ipNumber: string; // Insurance Person Number
  memberName: string;
  grossWages: number;
  wagesCeiling: number; // 21000
  actualWages: number;
  employeeContribution: number;
  employerContribution: number;
  ncp: number;
  reason?: string;
}

// ============================================================================
// INVESTMENT DECLARATION (Form 12BB)
// ============================================================================

export interface Form12BBData {
  // Employee Details
  employee: {
    name: string;
    pan: string;
    designation: string;
    department: string;
  };

  // Financial Year
  financialYear: string;

  // House Rent Allowance
  hra: {
    claiming: boolean;
    rentPaidPerMonth: number;
    landlordName: string;
    landlordPan?: string;
    landlordAddress: string;
    cityType: 'METRO' | 'NON_METRO';
    period: { from: Date; to: Date };
    totalRentPaid: number;
  };

  // Leave Travel Allowance
  lta: {
    claiming: boolean;
    amount: number;
    journeyDetails?: string;
    blockYear: string;
  };

  // Deductions under Chapter VI-A
  deductions: {
    section80C: {
      lifeInsurance: { amount: number; policyNo: string }[];
      ppf: { amount: number; accountNo: string };
      elss: { amount: number; fundName: string }[];
      nsc: { amount: number; certificateNo: string }[];
      sukanyaSamriddhi: { amount: number; accountNo: string };
      tuitionFees: { amount: number; childName: string; institution: string }[];
      homeLoanPrincipal: { amount: number; bankName: string; loanAccountNo: string };
      fixedDeposit: { amount: number; bankName: string; accountNo: string }[];
      other: { description: string; amount: number }[];
      total: number;
    };

    section80CCD1B: {
      npsContribution: number;
      pranNumber: string;
    };

    section80D: {
      selfFamilyPremium: number;
      parentsPremium: number;
      parentsSeniorCitizen: boolean;
      preventiveHealthCheckup: number;
      total: number;
    };

    section80E: {
      claiming: boolean;
      interestPaid: number;
      loanDetails: string;
    };

    section80G: {
      donations: {
        doneeName: string;
        pan: string;
        amount: number;
        category: '100%' | '50%' | '100%_WITH_LIMIT' | '50%_WITH_LIMIT';
      }[];
      total: number;
    };

    section24b: {
      claiming: boolean;
      interestPaid: number;
      lenderName: string;
      lenderPan: string;
      loanType: 'SELF_OCCUPIED' | 'LET_OUT';
    };
  };

  // Other Income
  otherIncome: {
    incomeFromHouseProperty: number;
    incomeFromOtherSources: number;
    previousEmployerIncome: number;
    previousEmployerTDS: number;
  };

  // Tax Regime
  taxRegime: 'OLD' | 'NEW';

  // Declaration
  declaration: {
    date: Date;
    place: string;
  };

  // Status
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  remarks?: string;
}
