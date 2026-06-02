/**
 * MudadService — Saudi WPS submission file generation tests.
 */

import { describe, it, expect } from 'vitest';
import { MudadService } from '../mudad.service';

const mkRecord = (overrides: any = {}): any => ({
  employeeId: 'emp-1',
  iqamaNumber: '2987654321',
  nationalId: '1234567890',
  employeeNameEn: 'Ahmed',
  employeeNameAr: 'أحمد',
  isSaudi: false,
  bankIBAN: 'SA1234567890123456789012',
  basicSalary: 3000,
  housingAllowance: 500,
  transportAllowance: 200,
  otherAllowances: 0,
  deductions: 100,
  netSalary: 3600,
  paymentMethod: 'BANK_TRANSFER',
  workDays: 22,
  absentDays: 0,
  ...overrides,
});

const mkConfig = (): any => ({
  establishmentNumber: 'EST-001',
  laborOfficeCode: 'LO-100',
  molEstablishmentId: 'MOL-123',
  bankCode: 'RJHI',
});

describe('MudadService.generateSubmissionFile', () => {
  it('builds header + records + summary from input', () => {
    const file = MudadService.generateSubmissionFile(mkConfig(), [mkRecord()], '06', '2026');

    expect(file.header.establishmentNumber).toBe('EST-001');
    expect(file.header.totalRecords).toBe(1);
    expect(file.records).toHaveLength(1);
    expect(file.summary).toBeDefined();
  });

  it('counts Saudi vs non-Saudi correctly', () => {
    const file = MudadService.generateSubmissionFile(
      mkConfig(),
      [
        mkRecord({ isSaudi: true }),
        mkRecord({ isSaudi: true }),
        mkRecord({ isSaudi: false }),
      ],
      '06',
      '2026'
    );

    expect(file.header.saudiCount).toBe(2);
    expect(file.header.nonSaudiCount).toBe(1);
  });

  it('sums total salaries in summary', () => {
    const file = MudadService.generateSubmissionFile(
      mkConfig(),
      [mkRecord({ netSalary: 1000 }), mkRecord({ netSalary: 2000 })],
      '06',
      '2026'
    );

    expect(file.summary.totalNetSalaries).toBe(3000);
  });
});

describe('MudadService.toXML', () => {
  it('generates XML output', () => {
    const file = MudadService.generateSubmissionFile(mkConfig(), [mkRecord()], '06', '2026');
    const xml = MudadService.toXML(file);
    expect(typeof xml).toBe('string');
    expect(xml).toContain('<');
    expect(xml).toContain('>');
  });
});

describe('MudadService.toCSV', () => {
  it('generates CSV output with header row', () => {
    const file = MudadService.generateSubmissionFile(mkConfig(), [mkRecord()], '06', '2026');
    const csv = MudadService.toCSV(file);
    expect(typeof csv).toBe('string');
    expect(csv.split('\n').length).toBeGreaterThan(1);
  });
});

describe('MudadService.validateRecords', () => {
  it('flags empty records', () => {
    const result = MudadService.validateRecords([]);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'EMPTY_RECORDS')).toBe(true);
  });

  it('requires nationalId for Saudis', () => {
    const result = MudadService.validateRecords([
      mkRecord({ isSaudi: true, nationalId: '' }),
    ]);
    expect(result.errors.some((e) => e.code === 'MISSING_NATIONAL_ID')).toBe(true);
  });

  it('rejects malformed Saudi national ID (must start with 1)', () => {
    const result = MudadService.validateRecords([
      mkRecord({ isSaudi: true, nationalId: '9999999999' }),
    ]);
    expect(result.errors.some((e) => e.code === 'INVALID_NATIONAL_ID')).toBe(true);
  });

  it('requires iqamaNumber for non-Saudis', () => {
    const result = MudadService.validateRecords([
      mkRecord({ isSaudi: false, iqamaNumber: '' }),
    ]);
    expect(result.errors.some((e) => e.code === 'MISSING_IQAMA')).toBe(true);
  });

  it('rejects malformed Iqama (must start with 2)', () => {
    const result = MudadService.validateRecords([
      mkRecord({ isSaudi: false, iqamaNumber: '1234567890' }),
    ]);
    expect(result.errors.some((e) => e.code === 'INVALID_IQAMA')).toBe(true);
  });

  it('requires IBAN for BANK_TRANSFER payment method', () => {
    const result = MudadService.validateRecords([
      mkRecord({ paymentMethod: 'BANK_TRANSFER', bankIBAN: '' }),
    ]);
    expect(result.errors.some((e) => e.code === 'MISSING_IBAN')).toBe(true);
  });

  it('rejects zero or negative net salary', () => {
    const result = MudadService.validateRecords([mkRecord({ netSalary: 0 })]);
    expect(result.errors.some((e) => e.code === 'INVALID_SALARY')).toBe(true);
  });

  it('warns when Saudi salary is below 4,000 SAR minimum', () => {
    const result = MudadService.validateRecords([
      mkRecord({ isSaudi: true, nationalId: '1234567890', basicSalary: 2000 }),
    ]);
    expect(result.warnings.some((w) => w.code === 'BELOW_MINIMUM_WAGE')).toBe(true);
  });

  it('warns about CASH payments', () => {
    const result = MudadService.validateRecords([
      mkRecord({ paymentMethod: 'CASH' }),
    ]);
    expect(result.warnings.some((w) => w.code === 'CASH_PAYMENT')).toBe(true);
  });

  it('passes a valid record', () => {
    const result = MudadService.validateRecords([
      mkRecord({
        isSaudi: false,
        iqamaNumber: '2987654321',
        bankIBAN: 'SA1234567890123456789012',
        netSalary: 3000,
        paymentMethod: 'BANK_TRANSFER',
      }),
    ]);
    expect(result.errors).toEqual([]);
  });
});

describe('MudadService.getBanks', () => {
  it('returns a non-empty bank list with required fields', () => {
    const banks = MudadService.getBanks();
    expect(banks.length).toBeGreaterThan(0);
    expect(banks[0]).toHaveProperty('code');
    expect(banks[0]).toHaveProperty('name');
    expect(banks[0]).toHaveProperty('swiftCode');
  });
});

describe('MudadService.calculateSummaryStats', () => {
  it('aggregates records correctly', () => {
    const stats = MudadService.calculateSummaryStats([
      mkRecord({ netSalary: 1000, isSaudi: true }),
      mkRecord({ netSalary: 2000, isSaudi: false }),
    ]);
    expect(stats).toBeDefined();
    expect(typeof stats).toBe('object');
  });
});
