import { describe, it, expect } from 'vitest';
import { LabourLawService } from '../labour-law.service';

describe('LabourLawService', () => {
  describe('getWorkingHours - Saudi Arabia', () => {
    it('should return max 8 hours per day for KSA', () => {
      const result = LabourLawService.getWorkingHours('SA');

      expect(result.maxHoursPerDay).toBe(8);
      expect(result.maxHoursPerWeek).toBe(48);
    });

    it('should return reduced hours for Ramadan in KSA', () => {
      const result = LabourLawService.getWorkingHours('SA', { isRamadan: true });

      expect(result.maxHoursPerDay).toBe(6);
      expect(result.maxHoursPerWeek).toBe(36);
    });
  });

  describe('getMinimumWage', () => {
    it('should return minimum wage for KSA', () => {
      const result = LabourLawService.getMinimumWage('SA');

      expect(result.amount).toBeGreaterThan(0);
      expect(result.currency).toBe('SAR');
      expect(result.applicableTo).toBe('All employees');
    });

    it('should return minimum wage for UAE', () => {
      const result = LabourLawService.getMinimumWage('AE');

      expect(result.amount).toBeGreaterThan(0);
      expect(result.currency).toBe('AED');
    });

    it('should return minimum wage for India', () => {
      const result = LabourLawService.getMinimumWage('IN');

      expect(result.amount).toBeGreaterThan(0);
      expect(result.currency).toBe('INR');
      expect(result.note).toContain('state');
    });
  });

  describe('getAnnualLeaveEntitlement', () => {
    it('should return 21 days for KSA (first 5 years)', () => {
      const result = LabourLawService.getAnnualLeaveEntitlement('SA', 3);

      expect(result.days).toBe(21);
    });

    it('should return 30 days for KSA (after 5 years)', () => {
      const result = LabourLawService.getAnnualLeaveEntitlement('SA', 6);

      expect(result.days).toBe(30);
    });

    it('should return 30 days for UAE', () => {
      const result = LabourLawService.getAnnualLeaveEntitlement('AE', 2);

      expect(result.days).toBe(30);
    });

    it('should pro-rate for first year in UAE', () => {
      const result = LabourLawService.getAnnualLeaveEntitlement('AE', 0.5);

      expect(result.days).toBeLessThan(30);
      expect(result.prorated).toBe(true);
    });
  });

  describe('getNoticePeriod', () => {
    it('should return notice period for resignation in KSA', () => {
      const result = LabourLawService.getNoticePeriod('SA', 'RESIGNATION', 3);

      expect(result.days).toBe(60);
      expect(result.type).toBe('calendar_days');
    });

    it('should return notice period for termination in KSA', () => {
      const result = LabourLawService.getNoticePeriod('SA', 'TERMINATION', 3);

      expect(result.days).toBeGreaterThan(0);
    });

    it('should vary by service years in UAE', () => {
      const resultYear1 = LabourLawService.getNoticePeriod('AE', 'RESIGNATION', 0.5);
      const resultYear3 = LabourLawService.getNoticePeriod('AE', 'RESIGNATION', 3);

      expect(resultYear1.days).toBeLessThan(resultYear3.days);
    });
  });

  describe('getProbationPeriod', () => {
    it('should return max 90 days for KSA', () => {
      const result = LabourLawService.getProbationPeriod('SA');

      expect(result.maxDays).toBe(90);
      expect(result.canExtend).toBe(false);
    });

    it('should return max 180 days (6 months) for UAE', () => {
      const result = LabourLawService.getProbationPeriod('AE');

      expect(result.maxDays).toBe(180);
    });
  });

  describe('getSickLeaveEntitlement', () => {
    it('should return sick leave breakdown for KSA', () => {
      const result = LabourLawService.getSickLeaveEntitlement('SA');

      expect(result.total).toBe(120); // days per year
      expect(result.fullPay).toBe(30);
      expect(result.halfPay).toBe(60);
      expect(result.noPay).toBe(30);
    });

    it('should require medical certificate in UAE', () => {
      const result = LabourLawService.getSickLeaveEntitlement('AE');

      expect(result.medicalCertificateRequired).toBe(true);
    });
  });

  describe('getOvertimeRules', () => {
    it('should return overtime rate for KSA', () => {
      const result = LabourLawService.getOvertimeRules('SA');

      expect(result.rate).toBeGreaterThanOrEqual(1.5); // 150% of hourly rate
      expect(result.maxHoursPerDay).toBeDefined();
    });

    it('should return higher rate for night/weekend in UAE', () => {
      const result = LabourLawService.getOvertimeRules('AE', { isNightShift: true });

      expect(result.rate).toBeGreaterThan(1.25);
    });
  });

  describe('validateCompliance', () => {
    it('should validate salary meets minimum wage', () => {
      const result = LabourLawService.validateCompliance('SA', {
        salary: 5000,
        workingHoursPerDay: 8,
        annualLeave: 21,
      });

      expect(result.compliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect salary below minimum wage', () => {
      const result = LabourLawService.validateCompliance('SA', {
        salary: 500, // Below minimum
        workingHoursPerDay: 8,
        annualLeave: 21,
      });

      expect(result.compliant).toBe(false);
      expect(result.violations).toContain('Salary below minimum wage');
    });

    it('should detect excessive working hours', () => {
      const result = LabourLawService.validateCompliance('SA', {
        salary: 5000,
        workingHoursPerDay: 12, // Excessive
        annualLeave: 21,
      });

      expect(result.compliant).toBe(false);
      expect(result.violations).toContain('Exceeds maximum working hours');
    });

    it('should detect insufficient annual leave', () => {
      const result = LabourLawService.validateCompliance('SA', {
        salary: 5000,
        workingHoursPerDay: 8,
        annualLeave: 10, // Below minimum
      });

      expect(result.compliant).toBe(false);
      expect(result.violations).toContain('Insufficient annual leave');
    });
  });

  describe('getMaternityLeave', () => {
    it('should return maternity leave for KSA', () => {
      const result = LabourLawService.getMaternityLeave('SA');

      expect(result.days).toBe(70); // 10 weeks
      expect(result.paid).toBe(true);
      expect(result.fullPay).toBe(true);
    });

    it('should return maternity leave for UAE', () => {
      const result = LabourLawService.getMaternityLeave('AE');

      expect(result.days).toBe(60); // Minimum in UAE
      expect(result.paid).toBe(true);
    });

    it('should include nursing breaks', () => {
      const result = LabourLawService.getMaternityLeave('SA');

      expect(result.nursingBreaks).toBeDefined();
      expect(result.nursingBreaks.duration).toBeGreaterThan(0);
    });
  });

  describe('getPublicHolidays', () => {
    it('should return public holidays for KSA', () => {
      const result = LabourLawService.getPublicHolidays('SA', 2024);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toContainEqual(
        expect.objectContaining({
          name: expect.stringContaining('National Day'),
        })
      );
    });

    it('should return public holidays for UAE', () => {
      const result = LabourLawService.getPublicHolidays('AE', 2024);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toContainEqual(
        expect.objectContaining({
          name: expect.stringContaining('National Day'),
        })
      );
    });

    it('should include Islamic holidays with variable dates', () => {
      const result = LabourLawService.getPublicHolidays('SA', 2024);

      const eidHolidays = result.filter((h) => h.name.includes('Eid'));
      expect(eidHolidays.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unsupported country gracefully', () => {
      expect(() => {
        LabourLawService.getWorkingHours('XX' as any);
      }).toThrow('Unsupported country');
    });

    it('should handle zero service years', () => {
      const result = LabourLawService.getAnnualLeaveEntitlement('SA', 0);

      expect(result.days).toBeGreaterThan(0); // Still entitled to pro-rated leave
      expect(result.prorated).toBe(true);
    });

    it('should handle very long service years', () => {
      const result = LabourLawService.getAnnualLeaveEntitlement('SA', 30);

      expect(result.days).toBe(30); // Max in KSA
    });
  });
});
