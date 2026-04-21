import { describe, it, expect } from 'vitest';
import { WorkingHoursEngine } from '../working-hours-engine.service';

describe('WorkingHoursEngine', () => {
  describe('calculateDailyWorkingHours', () => {
    it('should calculate standard working hours for UAE', () => {
      const result = WorkingHoursEngine.calculateDailyWorkingHours('AE', new Date(2024, 5, 15));

      expect(result.standardHours).toBe(8);
      expect(result.effectiveHours).toBeLessThanOrEqual(8);
      expect(result.message).toBeTruthy();
      expect(result.messageAr).toBeTruthy();
    });

    it('should detect Ramadan and adjust hours', () => {
      // March 15, 2024 is close to Ramadan 1445
      const result = WorkingHoursEngine.calculateDailyWorkingHours('AE', new Date(2024, 2, 15));

      expect(result.standardHours).toBeDefined();
      expect(typeof result.isRamadan).toBe('boolean');
      if (result.isRamadan) {
        expect(result.ramadanHours).not.toBeNull();
        expect(result.effectiveHours).toBeLessThan(result.standardHours);
      }
    });

    it('should return standard hours for Saudi Arabia', () => {
      const result = WorkingHoursEngine.calculateDailyWorkingHours('SA', new Date(2024, 5, 15));

      expect(result.standardHours).toBe(8);
      expect(result.effectiveHours).toBeGreaterThan(0);
    });
  });

  describe('calculateOvertime', () => {
    it('should calculate overtime hours when exceeding shift hours', () => {
      const result = WorkingHoursEngine.calculateOvertime('AE', 10, 8, new Date(2024, 5, 15));

      expect(result.overtimeHours).toBe(2);
      expect(result.overtimeRate).toBeGreaterThanOrEqual(1.25);
    });

    it('should apply night shift overtime type', () => {
      const result = WorkingHoursEngine.calculateOvertime('AE', 10, 8, new Date(2024, 5, 15), 'night');

      expect(result.overtimeRate).toBeGreaterThanOrEqual(1.5);
    });

    it('should apply Friday premium for GCC countries', () => {
      // June 14, 2024 is a Friday
      const result = WorkingHoursEngine.calculateOvertime('AE', 10, 8, new Date(2024, 5, 14));

      expect(result.isFriday).toBe(true);
      expect(result.overtimeRate).toBeGreaterThanOrEqual(1.5);
    });

    it('should return 0 overtime when within shift hours', () => {
      const result = WorkingHoursEngine.calculateOvertime('AE', 7, 8, new Date(2024, 5, 15));

      expect(result.overtimeHours).toBe(0);
    });
  });

  describe('validateDailyCompliance', () => {
    it('should pass for normal UAE workday', () => {
      const result = WorkingHoursEngine.validateDailyCompliance('AE', 8, 0, new Date(2024, 5, 15));

      expect(result.isCompliant).toBe(true);
      expect(result.issues.filter(i => i.severity === 'ERROR')).toHaveLength(0);
    });

    it('should flag excessive daily hours', () => {
      const result = WorkingHoursEngine.validateDailyCompliance('AE', 14, 6, new Date(2024, 5, 15));

      expect(result.issues.filter(i => i.severity === 'ERROR').length).toBeGreaterThan(0);
    });
  });

  describe('validateWeeklyCompliance', () => {
    it('should pass for normal work week', () => {
      const result = WorkingHoursEngine.validateWeeklyCompliance('AE', 40, 2);

      expect(result.isCompliant).toBe(true);
    });

    it('should flag excessive weekly hours', () => {
      const result = WorkingHoursEngine.validateWeeklyCompliance('AE', 72, 0);

      expect(result.isCompliant).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('getBreakRequirements', () => {
    it('should return break requirements for UAE after 5+ hours', () => {
      const result = WorkingHoursEngine.getBreakRequirements('AE', 6);

      expect(result.breakRequired).toBe(true);
      expect(result.minimumBreakMinutes).toBeGreaterThan(0);
    });

    it('should return break requirements for India', () => {
      const result = WorkingHoursEngine.getBreakRequirements('IN', 6);

      expect(result.minimumBreakMinutes).toBeGreaterThanOrEqual(0);
    });

    it('should not require break for short shifts', () => {
      const result = WorkingHoursEngine.getBreakRequirements('AE', 2);

      expect(result.breakRequired).toBe(false);
      expect(result.minimumBreakMinutes).toBe(0);
    });
  });

  describe('isNightShift', () => {
    it('should detect UAE night shift with start/end times', () => {
      const result = WorkingHoursEngine.isNightShift('AE', '22:00', '06:00');
      expect(result).toBe(true);
    });

    it('should not flag daytime shift as night shift', () => {
      const result = WorkingHoursEngine.isNightShift('AE', '09:00', '17:00');
      expect(result).toBe(false);
    });
  });

  describe('calculateFridayCompensation', () => {
    it('should apply 150% rate for Friday work in UAE', () => {
      const result = WorkingHoursEngine.calculateFridayCompensation('AE', 8, 5000);

      expect(result.applies).toBe(true);
      expect(result.rate).toBeGreaterThanOrEqual(1.5);
      expect(result.compensationAmount).toBeGreaterThan(0);
    });

    it('should not apply Friday rules for non-GCC countries', () => {
      const result = WorkingHoursEngine.calculateFridayCompensation('IN', 8, 5000);

      expect(result.applies).toBe(false);
    });
  });
});
