import { describe, it, expect } from 'vitest';
import { WorkingHoursEngine } from '../working-hours-engine.service';

// A non-Ramadan, non-Friday weekday: Tue 2024-06-11 (Hijri ~Dhu al-Hijjah 1445)
const NORMAL_DAY = new Date(2024, 5, 11);
// June 14, 2024 = Friday
const FRIDAY = new Date(2024, 5, 14);

describe('WorkingHoursEngine.calculateDailyWorkingHours', () => {
  it('returns standard hours for UAE on non-Ramadan day', () => {
    const result = WorkingHoursEngine.calculateDailyWorkingHours('AE', NORMAL_DAY);
    expect(result.standardHours).toBe(8);
    expect(result.effectiveHours).toBe(8);
    expect(result.message).toContain('Standard');
  });

  it('returns standard hours for India (no Ramadan rules)', () => {
    const result = WorkingHoursEngine.calculateDailyWorkingHours('IN', NORMAL_DAY);
    expect(result.isRamadan).toBe(false);
    expect(result.effectiveHours).toBe(result.standardHours);
  });

  it('returns standard hours for SA on non-Ramadan day', () => {
    const result = WorkingHoursEngine.calculateDailyWorkingHours('SA', NORMAL_DAY);
    expect(result.standardHours).toBe(8);
    expect(result.effectiveHours).toBeGreaterThan(0);
  });

  it('includes Arabic message', () => {
    const result = WorkingHoursEngine.calculateDailyWorkingHours('AE', NORMAL_DAY);
    expect(result.messageAr).toBeTruthy();
    expect(result.messageAr.length).toBeGreaterThan(0);
  });
});

describe('WorkingHoursEngine.calculateOvertime', () => {
  it('calculates overtime when actual > shift hours', () => {
    const r = WorkingHoursEngine.calculateOvertime('AE', 10, 8, NORMAL_DAY);
    expect(r.overtimeHours).toBe(2);
    expect(r.actualHours).toBe(10);
    expect(r.standardHours).toBe(8);
    expect(r.isFriday).toBe(false);
  });

  it('returns 0 overtime when within shift hours', () => {
    const r = WorkingHoursEngine.calculateOvertime('AE', 6, 8, NORMAL_DAY);
    expect(r.overtimeHours).toBe(0);
    expect(r.isCompliant).toBe(true);
  });

  it('applies night overtime type when caller specifies', () => {
    const r = WorkingHoursEngine.calculateOvertime('AE', 10, 8, NORMAL_DAY, 'night');
    expect(r.overtimeType).toBe('night');
    expect(r.overtimeRate).toBeGreaterThan(1);
  });

  it('upgrades normal overtime to friday on GCC Friday', () => {
    const r = WorkingHoursEngine.calculateOvertime('AE', 10, 8, FRIDAY);
    expect(r.isFriday).toBe(true);
    expect(r.overtimeType).toBe('friday');
  });

  it('does not upgrade to friday for non-GCC country', () => {
    const r = WorkingHoursEngine.calculateOvertime('IN', 10, 8, FRIDAY);
    expect(r.isFriday).toBe(true);
    expect(r.overtimeType).toBe('normal');
  });

  it('flags violation when daily overtime exceeds cap (UAE: 2h max)', () => {
    const r = WorkingHoursEngine.calculateOvertime('AE', 13, 8, NORMAL_DAY);
    expect(r.overtimeHours).toBe(5);
    expect(r.isCompliant).toBe(false);
    expect(r.violations.some((v) => v.code === 'DAILY_OT_EXCEEDED')).toBe(true);
  });

  it('does NOT flag daily OT violation for SA (no daily cap)', () => {
    const r = WorkingHoursEngine.calculateOvertime('SA', 15, 8, NORMAL_DAY);
    expect(r.overtimeHours).toBe(7);
    expect(r.violations.find((v) => v.code === 'DAILY_OT_EXCEEDED')).toBeUndefined();
  });

  it('exposes country caps in result', () => {
    const r = WorkingHoursEngine.calculateOvertime('SA', 8, 8, NORMAL_DAY);
    expect(r.dailyOvertimeCap).toBeNull();
    expect(r.annualOvertimeCap).toBe(720);
  });
});

describe('WorkingHoursEngine.validateDailyCompliance', () => {
  it('passes for normal UAE workday', () => {
    const r = WorkingHoursEngine.validateDailyCompliance('AE', 8, 0, NORMAL_DAY);
    expect(r.isCompliant).toBe(true);
    expect(r.issues.filter((i) => i.severity === 'ERROR')).toHaveLength(0);
  });

  it('flags excess daily hours', () => {
    const r = WorkingHoursEngine.validateDailyCompliance('AE', 14, 6, NORMAL_DAY);
    expect(r.isCompliant).toBe(false);
    expect(r.issues.some((i) => i.code === 'EXCESS_DAILY_HOURS')).toBe(true);
  });

  it('flags excess daily overtime separately', () => {
    const r = WorkingHoursEngine.validateDailyCompliance('AE', 13, 5, NORMAL_DAY);
    expect(r.issues.some((i) => i.code === 'EXCESS_DAILY_OVERTIME')).toBe(true);
  });

  it('emits INFO break-required notice when over breakAfterHours', () => {
    const r = WorkingHoursEngine.validateDailyCompliance('AE', 6, 0, NORMAL_DAY);
    expect(r.breakRequired).toBe(true);
    expect(r.issues.some((i) => i.code === 'BREAK_REQUIRED')).toBe(true);
  });

  it('flags FRIDAY_WORK warning for GCC Friday', () => {
    const r = WorkingHoursEngine.validateDailyCompliance('AE', 8, 0, FRIDAY);
    expect(r.isFriday).toBe(true);
    expect(r.issues.some((i) => i.code === 'FRIDAY_WORK')).toBe(true);
  });

  it('does NOT flag FRIDAY_WORK for India', () => {
    const r = WorkingHoursEngine.validateDailyCompliance('IN', 8, 0, FRIDAY);
    expect(r.issues.find((i) => i.code === 'FRIDAY_WORK')).toBeUndefined();
  });

  it('returns standardHours field', () => {
    const r = WorkingHoursEngine.validateDailyCompliance('AE', 8, 0, NORMAL_DAY);
    expect(r.standardHours).toBe(8);
  });
});

describe('WorkingHoursEngine.validateWeeklyCompliance', () => {
  it('passes for normal 40h week + adequate rest', () => {
    const r = WorkingHoursEngine.validateWeeklyCompliance('AE', 40, 2);
    expect(r.isCompliant).toBe(true);
    expect(r.hasAdequateRest).toBe(true);
  });

  it('flags EXCESS_WEEKLY_HOURS', () => {
    const r = WorkingHoursEngine.validateWeeklyCompliance('AE', 100, 1);
    expect(r.isCompliant).toBe(false);
    expect(r.issues.some((i) => i.code === 'EXCESS_WEEKLY_HOURS')).toBe(true);
  });

  it('flags INSUFFICIENT_REST_DAYS when restDays=0', () => {
    const r = WorkingHoursEngine.validateWeeklyCompliance('AE', 40, 0);
    expect(r.issues.some((i) => i.code === 'INSUFFICIENT_REST_DAYS')).toBe(true);
  });

  it('flags INSUFFICIENT_CONSECUTIVE_REST when consecutiveRestHours below minimum', () => {
    const r = WorkingHoursEngine.validateWeeklyCompliance('AE', 40, 1, {
      consecutiveRestHours: 12,
    });
    expect(r.issues.some((i) => i.code === 'INSUFFICIENT_CONSECUTIVE_REST')).toBe(true);
  });

  it('flags ANNUAL_OVERTIME_CAP_RISK for KSA when projected exceeds cap', () => {
    const r = WorkingHoursEngine.validateWeeklyCompliance('SA', 70, 1, {
      annualOvertimeSoFar: 700,
    });
    expect(r.issues.some((i) => i.code === 'ANNUAL_OVERTIME_CAP_RISK')).toBe(true);
  });

  it('detects Friday work via dailyHours array (GCC)', () => {
    const r = WorkingHoursEngine.validateWeeklyCompliance('AE', 48, 1, {
      // weekStartDate Sunday (day 0): Sun..Fri..Sat
      weekStartDate: new Date(2024, 5, 9), // Sun 2024-06-09
      dailyHours: [8, 8, 8, 8, 8, 8, 0], // Fri at index 5 = 8h
    });
    expect(r.fridayWorkDetected).toBe(true);
    expect(r.fridayCompensationRequired).toBe(true);
    expect(r.issues.some((i) => i.code === 'FRIDAY_COMPENSATION_REQUIRED')).toBe(true);
  });

  it('does NOT flag Friday compensation for India (non-GCC)', () => {
    const r = WorkingHoursEngine.validateWeeklyCompliance('IN', 48, 1, {
      weekStartDate: new Date(2024, 5, 9),
      dailyHours: [8, 8, 8, 8, 8, 8, 0],
    });
    expect(r.fridayCompensationRequired).toBe(false);
  });

  it('computes totalOvertimeHours = max(0, weekly - standard)', () => {
    const r = WorkingHoursEngine.validateWeeklyCompliance('AE', 60, 2);
    // AE standardPerWeek is 48
    expect(r.totalOvertimeHours).toBe(60 - r.standardWeeklyHours);
  });

  it('returns 0 totalOvertimeHours when weekly hours below standard', () => {
    const r = WorkingHoursEngine.validateWeeklyCompliance('AE', 30, 2);
    expect(r.totalOvertimeHours).toBe(0);
  });

  it('exposes weekStartDate + weekEndDate spanning 6 days', () => {
    const start = new Date(2024, 5, 9);
    const r = WorkingHoursEngine.validateWeeklyCompliance('AE', 40, 2, { weekStartDate: start });
    expect(r.weekEndDate.getTime() - r.weekStartDate.getTime()).toBe(6 * 24 * 60 * 60 * 1000);
  });
});

describe('WorkingHoursEngine.getBreakRequirements', () => {
  it('returns no break for short shift', () => {
    const r = WorkingHoursEngine.getBreakRequirements('AE', 2);
    expect(r.breakRequired).toBe(false);
    expect(r.minimumBreakMinutes).toBe(0);
    expect(r.additionalBreaks).toEqual([]);
  });

  it('adds primary break for AE after 5h', () => {
    const r = WorkingHoursEngine.getBreakRequirements('AE', 6);
    expect(r.breakRequired).toBe(true);
    expect(r.additionalBreaks.length).toBeGreaterThanOrEqual(1);
    expect(r.additionalBreaks[0].isPaid).toBe(false);
  });

  it('adds prayer break for GCC after 4+ hours', () => {
    const r = WorkingHoursEngine.getBreakRequirements('SA', 6);
    const prayer = r.additionalBreaks.find((b) => b.isPaid === true);
    expect(prayer).toBeDefined();
    expect(prayer!.durationMinutes).toBe(15);
  });

  it('does NOT add prayer break for India', () => {
    const r = WorkingHoursEngine.getBreakRequirements('IN', 6);
    const paid = r.additionalBreaks.find((b) => b.isPaid === true);
    expect(paid).toBeUndefined();
  });

  it('adds extended-shift break when worked >= 2× maxContinuous', () => {
    const r = WorkingHoursEngine.getBreakRequirements('AE', 12); // 2× 5 = 10, so 12 triggers
    expect(r.additionalBreaks.length).toBeGreaterThanOrEqual(2);
  });

  it('returns maximumContinuousWorkHours from config', () => {
    const r = WorkingHoursEngine.getBreakRequirements('BH', 8);
    expect(r.maximumContinuousWorkHours).toBe(6);
  });
});

describe('WorkingHoursEngine.isNightShift', () => {
  it('detects 22:00-06:00 as night for UAE (overnight window)', () => {
    expect(WorkingHoursEngine.isNightShift('AE', '22:00', '06:00')).toBe(true);
  });

  it('rejects 09:00-17:00 as daytime for UAE', () => {
    expect(WorkingHoursEngine.isNightShift('AE', '09:00', '17:00')).toBe(false);
  });

  it('returns false for SA (no nightStart configured)', () => {
    expect(WorkingHoursEngine.isNightShift('SA', '22:00', '06:00')).toBe(false);
  });

  it('returns false for KW (no nightStart configured)', () => {
    expect(WorkingHoursEngine.isNightShift('KW', '22:00', '06:00')).toBe(false);
  });

  it('checks against current date when no times given', () => {
    const midnight = new Date(2024, 5, 11, 23, 0); // 23:00 UAE = night
    expect(WorkingHoursEngine.isNightShift('AE', null, null, midnight)).toBe(true);
  });

  it('returns false when midday date provided without times', () => {
    const noon = new Date(2024, 5, 11, 12, 0);
    expect(WorkingHoursEngine.isNightShift('AE', null, null, noon)).toBe(false);
  });

  it('returns false when no times and no date', () => {
    expect(WorkingHoursEngine.isNightShift('AE', null, null)).toBe(false);
  });

  it('handles India night window (19:00-06:00)', () => {
    expect(WorkingHoursEngine.isNightShift('IN', '20:00', '04:00')).toBe(true);
  });
});

describe('WorkingHoursEngine.getNightShiftConfig', () => {
  it('returns hasNightShiftRules=true for UAE', () => {
    const r = WorkingHoursEngine.getNightShiftConfig('AE');
    expect(r.hasNightShiftRules).toBe(true);
    expect(r.nightStart).toBe('21:00');
    expect(r.nightEnd).toBe('04:00');
    expect(r.nightRate).toBe(1.5);
  });

  it('returns hasNightShiftRules=false for SA', () => {
    const r = WorkingHoursEngine.getNightShiftConfig('SA');
    expect(r.hasNightShiftRules).toBe(false);
    expect(r.nightStart).toBeNull();
    expect(r.nightEnd).toBeNull();
  });

  it('returns India night rate of 2.0', () => {
    const r = WorkingHoursEngine.getNightShiftConfig('IN');
    expect(r.nightRate).toBe(2.0);
  });
});

describe('WorkingHoursEngine.calculateOvertimeAmount', () => {
  it('computes amount using default 30 days × 8h', () => {
    const r = WorkingHoursEngine.calculateOvertimeAmount(7200, 2, 1.5);
    // hourly = 7200 / 30 / 8 = 30; OT = 30 * 1.5 * 2 = 90
    expect(r.hourlyRate).toBe(30);
    expect(r.overtimeAmount).toBe(90);
    expect(r.totalCost).toBe(90);
  });

  it('uses country-specific standardHoursPerDay when countryCode provided', () => {
    const r = WorkingHoursEngine.calculateOvertimeAmount(7200, 2, 1.5, { countryCode: 'AE' });
    expect(r.hourlyRate).toBeGreaterThan(0);
  });

  it('respects custom workingDaysPerMonth', () => {
    const r = WorkingHoursEngine.calculateOvertimeAmount(7800, 1, 2.0, {
      workingDaysPerMonth: 26,
      standardHoursPerDay: 8,
    });
    // hourly = 7800 / 26 / 8 = 37.5; OT = 37.5 * 2 * 1 = 75
    expect(r.hourlyRate).toBe(37.5);
    expect(r.overtimeAmount).toBe(75);
  });

  it('rounds output to 2dp', () => {
    const r = WorkingHoursEngine.calculateOvertimeAmount(10000, 1, 1.5);
    expect(r.hourlyRate.toString().split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);
  });
});

describe('WorkingHoursEngine.getWorkScheduleConfig', () => {
  it('returns full UAE config', () => {
    const r = WorkingHoursEngine.getWorkScheduleConfig('AE');
    expect(r.countryCode).toBe('AE');
    expect(r.standardHoursPerDay).toBe(8);
    expect(r.maxOvertimePerDay).toBe(2);
    expect(r.fridayPayRate).toBe(1.5);
    expect(r.nightShiftStart).toBe('21:00');
  });

  it('returns SA config with annual cap, no daily cap', () => {
    const r = WorkingHoursEngine.getWorkScheduleConfig('SA');
    expect(r.maxOvertimePerDay).toBeNull();
    expect(r.maxOvertimePerYear).toBe(720);
  });

  it('returns IN config with null fridayPayRate', () => {
    const r = WorkingHoursEngine.getWorkScheduleConfig('IN');
    expect(r.fridayPayRate).toBeNull();
  });
});

describe('WorkingHoursEngine.calculateFridayCompensation', () => {
  it('applies 150% for UAE Friday work', () => {
    const r = WorkingHoursEngine.calculateFridayCompensation('AE', 8, 6000);
    expect(r.applies).toBe(true);
    expect(r.rate).toBe(1.5);
    expect(r.compensationAmount).toBeGreaterThan(0);
    expect(r.substituteRestRequired).toBe(true);
  });

  it('does not require substitute rest when provided', () => {
    const r = WorkingHoursEngine.calculateFridayCompensation('AE', 8, 6000, {
      substituteRestProvided: true,
    });
    expect(r.substituteRestRequired).toBe(false);
  });

  it('returns applies=false for India', () => {
    const r = WorkingHoursEngine.calculateFridayCompensation('IN', 8, 6000);
    expect(r.applies).toBe(false);
    expect(r.rate).toBe(1.0);
    expect(r.compensationAmount).toBe(0);
  });

  it('returns zero compensation when 0 hours worked on Friday (still applies)', () => {
    const r = WorkingHoursEngine.calculateFridayCompensation('AE', 0, 6000);
    expect(r.applies).toBe(true);
    expect(r.compensationAmount).toBe(0);
  });

  it('respects custom standardHoursPerDay', () => {
    const r = WorkingHoursEngine.calculateFridayCompensation('AE', 4, 6000, {
      standardHoursPerDay: 6,
    });
    // hourly = 6000/30/6 = 33.33; comp = 33.33 * 4 * 1.5 = 200
    expect(r.compensationAmount).toBeCloseTo(200, 1);
  });
});

describe('WorkingHoursEngine.checkAnnualOvertimeCompliance', () => {
  it('returns hasAnnualCap=false for UAE (no annual cap)', () => {
    const r = WorkingHoursEngine.checkAnnualOvertimeCompliance('AE', 500);
    expect(r.hasAnnualCap).toBe(false);
    expect(r.annualCap).toBeNull();
    expect(r.isCompliant).toBe(true);
  });

  it('returns compliant for SA when below cap', () => {
    const r = WorkingHoursEngine.checkAnnualOvertimeCompliance('SA', 300, 12);
    expect(r.hasAnnualCap).toBe(true);
    expect(r.annualCap).toBe(720);
    expect(r.isCompliant).toBe(true);
    expect(r.isAtRisk).toBe(false);
    expect(r.remainingHours).toBe(420);
  });

  it('flags violation when above cap', () => {
    const r = WorkingHoursEngine.checkAnnualOvertimeCompliance('SA', 800, 12);
    expect(r.isCompliant).toBe(false);
    expect(r.message).toContain('VIOLATION');
  });

  it('flags at-risk when projected > cap (early year)', () => {
    // 200h in 2 months → projected 1200h
    const r = WorkingHoursEngine.checkAnnualOvertimeCompliance('SA', 200, 2);
    expect(r.isAtRisk).toBe(true);
    expect(r.projectedAnnual).toBeGreaterThan(720);
  });

  it('flags at-risk when over 85% of cap', () => {
    const r = WorkingHoursEngine.checkAnnualOvertimeCompliance('SA', 650, 12);
    expect(r.isAtRisk).toBe(true);
  });

  it('handles 0 monthsElapsed safely', () => {
    const r = WorkingHoursEngine.checkAnnualOvertimeCompliance('SA', 100, 0);
    expect(r.projectedAnnual).toBe(100);
  });

  it('caps remainingHours at 0 (never negative)', () => {
    const r = WorkingHoursEngine.checkAnnualOvertimeCompliance('SA', 800, 12);
    expect(r.remainingHours).toBe(0);
  });
});
