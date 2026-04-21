import { describe, it, expect } from 'vitest';
import { LabourLawService } from '../labour-law.service';

describe('LabourLawService', () => {
  describe('getConfig', () => {
    it('should return labour law config for Saudi Arabia', () => {
      const config = LabourLawService.getConfig('SA');

      expect(config.countryCode).toBe('SA');
      expect(config.countryName).toBeTruthy();
      expect(config.countryNameAr).toBeTruthy();
      expect(config.currency).toBe('SAR');
      expect(config.workingHours.standardPerDay).toBe(8);
      expect(config.workingHours.standardPerWeek).toBe(48);
    });

    it('should return labour law config for UAE', () => {
      const config = LabourLawService.getConfig('AE');

      expect(config.countryCode).toBe('AE');
      expect(config.currency).toBe('AED');
      expect(config.workingHours.standardPerDay).toBe(8);
      expect(config.workingHours.ramadanPerDay).toBe(6);
    });

    it('should return labour law config for India', () => {
      const config = LabourLawService.getConfig('IN');

      expect(config.countryCode).toBe('IN');
      expect(config.currency).toBe('INR');
      expect(config.workingHours.standardPerDay).toBe(9);
      expect(config.weekendDays).toContain('Saturday');
      expect(config.weekendDays).toContain('Sunday');
    });

    it('should throw error for unsupported country', () => {
      expect(() => {
        LabourLawService.getConfig('XX' as any);
      }).toThrow('Labour law configuration not found');
    });

    it('should include EOSB configuration', () => {
      const config = LabourLawService.getConfig('SA');

      expect(config.eosb.firstPeriodYears).toBe(5);
      expect(config.eosb.firstPeriodDaysPerYear).toBe(15);
      expect(config.eosb.afterPeriodDaysPerYear).toBe(30);
      expect(config.eosb.minServiceMonths).toBe(24);
    });

    it('should include overtime rates', () => {
      const config = LabourLawService.getConfig('SA');

      expect(config.overtimeRates.normal).toBe(1.50);
      expect(config.overtimeRates.holiday).toBe(1.50);
    });

    it('should include leave entitlements', () => {
      const config = LabourLawService.getConfig('SA');

      expect(config.leave.annualFirstYear).toBe(21);
      expect(config.leave.annualAfterYears).toBe(30);
      expect(config.leave.maternity).toBe(70);
      expect(config.leave.paternity).toBe(3);
    });

    it('should include probation details', () => {
      const config = LabourLawService.getConfig('SA');

      expect(config.probation.maxDays).toBe(90);
      expect(config.probation.extensionDays).toBe(90);
      expect(config.probation.noticeDays).toBe(30);
    });
  });

  describe('getSupportedCountries', () => {
    it('should return all 7 supported countries', () => {
      const countries = LabourLawService.getSupportedCountries();

      expect(countries).toHaveLength(7);
      const codes = countries.map(c => c.code);
      expect(codes).toContain('AE');
      expect(codes).toContain('SA');
      expect(codes).toContain('BH');
      expect(codes).toContain('QA');
      expect(codes).toContain('OM');
      expect(codes).toContain('KW');
      expect(codes).toContain('IN');
    });

    it('should include both English and Arabic names', () => {
      const countries = LabourLawService.getSupportedCountries();
      const sa = countries.find(c => c.code === 'SA');

      expect(sa).toBeDefined();
      expect(sa!.name).toBe('Saudi Arabia');
      expect(sa!.nameAr).toBeTruthy();
    });
  });

  describe('getGCCCountries', () => {
    it('should return only 6 GCC countries', () => {
      const gccCountries = LabourLawService.getGCCCountries();

      expect(gccCountries).toHaveLength(6);
      const codes = gccCountries.map(c => c.code);
      expect(codes).toContain('AE');
      expect(codes).toContain('SA');
      expect(codes).toContain('BH');
      expect(codes).toContain('QA');
      expect(codes).toContain('OM');
      expect(codes).toContain('KW');
      expect(codes).not.toContain('IN');
    });
  });

  describe('calculateAnnualLeave', () => {
    it('should return 21 days for KSA with less than 5 years service', () => {
      const days = LabourLawService.calculateAnnualLeave('SA', 3);

      expect(days).toBe(21);
    });

    it('should return 30 days for KSA with 5+ years service', () => {
      const days = LabourLawService.calculateAnnualLeave('SA', 6);

      expect(days).toBe(30);
    });

    it('should return 30 days for UAE with 1+ year service', () => {
      const days = LabourLawService.calculateAnnualLeave('AE', 2);

      expect(days).toBe(30);
    });

    it('should pro-rate for UAE in first year (2 days per month)', () => {
      const days = LabourLawService.calculateAnnualLeave('AE', 0.5);

      // 6 months * 2 days = 12 days
      expect(days).toBe(12);
    });

    it('should return 15 days for India', () => {
      const days = LabourLawService.calculateAnnualLeave('IN', 3);

      expect(days).toBe(15);
    });
  });

  describe('calculateOvertimeRate', () => {
    it('should return 1.50 for normal overtime in KSA', () => {
      const rate = LabourLawService.calculateOvertimeRate('SA', 'normal');

      expect(rate).toBe(1.50);
    });

    it('should return 1.25 for normal overtime in UAE', () => {
      const rate = LabourLawService.calculateOvertimeRate('AE', 'normal');

      expect(rate).toBe(1.25);
    });

    it('should return 1.50 for night shift overtime in UAE', () => {
      const rate = LabourLawService.calculateOvertimeRate('AE', 'night');

      expect(rate).toBe(1.50);
    });

    it('should return 1.50 for holiday overtime in UAE', () => {
      const rate = LabourLawService.calculateOvertimeRate('AE', 'holiday');

      expect(rate).toBe(1.50);
    });

    it('should return 2.00 for India (double pay)', () => {
      const rate = LabourLawService.calculateOvertimeRate('IN', 'normal');

      expect(rate).toBe(2.00);
    });

    it('should use holiday rate as fallback for friday', () => {
      const rate = LabourLawService.calculateOvertimeRate('SA', 'friday');

      expect(rate).toBe(1.50);
    });

    it('should return 2.00 for holiday work in Kuwait', () => {
      const rate = LabourLawService.calculateOvertimeRate('KW', 'holiday');

      expect(rate).toBe(2.00);
    });
  });

  describe('getWorkingHours', () => {
    it('should return standard hours for KSA', () => {
      // Use a date unlikely to be Ramadan
      const result = LabourLawService.getWorkingHours('SA', new Date(2024, 0, 15));

      expect(result.perDay).toBe(8);
      expect(result.perWeek).toBe(48);
    });

    it('should return standard hours for UAE', () => {
      const result = LabourLawService.getWorkingHours('AE', new Date(2024, 0, 15));

      expect(result.perDay).toBe(8);
      expect(result.perWeek).toBe(48);
    });

    it('should return 9 hours per day for Oman', () => {
      const result = LabourLawService.getWorkingHours('OM', new Date(2024, 0, 15));

      expect(result.perDay).toBe(9);
      expect(result.perWeek).toBe(45);
    });
  });

  describe('isRamadanPeriod', () => {
    it('should return a boolean', () => {
      const result = LabourLawService.isRamadanPeriod(new Date());

      expect(typeof result).toBe('boolean');
    });
  });

  describe('isEligibleForHajjLeave', () => {
    it('should be eligible for Muslim with sufficient service', () => {
      const result = LabourLawService.isEligibleForHajjLeave('SA', 3, 'Islam', false);

      expect(result.eligible).toBe(true);
    });

    it('should not be eligible for non-Muslim', () => {
      const result = LabourLawService.isEligibleForHajjLeave('SA', 5, 'Christian', false);

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Muslim');
    });

    it('should not be eligible if already taken', () => {
      const result = LabourLawService.isEligibleForHajjLeave('SA', 5, 'Islam', true);

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('once');
    });

    it('should not be eligible if insufficient service years', () => {
      const result = LabourLawService.isEligibleForHajjLeave('BH', 2, 'Muslim', false);

      // Bahrain requires 5 years
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('years');
    });
  });

  describe('validateWorkingHours', () => {
    it('should pass for compliant working hours', () => {
      const result = LabourLawService.validateWorkingHours('AE', 8, 40, 0, new Date(2024, 0, 15));

      expect(result.isCompliant).toBe(true);
      expect(result.issues.filter(i => i.severity === 'ERROR')).toHaveLength(0);
    });

    it('should flag excessive daily hours', () => {
      const result = LabourLawService.validateWorkingHours('AE', 14, 48, 0, new Date(2024, 0, 15));

      expect(result.issues.some(i => i.code === 'EXCESS_DAILY_HOURS')).toBe(true);
    });

    it('should flag excessive weekly hours', () => {
      const result = LabourLawService.validateWorkingHours('AE', 8, 60, 0, new Date(2024, 0, 15));

      expect(result.issues.some(i => i.code === 'EXCESS_WEEKLY_HOURS')).toBe(true);
    });

    it('should flag annual overtime exceeding KSA limit', () => {
      const result = LabourLawService.validateWorkingHours('SA', 8, 48, 800, new Date(2024, 0, 15));

      // KSA has 720 hours max overtime per year
      expect(result.issues.some(i => i.code === 'EXCESS_ANNUAL_OVERTIME')).toBe(true);
    });

    it('should include country and category in result', () => {
      const result = LabourLawService.validateWorkingHours('SA', 8, 40, 0, new Date(2024, 0, 15));

      expect(result.country).toBe('SA');
      expect(result.category).toBe('WORKING_HOURS');
    });

    it('should include bilingual messages in issues', () => {
      const result = LabourLawService.validateWorkingHours('AE', 14, 60, 0, new Date(2024, 0, 15));

      result.issues.forEach(issue => {
        expect(issue.message).toBeTruthy();
        expect(issue.messageAr).toBeTruthy();
      });
    });
  });

  describe('validateProbation', () => {
    it('should pass for valid probation period', () => {
      const result = LabourLawService.validateProbation('SA', 90, false);

      expect(result.isCompliant).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should flag excessive probation period', () => {
      const result = LabourLawService.validateProbation('SA', 120, false);

      expect(result.isCompliant).toBe(false);
      expect(result.issues.some(i => i.code === 'EXCESS_PROBATION')).toBe(true);
    });

    it('should allow extended probation with extension flag for KSA', () => {
      // KSA allows 90 + 90 = 180 days with extension
      const result = LabourLawService.validateProbation('SA', 150, true);

      expect(result.isCompliant).toBe(true);
    });

    it('should validate UAE probation (max 180 days)', () => {
      const valid = LabourLawService.validateProbation('AE', 180, false);
      const invalid = LabourLawService.validateProbation('AE', 200, false);

      expect(valid.isCompliant).toBe(true);
      expect(invalid.isCompliant).toBe(false);
    });
  });

  describe('Country-specific configurations', () => {
    it('should have correct weekend days for GCC (Fri/Sat)', () => {
      const saConfig = LabourLawService.getConfig('SA');
      const aeConfig = LabourLawService.getConfig('AE');

      expect(saConfig.weekendDays).toContain('Friday');
      expect(saConfig.weekendDays).toContain('Saturday');
      expect(aeConfig.weekendDays).toContain('Friday');
    });

    it('should have correct weekend days for India (Sat/Sun)', () => {
      const inConfig = LabourLawService.getConfig('IN');

      expect(inConfig.weekendDays).toContain('Saturday');
      expect(inConfig.weekendDays).toContain('Sunday');
    });

    it('should have social insurance config for applicable countries', () => {
      const saConfig = LabourLawService.getConfig('SA');
      const inConfig = LabourLawService.getConfig('IN');

      expect(saConfig.socialInsurance).toBeDefined();
      expect(saConfig.socialInsurance!.maxWage).toBe(45000);
      expect(inConfig.socialInsurance).toBeDefined();
      expect(inConfig.socialInsurance!.employeeRate).toBe(0.12);
    });

    it('should not have social insurance for UAE (no income tax)', () => {
      const aeConfig = LabourLawService.getConfig('AE');

      expect(aeConfig.socialInsurance).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero service years for annual leave', () => {
      const days = LabourLawService.calculateAnnualLeave('SA', 0);

      // Should still return first year entitlement
      expect(days).toBe(21);
    });

    it('should handle very long service years', () => {
      const days = LabourLawService.calculateAnnualLeave('SA', 30);

      expect(days).toBe(30);
    });
  });
});
