/**
 * 27-payroll-processing.seed.ts
 *
 * Seeds end-to-end payroll processing data:
 *   PayrollConfiguration, PayrollRun, Payslip, PayrollAdjustment,
 *   StatutoryPayment, TaxDeclaration, TaxDocument, Garnishment,
 *   HSAFSAAccount, HSAFSATransaction, EmployeeBenefit
 *
 * @project AURA HCM Platform
 */

import { PrismaClient } from '@prisma/client';

export async function seedPayrollProcessing(prisma: PrismaClient, tenantId: string) {
  console.log('  Seeding Payroll Processing data...');

  // ---------------------------------------------------------------------------
  // 0. Lookup prerequisites
  // ---------------------------------------------------------------------------
  const company = await prisma.company.findFirst({ where: { code: 'KREUP_GLOBAL' } });
  if (!company) {
    console.warn('  Warning: Company KREUP_GLOBAL not found. Skipping payroll processing seed.');
    return;
  }

  const employees = await prisma.employee.findMany({
    where: { companyId: company.id },
    take: 10,
    orderBy: { employeeCode: 'asc' },
  });

  if (employees.length === 0) {
    console.warn('  Warning: No employees found. Skipping payroll processing seed.');
    return;
  }

  const systemUser = employees[0].id;

  // ---------------------------------------------------------------------------
  // 1. PayrollConfiguration — UAE entity + India entity
  // ---------------------------------------------------------------------------
  console.log('    Creating payroll configurations...');

  const uaeConfig = await prisma.payrollConfiguration.upsert({
    where: { tenantId_companyId: { tenantId, companyId: company.id } },
    update: {},
    create: {
      tenantId,
      companyId: company.id,
      countryCode: 'AE',
      payCycleType: 'Monthly',
      payDay: 28,
      cutoffDay: 25,
      enableWPS: true,
      enableGOSI: true,
      enablePF: false,
      enableESI: false,
      enableTDS: false,
      overtimeCalculationBase: 'Basic',
      leaveEncashmentBase: 'Basic',
      gratuityCalculationBase: 'Basic',
      isActive: true,
    },
  });

  // Look up or skip India entity — use a second company if available
  const indiaCompany = await prisma.company.findFirst({
    where: { tenantId, code: { not: 'KREUP_GLOBAL' } },
  });

  let indiaConfig: typeof uaeConfig | null = null;
  if (indiaCompany) {
    indiaConfig = await prisma.payrollConfiguration.upsert({
      where: { tenantId_companyId: { tenantId, companyId: indiaCompany.id } },
      update: {},
      create: {
        tenantId,
        companyId: indiaCompany.id,
        countryCode: 'IN',
        payCycleType: 'Monthly',
        payDay: 28,
        cutoffDay: 25,
        enableWPS: false,
        enableGOSI: false,
        enablePF: true,
        enableESI: true,
        enableTDS: true,
        overtimeCalculationBase: 'Basic',
        leaveEncashmentBase: 'Basic',
        gratuityCalculationBase: 'Basic',
        isActive: true,
      },
    });
  } else {
    console.log('    No secondary company found — skipping India payroll config.');
  }

  // ---------------------------------------------------------------------------
  // 2. PayrollRun — Jan 2025 (PAID), Feb 2025 (PAID), Mar 2025 (PROCESSING)
  // ---------------------------------------------------------------------------
  console.log('    Creating payroll runs...');

  const empCount = employees.length;

  const runDefinitions = [
    {
      payrollMonth: '2025-01',
      status: 'PAID' as const,
      totalGrossSalary: 450000,
      totalDeductions: 67500,
      totalNetSalary: 382500,
      totalEmployerCost: 495000,
      processedAt: new Date('2025-01-28'),
      approvedAt: new Date('2025-01-28'),
      paidAt: new Date('2025-01-28'),
      approvedBy: systemUser,
    },
    {
      payrollMonth: '2025-02',
      status: 'PAID' as const,
      totalGrossSalary: 455000,
      totalDeductions: 68250,
      totalNetSalary: 386750,
      totalEmployerCost: 500500,
      processedAt: new Date('2025-02-28'),
      approvedAt: new Date('2025-02-28'),
      paidAt: new Date('2025-02-28'),
      approvedBy: systemUser,
    },
    {
      payrollMonth: '2025-03',
      status: 'PROCESSING' as const,
      totalGrossSalary: 460000,
      totalDeductions: 69000,
      totalNetSalary: 391000,
      totalEmployerCost: 506000,
      processedAt: null,
      approvedAt: null,
      paidAt: null,
      approvedBy: null,
    },
  ];

  const payrollRuns: Array<{ id: string; payrollMonth: string; status: string }> = [];

  for (const def of runDefinitions) {
    const existing = await prisma.payrollRun.findUnique({
      where: {
        tenantId_configId_payrollMonth: {
          tenantId,
          configId: uaeConfig.id,
          payrollMonth: def.payrollMonth,
        },
      },
    });

    if (existing) {
      payrollRuns.push(existing);
      continue;
    }

    const run = await prisma.payrollRun.create({
      data: {
        tenantId,
        configId: uaeConfig.id,
        payrollMonth: def.payrollMonth,
        status: def.status,
        totalEmployees: empCount,
        totalGrossSalary: def.totalGrossSalary,
        totalDeductions: def.totalDeductions,
        totalNetSalary: def.totalNetSalary,
        totalEmployerCost: def.totalEmployerCost,
        currency: 'AED',
        processedAt: def.processedAt,
        approvedAt: def.approvedAt,
        paidAt: def.paidAt,
        approvedBy: def.approvedBy,
        approvalLevel: def.status === 'PAID' ? 2 : 0,
        createdBy: systemUser,
      },
    });
    payrollRuns.push(run);
  }

  // ---------------------------------------------------------------------------
  // 3. Payslip — one per employee per run
  // ---------------------------------------------------------------------------
  console.log('    Creating payslips...');

  const payslipStatusMap: Record<string, 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID'> = {
    PAID: 'PAID',
    APPROVED: 'APPROVED',
    PROCESSING: 'CALCULATED',
    CALCULATED: 'CALCULATED',
    PENDING_APPROVAL: 'CALCULATED',
    DRAFT: 'DRAFT',
    CANCELLED: 'DRAFT',
  };

  for (const run of payrollRuns) {
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const basicSalary = 15000 + i * 2000; // AED 15,000 – 33,000
      const hra = Math.round(basicSalary * 0.25);
      const transport = 1500;
      const totalEarnings = basicSalary + hra + transport;
      const gosiEmployee = Math.round(basicSalary * 0.05);
      const otherDeductions = Math.round(basicSalary * 0.02);
      const totalDeductions = gosiEmployee + otherDeductions;
      const grossSalary = totalEarnings;
      const netSalary = grossSalary - totalDeductions;

      // Skip if already exists (idempotent by checking existing payslip)
      const existingPayslip = await prisma.payslip.findFirst({
        where: { payrollRunId: run.id, employeeId: emp.id },
      });
      if (existingPayslip) continue;

      await prisma.payslip.create({
        data: {
          payrollRunId: run.id,
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          basicSalary,
          earnings: [
            { code: 'BASIC', name: 'Basic Salary', amount: basicSalary },
            { code: 'HRA', name: 'Housing Allowance', amount: hra },
            { code: 'TRANSPORT', name: 'Transport Allowance', amount: transport },
          ],
          totalEarnings,
          deductions: [
            { code: 'GOSI_EMP', name: 'GOSI Employee', amount: gosiEmployee },
            { code: 'OTHER_DED', name: 'Other Deductions', amount: otherDeductions },
          ],
          totalDeductions,
          employerGOSI: Math.round(basicSalary * 0.125),
          totalStatutoryEmployer: Math.round(basicSalary * 0.125),
          grossSalary,
          netSalary,
          workingDays: 22,
          paidDays: 22,
          lopDays: 0,
          overtimeHours: i % 3 === 0 ? 8 : 0,
          overtimeAmount: i % 3 === 0 ? Math.round(basicSalary / 22 / 8 * 1.5 * 8) : 0,
          status: payslipStatusMap[run.status] ?? 'DRAFT',
          createdBy: systemUser,
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 4. PayrollAdjustment — bonus, arrear, recovery
  // ---------------------------------------------------------------------------
  console.log('    Creating payroll adjustments...');

  const adjustmentDefs = [
    {
      employeeIdx: 0,
      payrollMonth: '2025-03',
      adjustmentType: 'EARNING',
      code: 'PERF_BONUS',
      name: 'Performance Bonus Q4',
      amount: 5000,
      reason: 'Quarterly performance bonus for exceeding targets in Q4 2024',
      category: 'BONUS',
      approvalStatus: 'APPROVED',
    },
    {
      employeeIdx: 1,
      payrollMonth: '2025-03',
      adjustmentType: 'EARNING',
      code: 'ARREAR_BASIC',
      name: 'Basic Salary Arrear',
      amount: 3200,
      reason: 'Retroactive salary revision effective from Jan 2025',
      category: 'ARREAR',
      approvalStatus: 'APPROVED',
    },
    {
      employeeIdx: 2,
      payrollMonth: '2025-03',
      adjustmentType: 'DEDUCTION',
      code: 'ADVANCE_REC',
      name: 'Salary Advance Recovery',
      amount: 2000,
      reason: 'Recovery of salary advance issued on 2025-01-15 (installment 2 of 3)',
      category: 'RECOVERY',
      approvalStatus: 'PENDING',
    },
  ];

  for (const adj of adjustmentDefs) {
    const emp = employees[adj.employeeIdx];
    if (!emp) continue;

    const existing = await prisma.payrollAdjustment.findFirst({
      where: {
        tenantId,
        employeeId: emp.id,
        payrollMonth: adj.payrollMonth,
        code: adj.code,
      },
    });
    if (existing) continue;

    await prisma.payrollAdjustment.create({
      data: {
        tenantId,
        employeeId: emp.id,
        payrollMonth: adj.payrollMonth,
        adjustmentType: adj.adjustmentType,
        code: adj.code,
        name: adj.name,
        amount: adj.amount,
        reason: adj.reason,
        category: adj.category,
        approvalStatus: adj.approvalStatus,
        approvedBy: adj.approvalStatus === 'APPROVED' ? systemUser : undefined,
        approvedAt: adj.approvalStatus === 'APPROVED' ? new Date('2025-03-10') : undefined,
        createdBy: systemUser,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 5. StatutoryPayment — GOSI for UAE runs, PF/ESI for India (if config exists)
  // ---------------------------------------------------------------------------
  console.log('    Creating statutory payments...');

  for (const run of payrollRuns) {
    // GOSI payment for UAE
    const existingGosi = await prisma.statutoryPayment.findFirst({
      where: { tenantId, payrollRunId: run.id, statutoryType: 'GOSI' },
    });

    if (!existingGosi) {
      const empContrib = empCount * 750;  // ~5% of avg basic
      const erContrib = empCount * 1875;  // ~12.5% of avg basic
      await prisma.statutoryPayment.create({
        data: {
          tenantId,
          payrollRunId: run.id,
          paymentMonth: run.payrollMonth,
          statutoryType: 'GOSI',
          employeeContribution: empContrib,
          employerContribution: erContrib,
          totalAmount: empContrib + erContrib,
          status: run.status === 'PAID' ? 'PAID' : 'PENDING',
          isPaid: run.status === 'PAID',
          paymentDate: run.status === 'PAID' ? new Date(`${run.payrollMonth}-28`) : undefined,
          challanNumber: run.status === 'PAID' ? `GOSI-${run.payrollMonth}-001` : undefined,
        },
      });
    }
  }

  // If India config exists, seed PF and ESI statutory payments
  if (indiaConfig) {
    // Create an India payroll run for statutory seeding
    const indiaRun = await prisma.payrollRun.findFirst({
      where: { tenantId, configId: indiaConfig.id },
    });

    if (!indiaRun) {
      const indiaPayrollRun = await prisma.payrollRun.create({
        data: {
          tenantId,
          configId: indiaConfig.id,
          payrollMonth: '2025-01',
          status: 'PAID',
          totalEmployees: 5,
          totalGrossSalary: 500000,
          totalDeductions: 90000,
          totalNetSalary: 410000,
          totalEmployerCost: 575000,
          currency: 'INR',
          processedAt: new Date('2025-01-28'),
          approvedAt: new Date('2025-01-28'),
          paidAt: new Date('2025-01-28'),
          approvedBy: systemUser,
          approvalLevel: 2,
          createdBy: systemUser,
        },
      });

      // PF statutory payment
      await prisma.statutoryPayment.create({
        data: {
          tenantId,
          payrollRunId: indiaPayrollRun.id,
          paymentMonth: '2025-01',
          statutoryType: 'PF',
          employeeContribution: 36000,  // 12% of aggregate PF-eligible wages
          employerContribution: 36000,
          totalAmount: 72000,
          status: 'PAID',
          isPaid: true,
          paymentDate: new Date('2025-02-15'),
          challanNumber: 'PF-2025-01-001',
          ifscCode: 'SBIN0001234',
        },
      });

      // ESI statutory payment
      await prisma.statutoryPayment.create({
        data: {
          tenantId,
          payrollRunId: indiaPayrollRun.id,
          paymentMonth: '2025-01',
          statutoryType: 'ESI',
          employeeContribution: 3750,  // 0.75% of gross
          employerContribution: 16250, // 3.25% of gross
          totalAmount: 20000,
          status: 'PAID',
          isPaid: true,
          paymentDate: new Date('2025-02-15'),
          challanNumber: 'ESI-2025-01-001',
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 6. TaxDeclaration — Indian tax declarations for first 3 employees
  // ---------------------------------------------------------------------------
  console.log('    Creating tax declarations...');

  const taxDeclDefs = [
    {
      employeeIdx: 0,
      taxRegime: 'OLD',
      section80C: 150000,
      ppf: 50000,
      elss: 50000,
      lifeInsurance: 30000,
      tuitionFees: 20000,
      section80D: 50000,
      medicalSelf: 25000,
      medicalParents: 25000,
      homeLoanInterest: 200000,
      rentPaid: 240000,
      status: 'VERIFIED',
    },
    {
      employeeIdx: 1,
      taxRegime: 'NEW',
      section80C: 0,
      ppf: 0,
      elss: 0,
      lifeInsurance: 0,
      tuitionFees: 0,
      section80D: 0,
      medicalSelf: 0,
      medicalParents: 0,
      homeLoanInterest: 0,
      rentPaid: 0,
      status: 'SUBMITTED',
    },
    {
      employeeIdx: 2,
      taxRegime: 'OLD',
      section80C: 120000,
      ppf: 60000,
      elss: 40000,
      lifeInsurance: 20000,
      tuitionFees: 0,
      section80D: 30000,
      medicalSelf: 25000,
      medicalParents: 5000,
      homeLoanInterest: 0,
      rentPaid: 180000,
      status: 'DRAFT',
    },
  ];

  for (const decl of taxDeclDefs) {
    const emp = employees[decl.employeeIdx];
    if (!emp) continue;

    const existing = await prisma.taxDeclaration.findUnique({
      where: {
        tenantId_employeeId_financialYear: {
          tenantId,
          employeeId: emp.id,
          financialYear: '2024-2025',
        },
      },
    });
    if (existing) continue;

    const totalDeductions =
      decl.section80C + decl.section80D + decl.homeLoanInterest;

    await prisma.taxDeclaration.create({
      data: {
        tenantId,
        employeeId: emp.id,
        financialYear: '2024-2025',
        taxRegime: decl.taxRegime,
        ppf: decl.ppf,
        elss: decl.elss,
        lifeInsurance: decl.lifeInsurance,
        tuitionFees: decl.tuitionFees,
        section80C: decl.section80C,
        medicalSelf: decl.medicalSelf,
        medicalParents: decl.medicalParents,
        section80D: decl.section80D,
        homeLoanInterest: decl.homeLoanInterest,
        rentPaid: decl.rentPaid,
        totalDeductions,
        proofsUploaded: decl.status === 'VERIFIED',
        status: decl.status,
        submittedAt: decl.status !== 'DRAFT' ? new Date('2025-01-15') : undefined,
        verifiedBy: decl.status === 'VERIFIED' ? systemUser : undefined,
        verifiedAt: decl.status === 'VERIFIED' ? new Date('2025-02-01') : undefined,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 7. TaxDocument — Form 16 / W-2 for first 4 employees
  // ---------------------------------------------------------------------------
  console.log('    Creating tax documents...');

  const taxDocDefs = [
    { employeeIdx: 0, type: 'FORM_16', taxYear: 2024, status: 'DELIVERED' },
    { employeeIdx: 1, type: 'FORM_16', taxYear: 2024, status: 'GENERATED' },
    { employeeIdx: 2, type: 'FORM_16', taxYear: 2024, status: 'GENERATED' },
    { employeeIdx: 3, type: 'W2', taxYear: 2024, status: 'DELIVERED' },
  ];

  for (const doc of taxDocDefs) {
    const emp = employees[doc.employeeIdx];
    if (!emp) continue;

    const existing = await prisma.taxDocument.findUnique({
      where: {
        tenantId_employeeId_type_taxYear: {
          tenantId,
          employeeId: emp.id,
          type: doc.type,
          taxYear: doc.taxYear,
        },
      },
    });
    if (existing) continue;

    await prisma.taxDocument.create({
      data: {
        tenantId,
        employeeId: emp.id,
        type: doc.type,
        taxYear: doc.taxYear,
        status: doc.status,
        fileUrl: doc.status === 'DELIVERED'
          ? `/documents/tax/${doc.type.toLowerCase()}_${doc.taxYear}_${emp.employeeCode}.pdf`
          : null,
        deliveredAt: doc.status === 'DELIVERED' ? new Date('2025-06-15') : undefined,
        metadata: {
          financialYear: `${doc.taxYear}-${doc.taxYear + 1}`,
          generatedBy: 'payroll-system',
        },
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Garnishment — 2 records
  // ---------------------------------------------------------------------------
  console.log('    Creating garnishments...');

  const garnishmentDefs = [
    {
      employeeIdx: 4,
      type: 'CHILD_SUPPORT',
      caseNumber: 'CS-2024-00451',
      amount: 2500,
      amountType: 'FIXED',
      startDate: new Date('2024-06-01'),
      status: 'ACTIVE',
      priority: 1,
      totalDeducted: 22500, // 9 months deducted
      payeeInfo: {
        name: 'Family Court Trust Account',
        accountNumber: 'FCTAXXXX4567',
      },
    },
    {
      employeeIdx: 6,
      type: 'TAX_LEVY',
      caseNumber: 'TL-2024-00892',
      amount: 15,
      amountType: 'PERCENTAGE',
      maxAmount: 5000,
      startDate: new Date('2024-09-01'),
      status: 'ACTIVE',
      priority: 2,
      totalDeducted: 9800,
      payeeInfo: {
        name: 'Federal Tax Authority',
        accountNumber: 'FTAXXXX7890',
      },
    },
  ];

  for (const garn of garnishmentDefs) {
    const emp = employees[garn.employeeIdx];
    if (!emp) continue;

    const existing = await prisma.garnishment.findFirst({
      where: { tenantId, employeeId: emp.id, caseNumber: garn.caseNumber },
    });
    if (existing) continue;

    await prisma.garnishment.create({
      data: {
        tenantId,
        employeeId: emp.id,
        type: garn.type,
        caseNumber: garn.caseNumber,
        amount: garn.amount,
        amountType: garn.amountType,
        maxAmount: garn.maxAmount,
        startDate: garn.startDate,
        status: garn.status,
        priority: garn.priority,
        totalDeducted: garn.totalDeducted,
        payeeInfo: garn.payeeInfo,
        createdBy: systemUser,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 9. HSAFSAAccount + HSAFSATransaction
  // ---------------------------------------------------------------------------
  console.log('    Creating HSA/FSA accounts and transactions...');

  const hsaFsaDefs = [
    {
      employeeIdx: 0,
      accountType: 'HSA',
      balance: 4200,
      yearToDateContributions: 3600,
      annualLimit: 4150,
      cashBalance: 3200,
      investmentBalance: 1000,
      contributionAmount: 200,
      contributionFrequency: 'PER_PAYCHECK',
      planYear: 2025,
      transactions: [
        { type: 'CONTRIBUTION', amount: 200, description: 'Payroll contribution - Jan 2025', date: new Date('2025-01-28') },
        { type: 'CONTRIBUTION', amount: 200, description: 'Payroll contribution - Feb 2025', date: new Date('2025-02-28') },
        { type: 'DISTRIBUTION', amount: -150, description: 'Pharmacy co-pay', date: new Date('2025-02-10') },
        { type: 'CONTRIBUTION', amount: 200, description: 'Payroll contribution - Mar 2025', date: new Date('2025-03-15') },
      ],
    },
    {
      employeeIdx: 1,
      accountType: 'FSA',
      balance: 1800,
      yearToDateContributions: 750,
      annualLimit: 3200,
      cashBalance: 1800,
      investmentBalance: 0,
      contributionAmount: 125,
      contributionFrequency: 'PER_PAYCHECK',
      planYear: 2025,
      transactions: [
        { type: 'CONTRIBUTION', amount: 375, description: 'Payroll contribution - Jan 2025', date: new Date('2025-01-28') },
        { type: 'CONTRIBUTION', amount: 375, description: 'Payroll contribution - Feb 2025', date: new Date('2025-02-28') },
        { type: 'DISTRIBUTION', amount: -200, description: 'Dental cleaning', date: new Date('2025-01-20') },
      ],
    },
    {
      employeeIdx: 3,
      accountType: 'DCFSA',
      balance: 2400,
      yearToDateContributions: 1250,
      annualLimit: 5000,
      cashBalance: 2400,
      investmentBalance: 0,
      contributionAmount: 208.33,
      contributionFrequency: 'MONTHLY',
      planYear: 2025,
      transactions: [
        { type: 'CONTRIBUTION', amount: 416.67, description: 'Monthly contribution - Jan 2025', date: new Date('2025-01-31') },
        { type: 'CONTRIBUTION', amount: 416.67, description: 'Monthly contribution - Feb 2025', date: new Date('2025-02-28') },
        { type: 'DISTRIBUTION', amount: -500, description: 'Daycare expense reimbursement', date: new Date('2025-02-15') },
        { type: 'CONTRIBUTION', amount: 416.66, description: 'Monthly contribution - Mar 2025', date: new Date('2025-03-15') },
      ],
    },
  ];

  for (const acctDef of hsaFsaDefs) {
    const emp = employees[acctDef.employeeIdx];
    if (!emp) continue;

    const existing = await prisma.hSAFSAAccount.findUnique({
      where: {
        employeeId_accountType_planYear: {
          employeeId: emp.id,
          accountType: acctDef.accountType,
          planYear: acctDef.planYear,
        },
      },
    });
    if (existing) continue;

    const account = await prisma.hSAFSAAccount.create({
      data: {
        tenantId,
        employeeId: emp.id,
        accountType: acctDef.accountType,
        status: 'ACTIVE',
        balance: acctDef.balance,
        yearToDateContributions: acctDef.yearToDateContributions,
        annualLimit: acctDef.annualLimit,
        cashBalance: acctDef.cashBalance,
        investmentBalance: acctDef.investmentBalance,
        contributionAmount: acctDef.contributionAmount,
        contributionFrequency: acctDef.contributionFrequency,
        planYear: acctDef.planYear,
      },
    });

    // Create transactions for this account
    for (const txn of acctDef.transactions) {
      await prisma.hSAFSATransaction.create({
        data: {
          accountId: account.id,
          type: txn.type,
          amount: Math.abs(txn.amount),
          description: txn.description,
          date: txn.date,
          status: 'COMPLETED',
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 10. EmployeeBenefit — individual benefit records
  // ---------------------------------------------------------------------------
  console.log('    Creating employee benefits...');

  const benefitDefs = [
    {
      employeeIdx: 0,
      benefitType: 'MEDICAL',
      benefitName: 'Comprehensive Health Insurance',
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-EMP-001-2025',
      coverageAmount: 500000,
      employeeContribution: 400,
      employerContribution: 1100,
      totalPremium: 1500,
      startDate: new Date('2025-01-01'),
      renewalDate: new Date('2025-12-31'),
      coversDependents: true,
      dependentsCount: 2,
    },
    {
      employeeIdx: 0,
      benefitType: 'DENTAL',
      benefitName: 'Standard Dental Plan',
      provider: 'Delta Dental',
      policyNumber: 'DD-EMP-001-2025',
      coverageAmount: 50000,
      employeeContribution: 75,
      employerContribution: 110,
      totalPremium: 185,
      startDate: new Date('2025-01-01'),
      renewalDate: new Date('2025-12-31'),
      coversDependents: true,
      dependentsCount: 2,
    },
    {
      employeeIdx: 1,
      benefitType: 'MEDICAL',
      benefitName: 'Comprehensive Health Insurance',
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-EMP-002-2025',
      coverageAmount: 500000,
      employeeContribution: 150,
      employerContribution: 450,
      totalPremium: 600,
      startDate: new Date('2025-01-01'),
      renewalDate: new Date('2025-12-31'),
      coversDependents: false,
      dependentsCount: 0,
    },
    {
      employeeIdx: 2,
      benefitType: 'LIFE_INSURANCE',
      benefitName: 'Group Term Life Insurance',
      provider: 'MetLife',
      policyNumber: 'ML-EMP-003-2025',
      coverageAmount: 1000000,
      employeeContribution: 50,
      employerContribution: 150,
      totalPremium: 200,
      startDate: new Date('2025-01-01'),
      renewalDate: new Date('2025-12-31'),
      coversDependents: false,
      dependentsCount: 0,
    },
    {
      employeeIdx: 3,
      benefitType: 'VISION',
      benefitName: 'Basic Vision Plan',
      provider: 'VSP Vision Care',
      policyNumber: 'VSP-EMP-004-2025',
      coverageAmount: 5000,
      employeeContribution: 10,
      employerContribution: 15,
      totalPremium: 25,
      startDate: new Date('2025-01-01'),
      renewalDate: new Date('2025-12-31'),
      coversDependents: true,
      dependentsCount: 3,
    },
  ];

  for (const ben of benefitDefs) {
    const emp = employees[ben.employeeIdx];
    if (!emp) continue;

    const existing = await prisma.employeeBenefit.findFirst({
      where: {
        tenantId,
        employeeId: emp.id,
        benefitType: ben.benefitType,
        policyNumber: ben.policyNumber,
      },
    });
    if (existing) continue;

    await prisma.employeeBenefit.create({
      data: {
        tenantId,
        employeeId: emp.id,
        benefitType: ben.benefitType,
        benefitName: ben.benefitName,
        provider: ben.provider,
        policyNumber: ben.policyNumber,
        coverageAmount: ben.coverageAmount,
        employeeContribution: ben.employeeContribution,
        employerContribution: ben.employerContribution,
        totalPremium: ben.totalPremium,
        startDate: ben.startDate,
        renewalDate: ben.renewalDate,
        coversDependents: ben.coversDependents,
        dependentsCount: ben.dependentsCount,
        dependentsDetails: ben.coversDependents
          ? [{ relationship: 'Spouse', name: 'Dependent 1' }]
          : undefined,
        status: 'ACTIVE',
        isActive: true,
      },
    });
  }

  console.log('  Payroll Processing seed data created successfully!');
}
