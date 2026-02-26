/**
 * @module OvertimeBreakRulesSeed
 * @description Combined overtime and break rules for GCC (UAE, KSA, Bahrain, Oman,
 *   Qatar, Kuwait), India, UK, and US. Includes overtime multipliers, weekly/daily
 *   caps, shift premiums, and break entitlements — all stored as SystemSetting JSON.
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group A — Seed 6
 */

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface OvertimeRule {
  jurisdiction: string;
  jurisdictionName: string;
  standardWorkdayHours: number;
  standardWorkweekHours: number;
  weekendDays: string[];
  dailyOvertimeThresholdHours?: number;
  weeklyOvertimeThresholdHours: number;
  weekdayOvertimeMultiplier: number;
  weekendOvertimeMultiplier: number;
  publicHolidayMultiplier: number;
  doubleTimeThresholdHours?: number;
  maxDailyOvertimeHours: number;
  maxWeeklyOvertimeHours: number;
  maxMonthlyOvertimeHours: number;
  coolingOffHours: number;
  shiftPremiums: {
    eveningShiftPercent?: number;
    nightShiftPercent?: number;
    sundayPremiumPercent?: number;
  };
  legalBasis: string;
  compOffEligible: boolean;
}

export interface BreakRule {
  jurisdiction: string;
  jurisdictionName: string;
  breakType: 'meal' | 'rest' | 'prayer';
  afterWorkHours: number;
  durationMinutes: number;
  isPaid: boolean;
  mandatory: boolean;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Overtime Rules
// ---------------------------------------------------------------------------

export const overtimeRules: OvertimeRule[] = [
  // UAE
  {
    jurisdiction: 'AE',
    jurisdictionName: 'United Arab Emirates',
    standardWorkdayHours: 8,
    standardWorkweekHours: 48,
    weekendDays: ['Saturday', 'Sunday'],
    dailyOvertimeThresholdHours: 8,
    weeklyOvertimeThresholdHours: 48,
    weekdayOvertimeMultiplier: 1.25,
    weekendOvertimeMultiplier: 1.5,
    publicHolidayMultiplier: 1.5,
    maxDailyOvertimeHours: 2,
    maxWeeklyOvertimeHours: 12,
    maxMonthlyOvertimeHours: 52,
    coolingOffHours: 12,
    shiftPremiums: {
      eveningShiftPercent: 0,
      nightShiftPercent: 25,
    },
    legalBasis: 'UAE Federal Decree Law No. 33 of 2021 — Article 64–66',
    compOffEligible: true,
  },

  // KSA
  {
    jurisdiction: 'SA',
    jurisdictionName: 'Kingdom of Saudi Arabia',
    standardWorkdayHours: 8,
    standardWorkweekHours: 40,
    weekendDays: ['Friday', 'Saturday'],
    dailyOvertimeThresholdHours: 8,
    weeklyOvertimeThresholdHours: 40,
    weekdayOvertimeMultiplier: 1.5,
    weekendOvertimeMultiplier: 1.5,
    publicHolidayMultiplier: 1.5,
    maxDailyOvertimeHours: 3,
    maxWeeklyOvertimeHours: 15,
    maxMonthlyOvertimeHours: 60,
    coolingOffHours: 11,
    shiftPremiums: {
      eveningShiftPercent: 0,
      nightShiftPercent: 25,
    },
    legalBasis: 'KSA Labour Law Article 106–108; Ministerial Decision No. 3651',
    compOffEligible: false,
  },

  // Bahrain
  {
    jurisdiction: 'BH',
    jurisdictionName: 'Kingdom of Bahrain',
    standardWorkdayHours: 8,
    standardWorkweekHours: 48,
    weekendDays: ['Friday', 'Saturday'],
    dailyOvertimeThresholdHours: 8,
    weeklyOvertimeThresholdHours: 48,
    weekdayOvertimeMultiplier: 1.25,
    weekendOvertimeMultiplier: 1.5,
    publicHolidayMultiplier: 1.5,
    maxDailyOvertimeHours: 2,
    maxWeeklyOvertimeHours: 12,
    maxMonthlyOvertimeHours: 52,
    coolingOffHours: 12,
    shiftPremiums: { nightShiftPercent: 25 },
    legalBasis: 'Bahrain Labour Law No. 36 of 2012 — Articles 57–59',
    compOffEligible: true,
  },

  // Oman
  {
    jurisdiction: 'OM',
    jurisdictionName: 'Sultanate of Oman',
    standardWorkdayHours: 8,
    standardWorkweekHours: 45,
    weekendDays: ['Friday', 'Saturday'],
    dailyOvertimeThresholdHours: 8,
    weeklyOvertimeThresholdHours: 45,
    weekdayOvertimeMultiplier: 1.25,
    weekendOvertimeMultiplier: 1.5,
    publicHolidayMultiplier: 1.5,
    maxDailyOvertimeHours: 3,
    maxWeeklyOvertimeHours: 12,
    maxMonthlyOvertimeHours: 52,
    coolingOffHours: 12,
    shiftPremiums: { nightShiftPercent: 25 },
    legalBasis: 'Oman Labour Law Royal Decree No. 35/2003 — Article 68',
    compOffEligible: true,
  },

  // Qatar
  {
    jurisdiction: 'QA',
    jurisdictionName: 'State of Qatar',
    standardWorkdayHours: 8,
    standardWorkweekHours: 48,
    weekendDays: ['Friday', 'Saturday'],
    dailyOvertimeThresholdHours: 8,
    weeklyOvertimeThresholdHours: 48,
    weekdayOvertimeMultiplier: 1.25,
    weekendOvertimeMultiplier: 1.5,
    publicHolidayMultiplier: 1.5,
    maxDailyOvertimeHours: 2,
    maxWeeklyOvertimeHours: 10,
    maxMonthlyOvertimeHours: 44,
    coolingOffHours: 12,
    shiftPremiums: { nightShiftPercent: 25 },
    legalBasis: 'Qatar Labour Law No. 14 of 2004 — Articles 74–76',
    compOffEligible: true,
  },

  // Kuwait
  {
    jurisdiction: 'KW',
    jurisdictionName: 'State of Kuwait',
    standardWorkdayHours: 8,
    standardWorkweekHours: 48,
    weekendDays: ['Friday', 'Saturday'],
    dailyOvertimeThresholdHours: 8,
    weeklyOvertimeThresholdHours: 48,
    weekdayOvertimeMultiplier: 1.25,
    weekendOvertimeMultiplier: 1.5,
    publicHolidayMultiplier: 1.5,
    maxDailyOvertimeHours: 2,
    maxWeeklyOvertimeHours: 12,
    maxMonthlyOvertimeHours: 48,
    coolingOffHours: 12,
    shiftPremiums: { nightShiftPercent: 20 },
    legalBasis: 'Kuwait Labour Law No. 6 of 2010 — Articles 66–68',
    compOffEligible: true,
  },

  // India
  {
    jurisdiction: 'IN',
    jurisdictionName: 'Republic of India',
    standardWorkdayHours: 8,
    standardWorkweekHours: 48,
    weekendDays: ['Sunday'],
    dailyOvertimeThresholdHours: 9,
    weeklyOvertimeThresholdHours: 48,
    weekdayOvertimeMultiplier: 2.0,
    weekendOvertimeMultiplier: 2.0,
    publicHolidayMultiplier: 2.0,
    maxDailyOvertimeHours: 3,
    maxWeeklyOvertimeHours: 15,
    maxMonthlyOvertimeHours: 50,
    coolingOffHours: 12,
    shiftPremiums: {
      eveningShiftPercent: 10,
      nightShiftPercent: 20,
    },
    legalBasis: 'Factories Act 1948 Section 51–56; Shops & Establishment Acts (state-specific)',
    compOffEligible: true,
  },

  // UK
  {
    jurisdiction: 'GB',
    jurisdictionName: 'United Kingdom',
    standardWorkdayHours: 8,
    standardWorkweekHours: 40,
    weekendDays: ['Saturday', 'Sunday'],
    weeklyOvertimeThresholdHours: 48,
    weekdayOvertimeMultiplier: 1.0,
    weekendOvertimeMultiplier: 1.0,
    publicHolidayMultiplier: 1.0,
    maxDailyOvertimeHours: 4,
    maxWeeklyOvertimeHours: 8,
    maxMonthlyOvertimeHours: 32,
    coolingOffHours: 11,
    shiftPremiums: {},
    legalBasis: 'Working Time Regulations 1998 — 48-hour weekly cap (opt-out available)',
    compOffEligible: false,
  },

  // US Federal (FLSA)
  {
    jurisdiction: 'US',
    jurisdictionName: 'United States (FLSA Federal)',
    standardWorkdayHours: 8,
    standardWorkweekHours: 40,
    weekendDays: ['Saturday', 'Sunday'],
    weeklyOvertimeThresholdHours: 40,
    weekdayOvertimeMultiplier: 1.5,
    weekendOvertimeMultiplier: 1.5,
    publicHolidayMultiplier: 1.0,
    maxDailyOvertimeHours: 0,
    maxWeeklyOvertimeHours: 0,
    maxMonthlyOvertimeHours: 0,
    coolingOffHours: 0,
    shiftPremiums: {},
    legalBasis: 'Fair Labor Standards Act (FLSA) 29 U.S.C. § 207',
    compOffEligible: false,
  },

  // US California (stricter than FLSA)
  {
    jurisdiction: 'US-CA',
    jurisdictionName: 'United States — California',
    standardWorkdayHours: 8,
    standardWorkweekHours: 40,
    weekendDays: ['Saturday', 'Sunday'],
    dailyOvertimeThresholdHours: 8,
    weeklyOvertimeThresholdHours: 40,
    weekdayOvertimeMultiplier: 1.5,
    weekendOvertimeMultiplier: 1.5,
    publicHolidayMultiplier: 1.5,
    doubleTimeThresholdHours: 12,
    maxDailyOvertimeHours: 0,
    maxWeeklyOvertimeHours: 0,
    maxMonthlyOvertimeHours: 0,
    coolingOffHours: 0,
    shiftPremiums: {},
    legalBasis: 'California Labor Code § 510; IWC Wage Orders',
    compOffEligible: false,
  },
];

// ---------------------------------------------------------------------------
// Break Rules
// ---------------------------------------------------------------------------

export const breakRules: BreakRule[] = [
  // UAE
  { jurisdiction: 'AE', jurisdictionName: 'United Arab Emirates', breakType: 'meal', afterWorkHours: 5, durationMinutes: 60, isPaid: false, mandatory: true, notes: 'UAE Labour Law: 1 hour meal break after 5 hours of continuous work' },
  { jurisdiction: 'AE', jurisdictionName: 'United Arab Emirates', breakType: 'prayer', afterWorkHours: 0, durationMinutes: 15, isPaid: true, mandatory: true, notes: 'Prayer time breaks as per UAE policy; typically 15 minutes per prayer' },

  // KSA
  { jurisdiction: 'SA', jurisdictionName: 'Kingdom of Saudi Arabia', breakType: 'meal', afterWorkHours: 5, durationMinutes: 30, isPaid: false, mandatory: true, notes: 'KSA Labour Law: minimum 30 minutes after 5 hours; Ramadan hours reduced' },
  { jurisdiction: 'SA', jurisdictionName: 'Kingdom of Saudi Arabia', breakType: 'prayer', afterWorkHours: 0, durationMinutes: 30, isPaid: true, mandatory: true, notes: 'Prayer breaks are legally required in KSA workplaces' },

  // Bahrain
  { jurisdiction: 'BH', jurisdictionName: 'Kingdom of Bahrain', breakType: 'meal', afterWorkHours: 5, durationMinutes: 30, isPaid: false, mandatory: true },
  { jurisdiction: 'BH', jurisdictionName: 'Kingdom of Bahrain', breakType: 'prayer', afterWorkHours: 0, durationMinutes: 15, isPaid: true, mandatory: true },

  // Oman
  { jurisdiction: 'OM', jurisdictionName: 'Sultanate of Oman', breakType: 'meal', afterWorkHours: 5, durationMinutes: 30, isPaid: false, mandatory: true },
  { jurisdiction: 'OM', jurisdictionName: 'Sultanate of Oman', breakType: 'prayer', afterWorkHours: 0, durationMinutes: 15, isPaid: true, mandatory: true },

  // Qatar
  { jurisdiction: 'QA', jurisdictionName: 'State of Qatar', breakType: 'meal', afterWorkHours: 5, durationMinutes: 30, isPaid: false, mandatory: true },
  { jurisdiction: 'QA', jurisdictionName: 'State of Qatar', breakType: 'prayer', afterWorkHours: 0, durationMinutes: 15, isPaid: true, mandatory: true },

  // Kuwait
  { jurisdiction: 'KW', jurisdictionName: 'State of Kuwait', breakType: 'meal', afterWorkHours: 4, durationMinutes: 45, isPaid: false, mandatory: true },
  { jurisdiction: 'KW', jurisdictionName: 'State of Kuwait', breakType: 'prayer', afterWorkHours: 0, durationMinutes: 15, isPaid: true, mandatory: true },

  // India
  { jurisdiction: 'IN', jurisdictionName: 'Republic of India', breakType: 'meal', afterWorkHours: 5, durationMinutes: 30, isPaid: false, mandatory: true, notes: 'Factories Act Section 55: 30 minutes meal break after 5 hours of continuous work' },
  { jurisdiction: 'IN', jurisdictionName: 'Republic of India', breakType: 'rest', afterWorkHours: 5, durationMinutes: 15, isPaid: true, mandatory: true, notes: 'Rest break — common company practice in India' },

  // UK
  { jurisdiction: 'GB', jurisdictionName: 'United Kingdom', breakType: 'rest', afterWorkHours: 6, durationMinutes: 20, isPaid: false, mandatory: true, notes: 'Working Time Regulations 1998: 20-minute break after 6 hours of continuous work' },

  // US Federal
  { jurisdiction: 'US', jurisdictionName: 'United States (Federal)', breakType: 'rest', afterWorkHours: 4, durationMinutes: 15, isPaid: true, mandatory: false, notes: 'FLSA: Short breaks (up to 20 min) are paid; longer meal breaks (30+ min) can be unpaid' },
  { jurisdiction: 'US', jurisdictionName: 'United States (Federal)', breakType: 'meal', afterWorkHours: 6, durationMinutes: 30, isPaid: false, mandatory: false, notes: 'Federal: No mandatory meal break; state laws vary' },

  // US California
  { jurisdiction: 'US-CA', jurisdictionName: 'United States — California', breakType: 'meal', afterWorkHours: 5, durationMinutes: 30, isPaid: false, mandatory: true, notes: 'California Labor Code § 512: Meal break after 5 hours; second meal if shift > 10 hours' },
  { jurisdiction: 'US-CA', jurisdictionName: 'United States — California', breakType: 'rest', afterWorkHours: 3.5, durationMinutes: 10, isPaid: true, mandatory: true, notes: 'California: 10-minute paid rest break per 4-hour work period' },

  // US New York
  { jurisdiction: 'US-NY', jurisdictionName: 'United States — New York', breakType: 'meal', afterWorkHours: 6, durationMinutes: 30, isPaid: false, mandatory: true, notes: 'New York Labor Law § 162: Meal break for shifts over 6 hours' },
];

/**
 * Seed overtime and break rules into SystemSetting.
 * Idempotent — safe to run multiple times.
 */
export async function seedOvertimeBreakRules(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding overtime and break rules...');
  let otCount = 0;
  let brCount = 0;

  for (const rule of overtimeRules) {
    const key = `overtime_rule.${rule.jurisdiction.toLowerCase()}`;
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(rule), description: `Overtime rules for ${rule.jurisdictionName}` },
      create: {
        key,
        value: JSON.stringify(rule),
        group: 'overtime_rules',
        description: `Overtime rules for ${rule.jurisdictionName} — ${rule.legalBasis}`,
      },
    });
    otCount++;
  }

  for (const rule of breakRules) {
    const key = `break_rule.${rule.jurisdiction.toLowerCase()}_${rule.breakType}_${rule.afterWorkHours}h`;
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(rule), description: `${rule.breakType} break after ${rule.afterWorkHours}h for ${rule.jurisdictionName}` },
      create: {
        key,
        value: JSON.stringify(rule),
        group: 'break_rules',
        description: `${rule.jurisdictionName} — ${rule.breakType} break after ${rule.afterWorkHours}h: ${rule.durationMinutes} min (${rule.isPaid ? 'paid' : 'unpaid'})`,
      },
    });
    brCount++;
  }

  console.log(`  ✓ Overtime rules: ${otCount} jurisdiction rules seeded`);
  console.log(`  ✓ Break rules: ${brCount} break rules seeded`);
}

// Legacy named exports for backward compatibility
export { seedOvertimeBreakRules as seed };
