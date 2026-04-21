import { describe, it, expect } from 'vitest';
import { GOSIService } from '../gosi.service';
import type { GOSIRecord, GOSIConfiguration } from '../types';

describe('GOSIService - Saudi Arabia Social Insurance', () => {
  describe('calculateContributions', () => {
    it('should calculate GOSI for Saudi employee correctly', () => {
      const result = GOSIService.calculateContributions(10000, 2500, true);

      // Contributable salary = basic + housing = 12,500
      expect(result.contributableSalary).toBe(12500);

      // Saudi: 9% annuity employee + 0.75% SANED = 9.75% employee
      expect(result.employeeContribution).toBeCloseTo(12500 * 0.0975, 2);

      // Saudi: 9% annuity employer + 0.75% SANED + 2% hazards = 11.75% employer
      expect(result.employerContribution).toBeCloseTo(12500 * 0.1175, 2);

      expect(result.totalContribution).toBeCloseTo(
        result.employeeContribution + result.employerContribution, 2
      );
    });

    it('should calculate GOSI for non-Saudi employee correctly', () => {
      const result = GOSIService.calculateContributions(10000, 2500, false);

      // Non-Saudi: 0% employee contribution
      expect(result.employeeContribution).toBe(0);

      // Non-Saudi: only 2% occupational hazards (employer)
      expect(result.employerContribution).toBeCloseTo(12500 * 0.02, 2);

      expect(result.totalContribution).toBe(result.employerContribution);
    });

    it('should cap contributable salary at GOSI ceiling (45000 SAR)', () => {
      const result = GOSIService.calculateContributions(40000, 10000, true);

      // basic + housing = 50,000, but capped at 45,000
      expect(result.contributableSalary).toBe(45000);
      expect(result.employeeContribution).toBeCloseTo(45000 * 0.0975, 2);
    });

    it('should provide breakdown by component', () => {
      const result = GOSIService.calculateContributions(10000, 2500, true);

      expect(result.breakdown.annuity.employee).toBeCloseTo(12500 * 0.09, 2);
      expect(result.breakdown.annuity.employer).toBeCloseTo(12500 * 0.09, 2);
      expect(result.breakdown.saned.employee).toBeCloseTo(12500 * 0.0075, 2);
      expect(result.breakdown.saned.employer).toBeCloseTo(12500 * 0.0075, 2);
      expect(result.breakdown.occupationalHazards.employee).toBe(0);
      expect(result.breakdown.occupationalHazards.employer).toBeCloseTo(12500 * 0.02, 2);
    });

    it('should show zero annuity and SANED for non-Saudi', () => {
      const result = GOSIService.calculateContributions(10000, 2500, false);

      expect(result.breakdown.annuity.employee).toBe(0);
      expect(result.breakdown.annuity.employer).toBe(0);
      expect(result.breakdown.saned.employee).toBe(0);
      expect(result.breakdown.saned.employer).toBe(0);
      expect(result.breakdown.occupationalHazards.employer).toBeCloseTo(12500 * 0.02, 2);
    });

    it('should round contributions to 2 decimal places', () => {
      const result = GOSIService.calculateContributions(10333, 2333, true);

      // Verify rounding
      expect(result.employeeContribution).toBe(
        Math.round((10333 + 2333) * 0.0975 * 100) / 100
      );
    });

    it('should handle zero housing allowance', () => {
      const result = GOSIService.calculateContributions(10000, 0, true);

      expect(result.contributableSalary).toBe(10000);
      expect(result.employeeContribution).toBeCloseTo(10000 * 0.0975, 2);
    });
  });

  describe('generateSubmissionFile', () => {
    const config: GOSIConfiguration = {
      id: 'config-1',
      tenantId: 'tenant-1',
      companyId: 'company-1',
      gosiSubscriptionNumber: '123456789',
      establishmentNumber: '12345678',
      laborOfficeCode: '1001',
      isActive: true,
    };

    const sampleRecords: GOSIRecord[] = [
      {
        employeeId: 'emp-1',
        subscriberNumber: '123456789',
        nationalId: '1234567890',
        isSaudi: true,
        basicSalary: 10000,
        housingAllowance: 2500,
        contributableSalary: 12500,
        employeeContribution: 1218.75,
        employerContribution: 1468.75,
        annuityContribution: 2250,
        sanedContribution: 187.5,
        occupationalHazardsContribution: 250,
      },
      {
        employeeId: 'emp-2',
        subscriberNumber: '987654321',
        nationalId: '',
        iqamaNumber: '2234567890',
        isSaudi: false,
        basicSalary: 8000,
        housingAllowance: 2000,
        contributableSalary: 10000,
        employeeContribution: 0,
        employerContribution: 200,
        annuityContribution: 0,
        sanedContribution: 0,
        occupationalHazardsContribution: 200,
      },
    ];

    it('should generate submission file with header', () => {
      const file = GOSIService.generateSubmissionFile(config, sampleRecords, '2024-06');

      expect(file.header.establishmentNumber).toBe('12345678');
      expect(file.header.laborOfficeCode).toBe('1001');
      expect(file.header.contributionMonth).toBe('2024-06');
      expect(file.header.totalRecords).toBe(2);
      expect(file.header.saudiCount).toBe(1);
      expect(file.header.nonSaudiCount).toBe(1);
    });

    it('should calculate correct totals in summary', () => {
      const file = GOSIService.generateSubmissionFile(config, sampleRecords, '2024-06');

      expect(file.summary.totalEmployeeContributions).toBeCloseTo(1218.75, 2);
      expect(file.summary.totalEmployerContributions).toBeCloseTo(1668.75, 2);
      expect(file.summary.totalContribution).toBeCloseTo(
        file.summary.totalEmployeeContributions + file.summary.totalEmployerContributions, 2
      );
    });

    it('should include all records in output', () => {
      const file = GOSIService.generateSubmissionFile(config, sampleRecords, '2024-06');

      expect(file.records).toHaveLength(2);
      expect(file.records[0].recordType).toBe('EMP');
    });
  });

  describe('toXML', () => {
    it('should generate valid XML structure', () => {
      const config: GOSIConfiguration = {
        id: 'config-1',
        tenantId: 'tenant-1',
        companyId: 'company-1',
        gosiSubscriptionNumber: '123456789',
        establishmentNumber: '12345678',
        laborOfficeCode: '1001',
        isActive: true,
      };

      const records: GOSIRecord[] = [{
        employeeId: 'emp-1',
        subscriberNumber: '123456789',
        nationalId: '1234567890',
        isSaudi: true,
        basicSalary: 10000,
        housingAllowance: 2500,
        contributableSalary: 12500,
        employeeContribution: 1218.75,
        employerContribution: 1468.75,
        annuityContribution: 2250,
        sanedContribution: 187.5,
        occupationalHazardsContribution: 250,
      }];

      const file = GOSIService.generateSubmissionFile(config, records, '2024-06');
      const xml = GOSIService.toXML(file);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<GOSIContribution>');
      expect(xml).toContain('<EstablishmentNumber>12345678</EstablishmentNumber>');
      expect(xml).toContain('<SubscriberNumber>123456789</SubscriberNumber>');
      expect(xml).toContain('</GOSIContribution>');
    });
  });

  describe('toCSV', () => {
    it('should generate CSV with headers and records', () => {
      const config: GOSIConfiguration = {
        id: 'config-1',
        tenantId: 'tenant-1',
        companyId: 'company-1',
        gosiSubscriptionNumber: '123456789',
        establishmentNumber: '12345678',
        laborOfficeCode: '1001',
        isActive: true,
      };

      const records: GOSIRecord[] = [{
        employeeId: 'emp-1',
        subscriberNumber: '123456789',
        nationalId: '1234567890',
        isSaudi: true,
        basicSalary: 10000,
        housingAllowance: 2500,
        contributableSalary: 12500,
        employeeContribution: 1218.75,
        employerContribution: 1468.75,
        annuityContribution: 2250,
        sanedContribution: 187.5,
        occupationalHazardsContribution: 250,
      }];

      const file = GOSIService.generateSubmissionFile(config, records, '2024-06');
      const csv = GOSIService.toCSV(file);

      expect(csv).toContain('Subscriber Number');
      expect(csv).toContain('123456789');
      expect(csv).toContain('10000.00');
    });
  });

  describe('validateRecords', () => {
    it('should validate valid records successfully', () => {
      const records: GOSIRecord[] = [{
        employeeId: 'emp-1',
        subscriberNumber: '123456789',
        nationalId: '1234567890',
        isSaudi: true,
        basicSalary: 10000,
        housingAllowance: 2500,
        contributableSalary: 12500,
        employeeContribution: 1218.75,
        employerContribution: 1468.75,
        annuityContribution: 2250,
        sanedContribution: 187.5,
        occupationalHazardsContribution: 250,
      }];

      const result = GOSIService.validateRecords(records);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing subscriber number', () => {
      const records: GOSIRecord[] = [{
        employeeId: 'emp-1',
        subscriberNumber: '',
        nationalId: '1234567890',
        isSaudi: true,
        basicSalary: 10000,
        housingAllowance: 2500,
        contributableSalary: 12500,
        employeeContribution: 1218.75,
        employerContribution: 1468.75,
        annuityContribution: 2250,
        sanedContribution: 187.5,
        occupationalHazardsContribution: 250,
      }];

      const result = GOSIService.validateRecords(records);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_SUBSCRIBER')).toBe(true);
    });

    it('should detect missing national ID for Saudi employees', () => {
      const records: GOSIRecord[] = [{
        employeeId: 'emp-1',
        subscriberNumber: '123456789',
        nationalId: '',
        isSaudi: true,
        basicSalary: 10000,
        housingAllowance: 2500,
        contributableSalary: 12500,
        employeeContribution: 1218.75,
        employerContribution: 1468.75,
        annuityContribution: 2250,
        sanedContribution: 187.5,
        occupationalHazardsContribution: 250,
      }];

      const result = GOSIService.validateRecords(records);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_NATIONAL_ID')).toBe(true);
    });

    it('should detect missing Iqama for non-Saudi employees', () => {
      const records: GOSIRecord[] = [{
        employeeId: 'emp-2',
        subscriberNumber: '987654321',
        nationalId: '',
        isSaudi: false,
        basicSalary: 8000,
        housingAllowance: 2000,
        contributableSalary: 10000,
        employeeContribution: 0,
        employerContribution: 200,
        annuityContribution: 0,
        sanedContribution: 0,
        occupationalHazardsContribution: 200,
      }];

      const result = GOSIService.validateRecords(records);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_IQAMA')).toBe(true);
    });

    it('should detect invalid salary', () => {
      const records: GOSIRecord[] = [{
        employeeId: 'emp-1',
        subscriberNumber: '123456789',
        nationalId: '1234567890',
        isSaudi: true,
        basicSalary: 0,
        housingAllowance: 0,
        contributableSalary: 0,
        employeeContribution: 0,
        employerContribution: 0,
        annuityContribution: 0,
        sanedContribution: 0,
        occupationalHazardsContribution: 0,
      }];

      const result = GOSIService.validateRecords(records);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_SALARY')).toBe(true);
    });

    it('should warn about salary below minimum wage', () => {
      const records: GOSIRecord[] = [{
        employeeId: 'emp-1',
        subscriberNumber: '123456789',
        nationalId: '1234567890',
        isSaudi: true,
        basicSalary: 3000,
        housingAllowance: 500,
        contributableSalary: 3500,
        employeeContribution: 341.25,
        employerContribution: 411.25,
        annuityContribution: 630,
        sanedContribution: 52.5,
        occupationalHazardsContribution: 70,
      }];

      const result = GOSIService.validateRecords(records);

      expect(result.warnings.some(w => w.code === 'BELOW_MINIMUM_WAGE')).toBe(true);
    });

    it('should return error for empty records', () => {
      const result = GOSIService.validateRecords([]);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_RECORDS')).toBe(true);
    });
  });

  describe('getRates', () => {
    it('should return current GOSI rates', () => {
      const rates = GOSIService.getRates();

      expect(rates.saudi.annuity.employee).toBe(9.0);
      expect(rates.saudi.annuity.employer).toBe(9.0);
      expect(rates.saudi.saned.employee).toBe(0.75);
      expect(rates.saudi.saned.employer).toBe(0.75);
      expect(rates.saudi.occupationalHazards.employer).toBe(2.0);
      expect(rates.nonSaudi.occupationalHazards.employer).toBe(2.0);
      expect(rates.nonSaudi.annuity.employee).toBe(0);
    });
  });

  describe('getWageCeiling', () => {
    it('should return 45000 SAR', () => {
      expect(GOSIService.getWageCeiling()).toBe(45000);
    });
  });

  describe('getMinimumWage', () => {
    it('should return 4000 SAR', () => {
      expect(GOSIService.getMinimumWage()).toBe(4000);
    });
  });

  describe('calculateCompanyLiability', () => {
    it('should calculate total company GOSI liability', () => {
      const records: GOSIRecord[] = [
        {
          employeeId: 'emp-1',
          subscriberNumber: '123456789',
          nationalId: '1234567890',
          isSaudi: true,
          basicSalary: 10000,
          housingAllowance: 2500,
          contributableSalary: 12500,
          employeeContribution: 1218.75,
          employerContribution: 1468.75,
          annuityContribution: 2250,
          sanedContribution: 187.5,
          occupationalHazardsContribution: 250,
        },
        {
          employeeId: 'emp-2',
          subscriberNumber: '987654321',
          nationalId: '',
          iqamaNumber: '2234567890',
          isSaudi: false,
          basicSalary: 8000,
          housingAllowance: 2000,
          contributableSalary: 10000,
          employeeContribution: 0,
          employerContribution: 200,
          annuityContribution: 0,
          sanedContribution: 0,
          occupationalHazardsContribution: 200,
        },
      ];

      const result = GOSIService.calculateCompanyLiability(records);

      expect(result.totalEmployerContribution).toBeCloseTo(1668.75, 2);
      expect(result.totalEmployeeContribution).toBeCloseTo(1218.75, 2);
      expect(result.totalContribution).toBeCloseTo(2887.50, 2);
      expect(result.bySaudiStatus.saudi.count).toBe(1);
      expect(result.bySaudiStatus.nonSaudi.count).toBe(1);
      expect(result.byType.annuity).toBeCloseTo(2250, 2);
      expect(result.byType.occupationalHazards).toBeCloseTo(450, 2);
    });
  });

  describe('prepareRecords', () => {
    it('should prepare GOSI records from payroll data', () => {
      const payrollData = [
        {
          employeeId: 'emp-1',
          complianceData: {
            employeeId: 'emp-1',
            countryCode: 'SA' as const,
            nationality: 'SA',
            gosiSubscriberNumber: '123456789',
            nationalId: '1234567890',
            isLocalNational: true,
          },
          basicSalary: 10000,
          housingAllowance: 2500,
        },
      ];

      const records = GOSIService.prepareRecords(payrollData);

      expect(records).toHaveLength(1);
      expect(records[0].isSaudi).toBe(true);
      expect(records[0].subscriberNumber).toBe('123456789');
      expect(records[0].contributableSalary).toBe(12500);
      expect(records[0].employeeContribution).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high salary with cap', () => {
      const result = GOSIService.calculateContributions(80000, 20000, true);

      // Capped at 45,000
      expect(result.contributableSalary).toBe(45000);
      expect(result.employeeContribution).toBeCloseTo(45000 * 0.0975, 2);
    });

    it('should handle zero salary', () => {
      const result = GOSIService.calculateContributions(0, 0, true);

      expect(result.contributableSalary).toBe(0);
      expect(result.employeeContribution).toBe(0);
      expect(result.employerContribution).toBe(0);
    });
  });
});
