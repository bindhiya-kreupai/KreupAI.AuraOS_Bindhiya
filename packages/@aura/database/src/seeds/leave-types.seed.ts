/**
 * @module LeaveTypesSeed
 * @description Comprehensive leave type catalog with country-specific configurations
 *   for UAE, KSA, India, and US. Each leave type is stored in the LeaveType model,
 *   and country-specific policy metadata is stored as SystemSetting JSON.
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group A — Seed 5
 */

// ---------------------------------------------------------------------------
// Core leave types seeded into LeaveType model (code, name, isPaid)
// ---------------------------------------------------------------------------

export const leaveTypesSeed = [
  // Annual Leave — International
  {
    code: 'AL_UAE',
    name: 'Annual Leave (UAE)',
    description: 'UAE Labour Law Article 75 — 30 calendar days per year after 1 year of service',
    isPaid: true,
    country: 'UAE',
    defaultDays: 30,
    accrualType: 'monthly',
    accrualAmount: 2.5,
    requiresApproval: true,
    requiresDocument: false,
    carryForwardAllowed: true,
    carryForwardMax: 30,
    encashmentAllowed: true,
    isActive: true,
  },
  {
    code: 'AL_KSA',
    name: 'Annual Leave (KSA)',
    description: 'KSA Labour Law Article 109 — 21 days per year; 30 days after 5 years of service',
    isPaid: true,
    country: 'KSA',
    defaultDays: 21,
    accrualType: 'monthly',
    accrualAmount: 1.75,
    requiresApproval: true,
    requiresDocument: false,
    carryForwardAllowed: true,
    carryForwardMax: 30,
    encashmentAllowed: true,
    isActive: true,
  },
  {
    code: 'AL_IND',
    name: 'Annual Leave (India)',
    description: 'India Factories Act / Shops Act — typically 24 days per year (varies by state)',
    isPaid: true,
    country: 'India',
    defaultDays: 24,
    accrualType: 'monthly',
    accrualAmount: 2,
    requiresApproval: true,
    requiresDocument: false,
    carryForwardAllowed: true,
    carryForwardMax: 30,
    encashmentAllowed: true,
    isActive: true,
  },
  {
    code: 'AL_US',
    name: 'Annual Leave (US)',
    description: 'US company policy — 15 days PTO per year; increases with tenure',
    isPaid: true,
    country: 'US',
    defaultDays: 15,
    accrualType: 'monthly',
    accrualAmount: 1.25,
    requiresApproval: true,
    requiresDocument: false,
    carryForwardAllowed: true,
    carryForwardMax: 15,
    encashmentAllowed: false,
    isActive: true,
  },

  // Sick Leave
  {
    code: 'SL_PAID',
    name: 'Sick Leave (Paid)',
    description: 'Paid sick leave — first days fully paid; requires medical certificate for >2 consecutive days',
    isPaid: true,
    country: 'ALL',
    defaultDays: 15,
    accrualType: 'yearly',
    accrualAmount: 15,
    requiresApproval: true,
    requiresDocument: false,
    documentRequiredAfterDays: 2,
    carryForwardAllowed: false,
    encashmentAllowed: false,
    isActive: true,
  },
  {
    code: 'SL_UAE',
    name: 'Sick Leave (UAE)',
    description: 'UAE Labour Law: 15 days full pay, 30 days half pay, 45 days unpaid per year',
    isPaid: true,
    country: 'UAE',
    defaultDays: 15,
    halfPayDays: 30,
    unpaidDays: 45,
    accrualType: 'yearly',
    requiresApproval: true,
    requiresDocument: true,
    encashmentAllowed: false,
    isActive: true,
  },
  {
    code: 'SL_KSA',
    name: 'Sick Leave (KSA)',
    description: 'KSA Labour Law: 30 days full pay, 60 days 75% pay, 30 days unpaid per year',
    isPaid: true,
    country: 'KSA',
    defaultDays: 30,
    halfPayDays: 60,
    unpaidDays: 30,
    accrualType: 'yearly',
    requiresApproval: true,
    requiresDocument: true,
    encashmentAllowed: false,
    isActive: true,
  },

  // Maternity Leave
  {
    code: 'ML_UAE',
    name: 'Maternity Leave (UAE)',
    description: 'UAE Federal Decree Law No. 33: 60 calendar days (45 full pay + 15 half pay)',
    isPaid: true,
    country: 'UAE',
    defaultDays: 60,
    fullPayDays: 45,
    halfPayDays: 15,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: true,
    genderApplicable: 'female',
    minServiceMonths: 12,
    maxOccurrences: 3,
    isActive: true,
  },
  {
    code: 'ML_KSA',
    name: 'Maternity Leave (KSA)',
    description: 'KSA Labour Law Article 151: 70 calendar days — applied before and after delivery',
    isPaid: true,
    country: 'KSA',
    defaultDays: 70,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: true,
    genderApplicable: 'female',
    minServiceMonths: 0,
    isActive: true,
  },
  {
    code: 'ML_IND',
    name: 'Maternity Leave (India)',
    description: 'Maternity Benefit (Amendment) Act 2017: 26 weeks for first 2 children; 12 weeks thereafter',
    isPaid: true,
    country: 'India',
    defaultDays: 182,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: true,
    genderApplicable: 'female',
    minServiceMonths: 0,
    notes: '26 weeks (182 days) for first 2 children; 12 weeks (84 days) for 3rd child onwards',
    isActive: true,
  },
  {
    code: 'ML_US',
    name: 'Maternity Leave (US)',
    description: 'FMLA: 12 weeks unpaid job-protected leave; company may provide paid supplement',
    isPaid: false,
    country: 'US',
    defaultDays: 84,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: true,
    genderApplicable: 'female',
    minServiceMonths: 12,
    notes: '12 weeks FMLA-protected; many companies add 6–8 weeks paid supplement',
    isActive: true,
  },

  // Paternity Leave
  {
    code: 'PTL_UAE',
    name: 'Paternity Leave (UAE)',
    description: 'UAE Federal Decree Law No. 33: 5 working days within 6 months of child birth',
    isPaid: true,
    country: 'UAE',
    defaultDays: 5,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: true,
    genderApplicable: 'male',
    useWithin: '6 months of birth',
    isActive: true,
  },
  {
    code: 'PTL_KSA',
    name: 'Paternity Leave (KSA)',
    description: 'KSA Labour Law Amendment 2022: 3 calendar days on birth of child',
    isPaid: true,
    country: 'KSA',
    defaultDays: 3,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: true,
    genderApplicable: 'male',
    isActive: true,
  },
  {
    code: 'PTL_IND',
    name: 'Paternity Leave (India)',
    description: 'No mandatory statutory paternity leave in India; company policy typically 15 days',
    isPaid: true,
    country: 'India',
    defaultDays: 15,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: true,
    genderApplicable: 'male',
    notes: 'Central government employees get 15 days; private sector is company policy',
    isActive: true,
  },

  // Hajj Leave (KSA only)
  {
    code: 'HAJJ_KSA',
    name: 'Hajj Leave (KSA)',
    description: 'KSA Labour Law Article 115: 15 days paid leave for Hajj pilgrimage — once per employment',
    isPaid: true,
    country: 'KSA',
    defaultDays: 15,
    accrualType: 'one_time',
    requiresApproval: true,
    requiresDocument: true,
    minServiceMonths: 24,
    maxOccurrences: 1,
    notes: 'Can only be availed once during the entire employment period; not combinable with annual leave',
    isActive: true,
  },

  // Compassionate / Bereavement
  {
    code: 'BRV',
    name: 'Bereavement / Compassionate Leave',
    description: 'Paid leave granted upon death of immediate family member',
    isPaid: true,
    country: 'ALL',
    defaultDays: 3,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: true,
    notes: 'UAE: 3–5 days; KSA: 3 days; India: 3 days; US: 3–5 days (company policy)',
    isActive: true,
  },
  {
    code: 'BRV_UAE',
    name: 'Bereavement Leave (UAE)',
    description: 'UAE: 5 days for spouse/child, 3 days for parent/sibling/grandparent',
    isPaid: true,
    country: 'UAE',
    defaultDays: 5,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: true,
    isActive: true,
  },

  // Marriage Leave
  {
    code: 'MARR',
    name: 'Marriage Leave',
    description: 'Paid leave on occasion of employee\'s own marriage',
    isPaid: true,
    country: 'ALL',
    defaultDays: 3,
    accrualType: 'one_time',
    requiresApproval: true,
    requiresDocument: true,
    maxOccurrences: 1,
    notes: 'UAE: 3 days; KSA: 5 days; India: typically 3 days by company policy',
    isActive: true,
  },

  // Study Leave
  {
    code: 'STUDY',
    name: 'Study / Examination Leave',
    description: 'Paid or unpaid leave for professional examinations or approved academic courses',
    isPaid: false,
    country: 'ALL',
    defaultDays: 10,
    accrualType: 'yearly',
    accrualAmount: 10,
    requiresApproval: true,
    requiresDocument: true,
    notes: 'Requires proof of enrolment; some companies pay for job-related exams',
    isActive: true,
  },

  // Unpaid Leave
  {
    code: 'LWP',
    name: 'Leave Without Pay (Unpaid)',
    description: 'Unpaid leave taken when all paid leave balances are exhausted or at employee request',
    isPaid: false,
    country: 'ALL',
    defaultDays: 0,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: false,
    maxAllowedDays: 365,
    notes: 'May impact end-of-service gratuity; statutory deductions continue',
    isActive: true,
  },

  // Compensatory Off
  {
    code: 'COMP_OFF',
    name: 'Compensatory Off (Comp-off)',
    description: 'Leave granted in lieu of working on public holidays or approved overtime',
    isPaid: true,
    country: 'ALL',
    defaultDays: 0,
    accrualType: 'manual',
    requiresApproval: true,
    requiresDocument: false,
    carryForwardAllowed: true,
    carryForwardMax: 5,
    expiryDays: 90,
    notes: 'Must be utilised within 90 days of being credited',
    isActive: true,
  },
];

/**
 * Seed function for use in the main seed runner.
 * Stores enriched leave type metadata as SystemSettings in addition
 * to the core LeaveType model records.
 */
import { PrismaClient } from '@prisma/client';

export async function seedLeaveTypes(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding leave types...');
  let coreCount = 0;
  let metaCount = 0;

  for (const lt of leaveTypesSeed) {
    // Core model upsert — only fields that exist on LeaveType model
    const existing = await prisma.leaveType.findFirst({ where: { code: lt.code } });
    if (!existing) {
      await prisma.leaveType.create({
        data: {
          code: lt.code,
          name: lt.name,
          isPaid: lt.isPaid,
          status: 'Active',
        },
      });
    }
    coreCount++;

    // Extended policy metadata as SystemSetting
    const metaKey = `leave_type_policy.${lt.code.toLowerCase()}`;
    await prisma.systemSetting.upsert({
      where: { key: metaKey },
      update: { value: JSON.stringify(lt), description: lt.description },
      create: {
        key: metaKey,
        value: JSON.stringify(lt),
        group: 'leave_type_policies',
        description: lt.description || `Leave type policy: ${lt.name}`,
      },
    });
    metaCount++;
  }

  console.log(`  ✓ Leave types: ${coreCount} core records, ${metaCount} policy metadata records seeded`);
}
