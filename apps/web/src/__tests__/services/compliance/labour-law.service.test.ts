/**
 * Labour Law Service Tests
 *
 * Comprehensive test suite for country-specific labour law configurations
 * and compliance validations
 */

import { describe, it, expect } from '@jest/globals';
import { LabourLawService } from '@/lib/services/compliance/labour-law.service';

describe('LabourLawService', () => {
  describe('getConfig', () => {
    it('should return configuration for all supported countries', () => {
      const countries = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'] as const;

      countries.forEach(code => {
        const config = LabourLawService.getConfig(code);
        expect(config).toBeDefined();
        expect(config.countryCode).toBe(code);
        expect(config.workingHours).toBeDefined();
        expect(config.leave).toBeDefined();
        expect(config.eosb).toBeDefined();
      });
    });

    it('should return correct UAE configuration', () => {
      const config = LabourLawService.getConfig('AE');

      expect(config.countryName).toBe('United Arab Emirates');
      expect(config.currency).toBe('AED');
      expect(config.workingHours.standardPerDay).toBe(8);
      expect(config.workingHours.ramadanPerDay).toBe(6);
      expect(config.overtimeRates.normal).toBe(1.25);
      expect(config.probation.maxDays).toBe(180);
      expect(config.leave.annualAfterYears).toBe(30);
      expect(config.leave.maternity).toBe(60);
    });

    it('should return correct Saudi Arabia configuration', () => {
      const config = LabourLawService.getConfig('SA');

      expect(config.countryName).toBe('Saudi Arabia');
      expect(config.currency).toBe('SAR');
      expect(config.workingHours.standardPerWeek).toBe(48);
      expect(config.overtimeRates.normal).toBe(1.50);
      expect(config.probation.maxDays).toBe(90);
      expect(config.leave.annualFirstYear).toBe(21);
      expect(config.leave.annualAfterYears).toBe(30);
      expect(config.leave.hajj).toBe(15);
      expect(config.socialInsurance).toBeDefined();
    });

    it('should return correct India configuration', () => {
      const config = LabourLawService.getConfig('IN');

      expect(config.countryName).toBe('India');
      expect(config.currency).toBe('INR');
      expect(config.workingHours.standardPerDay).toBe(9);
      expect(config.overtimeRates.normal).toBe(2.00); // Double pay
      expect(config.leave.maternity).toBe(182); // 26 weeks
      expect(config.weekendDays).toContain('Saturday');
      expect(config.weekendDays).toContain('Sunday');
    });

    it('should throw error for unsupported country', () => {
      expect(() => LabourLawService.getConfig('XX' as any)).toThrow();
    });
  });

  describe('getSupportedCountries', () => {
    it('should return all 7 supported countries', () => {
      const countries = LabourLawService.getSupportedCountries();

      expect(countries).toHaveLength(7);
      expect(countries.map(c => c.code)).toEqual(
        expect.arrayContaining(['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'])
      );
    });

    it('should include both English and Arabic names', () => {
      const countries = LabourLawService.getSupportedCountries();

      countries.forEach(country => {
        expect(country.name).toBeDefined();
        expect(country.nameAr).toBeDefined();
        expect(country.name.length).toBeGreaterThan(0);
        expect(country.nameAr.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getGCCCountries', () => {
    it('should return only GCC countries (6 countries)', () => {
      const countries = LabourLawService.getGCCCountries();

      expect(countries).toHaveLength(6);
      expect(countries.map(c => c.code)).toEqual(
        expect.arrayContaining(['AE', 'SA', 'BH', 'QA', 'OM', 'KW'])
      );
      expect(countries.map(c => c.code)).not.toContain('IN');
    });
  });

  describe('calculateAnnualLeave', () => {
    it('should return 2 days per month for UAE first year', () => {
      const leave = LabourLawService.calculateAnnualLeave('AE', 0.5);

      expect(leave).toBe(12); // 6 months * 2 days
    });

    it('should return full annual leave for UAE after 1 year', () => {
      const leave = LabourLawService.calculateAnnualLeave('AE', 1.5);

      expect(leave).toBe(30);
    });

    it('should return 21 days for Saudi Arabia in first 5 years', () => {
      const leave = LabourLawService.calculateAnnualLeave('SA', 3);

      expect(leave).toBe(21);
    });

    it('should return 30 days for Saudi Arabia after 5 years', () => {
      const leave = LabourLawService.calculateAnnualLeave('SA', 6);

      expect(leave).toBe(30);
    });

    it('should return consistent 30 days for Bahrain', () => {
      const leaveFirstYear = LabourLawService.calculateAnnualLeave('BH', 0.5);
      const leaveAfterYears = LabourLawService.calculateAnnualLeave('BH', 5);

      expect(leaveFirstYear).toBe(30);
      expect(leaveAfterYears).toBe(30);
    });

    it('should return 15 days for India', () => {
      const leave = LabourLawService.calculateAnnualLeave('IN', 3);

      expect(leave).toBe(15);
    });
  });

  describe('calculateOvertimeRate', () => {
    it('should return correct UAE overtime rates', () => {
      expect(LabourLawService.calculateOvertimeRate('AE', 'normal')).toBe(1.25);
      expect(LabourLawService.calculateOvertimeRate('AE', 'night')).toBe(1.50);
      expect(LabourLawService.calculateOvertimeRate('AE', 'holiday')).toBe(1.50);
    });

    it('should return higher rates for Saudi Arabia', () => {
      expect(LabourLawService.calculateOvertimeRate('SA', 'normal')).toBe(1.50);
    });

    it('should return double pay for Kuwait holiday', () => {
      expect(LabourLawService.calculateOvertimeRate('KW', 'holiday')).toBe(2.00);
    });

    it('should return double pay for India all types', () => {
      expect(LabourLawService.calculateOvertimeRate('IN', 'normal')).toBe(2.00);
      expect(LabourLawService.calculateOvertimeRate('IN', 'night')).toBe(2.00);
      expect(LabourLawService.calculateOvertimeRate('IN', 'holiday')).toBe(2.00);
    });
  });

  describe('getWorkingHours', () => {
    it('should return standard hours for normal days', () => {
      const hours = LabourLawService.getWorkingHours('AE');

      expect(hours.perDay).toBe(8);
      expect(hours.perWeek).toBe(48);
    });

    it('should return Oman 9-hour workday', () => {
      const hours = LabourLawService.getWorkingHours('OM');

      expect(hours.perDay).toBe(9);
      expect(hours.perWeek).toBe(45);
    });
  });

  describe('isEligibleForHajjLeave', () => {
    it('should return eligible for Muslim employee with sufficient service', () => {
      const result = LabourLawService.isEligibleForHajjLeave(
        'SA',
        3,
        'Muslim',
        false
      );

      expect(result.eligible).toBe(true);
    });

    it('should return ineligible for non-Muslim employee', () => {
      const result = LabourLawService.isEligibleForHajjLeave(
        'SA',
        5,
        'Christian',
        false
      );

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Muslim employees only');
    });

    it('should return ineligible if already taken', () => {
      const result = LabourLawService.isEligibleForHajjLeave(
        'SA',
        10,
        'Muslim',
        true
      );

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('once during employment');
    });

    it('should return ineligible for insufficient service in Bahrain', () => {
      const result = LabourLawService.isEligibleForHajjLeave(
        'BH',
        3, // Bahrain requires 5 years
        'Islam',
        false
      );

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('5 years');
    });

    it('should return eligible after 2 years in UAE', () => {
      const result = LabourLawService.isEligibleForHajjLeave(
        'AE',
        1, // UAE has no minimum service requirement
        'Muslim',
        false
      );

      expect(result.eligible).toBe(true);
    });
  });

  describe('validateWorkingHours', () => {
    it('should pass for compliant working hours', () => {
      const result = LabourLawService.validateWorkingHours(
        'AE',
        8, // daily
        48, // weekly
        100 // overtime YTD
      );

      expect(result.isCompliant).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should fail for excessive daily hours', () => {
      const result = LabourLawService.validateWorkingHours(
        'AE',
        12, // More than 8 + 2 max overtime
        48,
        100
      );

      expect(result.isCompliant).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          code: 'EXCESS_DAILY_HOURS',
          severity: 'ERROR',
        })
      );
    });

    it('should warn for excessive weekly hours', () => {
      const result = LabourLawService.validateWorkingHours(
        'AE',
        8,
        55, // More than 48
        100
      );

      expect(result.issues).toContainEqual(
        expect.objectContaining({
          code: 'EXCESS_WEEKLY_HOURS',
          severity: 'WARNING',
        })
      );
    });

    it('should fail for excessive annual overtime in Saudi Arabia', () => {
      const result = LabourLawService.validateWorkingHours(
        'SA',
        8,
        48,
        800 // More than 720 max
      );

      expect(result.isCompliant).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          code: 'EXCESS_ANNUAL_OVERTIME',
          severity: 'ERROR',
        })
      );
    });
  });

  describe('validateProbation', () => {
    it('should pass for valid UAE probation', () => {
      const result = LabourLawService.validateProbation('AE', 180, false);

      expect(result.isCompliant).toBe(true);
    });

    it('should fail for excessive probation without extension', () => {
      const result = LabourLawService.validateProbation('AE', 200, false);

      expect(result.isCompliant).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          code: 'EXCESS_PROBATION',
        })
      );
    });

    it('should allow extended probation in Saudi Arabia', () => {
      // Saudi allows 90 days + 90 days extension = 180 total
      const result = LabourLawService.validateProbation('SA', 150, true);

      expect(result.isCompliant).toBe(true);
    });

    it('should fail for probation exceeding extension limit', () => {
      const result = LabourLawService.validateProbation('SA', 200, true);

      expect(result.isCompliant).toBe(false);
    });
  });

  describe('Weekend Configuration', () => {
    it('should return Friday-Saturday for GCC countries', () => {
      const gccCountries = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'] as const;

      gccCountries.forEach(code => {
        const config = LabourLawService.getConfig(code);
        expect(config.weekendDays).toContain('Friday');
        expect(config.weekendDays).toContain('Saturday');
      });
    });

    it('should return Saturday-Sunday for India', () => {
      const config = LabourLawService.getConfig('IN');

      expect(config.weekendDays).toContain('Saturday');
      expect(config.weekendDays).toContain('Sunday');
      expect(config.weekendDays).not.toContain('Friday');
    });
  });

  describe('Leave Configurations', () => {
    it('should have longer maternity leave in India', () => {
      const indiaConfig = LabourLawService.getConfig('IN');
      const uaeConfig = LabourLawService.getConfig('AE');

      expect(indiaConfig.leave.maternity).toBeGreaterThan(uaeConfig.leave.maternity);
      expect(indiaConfig.leave.maternity).toBe(182); // 26 weeks
    });

    it('should have Hajj leave for GCC countries', () => {
      const gccCountries = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'] as const;

      gccCountries.forEach(code => {
        const config = LabourLawService.getConfig(code);
        expect(config.leave.hajj).toBeDefined();
        expect(config.leave.hajj).toBeGreaterThan(0);
      });
    });

    it('should not have Hajj leave for India', () => {
      const config = LabourLawService.getConfig('IN');
      expect(config.leave.hajj).toBeUndefined();
    });

    it('should have Iddah leave in Saudi Arabia and Kuwait', () => {
      const saConfig = LabourLawService.getConfig('SA');
      const kwConfig = LabourLawService.getConfig('KW');

      expect(saConfig.leave.iddah).toBe(130); // 4 months 10 days
      expect(kwConfig.leave.iddah).toBe(130);
    });
  });

  describe('Social Insurance Configuration', () => {
    it('should have social insurance config for Saudi Arabia', () => {
      const config = LabourLawService.getConfig('SA');

      expect(config.socialInsurance).toBeDefined();
      expect(config.socialInsurance?.maxWage).toBe(45000);
      expect(config.socialInsurance?.pensionEmployeeRate).toBe(0.0975);
    });

    it('should have social insurance for Bahrain', () => {
      const config = LabourLawService.getConfig('BH');

      expect(config.socialInsurance).toBeDefined();
      expect(config.socialInsurance?.employeeRate).toBe(0.07);
      expect(config.socialInsurance?.employerRate).toBe(0.12);
    });

    it('should have PF configuration for India', () => {
      const config = LabourLawService.getConfig('IN');

      expect(config.socialInsurance).toBeDefined();
      expect(config.socialInsurance?.employeeRate).toBe(0.12);
    });
  });
});
