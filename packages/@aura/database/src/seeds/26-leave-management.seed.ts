/**
 * @seed Leave Management
 * @description Comprehensive leave management seed data including policies,
 *   balances, requests, accruals, carry-forwards, and encashments.
 *   Aligned with GCC labour law entitlements (UAE/KSA focus).
 * @project AuraOS Enterprise HCM
 */

import { PrismaClient, LeaveAccrualType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// ---------------------------------------------------------------------------
// Policy definitions — GCC-centric with statutory entitlements
// ---------------------------------------------------------------------------
const policyDefs = [
  {
    code: 'POL_AL_UAE',
    name: 'Annual Leave — UAE',
    nameAr: 'إجازة سنوية — الإمارات',
    leaveTypeCode: 'AL_UAE',
    countryCode: 'AE',
    annualEntitlement: 30,
    accrualType: 'MONTHLY' as LeaveAccrualType,
    accrualRate: 2.5,
    allowCarryForward: true,
    maxCarryForwardDays: 30,
    allowEncashment: true,
    maxEncashmentDays: 30,
    requiresApproval: true,
    requiresDocument: false,
    proRataOnJoining: true,
    minServiceMonths: 12,
    advanceNoticeDays: 14,
  },
  {
    code: 'POL_SL_UAE',
    name: 'Sick Leave — UAE',
    nameAr: 'إجازة مرضية — الإمارات',
    leaveTypeCode: 'SL_UAE',
    countryCode: 'AE',
    annualEntitlement: 15,
    accrualType: 'ANNUAL' as LeaveAccrualType,
    accrualRate: 15,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    allowEncashment: false,
    maxEncashmentDays: 0,
    requiresApproval: true,
    requiresDocument: true,
    proRataOnJoining: false,
    minServiceMonths: 3,
    advanceNoticeDays: 0,
  },
  {
    code: 'POL_ML_UAE',
    name: 'Maternity Leave — UAE',
    nameAr: 'إجازة أمومة — الإمارات',
    leaveTypeCode: 'ML_UAE',
    countryCode: 'AE',
    annualEntitlement: 60,
    accrualType: 'ANNUAL' as LeaveAccrualType,
    accrualRate: 60,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    allowEncashment: false,
    maxEncashmentDays: 0,
    requiresApproval: true,
    requiresDocument: true,
    proRataOnJoining: false,
    minServiceMonths: 12,
    advanceNoticeDays: 30,
  },
  {
    code: 'POL_PTL_UAE',
    name: 'Paternity Leave — UAE',
    nameAr: 'إجازة أبوة — الإمارات',
    leaveTypeCode: 'PTL_UAE',
    countryCode: 'AE',
    annualEntitlement: 5,
    accrualType: 'ANNUAL' as LeaveAccrualType,
    accrualRate: 5,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    allowEncashment: false,
    maxEncashmentDays: 0,
    requiresApproval: true,
    requiresDocument: true,
    proRataOnJoining: false,
    minServiceMonths: 0,
    advanceNoticeDays: 0,
  },
  {
    code: 'POL_BRV_UAE',
    name: 'Compassionate Leave — UAE',
    nameAr: 'إجازة عزاء — الإمارات',
    leaveTypeCode: 'BRV_UAE',
    countryCode: 'AE',
    annualEntitlement: 5,
    accrualType: 'ANNUAL' as LeaveAccrualType,
    accrualRate: 5,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    allowEncashment: false,
    maxEncashmentDays: 0,
    requiresApproval: true,
    requiresDocument: true,
    proRataOnJoining: false,
    minServiceMonths: 0,
    advanceNoticeDays: 0,
  },
  {
    code: 'POL_HAJJ_KSA',
    name: 'Hajj Leave — KSA',
    nameAr: 'إجازة الحج — المملكة العربية السعودية',
    leaveTypeCode: 'HAJJ_KSA',
    countryCode: 'SA',
    annualEntitlement: 15,
    accrualType: 'ANNUAL' as LeaveAccrualType,
    accrualRate: 15,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    allowEncashment: false,
    maxEncashmentDays: 0,
    requiresApproval: true,
    requiresDocument: true,
    proRataOnJoining: false,
    minServiceMonths: 24,
    advanceNoticeDays: 30,
  },
];

export async function seedLeaveManagement(prisma: PrismaClient, tenantId: string) {
  console.log('  Seeding Leave Management data...');

  // ── Prerequisites ──
  const employees = await prisma.employee.findMany({ take: 10 });
  const leaveTypes = await prisma.leaveType.findMany();
  if (employees.length < 2 || leaveTypes.length === 0) {
    console.warn('  [SKIP] Need at least 2 employees and 1 leave type. Skipping leave management seed.');
    return;
  }

  const company = await prisma.company.findFirst({ where: { code: 'KREUP_GLOBAL' } });

  // Build lookup map: leaveType.code -> leaveType.id
  const ltMap = new Map<string, string>();
  for (const lt of leaveTypes) {
    ltMap.set(lt.code, lt.id);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. LEAVE POLICIES
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating leave policies...');
  const createdPolicies: Array<{ id: string; code: string; leaveTypeCode: string }> = [];

  for (const def of policyDefs) {
    const leaveTypeId = ltMap.get(def.leaveTypeCode);
    if (!leaveTypeId) {
      console.warn(`    [SKIP] Leave type "${def.leaveTypeCode}" not found. Skipping policy "${def.code}".`);
      continue;
    }

    const existing = await prisma.leavePolicy.findFirst({
      where: { tenantId, code: def.code },
    });

    if (existing) {
      createdPolicies.push({ id: existing.id, code: def.code, leaveTypeCode: def.leaveTypeCode });
      continue;
    }

    const policy = await prisma.leavePolicy.create({
      data: {
        tenantId,
        companyId: company?.id ?? null,
        countryCode: def.countryCode,
        code: def.code,
        name: def.name,
        nameAr: def.nameAr,
        leaveTypeId,
        annualEntitlement: new Decimal(def.annualEntitlement),
        accrualType: def.accrualType,
        accrualRate: new Decimal(def.accrualRate),
        allowCarryForward: def.allowCarryForward,
        maxCarryForwardDays: def.maxCarryForwardDays > 0 ? new Decimal(def.maxCarryForwardDays) : null,
        allowEncashment: def.allowEncashment,
        maxEncashmentDays: def.maxEncashmentDays > 0 ? new Decimal(def.maxEncashmentDays) : null,
        requiresApproval: def.requiresApproval,
        requiresDocument: def.requiresDocument,
        proRataOnJoining: def.proRataOnJoining,
        minServiceMonths: def.minServiceMonths,
        advanceNoticeDays: def.advanceNoticeDays,
        isActive: true,
        effectiveFrom: new Date('2025-01-01'),
      },
    });
    createdPolicies.push({ id: policy.id, code: def.code, leaveTypeCode: def.leaveTypeCode });
  }
  console.log(`    Created/verified ${createdPolicies.length} leave policies`);

  if (createdPolicies.length === 0) {
    console.warn('    [SKIP] No policies created. Aborting remaining leave management seed.');
    return;
  }

  // Convenience lookups
  const policyByCode = (code: string) => createdPolicies.find((p) => p.code === code);
  const annualPolicy = policyByCode('POL_AL_UAE');
  const sickPolicy = policyByCode('POL_SL_UAE');

  // ──────────────────────────────────────────────────────────────────────────
  // 2. LEAVE BALANCES — one per employee per policy for year 2025
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating leave balances...');
  let balanceCount = 0;

  for (const emp of employees) {
    for (const policy of createdPolicies) {
      const existing = await prisma.leaveBalance.findFirst({
        where: { employeeId: emp.id, policyId: policy.id, leaveYear: 2025 },
      });
      if (existing) { balanceCount++; continue; }

      const policyDef = policyDefs.find((d) => d.code === policy.code);
      if (!policyDef) continue;

      // Simulate partial accrual through Q1 2025 (3 months)
      const monthsAccrued = 3;
      const accrued = policyDef.accrualType === 'MONTHLY'
        ? policyDef.accrualRate * monthsAccrued
        : policyDef.annualEntitlement;
      const taken = Math.floor(Math.random() * 3); // 0-2 days taken so far
      const openingBalance = policyDef.allowCarryForward ? Math.min(5, policyDef.annualEntitlement * 0.1) : 0;

      await prisma.leaveBalance.create({
        data: {
          tenantId,
          employeeId: emp.id,
          policyId: policy.id,
          leaveYear: 2025,
          openingBalance: new Decimal(openingBalance),
          accrued: new Decimal(accrued),
          taken: new Decimal(taken),
          currentBalance: new Decimal(openingBalance + accrued - taken),
          lastAccrualDate: new Date('2025-03-01'),
        },
      });
      balanceCount++;
    }
  }
  console.log(`    Created/verified ${balanceCount} leave balances`);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. LEAVE REQUESTS — 8 requests in various statuses
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating leave requests...');

  const requestDefs = [
    {
      empIdx: 0,
      policyCode: 'POL_AL_UAE',
      startDate: '2025-02-10',
      endDate: '2025-02-14',
      totalDays: 5,
      reason: 'Family vacation to home country',
      status: 'APPROVED',
      approvedBy: employees.length > 3 ? employees[3].id : employees[0].id,
    },
    {
      empIdx: 1,
      policyCode: 'POL_SL_UAE',
      startDate: '2025-03-03',
      endDate: '2025-03-05',
      totalDays: 3,
      reason: 'Flu and fever — medical certificate attached',
      status: 'APPROVED',
      approvedBy: employees.length > 3 ? employees[3].id : employees[0].id,
    },
    {
      empIdx: 2,
      policyCode: 'POL_AL_UAE',
      startDate: '2025-04-20',
      endDate: '2025-04-25',
      totalDays: 6,
      reason: 'Annual leave for Eid celebrations',
      status: 'PENDING',
    },
    {
      empIdx: 0,
      policyCode: 'POL_AL_UAE',
      startDate: '2025-06-01',
      endDate: '2025-06-15',
      totalDays: 15,
      reason: 'Extended summer vacation',
      status: 'PENDING',
    },
    {
      empIdx: 3 % employees.length,
      policyCode: 'POL_BRV_UAE',
      startDate: '2025-01-20',
      endDate: '2025-01-22',
      totalDays: 3,
      reason: 'Bereavement — passing of close family member',
      status: 'APPROVED',
      approvedBy: employees[0].id,
    },
    {
      empIdx: 4 % employees.length,
      policyCode: 'POL_AL_UAE',
      startDate: '2025-03-15',
      endDate: '2025-03-20',
      totalDays: 6,
      reason: 'Personal travel',
      status: 'REJECTED',
      rejectedBy: employees[0].id,
      rejectionReason: 'Overlaps with project deadline — please reschedule',
    },
    {
      empIdx: 1,
      policyCode: 'POL_AL_UAE',
      startDate: '2025-05-10',
      endDate: '2025-05-12',
      totalDays: 3,
      reason: 'Short personal leave',
      status: 'CANCELLED',
      cancellationReason: 'Plans changed — no longer needed',
    },
    {
      empIdx: 5 % employees.length,
      policyCode: 'POL_HAJJ_KSA',
      startDate: '2025-06-05',
      endDate: '2025-06-19',
      totalDays: 15,
      reason: 'Hajj pilgrimage leave as per KSA Labour Law Article 115',
      status: 'PENDING',
    },
  ];

  let requestCount = 0;
  for (const req of requestDefs) {
    const emp = employees[req.empIdx];
    const policy = policyByCode(req.policyCode);
    if (!policy) continue;

    const leaveTypeId = ltMap.get(policy.leaveTypeCode);
    if (!leaveTypeId) continue;

    // Idempotency: check for existing request with same employee + dates
    const existing = await prisma.leaveRequest.findFirst({
      where: {
        tenantId,
        employeeId: emp.id,
        startDate: new Date(req.startDate),
        endDate: new Date(req.endDate),
      },
    });
    if (existing) { requestCount++; continue; }

    await prisma.leaveRequest.create({
      data: {
        tenantId,
        employeeId: emp.id,
        leaveTypeId,
        policyId: policy.id,
        startDate: new Date(req.startDate),
        endDate: new Date(req.endDate),
        totalDays: new Decimal(req.totalDays),
        reason: req.reason,
        status: req.status,
        appliedAt: new Date(new Date(req.startDate).getTime() - 14 * 24 * 60 * 60 * 1000), // ~14 days before
        approvedBy: req.approvedBy ?? null,
        approvedAt: req.approvedBy ? new Date(new Date(req.startDate).getTime() - 12 * 24 * 60 * 60 * 1000) : null,
        rejectedBy: (req as any).rejectedBy ?? null,
        rejectedAt: (req as any).rejectedBy ? new Date(new Date(req.startDate).getTime() - 12 * 24 * 60 * 60 * 1000) : null,
        rejectionReason: (req as any).rejectionReason ?? null,
        cancelledAt: req.status === 'CANCELLED' ? new Date(new Date(req.startDate).getTime() - 7 * 24 * 60 * 60 * 1000) : null,
        cancelledBy: req.status === 'CANCELLED' ? emp.id : null,
        cancellationReason: (req as any).cancellationReason ?? null,
      },
    });
    requestCount++;
  }
  console.log(`    Created/verified ${requestCount} leave requests`);

  // ──────────────────────────────────────────────────────────────────────────
  // 4. LEAVE ACCRUALS — monthly accrual records for Jan-Mar 2025
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating leave accrual records...');
  let accrualCount = 0;

  // Only create monthly accruals for MONTHLY-type policies
  const monthlyPolicies = createdPolicies.filter((p) => {
    const def = policyDefs.find((d) => d.code === p.code);
    return def?.accrualType === 'MONTHLY';
  });

  for (const emp of employees) {
    for (const policy of monthlyPolicies) {
      const policyDef = policyDefs.find((d) => d.code === policy.code);
      if (!policyDef) continue;

      for (let month = 1; month <= 3; month++) {
        const existing = await prisma.leaveAccrual.findFirst({
          where: {
            tenantId,
            employeeId: emp.id,
            policyId: policy.id,
            leaveYear: 2025,
            accrualMonth: month,
          },
        });
        if (existing) { accrualCount++; continue; }

        await prisma.leaveAccrual.create({
          data: {
            tenantId,
            employeeId: emp.id,
            policyId: policy.id,
            leaveYear: 2025,
            accrualMonth: month,
            accrualDate: new Date(2025, month - 1, 1), // 1st of each month
            accruedDays: new Decimal(policyDef.accrualRate),
            proRataFactor: new Decimal(1.0),
            calculationNote: `Monthly accrual for ${new Date(2025, month - 1, 1).toLocaleString('en-US', { month: 'long' })} 2025`,
          },
        });
        accrualCount++;
      }
    }
  }
  console.log(`    Created/verified ${accrualCount} leave accrual records`);

  // ──────────────────────────────────────────────────────────────────────────
  // 5. LEAVE CARRY FORWARDS — year-end 2024 -> 2025
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating leave carry-forward records...');
  let cfCount = 0;

  // Only carry-forward-eligible policies
  const cfPolicies = createdPolicies.filter((p) => {
    const def = policyDefs.find((d) => d.code === p.code);
    return def?.allowCarryForward;
  });

  for (const emp of employees.slice(0, 6)) { // first 6 employees
    for (const policy of cfPolicies) {
      const existing = await prisma.leaveCarryForward.findFirst({
        where: {
          employeeId: emp.id,
          policyId: policy.id,
          fromYear: 2024,
          toYear: 2025,
        },
      });
      if (existing) { cfCount++; continue; }

      const policyDef = policyDefs.find((d) => d.code === policy.code);
      if (!policyDef) continue;

      // Simulate varying year-end balances
      const prevBalance = 5 + Math.floor(Math.random() * 10); // 5-14 days remaining
      const maxCf = policyDef.maxCarryForwardDays;
      const cfEligible = Math.min(prevBalance, maxCf);
      const cfApplied = cfEligible;
      const lapsed = prevBalance - cfApplied;

      await prisma.leaveCarryForward.create({
        data: {
          tenantId,
          employeeId: emp.id,
          policyId: policy.id,
          fromYear: 2024,
          toYear: 2025,
          previousYearBalance: new Decimal(prevBalance),
          carryForwardEligible: new Decimal(cfEligible),
          carryForwardApplied: new Decimal(cfApplied),
          lapsed: new Decimal(lapsed),
          expiryDate: new Date('2025-06-30'), // 6-month expiry
          processedAt: new Date('2025-01-01'),
        },
      });
      cfCount++;
    }
  }
  console.log(`    Created/verified ${cfCount} leave carry-forward records`);

  // ──────────────────────────────────────────────────────────────────────────
  // 6. LEAVE ENCASHMENTS — 2 encashment requests
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating leave encashment records...');

  if (annualPolicy) {
    const annualLeaveTypeId = ltMap.get(annualPolicy.leaveTypeCode);
    if (annualLeaveTypeId) {
      const encashmentDefs = [
        {
          empIdx: 0,
          requestedDays: 10,
          eligibleDays: 10,
          calculationBasis: 'BASIC',
          dailyRate: new Decimal('576.92'), // ~15,000 AED / 26 working days
          totalAmount: new Decimal('5769.20'),
          trigger: 'YEAR_END',
          status: 'APPROVED',
          approvedBy: employees.length > 3 ? employees[3].id : employees[0].id,
          payrollMonth: '2025-01',
        },
        {
          empIdx: 2 % employees.length,
          requestedDays: 15,
          eligibleDays: 12,
          calculationBasis: 'GROSS',
          dailyRate: new Decimal('769.23'), // ~20,000 AED / 26 working days
          totalAmount: new Decimal('9230.76'),
          trigger: 'ON_REQUEST',
          status: 'PENDING',
        },
      ];

      for (const enc of encashmentDefs) {
        const emp = employees[enc.empIdx];

        const existing = await prisma.leaveEncashment.findFirst({
          where: {
            tenantId,
            employeeId: emp.id,
            policyId: annualPolicy.id,
            trigger: enc.trigger,
          },
        });
        if (existing) continue;

        await prisma.leaveEncashment.create({
          data: {
            tenantId,
            employeeId: emp.id,
            leaveTypeId: annualLeaveTypeId,
            policyId: annualPolicy.id,
            requestedDays: new Decimal(enc.requestedDays),
            eligibleDays: new Decimal(enc.eligibleDays),
            approvedDays: enc.status === 'APPROVED' ? new Decimal(enc.eligibleDays) : null,
            calculationBasis: enc.calculationBasis,
            dailyRate: enc.dailyRate,
            totalAmount: enc.totalAmount,
            trigger: enc.trigger,
            status: enc.status,
            approvedBy: enc.approvedBy ?? null,
            approvedAt: enc.approvedBy ? new Date('2025-01-05') : null,
            payrollMonth: enc.payrollMonth ?? null,
          },
        });
      }
      console.log('    Created/verified 2 leave encashment records');
    }
  }

  console.log('  Leave Management data seeded successfully');
}

// Run if executed directly
if (require.main === module) {
  const _prisma = new PrismaClient();
  const tenantId = process.env.TENANT_ID || 'default-tenant';
  seedLeaveManagement(_prisma, tenantId)
    .catch((e) => {
      console.error('Error seeding leave management:', e);
      process.exit(1);
    })
    .finally(async () => {
      await _prisma.$disconnect();
    });
}
