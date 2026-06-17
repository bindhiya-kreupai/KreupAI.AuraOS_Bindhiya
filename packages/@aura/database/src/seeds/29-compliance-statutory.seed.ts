/**
 * @module ComplianceStatutorySeed
 * @description Seed data for Compliance & Statutory models:
 *   LabourLawConfig, WPSConfiguration, GOSIConfiguration,
 *   NitaqatConfiguration, NitaqatSnapshot, EOSBCalculation,
 *   IndiaPFConfiguration, IndiaPFSubmission, IndiaPFRecord,
 *   IndiaESIConfiguration, IndiaESISubmission, IndiaESIRecord,
 *   IndiaTDSConfiguration, IndiaTDSDeclaration,
 *   IndiaProfessionalTaxConfig, IndiaProfessionalTaxDeduction,
 *   ComplianceAuditLog, LocalizationConfig, Translation
 * @project AURA HCM Platform
 */

import { PrismaClient } from '@prisma/client';

const pick = <T>(arr: T[], idx: number): T => arr[idx % arr.length];

export async function seedComplianceStatutory(prisma: PrismaClient, tenantId: string) {
  console.log('  Seeding Compliance & Statutory data...');

  // ------------------------------------------------------------------
  // Lookup company by code (seeded in 10-org-structure)
  // ------------------------------------------------------------------
  const companyGlobal = await prisma.company.findFirst({
    where: { tenantId, code: 'KREUP_GLOBAL' },
  });
  const companyIndia = await prisma.company.findFirst({
    where: { tenantId, code: 'KREUP_INDIA' },
  });

  if (!companyGlobal) {
    console.warn('    [WARN] Company KREUP_GLOBAL not found — skipping tenant-scoped compliance seeds');
    return;
  }

  // Lookup employees for statutory record linking
  const employees = await prisma.employee.findMany({
    where: { company: { tenantId } },
    take: 10,
    orderBy: { createdAt: 'asc' },
  });

  if (employees.length === 0) {
    console.warn('    [WARN] No employees found — skipping statutory record seeds');
    return;
  }

  const indiaCompanyId = companyIndia?.id ?? companyGlobal.id;

  // ==================================================================
  // 1. LabourLawConfig — UAE, KSA, India
  // ==================================================================
  console.log('    - Seeding LabourLawConfig...');

  // UAE
  const existingUAE = await prisma.labourLawConfig.findFirst({
    where: { countryCode: 'AE', effectiveFrom: new Date('2024-01-01') },
  });
  if (!existingUAE) {
    await prisma.labourLawConfig.create({
      data: {
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryNameAr: 'الإمارات العربية المتحدة',
        effectiveFrom: new Date('2024-01-01'),
        standardHoursPerDay: 8,
        standardHoursPerWeek: 48,
        ramadanHoursPerDay: 6,
        ramadanHoursPerWeek: 36,
        maxOvertimeHoursPerDay: 2,
        maxOvertimeHoursPerYear: 720,
        overtimeRateNormal: 125,
        overtimeRateNight: 150,
        overtimeRateHoliday: 150,
        overtimeRateFriday: 150,
        nightShiftStart: '21:00',
        nightShiftEnd: '04:00',
        maxProbationDays: 180,
        probationExtensionDays: 180,
        probationNoticeDays: 14,
        annualLeaveFirstYear: 21,
        annualLeaveAfterYears: 30,
        annualLeaveThresholdYears: 5,
        sickLeaveFullPay: 15,
        sickLeaveHalfPay: 30,
        sickLeaveUnpaid: 45,
        maternityLeaveDays: 60,
        maternityLeaveFullPay: 45,
        maternityLeaveHalfPay: 15,
        paternityLeaveDays: 5,
        bereavementLeaveSpouse: 5,
        bereavementLeaveFamily: 3,
        hajjLeaveDays: 30,
        hajjLeaveMinServiceYears: 5,
        studyLeaveDays: 10,
        marriageLeaveDays: 5,
        iddahLeaveDays: 130,
        eosbFirstPeriodYears: 5,
        eosbFirstPeriodDays: 21,
        eosbAfterPeriodDays: 30,
        eosbMaxMonths: 24,
        eosbResignationFactor1: 0.333,
        eosbResignationFactor2: 0.667,
        eosbMinServiceMonths: 12,
        socialInsuranceEmployeeRate: 5,
        socialInsuranceEmployerRate: 12.5,
        socialInsuranceMaxWage: 50000,
        pensionEmployeeRate: 5,
        pensionEmployerRate: 12.5,
        weekendDays: ['Saturday', 'Sunday'],
        workWeekStartDay: 'Monday',
        currencyCode: 'AED',
        status: 'Active',
      },
    });
  }

  // KSA
  const existingKSA = await prisma.labourLawConfig.findFirst({
    where: { countryCode: 'SA', effectiveFrom: new Date('2024-01-01') },
  });
  if (!existingKSA) {
    await prisma.labourLawConfig.create({
      data: {
        countryCode: 'SA',
        countryName: 'Kingdom of Saudi Arabia',
        countryNameAr: 'المملكة العربية السعودية',
        effectiveFrom: new Date('2024-01-01'),
        standardHoursPerDay: 8,
        standardHoursPerWeek: 48,
        ramadanHoursPerDay: 6,
        ramadanHoursPerWeek: 36,
        maxOvertimeHoursPerDay: 2,
        maxOvertimeHoursPerYear: 720,
        overtimeRateNormal: 150,
        overtimeRateNight: 150,
        overtimeRateHoliday: 200,
        overtimeRateFriday: 200,
        nightShiftStart: '21:00',
        nightShiftEnd: '06:00',
        maxProbationDays: 90,
        probationExtensionDays: 90,
        probationNoticeDays: 0,
        annualLeaveFirstYear: 21,
        annualLeaveAfterYears: 30,
        annualLeaveThresholdYears: 5,
        sickLeaveFullPay: 30,
        sickLeaveHalfPay: 60,
        sickLeaveUnpaid: 30,
        maternityLeaveDays: 70,
        maternityLeaveFullPay: 70,
        maternityLeaveHalfPay: 0,
        paternityLeaveDays: 3,
        bereavementLeaveSpouse: 5,
        bereavementLeaveFamily: 3,
        hajjLeaveDays: 15,
        hajjLeaveMinServiceYears: 2,
        studyLeaveDays: 0,
        marriageLeaveDays: 5,
        iddahLeaveDays: 130,
        eosbFirstPeriodYears: 5,
        eosbFirstPeriodDays: 15,
        eosbAfterPeriodDays: 30,
        eosbMaxMonths: 24,
        eosbResignationFactor1: 0.333,
        eosbResignationFactor2: 0.667,
        eosbMinServiceMonths: 24,
        socialInsuranceEmployeeRate: 9.75,
        socialInsuranceEmployerRate: 11.75,
        socialInsuranceMaxWage: 45000,
        pensionEmployeeRate: 9.75,
        pensionEmployerRate: 9.75,
        unemploymentEmployeeRate: 0,
        unemploymentEmployerRate: 2,
        occupationalHazardsRate: 2,
        weekendDays: ['Friday', 'Saturday'],
        workWeekStartDay: 'Sunday',
        currencyCode: 'SAR',
        status: 'Active',
      },
    });
  }

  // India
  const existingIN = await prisma.labourLawConfig.findFirst({
    where: { countryCode: 'IN', effectiveFrom: new Date('2024-01-01') },
  });
  if (!existingIN) {
    await prisma.labourLawConfig.create({
      data: {
        countryCode: 'IN',
        countryName: 'India',
        countryNameAr: 'الهند',
        effectiveFrom: new Date('2024-01-01'),
        standardHoursPerDay: 8,
        standardHoursPerWeek: 48,
        maxOvertimeHoursPerDay: 2,
        maxOvertimeHoursPerYear: 200,
        overtimeRateNormal: 200,
        overtimeRateNight: 200,
        overtimeRateHoliday: 200,
        nightShiftStart: '22:00',
        nightShiftEnd: '06:00',
        maxProbationDays: 180,
        probationExtensionDays: 180,
        probationNoticeDays: 30,
        annualLeaveFirstYear: 15,
        annualLeaveAfterYears: 15,
        annualLeaveThresholdYears: 1,
        sickLeaveFullPay: 7,
        sickLeaveHalfPay: 0,
        sickLeaveUnpaid: 0,
        maternityLeaveDays: 182,
        maternityLeaveFullPay: 182,
        maternityLeaveHalfPay: 0,
        paternityLeaveDays: 15,
        bereavementLeaveSpouse: 5,
        bereavementLeaveFamily: 3,
        studyLeaveDays: 0,
        marriageLeaveDays: 3,
        eosbFirstPeriodYears: 5,
        eosbFirstPeriodDays: 15,
        eosbAfterPeriodDays: 15,
        eosbMinServiceMonths: 60,
        socialInsuranceEmployeeRate: 12,
        socialInsuranceEmployerRate: 12,
        socialInsuranceMaxWage: 15000,
        pensionEmployeeRate: 12,
        pensionEmployerRate: 3.67,
        weekendDays: ['Saturday', 'Sunday'],
        workWeekStartDay: 'Monday',
        currencyCode: 'INR',
        status: 'Active',
      },
    });
  }

  // ==================================================================
  // 2. WPSConfiguration — UAE WPS
  // ==================================================================
  console.log('    - Seeding WPSConfiguration...');

  const existingWPS = await prisma.wPSConfiguration.findFirst({
    where: { tenantId, companyId: companyGlobal.id },
  });
  if (!existingWPS) {
    await prisma.wPSConfiguration.create({
      data: {
        tenantId,
        companyId: companyGlobal.id,
        companyName: companyGlobal.name,
        wpsAgentCode: 'ENBD001',
        employerCode: 'MOL-AE-2024-0001',
        bankCode: 'EBILAEAD',
        bankName: 'Emirates NBD',
        bankBranchCode: 'DXB-MAIN',
        molEstablishmentId: 'MOL-EST-202400123',
        wpsFilePrefix: 'WPS',
        contactPerson: 'Ahmed Al Maktoum',
        contactEmail: 'wps-admin@kreupai.com',
        contactPhone: '+971-4-555-0100',
        isActive: true,
        autoSubmit: false,
        submissionDay: 25,
        reminderDays: 5,
        maxSalaryAmount: 999999999.99,
        minSalaryAmount: 0.01,
        requireLabourCard: true,
        createdBy: 'system-seed',
      },
    });
  }

  // ==================================================================
  // 3. GOSIConfiguration — KSA GOSI
  // ==================================================================
  console.log('    - Seeding GOSIConfiguration...');

  const existingGOSI = await prisma.gOSIConfiguration.findFirst({
    where: { tenantId, companyId: companyGlobal.id },
  });
  if (!existingGOSI) {
    await prisma.gOSIConfiguration.create({
      data: {
        tenantId,
        companyId: companyGlobal.id,
        gosiSubscriptionNumber: 'GOSI-2024-SA-00456',
        establishmentNumber: 'MOL-SA-EST-78901',
        bankAccountIBAN: 'SA03 8000 0000 6080 1016 7519',
        isActive: true,
      },
    });
  }

  // ==================================================================
  // 4. NitaqatConfiguration — Saudization
  // ==================================================================
  console.log('    - Seeding NitaqatConfiguration...');

  const existingNitaqat = await prisma.nitaqatConfiguration.findFirst({
    where: { tenantId, companyId: companyGlobal.id },
  });
  let nitaqatConfig = existingNitaqat;
  if (!nitaqatConfig) {
    nitaqatConfig = await prisma.nitaqatConfiguration.create({
      data: {
        tenantId,
        companyId: companyGlobal.id,
        industryCode: '6201',
        industryName: 'Computer Programming Activities',
        companySizeBand: 'Medium',
        requiredSaudiRatio: 25.0,
        targetRatio: 30.0,
        isActive: true,
      },
    });
  }

  // ==================================================================
  // 5. NitaqatSnapshot — 2 snapshots
  // ==================================================================
  console.log('    - Seeding NitaqatSnapshot...');

  const existingSnapshot1 = await prisma.nitaqatSnapshot.findFirst({
    where: {
      configId: nitaqatConfig.id,
      snapshotDate: new Date('2024-01-15'),
    },
  });
  if (!existingSnapshot1) {
    await prisma.nitaqatSnapshot.create({
      data: {
        configId: nitaqatConfig.id,
        snapshotDate: new Date('2024-01-15'),
        totalEmployees: 120,
        saudiEmployees: 35,
        nonSaudiEmployees: 85,
        currentRatio: 29.17,
        nitaqatBand: 'GREEN_MEDIUM',
        deficit: 0,
        surplus: 5,
        notes: 'Q1 2024 quarterly snapshot — above minimum requirement',
      },
    });
  }

  const existingSnapshot2 = await prisma.nitaqatSnapshot.findFirst({
    where: {
      configId: nitaqatConfig.id,
      snapshotDate: new Date('2024-04-15'),
    },
  });
  if (!existingSnapshot2) {
    await prisma.nitaqatSnapshot.create({
      data: {
        configId: nitaqatConfig.id,
        snapshotDate: new Date('2024-04-15'),
        totalEmployees: 128,
        saudiEmployees: 40,
        nonSaudiEmployees: 88,
        currentRatio: 31.25,
        nitaqatBand: 'GREEN_HIGH',
        previousBand: 'GREEN_MEDIUM',
        deficit: 0,
        surplus: 8,
        notes: 'Q2 2024 quarterly snapshot — improved to GREEN_HIGH band',
      },
    });
  }

  // ==================================================================
  // 6. EosbCalculation — 2 demo calculations
  //
  // Ported 2026-06-17 from the older `EOSBCalculation` (uppercase) model
  // to the current `EosbCalculation` (lowercase). Both models had been
  // mapped to the same `aura_eosb_calculation` table, which blocked
  // `prisma generate` on a clean clone (audit 2026-06-17 §9). The old
  // model is dropped in the same commit; this seed now writes the
  // canonical shape that apps/web/src/lib/services/eosb-compliance/
  // consumes.
  // ==================================================================
  console.log('    - Seeding EosbCalculation...');

  const empId = employees[0].id;

  const existingEOSB1 = await prisma.eosbCalculation.findFirst({
    where: { tenantId, employeeId: empId, lastWorkingDate: new Date('2024-09-30') },
  });
  if (!existingEOSB1) {
    await prisma.eosbCalculation.create({
      data: {
        tenantId,
        employeeId: empId,
        countryCode: 'AE',
        joiningDate: new Date('2019-03-15'),
        lastWorkingDate: new Date('2024-09-30'),
        terminationType: 'RESIGNATION',
        basicSalary: 15000,
        totalServiceYears: 5.54,
        totalServiceMonths: 66,
        unpaidLeaveDays: 0,
        dailyRate: 500,
        gratuityAmount: 60600,
        socialInsuranceOffset: 0,
        netPayable: 60600,
        currency: 'AED',
        law: 'UAE Federal Decree-Law No. 33 of 2021',
        formula: '(Years ≤ 5) × 21 days × Daily Rate + (Years > 5) × 30 days × Daily Rate',
        notesJson: [
          'First period: 21 days × 5 years × 500 AED/day = 52,500 AED',
          'Second period: 30 days × 0.54 years × 500 AED/day = 8,100 AED',
          'Full entitlement (>5 years resignation)',
        ],
        status: 'DRAFT',
      },
    });
  }

  const existingEOSB2 = await prisma.eosbCalculation.findFirst({
    where: { tenantId, employeeId: empId, lastWorkingDate: new Date('2024-12-31') },
  });
  if (!existingEOSB2) {
    await prisma.eosbCalculation.create({
      data: {
        tenantId,
        employeeId: empId,
        countryCode: 'SA',
        joiningDate: new Date('2020-06-01'),
        lastWorkingDate: new Date('2024-12-31'),
        terminationType: 'END_OF_CONTRACT',
        basicSalary: 12000,
        totalServiceYears: 4.58,
        totalServiceMonths: 55,
        unpaidLeaveDays: 0,
        dailyRate: 400,
        gratuityAmount: 27480,
        socialInsuranceOffset: 0,
        netPayable: 27480,
        currency: 'SAR',
        law: 'Saudi Labour Law Article 84',
        formula: '(Years ≤ 5) × 15 days × Daily Rate + (Years > 5) × 30 days × Daily Rate',
        notesJson: [
          'First period: 15 days × 4.58 years × 400 SAR/day = 27,480 SAR',
          'Service under 5 years — second period not applicable',
          'End of contract — full entitlement',
        ],
        status: 'APPROVED',
        approvedBy: 'HR Director',
        approvedAt: new Date('2024-12-20'),
      },
    });
  }

  // ==================================================================
  // 7. Translation — 16 bilingual entries (en-US / ar-SA)
  // ==================================================================
  console.log('    - Seeding Translations...');

  const translations = [
    // System-wide translations (tenantId = null) — common namespace
    { tenantId: null, locale: 'en-US', namespace: 'common', key: 'app.name', value: 'AuraOS' },
    { tenantId: null, locale: 'ar-SA', namespace: 'common', key: 'app.name', value: 'أورا أو إس' },
    { tenantId: null, locale: 'en-US', namespace: 'common', key: 'actions.save', value: 'Save' },
    { tenantId: null, locale: 'ar-SA', namespace: 'common', key: 'actions.save', value: 'حفظ' },
    { tenantId: null, locale: 'en-US', namespace: 'common', key: 'actions.cancel', value: 'Cancel' },
    { tenantId: null, locale: 'ar-SA', namespace: 'common', key: 'actions.cancel', value: 'إلغاء' },
    { tenantId: null, locale: 'en-US', namespace: 'common', key: 'actions.submit', value: 'Submit' },
    { tenantId: null, locale: 'ar-SA', namespace: 'common', key: 'actions.submit', value: 'إرسال' },
    { tenantId: null, locale: 'en-US', namespace: 'common', key: 'actions.approve', value: 'Approve' },
    { tenantId: null, locale: 'ar-SA', namespace: 'common', key: 'actions.approve', value: 'موافقة' },
    // Employee namespace
    { tenantId: null, locale: 'en-US', namespace: 'employee', key: 'profile.title', value: 'Employee Profile' },
    { tenantId: null, locale: 'ar-SA', namespace: 'employee', key: 'profile.title', value: 'ملف الموظف' },
    // Payroll namespace
    { tenantId: null, locale: 'en-US', namespace: 'payroll', key: 'eosb.title', value: 'End of Service Benefits' },
    { tenantId: null, locale: 'ar-SA', namespace: 'payroll', key: 'eosb.title', value: 'مكافأة نهاية الخدمة' },
    { tenantId: null, locale: 'en-US', namespace: 'payroll', key: 'wps.title', value: 'Wage Protection System' },
    { tenantId: null, locale: 'ar-SA', namespace: 'payroll', key: 'wps.title', value: 'نظام حماية الأجور' },
    // Leave namespace
    { tenantId: null, locale: 'en-US', namespace: 'leave', key: 'request.title', value: 'Leave Request' },
    { tenantId: null, locale: 'ar-SA', namespace: 'leave', key: 'request.title', value: 'طلب إجازة' },
    { tenantId: null, locale: 'en-US', namespace: 'leave', key: 'balance.title', value: 'Leave Balance' },
    { tenantId: null, locale: 'ar-SA', namespace: 'leave', key: 'balance.title', value: 'رصيد الإجازات' },
  ];

  for (const t of translations) {
    const existing = await prisma.translation.findFirst({
      where: {
        tenantId: t.tenantId,
        locale: t.locale,
        namespace: t.namespace,
        key: t.key,
      },
    });
    if (!existing) {
      await prisma.translation.create({ data: t });
    }
  }

  // ==================================================================
  // 8. LocalizationConfig — UAE-focused
  // ==================================================================
  console.log('    - Seeding LocalizationConfig...');

  const existingLocalization = await prisma.localizationConfig.findFirst({
    where: { tenantId },
  });
  if (!existingLocalization) {
    await prisma.localizationConfig.create({
      data: {
        tenantId,
        defaultLocale: 'en-US',
        supportedLocales: ['en-US', 'ar-SA', 'ar-AE', 'hi-IN'],
        fallbackLocale: 'en-US',
        defaultTimezone: 'Asia/Dubai',
        defaultCurrency: 'AED',
        defaultCalendar: 'gregorian',
        showHijriDates: true,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        firstDayOfWeek: 'Sunday',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencyPosition: 'before',
      },
    });
  }

  // ==================================================================
  // 9. IndiaPFConfiguration
  // ==================================================================
  console.log('    - Seeding IndiaPFConfiguration...');

  const existingPF = await prisma.indiaPFConfiguration.findFirst({
    where: { tenantId, companyId: indiaCompanyId },
  });
  let pfConfig = existingPF;
  if (!pfConfig) {
    pfConfig = await prisma.indiaPFConfiguration.create({
      data: {
        tenantId,
        companyId: indiaCompanyId,
        epfoEstablishmentId: 'BGBNG0012345',
        epfoRegistrationNumber: 'KA/BNG/0012345/000',
        employeeContributionRate: 12,
        employerContributionRate: 12,
        adminChargesRate: 0.5,
        edliChargesRate: 0.5,
        wageCeiling: 15000,
        pensionWageCeiling: 15000,
        isVoluntaryHigherAllowed: true,
        isActive: true,
      },
    });
  }

  // ==================================================================
  // 10. IndiaPFSubmission — Jan & Feb 2025
  // ==================================================================
  console.log('    - Seeding IndiaPFSubmission...');

  // January 2025 — SUBMITTED
  const existingPFSub1 = await prisma.indiaPFSubmission.findFirst({
    where: { tenantId, configId: pfConfig.id, contributionMonth: '2025-01' },
  });
  let pfSubJan = existingPFSub1;
  if (!pfSubJan) {
    pfSubJan = await prisma.indiaPFSubmission.create({
      data: {
        tenantId,
        configId: pfConfig.id,
        contributionMonth: '2025-01',
        status: 'SUBMITTED',
        submissionDate: new Date('2025-02-12'),
        totalEmployees: 4,
        totalWages: 60000,
        totalEmployeeContribution: 7200,
        totalEmployerPF: 4392,
        totalEmployerEPS: 2808,
        totalAdminCharges: 300,
        totalEDLI: 300,
        grandTotal: 15000,
        ecrFileName: 'ECR_KA_BNG_0012345_202501.txt',
        ecrFileUrl: '/uploads/ecr/ECR_KA_BNG_0012345_202501.txt',
        challanNumber: 'CHL-PF-202501-001',
        trrn: 'TRRN2025010012345678',
        processedAt: new Date('2025-02-12'),
      },
    });
  }

  // February 2025 — DRAFT
  const existingPFSub2 = await prisma.indiaPFSubmission.findFirst({
    where: { tenantId, configId: pfConfig.id, contributionMonth: '2025-02' },
  });
  let pfSubFeb = existingPFSub2;
  if (!pfSubFeb) {
    pfSubFeb = await prisma.indiaPFSubmission.create({
      data: {
        tenantId,
        configId: pfConfig.id,
        contributionMonth: '2025-02',
        status: 'DRAFT',
        totalEmployees: 4,
        totalWages: 62000,
        totalEmployeeContribution: 7440,
        totalEmployerPF: 4540,
        totalEmployerEPS: 2900,
        totalAdminCharges: 310,
        totalEDLI: 310,
        grandTotal: 15500,
      },
    });
  }

  // ==================================================================
  // 11. IndiaPFRecord — 4 records per submission (Jan)
  // ==================================================================
  console.log('    - Seeding IndiaPFRecord...');

  const pfRecordDefsJan = [
    {
      employeeIdx: 0,
      uanNumber: '100987654321',
      pfAccountNumber: 'KA/BNG/0012345/000/0001001',
      basicWages: 15000,
      dearnessAllowance: 0,
      contributableWages: 15000,
      employeeContribution: 1800,
      employerPFContribution: 1098,
      employerEPSContribution: 702,
      ncpDays: 0,
      status: 'SUBMITTED' as const,
    },
    {
      employeeIdx: 1,
      uanNumber: '100987654322',
      pfAccountNumber: 'KA/BNG/0012345/000/0001002',
      basicWages: 15000,
      dearnessAllowance: 0,
      contributableWages: 15000,
      employeeContribution: 1800,
      employerPFContribution: 1098,
      employerEPSContribution: 702,
      ncpDays: 0,
      status: 'SUBMITTED' as const,
    },
    {
      employeeIdx: 2,
      uanNumber: '100987654323',
      pfAccountNumber: 'KA/BNG/0012345/000/0001003',
      basicWages: 18000,
      dearnessAllowance: 0,
      contributableWages: 15000,
      employeeContribution: 1800,
      employerPFContribution: 1098,
      employerEPSContribution: 702,
      ncpDays: 2,
      status: 'SUBMITTED' as const,
    },
    {
      employeeIdx: 3,
      uanNumber: '100987654324',
      pfAccountNumber: 'KA/BNG/0012345/000/0001004',
      basicWages: 12000,
      dearnessAllowance: 0,
      contributableWages: 12000,
      employeeContribution: 1800,
      employerPFContribution: 1098,
      employerEPSContribution: 702,
      ncpDays: 0,
      status: 'SUBMITTED' as const,
    },
  ];

  for (const def of pfRecordDefsJan) {
    const emp = pick(employees, def.employeeIdx);
    const existing = await prisma.indiaPFRecord.findFirst({
      where: { submissionId: pfSubJan.id, employeeId: emp.id },
    });
    if (!existing) {
      await prisma.indiaPFRecord.create({
        data: {
          submissionId: pfSubJan.id,
          employeeId: emp.id,
          uanNumber: def.uanNumber,
          pfAccountNumber: def.pfAccountNumber,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          dateOfJoining: emp.joiningDate ?? new Date('2022-01-15'),
          gender: 'Male',
          basicWages: def.basicWages,
          dearnessAllowance: def.dearnessAllowance,
          contributableWages: def.contributableWages,
          employeeContribution: def.employeeContribution,
          employerPFContribution: def.employerPFContribution,
          employerEPSContribution: def.employerEPSContribution,
          ncpDays: def.ncpDays,
          status: def.status,
        },
      });
    }
  }

  // February PF records (3 records — one employee on leave)
  const pfRecordDefsFeb = [
    {
      employeeIdx: 0,
      uanNumber: '100987654321',
      basicWages: 15000,
      contributableWages: 15000,
      employeeContribution: 1800,
      employerPFContribution: 1098,
      employerEPSContribution: 702,
      ncpDays: 0,
      status: 'PENDING' as const,
    },
    {
      employeeIdx: 1,
      uanNumber: '100987654322',
      basicWages: 16000,
      contributableWages: 15000,
      employeeContribution: 1800,
      employerPFContribution: 1098,
      employerEPSContribution: 702,
      ncpDays: 0,
      status: 'VALID' as const,
    },
    {
      employeeIdx: 2,
      uanNumber: '100987654323',
      basicWages: 18000,
      contributableWages: 15000,
      employeeContribution: 1800,
      employerPFContribution: 1098,
      employerEPSContribution: 702,
      ncpDays: 5,
      status: 'PENDING' as const,
    },
  ];

  for (const def of pfRecordDefsFeb) {
    const emp = pick(employees, def.employeeIdx);
    const existing = await prisma.indiaPFRecord.findFirst({
      where: { submissionId: pfSubFeb.id, employeeId: emp.id },
    });
    if (!existing) {
      await prisma.indiaPFRecord.create({
        data: {
          submissionId: pfSubFeb.id,
          employeeId: emp.id,
          uanNumber: def.uanNumber,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          dateOfJoining: emp.joiningDate ?? new Date('2022-01-15'),
          gender: 'Male',
          basicWages: def.basicWages,
          dearnessAllowance: 0,
          contributableWages: def.contributableWages,
          employeeContribution: def.employeeContribution,
          employerPFContribution: def.employerPFContribution,
          employerEPSContribution: def.employerEPSContribution,
          ncpDays: def.ncpDays,
          status: def.status,
        },
      });
    }
  }

  // ==================================================================
  // 12. IndiaESIConfiguration
  // ==================================================================
  console.log('    - Seeding IndiaESIConfiguration...');

  const existingESI = await prisma.indiaESIConfiguration.findFirst({
    where: { tenantId, companyId: indiaCompanyId },
  });
  let esiConfig = existingESI;
  if (!esiConfig) {
    esiConfig = await prisma.indiaESIConfiguration.create({
      data: {
        tenantId,
        companyId: indiaCompanyId,
        esicCode: '31-00-123456-000-0001',
        esicSubCode: '001',
        regionCode: 'KA',
        employeeContributionRate: 0.75,
        employerContributionRate: 3.25,
        wageCeiling: 21000,
        isActive: true,
      },
    });
  }

  // ==================================================================
  // 13. IndiaESISubmission — Jan 2025 (SUBMITTED)
  // ==================================================================
  console.log('    - Seeding IndiaESISubmission...');

  const existingESISub = await prisma.indiaESISubmission.findFirst({
    where: { tenantId, configId: esiConfig.id, contributionMonth: '2025-01' },
  });
  let esiSubJan = existingESISub;
  if (!esiSubJan) {
    esiSubJan = await prisma.indiaESISubmission.create({
      data: {
        tenantId,
        configId: esiConfig.id,
        contributionMonth: '2025-01',
        status: 'SUBMITTED',
        submissionDate: new Date('2025-02-10'),
        totalEmployees: 3,
        totalWages: 51000,
        totalEmployeeContribution: 382.5,
        totalEmployerContribution: 1657.5,
        grandTotal: 2040,
        fileName: 'ESI_KA_31_00_123456_202501.txt',
        fileUrl: '/uploads/esi/ESI_KA_31_00_123456_202501.txt',
        challanNumber: 'CHL-ESI-202501-001',
        processedAt: new Date('2025-02-10'),
      },
    });
  }

  // ==================================================================
  // 14. IndiaESIRecord — 3 records for Jan 2025
  // ==================================================================
  console.log('    - Seeding IndiaESIRecord...');

  const esiRecordDefs = [
    {
      employeeIdx: 0,
      esiNumber: '3100123456000100001',
      grossWages: 18000,
      workingDays: 26,
      employeeContribution: 135,
      employerContribution: 585,
      totalContribution: 720,
      status: 'SUBMITTED' as const,
    },
    {
      employeeIdx: 1,
      esiNumber: '3100123456000100002',
      grossWages: 17000,
      workingDays: 26,
      employeeContribution: 127.5,
      employerContribution: 552.5,
      totalContribution: 680,
      status: 'SUBMITTED' as const,
    },
    {
      employeeIdx: 2,
      esiNumber: '3100123456000100003',
      grossWages: 16000,
      workingDays: 24,
      employeeContribution: 120,
      employerContribution: 520,
      totalContribution: 640,
      status: 'SUBMITTED' as const,
    },
  ];

  for (const def of esiRecordDefs) {
    const emp = pick(employees, def.employeeIdx);
    const existing = await prisma.indiaESIRecord.findFirst({
      where: { submissionId: esiSubJan.id, employeeId: emp.id },
    });
    if (!existing) {
      await prisma.indiaESIRecord.create({
        data: {
          submissionId: esiSubJan.id,
          employeeId: emp.id,
          esiNumber: def.esiNumber,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          dateOfJoining: emp.joiningDate ?? new Date('2022-01-15'),
          grossWages: def.grossWages,
          workingDays: def.workingDays,
          employeeContribution: def.employeeContribution,
          employerContribution: def.employerContribution,
          totalContribution: def.totalContribution,
          status: def.status,
        },
      });
    }
  }

  // ==================================================================
  // 15. IndiaTDSConfiguration
  // ==================================================================
  console.log('    - Seeding IndiaTDSConfiguration...');

  const existingTDS = await prisma.indiaTDSConfiguration.findFirst({
    where: { tenantId, companyId: indiaCompanyId, assessmentYear: '2025-26' },
  });
  let tdsConfig = existingTDS;
  if (!tdsConfig) {
    tdsConfig = await prisma.indiaTDSConfiguration.create({
      data: {
        tenantId,
        companyId: indiaCompanyId,
        tanNumber: 'BLRK12345A',
        panNumber: 'AAACK1234F',
        assessmentYear: '2025-26',
        defaultRegime: 'NEW',
        isActive: true,
      },
    });
  }

  // ==================================================================
  // 16. IndiaTDSDeclaration — OLD regime + NEW regime
  // ==================================================================
  console.log('    - Seeding IndiaTDSDeclaration...');

  // Employee 0 — OLD regime with Section 80C/80D deductions
  const tdsEmp0 = pick(employees, 0);
  const existingTDSDecl1 = await prisma.indiaTDSDeclaration.findFirst({
    where: { employeeId: tdsEmp0.id, financialYear: '2024-25' },
  });
  if (!existingTDSDecl1) {
    await prisma.indiaTDSDeclaration.create({
      data: {
        tenantId,
        configId: tdsConfig.id,
        employeeId: tdsEmp0.id,
        panNumber: 'ABCPD1234E',
        employeeName: `${tdsEmp0.firstName} ${tdsEmp0.lastName}`,
        financialYear: '2024-25',
        taxRegime: 'OLD',
        annualGrossSalary: 1200000,
        annualTaxableIncome: 1200000,
        hraExemption: 180000,
        ltaExemption: 30000,
        otherExemptions: 0,
        section80C: 150000,
        section80CCD1B: 50000,
        section80D: 25000,
        section80E: 0,
        section24B: 200000,
        standardDeduction: 50000,
        otherDeductions: 0,
        taxableIncomeAfterDeductions: 515000,
        taxBeforeRebate: 26000,
        rebateUnder87A: 0,
        taxAfterRebate: 26000,
        cess: 1040,
        totalTaxLiability: 27040,
        monthlyTDS: 2253,
        status: 'APPROVED',
        submittedAt: new Date('2024-04-15'),
        approvedAt: new Date('2024-04-20'),
        approvedBy: 'HR Manager',
      },
    });
  }

  // Employee 1 — NEW regime (minimal deductions)
  const tdsEmp1 = pick(employees, 1);
  const existingTDSDecl2 = await prisma.indiaTDSDeclaration.findFirst({
    where: { employeeId: tdsEmp1.id, financialYear: '2024-25' },
  });
  if (!existingTDSDecl2) {
    await prisma.indiaTDSDeclaration.create({
      data: {
        tenantId,
        configId: tdsConfig.id,
        employeeId: tdsEmp1.id,
        panNumber: 'EFGPH5678K',
        employeeName: `${tdsEmp1.firstName} ${tdsEmp1.lastName}`,
        financialYear: '2024-25',
        taxRegime: 'NEW',
        annualGrossSalary: 900000,
        annualTaxableIncome: 900000,
        hraExemption: 0,
        ltaExemption: 0,
        otherExemptions: 0,
        section80C: 0,
        section80CCD1B: 0,
        section80D: 0,
        section80E: 0,
        section24B: 0,
        standardDeduction: 75000,
        otherDeductions: 0,
        taxableIncomeAfterDeductions: 825000,
        taxBeforeRebate: 47500,
        rebateUnder87A: 0,
        taxAfterRebate: 47500,
        cess: 1900,
        totalTaxLiability: 49400,
        monthlyTDS: 4117,
        status: 'SUBMITTED',
        submittedAt: new Date('2024-04-10'),
      },
    });
  }

  // ==================================================================
  // 17. IndiaProfessionalTaxConfig — Maharashtra
  // ==================================================================
  console.log('    - Seeding IndiaProfessionalTaxConfig...');

  const existingPTMH = await prisma.indiaProfessionalTaxConfig.findFirst({
    where: { tenantId, companyId: indiaCompanyId, stateCode: 'MH' },
  });
  let ptConfigMH = existingPTMH;
  if (!ptConfigMH) {
    ptConfigMH = await prisma.indiaProfessionalTaxConfig.create({
      data: {
        tenantId,
        companyId: indiaCompanyId,
        stateCode: 'MH',
        stateName: 'Maharashtra',
        ptRegistrationNumber: 'MH-PT-2024-00123',
        ptCircle: 'Mumbai-Central',
        slabs: [
          { minSalary: 0, maxSalary: 7500, monthlyTax: 0 },
          { minSalary: 7501, maxSalary: 10000, monthlyTax: 175 },
          { minSalary: 10001, maxSalary: 999999, monthlyTax: 200 },
          { minSalary: 10001, maxSalary: 999999, monthlyTax: 300, month: 'February' },
        ],
        maxAnnualTax: 2500,
        isActive: true,
      },
    });
  }

  // Karnataka
  const existingPTKA = await prisma.indiaProfessionalTaxConfig.findFirst({
    where: { tenantId, companyId: indiaCompanyId, stateCode: 'KA' },
  });
  if (!existingPTKA) {
    await prisma.indiaProfessionalTaxConfig.create({
      data: {
        tenantId,
        companyId: indiaCompanyId,
        stateCode: 'KA',
        stateName: 'Karnataka',
        ptRegistrationNumber: 'KA-PT-2024-00456',
        ptCircle: 'Bangalore-South',
        slabs: [
          { minSalary: 0, maxSalary: 15000, monthlyTax: 0 },
          { minSalary: 15001, maxSalary: 25000, monthlyTax: 200 },
          { minSalary: 25001, maxSalary: 999999, monthlyTax: 200 },
        ],
        maxAnnualTax: 2500,
        isActive: true,
      },
    });
  }

  // ==================================================================
  // 18. IndiaProfessionalTaxDeduction — 3 monthly deductions
  // ==================================================================
  console.log('    - Seeding IndiaProfessionalTaxDeduction...');

  const ptDeductionDefs = [
    {
      employeeIdx: 0,
      deductionMonth: '2025-01',
      grossSalary: 45000,
      taxAmount: 200,
      isFebruaryAdjustment: false,
      status: 'REMITTED' as const,
    },
    {
      employeeIdx: 1,
      deductionMonth: '2025-01',
      grossSalary: 38000,
      taxAmount: 200,
      isFebruaryAdjustment: false,
      status: 'DEDUCTED' as const,
    },
    {
      employeeIdx: 0,
      deductionMonth: '2025-02',
      grossSalary: 45000,
      taxAmount: 300,
      isFebruaryAdjustment: true,
      status: 'DEDUCTED' as const,
    },
  ];

  for (const def of ptDeductionDefs) {
    const emp = pick(employees, def.employeeIdx);
    const existing = await prisma.indiaProfessionalTaxDeduction.findFirst({
      where: { employeeId: emp.id, deductionMonth: def.deductionMonth },
    });
    if (!existing) {
      await prisma.indiaProfessionalTaxDeduction.create({
        data: {
          tenantId,
          configId: ptConfigMH.id,
          employeeId: emp.id,
          deductionMonth: def.deductionMonth,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          grossSalary: def.grossSalary,
          taxAmount: def.taxAmount,
          isFebruaryAdjustment: def.isFebruaryAdjustment,
          status: def.status,
        },
      });
    }
  }

  // ==================================================================
  // 19. ComplianceAuditLog — 7 entries across modules
  // ==================================================================
  console.log('    - Seeding ComplianceAuditLog...');

  const auditEntries = [
    {
      tenantId,
      companyId: companyGlobal.id,
      action: 'SUBMISSION',
      module: 'WPS',
      entityType: 'Submission',
      entityId: 'wps-submission-seed-jan25',
      performedBy: 'system-seed',
      performedByName: 'System Seed',
      message: 'WPS salary file submitted for January 2025 — 120 employees processed',
      messageAr: 'تم تقديم ملف الرواتب لنظام حماية الأجور لشهر يناير 2025 — تمت معالجة 120 موظف',
    },
    {
      tenantId,
      companyId: companyGlobal.id,
      action: 'VALIDATION',
      module: 'WPS',
      entityType: 'Submission',
      entityId: 'wps-submission-seed-jan25',
      performedBy: 'system-seed',
      performedByName: 'System Seed',
      message: 'WPS file validation passed — all records match MOL requirements',
      messageAr: 'اجتاز ملف نظام حماية الأجور التحقق — جميع السجلات تتطابق مع متطلبات وزارة العمل',
    },
    {
      tenantId,
      companyId: companyGlobal.id,
      action: 'SUBMISSION',
      module: 'GOSI',
      entityType: 'Submission',
      entityId: 'gosi-submission-seed-jan25',
      performedBy: 'system-seed',
      performedByName: 'System Seed',
      message: 'GOSI monthly contribution submitted for January 2025 — SAR 145,600',
      messageAr: 'تم تقديم اشتراكات التأمينات الاجتماعية الشهرية لشهر يناير 2025 — 145,600 ريال',
    },
    {
      tenantId,
      companyId: indiaCompanyId,
      action: 'SUBMISSION',
      module: 'PF',
      entityType: 'Submission',
      entityId: 'pf-submission-seed-jan25',
      performedBy: 'system-seed',
      performedByName: 'System Seed',
      message: 'EPF ECR file submitted for January 2025 — 4 employees, INR 15,000 total',
      messageAr: 'تم تقديم ملف صندوق التوفير لشهر يناير 2025 — 4 موظفين، 15,000 روبية إجمالي',
    },
    {
      tenantId,
      companyId: indiaCompanyId,
      action: 'VALIDATION',
      module: 'ESI',
      entityType: 'Submission',
      entityId: 'esi-submission-seed-jan25',
      performedBy: 'system-seed',
      performedByName: 'System Seed',
      message: 'ESI contribution validated for January 2025 — 3 eligible employees',
      messageAr: 'تم التحقق من اشتراكات التأمين الحكومي لشهر يناير 2025 — 3 موظفين مؤهلين',
    },
    {
      tenantId,
      companyId: indiaCompanyId,
      action: 'APPROVAL',
      module: 'PF',
      entityType: 'Configuration',
      entityId: 'pf-config-seed',
      performedBy: 'system-seed',
      performedByName: 'System Seed',
      message: 'India PF configuration approved for KREUP_INDIA — standard EPF rates applied',
      messageAr: 'تمت الموافقة على تكوين صندوق التوفير الهندي لشركة KREUP_INDIA — تم تطبيق معدلات EPF القياسية',
    },
    {
      tenantId,
      companyId: companyGlobal.id,
      action: 'APPROVAL',
      module: 'EOSB',
      entityType: 'Calculation',
      entityId: 'eosb-calc-seed-final',
      performedBy: 'system-seed',
      performedByName: 'System Seed',
      message: 'EOSB final calculation approved for KSA employee — SAR 27,480 net payout',
      messageAr: 'تمت الموافقة على الحساب النهائي لمكافأة نهاية الخدمة لموظف السعودية — 27,480 ريال صافي',
    },
  ];

  for (const entry of auditEntries) {
    const existing = await prisma.complianceAuditLog.findFirst({
      where: {
        tenantId,
        module: entry.module,
        entityId: entry.entityId,
        action: entry.action,
      },
    });
    if (!existing) {
      await prisma.complianceAuditLog.create({ data: entry });
    }
  }

  console.log('  Compliance & Statutory data seeded successfully');
}

// ------------------------------------------------------------------
// Standalone execution
// ------------------------------------------------------------------
if (require.main === module) {
  const _prisma = new PrismaClient();
  const tenantId = process.argv[2] || 'default-tenant';
  seedComplianceStatutory(_prisma, tenantId)
    .then(() => {
      console.log('Done');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    })
    .finally(() => _prisma.$disconnect());
}
